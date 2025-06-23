import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying TransferCoordinator to Avalanche Fuji...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");
  
  // Read existing deployment info to get CustomERC20 address
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Fuji deployment file not found. Please deploy CustomERC20 and Vault first:");
    console.log("npm run deploy:fuji");
    process.exit(1);
  }
  
  const existingDeployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const carbonTokenAddress = existingDeployment.contracts.CustomERC20.address;
  
  console.log("📄 Using existing CustomERC20 at:", carbonTokenAddress);
  
  // Chainlink Functions configuration for Avalanche Fuji
  const CHAINLINK_FUNCTIONS_ROUTER_FUJI = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0";
  const DON_ID = "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000"; // fun-avalanche-fuji-1
  
  // These values need to be set by the user after setting up Chainlink Functions subscription
  const SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID || "0"; // User needs to set this
  
  if (SUBSCRIPTION_ID === "0") {
    console.log("⚠️  Warning: CHAINLINK_SUBSCRIPTION_ID not set in environment variables");
    console.log("You'll need to update the subscription ID after deployment");
    console.log("Visit: https://functions.chain.link/ to create a subscription");
  }
  
  // Deploy TransferCoordinator
  console.log("\n1. Deploying TransferCoordinator...");
  const TransferCoordinator = await ethers.getContractFactory("TransferCoordinator");
  
  const transferCoordinator = await TransferCoordinator.deploy(
    CHAINLINK_FUNCTIONS_ROUTER_FUJI,  // Chainlink Functions router
    carbonTokenAddress,               // Carbon token address
    DON_ID,                          // DON ID
    SUBSCRIPTION_ID                  // Subscription ID (user needs to set this)
  );
  
  await transferCoordinator.waitForDeployment();
  const transferCoordinatorAddress = await transferCoordinator.getAddress();
  
  console.log("✅ TransferCoordinator deployed to:", transferCoordinatorAddress);
  
  // Wait for block confirmations
  console.log("\n2. Waiting for block confirmations...");
  await transferCoordinator.deploymentTransaction()?.wait(3);
  
  // Update deployment info
  existingDeployment.contracts.TransferCoordinator = {
    address: transferCoordinatorAddress,
    carbonToken: carbonTokenAddress,
    router: CHAINLINK_FUNCTIONS_ROUTER_FUJI,
    donId: DON_ID,
    subscriptionId: SUBSCRIPTION_ID
  };
  
  existingDeployment.deployedAt = Date.now();
  
  fs.writeFileSync(deploymentPath, JSON.stringify(existingDeployment, null, 2));
  
  console.log("\n🎉 Deployment Summary:");
  console.log("Network: Avalanche Fuji Testnet");
  console.log("Chain ID: 43113");
  console.log("TransferCoordinator:", transferCoordinatorAddress);
  console.log("Carbon Token:", carbonTokenAddress);
  console.log("Functions Router:", CHAINLINK_FUNCTIONS_ROUTER_FUJI);
  console.log("DON ID:", DON_ID);
  console.log("Subscription ID:", SUBSCRIPTION_ID);
  
  console.log("\n📋 Next Steps:");
  console.log("1. 🔗 Set up Chainlink Functions subscription:");
  console.log("   - Visit: https://functions.chain.link/");
  console.log("   - Connect your wallet");
  console.log("   - Create a new subscription");
  console.log("   - Fund it with LINK tokens");
  console.log("   - Add the TransferCoordinator as a consumer");
  
  if (SUBSCRIPTION_ID === "0") {
    console.log("2. 🔧 Update subscription ID:");
    console.log(`   - Call updateSubscriptionId() on the contract with your subscription ID`);
  }
  
  console.log("3. 🧪 Test the transfer functionality:");
  console.log("   - Mint some CCT tokens");
  console.log("   - Approve TransferCoordinator to spend tokens");
  console.log("   - Call initiateTransfer() to test yield-based routing");
  
  console.log("4. 📱 Update frontend with new contract address");
  
  console.log("\n🔧 Contract Functions Available:");
  console.log("- initiateTransfer(amount): Start cross-chain transfer with yield optimization");
  console.log("- getTransferRequest(requestId): Check transfer status");
  console.log("- getChainYield(chainId): Get current yield for a chain");
  console.log("- configureChain(chainId, name, isActive): Add/remove supported chains");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
