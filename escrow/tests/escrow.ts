import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { createAssociatedTokenAccountIdempotentInstruction, createInitializeAccount2Instruction, createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";
import * as fs from "fs";
import { randomBytes } from "crypto";
describe("escrow", () => {
  // Configure the client to use the local cluster.

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.escrow as Program<Escrow>;

  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  const seed = new BN(randomBytes(8));

   const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${provider.connection.rpcEndpoint}`
    );
    return signature;
  };

  const confirm = async (signature: string): Promise<string> => {
    const block = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const [maker, taker, mintA, mintB] = Array.from({ length: 4 }, () =>
    Keypair.generate()
  );

  const [maker_mint_a_ata, maker_mint_b_ata, taker_mint_a_ata, taker_mint_b_ata] = [maker, taker]
      .map((a) =>
        [mintA, mintB].map((m) =>
          getAssociatedTokenAddressSync(m.publicKey, a.publicKey, false, TOKEN_2022_PROGRAM_ID)
    )
    )
    .flat();

     const escrow = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), maker.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

     const vault = getAssociatedTokenAddressSync(mintA.publicKey, escrow, true, TOKEN_2022_PROGRAM_ID);


    const accounts = {
      maker: maker.publicKey,
      taker: taker.publicKey,
      mintA: mintA.publicKey,
      mintB: mintB.publicKey,
      maker_mint_a_ata,
      maker_mint_b_ata,
      taker_mint_a_ata,
      taker_mint_b_ata,
      escrow,
      vault,
      tokenProgram,
    }

 it("Airdrop and create mints", async () => {
  const lamports = await getMinimumBalanceForRentExemptMint(provider.connection);
  const tx = new Transaction();

  // Fund maker and taker
  tx.add(
    ...[maker, taker].map((account) =>
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: account.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      })
    )
  );

  // Create mint accounts
  tx.add(
    ...[mintA, mintB].map((mint) =>
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    )
  );

  // Initialize mints, ATAs, and mint tokens
  tx.add(
    ...[
      { mint: mintA, authority: maker, ata: maker_mint_a_ata },
      { mint: mintB, authority: taker, ata: taker_mint_b_ata },
    ].flatMap((x) => [
      createInitializeMint2Instruction(x.mint.publicKey, 6, x.authority.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createAssociatedTokenAccountIdempotentInstruction(provider.wallet.publicKey, x.ata, x.authority.publicKey, x.mint.publicKey, TOKEN_2022_PROGRAM_ID),
      createMintToInstruction(x.mint.publicKey, x.ata, x.authority.publicKey, 1e9, undefined, TOKEN_2022_PROGRAM_ID),
    ])
  );

  // Send the transaction
  await provider.sendAndConfirm(tx, [maker, taker, mintA, mintB]).then(log);
});

 it("Make", async () => {
    // Add your test here.
    const tx = await program.methods
    .make(seed, new BN(1e6), new BN(1e6))
    .accounts({ ...accounts })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);

    console.log("Makeing of Escrow completed", tx);

  });

  xit("Refund", async () => {
    const tx = await program.methods
    .refund()
    .accounts({ ...accounts })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);

    console.log("Refund Completed", tx);
  });

   it("Take", async () => {
    try{
      const tx = await program.methods
        .take(seed)
        .accounts({ ...accounts })
        .signers([taker])
        .rpc()
        .then(confirm)
        .then(log);

    console.log("take confirmed", tx);
    }catch(e){
      console.log(e);
      throw(e);
    };

  });
});
