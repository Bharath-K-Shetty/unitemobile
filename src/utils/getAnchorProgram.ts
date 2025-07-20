import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import idl from '../idl/unite.json'; // replace with your actual path to the IDL
import { APP_IDENTITY } from '../lib/wallet/connectWallet'; // optional if using a predefined identity

const programId = new PublicKey(idl.address);

// This is the custom anchor wallet that supports MWA
const createAnchorWallet = async (): Promise<Wallet> => {
  let _publicKey: PublicKey | null = null;
  async function getAuthToken(): Promise<string> {
    const token = await SecureStore.getItemAsync('unite_auth_token');
    if (!token) {
      throw new Error("Missing auth token. Wallet not authorized yet.");
    }
    return token;
  }
  const token = await getAuthToken();
  return {
    get publicKey() {
      return _publicKey!;
    },

    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
      return await transact(async (wallet: Web3MobileWallet) => {
        const auth = await wallet.reauthorize({
          auth_token: token,
          identity: APP_IDENTITY,
        });

        _publicKey = new PublicKey(auth.accounts[0].address);
        const [signed] = await wallet.signTransactions({ transactions: [tx] });
        return signed;
      });
    },

    async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {

      return await transact(async (wallet: Web3MobileWallet) => {
        const auth = await wallet.reauthorize({
          auth_token: token,
          identity: APP_IDENTITY,
        });

        _publicKey = new PublicKey(auth.accounts[0].address);
        return await wallet.signTransactions({ transactions: txs });
      });
    },
    payer: Keypair.generate(),
  };
};

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
