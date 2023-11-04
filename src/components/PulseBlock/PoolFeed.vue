<template>
  <v-container>
    <div class="pool-feed">
      <div
        class="pool-updates__item"
        v-for="pool in this.pool_changes_sorted"
        :key="pool.id"
      >
        <div class="pool-updates__time">
          {{ pool.time | formatDistanceToNow() }} ago
        </div>
        <div class="pool-updates__icon">
          <v-icon>mdi-bank</v-icon>
        </div>
        <div class="pool-updates__content">
          <div class="pool-updates__type">{{ pool.type }}</div>
          <div v-if="pool.type == 'registration'" class="pool-updates__from-to">
            Pool Id: {{ pool.poolId | ellipsiscrypto(8) }}
          </div>
          <div v-if="pool.from && pool.to" class="pool-updates__from-to">
            {{ `${pool.from} -> ${pool.to}` }}
          </div>
        </div>
        <div class="pool-updates__details">
          <div class="pool-updates__ticker">
            {{ pool.ticker }}
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  small
                  :to="{ name: 'poolepochs', params: { poolid: pool.poolId } }"
                  color="primary"
                >
                  <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("app.pools.poolDetails") }}</span>
            </v-tooltip>
          </div>
          <div class="pool-updates__name">{{ pool.name }}</div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { db } from "@/firebase";

export default {
  name: "pool-feed",
  props: [],
  data() {
    return {
      pool_changes: [],
      recents: [],
    };
  },
  methods: {},
  watch: {
    network: {
      immediate: true,
      handler() {
        this.recents = [];
        if (typeof this.network !== "undefined") {
          this.$rtdbBind(
            "pool_changes",
            db
              .ref(this.network + "/all_pool_updates_blockfrost")
              .orderByChild("time")
              .limitToLast(20)
          );
        }
      },
    },
  },

  computed: {
    pool_changes_sorted: function () {
      return [...this.pool_changes].sort((a, b) => (a.time > b.time ? -1 : 1));
    },

    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
};
</script>
