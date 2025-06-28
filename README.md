# 🌍 OmniFi — Automated Cross-Chain RWA Vault  
### 🔗 Built for the Chainlink Chromium 2025 Hackathon

<a href="https://github.com/chrsnikhil/OmniFi/blob/main/public/icon.png">
  <img src="https://github.com/chrsnikhil/OmniFi/blob/main/public/icon.png?raw=true" width="400" alt="OmniFi Thumbnail"/>
</a>

---

## 🌐 Live Demo
🖥️ **Website**: [omni-fi-ruxn.vercel.app](https://omni-fi-ruxn.vercel.app/)  
💻 **GitHub**: [github.com/chrsnikhil/OmniFi](https://github.com/chrsnikhil/OmniFi)  
🎥 **Demo Video**: [YouTube - OmniFi Walkthrough](https://www.youtube.com/watch?v=p5QgPkqkzFU&t)

---

## 🧩 What Is OmniFi?

**OmniFi** is a cross-chain, smart vault system that lets you bring **real-world assets (RWAs)** like carbon credits into DeFi — with **automated rebalancing**, **live price feeds**, and **secure cross-chain transfers**.

OmniFi combines **Chainlink Automation**, **Data Feeds**, and **CCIP** to build an intelligent DeFi product that adapts to market volatility — and protects your assets.

> 🌱 Tokenize. Rebalance. Transfer.  
> Welcome to climate-friendly, risk-aware DeFi.

---

## 🎥 Walkthrough

1. Users connect MetaMask to OmniFi's frontend.
2. RWAs are tokenized into ERC-20 tokens on Avalanche Fuji (e.g., Carbon Credits).
3. Chainlink **Data Feeds** fetch real-time ETH prices to value deposits.
4. Vaults monitor a custom volatility index. If it exceeds 5%, 
5. Chainlink **Automation** triggers rebalancing across chains.
6. Users can also manually transfer assets across chains via Chainlink **CCIP**.
7. All movements are governed by a mint-and-burn model with strict access control.

---

## 🧠 Architecture Diagram

[![Architecture Diagram](https://github.com/chrsnikhil/OmniFi/blob/main/public/architecturediagram.png?raw=true)](https://github.com/chrsnikhil/OmniFi/blob/main/public/architecturediagram.png)

---

## 🛠️ Tech Stack

| Layer             | Stack Used                       |
|------------------|----------------------------------|
| Frontend         | Next.js, Tailwind CSS            |
| Smart Contracts  | Solidity (ERC-20)                |
| Vault Engine     | Chainlink Automation             |
| Cross-Chain Logic| Chainlink CCIP                   |
| Price Feeds      | Chainlink Data Feeds (ETH/USD)   |
| Chains           | Avalanche Fuji, Base Sepolia     |
| Wallets          | MetaMask                         |
| Explorer         | Snowtrace                        |

---

## 🔐 Core Features

- 🪙 **RWA Tokenization** – Mint custom ERC-20s on Avalanche.
- 💹 **Live Valuation** – ETH prices via Chainlink Data Feeds.
- 📉 **Volatility Detection** – Tracks ETH price swings.
- 🔄 **Automated Rebalancing** – Chainlink Automation kicks in above 5% volatility.
- 🔁 **Manual Transfers** – CCIP-powered mint & burn across Avalanche ↔ Base.
- 🔐 **Access Control** – Verified mint & burn with audit logs on Snowtrace.

---
## 📜 Smart Contracts Overview

| Contract | File | Chainlink Integration | Description |
|----------|-------|-----------------------|-------------|
| **Vault** | [Vault.sol](https://github.com/chrsnikhil/OmniFi/blob/main/hardhat/contracts/Vault.sol) | ⚙️ Automation<br>📊 Data Feeds | Handles deposits, tracks ETH/USD via Chainlink Data Feeds, automates rebalancing when volatility exceeds 5% using Automation. |
| **TransferCoordinator** | [TransferCoordinator.sol](https://github.com/chrsnikhil/OmniFi/blob/main/hardhat/contracts/TransferCoordinator.sol) | 🔗 Functions | Uses Chainlink Functions to fetch external yield data (via off-chain JavaScript). Coordinates secure cross-chain transfers. |

---

### 📊 Chainlink Data Feeds — `Vault.sol`
- `import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";`
- Uses `AggregatorV3Interface` for `priceFeed`.
- `getLatestPrice()` fetches `latestRoundData()`
- Dynamically adjusts deposit limits + calculates volatility.

---

### ⚙️ Chainlink Automation — `Vault.sol`
- `import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";`
- Implements `AutomationCompatibleInterface`
- `checkUpkeep()` monitors conditions
- `performUpkeep()` executes automated rebalancing

---

### 🔗 Chainlink Functions — `TransferCoordinator.sol`
- `import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";`
- `import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";`
- Extends `FunctionsClient`
- `_requestYieldData()` sends external data request
- `fulfillRequest()` handles callback
- `_getYieldFetchingSource()` contains the JS code for off-chain fetch

---

## ⚙️ Chainlink Service Flow

- 📡 **Data Feeds** track ETH/USD prices in real time.
- ⚠️ If volatility exceeds 5%, **Automation** initiates rebalancing across chains.
- 🌉 **CCIP(mimiced with chainlink functions)** allows cross-chain mint & burn operations with complete traceability.
- 🧠 All contracts governed by secure logic and event logging.

---

## 🌍 Why OmniFi?

| Problem                                | OmniFi’s Solution                    |
|----------------------------------------|--------------------------------------|
| ❌ RWAs disconnected from DeFi         | ✅ Smart tokenization on Avalanche   |
| ❌ No live valuation or risk logic     | ✅ Chainlink-powered pricing & risk  |
| ❌ Poor cross-chain support            | ✅ Secure CCIP mint-and-burn         |
| ❌ Manual DeFi operations              | ✅ Automated, AI-native vault logic  |

---

## 👨‍💻 Built By

- 🧠 **Chris Nikhil** – [@chrsnikhil](https://github.com/chrsnikhil)
- 🧠 **Aditya** – [@aditya](https://github.com/alienworld1)
- 🎨 UX by Team OmniFi
- 🤝 Built with 💙 at the Chainlink Chromium Hackathon

---

> Built for the Chainlink Hackathon Chromium 2025  
> Powered by Data Feeds, Automation, and CCIP  
> Bringing RWAs to the chains — securely, intelligently, and on your terms.
