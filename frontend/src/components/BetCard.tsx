import React, { useState } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";

import Decimal from 'decimal.js';
Decimal.set({
    toExpNeg: -20, // Minimum exponent for scientific notation
    toExpPos: 20,  // Maximum exponent for scientific notation
});


import { Bet } from "../types/Bet";

interface ExpandedBetCardProps {
    bet: Bet;
    onClose: () => void;
    address: string | null;
}

const ExpandedBetCard: React.FC<ExpandedBetCardProps> = ({ bet, onClose, address }) => {
    const bettingPackageId = useNetworkVariable("bettingPackageId");

    const [acceptLoading, setAcceptLoading] = useState(false);
    const [accept, setAccepted] = useState(!bet.agreed_by_both);
    const [acceptError, setAcceptError] = useState<string | undefined>(undefined);

    const suiClient = useSuiClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const acceptBet = () => {
        try {
            const tx = new Transaction();
            tx.setGasBudget((bet.against_amount ? bet.against_amount : 0) as number + 1000000);
            const betAmountCoin = tx.splitCoins(tx.gas, [tx.pure.u64(bet.against_amount as number)]);

            tx.moveCall({
                target: `${bettingPackageId}::betting::agree_to_bet`,
                arguments: [
                    tx.object(bet.bet_id),
                    betAmountCoin,
                    tx.object.clock(),
                ]
            });

            signAndExecuteTransaction(
                {
                    transaction: tx
                },
                {
                    onSuccess: async (result) => {
                        const { effects } = await suiClient.waitForTransaction({
                            digest: result.digest,
                            options: {
                                showEffects: true,
                                showRawEffects: true,
                                showEvents: true,
                                showObjectChanges: true
                            }
                        });

                        if (!effects) {
                            setAcceptError("Sorry, there was an error with accepting this bet");
                            setAcceptLoading(false);
                            return;
                        }
                        if (effects["status"]["status"] == "failure") {
                            setAcceptError(effects["status"]["error"]);
                            setAcceptLoading(false);
                            return;
                        }
                        setAccepted(false);
                        setAcceptLoading(false);
                    },
                    onError: async (error) => {
                        setAcceptError(error.message);
                        setAcceptLoading(false);
                    }
                }
            )
        } catch (error) {
            console.log("Error splitting coins. Likely not enough gas.");
        }
    }

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg">
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-slate-300 dark:border-slate-700 rounded-lg shadow-md">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-medium">
                                Bet Question
                            </th>
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-medium">
                                {bet.question}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800">
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                End Time
                            </td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                {new Date(Number(bet.game_end_time)).toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                Win Amount
                            </td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                {bet.for_amount ? (new Decimal(bet.for_amount.toString()).div(new Decimal(MIST_PER_SUI.toString()))).toString() : "Unknown Error"}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                Wager Amount
                            </td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300">
                                {bet.against_amount ? (new Decimal(bet.against_amount.toString()).div(new Decimal(MIST_PER_SUI.toString()))).toString() : "Unknown Error"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Conditional Messages */}
            <div className="mt-4 space-y-2">
                {acceptLoading && (
                    <p className="text-yellow-500 font-semibold">Loading...</p>
                )}
                {acceptError && (
                    <p className="text-red-500 font-semibold">Error: {acceptError}</p>
                )}
                {(bet.agreed_by_both) && (
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Bet already agreed
                    </p>
                )}
            </div>

            {/* Buttons */}
            <div className="mt-4 space-y-4">
                {!acceptLoading && !acceptError && (
                    <button
                        onClick={acceptBet}
                        disabled={bet.status !== 1 || !accept || !address}
                        className={`w-full py-2 px-4 text-white font-bold rounded-lg 
                ${bet.status !== 1 || !address
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {accept ? "Accept" : "Accepted"}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="w-full py-2 px-4 text-white font-bold rounded-lg bg-blue-500 hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </div>
    )

}

export default ExpandedBetCard;