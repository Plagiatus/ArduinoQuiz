<template>
    <div id="gameview">
        <div id="player-wrapper" v-if="isSimple"
            :style="{ fontSize: `clamp(1em, calc(8vw / ${generalGameData.players.length}), 4em)` }">
            <div class="player" v-for="(player, pindex) in generalGameData.players"
                :style="{ width: dimensionsBasedOnPlayer }">
                <div class="player-status"
                    :class="{ locked: player.locked, active: player.active, correct: playerCorrect == pindex && !player.locked }"
                    :style="{ width: dimensionsBasedOnPlayer, height: dimensionsBasedOnPlayer }">
                    <img class="player-status-locked" src="/close.svg" v-if="player.locked">
                    <img class="player-status-correct" src="/check.svg" v-else-if="playerCorrect == pindex">
                </div>
                <div class="name-and-score-wrapper" v-if="!displayOnly">
                    <input size="1" class="edit-display" type="text" v-model="player.name" v-if="settings.namesVisible">
                    <input size="1" class="edit-display" type="number" v-model="player.points"
                        v-if="settings.pointsVisible">
                </div>
                <div class="name-and-score-wrapper" v-else>
                    <span class="edit-display" v-if="settings.namesVisible">{{ player.name }}</span>
                    <SmoothNumberDisplay class="ff-player-points" v-if="settings.pointsVisible"
                        :value="player.points" />
                </div>
            </div>
        </div>
        <div id="ff-wrapper" v-if="isFamilyFeud">
            <div id="ff-loader"
                v-if="!questionData.familyFeud || !questionData.familyFeud.questions || questionData.familyFeud.questions.length === 0">
                <div v-if="!displayOnly">
                    <input type="file" accept="application/json" @change="setFilesToLoad" multiple>
                    <button @click="loadFFData">Load</button>
                </div>
                <div v-else>
                    <span>Waiting for the host to load the questions.</span>
                </div>
            </div>
            <div id="ff-game-wrapper" v-else>
                <div id="ff-game-and-controls">
                    <div class="ff-navigation" v-if="!displayOnly" @click="switchToFFQuestion(-1)" :disabled="gameProgress === 0">
                        <img src="/navigate_before.svg" alt="previous">
                    </div>
                    <div id="ff-game">
                        <div id="ff-question" :class="{ textHidden: !activeQuestionData.familyFeud?.questionVisible }"
                            @click="toggleFFQuestion">
                            {{ activeQuestionData.familyFeud?.currentQuestion.question }}
                        </div>
                        <div id="ff-answers-wrapper">
                            <div class="ff-answer"
                                v-for="(answer, aindex) in activeQuestionData.familyFeud?.currentQuestion.answers"
                                :class="{ textHidden: !activeQuestionData.familyFeud?.visibleAnswers.includes(aindex) }"
                                @click="toggleFFAnswer(aindex)">
                                <span class="ff-answer-text"> {{ answer.answer }} </span>
                                <span class="ff-answer-value"> {{ answer.value }} </span>
                            </div>
                        </div>

                        <div id="ff-player-wrapper">
                            <div class="ff-one-player">
                                <div class="ff-player-wrongs" :class="{ active: generalGameData.players[0].active }">
                                    <img src="/close.svg" alt="Mistake 1"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[0] >= 1 }">
                                    <img src="/close.svg" alt="Mistake 2"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[0] >= 2 }">
                                    <img src="/close.svg" alt="Mistake 3"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[0] >= 3 }">
                                </div>
                                <div class="ff-player-info" v-if="displayOnly">
                                    <SmoothNumberDisplay class="ff-player-points" v-if="settings.pointsVisible"
                                        :value="generalGameData.players[0].points" />
                                    <span class="ff-player-name" v-if="settings.namesVisible">
                                        {{ generalGameData.players[0].name }}</span>
                                </div>
                                <div class="ff-player-info" v-else>
                                    <input size="1" class="edit-display ff-player-points" type="number"
                                        v-model="generalGameData.players[0].points" v-if="settings.pointsVisible">
                                    <input size="1" class="edit-display ff-player-name" type="text"
                                        v-model="generalGameData.players[0].name" v-if="settings.namesVisible">
                                </div>
                            </div>
                            <div class="ff-one-player">
                                <div class="ff-player-info" v-if="displayOnly">
                                    <SmoothNumberDisplay class="ff-player-points" v-if="settings.pointsVisible"
                                        :value="generalGameData.players[1].points" />
                                    <span class="ff-player-name" v-if="settings.namesVisible">
                                        {{ generalGameData.players[1].name }}</span>
                                </div>
                                <div class="ff-player-info" v-else>
                                    <input size="1" class="edit-display ff-player-points" type="number"
                                        v-model="generalGameData.players[1].points" v-if="settings.pointsVisible">
                                    <input size="1" class="edit-display ff-player-name" type="text"
                                        v-model="generalGameData.players[1].name" v-if="settings.namesVisible">
                                </div>
                                <div class="ff-player-wrongs" :class="{ active: generalGameData.players[1].active }">
                                    <img src="/close.svg" alt="Mistake 1"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[1] >= 1 }">
                                    <img src="/close.svg" alt="Mistake 2"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[1] >= 2 }">
                                    <img src="/close.svg" alt="Mistake 3"
                                        :class="{ active: activeQuestionData.familyFeud && activeQuestionData.familyFeud.mistakes[1] >= 3 }">
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="ff-navigation" v-if="!displayOnly" @click="switchToFFQuestion(1)" :disabled="gameProgress === questionData.familyFeud.questions.length - 1">
                        <img src="/navigate_next.svg" alt="next">
                    </div>
                </div>
            </div>
            <div id="jeopardy-wrapper" v-if="isJeopardy">
                Jeopardy is not ready yet.
            </div>
        </div>
        <div id="controls-wrapper" v-if="!displayOnly">
            <div id="controls-points">
                <h3>Points</h3>
                <ToggleButton :text="'Display Points'" :enabled="settings.pointsVisible"
                    @click="togglePointsVisibility" />
                <div id="numeric-modifier-wrapper">
                    <label for="point-modifier-input">Point Modifier</label>
                    <span @click="modifyPointModifier(-1)">-</span>
                    <input type="number" v-model="settings.pointModifier" id="point-modifier-input">
                    <span @click="modifyPointModifier(1)">+</span>
                </div>
                <ToggleButton :text="'Add Points When Correct'" :enabled="settings.addPointsWhenCorrect"
                    @click="toggleAddPoints" />
                <ToggleButton :text="'Deduct Points When Incorrect'" :enabled="settings.deductPointsWhenInorrect"
                    @click="toggleDeductPoints" />
            </div>
            <div>
                <h3>Display</h3>
                <div id="numeric-modifier-wrapper">
                    <label for="correct-display-input">Correct Display Duration</label>
                    <span @click="modifyCorrectDisplayDuration(-1)">-</span>
                    <input type="number" v-model="settings.correctDisplayDuration" id="correct-display-input" min="0">
                    <span @click="modifyCorrectDisplayDuration(1)">+</span>
                </div>
                <ToggleButton :text="'Display Names'" :enabled="settings.namesVisible" @click="toggleNamesVisibility" />
                <ToggleButton :text="'Fullscreen'" :enabled="inFullscreen" @click="toggleFullscreen" />
            </div>
            <div>
                <h3>Game Specific</h3>
                <div v-if="isFamilyFeud || isJeopardy">
                    <label for="file-loader-in-settings">Game files</label><br>
                    <input type="file" accept="application/json" @change="setFilesToLoad" id="file-loader-in-settings"
                        multiple>
                    <button @click="loadFFData">Load</button>
                </div>
            </div>
            <div>
                <h3>Danger Zone</h3>
                <button @click="newGame">New Game</button>
                <button @click="switchToNextGametype">Switch to {{ nextGameType }}</button>
            </div>
        </div>
        <!-- <KeyboardControls v-if="controlView || showKeyboardControls" /> -->
        <button id="fullscreen-btn">
            <img src="/fullscreen.svg" alt="Fullscreen" v-if="!inFullscreen" @click="toggleFullscreen">
            <img src="/fullscreen_exit.svg" alt="Exit Fullscreen" v-if="inFullscreen" @click="toggleFullscreen">
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as Socket from "../composeables/socket";
import { GameData, GameType, HardwareCommand, Settings, QuestionDataCurrent, QuestionDataFull } from '../types';
import KeyboardControls from "../components/KeyboardControls.vue";
import ToggleButton from "../components/ToggleButton.vue";
import SmoothNumberDisplay from "../components/SmoothNumberDisplay.vue";


