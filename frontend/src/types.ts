export interface GameData {
    timeout: number,
    players: Player[],
    type: GameType,
}

export interface QuestionDataCurrent {
    familyFeud: undefined | FamilyFeudData,
    jeopardy: undefined | JeopardyData,
}

export interface QuestionDataFull {
    familyFeud: undefined | FamilyFeudFullGameData,
    jeopardy: undefined | JeopardyFullGameData,
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
    currentQuestion: FamilyFeudQuestion,
    visibleAnswers: number[],
    questionVisible: boolean,
    mistakes: [number, number],
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
}

export interface JeopardyFullGameData {
}

export type HardwareCommand = HardwareButtonCommand | HardwarePlayerCommand;

interface HardwareButtonCommand {
    command: "reset" | "correct" | "wrong",
}
interface HardwarePlayerCommand {
    player: number,
}

export interface Settings {
    pointModifierCorrect: number,
    pointModifierIncorrect: number,
    correctDisplayDuration: number,

    namesVisible: boolean,
    pointsVisible: boolean,

    addPointsWhenIncorrect: boolean,
    addPointsToOthersWhenIncorrect: boolean,

    timer: number
} 