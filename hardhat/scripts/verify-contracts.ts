import { run } from "hardhat";
import fs from "fs";
import path from "path";

interface DeploymentInfo {
  network: string;
  contracts: {
    CustomERC20: {
      address: string;
      name: string;
      symbol: string;
      initialSupply: string;
    };
    Vault: {
      address: string;
      depositToken: string;
      priceFeed: string;
    };
  };
  deployer: string;
}

async function verifyContract(
  contractAddress: string,
  constructorArguments: any[],
  contractName: string,
  networkName: string
) {
  try {
    console.log(`\n🔍 Verifying ${contractName} on ${networkName}...`);
    console.log(`Address: ${contractAddress}`);
    console.log(`Constructor args:`, constructorArguments);
    
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    
    console.log(`✅ ${contractName} verified successfully!`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log(`✅ ${contractName} is already verified!`);
    } else {
      console.error(`❌ Failed to verify ${contractName}:`, error.message);
    }
  }
}

async function verifyDeployment(networkName: string) {
  const deploymentPath = path.join(__dirname, `../deployments/${networkName}-deployment.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ Deployment file not found: ${deploymentPath}`);
    console.log("Please run deployment first:");
    console.log(`npx hardhat run scripts/deploy-multi-chain.ts --network ${networkName}`);
    return;
  }
  
  const deployment: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  console.log(`\n🚀 Starting contract verification for ${deployment.network}...`);
  
  // Verify CustomERC20
  await verifyContract(
    deployment.contracts.CustomERC20.address,
    [
      deployment.contracts.CustomERC20.name,
      deployment.contracts.CustomERC20.symbol,
      deployment.contracts.CustomERC20.initialSupply
    ],
    "CustomERC20",
    deployment.network
  );
  
  // Verify Vault
  await verifyContract(
    deployment.contracts.Vault.address,
    [
      deployment.contracts.Vault.depositToken,
      deployment.contracts.Vault.priceFeed,
      deployment.deployer
    ],
    "Vault",
    deployment.network
  );
}

async function main() {
  const networkName = process.env.HARDHAT_NETWORK;
  
  if (!networkName || networkName === "hardhat") {
    console.log("Please specify a network using --network flag");
    console.log("Available networks: fuji, sepolia, baseSepolia");
    process.exit(1);
  }
  
  await verifyDeployment(networkName);
  
  console.log("\n🎉 Verification completed!");
  console.log("\nNext steps:");
  console.log("- Check the contracts on the block explorer");
  console.log("- Test the contract functions");
  console.log("- Update your frontend with verified contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
