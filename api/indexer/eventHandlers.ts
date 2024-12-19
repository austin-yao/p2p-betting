import { SuiEvent } from '@mysten/sui/client';
import { Prisma } from '@prisma/client';
import prisma from '../db';

type BetEvent = BetCreated | BetDeleted | BetAccepted | BetPaidOut;

type BetCreated = {
    bet_id: string,
    creator: string,
    question: string,
    for_amount: number,
    against_amount: number,
    agreed_by_both: boolean,
    game_start_time: string,
    game_end_time: string,
    status: number,
    create_time: string,
    sent_to_oracle: boolean
};

type BetDeleted = {
    bet_id: string,
    deleter: string,
};

type BetAccepted = {
    bet_id: string,
    acceptor: string,
};

type BetPaidOut = {
    bet_id: string,
    amount: number,
    winner: string,
}

type BetSentToOracle = {
    bet_id: string,
}

export const handleBetEvent = async (events: SuiEvent[], type: string) => {
    const updates: Record<string, Prisma.BetCreateInput> = {};

    for (const event of events) {
        if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
        const data = event.parsedJson as BetEvent;
        console.log(data);
        console.log(data.bet_id);

        if (!Object.hasOwn(updates, data.bet_id)) {
            updates[data.bet_id] = {
                betId: data.bet_id,
            };
        }

        if (event.type.endsWith("::BetCreated")) {
            const data = event.parsedJson as BetCreated;
            updates[data.bet_id].betId = data.bet_id;
            updates[data.bet_id].creator = data.creator;
            updates[data.bet_id].question = data.question;
            updates[data.bet_id].for_amount = Number(data.for_amount);
            updates[data.bet_id].against_amount = Number(data.against_amount);
            updates[data.bet_id].status = data.status;
            updates[data.bet_id].agreed_by_both = data.agreed_by_both;
            updates[data.bet_id].game_start_time = data.game_start_time;
            updates[data.bet_id].game_end_time = data.game_end_time;
            updates[data.bet_id].create_time = data.create_time;
            updates[data.bet_id].sent_to_oracle = false;
        } else if (event.type.endsWith("::BetDeleted")) {
            const data = event.parsedJson as BetDeleted;
            updates[data.bet_id].status = 2;
        } else if (event.type.endsWith("::BetAccepted")) {
            const data = event.parsedJson as BetAccepted;
            updates[data.bet_id].agreed_by_both = true;
            updates[data.bet_id].acceptor = data.acceptor;
        } else if (event.type.endsWith("::BetPaidOut")) {
            const data = event.parsedJson as BetPaidOut;
            updates[data.bet_id].status = 3;
        } else if (event.type.endsWith("::BetSentToOracle")) {
            const data = event.parsedJson as BetSentToOracle;
            updates[data.bet_id].sent_to_oracle = true;
        } else if (event.type.endsWith("::BetExpired")) {
            updates[data.bet_id].status = 4;
        } else {
            throw new Error("Invalid bet type");
        }
    }

    try {
        const promises = Object.values(updates).map(async (update) => {
            console.log(`Upserting betId: ${update.betId}`);
            const result = await prisma.bet.upsert({
                where: { betId: update.betId },
                create: update,
                update,
            });
            console.log(`Upsert successful for betId: ${update.betId}`);
            return result;
        });

        await Promise.all(promises);
    } catch (error) {
        console.error("Error while inserting:", error);
    }
}