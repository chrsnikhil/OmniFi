import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying OmniFi contracts to Avalanche Fuji...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Chainlink ETH/USD Price Feed on Avalanche Fuji
  // Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=avalanche#Avalanche%20Testnet
  const ETH_USD_PRICE_FEED_FUJI = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA";
  
  // Initial token supply (1 million tokens)
  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  console.log("\n📄 Deploying CustomERC20 (Carbon Token)...");
  const CustomERC20Factory = await ethers.getContractFactory("CustomERC20");
  const carbonToken = await CustomERC20Factory.deploy(
    "Carbon Credit Token",
    "CCT",
    INITIAL_SUPPLY
  );
  await carbonToken.waitForDeployment();
  console.log("✅ Carbon Token deployed to:", await carbonToken.getAddress());

  console.log("\n🏛️ Deploying Vault with Chainlink Automation...");
  const VaultFactory = await ethers.getContractFactory("Vault");
  const vault = await VaultFactory.deploy(
    await carbonToken.getAddress(),
    ETH_USD_PRICE_FEED_FUJI,
    deployer.address
  );
  await vault.waitForDeployment();
  console.log("✅ Vault deployed to:", await vault.getAddress());

  // Configure vault parameters for Fuji
  console.log("\n⚙️ Configuring Vault parameters...");
  
  // Set a reasonable rebalance threshold (5% volatility)
  await vault.updateRebalanceThreshold(500); // 5.00%
  console.log("✅ Rebalance threshold set to 5%");

  // Set reasonable deposit limits (100 CCT base limit)
  await vault.updateBaseDepositLimit(ethers.parseEther("100"));
  console.log("✅ Base deposit limit set to 100 CCT");

  // Set price threshold ($2000 for high/low price multipliers)
  await vault.updatePriceThreshold(ethers.parseUnits("2000", 8)); // $2000 in 8 decimals
  console.log("✅ Price threshold set to $2000");

  // Get current vault status
  const vaultStatus = await vault.getVaultStatus();
  console.log("\n📊 Initial Vault Status:");
  console.log("- Total Deposits:", ethers.formatEther(vaultStatus.totalVaultDeposits), "CCT");
  console.log("- Current ETH Price:", ethers.formatUnits(vaultStatus.currentPrice, 8), "USD");
  console.log("- Deposit Limit:", ethers.formatEther(vaultStatus.currentDepositLimit), "CCT");
  console.log("- Volatility Index:", vaultStatus.currentVolatility.toString(), "/ 10000");

  // Get automation info
  const volatilityInfo = await vault.getVolatilityInfo();
  const rebalanceInfo = await vault.getRebalanceInfo();
  console.log("\n🤖 Automation Status:");
  console.log("- Price History Count:", volatilityInfo.priceCount.toString());
  console.log("- Can Update Volatility:", volatilityInfo.canUpdate);
  console.log("- Rebalance Threshold:", rebalanceInfo.threshold.toString(), "/ 10000");
  console.log("- Total Rebalances:", rebalanceInfo.rebalanceCount.toString());

  // Check if upkeep is needed (should be false initially)
  const [upkeepNeeded, performData] = await vault.checkUpkeep("0x");
  console.log("- Upkeep Needed:", upkeepNeeded);

  // Save deployment info
  const deploymentInfo = {
    network: "fuji",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      carbonToken: {
        address: await carbonToken.getAddress(),
        name: "Carbon Credit Token",
        symbol: "CCT",
        initialSupply: ethers.formatEther(INITIAL_SUPPLY)
      },
      vault: {
        address: await vault.getAddress(),
        carbonToken: await carbonToken.getAddress(),
        priceFeed: ETH_USD_PRICE_FEED_FUJI,
        owner: deployer.address,
        rebalanceThreshold: "500", // 5%
        baseDepositLimit: "100", // 100 CCT
        priceThreshold: "200000000000" // $2000 in 8 decimals
      }
    },
    chainlinkAutomation: {
      network: "Avalanche Fuji",
      registrationUrl: "https://automation.chain.link/fuji",
      contractAddress: await vault.getAddress(),
      checkUpkeepFunction: "checkUpkeep(bytes)",
      performUpkeepFunction: "performUpkeep(bytes)",
      minInterval: "43200", // 12 hours in seconds
      gasLimit: "500000", // Estimated gas limit for performUpkeep
      description: "OmniFi Vault Volatility-Based Rebalancing"
    }
  };

  // Write deployment info to file
  writeFileSync(
    "deployments/fuji-automation-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎯 CHAINLINK AUTOMATION REGISTRATION INSTRUCTIONS:");
  console.log("=".repeat(60));
  console.log("1. Visit: https://automation.chain.link/fuji");
  console.log("2. Connect your wallet (same address as deployer)");
  console.log("3. Click 'Register New Upkeep'");
  console.log("4. Select 'Custom Logic' upkeep type");
  console.log("5. Fill in the following details:");
  console.log("");
  console.log("   Target Contract Address:", await vault.getAddress());
  console.log("   Check Function: checkUpkeep(bytes)");
  console.log("   Perform Function: performUpkeep(bytes)");
  console.log("   Gas Limit: 500000");
  console.log("   Starting Balance: 5 LINK (minimum)");
  console.log("   Upkeep Name: OmniFi Vault Rebalancing");
  console.log("   Description: Volatility-based vault rebalancing for RWA tokenization");
  console.log("");
  console.log("6. Fund the upkeep with LINK tokens");
  console.log("7. The automation will check every ~12 hours for rebalancing conditions");
  console.log("");
  console.log("📋 Contract Verification Commands:");
  console.log("   npx hardhat verify --network fuji", await carbonToken.getAddress(), '"Carbon Credit Token"', '"CCT"', INITIAL_SUPPLY.toString());
  console.log("   npx hardhat verify --network fuji", await vault.getAddress(), await carbonToken.getAddress(), ETH_USD_PRICE_FEED_FUJI, deployer.address);
  console.log("");
  console.log("💡 To test the automation:");
  console.log("   1. Mint some CCT tokens");
  console.log("   2. Deposit into the vault to start price history tracking");
  console.log("   3. Wait for volatility to build up (or manipulate via MockPriceFeed if using testnet)");
  console.log("   4. Chainlink Automation will automatically trigger rebalancing when conditions are met");
  console.log("");
  console.log("🔗 Useful Links:");
  console.log("   - Chainlink Automation: https://automation.chain.link/fuji");
  console.log("   - Fuji Faucet: https://faucet.avax.network/ (code: avalanche-academy)");
  console.log("   - LINK Faucet: https://faucets.chain.link/fuji");
  console.log("   - Avalanche Explorer: https://testnet.snowtrace.io/");
  console.log("=".repeat(60));
  
  console.log("\n✅ Deployment completed successfully!");
  console.log("📄 Deployment details saved to: deployments/fuji-automation-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
