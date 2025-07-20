import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import base64 from 'base64-js';
import * as SecureStore from 'expo-secure-store';

// Discriminator bytes
const CREATE_EVENT_DISCRIMINATOR = [49, 219, 29, 203, 22, 98, 100, 87];
const INIT_ORGANIZER_DISCRIMINATOR = [223, 252, 246, 108, 132, 141, 11, 217];

// Program ID
const PROGRAM_ID = new PublicKey("nTqEj8gr65fCtYhoZNKbK4ri2QyMY7HvrFeBzVuFRqU");

// Seeds
const ORGANIZER_SEED = Buffer.from("organizer");
const EVENT_SEED = Buffer.from("event");

// RPC connection
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
async function getAuthToken(): Promise<string> {
  const token = await SecureStore.getItemAsync('unite_auth_token');
  if (!token) {
    throw new Error("Missing auth token. Wallet not authorized yet.");
  }
  return token;
}




export async function initializeOrganizerMobile() {
  console.log("🚀 Attempting to create event...");
  const token = await getAuthToken();
  console.log("Tpken is ", token);
  return await transact(async (wallet: Web3MobileWallet) => {
    console.log("Inside transact");
    const { accounts } = await wallet.reauthorize({
      auth_token: token,
      identity: {
        name: "Unite App",
      },
    });


    const base64Address = accounts[0].address;
    const decodedAddress = base64.toByteArray(base64Address);
    const publicKey = new PublicKey(decodedAddress);

    const [organizerPDA] = PublicKey.findProgramAddressSync(
      [ORGANIZER_SEED, publicKey.toBuffer()],
      PROGRAM_ID
    );
    console.log("Check if organizer account already exists");
    // ✅ Check if organizer account already exists
    const accountInfo = await connection.getAccountInfo(organizerPDA);
    if (accountInfo !== null) {
      console.log("Organizer already initialized ✅");
      return;
    }

    // Organizer not found, so proceed with initialization
    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: organizerPDA, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(INIT_ORGANIZER_DISCRIMINATOR),
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    console.log("📝 Prepared transaction, attempting to sign and send...");

    const signatures = await wallet.signAndSendTransactions({ transactions: [tx] });
    const signature = signatures[0];

    console.log("✅ Organizer initialized:", signature);
    return signature;
  });
}


export async function createEventMobile({
  title,
  description,
  deadline,
  ticket_price,
  quorum,
  maximum_capacity,
}: {
  title: string;
  description: string;
  deadline: number; // i64
  ticket_price: bigint; // u64
  quorum: number; // u32
  maximum_capacity: number; // u32
}) {
  return await transact(async (wallet: Web3MobileWallet) => {
    const token = await getAuthToken();
    const { accounts } = await wallet.reauthorize({
      auth_token: token,
      identity: {
        name: "Unite App",

      },
    });


    const base64Address = accounts[0].address;
    const decodedAddress = base64.toByteArray(base64Address);
    const publicKey = new PublicKey(decodedAddress);

    const [organizerPDA] = PublicKey.findProgramAddressSync(
      [ORGANIZER_SEED, publicKey.toBuffer()],
      PROGRAM_ID
    );

    // You should fetch this dynamically from organizer account in real apps
    const event_count = 0;

    const [eventPDA] = PublicKey.findProgramAddressSync(
      [
        EVENT_SEED,
        publicKey.toBuffer(),
        Buffer.from(Uint8Array.of(...new Uint8Array(new Uint32Array([event_count]).buffer))),
      ],
      PROGRAM_ID
    );

    const titleBuf = Buffer.from(title, "utf8");
    const descBuf = Buffer.from(description, "utf8");

    const data = Buffer.concat([
      Buffer.from(CREATE_EVENT_DISCRIMINATOR),
      Buffer.from(Uint8Array.of(titleBuf.length, ...titleBuf)),
      Buffer.from(Uint8Array.of(descBuf.length, ...descBuf)),
      Buffer.alloc(8), // deadline
      Buffer.alloc(8), // ticket_price
      Buffer.alloc(4), // quorum
      Buffer.alloc(4), // max_capacity
    ]);

    data.writeBigInt64LE(BigInt(deadline), data.length - 24);
    data.writeBigUInt64LE(ticket_price, data.length - 16);
    data.writeUInt32LE(quorum, data.length - 8);
    data.writeUInt32LE(maximum_capacity, data.length - 4);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: organizerPDA, isSigner: false, isWritable: true },
        { pubkey: eventPDA, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signatures = await wallet.signAndSendTransactions({ transactions: [tx] });
    const signature = signatures[0];
    console.log("✅ Event created:", signature);
    return signature;
  });
}
