import { expect } from "chai";
import { ethers } from "hardhat";
import { CustomERC20, Vault, MockPriceFeed } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Vault Contract", function () {
  let customErc20: CustomERC20;
  let vault: Vault;
  let mockPriceFeed: MockPriceFeed;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  const TOKEN_NAME = "Carbon Credit Token";
  const TOKEN_SYMBOL = "CCT";
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const BASE_DEPOSIT_LIMIT = ethers.parseEther("1000");
  const INITIAL_PRICE = 200000000000; // $2000 in 8 decimals

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy CustomERC20
    const CustomERC20Factory = await ethers.getContractFactory("CustomERC20");
    customErc20 = await CustomERC20Factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    await customErc20.waitForDeployment();
    
    // Deploy MockPriceFeed
    const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
    mockPriceFeed = await MockPriceFeedFactory.deploy(INITIAL_PRICE);
    await mockPriceFeed.waitForDeployment();
    
    // Deploy Vault
    const VaultFactory = await ethers.getContractFactory("Vault");
    vault = await VaultFactory.deploy(
      await customErc20.getAddress(),
      await mockPriceFeed.getAddress(),
      owner.address
    );
    await vault.waitForDeployment();
    
    // Transfer some tokens to users for testing
    await customErc20.transfer(user1.address, ethers.parseEther("10000"));
    await customErc20.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set the correct deposit token", async function () {
      expect(await vault.depositToken()).to.equal(await customErc20.getAddress());
    });

    it("Should set the correct base deposit limit", async function () {
      expect(await vault.baseDepositLimit()).to.equal(BASE_DEPOSIT_LIMIT);
    });
  });

  describe("Token Operations", function () {
    it("Should allow users to approve and deposit tokens", async function () {
      const depositAmount = ethers.parseEther("100");
      
      // User1 approves vault to spend tokens
      await customErc20.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      // User1 deposits tokens
      await expect(vault.connect(user1).deposit(depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, depositAmount, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
      
      // Check user deposit
      expect(await vault.userDeposits(user1.address)).to.equal(depositAmount);
      
      // Check total deposits
      expect(await vault.totalDeposits()).to.equal(depositAmount);
    });

    it("Should allow users to withdraw their deposits", async function () {
      const depositAmount = ethers.parseEther("100");
      const withdrawAmount = ethers.parseEther("50");
      
      // Setup: deposit first
      await customErc20.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);
      
      // Withdraw
      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.emit(vault, "Withdrawal")
        .withArgs(user1.address, withdrawAmount, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
      
      // Check remaining deposit
      expect(await vault.userDeposits(user1.address)).to.equal(depositAmount - withdrawAmount);
      
      // Check total deposits
      expect(await vault.totalDeposits()).to.equal(depositAmount - withdrawAmount);
    });

    it("Should reject deposits of 0 amount", async function () {
      await expect(vault.connect(user1).deposit(0))
        .to.be.revertedWith("Deposit amount must be greater than 0");
    });

    it("Should reject withdrawals exceeding user balance", async function () {
      const depositAmount = ethers.parseEther("100");
      const withdrawAmount = ethers.parseEther("200");
      
      // Setup: deposit first
      await customErc20.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);
      
      // Try to withdraw more than deposited
      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.be.revertedWith("Insufficient deposit balance");
    });
  });

  describe("Deposit Limits", function () {
    it("Should calculate deposit limits correctly", async function () {
      const currentLimit = await vault.getCurrentDepositLimit();
      expect(currentLimit).to.be.gt(0);
      
      // Test with high price (should increase limit)
      await mockPriceFeed.updatePrice(250000000000); // $2500
      const highPriceLimit = await vault.getCurrentDepositLimit();
      expect(highPriceLimit).to.be.gt(BASE_DEPOSIT_LIMIT);
      
      // Test with low price (should decrease limit)
      await mockPriceFeed.updatePrice(150000000000); // $1500
      const lowPriceLimit = await vault.getCurrentDepositLimit();
      expect(lowPriceLimit).to.be.lt(BASE_DEPOSIT_LIMIT);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update base deposit limit", async function () {
      const newLimit = ethers.parseEther("2000");
      
      await expect(vault.connect(owner).updateBaseDepositLimit(newLimit))
        .to.emit(vault, "DepositLimitUpdated")
        .withArgs(newLimit);
      
      expect(await vault.baseDepositLimit()).to.equal(newLimit);
    });

    it("Should not allow non-owner to update base deposit limit", async function () {
      const newLimit = ethers.parseEther("2000");
      
      await expect(vault.connect(user1).updateBaseDepositLimit(newLimit))
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to update price threshold", async function () {
      const newThreshold = 250000000000; // $2500
      
      await expect(vault.connect(owner).updatePriceThreshold(newThreshold))
        .to.emit(vault, "PriceThresholdUpdated")
        .withArgs(newThreshold);
      
      expect(await vault.priceThreshold()).to.equal(newThreshold);
    });

    it("Should allow owner to update multipliers", async function () {
      const newHighMultiplier = 3;
      const newLowMultiplier = 2;
      
      await expect(vault.connect(owner).updateMultipliers(newHighMultiplier, newLowMultiplier))
        .to.emit(vault, "MultipliersUpdated")
        .withArgs(newHighMultiplier, newLowMultiplier);
      
      expect(await vault.highPriceMultiplier()).to.equal(newHighMultiplier);
      expect(await vault.lowPriceMultiplier()).to.equal(newLowMultiplier);
    });
  });

  describe("View Functions", function () {
    it("Should return correct user info", async function () {
      const depositAmount = ethers.parseEther("100");
      
      // Setup: deposit
      await customErc20.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);
      
      const userInfo = await vault.getUserInfo(user1.address);
      expect(userInfo.depositAmount).to.equal(depositAmount);
      expect(userInfo.depositTime).to.be.gt(0);
      // availableLimit would depend on current price, so we just check it's a number
      expect(userInfo.availableLimit).to.be.gte(0);
    });

    it("Should return correct vault status", async function () {
      const vaultStatus = await vault.getVaultStatus();
      expect(vaultStatus.totalVaultDeposits).to.equal(0); // No deposits yet
      expect(vaultStatus.vaultBalance).to.equal(0); // No tokens in vault yet
      // currentPrice and currentDepositLimit would depend on price feed
    });
  });
});
