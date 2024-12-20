// TODO: change this everytime you want to switch!
const environment: "testnet" | "mainnet" | "devnet" | "localnet" = "mainnet";

const variables = {
    "testnet": "0x2ebf7bd54a36ae8a2c69c60ed752dd7308d13b432e8a804a3a21bf6d560f8a4e",
    "devnet": "0xb7823cf89d0769e408cd7d4f1118ff12fad036b654cdf66e420d990dcbb178c6",
    "mainnet": "0x7396cd81c2cf0df5c241222150d9dd9d86ea760c9017a108c7b8f6216243a3a7"
};

export const CONFIG = {
    /// Look for events every 1s
    POLLING_INTERVAL_MS: 1000,
    DEFAULT_LIMIT: 50,
    NETWORK: environment,
    PACKAGE: variables[environment] as String,
};