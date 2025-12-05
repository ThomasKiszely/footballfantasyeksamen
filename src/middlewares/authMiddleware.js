const jwt = require("jsonwebtoken");
const teamService = require("../services/teamService");
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

    jwt.verify(token, process.env.JWT_SECRET || "hemmelig-nøgle", async (err, user) => {
        if (err) {
            if (isApiRoute) {
                return res.status(403).json({message: "Ugyldigt eller udløbet token"});
            } else {
                res.clearCookie('jwt'); // Rydder den ugyldige cookie
                return res.redirect('/login');
            }
        }
        req.user = user; // gemmer payload (fx id, role) til senere brug

        try {
            const userTeam = await teamService.getTeamByUserId(user.id);
            if (userTeam) {
                req.user.teamId = userTeam._id.toString();
            } else {
                req.user.teamId = null;
            }
            next();
        } catch (dbError) {
            console.error("Fejl ved hentning af Team ID:", dbError);
            // Returnér 500 fejl, hvis databasekaldet fejler
            return res.status(500).json({message: "Intern serverfejl under validering."});
        }
    });
}

module.exports = authenticateToken;
