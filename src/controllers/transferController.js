const transferService = require("../services/transferService");

exports.sellPlayer = async (req, res) => {

    const { playerId, teamId } = req.body;

    if (!playerId || !teamId) {
        return res.status(400).json({ message: "Spiller og hold er et krav." });
    }

    try {
        const updatedTeam = await transferService.sellPlayer(playerId, teamId);
        res.status(200).json({ message: "Spiller solgt.", team: updatedTeam });

    } catch (error) {
        if (error.message === "Spiller ikke fundet." || error.message === "Hold ikke fundet.") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Dette hold ejer ikke denne spiller.") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Fejl i salg af spiller.", error: error.message });
    }
};
