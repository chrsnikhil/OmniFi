import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment to Fuji testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");
  
  // Deploy CustomERC20 token first
  console.log("\n1. Deploying CustomERC20 token...");
  const CustomERC20 = await ethers.getContractFactory("CustomERC20");
  
  // Token parameters
  const tokenName = "Carbon Credit Token";
  const tokenSymbol = "CCT";
  const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
  
  const customERC20 = await CustomERC20.deploy(tokenName, tokenSymbol, initialSupply);
  await customERC20.waitForDeployment();
  
  const tokenAddress = await customERC20.getAddress();
  console.log("CustomERC20 deployed to:", tokenAddress);
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Initial Supply:", ethers.formatEther(initialSupply));
  
  // Deploy Vault contract
  console.log("\n2. Deploying Vault contract...");
  const Vault = await ethers.getContractFactory("Vault");
  
  // Chainlink ETH/USD Price Feed on Avalanche Fuji Testnet
  // Reference: https://docs.chain.link/data-feeds/price-feeds/addresses?network=avalanche&page=1
  const ETH_USD_PRICE_FEED_FUJI = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA";
  
  const vault = await Vault.deploy(
    tokenAddress,           // deposit token address
    ETH_USD_PRICE_FEED_FUJI, // price feed address
    deployer.address        // owner address
  );
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log("Vault deployed to:", vaultAddress);
  console.log("Deposit Token:", tokenAddress);
  console.log("Price Feed:", ETH_USD_PRICE_FEED_FUJI);
  console.log("Owner:", deployer.address);
  
  // Verify deployment by calling some view functions
  console.log("\n3. Verifying deployment...");
  
  try {
    const latestPrice = await vault.getLatestPrice();
    console.log("Current ETH/USD Price:", (Number(latestPrice) / 1e8).toFixed(2), "USD");
    
    const currentDepositLimit = await vault.getCurrentDepositLimit();
    console.log("Current Deposit Limit:", ethers.formatEther(currentDepositLimit), "CCT");
    
    const vaultStatus = await vault.getVaultStatus();
    console.log("Total Vault Deposits:", ethers.formatEther(vaultStatus.totalVaultDeposits), "CCT");
    console.log("Vault Token Balance:", ethers.formatEther(vaultStatus.vaultBalance), "CCT");
    
  } catch (error) {
    console.log("Warning: Could not fetch price data. Price feed might not be available or network issues.");
    console.log("Error:", error);
  }
  
  // Print summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network: Avalanche Fuji Testnet");
  console.log("CustomERC20 Token:", tokenAddress);
  console.log("Vault Contract:", vaultAddress);
  console.log("ETH/USD Price Feed:", ETH_USD_PRICE_FEED_FUJI);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(50));
  
  // Save deployment addresses to a file
  const deploymentInfo = {
    network: "fuji",
    chainId: 43113,
    deployer: deployer.address,
    contracts: {
      CustomERC20: {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        initialSupply: initialSupply.toString()
      },
      Vault: {
        address: vaultAddress,
        depositToken: tokenAddress,
        priceFeed: ETH_USD_PRICE_FEED_FUJI,
        owner: deployer.address
      }
    },
    timestamp: new Date().toISOString(),
    txHashes: {
      token: customERC20.deploymentTransaction()?.hash,
      vault: vault.deploymentTransaction()?.hash
    }
  };
  
  const fs = require('fs');
  const path = require('path');
  
  const deploymentDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentDir, 'fuji-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to: deployments/fuji-deployment.json");
  
  console.log("\n📋 Next Steps:");
  console.log("1. Add AVAX to your wallet from the faucet: https://faucet.avax.network/ (use code: avalanche-academy)");
  console.log("2. Add the deployed token to MetaMask using address:", tokenAddress);
  console.log("3. Approve the vault to spend your tokens before depositing");
  console.log("4. Test the vault functions through the frontend or Hardhat console");
  console.log("5. Monitor the price feed and test deposit limit changes");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
