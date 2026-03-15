<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="user-info" @click="goToActiveUserProfile">
        <img
          v-if="activeUser.url_photo"
          :src="activeUser.url_photo"
          class="avatar-img"
        />
        <div v-else class="avatar-mini">
          <font-awesome-icon icon="fa-solid fa-user" />
        </div>
        <span>{{ activeUser.username }}</span>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </button>
    </div>

    <div class="messages-display" ref="messageBox">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'message-bubble',
          msg.sender_id === currentUserId ? 'sent' : 'received',
        ]"
      >
        <p>{{ msg.content }}</p>
        <span class="time">{{ formatDate(msg.created_at) }}</span>
      </div>
    </div>

    <div class="chat-input-area">
      <input
        v-model="newMessage"
        @keyup.enter="send"
        placeholder="Écrivez votre message..."
        type="text"
      />
      <button @click="send" :disabled="!newMessage.trim()">
        <font-awesome-icon icon="fa-solid fa-paper-plane" />
      </button>
    </div>
  </div>
</template>

<script>
import { apiService } from "../services/api";
import dayjs from "dayjs";
export default {
  props: ["activeUser"], // activeUser est maintenant l'objet {id, username...}
  data() {
    return {
      newMessage: "",
      messages: [],
      token: localStorage.getItem("token"),
      currentUserId: null, // On va le récupérer pour savoir si le message est "sent" ou "received"
    };
  },
  async mounted() {
    // 1. Récupérer mon ID depuis le token ou le profil pour comparer
    const profil = await apiService.getProfil(this.token);
    this.currentUserId = profil[0].id;

    // 2. Charger la discussion
    this.loadMessages();

    // On demande à l'API s'il y a du nouveau toutes les 4 secondes
    this.polling = setInterval(() => {
      this.loadMessages();
    }, 4000);
  },

  beforeUnmount() {
    // CRITIQUE : On arrête le chrono quand on quitte le chat
    // pour ne pas ralentir l'ordinateur de l'utilisateur
    clearInterval(this.polling);
  },

  methods: {
    goToActiveUserProfile() {
      if (!this.activeUser?.id) return;
      this.$router.push(`/profil/${this.activeUser.id}`);
    },
    formatDate(date) {
      if (!date) return "";
      // Utilise dayjs (déjà installé dans ton projet) pour un joli rendu
      return dayjs(date).format("HH:mm");
    },
    // Récupère les messages de la conversation avec l'utilisateur actif
    async loadMessages() {
      try {
        this.messages = await apiService.getMessages(
          this.activeUser.id,
          this.token,
        );
        this.scrollToBottom();
      } catch (err) {
        console.error("Erreur chargement messages", err);
      }
    },
    async send() {
      if (!this.newMessage.trim()) return;

      try {
        const res = await apiService.sendMessage(
          this.activeUser.id,
          this.newMessage,
          this.token,
        );
        // On ajoute le message localement pour l'affichage immédiat
        this.messages.push(res);
        this.newMessage = "";
        this.scrollToBottom();
      } catch (err) {
        console.error("Erreur envoi", err);
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.messageBox;
        if (box) box.scrollTop = box.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh; /* Ajuste selon ton besoin */
  background: white;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.user-info:hover {
  opacity: 0.8;
}

.avatar-mini {
  width: 35px;
  height: 35px;
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.messages-display {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f0f2f5;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
  font-size: 14px;
}

.sent {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.received {
  align-self: flex-start;
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.time {
  font-size: 10px;
  display: block;
  margin-top: 5px;
  opacity: 0.7;
}

.chat-input-area {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 25px;
  outline: none;
}

button {
  background: #007bff;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
}
</style>
