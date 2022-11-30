<template>
    <span class="numeric-modifier-wrapper">
        <label for="correct-display-input">{{ label }}</label>
        <span class="numeric-modifier-btn numeric-modifier-deduct" @click="modifyValue(-1 * step)">-</span>
        <input type="number" v-model="currentValue" id="correct-display-input" @change="updateValue">
        <span class="numeric-modifier-btn numeric-modifier-add" @click="modifyValue(1 * step)">+</span>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        label: {
            type: String, required: true, default: "",
        },
        value: {
            type: Number, required: true, default: 0,
        },
        step: {
            type: Number, required: false, default: 1,
        },
    },
    data() {
        return {
            currentValue: this.value,
            changed: false,
        }
    },
    methods: {
        modifyValue(amt: number) {
            console.log({ amt, value: this.value, currentValue: this.currentValue });
            this.$emit("modifyValue", amt);
        },
        updateValue() {
            this.modifyValue(this.currentValue - this.value);
        }
    },
    watch: {
        value() {
            this.currentValue = this.value;
        }
    }
});

</script>

<style>
.numeric-modifier-wrapper {
    user-select: none;
    display: flex;
}

.numeric-modifier-wrapper>input {
    border: none;
    width: 3em;
    flex-grow: 1;
}

.numeric-modifier-wrapper>* {
    padding: 0.6em;
    text-align: center;
}

.numeric-modifier-btn {
    background-color: var(--bg-color2);
    cursor: pointer;
    border: 1px solid var(--text-color);
    font-weight: 800;
    width: 2em;
    display: inline-block;
    border-color: var(--bg-color2);
}

.numeric-modifier-btn:hover {
    border-color: var(--text-color);
}

.numeric-modifier-deduct {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    margin-right: 0.2em;
}

.numeric-modifier-add {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    margin-left: 0.2em;
}
</style>