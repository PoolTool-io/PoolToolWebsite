<template>
  <div>
    <span
      class="font-weight-bold pr-4 text-subtitle-1"
      v-if="nicknameDefined(userdetails)"
    >
      {{ userdetails.nickName }}</span
    ><span v-else class="font-weight-bold pr-4 text-subtitle-1">{{
      "user_" + displayUserId.substring(0, 4)
    }}</span>
    <v-chip
      v-if="
        poolId != null &&
        userdetails != null &&
        typeof userdetails.activeDelegations != 'undefined' &&
        typeof userdetails.activeDelegations[poolId] != 'undefined'
      "
      label
      small
    >
      <span class="text-caption">
        {{
          userdetails.activeDelegations[poolId] | toada | numFormat("0,0.0a")
        }}₳</span
      >
    </v-chip>
  </div>
</template>

<script>
import { db } from "@/firebase";
export default {
  props: ["displayUserId", "poolId"],
  data() {
    return {
      requestcache: [],
    };
  },
  asyncComputed: {
    userdetails() {
      var getusers = this.$store.getters.getDisplayUsers;
      if (typeof getusers[this.displayUserId] != "undefined") {
        return getusers[this.displayUserId];
      } else {
        db.ref(this.network + "/users/pubMeta")
          .child(this.displayUserId)
          .once("value")
          .then((snapshot) => {
            this.$store.commit("setDisplayUser", {
              userid: this.displayUserId,
              data: snapshot.val(),
            });
            return snapshot.val();
          });
      }
    },
  },
  methods: {
    nicknameDefined: function (userdetails) {
      return userdetails != null && typeof userdetails.nickName != "undefined";
    },
  },
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
};
</script>
