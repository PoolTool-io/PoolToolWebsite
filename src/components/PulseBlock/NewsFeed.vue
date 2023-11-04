<template>
  <v-container>
    <div class="news-feed">
      <div class="pulse-news">
        <a
          v-for="post in documents_sorted"
          :key="post.key"
          :href="post.url"
          class="text-decoration-none"
          :target="post.platform"
        >
          <div class="news-feed__item mb-2">
            <div v-if="post.platform" class="news-feed__icon">
              <v-icon>mdi-{{ post.platform }}</v-icon>
            </div>
            <div class="news-feed__top">
              <a class="news-feed__author">
                {{ post.author }}
              </a>
              <a class="news-feed__time">
                {{ post.createdAt | parseISO() | date("P p") }}
              </a>
            </div>

            <div class="news-feed__content">
              <div v-if="post.previewImageUrl" class="news-feed__image">
                <img :src="post.previewImageUrl" :alt="post.author" />
              </div>
              <div
                v-if="post.description"
                v-html="post.description"
                class="news-feed__text"
              ></div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </v-container>
</template>

<script>
import { db } from "@/firebase";

export default {
  name: "pulse-block",
  props: [],
  created() {
    this.$rtdbBind(
      "documents",
      db.ref("Mainnet/newsfeed/items").orderByKey().limitToLast(20)
    );
  },

  data() {
    return {
      documents: {},
    };
  },
  computed: {
    documents_sorted: function () {
      var items = [];
      for (const [key, value] of Object.entries(this.documents)) {
        value["key"] = key;
        items.push(value);
      }
      return items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    },
  },
};
</script>
