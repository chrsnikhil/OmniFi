import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Testing contract compilation and basic deployment setup...\n");
  
  // Test contract factory creation
  try {
    const CustomERC20 = await ethers.getContractFactory("CustomERC20");
    console.log("✅ CustomERC20 contract factory created successfully");
    
    const Vault = await ethers.getContractFactory("Vault");
    console.log("✅ Vault contract factory created successfully");
    
    // Get deployer account (will use the first hardhat account for testing)
    const [deployer] = await ethers.getSigners();
    console.log("\n🔑 Deployer account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    console.log("\n✅ All tests passed! Ready for deployment.");
    console.log("\n📋 Next Steps:");
    console.log("1. Set up your .env file with your private key");
    console.log("2. Get testnet funds from faucets");
    console.log("3. Run deployment scripts");
    
  } catch (error) {
    console.error("❌ Error during test:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
