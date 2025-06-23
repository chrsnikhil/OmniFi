import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("🚀 Deploying CCIPTokenRebalancer to Fuji...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  // Fuji CCIP Router address
  const CCIP_ROUTER_FUJI = "0x554472a2720e5e7d5d3c817529aba05eed5f82d8";

  const RebalancerFactory = await ethers.getContractFactory("CCIPTokenRebalancer");
  const rebalancer = await RebalancerFactory.deploy(CCIP_ROUTER_FUJI);
  await rebalancer.waitForDeployment();
  const rebalancerAddress = await rebalancer.getAddress();

  console.log("✅ CCIPTokenRebalancer deployed to:", rebalancerAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "fuji",
    deployer: deployer.address,
    contract: {
      CCIPTokenRebalancer: rebalancerAddress,
      ccipRouter: CCIP_ROUTER_FUJI
    },
    timestamp: new Date().toISOString(),
    txHash: rebalancer.deploymentTransaction()?.hash
  };
  writeFileSync(
    "deployments/fuji-ccip-rebalancer.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to: deployments/fuji-ccip-rebalancer.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 