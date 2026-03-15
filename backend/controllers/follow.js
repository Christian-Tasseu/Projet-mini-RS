const db = require("../config/db");

// controllers/follow.js
exports.followUser = async (req, res) => {
    const followerId = req.user.id; // celui qui suit
    const followingId = req.params.id; // celui qui est suivit

    if (followerId == followingId) {
        return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même." });
    }

    try {
        await db.query(
            "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
            [followerId, followingId]
        );
        res.status(201).json({ message: "Utilisateur suivi !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du follow." });
    }
};

exports.unfollowUser = async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    try {
        await db.query(
            "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
            [followerId, followingId]
        );
        res.status(200).json({ message: "Utilisateur désabonné." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'unfollow." });
    }
};