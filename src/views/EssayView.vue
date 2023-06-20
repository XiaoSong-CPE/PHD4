<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import PrüfungJSON from '@/assets/Prüfung.json'
import exam from '@/ts/exam'
import type { Ref } from 'vue'

// markdown-it
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

// 定义step
let stepCurrent = ref(1)
let stepStatus = ref('process')

console.log(PrüfungJSON["2017年真题"]);

let res: Ref<null | {
  orgScore: number
  finalScore: number
  wordsCount: number
  orgScoreComment: string
}> = ref(null)
let aboutHTML = ref('')
let message = useMessage()
let loading = ref(false)
let input = ref('')
let key = useLocalStorage('key', '')
let PrüfungValue = ref(null)
let PrüfungString = computed(() => {
  if (PrüfungValue.value === null) {
    return '';
  } else {
    return PrüfungJSON[PrüfungValue.value as keyof typeof PrüfungJSON];
  }
})
let PrüfungHTML = computed(() => {
  return md.render(PrüfungString.value);
})
// PrüfungOptions是Ref<{label:string,value:string}<array>>
// 其中label和value都是PrüfungJSON的key
let PrüfungOptions = computed(() => {
  let options = []
  for (let key in PrüfungJSON) {
    options.push({
      label: key,
      value: key
    })
  }
  return options
})

async function submit() {

  // 开始loading效果
  loading.value = true

  // 打印调试信息
  console.log("input.value");
  console.log(input.value)
  console.log("key.value");
  console.log(key.value)
  console.log("PrüfungValue.value");
  console.log(PrüfungValue.value)

  // 分别判断input，key和PrüfungValue是否为空
  if (!input.value) {
    message.error('请输入作文')
    loading.value = false
    return
  }
  if (!key.value) {
    message.error('请输入OpenAI Key')
    loading.value = false
    return
  }
  if (!PrüfungValue.value) {
    message.error('请选择考卷')
    loading.value = false
    return
  }

  // 调用OpenAI API
  res.value = await exam(PrüfungString.value, input.value)

  // 结束loading效果
  loading.value = false

}

async function fetchAbout() {
  let res = await fetch(`/about.md`)
  let text = await res.text()
  aboutHTML.value = md.render(text)
}

onMounted(() => {
  fetchAbout()
})
</script>

<template>
  <n-space vertical style="padding: 16px;">
    <n-h2>智能作文批改</n-h2>
    <n-steps :current="stepCurrent" :status="stepStatus" vertical>
      <!-- 第一步 -->
      <n-step title="选择作文题目">
        <n-space vertical>
          <n-select v-model:value="PrüfungValue" :options="PrüfungOptions" placeholder="请选择考卷"
            :disabled="stepCurrent !== 1" />
          <n-card title="作文题目预览" v-if="PrüfungHTML">
            <div v-html="PrüfungHTML"></div>
            <template #footer>
              <n-space justify="end">
                <v-btn @click="stepCurrent++" :disabled="stepCurrent !== 1">下一步</v-btn>
              </n-space>
            </template>
          </n-card>
        </n-space>
      </n-step>
      <!-- 第二步 -->
      <n-step title="输入你的作文">
        <n-card title="请输入你的作文">
          <n-tabs type="line" animated>
            <n-tab-pane name="text" tab="输入文字" :disabled="stepCurrent !== 2">
              <n-input v-model:value="input" placeholder="请输入作文" type="textarea" :disabled="stepCurrent !== 2" />
            </n-tab-pane>
            <n-tab-pane name="image" tab="上传图片" :disabled="stepCurrent !== 2">
              敬请期待
            </n-tab-pane>
          </n-tabs>
          <template #footer>
            <n-space justify="end">
              <v-btn @click="stepCurrent--" :disabled="stepCurrent !== 2">上一步</v-btn>
              <v-btn @click="stepCurrent++" :disabled="(stepCurrent !== 2) || !input">下一步</v-btn>
            </n-space>
          </template>
        </n-card>
      </n-step>
      <!-- 第三步 -->
      <n-step title="输入密钥并批改作文">
        <n-space vertical>
          <n-input-group>
            <n-input placeholder="OpenAI Key" v-model:value="key" :disabled="stepCurrent !== 3" />
            <n-button @click="stepCurrent--" :disabled="stepCurrent !== 3">上一步</n-button>
            <n-button @click="submit()" :loading="loading" type="primary" :disabled="stepCurrent !== 3">提交</n-button>
          </n-input-group>
          <n-card v-if="res">
            <template #header>
              <n-text :type="res.finalScore >= 6 ? 'success' : 'error'">
                {{ `得分：${res.finalScore}分！` }}
              </n-text>
            </template>
            <template #default>
              <n-tag size="small" :type="res.orgScore >= 6 ? 'success' : 'error'">
                {{ `基础评分：${res.orgScore}分` }}
              </n-tag>
              <n-p>{{ res.orgScoreComment }}</n-p>
              <n-tag size="small" :type="res.finalScore - res.orgScore >= 0 ? 'success' : 'error'">
                {{ `词数要求：${res.finalScore - res.orgScore}分` }}
              </n-tag>
              <n-p>
                {{ `作文共计${res.wordsCount}个词，${res.wordsCount >= 80 ? '符合' : '不符合'}考试大纲的要求。正式改卷中，老师不会真的数出词数，可能会少扣或者不扣分。` }}
              </n-p>
              <n-tag size="small">卷面整洁</n-tag>
              <n-p>敬请期待。</n-p>
            </template>
          </n-card>
        </n-space>
      </n-step>
    </n-steps>

    <n-divider />

    <n-card title="关于">
      <div v-if="aboutHTML" v-html="aboutHTML"></div>
      <div v-else>
        <n-skeleton text :repeat="2" /> <n-skeleton text style="width: 60%" />
      </div>
      <template #action>
        <n-space justify="end">
          <n-a href="https://github.com/XiaoSong-CPE/PHD4" target="_blank">GitHub</n-a>
        </n-space>
      </template>
    </n-card>

  </n-space>
</template>

<style scoped></style>
