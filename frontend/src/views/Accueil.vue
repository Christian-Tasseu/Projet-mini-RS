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
      <div class="post" v-for="(post, index) in listPost" :key="post.id">
        <img :src="post.url_photo" alt="" class="img-publisher" />

        <span class="username">{{ post.username }}</span>
        <span class="message">{{ post.message }}</span>
        <span class="btn-delete" @click="deletePost(post.id, index)"
          ><font-awesome-icon icon="fa-solid fa-trash"
        /></span>
        <div v-if="post.imageUrl" class="img-container">
          <img :src="post.imageUrl" alt="Post Image" class="img" />
        </div>
        <div class="likes">
          <span
            class="like"
            v-if="post.isLiked"
            :class="{ redColor: post.isLiked }"
            @click="addAndRemoveFAv(post)"
            ><font-awesome-icon icon="fa-solid fa-heart"
          /></span>
          <span
            class="like"
            v-if="!post.isLiked"
            :class="{ redColor: (post.isLiked = false) }"
            @click="addAndRemoveFAv(post)"
            ><font-awesome-icon icon="fa-solid fa-heart"
          /></span>
          <span
            class="nbLike"
            v-if="post.isLiked"
            :class="{ redColor: true }"
            >{{ post.nbLikes }}</span
          >
          <span class="nbLike" v-else>{{ post.nbLikes }}</span>
        </div>
        <span class="date"
          ><span><font-awesome-icon icon="fa-solid fa-clock" /></span
          >{{ formatDate(post.created_at) }}</span
        >

        <span class="comment-icon" @click="toggleComments(post)">
          <font-awesome-icon icon="fa-solid fa-comment" />
          {{ post.nbComments }}
        </span>

        <div v-if="post.comments?.length === 0 && post.showComments">
          <span style="color: #ccc"
            ><font-awesome-icon icon="fa-solid fa-triangle-exclamation" /></span
          ><span
            style="font-size: 10px; display: inline-block; margin-left: 20px"
            >Aucun commentaire pour ce post !</span
          >
        </div>
        <div v-if="post.showComments" class="comments-container">
          <div class="comment-form">
            <input
              v-model="post.newComment"
              placeholder="Écrire un commentaire…"
              @keyup.enter="addComment(post)"
            />
            <button @click="addComment(post)">Envoyer</button>
          </div>
          <div
            v-for="comment in post.comments"
            :key="comment.id"
            class="comment-item"
          >
            <img :src="comment.url_photo" class="comment-avatar" />
            <div class="comment-content">
              <span class="comment-user">{{ comment.username }}</span>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
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
      try {
        const reponse = await fetch("http://localhost:3000/api/profil", {
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        });

        if (reponse) {
          const data = await reponse.json();
          this.username = data[0].username;
          this.url_image_profile = data[0].url_photo;
          console.log(this.url_image_profile);
        } else {
          alert("Erreur lors del a récupération du profil");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil", error);
      }

      //affichage des utilisateurs
      try {
        const reponse = await fetch("http://localhost:3000/api/listUsers");

        if (reponse.ok) {
          const data = reponse.json();
          for (const i in data) {
            for (const username in data[i]) {
              this.users.push(data[i][username]);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des profils", error);
      }

      //affichage des publications
      try {
        const reponse = await fetch("http://localhost:3000/api/posts", {
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        });
        if (reponse) {
          const data = await reponse.json();
          for (const i in data) {
            this.listPost.push(data[i]);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des publications", error);
      }
      await delay(3000); // Simule un délai de chargement
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  },
  methods: {
    formatDate(date) {
      return dayjs(date).fromNow();
    },
    async profilPage() {
      try {
        const reponse = await fetch("http://localhost:3000/api/profilPage", {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        });
        if (reponse.ok) {
          this.$router.push("/profil");
        } else {
          console.log(
            "Erreur lors de la récupération des informations du profil",
          );
        }
      } catch (err) {
        console.error("Erreur réseau :", error);
      }
    },
    async publier() {
      const formData = new FormData();
      formData.append("message", this.message);
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }
      try {
        const reponse = await fetch("http://localhost:3000/api/publier", {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
          },
          body: formData,
        });

        const data = await reponse.json();

        if (reponse.ok) {
          this.listPost.unshift({
            id: data.id,
            username: this.username,
            url_photo: this.url_image_profile,
            message: this.message,
            imageUrl: data.imageUrl || null,
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
        } else {
          alert("Erreur lors de la publication");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
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
    addAndRemoveFAv(post) {
      if (post.isLiked === undefined || post.isLiked === false) {
        post.isLiked = true;
        const nbLikes = fetch(`http://localhost:3000/api/addFav/${post.id}`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            post.nbLikes = data.nbLikes;
          });
      } else {
        post.isLiked = false;
        fetch(`http://localhost:3000/api/removeFav/${post.id}`, {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            post.nbLikes = data.nbLikes;
          });
      }
    },
    // LOGIQUE OPTIMISÉE DE L'IA POUR AJOUTER/RETIRER DES FAVORIS
    //     addAndRemoveFAv(post) {
    //   // 1. On sauvegarde l'état actuel au cas où le serveur échoue
    //   const oldStatus = post.isFav;

    //   // 2. On change visuellement tout de suite (UI fluide)
    //   post.isFav = !post.isFav;

    //   // 3. On choisit la route et la méthode
    //   const isAdding = post.isFav;
    //   const url = `http://localhost:3000/api/${isAdding ? 'addFav' : 'removeFav'}/${post.id}`;
    //   const method = isAdding ? "POST" : "DELETE";

    //   fetch(url, {
    //     method: method,
    //     headers: { authorization: `Bearer ${this.token}` }
    //   })
    //   .then(res => {
    //     if (!res.ok) throw new Error("Erreur serveur");
    //   })
    //   .catch(err => {
    //     // 4. Si ça rate, on remet l'ancien état et on prévient l'utilisateur
    //     post.isFav = oldStatus;
    //     alert("Impossible de mettre à jour le favori.");
    //   });
    // },
    async toggleComments(post) {
      post.showComments = !post.showComments;

      // Si on ouvre et qu'on n'a pas encore chargé les coms
      const res = await fetch(`http://localhost:3000/api/comments/${post.id}`);
      post.comments = await res.json();
    },

    async addComment(post) {
      if (!post.newComment) return;

      const res = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ post_id: post.id, content: post.newComment }),
      });

      if (res.ok) {
        // On ajoute le com localement pour l'afficher direct
        post.comments?.push({
          username: this.username, // Ton nom actuel
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
      }).then((result) => {
        if (result.isConfirmed) {
          // Ton code de fetch actuel
          fetch(`http://localhost:3000/api/post/${postId}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${this.token}` },
          }).then((reponse) => {
            if (reponse.ok) {
              this.listPost.splice(index, 1);
              Swal.fire("Supprimé !", "Ton post a disparu.", "success");
            }
          });
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
.list-user {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  overflow-x: auto;
  padding: 0.5rem;
}
.user {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.posts {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.post {
  width: 100%;
  max-width: 900px;
  margin: 10px auto;
  padding: 1rem;
  border-radius: 15px;
  background-color: white;
  text-align: left;
  box-sizing: border-box;
}
.post .img-publisher {
  width: 50px;
  height: 50px;
  border-radius: 100%;
  object-fit: cover;
  background-color: red;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}
.post .username {
  display: inline-block;
  font-weight: bold;
  margin-left: 8px;
  vertical-align: middle;
}
.post .message {
  display: block;
  margin-top: 8px;
  font-size: 14px;
}
.post .img-container {
  margin-top: 10px;
}
.post .img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 10px;
}
.post .date {
  display: block;
  text-align: right;
  font-size: 11px;
  color: rgb(44, 44, 103);
  margin-top: 8px;
}
.post .likes {
  display: inline-block;
  margin-top: 10px;
}
.post .like {
  cursor: pointer;
}
.redColor {
  color: red;
}
.post .nbLike {
  font-size: 11px;
}
.comments-container {
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 15px;
  margin: 10px 0;
}
.comment-icon {
  display: inline-block;
  margin-left: 0px;
  cursor: pointer;
}
.comment-item {
  display: flex;
  margin: 10px 0;
}
.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.comment-content {
  background-color: white;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 13px;
}
.comment-user {
  font-weight: bold;
  display: block;
}
.comment-form input {
  display: inline-block;
  width: 65%;
  height: 28px;
  margin-bottom: 10px;
  margin-right: 15px;
  border-radius: 15px;
  background-color: white;
  color: black;
  border: 1px solid #ccc;
  padding: 5px 12px;
}
.comment-form button {
  display: inline-block;
  width: 28%;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
}
.post .btn-delete {
  font-size: 13px;
  color: rgba(255, 0, 0, 0.7);
  cursor: pointer;
  transition: 0.4s;
  float: right;
}
.post .btn-delete:hover {
  color: red;
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
  .post {
    padding: 0.75rem;
  }
  .post .img-publisher {
    margin: 0 10px 8px 0;
    vertical-align: middle;
  }
  .post .username,
  .post .message {
    position: static;
    top: auto;
    left: auto;
    margin-left: 0;
  }
  .post .date {
    text-align: right;
    left: auto;
    top: auto;
  }
  .post .btn-delete {
    position: static;
    float: right;
    margin-top: -35px;
  }
  .list-user {
    width: 100%;
  }
  .post .img {
    max-height: 250px;
  }
  .comment-form input {
    width: 60%;
  }
  .comment-form button {
    width: 35%;
  }
  .posts-leave-active {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header span {
    font-size: 16px;
  }
  .post .message {
    font-size: 13px;
  }
  .comment-form input {
    width: 58%;
  }
  .comment-form button {
    width: 36%;
  }
}
</style>
