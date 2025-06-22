import { ethers } from "hardhat";
import { CustomERC20, Vault } from "../typechain-types";

async function main() {
  // Load deployment info
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'fuji-deployment.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ No deployment found. Please run deploy script first.");
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  console.log("🔗 Connecting to deployed contracts...");
  console.log("Network:", deployment.network);
  console.log("Chain ID:", deployment.chainId);
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Get contract instances
  const CustomERC20 = await ethers.getContractFactory("CustomERC20");
  const Vault = await ethers.getContractFactory("Vault");
  
  const token = CustomERC20.attach(deployment.contracts.CustomERC20.address) as CustomERC20;
  const vault = Vault.attach(deployment.contracts.Vault.address) as Vault;
  
  console.log("\n📊 Contract Status:");
  console.log("=".repeat(50));
  
  // Check token balance
  const tokenBalance = await token.balanceOf(signer.address);
  console.log("Your CCT Balance:", ethers.formatEther(tokenBalance));
  
  // Check vault status
  const vaultStatus = await vault.getVaultStatus();
  console.log("Current ETH/USD Price: $" + (Number(vaultStatus.currentPrice) / 1e8).toFixed(2));
  console.log("Current Deposit Limit:", ethers.formatEther(vaultStatus.currentDepositLimit), "CCT");
  console.log("Total Vault Deposits:", ethers.formatEther(vaultStatus.totalVaultDeposits), "CCT");
  
  // Check user info
  const userInfo = await vault.getUserInfo(signer.address);
  console.log("Your Vault Deposits:", ethers.formatEther(userInfo.depositAmount), "CCT");
  console.log("Available Deposit Limit:", ethers.formatEther(userInfo.availableLimit), "CCT");
  
  console.log("\n🎯 Sample Interactions:");
  console.log("=".repeat(50));
  
  // Example 1: Approve and deposit tokens
  const depositAmount = ethers.parseEther("100"); // 100 CCT
  
  console.log("\n1. Approving vault to spend 100 CCT...");
  const approveTx = await token.approve(await vault.getAddress(), depositAmount);
  await approveTx.wait();
  console.log("✅ Approval successful!");
  
  console.log("\n2. Depositing 100 CCT to vault...");
  const depositTx = await vault.deposit(depositAmount);
  await depositTx.wait();
  console.log("✅ Deposit successful!");
  
  // Check updated status
  const updatedUserInfo = await vault.getUserInfo(signer.address);
  console.log("Updated Vault Deposits:", ethers.formatEther(updatedUserInfo.depositAmount), "CCT");
  
  console.log("\n3. Withdrawing 50 CCT from vault...");
  const withdrawAmount = ethers.parseEther("50");
  const withdrawTx = await vault.withdraw(withdrawAmount);
  await withdrawTx.wait();
  console.log("✅ Withdrawal successful!");
  
  // Final status
  const finalUserInfo = await vault.getUserInfo(signer.address);
  console.log("Final Vault Deposits:", ethers.formatEther(finalUserInfo.depositAmount), "CCT");
  
  console.log("\n🎉 Interaction Complete!");
  console.log("=".repeat(50));
  console.log("You can now use these contracts in your frontend or other applications.");
  console.log("Contract addresses:");
  console.log("- CCT Token:", deployment.contracts.CustomERC20.address);
  console.log("- Vault:", deployment.contracts.Vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction failed:", error);
    process.exit(1);
  });
