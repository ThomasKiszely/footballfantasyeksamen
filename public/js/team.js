const API_BASE_URL = "http://localhost:3000/api/team";
const editUser = document.getElementById("editUser");
const user = JSON.parse(localStorage.getItem("user"));
const logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", async (e) => {
    try{
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            credentials: "include",
        });
        if (response.ok) {
            localStorage.removeItem('user');
            localStorage.removeItem('teamId');
            window.location.href = '/';
        } else {
            alert('Could not logout');
        }
    } catch (error) {
        console.error(error.message);
    }
});

editUser.addEventListener("click", (e) => {
    window.location.href = `/editUser?userid=${user._id}`;
});

const POSITION_MAP = {
    "GK": "goalkeeperRow",
    "Defend": "defenderRow",
    "Midfield": "midfielderRow",
    "Offence": "forwardRow"
};

function normalizePosition(pos){
    const map={
        "Goalkeeper":"GK","GK":"GK",
        "Left-Back":"Defend","Right-Back":"Defend","Centre-Back":"Defend","LB":"Defend","RB":"Defend","CB":"Defend",
        "Central Midfield":"Midfield","Defensive Midfield":"Midfield","Attacking Midfield":"Midfield","CM":"Midfield","CDM":"Midfield","CAM":"Midfield",
        "Centre-Forward":"Offence","Left Winger":"Offence","Right Winger":"Offence","CF":"Offence","LW":"Offence","RW":"Offence",
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

        const currentGameweek = teamData.currentGameweek;


        const activeGameweekKey = String(currentGameweek);

        let detailedGameweekData = teamData.detailedGameweekPoints[activeGameweekKey];
        let latestPointsByPlayer = {};

        if (detailedGameweekData) {

            if (detailedGameweekData instanceof Map) {
                detailedGameweekData = Object.fromEntries(detailedGameweekData);
            }
            for (const key in detailedGameweekData) {

                latestPointsByPlayer[String(key)] = detailedGameweekData[key];
            }
        }

        // send de aktive/live point til spiller UI
        updateTeamPlayersUI(teamData.players, latestPointsByPlayer, currentGameweek);

    } catch (err) {
        console.error("Fejl ved hentning af team:", err);
        const pitchContainer = document.querySelector('.pitch-container');
        if (pitchContainer) {
            pitchContainer.insertAdjacentHTML('beforebegin', '<div class="error-message">Fejl ved hentning af hold. Prøv igen.</div>');
        }
    }
}


function updateTeamStatsUI(team) {
    const safeUpdate = (id, content) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        } else {
            console.warn(`Advarsel: DOM-element med ID '${id}' blev ikke fundet.`);
        }
    };

    safeUpdate("teamName", team.teamName);
    safeUpdate("teamBudget", (team.budget / 1000000).toFixed(1) + "M");
    safeUpdate("teamPoints", team.points);

    // --- Opdater Gameweek/Point Logik ---

    const activeGameweek = team.currentGameweek;
    // Den GW, der lige er afsluttet
    const previousGameweek = activeGameweek > 1 ? activeGameweek - 1 : 1;

    // --- 1. TIDLIGERE POINT (AFSLUTTET GW) ---
    let previousGWLabel = `GW ${previousGameweek} Point`;

    safeUpdate("previousGameweekLabel", previousGWLabel);
    safeUpdate("previousGameweekPoints", team.latestGameweekPoints); // Afsluttede point (GW 14)

    // Live point

    const activeGameweekHeaderEl = document.getElementById('activeGameweekHeader');

    // Antager, at du har DOM-elementer med ID'erne 'livePointsLabel' og 'liveGameweekPointsValue' i din HTML.
    const livePointsLabelEl = document.getElementById('livePointsLabel');

    if (activeGameweekHeaderEl) {
        // Sikrer, at containeren er synlig igen, hvis den blev skjult
        const parentDiv = activeGameweekHeaderEl.closest('.points-display');
        if (parentDiv) parentDiv.style.display = '';
    }

    // Label for den aktive GW (f.eks. GW 15 Live)
    if (livePointsLabelEl) {
        livePointsLabelEl.textContent = `GW ${activeGameweek} Live Point`;
    } else {
        // Fallback, hvis elementet har et ældre ID (som i dit tidligere script)
        safeUpdate('gameweekPointsLabel', `GW ${activeGameweek} Live Point`);
    }

    // Viser de LIVE point for nuværende gameweek
    safeUpdate("liveGameweekPointsValue", team.activeGameweekPoints);
}


function updateTeamPlayersUI(players, latestPointsByPlayer) {
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
        const broadPosition = normalizePosition(player.position);
        const rowKey = POSITION_MAP[broadPosition];

        const playerIdString = player._id.toString();

        // Bruger latestPointsByPlayer, som indeholder point fra den AFSLUTTEDE GW (currentGameweek - 1)
        const playerPoints = latestPointsByPlayer[playerIdString] || 0;


        const pointsClass = playerPoints > 0 ? 'player-points-positive' : 'player-points-zero';

        if (player.name === "Guglielmo Vicario") {
            console.log(`Frontend ID for Vicario: ${player._id.toString()}`);
        }

        if (rowKey) {
            const positionLabel = broadPosition;

            const playerCardHTML = `
                <div class="player-slot" data-player-id="${player._id}" data-position="${broadPosition}">
                    <div class="player-card filled">
                        <div class="player-name">${player.name}</div>
                        <div class="player-club">${player.club}</div>
                        <div class="player-stats">
                            <div class="player-price">${(player.price / 1000000).toFixed(1)}M</div>
                            <div class="player-gameweek-points ${pointsClass}">${playerPoints}</div>
                        </div>
                        <div class="position-label">${positionLabel}</div>
                    </div>
                </div>
            `;
            positionRows[rowKey].push(playerCardHTML);
        } else {
            console.warn(`Ukendt position: ${player.position} (${broadPosition})`);
        }
    });


    document.getElementById("goalkeeperRow").innerHTML = positionRows.goalkeeperRow.join('');
    document.getElementById("defenderRow").innerHTML = positionRows.defenderRow.join('');
    document.getElementById("midfielderRow").innerHTML = positionRows.midfielderRow.join('');
    document.getElementById("forwardRow").innerHTML = positionRows.forwardRow.join('');
}

function addEditTeamButton() {
    const headerTopRow = document.querySelector('.header-top-row');

    if (headerTopRow && !document.getElementById('editTeamBtn')) {
        const editButton = document.createElement('button');
        editButton.id = 'editTeamBtn';
        editButton.textContent = 'Ændre Hold';
        // Brug en mere passende, stærk knapfarve
        editButton.className = 'btn btn-primary btn-small edit-team-action';

        headerTopRow.appendChild(editButton);

        editButton.addEventListener('click', () => {
            const teamId = getTeamIdFromUrl() || localStorage.getItem("teamId");
            if (teamId) {
                window.location.href = `/edit-team?teamId=${teamId}`;
            } else {
                alert('Could not find team ID to edit.');
            }
        });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadTeam();
    addEditTeamButton();
});