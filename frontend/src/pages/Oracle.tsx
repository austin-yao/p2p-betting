import { useEffect, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";

import { Proposal } from "../types/Proposal";
import ProposalCard from "../components/ProposalCard";


const Oracle = () => {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const [proposalId, setProposalId] = useState<string | undefined>(undefined);
    const [proposal, setProposal] = useState<any>(null);
    const [proposalLoading, setProposalLoading] = useState<boolean>(false);
    const [proposalError, setProposalError] = useState<string | undefined>(undefined);
    const [userProposals, setUserProposals] = useState<Proposal[]>([]);
    const [userProposalsError, setUserProposalsError] = useState<string | undefined>(undefined);
    const [expandedProposal, setExpandedProposal] = useState<Proposal | null>(null);

    const bettingPackageId = useNetworkVariable("bettingPackageId");
    const bettingGameId = useNetworkVariable("bettingGameId");

    const { data, isPending: _, error } = useSuiClientQuery(
        "getObject",
        {
            id: proposalId as string,
        },
        {
            enabled: !!proposalId, // Only fetch if proposalId exists
        }
    );

    const { data: userProposalData, isPending: _userProposalDataPending, error: userProposalDataError } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account?.address as string,
            filter: {
                StructType: `${bettingPackageId}::betting::Proposal`
            },
            options: {
                showType: true,
                showContent: true
            },
        },
        {
            enabled: !!account,
        }
    )

    useEffect(() => {
        if (data) {
            setProposal(data as Proposal);
            setProposalLoading(false);
        }
        if (error) {
            setProposalError(error.message);
            setProposalLoading(false);
        }
    }, [data, error]);

    useEffect(() => {
        console.log(68);
        if (account) {
            if (userProposalData) {
                setUserProposals([]);
                console.log(72);
                userProposalData.data.forEach((obj) => {
                    if (obj.data?.type?.endsWith("::Proposal") && obj.data?.content) {
                        // @ts-ignore
                        const content = obj.data?.content?.fields as Record<string, any>;
                        console.log(content);
                        if ("id" in content && "oracle_id" in content && "proposer" in content && "query_id" in content && "question" in content && "response" in content) {
                            const proposal: Proposal = {
                                id: content["id"]["id"] || content["id"],
                                proposer: content["proposer"],
                                oracle_id: content["oracle_id"],
                                query_id: content["query_id"],
                                question: content["question"],
                                response: content["response"]
                            };
                            console.log(83);
                            setUserProposals([...userProposals, proposal]);
                        } else {

                        }
                    } else {

                    }
                });
            }
            if (userProposalDataError) {
                setUserProposalsError(userProposalDataError.message);
            }
        }
    }, [userProposalData, userProposalDataError])

    const requestProposal = () => {
        setProposal(undefined);
        setProposalError(undefined);
        setProposalLoading(true);

        const tx = new Transaction();
        tx.setGasBudget(10000000);

        tx.moveCall({
            target: `${bettingPackageId}::betting::request_validate`,
            arguments: [
                tx.object(bettingGameId),
                tx.object.random()
            ],
        });

        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: async (result) => {
                    console.log("Transaction successful");

                    const { effects } = await suiClient.waitForTransaction({
                        digest: result.digest,
                        options: {
                            showEffects: true,
                            showRawEffects: true,
                            showEvents: true,
                            showObjectChanges: true,
                        },
                    });

                    if (!effects || effects["status"]["status"] === "failure") {
                        setProposalError(
                            effects?.["status"]?.["error"] ?? "Transaction failed."
                        );
                        setProposalLoading(false);
                        return;
                    }

                    const proposal_id =
                        effects?.["created"]?.[0]?.["reference"]?.["objectId"] ?? "None";

                    if (proposal_id === "None") {
                        setProposalError("Error with requesting a proposal. Please try again.");
                        setProposalLoading(false);
                    } else {
                        setProposalId(proposal_id); // Trigger fetching of proposal details
                    }
                },
                onError: (error) => {
                    console.log("Transaction failed", error);
                    setProposalError(error.message);
                    setProposalLoading(false);
                },
            }
        );
    };

    return (
        <div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-3xl mx-auto space-y-6 opacity-80">
                {/* Request Proposal Button */}
                <button
                    onClick={requestProposal}
                    disabled={proposalLoading || !account}
                    className={`w-full py-2 px-4 text-white font-bold rounded-lg transition 
        ${proposalLoading || !account
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    Request Proposal
                </button>

                {/* Loading and Error States */}
                {proposalLoading && (
                    <p className="text-yellow-500 font-semibold">Loading...</p>
                )}

                {/* Proposal Details */}
                {proposal && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-sky-100 mb-2">
                            Proposal Details
                        </h3>
                        <pre className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(proposal, null, 2)}
                        </pre>
                    </div>
                )}

                {/* User Proposals List */}
                <div className="space-y-4">
                    {userProposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="p-4 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 shadow-sm"
                        >
                            {expandedProposal && expandedProposal.id === proposal.id ? (
                                <ProposalCard
                                    proposal={proposal}
                                    onResponseChange={(response) => {
                                        setUserProposals((prevProposals) =>
                                            prevProposals.map((p) =>
                                                p.id === proposal.id ? { ...p, response } : p
                                            )
                                        );
                                    }}
                                    onClose={() => setExpandedProposal(null)}
                                />
                            ) : (
                                <p
                                    className="text-lg font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:underline"
                                    onClick={() => setExpandedProposal(proposal)}
                                >
                                    Question: {proposal.question}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {proposalError && (
                <div className="p-6 bg-red-50 dark:bg-slate-800 mt-9 rounded-lg shadow-md max-w-3xl mx-auto space-y-6">
                    <p className="font-semibold">Error: {proposalError}</p>
                </div>
            )}
            {userProposalsError && (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-3xl mx-auto space-y-6">
                    <p className="font-semibold">{userProposalsError}</p>
                </div>
            )}
        </div>
    )
}

export default Oracle;