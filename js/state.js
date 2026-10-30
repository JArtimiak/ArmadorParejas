// ==========================================
// 1. DATOS PREDEFINIDOS, ESTADO GLOBAL Y PERSISTENCIA
// ==========================================

const DEFAULT_PRESETS = {
  argentina: [
    'Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo',
    'Estudiantes LP', 'Vélez Sarsfield', 'Talleres', 'Lanús', 'Argentinos Jrs',
    'Rosario Central', "Newell's", 'Huracán', 'Defensa y Justicia'
  ],
  europa: [
    'Real Madrid', 'FC Barcelona', 'Manchester City', 'Liverpool', 'Arsenal',
    'Bayern Múnich', 'PSG', 'Inter de Milán', 'AC Milan', 'Juventus',
    'Atlético de Madrid', 'Borussia Dortmund', 'Chelsea', 'Bayer Leverkusen'
  ],
  selecciones: [
    'Argentina', 'Francia', 'Brasil', 'Inglaterra', 'España',
    'Alemania', 'Portugal', 'Países Bajos', 'Italia', 'Uruguay',
    'Colombia', 'Croacia', 'Bélgica', 'Marruecos'
  ],
  mix5: [
    'Real Madrid', 'Manchester City', 'FC Barcelona', 'Bayern Múnich', 'Liverpool',
    'Arsenal', 'Inter de Milán', 'PSG', 'Argentina', 'Francia',
    'España', 'Inglaterra', 'Brasil', 'Boca Juniors', 'River Plate'
  ],
  custom: [
    'Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4'
  ]
};

const STORAGE_KEY = 'armador_parejas_state_v1';

const state = {
  teamSize: 2, // 1 = 1vs1, 2 = 2vs2, 3 = 3vs3
  players: [], // [{ id, name, active }]
  assignClubs: true,
  currentPresetKey: 'mix5',
  noRepeatClubs: true,
  customPresets: JSON.parse(JSON.stringify(DEFAULT_PRESETS)),
  lastDraw: null,
  tournament: null,
  truco: {
    target: 30,
    nameA: 'Nosotros',
    nameB: 'Ellos',
    scoreA: 0,
    scoreB: 0,
    linkedMatch: null,
  }
};

// ==========================================
// REFERENCIAS AL DOM (Sincronizadas con index.html)
// ==========================================
const modeButtons = document.querySelectorAll('.mode-btn');
const playerForm = document.getElementById('playerForm');
const playerInput = document.getElementById('playerInput');
const playerListEl = document.getElementById('playerList');
const btnLoadDemo = document.getElementById('btnLoadDemo');
const btnClearPlayers = document.getElementById('btnClearPlayers');

const statActiveCount = document.getElementById('statActiveCount');
const statTeamsCount = document.getElementById('statTeamsCount');
const statTeamsLabel = document.getElementById('statTeamsLabel');
const statMatchesCount = document.getElementById('statMatchesCount');
const statBenchCount = document.getElementById('statBenchCount');

const toggleClubs = document.getElementById('toggleClubs');
const clubsConfigPanel = document.getElementById('clubsConfigPanel');
const presetSelect = document.getElementById('presetSelect');
const chkNoRepeatClubs = document.getElementById('chkNoRepeatClubs');
const activeClubsCount = document.getElementById('activeClubsCount');
const btnOpenClubsDialog = document.getElementById('btnOpenClubsDialog');

const btnGenerate = document.getElementById('btnGenerate');
const btnRerollAll = document.getElementById('btnRerollAll');
const btnRerollClubs = document.getElementById('btnRerollClubs');
const btnCopyWhatsapp = document.getElementById('btnCopyWhatsapp');
const btnResetDraw = document.getElementById('btnResetDraw');
const resultHeaderActions = document.getElementById('resultHeaderActions');

const alertBox = document.getElementById('alertBox');
const emptyState = document.getElementById('emptyState');
const resultsContainer = document.getElementById('resultsContainer');
const matchesList = document.getElementById('matchesList');
const waitingTeamBox = document.getElementById('waitingTeamBox');
const waitingTeamContent = document.getElementById('waitingTeamContent');
const benchPlayersBox = document.getElementById('benchPlayersBox');
const benchTeamSize = document.getElementById('benchTeamSize');
const benchPlayersList = document.getElementById('benchPlayersList');

// Elementos del Torneo
const tournamentSetupBox = document.getElementById('tournamentSetupBox');
const tournamentFormatSelect = document.getElementById('tournamentFormatSelect');
const groupCountField = document.getElementById('groupCountField');
const groupCountSelect = document.getElementById('groupCountSelect');
const qualifiersField = document.getElementById('qualifiersField');
const qualifiersSelect = document.getElementById('qualifiersSelect');
const btnStartTournament = document.getElementById('btnStartTournament');

const tournamentSection = document.getElementById('tournamentSection');
const tournamentModeBadge = document.getElementById('tournamentModeBadge');
const btnCopyTournament = document.getElementById('btnCopyTournament');
const btnResetTournament = document.getElementById('btnResetTournament');
const championBanner = document.getElementById('championBanner');
const championTeamName = document.getElementById('championTeamName');
const championClubName = document.getElementById('championClubName');
const groupStageContainer = document.getElementById('groupStageContainer');
const groupsWrapper = document.getElementById('groupsWrapper');
const btnAdvanceToKnockout = document.getElementById('btnAdvanceToKnockout');
const knockoutStageContainer = document.getElementById('knockoutStageContainer');
const bracketWrapper = document.getElementById('bracketWrapper');

