import React, { useState } from "react";
import { Bet } from "../types/Bet";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { MIST_PER_SUI } from "@mysten/sui/utils";

import { Slot } from "@radix-ui/react-slot";

import Decimal from 'decimal.js';

Decimal.set({
    toExpNeg: -20, // Minimum exponent for scientific notation
    toExpPos: 20,  // Maximum exponent for scientific notation
});

interface ExpandedMyBetCardProps {
    bet: Bet;
    onClose: () => void;
    address: string;
}

const ExpandedMyBetCard: React.FC<ExpandedMyBetCardProps> = ({ bet, onClose, address }) => {
    const bettingPackageId = useNetworkVariable("bettingPackageId");
    const bettingGameId = useNetworkVariable("bettingGameId");

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleted, setDeleted] = useState(bet.status === 3);
    const [deleteError, setDeleteError] = useState<string | undefined>(undefined);

    // TODO: need to keep track of whether the bet has been sent to oracle
    const [sentToOracle, setSentToOracle] = useState(bet.sent_to_oracle);
    const [sentToOracleLoading, setSentToOracleLoading] = useState(false);
    const [sentToOracleError, setSentToOracleError] = useState<string | undefined>(undefined);

    const suiClient = useSuiClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const deleteBet = () => {
        setDeleteLoading(false);
        setDeleteError(undefined);
        setDeleted(false);

        const tx = new Transaction();
        tx.moveCall({
            target: `${bettingPackageId}::betting::delete_bet`,
            arguments: [
                tx.object(bet.betId),
            ]
        });

        signAndExecuteTransaction(
            {
                transaction: tx
            },
            {
                onSuccess: async (result) => {
                    console.log("Successfully deleted bet");
                    const { effects } = await suiClient.waitForTransaction({
                        digest: result.digest,
                        options: {
                            showEffects: true,
                            showRawEffects: true,
                            showEvents: true,
                            showObjectChanges: true
                        }
                    });

                    console.log(effects);

                    if (!effects) {
                        setDeleteError("Sorry, there was an error with deleting your bet");
                        setDeleteLoading(false);
                        return;
                    }
                    if (effects["status"]["status"] == "failure") {
                        setDeleteError(effects["status"]["error"]);
                        setDeleteLoading(false);
                        return;
                    }
                    setDeleted(true);
                    setDeleteLoading(false);
                },
                onError: async (error) => {
                    console.log("Error occurred");
                    console.log(error);
                    setDeleteError(error.message);
                    setDeleteLoading(false);
                }
            }
        )
    }

    const sendBetToOracle = async () => {
        const tx = new Transaction();
        tx.setGasBudget(10000000);
        tx.moveCall({
            target: `${bettingPackageId}::betting::send_bet_to_oracle`,
            arguments: [
                tx.object(bettingGameId),
                tx.object(bet.betId),
                tx.object.clock(),
            ]
        });

        signAndExecuteTransaction(
            {
                transaction: tx
            },
            {
                onSuccess: async (result) => {
                    console.log("Successfully sent bet to oracle");
                    const { effects } = await suiClient.waitForTransaction({
                        digest: result.digest,
                        options: {
                            showEffects: true,
                            showRawEffects: true,
                            showEvents: true,
                            showObjectChanges: true
                        }
                    });

                    console.log(effects);

                    if (!effects) {
                        setSentToOracleError("Sorry, there was an error with sending your bet to the oracle");
                        setSentToOracleLoading(false);
                        return;
                    }
                    if (effects["status"]["status"] == "failure") {
                        setSentToOracleError(effects["status"]["error"]);
                        setSentToOracleLoading(false);
                        return;
                    }
                    setSentToOracle(true);
                    setSentToOracleLoading(false);
                },
                onError: async (error) => {
                    console.log("Error occurred");
                    console.log(error);
                    setSentToOracleError(error.message);
                    setSentToOracleLoading(false);
                }
            }
        )
    }

    const analyzeBetStatus = (status: Number) => {
        if (status == 1) {
            return "Active";
        } else if (status == 2) {
            return "Deleted";
        } else if (status == 3) {
            return "Paid out";
        } else {
            return "Expired";
        }
    }


    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg">
            <Slot>
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse border border-slate-300 dark:border-slate-700 rounded-lg shadow-md">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-medium">
                                        Statement
                                    </th>
                                    <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-medium">
                                        {bet.question}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800">
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        For Amount
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        {bet.for_amount ? (new Decimal(bet.for_amount.toString()).div(new Decimal(MIST_PER_SUI.toString()))).toString() : "Unknown Error"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        Against Amount
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        {bet.against_amount ? (new Decimal(bet.against_amount.toString()).div(new Decimal(MIST_PER_SUI.toString()))).toString() : "Unknown Error"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        Status
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        {analyzeBetStatus(bet.status)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        Side
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        {bet.creator == address ? "Yes" : "No"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        End Time
                                    </td>
                                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                        {new Date(Number(bet.game_end_time)).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Conditional Messages */}
                    {bet.status == 2 && (
                        <p className="text-red-500 font-semibold">Bet Deleted</p>
                    )}
                    {deleteLoading && (
                        <p className="text-yellow-500 font-semibold">Loading...</p>
                    )}
                    {deleteError && (
                        <p className="text-red-500 font-semibold">
                            Error: {deleteError}
                        </p>
                    )}

                    {/* Delete Bet Button */}
                    {!deleted && !deleteLoading && !deleteError && (
                        <button
                            onClick={() => deleteBet()}
                            disabled={bet.status !== 1 || bet.agreed_by_both}
                            className={`w-full py-2 px-4 text-white font-bold rounded-lg 
                            ${bet.status !== 1 || bet.agreed_by_both
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            Delete Bet
                        </button>
                    )}

                    {/* Oracle Settlement */}
                    {sentToOracle && bet.status == 1 && (
                        <p className="text-blue-500 font-semibold">
                            Settlement Processing
                        </p>
                    )}
                    {sentToOracleLoading && (
                        <p className="text-yellow-500 font-semibold">Loading...</p>
                    )}
                    {sentToOracleError && (
                        <p className="text-red-500 font-semibold">
                            Error: {sentToOracleError}
                        </p>
                    )}
                    {!sentToOracle && !sentToOracleLoading && !sentToOracleError && (
                        <button
                            onClick={() => sendBetToOracle()}
                            disabled={
                                !bet.agreed_by_both ||
                                bet.status !== 1 ||
                                Date.now() < Number(bet.game_end_time)
                            }
                            className={`w-full py-2 px-4 text-white font-bold rounded-lg 
                            ${!bet.agreed_by_both ||
                                    bet.status !== 1 ||
                                    Date.now() < Number(bet.game_end_time)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                        >
                            Send to Oracle
                        </button>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 text-white font-bold rounded-lg bg-blue-500 hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </Slot>
        </div>
    );
}

export default ExpandedMyBetCard;