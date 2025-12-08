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

    jwt.verify(token, process.env.JWT_SECRET || "hemmelig-nøgle", async (err, decoded) => {
        if (err) {
            if (isApiRoute) {
                return res.status(403).json({message: "Ugyldigt eller udløbet token"});
            } else {
                res.clearCookie('jwt');
                return res.redirect('/login');
            }
        }

        req.user = {
            id: decoded.id,
            role: decoded.role || 'user'
        };

        try {
            const userTeam = await teamService.getTeamByUserId(decoded.id);
            if (userTeam) {
                req.user.teamId = userTeam._id.toString();
            } else {
                req.user.teamId = null;
            }
            next();
        } catch (dbError) {
            console.error("Fejl ved hentning af Team ID:", dbError);
            return res.status(500).json({message: "Intern serverfejl under validering."});
        }
    });
}

module.exports = authenticateToken;