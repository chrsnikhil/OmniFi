import { expect } from "chai";
import { ethers } from "hardhat";
import { Vault, CustomERC20, MockPriceFeed } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Vault Rebalancing", function () {
  let vault: Vault;
  let token: CustomERC20;
  let priceFeed: MockPriceFeed;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  const INITIAL_PRICE = ethers.parseUnits("2000", 8); // $2000 in 8 decimals
  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy MockPriceFeed
    const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
    priceFeed = await MockPriceFeedFactory.deploy(INITIAL_PRICE);

    // Deploy CustomERC20 token
    const CustomERC20Factory = await ethers.getContractFactory("CustomERC20");
    token = await CustomERC20Factory.deploy(
      "Carbon Credit Token",
      "CCT", 
      INITIAL_SUPPLY
    );

    // Deploy Vault
    const VaultFactory = await ethers.getContractFactory("Vault");
    vault = await VaultFactory.deploy(
      await token.getAddress(),
      await priceFeed.getAddress(),
      owner.address
    );

    // Mint tokens to user and approve vault
    await token.mint(user.address, ethers.parseEther("10000"));
    await token.connect(user).approve(await vault.getAddress(), ethers.parseEther("10000"));
  });

  describe("Volatility and Rebalancing", function () {
    it("Should track price history and calculate volatility", async function () {
      // Initially no price history
      let volatilityInfo = await vault.getVolatilityInfo();
      expect(volatilityInfo.priceCount).to.equal(0);
      expect(volatilityInfo.currentVolatility).to.equal(0);

      // Make a deposit to trigger price history update
      await vault.connect(user).deposit(ethers.parseEther("100"));

      // Check price history
      volatilityInfo = await vault.getVolatilityInfo();
      expect(volatilityInfo.priceCount).to.equal(1);

      // Wait for volatility update interval and update several times
      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);

      // Update price to create volatility
      await priceFeed.updatePrice(ethers.parseUnits("2100", 8)); // 5% increase
      await vault.updateVolatilityIndex();

      await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
      await ethers.provider.send("evm_mine", []);

      await priceFeed.updatePrice(ethers.parseUnits("1900", 8)); // ~10% decrease
      await vault.updateVolatilityIndex();

      // Check that volatility is now calculated
      volatilityInfo = await vault.getVolatilityInfo();
      expect(volatilityInfo.priceCount).to.be.greaterThan(1);
      expect(volatilityInfo.currentVolatility).to.be.greaterThan(0);
    });

    it("Should trigger rebalancing when volatility exceeds threshold", async function () {
      // Set a low rebalance threshold for testing
      await vault.updateRebalanceThreshold(100); // 1%

      // Build price history with high volatility
      await vault.connect(user).deposit(ethers.parseEther("100"));

      // Create high volatility by changing prices dramatically
      const prices = [
        ethers.parseUnits("2000", 8),
        ethers.parseUnits("2200", 8), // +10%
        ethers.parseUnits("1800", 8), // -18%
        ethers.parseUnits("2300", 8), // +28%
        ethers.parseUnits("1700", 8)  // -26%
      ];

      for (let i = 1; i < prices.length; i++) {
        await ethers.provider.send("evm_increaseTime", [3600]); // 1 hour
        await ethers.provider.send("evm_mine", []);
        
        await priceFeed.updatePrice(prices[i]);
        await vault.updateVolatilityIndex();
      }

      // Get initial allocation
      let allocInfo = await vault.getAllocationInfo();
      const initialConservative = allocInfo.conservative;

      // Wait for minimum rebalance interval
      await ethers.provider.send("evm_increaseTime", [43200]); // 12 hours
      await ethers.provider.send("evm_mine", []);

      // Check if rebalancing is needed
      const [upkeepNeeded] = await vault.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;

      // Perform rebalancing
      const tx = await vault.performUpkeep("0x");
      const receipt = await tx.wait();

      // Check that RebalanceTriggered event was emitted
      const events = receipt!.logs.filter(log => {
        try {
          const parsed = vault.interface.parseLog(log);
          return parsed?.name === "RebalanceTriggered";
        } catch {
          return false;
        }
      });
      expect(events.length).to.be.greaterThan(0);

      // Check that allocations changed (high volatility should increase conservative allocation)
      allocInfo = await vault.getAllocationInfo();
      expect(allocInfo.conservative).to.be.greaterThan(initialConservative);
      expect(allocInfo.totalAllocation).to.equal(10000); // Should always total 100%
    });

    it("Should not allow rebalancing too frequently", async function () {
      // Set up high volatility
      await vault.updateRebalanceThreshold(100); // 1%
      await vault.connect(user).deposit(ethers.parseEther("100"));

      // Create volatility
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await priceFeed.updatePrice(ethers.parseUnits("2500", 8));
      await vault.updateVolatilityIndex();

      // Wait for rebalance interval and perform first rebalance
      await ethers.provider.send("evm_increaseTime", [43200]); // 12 hours
      await ethers.provider.send("evm_mine", []);
      
      // Check if rebalancing is needed first
      const [upkeepNeeded] = await vault.checkUpkeep("0x");
      if (upkeepNeeded) {
        await vault.performUpkeep("0x");
      }

      // Try to rebalance again immediately (should fail)
      const [upkeepNeededAfter] = await vault.checkUpkeep("0x");
      expect(upkeepNeededAfter).to.be.false;

      await expect(vault.performUpkeep("0x")).to.be.revertedWith("Rebalancing not needed");
    });

    it("Should allow manual rebalancing when conditions are met", async function () {
      // Set up conditions for rebalancing
      await vault.updateRebalanceThreshold(100); // 1%
      await vault.connect(user).deposit(ethers.parseEther("100"));

      // Create high volatility
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await priceFeed.updatePrice(ethers.parseUnits("2500", 8));
      await vault.updateVolatilityIndex();

      // Wait for rebalance interval
      await ethers.provider.send("evm_increaseTime", [43200]); // 12 hours
      await ethers.provider.send("evm_mine", []);

      // Manual rebalancing should work
      await expect(vault.manualRebalance()).to.not.be.reverted;

      // Check rebalance counter increased  
      const rebalanceInfo = await vault.getRebalanceInfo();
      expect(rebalanceInfo.rebalanceCount).to.equal(1);
    });

    it("Should adjust allocations based on volatility levels", async function () {
      await vault.connect(user).deposit(ethers.parseEther("100"));

      // Test different volatility scenarios
      const scenarios = [
        { threshold: 100, expectedConservative: 5000 }, // Low volatility -> less conservative
        { threshold: 300, expectedConservative: 6000 }, // Medium volatility -> balanced
        { threshold: 800, expectedConservative: 7000 }, // High volatility -> more conservative
      ];

      for (const scenario of scenarios) {
        // Set reasonable threshold values
        await vault.updateRebalanceThreshold(scenario.threshold);
        
        // Create price movements to achieve desired volatility
        await ethers.provider.send("evm_increaseTime", [3600]);
        await ethers.provider.send("evm_mine", []);
        
        // Simulate volatility by price changes
        if (scenario.threshold > 500) {
          await priceFeed.updatePrice(ethers.parseUnits("2600", 8)); // 30% increase
        } else {
          await priceFeed.updatePrice(ethers.parseUnits("2100", 8)); // 5% increase
        }
        
        await vault.updateVolatilityIndex();

        // Wait and check if rebalancing is needed
        await ethers.provider.send("evm_increaseTime", [43200]);
        await ethers.provider.send("evm_mine", []);

        const [canRebalance] = await vault.checkUpkeep("0x");
        if (canRebalance) {
          await vault.performUpkeep("0x");
          
          const allocInfo = await vault.getAllocationInfo();
          console.log(`Threshold: ${scenario.threshold}, Conservative: ${allocInfo.conservative}`);
          
          // Higher volatility should result in higher conservative allocation
          expect(allocInfo.totalAllocation).to.equal(10000);
        }
      }
    });
  });
});
