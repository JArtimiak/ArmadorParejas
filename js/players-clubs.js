// ==========================================
// 2. GESTIÓN DE JUGADORES Y CLUBES / PRESETS
// ==========================================

function syncControlsWithState() {
  const isCustomOrFootball = state.splitTwoTeams || (state.teamSize !== 1 && state.teamSize !== 2 && state.teamSize !== 3);

  modeButtons.forEach(btn => {
    const isMatch = !state.splitTwoTeams && Number(btn.dataset.size) === state.teamSize;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-pressed', String(isMatch));
  });

  // Sincronizar botón de Fútbol / Cancha
  btnFootballDropdown.classList.toggle('active', isCustomOrFootball);
  btnFootballDropdown.setAttribute('aria-pressed', String(isCustomOrFootball));

  if (state.splitTwoTeams) {
    const effSize = getEffectiveTeamSize();
    footballBtnBadge.textContent = '⚡ 2 Equipos';
    footballBtnDesc.textContent = `Mitad y mitad (${effSize}v${effSize})`;
  } else if (state.teamSize === 5) {
    footballBtnBadge.textContent = '⚽ 5 vs 5';
    footballBtnDesc.textContent = 'Fútbol 5';
  } else if (state.teamSize === 7) {
    footballBtnBadge.textContent = '⚽ 7 vs 7';
    footballBtnDesc.textContent = 'Fútbol 7';
  } else if (state.teamSize === 8) {
    footballBtnBadge.textContent = '⚽ 8 vs 8';
    footballBtnDesc.textContent = 'Fútbol 8';
  } else if (state.teamSize === 11) {
    footballBtnBadge.textContent = '⚽ 11 vs 11';
    footballBtnDesc.textContent = 'Fútbol 11';
  } else if (isCustomOrFootball) {
    footballBtnBadge.textContent = `⚽ ${state.teamSize} vs ${state.teamSize}`;
    footballBtnDesc.textContent = 'Personalizado';
  } else {
    footballBtnBadge.textContent = '⚽ Cancha ▾';
    footballBtnDesc.textContent = 'Fútbol & Custom';
  }

  // Marcar opción seleccionada en el menú desplegable
  footballOptButtons.forEach(btn => {
    let isSelected = false;
    if (btn.dataset.mode === 'split_two' && state.splitTwoTeams) isSelected = true;
    else if (!state.splitTwoTeams && Number(btn.dataset.size) === state.teamSize) isSelected = true;
    btn.classList.toggle('is-selected', isSelected);
  });

  toggleClubs.checked = state.assignClubs;
  clubsConfigPanel.hidden = !state.assignClubs;
  presetSelect.value = state.currentPresetKey;
  chkNoRepeatClubs.checked = state.noRepeatClubs;
  updateActiveClubsCounter();
}

function updateActiveClubsCounter() {
  const list = state.customPresets[state.currentPresetKey] || [];
  activeClubsCount.textContent = list.length;
}

