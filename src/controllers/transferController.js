const transferService = require("../services/transferService");

const handleTransferError = (res, error) => {
    if (error.message === "Spiller ikke fundet." || error.message === "Hold ikke fundet.") {
        return res.status(404).json({ message: error.message });
    }
    if (error.message === "Dette hold ejer ikke denne spiller." ||
        error.message === "Denne spiller er allerede på dit hold." ||
        error.message.includes("Ikke nok budget")
    ) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Transfervinduet")) {
        return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "Fejl i overførselshandling.", error: error.message });
};


exports.sellPlayer = async (req, res) => {

    const playerId = req.params.playerId;
    const teamId = req.user.teamId;


    if (!playerId || !teamId) {
        return res.status(400).json({ message: "Spiller og hold er et krav." });
    }

    try {
        const updatedTeam = await transferService.sellPlayer(playerId, teamId);
        res.status(200).json({ message: "Spiller solgt.", team: updatedTeam });

    } catch (error) {
        handleTransferError(res, error);
    }
};

exports.buyPlayer = async (req, res) => {
    // Sikkerhed: Henter teamId fra den autentificerede bruger
    const teamId = req.user.teamId;
    const { playerId } = req.body; // Antager playerId sendes i body

    if (!playerId || !teamId) {
        return res.status(400).json({ message: "Spiller og hold er et krav." });
    }

    try {
        const updatedTeam = await transferService.buyPlayer(playerId, teamId);
        res.status(200).json({
            message: "Spiller købt og budget opdateret.",
            team: updatedTeam
        });

    } catch (error) {
        handleTransferError(res, error);
    }
};
