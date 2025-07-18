import { PublicKey } from '@solana/web3.js';
import React, { createContext, useContext, useState } from 'react';

type WalletContextType = {
  publicKey: PublicKey | null;
  setPublicKey: (key: PublicKey | null) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  return (
    <WalletContext.Provider value={{ publicKey, setPublicKey }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useUniteWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
