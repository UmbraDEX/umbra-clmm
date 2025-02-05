import "dotenv/config"
import { PublicKey } from "@solana/web3.js"

import { setupCLMMProgram } from "../setup"
import { updatePoolStatusCLMM } from "../utils/instruction-clmm"
import { getAmmConfigAddress, getPoolAddress } from "../utils/pda"

enum PoolStatusBitIndex {
	OpenPositionOrIncreaseLiquidity,
	DecreaseLiquidity,
	CollectFee,
	CollectReward,
	Swap,
}

const poolStatus = PoolStatusBitIndex.OpenPositionOrIncreaseLiquidity

const config_index = 0
const token0 = new PublicKey("mntPs3DJMqPnnE6zqf2q6eduM72cPWx4ALoKaoNpC5T")
const token1 = new PublicKey("mnthuBnrWBTiEHBU3Tbq6Nv7eaqV8kEEDBb9TYn6sEm")

async function main() {
	const { program, provider, owner } = await setupCLMMProgram()
	const [configAddress] = await getAmmConfigAddress(config_index, program.programId)
	const [poolAddress] = await getPoolAddress(configAddress, token0, token1, program.programId)
	console.log("poolAddress", poolAddress.toBase58())
	const tx = await updatePoolStatusCLMM(program, provider.connection, owner, poolAddress, poolStatus)

	console.log("updated pool status", tx)
}

main()
