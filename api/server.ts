import cors from 'cors';
import express from 'express';
import prisma from './db';
import fs from 'fs';
import https from 'https';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (_req, res) => {
    res.send({ message: 'Hello world' });
    return;
});

app.get('/bet/:id', async (req, res) => {
    const bet_id = req.params.id;
    try {
        const bet = await prisma.bet.findUnique({
            where: { bet_id }
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

// Load SSL Certificates
const sslOptions = {
    key: fs.readFileSync('server.key'), // Path to your private key
    cert: fs.readFileSync('server.cert') // Path to your certificate
};

// Start HTTPS Server
https.createServer(sslOptions, app).listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});