<template>
  <div class="contain">
    <div class="header">
      <div @click="profilPage">
        <img :src="url_image_profile" alt="" /><span>{{ username }}</span>
      </div>

      <button translate="no" @click="deconnexion">Logout</button>
    </div>
    <div class="post-contain">
      <textarea v-model="message" placeholder="Exprimez vous...🖋️"></textarea>
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
    <!-- <div class="list-user">
      <div class="user" v-for="user in users">
        <span
          style="
            display: block;
            width: 30px;
            height: 30px;
            margin: auto;
            border-radius: 100%;
            background-color: white;
          "
          ><font-awesome-icon icon="fa-solid fa-user"
        /></span>
        <span>{{ user }}</span>
      </div>
    </div> -->
    <!-- affichage des post  -->
    <div v-if="isLoading" class="posts">
      <div v-for="n in 3" :key="n" class="post" style="opacity: 0.7">
        <div
          class="skeleton skeleton-avatar"
          style="position: relative; top: 25px; left: -60px"
        ></div>
        <div class="skeleton skeleton-title" style="margin-left: 20px"></div>
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
      />
    </transition-group>
  </div>
</template>
<script>
import PostCard from "/src/views/PostCard.vue";
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
      nbLikes: 0,
      selectedFile: null,
      imagePreview: null,
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
      //affichage des publications
      const posts = await apiService.getAllPosts(this.token);
      this.listPost = posts;

      await delay(3000); // Simule un délai de chargement
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error("Erreur lors du chargement des données : ", error);
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).fromNow();
    },
    async profilPage() {
      try {
        const ok = await apiService.profilPage(this.token);
        if (ok) {
          this.$router.push("/profil");
        } else {
          console.log(
            "Erreur lors de la récupération des informations du profil",
          );
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
      }
    },
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
    async addComment(post) {
      if (!post.newComment) return;

      const ok = await apiService.addComment(post.id, post.newComment, this.token);
      if (ok) {
        // On ajoute le com localement pour l'afficher direct
        post.comments?.push({
          username: this.username,
          url_photo: this.url_image_profile,
          content: post.newComment,
          created_at: new Date(),
        });
        post.newComment = "";
        post.nbComments = (post.nbComments || 0) + 1; // Incrémenter le nombre de commentaires
        Toast("success", "Commentaire ajouté !");
      }
    },
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
  overflow: hidden;
}
.contain {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}
.header {
  width: 96%;
  height: auto;
  padding: 15px 2%;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header img {
  width: 30px;
  height: 30px;
  border-radius: 100%;
  object-fit: cover;
}
.header span {
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}
.header button {
  display: flex;
  align-items: center;
  border-radius: 20px;
  background-color: rgba(0, 0, 255, 0.5);
  color: white;
  border: none;
  font-size: 10px;
  padding: 6px 10px;
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
}
/* Skeleton and animations (unchanged) */
.skeleton {
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  border-radius: 5px;
  background-size: 200% 100%;
  animation: 1.5s shine linear infinite;
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
