// ==========================================
// 3. SORTEO DE PAREJAS, CRUCES VS Y RESUMEN
// ==========================================

function generateDraw() {
  const activePlayers = state.players.filter(p => p.active);
  const minPlayersNeeded = state.teamSize * 2;

  if (activePlayers.length < minPlayersNeeded) {
    showAlert(`Necesitás al menos ${minPlayersNeeded} jugadores activos para armar un cruce ${state.teamSize} vs ${state.teamSize}.`);
    return;
  }

  hideAlert();

  // Mezclar jugadores activos
  const shuffledPlayers = shuffleArray(activePlayers);
  const totalTeams = Math.floor(shuffledPlayers.length / state.teamSize);

  const teams = [];
  for (let i = 0; i < totalTeams; i++) {
    const members = shuffledPlayers.slice(i * state.teamSize, (i + 1) * state.teamSize);
    teams.push({
      id: i + 1,
      members,
      club: null,
    });
  }

  // Jugadores que sobran sin completar equipo
  const benchPlayers = shuffledPlayers.slice(totalTeams * state.teamSize);

  // Emparejar equipos en partidos (Team 1 vs Team 2, etc.)
  const matches = [];
  const totalMatches = Math.floor(teams.length / 2);

  for (let i = 0; i < totalMatches; i++) {
    matches.push({
      matchNumber: i + 1,
      teamA: teams[i * 2],
      teamB: teams[i * 2 + 1],
    });
  }

  // Si hay cantidad impar de equipos, uno queda esperando ganador
  const waitingTeam = teams.length % 2 !== 0 ? teams[teams.length - 1] : null;

  state.lastDraw = {
    teamSize: state.teamSize,
    teams,
    matches,
    waitingTeam,
    benchPlayers,
    timestamp: Date.now(),
  };

  if (state.assignClubs) {
    assignClubsToTeams();
  }

  saveState();
  renderDrawResults();
}

function createTeamElement(team) {
  const box = document.createElement('div');
  box.className = 'team-box';

  const topDiv = document.createElement('div');
  const typeLabel = state.lastDraw.teamSize === 1 ? 'JUGADOR' : state.lastDraw.teamSize === 2 ? 'PAREJA' : 'EQUIPO';
  const titleDiv = document.createElement('div');
  titleDiv.className = 'team-title';
  titleDiv.textContent = `${typeLabel} ${team.id}`;
  topDiv.appendChild(titleDiv);

  const membersDiv = document.createElement('div');
  membersDiv.className = 'team-members';
  team.members.forEach(member => {
    const row = document.createElement('div');
    row.className = 'member-row';
    row.innerHTML = `<span aria-hidden="true">${state.lastDraw.teamSize === 1 ? '👤' : '🎮'}</span> <span>${member.name}</span>`;
    membersDiv.appendChild(row);
  });
  topDiv.appendChild(membersDiv);
  box.appendChild(topDiv);

  if (state.assignClubs && team.club) {
    const clubRow = document.createElement('div');
    clubRow.className = 'club-badge-row';

    const clubSpan = document.createElement('span');
    clubSpan.className = 'club-name';
    clubSpan.innerHTML = `<span aria-hidden="true">🛡️</span> <span>${team.club}</span>`;

    const rerollBtn = document.createElement('button');
    rerollBtn.type = 'button';
    rerollBtn.className = 'btn-reroll-single';
    rerollBtn.title = 'Sortear otro club para este equipo';
    rerollBtn.textContent = '🔄';
    rerollBtn.addEventListener('click', () => rerollSingleTeamClub(team.id));

    clubRow.appendChild(clubSpan);
    clubRow.appendChild(rerollBtn);
    box.appendChild(clubRow);
  }

  return box;
}

function clearDrawUI() {
  matchesList.innerHTML = '';
  waitingTeamContent.innerHTML = '';
  benchPlayersList.innerHTML = '';
  waitingTeamBox.hidden = true;
  benchPlayersBox.hidden = true;
  resultsContainer.hidden = true;
  resultHeaderActions.hidden = true;
  emptyState.hidden = false;
}

