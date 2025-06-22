const { ethers } = require('ethers');

async function checkContracts() {
  const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
  
  const addresses = {
    'Custom ERC20': '0xd2DE2Baf35A1f7882c14d9Ed759D346df54460b3',
    'Vault': '0x4c09df45e969aB918739C500E3B402ceB5C739c8'
  };

  console.log('🔍 Checking contract deployments on Avalanche Fuji...\n');

  for (const [name, address] of Object.entries(addresses)) {
    try {
      const code = await provider.getCode(address);
      
      if (code === '0x') {
        console.log(`❌ ${name}: No contract found at ${address}`);
      } else {
        console.log(`✅ ${name}: Contract found at ${address}`);
        console.log(`   Code length: ${code.length} characters`);
        
        // Try to call a basic function
        if (name === 'Custom ERC20') {
          try {
            const contract = new ethers.Contract(address, [
              "function name() view returns (string)",
              "function symbol() view returns (string)"
            ], provider);
            
            const [tokenName, symbol] = await Promise.all([
              contract.name(),
              contract.symbol()
            ]);
            
            console.log(`   Token Name: ${tokenName}`);
            console.log(`   Symbol: ${symbol}`);
          } catch (e) {
            console.log(`   ⚠️  Could not read token info: ${e.message}`);
          }
        }
      }
      
      console.log(`   Explorer: https://testnet.snowtrace.io/address/${address}\n`);
    } catch (error) {
      console.log(`❌ ${name}: Error checking contract - ${error.message}\n`);
    }
  }
}

checkContracts().catch(console.error);
