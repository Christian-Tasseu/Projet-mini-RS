<template>
  <div class="main-wrapper">
    <header class="header">
      <div @click="profilPage" class="username">
        <img :src="url_image_profile" alt="" /><span>{{ username }}</span>
      </div>

      <button translate="no" @click="deconnexion">Logout</button>
    </header>

    <div class="grid-container">
      <aside class="sidebar-left">
        <div class="profile-mini-card" @click="profilPage">
          <img
            :src="url_image_profile || defaultProfileImage"
            alt="Photo de profil"
            class="profile-mini-avatar"
          />
          <p class="profile-mini-name">{{ username || "Utilisateur" }}</p>

          <div class="profile-mini-stats">
            <div class="mini-stat">
              <span class="mini-stat-value">{{ followersCount }}</span>
              <span class="mini-stat-label">followers</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-value">{{ followingCount }}</span>
              <span class="mini-stat-label">following</span>
            </div>
          </div>

          <button class="btn-view-profile" @click.stop="profilPage">
            Voir profil
          </button>
        </div>
      </aside>

      <main v-if="!isChatOpen" class="feed-content">
        <div class="post-contain">
          <textarea
            v-model="message"
            placeholder="Exprimez vous...🖋️"
          ></textarea>
          <input
            type="file"
            @change="onFileSelected"
            accept="image/*"
            style="display: none"
            ref="fileInput"
          />
          <button @click="$refs.fileInput.click()" class="btn-add-picture">
            <font-awesome-icon icon="fa-solid fa-camera" />
          </button>
          <button class="post-btn" @click="publier">Publier</button>

          <div v-if="imagePreview">
            <img
              :src="imagePreview"
              style="max-width: 200px; border-radius: 10px"
            />
            <button
              @click="annulerImage"
              class="post-btn"
              style="background-color: red; position: relative; top: -10px"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="posts">
          <div v-for="n in 3" :key="n" class="post" style="opacity: 0.7">
            <div
              class="skeleton skeleton-avatar"
              style="position: relative; top: 25px; left: -60px"
            ></div>
            <div
              class="skeleton skeleton-title"
              style="margin-left: 20px"
            ></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
        <div v-if="listPost.length == 0" class="alert">
          <p>Aucune publication pour l'instant...</p>
        </div>
        <transition-group tag="div" name="posts" class="posts">
          <PostCard
            v-for="(post, index) in listPost"
            :key="post.id"
            :post="post"
            :token="token"
            :currentUser="username"
            @delete-post="deletePost"
            @like="addAndRemoveFAv"
            @toggle-comments="toggleComments"
            @add-comment="addComment"
            @go-to-profile="goToProfile"
          />
        </transition-group>
      </main>

      <section :class="['sidebar-right', { 'chat-full-view': isChatOpen }]">
        <div v-if="!isChatOpen" class="message-list-preview">
          <h3>Messages</h3>
          <div
            v-for="user in users"
            :key="user.id"
            @click="openConversation(user)"
            class="user-item"
          >
            <img
              :src="user.url_photo || 'default-avatar.png'"
              class="mini-avatar-list"
            />
            <div class="user-meta">
              <strong>{{ user.username }}</strong>
              <small>Voir la conversation</small>
            </div>
          </div>
        </div>

        <ChatComponent
          v-else
          @close="isChatOpen = false"
          :activeUser="selectedUser"
        />
      </section>
    </div>

    <footer class="app-footer">
      <span>Mini RS - 2026</span>
      <span>Connecte, partage, echange</span>
    </footer>
  </div>
</template>
<script>
import PostCard from "/src/views/PostCard.vue";
import ChatComponent from "./Chat.vue";
import { apiService } from "../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import Swal from "sweetalert2";

