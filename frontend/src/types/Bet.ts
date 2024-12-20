export interface Bet {
    id: Number,
    bet_id: string,
    creator: string | undefined,
    acceptor: string | undefined,
    question: string | undefined,
    for_amount: Number | undefined,
    against_amount: Number | undefined,
    agreed_by_both: boolean,
    game_start_time: string,
    game_end_time: string,
    status: Number,
    create_time: string,
    sent_to_oracle: boolean,
    winner: string
}