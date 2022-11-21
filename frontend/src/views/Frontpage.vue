<template>
    <div id="frontpage-wrapper">
        <h1>Choose View</h1>
        <div id="select-view-wrapper">
            <a class="select-view" href="/?page=view&displayOnly=1">
                Display Only
            </a>
            <a class="select-view" href="/?page=view">
                Display & Control
            </a>
            <a class="select-view" href="/?page=view&controlView=1">
                Control View
            </a>
        </div>
        <div id="select-view-wrapper">
            <a class="select-view" href="/?page=hardware">
                Hardware
            </a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        name: String,
    },
})
</script>

<style>
#frontpage-wrapper {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    flex-direction: column;
}


#select-view-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.select-view {
    display: block;
    padding: 1em;
    margin: 1em;
    font-size: 2em;
    line-height: 2;
    color: inherit;
    border-radius: .375rem;
    border: .1em solid white;
}

.select-view:hover {
    scale: 1.1;
}

@media screen and (max-width: 850px) {
    #select-view-wrapper {
        flex-direction: column;
    }
}
</style>