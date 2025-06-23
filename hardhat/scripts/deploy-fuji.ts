import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment to Avalanche Fuji testnet...");
  
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
  
  // Wait for block confirmations
  console.log("\n3. Waiting for block confirmations...");
  await customERC20.deploymentTransaction()?.wait(5);
  await vault.deploymentTransaction()?.wait(5);
  
  // Save deployment info
  const deploymentInfo = {
    network: "fuji",
    chainId: 43113,
    deployedAt: Date.now(),
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
        priceFeed: ETH_USD_PRICE_FEED_FUJI
      }
    }
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, "fuji-deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n4. Deployment Summary:");
  console.log("Network: Avalanche Fuji Testnet");
  console.log("Chain ID: 43113");
  console.log("CustomERC20:", tokenAddress);
  console.log("Vault:", vaultAddress);
  console.log("Deployment info saved to: deployments/fuji-deployment.json");
  
  console.log("\n5. Next steps:");
  console.log("- Get AVAX from faucet: https://core.app/tools/testnet-faucet/?subnet=c&token=c (code: avalanche-academy)");
  console.log("- Verify contracts on Snowtrace");
  console.log("- Test token minting and vault deposits");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
