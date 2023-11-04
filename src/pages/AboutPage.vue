<template>
  <v-container fluid>
    <v-card :dark="nightmode">
      <v-row dense>
        <v-col sm="12" xs="12" md="12" lg="12">
          <h1 class="text-center text-uppercase mb-5">
            {{ $t("app.about.aboutPoolTool") }}
          </h1>

          <p>{{ $t("app.about.aboutPooltoolParagraph") }}.</p>

          <blockquote
            class="blockquotecustom"
            :style="nightmode ? 'background: #333333;' : 'background: #f9f9f9;'"
          >
            <p>
              {{ $t("app.about.poolToolWasDevelopedOutOfMyDesire") }}.
              {{ $t("app.about.itHasBeenALabor") }}.
            </p>
            <p>{{ $t("app.about.noneOfThisCouldReallyBePossible") }}.</p>

            <p class="text-right">
              <span
                >{{ $t("app.about.thankYou") }}<br />Mike Fullman<br />Telegram:
                @papacarp</span
              >
            </p>
          </blockquote>
          <v-divider class="ma-4 info" style="opacity: 0.82"></v-divider>
          <h4>
            <v-icon color="red">mdi-heart</v-icon>{{ $t("app.about.thankYou") }}
            <v-icon color="red">mdi-heart</v-icon>
            {{ $t("app.about.toOurCommunityTranslators") }} :
          </h4>
          <ul>
            <li v-for="(lang, k) in langs" v-bind:key="k">
              <span>{{ lang.language }}</span> :
              <span
                v-for="(contributor, j) in lang.contributors"
                v-bind:key="j"
              >
                {{ contributor.name }}
                <span v-if="contributor.pools.length">(</span>
                <span v-for="(thispool, i) in contributor.pools" v-bind:key="i">
                  <router-link
                    :class="nightmode ? 'white--text' : 'black--text'"
                    text
                    :to="{
                      name: 'poolepochs',
                      params: { poolid: Object.values(thispool)[0] },
                    }"
                    >{{ Object.keys(thispool)[0] }}</router-link
                  ><span v-if="i != contributor.pools.length - 1">, </span>
                </span>
                <span v-if="contributor.pools.length">)</span>
                <span v-if="j != lang.contributors.length - 1">, </span>
              </span>
            </li>
          </ul>
          <p class="pt-5">
            Want to contribute a language? Please reach out us in our
            <a href="https://t.me/pooltool" target="_blank"
              >PoolTool Telegram Channel</a
            >
          </p>

          <v-divider class="ma-4 info" style="opacity: 0.82"></v-divider>

          <h4>{{ $t("app.about.ifYouLikeWhatWeDo") }}:</h4>
          <ul>
            <li>
              {{ $t("app.about.aDelegationToOurStakePool") }}:
              <p>
                <router-link
                  :class="nightmode ? 'white--text' : 'black--text'"
                  text
                  :to="{
                    name: 'poolepochs',
                    params: {
                      poolid:
                        '95c4956f7a137f7fe9c72f2e831e6038744b6307d00143b2447e6443',
                    },
                  }"
                  >LOVE - StakeLove Pool</router-link
                >
              </p>
            </li>

            <li>
              {{ $t("app.about.aDonationInADATo") }}:
              {{ myaddress | ellipsiscrypto(30) }}
              <v-btn text small icon v-clipboard="myaddress">
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </li>
            <li>
              {{ $t("app.about.youCanBeA") }}
              <a
                href="https://www.patreon.com/user?u=32491325&fan_landing=true"
                target="_blank"
                >Patreon</a
              >
              {{ $t("app.about.ofPoolTool") }}.
            </li>
          </ul>
          <v-divider class="ma-4 info" style="opacity: 0.82"></v-divider>
          <p class="pt-5">
            {{ $t("app.about.ifYouHaveFeedback") }}:
            <a href="https://github.com/papacarp/pooltool.io"
              >github.com...pooltool.io</a
            >
          </p>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "@/firebase";
export default {
  props: ["nightmode", "currentGenesis"],
  mounted() {
    this.$emit("isLoaded", true);
    this.$rtdbBind("langs_raw", db.ref(this.network + "/languages"));
  },

  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },

    langs: function () {
      var a = [];
      if (typeof this.langs_raw != "undefined" && this.langs_raw != null) {
        for (const value of Object.values(this.langs_raw)) {
          if (value.disabled == false && value.locale != "en") {
            a.push(value);
          }
        }
      }
      return a.sort((a, b) => (a.language < b.language ? -1 : 1));
    },
  },
  data() {
    return {
      langs_raw: {},
      myaddress:
        "addr1q8zpcqqy3vv6eppcc977783d5ulruew986z0c50pnsx63hzkj0r5fg3p7g5ex8argw84z6kc5pp26g9c2fjxy9z6cucqev8774",
      faves2: [],
      faves: [],
    };
  },
};
</script>

<style>
.column_wrapper {
  max-height: 200px;
  display: flex;
  flex-flow: column wrap;
}

.blockquotecustom {
  border-left: 10px solid #ccc;
  margin: 1.5em 10px;
  padding: 0.5em 10px;
}
</style>
