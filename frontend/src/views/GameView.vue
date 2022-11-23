<template>
    <div id="gameview">
        <div id="player-wrapper" v-if="isSimple"
            :style="{ fontSize: `clamp(1em, calc(8vw / ${gameData.players.length}), 4em)` }">
            <div class="player" v-for="(player, pindex) in gameData.players"  :style="{ width: dimensionsBasedOnPlayer }">
                <div class="player-status" :class="{ locked: player.locked, active: player.active, correct: playerCorrect == pindex}"
                    :style="{ width: dimensionsBasedOnPlayer, height: dimensionsBasedOnPlayer }">
                    <img class="player-status-locked" src="/close.svg" v-if="player.locked">
                    <img class="player-status-correct" src="/check.svg" v-if="playerCorrect == pindex">
                </div>
                <div class="name-and-score-wrapper" v-if="!displayOnly">
                    <input type="text" v-model="player.name">
                    <input type="number" v-model="player.points" v-if="settings.pointsVisible">
                </div>
                <div class="name-and-score-wrapper" v-else>
                    <span>{{ player.name }}</span>
                    <span v-if="settings.pointsVisible">{{ player.points }}</span>
                </div>
            </div>
        </div>
        <div id="ff-wrapper" v-if="isFamilyFeud">

        </div>
        <div id="jeopardy-wrapper" v-if="isJeopardy">

        </div>
        <div id="controls-wrapper" v-if="!displayOnly">
            <div id="controls-points">
                <h3>Points</h3>
                <ToggleButton :text="'Display Points'" :enabled="settings.pointsVisible" @click="togglePointsVisibility" />
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
                <div id="numeric-modifier-wrapper">
                    <label for="correct-display-input">Correct Display Duration</label>
                    <span @click="modifyCorrectDisplayDuration(-1)">-</span>
                    <input type="number" v-model="settings.correctDisplayDuration" id="correct-display-input" min="0">
                    <span @click="modifyCorrectDisplayDuration(1)">+</span>
                </div>
            </div>
            <ToggleButton :text="'Fullscreen'" :enabled="inFullscreen" @click="toggleFullscreen" />
            <div>
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
import { GameData, GameType, HardwareCommand, Settings } from '../types';
import KeyboardControls from "../components/KeyboardControls.vue";
import ToggleButton from "../components/ToggleButton.vue";


