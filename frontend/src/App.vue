<script lang="ts">
import { defineComponent } from 'vue';
import FrontPage from './views/Frontpage.vue';
import GameView from './views/GameView.vue';
import Hardware from './views/Hardware.vue';

export default defineComponent({
  components: { FrontPage, GameView, Hardware },
  data(){
    return {
      hostname: "" as String,
      page: "" as String,
      displayOnly: false as Boolean,
      controlView: false as Boolean,
    }
  },
  mounted(){
    let url = new URL(window.location.href);
    this.hostname = url.hostname;
    this.page = url.searchParams.get("page") ?? "";
    this.displayOnly = !!url.searchParams.get("displayOnly") ?? false;
    this.controlView = !!url.searchParams.get("controlView") ?? false;
  },
})
</script>

<template>
  <GameView v-if="page=='view'" :control-view="controlView.valueOf()" :display-only="displayOnly.valueOf()"/>
  <Hardware v-if="page=='hardware'"/>
  <FrontPage v-if="page==''"/>
</template>
