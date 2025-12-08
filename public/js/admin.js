document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    loadUsers();

    document.getElementById('syncDataBtn').addEventListener('click', async () => {
        if(!confirm("Dette vil hente data fra API'et og opdatere databasen. Fortsæt?")) return;
        try {
            const btn = document.getElementById('syncDataBtn');
            btn.textContent = "Henter data...";
            btn.disabled = true;

            const res = await fetch('/api/admin/sync-matches', { method: 'POST' });
            if(res.ok) {
                alert("Data synkroniseret!");
            } else {
                const err = await res.json();
                alert("Fejl ved synkronisering: " + (err.error || err.message || "Ukendt fejl"));
            }

            btn.textContent = "🔄 Synkroniser Data (API)";
            btn.disabled = false;
        } catch(e) {
            console.error(e);
            alert("Netværksfejl ved synkronisering");
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/user/logout', { method: 'POST' });
        window.location.href = '/';
    });

    document.getElementById('playerSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#playerTableBody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
});

window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');

    const tabMapping = {
        'users': 'Brugere',
        'players': 'Spillere',
        'matches': 'Kampe',
        'teams': 'Hold'
    };

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if(btn.textContent.includes(tabMapping[tabName])) {
            btn.classList.add('active');
        }
    });

    if(tabName === 'users') loadUsers();
    if(tabName === 'players') loadPlayers();
    if(tabName === 'matches') loadMatches();
    if(tabName === 'teams') loadTeams();
}

async function checkAdmin() {
    try {
        const res = await fetch('/api/user/check');
        if (!res.ok) {
            console.log("Ikke logget ind, redirecter...");
            window.location.href = '/login';
            return;
        }
        const data = await res.json();
        if(!data.success || !data.user || data.user.role !== 'admin') {
            console.log("Ikke admin, redirecter...");
            window.location.href = '/';
        }
    } catch(e) {
        console.error("checkAdmin fejl:", e);
        window.location.href = '/';
    }
}

async function loadUsers() {
    try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) {
            const err = await res.json();
            console.error("Fejl ved hentning af brugere:", err);
            return;
        }
        const users = await res.json();
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.username}</td>
                <td>${u._id}</td>
                <td><span class="role-badge ${u.role}">${u.role}</span></td>
                <td>${u.role !== 'admin' ? `<button class="btn-sm btn-red" onclick="deleteUser('${u._id}')">Slet</button>` : '<span style="color:#999">-</span>'}</td>
            </tr>
        `).join('');
    } catch(e) {
        console.error("loadUsers fejl:", e);
    }
}

window.deleteUser = async (id) => {
    if(confirm('Er du sikker på du vil slette denne bruger?')) {
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if(res.ok) {
                loadUsers();
            } else {
                const err = await res.json();
                alert("Fejl ved sletning: " + (err.error || err.message));
            }
        } catch(e) {
            console.error(e);
        }
    }
};

async function loadPlayers() {
    try {
        const res = await fetch('/api/admin/players');
        if (!res.ok) {
            const err = await res.json();
            console.error("Fejl ved hentning af spillere:", err);
            return;
        }
        const players = await res.json();
        const tbody = document.getElementById('playerTableBody');
        tbody.innerHTML = players.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.club}</td>
                <td>${p.position}</td>
                <td>${(p.price / 1000000).toFixed(1)}M</td>
                <td><input type="number" id="price-${p._id}" value="${p.price}" style="width:100px" step="100000"></td>
                <td><button class="btn-sm btn-green" onclick="updatePlayerPrice('${p._id}')">Gem</button></td>
            </tr>
        `).join('');
    } catch(e) {
        console.error("loadPlayers fejl:", e);
    }
}

