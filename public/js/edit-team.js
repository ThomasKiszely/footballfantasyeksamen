const API_BASE_URL = "http://localhost:3000/api";
const playerListEl = document.getElementById("playerList");
const selectedPlayersEl = document.getElementById("selectedPlayers");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const positionFilterEl = document.getElementById("positionFilter");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicatorEl = document.getElementById("pageIndicator");
const formationSelectEl = document.getElementById("formationSelect");
const teamNameEl = document.getElementById("teamName");
let selectedPlayers = [], allPlayers = [], currentPage = 1;
const pageSize = 10;
let currentBudget = 0;
let teamId = null;
const editUser = document.getElementById("editUser");
const user = JSON.parse(localStorage.getItem("user"));
const logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", async(e) => {
    e.preventDefault();
    try{
        const response = await fetch('/api/user/logout', { method: "POST", credentials: "include" });
        if (response.ok) window.location.href = '/';
        else alert('Could not logout');
    } catch (error) {
        alert('Could not logout: ' + error.message);
    }
});

editUser.addEventListener("click", (e) => {
    window.location.href = `/editUser?userid=${user._id}`;
});

async function fetchInitialData() {
    const params = new URLSearchParams(window.location.search);
    teamId = params.get('teamId');
    if (!teamId) {
        alert("Team ID mangler. Gå tilbage til din profil og prøv igen.");
        window.location.href = '/profile'; // Or wherever the user's teams are listed
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/team/${teamId}`, { credentials: "include" });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                alert("Du har ikke adgang til dette hold.");
                window.location.href = '/login';
            } else {
                throw new Error("Kunne ikke hente holddata.");
            }
            return;
        }
        const team = await res.json();
        teamNameEl.value = team.teamName;
        currentBudget = team.budget;
        selectedPlayers = team.players;

        await loadPlayers(); // Load all available players
        renderPitch(team.formation || "4-3-3"); // Render pitch structure
        repopulatePitch(); // Place existing players on the pitch
        updateBudgetUI();
        renderPlayers(); // Render the available player list (with selections marked)

    } catch (error) {
        console.error("Fejl ved hentning af initial data: " + error.message);
        alert("Fejl ved hentning af holddata: " + error.message);
    }
}

function updateBudgetUI() {
    const remainingBudget = currentBudget / 1000000;
    const budgetEl = document.getElementById("remainingBudget");
    if (budgetEl) {
        budgetEl.textContent = `${remainingBudget.toFixed(1)}M`;
        budgetEl.style.color = remainingBudget >= 0 ? '#667eea' : '#e74c3c';
    }
}

function normalizePosition(pos) {
    const map = {
        "Goalkeeper": "GK", "GK": "GK",
        "Left-Back": "Defend", "Right-Back": "Defend", "Centre-Back": "Defend", "LB": "Defend", "RB": "Defend", "CB": "Defend",
        "Central Midfield": "Midfield", "Defensive Midfield": "Midfield", "Attacking Midfield": "Midfield", "CM": "Midfield", "CDM": "Midfield", "CAM": "Midfield",
        "Centre-Forward": "Offence", "Left Winger": "Offence", "Right Winger": "Offence", "CF": "Offence", "LW": "Offence", "RW": "Offence",
        "Defence": "Defend"
    };
    return map[pos] || pos;
}

async function loadPlayers() {
    try {
        const res = await fetch(`${API_BASE_URL}/players`, { credentials: "include" });
        if (!res.ok) throw new Error("Kunne ikke hente spillere");
        allPlayers = await res.json();
    } catch (err) {
        console.error("Fejl ved hentning af spillere:", err);
    }
}

function renderPlayers() {
    playerListEl.innerHTML = "";
    const filter = positionFilterEl.value;
    let filtered = filter === "ALL" ? allPlayers : allPlayers.filter(p => normalizePosition(p.position) === filter);
    const start = (currentPage - 1) * pageSize, end = start + pageSize;
    const playersToShow = filtered.slice(start, end);

    playersToShow.forEach(player => {
        const broadPosition = normalizePosition(player.position);
        const div = document.createElement("div");
        div.classList.add("player-list-item");
        div.setAttribute('data-player-id', player._id);

        const isSelected = selectedPlayers.some(p => p._id === player._id);
        if (isSelected) div.classList.add('selected');

        div.innerHTML = `
            <div class="player-info">
                <span class="player-name-list">${player.name}</span>
                <div class="player-details">
                    <span>${player.club} / ${broadPosition}</span>
                    <span class="player-price-list">${(player.price / 1000000).toFixed(1)}M</span>
                </div>
            </div>
            <button class="btn btn-small select-btn" ${isSelected ? 'disabled' : ''}>${isSelected ? 'Valgt' : 'Køb'}</button>
        `;

        const selectButton = div.querySelector(".select-btn");
        if (!isSelected) {
            selectButton.addEventListener("click", (e) => {
                e.stopPropagation();
                buyPlayer(player);
            });
        }
        playerListEl.appendChild(div);
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    pageIndicatorEl.textContent = `Side ${currentPage} af ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

async function buyPlayer(player) {
        const posLabel = normalizePosition(player.position);
        const emptySlot = document.querySelector(`.player-slot[data-position="${posLabel}"]:not([data-player-id])`);
        if (!emptySlot) {
            alert(`Ingen ledig plads til ${posLabel} i den valgte opstilling.`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/transfers/buy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ playerId: player._id }) // Sender kun ID
            });

            const data = await res.json();

            if (!res.ok) {
                // Håndterer budgetfejl, deadline-fejl, osv. fra backend
                throw new Error(data.message || "Kunne ikke købe spiller.");
            }

            const updatedTeam = data.team;

            // Synkroniser state med serverens data
            currentBudget = updatedTeam.budget;

            const newPlayerIds = updatedTeam.players.map(id => id.toString());
            selectedPlayers = allPlayers.filter(p => newPlayerIds.includes(p._id));


            // 3. Opdater UI
            fillSlotWithPlayer(emptySlot, player);
            renderPlayers();
            updateBudgetUI();
            renderSelectedPlayers();

        } catch (error) {
            alert(`Fejl ved køb: ${error.message}`);
            console.error("Buy Player API fejl:", error);
        }
}

