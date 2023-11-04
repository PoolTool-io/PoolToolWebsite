<template>
  <v-container fluid :dark="nightmode">
    <v-card v-if="enableThisTranslation" :dark="nightmode">
      <v-card-title>
        <v-text-field
          v-model="search"
          :append-icon="search ? 'mdi-close' : 'mdi-magnify'"
          label="Search"
          single-line
          hide-details
          @click:append="clearSearch"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :search="search"
        dense
        :headers="headers"
        :dark="nightmode"
        :items-per-page="30"
        :items="translations"
        :loading="isSaving"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 20, 30, 40, 50, 100],
        }"
      >
        <template #[`item.translated`]="{ item }">
          <translation-edit-item :item="item" :locale="locale" />
        </template>
      </v-data-table>
    </v-card>
    <h3 v-else>
      Sorry, you are not authorized to update this translation. Please make sure
      you have set pooltool to the language you wish to translate to (IE, not
      english)
    </h3>
  </v-container>
</template>

<script>
import validationMixin from "@/mixins/validationMixin";
import translationEditItem from "@/components/translationEditItem";
import { required } from "vuelidate/lib/validators";

import { db } from "@/firebase";

function flattenObj(obj, parent, res = {}) {
  for (let key in obj) {
    let propName = parent ? parent + "." + key : key;
    if (typeof obj[key] == "object") {
      flattenObj(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}
export default {
  props: ["nightmode"],
  mixins: [validationMixin],
  components: {
    translationEditItem,
  },
  validations: {
    form: {
      locale: {
        required,
      },
      page: {
        required,
      },
      key: {
        required,
      },
      translation: {
        required,
      },
    },
  },
  validationMessages: {
    form: {
      locale: {
        required: "Language is required",
      },
      page: {
        required: "Please select page",
      },
      key: {
        required: "Please input key",
      },
      translation: {
        required: "Please input translation",
      },
    },
  },
  data() {
    return {
      temptranslations: {},
      search: "",
      headers: [
        {
          text: "Key",
          width: "20%",
          value: "key",
        },
        {
          text: "English",
          width: "40%",
          value: "en",
        },
        {
          text: "Translated",
          width: "40%",
          value: "translated",
        },
      ],
      translations_raw: {},
      translations_raw_en: {},

      languages: [],
      form: {
        locale: null,
        page: null,
        key: null,
        translation: null,
      },
      isSaving: false,
    };
  },
  updated() {
    this.$emit("isLoaded", true);
  },
  beforeDestroy() {
    console.log("reload Translations");
    this.$emit("reloadTranslations");
  },
  watch: {
    locale: {
      immediate: true,
      handler() {
        this.loadTranslation(this.locale);
      },
    },
  },

  computed: {
    locale: function () {
      return this.$i18n.locale;
    },
    enableThisTranslation: function () {
      if (
        this.userData != null &&
        typeof this.userData.ownedTranslations != "undefined"
      ) {
        return Object.keys(this.userData.ownedTranslations).includes(
          this.locale
        );
      }
      return false;
    },
    translations: function () {
      var a = [];
      var translationlookup = {};
      if (
        typeof this.translations_raw != "undefined" &&
        this.translations_raw != null
      ) {
        translationlookup = flattenObj(this.translations_raw);
      }

      if (
        typeof this.translations_raw_en != "undefined" &&
        this.translations_raw_en != null
      ) {
        for (const [key, value] of Object.entries(
          flattenObj(this.translations_raw_en)
        )) {
          a.push({
            key: key,
            en: value,
            translated:
              typeof translationlookup[key] != "undefined"
                ? translationlookup[key]
                : "",
          });
        }
        return a;
      } else {
        return [];
      }
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
  },

  methods: {
    clearSearch: function () {
      this.search = "";
    },

    loadTranslation: function (locale) {
      this.$rtdbBind(
        "translations_raw_en",
        db.ref(this.network + "/translations").child("en")
      );
      this.$rtdbBind(
        "translations_raw",
        db.ref(this.network + "/translations").child(locale)
      );
    },
  },

  mounted() {
    this.$emit("isLoaded", true);
  },
};
</script>
