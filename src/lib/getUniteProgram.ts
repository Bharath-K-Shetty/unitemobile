// import { AnchorProvider, BN, Idl, Program } from '@project-serum/anchor';
// import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
// import idl from '../idl/unite.json';

// const PROGRAM_ID = new PublicKey(idl.address);

// export async function createUniteEvent(wallet: any, eventData: any) {
//   const connection = new Connection('https://api.devnet.solana.com');
//   const provider = new AnchorProvider(connection, wallet, {
//     commitment: 'processed',
//   });

//   const program = new Program(idl as unknown as Idl, PROGRAM_ID, provider);


//   const [organizerPda] = await PublicKey.findProgramAddress(
//     [Buffer.from("organizer"), wallet.publicKey.toBuffer()],
//     PROGRAM_ID
//   );


//   const organizerAccount = await program.account.organizerAccount.fetch(organizerPda);
//   const eventCount = organizerAccount.eventCount;

//   const [eventPda] = await PublicKey.findProgramAddress(
//     [Buffer.from("event"), wallet.publicKey.toBuffer(), new BN(eventCount).toArrayLike(Buffer, 'le', 4)],
//     PROGRAM_ID
//   );

//   try {
//     const tx = await program.methods
//       .createEvent(
//         eventData.title,
//         eventData.description,
//         new BN(eventData.deadline),
//         new BN(eventData.ticket_price),
//         eventData.quorum,
//         eventData.maximum_capacity
//       )
//       .accounts({
//         organizer: organizerPda,
//         event: eventPda,
//         authority: wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .rpc();

//     console.log('Event created with transaction:', tx);
//     return { tx, eventPda };
//   } catch (err) {
//     console.error('Failed to create event:', err);
//     throw err;
//   }
// }
