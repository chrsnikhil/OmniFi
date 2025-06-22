"use client";
import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = "cmc7oqljm00tzl20l2wd21q37";

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          logo: "/icon.png",
          showWalletLoginFirst: true,
          walletList: [
            "detected_ethereum_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
            "phantom",
            "zerion",
            "cryptocom",
            "uniswap",
            "okx_wallet",
            "universal_profile",
            "rabby_wallet",
            "bybit_wallet",
            "ronin_wallet",
            "haha_wallet",
            "safe",
            "solflare",
            "backpack",
            "binance"
          ],
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: "all"
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
