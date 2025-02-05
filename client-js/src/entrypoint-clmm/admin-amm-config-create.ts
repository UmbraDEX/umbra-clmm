import "dotenv/config"
import { setupCLMMProgram } from "../setup"
import { createCLMMAmmConfig } from "../utils/instruction-clmm"

// const config = {
// 	config_index: 0, // The index of amm config, there may be multiple config.
// 	tick_spacing: 100, // The tickspacing binding with config, cannot be changed.
// 	trade_fee_rate: 10, // Trade fee rate, can be changed.
// 	protocol_fee_rate: 1000, // The rate of protocol fee within tarde fee.
// 	fund_fee_rate: 25000, // The rate of fund fee within tarde fee.
// }

// async function main() {
// 	const { program, connection, owner } = await setupCLMMProgram()
// 	await createCLMMAmmConfig(
// 		program,
// 		connection,
// 		owner,
// 		config.config_index,
// 		config.tick_spacing,
// 		config.trade_fee_rate,
// 		config.protocol_fee_rate,
// 		config.fund_fee_rate,
// 	)
// }

async function batchCreate() {
	const { program, connection, owner } = await setupCLMMProgram()
	const configs = [
		{
			config_index: 0,
			trade_fee_rate: 100,
			tick_spacing: 1,
			protocol_fee_rate: 1000,
			fund_fee_rate: 25000,
		},
		{
			config_index: 1,
			trade_fee_rate: 500,
			tick_spacing: 10,
			protocol_fee_rate: 1000,
			fund_fee_rate: 25000,
		},
		{
			config_index: 2,
			trade_fee_rate: 3000,
			tick_spacing: 60,
			protocol_fee_rate: 1000,
			fund_fee_rate: 25000,
		},
		{
			config_index: 3,
			trade_fee_rate: 10000,
			tick_spacing: 200,
			protocol_fee_rate: 1000,
			fund_fee_rate: 25000,
		},
	]
	for (const config of configs) {
		await createCLMMAmmConfig(
			program,
			connection,
			owner,
			config.config_index,
			config.tick_spacing,
			config.trade_fee_rate,
			config.protocol_fee_rate,
			config.fund_fee_rate,
		)
	}
}
batchCreate()
