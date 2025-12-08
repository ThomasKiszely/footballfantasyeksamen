const playerListEl = document.getElementById("playerList");
const selectedPlayersEl = document.getElementById("selectedPlayers");
const createTeamBtn = document.getElementById("createTeamBtn");
const positionFilterEl = document.getElementById("positionFilter");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicatorEl = document.getElementById("pageIndicator");
const formationSelectEl = document.getElementById("formationSelect");
let selectedPlayers = [], allPlayers = [], currentPage = 1;
const pageSize = 10;
let currentBudget = 0;
let maxPlayersPerClub = 3;
let maxPlayersTotal = 11;


async function fetchInitialData() {
    try {
        const res = await fetch (`${API_BASE_URL}/team/config`, {credentials: "include"});

        if(res.ok) {
            const config = await res.json();
            currentBudget = config.startBudget;

            maxPlayersPerClub = config.maxPlayersPerClub;
            maxPlayersTotal = config.maxPlayersTotal;

            const budgetLabel = document.getElementById("budgetLabel");
            if(budgetLabel) {
                budgetLabel.textContent = `Resterende Budget (Start: ${(currentBudget / 1000000).toFixed(1)}M)`;
            }
        } else {
            console.log("Kunne ikke hente team config fra API. Bruger standard 90m");
            currentBudget = 90000000;
        }
    } catch (error) {
        console.error("Fejl ved hentnig af inital data: " + error.message);
    }
    await loadPlayers();
    renderPitch("4-3-3");
}

function filterPlayersByPosition(position) {
    positionFilterEl.value = position;
    currentPage = 1;
    renderPlayers();
}



// Opdaterer budget UI
function updateBudgetUI() {
    const usedPrice = selectedPlayers.reduce((total, p) => total + p.price, 0);
    const remainingBudget = (currentBudget - usedPrice) / 1000000;

    const budgetEl = document.getElementById("remainingBudget");
    if (budgetEl) {
        budgetEl.textContent = `${remainingBudget.toFixed(1)}M`;
        budgetEl.style.color = remainingBudget >= 0 ? '#667eea' : '#e74c3c';
    }
}

// Rettelser for at standardisere positionskategorier (GK, Defend, Midfield, Offence)
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
        renderPlayers();
        updateBudgetUI();
    } catch (err) {
        console.error("Fejl ved hentning af spillere:", err);
    }
}

// Genererer spillerkort til listen
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

        // Tjek om spilleren allerede er valgt
        const isSelected = selectedPlayers.some(p => p._id === player._id);
        if (isSelected) {
            div.classList.add('selected');
        }

        div.innerHTML = `
            <div class="player-info">
                <span class="player-name-list">${player.name}</span>
                <div class="player-details">
                    <span>${player.club} / ${broadPosition}</span>
                    <span class="player-price-list">${(player.price / 1000000).toFixed(1)}M</span>
                </div>
            </div>
            <button class="btn btn-small select-btn" ${isSelected ? 'disabled' : ''}>${isSelected ? 'Valgt' : 'Vælg'}</button>
        `;

        const selectButton = div.querySelector(".select-btn");
        if (!isSelected) {
            selectButton.addEventListener("click", (e) => {
                e.stopPropagation();
                selectPlayer(player);
            });
        }

        playerListEl.appendChild(div);
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    pageIndicatorEl.textContent = `Side ${currentPage} af ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// Opretter et fyldt spillerkort på banen
function selectPlayer(player) {
    const posLabel = normalizePosition(player.position);

    // Tjek budget
    const usedPrice = selectedPlayers.reduce((total, p) => total + p.price, 0);
    if (usedPrice + player.price > currentBudget) {
        alert("Ikke nok budget! Spillerens pris overstiger det resterende budget.");
        return;
    }

    // Tjek om spiller allerede er valgt (dobbelt check)
    if (selectedPlayers.find(p => p._id === player._id)) {
        alert("Spiller allerede valgt!");
        return;
    }

    if(selectedPlayers.length >= maxPlayersTotal) {
        alert(`Du har allerede valgt det maksimale antal spillere (${maxPlayersTotal}). Fjern en spiller først.`);
        return;
    }

    const clubCount = selectedPlayers.filter(p => p.club === player.club).length;

    if(clubCount >= maxPlayersPerClub) {
        alert(`Du må kun have ${maxPlayersPerClub} spillere fra samme klub. Du har allerede ${player.club} spillere.`);
        return;
    }

    // Tjek for ledig plads
    const slots = document.querySelectorAll(`.player-slot[data-position="${posLabel}"]:not([data-player-id])`);
    const emptySlot = slots[0];

    if (!emptySlot) {
        alert(`Ingen ledig plads til ${posLabel} i den valgte opstilling.`);
        return;
    }

    // Tjek for max spillere pr. hold (f.eks. max 3 pr. klub)
    // Implementér din klubbegrænsningslogik her, hvis nødvendigt.

    selectedPlayers.push(player);

    // Generer HTML for det fyldte kort
    emptySlot.innerHTML = `
        <div class="player-card filled" data-player-id="${player._id}">
            <span class="remove-player">X</span>
            <div class="player-name">${player.name}</div>
            <div class="player-club">${player.club}</div>
            <div class="player-price">${(player.price / 1000000).toFixed(1)}M</div>
            <div class="position-label">${posLabel}</div>
        </div>
    `;

    emptySlot.setAttribute("data-player-id", player._id);

    // Tilføj event listener til den nye fjern-knap i kortet
    emptySlot.querySelector(".remove-player").addEventListener("click", (e) => {
        e.stopPropagation();
        removePlayer(player._id);
    });

    renderPlayers(); // Opdater spillerlisten (marker som valgt)
    updateBudgetUI();
}

// Fjerner kortet og genskaber den tomme plads
function removePlayer(playerId) {
    selectedPlayers = selectedPlayers.filter(p => p._id !== playerId);

    const slot = document.querySelector(`.player-slot[data-player-id="${playerId}"]`);
    if (slot) {
        const position = slot.getAttribute('data-position');

        // Genskab den tomme plads struktur
        slot.innerHTML = `
            <div class="player-card empty">
                <span class="add-player">+</span>
                <span class="position-label">${position}</span>
            </div>
        `;
        slot.removeAttribute("data-player-id");
    }

    renderPlayers();
    updateBudgetUI();
}

// Denne bruges kun til at opdatere en simpel liste (kan evt. fjernes)
function renderSelectedPlayers() {
    selectedPlayersEl.innerHTML = "";
    selectedPlayers.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name} (${player.club}) - ${normalizePosition(player.position)} - ${(player.price / 1000000).toFixed(1)}M`;
        selectedPlayersEl.appendChild(li);
    });
}