async function sellPlayer(playerId) {
    const player = selectedPlayers.find(p => p._id === playerId);
    if (!player) return;

    const confirmation = confirm(`Er du sikker på, du vil sælge ${player.name} for ${(player.price / 1000000).toFixed(1)}M?`);
    if (!confirmation) return;

    try {
        const res = await fetch(`${API_BASE_URL}/transfers/sell/${playerId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            //body: JSON.stringify({ playerId: playerId }) // Sender ID i body (da DELETE ikke har en standard body)
        });

        const data = await res.json();

        if (!res.ok) {
            // Håndterer deadline-fejl, ejer-ikke-spiller-fejl, osv. fra backend
            throw new Error(data.message || "Kunne ikke sælge spiller.");
        }


        const updatedTeam = data.team;

        // Synkroniser state med serverens data
        currentBudget = updatedTeam.budget;

        // Opdater selectedPlayers, da spilleren nu er væk fra serverens liste
        const newPlayerIds = updatedTeam.players.map(id => id.toString());
        selectedPlayers = allPlayers.filter(p => newPlayerIds.includes(p._id));

        // 3. Opdater UI
        const slot = document.querySelector(`.player-slot[data-player-id="${playerId}"]`);
        if (slot) {
            const position = slot.getAttribute('data-position');
            slot.innerHTML = `<div class="player-card empty"><span class="add-player">+</span><span class="position-label">${position}</span></div>`;
            slot.removeAttribute("data-player-id");
        }

        renderPlayers();
        updateBudgetUI();
        renderSelectedPlayers();

    } catch (error) {
        alert(`Fejl ved salg: ${error.message}`);
        console.error("Sell Player API fejl:", error);
    }
}

function fillSlotWithPlayer(slot, player) {
    const posLabel = normalizePosition(player.position);
    slot.innerHTML = `
        <div class="player-card filled" data-player-id="${player._id}">
            <button class="sell-player-btn">Sælg</button>
            <div class="player-name">${player.name}</div>
            <div class="player-club">${player.club}</div>
            <div class="player-price">${(player.price / 1000000).toFixed(1)}M</div>
            <div class="position-label">${posLabel}</div>
        </div>
    `;
    slot.setAttribute("data-player-id", player._id);
    slot.querySelector(".sell-player-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        sellPlayer(player._id);
    });
}

function renderSelectedPlayers() {
    selectedPlayersEl.innerHTML = "";
    selectedPlayers.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name} (${player.club}) - ${(player.price / 1000000).toFixed(1)}M`;
        selectedPlayersEl.appendChild(li);
    });
}

