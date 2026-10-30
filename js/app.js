// Presets por defecto de clubes y selecciones
const DEFAULT_PRESETS = {
  argentina: {
    label: "🇦🇷 Fútbol Argentino",
    clubs: [
      "Boca Juniors",
      "River Plate",
      "Racing Club",
      "Independiente",
      "San Lorenzo",
      "Estudiantes LP",
      "Vélez Sarsfield",
      "Talleres",
      "Lanús",
      "Huracán",
      "Rosario Central",
      "Newell's Old Boys",
      "Argentinos Juniors",
      "Belgrano"
    ]
  },
  europa: {
    label: "🌍 Gigantes de Europa (Champions)",
    clubs: [
      "Real Madrid",
      "FC Barcelona",
      "Manchester City",
      "Liverpool",
      "Arsenal",
      "Bayern Munich",
      "Inter de Milán",
      "AC Milan",
      "PSG",
      "Atlético de Madrid",
      "Borussia Dortmund",
      "Juventus",
      "Chelsea",
      "Manchester United",
      "Bayer Leverkusen",
      "Napoli"
    ]
  },
  selecciones: {
    label: "🏆 Selecciones Nacionales",
    clubs: [
      "Argentina",
      "Brasil",
      "Francia",
      "España",
      "Inglaterra",
      "Alemania",
      "Portugal",
      "Países Bajos",
      "Uruguay",
      "Italia",
      "Colombia",
      "Croacia"
    ]
  },
  mix5: {
    label: "⭐ Mix Élite 5 Estrellas",
    clubs: [
      "Real Madrid",
      "Manchester City",
      "Bayern Munich",
      "FC Barcelona",
      "Liverpool",
      "Arsenal",
      "Inter de Milán",
      "PSG",
      "Argentina",
      "Francia",
      "Brasil",
      "España",
      "Boca Juniors",
      "River Plate"
    ]
  },
  custom: {
    label: "✏️ Personalizado / Mis Clubes",
    clubs: [
      "Boca Juniors",
      "River Plate",
      "Real Madrid",
      "FC Barcelona",
      "Manchester City",
      "Inter Miami"
    ]
  }
};

const STORAGE_KEY = "armador_parejas_state_v1";

// Estado global de la aplicación
const state = {
  teamSize: 2, // 1 = 1vs1, 2 = 2vs2, 3 = 3vs3
  players: [], // [{ id, name, active }]
  clubsEnabled: true,
  selectedPreset: "argentina",
  noRepeatClubs: true,
  presets: structuredClone(DEFAULT_PRESETS),
  lastDraw: null // { teams: [{ id, name, members, club }], bench: [string] }
};

// Referencias del DOM
const modeButtons = document.querySelectorAll(".mode-btn");
const playerForm = document.getElementById("playerForm");
const playerInput = document.getElementById("playerInput");
const playerList = document.getElementById("playerList");
const btnLoadDemo = document.getElementById("btnLoadDemo");
const btnClearPlayers = document.getElementById("btnClearPlayers");

const statActiveCount = document.getElementById("statActiveCount");
const statTeamsCount = document.getElementById("statTeamsCount");
const statTeamsLabel = document.getElementById("statTeamsLabel");
const statMatchesCount = document.getElementById("statMatchesCount");
const statBenchCount = document.getElementById("statBenchCount");

const toggleClubs = document.getElementById("toggleClubs");
const clubsConfigPanel = document.getElementById("clubsConfigPanel");
const presetSelect = document.getElementById("presetSelect");
const chkNoRepeatClubs = document.getElementById("chkNoRepeatClubs");
const activeClubsCount = document.getElementById("activeClubsCount");
const btnOpenClubsDialog = document.getElementById("btnOpenClubsDialog");

const btnGenerate = document.getElementById("btnGenerate");
const btnRerollAll = document.getElementById("btnRerollAll");
const btnRerollClubs = document.getElementById("btnRerollClubs");
const btnCopyWhatsapp = document.getElementById("btnCopyWhatsapp");
const btnResetDraw = document.getElementById("btnResetDraw");
const resultHeaderActions = document.getElementById("resultHeaderActions");

const alertBox = document.getElementById("alertBox");
const emptyState = document.getElementById("emptyState");
const resultsContainer = document.getElementById("resultsContainer");
const matchesList = document.getElementById("matchesList");
const waitingTeamBox = document.getElementById("waitingTeamBox");
const waitingTeamContent = document.getElementById("waitingTeamContent");
const benchPlayersBox = document.getElementById("benchPlayersBox");
const benchTeamSize = document.getElementById("benchTeamSize");
const benchPlayersList = document.getElementById("benchPlayersList");

