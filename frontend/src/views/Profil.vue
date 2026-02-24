<template>
  <div class="wrapper-contain">
    <div class="contain">
      <header>Profil</header>
      <div v-if="imagePreview" class="img-profil">
        <img :src="imagePreview" alt="Photo de profil" />
        <button @click="annulerImage" class="cancel-btn">
          <font-awesome-icon icon="fa-solid fa-trash" />
        </button>
      </div>
      <div v-else class="img-profil">
        <img :src="urlPhoto" alt="Photo de profil" />
      </div>
      <input
        type="file"
        @change="onFileSelected"
        ref="inputFile"
        accept="image/*"
        style="display: none"
      />

      <button @click="$refs.inputFile.click()" class="edit">
        <font-awesome-icon icon="fa-solid fa-edit" />
      </button>
      <div class="info-profil">
        <div class="info-row">
          <p>Nom</p>
          <span class="value" v-if="!activeModifName">{{ username }}</span>
          <span class="value" v-else>
            <input ref="nameInput" v-model="newName" type="text" />
            <button class="cancel" @click="cancelName">Annuler</button>
          </span>
          <span class="edit-icon" @click="activeModifName ? validNewName(userId) : modifName()">
            <font-awesome-icon :icon="activeModifName ? 'fa-solid fa-save' : 'fa-solid fa-edit'" />
          </span>
        </div>
        <div class="info-row">
          <p>Bio</p>
          <span class="value" v-if="!activeModifBio">{{ bio }}</span>
          <span class="value" v-else>
            <input ref="bioInput" v-model="newBio" type="text" />
            <button class="cancel" @click="cancelBio">Annuler</button>
          </span>
          <span class="edit-icon" @click="activeModifBio ? validNewBio() : modifBio()">
            <font-awesome-icon :icon="activeModifBio ? 'fa-solid fa-save' : 'fa-solid fa-edit'" />
          </span>
        </div>
        <div class="info-row">
          <p>E-mail</p>
          <span class="value" v-if="!activeModifEmail">{{ email }}</span>
          <span class="value" v-else>
            <input ref="emailInput" v-model="newEmail" type="text" />
            <button class="cancel" @click="cancelEmail">Annuler</button>
          </span>
          <span class="edit-icon" @click="activeModifEmail ? validNewEmail() : modifEmail()">
            <font-awesome-icon :icon="activeModifEmail ? 'fa-solid fa-save' : 'fa-solid fa-edit'" />
          </span>
        </div>
      </div>
      <div class="updateProfil">
        <button
          @click="updateProfil"
          class="update-btn"
          :class="{ colorBlue }
        ">
          Appliquer les modifications
        </button>
        <button
          @click="goHome"
          class="home-btn"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import Swal from "sweetalert2";

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
        console.log(data);
        this.username = data.username;
        this.bio = data.bio;
        this.email = data.email;
        this.userId = data.id;
        this.urlPhoto = data.url_photo;
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err);
    }
  },
  methods: {
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
        const reponse = await fetch(
          `http://localhost:3000/api/profil/profilImage/${this.userId}`,
          {
            method: "PUT",
            headers: {
              authorization: `Bearer ${this.token}`,
            },
            body: formData,
          },
        );
        if (reponse.ok) {
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
      this.$nextTick(() => this.$refs.nameInput && this.$refs.nameInput.focus());
    },
    modifBio() {
      this.newBio = this.bio;
      this.activeModifBio = true;
      this.$nextTick(() => this.$refs.bioInput && this.$refs.bioInput.focus());
    },
    modifEmail() {
      this.newEmail = this.email;
      this.activeModifEmail = true;
      this.$nextTick(() => this.$refs.emailInput && this.$refs.emailInput.focus());
    },
    async validNewName(userId) {
      try {
        const reponse = await fetch(
          `http://localhost:3000/api/profil/profilName/${this.userId}`,
          {
            method: "PUT",
            headers: {
              authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newName: this.newName }),
          },
        );
        if (reponse.ok) {
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
        const reponse = await fetch(
          `http://localhost:3000/api/profil/profilBio/${this.userId}`,
          {
            method: "PUT",
            headers: {
              authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newBio: this.newBio }),
          },
        );
        if (reponse.ok) {
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
        const reponse = await fetch(
          `http://localhost:3000/api/profil/profilEmail/${this.userId}`,
          {
            method: "PUT",
            headers: {
              authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newEmail: this.newEmail }),
          },
        );
        if (reponse.ok) {
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
      this.$router.push('/accueil');
    },
    cancelName() {
      this.newName = '';
      this.activeModifName = false;
    },
    cancelBio() {
      this.newBio = '';
      this.activeModifBio = false;
    },
    cancelEmail() {
      this.newEmail = '';
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
  transition: background-color 0.2s, opacity 0.2s, transform 0.1s;
}

.updateProfil .update-btn.colorBlue {
  opacity: 1;
}

.updateProfil .home-btn {
  background-color: #555;
  opacity: 1;
}

.updateProfil .update-btn:hover{
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
