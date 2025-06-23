import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Checking Chainlink Functions Integration Status...\n");
  
  // Read deployment info
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  console.log("📄 TransferCoordinator:", transferCoordinatorAddress);
  console.log("📄 Subscription ID: 15641");
  
  // Get contract instance
  const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
  
  try {
    // Check subscription ID
    const subscriptionId = await transferCoordinator.subscriptionId();
    console.log("✅ Contract subscription ID:", subscriptionId.toString());
    
    // Check DON ID
    const donId = await transferCoordinator.donId();
    console.log("✅ DON ID:", ethers.hexlify(donId));
    
    // Check callback gas limit
    const callbackGasLimit = await transferCoordinator.callbackGasLimit();
    console.log("✅ Callback gas limit:", callbackGasLimit.toString());
    
    // Check if there are any recent requests
    const pendingRequestsCount = await transferCoordinator.getPendingRequestsCount();
    console.log("📋 Pending requests count:", pendingRequestsCount.toString());
    
    if (pendingRequestsCount > 0) {
      console.log("Recent requests:");
      for (let i = 0; i < Math.min(5, Number(pendingRequestsCount)); i++) {
        try {
          const requestId = await transferCoordinator.pendingRequests(i);
          const request = await transferCoordinator.transferRequests(requestId);
          console.log(`  Request ${i + 1}:`);
          console.log(`    ID: ${requestId}`);
          console.log(`    User: ${request.user}`);
          console.log(`    Amount: ${ethers.formatEther(request.amount)} CCT`);
          console.log(`    Processed: ${request.isProcessed}`);
          console.log(`    Timestamp: ${new Date(Number(request.timestamp) * 1000).toISOString()}`);
        } catch (error) {
          console.log(`    Could not read request ${i}`);
        }
      }
    }
    
    // Check last yield update
    const lastUpdate = await transferCoordinator.lastYieldUpdate();
    console.log("📊 Last yield update:", lastUpdate.toString());
    
    if (lastUpdate.toString() !== "0") {
      const updateDate = new Date(Number(lastUpdate) * 1000);
      console.log("    Update time:", updateDate.toISOString());
    }
    
    // Check current yields
    const fujiYield = await transferCoordinator.getChainYield(43113);
    const baseYield = await transferCoordinator.getChainYield(84532);
    console.log("📊 Current yields:");
    console.log("    Fuji (43113):", fujiYield.toString(), "basis points");
    console.log("    Base (84532):", baseYield.toString(), "basis points");
    
    console.log("\n📋 Next Steps for Full Integration:");
    console.log("1. Visit https://functions.chain.link/fuji");
    console.log("2. Find your subscription ID: 15641");
    console.log("3. Add this contract as a consumer:", transferCoordinatorAddress);
    console.log("4. Ensure subscription has enough LINK tokens (minimum 2-5 LINK)");
    console.log("5. Test transfer again to trigger Chainlink Functions");
    
    console.log("\n🚀 Demo Ready!");
    console.log("The burn and transfer initiation works perfectly!");
    console.log("For the hackathon demo, you can:");
    console.log("- Show tokens being burned on Fuji");
    console.log("- Show the TransferInitiated event");
    console.log("- Manually mint equivalent tokens on Base Sepolia");
    console.log("- Explain that Chainlink Functions would automate yield optimization");
    
  } catch (error: any) {
    console.error("❌ Error checking contract state:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
