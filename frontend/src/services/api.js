// src/services/api.js
const BASE_URL = "http://localhost:3000/api";

export const apiService = {
  // Gestion du Profil
  async getProfil(token) {
    const res = await fetch(`${BASE_URL}/profil`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async profilPage(token) {
    const res = await fetch(`${BASE_URL}/profil/profilPage`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    return res.ok;
  },

  // Gestion des Posts
  async getAllPosts(token) {
    const res = await fetch(`${BASE_URL}/post`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async deletePost(postId, token) {
    const res = await fetch(`${BASE_URL}/post/${postId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    return res.ok;
  },

  async publierPost(formData, token) {
    const res = await fetch(`${BASE_URL}/post/publier`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  // Favoris
  async addFav(postId, token) {
    const res = await fetch(`${BASE_URL}/fav/add/${postId}`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async removeFav(postId, token) {
    const res = await fetch(`${BASE_URL}/fav/remove/${postId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Commentaires
  async getComments(postId) {
    const res = await fetch(`${BASE_URL}/comment/${postId}`);
    return res.json();
  },

  async addComment(postId, content, token) {
    const res = await fetch(`${BASE_URL}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ post_id: postId, content }),
    });
    return res.ok;
  },
};