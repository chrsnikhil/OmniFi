// Quick test script to verify contract functions
const { ethers } = require('ethers');
require('dotenv').config();

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const VAULT_ABI = [
  "function getVolatilityInfo() view returns (uint256, uint256, uint256, bool)",
  "function getRebalanceInfo() view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getAllocationInfo() view returns (uint256, uint256, uint256, uint256)",
  "function getPriceHistory() view returns (int256[], uint256[])",
  "function checkUpkeep(bytes) view returns (bool, bytes)"
];

async function testContractFunctions() {
  console.log('🔍 Testing contract functions...');
  console.log('Vault Address:', VAULT_ADDRESS);
  console.log('RPC URL:', RPC_URL);
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);
  
  try {
    console.log('\n📊 Testing getVolatilityInfo...');
    const volatilityInfo = await contract.getVolatilityInfo();
    console.log('✅ getVolatilityInfo works:', volatilityInfo);
    
    console.log('\n🔄 Testing getRebalanceInfo...');
    const rebalanceInfo = await contract.getRebalanceInfo();
    console.log('✅ getRebalanceInfo works:', rebalanceInfo);
    
    console.log('\n💰 Testing getAllocationInfo...');
    const allocationInfo = await contract.getAllocationInfo();
    console.log('✅ getAllocationInfo works:', allocationInfo);
    
    console.log('\n📈 Testing getPriceHistory...');
    const priceHistory = await contract.getPriceHistory();
    console.log('✅ getPriceHistory works:', priceHistory);
    
    console.log('\n🤖 Testing checkUpkeep...');
    const upkeepInfo = await contract.checkUpkeep('0x');
    console.log('✅ checkUpkeep works:', upkeepInfo);
    
    console.log('\n🎉 All contract functions are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing contract functions:', error);
  }
}

testContractFunctions().catch(console.error);
