import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying CCIPTokenReceiver to Base Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Base Sepolia CCIP Router address (update if needed)
  const CCIP_ROUTER_BASE_SEPOLIA = "0x88E492127709447A5ABEFdaB8788a15B4567589E";
  // Fuji contract address as trusted sender (update with your deployed address)
  const TRUSTED_SENDER = "0x0B5b74c6Bed3deC975cEF47E5BFC9110F0816f77";
  // Fuji chain selector
  const TRUSTED_SOURCE_CHAIN_SELECTOR = "43113"; // Fuji chain selector (double check this value)

  // Deploy CustomERC20 on destination if needed
  console.log("\n📄 Deploying CustomERC20 (Carbon Token) on destination...");
  const CustomERC20Factory = await ethers.getContractFactory("CustomERC20");
  const carbonToken = await CustomERC20Factory.deploy(
    "Carbon Credit Token",
    "CCT",
    ethers.parseEther("1000000")
  );
  await carbonToken.waitForDeployment();
  const tokenAddress = await carbonToken.getAddress();
  console.log("✅ Carbon Token deployed to:", tokenAddress);

  // Deploy CCIPTokenReceiver
  console.log("\n🏛️ Deploying CCIPTokenReceiver...");
  const ReceiverFactory = await ethers.getContractFactory("CCIPTokenReceiver");
  const receiver = await ReceiverFactory.deploy(
    CCIP_ROUTER_BASE_SEPOLIA,
    tokenAddress,
    TRUSTED_SENDER,
    TRUSTED_SOURCE_CHAIN_SELECTOR
  );
  await receiver.waitForDeployment();
  const receiverAddress = await receiver.getAddress();
  console.log("✅ CCIPTokenReceiver deployed to:", receiverAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "base-sepolia",
    deployer: deployer.address,
    contracts: {
      CustomERC20: tokenAddress,
      CCIPTokenReceiver: receiverAddress,
      ccipRouter: CCIP_ROUTER_BASE_SEPOLIA,
      trustedSender: TRUSTED_SENDER,
      trustedSourceChainSelector: TRUSTED_SOURCE_CHAIN_SELECTOR
    },
    timestamp: new Date().toISOString(),
    txHashes: {
      token: carbonToken.deploymentTransaction()?.hash,
      receiver: receiver.deploymentTransaction()?.hash
    }
  };
  writeFileSync(
    "deployments/base-sepolia-ccip-receiver.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to: deployments/base-sepolia-ccip-receiver.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 