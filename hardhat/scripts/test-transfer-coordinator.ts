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
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  // Check if deployment structure is valid
  if (!deployment.contracts) {
    console.error("❌ Invalid deployment file structure. Please redeploy contracts.");
    console.log("Run: npm run deploy:fuji");
    process.exit(1);
  }
  
  if (!deployment.contracts.CustomERC20 || !deployment.contracts.CustomERC20.address) {
    console.error("❌ CustomERC20 not found in deployment. Please deploy it first:");
    console.log("npm run deploy:fuji");
    process.exit(1);
  }
  
  if (!deployment.contracts.TransferCoordinator || !deployment.contracts.TransferCoordinator.address) {
    console.error("❌ TransferCoordinator not found in deployment. Please deploy it first:");
    console.log("npm run deploy:transfer-coordinator");
    process.exit(1);
  }
  
  const carbonTokenAddress = deployment.contracts.CustomERC20.address;
  const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
  
  // Get contract instances
  const CarbonToken = await ethers.getContractFactory("CustomERC20");
  const carbonToken = CarbonToken.attach(carbonTokenAddress);
  
  const TransferCoordinator = await ethers.getContractFactory("TransferCoordinator");
  const transferCoordinator = TransferCoordinator.attach(transferCoordinatorAddress);
  
  console.log("📄 Contract Addresses:");
  console.log("Carbon Token:", carbonTokenAddress);
  console.log("Transfer Coordinator:", transferCoordinatorAddress);
  
  try {
    // Test 1: Check initial configuration
    console.log("\n1. 🔍 Checking TransferCoordinator configuration...");
    
    const activeChains = await transferCoordinator.getActiveChains();
    console.log("Active chains:", activeChains.map(id => id.toString()));
    
    const fujiChain = await transferCoordinator.chains(43113);
    const baseChain = await transferCoordinator.chains(84532);
    
    console.log("Fuji chain config:", {
      name: fujiChain.name,
      isActive: fujiChain.isActive
    });
    console.log("Base chain config:", {
      name: baseChain.name,
      isActive: baseChain.isActive
    });
    
    // Test 2: Mint tokens for testing (to user account)
    console.log("\n2. 🪙 Minting test tokens...");
    const mintAmount = ethers.parseEther("1000"); // 1000 CCT
    
    const userBalance = await carbonToken.balanceOf(user.address);
    console.log("User balance before mint:", ethers.formatEther(userBalance), "CCT");
    
    // Mint tokens to user (using deployer as owner)
    const mintTx = await carbonToken.connect(deployer).mint(user.address, mintAmount);
    await mintTx.wait();
    
    const newUserBalance = await carbonToken.balanceOf(user.address);
    console.log("User balance after mint:", ethers.formatEther(newUserBalance), "CCT");
    
    // Test 3: Approve TransferCoordinator to spend tokens
    console.log("\n3. ✅ Approving TransferCoordinator...");
    const transferAmount = ethers.parseEther("100"); // 100 CCT for transfer
    
    const approveTx = await carbonToken.connect(user).approve(transferCoordinatorAddress, transferAmount);
    await approveTx.wait();
    
    const allowance = await carbonToken.allowance(user.address, transferCoordinatorAddress);
    console.log("Allowance set:", ethers.formatEther(allowance), "CCT");
    
    // Test 4: Check if Chainlink Functions subscription is set up
    console.log("\n4. 🔗 Checking Chainlink Functions setup...");
    const subscriptionId = await transferCoordinator.subscriptionId();
    console.log("Subscription ID:", subscriptionId.toString());
    
    if (subscriptionId.toString() === "0") {
      console.log("⚠️  Chainlink Functions subscription not configured");
      console.log("This will cause the transfer to fail, but we can still test the basic flow");
    } else {
      console.log("✅ Chainlink Functions subscription configured");
    }
    
    // Test 5: Simulate transfer initiation (this will fail without proper subscription)
    console.log("\n5. 🚀 Testing transfer initiation...");
    console.log("This may fail if Chainlink Functions subscription is not set up properly");
    
    try {
      const balanceBeforeTransfer = await carbonToken.balanceOf(user.address);
      console.log("Balance before transfer:", ethers.formatEther(balanceBeforeTransfer), "CCT");
      
      // Initiate transfer (this will burn tokens and attempt to fetch yield data)
      const transferTx = await transferCoordinator.connect(user).initiateTransfer(transferAmount);
      const receipt = await transferTx.wait();
      
      const balanceAfterTransfer = await carbonToken.balanceOf(user.address);
      console.log("Balance after transfer:", ethers.formatEther(balanceAfterTransfer), "CCT");
      console.log("Tokens burned successfully!");
      
      // Check for TransferInitiated event
      const transferInitiatedEvents = receipt?.logs?.filter((log: any) => {
        try {
          const parsedLog = transferCoordinator.interface.parseLog(log);
          return parsedLog?.name === "TransferInitiated";
        } catch {
          return false;
        }
      });
      
      if (transferInitiatedEvents && transferInitiatedEvents.length > 0) {
        const parsedLog = transferCoordinator.interface.parseLog(transferInitiatedEvents[0]);
        const requestId = parsedLog?.args[0];
        console.log("✅ Transfer initiated with request ID:", requestId);
        
        // Check transfer request details
        const transferRequest = await transferCoordinator.getTransferRequest(requestId);
        console.log("Transfer request details:", {
          user: transferRequest.user,
          amount: ethers.formatEther(transferRequest.amount),
          sourceChain: transferRequest.sourceChain.toString(),
          isProcessed: transferRequest.isProcessed
        });
        
        console.log("\n⏳ Waiting for Chainlink Functions response...");
        console.log("Note: This may take a few minutes depending on the DON response time");
        
        // Check pending requests
        const pendingCount = await transferCoordinator.getPendingRequestsCount();
        console.log("Pending requests:", pendingCount.toString());
        
      } else {
        console.log("❌ TransferInitiated event not found");
      }
      
    } catch (error: any) {
      console.log("❌ Transfer failed (expected if subscription not set up):");
      console.log("Error:", error.message);
      
      if (error.message.includes("subscription")) {
        console.log("\n💡 To fix this:");
        console.log("1. Visit https://functions.chain.link/");
        console.log("2. Create and fund a subscription");
        console.log("3. Add the TransferCoordinator as a consumer");
        console.log("4. Update the subscription ID using updateSubscriptionId()");
      }
    }
    
    // Test 6: Check yield data (if available)
    console.log("\n6. 📊 Checking yield data...");
    const fujiYield = await transferCoordinator.getChainYield(43113);
    const baseYield = await transferCoordinator.getChainYield(84532);
    
    console.log("Fuji yield:", fujiYield.toString(), "basis points");
    console.log("Base yield:", baseYield.toString(), "basis points");
    
    const lastUpdate = await transferCoordinator.lastYieldUpdate();
    console.log("Last yield update:", lastUpdate.toString());
    
    if (lastUpdate.toString() === "0") {
      console.log("No yield data available yet");
    } else {
      const updateDate = new Date(Number(lastUpdate) * 1000);
      console.log("Last update time:", updateDate.toISOString());
    }
    
    console.log("\n✅ Testing completed!");
    
    console.log("\n📋 Manual Testing Steps for Demo:");
    console.log("1. Set up Chainlink Functions subscription");
    console.log("2. Fund subscription with LINK");
    console.log("3. Add TransferCoordinator as consumer");
    console.log("4. Call initiateTransfer() from frontend");
    console.log("5. Wait for yield data response");
    console.log("6. Manually mint tokens on destination chain for demo");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
