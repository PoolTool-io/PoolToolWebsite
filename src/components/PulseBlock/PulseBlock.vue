<template>
  <div class="pulse-block">
    <div class="pulse-block__inner">
      <div class="pulse-block__title">
        <span>Cardano Pulse</span>
      </div>
      <button
        class="pulse-block__close"
        @click.stop="togglePulseVisible(false)"
      >
        <v-icon>mdi-play</v-icon>
        <span class="pulse-block__close-title">Hide</span>
      </button>

      <v-tabs v-model="tab">
        <v-tab v-for="item in items" :key="item.title">
          {{ item.title }}
        </v-tab>
      </v-tabs>
    </div>

    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="item.title">
        <component :is="item.component"></component>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import NewsFeed from "./NewsFeed";
import PoolFeed from "./PoolFeed";

export default {
  name: "pulse-block",
  props: ["ismobile", "showBlockIcons", "pulseitem"],
  components: {
    NewsFeed,
    PoolFeed,
  },
  watch: {
    pulseitem: {
      handler: function (val) {
        if (val == "NewsFeed") {
          this.tab = 2;
        } else if (val == "PoolFeed") {
          this.tab = 1;
        }
      },
      deep: false,
    },
  },
  data() {
    return {
      tab: 0,
      items: [
        {
          title: "News Feed",
          component: NewsFeed,
        },
        {
          title: "Pool Feed",
          component: PoolFeed,
        },
      ],
    };
  },
  methods: {
    togglePulseVisible(toggle) {
      this.$emit("pulseVisible", toggle);
    },
  },
  computed: {},
};
</script>
