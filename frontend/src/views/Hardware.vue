<template>
    <div id="hardware-view">
        <h2>Hardware "Emulator"</h2>
        <div class="hw-button-wrapper">
            <div class="hw-button red" :class="{active: players[0].enabled && !players[0].lockedOut}" @click="clickButton(0)"></div>
            <div class="hw-button blue" :class="{active: players[1].enabled && !players[1].lockedOut}" @click="clickButton(1)"></div>
            <div class="hw-button yellow" :class="{active: players[2].enabled && !players[2].lockedOut}" @click="clickButton(2)"></div>
            <div class="hw-button white" :class="{active: players[3].enabled && !players[3].lockedOut}" @click="clickButton(3)"></div>
        </div>
        <div class="hw-command-button-wrapper">
            <div class="hw-button active green" @click="correct()">Correct</div>
            <div class="hw-button active red" @click="wrong()">Wrong</div>
            <div class="hw-button active black" @click="reset()">Reset</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as Socket from "../composeables/socket";

export default defineComponent({
    data() {
        return {
            players: [
                { enabled: true, lockedOut: false },
                { enabled: true, lockedOut: false },
                { enabled: true, lockedOut: false },
                { enabled: true, lockedOut: false },
            ],
            activePlayer: -1,
            status: 0,
        }
    },
    methods: {
        clickButton(player: number) {
            if(this.status != 0) return;
            if(this.players[player].lockedOut) return;
            Socket.socketSendMessage("hardware", { player });
            for(let i: number = 0; i < this.players.length; i++){
                this.players[i].enabled = false;
            }
            this.players[player].enabled = true;
            this.status = 1;
            this.activePlayer = player;
        },
        clickButtonCommand(command: string) {
            Socket.socketSendMessage("hardware", { command });
        },
        reset(){
            this.clickButtonCommand("reset");
            this.status = 0;
            for(let i: number = 0; i < this.players.length; i++){
                this.players[i].enabled = true;
                this.players[i].lockedOut = false;
            }
        },
        correct(){
            if(this.status != 1) return;
            this.clickButtonCommand("correct");
            this.status = 0;
            this.enableAll();
        },
        wrong(){
            if(this.status != 1) return;
            this.clickButtonCommand("wrong");
            this.status = 0;
            this.players[this.activePlayer].lockedOut = true;
            this.enableAll();
        },
        enableAll(){
            for(let i: number = 0; i < this.players.length; i++){
                this.players[i].enabled = !this.players[i].lockedOut;
            }
        }
    }
})
</script>

<style>
.hw-button-wrapper,
.hw-command-button-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin: 1em;
}

.hw-command-button-wrapper {
    justify-content: center;
    gap: 5px;
}

.hw-button-wrapper > .hw-button {
    border-radius: 50%;
}

.hw-button {
    border: 1px solid var(--text-color);
    width: 200px;
    height: 200px;
    max-width: 20vw;
    max-height: 20vw;
    display: flex;
    place-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    user-select: none;
}

.hw-button.red {
    background-color: red;
}

.hw-button.blue {
    background-color: blue;
}

.hw-button.yellow {
    background-color: gold;
}

.hw-button.black {
    background-color: black;
}

.hw-button.white {
    background-color: white;
}
.hw-button.green {
    background-color: green;
}
.hw-button:not(.active):after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top:0;
    left:0;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 50%;
}
</style>