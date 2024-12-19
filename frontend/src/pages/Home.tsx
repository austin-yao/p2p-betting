const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center">
            <header className="text-center mb-9">
                <h1 className="text-5xl sm:text-8xl font-bold drop-shadow-md rounded-lg
            bg-gradient-to-r bg-clip-text text-transparent  
            from-slate-600 via-sky-100 to-slate-600 dark:from-slate-100 dark:via-sky-700 dark:to-slate-100
            animate-text pb-5
            ">
                    Welcome to Peer-to-Peer Betting on SUI
                </h1>
                <p className="mt-4 text-lg sm:text-xl font-semibold dark:text-sky-300 opacity-60">
                    Bet with anyone, on anything.
                </p>
            </header>

            {/* Instructions Section */}
            <section className="text-center mx-9 px-9 py-8 bg-gray-50 dark:bg-slate-800 shadow-md rounded-lg max-w-3xl opacity-80">
                <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-300">
                    How It Works
                </h2>
                <ul className="text-left text-lg space-y-3 leading-relaxed dark:text-slate-300">
                    <li className="flex items-center ">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white \ text-sm rounded-full font-bold mr-3">
                            1
                        </span>
                        Connect your wallet to get started.
                    </li>
                    <li className="flex items-center ">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-sm rounded-full font-bold mr-3">
                            2
                        </span>
                        Create a bet or agree to an existing one.
                    </li>
                    <li className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-sm rounded-full font-bold mr-3">
                            3
                        </span>
                        Contribute to the community oracle and earn rewards.
                    </li>
                    <li className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-sm rounded-full font-bold mr-3">
                            4
                        </span>
                        Track your bets and wait for your winnings!
                    </li>
                </ul>
            </section>
        </div >
    );
};

export default Home;