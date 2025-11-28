// team.js

// =========================================================
// 1. Variabler og DOM-elementer
// =========================================================

// Antag at disse elementer eksisterer i din HTML
const budgetRemainingEl = document.getElementById('budget-remaining');
const totalPointsEl = document.getElementById('total-points');
const teamPlayerListEl = document.getElementById('team-player-list');
const teamId = 'DIN_HOLD_ID_HER'; // Skal hentes dynamisk i en rigtig app (f.eks. fra URL eller session)
const API_BASE_URL = '/api/team'; // Erstat med din korrekte API sti, f.eks. 'http://localhost:3000/api/team'

// =========================================================
// 2. Budgetberegningslogik (Ny og Opdateret)
// =========================================================

/**
 * Beregner holdets samlede omkostninger baseret på en liste af spillerobjekter.
 * * VIGTIGT: Denne funktion antager, at 'players' er et array af fuldt populerede
 * spillerobjekter fra databasen, HVER med en 'price' egenskab (i øre/den mindste enhed).
 * * @param {Array<Object>} players - Listen af spillerobjekter.
 * @returns {number} Den samlede omkostning.
 */
function calculateTeamCost(players) {
    let totalCost = 0;

    if (!players || players.length === 0) {
        return 0;
    }

    players.forEach(player => {
        // Antager at prisen er i den mindste enhed (f.eks. øre)
        const price = player.price || 0;
        totalCost += price;
    });

    return totalCost;
}

// =========================================================
// 3. Opdatering af UI
// =========================================================

/**
 * Opdaterer budget og point UI baseret på data fra API'en.
 * * @param {Object} teamData - Holddata hentet fra backend.
 */
function updateTeamStatsUI(teamData) {
    // 1. Hent baseline budget fra teamData
    // Bruger '90000000' (90M) som fallback, hvis budget ikke er i data (som i din Mongoose model)
    const initialBudget = teamData.budget || 90000000;

    // 2. Beregn den samlede omkostning for de valgte spillere
    const teamCost = calculateTeamCost(teamData.players || []);

    // 3. Beregn det resterende budget
    const remainingBudget = initialBudget - teamCost;

    // 4. Opdater UI (konverter fra den mindste enhed (øre) til M kr.)
    const remainingBudgetInMillions = remainingBudget / 1000000;

    // Formaterer til én decimal og tilføjer valuta
    budgetRemainingEl.textContent = `${remainingBudgetInMillions.toFixed(1)}M kr`;

    // Sæt farven for overskredet budget
    if (remainingBudget < 0) {
        budgetRemainingEl.style.color = 'red';
        // Du kan også deaktivere knapper her, der tillader at tilføje flere spillere
    } else {
        budgetRemainingEl.style.color = 'green';
    }

    // Opdater Point UI
    totalPointsEl.textContent = teamData.points !== undefined ? teamData.points : '0';
}

/**
 * Opdaterer listen over spillere på holdet.
 * * @param {Array<Object>} players - Listen af spillerobjekter.
 */
function updatePlayerListUI(players) {
    teamPlayerListEl.innerHTML = ''; // Ryd eksisterende liste

    if (!players || players.length === 0) {
        teamPlayerListEl.innerHTML = '<li>Dit hold er tomt. Tilføj spillere!</li>';
        return;
    }

    players.forEach(player => {
        const listItem = document.createElement('li');

        // Vis navn og pris for hver spiller
        const priceInMillions = (player.price / 1000000).toFixed(1);
        listItem.textContent = `${player.name} - ${priceInMillions}M kr`;

        // Tilføj evt. en knap til at fjerne spilleren
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Fjern';
        removeButton.dataset.playerId = player._id;
        // Tilføj eventuelt en event listener her til at kalde en delete-funktion

        listItem.appendChild(removeButton);
        teamPlayerListEl.appendChild(listItem);
    });
}

// =========================================================
// 4. Datahentning
// =========================================================

/**
 * Henter holddata fra backend og opdaterer UI.
 */
async function fetchAndUpdateTeamData() {
    try {
        const response = await fetch(`${API_BASE_URL}/${teamId}`);

        if (!response.ok) {
            throw new Error(`Fejl ved hentning af holddata: ${response.statusText}`);
        }

        const teamData = await response.json();

        // Antager at teamData ser således ud, efter .populate('players'):
        // { _id: '...', budget: 90000000, points: 150, players: [{ _id: '...', name: '...', price: 10000000 }, ...] }

        updateTeamStatsUI(teamData);
        updatePlayerListUI(teamData.players);

    } catch (error) {
        console.error('Kunne ikke opdatere holddata:', error);
        budgetRemainingEl.textContent = 'Fejl';
        totalPointsEl.textContent = 'Fejl';
    }
}

// =========================================================
// 5. Initialisering
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    if (teamId === 'DIN_HOLD_ID_HER') {
        console.error('Fejl: Opdater teamId variablen med det korrekte hold-ID.');
        return;
    }

    // Hent og vis holddata, når siden er indlæst
    fetchAndUpdateTeamData();
});