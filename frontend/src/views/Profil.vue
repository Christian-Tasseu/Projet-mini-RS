<template>
  <div class="wrapper-contain">
    <div class="contain">
      <header>
        {{ isOwnProfile ? "Mon Profil" : "Profil de " + username }}
      </header>

      <div class="img-profil-container">
        <div v-if="imagePreview" class="img-profil">
          <img :src="imagePreview" alt="Aperçu" />
          <button v-if="isOwnProfile" @click="annulerImage" class="cancel-btn">
            <font-awesome-icon icon="fa-solid fa-trash" />
          </button>
        </div>
        <div v-else class="img-profil">
          <img :src="urlPhoto" alt="Photo de profil" />
        </div>

        <button
          v-if="isOwnProfile"
          @click="$refs.inputFile.click()"
          class="edit-photo-btn"
        >
          <font-awesome-icon icon="fa-solid fa-camera" />
        </button>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <strong>{{ followersCount }}</strong> followers
        </div>
        <div class="stat-item">
          <strong>{{ followingCount }}</strong> following
        </div>
      </div>

      <div v-if="!isOwnProfile" class="action-center">
        <button
          @click="toggleFollow"
          :class="isFollowed ? 'btn-unfollow' : 'btn-follow'"
        >
          {{ isFollowed ? "Désabonné" : "Suivre" }}
        </button>
      </div>

      <input
        type="file"
        @change="onFileSelected"
        ref="inputFile"
        accept="image/*"
        style="display: none"
      />

      <div class="info-profil">
        <div class="info-row">
          <p>Nom</p>
          <span class="value" v-if="!activeModifName">{{ username }}</span>
          <span class="value" v-else>
            <input ref="nameInput" v-model="newName" type="text" />
          </span>
          <span
            v-if="isOwnProfile"
            class="edit-icon"
            @click="activeModifName ? validNewName() : modifName()"
          >
            <font-awesome-icon
              :icon="activeModifName ? 'fa-solid fa-save' : 'fa-solid fa-edit'"
            />
          </span>
        </div>

        <div class="info-row">
          <p>Bio</p>
          <span class="value" v-if="!activeModifBio">{{
            bio || "Aucune bio"
          }}</span>
          <span class="value" v-else>
            <input ref="bioInput" v-model="newBio" type="text" />
          </span>
          <span
            v-if="isOwnProfile"
            class="edit-icon"
            @click="activeModifBio ? validNewBio() : modifBio()"
          >
            <font-awesome-icon
              :icon="activeModifBio ? 'fa-solid fa-save' : 'fa-solid fa-edit'"
            />
          </span>
        </div>
      </div>

      <div class="updateProfil">
        <button
          v-if="isOwnProfile"
          @click="updateProfil"
          class="update-btn"
          :class="{ colorBlue }"
        >
          Appliquer les modifications
        </button>
        <button @click="goHome" class="home-btn">Retour à l'accueil</button>
      </div>
    </div>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import { apiService } from "../services/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default {
  data() {
    return {
      token: "",
      userId: null,
      urlPhoto: "",
      username: "",
      bio: "",
      email: "",
      activeModifName: false,
      newName: "",
      newBio: "",
      newEmail: "",
      activeModifBio: false,
      activeModifEmail: false,
      imagePreview: null,
      selectedFile: null,
      colorBlue: false,
      isOwnProfile: false,
      followersCount: 0,
      followingCount: 0,
      isFollowed: false,
      userPosts: [],
    };
  },
  async mounted() {
    this.token = localStorage.getItem("token");
    const myDataArray = await apiService.getProfil(this.token);
    const myId = myDataArray[0].id;
    const targetId = this.$route.params.id;

    // Si pas d'ID dans l'URL ou si l'ID est le mien
    if (!targetId || targetId == myId) {
      this.isOwnProfile = true;
      const data = await apiService.getPublicProfile(targetId, this.token);
      this.userId = myId;
      this.fillData(data.user);
      this.followersCount = data.user.followersCount;
      this.followingCount = data.user.followingCount;
    } else {
      // C'est le profil de quelqu'un d'autre
      this.isOwnProfile = false;
      const data = await apiService.getPublicProfile(targetId, this.token);
      this.fillData(data.user);
      this.userPosts = data.posts;
      this.followersCount = data.user.followersCount;
      this.followingCount = data.user.followingCount;
      this.isFollowed = data.user.isFollowed;
    }
  },
  methods: {
    fillData(user) {
      this.username = user.username;
      this.bio = user.bio;
      this.email = user.email;
      this.urlPhoto = user.url_photo;
      this.userId = user.id;
    },
    async toggleFollow() {
      try {
        if (this.isFollowed) {
          await apiService.unfollowUser(this.userId, this.token);
          this.followersCount--;
        } else {
          await apiService.followUser(this.userId, this.token);
          this.followersCount++;
        }
        this.isFollowed = !this.isFollowed;
      } catch (err) {
        console.error("Erreur follow/unfollow", err);
      }
    },
    // Affichage de l'image temporaire
    async onFileSelected(e) {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
        this.colorBlue = true;
      }
    },
    // Annuler le changement de photo
    annulerImage() {
      this.selectedFile = null;
      this.imagePreview = null;
      this.colorBlue = false;
    },
    // Changement de la photo de profil
    async updateProfil() {
      const formData = new FormData();
      formData.append("username", this.username);
      formData.append("bio", this.bio);
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }
      try {
        const ok = await apiService.updateProfilImage(
          this.userId,
          this.token,
          formData,
        );
        if (ok) {
          Toast.fire({
            icon: "success",
            title: "Profil mis à jour avec succès !",
          });
          this.urlPhoto = this.imagePreview;
          this.colorBlue = false;
          this.imagePreview = null;
          this.selectedFile = null;
        } else {
          console.error("Erreur lors de la mise à jour du profil");
        }
      } catch (err) {
        console.error("Erreur réseau lors de la mise à jour du profil:", err);
      }
    },
    // Modification : nom, bio, email
    modifName() {
      this.newName = this.username;
      this.activeModifName = true;
      this.$nextTick(
        () => this.$refs.nameInput && this.$refs.nameInput.focus(),
      );
    },
    modifBio() {
      this.newBio = this.bio;
      this.activeModifBio = true;
      this.$nextTick(() => this.$refs.bioInput && this.$refs.bioInput.focus());
    },
    modifEmail() {
      this.newEmail = this.email;
      this.activeModifEmail = true;
      this.$nextTick(
        () => this.$refs.emailInput && this.$refs.emailInput.focus(),
      );
    },
    async validNewName(userId) {
      try {
        const ok = await apiService.updateUsername(
          this.userId,
          this.token,
          this.newName,
        );
        if (ok) {
          Toast.fire({
            icon: "success",
            title: "Nom utilisateur mis à jour avec succès !",
          });
          this.username = this.newName;
          this.activeModifName = false;
        } else {
          console.error("Erreur lors de la mise à jour du nom utilisateur");
        }
      } catch (err) {
        console.error("Erreur réseau lors de la mise à jour du profil:", err);
      }
    },
    async validNewBio(userId) {
      try {
        const ok = await apiService.updateBio(
          this.userId,
          this.token,
          this.newBio,
        );
        if (ok) {
          Toast.fire({
            icon: "success",
            title: "Bio mise à jour avec succès !",
          });
          this.bio = this.newBio;
          this.activeModifBio = false;
        } else {
          console.error("Erreur lors de la mise à jour de la bio");
        }
      } catch (err) {
        console.error("Erreur réseau lors de la mise à jour du profil:", err);
      }
    },
    async validNewEmail() {
      try {
        const ok = await apiService.updateEmail(
          this.userId,
          this.token,
          this.newEmail,
        );
        if (ok) {
          Toast.fire({
            icon: "success",
            title: "E-mail mis à jour avec succès !",
          });
          this.email = this.newEmail;
          this.activeModifEmail = false;
        } else {
          console.error("Erreur lors de la mise à jour de l'email");
        }
      } catch (err) {
        console.error("Erreur réseau lors de la mise à jour du profil:", err);
      }
    },
    goHome() {
      this.$router.push("/accueil");
    },
    cancelName() {
      this.newName = "";
      this.activeModifName = false;
    },
    cancelBio() {
      this.newBio = "";
      this.activeModifBio = false;
    },
    cancelEmail() {
      this.newEmail = "";
      this.activeModifEmail = false;
    },
  },
};
</script>
<style scoped>
.wrapper-contain {
  height: 100vh;
  width: 100vw;
  display: grid;
  place-items: center;
  background: #f5f5f5;
  padding: 1rem;
  overflow: hidden;
}

