// ==========================================
// 5. ANOTADOR DE TRUCO (30 / 15 PUNTOS CON FÓSFOROS)
// ==========================================

// Dibuja un cajoncito SVG de hasta 5 fósforos:
// 1: poste izquierdo, 2: techo superior, 3: poste derecho, 4: piso inferior, 5: diagonal cruzada
function createMatchstickBoxSVG(pointsInBox) {
  const sticks = [
    // 1. Izquierda (abajo hacia arriba)
    { x1: 14, y1: 48, x2: 14, y2: 14, hx: 14, hy: 12 },
    // 2. Arriba (izquierda a derecha)
    { x1: 14, y1: 14, x2: 48, y2: 14, hx: 50, hy: 14 },
    // 3. Derecha (arriba hacia abajo)
    { x1: 48, y1: 14, x2: 48, y2: 48, hx: 48, hy: 50 },
    // 4. Abajo (derecha a izquierda)
    { x1: 48, y1: 48, x2: 14, y2: 48, hx: 12, hy: 48 },
    // 5. Diagonal (abajo-izquierda a arriba-derecha)
    { x1: 16, y1: 46, x2: 46, y2: 16, hx: 47, hy: 15 },
  ];

  const count = Math.max(0, Math.min(5, pointsInBox));
  let sticksSvg = '';

  for (let i = 0; i < 5; i++) {
    const s = sticks[i];
    const isLit = i < count;
    sticksSvg += `
      <g class="matchstick${isLit ? ' lit' : ''}">
        <line class="matchstick-wood" x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" />
        <circle class="matchstick-head" cx="${s.hx}" cy="${s.hy}" r="3.6" />
      </g>
    `;
  }

  return `
    <svg class="truco-box-svg" viewBox="0 0 62 62" aria-hidden="true">
      <rect class="truco-box-guide" x="10" y="10" width="42" height="42" rx="4" />
      ${sticksSvg}
    </svg>
  `;
}

function formatTrucoStatus(score, target) {
  if (score >= target) return '🏆 ¡Ganó!';
  if (target === 30) {
    if (score === 0) return '0 Malas';
    if (score <= 15) return `${score} Malas`;
    return `${score - 15} Buenas`;
  }
  return `${score} / 15 pts`;
}

function renderBoxesColumn(container, totalPointsInSection, boxCount) {
  let html = '';
  for (let b = 0; b < boxCount; b++) {
    const pointsInThisBox = Math.max(0, Math.min(5, totalPointsInSection - b * 5));
    html += createMatchstickBoxSVG(pointsInThisBox);
  }
  container.innerHTML = html;
}

function launchTrucoConfetti() {
  if (!trucoConfettiContainer) return;
  trucoConfettiContainer.innerHTML = '';
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#fde047'];

  for (let i = 0; i < 28; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 96 + 2}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDuration = `${1.4 + Math.random() * 1.1}s`;
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    trucoConfettiContainer.appendChild(piece);
  }
}

