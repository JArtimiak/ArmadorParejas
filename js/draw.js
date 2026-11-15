// ==========================================
// 3. SORTEO DE PAREJAS, CRUCES VS Y RESUMEN
// ==========================================

function generateDraw() {
  const activePlayers = state.players.filter(p => p.active);
  const effectiveTeamSize = getEffectiveTeamSize();
  const minPlayersNeeded = effectiveTeamSize * 2;

  if (activePlayers.length < minPlayersNeeded) {
    showAlert(`Necesitás al menos ${minPlayersNeeded} jugadores activos para armar un cruce ${effectiveTeamSize} vs ${effectiveTeamSize}.`);
    return;
  }

  hideAlert();

  // Mezclar jugadores activos
  const shuffledPlayers = shuffleArray(activePlayers);
  const totalTeams = Math.floor(shuffledPlayers.length / effectiveTeamSize);

  const teams = [];
  for (let i = 0; i < totalTeams; i++) {
    const members = shuffledPlayers.slice(i * effectiveTeamSize, (i + 1) * effectiveTeamSize);
    teams.push({
      id: i + 1,
      members,
      club: null,
    });
  }

  // Jugadores que sobran sin completar equipo
  const benchPlayers = shuffledPlayers.slice(totalTeams * effectiveTeamSize);

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
    teamSize: effectiveTeamSize,
    teams,
    matches,
    waitingTeam,
    benchPlayers,
    timestamp: Date.now(),
  };

  if (state.assignClubs) assignClubsToTeams();
  saveState();

  const resultsHeading = document.getElementById('results-heading');
  if (drawSpinner) drawSpinner.hidden = false;
  btnGenerate.setAttribute('aria-busy', 'true');
  const vt = runViewTransition(() => renderDrawResults(), resultsHeading);
  const finishSpin = () => {
    if (drawSpinner) drawSpinner.hidden = true;
    btnGenerate.removeAttribute('aria-busy');
  };
  if (vt) vt.finished.finally(finishSpin);
  else setTimeout(finishSpin, 180);
  showToast('¡Parejas y cruces sorteados!');
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

    const infoSpan = document.createElement('span');
    infoSpan.className = 'member-info';
    infoSpan.innerHTML = `<span aria-hidden="true">${state.lastDraw.teamSize === 1 ? '👤' : '🎮'}</span> <span>${member.name}</span>`;

    const swapBtn = document.createElement('button');
    swapBtn.type = 'button';
    swapBtn.className = 'btn-swap-member';
    swapBtn.title = `Intercambiar a ${member.name} con otro jugador`;
    swapBtn.textContent = '⇄';
    swapBtn.addEventListener('click', () => renderMemberSwapSelect(row, member, team));

    row.append(infoSpan, swapBtn);
    membersDiv.appendChild(row);
  });
  topDiv.appendChild(membersDiv);
  box.appendChild(topDiv);

  if (state.assignClubs && team.club) {
    const clubRow = document.createElement('div');
    clubRow.className = 'club-badge-row';

    const clubBtn = document.createElement('button');
    clubBtn.type = 'button';
    clubBtn.className = 'club-name-btn';
    clubBtn.title = 'Hacé clic para elegir otro club a mano';
    clubBtn.innerHTML = `<span aria-hidden="true">🛡️</span> <span class="club-text">${team.club}</span> <span class="club-edit-pen" aria-hidden="true">✏️</span>`;
    clubBtn.addEventListener('click', () => renderClubManualSelect(clubRow, team));

    const rerollBtn = document.createElement('button');
    rerollBtn.type = 'button';
    rerollBtn.className = 'btn-reroll-single';
    rerollBtn.title = 'Sortear otro club al azar para este equipo';
    rerollBtn.textContent = '🔄';
    rerollBtn.addEventListener('click', () => rerollSingleTeamClub(team.id));

    clubRow.append(clubBtn, rerollBtn);
    box.appendChild(clubRow);
  }

  return box;
}

