import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("🔗 Updating TransferCoordinator Subscription ID...\n");
  
  // Read deployment info
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  console.log("📄 TransferCoordinator:", transferCoordinatorAddress);
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("  Deployer:", deployer.address);
  
  // Get contract instance
  const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
  
  // Get subscription ID from environment
  const newSubscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID;
  
  if (!newSubscriptionId || newSubscriptionId === "0") {
    console.log("❌ No subscription ID found in environment variables");
    console.log("Please set CHAINLINK_SUBSCRIPTION_ID in your .env file");
    return;
  }
  
  try {
    // Check current subscription ID
    const currentSubscriptionId = await transferCoordinator.subscriptionId();
    console.log("Current subscription ID:", currentSubscriptionId.toString());
    console.log("New subscription ID:", newSubscriptionId);
    
    if (currentSubscriptionId.toString() === newSubscriptionId) {
      console.log("✅ Subscription ID is already up to date!");
      return;
    }
    
    // Update subscription ID
    console.log("Updating subscription ID...");
    const updateTx = await transferCoordinator.updateSubscriptionId(newSubscriptionId);
    
    console.log("Transaction submitted:", updateTx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await updateTx.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);
    
    // Verify the update
    const updatedSubscriptionId = await transferCoordinator.subscriptionId();
    console.log("Updated subscription ID:", updatedSubscriptionId.toString());
    
    if (updatedSubscriptionId.toString() === newSubscriptionId) {
      console.log("✅ Subscription ID successfully updated!");
      console.log("\n📋 Next steps:");
      console.log("1. Ensure your Chainlink Functions subscription is funded with LINK");
      console.log("2. Add the TransferCoordinator contract as a consumer");
      console.log("3. Run the transfer test again");
    } else {
      console.log("❌ Subscription ID update may have failed");
    }
    
  } catch (error: any) {
    console.error("❌ Failed to update subscription ID:", error.message);
    
    if (error.message.includes("Ownable")) {
      console.log("\n💡 Only the contract owner can update the subscription ID");
      console.log("Make sure you're using the deployer account");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