function renderDrawResults() {
  if (!state.lastDraw || !state.lastDraw.teams || state.lastDraw.teams.length === 0) {
    clearDrawUI();
    return;
  }

  emptyState.hidden = true;
  resultsContainer.hidden = false;
  resultHeaderActions.hidden = false;
  btnRerollClubs.hidden = !state.assignClubs;

  matchesList.innerHTML = '';
  const modeText = `${state.lastDraw.teamSize} vs ${state.lastDraw.teamSize}`;

  state.lastDraw.matches.forEach(match => {
    const card = document.createElement('article');
    card.className = 'match-card';

    const header = document.createElement('div');
    header.className = 'match-card-header';
    header.innerHTML = `
      <span>⚽ PARTIDO ${match.matchNumber}</span>
      <span>FORMATO ${modeText}</span>
    `;

    // Botón rápido para abrir el Anotador de Truco con las parejas de este partido
    const trucoBtn = document.createElement('button');
    trucoBtn.type = 'button';
    trucoBtn.className = 'btn-open-truco-inline';
    trucoBtn.innerHTML = '🃏 Anotar Truco';
    trucoBtn.title = 'Abrir anotador de Truco con estas parejas';
    trucoBtn.addEventListener('click', () => {
      openTrucoScoreboard({
        nameA: getTeamDisplayName(match.teamA),
        nameB: getTeamDisplayName(match.teamB),
        linkedMatch: null,
      });
    });
    header.appendChild(trucoBtn);

    const grid = document.createElement('div');
    grid.className = 'match-grid';

    const vsPill = document.createElement('div');
    vsPill.className = 'vs-pill';
    vsPill.textContent = 'VS';

    grid.appendChild(createTeamElement(match.teamA));
    grid.appendChild(vsPill);
    grid.appendChild(createTeamElement(match.teamB));

    card.appendChild(header);
    card.appendChild(grid);
    matchesList.appendChild(card);
  });

  // Equipo en espera (si cantidad impar de equipos)
  if (state.lastDraw.waitingTeam) {
    waitingTeamBox.hidden = false;
    waitingTeamContent.innerHTML = '';
    waitingTeamContent.appendChild(createTeamElement(state.lastDraw.waitingTeam));
  } else {
    waitingTeamBox.hidden = true;
  }

  // Jugadores en el banco (suplentes)
  if (state.lastDraw.benchPlayers && state.lastDraw.benchPlayers.length > 0) {
    benchPlayersBox.hidden = false;
    benchTeamSize.textContent = state.lastDraw.teamSize;
    benchPlayersList.innerHTML = '';
    state.lastDraw.benchPlayers.forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'bench-chip';
      chip.textContent = p.name;
      benchPlayersList.appendChild(chip);
    });
  } else {
    benchPlayersBox.hidden = true;
  }

  // Mostrar configuración de torneo si hay al menos 2 equipos
  if (state.lastDraw.teams.length >= 2) {
    tournamentSetupBox.hidden = false;
    syncTournamentSetupOptions();
  } else {
    tournamentSetupBox.hidden = true;
  }
}

async function copySummaryToClipboard() {
  if (!state.lastDraw) return;

  const { teamSize, matches, waitingTeam, benchPlayers } = state.lastDraw;
  const lines = [];
  lines.push(`🏆 *SORTEO DE PARTIDOS (${teamSize} vs ${teamSize})* 🏆`);
  lines.push('');

  const formatTeam = (team) => {
    const names = team.members.map(m => m.name).join(' y ');
    const clubStr = (state.assignClubs && team.club) ? ` [${team.club}]` : '';
    return `${names}${clubStr}`;
  };

  matches.forEach(m => {
    lines.push(`⚽ *Partido ${m.matchNumber}:*`);
    lines.push(`🔵 ${formatTeam(m.teamA)}`);
    lines.push(`   *VS*`);
    lines.push(`🔴 ${formatTeam(m.teamB)}`);
    lines.push('');
  });

  if (waitingTeam) {
    lines.push(`⏳ *Juega contra el ganador:* ${formatTeam(waitingTeam)}`);
    lines.push('');
  }

  if (benchPlayers && benchPlayers.length > 0) {
    lines.push(`🪑 *Al banco / Suplentes:* ${benchPlayers.map(p => p.name).join(', ')}`);
  }

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    const originalText = btnCopyWhatsapp.textContent;
    btnCopyWhatsapp.textContent = '✅ ¡Copiado!';
    setTimeout(() => {
      btnCopyWhatsapp.textContent = originalText;
    }, 2000);
  } catch {
    showAlert('No se pudo copiar automáticamente al portapapeles.');
  }
}
