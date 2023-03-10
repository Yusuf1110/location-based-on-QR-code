import { createApp } from 'vue'
import './theme/normalize.css'
import router from 'vue-router';
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.mount('#app')