import { vpet } from "./rom-core";

export class Battle {
    constructor(
        public type: vpet,
        public p1: string,
        public p1_index: string,
        public p2: string,
        public p2_index: string,
        public bg: string,
        public rounds: Array<number>
    ) {}
}

export interface IChallenge {
    id?: number,
    challenger: string, // Originator username
    title: string,
    target: string,     // 'challenge/global' or 'challenge/user/{username}'
    global: boolean,
    accepted: boolean,
    type: vpet,
    bg: string,
    mon: string,
    stage: string,
    rom: string,
    timestamp?: number,       // Timestamp of when posted
}

export interface IChallengeMessage {
    message_class: "CR" | "CC" | "CRA"
}

export interface IChallengeResponse extends IChallengeMessage {   // Sent via MQTT after setting the Accepted flag
    from: string,
    title: string,
    type: vpet, 
    bg: string,
    mon: string,
    stage: string,
    rom: string,
    timestamp: number,
}

export interface IChallengeCheck extends IChallengeMessage {
    from: string,
    timestamp: number,
}

export interface IChallengeResponseAccepted extends IChallengeMessage {
    accepted: boolean,
    timestamp: number,
} 

export interface ILinkBattleData {
    original_challenge: IChallenge,
    response: IChallenge,
}