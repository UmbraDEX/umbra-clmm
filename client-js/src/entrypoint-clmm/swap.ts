import "dotenv/config";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

import { setupCLMMProgram } from "../setup";
import { createPoolCLMM, swapCLMM } from "../utils/instruction-clmm";
import { getAmmConfigAddress } from "../utils/pda";

interface TokenPool {
  token: PublicKey;
  program: PublicKey;
  initAmount: BN;
  decimals: number;
}

const config_index = 0;
let tokenPools: [TokenPool, TokenPool] = [
  {
    token: new PublicKey("mntPs3DJMqPnnE6zqf2q6eduM72cPWx4ALoKaoNpC5T"),
    program: TOKEN_2022_PROGRAM_ID,
    initAmount: new BN(1000000000),
    decimals: 9,
  },
  {
    token: new PublicKey("mnthuBnrWBTiEHBU3Tbq6Nv7eaqV8kEEDBb9TYn6sEm"),
    program: TOKEN_2022_PROGRAM_ID,
    initAmount: new BN(1000000000),
    decimals: 9,
  },
];

/* order matter */
if (tokenPools[0].token.toBase58() > tokenPools[1].token.toBase58()) {
  tokenPools = [tokenPools[1], tokenPools[0]];
}

async function main() {
  const { program, provider, owner } = await setupCLMMProgram();
  const [configAddress] = await getAmmConfigAddress(
    config_index,
    program.programId
  );
  console.log("configAddress", configAddress.toBase58());
  await swapCLMM(
    program,
    provider.connection,
    owner,
    new BN(1000000000),
    new BN(0),
    new PublicKey(""),
    new PublicKey(""),
    new PublicKey("")
  );
}

main();
