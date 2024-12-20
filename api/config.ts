// TODO: change this everytime you want to switch!
const environment: "testnet" | "mainnet" | "devnet" | "localnet" = "devnet";

const variables = {
    "testnet": "0x2ebf7bd54a36ae8a2c69c60ed752dd7308d13b432e8a804a3a21bf6d560f8a4e",
    "devnet": "0x8f6e84c53566e0b0a9299a72915b5181f842b6ce4f05c420aebd41cc68947f49"
};

export const CONFIG = {
    /// Look for events every 1s
    POLLING_INTERVAL_MS: 1000,
    DEFAULT_LIMIT: 50,
    NETWORK: environment,
    PACKAGE: variables[environment] as String,
};