// Referencias del Modal Dialog
const clubsDialog = document.getElementById("clubsDialog");
const dialogPresetName = document.getElementById("dialogPresetName");
const btnCloseDialog = document.getElementById("btnCloseDialog");
const btnConfirmDialog = document.getElementById("btnConfirmDialog");
const addClubForm = document.getElementById("addClubForm");
const clubInput = document.getElementById("clubInput");
const btnResetPreset = document.getElementById("btnResetPreset");
const clubsModalList = document.getElementById("clubsModalList");

// Algoritmo Fisher-Yates para mezcla aleatoria sin sesgo
function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Persistencia en localStorage
function saveState() {
  try {
    const payload = {
      teamSize: state.teamSize,
      players: state.players,
      clubsEnabled: state.clubsEnabled,
      selectedPreset: state.selectedPreset,
      noRepeatClubs: state.noRepeatClubs,
      presets: state.presets
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("No se pudo guardar el estado en localStorage:", err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if ([1, 2, 3].includes(parsed.teamSize)) state.teamSize = parsed.teamSize;
    if (Array.isArray(parsed.players)) state.players = parsed.players;
    if (typeof parsed.clubsEnabled === "boolean") state.clubsEnabled = parsed.clubsEnabled;
    if (parsed.selectedPreset && DEFAULT_PRESETS[parsed.selectedPreset]) {
      state.selectedPreset = parsed.selectedPreset;
    }
    if (typeof parsed.noRepeatClubs === "boolean") state.noRepeatClubs = parsed.noRepeatClubs;
    if (parsed.presets && typeof parsed.presets === "object") {
      for (const key of Object.keys(DEFAULT_PRESETS)) {
        if (parsed.presets[key] && Array.isArray(parsed.presets[key].clubs)) {
          state.presets[key].clubs = parsed.presets[key].clubs;
        }
      }
    }
  } catch (err) {
    console.warn("No se pudo leer el estado guardado:", err);
  }
}

// Inicialización de controles UI según el estado
function syncControlsWithState() {
  modeButtons.forEach((btn) => {
    const size = Number(btn.dataset.size);
    const isActive = size === state.teamSize;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  toggleClubs.checked = state.clubsEnabled;
  clubsConfigPanel.hidden = !state.clubsEnabled;
  presetSelect.value = state.selectedPreset;
  chkNoRepeatClubs.checked = state.noRepeatClubs;
  updateActiveClubsCounter();
}

function updateActiveClubsCounter() {
  const currentClubs = state.presets[state.selectedPreset]?.clubs || [];
  activeClubsCount.textContent = currentClubs.length;
}

// Renderizado de lista de jugadores y estadísticas
function renderPlayers() {
  playerList.innerHTML = "";

  state.players.forEach((player) => {
    const li = document.createElement("li");
    li.className = `player-chip${player.active ? "" : " inactive"}`;

    const nameSpan = document.createElement("span");
    nameSpan.className = "player-chip-name";
    nameSpan.textContent = player.name;
    nameSpan.title = player.active
      ? "Clic para marcar como ausente hoy"
      : "Clic para marcar como presente";
    nameSpan.addEventListener("click", () => togglePlayerActive(player.id));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "player-chip-remove";
    removeBtn.setAttribute("aria-label", `Eliminar a ${player.name}`);
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => removePlayer(player.id));

    li.append(nameSpan, removeBtn);
    playerList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const activeCount = state.players.filter((p) => p.active).length;
  const teamsCount = Math.floor(activeCount / state.teamSize);
  const matchesCount = Math.floor(teamsCount / 2);
  const benchCount = activeCount % state.teamSize;

  statActiveCount.textContent = activeCount;
  statTeamsCount.textContent = teamsCount;
  statTeamsLabel.textContent =
    state.teamSize === 1 ? "Jugadores" : state.teamSize === 2 ? "Parejas" : "Tríos";
  statMatchesCount.textContent = matchesCount;
  statBenchCount.textContent = benchCount;
}

// Acciones de Jugadores
function addPlayersFromString(rawInput) {
  const names = rawInput
    .split(/[,;\n]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) return;

  let added = false;
  const duplicateNames = [];

  names.forEach((name) => {
    const exists = state.players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      duplicateNames.push(name);
    } else {
      state.players.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name,
        active: true
      });
      added = true;
    }
  });

  if (duplicateNames.length > 0) {
    showAlert(`⚠️ Ya estaban en la lista: ${duplicateNames.join(", ")}`);
  } else {
    hideAlert();
  }

  if (added) {
    saveState();
    renderPlayers();
  }
}

function togglePlayerActive(id) {
  const target = state.players.find((p) => p.id === id);
  if (!target) return;
  target.active = !target.active;
  saveState();
  renderPlayers();
}

function removePlayer(id) {
  state.players = state.players.filter((p) => p.id !== id);
  saveState();
  renderPlayers();
}

// Alertas de validación
function showAlert(message) {
  alertBox.textContent = message;
  alertBox.hidden = false;
}

function hideAlert() {
  alertBox.hidden = true;
  alertBox.textContent = "";
}

// Asignación aleatoria de clubes a los equipos formados
function assignClubsToTeams(teams) {
  if (!state.clubsEnabled) {
    teams.forEach((t) => {
      t.club = null;
    });
    return;
  }

  const pool = state.presets[state.selectedPreset]?.clubs || [];
  if (pool.length === 0) {
    teams.forEach((t) => {
      t.club = "Sin clubes en la lista";
    });
    return;
  }

  if (state.noRepeatClubs) {
    let shuffledPool = shuffleArray(pool);
    teams.forEach((team, idx) => {
      if (idx > 0 && idx % pool.length === 0) {
        shuffledPool = shuffleArray(pool);
      }
      team.club = shuffledPool[idx % pool.length];
    });
  } else {
    teams.forEach((team) => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      team.club = pool[randomIndex];
    });
  }
}

// Re-sortear el club de un único equipo
function rerollSingleTeamClub(teamId) {
  if (!state.lastDraw || !state.clubsEnabled) return;
  const pool = state.presets[state.selectedPreset]?.clubs || [];
  if (pool.length === 0) return;

  const targetTeam = state.lastDraw.teams.find((t) => t.id === teamId);
  if (!targetTeam) return;

  const usedClubs = new Set(
    state.lastDraw.teams.filter((t) => t.id !== teamId).map((t) => t.club)
  );

  // Si no se permiten repetidos, priorizamos clubes que no estén en uso ni sean el actual
  let candidates = pool.filter(
    (c) => c !== targetTeam.club && (!state.noRepeatClubs || !usedClubs.has(c))
  );

  // Si se agotaron los clubes libres, permitimos cualquiera distinto al actual
  if (candidates.length === 0) {
    candidates = pool.filter((c) => c !== targetTeam.club);
  }
  if (candidates.length === 0) {
    candidates = pool;
  }

  targetTeam.club = candidates[Math.floor(Math.random() * candidates.length)];
  renderDrawResults();
}

// Generar Parejas / Equipos y Cruces
function generateDraw() {
  hideAlert();

  const activePlayers = state.players.filter((p) => p.active).map((p) => p.name);
  const minRequired = state.teamSize * 2;

  if (activePlayers.length < minRequired) {
    const formatLabel = `${state.teamSize} vs ${state.teamSize}`;
    showAlert(
      `❌ Necesitás al menos ${minRequired} jugadores presentes para armar un partido ${formatLabel} (hay ${activePlayers.length} activos).`
    );
    return;
  }

  const shuffledPlayers = shuffleArray(activePlayers);
  const teams = [];
  const totalTeams = Math.floor(shuffledPlayers.length / state.teamSize);

  for (let i = 0; i < totalTeams; i++) {
    const start = i * state.teamSize;
    const members = shuffledPlayers.slice(start, start + state.teamSize);
    const labelPrefix =
      state.teamSize === 1 ? "Jugador" : state.teamSize === 2 ? "Pareja" : "Equipo";
    teams.push({
      id: `team-${i + 1}`,
      name: `${labelPrefix} ${i + 1}`,
      members,
      club: null
    });
  }

  const bench = shuffledPlayers.slice(totalTeams * state.teamSize);

  assignClubsToTeams(teams);

  state.lastDraw = {
    teams,
    bench
  };

  renderDrawResults();
}

// Renderizar tarjetas de partidos, equipo en espera y banco
function renderDrawResults() {
  if (!state.lastDraw) return;

  const { teams, bench } = state.lastDraw;

  emptyState.hidden = true;
  resultsContainer.hidden = false;
  resultHeaderActions.hidden = false;
  btnRerollClubs.hidden = !state.clubsEnabled;

  matchesList.innerHTML = "";

  const totalMatches = Math.floor(teams.length / 2);

  for (let m = 0; m < totalMatches; m++) {
    const teamA = teams[m * 2];
    const teamB = teams[m * 2 + 1];

    const matchCard = document.createElement("article");
    matchCard.className = "match-card";

    const header = document.createElement("div");
    header.className = "match-card-header";
    header.innerHTML = `<span>⚽ Partido ${m + 1}</span><span>Formato ${state.teamSize} vs ${state.teamSize}</span>`;

    const grid = document.createElement("div");
    grid.className = "match-grid";

    const vsPill = document.createElement("div");
    vsPill.className = "vs-pill";
    vsPill.textContent = "VS";

    grid.append(createTeamElement(teamA), vsPill, createTeamElement(teamB));
    matchCard.append(header, grid);
    matchesList.appendChild(matchCard);
  }

  // ¿Queda un equipo completo sin rival (cantidad impar de equipos)?
  if (teams.length % 2 === 1) {
    const waitingTeam = teams[teams.length - 1];
    waitingTeamBox.hidden = false;
    waitingTeamContent.innerHTML = "";
    waitingTeamContent.appendChild(createTeamElement(waitingTeam));
  } else {
    waitingTeamBox.hidden = true;
  }

  // ¿Quedan jugadores sueltos en el banco?
  if (bench.length > 0) {
    benchPlayersBox.hidden = false;
    benchTeamSize.textContent = state.teamSize;
    benchPlayersList.innerHTML = "";
    bench.forEach((playerName) => {
      const span = document.createElement("span");
      span.className = "bench-chip";
      span.textContent = `👤 ${playerName}`;
      benchPlayersList.appendChild(span);
    });
  } else {
    benchPlayersBox.hidden = true;
  }
}

function createTeamElement(team) {
  const box = document.createElement("div");
  box.className = "team-box";

  const topDiv = document.createElement("div");

  const title = document.createElement("div");
  title.className = "team-title";
  title.textContent = team.name;

  const membersList = document.createElement("div");
  membersList.className = "team-members";
  team.members.forEach((member) => {
    const row = document.createElement("div");
    row.className = "member-row";
    row.textContent = `🎮 ${member}`;
    membersList.appendChild(row);
  });

  topDiv.append(title, membersList);
  box.appendChild(topDiv);

  if (state.clubsEnabled && team.club) {
    const clubRow = document.createElement("div");
    clubRow.className = "club-badge-row";

    const clubName = document.createElement("span");
    clubName.className = "club-name";
    clubName.textContent = `🛡️ ${team.club}`;

    const rerollBtn = document.createElement("button");
    rerollBtn.type = "button";
    rerollBtn.className = "btn-reroll-single";
    rerollBtn.title = "Cambiar solo este club";
    rerollBtn.textContent = "🔄";
    rerollBtn.addEventListener("click", () => rerollSingleTeamClub(team.id));

    clubRow.append(clubName, rerollBtn);
    box.appendChild(clubRow);
  }

  return box;
}

// Copiar resumen formateado para WhatsApp
async function copySummaryToClipboard() {
  if (!state.lastDraw) return;
  const { teams, bench } = state.lastDraw;
  const lines = [`🎲 *SORTEO ${state.teamSize} vs ${state.teamSize}* 🎲`, ""];

  const totalMatches = Math.floor(teams.length / 2);
  for (let m = 0; m < totalMatches; m++) {
    const tA = teams[m * 2];
    const tB = teams[m * 2 + 1];
    const clubA = state.clubsEnabled && tA.club ? ` _(${tA.club})_` : "";
    const clubB = state.clubsEnabled && tB.club ? ` _(${tB.club})_` : "";
    lines.push(
      `⚽ *Partido ${m + 1}:* ${tA.members.join(" + ")}${clubA} 🆚 ${tB.members.join(" + ")}${clubB}`
    );
  }

  if (teams.length % 2 === 1) {
    const waiting = teams[teams.length - 1];
    const clubW = state.clubsEnabled && waiting.club ? ` _(${waiting.club})_` : "";
    lines.push("");
    lines.push(`⏳ *Espera ganador:* ${waiting.members.join(" + ")}${clubW}`);
  }

  if (bench.length > 0) {
    lines.push("");
    lines.push(`🪑 *Al banco (entran próximo):* ${bench.join(", ")}`);
  }

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    const originalText = btnCopyWhatsapp.textContent;
    btnCopyWhatsapp.textContent = "✅ ¡Copiado!";
    setTimeout(() => {
      btnCopyWhatsapp.textContent = originalText;
    }, 1800);
  } catch {
    showAlert("No se pudo copiar automáticamente al portapapeles.");
  }
}

