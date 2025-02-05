import "dotenv/config"

import { setupCLMMProgram } from "../setup"

const main = async () => {
	const { program } = await setupCLMMProgram()
	/* read one pool state */
	// const poolAddress = new PublicKey("4cQP3gzcmPusAw6ZPLJKCanoPYUZuGKnVB8KCuHSmhHB")
	// const poolState = await readPoolState(program, poolAddress)
	// console.log('poolState', JSON.stringify(poolState, null, 2))
	// const ammConfig = await readAmmConfig(program, poolState.ammConfig as PublicKey)
	// console.log('ammConfig', ammConfig, JSON.stringify(ammConfig, null, 2))

	/* read all pool states */
	// const poolStates = await readAllPoolStates(program)
	// console.log("poolStates", JSON.stringify(poolStates, null, 2))

	/* read all amm configs */
	// const ammConfigs = await program.account.ammConfig.all()
	// console.log("ammConfigs", JSON.stringify(ammConfigs, null, 2))
	// const [poolState] = await program.account.poolState.all()
	// console.log("poolState", JSON.stringify(poolState, null, 2))

	// const [protocolPosition] = await program.account.protocolPositionState.all()
	// console.log("protocolPosition", JSON.stringify(protocolPosition, null, 2))

	const [personalPosition] = await program.account.personalPositionState.all()
	console.log("personalPosition", JSON.stringify(personalPosition, null, 2))
	// console.log("ammConfigs", JSON.stringify(ammConfigs, null, 2))
	// console.log("protocolPositionStates", JSON.stringify(protocolPositionStates, null, 2))
}

main()
