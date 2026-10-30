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
  lastDraw: null, // { teams: [{ id, name, members, club }], bench: [string] }
  tournament: null // { format, groupCount, qualifiersCount, teams, groups, bracket }
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

// Referencias de Configuración y Seguimiento de Torneo
const tournamentSetupBox = document.getElementById("tournamentSetupBox");
const tournamentFormatSelect = document.getElementById("tournamentFormatSelect");
const groupCountField = document.getElementById("groupCountField");
const groupCountSelect = document.getElementById("groupCountSelect");
const qualifiersField = document.getElementById("qualifiersField");
const qualifiersSelect = document.getElementById("qualifiersSelect");
const btnStartTournament = document.getElementById("btnStartTournament");

const tournamentSection = document.getElementById("tournamentSection");
const tournamentModeBadge = document.getElementById("tournamentModeBadge");
const btnCopyTournament = document.getElementById("btnCopyTournament");
const btnResetTournament = document.getElementById("btnResetTournament");
const championBanner = document.getElementById("championBanner");
const championTeamName = document.getElementById("championTeamName");
const championClubName = document.getElementById("championClubName");
const groupStageContainer = document.getElementById("groupStageContainer");
const btnAdvanceToKnockout = document.getElementById("btnAdvanceToKnockout");
const groupsWrapper = document.getElementById("groupsWrapper");
const knockoutStageContainer = document.getElementById("knockoutStageContainer");
const bracketWrapper = document.getElementById("bracketWrapper");

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
      presets: state.presets,
      lastDraw: state.lastDraw,
      tournament: state.tournament
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
    if (parsed.lastDraw && Array.isArray(parsed.lastDraw.teams)) {
      state.lastDraw = parsed.lastDraw;
    }
    if (parsed.tournament && typeof parsed.tournament === "object") {
      state.tournament = parsed.tournament;
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
  saveState();
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

  saveState();
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

  syncTournamentSetupOptions();
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

// ==========================================================================
// Motor de Torneos: Fase de Grupos, Fixture por Fechas y Cuadro Eliminatorio
// ==========================================================================

function getTeamDisplayName(team) {
  if (!team) return "Por definir";
  return team.members.join(" + ");
}

function getTeamClubLabel(team) {
  if (!team || !state.clubsEnabled || !team.club) return "";
  return team.club;
}

// Ajusta las opciones válidas de Grupos y Clasificados según cuántos equipos hay
function syncTournamentSetupOptions() {
  if (!state.lastDraw || !tournamentSetupBox) return;
  const numTeams = state.lastDraw.teams.length;
  const format = tournamentFormatSelect.value;

  groupCountField.hidden = format === "knockout";
  qualifiersField.hidden = format !== "both";

  // Habilitar cantidad de grupos según mínimo de 2 equipos por grupo
  Array.from(groupCountSelect.options).forEach((opt) => {
    const val = Number(opt.value);
    opt.disabled = val > 1 && numTeams < val * 2;
  });
  if (groupCountSelect.selectedOptions[0]?.disabled) {
    groupCountSelect.value = "1";
  }

  // Habilitar opciones de clasificados según total de equipos
  Array.from(qualifiersSelect.options).forEach((opt) => {
    const val = Number(opt.value);
    opt.disabled = val > numTeams;
  });

  if (qualifiersSelect.selectedOptions[0]?.disabled) {
    const validOpts = Array.from(qualifiersSelect.options).filter((o) => !o.disabled);
    if (validOpts.length > 0) {
      qualifiersSelect.value = validOpts[validOpts.length - 1].value;
    }
  }
}

// Algoritmo Round-Robin (Circle Method) para generar fechas todos contra todos
function generateRoundRobinRounds(groupTeams, groupId) {
  const list = [...groupTeams];
  if (list.length % 2 === 1) {
    list.push({ isBye: true });
  }

  const n = list.length;
  const totalRounds = n - 1;
  const half = n / 2;
  const rounds = [];

  for (let r = 0; r < totalRounds; r++) {
    const matches = [];
    let byeTeamId = null;

    for (let i = 0; i < half; i++) {
      const t1 = list[i];
      const t2 = list[n - 1 - i];

      if (t1.isBye) {
        byeTeamId = t2.id;
      } else if (t2.isBye) {
        byeTeamId = t1.id;
      } else {
        const home = r % 2 === 0 ? t1 : t2;
        const away = r % 2 === 0 ? t2 : t1;
        matches.push({
          id: `${groupId}-r${r + 1}-m${i + 1}`,
          homeId: home.id,
          awayId: away.id,
          homeScore: null,
          awayScore: null
        });
      }
    }

    rounds.push({
      roundNumber: r + 1,
      matches,
      byeTeamId
    });

    // Rotar dejando fijo el primer elemento
    const last = list.pop();
    list.splice(1, 0, last);
  }

  return rounds;
}

function createGroupsStage(teams, groupCount) {
  const groups = [];
  const letters = ["A", "B", "C", "D", "E", "F"];

  for (let g = 0; g < groupCount; g++) {
    groups.push({
      id: `group-${g + 1}`,
      name: groupCount === 1 ? "Grupo Único (Liga)" : `Grupo ${letters[g] || g + 1}`,
      teamIds: [],
      rounds: []
    });
  }

  teams.forEach((team, idx) => {
    groups[idx % groupCount].teamIds.push(team.id);
  });

  groups.forEach((group) => {
    const groupTeams = group.teamIds.map((id) => teams.find((t) => t.id === id));
    group.rounds = generateRoundRobinRounds(groupTeams, group.id);
  });

  return groups;
}

function computeGroupStandings(group, teamsMap) {
  const statsMap = new Map();

  group.teamIds.forEach((id) => {
    statsMap.set(id, {
      team: teamsMap.get(id),
      pj: 0,
      g: 0,
      e: 0,
      p: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0
    });
  });

  group.rounds.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.homeScore === null || match.awayScore === null) return;
      const hs = Number(match.homeScore);
      const as = Number(match.awayScore);
      if (Number.isNaN(hs) || Number.isNaN(as)) return;

      const homeStat = statsMap.get(match.homeId);
      const awayStat = statsMap.get(match.awayId);
      if (!homeStat || !awayStat) return;

      homeStat.pj += 1;
      awayStat.pj += 1;
      homeStat.gf += hs;
      homeStat.gc += as;
      homeStat.dg = homeStat.gf - homeStat.gc;

      awayStat.gf += as;
      awayStat.gc += hs;
      awayStat.dg = awayStat.gf - awayStat.gc;

      if (hs > as) {
        homeStat.g += 1;
        homeStat.pts += 3;
        awayStat.p += 1;
      } else if (hs < as) {
        awayStat.g += 1;
        awayStat.pts += 3;
        homeStat.p += 1;
      } else {
        homeStat.e += 1;
        awayStat.e += 1;
        homeStat.pts += 1;
        awayStat.pts += 1;
      }
    });
  });

  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return getTeamDisplayName(a.team).localeCompare(getTeamDisplayName(b.team));
  });
}

