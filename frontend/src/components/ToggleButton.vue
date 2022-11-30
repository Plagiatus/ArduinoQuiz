<template>
    <button class="toggle-btn-wrapper">
        <span class="toggle-btn-text">{{text}}</span>
        <span v-if="enabled" class="toggle-btn-status toggle-btn-on">on</span>
        <span v-if="!enabled" class="toggle-btn-status toggle-btn-off">off</span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        text: {type: String, required: true},
        enabled: {type: Boolean, required: true},
    },
    data(){
        return {}
    },
    methods: {}
});

</script>

<style>
.toggle-btn-wrapper {
    cursor: pointer;
    display: inline-flex;
    border-radius: 8px;
    padding: 0;
    color: var(--text-color);
    background-color: transparent;
}

.toggle-btn-text {
    background-color: var(--bg-color2);
    flex-grow: 1;
    padding: 0.6em 0.6em 0.6em 1.2em;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}
.toggle-btn-status {
    padding: 0.6em;
    margin-left: 0.2em;
    width: 3em;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    /* transition: 0.5s linear transform; */
}
.toggle-btn-on {
    background-color: var(--highlight);
}
.toggle-btn-off {
    background-color: var(--bg-color2);
}
/* 
.toggle-btn-on {
    transform: rotateX(90deg);
    transform-origin: top center;
} */
</style>