export default defineComponent({
    components: { KeyboardControls, ToggleButton, SmoothNumberDisplay },
    props: {
        displayOnly: Boolean,
        controlView: Boolean,
    },
    data() {
        return {
            generalGameData: {} as GameData,
            questionData: {} as QuestionDataFull,
            activeQuestionData: {} as QuestionDataCurrent,

            initTimeout: NaN,
            correctDisplayTimeout: NaN,
            filesToLoad: null as FileList | null,

            settings: {
                namesVisible: true,
                pointsVisible: true,
                pointModifier: 1,
                correctDisplayDuration: 3,
                addPointsWhenCorrect: true,
                deductPointsWhenInorrect: true,
            } as Settings,

            inFullscreen: false,
            showKeyboardControls: false,
            playerCorrect: -1,
            lastActivePlayer: -1,
            roundProgress: 0,
            gameProgress: 0,

            hasRecievedNewGameData: false,
            hasRecievedNewActiveQuestion: false,
            hasRecievedNewFullQuestionData: false,
            hasRecievedNewSettings: false,
        }
    },
    methods: {
        initGameData() {
            if (this.displayOnly) this.initTimeout = setTimeout(this.initGameData, 2000);
            else this.initTimeout = setTimeout(this.newGame, 2000);

            Socket.socketSendMessage("request", "gameData");
        },
        newGame() {
            clearTimeout(this.initTimeout);
            let playerAmount = NaN;
            let gameType = 0;

            playerAmount = 4;
            gameType = 1;

            while (isNaN(playerAmount) || playerAmount <= 1) {
                playerAmount = Number(prompt("How many players?", "2"))
            }
            while (Object.values(GameType).indexOf(gameType) < 0) {
                gameType = Number(prompt("What type of game?\n(1 = First Come, 2 = First Come + Lockout, 3 = Family Feud)", "1"));
            }

            this.generalGameData = {
                timeout: 0,
                //@ts-ignore
                type: GameType[GameType[gameType]],
                players: [],
            }
            for (let i: number = 0; i < playerAmount; i++) {
                this.generalGameData.players.push({ active: false, locked: false, points: 0, name: "" });
            }
            this.handleSocketRequest("gameData");
        },
        recieveNewData(newData: GameData) {
            clearTimeout(this.initTimeout);
            this.hasRecievedNewGameData = true;
            this.generalGameData = newData;
        },
        recieveNewSettings(newSettings: Settings) {
            this.hasRecievedNewSettings = true;
            this.settings = newSettings;
        },
        recieveNewActiveQuestionData(newQuestionData: QuestionDataCurrent) {
            this.hasRecievedNewActiveQuestion = true;
            this.activeQuestionData = newQuestionData;
        },
        recieveNewFullQuestionData(newQuestionData: QuestionDataFull) {
            this.hasRecievedNewActiveQuestion = true;
            this.questionData = newQuestionData;
        },
        handleSocketRequest(requestType: string) {
            switch (requestType) {
                case "gameData":
                    if (Object.keys(this.generalGameData).length > 0) {
                        Socket.socketSendMessage("newData", this.generalGameData);
                        Socket.socketSendMessage("newSettings", this.settings);
                    }
                    break;

                default:
                    break;
            }
        },
        keyControls(event: KeyboardEvent) {
            const { altKey, ctrlKey, shiftKey, key } = event;
            console.log({ altKey, ctrlKey, shiftKey, key });
            // event.preventDefault();
        },
        handleHardwareCommands(data: HardwareCommand) {
            console.log("hardware", data);
            if (this.isSimple) {
                this.hardwareHandlingSimple(data);
            } else if (this.isFamilyFeud) {
                this.hardwareHandlingFF(data);
            }
        },
        //#region settings
        toggleAddPoints() { this.settings.addPointsWhenCorrect = !this.settings.addPointsWhenCorrect },
        toggleDeductPoints() { this.settings.deductPointsWhenInorrect = !this.settings.deductPointsWhenInorrect },
        togglePointsVisibility() { this.settings.pointsVisible = !this.settings.pointsVisible },
        toggleNamesVisibility() { this.settings.namesVisible = !this.settings.namesVisible },
        toggleFullscreen() {
            this.inFullscreen = !this.inFullscreen
            if (this.inFullscreen) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        },
        switchToNextGametype() {
            this.generalGameData.type++;
            if (this.generalGameData.type > Object.keys(GameType).length / 2) {
                this.generalGameData.type = 1;
            }
            this.lastActivePlayer = -1;
            this.roundProgress = 0;
        },
        modifyPointModifier(amt: number) { this.settings.pointModifier += amt; },
        modifyCorrectDisplayDuration(amt: number) { this.settings.correctDisplayDuration += amt; },
        //#endregion 

        //#region hardware handling
        hardwareHandlingSimple(hc: HardwareCommand): void {
            if ("command" in hc) {
                switch (hc.command) {
                    case 'correct':
                        for (let i = 0; i < this.generalGameData.players.length; i++) {
                            const p = this.generalGameData.players[i];
                            if (p.active == true || this.lastActivePlayer === i) {
                                p.active = false;
                                p.locked = false;
                                if (this.settings.addPointsWhenCorrect) {
                                    p.points += this.settings.pointModifier;
                                }
                                this.playerCorrect = i;
                                if (this.correctDisplayTimeout) clearTimeout(this.correctDisplayTimeout);
                                this.correctDisplayTimeout = setTimeout(() => { this.playerCorrect = -1 }, this.settings.correctDisplayDuration * 1000);
                            }
                        }
                        break;
                    case 'wrong':
                        for (let i = 0; i < this.generalGameData.players.length; i++) {
                            const p = this.generalGameData.players[i];
                            if (p.active == true || this.lastActivePlayer === i) {
                                p.active = false;
                                p.locked = true;
                                if (this.settings.deductPointsWhenInorrect) {
                                    p.points -= this.settings.pointModifier;
                                }
                            }
                        }
                        break;
                    case 'reset':
                        for (let p of this.generalGameData.players) {
                            p.active = false;
                            p.locked = false;
                        }
                        this.playerCorrect = -1;
                        this.lastActivePlayer = -1;
                        if (this.correctDisplayTimeout) clearTimeout(this.correctDisplayTimeout);
                        this.correctDisplayTimeout = NaN;
                        break;
                }
            } else {
                if (this.generalGameData.players[hc.player]) {
                    this.generalGameData.players[hc.player].active = true;
                    this.lastActivePlayer = hc.player;
                }
            }
        },

        hardwareHandlingFF(hc: HardwareCommand): void {
            if (!this.activeQuestionData.familyFeud) return;
            if (this.roundProgress >= 5) return;
            if ("command" in hc) {
                this.generalGameData.players[0].active = false;
                this.generalGameData.players[1].active = false;

                switch (hc.command) {
                    case 'correct':
                        break;
                    case 'wrong':
                        this.activeQuestionData.familyFeud.mistakes[this.lastActivePlayer]++; // count up the active teams mistakes
                        if (this.roundProgress === 1) {    // a team buzzed but answered wrong
                            this.roundProgress = 2;
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                        } else if (this.roundProgress === 2) { // the second team has a chance to a better answer but answers wrong
                            this.roundProgress = 3;
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                        } else if (this.roundProgress === 3 && this.activeQuestionData.familyFeud.mistakes[this.lastActivePlayer] >= 3) { // answering team made 3 mistakes
                            this.roundProgress = 4;
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                        } else if (this.roundProgress === 4) {// enemy team couldn't steal it
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                            this.addPointsToActiveTeam();
                        }
                        break;
                    case 'reset':
                        break;
                }
            } else {
                if (hc.player >= 2) return;
                if (this.roundProgress != 0) return; // question was just revealed, set player active
                this.roundProgress = 1;
                this.generalGameData.players[hc.player].active = true;
                this.lastActivePlayer = hc.player;
            }
        },
        //#endregion

        //#region load question data
        setFilesToLoad(event: Event) {
            if (event.target && (<HTMLInputElement>event.target).files) {
                this.filesToLoad = (<HTMLInputElement>event.target).files;
            }
        },
        async loadFFData() {
            if (!this.filesToLoad || this.filesToLoad?.length === 0) {
                alert("no files selected");
                return;
            }
            this.questionData.familyFeud = { questions: [] };
            for (let i: number = 0; i < (this.filesToLoad?.length ?? 0); i++) {
                let file = this.filesToLoad[i];
                if (!file.name.endsWith(".json")) continue;
                try {
                    let json = await new Response(file).json()
                    if (json.questions && json.questions.length > 0) {
                        this.questionData.familyFeud.questions.push(...json.questions);
                    }
                } catch (error) {

                }
            }
            if (this.questionData.familyFeud.questions.length > 0) {
                this.activeQuestionData.familyFeud = { visibleAnswers: [], currentQuestion: this.questionData.familyFeud.questions[0], questionVisible: false, mistakes: [0, 0] }
            }
        },
        //#endregion

        //#region FF handling
        toggleFFQuestion() {
            if (this.activeQuestionData.familyFeud && !this.displayOnly) {
                this.activeQuestionData.familyFeud.questionVisible = !this.activeQuestionData.familyFeud.questionVisible;
            }
        },
        toggleFFAnswer(index: number) {
            if (this.activeQuestionData.familyFeud && this.activeQuestionData.familyFeud.visibleAnswers && !this.displayOnly) {
                let found = this.activeQuestionData.familyFeud.visibleAnswers.indexOf(index);
                if (found === -1) {
                    this.hardwareHandlingFF({ command: "correct" });
                    if (this.roundProgress === 1) {
                        this.roundProgress++;
                        // is this answer the highest? if not, switch teams
                        if (index > 0)
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                        else this.roundProgress = 3;
                    } else if (this.roundProgress === 2) {
                        this.roundProgress++;
                        // check if this answer was higher than the previous one, if not, switch teams
                        if (this.activeQuestionData.familyFeud.visibleAnswers[0] < index)
                            this.lastActivePlayer = (this.lastActivePlayer + 1) % 2; // make the other team active
                    } else if (this.roundProgress === 4 && this.activeQuestionData.familyFeud.visibleAnswers.length - 1 != this.activeQuestionData.familyFeud.currentQuestion.answers.length) {
                        // other team managed to steal it
                        this.addPointsToActiveTeam();
                    }

                    this.activeQuestionData.familyFeud.visibleAnswers.push(index);
                    //check if all answers were shown7
                    console.log(this.activeQuestionData.familyFeud.visibleAnswers.length, this.activeQuestionData.familyFeud.currentQuestion.answers.length)
                    if (this.activeQuestionData.familyFeud.visibleAnswers.length === this.activeQuestionData.familyFeud.currentQuestion.answers.length) {
                        this.addPointsToActiveTeam();
                    }
                }
                else
                    this.activeQuestionData.familyFeud.visibleAnswers.splice(found, 1);
            }
        },
        switchToFFQuestion(modifier: number) {
            if (!this.questionData.familyFeud || !this.activeQuestionData.familyFeud) return;
            this.gameProgress = Math.min(Math.max(this.gameProgress + modifier, 0), this.questionData.familyFeud.questions.length - 1 ?? 0);
            this.roundProgress = 0;
            this.lastActivePlayer = -1;
            this.activeQuestionData.familyFeud.currentQuestion = this.questionData.familyFeud.questions[this.gameProgress];
            this.activeQuestionData.familyFeud.mistakes = [0, 0];
            this.activeQuestionData.familyFeud.questionVisible = false;
            this.activeQuestionData.familyFeud.visibleAnswers = [];
        },
        addPointsToActiveTeam() {
            if (!this.activeQuestionData.familyFeud) return;
            if (this.roundProgress >= 5) return;

            this.roundProgress = 5;
            let total: number = 0;
            total = this.activeQuestionData.familyFeud.currentQuestion.answers.reduce(
                (accumulator, answer, currentIndex) => {
                    if (this.activeQuestionData.familyFeud?.visibleAnswers.includes(currentIndex)) {
                        accumulator += answer.value;
                    }
                    return accumulator;
                }, 0);
            this.generalGameData.players[this.lastActivePlayer].points += total;
        },
        //#endregion
    },
    computed: {
        isSimple(): boolean {
            return this.generalGameData.type === GameType.SIMPLE;
        },
        isFamilyFeud(): boolean {
            return this.generalGameData.type === GameType.FAMILYFEUD;
        },
        isJeopardy(): boolean {
            return this.generalGameData.type === GameType.JEOPARDY;
        },
        dimensionsBasedOnPlayer(): string {
            let amtPlayers = this.generalGameData.players.length;
            return Math.floor(90 / amtPlayers) + "vw";
        },
        nextGameType(): string {
            switch (this.generalGameData.type) {
                case GameType.SIMPLE:
                    return "Family Feud"
                case GameType.FAMILYFEUD:
                    return "Jeopardy"
                case GameType.JEOPARDY:
                    return "Simple"
            }
            return "";
        },
    },
    watch: {
        generalGameData: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewGameData && !this.displayOnly) Socket.socketSendMessage("newData", newData);
                this.hasRecievedNewGameData = false;
            },
            deep: true,
        },
        questionData: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewFullQuestionData && !this.displayOnly) Socket.socketSendMessage("newQuestionData", newData);
                this.hasRecievedNewFullQuestionData = false;
            },
            deep: true,
        },
        activeQuestionData: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewActiveQuestion && !this.displayOnly) Socket.socketSendMessage("newActiveData", newData);
                this.hasRecievedNewActiveQuestion = false;
            },
            deep: true,
        },
        settings: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewSettings && !this.displayOnly) Socket.socketSendMessage("newSettings", newData);
                this.hasRecievedNewSettings = false;
            },
            deep: true,
        }
    },
    mounted() {
        Socket.socketListen("newData", this.recieveNewData);
        Socket.socketListen("newSettings", this.recieveNewSettings);
        Socket.socketListen("newActiveData", this.recieveNewActiveQuestionData);
        Socket.socketListen("newQuestionData", this.recieveNewFullQuestionData);
        Socket.socketListen("request", this.handleSocketRequest);
        Socket.socketListen("hardware", this.handleHardwareCommands);
        this.initGameData();

    },
});
</script>

