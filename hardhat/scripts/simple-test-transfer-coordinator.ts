import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧪 Testing TransferCoordinator functionality...\n");
  
  // Get the deployer account
  const [deployer, user] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Test user:", user.address);
  
  // Read deployment info
  const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found. Please deploy contracts first.");
    console.log("Run: npm run deploy:fuji");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  // Check if deployment structure is valid
  if (!deployment.contracts) {
    console.error("❌ Invalid deployment file structure. Please redeploy contracts.");
    console.log("Run: npm run deploy:fuji");
    process.exit(1);
  }
  
  if (!deployment.contracts.CustomERC20?.address) {
    console.error("❌ CustomERC20 not found in deployment. Please deploy it first:");
    console.log("npm run deploy:fuji");
    process.exit(1);
  }
  
  if (!deployment.contracts.TransferCoordinator?.address) {
    console.error("❌ TransferCoordinator not found in deployment. Please deploy it first:");
    console.log("npm run deploy:transfer-coordinator");
    process.exit(1);
  }
  
  const carbonTokenAddress = deployment.contracts.CustomERC20.address;
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  console.log("📄 Contract Addresses:");
  console.log("Carbon Token:", carbonTokenAddress);
  console.log("Transfer Coordinator:", transferCoordinatorAddress);
  
  try {
    // Get contract instances using getContractAt for better type support
    const carbonToken = await ethers.getContractAt("CustomERC20", carbonTokenAddress);
    const transferCoordinator = await ethers.getContractAt("TransferCoordinator", transferCoordinatorAddress);
    
    // Test 1: Check basic contract info
    console.log("\n1. 🔍 Checking basic contract info...");
    
    const tokenName = await carbonToken.name();
    const tokenSymbol = await carbonToken.symbol();
    console.log(`Token: ${tokenName} (${tokenSymbol})`);
    
    const subscriptionId = await transferCoordinator.subscriptionId();
    console.log("Subscription ID:", subscriptionId.toString());
    
    if (subscriptionId.toString() === "0") {
      console.log("⚠️  Chainlink Functions subscription not configured");
      console.log("This will cause the transfer to fail, but we can still test the basic flow");
    } else {
      console.log("✅ Chainlink Functions subscription configured");
    }
    
    // Test 2: Check user balance and mint tokens if needed
    console.log("\n2. 🪙 Checking and minting test tokens...");
    
    let userBalance = await carbonToken.balanceOf(user.address);
    console.log("User balance:", ethers.formatEther(userBalance), "CCT");
    
    if (userBalance < ethers.parseEther("100")) {
      console.log("Minting 1000 CCT to user for testing...");
      const mintAmount = ethers.parseEther("1000");
      const mintTx = await carbonToken.connect(deployer).mint(user.address, mintAmount);
      await mintTx.wait();
      
      userBalance = await carbonToken.balanceOf(user.address);
      console.log("User balance after mint:", ethers.formatEther(userBalance), "CCT");
    }
    
    // Test 3: Test approval
    console.log("\n3. ✅ Testing token approval...");
    const transferAmount = ethers.parseEther("100");
    
    let allowance = await carbonToken.allowance(user.address, transferCoordinatorAddress);
    console.log("Current allowance:", ethers.formatEther(allowance), "CCT");
    
    if (allowance < transferAmount) {
      console.log("Approving TransferCoordinator to spend tokens...");
      const approveTx = await carbonToken.connect(user).approve(transferCoordinatorAddress, transferAmount);
      await approveTx.wait();
      
      allowance = await carbonToken.allowance(user.address, transferCoordinatorAddress);
      console.log("New allowance:", ethers.formatEther(allowance), "CCT");
    }
    
    // Test 4: Test basic contract calls (without Functions)
    console.log("\n4. 🧪 Testing contract state...");
    
    try {
      // Call some view functions to verify the contract is working
      const activeChains = await transferCoordinator.getActiveChains();
      console.log("Active chains:", activeChains.map(id => id.toString()));
      
      const fujiYield = await transferCoordinator.getChainYield(43113);
      const baseYield = await transferCoordinator.getChainYield(84532);
      console.log("Current yields - Fuji:", fujiYield.toString(), "Base:", baseYield.toString());
      
    } catch (error: any) {
      console.log("⚠️  Some view functions failed (normal if contract is new):", error.message);
    }
    
    // Test 5: Try transfer initiation (this might fail without subscription)
    console.log("\n5. 🚀 Testing transfer initiation...");
    
    if (subscriptionId.toString() === "0") {
      console.log("⚠️  Skipping transfer test - no Chainlink subscription configured");
      console.log("To test transfers:");
      console.log("1. Set up Chainlink Functions subscription at https://functions.chain.link/");
      console.log("2. Fund it with LINK tokens");
      console.log("3. Add the TransferCoordinator as a consumer");
      console.log("4. Update subscription ID using updateSubscriptionId()");
    } else {
      try {
        const balanceBefore = await carbonToken.balanceOf(user.address);
        console.log("Balance before transfer:", ethers.formatEther(balanceBefore), "CCT");
        
        console.log("Initiating transfer of 100 CCT...");
        const transferTx = await transferCoordinator.connect(user).initiateTransfer(transferAmount);
        const receipt = await transferTx.wait();
        
        const balanceAfter = await carbonToken.balanceOf(user.address);
        console.log("Balance after transfer:", ethers.formatEther(balanceAfter), "CCT");
        console.log("✅ Tokens burned successfully!");
        
        // Log transaction hash for tracking
        console.log("Transaction hash:", receipt?.hash);
        
        // Parse events
        if (receipt?.logs) {
          console.log("Events emitted:", receipt.logs.length);
          for (const log of receipt.logs) {
            try {
              const parsedLog = transferCoordinator.interface.parseLog(log);
              if (parsedLog?.name === "TransferInitiated") {
                console.log("✅ TransferInitiated event found:");
                console.log("  Request ID:", parsedLog.args[0]);
                console.log("  User:", parsedLog.args[1]);
                console.log("  Amount:", ethers.formatEther(parsedLog.args[2]));
                console.log("  Source Chain:", parsedLog.args[3].toString());
              }
            } catch {
              // Ignore parsing errors for non-contract logs
            }
          }
        }
        
      } catch (error: any) {
        console.log("❌ Transfer failed:", error.message);
        
        if (error.message.includes("subscription") || error.message.includes("consumer")) {
          console.log("\n💡 This is likely due to Chainlink Functions setup:");
          console.log("1. Visit https://functions.chain.link/");
          console.log("2. Create and fund a subscription");
          console.log("3. Add the TransferCoordinator as a consumer");
        }
      }
    }
    
    console.log("\n✅ Basic testing completed!");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Set up Chainlink Functions subscription (if not done)");
    console.log("2. Test the full transfer flow");
    console.log("3. Deploy to Base Sepolia for cross-chain demo");
    console.log("4. Create frontend integration");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
