"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const client_1 = require("@mysten/sui/client");
const config_1 = require("./config");
// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = (0, client_1.getFullnodeUrl)(`${config_1.CONFIG.NETWORK}`);
// create a client connected to devnet
exports.client = new client_1.SuiClient({ url: rpcUrl });