// Gestión del Modal de Clubes
function renderClubsModal() {
  const currentPreset = state.presets[state.selectedPreset];
  dialogPresetName.textContent = currentPreset.label;
  clubsModalList.innerHTML = "";

  currentPreset.clubs.forEach((clubName, idx) => {
    const li = document.createElement("li");
    li.className = "player-chip";

    const span = document.createElement("span");
    span.className = "player-chip-name";
    span.textContent = clubName;
    span.title = "Clic para quitar este club";
    span.addEventListener("click", () => removeClubFromPreset(idx));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "player-chip-remove";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => removeClubFromPreset(idx));

    li.append(span, removeBtn);
    clubsModalList.appendChild(li);
  });

  updateActiveClubsCounter();
}

function removeClubFromPreset(index) {
  state.presets[state.selectedPreset].clubs.splice(index, 1);
  saveState();
  renderClubsModal();
}

function addClubsToPreset(rawInput) {
  const names = rawInput
    .split(/[,;\n]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) return;

  const currentList = state.presets[state.selectedPreset].clubs;
  names.forEach((club) => {
    const exists = currentList.some((c) => c.toLowerCase() === club.toLowerCase());
    if (!exists) {
      currentList.push(club);
    }
  });

  saveState();
  renderClubsModal();
}

