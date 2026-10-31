// ==========================================
// 4. MOTOR DE TORNEO (FASE DE GRUPOS Y CUADRO ELIMINATORIO)
// ==========================================

function getTeamDisplayName(team) {
  return team ? team.members.map(m => m.name).join(' / ') : 'Por definir';
}

function getTeamClubLabel(team) {
  return (team && state.assignClubs && team.club) ? team.club : '';
}

function syncTournamentSetupOptions() {
  if (!state.lastDraw || !state.lastDraw.teams) return;
  const numTeams = state.lastDraw.teams.length;
  const format = tournamentFormatSelect.value;

  groupCountField.hidden = format === 'knockout' || numTeams < 4;
  qualifiersField.hidden = format === 'knockout' || format === 'groups';
  if (numTeams < 4) groupCountSelect.value = '1';
}

// Algoritmo Round-Robin (todos contra todos por fechas)
function generateRoundRobinRounds(groupTeams, groupId) {
  const list = [...groupTeams];
  if (list.length % 2 !== 0) list.push(null); // Fecha libre (BYE)

  const n = list.length;
  const totalRounds = n - 1;
  const half = n / 2;
  const rounds = [];

  for (let r = 0; r < totalRounds; r++) {
    const matches = [];
    let byeTeamId = null;
    for (let i = 0; i < half; i++) {
      const teamA = list[i];
      const teamB = list[n - 1 - i];
      if (teamA && teamB) {
        matches.push({ id: `${groupId}-R${r + 1}-M${i + 1}`, teamAId: teamA.id, teamBId: teamB.id, scoreA: null, scoreB: null });
      } else if (teamA || teamB) {
        byeTeamId = (teamA || teamB).id;
      }
    }
    rounds.push({ roundNumber: r + 1, matches, byeTeamId });
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

function createGroupsStage(teams, groupCount) {
  const actualGroups = Math.min(groupCount, Math.max(1, Math.floor(teams.length / 2)));
  if (actualGroups <= 1) {
    return [{ id: 'A', name: 'Grupo Único (Todos contra todos)', teamIds: teams.map(t => t.id), rounds: generateRoundRobinRounds(teams, 'A') }];
  }

  const letters = ['A', 'B', 'C', 'D'];
  const buckets = Array.from({ length: actualGroups }, () => []);
  teams.forEach((team, idx) => buckets[idx % actualGroups].push(team));

  return buckets.map((bucketTeams, idx) => {
    const letter = letters[idx] || String(idx + 1);
    return { id: letter, name: `Zona ${letter}`, teamIds: bucketTeams.map(t => t.id), rounds: generateRoundRobinRounds(bucketTeams, letter) };
  });
}

function computeGroupStandings(group, teamsMap) {
  const stats = {};
  group.teamIds.forEach(id => {
    stats[id] = { teamId: id, team: teamsMap[id], pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  });

  group.rounds.forEach(round => {
    round.matches.forEach(m => {
      if (m.scoreA !== null && m.scoreB !== null && !Number.isNaN(m.scoreA) && !Number.isNaN(m.scoreB)) {
        const sA = stats[m.teamAId];
        const sB = stats[m.teamBId];
        if (!sA || !sB) return;

        sA.pj += 1; sB.pj += 1;
        sA.gf += m.scoreA; sA.gc += m.scoreB;
        sB.gf += m.scoreB; sB.gc += m.scoreA;

        if (m.scoreA > m.scoreB) { sA.pg += 1; sA.pts += 3; sB.pp += 1; }
        else if (m.scoreA < m.scoreB) { sB.pg += 1; sB.pts += 3; sA.pp += 1; }
        else { sA.pe += 1; sB.pe += 1; sA.pts += 1; sB.pts += 1; }
      }
    });
  });

  return Object.values(stats)
    .map(item => ({ ...item, dg: item.gf - item.gc }))
    .sort((a, b) => (b.pts - a.pts) || (b.dg - a.dg) || (b.gf - a.gf) || (a.teamId - b.teamId));
}

function getRoundTitle(matchesCount) {
  if (matchesCount === 1) return 'Final';
  if (matchesCount === 2) return 'Semifinales';
  if (matchesCount === 4) return 'Cuartos de Final';
  if (matchesCount === 8) return 'Octavos de Final';
  return `Ronda de ${matchesCount * 2}`;
}

function createKnockoutBracket(seededTeams) {
  let size = 2;
  while (size < seededTeams.length) size *= 2;
  if (size > 16) size = 16;

  const teamsToUse = seededTeams.slice(0, size);
  const totalRounds = Math.log2(size);
  const rounds = [];
  const firstRoundMatchesCount = size / 2;
  const firstRoundMatches = [];

  for (let i = 0; i < firstRoundMatchesCount; i++) {
    const teamA = teamsToUse[i] || null;
    const teamB = teamsToUse[size - 1 - i] || null;
    firstRoundMatches.push({
      id: `R0-M${i}`, roundIndex: 0, matchIndex: i,
      teamAId: teamA ? teamA.id : null, teamBId: teamB ? teamB.id : null,
      scoreA: null, scoreB: null, winnerId: null, isBye: false,
    });
  }
  rounds.push({ name: getRoundTitle(firstRoundMatchesCount), matches: firstRoundMatches });

  for (let r = 1; r < totalRounds; r++) {
    const mCount = size / Math.pow(2, r + 1);
    const rMatches = Array.from({ length: mCount }, (_, i) => ({
      id: `R${r}-M${i}`, roundIndex: r, matchIndex: i,
      teamAId: null, teamBId: null, scoreA: null, scoreB: null, winnerId: null, isBye: false,
    }));
    rounds.push({ name: getRoundTitle(mCount), matches: rMatches });
  }

  const bracket = { rounds };
  propagateBracketWinners(bracket);
  return bracket;
}

function evaluateMatchWinner(match) {
  if (match.isBye) return match.winnerId;
  if (match.scoreA !== null && match.scoreB !== null && !Number.isNaN(match.scoreA) && !Number.isNaN(match.scoreB)) {
    if (match.scoreA > match.scoreB) return match.teamAId;
    if (match.scoreB > match.scoreA) return match.teamBId;
  }
  if (match.winnerId && (match.winnerId === match.teamAId || match.winnerId === match.teamBId)) return match.winnerId;
  return null;
}

function propagateBracketWinners(bracket) {
  if (!bracket || !bracket.rounds) return;

  bracket.rounds[0].matches.forEach(m => {
    if (m.teamAId && !m.teamBId) { m.isBye = true; m.winnerId = m.teamAId; }
    else if (!m.teamAId && m.teamBId) { m.isBye = true; m.winnerId = m.teamBId; }
    else { m.isBye = false; m.winnerId = evaluateMatchWinner(m); }
  });

  for (let r = 0; r < bracket.rounds.length - 1; r++) {
    const currentRound = bracket.rounds[r];
    const nextRound = bracket.rounds[r + 1];

    currentRound.matches.forEach((m, idx) => {
      if (!m.isBye) m.winnerId = evaluateMatchWinner(m);
      const nextMatch = nextRound.matches[Math.floor(idx / 2)];
      if (idx % 2 === 0 && nextMatch.teamAId !== m.winnerId) {
        nextMatch.teamAId = m.winnerId;
        nextMatch.winnerId = null;
      } else if (idx % 2 !== 0 && nextMatch.teamBId !== m.winnerId) {
        nextMatch.teamBId = m.winnerId;
        nextMatch.winnerId = null;
      }
    });
    nextRound.matches.forEach(nm => { nm.winnerId = evaluateMatchWinner(nm); });
  }
}

function startTournamentFromDraw() {
  if (!state.lastDraw || !state.lastDraw.teams || state.lastDraw.teams.length < 2) {
    showAlert('Primero sorteá las parejas/equipos (mínimo 2 equipos) para iniciar un torneo.');
    return;
  }

  const format = tournamentFormatSelect.value;
  const groupCount = Number(groupCountSelect.value) || 1;
  const advanceCount = Number(qualifiersSelect.value) || 4;
  const teams = JSON.parse(JSON.stringify(state.lastDraw.teams));

  state.tournament = {
    format, groupCount, advanceCount, teams,
    groups: (format === 'groups' || format === 'both') ? createGroupsStage(teams, groupCount) : null,
    bracket: format === 'knockout' ? createKnockoutBracket(teams) : null,
    createdAt: Date.now(),
  };

  saveState();
  renderTournament();
  tournamentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function advanceGroupsToKnockout() {
  if (!state.tournament || !state.tournament.groups) return;
  const t = state.tournament;
  const teamsMap = Object.fromEntries(t.teams.map(team => [team.id, team]));
  const targetCount = Math.min(t.advanceCount || 4, t.teams.length);
  const perGroup = Math.max(1, Math.ceil(targetCount / t.groups.length));
  const seededTeams = [];

  t.groups.forEach(g => {
    computeGroupStandings(g, teamsMap).slice(0, perGroup).forEach(s => seededTeams.push(s.team));
  });

  t.bracket = createKnockoutBracket(seededTeams.slice(0, targetCount));
  saveState();
  renderTournament();
  knockoutStageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGroupStandingsIntoWrapper(tableContainer, group, teamsMap, highlightTopCount) {
  const standings = computeGroupStandings(group, teamsMap);
  tableContainer.className = 'table-wrapper';
  tableContainer.innerHTML = `
    <table class="standings-table">
      <caption>Tabla de posiciones de ${group.name}</caption>
      <thead>
        <tr>
          <th scope="col">Equipo / Pareja</th>
          <th scope="col" title="Partidos Jugados">PJ</th><th scope="col" title="Ganados">G</th>
          <th scope="col" title="Empatados">E</th><th scope="col" title="Perdidos">P</th>
          <th scope="col" title="Goles a Favor">GF</th><th scope="col" title="Goles en Contra">GC</th>
          <th scope="col" title="Diferencia">DG</th><th scope="col" title="Puntos">PTS</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((row, idx) => {
          const isQualified = highlightTopCount > 0 && idx < highlightTopCount;
          const clubLabel = getTeamClubLabel(row.team);
          const dgFormatted = row.dg > 0 ? `+${row.dg}` : row.dg;
          return `
            <tr class="${isQualified ? 'qualified-row' : ''}">
              <th scope="row">
                <span class="standings-pos">${idx + 1}</span><span>${getTeamDisplayName(row.team)}</span>
                ${clubLabel ? `<span class="standings-club-sub">🛡️ ${clubLabel}</span>` : ''}
              </th>
              <td>${row.pj}</td><td>${row.pg}</td><td>${row.pe}</td><td>${row.pp}</td>
              <td>${row.gf}</td><td>${row.gc}</td><td>${dgFormatted}</td><td class="pts-cell">${row.pts}</td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function updateChampionBanner(teamsMap) {
  const t = state.tournament;
  if (!t) return;
  let championTeam = null;

  if (t.bracket && t.bracket.rounds && t.bracket.rounds.length > 0) {
    const finalMatch = t.bracket.rounds[t.bracket.rounds.length - 1].matches[0];
    if (finalMatch && finalMatch.winnerId) championTeam = teamsMap[finalMatch.winnerId];
  } else if (t.format === 'groups' && t.groups && t.groups.length === 1) {
    const allMatches = t.groups[0].rounds.flatMap(r => r.matches);
    if (allMatches.length > 0 && allMatches.every(m => m.scoreA !== null && m.scoreB !== null)) {
      const standings = computeGroupStandings(t.groups[0], teamsMap);
      if (standings.length > 0) championTeam = standings[0].team;
    }
  }

  championBanner.hidden = !championTeam;
  if (championTeam) {
    championTeamName.textContent = getTeamDisplayName(championTeam);
    const club = getTeamClubLabel(championTeam);
    championClubName.textContent = club ? `🛡️ ${club}` : '';
  }
}

function createBracketTeamRow(match, side, team, bracket) {
  const row = document.createElement('div');
  const teamId = team ? team.id : null;
  const isWinner = Boolean(match.winnerId && teamId && match.winnerId === teamId);
  row.className = `bracket-team-row${isWinner ? ' winner' : ''}`;

  const info = document.createElement('div');
  info.className = 'bracket-team-info';
  const club = getTeamClubLabel(team);
  info.innerHTML = `
    <div class="bracket-team-name">${team ? getTeamDisplayName(team) : (match.isBye ? 'Libre (BYE)' : 'Por definir...')}</div>
    ${club ? `<div class="bracket-team-club">🛡️ ${club}</div>` : ''}
  `;

  const controls = document.createElement('div');
  controls.className = 'bracket-controls';

  if (!match.isBye && match.teamAId && match.teamBId) {
    const scoreInput = document.createElement('input');
    scoreInput.type = 'number';
    scoreInput.min = '0';
    scoreInput.max = '99';
    scoreInput.placeholder = '-';
    scoreInput.className = 'score-input';
    const currentScore = side === 'A' ? match.scoreA : match.scoreB;
    scoreInput.value = currentScore !== null ? currentScore : '';

    scoreInput.addEventListener('input', () => {
      const val = scoreInput.value.trim() === '' ? null : Math.max(0, parseInt(scoreInput.value.trim(), 10));
      if (side === 'A') match.scoreA = val; else match.scoreB = val;
      if (match.scoreA !== null && match.scoreB !== null && match.scoreA !== match.scoreB) {
        match.winnerId = match.scoreA > match.scoreB ? match.teamAId : match.teamBId;
      } else if (match.scoreA === null || match.scoreB === null) {
        match.winnerId = null;
      }
      propagateBracketWinners(bracket);
      saveState();
      renderTournament();
    });

    const winBtn = document.createElement('button');
    winBtn.type = 'button';
    winBtn.className = 'btn-pick-winner';
    winBtn.title = 'Marcar como ganador de la llave';
    winBtn.textContent = isWinner ? '✓ Ganó' : '✓';
    winBtn.addEventListener('click', () => {
      match.winnerId = match.winnerId === teamId ? null : teamId;
      propagateBracketWinners(bracket);
      saveState();
      renderTournament();
    });
    controls.append(scoreInput, winBtn);
  }

  row.append(info, controls);
  return row;
}

function renderBracketColumns(bracket, teamsMap) {
  bracketWrapper.innerHTML = '';

  bracket.rounds.forEach(round => {
    const col = document.createElement('div');
    col.className = 'bracket-round-col';
    col.innerHTML = `<div class="bracket-round-header">${round.name}</div>`;

    const matchesListEl = document.createElement('div');
    matchesListEl.className = 'bracket-matches-col';

    round.matches.forEach((m, idx) => {
      const card = document.createElement('div');
      card.className = 'bracket-match-card';

      const header = document.createElement('div');
      header.className = 'bracket-match-label';
      header.innerHTML = `<span>Llave #${idx + 1}</span>`;

      if (m.isBye) {
        header.innerHTML += `<span>PASE DIRECTO</span>`;
      } else if (!state.assignClubs && m.teamAId && m.teamBId) {
        const trucoBtn = document.createElement('button');
        trucoBtn.type = 'button';
        trucoBtn.className = 'btn-open-truco-inline';
        trucoBtn.innerHTML = '🃏 Truco';
        trucoBtn.addEventListener('click', () => openTrucoScoreboard({
          nameA: getTeamDisplayName(teamsMap[m.teamAId]),
          nameB: getTeamDisplayName(teamsMap[m.teamBId]),
          scoreA: m.scoreA || 0,
          scoreB: m.scoreB || 0,
          linkedMatch: { type: 'bracket', roundIndex: m.roundIndex, matchId: m.id },
        }));
        header.appendChild(trucoBtn);
      }

      const teamA = m.teamAId ? teamsMap[m.teamAId] : null;
      const teamB = m.teamBId ? teamsMap[m.teamBId] : null;
      card.append(header, createBracketTeamRow(m, 'A', teamA, bracket), createBracketTeamRow(m, 'B', teamB, bracket));
      matchesListEl.appendChild(card);
    });

    col.appendChild(matchesListEl);
    bracketWrapper.appendChild(col);
  });
}

function renderTournament() {
  if (!state.tournament) {
    tournamentSection.hidden = true;
    return;
  }

  tournamentSection.hidden = false;
  const t = state.tournament;
  const teamsMap = Object.fromEntries(t.teams.map(team => [team.id, team]));
  const formatLabels = { both: 'Grupos + Eliminatorias', groups: 'Liga (Fase de Grupos)', knockout: 'Eliminación Directa' };
  tournamentModeBadge.textContent = `${formatLabels[t.format] || 'Torneo'} (${t.teams.length} eq.)`;

  if (t.groups && t.groups.length > 0) {
    groupStageContainer.hidden = false;
    groupsWrapper.innerHTML = '';
    const highlightPerGroup = (t.format === 'both' || t.format === 'groups_knockout')
      ? Math.max(1, Math.ceil((t.advanceCount || 4) / t.groups.length))
      : 1;

    t.groups.forEach(group => {
      const card = document.createElement('div');
      card.className = 'group-card';
      card.innerHTML = `<div class="group-card-title"><span>📋 ${group.name}</span> <span>${group.teamIds.length} equipos</span></div>`;

      const tableWrapper = document.createElement('div');
      renderGroupStandingsIntoWrapper(tableWrapper, group, teamsMap, highlightPerGroup);
      card.appendChild(tableWrapper);

      const fixtureList = document.createElement('div');
      fixtureList.className = 'fixture-rounds';

      group.rounds.forEach(round => {
        const roundCard = document.createElement('div');
        roundCard.className = 'fixture-round-card';
        roundCard.innerHTML = `<div class="fixture-round-title">Fecha ${round.roundNumber}</div>`;

        const matchesContainer = document.createElement('div');
        matchesContainer.className = 'fixture-matches-list';

        round.matches.forEach(m => {
          const teamA = teamsMap[m.teamAId];
          const teamB = teamsMap[m.teamBId];
          const clubA = getTeamClubLabel(teamA);
          const clubB = getTeamClubLabel(teamB);

          const row = document.createElement('div');
          row.className = 'fixture-match-row';
          row.innerHTML = `
            <div class="fixture-team">
              <span>${getTeamDisplayName(teamA)}</span>
              ${clubA ? `<span class="fixture-team-club">🛡️ ${clubA}</span>` : ''}
            </div>
            <div class="fixture-score-box">
              <input type="number" min="0" max="99" class="score-input score-a" placeholder="-" value="${m.scoreA !== null ? m.scoreA : ''}">
              <span>-</span>
              <input type="number" min="0" max="99" class="score-input score-b" placeholder="-" value="${m.scoreB !== null ? m.scoreB : ''}">
              ${!state.assignClubs ? '<button type="button" class="btn-open-truco-inline" title="Anotar con el Anotador de Truco">🃏</button>' : ''}
            </div>
            <div class="fixture-team away">
              <span>${getTeamDisplayName(teamB)}</span>
              ${clubB ? `<span class="fixture-team-club">🛡️ ${clubB}</span>` : ''}
            </div>`;

          const inputA = row.querySelector('.score-a');
          const inputB = row.querySelector('.score-b');
          const onScoreInput = () => {
            m.scoreA = inputA.value.trim() === '' ? null : Math.max(0, parseInt(inputA.value, 10));
            m.scoreB = inputB.value.trim() === '' ? null : Math.max(0, parseInt(inputB.value, 10));
            saveState();
            renderGroupStandingsIntoWrapper(tableWrapper, group, teamsMap, highlightPerGroup);
            updateChampionBanner(teamsMap);
          };

          inputA.addEventListener('input', onScoreInput);
          inputB.addEventListener('input', onScoreInput);
          const trucoQuickBtn = row.querySelector('.btn-open-truco-inline');
          if (trucoQuickBtn) {
            trucoQuickBtn.addEventListener('click', () => openTrucoScoreboard({
              nameA: getTeamDisplayName(teamA), nameB: getTeamDisplayName(teamB),
              scoreA: m.scoreA || 0, scoreB: m.scoreB || 0,
              linkedMatch: { type: 'group', groupId: group.id, matchId: m.id },
            }));
          }
          matchesContainer.appendChild(row);
        });

        roundCard.appendChild(matchesContainer);
        if (round.byeTeamId && teamsMap[round.byeTeamId]) {
          roundCard.insertAdjacentHTML('beforeend', `<div class="fixture-bye-note">⏳ Libre en esta fecha: ${getTeamDisplayName(teamsMap[round.byeTeamId])}</div>`);
        }
        fixtureList.appendChild(roundCard);
      });

      card.appendChild(fixtureList);
      groupsWrapper.appendChild(card);
    });

    btnAdvanceToKnockout.hidden = !(t.format === 'both' || t.format === 'groups_knockout');
  } else {
    groupStageContainer.hidden = true;
  }

  if (t.bracket && t.bracket.rounds) {
    knockoutStageContainer.hidden = false;
    renderBracketColumns(t.bracket, teamsMap);
  } else {
    knockoutStageContainer.hidden = true;
  }
  updateChampionBanner(teamsMap);
}

async function copyTournamentToClipboard() {
  if (!state.tournament) return;
  const t = state.tournament;
  const teamsMap = Object.fromEntries(t.teams.map(team => [team.id, team]));
  const lines = ['🏆 *SEGUIMIENTO DEL TORNEO* 🏆', ''];
  const formatTeamFull = (team) => team ? `${getTeamDisplayName(team)}${getTeamClubLabel(team) ? ` [${getTeamClubLabel(team)}]` : ''}` : 'Por definir';

  if (t.groups && t.groups.length > 0) {
    t.groups.forEach(g => {
      lines.push(`📋 *${g.name.toUpperCase()} - TABLA:*`);
      computeGroupStandings(g, teamsMap).forEach((s, idx) => {
        lines.push(`${idx + 1}. ${formatTeamFull(s.team)} — *${s.pts} pts* (PJ:${s.pj} | DG:${s.dg > 0 ? `+${s.dg}` : s.dg})`);
      });
      lines.push('');
    });
  }

  if (t.bracket && t.bracket.rounds) {
    lines.push('⚔️ *CUADRO ELIMINATORIO:*');
    t.bracket.rounds.forEach(r => {
      lines.push(`*— ${r.name} —*`);
      r.matches.forEach(m => {
        const tA = m.teamAId ? formatTeamFull(teamsMap[m.teamAId]) : 'TBD';
        const tB = m.teamBId ? formatTeamFull(teamsMap[m.teamBId]) : 'TBD';
        if (m.isBye) lines.push(`• ${tA} (Pase libre)`);
        else {
          const sA = m.scoreA !== null ? m.scoreA : '-';
          const sB = m.scoreB !== null ? m.scoreB : '-';
          lines.push(`• ${tA}${m.winnerId === m.teamAId ? ' ✅' : ''} (${sA}) vs (${sB}) ${tB}${m.winnerId === m.teamBId ? ' ✅' : ''}`);
        }
      });
      lines.push('');
    });
  }

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    const orig = btnCopyTournament.textContent;
    btnCopyTournament.textContent = '✅ ¡Torneo copiado!';
    setTimeout(() => { btnCopyTournament.textContent = orig; }, 2000);
  } catch {
    showAlert('No se pudo copiar el resumen del torneo.');
  }
}
