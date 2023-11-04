<template>
  <div>
    <v-btn
      outlined
      block
      class="my-0"
      :dark="nightmode"
      @click="expand = !expand"
    >
      @PoolToolBot: {{ $t("app.pools.getAlerts") }}
    </v-btn>
    <v-card
      style="position: absolute; z-index: 100"
      :dark="nightmode"
      v-show="expand"
      class="mx-auto mb-2 pooltoolbot"
      outlined
      raised
    >
      <v-card-text>
        <v-container v-show="expand" fluid>
          <h2>
            {{ $t("app.pools.youCanSubscribeToOur") }}
            <a
              href="https://web.telegram.org/#/im?p=@PoolToolBot"
              target="_blank"
              >@PoolToolBot</a
            >
            {{ $t("app.pools.onTelegram") }}
          </h2>
          <p>{{ $t("app.pools.weWillKeepYou") }}.</p>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text @click="expand = !expand">{{ $t("global.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    expand: false,
  }),
  props: ["nightmode"],
  methods: {},
};
</script>
