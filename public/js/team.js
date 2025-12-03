const API_BASE_URL = "http://localhost:3000/api/team";
const editUser = document.getElementById("editUser");
const user = JSON.parse(localStorage.getItem("user"));

editUser.addEventListener("click", (e) => {
    window.location.href = `/editUser?userid=${user._id}`;
});

// Globalt kort over de fire brede positioner for at matche rækkerne i create-team.js
const POSITION_MAP = {
    "GK": "goalkeeperRow",
    "Defend": "defenderRow",
    "Midfield": "midfielderRow",
    "Offence": "forwardRow"
};

// Skal matche den logik, der bruges i create-team.js
function normalizePosition(pos){
    const map={
        "Goalkeeper":"GK","GK":"GK",
        "Left-Back":"Defend","Right-Back":"Defend","Centre-Back":"Defend","LB":"Defend","RB":"Defend","CB":"Defend",
        "Central Midfield":"Midfield","Defensive Midfield":"Midfield","Attacking Midfield":"Midfield","CM":"Midfield","CDM":"Midfield","CAM":"Midfield",
        "Centre-Forward":"Offence","Left Winger":"Offence","Right Winger":"Offence","CF":"Offence","LW":"Offence","RW":"Offence",
        // Sikrer at hvis vi får en bred kategori fra API/DB, den også virker
        "Defence": "Defend"
    };
    return map[pos] || pos;
}

function getTeamIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("teamId");
}

async function loadTeam() {
    try {
        const teamId = getTeamIdFromUrl() || localStorage.getItem("teamId");
        if (!teamId) {
            window.location.href = "/create-team";
            return;
        }

        const response = await fetch(`${API_BASE_URL}/${teamId}`, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "/";
            return;
        }
        if (!response.ok) {
            throw new Error("Kunne ikke hente team");
        }

        const teamData = await response.json();
        localStorage.setItem("teamId", teamData._id);
        updateTeamStatsUI(teamData);
        updateTeamPlayersUI(teamData.players);
    } catch (err) {
        console.error("Fejl ved hentning af team:", err);
        const pitchContainer = document.querySelector('.pitch-container');
        if (pitchContainer) {
            pitchContainer.insertAdjacentHTML('beforebegin', '<div class="error-message">Fejl ved hentning af hold. Prøv igen.</div>');
        }
    }
}

function updateTeamStatsUI(team) {
    document.getElementById("teamName").textContent = team.teamName;
    document.getElementById("teamBudget").textContent = team.budget.toFixed(2);
    document.getElementById("teamPoints").textContent = team.points;

    document.getElementById("gameweekPoints").textContent = team.latestGameweekPoints;
}

function renderGameweekPoints(pointsPerGameweek) {
    const containerEl = document.getElementById("gameweekPointsContainer"); // Tjek at du har dette ID i din HTML!
    if (!containerEl) return;

    // Tøm containeren først
    containerEl.innerHTML = '';

    // Tjek om der er data
    const matchdays = Object.keys(pointsPerGameweek);
    if (matchdays.length === 0) {
        containerEl.innerHTML = '<p>Ingen pointdata fundet for Gameweeks endnu.</p>';
        return;
    }

    // Opret en tabel
    let html = `
        <h3 class="stats-title">Points pr. Kampdag</h3>
        <table class="gameweek-table">
            <thead>
                <tr>
                    <th>Kampdag</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Sorter kampdagene numerisk, da de kan være strenge ('1', '10')
    matchdays.sort((a, b) => parseInt(a) - parseInt(b));

    matchdays.forEach(matchday => {
        const points = pointsPerGameweek[matchday];
        html += `
            <tr>
                <td>${matchday}</td>
                <td>${points}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    containerEl.innerHTML = html;
}

// 🎯 Opdateret: Bruger de normaliserede positioner (GK, Defend, Midfield, Offence)
function updateTeamPlayersUI(players) {
    // Tøm de nuværende rækker
    document.getElementById("goalkeeperRow").innerHTML = '';
    document.getElementById("defenderRow").innerHTML = '';
    document.getElementById("midfielderRow").innerHTML = '';
    document.getElementById("forwardRow").innerHTML = '';

    const positionRows = {
        goalkeeperRow: [],
        defenderRow: [],
        midfielderRow: [],
        forwardRow: [],
    };

    players.forEach(player => {
        // Normaliserer positionen (f.eks. 'Left-Back' bliver til 'Defend')
        const broadPosition = normalizePosition(player.position);

        // Finder den korrekte række (f.eks. 'Defend' mapper til 'defenderRow')
        const rowKey = POSITION_MAP[broadPosition];

        if (rowKey) {
            // Skriver den brede position på kortet
            const positionLabel = broadPosition;

            const playerCardHTML = `
                <div class="player-slot" data-player-id="${player._id}" data-position="${broadPosition}">
                    <div class="player-card filled">
                        <span class="remove-player">X</span>
                        <div class="player-name">${player.name}</div>
                        <div class="player-club">${player.club}</div>
                        <div class="player-price">${player.price}M</div>
                        <div class="position-label">${positionLabel}</div>
                    </div>
                </div>
            `;
            positionRows[rowKey].push(playerCardHTML);
        } else {
            console.warn(`Ukendt position: ${player.position} (${broadPosition})`);
        }
    });

    // Indsæt den genererede HTML i de korrekte DOM-elementer
    document.getElementById("goalkeeperRow").innerHTML = positionRows.goalkeeperRow.join('');
    document.getElementById("defenderRow").innerHTML = positionRows.defenderRow.join('');
    document.getElementById("midfielderRow").innerHTML = positionRows.midfielderRow.join('');
    document.getElementById("forwardRow").innerHTML = positionRows.forwardRow.join('');
}

document.addEventListener("DOMContentLoaded", loadTeam);