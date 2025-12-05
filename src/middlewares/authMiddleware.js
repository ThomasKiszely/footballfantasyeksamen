const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    const isApiRoute = req.originalUrl.startsWith('/api/');
    if (!token) {
        if(isApiRoute) {
            return res.status(401).json({message: "Token mangler"});
        } else {
            return res.redirect('/login');
        }
    }

    jwt.verify(token, process.env.JWT_SECRET || "hemmelig-nøgle", (err, user) => {
        if (err) {
            if(isApiRoute) {
                return res.status(403).json({message: "Ugyldigt eller udløbet token"});
            } else {
                res.clearCookie('jwt'); // Rydder den ugyldige cookie
                return res.redirect('/login');
            }
        }
        req.user = user; // gemmer payload (fx id, role) til senere brug
        next();
    });
}

module.exports = authenticateToken;
