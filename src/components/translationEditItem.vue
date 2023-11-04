<template>
  <v-textarea
    ref="tain"
    dense
    rows="1"
    :readonly="!enableEdit"
    @focus="enableEdit = true"
    @blur="processBlur()"
    :value="item.translated"
    v-model="newvalue"
    hide-details="auto"
    auto-grow
  >
    <template v-slot:append>
      <v-btn
        color="primary secondary--text"
        :disabled="!enableEdit"
        x-small
        @click="updateKey(item, newvalue)"
        >Save</v-btn
      >
    </template>
  </v-textarea>
</template>
<script>
import { db } from "@/firebase";
export default {
  props: ["item", "locale"],
  data() {
    return {
      enableEdit: false, //@change="updateKey(item, $event)"
      newvalue: this.item.translated,
      isSaving: false,
    };
  },
  watch: {
    itemtranslated: {
      handler(val) {
        this.newvalue = val;
      },
    },
  },
  computed: {
    itemtranslated: function () {
      return this.item.translated;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
  methods: {
    processBlur: function () {
      this.enableEdit = false;
      this.newvalue = this.item.translated;
    },
    updateKey: function (item, event) {
      this.isSaving = true;

      var w = {};
      w[item.key.replace(/\./g, "/")] = event;
      db.ref(this.network + "/translations/" + this.locale).update(w); //
      this.isSaving = false;
      this.$refs.tain.blur();
    },
  },
};
</script>
