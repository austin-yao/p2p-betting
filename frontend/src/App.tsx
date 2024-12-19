import { ConnectButton } from "@mysten/dapp-kit";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import ActiveBets from "./pages/ActiveBets";
import CreateBet from "./pages/CreateBet";
import ExploreBets from './pages/ExploreBets';
import Oracle from "./pages/Oracle";

function App() {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-zinc-100 to-blue-100 dark:from-slate-800 dark:via-sky-900 dark:to-slate-900">
      <div className="container mx-auto px-8 py-6 min-h-screen">
        <Router>
          <div>
            <div className="flex justify-between items-center mb-8">
              <NavBar />
              <ConnectButton />
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/createbet" element={<CreateBet />} />
              <Route path="/bets" element={<ActiveBets />} />
              <Route path="/explorebets" element={<ExploreBets />} />
              <Route path="/oracle" element={<Oracle />} />
            </Routes>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
