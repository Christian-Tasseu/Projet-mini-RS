
<template>
  <div class="wrapper-contain">
    <div class="form-contain">
      <header>Inscription</header>
      <form @submit.prevent="inscription">
        <div class="form-group">
          <label for="username">Nom d'utilisateur:</label>
          <input v-model="username" type="text" id="username" name="username" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail:</label>
          <input v-model="email" type="email" id="email" name="email" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe:</label>
          <input v-model="mot_de_passe" type="password" id="password" name="password" required />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  </div>
</template>
<script>
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            username: '',
            email: '',
            mot_de_passe: ''
        };
    },
    methods: {
        inscription() {
            fetch('http://localhost:3000/api/auth/inscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.username,
                    email: this.email,
                    mot_de_passe: this.mot_de_passe
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    console.log('Inscription réussie');
                    this.$router.push('/');
                } else {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: "Erreur lors de l'inscription", showConfirmButton: false, timer: 3000, timerProgressBar: true });
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
        }
    }
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

.form-contain {
  width: 100%;
  max-width: 600px;
  padding: 2rem 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  text-align: center;
  box-sizing: border-box;
}

header {
  margin: 0; 
  padding: 20px;
  margin-bottom: 40px;
  border-radius: 8px 8px 0 0;
  background-color: #d4e2eb;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
}

.form-group {
  width: 100%;
  margin-bottom: 1.85rem;
}

label {
  display: block;
  color: rgb(34, 34, 34);
  margin-left: 30px;
  margin-bottom: 20px;
  text-align: left;
  font-size: 1rem;
  font-weight: bold;
}

input {
  width: 80%;
  height: 40px;
  padding: 8px;
  background-color: white;
  color: black;
  border: 1px solid rgba(130, 138, 255, 0.25);
  border-radius: 5px;
  outline: none;
}

button {
  width: 50%;
  padding: 10px 16px;
  background-color: #333584;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #161dec;
}
button:active {
  background-color: #080565;
}

/* Desktop: keep original spacing */
@media (max-width: 768px) {
  .form-contain {
    width: 70%;
    height: 100%;
  }
  .form-group {
    margin-bottom: 55px;
  }
  label {
    margin-left: 40px;
  }
  input,
  button {
    width: 90%;
  }
  h1,
  h2 {
    font-size: 40px;
  }
}

/* Very small screens */
@media (max-width: 360px) {
  h1,
  h2 {
    font-size: 1.4rem;
  }
  .form-group {
    margin-bottom: 0.9rem;
  }
}
</style>