// Eventos
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.teamSize = Number(btn.dataset.size);
    saveState();
    syncControlsWithState();
    updateStats();
    if (state.lastDraw) {
      generateDraw();
    }
  });
});

playerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addPlayersFromString(playerInput.value);
  playerInput.value = "";
  playerInput.focus();
});

btnLoadDemo.addEventListener("click", () => {
  const demoFriends = ["Jony", "Lucas", "Matías", "Nico", "Fede", "Agus"];
  addPlayersFromString(demoFriends.join(", "));
});

btnClearPlayers.addEventListener("click", () => {
  state.players = [];
  state.lastDraw = null;
  saveState();
  renderPlayers();
  emptyState.hidden = false;
  resultsContainer.hidden = true;
  resultHeaderActions.hidden = true;
  hideAlert();
});

toggleClubs.addEventListener("change", () => {
  state.clubsEnabled = toggleClubs.checked;
  clubsConfigPanel.hidden = !state.clubsEnabled;
  saveState();

  if (state.lastDraw) {
    assignClubsToTeams(state.lastDraw.teams);
    renderDrawResults();
  }
});

presetSelect.addEventListener("change", () => {
  state.selectedPreset = presetSelect.value;
  updateActiveClubsCounter();
  saveState();

  if (state.lastDraw && state.clubsEnabled) {
    assignClubsToTeams(state.lastDraw.teams);
    renderDrawResults();
  }
});

