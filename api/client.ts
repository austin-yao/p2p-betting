import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { CONFIG } from './config';

// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl(`${CONFIG.NETWORK}`);

// create a client connected to devnet
export const client = new SuiClient({ url: rpcUrl });