function renderPlayers() {
  playerListEl.innerHTML = '';

  state.players.forEach(player => {
    const li = document.createElement('li');
    li.className = `player-chip${player.active ? '' : ' inactive'}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-chip-name';
    nameSpan.textContent = player.name;
    nameSpan.title = player.active
      ? 'Clic para desactivar (no juega hoy)'
      : 'Clic para activar';
    nameSpan.addEventListener('click', () => togglePlayerActive(player.id));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'player-chip-remove';
    removeBtn.setAttribute('aria-label', `Eliminar a ${player.name}`);
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => removePlayer(player.id));

    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    playerListEl.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const activePlayers = state.players.filter(p => p.active);
  const count = activePlayers.length;
  const effectiveSize = getEffectiveTeamSize();
  const totalTeams = Math.floor(count / effectiveSize);
  const totalMatches = Math.floor(totalTeams / 2);
  const benchCount = count % effectiveSize;

  statActiveCount.textContent = count;
  statTeamsCount.textContent = totalTeams;
  statMatchesCount.textContent = totalMatches;
  statBenchCount.textContent = benchCount;

  if (state.splitTwoTeams) {
    footballBtnDesc.textContent = `Mitad y mitad (${effectiveSize}v${effectiveSize})`;
  }

  if (effectiveSize === 1) {
    statTeamsLabel.textContent = 'Jugadores';
  } else if (effectiveSize === 2) {
    statTeamsLabel.textContent = 'Parejas';
  } else if (effectiveSize === 3) {
    statTeamsLabel.textContent = 'Tríos';
  } else {
    statTeamsLabel.textContent = 'Equipos';
  }
}

function addPlayersFromString(rawInput) {
  const names = rawInput
    .split(',')
    .map(n => n.trim())
    .filter(Boolean);

  if (names.length === 0) return;

  let added = false;
  names.forEach(name => {
    const exists = state.players.some(
      p => p.name.toLowerCase() === name.toLowerCase()
    );
    if (!exists) {
      state.players.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        name,
        active: true,
      });
      added = true;
    }
  });

  if (added) {
    hideAlert();
    saveState();
    renderPlayers();
  }
}

function togglePlayerActive(id) {
  const player = state.players.find(p => p.id === id);
  if (!player) return;
  player.active = !player.active;
  saveState();
  renderPlayers();
}

function removePlayer(id) {
  state.players = state.players.filter(p => p.id !== id);
  saveState();
  renderPlayers();
}

function assignClubsToTeams() {
  if (!state.lastDraw || !state.lastDraw.teams) return;

  const pool = state.customPresets[state.currentPresetKey] || [];
  if (pool.length === 0) {
    state.lastDraw.teams.forEach(team => {
      team.club = 'Sin clubes en la lista';
    });
    return;
  }

  let available = shuffleArray(pool);

  state.lastDraw.teams.forEach(team => {
    if (state.noRepeatClubs) {
      if (available.length === 0) {
        available = shuffleArray(pool);
      }
      team.club = available.pop();
    } else {
      const randomIndex = Math.floor(Math.random() * pool.length);
      team.club = pool[randomIndex];
    }
  });
}

function rerollSingleTeamClub(teamId) {
  if (!state.lastDraw) return;
  const pool = state.customPresets[state.currentPresetKey] || [];
  if (pool.length === 0) return;

  const targetTeam = state.lastDraw.teams.find(t => t.id === teamId);
  if (!targetTeam) return;

  const usedClubs = new Set(
    state.lastDraw.teams
      .filter(t => t.id !== teamId)
      .map(t => t.club)
  );

  let candidates = pool.filter(c => c !== targetTeam.club);
  if (state.noRepeatClubs) {
    const nonRepeated = candidates.filter(c => !usedClubs.has(c));
    if (nonRepeated.length > 0) {
      candidates = nonRepeated;
    }
  }

  if (candidates.length === 0) candidates = pool;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  targetTeam.club = candidates[randomIndex];

  saveState();
  renderDrawResults();
  if (state.tournament) renderTournament();
}

function renderClubsModal() {
  const presetKey = state.currentPresetKey;
  const clubs = state.customPresets[presetKey] || [];

  const selectedOption = presetSelect.options[presetSelect.selectedIndex];
  dialogPresetName.textContent = selectedOption ? selectedOption.textContent : 'Categoría actual';

  clubsModalList.innerHTML = '';

  clubs.forEach((clubName, idx) => {
    const li = document.createElement('li');
    li.className = 'player-chip';

    const span = document.createElement('span');
    span.className = 'player-chip-name';
    span.textContent = clubName;
    span.title = 'Clic para quitar este club';
    span.addEventListener('click', () => removeClubFromPreset(idx));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'player-chip-remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => removeClubFromPreset(idx));

    li.appendChild(span);
    li.appendChild(removeBtn);
    clubsModalList.appendChild(li);
  });

  updateActiveClubsCounter();
}

function removeClubFromPreset(index) {
  const list = state.customPresets[state.currentPresetKey];
  if (!list) return;
  list.splice(index, 1);
  saveState();
  renderClubsModal();
}

function addClubsToPreset(rawInput) {
  const names = rawInput
    .split(',')
    .map(n => n.trim())
    .filter(Boolean);

  if (names.length === 0) return;

  const list = state.customPresets[state.currentPresetKey];
  names.forEach(club => {
    const exists = list.some(c => c.toLowerCase() === club.toLowerCase());
    if (!exists) list.push(club);
  });

  saveState();
  renderClubsModal();
}

function setTeamManualClub(teamId, newClubName) {
  if (!state.lastDraw || !state.lastDraw.teams) return;
  const team = state.lastDraw.teams.find(t => t.id === teamId);
  if (team) {
    team.club = newClubName;
    saveState();
    renderDrawResults();
    if (state.tournament) renderTournament();
  }
}

function swapDrawPlayers(sourceMemberId, targetMemberId) {
  if (!state.lastDraw || !state.lastDraw.teams) return;
  const { teams, waitingTeam, benchPlayers } = state.lastDraw;

  let sourceHolder = null;
  let sourceIndex = -1;
  let targetHolder = null;
  let targetIndex = -1;

  const findInArray = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((m, idx) => {
      if (m.id === sourceMemberId) { sourceHolder = arr; sourceIndex = idx; }
      if (m.id === targetMemberId) { targetHolder = arr; targetIndex = idx; }
    });
  };

  teams.forEach(t => findInArray(t.members));
  if (waitingTeam) findInArray(waitingTeam.members);
  findInArray(benchPlayers);

  if (sourceHolder && targetHolder && sourceIndex !== -1 && targetIndex !== -1) {
    const temp = sourceHolder[sourceIndex];
    sourceHolder[sourceIndex] = targetHolder[targetIndex];
    targetHolder[targetIndex] = temp;

    if (state.lastDraw.matches) {
      state.lastDraw.matches.forEach(m => {
        const foundA = teams.find(t => t.id === m.teamA.id);
        const foundB = teams.find(t => t.id === m.teamB.id);
        if (foundA) m.teamA = foundA;
        if (foundB) m.teamB = foundB;
      });
    }

    if (state.tournament && Array.isArray(state.tournament.teams)) {
      state.tournament.teams = JSON.parse(JSON.stringify(teams));
    }

    saveState();
    renderDrawResults();
    if (state.tournament) renderTournament();
  }
}
