import "dotenv/config"
import { BN } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

import { setupCLMMProgram } from "../setup"
import { openPositionWithToken22Nft } from "../utils/instruction-clmm"
import { getAmmConfigAddress, getPoolAddress } from "../utils/pda"

const config_index = 0
const token0 = new PublicKey("mntPs3DJMqPnnE6zqf2q6eduM72cPWx4ALoKaoNpC5T")
const token1 = new PublicKey("mnthuBnrWBTiEHBU3Tbq6Nv7eaqV8kEEDBb9TYn6sEm")
const params = {
	isBase0: true /* token 0 or token 1 */,
	baseAmount: new BN(1000000000),
	otherAmountMax: new BN(1000000000),
	tickLower: 100,
	tickUpper: 200,
	withMetadata: false,
}

async function main() {
	const { program, connection, owner } = await setupCLMMProgram()
	const [configAddress] = await getAmmConfigAddress(config_index, program.programId)
	const [poolAddress] = await getPoolAddress(configAddress, token0, token1, program.programId)

	console.log("open position config", params)

	const tx = await openPositionWithToken22Nft(program, connection, poolAddress, params, owner)

	console.log("success", tx)
}

main()
