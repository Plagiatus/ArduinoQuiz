export interface GameData {
    timeout: number,
    players: Player[],
    type: GameType,
}

export interface Player {
    name: string,
    points: number,
    locked: boolean,
    active: boolean,
}

export enum GameType {
    FIRST_COME = 1,
    LOCKOUT,
    FAMILYFEUD,
}

