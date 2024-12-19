import { useEffect, useState } from 'react';
import { useCurrentAccount } from "@mysten/dapp-kit";
import axios from 'axios';

import * as CONFIG from '../config.json';
import { Bet } from '../types/Bet';
import ExpandedMyBetCard from '../components/MyBetCard';

const ActiveBets = () => {
    const account = useCurrentAccount();

    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedBet, setExpandedBet] = useState<Bet | null>(null);

    useEffect(() => {
        const fetchBets = async () => {
            if (account) {
                try {
                    const response = await axios.get(`http://${CONFIG.server_host}:${CONFIG.server_port}/mybets/${account.address}`);
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
            };
        }

        fetchBets();
    }, [account]);

    if (!account) {
        return <h3>Wallet not connected</h3>;
    }

    if (loading) {
        return <h3>Loading</h3>
    }

    if (error) {
        return <h3>Error: {error}</h3>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-md opacity-80">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-sky-100 mb-6">
                Here are your bets:
            </h1>

            {/* Bets List */}
            <div className="space-y-4">
                {bets.map((bet) => (
                    <div
                        key={bet.betId}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-700"
                    >
                        {expandedBet && expandedBet.betId === bet.betId ? (
                            <ExpandedMyBetCard
                                bet={bet}
                                onClose={() => setExpandedBet(null)
                                }
                                address={account.address}
                            />
                        ) : (
                            <p
                                className="text-lg text-slate-700 dark:text-slate-300 cursor-pointer hover:underline"
                                onClick={() => setExpandedBet(bet)}
                            >
                                <span className="font-medium">Bet:</span> {bet.question} {bet.acceptor == account?.address && <p>(You accepted)</p>}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

};

export default ActiveBets;