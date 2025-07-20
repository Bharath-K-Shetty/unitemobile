import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import base64 from 'base64-js';
import * as SecureStore from 'expo-secure-store';

export const APP_IDENTITY = {
  name: 'Unite',
  uri: 'uniteapp://',
};



export async function connectToWallet(): Promise<PublicKey | null> {

  try {
    const existingToken = await SecureStore.getItemAsync('unite_auth_token');
    console.log('Existing token:', existingToken);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const authResult = await transact(async (wallet: Web3MobileWallet) => {
      try {
        if (existingToken) {
          console.log('🔁 Trying reauthorize...');
          return await wallet.reauthorize({
            auth_token: existingToken,
            identity: APP_IDENTITY,
          });

        } else {
          console.log('🔓 No token, fresh authorize...');
          return await wallet.authorize({
            chain: 'solana:devnet',
            identity: APP_IDENTITY,
          });
        }
      } catch (err) {
        console.warn('❌ Reauthorize failed, falling back to fresh authorize...', err);
        return await wallet.authorize({
          chain: 'solana:devnet',
          identity: APP_IDENTITY,
        });
      }
    });

    const base64Address = authResult.accounts[0].address;
    console.log('📦 Raw address (Base64):', base64Address);

    const decodedAddress = base64.toByteArray(base64Address);
    const walletAddress = new PublicKey(decodedAddress);
    console.log('✅ Wallet address:', walletAddress.toBase58());
    await SecureStore.setItemAsync('wallet_address', walletAddress.toBase58());
    if (authResult.auth_token) {
      await SecureStore.setItemAsync('unite_auth_token', authResult.auth_token);
      console.log('🔐 Saved auth_token to SecureStore.');
    }

    return walletAddress;
  } catch (err) {
    console.error('🚨 Wallet connection failed:', err);
    return null;
  }
}
