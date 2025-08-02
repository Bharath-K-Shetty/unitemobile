import { getAnchorPrograms } from "@/utils/getAnchorProgram";
import { BN } from "@coral-xyz/anchor";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
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


export function getCollateralVaultPDA(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("collateral_vault"), authority.toBuffer()],
    programId
  );
}
function getEventVaultPDA(eventPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("event_vault"), eventPda.toBuffer()],
    programId
  );
}
export function getTicketPDA(eventPda: PublicKey, buyer: PublicKey, timestamp: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      eventPda.toBuffer(),
      buyer.toBuffer(),
      new BN(timestamp).toArrayLike(Buffer, "le", 8), // match anchor's u64 encoding
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

  // let ticket_price = BigInt(Math.floor(params.feeLamports * LAMPORTS_PER_SOL)).toString();
  let ticket_price = params.feeLamports * LAMPORTS_PER_SOL;
  console.log("Ticket price is", ticket_price);

  const { blockhash } = await connection.getLatestBlockhash();
  console.log("creating tx and blockhash is ", blockhash);
  const createIx = await program.methods
    .createEvent(
      params.eventName,
      params.description,
      new BN(params.deadline),
      new BN(ticket_price),
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
    const createdEvent = await program.account.eventAccount.fetch(eventPda);
    console.log("Created event fetched successfully:", createdEvent);
  } catch (err) {
    console.error("Error fetching event after tx:", err);
  }
}

