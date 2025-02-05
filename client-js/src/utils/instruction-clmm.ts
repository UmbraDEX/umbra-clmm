import { BN, Program } from "@coral-xyz/anchor";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  LiquidityMath,
  SqrtPriceMath,
  TickUtils,
  getATAAddress,
  getPdaPersonalPositionAddress,
  getPdaProtocolPositionAddress,
  getPdaTickArrayAddress,
} from "@raydium-io/raydium-sdk-v2";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  Signer,
  SystemProgram,
} from "@solana/web3.js";
import Decimal from "decimal.js";

import { AmmV3 } from "../../../target/types/amm_v3";
import { accountExist, sendTransaction } from "../utils";
import {
  getAmmConfigAddress,
  getOrcleAccountAddress,
  getPoolAddress,
  getPoolVaultAddress,
  getTickArrayBitmapAccountAddress,
} from "../utils/pda";

export async function createCLMMAmmConfig(
  program: Program<AmmV3>,
  connection: Connection,
  owner: Signer,
  config_index: number,
  tick_spacing: number,
  trade_fee_rate: number,
  protocol_fee_rate: number,
  fund_fee_rate: number
) {
  const [address, _] = await getAmmConfigAddress(
    config_index,
    program.programId
  );
  if (await accountExist(connection, address)) {
    console.log("config already exists");
    return address;
  }

  console.log(
    "createCLMMAmmConfig",
    config_index,
    tick_spacing,
    trade_fee_rate,
    protocol_fee_rate,
    fund_fee_rate,
    {
      owner: owner.publicKey,
      ammConfig: address,
      systemProgram: SystemProgram.programId,
    }
  );

  const ix = await program.methods
    .createAmmConfig(
      config_index,
      tick_spacing,
      trade_fee_rate,
      protocol_fee_rate,
      fund_fee_rate
    )
    .accounts({
      owner: owner.publicKey,
      ammConfig: address,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const tx = await sendTransaction(connection, [ix], [owner]);
  console.log("init amm config tx: ", tx);
  return address;
}

export async function updateCLMMAmmConfig(
  program: Program<AmmV3>,
  connection: Connection,
  owner: Signer,
  config_index: number,
  updateConfig: { key: string; value: number }[]
) {
  const [address, _] = await getAmmConfigAddress(
    config_index,
    program.programId
  );
  const ixs = await Promise.all(
    updateConfig.map(async ({ key, value }) => {
      const param = {
        trade_fee_rate: 0,
        protocol_fee_rate: 1,
        fund_fee_rate: 2,
        new_owner: 3,
        new_fund_owner: 4,
      }[key];

      const ix = await program.methods
        .updateAmmConfig(param!, value)
        .accounts({
          owner: owner.publicKey,
          ammConfig: address,
        })
        .instruction();
      return ix;
    })
  );

  const tx = await sendTransaction(connection, ixs, [owner]);
  console.log("update amm config tx: ", tx);
  return tx;
}

export async function createPoolCLMM(
  program: Program<AmmV3>,
  creator: Signer,
  configAddress: PublicKey,
  token0: PublicKey,
  token0Program: PublicKey,
  token0Decimals: number,
  token1: PublicKey,
  token1Program: PublicKey,
  token1Decimals: number,
  initPrice: Decimal,
  openTime: BN,
  connection: Connection = program.provider.connection,
  confirmOptions?: ConfirmOptions
) {
  const [poolAddress] = await getPoolAddress(
    configAddress,
    token0,
    token1,
    program.programId
  );
  if (await accountExist(connection, poolAddress)) {
    const poolState = await program.account.poolState.fetch(poolAddress);
    console.log("pool already exists");
    return { poolAddress, poolState };
  }

  const [vault0] = await getPoolVaultAddress(
    poolAddress,
    token0,
    program.programId
  );
  const [vault1] = await getPoolVaultAddress(
    poolAddress,
    token1,
    program.programId
  );

  const [observationAddress] = await getOrcleAccountAddress(
    poolAddress,
    program.programId
  );
  const [tickArrayBitmapAddress] = await getTickArrayBitmapAccountAddress(
    program.programId,
    poolAddress
  );

  const sqrtPriceX64 = SqrtPriceMath.priceToSqrtPriceX64(
    initPrice,
    token0Decimals,
    token1Decimals
  );

  const ix = await program.methods
    .createPool(sqrtPriceX64, openTime)
    .accounts({
      poolCreator: creator.publicKey,
      ammConfig: configAddress,
      poolState: poolAddress,
      tokenMint0: token0,
      tokenMint1: token1,
      tokenVault0: vault0,
      tokenVault1: vault1,
      observationState: observationAddress,
      tickArrayBitmap: tickArrayBitmapAddress,
      tokenProgram0: token0Program,
      tokenProgram1: token1Program,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([creator])
    .instruction();

  console.log("poolCreator", creator.publicKey.toBase58());
  console.log("ammConfig", configAddress.toBase58());
  console.log("poolState", poolAddress.toBase58());
  console.log("tokenMint0", token0.toBase58());
  console.log("tokenMint1", token1.toBase58());
  console.log("tokenVault0", vault0.toBase58());
  console.log("tokenVault1", vault1.toBase58());
  console.log("observationState", observationAddress.toBase58());
  console.log("tickArrayBitmap", tickArrayBitmapAddress.toBase58());
  console.log("tokenProgram0", token0Program.toBase58());
  console.log("tokenProgram1", token1Program.toBase58());
  console.log("systemProgram", SystemProgram.programId.toBase58());
  console.log("rent", SYSVAR_RENT_PUBKEY.toBase58());

  console.log("creating new pool");
  const tx = await sendTransaction(connection, [ix], [creator], confirmOptions);

  console.log("poolAddress", poolAddress.toBase58(), tx);
  const poolState = await program.account.poolState.fetch(poolAddress);
  return { poolAddress, poolState };
}

export async function updatePoolStatusCLMM(
  program: Program<AmmV3>,
  connection: Connection,
  owner: Signer,
  poolAddress: PublicKey,
  poolStatus: number,
  confirmOptions?: ConfirmOptions
) {
  const ix = await program.methods
    .updatePoolStatus(poolStatus)
    .accounts({
      poolState: poolAddress,
      authority: owner.publicKey,
    })
    .signers([owner])
    .instruction();

  const tx = await sendTransaction(connection, [ix], [owner], confirmOptions);

  return tx;
}

export async function openPositionWithToken22Nft(
  program: Program<AmmV3>,
  connection: Connection,
  poolAddress: PublicKey,
  params: {
    isBase0: boolean;
    baseAmount: BN;
    otherAmountMax: BN;
    tickLower: number;
    tickUpper: number;
    withMetadata: boolean;
  },
  owner: Signer,
  getEphemeralSigners?: (k: number) => any,
  confirmOptions?: ConfirmOptions
) {
  const poolState = await program.account.poolState.fetch(poolAddress);
  const {
    isBase0,
    baseAmount,
    otherAmountMax,
    tickLower,
    tickUpper,
    withMetadata,
  } = params;

  let nftMintAccount: PublicKey;
  const signers: Signer[] = [];
  if (getEphemeralSigners) {
    nftMintAccount = new PublicKey((await getEphemeralSigners(1))[0]);
  } else {
    const _k = Keypair.generate();
    signers.push(_k);
    nftMintAccount = _k.publicKey;
  }

  const { publicKey: positionNftAccount } = getATAAddress(
    owner.publicKey,
    nftMintAccount,
    TOKEN_2022_PROGRAM_ID
  );
  const tickArrayLowerStartIndex = TickUtils.getTickArrayStartIndexByTick(
    tickLower,
    poolState.tickSpacing
  );
  const tickArrayUpperStartIndex = TickUtils.getTickArrayStartIndexByTick(
    tickUpper,
    poolState.tickSpacing
  );
  const { publicKey: tickArrayLower } = getPdaTickArrayAddress(
    program.programId,
    poolAddress,
    tickArrayLowerStartIndex
  );
  const { publicKey: tickArrayUpper } = getPdaTickArrayAddress(
    program.programId,
    poolAddress,
    tickArrayUpperStartIndex
  );

  const { publicKey: personalPosition } = getPdaPersonalPositionAddress(
    program.programId,
    nftMintAccount
  );
  const { publicKey: protocolPosition } = getPdaProtocolPositionAddress(
    program.programId,
    poolAddress,
    tickLower,
    tickUpper
  );
  const tokenAccount0 = getAssociatedTokenAddressSync(
    poolState.tokenMint0,
    owner.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );
  const tokenAccount1 = getAssociatedTokenAddressSync(
    poolState.tokenMint1,
    owner.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  const sqrtPriceX64 = poolState.sqrtPriceX64;
  const sqrtPriceX64A = SqrtPriceMath.getSqrtPriceX64FromTick(tickLower);
  const sqrtPriceX64B = SqrtPriceMath.getSqrtPriceX64FromTick(tickUpper);

  let liquidity: BN;
  const add = true;

  if (sqrtPriceX64.lte(sqrtPriceX64A)) {
    liquidity = isBase0
      ? LiquidityMath.getLiquidityFromTokenAmountA(
          sqrtPriceX64A,
          sqrtPriceX64B,
          baseAmount,
          !add
        )
      : new BN(0);
  } else if (sqrtPriceX64.lte(sqrtPriceX64B)) {
    const liquidity0 = LiquidityMath.getLiquidityFromTokenAmountA(
      sqrtPriceX64,
      sqrtPriceX64B,
      baseAmount,
      !add
    );
    const liquidity1 = LiquidityMath.getLiquidityFromTokenAmountB(
      sqrtPriceX64A,
      sqrtPriceX64,
      baseAmount
    );
    liquidity = isBase0 ? liquidity0 : liquidity1;
  } else {
    liquidity = isBase0
      ? new BN(0)
      : LiquidityMath.getLiquidityFromTokenAmountB(
          sqrtPriceX64A,
          sqrtPriceX64B,
          baseAmount
        );
  }

  const amount0 = isBase0 ? baseAmount : otherAmountMax;
  const amount1 = isBase0 ? otherAmountMax : baseAmount;

  const ix = await program.methods
    .openPositionWithToken22Nft(
      tickLower,
      tickUpper,
      tickArrayLowerStartIndex,
      tickArrayUpperStartIndex,
      liquidity,
      amount0,
      amount1,
      isBase0,
      withMetadata
    )
    .accounts({
      payer: owner.publicKey,
      positionNftOwner: owner.publicKey,
      positionNftMint: nftMintAccount,
      positionNftAccount: positionNftAccount,
      poolState: poolAddress,
      protocolPosition: protocolPosition,
      tickArrayLower: tickArrayLower,
      tickArrayUpper: tickArrayUpper,
      personalPosition: personalPosition,
      tokenAccount0: tokenAccount0,
      tokenAccount1: tokenAccount1,
      tokenVault0: poolState.tokenVault0,
      tokenVault1: poolState.tokenVault1,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      tokenProgram2022: TOKEN_2022_PROGRAM_ID,
      vault0Mint: poolState.tokenMint0,
      vault1Mint: poolState.tokenMint1,
    })
    .signers([owner, ...signers])
    .instruction();

  console.log("open position params", {
    tickLower,
    tickUpper,
    tickArrayLowerStartIndex,
    tickArrayUpperStartIndex,
    liquidity,
    amount0,
    amount1,
    isBase0,
    withMetadata,
  });

  console.log("open position accounts", {
    payer: owner.publicKey.toBase58(),
    positionNftOwner: owner.publicKey.toBase58(),
    positionNftMint: nftMintAccount.toBase58(),
    positionNftAccount: positionNftAccount.toBase58(),
    tokenAccount0: tokenAccount0.toBase58(),
    tokenAccount1: tokenAccount1.toBase58(),
    tokenVault0: poolState.tokenVault0.toBase58(),
    tokenVault1: poolState.tokenVault1.toBase58(),
    rent: SYSVAR_RENT_PUBKEY.toBase58(),
    systemProgram: SystemProgram.programId.toBase58(),
    tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
    associatedTokenProgram: ASSOCIATED_PROGRAM_ID.toBase58(),
    tokenProgram2022: TOKEN_2022_PROGRAM_ID.toBase58(),
    vault0Mint: poolState.tokenMint0.toBase58(),
    vault1Mint: poolState.tokenMint1.toBase58(),
  });

  const tx = await sendTransaction(
    connection,
    [ix],
    [owner, ...signers],
    confirmOptions
  );

  return tx;
}
