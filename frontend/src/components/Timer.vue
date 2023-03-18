<template>
    <div class="timer" ref="timer" :class="{ended: timeLeft === 0}">
        <span class="timer-time">
            {{ timeLeft.toFixed(3) }}
        </span>
        <div class="timer-visual" :style="{
            width: visualWidth + 'px'
        }"></div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        duration: {
            type: Number, required: true, default: 3,
        },
    },
    data() {
        return {
            timeLeft: 0,
            durationMS: this.duration * 1000,
            startTime: Date.now(),
            fullWidth: 0,
            visualWidth: 0,
        }
    },
    methods: {
        updateTime() {
            requestAnimationFrame(this.updateTime);
            let timeElapsed = Date.now() - this.startTime;
            this.timeLeft = Math.max(0, this.durationMS - timeElapsed) / 1000;
            this.visualWidth = this.fullWidth * (this.timeLeft / this.duration);
        }
    },
    mounted() {
        this.startTime = Date.now();
        requestAnimationFrame(this.updateTime);
        this.fullWidth = (<HTMLDivElement>this.$refs.timer).clientWidth;
    },
})

</script>

<style>
.timer {
    position: relative;
}

.timer-time {
    position: relative;
    z-index: 11;
}

.timer-visual {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: var(--red);
    z-index: 10;
}

.timer.ended {
    animation: grow 1s infinite;
}

@keyframes grow {
    0% {scale: 1}
    50% {scale: 1.2}
    100% {scale: 1}
}
</style>