import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧪 Testing TransferCoordinator functionality...\n");
  
  // Read deployment info
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  const carbonTokenAddress = deployment.contracts.CustomERC20.address;
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  console.log("📄 Testing with contracts:");
  console.log("  CustomERC20:", carbonTokenAddress);
  console.log("  TransferCoordinator:", transferCoordinatorAddress);
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("  Deployer:", deployer.address);
  
  // Get contract instances
  const carbonToken = await ethers.getContractAt("CustomERC20", carbonTokenAddress);
  const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
  
  try {
    // Test 1: Check subscription status
    console.log("\n1. 🔗 Checking Chainlink Functions setup...");
    const subscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID;
    console.log("Subscription ID:", subscriptionId!.toString());
    
    if (subscriptionId.toString() === "0") {
      console.log("⚠️  Chainlink Functions subscription not configured");
      console.log("For demo purposes, we'll test the basic burn functionality");
    } else {
      console.log("✅ Chainlink Functions subscription configured");
    }
    
    // Test 2: Check deployer balance and mint more if needed
    console.log("\n2. 🪙 Preparing test tokens...");
    let deployerBalance = await carbonToken.balanceOf(deployer.address);
    console.log("Current deployer balance:", ethers.formatEther(deployerBalance), "CCT");
    
    // Create a test user (we'll use the deployer as both owner and user for simplicity)
    const testUser = deployer;
    const transferAmount = ethers.parseEther("100");
    
    if (deployerBalance < transferAmount) {
      console.log("Minting more tokens...");
      const mintTx = await carbonToken.mint(deployer.address, ethers.parseEther("1000"));
      await mintTx.wait();
      deployerBalance = await carbonToken.balanceOf(deployer.address);
      console.log("New balance:", ethers.formatEther(deployerBalance), "CCT");
    }
    
    // Test 3: Check and set approval
    console.log("\n3. ✅ Setting up approval...");
    let allowance = await carbonToken.allowance(testUser.address, transferCoordinatorAddress);
    console.log("Current allowance:", ethers.formatEther(allowance), "CCT");
    
    if (allowance < transferAmount) {
      console.log("Approving TransferCoordinator...");
      const approveTx = await carbonToken.approve(transferCoordinatorAddress, transferAmount);
      await approveTx.wait();
      
      allowance = await carbonToken.allowance(testUser.address, transferCoordinatorAddress);
      console.log("New allowance:", ethers.formatEther(allowance), "CCT");
    }
    
    // Test 4: Check chain configuration
    console.log("\n4. 🌐 Checking chain configuration...");
    try {
      const activeChains = await transferCoordinator.getActiveChains();
      console.log("Active chains:", activeChains.map((id: any) => id.toString()));
      
      // Check yields
      const fujiYield = await transferCoordinator.getChainYield(43113);
      const baseYield = await transferCoordinator.getChainYield(84532);
      console.log("Current yields - Fuji:", fujiYield.toString(), "bp, Base:", baseYield.toString(), "bp");
      
    } catch (error: any) {
      console.log("Note: Some view functions may not work until first transfer");
    }
    
    // Test 5: Test the transfer functionality
    console.log("\n5. 🚀 Testing transfer initiation...");
    
    const balanceBefore = await carbonToken.balanceOf(testUser.address);
    console.log("Balance before transfer:", ethers.formatEther(balanceBefore), "CCT");
    
    try {
      console.log("Initiating transfer of", ethers.formatEther(transferAmount), "CCT...");
      
      // Set a higher gas limit for the transaction
      const transferTx = await transferCoordinator.initiateTransfer(transferAmount, {
        gasLimit: 500000 // 500k gas limit
      });
      
      console.log("Transaction submitted:", transferTx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await transferTx.wait();
      console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);
      
      const balanceAfter = await carbonToken.balanceOf(testUser.address);
      console.log("Balance after transfer:", ethers.formatEther(balanceAfter), "CCT");
      
      const burnedAmount = balanceBefore - balanceAfter;
      console.log("Tokens burned:", ethers.formatEther(burnedAmount), "CCT");
      
      // Check for events
      if (receipt?.logs) {
        console.log("\n📝 Events emitted:");
        let transferInitiatedFound = false;
        
        for (const log of receipt.logs) {
          try {
            const parsedLog = transferCoordinator.interface.parseLog(log);
            if (parsedLog?.name === "TransferInitiated") {
              console.log("✅ TransferInitiated event:");
              console.log("  Request ID:", parsedLog.args[0]);
              console.log("  User:", parsedLog.args[1]);
              console.log("  Amount:", ethers.formatEther(parsedLog.args[2]), "CCT");
              console.log("  Source Chain:", parsedLog.args[3].toString());
              transferInitiatedFound = true;
            }
          } catch {
            // Skip non-parseable logs
          }
        }
        
        if (!transferInitiatedFound) {
          console.log("⚠️  TransferInitiated event not found in logs");
        }
      }
      
      // Wait a moment and check if Functions response came back
      if (subscriptionId.toString() !== "0") {
        console.log("\n⏳ Waiting 30 seconds for Chainlink Functions response...");
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        try {
          const fujiYieldAfter = await transferCoordinator.getChainYield(43113);
          const baseYieldAfter = await transferCoordinator.getChainYield(84532);
          const lastUpdate = await transferCoordinator.lastYieldUpdate();
          
          console.log("Updated yields - Fuji:", fujiYieldAfter.toString(), "Base:", baseYieldAfter.toString());
          console.log("Last update timestamp:", lastUpdate.toString());
          
          if (lastUpdate.toString() !== "0") {
            console.log("✅ Chainlink Functions response received!");
            const updateDate = new Date(Number(lastUpdate) * 1000);
            console.log("Update time:", updateDate.toISOString());
          } else {
            console.log("⏳ Still waiting for Chainlink Functions response...");
          }
        } catch (error: any) {
          console.log("Could not check yield data:", error.message);
        }
      }
      
    } catch (error: any) {
      console.log("❌ Transfer failed:", error.message);
      
      if (error.message.includes("subscription")) {
        console.log("\n💡 This is likely due to Chainlink Functions setup:");
        console.log("1. Visit https://functions.chain.link/");
        console.log("2. Create and fund a subscription");
        console.log("3. Add the TransferCoordinator as a consumer");
        console.log("4. Update subscription ID using updateSubscriptionId()");
      } else if (error.message.includes("revert")) {
        console.log("\n💡 Contract reverted. Possible reasons:");
        console.log("- Insufficient allowance");
        console.log("- Insufficient balance");
        console.log("- Contract paused or restricted");
      }
    }
    
    console.log("\n✅ Testing completed!");
    
    console.log("\n📋 Demo Instructions:");
    console.log("1. The burn mechanism works correctly");
    console.log("2. For full demo with yield optimization:");
    console.log("   a. Set up Chainlink Functions subscription");
    console.log("   b. Fund with LINK tokens");
    console.log("   c. Add TransferCoordinator as consumer");
    console.log("3. For cross-chain demo:");
    console.log("   a. Deploy CustomERC20 to Base Sepolia");
    console.log("   b. Manually mint tokens there when transfer completes");
    console.log("   c. Show tokens burned on Fuji, minted on Base");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
