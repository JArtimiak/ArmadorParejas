// ==========================================
// 6. EVENT LISTENERS E INICIALIZACIÓN DE LA APP
// ==========================================

// Selector de modalidad (1v1, 2v2, 3v3)
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    state.splitTwoTeams = false;
    state.teamSize = Number(btn.dataset.size);
    footballDropdownMenu.hidePopover?.();
    syncControlsWithState();
    updateStats();
    hideAlert();
    saveState();
  });
});

// Selección de opciones de fútbol (Dividir en 2, F5, F7, F8, F11)
footballOptButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === 'split_two') {
      state.splitTwoTeams = true;
    } else {
      state.splitTwoTeams = false;
      state.teamSize = Number(btn.dataset.size);
    }
    footballDropdownMenu.hidePopover?.();
    syncControlsWithState();
    updateStats();
    hideAlert();
    saveState();
  });
});

// Aplicar tamaño numérico personalizado
btnApplyCustomSize.addEventListener('click', () => {
  const val = parseInt(customSizeInput.value.trim(), 10);
  if (!val || val < 1) {
    showAlert('Ingresá un número válido de integrantes por equipo (mínimo 1).');
    return;
  }
  state.splitTwoTeams = false;
  state.teamSize = val;
  state.customTeamSize = val;
  customSizeInput.value = '';
  footballDropdownMenu.hidePopover?.();
  syncControlsWithState();
  updateStats();
  hideAlert();
  saveState();
});

customSizeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (e.isComposing || e.keyCode === 229) return;
    btnApplyCustomSize.click();
  }
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
  showToast('Jugadores de ejemplo cargados', 'info');
});

// Limpiar todos los jugadores
btnClearPlayers.addEventListener('click', () => {
  if (state.players.length === 0) return;
  state.players = [];
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  runViewTransition(() => {
    renderPlayers();
    clearDrawUI();
    renderTournament();
  });
  hideAlert();
  showToast('Lista de jugadores vaciada', 'info');
});

// Toggle sortear clubes
toggleClubs.addEventListener('change', (e) => {
  state.assignClubs = e.target.checked;
  clubsConfigPanel.hidden = !state.assignClubs;

  if (state.lastDraw) {
    if (state.assignClubs) assignClubsToTeams();
    runViewTransition(() => {
      renderDrawResults();
      renderTournament();
    });
  }
  saveState();
});

// Cambio de preset de clubes
presetSelect.addEventListener('change', (e) => {
  state.currentPresetKey = e.target.value;
  updateActiveClubsCounter();
  if (state.lastDraw && state.assignClubs) {
    assignClubsToTeams();
    runViewTransition(() => {
      renderDrawResults();
      renderTournament();
    });
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
  runViewTransition(() => {
    renderDrawResults();
    renderTournament();
  });
  showToast('Clubes re-sorteados');
});

// Copiar resumen de cruces
btnCopyWhatsapp.addEventListener('click', copySummaryToClipboard);

// Reiniciar pantalla de resultados
btnResetDraw.addEventListener('click', () => {
  state.lastDraw = null;
  state.tournament = null;
  saveState();
  runViewTransition(() => {
    clearDrawUI();
    renderTournament();
  });
  hideAlert();
  showToast('Resultados reiniciados', 'info');
});

// Eventos del Torneo
tournamentFormatSelect.addEventListener('change', syncTournamentSetupOptions);
btnStartTournament.addEventListener('click', startTournamentFromDraw);
btnAdvanceToKnockout.addEventListener('click', advanceGroupsToKnockout);
btnCopyTournament.addEventListener('click', copyTournamentToClipboard);
btnResetTournament.addEventListener('click', () => {
  state.tournament = null;
  saveState();
  runViewTransition(() => renderTournament());
  showToast('Torneo finalizado', 'info');
});

// Modal de edición de clubes
btnOpenClubsDialog.addEventListener('click', () => {
  renderClubsModal();
  clubsDialog.showModal();
});

btnCloseDialog.addEventListener('click', () => closeTopLayer(clubsDialog));
btnConfirmDialog.addEventListener('click', () => closeTopLayer(clubsDialog));

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
    showToast('Clubes restaurados por defecto', 'info');
  }
});

// Eventos del Anotador de Truco
btnOpenTrucoGlobal.addEventListener('click', openTrucoScoreboard);

btnCloseTruco.addEventListener('click', () => closeTopLayer(trucoDialog));
btnDoneTruco.addEventListener('click', () => closeTopLayer(trucoDialog));
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

// Top-layer exit animation fallback y cierre seguro para <dialog>
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

async function closeTopLayer(dlg) {
  if (!dlg || !dlg.open) return;
  if (!(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay())) {
    dlg.setAttribute('data-closing', '');
    const anims = dlg.getAnimations({ subtree: true });
    if (anims.length > 0) {
      await Promise.race([Promise.allSettled(anims.map(a => a.finished)), new Promise(r => setTimeout(r, 400))]);
    }
    if (!dlg.hasAttribute('data-closing')) return;
    dlg.removeAttribute('data-closing');
  }
  dlg.close();
}

[clubsDialog, trucoDialog].forEach(dlg => {
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeTopLayer(dlg); });
});

if (!('closedBy' in HTMLDialogElement.prototype)) {
  const outside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  [clubsDialog, trucoDialog].forEach(dlg => {
    let pressedOutside = false;
    dlg.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dlg); });
    dlg.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, dlg)) closeTopLayer(dlg); });
  });
}

// Toggle de Tema Claro / Oscuro (2 estados con reversión automática a preferencia del sistema)
function setColorSchemeMeta(value) {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = value;
}

if (btnThemeToggle) {
  btnThemeToggle.addEventListener('click', () => {
    const darkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let stored = null;
    try { stored = localStorage.getItem('color-scheme'); } catch {}
    const current = (stored === 'light' || stored === 'dark') ? stored : (darkSystem ? 'dark' : 'light');
    const target = current === 'dark' ? 'light' : 'dark';
    const systemScheme = darkSystem ? 'dark' : 'light';
    try {
      if (target === systemScheme) {
        localStorage.removeItem('color-scheme');
        setColorSchemeMeta('light dark');
      } else {
        localStorage.setItem('color-scheme', target);
        setColorSchemeMeta(target);
      }
    } catch {
      setColorSchemeMeta(target);
    }
  });
}

window.addEventListener('storage', (e) => {
  if (e.key === 'color-scheme') {
    setColorSchemeMeta(e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : 'light dark');
  }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================
loadState();
syncControlsWithState();
renderPlayers();
renderDrawResults();
renderTournament();
