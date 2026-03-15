const db = require("../config/db");

// Récupérer la conversation entre moi et un autre utilisateur
exports.getConversation = async (req, res) => {
    const myId = req.user.id;
    const otherId = req.params.id;

    try {
        const [messages] = await db.query(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?) 
             ORDER BY created_at ASC`,
            [myId, otherId, otherId, myId]
        );
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des messages" });
    }
};

// Enregistrer un nouveau message
exports.sendMessage = async (req, res) => {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;

    try {
        const [result] = await db.query(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
            [senderId, receiver_id, content]
        );
        res.status(201).json({ id: result.insertId, sender_id: senderId, content });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'envoi du message" });
    }
};