<style>
#gameview {
    padding: 2em;
    display: flex;
    flex-direction: column;
    height: 100vh;
}

code {
    color: darkred;
    background-color: beige;
    padding: 0.1em;
}

#player-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    gap: 2px;
}

.player {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 10vw;
    max-width: 50vh;
}

.player-status {
    border: 10px solid white;
    margin-bottom: 1em;
    min-height: 10vw;
    min-width: 10vw;
    max-height: 50vh;
    max-width: 50vh;
}

.player-status.active {
    background-color: var(--active);
}

.player-status.locked {
    border-color: var(--red);
    background-color: var(--red-light);
}

.player-status.correct {
    border-color: var(--green);
    background-color: var(--green-light);
}

.player-status-locked {
    width: 100%;
    height: 100%;
    filter: var(--red-filter)
}

.player-status-correct {
    width: 100%;
    height: 100%;
    filter: var(--green-filter)
}

.name-and-score-wrapper {
    width: 100%;
}

.name-and-score-wrapper>* {
    margin-bottom: 0.2em;
}

input.edit-display,
span.edit-display {
    text-align: center;
    border: none;
    display: block;
    width: 100%;
    background-color: var(--bg-color2);
}

input[type="number"] {
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
}

#fullscreen-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 0.5em;
    padding: 0.1em;
}

