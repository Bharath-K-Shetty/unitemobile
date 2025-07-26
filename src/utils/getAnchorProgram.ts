import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import idl from '../idl/unite.json'; // replace with your actual path to the IDL

const programId = new PublicKey(idl.address);

// This is the custom anchor wallet that supports MWA
export async function createAnchorWallet(): Promise<Wallet> {
  const walletAddressStr = await SecureStore.getItemAsync('wallet_address');

  if (!walletAddressStr) {
    throw new Error('Missing wallet auth or address in SecureStore');
  }

  const publicKey = new PublicKey(walletAddressStr);

  return {
    get publicKey() {
      return publicKey;
    },

    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
      return await transact(async (wallet: Web3MobileWallet) => {
        const [signed] = await wallet.signTransactions({ transactions: [tx] });
        return signed;
      });
    },

    async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
      return await transact(async (wallet: Web3MobileWallet) => {
        return await wallet.signTransactions({ transactions: txs });
      });
    },

    // Dummy payer; not used since signing is delegated to mobile wallet
    payer: {} as Keypair
  };
}

export const getAnchorPrograms = async (connection: Connection) => {
  const anchorWallet = await createAnchorWallet();
  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: 'processed',
  });

  const program = new Program(idl as unknown as anchor.Idl, programId, provider);


  return {
    program,
    provider,
    anchorWallet,
  };
};
