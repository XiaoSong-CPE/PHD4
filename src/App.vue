<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useOsTheme, darkTheme, zhCN, dateZhCN, enGB, dateEnGB } from 'naive-ui'
const theme = useLocalStorage('theme', 'auto')
const language = useLocalStorage('language', 'auto')
const themeConfig = computed(() => {
  return theme.value === 'auto' && useOsTheme().value ? darkTheme : null
})
const languageConfig = computed(() => {
  const lang =
    language.value === 'zh-CN' || language.value === 'en-GB'
      ? language.value
      : navigator.language.slice(0, 2)
  return lang === 'zh-CN'
    ? zhCN
    : lang === 'en-GB'
      ? enGB
      : lang === 'zh'
        ? zhCN
        : lang === 'en'
          ? enGB
          : null
})
const dataLanguageConfig = computed(() => {
  const lang =
    language.value === 'zh-CN' || language.value === 'en-GB'
      ? language.value
      : navigator.language.slice(0, 2)
  return lang === 'zh-CN'
    ? dateZhCN
    : lang === 'en-GB'
      ? dateEnGB
      : lang === 'zh'
        ? dateZhCN
        : lang === 'en'
          ? dateEnGB
          : null
})
</script>

<template>
  <NConfigProvider :theme="themeConfig" :locale="languageConfig" :date-locale="dataLanguageConfig">
    <n-global-style />
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <v-layout>
              <v-app-bar :elevation="2">
                <template #prepend>
                  <v-btn icon="mdi-home" href="/"></v-btn>
                </template>
                <template #title>大学德语四级助手</template>
                <template #append>
                  <v-btn icon="fa:fab fa-github" href="https://github.com/XiaoSong-CPE/PHD4" target="__blank"
                    tag="a"></v-btn>
                </template>
              </v-app-bar>
              <RouterView style="margin-top: 64px;" />
            </v-layout>
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>
