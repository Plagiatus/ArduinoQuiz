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
    SIMPLE = 1,
    FAMILYFEUD,
}

