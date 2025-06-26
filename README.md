# 🌍 OmniFi — Automated Cross-Chain RWA Vault  
### 🔗 Built for the Chainlink Spring 2025 Hackathon

[![OmniFi Thumbnail](https://github.com/chrsnikhil/OmniFi/blob/main/public/thumbnail.png?raw=true)](https://www.youtube.com/watch?v=YOUR_VIDEO_LINK)

---

## 🌐 Live Demo

- 🖥️ **Website**: [omni-fi-ruxn.vercel.app](https://omni-fi-ruxn.vercel.app/)
- 💻 **GitHub**: [github.com/chrsnikhil/OmniFi](https://github.com/chrsnikhil/OmniFi)

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

## ⚙️ Chainlink Service Flow

- 📡 **Data Feeds** track ETH/USD prices in real time.
- ⚠️ If volatility exceeds 5%, **Automation** initiates rebalancing across chains.
- 🌉 **CCIP** allows cross-chain mint & burn operations with complete traceability.
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
- 🎨 UX by Team OmniFi
- 🤝 Built with 💙 at the Chainlink Spring Hackathon

---

> Built for the Chainlink Hackathon Spring 2025  
> Powered by Data Feeds, Automation, and CCIP  
> Bringing RWAs to the chains — securely, intelligently, and on your terms.
