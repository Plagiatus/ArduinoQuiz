<template>
    <span>
        {{ currentValue }}
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        value: {
            type: Number, requried: true, default: 0,
        },
        easing: {
            type: Boolean, default: true,
        },
        duration: {
            type: Number, default: 1000,
        },
    },
    data() {
        return {
            currentValue: this.value,
            startTime: undefined as number | undefined,
            startValue: 0,
        }
    },
    methods: {
        start() {
            requestAnimationFrame(this.count);
        },
        count(timestamp: number) {
            if (!this.startTime) {
                this.startTime = timestamp;
            }
            const progress = timestamp - this.startTime;
            const remaining = this.duration - progress;

            const countDirection = Math.sign(this.value - this.startValue);
            if (this.easing) {
                // if(countDirection > 0){
                // console.log("up",{countDirection}, this.startValue - this.ease(progress, 0, this.startValue - this.value, this.duration));
                this.currentValue = this.startValue - this.ease(progress, 0, this.startValue - this.value, this.duration);
                // } else {
                //     console.log("down", this.ease(progress, this.startValue, this.value - this.startValue, this.duration));
                //     this.currentValue = this.ease(progress, this.startValue, this.value - this.startValue, this.duration);
                // }
            } else {
                this.currentValue = this.startValue + (this.value - this.startValue) * (progress / this.duration);
            }
            this.currentValue = Number(this.currentValue.toFixed(0));

            const wentPast = countDirection < 0 ? this.currentValue < this.value : this.currentValue > this.value;
            if (wentPast) this.currentValue = this.value;

            if (progress < this.duration) { requestAnimationFrame(this.count) };
        },
        ease(t: number, b: number, c: number, d: number): number {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
        },
        done() {
            this.startTime = undefined;
        }
    },
    watch: {
        value(oldValue, newValue) {
            this.startTime = undefined;
            this.startValue = this.currentValue;
            this.start();
        }
    },

});

</script>

<style>

</style>