function getRoundTitle(matchesCount) {
  if (matchesCount === 1) return "🏆 Final";
  if (matchesCount === 2) return "Semifinales";
  if (matchesCount === 4) return "Cuartos de Final";
  if (matchesCount === 8) return "Octavos de Final";
  return `Ronda de ${matchesCount * 2}`;
}

function createKnockoutBracket(seededTeams) {
  const n = seededTeams.length;
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(Math.max(2, n))));
  const totalRounds = Math.log2(bracketSize);
  const firstRoundMatchesCount = bracketSize / 2;
  const numByes = bracketSize - n;

  const rounds = [];
  const firstRoundMatches = [];

  for (let i = 0; i < firstRoundMatchesCount; i++) {
    const teamA = seededTeams[i] || null;
    const isBye = i < numByes;
    const teamB = isBye ? null : seededTeams[bracketSize - 1 - i] || null;

    firstRoundMatches.push({
      id: `ko-r0-m${i}`,
      teamAId: teamA ? teamA.id : null,
      teamBId: teamB ? teamB.id : null,
      scoreA: null,
      scoreB: null,
      manualWinnerId: null,
      winnerId: isBye && teamA ? teamA.id : null,
      isBye
    });
  }

  rounds.push({
    roundIndex: 0,
    title: getRoundTitle(firstRoundMatchesCount),
    matches: firstRoundMatches
  });

  for (let r = 1; r < totalRounds; r++) {
    const count = bracketSize / Math.pow(2, r + 1);
    const matches = [];
    for (let m = 0; m < count; m++) {
      matches.push({
        id: `ko-r${r}-m${m}`,
        teamAId: null,
        teamBId: null,
        scoreA: null,
        scoreB: null,
        manualWinnerId: null,
        winnerId: null,
        isBye: false
      });
    }
    rounds.push({
      roundIndex: r,
      title: getRoundTitle(count),
      matches
    });
  }

  const bracket = { rounds, championId: null };
  propagateBracketWinners(bracket);
  return bracket;
}

