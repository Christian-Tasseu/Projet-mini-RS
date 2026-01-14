import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faEnvelope, faSignOutAlt, faCamera, faTrash, faHeart, faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUser, faEnvelope, faSignOutAlt, faCamera, faTrash, faHeart, faClock)

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(router).mount('#app')