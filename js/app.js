// ==========================================
// 6. EVENT LISTENERS E INICIALIZACIÓN DE LA APP
// ==========================================

// Selector de modalidad (1v1, 2v2, 3v3)
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const newSize = Number(btn.dataset.size);
    state.teamSize = newSize;
    syncControlsWithState();
    updateStats();
    hideAlert();
    saveState();
  });
});

// Agregar jugadores
playerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addPlayersFromString(playerInput.value);
  playerInput.value = '';
  playerInput.focus();
});

// Cargar lista de ejemplo
btnLoadDemo.addEventListener('click', () => {
  const sampleNames = ['Leo', 'Julián', 'Enzo', 'Dibu', 'Fideo', 'Cuti', 'Alexis', 'Lautaro'];
  state.players = [];
  addPlayersFromString(sampleNames.join(', '));
});

// Limpiar todos los jugadores
btnClearPlayers.addEventListener('click', () => {
  if (state.players.length === 0) return;
  state.players = [];
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  renderPlayers();
  clearDrawUI();
  renderTournament();
  hideAlert();
});

// Toggle sortear clubes
toggleClubs.addEventListener('change', (e) => {
  state.assignClubs = e.target.checked;
  clubsConfigPanel.hidden = !state.assignClubs;

  if (state.lastDraw) {
    if (state.assignClubs) {
      assignClubsToTeams();
    }
    renderDrawResults();
    renderTournament();
  }
  saveState();
});

// Cambio de preset de clubes
presetSelect.addEventListener('change', (e) => {
  state.currentPresetKey = e.target.value;
  updateActiveClubsCounter();
  if (state.lastDraw && state.assignClubs) {
    assignClubsToTeams();
    renderDrawResults();
    renderTournament();
  }
  saveState();
});

// Evitar clubes repetidos
chkNoRepeatClubs.addEventListener('change', (e) => {
  state.noRepeatClubs = e.target.checked;
  saveState();
});

// Botones principales de sorteo
btnGenerate.addEventListener('click', generateDraw);
btnRerollAll.addEventListener('click', generateDraw);

// Re-sortear solo clubes manteniendo las parejas armadas
btnRerollClubs.addEventListener('click', () => {
  if (!state.lastDraw) return;
  assignClubsToTeams();
  saveState();
  renderDrawResults();
  renderTournament();
});

// Copiar resumen de cruces
btnCopyWhatsapp.addEventListener('click', copySummaryToClipboard);

// Reiniciar pantalla de resultados
btnResetDraw.addEventListener('click', () => {
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  clearDrawUI();
  renderTournament();
  hideAlert();
});

// Eventos del Torneo
tournamentFormatSelect.addEventListener('change', syncTournamentSetupOptions);
btnStartTournament.addEventListener('click', startTournamentFromDraw);
btnAdvanceToKnockout.addEventListener('click', advanceGroupsToKnockout);
btnCopyTournament.addEventListener('click', copyTournamentToClipboard);
btnResetTournament.addEventListener('click', () => {
  state.tournament = null;
  saveState();
  renderTournament();
});

// Modal de edición de clubes
btnOpenClubsDialog.addEventListener('click', () => {
  renderClubsModal();
  clubsDialog.showModal();
});

btnCloseDialog.addEventListener('click', () => clubsDialog.close());
btnConfirmDialog.addEventListener('click', () => clubsDialog.close());

addClubForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addClubsToPreset(clubInput.value);
  clubInput.value = '';
  clubInput.focus();
});

btnResetPreset.addEventListener('click', () => {
  const key = state.currentPresetKey;
  if (DEFAULT_PRESETS[key]) {
    state.customPresets[key] = [...DEFAULT_PRESETS[key]];
    saveState();
    renderClubsModal();
    updateActiveClubsCounter();
  }
});

// Eventos del Anotador de Truco
btnOpenTrucoGlobal.addEventListener('click', () => {
  state.truco.linkedMatch = null;
  saveState();
  openTrucoScoreboard();
});

btnCloseTruco.addEventListener('click', () => trucoDialog.close());
btnDoneTruco.addEventListener('click', () => trucoDialog.close());
btnTrucoTarget30.addEventListener('click', () => setTrucoTarget(30));
btnTrucoTarget15.addEventListener('click', () => setTrucoTarget(15));

btnTrucoMinusA.addEventListener('click', () => adjustTrucoScore('A', -1));
btnTrucoPlusA.addEventListener('click', () => adjustTrucoScore('A', 1));
btnTrucoMinusB.addEventListener('click', () => adjustTrucoScore('B', -1));
btnTrucoPlusB.addEventListener('click', () => adjustTrucoScore('B', 1));

// Click directo sobre las columnas de fósforos para sumar +1 rápido
[trucoMalasA, trucoBuenasA].forEach(col => {
  col.addEventListener('click', () => adjustTrucoScore('A', 1));
});
[trucoMalasB, trucoBuenasB].forEach(col => {
  col.addEventListener('click', () => adjustTrucoScore('B', 1));
});

trucoNameA.addEventListener('input', () => {
  state.truco.nameA = trucoNameA.value.trim() || 'Nosotros';
  saveState();
  renderTrucoScoreboard();
});

trucoNameB.addEventListener('input', () => {
  state.truco.nameB = trucoNameB.value.trim() || 'Ellos';
  saveState();
  renderTrucoScoreboard();
});

btnResetTruco.addEventListener('click', resetTrucoScore);
btnTrucoRematch.addEventListener('click', resetTrucoScore);

btnTrucoUndo.addEventListener('click', () => {
  const t = state.truco;
  const target = t.target === 15 ? 15 : 30;
  if (t.scoreA >= target) {
    adjustTrucoScore('A', -1);
  } else if (t.scoreB >= target) {
    adjustTrucoScore('B', -1);
  }
});

btnTrucoShare.addEventListener('click', async () => {
  const t = state.truco;
  const target = t.target === 15 ? 15 : 30;
  const winName = t.scoreA >= target ? (t.nameA || 'Nosotros') : (t.nameB || 'Ellos');
  const text = [
    `🃏 *PARTIDO DE TRUCO (a ${target} pts)* 🃏`,
    `🏆 ¡Ganó *${winName}*!`,
    `🔵 ${t.nameA || 'Nosotros'}: *${t.scoreA} pts*`,
    `🔴 ${t.nameB || 'Ellos'}: *${t.scoreB} pts*`,
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    const orig = btnTrucoShare.textContent;
    btnTrucoShare.textContent = '✅ ¡Resultado copiado!';
    setTimeout(() => { btnTrucoShare.textContent = orig; }, 2000);
  } catch {
    showAlert('No se pudo copiar el resultado.');
  }
});

btnSaveTrucoToMatch.addEventListener('click', saveTrucoToLinkedMatch);

// Fallback para cierre de <dialog> al hacer clic en el backdrop en navegadores sin closedby="any"
if (!('closedBy' in HTMLDialogElement.prototype)) {
  [clubsDialog, trucoDialog].forEach(dlg => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });
  });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
loadState();
syncControlsWithState();
renderPlayers();
renderDrawResults();
renderTournament();