#fullscreen-btn>img {
    filter: var(--text-color-filter);
}

#controls-wrapper {
    display: flex;
    flex-grow: 1;
    align-items: flex-end;
    justify-content: space-around;
    margin-top: 2em;
}

#controls-wrapper>div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 100%;
}

#numeric-modifier-wrapper {
    user-select: none;
    display: flex;
}

#numeric-modifier-wrapper>input {
    border: none;
    width: 3em;
    flex-grow: 1;
}

#numeric-modifier-wrapper>* {
    padding: 0.6em;
    text-align: center;
}

#numeric-modifier-wrapper>span {
    background-color: var(--bg-color2);
    cursor: pointer;
    border: 1px solid var(--text-color);
    font-weight: 800;
    width: 2em;
    display: inline-block;
}

/* #region Family Feud*/
#ff-game-and-controls {
    display: flex;
}

#ff-game {
    flex-grow: 1;
    text-transform: uppercase;
    user-select: none;
}

.ff-navigation:hover:not([disabled = "true"]) {
    background-color: var(--bg-color2);
    cursor: pointer;
}

.ff-navigation {
    display: flex;
    align-items: center;
    margin: 0 1em;
}
.ff-navigation>img {
    filter: var(--text-color-filter);
    width: 3em;
    height: 3em;
}
.ff-navigation[disabled="true"]>img {
    opacity: 0.2;
}

