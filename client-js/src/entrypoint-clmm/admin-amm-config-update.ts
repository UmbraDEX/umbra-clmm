import "dotenv/config"
import { setupCLMMProgram } from "../setup"
import { updateCLMMAmmConfig } from "../utils/instruction-clmm"

const config_index = 0 // The index of amm config, there may be multiple config.
const config = {
	trade_fee_rate: 100000, // Trade fee rate, can be changed.
	protocol_fee_rate: 1000, // The rate of protocol fee within tarde fee.
	fund_fee_rate: 25000, // The rate of fund fee within tarde fee.
}

async function main() {
	const { program, connection, owner } = await setupCLMMProgram()

	await updateCLMMAmmConfig(program, connection, owner, config_index, [
		{ key: "trade_fee_rate", value: config.trade_fee_rate },
		{ key: "protocol_fee_rate", value: config.protocol_fee_rate },
		{ key: "fund_fee_rate", value: config.fund_fee_rate },
	])
}

main()
