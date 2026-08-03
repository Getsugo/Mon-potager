(() => {
  "use strict";

  /* ===================== Constantes ===================== */
  const STORAGE_KEY = "potager-state-v1";
  const THEME_KEY = "potager-theme";
  const PX_PER_M = 56; // échelle du plan
  const SNAP = 0.1; // pas de déplacement / redimensionnement (m)
  const MIN_SIZE = 0.2; // taille mini d'une zone (m)
  const MOVE_THRESHOLD = 5; // px avant de considérer que c'est un glissement

  const PLANTS = [
    { id: "tomate",    name: "Tomate",       emoji: "🍅", color: "#C1432E" },
    { id: "courgette", name: "Courgette",    emoji: "🥒", color: "#6B9C3F" },
    { id: "patate",    name: "Patate",       emoji: "🥔", color: "#A9793F" },
    { id: "carotte",   name: "Carotte",      emoji: "🥕", color: "#DB7B25" },
    { id: "salade",    name: "Salade",       emoji: "🥬", color: "#7FA65C" },
    { id: "oignon",    name: "Oignon",       emoji: "🧅", color: "#8B5FA3" },
    { id: "fraise",    name: "Fraise",       emoji: "🍓", color: "#D6577A" },
    { id: "haricot",   name: "Haricot",      emoji: "🫘", color: "#4C7A3D" },
    { id: "poivron",   name: "Poivron",      emoji: "🫑", color: "#4C8C4A" },
    { id: "radis",     name: "Radis",        emoji: "🌱", color: "#C24B5C" },
    { id: "courge",    name: "Courge",       emoji: "🎃", color: "#D98F2B" },
    { id: "aubergine", name: "Aubergine",    emoji: "🍆", color: "#5B4B8A" },
    { id: "ail",       name: "Ail",          emoji: "🧄", color: "#B8A26A" },
    { id: "petitpois", name: "Petits pois",  emoji: "🫛", color: "#6FAE5C" },
    { id: "herbes",    name: "Herbes",       emoji: "🌿", color: "#5C8FA8" },
    { id: "autre",     name: "Autre",        emoji: "✏️", color: "#6B8E4E" },
  ];

  const PLANT_INFO = {
    tomate: {
      soleil: "Plein soleil",
      arrosage: "Régulier au pied, sans mouiller le feuillage",
      chaleur: "Aime la chaleur, gélive : serre/tunnel utile en climat frais",
      sol: "Riche, bien drainé",
      espacement: "50 à 60 cm",
      semis: "Semis février-mars, plantation après mi-mai",
      recolte: "Juillet à octobre",
      conseil: "Tuteure les pieds et paille le sol pour limiter les maladies et garder l'humidité.",
    },
    courgette: {
      soleil: "Plein soleil",
      arrosage: "Abondant et régulier, au pied",
      chaleur: "Aime la chaleur, semis après les dernières gelées",
      sol: "Riche en humus, bien drainé",
      espacement: "80 à 100 cm (très volumineuse)",
      semis: "Semis avril-mai sous abri, ou direct mai-juin",
      recolte: "Juillet à septembre, cueillette jeune et fréquente",
      conseil: "Récolte les fruits jeunes et régulièrement : cela relance la production.",
    },
    patate: {
      soleil: "Plein soleil",
      arrosage: "Modéré, plus soutenu à la formation des tubercules",
      chaleur: "Craint le gel, pas besoin de serre",
      sol: "Meuble et drainé, éviter le fumier frais",
      espacement: "30 cm sur le rang, 60-70 cm entre rangs",
      semis: "Plantation mars-avril",
      recolte: "Juin (primeurs) à septembre (conservation)",
      conseil: "Butte les plants 2 à 3 fois pour protéger les tubercules de la lumière et du gel.",
    },
    carotte: {
      soleil: "Soleil à mi-ombre",
      arrosage: "Régulier et léger, sol frais en surface",
      chaleur: "Tolère bien la fraîcheur, pas de serre nécessaire",
      sol: "Profond, meuble, sans cailloux, éviter le fumier frais",
      espacement: "3 à 5 cm sur le rang, à éclaircir",
      semis: "Mars à juillet",
      recolte: "3 à 4 mois après le semis",
      conseil: "Éclaircis tôt et bine régulièrement pour éviter que les racines fourchent.",
    },
    salade: {
      soleil: "Mi-ombre en été, soleil au printemps/automne",
      arrosage: "Régulier et léger, sol toujours frais",
      chaleur: "Craint les fortes chaleurs (monte en graine), pas de serre l'été",
      sol: "Riche, frais, bien drainé",
      espacement: "25 à 30 cm",
      semis: "Toute l'année par petites vagues échelonnées",
      recolte: "2 à 3 mois après le semis",
      conseil: "Sème peu à la fois mais souvent pour échelonner les récoltes.",
    },
    oignon: {
      soleil: "Plein soleil",
      arrosage: "Modéré, à réduire puis arrêter avant la récolte",
      chaleur: "Résiste bien au frais, pas de serre nécessaire",
      sol: "Léger et drainé, éviter le fumier frais",
      espacement: "10 à 15 cm",
      semis: "Plantation mars-avril ou octobre",
      recolte: "Juillet-août, quand le feuillage jaunit et se couche",
      conseil: "Laisse sécher les bulbes au sol quelques jours avant de les stocker.",
    },
    fraise: {
      soleil: "Plein soleil à mi-ombre légère",
      arrosage: "Régulier au pied, sans mouiller les fruits",
      chaleur: "Pas de serre nécessaire, protéger en hiver si froid vif",
      sol: "Riche, drainé, légèrement acide",
      espacement: "30 à 40 cm",
      semis: "Plantation août-octobre ou mars",
      recolte: "Mai à juillet (ou jusqu'à l'automne pour les remontantes)",
      conseil: "Paille sous les fruits pour éviter le contact avec la terre et limiter la pourriture.",
    },
    haricot: {
      soleil: "Plein soleil",
      arrosage: "Modéré, plus soutenu à la floraison",
      chaleur: "Craint le gel, aime la chaleur",
      sol: "Léger et drainé, pas trop riche en azote",
      espacement: "8-10 cm (nain) ou 30-40 cm (à rames)",
      semis: "Mai à juillet",
      recolte: "2 à 3 mois après semis, cueillette régulière",
      conseil: "Tuteure les variétés grimpantes dès la levée pour guider leur croissance.",
    },
    poivron: {
      soleil: "Plein soleil, forte chaleur",
      arrosage: "Régulier, soutenu en été",
      chaleur: "Frileux : serre/tunnel conseillé en climat tempéré",
      sol: "Riche, drainé et réchauffé",
      espacement: "40 à 50 cm",
      semis: "Semis février-mars sous abri, plantation en mai",
      recolte: "Juillet à octobre",
      conseil: "Pince le bourgeon terminal pour favoriser la ramification et plus de fruits.",
    },
    radis: {
      soleil: "Soleil à mi-ombre",
      arrosage: "Fréquent et régulier (sinon racines piquantes)",
      chaleur: "Culture fraîche, monte en graine si trop chaud",
      sol: "Léger, meuble, frais",
      espacement: "3 à 5 cm",
      semis: "Mars à septembre, toutes les 2 semaines",
      recolte: "3 à 4 semaines après le semis, très rapide",
      conseil: "Récolte-les jeunes : des radis oubliés trop longtemps deviennent creux et piquants.",
    },
    courge: {
      soleil: "Plein soleil",
      arrosage: "Abondant et régulier, au pied",
      chaleur: "Aime la chaleur, gélive",
      sol: "Très riche (compost), bien drainé",
      espacement: "1 à 2 m (très envahissante)",
      semis: "Semis avril-mai sous abri, plantation fin mai",
      recolte: "Septembre-octobre, avant les gelées",
      conseil: "Laisse un bout de pédoncule sur le fruit à la récolte : cela améliore sa conservation.",
    },
    aubergine: {
      soleil: "Plein soleil, forte chaleur",
      arrosage: "Régulier et soutenu en été",
      chaleur: "Très frileuse : serre/tunnel vivement conseillé",
      sol: "Riche, drainé et réchauffé",
      espacement: "50 à 60 cm",
      semis: "Semis février-mars sous abri chauffé, plantation fin mai",
      recolte: "Juillet à octobre",
      conseil: "Limite à 4-6 fruits par pied pour obtenir de belles aubergines bien formées.",
    },
    ail: {
      soleil: "Plein soleil",
      arrosage: "Faible, arrêter avant la récolte",
      chaleur: "Résiste bien au froid, pas de serre",
      sol: "Léger et drainé, éviter le fumier frais",
      espacement: "10 à 15 cm",
      semis: "Plantation octobre-novembre (hiver) ou février-mars (printemps)",
      recolte: "Juin-juillet, quand les feuilles jaunissent",
      conseil: "Laisse sécher les têtes au soleil quelques jours avant de les stocker.",
    },
    petitpois: {
      soleil: "Plein soleil à mi-ombre",
      arrosage: "Modéré, surtout à la floraison et formation des gousses",
      chaleur: "Culture fraîche, craint les fortes chaleurs d'été",
      sol: "Léger et drainé, pas trop d'azote",
      espacement: "5 cm sur le rang",
      semis: "Février à mai (ou septembre en climat doux)",
      recolte: "Environ 3 mois après le semis",
      conseil: "Installe un grillage ou des tuteurs dès la levée et récolte souvent pour prolonger la production.",
    },
    herbes: {
      soleil: "Plein soleil à mi-ombre selon l'espèce",
      arrosage: "Sobre pour les méditerranéennes (thym, romarin), plus régulier pour basilic/menthe/persil",
      chaleur: "Variable : le basilic est frileux, thym et romarin sont rustiques",
      sol: "Drainé, plutôt pauvre pour les méditerranéennes",
      espacement: "20 à 30 cm",
      semis: "Plantation au printemps",
      recolte: "Au fil des besoins",
      conseil: "Pince régulièrement pour favoriser la ramification et retarder la floraison.",
    },
  };

  function getPlantInfo(zone) {
    return PLANT_INFO[zone.plantId] || null;
  }

  /* ===================== État ===================== */
  let state = loadState();
  let activeZoneId = null; // zone en cours d'édition dans la modale
  let selectedPlantId = PLANTS[0].id;

  function defaultState() {
    return {
      gardenW: 4,
      gardenH: 3,
      zones: [],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.zones)) return defaultState();
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      showToast("Impossible d'enregistrer (stockage plein ?)");
    }
  }

  function uid() {
    return "z" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getPlant(zone) {
    if (zone.plantId === "autre" || !PLANTS.find(p => p.id === zone.plantId)) {
      return {
        name: zone.customName || "Culture",
        emoji: zone.customEmoji || "🌿",
        color: zone.customColor || "#6B8E4E",
      };
    }
    return PLANTS.find(p => p.id === zone.plantId);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function roundSnap(v) {
    return Math.round(v / SNAP) * SNAP;
  }

  function fmtM(v) {
    return (Math.round(v * 10) / 10).toString().replace(".", ",");
  }

  /* ===================== Éléments DOM ===================== */
  const el = (id) => document.getElementById(id);

  const themeToggle = el("themeToggle");
  const settingsBtn = el("settingsBtn");
  const statSurface = el("statSurface");
  const statPlanted = el("statPlanted");
  const statZones = el("statZones");
  const tabs = document.querySelectorAll(".tab");
  const panelPlan = el("panelPlan");
  const panelListe = el("panelListe");
  const canvasScroll = el("canvasScroll");
  const rulerTop = el("rulerTop");
  const rulerLeft = el("rulerLeft");
  const gardenCanvas = el("gardenCanvas");
  const legendGrid = el("legendGrid");
  const zoneList = el("zoneList");
  const listEmpty = el("listEmpty");
  const addZoneBtn = el("addZoneBtn");

  const infoModalOverlay = el("infoModalOverlay");
  const infoModalClose = el("infoModalClose");
  const infoEmoji = el("infoEmoji");
  const infoName = el("infoName");
  const infoVarietyLine = el("infoVarietyLine");
  const infoZoneCard = el("infoZoneCard");
  const infoFiche = el("infoFiche");
  const infoSoleil = el("infoSoleil");
  const infoArrosage = el("infoArrosage");
  const infoChaleur = el("infoChaleur");
  const infoSol = el("infoSol");
  const infoEspacement = el("infoEspacement");
  const infoSemis = el("infoSemis");
  const infoRecolte = el("infoRecolte");
  const infoConseil = el("infoConseil");
  const infoNotesBlock = el("infoNotesBlock");
  const infoEditBtn = el("infoEditBtn");
  let infoZoneId = null;

  const zoneModalOverlay = el("zoneModalOverlay");
  const zoneModalTitle = el("zoneModalTitle");
  const zoneModalClose = el("zoneModalClose");
  const plantGrid = el("plantGrid");
  const customPlantRow = el("customPlantRow");
  const customPlantName = el("customPlantName");
  const customPlantEmoji = el("customPlantEmoji");
  const customPlantColor = el("customPlantColor");
  const zoneVariety = el("zoneVariety");
  const zoneX = el("zoneX");
  const zoneY = el("zoneY");
  const zoneW = el("zoneW");
  const zoneH = el("zoneH");
  const zoneAreaPreview = el("zoneAreaPreview");
  const zoneDate = el("zoneDate");
  const zoneNotes = el("zoneNotes");
  const zoneDeleteBtn = el("zoneDeleteBtn");
  const zoneSaveBtn = el("zoneSaveBtn");

  const settingsModalOverlay = el("settingsModalOverlay");
  const settingsModalClose = el("settingsModalClose");
  const gardenWInput = el("gardenW");
  const gardenHInput = el("gardenH");
  const applyGardenSize = el("applyGardenSize");
  const exportBtn = el("exportBtn");
  const importBtn = el("importBtn");
  const importFile = el("importFile");
  const resetBtn = el("resetBtn");
  const versionTag = el("versionTag");
  const toastEl = el("toast");

  /* ===================== Thème ===================== */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || "light";
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
  });

  /* ===================== Toast ===================== */
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
  }

  /* ===================== Onglets ===================== */
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const target = tab.dataset.tab;
      panelPlan.hidden = target !== "plan";
      panelListe.hidden = target !== "liste";
      if (target === "liste") renderList();
    });
  });

  /* ===================== Rendu du plan ===================== */
  function renderCanvasSize() {
    const w = state.gardenW * PX_PER_M;
    const h = state.gardenH * PX_PER_M;
    gardenCanvas.style.width = w + "px";
    gardenCanvas.style.height = h + "px";
    gardenCanvas.style.backgroundSize = `${PX_PER_M}px ${PX_PER_M}px`;
    renderRulers();
  }

  function renderRulers() {
    rulerTop.innerHTML = "";
    rulerTop.style.width = (state.gardenW * PX_PER_M) + "px";
    for (let i = 0; i < state.gardenW; i++) {
      const tick = document.createElement("div");
      tick.className = "ruler-tick";
      tick.style.width = PX_PER_M + "px";
      tick.innerHTML = `<span>${i}</span>`;
      rulerTop.appendChild(tick);
    }
    rulerLeft.innerHTML = "";
    rulerLeft.style.height = (state.gardenH * PX_PER_M) + "px";
    for (let i = 0; i < state.gardenH; i++) {
      const tick = document.createElement("div");
      tick.className = "ruler-tick";
      tick.style.height = PX_PER_M + "px";
      tick.innerHTML = `<span>${i}</span>`;
      rulerLeft.appendChild(tick);
    }
  }

  function renderZones() {
    gardenCanvas.querySelectorAll(".zone").forEach(n => n.remove());
    state.zones.forEach(zone => {
      gardenCanvas.appendChild(buildZoneEl(zone));
    });
  }

  function buildZoneEl(zone) {
    const plant = getPlant(zone);
    const node = document.createElement("div");
    node.className = "zone";
    node.dataset.id = zone.id;
    node.style.setProperty("--zone-color", plant.color);
    node.style.left = (zone.x * PX_PER_M) + "px";
    node.style.top = (zone.y * PX_PER_M) + "px";
    node.style.width = (zone.w * PX_PER_M) + "px";
    node.style.height = (zone.h * PX_PER_M) + "px";
    node.innerHTML = `
      <span class="zone-emoji">${plant.emoji}</span>
      <span class="zone-name">${escapeHtml(plant.name)}</span>
      <span class="zone-dims">${fmtM(zone.w)}×${fmtM(zone.h)} m</span>
      <div class="zone-handle" title="Redimensionner"></div>
    `;
    attachZoneInteractions(node, zone);
    return node;
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  /* ===================== Interactions: déplacer / redimensionner / éditer ===================== */
  function attachZoneInteractions(node, zone) {
    const handle = node.querySelector(".zone-handle");

    handle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const startX = e.clientX, startY = e.clientY;
      const startW = zone.w, startH = zone.h;
      node.classList.add("dragging");

      function onMove(ev) {
        const dx = (ev.clientX - startX) / PX_PER_M;
        const dy = (ev.clientY - startY) / PX_PER_M;
        let newW = clamp(roundSnap(startW + dx), MIN_SIZE, state.gardenW - zone.x);
        let newH = clamp(roundSnap(startH + dy), MIN_SIZE, state.gardenH - zone.y);
        zone.w = newW;
        zone.h = newH;
        node.style.width = (newW * PX_PER_M) + "px";
        node.style.height = (newH * PX_PER_M) + "px";
        node.querySelector(".zone-dims").textContent = `${fmtM(newW)}×${fmtM(newH)} m`;
      }
      function onUp(ev) {
        handle.releasePointerCapture(e.pointerId);
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        node.classList.remove("dragging");
        saveState();
        updateStats();
      }
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
    });

    node.addEventListener("pointerdown", (e) => {
      if (e.target === handle) return;
      node.setPointerCapture(e.pointerId);
      const startX = e.clientX, startY = e.clientY;
      const startZx = zone.x, startZy = zone.y;
      let moved = false;

      function onMove(ev) {
        const dxPx = ev.clientX - startX;
        const dyPx = ev.clientY - startY;
        if (!moved && Math.hypot(dxPx, dyPx) > MOVE_THRESHOLD) {
          moved = true;
          node.classList.add("dragging");
        }
        if (!moved) return;
        const dx = dxPx / PX_PER_M;
        const dy = dyPx / PX_PER_M;
        const newX = clamp(roundSnap(startZx + dx), 0, state.gardenW - zone.w);
        const newY = clamp(roundSnap(startZy + dy), 0, state.gardenH - zone.h);
        zone.x = newX;
        zone.y = newY;
        node.style.left = (newX * PX_PER_M) + "px";
        node.style.top = (newY * PX_PER_M) + "px";
      }
      function onUp(ev) {
        node.releasePointerCapture(e.pointerId);
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerup", onUp);
        node.classList.remove("dragging");
        if (moved) {
          saveState();
        } else {
          openInfoModal(zone.id);
        }
      }
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerup", onUp);
    });
  }

  /* ===================== Légende ===================== */
  function renderLegend() {
    const usedIds = new Set(state.zones.map(z => z.plantId));
    legendGrid.innerHTML = "";
    if (usedIds.size === 0) {
      legendGrid.innerHTML = `<p class="empty-sub" style="margin:0;">Ajoute une zone pour voir la légende.</p>`;
      return;
    }
    state.zones.forEach(zone => {
      const plant = getPlant(zone);
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<span class="legend-dot" style="background:${plant.color}"></span>${plant.emoji} ${escapeHtml(plant.name)}`;
      legendGrid.appendChild(item);
    });
  }

  /* ===================== Liste ===================== */
  function renderList() {
    zoneList.innerHTML = "";
    if (state.zones.length === 0) {
      listEmpty.hidden = false;
      return;
    }
    listEmpty.hidden = true;
    const sorted = [...state.zones].sort((a, b) => (getPlant(a).name).localeCompare(getPlant(b).name));
    sorted.forEach(zone => {
      const plant = getPlant(zone);
      const card = document.createElement("div");
      card.className = "zone-card";
      card.style.setProperty("--zone-color", plant.color);
      const area = (zone.w * zone.h).toFixed(2).replace(".", ",");
      let sub = `${fmtM(zone.w)}×${fmtM(zone.h)} m · ${area} m²`;
      if (zone.variety) sub += ` · ${escapeHtml(zone.variety)}`;
      if (zone.date) sub += ` · planté le ${formatDate(zone.date)}`;
      card.innerHTML = `
        <span class="zone-card-emoji">${plant.emoji}</span>
        <div class="zone-card-info">
          <div class="zone-card-title">${escapeHtml(plant.name)}</div>
          <div class="zone-card-sub">${sub}</div>
        </div>
        <span class="zone-card-chev">›</span>
      `;
      card.addEventListener("click", () => openInfoModal(zone.id));
      zoneList.appendChild(card);
    });
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ===================== Stats ===================== */
  function updateStats() {
    const surface = state.gardenW * state.gardenH;
    const planted = state.zones.reduce((sum, z) => sum + z.w * z.h, 0);
    statSurface.textContent = fmtM(surface) + " m²";
    statPlanted.textContent = fmtM(planted) + " m²";
    statZones.textContent = state.zones.length;
  }

  /* ===================== Grille de choix des plantes (modale) ===================== */
  function renderPlantGrid() {
    plantGrid.innerHTML = "";
    PLANTS.forEach(p => {
      const opt = document.createElement("div");
      opt.className = "plant-opt" + (p.id === selectedPlantId ? " selected" : "");
      opt.dataset.plantId = p.id;
      opt.innerHTML = `<span class="pe">${p.emoji}</span><span>${p.name}</span>`;
      opt.addEventListener("click", () => {
        selectedPlantId = p.id;
        plantGrid.querySelectorAll(".plant-opt").forEach(n => n.classList.remove("selected"));
        opt.classList.add("selected");
        customPlantRow.hidden = p.id !== "autre";
      });
      plantGrid.appendChild(opt);
    });
    customPlantRow.hidden = selectedPlantId !== "autre";
  }

  /* ===================== Modale fiche culture ===================== */
  function openInfoModal(zoneId) {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return;
    infoZoneId = zoneId;
    const plant = getPlant(zone);
    const info = getPlantInfo(zone);

    infoEmoji.textContent = plant.emoji;
    infoName.textContent = plant.name;
    infoVarietyLine.textContent = zone.variety ? zone.variety : "";
    infoVarietyLine.hidden = !zone.variety;

    let zoneCardHtml = `<strong>${fmtM(zone.w)}×${fmtM(zone.h)} m</strong> · ${(zone.w * zone.h).toFixed(2).replace(".", ",")} m²`;
    if (zone.date) zoneCardHtml += ` · planté le ${formatDate(zone.date)}`;
    infoZoneCard.innerHTML = zoneCardHtml;

    if (info) {
      infoFiche.hidden = false;
      infoSoleil.textContent = info.soleil;
      infoArrosage.textContent = info.arrosage;
      infoChaleur.textContent = info.chaleur;
      infoSol.textContent = info.sol;
      infoEspacement.textContent = info.espacement;
      infoSemis.textContent = info.semis;
      infoRecolte.textContent = info.recolte;
      infoConseil.textContent = info.conseil;
    } else {
      infoFiche.hidden = true;
    }

    if (zone.notes) {
      infoNotesBlock.hidden = false;
      infoNotesBlock.innerHTML = `<strong>Notes</strong><br>${escapeHtml(zone.notes)}`;
    } else {
      infoNotesBlock.hidden = true;
    }

    infoModalOverlay.hidden = false;
  }

  function closeInfoModal() {
    infoModalOverlay.hidden = true;
    infoZoneId = null;
  }

  infoModalClose.addEventListener("click", closeInfoModal);
  infoModalOverlay.addEventListener("click", (e) => { if (e.target === infoModalOverlay) closeInfoModal(); });
  infoEditBtn.addEventListener("click", () => {
    const zoneId = infoZoneId;
    closeInfoModal();
    openZoneModal(zoneId);
  });

  /* ===================== Modale zone ===================== */
  function openZoneModal(zoneId) {
    activeZoneId = zoneId || null;
    let zone;
    if (activeZoneId) {
      zone = state.zones.find(z => z.id === activeZoneId);
      zoneModalTitle.textContent = "Modifier la zone";
      zoneDeleteBtn.hidden = false;
      selectedPlantId = zone.plantId;
    } else {
      const freeSpot = findFreeSpot();
      zone = { x: freeSpot.x, y: freeSpot.y, w: 1, h: 1, plantId: selectedPlantId || PLANTS[0].id, variety: "", date: "", notes: "" };
      zoneModalTitle.textContent = "Nouvelle zone";
      zoneDeleteBtn.hidden = true;
      selectedPlantId = PLANTS[0].id;
    }

    renderPlantGrid();
    customPlantName.value = zone.customName || "";
    customPlantEmoji.value = zone.customEmoji || "";
    customPlantColor.value = zone.customColor || "#6B8E4E";
    zoneVariety.value = zone.variety || "";
    zoneX.value = zone.x;
    zoneY.value = zone.y;
    zoneW.value = zone.w;
    zoneH.value = zone.h;
    zoneDate.value = zone.date || "";
    zoneNotes.value = zone.notes || "";
    updateAreaPreview();

    zoneModalOverlay.hidden = false;
  }

  function findFreeSpot() {
    // place la nouvelle zone en haut à gauche, dans les limites du jardin
    const w = Math.min(1, state.gardenW);
    const h = Math.min(1, state.gardenH);
    return { x: 0, y: 0, w, h };
  }

  function closeZoneModal() {
    zoneModalOverlay.hidden = true;
    activeZoneId = null;
  }

  function updateAreaPreview() {
    const w = parseFloat(zoneW.value) || 0;
    const h = parseFloat(zoneH.value) || 0;
    zoneAreaPreview.textContent = (w * h).toFixed(2).replace(".", ",") + " m²";
  }
  [zoneW, zoneH].forEach(input => input.addEventListener("input", updateAreaPreview));

  zoneModalClose.addEventListener("click", closeZoneModal);
  zoneModalOverlay.addEventListener("click", (e) => { if (e.target === zoneModalOverlay) closeZoneModal(); });

  zoneSaveBtn.addEventListener("click", () => {
    let x = clamp(roundSnap(parseFloat(zoneX.value) || 0), 0, state.gardenW);
    let y = clamp(roundSnap(parseFloat(zoneY.value) || 0), 0, state.gardenH);
    let w = clamp(roundSnap(parseFloat(zoneW.value) || MIN_SIZE), MIN_SIZE, state.gardenW);
    let h = clamp(roundSnap(parseFloat(zoneH.value) || MIN_SIZE), MIN_SIZE, state.gardenH);
    if (x + w > state.gardenW) x = roundSnap(state.gardenW - w);
    if (y + h > state.gardenH) y = roundSnap(state.gardenH - h);

    const data = {
      plantId: selectedPlantId,
      customName: customPlantName.value.trim(),
      customEmoji: customPlantEmoji.value.trim(),
      customColor: customPlantColor.value,
      variety: zoneVariety.value.trim(),
      x, y, w, h,
      date: zoneDate.value,
      notes: zoneNotes.value.trim(),
    };

    if (selectedPlantId === "autre" && !data.customName) {
      showToast("Donne un nom à cette culture");
      return;
    }

    if (activeZoneId) {
      const zone = state.zones.find(z => z.id === activeZoneId);
      Object.assign(zone, data);
      showToast("Zone mise à jour");
    } else {
      state.zones.push(Object.assign({ id: uid() }, data));
      showToast("Zone ajoutée");
    }
    saveState();
    closeZoneModal();
    renderZones();
    renderLegend();
    updateStats();
    if (!panelListe.hidden) renderList();
  });

  zoneDeleteBtn.addEventListener("click", () => {
    if (!activeZoneId) return;
    state.zones = state.zones.filter(z => z.id !== activeZoneId);
    saveState();
    closeZoneModal();
    renderZones();
    renderLegend();
    updateStats();
    renderList();
    showToast("Zone supprimée");
  });

  addZoneBtn.addEventListener("click", () => openZoneModal(null));

  /* ===================== Réglages ===================== */
  settingsBtn.addEventListener("click", () => {
    gardenWInput.value = state.gardenW;
    gardenHInput.value = state.gardenH;
    settingsModalOverlay.hidden = false;
  });
  settingsModalClose.addEventListener("click", () => { settingsModalOverlay.hidden = true; });
  settingsModalOverlay.addEventListener("click", (e) => { if (e.target === settingsModalOverlay) settingsModalOverlay.hidden = true; });

  applyGardenSize.addEventListener("click", () => {
    const w = clamp(parseFloat(gardenWInput.value) || state.gardenW, 1, 50);
    const h = clamp(parseFloat(gardenHInput.value) || state.gardenH, 1, 50);
    // Empêche de rétrécir sous une zone existante
    const tooSmall = state.zones.some(z => z.x + z.w > w || z.y + z.h > h);
    if (tooSmall) {
      showToast("Certaines zones dépassent : ajuste-les d'abord");
      return;
    }
    state.gardenW = w;
    state.gardenH = h;
    saveState();
    renderCanvasSize();
    renderZones();
    updateStats();
    showToast("Dimensions mises à jour");
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `mon-potager-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Export terminé");
  });

  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.zones)) throw new Error("format invalide");
        state = Object.assign(defaultState(), parsed);
        saveState();
        renderCanvasSize();
        renderZones();
        renderLegend();
        updateStats();
        renderList();
        settingsModalOverlay.hidden = true;
        showToast("Import réussi");
      } catch (e) {
        showToast("Fichier invalide");
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  resetBtn.addEventListener("click", () => {
    if (!confirm("Supprimer toutes les zones et réinitialiser le potager ?")) return;
    state = defaultState();
    saveState();
    renderCanvasSize();
    renderZones();
    renderLegend();
    updateStats();
    renderList();
    settingsModalOverlay.hidden = true;
    showToast("Potager réinitialisé");
  });

  /* ===================== Init ===================== */
  function init() {
    initTheme();
    if (versionTag) versionTag.textContent = "Mon Potager · v1";
    renderCanvasSize();
    renderZones();
    renderLegend();
    updateStats();
    renderList();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
      });
    }
  }

  init();
})();
