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
let PrüfungOptions = ref([
  { label: '2017年真题', value: '2017年真题' },
  { label: "课题测试", value: "课题测试" }
])

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
  let ifEnoughLength = res.points === res.finalScore
  dialog.success({
    title: `${res.finalScore}分！`,
    content: res.comment + (ifEnoughLength ? '' : '（词数不足80词，已扣除相应分数）'),
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
    <n-h1>大学德语四级</n-h1>

    <n-h2>智能作文批改</n-h2>

    <n-select v-model:value="PrüfungValue" :options="PrüfungOptions" placeholder="请选择考卷" />

    <n-card title="作文题目预览" v-if="PrüfungHTML">
      <div v-html="PrüfungHTML"></div>
    </n-card>

    <n-card title="请输入你的作文">
      <n-tabs type="line" animated>
        <n-tab-pane name="text" tab="输入文字">
          <n-input v-model:value="input" placeholder="请输入作文" type="textarea" />
        </n-tab-pane>
        <n-tab-pane name="image" tab="上传图片">
          敬请期待
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <n-input-group>
      <n-input placeholder="OpenAI Key" v-model:value="key" />
      <n-button @click="submit()" :loading="loading">提交</n-button>
    </n-input-group>



    <n-card title="“智能作文批改”说明">
      使用方法：
      <n-ol>
        <n-li>在上方输入框中输入作文。</n-li>
        <n-li>输入OpenAI Key。</n-li>
        <n-li>点击提交按钮。</n-li>
        <n-li>手动选择是否扣除卷名整洁分。</n-li>
        <n-li>查看分数。</n-li>
      </n-ol>

      工作原理：
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