.textHidden {
    /* font-size: 0 !important; */
    color: rgba(0, 0, 0, 0);
}

#ff-question {
    font-size: clamp(1.5em, 3.5vw, 3em);
    height: calc(1.2em + clamp(1.5em, 3.5vw, 3em));
    background-color: var(--bg-color2);
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

#ff-answers-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
}

.ff-answer {
    cursor: pointer;
    height: calc(0.8em + clamp(1em, 3vw, 2em));
    font-size: clamp(1em, 3vw, 2em);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3em 1em;
    background-color: var(--bg-color2);
}

#ff-player-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
    margin-top: 2em;
}

.ff-one-player {
    display: flex;
    gap: 1em;
}

.ff-player-wrongs {
    display: flex;
    gap: 0.2em;
}

.ff-player-wrongs.active {
    background-color: var(--active);
}

.ff-player-wrongs>img {
    width: clamp(3em, 8vw, 10em);
    height: clamp(3em, 8vw, 10em);
    filter: var(--text-color-filter);
    border: 0.2em solid var(--text-color);
    opacity: 0.5;
}

.ff-player-wrongs>img.active {
    filter: var(--red-filter);
    opacity: 1;
    border: 0.2em solid var(--red);
}

.ff-player-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1em;
}

.ff-player-points {
    background-color: var(--bg-color2);
    font-size: clamp(2em, 4vw, 3em);
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ff-player-name {
    background-color: var(--bg-color2);
    font-size: clamp(1em, 2vw, 2em);
}

/* #endregion */
</style>