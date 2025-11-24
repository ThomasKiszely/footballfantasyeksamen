const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // forventer "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Token mangler" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "hemmelig-nøgle", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Ugyldigt eller udløbet token" });
        }
        req.user = user; // gemmer payload (fx id, role) til senere brug
        next();
    });
}

module.exports = authenticateToken;
