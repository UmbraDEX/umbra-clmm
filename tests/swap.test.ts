import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { AmmV3 } from "../target/types/amm_v3";
import { setupSwapTest, swap_base_input, swap_base_output } from "./utils";
import { assert } from "chai";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";

describe("swap test", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const owner = anchor.Wallet.local().payer;

  const program = anchor.workspace.UmbraAmm as Program<AmmV3>;

  const confirmOptions = {
    skipPreflight: true,
  };

  it("swap base input without transfer fee", async () => {
    const { configAddress, poolAddress, poolState } = await setupSwapTest(
      program,
      anchor.getProvider().connection,
      owner,
      {
        config_index: 0,
        tradeFeeRate: new BN(10),
        protocolFeeRate: new BN(1000),
        fundFeeRate: new BN(25000),
        create_fee: new BN(0),
      },
      { transferFeeBasisPoints: 0, MaxFee: 0 }
    );
    const inputToken = poolState.token0Mint;
    const inputTokenProgram = poolState.token0Program;
    const inputTokenAccountAddr = getAssociatedTokenAddressSync(
      inputToken,
      owner.publicKey,
      false,
      inputTokenProgram
    );
    const inputTokenAccountBefore = await getAccount(
      anchor.getProvider().connection,
      inputTokenAccountAddr,
      "processed",
      inputTokenProgram
    );
    await sleep(1000);
    let amount_in = new BN(100000000);
    await swap_base_input(
      program,
      owner,
      configAddress,
      inputToken,
      inputTokenProgram,
      poolState.token1Mint,
      poolState.token1Program,
      amount_in,
      new BN(0)
    );
    const inputTokenAccountAfter = await getAccount(
      anchor.getProvider().connection,
      inputTokenAccountAddr,
      "processed",
      inputTokenProgram
    );
    assert.equal(
      inputTokenAccountBefore.amount - inputTokenAccountAfter.amount,
      BigInt(amount_in.toString())
    );
  });