function renderMemberSwapSelect(row, member, currentTeam) {
  const container = document.createElement('div');
  container.className = 'member-swap-form';

  const select = document.createElement('select');
  select.className = 'member-swap-select';
  select.setAttribute('aria-label', `Elegir reemplazo para ${member.name}`);

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Intercambiar a ${member.name} con...`;
  select.appendChild(defaultOption);

  if (state.lastDraw && state.lastDraw.teams) {
    state.lastDraw.teams.forEach(otherTeam => {
      const typeLabel = state.lastDraw.teamSize === 1 ? 'Jugador' : state.lastDraw.teamSize === 2 ? 'Pareja' : 'Equipo';
      const optGroup = document.createElement('optgroup');
      optGroup.label = otherTeam.id === currentTeam.id ? `${typeLabel} ${otherTeam.id} (Misma pareja)` : `${typeLabel} ${otherTeam.id}`;

      otherTeam.members.forEach(otherMember => {
        if (otherMember.id !== member.id) {
          const opt = document.createElement('option');
          opt.value = otherMember.id;
          opt.textContent = otherMember.name;
          optGroup.appendChild(opt);
        }
      });
      if (optGroup.children.length > 0) select.appendChild(optGroup);
    });
  }

  if (state.lastDraw && state.lastDraw.benchPlayers && state.lastDraw.benchPlayers.length > 0) {
    const benchGroup = document.createElement('optgroup');
    benchGroup.label = 'En el banco (Suplentes)';
    state.lastDraw.benchPlayers.forEach(benchMember => {
      if (benchMember.id !== member.id) {
        const opt = document.createElement('option');
        opt.value = benchMember.id;
        opt.textContent = `${benchMember.name} (Banco)`;
        benchGroup.appendChild(opt);
      }
    });
    if (benchGroup.children.length > 0) select.appendChild(benchGroup);
  }

  select.addEventListener('change', () => {
    if (select.value) swapDrawPlayers(member.id, select.value);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-swap-cancel';
  cancelBtn.textContent = '✕';
  cancelBtn.title = 'Cancelar';
  cancelBtn.addEventListener('click', renderDrawResults);

  container.append(select, cancelBtn);
  row.innerHTML = '';
  row.appendChild(container);
  select.focus();
}

function renderClubManualSelect(clubRow, team) {
  const container = document.createElement('div');
  container.className = 'club-select-form';

  const select = document.createElement('select');
  select.className = 'club-manual-select';
  select.setAttribute('aria-label', `Elegir club para Pareja ${team.id}`);

  const pool = state.customPresets[state.currentPresetKey] || [];
  pool.forEach(clubName => {
    const opt = document.createElement('option');
    opt.value = clubName;
    opt.textContent = clubName;
    if (clubName === team.club) opt.selected = true;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    if (select.value) setTeamManualClub(team.id, select.value);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-swap-cancel';
  cancelBtn.textContent = '✕';
  cancelBtn.title = 'Cancelar';
  cancelBtn.addEventListener('click', renderDrawResults);

  container.append(select, cancelBtn);
  clubRow.innerHTML = '';
  clubRow.appendChild(container);
  select.focus();
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
    card.className = 'match-card vt-card';
    card.style.viewTransitionName = `match-card-${match.matchNumber}`;
    const header = document.createElement('div');
    header.className = 'match-card-header';
    header.innerHTML = `<span>⚽ PARTIDO ${match.matchNumber}</span><span>FORMATO ${modeText}</span>`;
    const grid = document.createElement('div');
    grid.className = 'match-grid';
    const vsPill = document.createElement('div');
    vsPill.className = 'vs-pill';
    vsPill.textContent = 'VS';
    grid.append(createTeamElement(match.teamA), vsPill, createTeamElement(match.teamB));
    card.append(header, grid);
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
      chip.className = 'bench-chip bench-chip-interactive';
      chip.innerHTML = `<span>${p.name}</span> <button type="button" class="btn-swap-member btn-swap-bench" title="Intercambiar a ${p.name} con un titular">⇄</button>`;
      chip.querySelector('.btn-swap-member').addEventListener('click', () => {
        renderMemberSwapSelect(chip, p, { id: 'bench' });
      });
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
    showToast('Resumen de partidos copiado para WhatsApp');
    setTimeout(() => { btnCopyWhatsapp.textContent = originalText; }, 2000);
  } catch {
    showAlert('No se pudo copiar automáticamente al portapapeles.');
  }
}
