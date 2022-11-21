<template>
    <div id="gameview">
        <div id="player-wrapper" v-if="isFirstCome || isLockout"
            :style="{ fontSize: `clamp(1em, calc(8vw / ${gameData.players.length}), 4em)` }">
            <div class="player" v-for="player of gameData.players" :style="{ width: dimensionsBasedOnPlayer }">
                <div class="player-status" :class="{ locked: player.locked, active: player.active }"
                    :style="{ width: dimensionsBasedOnPlayer, height: dimensionsBasedOnPlayer }">
                    <img class="player-status-locked" src="/close.svg" v-if="player.locked">
                </div>
                <div class="name-and-score-wrapper" v-if="!displayOnly">
                    <input type="text" v-model="player.name">
                    <input type="number" v-model="player.points" v-if="pointsVisible">
                </div>
                <div class="name-and-score-wrapper" v-else>
                    <span>{{ player.name }}</span>
                    <span v-if="pointsVisible">{{ player.points }}</span>
                </div>
            </div>
        </div>
        <div id="controls-wrapper" v-if="!displayOnly">
            <ToggleButton :text="'Fullscreen'" :enabled="inFullscreen" @click="toggleFullscreen" />
            <ToggleButton :text="'Show Points'" :enabled="pointsVisible" @click="togglePointsVisibility" />
            <button @click="newGame">New Game</button>
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
import { GameData, GameType } from '../types';
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
            initTimeout: NaN,
            gameData: {} as GameData,
            showKeyboardControls: false,
            hasRecievedNewData: false,
            pointsVisible: true,
            inFullscreen: false,
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

            playerAmount = 3;
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
                players: []
            }
            for (let i: number = 0; i < playerAmount; i++) {
                this.gameData.players.push({ active: false, locked: false, points: 0, name: "" });
            }
            this.handleSocketRequest("gameData");
        },
        recieveNewData(newData: GameData) {
            clearTimeout(this.initTimeout);
            this.hasRecievedNewData = true;
            this.gameData = newData;
        },
        handleSocketRequest(requestType: string) {
            switch (requestType) {
                case "gameData":
                    if (Object.keys(this.gameData).length > 0) {
                        Socket.socketSendMessage("newData", this.gameData)
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
        handleHardwareCommands(data: any) {
            console.log("hardware", data);
        },
        togglePointsVisibility() { this.pointsVisible = !this.pointsVisible },
        toggleFullscreen() {
            this.inFullscreen = !this.inFullscreen
            if (this.inFullscreen) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        },
    },
    computed: {
        isFirstCome(): boolean {
            return this.gameData.type === GameType.FIRST_COME;
        },
        isLockout(): boolean {
            return this.gameData.type === GameType.LOCKOUT;
        },
        isFamilyFeud(): boolean {
            return this.gameData.type === GameType.FAMILYFEUD;
        },
        dimensionsBasedOnPlayer(): string {
            let amtPlayers = this.gameData.players.length;
            return Math.floor(90 / amtPlayers) + "vw";
        },
    },
    watch: {
        gameData: {
            handler(newData, oldData) {
                if (!this.hasRecievedNewData) Socket.socketSendMessage("newData", newData);
                this.hasRecievedNewData = false;
            },
            deep: true,
        }
    },
    mounted() {
        Socket.socketListen("newData", this.recieveNewData);
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

.player-status-locked {
    width: 100%;
    height: 100%;
    filter: var(--red-filter)
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
    flex-grow: 1;
}
</style>