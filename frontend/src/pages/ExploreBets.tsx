import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import axios from 'axios';

import { Bet } from "../types/Bet";
import ExpandedBetCard from "../components/BetCard";
import * as CONFIG from '../config.json';

const ExploreBets = () => {
    const account = useCurrentAccount();
    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedBet, setExpandedBet] = useState<Bet | null>(null);

    useEffect(() => {
        const fetchAllBets = async () => {
            let url = "";
            if (account) {
                url = `http://${CONFIG.server_host}:${CONFIG.server_port}/explorebets/${account.address}`;
            } else {
                url = `http://${CONFIG.server_host}:${CONFIG.server_port}/explorebets`;
            }
            try {
                const response = await axios.get(url);
                const data = response.data;
                setBets(data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        // Access the HTTP status code
                        console.error('HTTP Error Code:', error.response.status);
                        console.error('Error Data:', error.response.data);
                        setError(error.response.data);
                    } else {
                        // No response (e.g., network error)
                        console.error('Network error:', error.message);
                        setError(error.message);
                    }
                } else {
                    // Non-Axios error
                    console.error('Unexpected error:', error);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchAllBets();
    }, [account]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-slate-800 rounded-lg shadow-lg max-w-sm mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid border-gray-200 dark:border-gray-700 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Loading
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Please wait while we process your request.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-red-100 dark:bg-red-800 rounded-lg shadow-lg max-w-md mx-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-red-600 dark:text-red-300 mb-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    />
                </svg>
                <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">
                    Error
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-md opacity-80">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-sky-100 mb-6">
                Here are all the bets:
            </h1>

            {/* Bets List */}
            <div className="space-y-4">
                {bets.map((bet) => (
                    <div
                        key={bet.bet_id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-700"
                    >
                        {expandedBet && expandedBet.bet_id === bet.bet_id ? (
                            <ExpandedBetCard
                                bet={bet}
                                onClose={() => setExpandedBet(null)}
                                address={account?.address ?? null}
                            />
                        ) : (
                            <p
                                className="text-lg text-slate-700 dark:text-slate-300 cursor-pointer hover:underline"
                                onClick={() => setExpandedBet(bet)}
                            >
                                <span className="font-medium">Bet Question:</span> {bet.question}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExploreBets;