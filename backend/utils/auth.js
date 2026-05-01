const admin = require("firebase-admin");

function authRequired(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Missing token" });
    }

    try {
        const token = authHeader.split("Bearer ")[1];

        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }

        admin.auth().verifyIdToken(token)
            .then(decoded => {
                req.user_id = decoded.uid;
                next();
            })
            .catch(err => {
                console.error("Auth error:", err);
                return res.status(401).json({ error: "Invalid token" });
            });

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = authRequired;