const Toast = (icon, title, timer = 3000) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toastEl) => {
      toastEl.addEventListener("mouseenter", Swal.stopTimer);
      toastEl.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default {
  components: {
    PostCard,
    ChatComponent,
  },
  data() {
    return {
      isLoading: true,
      token: "",
      username: "",
      imgPublisher: "",
      users: [],
      listPost: [],
      poster: "",
      message: "",
      url_image_profile: "",
      defaultProfileImage: "http://localhost:3000/images/img-no-profil.avif",
      followersCount: 0,
      followingCount: 0,
      nbLikes: 0,
      selectedFile: null,
      imagePreview: null,
      isChatOpen: false,
      selectedUser: null,
    };
  },
  async mounted() {
    this.isLoading = true;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // Fonction pour simuler un délai
    this.token = localStorage.getItem("token");
    if (!this.token) {
      // Si pas de token, on redirige vers la connexion
      this.$router.push("/");
      return;
    }

    try {
      //affichage à l'entête
      const profilData = await apiService.getProfil(this.token);
      this.username = profilData[0].username;
      this.url_image_profile = profilData[0].url_photo;

      if (profilData[0]?.id) {
        const publicProfile = await apiService.getPublicProfile(
          profilData[0].id,
          this.token,
        );
        this.followersCount = publicProfile?.user?.followersCount || 0;
        this.followingCount = publicProfile?.user?.followingCount || 0;
      }

      //affichage des publications
      const posts = await apiService.getAllPosts(this.token);
      this.listPost = posts;

      await delay(0); // Simule un délai de chargement
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error("Erreur lors du chargement des données : ", error);
    }

    // Récupération de tous les utilisateurs pour le chat
    try {
      const allUsers = await apiService.getAllUsers(this.token);
      this.users = allUsers; // Maintenant 'users' contient des objets {id, username, url_photo}
    } catch (err) {
      console.error("Impossible de charger les utilisateurs", err);
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).fromNow();
    },
    // Redirection vers la page de profil
    async profilPage() {
      try {
        const userId = await apiService.profilPage(this.token);
        if (userId) {
          this.$router.push(`/profil/${userId.id}`);
        } else {
          console.log(
            "Erreur lors de la récupération des informations du profil",
          );
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
      }
    },
    // Publication d'un post
    async publier() {
      const formData = new FormData();
      formData.append("message", this.message);
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }
      try {
        const reponse = await apiService.publierPost(formData, this.token);
        this.listPost.unshift({
          id: reponse.id,
          username: this.username,
          url_photo: this.url_image_profile,
          message: this.message,
          imageUrl: reponse.imageUrl || null,
          created_at: new Date(),
          nbLikes: 0,
          isLiked: 0,
          nbComments: 0,
          showComments: false,
          comments: [],
          newComment: "",
        });

        this.message = "";
        this.selectedFile = null;
        this.imagePreview = null;
      } catch (error) {
        console.error("Erreur lors de la publication :", error);
      }
    },
    onFileSelected(e) {
      const file = e.target.files[0];
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    },
    annulerImage() {
      this.selectedFile = null;
      this.imagePreview = null;
    },
    // Ajout et suppresion de favoris
    async addAndRemoveFAv(post) {
      if (!post.isLiked) {
        const data = await apiService.addFav(post.id, this.token);
        post.isLiked = true;
        post.nbLikes = data.nbLikes;
      } else {
        const data = await apiService.removeFav(post.id, this.token);
        post.isLiked = false;
        post.nbLikes = data.nbLikes;
      }
    },
    // Navigation vers le profil
    goToProfile(post) {
      this.$router.push(`/profil/${post.userId}`);
    },
    // Ouvrir une conversation
    openConversation(user) {
      this.selectedUser = user;
      this.isChatOpen = true;
    },
    // Affichage des commentaires
    async toggleComments(post) {
      post.showComments = !post.showComments;

      if (post.showComments && (!post.comments || post.comments.length === 0)) {
        try {
          post.comments = await apiService.getComments(post.id);
        } catch (err) {
          console.error("Erreur récupération commentaires :", err);
        }
      }
    },
    // Ajout de commentaire
    async addComment(post) {
      if (!post.newComment) return;

      const ok = await apiService.addComment(
        post.id,
        post.newComment,
        this.token,
      );
      if (ok) {
        post.comments?.push({
          username: this.username,
          url_photo: this.url_image_profile,
          content: post.newComment,
          created_at: new Date(),
        });
        post.newComment = "";
        post.nbComments = (post.nbComments || 0) + 1;
        Toast("success", "Commentaire ajouté !");
      }
    },
    // Suppression d'un post
    deletePost(postId, index) {
      Swal.fire({
        title: "Es-tu sûr ?",
        text: "Tu ne pourras pas revenir en arrière !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, supprimer !",
        cancelButtonText: "Annuler",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const ok = await apiService.deletePost(postId, this.token);
          if (ok) {
            this.listPost.splice(index, 1);
            Swal.fire("Supprimé !", "Ton post a disparu.", "success");
          }
        }
      });
    },
    // D2connexion
    async deconnexion() {
      Swal.fire({
        title: "À bientôt !",
        text: "Vous allez être déconnecté",
        icon: "question",
        confirmButtonText: "Déconnexion",
        showCancelButton: true,
        cancelButtonText: "Annuler",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("token");
          Swal.fire({
            title: "Déconnecté !",
            text: "À bientôt !",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.$router.push("/");
          });
        }
      });
    },
  },
};
</script>
<style scoped>
body {
  margin: 0;
  overflow-x: hidden;
}
.main-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  background-color: #f0f2f5;
}