const FORMATION_CONFIG = { "4-3-3": { Defend: 4, Midfield: 3, Offence: 3 } };

function renderPitch(formation) {
    const pitchEl = document.querySelector(".pitch");
    pitchEl.innerHTML = "";
    const config = FORMATION_CONFIG[formation];
    if (!config) return;

    const renderEmptySlot = (position) => `
        <div class="player-slot" data-position="${position}">
            <div class="player-card empty"><span class="add-player">+</span><span class="position-label">${position}</span></div>
        </div>`;

    const gkRow = document.createElement("div"); gkRow.classList.add("position-row", "goalkeeper-row");
    gkRow.innerHTML = renderEmptySlot("GK");
    pitchEl.appendChild(gkRow);

    const defRow = document.createElement("div"); defRow.classList.add("position-row", "defender-row");
    for (let i = 0; i < config.Defend; i++) defRow.innerHTML += renderEmptySlot("Defend");
    pitchEl.appendChild(defRow);

    const midRow = document.createElement("div"); midRow.classList.add("position-row", "midfielder-row");
    for (let i = 0; i < config.Midfield; i++) midRow.innerHTML += renderEmptySlot("Midfield");
    pitchEl.appendChild(midRow);

    const offRow = document.createElement("div"); offRow.classList.add("position-row", "forward-row");
    for (let i = 0; i < config.Offence; i++) offRow.innerHTML += renderEmptySlot("Offence");
    pitchEl.appendChild(offRow);
}

function repopulatePitch() {
    const playersToPlace = [...selectedPlayers];
    playersToPlace.forEach(player => {
        const posLabel = normalizePosition(player.position);
        const emptySlot = document.querySelector(`.player-slot[data-position="${posLabel}"]:not([data-player-id])`);
        if (emptySlot) {
            fillSlotWithPlayer(emptySlot, player);
        }
    });
    renderSelectedPlayers();
}

positionFilterEl.addEventListener("change", () => { currentPage = 1; renderPlayers(); });
prevPageBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderPlayers(); } });
nextPageBtn.addEventListener("click", () => { currentPage++; renderPlayers(); });

saveChangesBtn.addEventListener("click", async () => {
    const teamName = teamNameEl.value;
    if (!teamName) { alert("Indtast et holdnavn!"); return; }
    if (selectedPlayers.length !== 11) { alert("Du skal have præcis 11 spillere på holdet!"); return; }

    const body = {
        teamName,
        players: selectedPlayers.map(p => p._id),
        formation: formationSelectEl.value,
        budget: currentBudget
    };

    try {
        const res = await fetch(`${API_BASE_URL}/team/${teamId}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body)
        });

        if (res.status === 401) { window.location.href = "/login"; return; }
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Ukendt fejl ved opdatering");
        }

        alert("Holdet er blevet opdateret!");
        window.location.href = `/team?teamId=${teamId}`;
    } catch (err) {
        console.error("Fejl ved opdatering af hold:", err);
        alert("Der opstod en fejl: " + err.message);
    }
});

document.addEventListener("DOMContentLoaded", fetchInitialData);
