import { getAnchorPrograms } from "@/utils/getAnchorProgram";
import { BN } from "@coral-xyz/anchor";
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import * as SecureStore from "expo-secure-store";
import rawIdl from "../idl/unite.json";
import { APP_IDENTITY } from "../lib/wallet/connectWallet";

const programId = new PublicKey(rawIdl.address);
console.log("program id is", programId);

function getOrganizerPDA(authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("organizer"), authority.toBuffer()],
    programId
  );
}

function getEventPDA(authority: PublicKey, eventCount: number) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("event"),
      authority.toBuffer(),
      Buffer.from(new BN(eventCount).toArray("le", 4)),
    ],
    programId
  );
}

export async function initOrganizer(connection: Connection, authorizeSession: (wallet: Web3MobileWallet) => Promise<void>) {
  const { program } = await getAnchorPrograms(connection);
  await transact(async (wallet) => {
    const walletadd = await SecureStore.getItemAsync("wallet_address");

    if (!walletadd) {
      throw new Error("Publickey not found");
    }
    console.log("authority is", walletadd);
    const authority = new PublicKey(walletadd);
    const [organizerPda] = getOrganizerPDA(authority);
    try {
      const existing = await program.account.organizerAccount.fetch(organizerPda);
      console.log("⚠️ Organizer already initialized:", existing);
      return;
    } catch (e) {
      console.log("✅ Organizer not initialized yet, continuing...");
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const initIx = await program.methods
      .initializeOrganizer()
      .accounts({
        organizer: organizerPda,
        authority,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const message = new TransactionMessage({
      payerKey: authority,
      recentBlockhash: blockhash,
      instructions: [initIx],
    }).compileToV0Message();

    const versionedTx = new VersionedTransaction(message);
    await authorizeSession(wallet);
    const [sig] = await wallet.signAndSendTransactions({ transactions: [versionedTx] });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
  });

}
export async function createEvent(connection: Connection, params: {
  eventName: string;
  description: string;
  deadline: number;
  feeLamports: number;
  quorum: number;
  capacity: number;
}) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;
  const [organizerPda] = getOrganizerPDA(authority);

  const organizer = await program.account.organizer.fetch(organizerPda);
  const eventCount = (organizer as any).eventCount.toNumber();
  const [eventPda] = getEventPDA(authority, eventCount);

  await transact(async (wallet: Web3MobileWallet) => {
    const storedToken = await SecureStore.getItemAsync("unite_auth_token");
    const auth = await wallet.authorize({
      chain: "solana:devnet",
      identity: APP_IDENTITY,
      auth_token: storedToken || undefined,
    });
    await SecureStore.setItemAsync("unite_auth_token", auth.auth_token);

    const { blockhash } = await connection.getLatestBlockhash();
    console.log("creating tx and blockhash is ", blockhash);
    const createIx = await program.methods
      .createEvent(
        params.eventName,
        params.description,
        new BN(params.deadline),
        new BN(params.feeLamports),
        new BN(params.quorum),
        new BN(params.capacity)
      )
      .accounts({
        organizer: organizerPda,
        event: eventPda,
        authority,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const msg = new TransactionMessage({
      payerKey: authority,
      recentBlockhash: blockhash,
      instructions: createIx.instructions,
    }).compileToV0Message();
    const slot = await connection.getSlot();

    const tx = new VersionedTransaction(msg);
    console.log("Transaction is", tx);
    const sigs = await wallet.signAndSendTransactions({
      transactions: [tx],
      minContextSlot: slot
    });

    await connection.confirmTransaction(sigs[0], "confirmed");
    console.log("🎉 Event created:", sigs[0]);
  });
}
