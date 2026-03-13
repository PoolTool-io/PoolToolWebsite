<template>
  <span>{{ item.translated }}</span>
</template>
<script>
export default {
  props: ["item", "locale"],
};
</script>
