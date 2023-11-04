<template>
  <v-card class="mt-5" elevation="2" :dark="nightmode" height="100%">
    <div class="pt_form_title">Zapier Post</div>

    <v-card-text>
      <v-textarea
        ref="new_post"
        outlined
        auto-grow
        persistent-hint
        hint="Use this to trigger your zapier zaps to post to any social media platform you have connected."
        :label="$t('app.poolManage.post')"
        v-model="new_post"
      >
        <template v-slot:append-outer>
          <v-container class="ma-0 pa-0">
            <v-row class="ma-0 pa-0">
              <v-col cols="12" class="ma-0 pa-0">
                <v-btn
                  title="Send"
                  icon
                  color="success"
                  @click="postToZapier(new_post)"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </template>
      </v-textarea>
      <div class="news-feed">
        <div class="pulse-news">
          <template v-for="post in new_posts_sorted">
            <div class="news-feed__item mb-2" :key="post.key">
              <div class="news-feed__icon">
                <v-icon light>mdi-subtitles</v-icon>
              </div>
              <div class="news-feed__top">
                <a class="news-feed__author">Pending Post</a>
                <a class="news-feed__time">
                  {{ post.createdAt | parseISO() | date("P p") }}
                </a>
              </div>

              <div class="news-feed__content">
                <div v-if="post.previewImageUrl" class="news-feed__image">
                  <img :src="post.previewImageUrl" :alt="post.author" />
                </div>
                <div
                  v-if="post.new_post"
                  v-html="post.new_post"
                  class="news-feed__text"
                ></div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="news-feed">
        <div class="pulse-news">
          <template v-for="post in completed_posts_sorted">
            <div class="news-feed__item mb-2" :key="post.key">
              <div class="news-feed__icon">
                <v-icon light>mdi-subtitles</v-icon>
              </div>
              <div class="news-feed__top">
                <a class="news-feed__author">Completed Post</a>
                <a class="news-feed__time">
                  {{ post.createdAt | parseISO() | date("P p") }}
                </a>
              </div>

              <div class="news-feed__content">
                <div v-if="post.previewImageUrl" class="news-feed__image">
                  <img :src="post.previewImageUrl" :alt="post.author" />
                </div>
                <div
                  v-if="post.new_post"
                  v-html="post.new_post"
                  class="news-feed__text"
                ></div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import { db } from "@/firebase";
export default {
  props: ["nightmode"],
  data() {
    return {
      new_post: "",
      new_posts: [],
      completed_posts: [],
    };
  },
  created() {
    this.$rtdbBind(
      "new_posts",
      db
        .ref(this.network + "/mediaPosts/New")
        .child(this.userId)
        .orderByChild("createdAt")
    ).then(() => {});
    this.$rtdbBind(
      "completed_posts",
      db
        .ref(this.network + "/mediaPosts/Complete")
        .child(this.userId)
        .orderByChild("createdAt")
        .limitToLast(20)
    ).then(() => {});
  },
  computed: {
    completed_posts_sorted: function () {
      return [...this.completed_posts].sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      );
    },
    new_posts_sorted: function () {
      return [...this.new_posts].sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      );
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    userId: function () {
      return this.$store.getters.getUserId;
    },
  },
  methods: {
    postToZapier: function (new_post) {
      //write to the privData area on firebase and write the key to the temp area to trigger back end processing to actually send.  This insures we have authentication.
      var w = {
        new_post: new_post,
        media_type: "NONE",
        media_files: [""],
        createdAt: new Date().toISOString(),
      };
      db.ref(this.network + "/mediaPosts/New")
        .child(this.userId)
        .push(w);
    },
  },
};
</script>