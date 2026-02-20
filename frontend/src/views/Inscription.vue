
<template>
    <div id="container">
        <h2>Inscription</h2>
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
#container {
  max-width: 420px;
  width: 92%;
  margin: 2rem auto;
  padding: 1.6rem;
  border: 1px solid #565656;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  height: auto;
  box-sizing: border-box;
}

h1, h2 {
  font-size: 1.8rem;
  text-align: center;
  color: rgb(57,57,57);
  margin: 0 0 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin: 0 0 0.5rem;
  color: rgb(34,34,34);
  text-align: left;
  margin-left: 0;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  background-color: white;
  color: black;
  border: 1px solid rgba(130,138,255,0.25);
  border-radius: 5px;
  outline: none;
}

button {
  width: 100%;
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

@media (min-width: 768px) {
  #container {
    width: 400px;
    margin: 50px auto;
    padding: 20px;
  }
  .form-group {
    margin-bottom: 55px;
  }
  label {
    margin-left: 40px;
  }
  input, button {
    width: 90%;
  }
  h1, h2 {
    font-size: 40px;
  }
}

@media (max-width: 360px) {
  h1, h2 {
    font-size: 1.4rem;
  }
  .form-group {
    margin-bottom: 0.9rem;
  }
}
</style>