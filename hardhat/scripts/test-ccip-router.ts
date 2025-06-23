import { ethers } from "hardhat";
import { FlexibleCCIPRouter, CustomERC20 } from "../typechain-types";

// Chainlink CCIP Router addresses
const FUJI_CCIP_ROUTER = "0x554472a2720e5e7d5d3c817529aba05eed5f82d8"; // Fuji
const BASE_SEPOLIA_SELECTOR = "5790810961207155433"; // Base Sepolia chain selector

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

  // 2. Deploy the CCIP Router
  console.log("\nDeploying FlexibleCCIPRouter...");
  const CCIPRouterFactory = await ethers.getContractFactory("FlexibleCCIPRouter");
  const ccipRouter = await CCIPRouterFactory.deploy(FUJI_CCIP_ROUTER);
  await ccipRouter.waitForDeployment();
  console.log("CCIP Router deployed to:", await ccipRouter.getAddress());

  // 3. Mint some tokens to the deployer
  console.log("\nMinting test tokens...");
  const mintAmount = ethers.parseEther("100"); // 100 tokens
  await testToken.mint(deployer.address, mintAmount);
  console.log("Minted", ethers.formatEther(mintAmount), "tokens to", deployer.address);

  // 4. Approve CCIP Router to spend tokens
  console.log("\nApproving CCIP Router to spend tokens...");
  await testToken.approve(await ccipRouter.getAddress(), mintAmount);
  console.log("Approved!");

  // 5. Send tokens cross-chain
  console.log("\nSending tokens cross-chain...");
  const destinationAddress = deployer.address; // Using same address on destination chain
  const amountToSend = ethers.parseEther("10"); // Sending 10 tokens

  try {
    const tx = await ccipRouter.sendTokensCrossChain(
      await testToken.getAddress(), // token address
      BASE_SEPOLIA_SELECTOR, // destination chain
      destinationAddress, // receiver address
      amountToSend, // amount
      ethers.ZeroAddress, // using native token for fees
      { value: ethers.parseEther("0.1") } // 0.1 AVAX for CCIP fees
    );

    console.log("Transaction submitted:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed!");
    
    console.log("\nCCIP transfer initiated!");
    console.log("- From:", deployer.address);
    console.log("- To:", destinationAddress);
    console.log("- Amount:", ethers.formatEther(amountToSend), "tokens");
    console.log("- Destination Chain: Base Sepolia");
    
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