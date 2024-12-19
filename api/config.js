"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
// TODO: change this everytime you want to switch!
const environment = "devnet";
const variables = {
    "testnet": "0x2ebf7bd54a36ae8a2c69c60ed752dd7308d13b432e8a804a3a21bf6d560f8a4e",
    "devnet": "0x38e0c48da04782f7680d711bb18ec69853e4403c715cf1e00c1ef96803a57b9c"
};
exports.CONFIG = {
    /// Look for events every 1s
    POLLING_INTERVAL_MS: 1000,
    DEFAULT_LIMIT: 50,
    NETWORK: environment,
    PACKAGE: variables[environment],
};
