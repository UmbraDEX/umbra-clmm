# Umbra-CLMM

Umbra-CLMM is a concentrated liquidity market maker (CLMM) program built for the Eclipse ecosystem.

**Concentrated Liquidity Market Maker (CLMM)** pools allow liquidity providers to select a specific price range at which liquidity is active for trades within a pool. This is in contrast to constant product Automated Market Maker (AMM) pools, where all liquidity is spread out on a price curve from 0 to ∞. For LPs, CLMM design enables capital to be deployed with higher efficiency and earn increased yield from trading fees. For traders, CLMMs improve liquidity depth around the current price which translates to better prices and lower price impact on swaps. CLMM pools can be configured for pairs with different volatility.

## Client Libraries

- [TypeScript/JavaScript Client](./client-js) - TypeScript/JavaScript library for interacting with Umbra-CLMM
- [Rust Client](./client) - Rust library for interacting with Umbra-CLMM

## TypeScript/JavaScript Client Usage

### Installation

```bash
yarn install
```

### Available Commands

The following commands demonstrate various interactions with Umbra-CLMM:

```bash
# Create AMM configuration
ts-node src/entrypoint-clmm/admin-amm-config-create.ts

# Create a new liquidity pool
ts-node src/entrypoint-clmm/pool-create.ts

# Open a new position in a pool
ts-node src/entrypoint-clmm/pool-position-open.ts

# Read pool state
ts-node src/entrypoint-clmm/state-read.ts

# Watch pool state
ts-node src/entrypoint-clmm/state-watch.ts
```

## Rust Client Commands

The Rust client provides a comprehensive set of commands for interacting with Umbra-CLMM. Here are the available commands:

### Token Management

```bash
# Create a new mint
cargo run -- new-mint [OPTIONS] [AUTHORITY]
  --decimals <DECIMALS>          Set decimal places
  --token-2022                   Use Token-2022 program
  --enable-freeze               Enable freeze authority
  --enable-close                Enable close authority
  --enable-non-transferable     Make token non-transferable
  --rate-bps <RATE>             Set interest rate in basis points

# Create a new token account
cargo run -- new-token <MINT> <AUTHORITY> [--not-ata]

# Mint tokens
cargo run -- mint-to <MINT> <TO_TOKEN> <AMOUNT>

# Wrap SOL
cargo run -- wrap-sol <AMOUNT>

# Unwrap SOL
cargo run -- unwrap-sol <WRAP_SOL_ACCOUNT>
```

### Pool Management

```bash
# Create AMM config
cargo run -- create-config <CONFIG_INDEX> <TICK_SPACING> <TRADE_FEE_RATE> <PROTOCOL_FEE_RATE> <FUND_FEE_RATE>

# Update AMM config
cargo run -- update-config <CONFIG_INDEX> <PARAM> <VALUE> [REMAINING]

# Create pool
cargo run -- create-pool <CONFIG_INDEX> <PRICE> <MINT0> <MINT1> [--open-time <TIME>]

# Initialize reward
cargo run -- init-reward <OPEN_TIME> <END_TIME> <EMISSIONS> <REWARD_MINT>

# Set reward parameters
cargo run -- set-reward-params <INDEX> <OPEN_TIME> <END_TIME> <EMISSIONS> <REWARD_MINT>
```

### Position Management

```bash
# Open position
cargo run -- open-position <TICK_LOWER_PRICE> <TICK_UPPER_PRICE> [--is-base-0] <INPUT_AMOUNT> [--with-metadata]

# Increase liquidity
cargo run -- increase-liquidity <TICK_LOWER_PRICE> <TICK_UPPER_PRICE> [--is-base-0] <INPUT_AMOUNT>

# Decrease liquidity
cargo run -- decrease-liquidity <TICK_LOWER_INDEX> <TICK_UPPER_INDEX> [LIQUIDITY] [--simulate]
```

### Trading

```bash
# Swap tokens
cargo run -- swap <INPUT_TOKEN> <OUTPUT_TOKEN> [--base-in] [--simulate] <AMOUNT> [LIMIT_PRICE]

# Swap tokens (v2)
cargo run -- swap-v2 <INPUT_TOKEN> <OUTPUT_TOKEN> [--base-in] [--simulate] <AMOUNT> [LIMIT_PRICE]
```

### Query Commands

```bash
# View positions by owner
cargo run -- p-position-by-owner <USER_WALLET>

# View tick state
cargo run -- p-tick-state <TICK> [POOL_ID]

# View pool state
cargo run -- p-pool [POOL_ID]

# View operation state
cargo run -- p-operation

# View observation state
cargo run -- p-observation

# View config
cargo run -- p-config <CONFIG_INDEX>

# View positions by pool
cargo run -- p-personal-position-by-pool [POOL_ID]
cargo run -- p-protocol-position-by-pool [POOL_ID]

# View tick arrays by pool
cargo run -- p-tick-array-by-pool [POOL_ID]
```

### Utility Commands

```bash
# Convert between price and tick
cargo run -- price-to-tick <PRICE>
cargo run -- tick-to-price <TICK>

# Calculate tick spacing
cargo run -- tick-with-spacing <TICK> <TICK_SPACING>

# Calculate liquidity amounts
cargo run -- liquidity-to-amounts <TICK_LOWER> <TICK_UPPER> <LIQUIDITY>

# Decode instructions and events
cargo run -- decode-instruction <INSTR_HEX_DATA>
cargo run -- decode-event <LOG_EVENT>
cargo run -- decode-tx-log <TX_ID>
```
