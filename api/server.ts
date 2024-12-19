import cors from 'cors';
import express from 'express';
import prisma from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.send({ message: 'Hello world' });
    return;
});

app.get('/bet/:id', async (req, res) => {
    const betId = req.params.id;
    console.log("Here");
    console.log(betId);
    try {
        const bet = await prisma.bet.findUnique({
            where: { betId }
        });

        if (bet) {
            res.json(bet);
        } else {
            res.status(404).send("Fail");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal server error");
    }
})

app.get('/mybets/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const bets = await prisma.bet.findMany({
            where: {
                OR: [
                    { creator: address },
                    { acceptor: address }
                ]
            }
        });
        if (bets) {
            res.json(bets);
        } else {
            res.status(404).send("No bets found");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).send("Internal server error");
    }
})

app.get('/explorebets/:address?', async (req, res) => {
    const address = req.params.address;
    if (address) {
        try {
            const bets = await prisma.bet.findMany({
                where: {
                    creator: {
                        not: address
                    },
                    agreed_by_both: false,
                    status: 1
                }
            });
            res.json(bets);
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).send("Internal server error");
        }
    } else {
        try {
            const bets = await prisma.bet.findMany();
            res.json(bets);
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).send("Internal server error");
        }
    }
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});