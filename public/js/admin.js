document.addEventListener('DOMContentLoaded', () => {
    // 1. Tjek om brugeren er logget ind som admin
    checkAdmin();

    // 2. Default load
    loadUsers();

    // 3. Sync knap (kalder fetchAllMatches på backend)
    document.getElementById('syncDataBtn').addEventListener('click', async () => {
        if(!confirm("Dette vil hente data fra API'et og opdatere databasen. Fortsæt?")) return;
        try {
            const btn = document.getElementById('syncDataBtn');
            btn.textContent = "Henter data...";
            btn.disabled = true;

            // Vi bruger en ny admin route til sync
            const res = await fetch('/api/admin/sync-matches', { method: 'POST' });
            if(res.ok) alert("Data synkroniseret!");
            else alert("Fejl ved synkronisering");

            btn.textContent = "🔄 Synkroniser Data (API)";
            btn.disabled = false;
        } catch(e) { console.error(e); }
    });

    // 4. Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/user/logout', { method: 'POST' });
        window.location.href = '/';
    });

    // 5. Søgning på spillere
    document.getElementById('playerSearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#playerTableBody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
});

/* --- Navigation --- */
window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    // Find knappen og gør den aktiv
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if(btn.textContent.toLowerCase().includes(tabName === 'matches' ? 'kampe' : tabName === 'users' ? 'brugere' : tabName)) {
            btn.classList.add('active');
        }
    });

    if(tabName === 'players') loadPlayers();
    if(tabName === 'matches') loadMatches();
    if(tabName === 'teams') loadTeams();
}

async function checkAdmin() {
    try {
        const res = await fetch('/api/user/check');
        const data = await res.json();
        if(!data.success || data.user.role !== 'admin') {
            window.location.href = '/';
        }
    } catch(e) { window.location.href = '/'; }
}

/* --- USERS --- */
async function loadUsers() {
    const res = await fetch('/api/admin/users');
    const users = await res.json();
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.username}</td>
            <td>${u._id}</td>
            <td>${u.role}</td>
            <td>${u.role !== 'admin' ? `<button class="btn-sm btn-red" onclick="deleteUser('${u._id}')">Slet</button>` : ''}</td>
        </tr>
    `).join('');
}

window.deleteUser = async (id) => {
    if(confirm('Er du sikker?')) {
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        loadUsers();
    }
};

/* --- PLAYERS --- */
async function loadPlayers() {
    const res = await fetch('/api/players');
    const players = await res.json();
    const tbody = document.getElementById('playerTableBody');
    tbody.innerHTML = players.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.club}</td>
            <td>${p.position}</td>
            <td>${p.price.toLocaleString()}</td>
            <td><input type="number" id="price-${p._id}" value="${p.price}" style="width:80px"></td>
            <td><button class="btn-sm btn-green" onclick="updatePlayerPrice('${p._id}')">Gem</button></td>
        </tr>
    `).join('');
}

window.updatePlayerPrice = async (id) => {
    const price = document.getElementById(`price-${id}`).value;
    await fetch(`/api/admin/players/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ price: price })
    });
    alert('Pris opdateret');
};

/* --- MATCHES (Nyt) --- */
async function loadMatches() {
    // Vi kalder den nye admin route for at få kampe
    const res = await fetch('/api/admin/matches');
    const matches = await res.json();

    // Sorter så nyeste kampe vises, eller dem der mangler resultater
    matches.sort((a,b) => new Date(b.utcDate) - new Date(a.utcDate));

    const tbody = document.getElementById('matchTableBody');
    tbody.innerHTML = matches.map(m => `
        <tr>
            <td>${new Date(m.utcDate).toLocaleDateString()}</td>
            <td>${m.homeTeam}</td>
            <td>${m.awayTeam}</td>
            <td>
                <input type="number" id="home-${m._id}" value="${m.homeScore ?? 0}" style="width:40px"> - 
                <input type="number" id="away-${m._id}" value="${m.awayScore ?? 0}" style="width:40px">
            </td>
            <td><button class="btn-sm btn-blue" onclick="updateMatch('${m._id}')">Gem</button></td>
        </tr>
    `).join('');
}

window.updateMatch = async (id) => {
    const h = document.getElementById(`home-${id}`).value;
    const a = document.getElementById(`away-${id}`).value;

    const body = {
        score: {
            fullTime: { home: h, away: a },
            winner: h > a ? 'HOME_TEAM' : a > h ? 'AWAY_TEAM' : 'DRAW'
        }
    };

    await fetch(`/api/admin/matches/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    alert('Kamp opdateret');
};

/* --- TEAMS & PITCH --- */
async function loadTeams() {
    // Bruger brugerens teamRoutes: router.get('/', ...) => /api/team/
    const res = await fetch('/api/team/');
    const teams = await res.json();
    const tbody = document.getElementById('teamTableBody');

    tbody.innerHTML = teams.map(t => `
        <tr>
            <td>${t.teamName}</td>
            <td>${t.userId?.username || 'Ukendt'}</td>
            <td>${t.points || 0}</td>
            <td>${t.budget?.toLocaleString() || 0}</td>
            <td><button class="btn-sm btn-blue" onclick='openPitch(${JSON.stringify(t)})'>Se Hold</button></td>
        </tr>
    `).join('');
}

window.openPitch = (team) => {
    document.getElementById('modalTeamName').textContent = team.teamName;
    document.getElementById('pitchModal').style.display = 'flex';

    // Ryd banen
    ['goalkeeper', 'defender', 'midfielder', 'forward'].forEach(pos => {
        document.querySelector(`.${pos}-row`).innerHTML = '';
    });

    if(team.players) {
        team.players.forEach(p => {
            const div = document.createElement('div');
            div.className = 'player-slot';
            div.innerHTML = `
                <div style="margin-bottom:2px;">${p.name.split(' ').pop()}</div>
                <div style="font-weight:normal; font-size:9px;">${p.club}</div>
            `;

            let rowClass = '';
            if(p.position === 'Goalkeeper') rowClass = '.goalkeeper-row';
            else if(p.position === 'Defence') rowClass = '.defender-row';
            else if(p.position === 'Midfield') rowClass = '.midfielder-row';
            else rowClass = '.forward-row';

            document.querySelector(rowClass).appendChild(div);
        });
    }
};

window.closePitchModal = () => {
    document.getElementById('pitchModal').style.display = 'none';
};