export async function deverifyOrganizer(
  connection: Connection,
  wallet: any,
) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;

  const [organizerPda] = getOrganizerPDA(authority);
  const [collateralVaultPda] = getCollateralVaultPDA(authority);
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();

  const { blockhash } = latestBlockhash;



  const verifyIx = await program.methods
    .unverifyOrganizer()
    .accounts({
      organizer: organizerPda,
      authority,
      collateralVault: collateralVaultPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const msg = new TransactionMessage({
    payerKey: authority,
    recentBlockhash: blockhash,
    instructions: verifyIx.instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(msg);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    'confirmed'
  );

  // Optional delay for consistency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const organizer = await program.account.organizerAccount.fetch(organizerPda);
    console.log('✅ Organizer verified:', organizer);
    return organizer;
  } catch (err) {
    console.error('❌ Error fetching organizer after verification:', err);
    throw err;
  }
}

export async function verifyOrganizer(
  connection: Connection,
  wallet: any,
  amountSol: number
) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;

  const [organizerPda] = getOrganizerPDA(authority);
  const [collateralVaultPda] = getCollateralVaultPDA(authority);
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();

  const { blockhash } = latestBlockhash;
  console.log('Verifying organizer with collateral:', amountSol);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  console.log("Lamports are ", lamports);
  const verifyIx = await program.methods
    .verifyOrganizer(new BN(lamports))
    .accounts({
      organizer: organizerPda,
      authority,
      collateralVault: collateralVaultPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const msg = new TransactionMessage({
    payerKey: authority,
    recentBlockhash: blockhash,
    instructions: verifyIx.instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(msg);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    'confirmed'
  );

  // Optional delay for consistency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const organizer = await program.account.organizerAccount.fetch(organizerPda);
    console.log('✅ Organizer verified:', organizer);
    return organizer;
  } catch (err) {
    console.error('❌ Error fetching organizer after verification:', err);
    throw err;
  }
}

export async function checkIfOrganizerIsVerified(connection: Connection, wallet: any) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;
  const [organizerPda] = getOrganizerPDA(authority);

  try {
    const organizerAccount = await program.account.organizerAccount.fetch(organizerPda);

    return organizerAccount.isVerified;
  } catch (e) {
    console.warn("Organizer account not found or fetch failed:", e);
    return false; // Not verified
  }
}
export async function unverifyOrganizer(
  connection: Connection,
  wallet: any,
) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;

  const [organizerPda] = getOrganizerPDA(authority);
  const [collateralVaultPda] = getCollateralVaultPDA(authority);
  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();

  const { blockhash } = latestBlockhash;


  const verifyIx = await program.methods
    .unverifyOrganizer()
    .accounts({
      organizer: organizerPda,
      authority,
      collateralVault: collateralVaultPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const msg = new TransactionMessage({
    payerKey: authority,
    recentBlockhash: blockhash,
    instructions: verifyIx.instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(msg);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    'confirmed'
  );

  // Optional delay for consistency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const organizer = await program.account.organizerAccount.fetch(organizerPda);
    console.log('✅ Organizer verified:', organizer);
    return organizer;
  } catch (err) {
    console.error('❌ Error fetching organizer after verification:', err);
    throw err;
  }
}
export async function ticketVaultInitialization(
  connection: Connection,
  wallet: any,
  eventPubkey: PublicKey,
  timeStamp: number
) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const buyer = anchorWallet.publicKey!;



  const [ticketPda] = getTicketPDA(eventPubkey, buyer, timeStamp);

  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();
  const { blockhash } = latestBlockhash;


  // Build transaction
  const buyIx = await program.methods
    .initializeTicketAccount(new BN(timeStamp))
    .accounts({
      event: eventPubkey,
      buyer: buyer,
      ticket: ticketPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const msg = new TransactionMessage({
    payerKey: buyer,
    recentBlockhash: blockhash,
    instructions: buyIx.instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(msg);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    'confirmed'
  );

  console.log('🎟️ Ticket purchase confirmed:', signature);
  return signature;
}

export async function buyTicket(
  connection: Connection,
  wallet: any,
  eventPubkey: PublicKey,
  timeStamp: number
) {
  const { provider, anchorWallet, program } = await getAnchorPrograms(connection);
  const buyer = anchorWallet.publicKey!;



  const [eventVaultPda] = getEventVaultPDA(eventPubkey);
  const [ticketPda] = getTicketPDA(eventPubkey, buyer, timeStamp);

  const {
    context: { slot: minContextSlot },
    value: latestBlockhash,
  } = await connection.getLatestBlockhashAndContext();
  const { blockhash } = latestBlockhash;


  // Build transaction
  const buyIx = await program.methods
    .buyTicket(new BN(timeStamp))
    .accounts({
      event: eventPubkey,
      eventVault: eventVaultPda,
      buyer: buyer,
      ticket: ticketPda,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const msg = new TransactionMessage({
    payerKey: buyer,
    recentBlockhash: blockhash,
    instructions: buyIx.instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(msg);
  const signature = await wallet.signAndSendTransaction(tx, minContextSlot);

  await connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    'confirmed'
  );

  console.log('🎟️ Ticket purchase confirmed:', signature);
  return signature;
}

export async function getEventsByOrganizer(connection: Connection, wallet: any) {
  const { anchorWallet, program } = await getAnchorPrograms(connection);
  const authority = anchorWallet.publicKey!;
  const [organizerPda] = getOrganizerPDA(authority);

  const organizer = await program.account.organizerAccount.fetch(organizerPda);
  console.log("Fetched organizer account:", organizer);
  const eventCount = organizer.eventCount as number;

  // Step 2: Derive all event PDAs
  const eventPdas = Array.from({ length: eventCount }, (_, index) =>
    getEventPDA(authority, index)[0]
  );

  // Step 3: Fetch all event accounts in parallel
  const eventAccounts = await Promise.all(
    eventPdas.map((pda) => program.account.eventAccount.fetch(pda).catch(() => null))
  );

  // Filter out failed fetches
  return eventAccounts
    .map((event, idx) => event && { pda: eventPdas[idx], ...event })
    .filter(Boolean);
}

export const getTicketsWithEventNames = async (connection: Connection, wallet: any) => {
  const { anchorWallet, program } = await getAnchorPrograms(connection);

  const tickets = await program.account.ticketAccount.all([
    {
      memcmp: {
        offset: 8, // buyer is first field after discriminator
        bytes: anchorWallet.publicKey.toBase58(),
      },
    },
  ]);

  const detailedTickets = await Promise.all(
    tickets.map(async (ticket: any) => {
      const eventPubkey = ticket.account.event;

      let eventAccount;
      try {
        eventAccount = await program.account.eventAccount.fetch(eventPubkey);
      } catch (err) {
        console.error("Failed to fetch event for ticket:", err);
      }

      return {
        ticket: ticket.account,
        eventName: eventAccount?.title || "Unknown Event",
        eventPubkey,
      };
    })
  );

  return detailedTickets;
};
