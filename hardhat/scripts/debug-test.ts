import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🔍 Debugging deployment and signer issues...\n");
  
  try {
    // Test 1: Check signers
    console.log("1. Testing signers...");
    const signers = await ethers.getSigners();
    console.log("Number of signers:", signers.length);
    
    if (signers.length > 0) {
      console.log("Deployer address:", signers[0].address);
      if (signers.length > 1) {
        console.log("User address:", signers[1].address);
      }
    } else {
      console.log("❌ No signers available");
      return;
    }
    
    // Test 2: Check deployment file
    console.log("\n2. Checking deployment file...");
    const deploymentPath = path.join(__dirname, "../deployments/fuji-deployment.json");
    
    if (!fs.existsSync(deploymentPath)) {
      console.log("❌ Deployment file does not exist at:", deploymentPath);
      return;
    }
    
    console.log("✅ Deployment file exists");
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("Deployment structure:", Object.keys(deployment));
    
    if (deployment.contracts) {
      console.log("Contracts in deployment:", Object.keys(deployment.contracts));
      
      if (deployment.contracts.CustomERC20) {
        console.log("CustomERC20 address:", deployment.contracts.CustomERC20.address);
      }
      
      if (deployment.contracts.TransferCoordinator) {
        console.log("TransferCoordinator address:", deployment.contracts.TransferCoordinator.address);
      }
    }
    
    // Test 3: Check network connection
    console.log("\n3. Checking network connection...");
    const network = await ethers.provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId.toString());
    
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    
    // Test 4: Check if contracts exist at the addresses
    if (deployment.contracts?.CustomERC20?.address) {
      console.log("\n4. Checking if contracts exist...");
      const carbonTokenAddress = deployment.contracts.CustomERC20.address;
      const code = await ethers.provider.getCode(carbonTokenAddress);
      
      if (code === "0x") {
        console.log("❌ No contract found at CustomERC20 address:", carbonTokenAddress);
      } else {
        console.log("✅ CustomERC20 contract found at:", carbonTokenAddress);
        console.log("Contract code length:", code.length);
      }
      
      if (deployment.contracts.TransferCoordinator?.address) {
        const transferCoordinatorAddress = deployment.contracts.TransferCoordinator.address;
        const transferCode = await ethers.provider.getCode(transferCoordinatorAddress);
        
        if (transferCode === "0x") {
          console.log("❌ No contract found at TransferCoordinator address:", transferCoordinatorAddress);
        } else {
          console.log("✅ TransferCoordinator contract found at:", transferCoordinatorAddress);
          console.log("Contract code length:", transferCode.length);
        }
      }
    }
    
    console.log("\n✅ Debug completed successfully!");
    
  } catch (error: any) {
    console.error("❌ Debug failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
