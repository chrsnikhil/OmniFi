import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract addresses
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "";
  const CARBON_TOKEN_ADDRESS = process.env.CARBON_TOKEN_ADDRESS || "";
  
  if (!VAULT_ADDRESS || !CARBON_TOKEN_ADDRESS) {
    console.log("❌ Please set VAULT_ADDRESS and CARBON_TOKEN_ADDRESS environment variables");
    console.log("Example: VAULT_ADDRESS=0x123... CARBON_TOKEN_ADDRESS=0x456... npx hardhat run scripts/check-vault-status.ts --network fuji");
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("🔍 Checking vault status with account:", deployer.address);

  // Get contract instances
  const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);
  const carbonToken = await ethers.getContractAt("CustomERC20", CARBON_TOKEN_ADDRESS);

  console.log("\n📊 VAULT STATUS");
  console.log("=".repeat(50));

  // Get vault status
  const vaultStatus = await vault.getVaultStatus();
  console.log("Total Deposits:", ethers.formatEther(vaultStatus.totalVaultDeposits), "CCT");
  console.log("Current ETH Price:", ethers.formatUnits(vaultStatus.currentPrice, 8), "USD");
  console.log("Deposit Limit:", ethers.formatEther(vaultStatus.currentDepositLimit), "CCT");
  console.log("Vault Balance:", ethers.formatEther(vaultStatus.vaultBalance), "CCT");
  console.log("Volatility Index:", vaultStatus.currentVolatility.toString(), "/ 10000");

  // Get volatility info
  console.log("\n📈 VOLATILITY INFORMATION");
  console.log("=".repeat(50));
  const volatilityInfo = await vault.getVolatilityInfo();
  console.log("Price History Count:", volatilityInfo.priceCount.toString());
  console.log("Current Volatility:", volatilityInfo.currentVolatility.toString(), "/ 10000");
  console.log("Last Update:", new Date(Number(volatilityInfo.lastUpdate) * 1000).toLocaleString());
  console.log("Can Update:", volatilityInfo.canUpdate);

  // Get price history if available
  if (volatilityInfo.priceCount > 0) {
    const [prices, timestamps] = await vault.getPriceHistory();
    console.log("\n📜 PRICE HISTORY");
    console.log("=".repeat(50));
    for (let i = 0; i < prices.length; i++) {
      const price = ethers.formatUnits(prices[i], 8);
      const timestamp = new Date(Number(timestamps[i]) * 1000).toLocaleString();
      console.log(`${i + 1}. $${price} USD at ${timestamp}`);
    }
  }

  // Get rebalancing info
  console.log("\n🔄 REBALANCING INFORMATION");
  console.log("=".repeat(50));
  const rebalanceInfo = await vault.getRebalanceInfo();
  console.log("Rebalance Threshold:", rebalanceInfo.threshold.toString(), "/ 10000");
  console.log("Total Rebalances:", rebalanceInfo.rebalanceCount.toString());
  console.log("Last Rebalance:", rebalanceInfo.lastRebalance.toString() === "0" ? "Never" : new Date(Number(rebalanceInfo.lastRebalance) * 1000).toLocaleString());
  console.log("Time Since Last:", rebalanceInfo.timeSinceLastRebalance.toString(), "seconds");
  console.log("Next Eligible:", new Date(Number(rebalanceInfo.nextRebalanceEligible) * 1000).toLocaleString());

  // Get allocation info
  console.log("\n💰 ALLOCATION INFORMATION");
  console.log("=".repeat(50));
  const allocInfo = await vault.getAllocationInfo();
  console.log("Conservative:", (Number(allocInfo.conservative) / 100).toFixed(2) + "%");
  console.log("Moderate:", (Number(allocInfo.moderate) / 100).toFixed(2) + "%");
  console.log("Aggressive:", (Number(allocInfo.aggressive) / 100).toFixed(2) + "%");
  console.log("Total:", (Number(allocInfo.totalAllocation) / 100).toFixed(2) + "%");

  // Check automation status
  console.log("\n🤖 CHAINLINK AUTOMATION STATUS");
  console.log("=".repeat(50));
  try {
    const [upkeepNeeded, performData] = await vault.checkUpkeep("0x");
    console.log("Upkeep Needed:", upkeepNeeded);
    console.log("Perform Data:", performData);
    
    if (upkeepNeeded) {
      console.log("✅ Vault is ready for rebalancing!");
      console.log("💡 Chainlink Automation should trigger performUpkeep() soon.");
    } else {
      console.log("⏳ Rebalancing conditions not met yet.");
      
      // Explain why
      const timePassed = Number(rebalanceInfo.timeSinceLastRebalance) >= 43200; // 12 hours
      const volatilityHigh = Number(volatilityInfo.currentVolatility) >= Number(rebalanceInfo.threshold);
      const sufficientData = Number(volatilityInfo.priceCount) >= 3;
      
      console.log("   - Time passed (≥12h):", timePassed);
      console.log("   - High volatility:", volatilityHigh);
      console.log("   - Sufficient data (≥3):", sufficientData);
    }
  } catch (error) {
    console.log("❌ Error checking upkeep:", error);
  }

  // Get user info for deployer
  console.log("\n👤 USER INFORMATION (Deployer)");
  console.log("=".repeat(50));
  const userInfo = await vault.getUserInfo(deployer.address);
  console.log("Deposit Amount:", ethers.formatEther(userInfo.depositAmount), "CCT");
  console.log("Deposit Time:", userInfo.depositTime.toString() === "0" ? "Never" : new Date(Number(userInfo.depositTime) * 1000).toLocaleString());
  console.log("Available Limit:", ethers.formatEther(userInfo.availableLimit), "CCT");

  // Check token balance
  const tokenBalance = await carbonToken.balanceOf(deployer.address);
  console.log("CCT Balance:", ethers.formatEther(tokenBalance), "CCT");

  console.log("\n🔗 USEFUL COMMANDS");
  console.log("=".repeat(50));
  console.log("Check this status again:");
  console.log(`VAULT_ADDRESS=${VAULT_ADDRESS} CARBON_TOKEN_ADDRESS=${CARBON_TOKEN_ADDRESS} npx hardhat run scripts/check-vault-status.ts --network fuji`);
  console.log("");
  console.log("Update volatility manually:");
  console.log(`cast send ${VAULT_ADDRESS} "updateVolatilityIndex()" --private-key $PRIVATE_KEY --rpc-url https://api.avax-test.network/ext/bc/C/rpc`);
  console.log("");
  console.log("Manual rebalance (if conditions met):");
  console.log(`cast send ${VAULT_ADDRESS} "manualRebalance()" --private-key $PRIVATE_KEY --rpc-url https://api.avax-test.network/ext/bc/C/rpc`);
  console.log("");
  console.log("Mint some CCT tokens:");
  console.log(`cast send ${CARBON_TOKEN_ADDRESS} "mint(address,uint256)" ${deployer.address} 1000000000000000000000 --private-key $PRIVATE_KEY --rpc-url https://api.avax-test.network/ext/bc/C/rpc`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
