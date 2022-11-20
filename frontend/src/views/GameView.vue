<template>
    <div id="gameview">
        <div id="player-wrapper" v-if="isFirstCome || isLockout">
            <div class="player" v-for="player of gameData.players">
                <div class="player-status" :class="{locked: player.locked, active: player.active}" :style="{width: dimensionsBasedOnPlayer, height: dimensionsBasedOnPlayer,}">
                    <img class="player-status-locked" src="/close.svg" v-if="player.locked">
                </div>
                <div v-if="!displayOnly">
                    <input type="text" v-model="player.name">
                    <input type="number" v-model="player.points" v-if="!isNaN(player.points)">
                </div>
                <div v-else>
                    <span>{{player.name}}</span>
                    <span>{{player.points}}</span>
                </div>
            </div>
        </div>
        <button @click="newGame" v-if="!displayOnly">New Game</button>
        <KeyboardControls v-if="controlView || showKeyboardControls"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as Socket from "../composeables/socket";
import { GameData, GameType } from '../types';
import KeyboardControls from "../components/KeyboardControls.vue";


export default defineComponent({
    components: { KeyboardControls },
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
            
            playerAmount = 6;
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
                this.gameData.players.push({ active: false, locked: false, points: NaN, name: "" });
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
        keyControls(event: KeyboardEvent){
            const {altKey, ctrlKey, shiftKey, key} = event;
            console.log({altKey, ctrlKey, shiftKey, key});
            // event.preventDefault();
        },
        handleHardwareCommands(data: any){
            console.log("hardware", data);
        }
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
            handler(newData, oldData){
                if(!this.hasRecievedNewData) Socket.socketSendMessage("newData", newData);
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
        
        if(!this.displayOnly) {
            window.addEventListener("keydown", this.keyControls);
        }
    },
});
</script>

<style>

#gameview {
    padding: 2em;
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
}

.player {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.player-status {
    border: 10px solid white;
    border-radius: .375rem;
    margin-bottom: 1em;
    min-height: 10vw;
    min-width: 10vw;
    max-height: 30vw;
    max-width: 30vw;
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

input {
    text-align: center;
}

</style>