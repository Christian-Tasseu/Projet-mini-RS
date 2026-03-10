<template>
  <div class="post">

    <div class="publisher" @click="goToProfile(post)">
      <img :src="post.url_photo" alt="" class="img-publisher" />
      <span class="username">{{ post.username }}</span>
    </div>
    
    <span class="message">{{ post.message }}</span>
    <span class="btn-delete" @click="deletePost(post.id)"><font-awesome-icon icon="fa-solid fa-trash" /></span>
    <div v-if="post.imageUrl" class="img-container">
      <img :src="post.imageUrl" alt="Post Image" class="img" />
    </div>
    <!-- gestion des likes -->
    <div class="likes">
      <span class="like" v-if="post.isLiked" :class="{ redColor: post.isLiked }"
        @click="addAndRemoveFAv(post)"><font-awesome-icon icon="fa-solid fa-heart" /></span>
      <span class="like" v-if="!post.isLiked" :class="{ redColor: (post.isLiked = false) }"
        @click="addAndRemoveFAv(post)"><font-awesome-icon icon="fa-solid fa-heart" /></span>
      <span class="nbLike" v-if="post.isLiked" :class="{ redColor: true }">{{
        post.nbLikes
      }}</span>
      <span class="nbLike" v-else>{{ post.nbLikes }}</span>
    </div>
    <!-- date -->
    <span class="date"><span><font-awesome-icon icon="fa-solid fa-clock" /></span>{{ formatDate(post.created_at)
      }}</span>

    <!-- Gestion des commentaires -->

    <span class="comment-icon" @click="toggleComments(post)">
      <font-awesome-icon icon="fa-solid fa-comment" />
      {{ post.nbComments }}
    </span>

    <div v-if="post.comments?.length === 0 && post.showComments">
      <span style="color: #ccc"><font-awesome-icon icon="fa-solid fa-triangle-exclamation" /></span><span
        style="font-size: 10px; display: inline-block; margin-left: 20px">Aucun commentaire pour ce post !</span>
    </div>
    <div v-if="post.showComments" class="comments-container">
      <div class="comment-form">
        <input v-model="post.newComment" placeholder="Écrire un commentaire…" @keyup.enter="addComment(post)" />
        <button @click="addComment(post)">Envoyer</button>
      </div>
      <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
        <img :src="comment.url_photo" class="comment-avatar" />
        <div class="comment-content">
          <span class="comment-user">{{ comment.username }}</span>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default {
  props: ["post", "token", "currentUser"],
  data() {
    return {};
  },
  async mounted() { },
  methods: {
    formatDate(date) {
      return dayjs(date).fromNow();
    },
    addAndRemoveFAv() {
      this.$emit("like", this.post);
    },
    async toggleComments() {
      this.$emit("toggle-comments", this.post);
    },
    goToProfile(post) {
      this.$emit("go-to-profile", post);
    },    
    async addComment() {
      this.$emit("add-comment", this.post);
    },
    deletePost(postId) {
      this.$emit("delete-post", postId);
    },
  },
};
</script>

<style>
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

.post .publisher {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: 0.3s;
}

.post .publisher:hover {
 background-color: rgba(0, 0, 255, 0.1);
 color: blue;
}

.post .publisher:active {
  transform: scale(0.97);
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

/* Responsive adjustments */
@media (max-width: 900px) {
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
