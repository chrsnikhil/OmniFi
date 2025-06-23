import { ethers } from "hardhat";
import { CCIPTokenRebalancer, CustomERC20 } from "../typechain-types";

// Chainlink CCIP Router addresses and chain selectors
const FUJI_CCIP_ROUTER = "0x554472a2720e5e7d5d3c817529aba05eed5f82d8";
const BASE_SEPOLIA_SELECTOR = "14767482510784806043";
const DEFAULT_GAS_LIMIT = 200000; // 200k gas limit for destination chain execution

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // 1. Deploy the test token (CustomERC20)
  console.log("\nDeploying test token...");
  const CustomERC20Factory = await ethers.getContractFactory("CustomERC20");
  const testToken = await CustomERC20Factory.deploy(
    "Test Token",
    "TEST",
    ethers.parseEther("10000") // 10,000 initial supply
  );
  await testToken.waitForDeployment();
  console.log("Test token deployed to:", await testToken.getAddress());

  // 2. Deploy the CCIP Rebalancer
  console.log("\nDeploying CCIPTokenRebalancer...");
  const RebalancerFactory = await ethers.getContractFactory("CCIPTokenRebalancer");
  const rebalancer = await RebalancerFactory.deploy(FUJI_CCIP_ROUTER);
  await rebalancer.waitForDeployment();
  console.log("CCIPTokenRebalancer deployed to:", await rebalancer.getAddress());

  // 3. Mint some tokens to the deployer
  console.log("\nMinting test tokens...");
  const mintAmount = ethers.parseEther("100"); // 100 tokens
  await testToken.mint(deployer.address, mintAmount);
  console.log("Minted", ethers.formatEther(mintAmount), "tokens to", deployer.address);

  // 4. Approve Rebalancer to spend tokens
  console.log("\nApproving Rebalancer to spend tokens...");
  await testToken.approve(await rebalancer.getAddress(), mintAmount);
  console.log("Approved!");

  // 5. Get the fee for the transfer
  console.log("\nCalculating CCIP fee...");
  const amountToSend = ethers.parseEther("10"); // Sending 10 tokens
  const fee = await rebalancer.getRebalanceFee(
    BASE_SEPOLIA_SELECTOR,
    await testToken.getAddress(),
    deployer.address, // sending to same address on destination chain
    amountToSend,
    DEFAULT_GAS_LIMIT
  );
  console.log("CCIP fee:", ethers.formatEther(fee), "AVAX");

  // 6. Send tokens cross-chain
  console.log("\nSending tokens cross-chain...");
  try {
    const tx = await rebalancer.rebalanceTokens(
      await testToken.getAddress(),
      BASE_SEPOLIA_SELECTOR,
      deployer.address,
      amountToSend,
      DEFAULT_GAS_LIMIT,
      { value: fee * BigInt(2) } // Adding buffer for fee fluctuation
    );

    console.log("Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    
    // Get the messageId from the event
    const event = receipt?.logs
      .map(log => {
        try {
          return rebalancer.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .find(event => event?.name === "TokensRebalanced");

    if (event) {
      console.log("\nCCIP transfer initiated!");
      console.log("- MessageId:", event.args.messageId);
      console.log("- From:", deployer.address);
      console.log("- To:", deployer.address);
      console.log("- Amount:", ethers.formatEther(amountToSend), "tokens");
      console.log("- Destination Chain: Base Sepolia");
      console.log("\nTrack your transfer at https://ccip.chain.link");
    }
    
  } catch (error) {
    console.error("Error sending tokens:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 