# OmniFi - RWA Tokenization & DeFi Vault

A blockchain-based platform for tokenizing Real World Assets (RWA) with automated yield optimization using Chainlink Data Feeds. Built for the Chainlink Hackathon.

## 🌟 Overview

OmniFi enables the tokenization of real-world assets (like carbon credits) into ERC-20 tokens and provides a DeFi vault with dynamic deposit limits based on real-time price data from Chainlink oracles.

### Key Features

- **RWA Tokenization**: Convert real-world assets into ERC-20 tokens
- **Dynamic Deposit Limits**: Vault deposit limits adjust based on Chainlink price feeds
- **Price-Based Risk Management**: Higher prices = higher deposit limits, lower prices = reduced limits
- **Transparent & Decentralized**: Built on Avalanche Fuji testnet with Chainlink integration

## 🛠 Tech Stack

- **Smart Contracts**: Solidity, OpenZeppelin, Chainlink
- **Blockchain**: Avalanche Fuji Testnet
- **Development**: Hardhat, TypeScript
- **Oracles**: Chainlink Data Feeds (ETH/USD)
- **Frontend**: Next.js, Tailwind CSS (planned)

## 📋 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CustomERC20   │    │      Vault      │    │ Chainlink Feed  │
│  (CCT Token)    │◄───┤   Contract      │◄───┤   (ETH/USD)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │ Deposit/Withdraw│    │  Price Updates  │
│   (MetaMask)    │    │   Functions     │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MetaMask wallet
- AVAX testnet tokens (from faucet)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OmniFi/hardhat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your private key
   ```

4. **Get testnet AVAX**
   - Visit: https://faucet.avax.network/
   - Use code: `avalanche-academy`

### Deployment

1. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

2. **Run tests**
   ```bash
   npx hardhat test
   ```

3. **Deploy to Fuji**
   ```bash
   npx hardhat run scripts/deploy.ts --network fuji
   ```

4. **Interact with contracts**
   ```bash
   npx hardhat run scripts/interact.ts --network fuji
   ```

## 📖 Contract Details

### CustomERC20 Token (CCT)
- **Name**: Carbon Credit Token
- **Symbol**: CCT
- **Decimals**: 18
- **Initial Supply**: 1,000,000 CCT

### Vault Contract
- **Base Deposit Limit**: 1,000 CCT
- **Price Threshold**: $2,000 USD
- **High Price Multiplier**: 2x (2,000 CCT limit)
- **Low Price Multiplier**: 0.5x (500 CCT limit)

### Chainlink Integration
- **Price Feed**: ETH/USD on Avalanche Fuji
- **Address**: `0x86d67c3D38D2bCeE722E601025C25a575021c6EA`
- **Update Frequency**: Real-time via Chainlink nodes

## 🔧 Available Functions

### User Functions
- `deposit(uint256 amount)` - Deposit CCT tokens to vault
- `withdraw(uint256 amount)` - Withdraw CCT tokens from vault
- `getUserInfo(address user)` - Get user deposit information
- `getVaultStatus()` - Get current vault status and price

### View Functions
- `getLatestPrice()` - Get current ETH/USD price
- `getCurrentDepositLimit()` - Get current deposit limit based on price

### Owner Functions
- `updateBaseDepositLimit(uint256)` - Update base deposit limit
- `updatePriceThreshold(uint256)` - Update price threshold
- `updateMultipliers(uint256, uint256)` - Update price multipliers

## 🧪 Testing

The project includes comprehensive tests covering:

- Token deployment and transfers
- Vault deposit/withdrawal functionality
- Price-based deposit limit calculations
- Owner functions and access control
- Error handling and edge cases

Run tests with:
```bash
npx hardhat test
```

## 🌐 Network Information

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/ (code: avalanche-academy)

## 🔗 Chainlink Services Used

1. **Data Feeds**: ETH/USD price feed for dynamic deposit limits
2. **Future Integration**: Automation for automatic rebalancing
3. **Future Integration**: CCIP for cross-chain transfers

## 🛡 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **SafeERC20**: Safe token transfers
- **Input Validation**: Comprehensive parameter checking

## 📊 Example Usage

```solidity
// Deploy contracts
CustomERC20 token = new CustomERC20("Carbon Credit Token", "CCT", 1000000e18);
Vault vault = new Vault(address(token), priceFeedAddress, owner);

// User interactions
token.approve(address(vault), 100e18);
vault.deposit(100e18);

// Check current status
uint256 price = vault.getLatestPrice();
uint256 limit = vault.getCurrentDepositLimit();
```

## 🚧 Future Enhancements

- **Chainlink Automation**: Automatic vault rebalancing
- **Cross-Chain**: CCIP integration for multi-chain support
- **Frontend**: React/Next.js user interface
- **Advanced RWA**: Support for multiple asset types
- **Yield Strategies**: Integration with DeFi protocols

## 📄 License

This project is open source and available under the [MIT License](./LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please create an issue in the repository.

---

Built with ❤️ for the Chainlink Hackathonhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
