
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
            fetch('http://localhost:3000/api/inscription', {
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
                    alert('Erreur lors de l\'inscription');
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
    width: 400px;
    height: 600px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #565656;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
h2 {
    font-size: 40px;
    text-align: center;
    color: rgb(57, 57, 57);
}
.form-group {
    margin-bottom: 55px;
}
label {
    display: block;
    margin-left: 40px;
    margin-bottom: 5px;
    color: rgb(34, 34, 34);
    text-align: left;
}
input {
    width: 90%;
    padding: 8px;
    box-sizing: border-box;
    background-color: white;
    color: black;
    border: none;
    border-bottom: 1px solid #828aff;
    border-left: 1px solid #828aff;
    border-radius: 05px;
    outline: none;
}

button {
    width: 90%;
    padding: 10px 25px;
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
</style>