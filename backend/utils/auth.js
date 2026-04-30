const admin = require("firebase-admin");

/**
 * Middleware: authRequired
 * Purpose: Protect routes by verifying Firebase ID token
 */
async function authRequired(req, res, next) {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header exists and follows "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized: Missing or invalid token format"
        });
    }

    try {
        // 3. Extract token from header
        // Example header: "Bearer eyJhbGciOiJSUzI1NiIs..."
        const token = authHeader.split(" ")[1];

        // 4. Verify token using Firebase Admin SDK
        // This checks:
        // - if token is valid
        // - if token is expired
        // - if token was issued by Firebase
        const decoded = await admin.auth().verifyIdToken(token);

        // 5. Attach user data to request object
        // This allows other routes to access user info
        req.user = decoded;          // full decoded token (email, uid, etc.)
        req.user_id = decoded.uid;   // shortcut for user ID

        // 6. Continue to next middleware or route
        next();

    } catch (error) {
        // 7. Handle invalid or expired token
        console.error("Auth error:", error);

        return res.status(401).json({
            error: "Unauthorized: Invalid or expired token"
        });
    }
}

module.exports = authRequired;