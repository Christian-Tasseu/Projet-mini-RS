<template>
  <div class="contain">
    <header>Profil</header>
    <div v-if="imagePreview" class="img-profil">
      <img :src="imagePreview" alt="Photo de profil" />
      <button
        @click="annulerImage"
        style="
          background-color: red;
          position: relative;
          top: -57px;
          left: 170px;
        "
      >
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
      <p>Nom utilisateur</p>
      <span v-if="activeModifName === false">{{ username }}</span>
      <span v-else><input v-model="newName" type="text" /></span>
      <span
        v-if="activeModifName === false"
        @click="modifName()"
        style="margin-left: 70px"
        class="edit"
        ><font-awesome-icon icon="fa-solid fa-edit"
      /></span>
      <span
        v-else
        @click="validNewName(userId)"
        style="margin-left: 70px"
        class="edit"
        ><font-awesome-icon icon="fa-solid fa-save"
      /></span>

      <p>Bio</p>
      <span v-if="activeModifBio === false">{{ bio }}</span>
      <span v-else><input v-model="newBio" type="text" /></span>
      <span
        v-if="activeModifBio === false"
        @click="modifBio()"
        style="margin-left: 70px"
        class="edit"
        ><font-awesome-icon icon="fa-solid fa-edit"
      /></span>
      <span v-else @click="validNewBio()" style="margin-left: 70px" class="edit"
        ><font-awesome-icon icon="fa-solid fa-save"
      /></span>

      <p>E-mail</p>
      <span v-if="activeModifEmail === false">{{ email }}</span>
      <span v-else><input v-model="newEmail" type="text" /></span>
      <span
        v-if="activeModifEmail === false"
        @click="modifEmail()"
        style="margin-left: 70px"
        class="edit"
        ><font-awesome-icon icon="fa-solid fa-edit"
      /></span>
      <span
        v-else
        @click="validNewEmail()"
        style="margin-left: 70px"
        class="edit"
        ><font-awesome-icon icon="fa-solid fa-save"
      /></span>
    </div>
    <div class="updateProfil">
      <button
        @click="updateProfil"
        style="background-color: blue; opacity: 0.3"
        :class="{ colorBlue }"
      >
        Appliquer les modifications
      </button>
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
          `http://localhost:3000/api/profil/${this.userId}`,
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
      this.activeModifName = true;
    },
    modifBio() {
      this.activeModifBio = true;
    },
    modifEmail() {
      this.activeModifEmail = true;
    },
    async validNewName(userId) {
      try {
        const reponse = await fetch(
          `http://localhost:3000/api/profilName/${this.userId}`,
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
          `http://localhost:3000/api/profilBio/${this.userId}`,
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
          `http://localhost:3000/api/profilEmail/${this.userId}`,
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
  },
};
</script>
<style>
body {
  margin: 0;
}
.contain {
  position: relative;
  max-width: 1000px;
  width: 90%;
  margin: 1.5rem auto;
  min-height: 60vh;
  border-radius: 10px;
  padding: 1.5rem;
  background-color: white;
  box-shadow:
    rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  box-sizing: border-box;
}
header {
  height: auto;
  padding: 15px 20px;
  border-radius: 10px 10px 0 0;
  background-color: #d4e2eb;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
}
.img-profil {
  width: 200px;
  height: 200px;
  margin: 1.5rem auto;
  border-radius: 50%;
  overflow: hidden;
}
.img-profil img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.edit {
  position: absolute;
  right: 1.25rem;
  top: 4.5rem;
  background-color: white;
  color: black;
  font-size: 1.1rem;
  border: none;
  border-radius: 5px;
  width: 38px;
  height: 38px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit:hover {
  color: blue;
}
.info-profil {
  width: calc(100% - 60px);
  max-width: 720px;
  margin: 0 auto;
  text-align: left;
  padding: 10px 20px;
  box-sizing: border-box;
}
.info-profil p {
  font-weight: 600;
  font-size: 0.95rem;
  opacity: 0.85;
  margin-bottom: 0.25rem;
}
.info-profil span {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}
.colorBlue {
  background-color: blue !important;
  opacity: 1 !important;
}

/* Desktop: two-column layout */
@media (min-width: 900px) {
  .contain {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1.5rem;
    align-items: start;
    padding: 2rem;
  }
  .img-profil {
    margin: 0;
    width: 200px;
    height: 200px;
  }
  .edit {
    right: 20px;
    top: 20px;
  }
  .info-profil {
    width: 100%;
    padding: 1rem;
  }
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .contain {
    padding: 1rem;
  }
  .img-profil {
    width: 140px;
    height: 140px;
    margin: 1rem auto;
  }
  .edit {
    position: static;
    margin: 0.5rem auto;
    display: inline-flex;
  }
  .info-profil {
    width: 100%;
    padding: 0.5rem 1rem;
  }
  .info-profil span {
    position: static;
    top: auto;
    left: auto;
  }
}
</style>
