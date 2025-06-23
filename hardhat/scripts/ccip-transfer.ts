import { ethers } from "hardhat";

async function main() {
  // ====== USER CONFIGURATION ======
  // Set these values before running the script
  const TOKEN_ADDRESS = "<TOKEN_ADDRESS_HERE>"; // ERC20 token on Fuji
  const REBALANCER_ADDRESS = "<REBALANCER_ADDRESS_HERE>"; // Deployed CCIPTokenRebalancer
  const RECEIVER = "<RECEIVER_ON_TARGET_CHAIN>"; // Address on destination chain
  const AMOUNT = ethers.parseEther("10"); // Amount to transfer (10 tokens)
  const DEST_CHAIN_SELECTOR = 14767482510784806043; // Example: Base Sepolia
  const GAS_LIMIT = 500_000; // Adjust as needed

  // ================================

  const [sender] = await ethers.getSigners();
  console.log("Using sender:", sender.address);

  // Get contract instances
  const token = await ethers.getContractAt("CustomERC20", TOKEN_ADDRESS);
  const rebalancer = await ethers.getContractAt("CCIPTokenRebalancer", REBALANCER_ADDRESS);

  // Approve the rebalancer to spend tokens if needed
  const allowance = await token.allowance(sender.address, REBALANCER_ADDRESS);
  if (allowance < AMOUNT) {
    console.log("Approving rebalancer to spend tokens...");
    const approveTx = await token.approve(REBALANCER_ADDRESS, AMOUNT);
    await approveTx.wait();
    console.log("Approved.");
  } else {
    console.log("Sufficient allowance already set.");
  }

  // Estimate fee
  console.log("Estimating CCIP fee...");
  const fee = await rebalancer.getRebalanceFee(
    DEST_CHAIN_SELECTOR,
    TOKEN_ADDRESS,
    RECEIVER,
    AMOUNT,
    GAS_LIMIT
  );
  console.log("Estimated fee:", ethers.formatEther(fee), "AVAX");

  // Call rebalanceTokens
  console.log("Calling rebalanceTokens...");
  const tx = await rebalancer.rebalanceTokens(
    TOKEN_ADDRESS,
    DEST_CHAIN_SELECTOR,
    RECEIVER,
    AMOUNT,
    GAS_LIMIT,
    { value: fee }
  );
  const receipt = await tx.wait();
  if (!receipt) {
    console.error("❌ Transaction receipt is null.");
    process.exit(1);
  }
  console.log("Transaction hash:", receipt.hash);

  // Parse event for messageId
  const event = receipt.logs
    .map((log: any) => {
      try {
        return rebalancer.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e && e.name === "TokensRebalanced");
  if (event) {
    console.log("CCIP Message ID:", event.args.messageId);
  } else {
    console.log("TokensRebalanced event not found in logs.");
  }

  console.log("✅ Cross-chain transfer initiated!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Transfer failed:", error);
    process.exit(1);
  }); 