chkNoRepeatClubs.addEventListener("change", () => {
  state.noRepeatClubs = chkNoRepeatClubs.checked;
  saveState();
});

btnGenerate.addEventListener("click", () => {
  generateDraw();
  if (window.matchMedia("(max-width: 900px)").matches) {
    const resultsPanel = document.querySelector(".results-panel");
    resultsPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

btnRerollAll?.addEventListener("click", () => {
  generateDraw();
});

btnRerollClubs.addEventListener("click", () => {
  if (!state.lastDraw) return;
  assignClubsToTeams(state.lastDraw.teams);
  renderDrawResults();
});

btnCopyWhatsapp.addEventListener("click", copySummaryToClipboard);

btnResetDraw?.addEventListener("click", () => {
  state.lastDraw = null;
  emptyState.hidden = false;
  resultsContainer.hidden = true;
  resultHeaderActions.hidden = true;
  hideAlert();
});

// Eventos del Modal <dialog>
btnOpenClubsDialog.addEventListener("click", () => {
  renderClubsModal();
  clubsDialog.showModal();
});

btnCloseDialog.addEventListener("click", () => clubsDialog.close());
btnConfirmDialog.addEventListener("click", () => clubsDialog.close());

addClubForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addClubsToPreset(clubInput.value);
  clubInput.value = "";
  clubInput.focus();
});

btnResetPreset.addEventListener("click", () => {
  const key = state.selectedPreset;
  state.presets[key].clubs = [...DEFAULT_PRESETS[key].clubs];
  saveState();
  renderClubsModal();
});

// Fallback para navegadores que aún no soportan closedby="any" en <dialog>
if (!("closedBy" in HTMLDialogElement.prototype)) {
  clubsDialog.addEventListener("click", (event) => {
    if (event.target !== clubsDialog) return;
    const rect = clubsDialog.getBoundingClientRect();
    const isDialogContent =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (isDialogContent) return;
    clubsDialog.close();
  });
}

// Inicialización al cargar la página
loadState();
syncControlsWithState();
renderPlayers();
