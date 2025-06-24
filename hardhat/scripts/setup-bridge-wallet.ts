import { ethers } from "hardhat";

async function main() {
  console.log("🌉 Setting up dedicated bridge wallet...");

  // Get the deployer account (contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  // Bridge wallet address (new dedicated wallet)
  const BRIDGE_WALLET_ADDRESS = "0x742d35Cc6635C0532925a3b8D5C9E3b67c6F3c7B";
  
  // Base Sepolia contract address
  const BASE_SEPOLIA_TOKEN = "0x731A6C217B181E3c4Efd2Cb8b768863B57A3E02D";
  
  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  // Token contract
  const tokenABI = [
    "function mint(address to, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function owner() view returns (address)"
  ];
  
  const token = new ethers.Contract(BASE_SEPOLIA_TOKEN, tokenABI, wallet);
  
  // Check current balances
  const ownerBalance = await token.balanceOf(wallet.address);
  const bridgeBalance = await token.balanceOf(BRIDGE_WALLET_ADDRESS);
  
  console.log("Owner balance:", ethers.formatEther(ownerBalance), "CCT");
  console.log("Bridge wallet balance:", ethers.formatEther(bridgeBalance), "CCT");
  
  // Mint tokens directly to bridge wallet (safer than transferring)
  const bridgeFundAmount = ethers.parseEther("50000"); // 50,000 tokens for bridge operations
  console.log("Minting", ethers.formatEther(bridgeFundAmount), "CCT directly to bridge wallet...");
  
  try {
    const mintTx = await token.mint(BRIDGE_WALLET_ADDRESS, bridgeFundAmount);
    console.log("Mint transaction sent:", mintTx.hash);
    
    const receipt = await mintTx.wait();
    console.log("Mint transaction confirmed in block:", receipt.blockNumber);
    
    // Check new bridge wallet balance
    const newBridgeBalance = await token.balanceOf(BRIDGE_WALLET_ADDRESS);
    console.log("New bridge wallet balance:", ethers.formatEther(newBridgeBalance), "CCT");
    
    console.log("✅ Bridge wallet setup completed!");
    console.log("🔐 Bridge wallet address:", BRIDGE_WALLET_ADDRESS);
    console.log("💰 Bridge wallet now has", ethers.formatEther(newBridgeBalance), "CCT available for user transfers");
    console.log("🚀 The bridge is ready to handle real token transfers for non-owner wallets!");
    
  } catch (error: any) {
    console.error("❌ Bridge setup failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
