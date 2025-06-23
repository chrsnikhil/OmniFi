import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract addresses
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "";
  const CARBON_TOKEN_ADDRESS = process.env.CARBON_TOKEN_ADDRESS || "";
  
  if (!VAULT_ADDRESS || !CARBON_TOKEN_ADDRESS) {
    console.log("❌ Please set VAULT_ADDRESS and CARBON_TOKEN_ADDRESS environment variables");
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("🚀 Interacting with vault using account:", deployer.address);

  // Get contract instances
  const vault = await ethers.getContractAt("Vault", VAULT_ADDRESS);
  const carbonToken = await ethers.getContractAt("CustomERC20", CARBON_TOKEN_ADDRESS);

  // Check current balances
  const tokenBalance = await carbonToken.balanceOf(deployer.address);
  console.log("Current CCT Balance:", ethers.formatEther(tokenBalance), "CCT");

  // Mint some tokens if balance is low
  if (tokenBalance < ethers.parseEther("1000")) {
    console.log("💰 Minting 1000 CCT tokens...");
    const mintTx = await carbonToken.mint(deployer.address, ethers.parseEther("1000"));
    await mintTx.wait();
    console.log("✅ Minted 1000 CCT tokens");
  }

  // Check approval
  const allowance = await carbonToken.allowance(deployer.address, VAULT_ADDRESS);
  console.log("Current Allowance:", ethers.formatEther(allowance), "CCT");

  // Approve tokens if needed
  if (allowance < ethers.parseEther("500")) {
    console.log("🔑 Approving 500 CCT tokens for vault...");
    const approveTx = await carbonToken.approve(VAULT_ADDRESS, ethers.parseEther("500"));
    await approveTx.wait();
    console.log("✅ Approved 500 CCT tokens");
  }

  // Get current vault status
  const userInfo = await vault.getUserInfo(deployer.address);
  console.log("Current Deposit:", ethers.formatEther(userInfo.depositAmount), "CCT");
  console.log("Available Limit:", ethers.formatEther(userInfo.availableLimit), "CCT");

  // Make a deposit to start price history tracking
  if (userInfo.depositAmount === 0n) {
    console.log("🏦 Making initial deposit of 50 CCT...");
    const depositTx = await vault.deposit(ethers.parseEther("50"));
    await depositTx.wait();
    console.log("✅ Deposited 50 CCT to vault");
  } else {
    console.log("📈 Making additional deposit of 25 CCT...");
    const depositTx = await vault.deposit(ethers.parseEther("25"));
    await depositTx.wait();
    console.log("✅ Deposited 25 CCT to vault");
  }

  // Check volatility info
  const volatilityInfo = await vault.getVolatilityInfo();
  console.log("\n📊 Volatility Info:");
  console.log("Price Count:", volatilityInfo.priceCount.toString());
  console.log("Current Volatility:", volatilityInfo.currentVolatility.toString());
  console.log("Can Update:", volatilityInfo.canUpdate);

  // Try to update volatility if possible
  if (volatilityInfo.canUpdate) {
    console.log("🔄 Updating volatility index...");
    try {
      const updateTx = await vault.updateVolatilityIndex();
      await updateTx.wait();
      console.log("✅ Volatility index updated");
    } catch (error) {
      console.log("⚠️ Could not update volatility:", error);
    }
  }

  // Check if rebalancing is possible
  const [upkeepNeeded] = await vault.checkUpkeep("0x");
  console.log("Upkeep Needed:", upkeepNeeded);

  if (upkeepNeeded) {
    console.log("🎯 Rebalancing conditions met! Performing manual rebalance...");
    try {
      const rebalanceTx = await vault.manualRebalance();
      await rebalanceTx.wait();
      console.log("✅ Manual rebalance completed");
    } catch (error) {
      console.log("⚠️ Could not perform rebalance:", error);
    }
  }

  console.log("\n✅ Vault interaction completed!");
  console.log("🔍 Run check-vault-status.ts to see current state");
  console.log("🤖 Chainlink Automation will monitor and rebalance automatically");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