export default defineComponent({
    components: { KeyboardControls, ToggleButton },
    props: {
        displayOnly: Boolean,
        controlView: Boolean,
    },
    data() {
        return {
            gameData: {} as GameData,

            initTimeout: NaN,
            correctDisplayTimeout: NaN,

            settings: {
                pointsVisible: true,
                pointModifier: 1,
                correctDisplayDuration: 3,
                addPointsWhenCorrect: true,
                deductPointsWhenInorrect: true,
            } as Settings,
            
            inFullscreen: false,
            hasRecievedNewGameData: false,
            hasRecievedNewSettings: false,
            showKeyboardControls: false,
            playerCorrect: -1,
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

            this.gameData = {
                timeout: 0,
                //@ts-ignore
                type: GameType[GameType[gameType]],
                players: [],
            }
            for (let i: number = 0; i < playerAmount; i++) {
                this.gameData.players.push({ active: false, locked: false, points: 0, name: "" });
            }
            this.handleSocketRequest("gameData");
        },
        recieveNewData(newData: GameData) {
            clearTimeout(this.initTimeout);
            this.hasRecievedNewGameData = true;
            this.gameData = newData;
        },
        recieveNewSettings(newSettings: Settings) {
            this.hasRecievedNewSettings = true;
            this.settings = newSettings;
        },
        handleSocketRequest(requestType: string) {
            switch (requestType) {
                case "gameData":
                    if (Object.keys(this.gameData).length > 0) {
                        Socket.socketSendMessage("newData", this.gameData);
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
            }
        },
        toggleAddPoints() { this.settings.addPointsWhenCorrect = !this.settings.addPointsWhenCorrect },
        toggleDeductPoints() { this.settings.deductPointsWhenInorrect = !this.settings.deductPointsWhenInorrect },
        togglePointsVisibility() { this.settings.pointsVisible = !this.settings.pointsVisible },
        toggleFullscreen() {
            this.inFullscreen = !this.inFullscreen
            if (this.inFullscreen) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        },
        switchToNextGametype() {
            this.gameData.type++;
            if (this.gameData.type > Object.keys(GameType).length / 2) {
                this.gameData.type = 1;
            }
        },
        modifyPointModifier(amt: number){this.settings.pointModifier += amt;},
        modifyCorrectDisplayDuration(amt: number){this.settings.correctDisplayDuration += amt;},
        // TODO: save & propagate settings

        //#region hardware handling
        hardwareHandlingSimple(hc: HardwareCommand): void {
            if ("command" in hc) {
                switch (hc.command) {
                    case 'correct':
                        for (let i = 0; i < this.gameData.players.length; i++) {
                            const p = this.gameData.players[i];
                            if (p.active == true) {
                                p.active = false;
                                if (this.settings.addPointsWhenCorrect) {
                                    p.points += this.settings.pointModifier;
                                }
                                this.playerCorrect = i;
                                if(this.correctDisplayTimeout) clearTimeout(this.correctDisplayTimeout);
                                this.correctDisplayTimeout = setTimeout(()=>{this.playerCorrect = -1}, this.settings.correctDisplayDuration * 1000);
                            }
                        }
                        break;
                    case 'wrong':
                        for (let p of this.gameData.players) {
                            if (p.active == true) {
                                p.active = false;
                                p.locked = true;
                                if (this.settings.deductPointsWhenInorrect) {
                                    p.points -= this.settings.pointModifier;
                                }
                            }
                        }
                        break;
                    case 'reset':
                        for (let p of this.gameData.players) {
                            p.active = false;
                            p.locked = false;
                        }
                        this.playerCorrect = -1;
                        if(this.correctDisplayTimeout) clearTimeout(this.correctDisplayTimeout);
                        this.correctDisplayTimeout = NaN;
                        break;
                }
            } else {
                if (this.gameData.players[hc.player]) {
                    this.gameData.players[hc.player].active = true;
                }
            }
        },
        //#endregion
    },
    computed: {
        isSimple(): boolean {
            return this.gameData.type === GameType.SIMPLE;
        },
        isFamilyFeud(): boolean {
            return this.gameData.type === GameType.FAMILYFEUD;
        },
        isJeopardy(): boolean {
            return this.gameData.type === GameType.JEOPARDY;
        },
        dimensionsBasedOnPlayer(): string {
            let amtPlayers = this.gameData.players.length;
            return Math.floor(90 / amtPlayers) + "vw";
        },
        nextGameType(): string {
            switch (this.gameData.type) {
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
        gameData: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewGameData && !this.displayOnly) Socket.socketSendMessage("newData", newData);
                this.hasRecievedNewGameData = false;
            },
            deep: true,
        },
        settings: {
            handler(newData, oldData){
                if (!this.hasRecievedNewSettings && !this.displayOnly) Socket.socketSendMessage("newSettings", newData);
                this.hasRecievedNewSettings = false;
            },
            deep: true,
        }
    },
    mounted() {
        Socket.socketListen("newData", this.recieveNewData);
        Socket.socketListen("newSettings", this.recieveNewSettings);
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
    background-color: aquamarine;
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

.name-and-score-wrapper>input,
.name-and-score-wrapper>span {
    text-align: center;
    border: none;
    display: block;
    width: 100%;
    margin-bottom: 0.2em;
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
}

#controls-wrapper>div {
    display: flex;
    flex-direction: column;
    gap: 2px;
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
</style>