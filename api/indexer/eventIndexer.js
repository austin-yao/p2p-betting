"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupListeners = void 0;
const config_1 = require("../config");
const eventHandlers_1 = require("./eventHandlers");
const db_1 = __importDefault(require("../db"));
const client_1 = require("../client");
const EVENTS_TO_TRACK = [
    {
        type: `${config_1.CONFIG.PACKAGE}::betting`,
        filter: {
            MoveModule: {
                module: "betting",
                package: `${config_1.CONFIG.PACKAGE}`
            }
        },
        callback: eventHandlers_1.handleBetEvent,
    }
];
const executeEventJob = async (client, tracker, cursor) => {
    try {
        // get the events from the chain.
        // For this implementation, we are going from start to finish.
        // This will also allow filling in a database from scratch!
        let params = {};
        if (cursor === undefined) {
            params = {
                query: tracker.filter,
                order: 'ascending'
            };
        }
        else {
            params = {
                query: tracker.filter,
                cursor,
                order: 'ascending'
            };
        }
        const { data, hasNextPage, nextCursor } = await client.queryEvents(params);
        // handle the data transformations defined for each event
        await tracker.callback(data, tracker.type);
        // We only update the cursor if we fetched extra data (which means there was a change).
        if (nextCursor && data.length > 0) {
            await saveLatestCursor(tracker, nextCursor);
            return {
                cursor: nextCursor,
                hasNextPage,
            };
        }
    }
    catch (e) {
        console.error(e);
    }
    // By default, we return the same cursor as passed in.
    return {
        cursor,
        hasNextPage: false,
    };
};
const runEventJob = async (client, tracker, cursor) => {
    const result = await executeEventJob(client, tracker, cursor);
    // Trigger a timeout. Depending on the result, we either wait 0ms or the polling interval.
    setTimeout(() => {
        runEventJob(client, tracker, result.cursor);
    }, result.hasNextPage ? 0 : config_1.CONFIG.POLLING_INTERVAL_MS);
};
const getLatestCursor = async (tracker) => {
    const cursor = await db_1.default.cursor.findUnique({
        where: {
            id: tracker.type,
        },
    });
    return cursor || undefined;
};
const saveLatestCursor = async (tracker, cursor) => {
    const data = {
        eventSeq: cursor.eventSeq,
        txDigest: cursor.txDigest,
    };
    return db_1.default.cursor.upsert({
        where: {
            id: tracker.type,
        },
        update: data,
        create: { id: tracker.type, ...data },
    });
};
const setupListeners = async () => {
    for (const event of EVENTS_TO_TRACK) {
        console.log(event);
        runEventJob(client_1.client, event, await getLatestCursor(event));
    }
};
exports.setupListeners = setupListeners;
