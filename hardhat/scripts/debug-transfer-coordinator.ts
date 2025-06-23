import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Debugging TransferCoordinator...\n");
  
  // Read deployment info
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  const carbonTokenAddress = deployment.contracts.CustomERC20.address;
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  console.log("📄 Contract addresses:");
  console.log("  CustomERC20:", carbonTokenAddress);
  console.log("  TransferCoordinator:", transferCoordinatorAddress);
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("  Deployer:", deployer.address);
  
  // Get contract instances
  const carbonToken = await ethers.getContractAt("CustomERC20", carbonTokenAddress);
  const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
  
  try {
    // Check contract state in detail
    console.log("\n1. 📊 Contract State Check:");
    
    // Check subscription ID
    try {
      const subscriptionId = await transferCoordinator.subscriptionId();
      console.log("Contract subscription ID:", subscriptionId.toString());
    } catch (error: any) {
      console.log("Could not read subscription ID:", error.message);
    }
    
    // Check if contract is paused or has restrictions
    try {
      const owner = await transferCoordinator.owner();
      console.log("Contract owner:", owner);
      console.log("Is owner same as deployer?", owner.toLowerCase() === deployer.address.toLowerCase());
    } catch (error: any) {
      console.log("Could not read owner:", error.message);
    }
    
    // Check token contract details
    console.log("\n2. 🪙 Token Contract State:");
    const deployerBalance = await carbonToken.balanceOf(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(deployerBalance), "CCT");
    
    const allowance = await carbonToken.allowance(deployer.address, transferCoordinatorAddress);
    console.log("Allowance to TransferCoordinator:", ethers.formatEther(allowance), "CCT");
    
    // Check if token has restrictions
    try {
      const tokenOwner = await carbonToken.owner();
      console.log("Token owner:", tokenOwner);
    } catch (error: any) {
      console.log("Could not read token owner:", error.message);
    }
    
    // Test basic token operations first
    console.log("\n3. 🧪 Testing Basic Token Operations:");
    
    const testAmount = ethers.parseEther("1");
    
    // Test if we can mint
    try {
      console.log("Testing mint...");
      const mintTx = await carbonToken.mint(deployer.address, testAmount);
      await mintTx.wait();
      console.log("✅ Mint successful");
    } catch (error: any) {
      console.log("❌ Mint failed:", error.message);
    }
    
    // Test if we can approve
    try {
      console.log("Testing approve...");
      const approveTx = await carbonToken.approve(transferCoordinatorAddress, testAmount);
      await approveTx.wait();
      console.log("✅ Approve successful");
    } catch (error: any) {
      console.log("❌ Approve failed:", error.message);
    }
    
    // Now try to simulate the transfer call to get the exact revert reason
    console.log("\n4. 🎯 Simulating Transfer Call:");
    
    try {
      // Use callStatic to simulate the call without executing
      await transferCoordinator.initiateTransfer.staticCall(testAmount);
      console.log("✅ Transfer simulation successful - call should work");
    } catch (error: any) {
      console.log("❌ Transfer simulation failed:");
      console.log("Error message:", error.message);
      
      // Try to extract the revert reason
      if (error.data) {
        try {
          const decodedError = transferCoordinator.interface.parseError(error.data);
          console.log("Decoded error:", decodedError);
        } catch {
          console.log("Could not decode error data:", error.data);
        }
      }
      
      // Common issues to check
      console.log("\n🔧 Troubleshooting:");
      
      if (error.message.includes("InvalidSubscription") || error.message.includes("subscription")) {
        console.log("❌ Issue: Chainlink Functions subscription not set up correctly");
        console.log("💡 Solution: Update subscription ID in contract");
      } else if (error.message.includes("InsufficientBalance")) {
        console.log("❌ Issue: Insufficient token balance");
        console.log("💡 Solution: Mint more tokens");
      } else if (error.message.includes("InsufficientAllowance")) {
        console.log("❌ Issue: Insufficient allowance");
        console.log("💡 Solution: Increase approval amount");
      } else if (error.message.includes("OnlyOwner")) {
        console.log("❌ Issue: Only owner can call this function");
        console.log("💡 Solution: Call from owner account");
      } else {
        console.log("❌ Issue: Unknown error");
        console.log("💡 Check contract code for specific requirements");
      }
    }
    
    // Check if we need to update subscription ID
    console.log("\n5. 🔗 Chainlink Functions Setup Check:");
    const envSubscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID;
    console.log("Environment subscription ID:", envSubscriptionId);
    
    if (envSubscriptionId && envSubscriptionId !== "0") {
      try {
        const contractSubscriptionId = await transferCoordinator.subscriptionId();
        if (contractSubscriptionId.toString() !== envSubscriptionId) {
          console.log("⚠️  Contract subscription ID doesn't match environment variable");
          console.log("Contract has:", contractSubscriptionId.toString());
          console.log("Environment has:", envSubscriptionId);
          console.log("💡 Need to call updateSubscriptionId() to fix this");
          
          // Offer to fix it
          console.log("\nWould you like to update the subscription ID? (This will send a transaction)");
          console.log("Run this command to update:");
          console.log(`npx hardhat run scripts/update-subscription-id.ts --network fuji`);
        } else {
          console.log("✅ Subscription ID matches environment variable");
        }
      } catch (error: any) {
        console.log("Could not compare subscription IDs:", error.message);
      }
    } else {
      console.log("⚠️  No subscription ID set in environment");
    }
    
  } catch (error: any) {
    console.error("❌ Debug failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
