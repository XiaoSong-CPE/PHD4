<script lang="ts" setup>
import { ref } from 'vue'
let list = ref([
  {
    title: `作文批改`,
    subtitle: `人工智能加持下的德语作文批改。`,
    href: 'essay',
    disabled: false,
  },
  {
    title: `复合词解析`,
    subtitle: `人工智能加持下的德语复合词详细解析，不保证绝对准确，但是可以帮助记忆单词。`,
    href: 'compound',
    disabled: true,
  },
])
</script>

<template>
  <v-list lines="three">
  <v-list-item
    v-for="item in list"
    :key="item.title"
    :title="item.title"
    :subtitle="item.subtitle"
    :disabled="item.disabled"
    :href="item.href"
    density="compact"
  ></v-list-item>
</v-list>
</template>