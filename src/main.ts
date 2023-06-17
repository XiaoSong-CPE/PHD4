import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import messages from './locales/index'

// 配置vue-i18n
const i18n = createI18n({
    locale: 'zh-CN',
    messages
})

import App from './App.vue'
import router from './router'

import './assets/main.less'

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
