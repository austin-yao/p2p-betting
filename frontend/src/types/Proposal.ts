export interface Proposal {
    id: string,
    proposer: string,
    oracleId: string,
    question: string,
    response: boolean,
    queryId: string
}