// Modal de Clubes
const clubsDialog = document.getElementById('clubsDialog');
const dialogPresetName = document.getElementById('dialogPresetName');
const btnCloseDialog = document.getElementById('btnCloseDialog');
const btnConfirmDialog = document.getElementById('btnConfirmDialog');
const addClubForm = document.getElementById('addClubForm');
const clubInput = document.getElementById('clubInput');
const clubsModalList = document.getElementById('clubsModalList');
const btnResetPreset = document.getElementById('btnResetPreset');

// Modal del Anotador de Truco
const btnOpenTrucoGlobal = document.getElementById('btnOpenTrucoGlobal');
const trucoDialog = document.getElementById('trucoDialog');
const btnCloseTruco = document.getElementById('btnCloseTruco');
const btnDoneTruco = document.getElementById('btnDoneTruco');
const btnResetTruco = document.getElementById('btnResetTruco');
const btnTrucoTarget30 = document.getElementById('btnTrucoTarget30');
const btnTrucoTarget15 = document.getElementById('btnTrucoTarget15');
const trucoNameA = document.getElementById('trucoNameA');
const trucoNameB = document.getElementById('trucoNameB');
const trucoScoreA = document.getElementById('trucoScoreA');
const trucoScoreB = document.getElementById('trucoScoreB');
const trucoStatusA = document.getElementById('trucoStatusA');
const trucoStatusB = document.getElementById('trucoStatusB');
const btnTrucoMinusA = document.getElementById('btnTrucoMinusA');
const btnTrucoPlusA = document.getElementById('btnTrucoPlusA');
const btnTrucoMinusB = document.getElementById('btnTrucoMinusB');
const btnTrucoPlusB = document.getElementById('btnTrucoPlusB');
const trucoTopHalfTitle = document.getElementById('trucoTopHalfTitle');
const trucoMalasA = document.getElementById('trucoMalasA');
const trucoMalasB = document.getElementById('trucoMalasB');
const trucoBuenasSection = document.getElementById('trucoBuenasSection');
const trucoBuenasA = document.getElementById('trucoBuenasA');
const trucoBuenasB = document.getElementById('trucoBuenasB');
const trucoWinnerBanner = document.getElementById('trucoWinnerBanner');
const trucoWinnerName = document.getElementById('trucoWinnerName');
const trucoWinnerSub = document.getElementById('trucoWinnerSub');
const trucoConfettiContainer = document.getElementById('trucoConfettiContainer');
const btnTrucoRematch = document.getElementById('btnTrucoRematch');
const btnTrucoShare = document.getElementById('btnTrucoShare');
const btnTrucoUndo = document.getElementById('btnTrucoUndo');
const trucoTeamCardA = document.getElementById('trucoTeamCardA');
const trucoTeamCardB = document.getElementById('trucoTeamCardB');
const btnSaveTrucoToMatch = document.getElementById('btnSaveTrucoToMatch');

// ==========================================
// UTILIDADES Y PERSISTENCIA (localStorage)
// ==========================================

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function saveState() {
  try {
    const payload = {
      teamSize: state.teamSize,
      players: state.players,
      assignClubs: state.assignClubs,
      currentPresetKey: state.currentPresetKey,
      noRepeatClubs: state.noRepeatClubs,
      customPresets: state.customPresets,
      lastDraw: state.lastDraw,
      tournament: state.tournament,
      truco: state.truco,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('No se pudo guardar en localStorage:', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);

    if ([1, 2, 3].includes(saved.teamSize)) state.teamSize = saved.teamSize;
    if (Array.isArray(saved.players)) state.players = saved.players;
    if (typeof saved.assignClubs === 'boolean') state.assignClubs = saved.assignClubs;
    if (saved.currentPresetKey && DEFAULT_PRESETS[saved.currentPresetKey]) {
      state.currentPresetKey = saved.currentPresetKey;
    }
    if (typeof saved.noRepeatClubs === 'boolean') state.noRepeatClubs = saved.noRepeatClubs;
    if (saved.customPresets && typeof saved.customPresets === 'object') {
      state.customPresets = { ...JSON.parse(JSON.stringify(DEFAULT_PRESETS)), ...saved.customPresets };
    }
    if (saved.lastDraw && Array.isArray(saved.lastDraw.teams)) {
      state.lastDraw = saved.lastDraw;
    }
    if (saved.tournament && typeof saved.tournament === 'object') {
      state.tournament = saved.tournament;
    }
    if (saved.truco && typeof saved.truco === 'object') {
      state.truco = {
        target: saved.truco.target === 15 ? 15 : 30,
        nameA: saved.truco.nameA || 'Nosotros',
        nameB: saved.truco.nameB || 'Ellos',
        scoreA: Number(saved.truco.scoreA) || 0,
        scoreB: Number(saved.truco.scoreB) || 0,
        linkedMatch: saved.truco.linkedMatch || null,
      };
    }
  } catch (err) {
    console.warn('Error cargando estado previo:', err);
  }
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.hidden = false;
}

function hideAlert() {
  alertBox.hidden = true;
  alertBox.textContent = '';
}
