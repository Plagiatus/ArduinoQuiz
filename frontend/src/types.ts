export interface GameData {
    timeout: number,
    players: Player[],
    type: GameType,
    data: undefined | FamilyFeudData,
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
    JEOPARDY
}

export interface FamilyFeudData {
    type: "ff",
    currentQuestion: FamilyFeudQuestion,
    visibleAnswers: number[],
}

export interface FamilyFeudFullGameData {
    questions: FamilyFeudQuestion[],
}

interface FamilyFeudQuestion {
    question: string,
    answers: FamilyFeudAnswer[],
}
interface FamilyFeudAnswer {
    answer: string,
    value: number,
}

export interface JeopardyData {
    type: "jeopardy",
}

export type HardwareCommand = HardwareButtonCommand | HardwarePlayerCommand;

interface HardwareButtonCommand {
    command: "reset" | "correct" | "wrong",
}
interface HardwarePlayerCommand {
    player: number,
}