function evaluateMatchWinner(match) {
  if (match.isBye && match.teamAId) return match.teamAId;
  if (!match.teamAId || !match.teamBId) return null;

  if (
    match.manualWinnerId &&
    (match.manualWinnerId === match.teamAId || match.manualWinnerId === match.teamBId)
  ) {
    return match.manualWinnerId;
  }

  if (match.scoreA !== null && match.scoreB !== null) {
    const sa = Number(match.scoreA);
    const sb = Number(match.scoreB);
    if (!Number.isNaN(sa) && !Number.isNaN(sb)) {
      if (sa > sb) return match.teamAId;
      if (sb > sa) return match.teamBId;
    }
  }

  return null;
}

function propagateBracketWinners(bracket) {
  if (!bracket || !Array.isArray(bracket.rounds)) return;

  for (let r = 0; r < bracket.rounds.length; r++) {
    const round = bracket.rounds[r];
    round.matches.forEach((match, mIdx) => {
      match.winnerId = evaluateMatchWinner(match);

      if (r + 1 < bracket.rounds.length) {
        const nextMatch = bracket.rounds[r + 1].matches[Math.floor(mIdx / 2)];
        const slotKey = mIdx % 2 === 0 ? "teamAId" : "teamBId";
        const previousTeamId = nextMatch[slotKey];

        if (previousTeamId !== match.winnerId) {
          nextMatch[slotKey] = match.winnerId;
          // Si cambió uno de los rivales en la siguiente ronda, limpiamos su resultado previo
          nextMatch.scoreA = null;
          nextMatch.scoreB = null;
          nextMatch.manualWinnerId = null;
          nextMatch.winnerId = null;
        }
      }
    });
  }

  const finalRound = bracket.rounds[bracket.rounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  bracket.championId = finalMatch?.winnerId || null;
}

function startTournamentFromDraw() {
  if (!state.lastDraw || state.lastDraw.teams.length < 2) return;

  const format = tournamentFormatSelect.value; // "both" | "groups" | "knockout"
  const groupCount = Number(groupCountSelect.value) || 1;
  const qualifiersCount = Math.min(
    Number(qualifiersSelect.value) || 2,
    state.lastDraw.teams.length
  );

  // Clonamos los equipos confirmados para el torneo
  const confirmedTeams = structuredClone(state.lastDraw.teams);

  const tournament = {
    format,
    groupCount,
    qualifiersCount,
    teams: confirmedTeams,
    groups: null,
    bracket: null
  };

  if (format === "groups" || format === "both") {
    tournament.groups = createGroupsStage(confirmedTeams, groupCount);
  }

  if (format === "knockout") {
    tournament.bracket = createKnockoutBracket(confirmedTeams);
  }

  state.tournament = tournament;
  saveState();
  renderTournament();
  tournamentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function advanceGroupsToKnockout() {
  if (!state.tournament || !state.tournament.groups) return;
  const { groups, teams, qualifiersCount } = state.tournament;
  const teamsMap = new Map(teams.map((t) => [t.id, t]));

  const groupStandingsList = groups.map((g) => computeGroupStandings(g, teamsMap));
  const qualified = [];

  if (groups.length === 2 && qualifiersCount === 4) {
    // Cruce clásico: 1°A vs 2°B y 1°B vs 2°A
    const gA = groupStandingsList[0];
    const gB = groupStandingsList[1];
    if (gA[0]) qualified.push(gA[0].team);
    if (gB[0]) qualified.push(gB[0].team);
    if (gA[1]) qualified.push(gA[1].team);
    if (gB[1]) qualified.push(gB[1].team);
  } else {
    // Clasificación general intercalando posiciones por grupo (1° de cada grupo, luego 2°, etc.)
    const maxRows = Math.max(...groupStandingsList.map((s) => s.length));
    const bucketed = [];
    for (let rank = 0; rank < maxRows; rank++) {
      const tier = [];
      groupStandingsList.forEach((standings) => {
        if (standings[rank]) tier.push(standings[rank]);
      });
      tier.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
      bucketed.push(...tier.map((row) => row.team));
    }
    qualified.push(...bucketed.slice(0, qualifiersCount));
  }

  state.tournament.bracket = createKnockoutBracket(qualified);
  saveState();
  renderTournament();
  knockoutStageContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGroupStandingsIntoWrapper(tableContainer, group, teamsMap, highlightTopCount) {
  const standings = computeGroupStandings(group, teamsMap);
  tableContainer.innerHTML = "";

  const captionId = `caption-${group.id}`;
  tableContainer.setAttribute("aria-labelledby", captionId);

  const table = document.createElement("table");
  table.className = "standings-table";

  const caption = document.createElement("caption");
  caption.id = captionId;
  caption.textContent = `Tabla de posiciones de ${group.name}`;
  table.appendChild(caption);

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th scope="col">Equipo</th>
      <th scope="col" title="Partidos Jugados">PJ</th>
      <th scope="col" title="Ganados">G</th>
      <th scope="col" title="Empatados">E</th>
      <th scope="col" title="Perdidos">P</th>
      <th scope="col" title="Goles/Tantos a Favor">GF</th>
      <th scope="col" title="Goles/Tantos en Contra">GC</th>
      <th scope="col" title="Diferencia">DG</th>
      <th scope="col" title="Puntos">PTS</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  standings.forEach((row, idx) => {
    const tr = document.createElement("tr");
    if (idx < highlightTopCount) {
      tr.className = "qualified-row";
    }

    const th = document.createElement("th");
    th.scope = "row";

    const posSpan = document.createElement("span");
    posSpan.className = "standings-pos";
    posSpan.textContent = idx + 1;

    const nameText = document.createTextNode(getTeamDisplayName(row.team));
    th.append(posSpan, nameText);

    const clubLabel = getTeamClubLabel(row.team);
    if (clubLabel) {
      const clubSub = document.createElement("span");
      clubSub.className = "standings-club-sub";
      clubSub.textContent = `🛡️ ${clubLabel}`;
      th.appendChild(clubSub);
    }

    const dgFormatted = row.dg > 0 ? `+${row.dg}` : String(row.dg);

    tr.appendChild(th);
    const cells = [row.pj, row.g, row.e, row.p, row.gf, row.gc, dgFormatted, row.pts];
    cells.forEach((val, cIdx) => {
      const td = document.createElement("td");
      if (cIdx === cells.length - 1) td.className = "pts-cell";
      td.textContent = val;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}

function updateChampionBanner(teamsMap) {
  if (!state.tournament) {
    championBanner.hidden = true;
    return;
  }

  let championTeam = null;

  if (state.tournament.bracket?.championId) {
    championTeam = teamsMap.get(state.tournament.bracket.championId);
  } else if (state.tournament.format === "groups" && state.tournament.groups?.length === 1) {
    // Si es Liga Única y todos los partidos tienen resultado, coronamos al 1°
    const group = state.tournament.groups[0];
    const allPlayed = group.rounds.every((r) =>
      r.matches.every((m) => m.homeScore !== null && m.awayScore !== null)
    );
    if (allPlayed && group.rounds.length > 0) {
      const standings = computeGroupStandings(group, teamsMap);
      championTeam = standings[0]?.team || null;
    }
  }

  if (championTeam) {
    championBanner.hidden = false;
    championTeamName.textContent = getTeamDisplayName(championTeam);
    const club = getTeamClubLabel(championTeam);
    championClubName.textContent = club ? `🛡️ ${club}` : "";
  } else {
    championBanner.hidden = true;
  }
}

function renderTournament() {
  if (!state.tournament) {
    tournamentSection.hidden = true;
    return;
  }

  tournamentSection.hidden = false;
  const { format, groups, bracket, teams, qualifiersCount } = state.tournament;
  const teamsMap = new Map(teams.map((t) => [t.id, t]));

  const formatLabels = {
    both: "Grupos + Eliminatorias",
    groups: "Fase de Grupos (Liga)",
    knockout: "Cuadro Eliminatorio"
  };
  tournamentModeBadge.textContent = formatLabels[format] || "En curso";

  // 1. Renderizar Fase de Grupos
  if (groups && groups.length > 0) {
    groupStageContainer.hidden = false;
    btnAdvanceToKnockout.hidden = format !== "both";
    btnAdvanceToKnockout.textContent = bracket
      ? "🔄 Actualizar Clasificados al Cuadro Final"
      : "⚡ Cerrar Grupos y Generar Cuadro Final";

    groupsWrapper.innerHTML = "";
    const highlightPerGroup =
      format === "both"
        ? Math.max(1, Math.floor(qualifiersCount / groups.length))
        : 1;

    groups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "group-card";

      const title = document.createElement("div");
      title.className = "group-card-title";
      title.innerHTML = `<span>📋 ${group.name}</span><span>${group.teamIds.length} equipos</span>`;

      const tableWrapper = document.createElement("div");
      tableWrapper.className = "table-wrapper";
      tableWrapper.tabIndex = 0;
      tableWrapper.setAttribute("role", "region");

      renderGroupStandingsIntoWrapper(tableWrapper, group, teamsMap, highlightPerGroup);

      const roundsContainer = document.createElement("div");
      roundsContainer.className = "fixture-rounds";

      group.rounds.forEach((round) => {
        const roundCard = document.createElement("div");
        roundCard.className = "fixture-round-card";

        const roundTitle = document.createElement("div");
        roundTitle.className = "fixture-round-title";
        roundTitle.textContent = `Fecha ${round.roundNumber}`;
        roundCard.appendChild(roundTitle);

        const matchesListEl = document.createElement("div");
        matchesListEl.className = "fixture-matches-list";

        round.matches.forEach((match) => {
          const homeTeam = teamsMap.get(match.homeId);
          const awayTeam = teamsMap.get(match.awayId);

          const row = document.createElement("div");
          row.className = "fixture-match-row";

          const homeDiv = document.createElement("div");
          homeDiv.className = "fixture-team home";
          homeDiv.textContent = getTeamDisplayName(homeTeam);
          const homeClub = getTeamClubLabel(homeTeam);
          if (homeClub) {
            const sub = document.createElement("span");
            sub.className = "fixture-team-club";
            sub.textContent = `🛡️ ${homeClub}`;
            homeDiv.appendChild(sub);
          }

          const scoreBox = document.createElement("div");
          scoreBox.className = "fixture-score-box";

          const inputHome = document.createElement("input");
          inputHome.type = "number";
          inputHome.min = "0";
          inputHome.max = "99";
          inputHome.placeholder = "-";
          inputHome.className = "score-input";
          inputHome.setAttribute("aria-label", `Goles de ${getTeamDisplayName(homeTeam)}`);
          if (match.homeScore !== null) inputHome.value = match.homeScore;

          const sep = document.createElement("span");
          sep.textContent = "vs";
          sep.style.fontSize = "0.75rem";
          sep.style.color = "var(--text-muted)";

          const inputAway = document.createElement("input");
          inputAway.type = "number";
          inputAway.min = "0";
          inputAway.max = "99";
          inputAway.placeholder = "-";
          inputAway.className = "score-input";
          inputAway.setAttribute("aria-label", `Goles de ${getTeamDisplayName(awayTeam)}`);
          if (match.awayScore !== null) inputAway.value = match.awayScore;

          const onScoreInput = () => {
            match.homeScore = inputHome.value === "" ? null : Number(inputHome.value);
            match.awayScore = inputAway.value === "" ? null : Number(inputAway.value);
            saveState();
            renderGroupStandingsIntoWrapper(tableWrapper, group, teamsMap, highlightPerGroup);
            updateChampionBanner(teamsMap);
          };

          inputHome.addEventListener("input", onScoreInput);
          inputAway.addEventListener("input", onScoreInput);

          scoreBox.append(inputHome, sep, inputAway);

          const awayDiv = document.createElement("div");
          awayDiv.className = "fixture-team away";
          awayDiv.textContent = getTeamDisplayName(awayTeam);
          const awayClub = getTeamClubLabel(awayTeam);
          if (awayClub) {
            const sub = document.createElement("span");
            sub.className = "fixture-team-club";
            sub.textContent = `🛡️ ${awayClub}`;
            awayDiv.appendChild(sub);
          }

          row.append(homeDiv, scoreBox, awayDiv);
          matchesListEl.appendChild(row);
        });

        roundCard.appendChild(matchesListEl);

        if (round.byeTeamId) {
          const byeTeam = teamsMap.get(round.byeTeamId);
          const byeNote = document.createElement("div");
          byeNote.className = "fixture-bye-note";
          byeNote.textContent = `⏳ Libre en esta fecha: ${getTeamDisplayName(byeTeam)}`;
          roundCard.appendChild(byeNote);
        }

        roundsContainer.appendChild(roundCard);
      });

      card.append(title, tableWrapper, roundsContainer);
      groupsWrapper.appendChild(card);
    });
  } else {
    groupStageContainer.hidden = true;
  }

  // 2. Renderizar Cuadro Eliminatorio
  if (bracket && Array.isArray(bracket.rounds)) {
    knockoutStageContainer.hidden = false;
    renderBracketColumns(bracket, teamsMap);
  } else {
    knockoutStageContainer.hidden = true;
  }

  updateChampionBanner(teamsMap);
}

function renderBracketColumns(bracket, teamsMap) {
  bracketWrapper.innerHTML = "";

  bracket.rounds.forEach((round) => {
    const col = document.createElement("div");
    col.className = "bracket-round-col";

    const header = document.createElement("div");
    header.className = "bracket-round-header";
    header.textContent = round.title;

    const matchesCol = document.createElement("div");
    matchesCol.className = "bracket-matches-col";

    round.matches.forEach((match, idx) => {
      const card = document.createElement("div");
      card.className = "bracket-match-card";

      const label = document.createElement("div");
      label.className = "bracket-match-label";
      label.innerHTML = `<span>Llave ${idx + 1}</span><span>${
        match.isBye ? "Pase directo (BYE)" : ""
      }</span>`;
      card.appendChild(label);

      const teamA = teamsMap.get(match.teamAId);
      const teamB = teamsMap.get(match.teamBId);

      card.appendChild(
        createBracketTeamRow(match, "A", teamA, bracket, teamsMap)
      );

      if (!match.isBye) {
        card.appendChild(
          createBracketTeamRow(match, "B", teamB, bracket, teamsMap)
        );
      }

      matchesCol.appendChild(card);
    });

    col.append(header, matchesCol);
    bracketWrapper.appendChild(col);
  });
}

function createBracketTeamRow(match, side, team, bracket, teamsMap) {
  const row = document.createElement("div");
  const isWinner = team && match.winnerId === team.id;
  row.className = `bracket-team-row${isWinner ? " winner" : ""}`;

  const info = document.createElement("div");
  info.className = "bracket-team-info";

  const nameDiv = document.createElement("div");
  nameDiv.className = "bracket-team-name";
  nameDiv.textContent = team ? getTeamDisplayName(team) : "⏳ Esperando rival...";
  info.appendChild(nameDiv);

  const club = getTeamClubLabel(team);
  if (club) {
    const clubDiv = document.createElement("div");
    clubDiv.className = "bracket-team-club";
    clubDiv.textContent = `🛡️ ${club}`;
    info.appendChild(clubDiv);
  }

  row.appendChild(info);

  if (team && !match.isBye && match.teamAId && match.teamBId) {
    const controls = document.createElement("div");
    controls.className = "bracket-controls";

    const scoreKey = side === "A" ? "scoreA" : "scoreB";
    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "99";
    scoreInput.placeholder = "-";
    scoreInput.className = "score-input";
    scoreInput.setAttribute("aria-label", `Resultado de ${getTeamDisplayName(team)}`);
    if (match[scoreKey] !== null) scoreInput.value = match[scoreKey];

    scoreInput.addEventListener("change", () => {
      match[scoreKey] = scoreInput.value === "" ? null : Number(scoreInput.value);
      match.manualWinnerId = null;
      propagateBracketWinners(bracket);
      saveState();
      renderBracketColumns(bracket, teamsMap);
      updateChampionBanner(teamsMap);
    });

    const pickBtn = document.createElement("button");
    pickBtn.type = "button";
    pickBtn.className = "btn-pick-winner";
    pickBtn.title = "Marcar como ganador de la llave (Penales / Truco)";
    pickBtn.textContent = isWinner ? "✓ Ganó" : "Ganó";
    pickBtn.addEventListener("click", () => {
      match.manualWinnerId = match.manualWinnerId === team.id ? null : team.id;
      propagateBracketWinners(bracket);
      saveState();
      renderBracketColumns(bracket, teamsMap);
      updateChampionBanner(teamsMap);
    });

    controls.append(scoreInput, pickBtn);
    row.appendChild(controls);
  }

  return row;
}

async function copyTournamentToClipboard() {
  if (!state.tournament) return;
  const { groups, bracket, teams } = state.tournament;
  const teamsMap = new Map(teams.map((t) => [t.id, t]));
  const lines = ["🏆 *REPORTE DEL TORNEO* 🏆", ""];

  if (!championBanner.hidden) {
    lines.push(`👑 *CAMPEÓN:* ${championTeamName.textContent} ${championClubName.textContent}`);
    lines.push("");
  }

  if (groups && groups.length > 0) {
    groups.forEach((group) => {
      lines.push(`📊 *${group.name}*`);
      const standings = computeGroupStandings(group, teamsMap);
      standings.forEach((s, i) => {
        const club = getTeamClubLabel(s.team) ? ` (${getTeamClubLabel(s.team)})` : "";
        lines.push(
          `${i + 1}. *${getTeamDisplayName(s.team)}*${club} — *${s.pts} pts* (PJ:${s.pj} | DG:${
            s.dg > 0 ? `+${s.dg}` : s.dg
          })`
        );
      });
      lines.push("");
    });
  }

  if (bracket && bracket.rounds) {
    lines.push("🥊 *CUADRO ELIMINATORIO*");
    bracket.rounds.forEach((round) => {
      lines.push(`*— ${round.title} —*`);
      round.matches.forEach((m) => {
        const tA = teamsMap.get(m.teamAId);
        const tB = teamsMap.get(m.teamBId);
        if (m.isBye && tA) {
          lines.push(`• ${getTeamDisplayName(tA)} _(Pasa directo)_`);
        } else {
          const nameA = tA ? getTeamDisplayName(tA) : "Por definir";
          const nameB = tB ? getTeamDisplayName(tB) : "Por definir";
          const scA = m.scoreA !== null ? ` [${m.scoreA}]` : "";
          const scB = m.scoreB !== null ? `[${m.scoreB}] ` : "";
          const winMarkA = m.winnerId && m.winnerId === m.teamAId ? "✅ " : "";
          const winMarkB = m.winnerId && m.winnerId === m.teamBId ? " ✅" : "";
          lines.push(`• ${winMarkA}${nameA}${scA} vs ${scB}${nameB}${winMarkB}`);
        }
      });
      lines.push("");
    });
  }

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    const original = btnCopyTournament.textContent;
    btnCopyTournament.textContent = "✅ ¡Torneo Copiado!";
    setTimeout(() => {
      btnCopyTournament.textContent = original;
    }, 1800);
  } catch {
    showAlert("No se pudo copiar el resumen del torneo.");
  }
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
  const demoFriends = ["Jony", "Lucas", "Matías", "Nico", "Fede", "Agus", "Santi", "Tomi"];
  addPlayersFromString(demoFriends.join(", "));
});

function clearDrawUI() {
  matchesList.innerHTML = "";
  waitingTeamContent.innerHTML = "";
  benchPlayersList.innerHTML = "";
  waitingTeamBox.hidden = true;
  benchPlayersBox.hidden = true;
  resultsContainer.hidden = true;
  resultHeaderActions.hidden = true;
  emptyState.hidden = false;
  hideAlert();
}

btnClearPlayers.addEventListener("click", () => {
  state.players = [];
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  renderPlayers();
  renderTournament();
  clearDrawUI();
});

toggleClubs.addEventListener("change", () => {
  state.clubsEnabled = toggleClubs.checked;
  clubsConfigPanel.hidden = !state.clubsEnabled;
  saveState();

  if (state.lastDraw) {
    assignClubsToTeams(state.lastDraw.teams);
    saveState();
    renderDrawResults();
  }
  if (state.tournament) {
    renderTournament();
  }
});

presetSelect.addEventListener("change", () => {
  state.selectedPreset = presetSelect.value;
  updateActiveClubsCounter();
  saveState();

  if (state.lastDraw && state.clubsEnabled) {
    assignClubsToTeams(state.lastDraw.teams);
    saveState();
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
  saveState();
  renderDrawResults();
});

btnCopyWhatsapp.addEventListener("click", copySummaryToClipboard);

btnResetDraw?.addEventListener("click", () => {
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  renderTournament();
  clearDrawUI();
});

// Eventos de Configuración y Seguimiento de Torneo
tournamentFormatSelect?.addEventListener("change", syncTournamentSetupOptions);
btnStartTournament?.addEventListener("click", startTournamentFromDraw);
btnAdvanceToKnockout?.addEventListener("click", advanceGroupsToKnockout);
btnCopyTournament?.addEventListener("click", copyTournamentToClipboard);
btnResetTournament?.addEventListener("click", () => {
  state.tournament = null;
  saveState();
  renderTournament();
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
if (state.lastDraw) {
  renderDrawResults();
}
if (state.tournament) {
  renderTournament();
}
