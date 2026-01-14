
// creation of router instance and route definitions
import { createRouter, createWebHistory } from 'vue-router';
import Connexion from './views/Connexion.vue';
import Inscription from './views/Inscription.vue';
import Accueil from './views/Accueil.vue';
import Profil from './views/Profil.vue';

const routes = [
    { path: '/',
        name: 'Connexion',
        component: Connexion
     },
    { path: '/inscription', component: Inscription },
    { path: '/accueil', component: Accueil },
    {path: '/profil', component: Profil}
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;