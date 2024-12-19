import { useState } from 'react';
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import * as Form from "@radix-ui/react-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateBet = () => {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();


    const bettingPackageId = useNetworkVariable("bettingPackageId");
    // We don't even need to technically go on-chain, can keep data of all the bets we have and go through them to see which ones include this user.

    if (!account) {
        return <h1>Please connect your account.</h1>
    }

    const createBet = (event: any) => {
        setLoading(true);
        setError(null);
        setResult(null);

        event.preventDefault();
        const formElements = event.target.elements;
        const question = formElements.question.value;
        const wager = formElements.wager.value as number;
        const against_amount = formElements.against_amount.value as number;
        const end_date = selectedDate?.getTime() || Date.now() + 1000 * 60 * 10;


        const mistAmountWager = wager * Number(MIST_PER_SUI);
        const mistAmountAgainst = against_amount * Number(MIST_PER_SUI);

        const tx = new Transaction();
        // tx.setGasBudget(1000000000);

        const betAmountCoin = tx.splitCoins(tx.gas, [tx.pure.u64(mistAmountWager)]);

        const bet_id_predicted = tx.moveCall({
            target: `${bettingPackageId}::betting::create_bet`,
            arguments: [
                tx.pure.string(question),
                tx.pure.u64(mistAmountWager),
                tx.pure.u64(mistAmountAgainst),
                tx.pure.u64(end_date),
                betAmountCoin,
                tx.object.clock()
            ]
        });

        signAndExecuteTransaction(
            {
                transaction: tx
            },
            {
                onSuccess: async (result) => {
                    console.log("Success");
                    const { effects } = await suiClient.waitForTransaction({
                        digest: result.digest,
                        options: {
                            showEffects: true,
                            showRawEffects: true,
                            showEvents: true,
                            showObjectChanges: true,
                        }
                    });
                    // console.log(result);
                    console.log(effects);

                    if (!effects) {
                        setError("Sorry, there was an error with your transaction");
                        setLoading(false);
                        return;
                    }
                    if (effects["status"]["status"] == "failure") {
                        setError(effects["status"]["error"]);
                        setLoading(false);
                        return;
                    }
                    const bet_id = effects?.["created"]?.[0]?.["reference"]?.["objectId"] ?? "None";
                    if (bet_id === "None") {
                        setResult("Error with creating a bet. Please try again.");
                    } else {
                        setResult(bet_id);
                        console.log(bet_id_predicted);
                        setLoading(false);
                    }
                },
                onError: async (error) => {
                    console.log("Error occurred");
                    console.log(error);
                    setError(error);
                    setLoading(false);
                }
            },
        );
    };

    return (
        <div>
            <div className="max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-sky-100 mb-6">Create a Bet:</h1>
                <Form.Root onSubmit={createBet} className="space-y-6">
                    {/* Question Field */}
                    <Form.Field name="question" className="flex flex-col">
                        <Form.Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Statement
                        </Form.Label>
                        <Form.Control asChild>
                            <input
                                required
                                className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                                placeholder="Enter your statement"
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Wager Field */}
                    <Form.Field name="wager" className="flex flex-col">
                        <Form.Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Wager
                        </Form.Label>
                        <Form.Control asChild>
                            <input
                                required
                                className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                                placeholder="Enter wager amount"
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Against Amount Field */}
                    <Form.Field name="against_amount" className="flex flex-col">
                        <Form.Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Against Amount
                        </Form.Label>
                        <Form.Control asChild>
                            <input
                                required
                                className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                                placeholder="Enter against amount"
                            />
                        </Form.Control>
                    </Form.Field>

                    {/* Date Picker Field */}
                    <Form.Field name="end_date" className="flex flex-col">
                        <Form.Label className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            End Date
                        </Form.Label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            showTimeSelect
                            timeIntervals={15}
                            minDate={new Date()}
                            placeholderText="Select a date and time"
                            className="p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-400 focus:outline-none dark:bg-slate-700 dark:text-white"
                        />
                    </Form.Field>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !account}
                        className={`w-full py-3 px-6 text-lg font-semibold text-white rounded-lg transition-colors
                    ${loading || !account
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"}
                    `}
                    >
                        {loading ? "Loading..." : "Create Bet"}
                    </button>
                </Form.Root>
            </div>
            {result && (
                <div className="max-w-2xl mx-auto mt-9 p-6 bg-green-50 dark:bg-slate-800 rounded-lg shadow-md">
                    <p className="font-semibold text-lg">
                        Success! Resulting BetID: {result}
                    </p>
                </div>
            )}
            {error && (
                <div className="max-w-2xl mx-auto mt-9 p-6 bg-red-50 dark:bg-slate-800 rounded-lg shadow-md">
                    <p className="font-semibold text-lg">
                        Error: {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateBet;