import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

import { PublicKey } from '@solana/web3.js';

import base64 from 'base64-js';

export const APP_IDENTITY = {
  name: 'Unite',
  uri: 'uniteapp://',  // Your app domain or placeholder
  icon: 'favicon.ico', // Optional
};

export async function connectToWallet() {
  try {
    const authResult = await transact(async (wallet: Web3MobileWallet) => {
      const result = await wallet.authorize({
        chain: 'solana:devnet',
        identity: APP_IDENTITY,
      });

      return result;
    });
    const base64Address = authResult.accounts[0].address;
    console.log('Raw address (Base64):', base64Address);

    // Decode Base64 string into Uint8Array
    const decodedAddress = base64.toByteArray(base64Address);

    // Construct PublicKey from Uint8Array
    const walletAddress = new PublicKey(decodedAddress);
    console.log("Wallet address is", walletAddress);

    return walletAddress;
  } catch (err) {
    console.error('Wallet connection failed:', err);
    return null;
  }
}
