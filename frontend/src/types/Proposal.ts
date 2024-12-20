export interface Proposal {
    id: string,
    proposer: string,
    oracle_id: string,
    question: string,
    response: boolean,
    query_id: string
}