import { getAnchorPrograms } from "@/utils/getAnchorProgram";
import { BN } from "@coral-xyz/anchor";
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import * as SecureStore from "expo-secure-store";
import rawIdl from "../idl/unite.json";

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

export async function initOrganizer(connection: Connection, wallet: any) {
  const { program } = await getAnchorPrograms(connection);

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
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();
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

  const signature = await wallet.signAndSendTransaction(versionedTx, minContextSlot);
  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    "confirmed"
  );


}
export async function createEvent(connection: Connection, wallet: any, params: {
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
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();
  const organizer = await program.account.organizerAccount.fetch(organizerPda);
  console.log("Fetched organizer account:", organizer);

  const eventCount = organizer.eventCount as number;

  const [eventPda] = getEventPDA(authority, eventCount);
  console.log("Event pda is", eventPda);


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

  const tx = new VersionedTransaction(msg);
  console.log("Transaction is", tx);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  // ✅ Confirm transaction
  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    "confirmed"
  );
  // ✅ ADD THIS — small delay to allow on-chain state propagation
  await new Promise(resolve => setTimeout(resolve, 1000));

  // ✅ (Then fetch the new event or organizer if needed)
  try {
    const createdEvent = await program.account.event.fetch(eventPda);
    console.log("Created event fetched successfully:", createdEvent);
  } catch (err) {
    console.error("Error fetching event after tx:", err);
  }
}
export async function testSolTransfer(
  connection: Connection,
  authorizeSession: (wallet: Web3MobileWallet) => Promise<any>
) {
  await transact(async (wallet) => {

    const walletadd = await SecureStore.getItemAsync("wallet_address");
    if (!walletadd) throw new Error("Publickey not found");


    const fromPubkey = new PublicKey(walletadd);
    const balance = await connection.getBalance(fromPubkey);
    console.log("💰 Balance (lamports):", balance);
    const toPubkey = new PublicKey("8MPs4Am9W8vMfpqnYB96MKHGC6yy83Eq1d4Rc455bVFL");

    console.log("🔑 From:", fromPubkey.toBase58());
    console.log("🎯 To:", toPubkey.toBase58());

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Authorize wallet
    const authResult = await authorizeSession(wallet);

    // Create legacy Transaction (not VersionedTransaction)
    const transaction = new Transaction({
      feePayer: fromPubkey,
      recentBlockhash: blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: 1000000, // 0.001 SOL
      })
    );

    console.log("✍️ Signing and sending legacy transaction...");
    const signedTxs = await wallet.signTransactions({ transactions: [transaction] });

    const signature = await connection.sendRawTransaction(signedTxs[0].serialize());

    console.log("✅ Signature:", signature);

    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

    console.log("🎉 Transfer confirmed!");
  });
}
