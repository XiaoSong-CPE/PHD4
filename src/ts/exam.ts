import { Configuration, OpenAIApi } from 'openai'
import wordsCount from 'words-count'
import Mustache from 'mustache'

// 定义空prompt
let prompt = ``

// 获取prompt的函数
async function getPrompt() {
  let response = await fetch('prompt.md')
  let data = await response.text()
  prompt = data
  console.groupCollapsed('getPrompt()')
  console.log('获取到的prompt：')
  console.log(prompt)
  console.groupEnd()
}

async function reexamByWordCount(antwort: string, orgScore: number): Promise<number> {
  let count = wordsCount(antwort) // 字数
  let minus = 0 // 需要扣的分
  let res = 0 // 最后的分数

  // 计算需要扣的分
  if (count >= 70 && count <= 79) {
    minus = 1
  } else if (count >= 60 && count <= 69) {
    minus = 2
  } else if (count >= 50 && count <= 59) {
    minus = 3
  } else if (count <= 49) {
    minus = 5
  }

  // 计算最后的分数
  res = orgScore - minus
  if (orgScore === 0) {
    res = 0
  } else if (res < 1) {
    res = 1
  } else {
    res = orgScore - minus
  }

  // 返回最后的分数
  return res
}

async function exam(frage: string, antwort: string) {
  console.groupCollapsed(`exam()`)
  let res: {
    orgScore: number
    finalScore: number
    wordsCount: number
    orgScoreComment: string
  } = {
    orgScore: 0,
    finalScore: 0,
    wordsCount: 0,
    orgScoreComment: ''
  }

  // 检查prompt是否为空
  if (prompt === ``) {
    await getPrompt()
  }

  // 在localstorage中获取key并检查是否为空
  const apiKey = localStorage.getItem('key')
  if (apiKey === null) {
    throw new Error('OpenAI API key not found')
  }

  // 初始化openAI
  const configuration = new Configuration({
    apiKey
  })
  const openai = new OpenAIApi(configuration)

  // 发生请求，获取数据
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: Mustache.render(prompt, {
          question: frage,
          answer: antwort
        })
      }
    ]
  })

  res.orgScore = Number(completion.data.choices[0].message?.content)
  res.wordsCount = Number(wordsCount(antwort))
  res.orgScoreComment = convertScoreToString(res.orgScore)

  // 根据字数修正分数
  if (res.orgScore) {
    res.finalScore = await reexamByWordCount(antwort, res.orgScore)
  } else {
    new Error('AI改卷失败')
  }

  console.log('返回结果：')
  console.log(res)
  console.groupEnd()

  // 返回结果
  return res
}

function convertScoreToString(score: number): string {
  if (score >= 9 && score <= 10) {
    return '切题，内容完整，语义连贯，文体得当，表达清楚，基本无语言错误。'
  } else if (score >= 7 && score <= 8) {
    return '切题，内容相对完整，文体得当，个别句子连贯不够，表达清楚，有少量语言错误。'
  } else if (score >= 5 && score <= 6) {
    return '基本切题，内容基本完整，文体欠得当，有些地方表达不够清楚，文字勉强连贯，有较多语言错误。'
  } else if (score >= 3 && score <= 4) {
    return '基本切题，内容不完整，文体欠得当，文章连贯性差，意思表达不够清楚，有较多语言错误。'
  } else if (score >= 0 && score <= 2) {
    return '内容偏题；文体判断错误；条理不清，意思表达不清楚，有大量语言错误。'
  } else {
    return '无效的分数，请输入 0 到 10 之间的数字。'
  }
}

// 暴露函数exam
export default exam
