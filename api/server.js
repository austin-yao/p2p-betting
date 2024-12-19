"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.send({ message: 'Hello world' });
    return;
});
app.get('/bet/:id', async (req, res) => {
    const betId = req.params.id;
    console.log("Here");
    console.log(betId);
    try {
        const bet = await db_1.default.bet.findUnique({
            where: { betId }
        });
        if (bet) {
            res.json(bet);
        }
        else {
            res.status(404).send("Fail");
        }
    }
    catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal server error");
    }
});
app.get('/mybets/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const bets = await db_1.default.bet.findMany({
            where: {
                OR: [
                    { creator: address },
                    { acceptor: address }
                ]
            }
        });
        if (bets) {
            res.json(bets);
        }
        else {
            res.status(404).send("No bets found");
        }
    }
    catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal server error");
    }
});
app.get('/explorebets/:address?', async (req, res) => {
    const address = req.params.address;
    if (address) {
        try {
            const bets = await db_1.default.bet.findMany({
                where: {
                    creator: {
                        not: address
                    },
                    agreed_by_both: false,
                    status: 1
                }
            });
            res.json(bets);
        }
        catch (error) {
            console.error("Database error:", error);
            res.status(500).send("Internal server error");
        }
    }
    else {
        try {
            const bets = await db_1.default.bet.findMany();
            res.json(bets);
        }
        catch (error) {
            console.error("Database error:", error);
            res.status(500).send("Internal server error");
        }
    }
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
