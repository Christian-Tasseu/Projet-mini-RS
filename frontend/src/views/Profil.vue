<template>
  <div class="contain">
    <header>Profil</header>
    <div class="img-profil">
      <img src="" alt="" />
    </div>
    <div class="info-profil">
      <p>Nom utilisateur</p>
      <span>{{ username }}</span>
      <p>Bio</p>
      <span>{{ bio }}</span>
      <p>E-mail</p>
      <span>{{ email }}</span>
    </div>
  </div>
</template>
<script>
import { TrackOpTypes } from "vue";

export default {
  data() {
    return {
      token: "",
      username: "",
      bio: "",
      email: "",
    };
  },
  async mounted() {
    this.token = localStorage.getItem("token");
    if (!this.token) {
      // Si pas de token, on redirige vers la connexion
      this.$router.push("/");
      return;
    }
    try {
      const reponse = await fetch("http://localhost:3000/api/profil", {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
      });
      if (reponse.ok) {
        const [data] = await reponse.json();
        this.username = data.username;
        this.bio = data.bio;
        this.email = data.email;
      }
    } catch (err) {}
  },
};
</script>
<style>
body {
  margin: 0;
}
.contain {
  width: 50vw;
  min-height: 90vh;
  border-radius: 10px;
  padding-bottom: 50px;
  background-color: white;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}
header {
  height: 30px;
  padding: 15px 30px;
  border-radius: 10px 10px 0 0;
  background-color: #d4e2eb;
  display: flex;
  justify-content: left;
  font-size: 25px;
  font-weight: 700;
}
.img-profil{
    width: 200px;
    height: 200px;
    margin: 50px auto;
    border-radius: 100%;
    background-color: blue;
}
.info-profil{
    width: 40%;
    text-align: left;
    padding: 10px 50px;
}
.info-profil p{
    font-weight: 600;
    font-size: 15px;
    opacity: 0.7;
}
.info-profil span{
    position: relative;
    top: -10px;
    left: 05px;
    font-size: 18px;
    display: inline-block;
    margin-bottom: 10px;
}
</style>