.grid-container {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr) 280px;
  gap: 16px;
  padding: 10px 16px 16px;
  align-items: start;
}

.sidebar-left,
.feed-content,
.sidebar-right {
  background: #ffffff;
  border-radius: 12px;
}

.sidebar-left,
.sidebar-right {
  position: sticky;
  top: 10px;
  max-height: calc(100vh - 90px);
  min-height: 300px;
  padding: 12px;
  overflow: hidden;
}

.profile-mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border-radius: 14px;
  border: 1px solid #dde7fb;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
  box-shadow: 0 8px 18px rgba(23, 44, 80, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.profile-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(23, 44, 80, 0.12);
}

.profile-mini-avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d7e5ff;
}

.profile-mini-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #132238;
  text-align: center;
}

.profile-mini-stats {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  border-radius: 10px;
  background-color: #ecf3ff;
}

.mini-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f2a57;
}

.mini-stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #5e6f8f;
}

.btn-view-profile {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  background: #1e5eff;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-view-profile:hover {
  background: #154fe5;
  transform: translateY(-1px);
}

.feed-content {
  min-width: 0;
  padding-bottom: 14px;
}

.message-list-preview h3 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #1d2a44;
}

.message-list-preview {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
  overflow: hidden;
  padding-right: 4px;
}

.user-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid #e5ecfb;
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease,
    transform 0.2s ease;
}

.user-item:hover {
  background-color: #eef3ff;
  border-color: #c7d8ff;
  transform: translateX(2px);
}

.mini-avatar-list {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d8e5ff;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-meta strong {
  font-size: 14px;
  color: #132238;
}

.user-meta small {
  font-size: 12px;
  color: #6a7890;
}

.chat-full-view {
  grid-column: 2 / 4;
}
.header {
  width: 100%;
  height: auto;
  padding: 15px 2%;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.username {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
}
.username:hover {
  background-color: rgba(0, 0, 255, 0.1);
  transition-duration: 0.2s;
}
.username:hover span {
  color: blue;
  transition-duration: 0.2s;
}
.header img {
  width: 30px;
  height: 30px;
  border-radius: 100%;
  object-fit: cover;
}
.header span {
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  margin-left: 10px;
}
.header button {
  display: flex;
  align-items: center;
  border-radius: 20px;
  background-color: rgba(0, 0, 255, 0.5);
  color: white;
  border: none;
  font-size: 13px;
  padding: 10px 14px;
}

.post-contain {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 25px;
  width: 70%;
  margin: 70px auto 20px auto;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 8px;
}
textarea {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  padding: 8px;
  background-color: #fff;
  color: #000;
  min-height: 70px;
}
.btn-add-picture,
.post-btn {
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
}
.btn-add-picture {
  background-color: #28a745;
  color: white;
  border: none;
}
.post-btn {
  background-color: #007bff;
  color: white;
  border: none;
}
.post-btn:hover {
  background-color: #0056b3;
}
.posts {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  gap: 14px;
  padding: 0 10px 12px;
}
/* Skeleton and animations (unchanged) */
.skeleton {
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;
}

/* Footer */

.app-footer {
  flex-shrink: 0;
  height: 74px;
  margin-top: 50px;
  padding: 0 18px;
  background: #ffffff;
  border-top: 1px solid #d9e5fb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #4b5f82;
}

@keyframes shine {
  to {
    background-position-x: -200%;
  }
}
.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.skeleton-title {
  width: 30%;
  height: 15px;
  margin-bottom: 10px;
}
.skeleton-text {
  width: 100%;
  height: 100px;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .sidebar-left,
  .sidebar-right,
  .chat-full-view {
    grid-column: 1;
    position: static;
    max-height: none;
  }

  .post-contain {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  textarea {
    min-height: 90px;
  }
}

@media (max-width: 480px) {
  .header span {
    font-size: 16px;
  }
}
</style>
