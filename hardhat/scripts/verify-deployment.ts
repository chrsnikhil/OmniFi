import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Simple deployment verification...\n");
  
  try {
    // Test network connection first
    console.log("1. Testing network connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to:", network.name, "Chain ID:", network.chainId.toString());
    
    // Check deployment file
    console.log("\n2. Checking deployment file...");
    const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
    
    if (!fs.existsSync(deploymentPath)) {
      console.log("❌ Deployment file does not exist");
      console.log("Please run: npm run deploy:fuji");
      return;
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("✅ Deployment file loaded");
    
    // Check contract addresses
    if (!deployment.contracts) {
      console.log("❌ No contracts in deployment file");
      return;
    }
    
    const carbonTokenAddress = deployment.contracts.CustomERC20?.address;
    const transferCoordinatorAddress = deployment.contracts.TransferCoordinator?.address;
    
    if (!carbonTokenAddress) {
      console.log("❌ CustomERC20 address not found in deployment");
      return;
    }
    
    if (!transferCoordinatorAddress) {
      console.log("❌ TransferCoordinator address not found in deployment");
      console.log("Please run: npm run deploy:transfer-coordinator");
      return;
    }
    
    console.log("✅ Contract addresses found:");
    console.log("  CustomERC20:", carbonTokenAddress);
    console.log("  TransferCoordinator:", transferCoordinatorAddress);
    
    // Check if contracts exist on-chain
    console.log("\n3. Verifying contracts on-chain...");
    
    const carbonTokenCode = await provider.getCode(carbonTokenAddress);
    if (carbonTokenCode === "0x") {
      console.log("❌ CustomERC20 contract not found on-chain at", carbonTokenAddress);
      return;
    }
    console.log("✅ CustomERC20 contract exists on-chain");
    
    const transferCoordinatorCode = await provider.getCode(transferCoordinatorAddress);
    if (transferCoordinatorCode === "0x") {
      console.log("❌ TransferCoordinator contract not found on-chain at", transferCoordinatorAddress);
      return;
    }
    console.log("✅ TransferCoordinator contract exists on-chain");
    
    // Now try to get signers
    console.log("\n4. Testing signers...");
    const signers = await ethers.getSigners();
    
    if (!signers || signers.length === 0) {
      console.log("❌ No signers available");
      console.log("Check your PRIVATE_KEY in .env file");
      return;
    }
    
    console.log("✅ Signers available:", signers.length);
    console.log("  Deployer:", signers[0].address);
    
    // Get balances
    const deployerBalance = await provider.getBalance(signers[0].address);
    console.log("  Deployer balance:", ethers.formatEther(deployerBalance), "AVAX");
    
    // Try to interact with contracts
    console.log("\n5. Testing contract interactions...");
    
    try {
      const carbonToken = await ethers.getContractAt("CustomERC20", carbonTokenAddress);
      const tokenName = await carbonToken.name();
      const tokenSymbol = await carbonToken.symbol();
      console.log("✅ CustomERC20 interaction successful:", tokenName, tokenSymbol);
      
      const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
      const subscriptionId = await transferCoordinator.subscriptionId();
      console.log("✅ TransferCoordinator interaction successful. Subscription ID:", subscriptionId.toString());
      
      // Check deployer's token balance
      const deployerTokenBalance = await carbonToken.balanceOf(signers[0].address);
      console.log("  Deployer token balance:", ethers.formatEther(deployerTokenBalance), "CCT");
      
    } catch (error: any) {
      console.log("❌ Contract interaction failed:", error.message);
      return;
    }
    
    console.log("\n✅ All checks passed! Contracts are deployed and working.");
    console.log("\n📋 Next steps:");
    console.log("1. Set up Chainlink Functions subscription if not done");
    console.log("2. Fund subscription with LINK tokens");
    console.log("3. Test transfer functionality");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
