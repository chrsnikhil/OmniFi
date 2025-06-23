// Script to simulate price volatility for demonstration purposes
// This will update volatility multiple times to create price history and trigger rebalancing conditions

const { ethers } = require('hardhat');

async function main() {
  console.log('🎯 Simulating Price Volatility for Rebalancing Demo...\n');

  // Get contract instances
  const vaultAddress = process.env.VAULT_ADDRESS || "0x8A65054F8c6C48A30dA97C03cA19fcb3147900Ef";
  const mockPriceFeedAddress = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA"; // MockPriceFeed address
  
  const vault = await ethers.getContractAt('Vault', vaultAddress);
  const mockPriceFeed = await ethers.getContractAt('MockPriceFeed', mockPriceFeedAddress);
  
  const [signer] = await ethers.getSigners();
  console.log('Using account:', signer.address);
  
  try {
    // First, let's check current status
    console.log('📊 Current Vault Status:');
    const [currentVolatility, priceCount, lastUpdate, canUpdate] = await vault.getVolatilityInfo();
    console.log(`Current Volatility: ${currentVolatility} / 10000 (${(currentVolatility / 100).toFixed(2)}%)`);
    console.log(`Price History Count: ${priceCount}`);
    console.log(`Can Update: ${canUpdate}`);
    
    const currentPrice = await vault.getLatestPrice();
    console.log(`Current Price: $${(Number(currentPrice) / 1e8).toFixed(2)}\n`);
    
    // Simulate price changes by updating the MockPriceFeed
    const currentPriceBigInt = await vault.getLatestPrice();
    const basePriceInt = Number(currentPriceBigInt);
    const priceVariations = [
      BigInt(basePriceInt + 15000000000), // +$150 increase
      BigInt(basePriceInt - 20000000000), // -$200 decrease  
      BigInt(basePriceInt + 25000000000), // +$250 increase
      BigInt(basePriceInt - 10000000000), // -$100 decrease
      BigInt(basePriceInt + 30000000000), // +$300 increase
    ];
    
    console.log('💫 Simulating price variations to create volatility...\n');
    
    for (let i = 0; i < priceVariations.length; i++) {
      console.log(`Step ${i + 1}: Setting price to $${(Number(priceVariations[i]) / 1e8).toFixed(2)}`);
      
      // Update mock price feed
      const updatePriceTx = await mockPriceFeed.updateAnswer(priceVariations[i]);
      await updatePriceTx.wait();
      console.log(`✅ Mock price updated`);
      
      // Wait a moment to ensure different block timestamps
      console.log('⏳ Waiting 2 seconds for next update...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update vault volatility
      try {
        const updateVolatilityTx = await vault.updateVolatilityIndex();
        await updateVolatilityTx.wait();
        console.log(`✅ Volatility updated`);
      } catch (error) {
        console.log(`⚠️  Volatility update skipped (cooldown active)`);
      }
      
      // Check new volatility
      const [newVolatility, newPriceCount] = await vault.getVolatilityInfo();
      console.log(`New Volatility: ${newVolatility} / 10000 (${(newVolatility / 100).toFixed(2)}%)`);
      console.log(`Price History Count: ${newPriceCount}\n`);
    }
    
    // Final status check
    console.log('🎉 Final Status Check:');
    const [finalVolatility, finalPriceCount, , canUpdateFinal] = await vault.getVolatilityInfo();
    const [threshold, lastRebalance, rebalanceCount] = await vault.getRebalanceInfo();
    
    console.log(`Final Volatility: ${finalVolatility} / 10000 (${(finalVolatility / 100).toFixed(2)}%)`);
    console.log(`Rebalance Threshold: ${threshold} / 10000 (${(threshold / 100).toFixed(2)}%)`);
    console.log(`Price History Count: ${finalPriceCount}`);
    console.log(`Rebalance Count: ${rebalanceCount}`);
    
    // Check if rebalancing conditions are now met
    const [upkeepNeeded] = await vault.checkUpkeep('0x');
    console.log(`Upkeep Needed: ${upkeepNeeded}`);
    
    if (upkeepNeeded) {
      console.log('\n🚀 Rebalancing conditions are now met! You can trigger manual rebalance.');
      
      // Attempt manual rebalance
      console.log('🔄 Attempting manual rebalance...');
      try {
        const rebalanceTx = await vault.manualRebalance();
        await rebalanceTx.wait();
        console.log('✅ Manual rebalance successful!');
        
        // Check new allocation
        const [conservative, moderate, aggressive] = await vault.getAllocationInfo();
        console.log('\n💰 New Allocation:');
        console.log(`Conservative: ${(conservative / 100).toFixed(1)}%`);
        console.log(`Moderate: ${(moderate / 100).toFixed(1)}%`);
        console.log(`Aggressive: ${(aggressive / 100).toFixed(1)}%`);
        
      } catch (error: any) {
        console.log('❌ Manual rebalance failed:', error.message);
      }
    } else {
      console.log('\n⏳ Rebalancing conditions still not met.');
      console.log('   - Need volatility ≥ 5% and ≥ 3 price history entries');
      console.log('   - Try running this script again or wait for more time to pass');
    }
    
  } catch (error) {
    console.error('❌ Error in simulation:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
