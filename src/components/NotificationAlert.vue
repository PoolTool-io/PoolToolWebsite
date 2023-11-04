<template>
  <div>
    <v-alert
      class="v__alert"
      border="bottom"
      colored-border
      type="info"
      elevation="2"
    >
      <p>Do you want to allow notifications?</p>
      <v-divider class="my-4 info" style="opacity: 0.22"></v-divider>
      <v-row>
        <v-col class="shrink">
          <v-btn color="info" outlined @click.stop="allowNotification">
            Allow
          </v-btn>
        </v-col>
        <v-col class="shrink">
          <v-btn color="info" outlined @click.stop="cancel"> Cancel </v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script>
import { messaging } from "@/firebase";
import "firebase/messaging";
import "firebase/auth";
export default {
  name: "NotificationAlert",
  props: {
    notificationsSupported: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // notificationsSupported: false,
    };
  },
  computed: {
    userId: function () {
      return this.$store.getters.getUserId;
    },
  },
  mounted() {},
  methods: {
    closeAlert: function () {
      this.$emit("close-alert-box");
    },
    cancel: function () {
      this.closeAlert();
    },
    saveNotificationToken: function (token) {
      this.$root.$emit("save-notification-token", token);
    },
    allowNotification: function () {
      if (this.notificationsSupported) {
        // Ask permission and when granted, create new subscription
        Notification.requestPermission().then((result) => {
          if (result === "granted") {
            messaging
              .getToken({
                vapidKey: process.env.VUE_APP_VAPID_KEY,
              })
              .then((token) => {
                this.saveNotificationToken(token);
                this.closeAlert();
              })
              .catch((err) => {
                console.log("An error occurred while retrieving token. ", err);
              });
          } else {
            console.log("User did not granted permission");
          }
        });
      }
    },
  },
};
</script>

<style scoped>
.v__alert {
  padding-top: 25px;
  margin-top: 117px;
  background-color: #fff;
  border-color: #fff;
  color: rgba(0, 0, 0, 0.87);
}
</style>