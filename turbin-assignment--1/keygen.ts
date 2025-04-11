import { Keypair } from '@solana/web3.js';
import base58 from "bs58"
// let kp = Keypair.generate()
// console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()}`)
// console.log(`[${kp.secretKey}]`)

const privateKeyBase58 = "rjP5Uh2DS5Rt1NtoWSARLXGDbN2B8hGcc81EVpfXxu4d318Gv89PDcFqmC2zXr8Cg5fv6zCAEoAAejcTfySLF6U";

// Convert base58 to Uint8Array
const privateKeyBytes = base58.decode(privateKeyBase58);

// Create a Keypair
const keypair = Keypair.fromSecretKey(privateKeyBytes);

console.log("Public Key:", keypair.publicKey.toBase58());
console.log("Private Key (Uint8Array):", Array.from(keypair.secretKey));

// To use in a wallet.json file, you can do:
const walletJson = JSON.stringify(Array.from(keypair.secretKey));
console.log("Wallet JSON content:", walletJson);