.contain {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  position: relative;
}

header {
  margin: 0;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px 8px 0 0;
  background-color: #d4e2eb;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

.img-profil {
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.img-profil img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-profil .cancel-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.edit {
  background-color: white;
  color: black;
  font-size: 1.1rem;
  border: none;
  border-radius: 5px;
  width: 38px;
  height: 38px;
  cursor: pointer;
}

.edit:hover {
  color: blue;
}

.info-profil {
  width: 100%;
  margin-top: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.info-row p {
  flex: 0 0 120px;
  font-weight: 600;
  opacity: 0.85;
  margin: 0;
}

.info-row .value {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
}

.info-row .value input {
  width: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
}

.info-row .edit-icon {
  margin-left: 10px;
  cursor: pointer;
  color: #333;
}

.info-row .edit-icon:hover {
  color: blue;
}

.info-row .cancel {
  margin-left: 10px;
  background: transparent;
  border: none;
  color: #c00;
  cursor: pointer;
  font-size: 0.9rem;
}

.info-row .cancel:hover {
  text-decoration: underline;
}

.updateProfil {
  text-align: center;
  margin-top: 2rem;
}

.updateProfil .update-btn,
.updateProfil .home-btn {
  padding: 10px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.3;
  margin: 0.5rem;
  transition:
    background-color 0.2s,
    opacity 0.2s,
    transform 0.1s;
}

.updateProfil .update-btn.colorBlue {
  opacity: 1;
}

.updateProfil .home-btn {
  background-color: #555;
  opacity: 1;
}

.updateProfil .update-btn:hover {
  opacity: 1;
  background-color: #1a1aff;
}

.updateProfil .home-btn:hover {
  opacity: 1;
  background-color: #ff7878;
}

.updateProfil .update-btn:active,
.updateProfil .home-btn:active {
  transform: scale(0.97);
  background-color: #0000cc;
}

.updateProfil .home-btn:active {
  transform: scale(0.97);
  background-color: #d60101;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
  font-size: 0.9rem;
}

.action-center {
  text-align: center;
  margin-bottom: 20px;
}

.btn-follow {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-unfollow {
  background-color: #e4e6eb;
  color: black;
  border: none;
  padding: 8px 25px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.edit-photo-btn {
  position: absolute;
  bottom: 0;
  right: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
}

@media (min-width: 900px) {
  .contain {
    padding: 2rem 3rem;
  }
  .img-profil {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 600px) {
  .contain {
    padding: 1rem;
  }
  .img-profil {
    width: 140px;
    height: 140px;
  }
}
</style>
