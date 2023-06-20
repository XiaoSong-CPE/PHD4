<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import PrüfungJSON from '@/assets/Prüfung.json'
import exam from '@/ts/exam'
import { useDialog } from 'naive-ui'

// markdown-it
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

// 定义dialog
let dialog = useDialog()

// 定义step
let stepCurrent = ref(1)
let stepStatus = ref('process')

console.log(PrüfungJSON["2017年真题"]);

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
  let res = await exam(PrüfungString.value, input.value)

  // 弹出结果
  dialog.success({
    title: `${res.finalScore}分！`,
    content: `基础评分：${res.orgScore}分\n\n词数要求：${res.finalScore - res.orgScore}分\n\n字迹整洁：(敬请期待)`,
    positiveText: '确定',
    onPositiveClick: () => {
      // 点击确定按钮
      console.log('点击确定按钮')
    },
  })

  // 结束loading效果
  loading.value = false

}
</script>

<template>
  <n-space vertical style="padding: 16px;">
    <n-h1>
      <n-gradient-text type="success">
        大学德语四级（PHD4）
      </n-gradient-text>
    </n-h1>

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
                <n-button @click="stepCurrent++" :disabled="stepCurrent !== 1">下一步</n-button>
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
              <n-button @click="stepCurrent--" :disabled="stepCurrent !== 2">上一步</n-button>
              <n-button @click="stepCurrent++" :disabled="stepCurrent !== 2">下一步</n-button>
            </n-space>
          </template>
        </n-card>
      </n-step>
      <!-- 第三步 -->
      <n-step title="输入密钥并进行作文批改">
        <n-space vertical>
          <n-input placeholder="OpenAI Key" v-model:value="key" :disabled="stepCurrent !== 3" />

          <n-space justify="end">
            <n-button @click="stepCurrent--" :disabled="stepCurrent !== 3">上一步</n-button>
            <n-button @click="submit()" :loading="loading" block type="primary"
              :disabled="stepCurrent !== 3">提交</n-button>
          </n-space>

        </n-space>
      </n-step>
    </n-steps>


    <n-card title="“智能作文批改”工作原理">
      <n-ol>
        <n-li><s>通过手写识别功能将作文转换为文字。</s>（暂时得自己手动输入作文）</n-li>
        <n-li>借助GPT-3.5的逻辑能力，根据考试大纲给出基本分数。</n-li>
        <n-li>计算单词数量，对词数不足80词的作文进行相应的扣分。</n-li>
        <n-li><s>根据作文照片判断是否扣除卷名整洁分。</s>（不会遇到这么狠心的改卷老师吧）</n-li>
      </n-ol>
    </n-card>

  </n-space>
</template>

<style scoped></style>
