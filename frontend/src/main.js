import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faEnvelope, faSignOutAlt, faCamera, faTrash, faHeart, faClock, faEdit, faSave, faComment, faExclamationTriangle, faXmark, faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUser, faEnvelope, faSignOutAlt, faCamera, faTrash, faHeart, faClock, faEdit, faSave, faComment, faExclamationTriangle, faXmark, faPaperPlane);

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(router).mount('#app')