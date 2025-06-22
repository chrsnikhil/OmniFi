import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying contracts locally for testing...");
  
  // Get the deployer account
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy CustomERC20 token
  console.log("\n1. Deploying CustomERC20 token...");
  const CustomERC20 = await ethers.getContractFactory("CustomERC20");
  const customErc20 = await CustomERC20.deploy("Carbon Credit Token", "CCT", ethers.parseEther("1000000"));
  await customErc20.waitForDeployment();
  console.log("CustomERC20 deployed to:", await customErc20.getAddress());
  
  // Deploy MockPriceFeed
  console.log("\n2. Deploying MockPriceFeed...");
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const mockPriceFeed = await MockPriceFeed.deploy(200000000000); // $2000 USD
  await mockPriceFeed.waitForDeployment();
  console.log("MockPriceFeed deployed to:", await mockPriceFeed.getAddress());
  
  // Deploy Vault
  console.log("\n3. Deploying Vault contract...");
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    await customErc20.getAddress(),
    await mockPriceFeed.getAddress(),
    deployer.address
  );
  await vault.waitForDeployment();
  console.log("Vault deployed to:", await vault.getAddress());
  
  // Transfer tokens to users
  console.log("\n4. Setting up test accounts...");
  await customErc20.transfer(user1.address, ethers.parseEther("10000"));
  await customErc20.transfer(user2.address, ethers.parseEther("10000"));
  console.log("Transferred 10,000 CCT to user1:", user1.address);
  console.log("Transferred 10,000 CCT to user2:", user2.address);
  
  // Demonstrate functionality
  console.log("\n5. Testing vault functionality...");
  
  // Check initial price and deposit limit
  const initialPrice = await vault.getLatestPrice();
  const initialLimit = await vault.getCurrentDepositLimit();
  console.log("Initial Price: $" + (Number(initialPrice) / 1e8).toFixed(2));
  console.log("Initial Deposit Limit:", ethers.formatEther(initialLimit), "CCT");
  
  // Test deposit from user1
  const depositAmount = ethers.parseEther("500");
  await customErc20.connect(user1).approve(await vault.getAddress(), depositAmount);
  await vault.connect(user1).deposit(depositAmount);
  console.log("User1 deposited 500 CCT");
  
  // Check vault status
  const vaultStatus = await vault.getVaultStatus();
  console.log("Total Vault Deposits:", ethers.formatEther(vaultStatus.totalVaultDeposits), "CCT");
  
  // Test price change - increase price
  console.log("\n6. Testing price changes...");
  await mockPriceFeed.updatePrice(250000000000); // $2500 USD
  const newPrice = await vault.getLatestPrice();
  const newLimit = await vault.getCurrentDepositLimit();
  console.log("New Price: $" + (Number(newPrice) / 1e8).toFixed(2));
  console.log("New Deposit Limit:", ethers.formatEther(newLimit), "CCT");
  
  // Test higher deposit with increased limit
  const higherDeposit = ethers.parseEther("1000");
  await customErc20.connect(user1).approve(await vault.getAddress(), higherDeposit);
  await vault.connect(user1).deposit(higherDeposit);
  console.log("User1 deposited additional 1000 CCT (higher limit allows this)");
  
  // Test price decrease
  await mockPriceFeed.updatePrice(150000000000); // $1500 USD
  const lowPrice = await vault.getLatestPrice();
  const lowLimit = await vault.getCurrentDepositLimit();
  console.log("Low Price: $" + (Number(lowPrice) / 1e8).toFixed(2));
  console.log("Low Deposit Limit:", ethers.formatEther(lowLimit), "CCT");
  
  // Test withdrawal
  console.log("\n7. Testing withdrawal...");
  const withdrawAmount = ethers.parseEther("200");
  await vault.connect(user1).withdraw(withdrawAmount);
  console.log("User1 withdrew 200 CCT");
  
  // Final status
  const finalUserInfo = await vault.getUserInfo(user1.address);
  const finalVaultStatus = await vault.getVaultStatus();
  
  console.log("\n8. Final Status:");
  console.log("=".repeat(50));
  console.log("User1 Vault Balance:", ethers.formatEther(finalUserInfo.depositAmount), "CCT");
  console.log("Total Vault Deposits:", ethers.formatEther(finalVaultStatus.totalVaultDeposits), "CCT");
  console.log("Current Price: $" + (Number(finalVaultStatus.currentPrice) / 1e8).toFixed(2));
  console.log("Current Deposit Limit:", ethers.formatEther(finalVaultStatus.currentDepositLimit), "CCT");
  
  console.log("\n🎉 Local testing complete!");
  console.log("=".repeat(50));
  console.log("Contract Addresses:");
  console.log("- CustomERC20:", await customErc20.getAddress());
  console.log("- MockPriceFeed:", await mockPriceFeed.getAddress());
  console.log("- Vault:", await vault.getAddress());
  console.log("\nYou can now interact with these contracts using the Hardhat console:");
  console.log("npx hardhat console");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Local deployment failed:", error);
    process.exit(1);
  });
