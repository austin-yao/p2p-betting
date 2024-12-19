import React, { useState } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { Transaction } from "@mysten/sui/transactions";

import { Proposal } from "../types/Proposal";

interface ProposalCardProps {
    proposal: Proposal;
    onResponseChange: (change: boolean) => void;
    onClose: () => void;
}

const PROP_STAKE = 10;

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onResponseChange, onClose }) => {
    const bettingPackageId = useNetworkVariable("bettingPackageId");
    const bettingGameId = useNetworkVariable("bettingGameId");

    const [send, setSend] = useState(false);
    const [sendError, setSendError] = useState<string | undefined>(undefined);
    const [sendLoading, setSendLoading] = useState(false);
    const [response, setResponse] = useState(proposal.response ? "True" : "False");

    const suiClient = useSuiClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const handleResponseChange = (value: string) => {
        setResponse(value);
        if (value == "True") {
            onResponseChange(true);
        } else {
            onResponseChange(false);
        }
    };

    const submitProposal = () => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);
            const propCoin = tx.splitCoins(tx.gas, [tx.pure.u64(PROP_STAKE as number)]);

            tx.moveCall({
                target: `${bettingPackageId}::betting::receiveValidate`,
                arguments: [
                    tx.object(bettingGameId),
                    tx.object(proposal.oracleId),
                    tx.object(proposal.id),
                    tx.pure.bool(proposal.response),
                    propCoin,
                ]
            });

            signAndExecuteTransaction(
                {
                    transaction: tx
                }, {
                onSuccess: async (result) => {
                    console.log("success");
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
                        setSendError("Sorry, there was an error with accepting this bet");
                        setSendLoading(false);
                        return;
                    }
                    if (effects["status"]["status"] == "failure") {
                        setSendError(effects["status"]["error"]);
                        setSendLoading(false);
                        return;
                    }
                    setSend(true);
                    setSendLoading(false);
                },
                onError: async (error) => {
                    console.log("Error occurred");
                    console.log(error);
                    setSendError(error.message);
                    setSendLoading(false);
                }
            }
            )
        } catch (error) {
            console.log("Error splititng coins. Likely not enough gas");
        }
    }

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg max-w-md mx-auto space-y-6">
            {/* Question */}
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Statement: {proposal.question}
            </p>

            {/* Select Dropdown */}
            <div className="relative">
                <select
                    value={response}
                    onChange={(e) => handleResponseChange(e.target.value)}
                    className="block w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-700 dark:text-slate-300"
                >
                    <option disabled>Select an option...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                </select>
            </div>

            {/* Loading and Error Messages */}
            {sendLoading && (
                <p className="text-yellow-500 font-semibold">Loading...</p>
            )}
            {sendError && (
                <p className="text-red-500 font-semibold">Error: {sendError}</p>
            )}

            {/* Submit Button */}
            <button
                onClick={submitProposal}
                disabled={send}
                className={`w-full py-2 px-4 text-white font-bold rounded-lg transition 
        ${send
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
            >
                {send ? "Submitted" : "Submit to Oracle"}
            </button>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="w-full py-2 px-4 text-white font-bold rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
                Close
            </button>
        </div>
    )
}

export default ProposalCard;