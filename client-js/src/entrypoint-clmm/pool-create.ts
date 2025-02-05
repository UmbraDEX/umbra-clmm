import "dotenv/config"
import { BN } from "@coral-xyz/anchor"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import Decimal from "decimal.js"

import { setupCLMMProgram } from "../setup"
import { createPoolCLMM } from "../utils/instruction-clmm"
import { getAmmConfigAddress } from "../utils/pda"

interface TokenPool {
	token: PublicKey
	program: PublicKey
	initAmount: BN
	decimals: number
}

const config_index = 0
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
]

/* order matter */
if (tokenPools[0].token.toBase58() > tokenPools[1].token.toBase58()) {
	tokenPools = [tokenPools[1], tokenPools[0]]
}

async function main() {
	const { program, provider, owner } = await setupCLMMProgram()
	const [configAddress] = await getAmmConfigAddress(config_index, program.programId)
	console.log("configAddress", configAddress.toBase58())
	const { poolAddress, poolState } = await createPoolCLMM(
		program,
		owner,
		configAddress,
		tokenPools[0].token,
		tokenPools[0].program,
		tokenPools[0].decimals,
		tokenPools[1].token,
		tokenPools[1].program,
		tokenPools[1].decimals,
		new Decimal(1),
		new BN(0),
		provider.connection,
	)

	console.log("poolAddress", poolAddress.toBase58(), JSON.stringify(poolState, null, 2))
}

main()
