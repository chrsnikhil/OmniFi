import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Redeploying CustomERC20 with mint functionality...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'AVAX');

  // Deploy CustomERC20 with mint function
  const CustomERC20 = await ethers.getContractFactory('CustomERC20');
  const customERC20 = await CustomERC20.deploy(
    'Carbon Credit Token',
    'CCT',
    ethers.parseEther('1000000') // 1M initial supply
  );

  await customERC20.waitForDeployment();
  const tokenAddress = await customERC20.getAddress();

  console.log('\n✅ CustomERC20 deployed successfully!');
  console.log('📍 Token Address:', tokenAddress);
  console.log('🌐 Explorer:', `https://testnet.snowtrace.io/address/${tokenAddress}`);

  // Update environment variables
  console.log('\n📝 Update your .env.local file:');
  console.log(`NEXT_PUBLIC_CUSTOM_ERC20_ADDRESS="${tokenAddress}"`);

  // Save deployment info
  const deploymentInfo = {
    network: 'fuji',
    chainId: 43113,
    deployer: deployer.address,
    contracts: {
      CustomERC20: {
        address: tokenAddress,
        name: 'Carbon Credit Token',
        symbol: 'CCT',
        initialSupply: '1000000'
      }
    },
    timestamp: new Date().toISOString(),
    txHash: customERC20.deploymentTransaction()?.hash
  };

  // You can save this to a file if needed
  console.log('\n📋 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
