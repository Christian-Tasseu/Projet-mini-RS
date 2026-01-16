<template>
  <div class="contain">
    <div class="header">
      <div @click="profilPage"><img :src="url_image_profile" alt="" /><span>{{ username }}</span></div>
        
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
    <div class="list-user">
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
    </div>
    <!-- affichage des post  -->
    <div v-if="listPost.length == 0" class="alert">
      <p>Aucune publication pour l'instant...</p>
    </div>
    <transition-group tag="div" name="posts" class="posts">
      <div class="post" v-for="(post, index) in listPost" :key="post.id">
        <img :src="post.url_photo" alt="" class="img-publisher">

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
      </div>
    </transition-group>
  </div>
</template>
<script>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
dayjs.extend(relativeTime);
dayjs.locale("fr");

export default {
  data() {
    return {
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
      // comentLikes: "",
    };
  },
  async mounted() {
    this.token = localStorage.getItem("token");
    if (!this.token) {
      // Si pas de token, on redirige vers la connexion
      this.$router.push("/");
      return;
    }

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
        console.log(this.url_image_profile)
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
      console.error("Erreur lors de la récupération des commentaires", error);
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
            "Erreur lors de la récupération des informations du profil"
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
    deletePost(postId, index) {
      if (confirm("Voulez-vous vraiment supprimer ce post ?")) {
        fetch(`http://localhost:3000/api/post/${postId}`, {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${this.token}`,
          },
        }).then((reponse) => {
          if (reponse.ok) {
            this.listPost.splice(index, 1);
          }
        });
      }
    },
    deconnexion() {
      localStorage.removeItem("token");
      this.$router.push("/");
    },
  },
};
</script>
<style scoped>
body {
  margin: 0;
}
.contain {
  width: 50vw;
  min-height: 90vh;
  border-radius: 10px;
  padding-bottom: 50px;
  background-color: #d4e2eb;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}
.header {
  height: 30px;
  padding: 15px 30px;
  border-radius: 10px 10px 0 0;
  background-color: white;
  display: flex;
  justify-content: space-between;
}
.header img{
  width: 30px;
  height: 30px;
  border-radius: 100%;
  object-fit: cover;
  background-color: red;
}
.header span{
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  top: -8px;
  left: 4px;
}
.header span:hover {
  color: blue;
}
.header button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 20px;
  background-color: rgba(0, 0, 255, 0.5);
  color: white;
  font-size: 10px;
  font-weight: 400;
}
/* .post-contain {
  padding: 20px;
} */
.post-contain {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 25px;
  width: 90%;
  margin: 50px auto 20px auto;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
textarea {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  padding: 5px;
  background-color: rgb(255, 255, 255);
  color: black;
}
.btn-add-picture {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  font-size: 12px;
}
.post-btn {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 12px;
}
.post-btn:hover {
  background-color: #0056b3;
}
.list-user {
  display: flex;
  justify-content: space-around;
  width: 60%;
  margin: auto;
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
  /* position: relative; */
}
.post {
  width: 60%;
  /* max-height: 470px; */
  margin: 10px auto;
  padding: 0px 80px 0px 80px;
  border-radius: 15px;
  background-color: white;
  text-align: left;
}
.post .img-publisher{
  width: 50px;
  height: 50px;
  border-radius: 100%;
  object-fit: cover;
  background-color: red;
  position: relative;
  top: 25px;
  left: -60px;
  position: relative;
}
.post .username {
  display: block;
  font-weight: bold;
  position: relative;
  top: -30px;
}
.post .message {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  position: relative;
  top: -30px;
}
.post .img-container {
  margin-top: 10px;
  position: relative;
  top: -30px;
}
.post .img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
  margin-top: 10px;
  position: relative;
  top: 0px;
}
.post .date {
  position: relative;
  left: 70%;
  display: inline-block;
  font-size: 10px;
  color: rgb(44, 44, 103);
  top: -30px;
}
.post .likes {
  display: inline-block;
  margin-top: 10px;
  position: relative;
  top: 0px;
}
.post .like {
  cursor: pointer;
  position: relative;
  top: -30px;
}
.redColor {
  color: red;
}
.post .nbLike {
  font-size: 11px;
  position: relative;
  top: -30px;
}
.post .btn-delete {
  position: relative;
  display: inline-block;
  top: -30px;
  left: 500px;
  font-size: 13px;
  color: rgba(255, 0, 0, 0.7);
  cursor: pointer;
  transition: 0.4s;
}
.post .btn-delete:hover {
  color: red;
}
.posts-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.posts-enter-active {
  transition: all 0.5s ease;
}
.posts-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  width: 60%;
  z-index: 10;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.posts-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
.posts-move {
  transition: transform 0.5s ease;
}
</style>