// KUN 4-3-3 FORMATIONEN ER INKLUDERET
const FORMATION_CONFIG = {
    "4-3-3": { Defend: 4, Midfield: 3, Offence: 3 },
};

// Opretter banen med de tomme slots
function renderPitch(formation) {
    const pitchEl = document.querySelector(".pitch");
    pitchEl.innerHTML = "";

    const config = FORMATION_CONFIG[formation];

    if (!config) {
        console.error(`Opstilling ${formation} er ikke defineret i FORMATION_CONFIG.`);
        return;
    }

    // Helper til at generere den tomme slot HTML
    const renderEmptySlot = (position) => `
        <div class="player-slot" data-position="${position}">
            <div class="player-card empty">
                <span class="add-player">+</span>
                <span class="position-label">${position}</span>
            </div>
        </div>
    `;

    // GK
    const gkRow = document.createElement("div"); gkRow.classList.add("position-row", "goalkeeper-row");
    gkRow.innerHTML = renderEmptySlot("GK");
    pitchEl.appendChild(gkRow);

    // Defend
    const defRow = document.createElement("div"); defRow.classList.add("position-row", "defender-row");
    for (let i = 0; i < config.Defend; i++) { defRow.innerHTML += renderEmptySlot("Defend"); }
    pitchEl.appendChild(defRow);

    // Midfield
    const midRow = document.createElement("div"); midRow.classList.add("position-row", "midfielder-row");
    for (let i = 0; i < config.Midfield; i++) { midRow.innerHTML += renderEmptySlot("Midfield"); }
    pitchEl.appendChild(midRow);

    // Offence
    const offRow = document.createElement("div"); offRow.classList.add("position-row", "forward-row");
    for (let i = 0; i < config.Offence; i++) { offRow.innerHTML += renderEmptySlot("Offence"); }
    pitchEl.appendChild(offRow);

    // Når banen er oprettet, skal vi genplacere eventuelt valgte spillere
    // Denne funktion forsøger at placere spillere, der allerede er valgt, i de nye slots
    selectedPlayers.forEach(p => selectPlayer(p));

    document.querySelectorAll(".player-slot").forEach(slot => {
        if (!slot.hasAttribute("data-player-id")) {
            slot.addEventListener("click", function () {
                const position = this.getAttribute("data-position");
                filterPlayersByPosition(position);
            })
        }
    })
}

// --- Event Listeners ---
positionFilterEl.addEventListener("change", () => { currentPage = 1; renderPlayers(); });
prevPageBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderPlayers(); } });
nextPageBtn.addEventListener("click", () => { currentPage++; renderPlayers(); });

// FormationSelect lytteren er stadig nødvendig, selvom der kun er én mulighed
formationSelectEl.addEventListener("change", e => {
    // Fjern alle spillere, når opstillingen ændres, da de måske ikke passer (selvom det er 4-3-3)
    selectedPlayers = [];
    renderSelectedPlayers();
    renderPlayers();
    renderPitch(e.target.value);
    updateBudgetUI();
});

createTeamBtn.addEventListener("click", async () => {
    const teamName = document.getElementById("teamName").value;
    const usedPrice = selectedPlayers.reduce((total, p) => total + p.price, 0);

    const remainingBudget = currentBudget - usedPrice;

    if (!teamName) {
        alert("Indtast et holdnavn!");
        return;
    }
    if (selectedPlayers.length !== maxPlayersTotal) {
        alert("Du skal vælge præcis 11 spillere!");
        return;
    }
    if (usedPrice > currentBudget) {
        alert("Budgettet er overskredet!");
        return;
    }

    const body = {
        teamName,
        players: selectedPlayers.map(p => p._id),
        formation: formationSelectEl.value,
        budget: remainingBudget
    };

    try {
        const res = await fetch(`${API_BASE_URL}/team`, {
            method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body)
        });

        if (res.status === 401) { window.location.href = "/login"; return; }

        if (!res.ok) {
            const err = await res.json();
            alert("Fejl ved oprettelse af hold: " + (err.error || "Ukendt fejl"));
            return;
        }

        const newTeam = await res.json();
        localStorage.setItem("teamId", newTeam._id);
        window.location.href = `/team?teamId=${newTeam._id}`;
    } catch (err) {
        console.error("Fejl ved oprettelse af hold:", err);
        alert("Der opstod en netværksfejl.");
    }
});

// Starter med 4-3-3
document.addEventListener("DOMContentLoaded", () =>
{
    initAuthUI();
    fetchInitialData();
});