window.updatePlayerPrice = async (id) => {
    const priceInput = document.getElementById(`price-${id}`);
    const price = parseInt(priceInput.value);

    if(isNaN(price) || price < 0) {
        alert("Ugyldig pris");
        return;
    }

    try {
        const res = await fetch(`/api/admin/players/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ price: price })
        });
        if(res.ok) {
            alert('Pris opdateret!');
            loadPlayers();
        } else {
            const err = await res.json();
            alert("Fejl: " + (err.error || err.message));
        }
    } catch(e) {
        console.error(e);
        alert("Netværksfejl ved opdatering");
    }
};

async function loadMatches() {
    try {
        const res = await fetch('/api/admin/matches');
        if (!res.ok) {
            const err = await res.json();
            console.error("Fejl ved hentning af kampe:", err);
            return;
        }
        const matches = await res.json();

        matches.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

        const tbody = document.getElementById('matchTableBody');
        tbody.innerHTML = matches.map(m => `
            <tr>
                <td>${new Date(m.utcDate).toLocaleDateString('da-DK')}</td>
                <td>${m.homeTeam || 'N/A'}</td>
                <td>${m.awayTeam || 'N/A'}</td>
                <td>
                    <input type="number" id="home-${m._id}" value="${m.homeScore ?? ''}" style="width:50px" min="0" placeholder="-"> 
                    - 
                    <input type="number" id="away-${m._id}" value="${m.awayScore ?? ''}" style="width:50px" min="0" placeholder="-">
                </td>
                <td><button class="btn-sm btn-blue" onclick="updateMatch('${m._id}')">Gem</button></td>
            </tr>
        `).join('');
    } catch(e) {
        console.error("loadMatches fejl:", e);
    }
}

window.updateMatch = async (id) => {
    const homeInput = document.getElementById(`home-${id}`);
    const awayInput = document.getElementById(`away-${id}`);

    const homeScore = homeInput.value !== '' ? parseInt(homeInput.value) : null;
    const awayScore = awayInput.value !== '' ? parseInt(awayInput.value) : null;

    let winner = null;
    if(homeScore !== null && awayScore !== null) {
        if(homeScore > awayScore) winner = 'HOME_TEAM';
        else if(awayScore > homeScore) winner = 'AWAY_TEAM';
        else winner = 'DRAW';
    }

    const body = {
        homeScore: homeScore,
        awayScore: awayScore,
        winner: winner,
        status: (homeScore !== null && awayScore !== null) ? 'FINISHED' : 'SCHEDULED'
    };

    try {
        const res = await fetch(`/api/admin/matches/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if(res.ok) {
            alert('Kamp opdateret!');
        } else {
            const err = await res.json();
            alert("Fejl: " + (err.error || err.message));
        }
    } catch(e) {
        console.error(e);
        alert("Netværksfejl ved opdatering");
    }
};

async function loadTeams() {
    try {
        const res = await fetch('/api/admin/teams');
        if (!res.ok) {
            const err = await res.json();
            console.error("Fejl ved hentning af hold:", err);
            return;
        }
        const teams = await res.json();
        const tbody = document.getElementById('teamTableBody');

        tbody.innerHTML = teams.map(t => {
            const username = t.userId?.username || 'Ukendt';
            const teamJson = JSON.stringify(t).replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
                <tr>
                    <td>${t.teamName}</td>
                    <td>${username}</td>
                    <td>${t.points || 0}</td>
                    <td>${((t.budget || 0) / 1000000).toFixed(1)}M</td>
                    <td><button class="btn-sm btn-blue" onclick='openPitch(${teamJson})'>Se Hold</button></td>
                </tr>
            `;
        }).join('');
    } catch(e) {
        console.error("loadTeams fejl:", e);
    }
}

window.openPitch = (team) => {
    document.getElementById('modalTeamName').textContent = team.teamName || 'Ukendt Hold';
    document.getElementById('pitchModal').style.display = 'flex';

    ['goalkeeper', 'defender', 'midfielder', 'forward'].forEach(pos => {
        const row = document.querySelector(`.${pos}-row`);
        if(row) row.innerHTML = '';
    });

    if(team.players && Array.isArray(team.players)) {
        team.players.forEach(p => {
            if(!p || !p.name) return;

            const div = document.createElement('div');
            div.className = 'player-slot';

            const lastName = p.name.split(' ').pop();
            div.innerHTML = `
                <div style="margin-bottom:2px; font-weight:bold;">${lastName}</div>
                <div style="font-size:9px; opacity:0.9;">${p.club || ''}</div>
            `;

            let rowClass = '.forward-row';
            const pos = (p.position || '').toLowerCase();

            if(pos.includes('goal') || pos === 'gk') {
                rowClass = '.goalkeeper-row';
            } else if(pos.includes('back') || pos.includes('defen') || pos === 'lb' || pos === 'rb' || pos === 'cb') {
                rowClass = '.defender-row';
            } else if(pos.includes('mid') || pos === 'cm' || pos === 'cdm' || pos === 'cam') {
                rowClass = '.midfielder-row';
            }

            const row = document.querySelector(rowClass);
            if(row) row.appendChild(div);
        });
    }
};

window.closePitchModal = () => {
    document.getElementById('pitchModal').style.display = 'none';
};