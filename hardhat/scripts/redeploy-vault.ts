import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Redeploying Vault with new token address...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Contract addresses
  const tokenAddress = '0xbe0bE94e7537F4496bA2bB6a98B49819064A7A5A'; // New CCT token
  const priceFeedAddress = '0x86d67c3D38D2bCeE722E601025C25a575021c6EA'; // ETH/USD on Fuji

  // Deploy Vault
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy(
    tokenAddress,
    priceFeedAddress,
    deployer.address // owner
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log('\n✅ Vault deployed successfully!');
  console.log('📍 Vault Address:', vaultAddress);
  console.log('🌐 Explorer:', `https://testnet.snowtrace.io/address/${vaultAddress}`);

  // Update environment variables
  console.log('\n📝 Update your .env.local file:');
  console.log(`NEXT_PUBLIC_VAULT_ADDRESS="${vaultAddress}"`);

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
      },
      Vault: {
        address: vaultAddress,
        depositToken: tokenAddress,
        priceFeed: priceFeedAddress,
        owner: deployer.address
      }
    },
    timestamp: new Date().toISOString(),
    txHashes: {
      vault: vault.deploymentTransaction()?.hash
    }
  };

  console.log('\n📋 Updated Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
