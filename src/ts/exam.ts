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
  } = {
    orgScore: 0,
    finalScore: 0
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

  console.log('AI改卷结果：')
  console.log(completion.data.choices[0].message)
  res.orgScore = Number(completion.data.choices[0].message?.content)

  console.log('字数：')
  console.log(wordsCount(antwort))

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

// 暴露函数exam
export default exam
