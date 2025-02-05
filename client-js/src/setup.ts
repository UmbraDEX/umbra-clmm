import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";
import { getKeypairFromFile } from "@solana-developers/node-helpers";

import { AmmV3, IDL } from "../../target/types/amm_v3";

const owner_key_path = (process.env.OWNER_KEYPAIR_PATH ?? "").replace(
  "~",
  process.env.HOME ?? ""
);
const connection = new web3.Connection(
  process.env.RPC_URL ?? "http://localhost:8899",
  "confirmed"
);
const programIdCLMM = process.env.PROGRAM_ID_CLMM ?? "";

console.log("programIdCLMM", process.env.RPC_URL, programIdCLMM);

export const setupCLMMProgram = async () => {
  const owner = await getKeypairFromFile(owner_key_path);
  const provider = new AnchorProvider(
    connection,
    new Wallet(owner),
    AnchorProvider.defaultOptions()
  );
  const program = new Program<AmmV3>(IDL, programIdCLMM, provider);

  return {
    owner,
    program,
    provider,
    connection,
  };
};
