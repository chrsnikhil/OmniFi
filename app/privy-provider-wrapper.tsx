"use client";
import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = "cmc7oqljm00tzl20l2wd21q37"; // <-- put this at the top, outside the component

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#4a90e2',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}