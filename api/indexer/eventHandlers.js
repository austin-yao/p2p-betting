"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBetEvent = void 0;
const db_1 = __importDefault(require("../db"));
const handleBetEvent = async (events, type) => {
    const updates = {};
    for (const event of events) {
        if (!event.type.startsWith(type))
            throw new Error('Invalid event module origin');
        const data = event.parsedJson;
        console.log(data);
        console.log(data.bet_id);
        if (!Object.hasOwn(updates, data.bet_id)) {
            updates[data.bet_id] = {
                betId: data.bet_id,
            };
        }
        if (event.type.endsWith("::BetCreated")) {
            const data = event.parsedJson;
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
        }
        else if (event.type.endsWith("::BetDeleted")) {
            const data = event.parsedJson;
            updates[data.bet_id].status = 2;
        }
        else if (event.type.endsWith("::BetAccepted")) {
            const data = event.parsedJson;
            updates[data.bet_id].agreed_by_both = true;
            updates[data.bet_id].acceptor = data.acceptor;
        }
        else if (event.type.endsWith("::BetPaidOut")) {
            const data = event.parsedJson;
            updates[data.bet_id].status = 3;
        }
        else if (event.type.endsWith("::BetSentToOracle")) {
            const data = event.parsedJson;
            updates[data.bet_id].sent_to_oracle = true;
        }
        else if (event.type.endsWith("::BetExpired")) {
            updates[data.bet_id].status = 4;
        }
        else {
            throw new Error("Invalid bet type");
        }
    }
    try {
        const promises = Object.values(updates).map(async (update) => {
            console.log(`Upserting betId: ${update.betId}`);
            const result = await db_1.default.bet.upsert({
                where: { betId: update.betId },
                create: update,
                update,
            });
            console.log(`Upsert successful for betId: ${update.betId}`);
            return result;
        });
        await Promise.all(promises);
    }
    catch (error) {
        console.error("Error while inserting:", error);
    }
};
exports.handleBetEvent = handleBetEvent;
