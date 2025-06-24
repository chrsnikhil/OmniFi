import { ethers } from "hardhat";

async function main() {
  console.log("🌉 Minting tokens for bridge operations...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  // Base Sepolia contract address
  const BASE_SEPOLIA_TOKEN = "0x731A6C217B181E3c4Efd2Cb8b768863B57A3E02D";
  
  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  // Token contract
  const tokenABI = [
    "function mint(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function owner() view returns (address)"
  ];
  
  const token = new ethers.Contract(BASE_SEPOLIA_TOKEN, tokenABI, wallet);
  
  // Check current balance
  const currentBalance = await token.balanceOf(wallet.address);
  console.log("Current balance:", ethers.formatEther(currentBalance), "CCT");
  
  // Mint 10,000 tokens for bridge operations
  const mintAmount = ethers.parseEther("10000");
  console.log("Minting", ethers.formatEther(mintAmount), "CCT for bridge operations...");
  
  try {
    const tx = await token.mint(wallet.address, mintAmount);
    console.log("Mint transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Mint transaction confirmed in block:", receipt.blockNumber);
    
    // Check new balance
    const newBalance = await token.balanceOf(wallet.address);
    console.log("New balance:", ethers.formatEther(newBalance), "CCT");
    
    console.log("✅ Bridge funding completed!");
    console.log("The bridge operator now has sufficient tokens to handle user transfers.");
    
  } catch (error: any) {
    console.error("❌ Mint failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
