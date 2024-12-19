import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { DEVNET_BETTING_PACKAGE_ID, DEVNET_BETTING_GAME_ID, TESTNET_BETTING_GAME_ID, TESTNET_BETTING_PACKAGE_ID } from "./constants";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        bettingPackageId: DEVNET_BETTING_PACKAGE_ID,
        bettingGameId: DEVNET_BETTING_GAME_ID,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        bettingPackageId: TESTNET_BETTING_PACKAGE_ID,
        bettingGameId: TESTNET_BETTING_GAME_ID,
      }
    },
    // mainnet: {
    //   url: getFullnodeUrl("mainnet"),
    // },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
