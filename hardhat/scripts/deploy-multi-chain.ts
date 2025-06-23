import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// Network configurations
const NETWORKS = {
  fuji: {
    name: "Avalanche Fuji",
    chainId: 43113,
    currency: "AVAX",
    priceFeed: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA", // ETH/USD on Fuji
    faucet: "https://core.app/tools/testnet-faucet/?subnet=c&token=c (code: avalanche-academy)",
    explorer: "Snowtrace"
  },
  sepolia: {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    currency: "ETH",
    priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD on Sepolia
    faucet: "https://sepoliafaucet.com/",
    explorer: "Etherscan"
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    currency: "ETH",
    priceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", // ETH/USD on Base Sepolia
    faucet: "https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet",
    explorer: "BaseScan"
  }
};

async function deployToNetwork(networkName: string) {
  const network = NETWORKS[networkName as keyof typeof NETWORKS];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}`);
  }

  console.log(`\n🚀 Starting deployment to ${network.name}...`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), network.currency);
  
  if (balance === 0n) {
    console.log(`⚠️  Warning: Account balance is 0. Get ${network.currency} from faucet: ${network.faucet}`);
  }
  
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
  console.log("✅ CustomERC20 deployed to:", tokenAddress);
  
  // Deploy Vault contract
  console.log("\n2. Deploying Vault contract...");
  const Vault = await ethers.getContractFactory("Vault");
  
  const vault = await Vault.deploy(
    tokenAddress,        // deposit token address
    network.priceFeed,   // price feed address
    deployer.address     // owner address
  );
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log("✅ Vault deployed to:", vaultAddress);
  
  // Wait for block confirmations
  console.log("\n3. Waiting for block confirmations...");
  await customERC20.deploymentTransaction()?.wait(3);
  await vault.deploymentTransaction()?.wait(3);
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    networkName: network.name,
    chainId: network.chainId,
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
        priceFeed: network.priceFeed
      }
    },
    faucet: network.faucet,
    explorer: network.explorer
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${networkName}-deployment.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\n🎉 Deployment to ${network.name} completed!`);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  console.log("CustomERC20:", tokenAddress);
  console.log("Vault:", vaultAddress);
  console.log(`Deployment info saved to: deployments/${networkName}-deployment.json`);
  
  return deploymentInfo;
}

async function main() {
  const networkName = process.env.HARDHAT_NETWORK;
  
  if (!networkName || networkName === "hardhat") {
    console.log("Please specify a network using --network flag");
    console.log("Available networks: fuji, sepolia, baseSepolia");
    process.exit(1);
  }
  
  try {
    const deployment = await deployToNetwork(networkName);
    
    console.log("\n📋 Next Steps:");
    console.log(`- Get ${NETWORKS[networkName as keyof typeof NETWORKS].currency} from faucet: ${deployment.faucet}`);
    console.log(`- Verify contracts on ${deployment.explorer}`);
    console.log("- Test token minting and vault deposits");
    console.log("- Update frontend with new contract addresses");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