function renderTrucoScoreboard() {
  const t = state.truco;
  const target = t.target === 15 ? 15 : 30;
  const previousWinner = !trucoWinnerBanner.hidden;

  // Botones de modalidad 30 / 15
  btnTrucoTarget30.classList.toggle('active', target === 30);
  btnTrucoTarget30.setAttribute('aria-pressed', String(target === 30));
  btnTrucoTarget15.classList.toggle('active', target === 15);
  btnTrucoTarget15.setAttribute('aria-pressed', String(target === 15));

  // Nombres y puntajes numéricos
  if (document.activeElement !== trucoNameA) {
    trucoNameA.value = t.nameA || 'Nosotros';
  }
  if (document.activeElement !== trucoNameB) {
    trucoNameB.value = t.nameB || 'Ellos';
  }

  trucoScoreA.textContent = t.scoreA;
  trucoScoreB.textContent = t.scoreB;

  trucoStatusA.textContent = formatTrucoStatus(t.scoreA, target);
  trucoStatusB.textContent = formatTrucoStatus(t.scoreB, target);

  // Estado de botones -1 / +1
  btnTrucoMinusA.disabled = t.scoreA <= 0;
  btnTrucoMinusB.disabled = t.scoreB <= 0;
  btnTrucoPlusA.disabled = t.scoreA >= target;
  btnTrucoPlusB.disabled = t.scoreB >= target;

  // Renderizado de cajoncitos de 5 fósforos divididos en Malas y Buenas
  if (target === 30) {
    trucoBuenasSection.hidden = false;
    trucoTopHalfTitle.textContent = 'MALAS (Primeros 15)';

    const malasA = Math.min(15, t.scoreA);
    const buenasA = Math.max(0, t.scoreA - 15);
    const malasB = Math.min(15, t.scoreB);
    const buenasB = Math.max(0, t.scoreB - 15);

    renderBoxesColumn(trucoMalasA, malasA, 3);
    renderBoxesColumn(trucoMalasB, malasB, 3);
    renderBoxesColumn(trucoBuenasA, buenasA, 3);
    renderBoxesColumn(trucoBuenasB, buenasB, 3);
  } else {
    // A 15 puntos: 3 cajoncitos directos
    trucoBuenasSection.hidden = true;
    trucoTopHalfTitle.textContent = 'PARTIDO A 15 PUNTOS (3 CAJONCITOS DE 5)';

    renderBoxesColumn(trucoMalasA, Math.min(15, t.scoreA), 3);
    renderBoxesColumn(trucoMalasB, Math.min(15, t.scoreB), 3);
  }

  // Banner de ganador e interactividad
  const winnerSide = t.scoreA >= target ? 'A' : t.scoreB >= target ? 'B' : null;
  trucoTeamCardA.classList.toggle('winner-card', winnerSide === 'A');
  trucoTeamCardB.classList.toggle('winner-card', winnerSide === 'B');

  if (winnerSide) {
    const winName = winnerSide === 'A' ? (t.nameA || 'Nosotros') : (t.nameB || 'Ellos');
    const loseName = winnerSide === 'A' ? (t.nameB || 'Ellos') : (t.nameA || 'Nosotros');
    const winScore = winnerSide === 'A' ? t.scoreA : t.scoreB;
    const loseScore = winnerSide === 'A' ? t.scoreB : t.scoreA;
    const diff = winScore - loseScore;

    trucoWinnerBanner.hidden = false;
    trucoWinnerName.textContent = `¡Ganó ${winName} (${t.scoreA} a ${t.scoreB})!`;
    trucoWinnerSub.textContent = diff >= 15
      ? `¡Paliza histórica! Le sacó ${diff} puntos de ventaja a ${loseName}.`
      : diff <= 2
        ? `¡Final para el infarto! Definido por apenas ${diff} ${diff === 1 ? 'punto' : 'puntos'}.`
        : `Victoria por ${diff} puntos de diferencia en partida a ${target}.`;

    if (!previousWinner) {
      launchTrucoConfetti();
    }
  } else {
    trucoWinnerBanner.hidden = true;
  }
}

function resetTrucoScore() {
  state.truco.scoreA = 0;
  state.truco.scoreB = 0;
  saveState();
  renderTrucoScoreboard();
}

function adjustTrucoScore(side, delta) {
  const t = state.truco;
  const target = t.target === 15 ? 15 : 30;
  if (side === 'A') {
    t.scoreA = Math.max(0, Math.min(target, t.scoreA + delta));
  } else {
    t.scoreB = Math.max(0, Math.min(target, t.scoreB + delta));
  }
  saveState();
  renderTrucoScoreboard();
}

function setTrucoTarget(newTarget) {
  state.truco.target = newTarget;
  if (state.truco.scoreA > newTarget) state.truco.scoreA = newTarget;
  if (state.truco.scoreB > newTarget) state.truco.scoreB = newTarget;
  saveState();
  renderTrucoScoreboard();
}

function openTrucoScoreboard() {
  renderTrucoScoreboard();
  trucoDialog.showModal();
}
