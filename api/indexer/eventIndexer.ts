import { EventId, QueryEventsParams, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from '../config';
import { handleBetEvent } from './eventHandlers';
import prisma from '../db';
import { client } from '../client';

type SuiEventsCursor = EventId | null | undefined;

type EventExecutionResult = {
    cursor: SuiEventsCursor;
    hasNextPage: boolean;
};

type EventTracker = {
    // The module that defines the type, with format `package::module`
    type: string;
    filter: SuiEventFilter;
    callback: (events: SuiEvent[], type: string) => any;
};

const EVENTS_TO_TRACK: EventTracker[] = [
    {
        type: `${CONFIG.PACKAGE}::betting`,
        filter: {
            MoveModule: {
                module: "betting",
                package: `${CONFIG.PACKAGE}`
            }
        },
        callback: handleBetEvent,
    }
]

const executeEventJob = async (
    client: SuiClient,
    tracker: EventTracker,
    cursor: SuiEventsCursor,
): Promise<EventExecutionResult> => {
    try {
        // get the events from the chain.
        // For this implementation, we are going from start to finish.
        // This will also allow filling in a database from scratch!
        let params = {};
        if (cursor === undefined) {
            params = {
                query: tracker.filter,
                order: 'ascending'
            }
        } else {
            params = {
                query: tracker.filter,
                cursor,
                order: 'ascending'
            }
        }

        const { data, hasNextPage, nextCursor } = await client.queryEvents(params as QueryEventsParams);

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
    } catch (e) {
        console.error(e);
    }
    // By default, we return the same cursor as passed in.
    return {
        cursor,
        hasNextPage: false,
    };
}

const runEventJob = async (client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) => {
    const result = await executeEventJob(client, tracker, cursor);

    // Trigger a timeout. Depending on the result, we either wait 0ms or the polling interval.
    setTimeout(
        () => {
            runEventJob(client, tracker, result.cursor);
        },
        result.hasNextPage ? 0 : CONFIG.POLLING_INTERVAL_MS,
    );
}

const getLatestCursor = async (tracker: EventTracker) => {
    const cursor = await prisma.cursor.findUnique({
        where: {
            id: tracker.type,
        },
    });

    return cursor || undefined;
};

const saveLatestCursor = async (tracker: EventTracker, cursor: EventId) => {
    const data = {
        eventSeq: cursor.eventSeq,
        txDigest: cursor.txDigest,
    };

    return prisma.cursor.upsert({
        where: {
            id: tracker.type,
        },
        update: data,
        create: { id: tracker.type, ...data },
    });
};

export const setupListeners = async () => {
    for (const event of EVENTS_TO_TRACK) {
        runEventJob(client, event, await getLatestCursor(event));
    }
};

