(() => {
  "use strict";

  /* ===================== Constantes ===================== */
  const STORAGE_KEY = "potager-state-v1";
  const THEME_KEY = "potager-theme";
  const BASE_PX_PER_M = 56; // échelle de référence du plan (à 100%)
  let PX_PER_M = BASE_PX_PER_M;
  const MIN_ZOOM = 0.35;
  const MAX_ZOOM = 1.6;
  const ZOOM_KEY = "potager-zoom";
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
      gelif: true,
      eau: "eleve",
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
      gelif: true,
      eau: "eleve",
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
      gelif: true,
      eau: "modere",
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
      gelif: false,
      eau: "modere",
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
      gelif: false,
      eau: "modere",
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
      gelif: false,
      eau: "modere",
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
      gelif: true,
      eau: "eleve",
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
      gelif: true,
      eau: "modere",
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
      gelif: true,
      eau: "eleve",
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
      gelif: false,
      eau: "eleve",
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
      gelif: true,
      eau: "eleve",
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
      gelif: true,
      eau: "eleve",
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
      gelif: false,
      eau: "faible",
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
      gelif: false,
      eau: "modere",
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
      gelif: true,
      eau: "modere",
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

  // Périodes de semis/plantation et de récolte par mois (1=janvier … 12=décembre),
  // dérivées des mêmes informations que la fiche culture, pour les rappels du mois.
  const PLANT_MONTHS = {
    tomate: { semis: [2, 3, 4, 5], recolte: [7, 8, 9, 10] },
    courgette: { semis: [4, 5, 6], recolte: [7, 8, 9] },
    patate: { semis: [3, 4], recolte: [6, 7, 8, 9] },
    carotte: { semis: [3, 4, 5, 6, 7], recolte: [6, 7, 8, 9, 10] },
    salade: { semis: [2, 3, 4, 5, 6, 7, 8, 9], recolte: [3, 4, 5, 6, 7, 8, 9, 10] },
    oignon: { semis: [3, 4, 10, 11], recolte: [7, 8] },
    fraise: { semis: [3, 8, 9, 10], recolte: [5, 6, 7] },
    haricot: { semis: [5, 6, 7], recolte: [7, 8, 9] },
    poivron: { semis: [2, 3], recolte: [7, 8, 9, 10] },
    radis: { semis: [3, 4, 5, 6, 7, 8, 9], recolte: [3, 4, 5, 6, 7, 8, 9, 10] },
    courge: { semis: [4, 5], recolte: [9, 10] },
    aubergine: { semis: [2, 3], recolte: [7, 8, 9, 10] },
    ail: { semis: [10, 11, 2, 3], recolte: [6, 7] },
    petitpois: { semis: [2, 3, 4, 5, 9], recolte: [5, 6, 7] },
    herbes: { semis: [4, 5], recolte: [5, 6, 7, 8, 9, 10] },
  };

  const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  // Rappels du mois en cours : semis à prévoir (planches pas encore datées) et
  // récoltes probables, en croisant la date d'aujourd'hui avec les planches
  // de l'année active.
  function computeMonthlyTasks() {
    const month = new Date().getMonth() + 1;
    const tasks = [];
    state.zones.forEach(zone => {
      const months = PLANT_MONTHS[zone.plantId];
      if (!months) return;
      const plant = getPlant(zone);
      if (months.recolte.includes(month)) {
        tasks.push({ type: "recolte", zone: zone, plant: plant });
      }
      if (months.semis.includes(month) && !zone.date) {
        tasks.push({ type: "semis", zone: zone, plant: plant });
      }
    });
    return tasks;
  }

  /* ===================== Rotation des cultures ===================== */
  // Familles botaniques : la même famille épuise/attire les mêmes éléments du sol
  // et les mêmes maladies/parasites, d'où l'intérêt de ne pas la replanter au même
  // endroit d'une année sur l'autre. "herbes" et "autre" ne sont pas classées
  // (mélange de familles trop variable pour être fiable).
  const PLANT_FAMILY = {
    tomate: "Solanacées",
    patate: "Solanacées",
    poivron: "Solanacées",
    aubergine: "Solanacées",
    courgette: "Cucurbitacées",
    courge: "Cucurbitacées",
    haricot: "Fabacées (légumineuses)",
    petitpois: "Fabacées (légumineuses)",
    carotte: "Apiacées",
    radis: "Brassicacées",
    oignon: "Alliacées",
    ail: "Alliacées",
    salade: "Astéracées",
    fraise: "Rosacées",
  };

  // Rotation classique en 4 temps : légumes-fruits gourmands, puis légumineuses
  // qui régénèrent l'azote, puis légumes-feuilles qui en profitent, puis
  // racines/alliacées peu exigeantes avant de relancer le cycle.
  const ROTATION_ORDER = ["fruits", "legumineuses", "feuilles", "racines"];
  const ROTATION_GROUP_LABELS = {
    fruits: "légumes-fruits",
    legumineuses: "légumineuses",
    feuilles: "légumes-feuilles",
    racines: "racines & alliacées",
  };
  const FAMILY_TO_GROUP = {
    "Solanacées": "fruits",
    "Cucurbitacées": "fruits",
    "Fabacées (légumineuses)": "legumineuses",
    "Astéracées": "feuilles",
    "Rosacées": "feuilles",
    "Apiacées": "racines",
    "Brassicacées": "racines",
    "Alliacées": "racines",
  };

  function plantsInGroup(group) {
    return PLANTS.filter(p => FAMILY_TO_GROUP[PLANT_FAMILY[p.id]] === group);
  }

  // Que planter la prochaine fois à cet endroit, pour respecter le cycle ?
  function getNextRotationSuggestion(zone) {
    const family = PLANT_FAMILY[zone.plantId];
    if (!family) return null;
    const currentGroup = FAMILY_TO_GROUP[family];
    if (!currentGroup) return null;
    const idx = ROTATION_ORDER.indexOf(currentGroup);
    const nextGroup = ROTATION_ORDER[(idx + 1) % ROTATION_ORDER.length];
    const examples = plantsInGroup(nextGroup).map(p => p.name).join(", ");
    return {
      currentGroupLabel: ROTATION_GROUP_LABELS[currentGroup],
      nextGroupLabel: ROTATION_GROUP_LABELS[nextGroup],
      examples: examples,
    };
  }

  function zonesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function extractYearNumber(label) {
    const m = String(label || "").match(/\d{4}/);
    return m ? parseInt(m[0], 10) : null;
  }

  function findPreviousYearId() {
    const ids = Object.keys(yearsData.years).filter(id => id !== yearsData.currentYearId);
    if (ids.length === 0) return null;
    const currentNum = extractYearNumber(state.label);
    if (currentNum !== null) {
      const numbered = ids
        .map(id => ({ id: id, num: extractYearNumber(yearsData.years[id].label), createdAt: yearsData.years[id].createdAt || 0 }))
        .filter(y => y.num !== null && y.num < currentNum);
      if (numbered.length > 0) {
        numbered.sort((a, b) => (b.num - a.num) || (b.createdAt - a.createdAt));
        return numbered[0].id;
      }
    }
    // Repli : l'année créée juste avant celle-ci (labels non numériques)
    const currentCreatedAt = state.createdAt || 0;
    const byTime = ids
      .map(id => ({ id: id, createdAt: yearsData.years[id].createdAt || 0 }))
      .filter(y => y.createdAt < currentCreatedAt);
    if (byTime.length > 0) {
      byTime.sort((a, b) => b.createdAt - a.createdAt);
      return byTime[0].id;
    }
    return null;
  }

  // Vérifie une zone (position + plante) contre la famille plantée au même
  // endroit l'année précédente. Retourne null si tout va bien / pas de donnée.
  function getRotationWarning(zone) {
    const family = PLANT_FAMILY[zone.plantId];
    if (!family) return null;
    const prevId = findPreviousYearId();
    if (!prevId) return null;
    const prevYear = yearsData.years[prevId];
    const conflicts = prevYear.zones.filter(z => PLANT_FAMILY[z.plantId] === family && zonesOverlap(zone, z));
    if (conflicts.length === 0) return null;
    const names = Array.from(new Set(conflicts.map(z => getPlant(z).name))).join(", ");
    return { family: family, prevLabel: prevYear.label, plantNames: names };
  }

  /* ===================== Associations de cultures (compagnonnage) ===================== */
  // Bonnes et mauvaises associations bien établies en jardinage. Limité aux paires
  // documentées de façon assez consensuelle pour rester fiable.
  const GOOD_COMPANIONS = [
    ["tomate", "carotte"], ["tomate", "oignon"], ["tomate", "herbes"],
    ["carotte", "oignon"], ["carotte", "radis"], ["carotte", "salade"], ["carotte", "petitpois"], ["carotte", "ail"],
    ["haricot", "carotte"], ["haricot", "radis"], ["haricot", "patate"], ["haricot", "courgette"],
    ["radis", "salade"], ["petitpois", "radis"],
    ["fraise", "oignon"], ["fraise", "ail"], ["fraise", "salade"],
    ["poivron", "herbes"], ["aubergine", "herbes"],
  ];
  const BAD_COMPANIONS = [
    ["tomate", "patate"], // même famille, sensibles au mildiou
    ["haricot", "oignon"], ["haricot", "ail"],
    ["petitpois", "oignon"], ["petitpois", "ail"],
  ];

  function companionRelation(idA, idB) {
    const isPair = (pair) => (pair[0] === idA && pair[1] === idB) || (pair[0] === idB && pair[1] === idA);
    if (BAD_COMPANIONS.some(isPair)) return "bad";
    if (GOOD_COMPANIONS.some(isPair)) return "good";
    return null;
  }

  function zonesNearby(a, b, margin) {
    return (a.x - margin) < (b.x + b.w) && (a.x + a.w + margin) > b.x &&
           (a.y - margin) < (b.y + b.h) && (a.y + a.h + margin) > b.y;
  }

  // Renvoie les associations (bonnes/mauvaises) avec les planches proches de `zone`
  // dans l'année en cours (à ~0,5 m près, distance de voisinage raisonnable).
  function getCompanionInfo(zone) {
    const NEARBY_MARGIN = 0.5;
    const good = [];
    const bad = [];
    state.zones.forEach(other => {
      if (other.id === zone.id) return;
      if (!zonesNearby(zone, other, NEARBY_MARGIN)) return;
      const relation = companionRelation(zone.plantId, other.plantId);
      if (!relation) return;
      const entry = { zone: other, plant: getPlant(other) };
      if (relation === "good") good.push(entry);
      else bad.push(entry);
    });
    return { good, bad };
  }


  const LOCATION_KEY = "potager-location";
  const WEATHER_CACHE_KEY = "potager-weather-cache";
  const WEATHER_MAX_AGE_MS = 30 * 60 * 1000; // 30 min

  const WEATHER_EMOJI = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌦️",
    56: "🌧️", 57: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️",
    66: "🌧️", 67: "🌧️",
    71: "🌨️", 73: "🌨️", 75: "🌨️", 77: "🌨️",
    80: "🌦️", 81: "🌧️", 82: "⛈️",
    85: "🌨️", 86: "🌨️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };

  function weatherEmoji(code) {
    return WEATHER_EMOJI[code] || "🌡️";
  }

  function loadLocation() {
    try {
      const raw = localStorage.getItem(LOCATION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocation(loc) {
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    } catch (e) { /* ignore */ }
  }

  function loadWeatherCache() {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveWeatherCache(data) {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  let currentWeather = loadWeatherCache(); // { fetchedAt, lat, lon, temp, code, min, max, precipSum, precipProb }
  let currentAdvice = computeWeatherAdvice(currentWeather);

  function computeWeatherAdvice(w) {
    if (!w) return { frostRisk: false, rainLikely: false, heatWave: false, messages: [] };
    const frostRisk = typeof w.min === "number" && w.min <= 2;
    const rainLikely = (typeof w.precipSum === "number" && w.precipSum >= 3) ||
                        (typeof w.precipProb === "number" && w.precipProb >= 60);
    const heatWave = typeof w.max === "number" && w.max >= 30;

    const messages = [];
    if (frostRisk) {
      messages.push({ icon: "❄️", text: "Risque de gel (min " + Math.round(w.min) + "°C) : protège les cultures sensibles (voile, cloche, rentre les pots)." });
    }
    if (rainLikely) {
      messages.push({ icon: "🌧️", text: "Pluie prévue aujourd'hui : inutile d'arroser, la nature s'en charge." });
    } else if (heatWave) {
      messages.push({ icon: "☀️", text: "Forte chaleur (" + Math.round(w.max) + "°C) : arrose tôt le matin ou en soirée, paille pour garder l'humidité." });
    } else {
      messages.push({ icon: "💧", text: "Pas de pluie prévue : vérifie l'humidité du sol avant d'arroser." });
    }
    return { frostRisk, rainLikely, heatWave, messages };
  }

  function zoneWeatherNote(zone) {
    const info = getPlantInfo(zone);
    if (!info || !currentWeather) return null;
    if (info.gelif && currentAdvice.frostRisk) {
      return { icon: "❄️", text: "Cette culture craint le gel et un risque de gel est prévu : pense à la protéger." };
    }
    if (info.eau === "eleve" && !currentAdvice.rainLikely) {
      return { icon: "💧", text: "Cette culture a des besoins en eau élevés et aucune pluie n'est prévue : pense à l'arroser." };
    }
    return null;
  }

  function zoneWeatherBadge(zone) {
    const info = getPlantInfo(zone);
    if (!info || !currentWeather) return null;
    if (info.gelif && currentAdvice.frostRisk) return "❄️";
    if (info.eau === "eleve" && !currentAdvice.rainLikely) return "💧";
    return null;
  }

  async function fetchWeatherForLocation(loc) {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + loc.lat +
      "&longitude=" + loc.lon +
      "&current=temperature_2m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max" +
      "&forecast_days=1&timezone=auto";
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather http " + res.status);
    const json = await res.json();
    const data = {
      fetchedAt: Date.now(),
      lat: loc.lat,
      lon: loc.lon,
      temp: json.current ? json.current.temperature_2m : null,
      code: json.current ? json.current.weather_code : null,
      max: json.daily ? json.daily.temperature_2m_max[0] : null,
      min: json.daily ? json.daily.temperature_2m_min[0] : null,
      precipSum: json.daily ? json.daily.precipitation_sum[0] : null,
      precipProb: json.daily ? json.daily.precipitation_probability_max[0] : null,
    };
    currentWeather = data;
    currentAdvice = computeWeatherAdvice(data);
    saveWeatherCache(data);
    return data;
  }

  async function searchCity(query) {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(query) + "&count=5&language=fr&format=json";
    const res = await fetch(url);
    if (!res.ok) throw new Error("geocoding http " + res.status);
    const json = await res.json();
    return json.results || [];
  }

  async function reverseGeocode(lat, lon) {
    try {
      const url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
        lat + "&longitude=" + lon + "&localityLanguage=fr";
      const res = await fetch(url);
      if (!res.ok) throw new Error("reverse geocode http " + res.status);
      const json = await res.json();
      const place = json.city || json.locality || json.principalSubdivision || null;
      const country = json.countryName || null;
      if (place && country && json.countryCode !== "FR") return place + ", " + country;
      return place;
    } catch (e) {
      return null;
    }
  }

  /* ===================== État (par année) ===================== */
  const YEARS_KEY = "potager-years-v1";

  function defaultYearData(label) {
    return {
      label: label,
      gardenW: 4,
      gardenH: 3,
      zones: [],
      memo: [],
      budget: [],
      createdAt: Date.now(),
    };
  }

  function migrateOldSingleYearState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.zones)) return null;
      const base = defaultYearData(String(new Date().getFullYear()));
      return Object.assign(base, parsed, { label: base.label, createdAt: base.createdAt });
    } catch (e) {
      return null;
    }
  }

  function loadYearsData() {
    let data;
    try {
      const raw = localStorage.getItem(YEARS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.years && parsed.currentYearId && parsed.years[parsed.currentYearId]) {
          data = parsed;
        }
      }
    } catch (e) {}
    if (!data) {
      // Migration depuis l'ancien format mono-année (une seule saison, pas d'historique)
      const migrated = migrateOldSingleYearState();
      const label = migrated ? migrated.label : String(new Date().getFullYear());
      const id = "y" + Date.now().toString(36);
      const years = {};
      years[id] = migrated || defaultYearData(label);
      data = { currentYearId: id, years: years };
    }
    // Compatibilité : les années créées avant l'ajout du mémo/budget n'ont pas ces champs
    Object.values(data.years).forEach(y => {
      if (!Array.isArray(y.memo)) y.memo = [];
      if (!Array.isArray(y.budget)) y.budget = [];
      y.zones.forEach(z => {
        if (!Array.isArray(z.photos)) z.photos = [];
        if (!Array.isArray(z.harvest)) z.harvest = [];
      });
    });
    return data;
  }

  function saveYearsData() {
    try {
      localStorage.setItem(YEARS_KEY, JSON.stringify(yearsData));
    } catch (e) {
      showToast("Impossible d'enregistrer (stockage plein ?)");
    }
  }

  function sortedYearIds() {
    return Object.keys(yearsData.years).sort((a, b) => {
      const ca = yearsData.years[a].createdAt || 0;
      const cb = yearsData.years[b].createdAt || 0;
      return cb - ca; // plus récent d'abord
    });
  }

  function switchYear(yearId) {
    if (!yearsData.years[yearId] || yearId === yearsData.currentYearId) return;
    yearsData.currentYearId = yearId;
    state = yearsData.years[yearId];
    saveYearsData();
    fullRerender();
  }

  function createYear(label, mode) {
    const cleanLabel = (label || "").trim() || String(new Date().getFullYear());
    const id = "y" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    let data;
    if (mode === "duplicate") {
      data = JSON.parse(JSON.stringify(state));
      data.label = cleanLabel;
      data.createdAt = Date.now();
      data.zones.forEach(z => { z.locked = false; });
      data.memo = []; // le mémo est spécifique à la saison, on repart à zéro
      data.budget = []; // idem pour le budget
    } else {
      data = defaultYearData(cleanLabel);
      data.gardenW = state.gardenW;
      data.gardenH = state.gardenH;
    }
    yearsData.years[id] = data;
    yearsData.currentYearId = id;
    state = data;
    saveYearsData();
    fullRerender();
    return id;
  }

  function renameYear(yearId, newLabel) {
    const y = yearsData.years[yearId];
    if (!y) return;
    const clean = (newLabel || "").trim();
    if (!clean) return;
    y.label = clean;
    saveYearsData();
    renderYearBar();
  }

  function deleteYear(yearId) {
    const ids = Object.keys(yearsData.years);
    if (ids.length <= 1) {
      showToast("Impossible de supprimer la seule année");
      return;
    }
    delete yearsData.years[yearId];
    if (yearsData.currentYearId === yearId) {
      const remaining = sortedYearIds();
      yearsData.currentYearId = remaining[0];
      state = yearsData.years[yearsData.currentYearId];
    }
    saveYearsData();
    fullRerender();
  }

  function fullRerender() {
    renderCanvasSize();
    renderZones();
    renderLegend();
    updateStats();
    renderList();
    renderYearBar();
  }

  let yearsData = loadYearsData();
  let state = yearsData.years[yearsData.currentYearId];
  let activeZoneId = null; // zone en cours d'édition dans la modale
  let selectedPlantId = PLANTS[0].id;

  function defaultState() {
    return {
      gardenW: 4,
      gardenH: 3,
      zones: [],
    };
  }

  function saveState() {
    saveYearsData();
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
  const zoomInBtn = el("zoomInBtn");
  const zoomOutBtn = el("zoomOutBtn");
  const zoomFitBtn = el("zoomFitBtn");
  const zoomLabel = el("zoomLabel");
  const legendGrid = el("legendGrid");
  const zoneList = el("zoneList");
  const listEmpty = el("listEmpty");
  const addZoneBtn = el("addZoneBtn");

  const weatherCard = el("weatherCard");
  const weatherPrompt = el("weatherPrompt");
  const weatherEnableBtn = el("weatherEnableBtn");
  const weatherContent = el("weatherContent");
  const weatherIcon = el("weatherIcon");
  const weatherTemp = el("weatherTemp");
  const weatherMinMax = el("weatherMinMax");
  const weatherLocationLabel = el("weatherLocationLabel");
  const weatherRefreshBtn = el("weatherRefreshBtn");
  const weatherMessages = el("weatherMessages");
  const weatherError = el("weatherError");

  const infoWeatherNote = el("infoWeatherNote");
  const infoRotationNote = el("infoRotationNote");
  const infoRotationSuggestion = el("infoRotationSuggestion");
  const infoCompanionSection = el("infoCompanionSection");
  const infoCompanionList = el("infoCompanionList");
  const infoPhotoGrid = el("infoPhotoGrid");
  const photoFileInput = el("photoFileInput");
  const addPhotoBtn = el("addPhotoBtn");
  const photoLightbox = el("photoLightbox");
  const photoLightboxImg = el("photoLightboxImg");
  const photoLightboxClose = el("photoLightboxClose");
  const harvestSummary = el("harvestSummary");
  const harvestList = el("harvestList");
  const harvestEmpty = el("harvestEmpty");
  const harvestQty = el("harvestQty");
  const harvestUnit = el("harvestUnit");
  const harvestAddBtn = el("harvestAddBtn");

  const locationLabelSettings = el("locationLabelSettings");
  const useMyLocationBtn = el("useMyLocationBtn");
  const citySearchInput = el("citySearchInput");
  const citySearchBtn = el("citySearchBtn");
  const citySearchResults = el("citySearchResults");

  const infoModalOverlay = el("infoModalOverlay");
  const infoModalClose = el("infoModalClose");
  const infoEmoji = el("infoEmoji");
  const infoName = el("infoName");
  const infoVarietyLine = el("infoVarietyLine");
  const infoVarietySearch = el("infoVarietySearch");
  const infoVarietySearchLink = el("infoVarietySearchLink");
  const infoZoneCard = el("infoZoneCard");
  const infoFiche = el("infoFiche");
  const infoFicheeSpeciesName = el("infoFicheeSpeciesName");
  const infoFicheTitle = document.querySelector(".info-fiche-title");
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
  const infoLockBtn = el("infoLockBtn");
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
  const zoneRotationHint = el("zoneRotationHint");
  const zoneDate = el("zoneDate");
  const zoneNotes = el("zoneNotes");
  const zoneLocked = el("zoneLocked");
  const zoneDeleteBtn = el("zoneDeleteBtn");
  const zoneSaveBtn = el("zoneSaveBtn");

  const settingsModalOverlay = el("settingsModalOverlay");
  const settingsModalClose = el("settingsModalClose");
  const gardenWInput = el("gardenW");
  const gardenHInput = el("gardenH");
  const applyGardenSize = el("applyGardenSize");
  const exportPdfBtn = el("exportPdfBtn");
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
    const duration = Math.max(2200, Math.min(6000, msg.length * 55));
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, duration);
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

  /* ===================== Zoom du plan ===================== */
  function loadZoom() {
    const raw = parseFloat(localStorage.getItem(ZOOM_KEY));
    if (isNaN(raw)) return 1;
    return clamp(raw, MIN_ZOOM, MAX_ZOOM);
  }
  function saveZoom(z) {
    try { localStorage.setItem(ZOOM_KEY, String(z)); } catch (e) {}
  }
  let zoomLevel = loadZoom();

  function setZoom(newZoom) {
    zoomLevel = clamp(Math.round(newZoom * 20) / 20, MIN_ZOOM, MAX_ZOOM); // pas de 5%
    PX_PER_M = BASE_PX_PER_M * zoomLevel;
    saveZoom(zoomLevel);
    zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
    zoomInBtn.disabled = zoomLevel >= MAX_ZOOM;
    zoomOutBtn.disabled = zoomLevel <= MIN_ZOOM;
    renderCanvasSize();
    renderZones();
  }

  function fitZoomToGarden() {
    const containerWidth = canvasScroll.clientWidth || 300;
    const availW = Math.max(100, containerWidth - 26 - 12);
    const availH = Math.max(100, window.innerHeight * 0.5 - 20);
    const neededW = state.gardenW * BASE_PX_PER_M;
    const neededH = state.gardenH * BASE_PX_PER_M;
    const fit = Math.min(availW / neededW, availH / neededH, MAX_ZOOM);
    setZoom(fit);
  }

  zoomInBtn.addEventListener("click", () => setZoom(zoomLevel + 0.1));
  zoomOutBtn.addEventListener("click", () => setZoom(zoomLevel - 0.1));
  zoomFitBtn.addEventListener("click", () => {
    fitZoomToGarden();
    showToast("Vue ajustée au potager");
  });

  /* ===================== Pincement à deux doigts (pinch-to-zoom) ===================== */
  (function setupPinchZoom() {
    let startDist = null;
    let startZoom = 1;
    let rafId = null;

    function touchDist(t1, t2) {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
    function touchMid(t1, t2) {
      return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    }

    canvasScroll.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        startDist = touchDist(e.touches[0], e.touches[1]);
        startZoom = zoomLevel;
      }
    }, { passive: true });

    canvasScroll.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && startDist) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        const newDist = touchDist(t1, t2);
        const targetZoom = clamp(startZoom * (newDist / startDist), MIN_ZOOM, MAX_ZOOM);
        const mid = touchMid(t1, t2);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = canvasScroll.getBoundingClientRect();
          const screenX = mid.x - rect.left;
          const screenY = mid.y - rect.top;
          const contentXMeters = (canvasScroll.scrollLeft + screenX) / PX_PER_M;
          const contentYMeters = (canvasScroll.scrollTop + screenY) / PX_PER_M;

          zoomLevel = targetZoom;
          PX_PER_M = BASE_PX_PER_M * zoomLevel;
          zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
          repositionZonesLive();

          canvasScroll.scrollLeft = contentXMeters * PX_PER_M - screenX;
          canvasScroll.scrollTop = contentYMeters * PX_PER_M - screenY;
        });
      }
    }, { passive: false });

    function endPinch(e) {
      if (startDist && e.touches.length < 2) {
        startDist = null;
        setZoom(zoomLevel); // arrondit au pas de 5% + rendu propre complet
      }
    }
    canvasScroll.addEventListener("touchend", endPinch);
    canvasScroll.addEventListener("touchcancel", endPinch);
  })();

  function repositionZonesLive() {
    renderCanvasSize();
    gardenCanvas.querySelectorAll(".zone").forEach(node => {
      const zone = state.zones.find(z => z.id === node.dataset.id);
      if (!zone) return;
      node.style.left = (zone.x * PX_PER_M) + "px";
      node.style.top = (zone.y * PX_PER_M) + "px";
      node.style.width = (zone.w * PX_PER_M) + "px";
      node.style.height = (zone.h * PX_PER_M) + "px";
    });
  }

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
    renderTasksBanner();
  }

  /* ===================== Bannière des tâches du mois ===================== */
  const tasksBanner = el("tasksBanner");
  const tasksBannerToggle = el("tasksBannerToggle");
  const tasksBannerMonth = el("tasksBannerMonth");
  const tasksBannerCount = el("tasksBannerCount");
  const tasksBannerList = el("tasksBannerList");

  function renderTasksBanner() {
    const tasks = computeMonthlyTasks();
    if (tasks.length === 0) {
      tasksBanner.hidden = true;
      return;
    }
    tasksBanner.hidden = false;
    const month = new Date().getMonth() + 1;
    tasksBannerMonth.textContent = MONTH_NAMES[month - 1];
    tasksBannerCount.textContent = tasks.length;

    tasksBannerList.innerHTML = "";
    tasks.forEach(task => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "task-row";
      const label = task.zone.variety ? `${task.plant.name} (${task.zone.variety})` : task.plant.name;
      if (task.type === "recolte") {
        row.innerHTML = `<span class="task-row-emoji">🧺</span><span>C'est la période de récolte pour tes <strong>${escapeHtml(label)}</strong>.</span>`;
      } else {
        row.innerHTML = `<span class="task-row-emoji">🌱</span><span>C'est le moment de semer/planter tes <strong>${escapeHtml(label)}</strong> (pas encore de date de plantation notée).</span>`;
      }
      row.addEventListener("click", () => openInfoModal(task.zone.id));
      tasksBannerList.appendChild(row);
    });
  }

  tasksBannerToggle.addEventListener("click", () => {
    const isOpen = tasksBanner.classList.toggle("open");
    tasksBannerList.hidden = !isOpen;
  });

  function buildZoneEl(zone) {
    const plant = getPlant(zone);
    const node = document.createElement("div");
    node.className = "zone" + (zone.locked ? " zone-locked" : "");
    node.dataset.id = zone.id;
    node.style.setProperty("--zone-color", plant.color);
    node.style.left = (zone.x * PX_PER_M) + "px";
    node.style.top = (zone.y * PX_PER_M) + "px";
    node.style.width = (zone.w * PX_PER_M) + "px";
    node.style.height = (zone.h * PX_PER_M) + "px";
    const badge = zoneWeatherBadge(zone);
    const rotationWarning = getRotationWarning(zone);
    node.innerHTML = `
      ${badge ? `<span class="zone-badge" title="Alerte météo">${badge}</span>` : ""}
      ${zone.locked ? `<span class="zone-lock-badge" title="Planche verrouillée — appui long pour l'ouvrir">🔒</span>` : ""}
      ${rotationWarning ? `<span class="zone-rotation-badge" title="Même famille (${escapeHtml(rotationWarning.family)}) qu'en ${escapeHtml(rotationWarning.prevLabel)} à cet endroit">🔁</span>` : ""}
      <span class="zone-emoji">${plant.emoji}</span>
      <span class="zone-name">${escapeHtml(plant.name)}</span>
      ${zone.variety ? `<span class="zone-variety">${escapeHtml(zone.variety)}</span>` : ""}
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
      if (zone.locked) return;
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
        renderZones();
      }
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
    });

    node.addEventListener("pointerdown", (e) => {
      if (e.target === handle) return;

      if (zone.locked) {
        // Planche verrouillée : un appui long ouvre sa fiche (pour la déverrouiller
        // ou la modifier), un tap rapide ou un glissement (pour naviguer sur la
        // carte) ne fait rien — on ne capture pas le pointeur pour laisser le
        // défilement natif fonctionner normalement au travers de la planche.
        const startX = e.clientX, startY = e.clientY;
        let cancelled = false;

        const longPressTimer = setTimeout(() => {
          if (cancelled) return;
          cleanup();
          node.classList.remove("zone-highlight");
          void node.offsetWidth;
          node.classList.add("zone-highlight");
          openInfoModal(zone.id);
          setTimeout(() => node.classList.remove("zone-highlight"), 1500);
        }, 550);

        function onMoveCheck(ev) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > MOVE_THRESHOLD) cancel();
        }
        function cancel() {
          cancelled = true;
          cleanup();
        }
        function cleanup() {
          clearTimeout(longPressTimer);
          window.removeEventListener("pointermove", onMoveCheck);
          window.removeEventListener("pointerup", cancel);
          window.removeEventListener("pointercancel", cancel);
        }
        window.addEventListener("pointermove", onMoveCheck);
        window.addEventListener("pointerup", cancel, { once: true });
        window.addEventListener("pointercancel", cancel, { once: true });
        return;
      }

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
          updateStats();
          renderZones();
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
    legendGrid.innerHTML = "";
    if (state.zones.length === 0) {
      legendGrid.innerHTML = `<p class="empty-sub" style="margin:0;">Ajoute une zone pour voir la légende.</p>`;
      return;
    }
    state.zones.forEach(zone => {
      const plant = getPlant(zone);
      const item = document.createElement("button");
      item.type = "button";
      item.className = "legend-item";
      item.innerHTML = `
        <span class="legend-dot" style="background:${plant.color}"></span>
        <span class="legend-emoji">${plant.emoji}</span>
        <span class="legend-text">
          <span class="legend-name">${escapeHtml(plant.name)}</span>
          ${zone.variety ? `<span class="legend-variety">${escapeHtml(zone.variety)}</span>` : ""}
        </span>
      `;
      item.addEventListener("click", () => locateZoneOnPlan(zone.id));
      legendGrid.appendChild(item);
    });
  }

  function locateZoneOnPlan(zoneId) {
    const node = gardenCanvas.querySelector(`.zone[data-id="${zoneId}"]`);
    if (!node) return;
    const RULER_W = 26, RULER_H = 20;
    const absX = RULER_W + node.offsetLeft;
    const absY = RULER_H + node.offsetTop;
    const targetLeft = absX + node.offsetWidth / 2 - canvasScroll.clientWidth / 2;
    const targetTop = absY + node.offsetHeight / 2 - canvasScroll.clientHeight / 2;
    canvasScroll.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
    node.classList.remove("zone-highlight");
    // force le reflow pour pouvoir relancer l'animation si on clique plusieurs fois
    void node.offsetWidth;
    node.classList.add("zone-highlight");
    setTimeout(() => node.classList.remove("zone-highlight"), 1500);
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
      if (zone.variety) sub = `${escapeHtml(zone.variety)} · ${sub}`;
      if (zone.date) sub += ` · planté le ${formatDate(zone.date)}`;
      card.innerHTML = `
        <span class="zone-card-emoji">${plant.emoji}</span>
        <div class="zone-card-info">
          <div class="zone-card-title">${zone.locked ? "🔒 " : ""}${escapeHtml(plant.name)}</div>
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
        updateZoneRotationHint();
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

    if (zone.variety) {
      const query = encodeURIComponent(`${plant.name} ${zone.variety} conseils de culture`);
      infoVarietySearchLink.href = `https://www.google.com/search?q=${query}`;
      infoVarietySearch.hidden = false;
    } else {
      infoVarietySearch.hidden = true;
    }

    let zoneCardHtml = `<strong>${fmtM(zone.w)}×${fmtM(zone.h)} m</strong> · ${(zone.w * zone.h).toFixed(2).replace(".", ",")} m²`;
    if (zone.date) zoneCardHtml += ` · planté le ${formatDate(zone.date)}`;
    infoZoneCard.innerHTML = zoneCardHtml;

    infoFicheeSpeciesName.textContent = plant.name.toLowerCase();

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
      infoFicheTitle.hidden = false;
    } else {
      infoFiche.hidden = true;
      infoFicheTitle.hidden = true;
    }

    if (zone.notes) {
      infoNotesBlock.hidden = false;
      infoNotesBlock.innerHTML = `<strong>Notes</strong><br>${escapeHtml(zone.notes)}`;
    } else {
      infoNotesBlock.hidden = true;
    }

    infoModalOverlay.hidden = false;
    updateInfoWeatherNote();
    updateInfoRotationNote(zone);
    updateInfoRotationSuggestion(zone);
    updateInfoCompanionSection(zone);
    renderPhotoGrid(zone);
    renderHarvestList(zone);
    updateInfoLockBtn(zone);
  }

  function updateInfoRotationNote(zone) {
    const family = PLANT_FAMILY[zone.plantId];
    if (!family) {
      infoRotationNote.hidden = true;
      return;
    }
    const prevId = findPreviousYearId();
    if (!prevId) {
      infoRotationNote.hidden = true;
      return;
    }
    const warning = getRotationWarning(zone);
    infoRotationNote.hidden = false;
    if (warning) {
      infoRotationNote.className = "info-rotation-note warn";
      infoRotationNote.innerHTML = `🔁 <strong>Rotation :</strong> en ${escapeHtml(warning.prevLabel)}, il y avait déjà ${escapeHtml(warning.plantNames)} ici (même famille : ${escapeHtml(family)}). Mieux vaut alterner les familles d'une année sur l'autre pour préserver le sol.`;
    } else {
      infoRotationNote.className = "info-rotation-note ok";
      infoRotationNote.innerHTML = `✅ <strong>Rotation :</strong> pas de culture de la famille des ${escapeHtml(family)} à cet endroit en ${escapeHtml(yearsData.years[prevId].label)}.`;
    }
  }

  function updateInfoRotationSuggestion(zone) {
    const suggestion = getNextRotationSuggestion(zone);
    if (!suggestion) {
      infoRotationSuggestion.hidden = true;
      return;
    }
    infoRotationSuggestion.hidden = false;
    infoRotationSuggestion.innerHTML = `📅 <span><strong>La prochaine fois ici :</strong> plutôt des ${escapeHtml(suggestion.nextGroupLabel)} (ex : ${escapeHtml(suggestion.examples)}), après ces ${escapeHtml(suggestion.currentGroupLabel)}.</span>`;
  }

  function updateInfoCompanionSection(zone) {
    const { good, bad } = getCompanionInfo(zone);
    if (good.length === 0 && bad.length === 0) {
      infoCompanionSection.hidden = true;
      return;
    }
    infoCompanionSection.hidden = false;
    infoCompanionList.innerHTML = "";
    bad.forEach(entry => {
      const row = document.createElement("div");
      row.className = "companion-row bad";
      const label = entry.zone.variety ? `${entry.plant.name} (${entry.zone.variety})` : entry.plant.name;
      row.innerHTML = `⚠️ <span>Association déconseillée avec <strong>${escapeHtml(label)}</strong> à proximité.</span>`;
      infoCompanionList.appendChild(row);
    });
    good.forEach(entry => {
      const row = document.createElement("div");
      row.className = "companion-row good";
      const label = entry.zone.variety ? `${entry.plant.name} (${entry.zone.variety})` : entry.plant.name;
      row.innerHTML = `🤝 <span>Bonne association avec <strong>${escapeHtml(label)}</strong> à proximité.</span>`;
      infoCompanionList.appendChild(row);
    });
  }

  /* ===================== Photos par planche ===================== */
  function renderPhotoGrid(zone) {
    infoPhotoGrid.innerHTML = "";
    (zone.photos || []).slice().reverse().forEach(photo => {
      const thumb = document.createElement("div");
      thumb.className = "info-photo-thumb";
      thumb.innerHTML = `
        <img src="${photo.dataUrl}" alt="Photo du ${formatDate(photo.date)}">
        <span class="photo-date">${formatDate(photo.date)}</span>
        <button class="photo-delete" aria-label="Supprimer la photo">✕</button>
      `;
      thumb.querySelector("img").addEventListener("click", () => openPhotoLightbox(photo.dataUrl));
      thumb.querySelector(".photo-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        zone.photos = zone.photos.filter(p => p.id !== photo.id);
        saveState();
        renderPhotoGrid(zone);
      });
      infoPhotoGrid.appendChild(thumb);
    });
  }

  function openPhotoLightbox(dataUrl) {
    photoLightboxImg.src = dataUrl;
    photoLightbox.hidden = false;
  }
  photoLightboxClose.addEventListener("click", () => { photoLightbox.hidden = true; photoLightboxImg.src = ""; });
  photoLightbox.addEventListener("click", (e) => { if (e.target === photoLightbox) { photoLightbox.hidden = true; photoLightboxImg.src = ""; } });

  function compressImageFile(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      reader.onerror = reject;
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        else if (h >= w && h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  addPhotoBtn.addEventListener("click", () => photoFileInput.click());
  photoFileInput.addEventListener("change", async () => {
    const file = photoFileInput.files && photoFileInput.files[0];
    photoFileInput.value = "";
    if (!file) return;
    const zone = state.zones.find(z => z.id === infoZoneId);
    if (!zone) return;
    try {
      addPhotoBtn.disabled = true;
      addPhotoBtn.textContent = "Traitement en cours…";
      const dataUrl = await compressImageFile(file, 900, 0.72);
      if (!Array.isArray(zone.photos)) zone.photos = [];
      zone.photos.push({ id: uid(), date: new Date().toISOString().slice(0, 10), dataUrl: dataUrl });
      saveState();
      renderPhotoGrid(zone);
      showToast("Photo ajoutée");
    } catch (e) {
      showToast("Impossible d'ajouter cette photo (mémoire pleine ?)");
    } finally {
      addPhotoBtn.disabled = false;
      addPhotoBtn.textContent = "📷 Ajouter une photo";
    }
  });

  /* ===================== Carnet de récolte ===================== */
  function renderHarvestList(zone) {
    const entries = zone.harvest || [];
    harvestEmpty.hidden = entries.length > 0;

    if (entries.length > 0) {
      const totals = {};
      entries.forEach(h => { totals[h.unit] = (totals[h.unit] || 0) + h.qty; });
      harvestSummary.hidden = false;
      harvestSummary.innerHTML = Object.keys(totals).map(unit => {
        const v = totals[unit];
        const vTxt = (v % 1 === 0 ? v : v.toFixed(1)).toString().replace(".", ",");
        return `<span class="budget-chip">🧺 ${vTxt} ${escapeHtml(unit)}</span>`;
      }).join("");
    } else {
      harvestSummary.hidden = true;
      harvestSummary.innerHTML = "";
    }

    harvestList.innerHTML = "";
    const sorted = entries.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    sorted.forEach(entry => {
      const row = document.createElement("div");
      row.className = "memo-item";
      const qtyTxt = (entry.qty % 1 === 0 ? entry.qty : entry.qty.toFixed(1)).toString().replace(".", ",");
      row.innerHTML = `
        <span class="harvest-item-qty">${qtyTxt} ${escapeHtml(entry.unit)}</span>
        <div class="budget-item-info">
          <div class="budget-item-date">${formatDate(entry.date)}</div>
        </div>
        <button class="memo-item-delete" aria-label="Supprimer">✕</button>
      `;
      row.querySelector(".memo-item-delete").addEventListener("click", () => {
        zone.harvest = zone.harvest.filter(h => h.id !== entry.id);
        saveState();
        renderHarvestList(zone);
      });
      harvestList.appendChild(row);
    });
  }

  harvestAddBtn.addEventListener("click", () => {
    const qty = parseFloat(harvestQty.value);
    if (isNaN(qty) || qty <= 0) {
      showToast("Indique une quantité valide");
      return;
    }
    const zone = state.zones.find(z => z.id === infoZoneId);
    if (!zone) return;
    if (!Array.isArray(zone.harvest)) zone.harvest = [];
    zone.harvest.push({ id: uid(), qty: qty, unit: harvestUnit.value, date: new Date().toISOString().slice(0, 10) });
    saveState();
    harvestQty.value = "";
    renderHarvestList(zone);
    showToast("Récolte enregistrée");
  });

  function updateInfoLockBtn(zone) {
    infoLockBtn.textContent = zone.locked ? "🔓 Déverrouiller" : "🔒 Verrouiller";
  }

  function closeInfoModal() {
    infoModalOverlay.hidden = true;
    infoZoneId = null;
  }

  infoModalClose.addEventListener("click", closeInfoModal);
  infoModalOverlay.addEventListener("click", (e) => { if (e.target === infoModalOverlay) closeInfoModal(); });
  infoLockBtn.addEventListener("click", () => {
    const zone = state.zones.find(z => z.id === infoZoneId);
    if (!zone) return;
    zone.locked = !zone.locked;
    saveState();
    renderZones();
    renderList();
    updateInfoLockBtn(zone);
    showToast(zone.locked ? "Planche verrouillée" : "Planche déverrouillée");
  });
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
      zone = { x: freeSpot.x, y: freeSpot.y, w: 1, h: 1, plantId: selectedPlantId || PLANTS[0].id, variety: "", date: "", notes: "", locked: false, photos: [], harvest: [] };
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
    zoneLocked.checked = !!zone.locked;
    updateAreaPreview();
    updateZoneRotationHint();

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
  function updateZoneRotationHint() {
    const family = PLANT_FAMILY[selectedPlantId];
    if (!family) { zoneRotationHint.hidden = true; return; }
    const prevId = findPreviousYearId();
    if (!prevId) { zoneRotationHint.hidden = true; return; }
    const tempZone = {
      x: parseFloat(zoneX.value) || 0,
      y: parseFloat(zoneY.value) || 0,
      w: parseFloat(zoneW.value) || 0,
      h: parseFloat(zoneH.value) || 0,
      plantId: selectedPlantId,
    };
    const warning = getRotationWarning(tempZone);
    zoneRotationHint.hidden = false;
    if (warning) {
      zoneRotationHint.className = "info-rotation-note warn";
      zoneRotationHint.innerHTML = `🔁 En ${escapeHtml(warning.prevLabel)}, il y avait déjà ${escapeHtml(warning.plantNames)} ici (${escapeHtml(family)}). Mieux vaut alterner.`;
    } else {
      zoneRotationHint.className = "info-rotation-note ok";
      zoneRotationHint.innerHTML = `✅ Pas de ${escapeHtml(family)} ici en ${escapeHtml(yearsData.years[prevId].label)}.`;
    }
  }
  [zoneW, zoneH, zoneX, zoneY].forEach(input => input.addEventListener("input", () => { updateAreaPreview(); updateZoneRotationHint(); }));

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
      locked: zoneLocked.checked,
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

  /* ===================== Rendu météo ===================== */
  function locationLabel(loc) {
    if (!loc) return "";
    if (loc.label) return loc.label;
    return loc.lat.toFixed(2) + ", " + loc.lon.toFixed(2);
  }

  function renderWeatherCard() {
    const loc = loadLocation();

    if (locationLabelSettings) {
      locationLabelSettings.textContent = loc ? locationLabel(loc) : "Aucune position définie";
    }

    if (!loc) {
      weatherPrompt.hidden = false;
      weatherContent.hidden = true;
      weatherError.hidden = true;
      return;
    }

    weatherPrompt.hidden = true;

    if (!currentWeather) {
      weatherContent.hidden = true;
      weatherError.hidden = false;
      weatherError.textContent = "Météo indisponible pour le moment.";
      return;
    }

    weatherError.hidden = true;
    weatherContent.hidden = false;
    weatherIcon.textContent = weatherEmoji(currentWeather.code);
    weatherTemp.textContent = (currentWeather.temp !== null ? Math.round(currentWeather.temp) : "–") + "°C";
    weatherMinMax.textContent = "min " + Math.round(currentWeather.min) + "° · max " + Math.round(currentWeather.max) + "°";
    weatherLocationLabel.textContent = locationLabel(loc);

    weatherMessages.innerHTML = "";
    currentAdvice.messages.forEach(m => {
      const div = document.createElement("div");
      div.className = "weather-msg";
      div.innerHTML = `<span>${m.icon}</span><span>${escapeHtml(m.text)}</span>`;
      weatherMessages.appendChild(div);
    });

    const age = Date.now() - currentWeather.fetchedAt;
    if (age > WEATHER_MAX_AGE_MS * 4) {
      const stale = document.createElement("div");
      stale.className = "weather-msg weather-msg-stale";
      stale.innerHTML = `<span>⏱️</span><span>Dernière mise à jour il y a longtemps, actualise si tu es en ligne.</span>`;
      weatherMessages.appendChild(stale);
    }
  }

  async function refreshWeather(force) {
    const loc = loadLocation();
    if (!loc) { renderWeatherCard(); return; }
    if (!force && currentWeather && (Date.now() - currentWeather.fetchedAt) < WEATHER_MAX_AGE_MS &&
        currentWeather.lat === loc.lat && currentWeather.lon === loc.lon) {
      renderWeatherCard();
      renderZones();
      return;
    }
    weatherRefreshBtn.classList.add("spinning");
    try {
      await fetchWeatherForLocation(loc);
      renderWeatherCard();
      renderZones();
      if (!infoModalOverlay.hidden) updateInfoWeatherNote();
    } catch (e) {
      if (!currentWeather) {
        weatherContent.hidden = true;
        weatherError.hidden = false;
        weatherError.textContent = "Impossible de récupérer la météo (hors-ligne ?).";
      } else {
        renderWeatherCard();
        showToast("Météo non actualisée (hors-ligne ?)");
      }
    } finally {
      weatherRefreshBtn.classList.remove("spinning");
    }
  }

  function useMyLocation(triggerBtn) {
    if (!("geolocation" in navigator)) {
      showToast("Localisation non disponible sur cet appareil");
      return;
    }
    if (window.isSecureContext === false) {
      showToast("La géolocalisation nécessite une connexion HTTPS. Utilise la recherche par ville.");
      return;
    }
    const btns = [weatherEnableBtn, useMyLocationBtn].filter(Boolean);
    btns.forEach(b => { b.disabled = true; });
    const originalLabel = triggerBtn ? triggerBtn.textContent : null;
    if (triggerBtn) triggerBtn.textContent = "📍 Recherche en cours…";

    function done() {
      btns.forEach(b => { b.disabled = false; });
      if (triggerBtn && originalLabel) triggerBtn.textContent = originalLabel;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        done();
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const loc = { lat, lon, label: "Ma position", source: "geo" };
        saveLocation(loc);
        renderWeatherCard();
        refreshWeather(true);
        if (citySearchResults) citySearchResults.innerHTML = "";
        showToast("Position détectée");

        // Affine le libellé avec le nom de la ville une fois disponible
        reverseGeocode(lat, lon).then(place => {
          if (!place) return;
          const current = loadLocation();
          if (current && current.lat === lat && current.lon === lon) {
            current.label = place;
            saveLocation(current);
            renderWeatherCard();
          }
        });
      },
      (err) => {
        done();
        let msg = "Position indisponible. Essaie la recherche par ville.";
        if (err && err.code === 1) {
          msg = "Localisation refusée : vérifie l'autorisation de position pour ce site (dans les réglages du navigateur), ou utilise la recherche par ville.";
        } else if (err && err.code === 2) {
          msg = "Position indisponible (GPS/réseau). Essaie la recherche par ville.";
        } else if (err && err.code === 3) {
          msg = "La détection a pris trop de temps. Réessaie, ou utilise la recherche par ville.";
        }
        showToast(msg);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 }
    );
  }

  weatherEnableBtn.addEventListener("click", () => useMyLocation(weatherEnableBtn));
  useMyLocationBtn.addEventListener("click", () => useMyLocation(useMyLocationBtn));
  weatherRefreshBtn.addEventListener("click", () => refreshWeather(true));

  citySearchBtn.addEventListener("click", async () => {
    const q = citySearchInput.value.trim();
    if (!q) return;
    citySearchResults.innerHTML = `<p class="empty-sub">Recherche…</p>`;
    try {
      const results = await searchCity(q);
      if (results.length === 0) {
        citySearchResults.innerHTML = `<p class="empty-sub">Aucun résultat.</p>`;
        return;
      }
      citySearchResults.innerHTML = "";
      results.forEach(r => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "city-result";
        const region = r.admin1 ? r.admin1 + ", " : "";
        item.textContent = r.name + " (" + region + r.country + ")";
        item.addEventListener("click", () => {
          const loc = { lat: r.latitude, lon: r.longitude, label: r.name, source: "manual" };
          saveLocation(loc);
          citySearchResults.innerHTML = "";
          citySearchInput.value = "";
          renderWeatherCard();
          refreshWeather(true);
          showToast("Position mise à jour : " + r.name);
        });
        citySearchResults.appendChild(item);
      });
    } catch (e) {
      citySearchResults.innerHTML = `<p class="empty-sub">Recherche impossible (hors-ligne ?).</p>`;
    }
  });

  function updateInfoWeatherNote() {
    if (!infoZoneId) return;
    const zone = state.zones.find(z => z.id === infoZoneId);
    if (!zone) return;
    const note = zoneWeatherNote(zone);
    if (note) {
      infoWeatherNote.hidden = false;
      infoWeatherNote.innerHTML = `<span>${note.icon}</span><span>${escapeHtml(note.text)}</span>`;
    } else {
      infoWeatherNote.hidden = true;
    }
  }

  /* ===================== Sélecteur d'années ===================== */
  const yearSwitchBtn = el("yearSwitchBtn");
  const yearLabelDisplay = el("yearLabelDisplay");
  const yearArchiveTag = el("yearArchiveTag");
  const yearsModalOverlay = el("yearsModalOverlay");
  const yearsModalClose = el("yearsModalClose");
  const yearsList = el("yearsList");
  const addYearBtn = el("addYearBtn");
  const newYearForm = el("newYearForm");
  const newYearLabel = el("newYearLabel");
  const newYearBlankBtn = el("newYearBlankBtn");
  const newYearDuplicateBtn = el("newYearDuplicateBtn");
  const cancelNewYearBtn = el("cancelNewYearBtn");
  const createYearBtn = el("createYearBtn");
  let newYearMode = "blank";

  function renderYearBar() {
    yearLabelDisplay.textContent = state.label;
    const ids = sortedYearIds();
    const isLatest = ids[0] === yearsData.currentYearId;
    yearArchiveTag.hidden = isLatest;
    updateMemoBadge();
    updateBudgetBadge();
  }

  /* ===================== Mémo de l'année ===================== */
  const memoBtn = el("memoBtn");
  const memoBadge = el("memoBadge");
  const memoModalOverlay = el("memoModalOverlay");
  const memoModalClose = el("memoModalClose");
  const memoYearLabel = el("memoYearLabel");
  const memoList = el("memoList");
  const memoEmpty = el("memoEmpty");
  const memoInput = el("memoInput");
  const memoAddBtn = el("memoAddBtn");

  function updateMemoBadge() {
    const pending = (state.memo || []).filter(m => !m.done).length;
    memoBadge.hidden = pending === 0;
    memoBadge.textContent = pending > 99 ? "99+" : String(pending);
  }

  function renderMemoList() {
    memoList.innerHTML = "";
    const items = state.memo || [];
    memoEmpty.hidden = items.length > 0;
    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "memo-item" + (item.done ? " done" : "");
      row.innerHTML = `
        <input type="checkbox" ${item.done ? "checked" : ""} aria-label="Marquer comme fait">
        <span class="memo-item-text">${escapeHtml(item.text)}</span>
        <button class="memo-item-delete" aria-label="Supprimer">✕</button>
      `;
      row.querySelector("input").addEventListener("change", () => {
        item.done = !item.done;
        saveState();
        row.className = "memo-item" + (item.done ? " done" : "");
        updateMemoBadge();
      });
      row.querySelector(".memo-item-text").addEventListener("click", () => {
        row.querySelector("input").click();
      });
      row.querySelector(".memo-item-delete").addEventListener("click", () => {
        state.memo = state.memo.filter(m => m.id !== item.id);
        saveState();
        renderMemoList();
        updateMemoBadge();
      });
      memoList.appendChild(row);
    });
  }

  function addMemoItem() {
    const text = memoInput.value.trim();
    if (!text) return;
    if (!Array.isArray(state.memo)) state.memo = [];
    state.memo.push({ id: uid(), text: text, done: false });
    saveState();
    memoInput.value = "";
    renderMemoList();
    updateMemoBadge();
    memoInput.focus();
  }

  function openMemoModal() {
    memoYearLabel.textContent = "— " + state.label;
    renderMemoList();
    memoModalOverlay.hidden = false;
    memoInput.focus();
  }

  memoBtn.addEventListener("click", openMemoModal);
  memoModalClose.addEventListener("click", () => { memoModalOverlay.hidden = true; });
  memoModalOverlay.addEventListener("click", (e) => { if (e.target === memoModalOverlay) memoModalOverlay.hidden = true; });
  memoAddBtn.addEventListener("click", addMemoItem);
  memoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addMemoItem(); }
  });

  /* ===================== Budget de l'année ===================== */
  const BUDGET_CATEGORIES = [
    { id: "graines", emoji: "🌱", label: "Graines & plants" },
    { id: "terreau", emoji: "🪴", label: "Terreau & engrais" },
    { id: "outils", emoji: "🧰", label: "Outils & matériel" },
    { id: "arrosage", emoji: "💧", label: "Arrosage" },
    { id: "autre", emoji: "🧾", label: "Autre" },
  ];
  function getBudgetCategory(id) {
    return BUDGET_CATEGORIES.find(c => c.id === id) || BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1];
  }
  function euroFmt(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }

  const budgetBtn = el("budgetBtn");
  const budgetBadge = el("budgetBadge");
  const budgetModalOverlay = el("budgetModalOverlay");
  const budgetModalClose = el("budgetModalClose");
  const budgetYearLabel = el("budgetYearLabel");
  const budgetTotal = el("budgetTotal");
  const budgetBreakdown = el("budgetBreakdown");
  const budgetList = el("budgetList");
  const budgetEmpty = el("budgetEmpty");
  const budgetLabelInput = el("budgetLabel");
  const budgetAmountInput = el("budgetAmount");
  const budgetCategorySelect = el("budgetCategory");
  const budgetDateInput = el("budgetDate");
  const budgetAddBtn = el("budgetAddBtn");

  budgetCategorySelect.innerHTML = BUDGET_CATEGORIES.map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join("");

  function updateBudgetBadge() {
    const total = (state.budget || []).reduce((sum, b) => sum + b.amount, 0);
    budgetBadge.hidden = total <= 0;
    budgetBadge.textContent = Math.round(total) + " €";
  }

  function renderBudgetList() {
    const entries = state.budget || [];
    const total = entries.reduce((sum, b) => sum + b.amount, 0);
    budgetTotal.textContent = euroFmt(total);

    budgetBreakdown.innerHTML = "";
    BUDGET_CATEGORIES.forEach(c => {
      const sub = entries.filter(b => b.category === c.id).reduce((sum, b) => sum + b.amount, 0);
      if (sub > 0) {
        const chip = document.createElement("span");
        chip.className = "budget-chip";
        chip.textContent = `${c.emoji} ${euroFmt(sub)}`;
        budgetBreakdown.appendChild(chip);
      }
    });

    budgetList.innerHTML = "";
    budgetEmpty.hidden = entries.length > 0;
    // Les plus récentes dépenses en premier
    const sorted = entries.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    sorted.forEach(entry => {
      const cat = getBudgetCategory(entry.category);
      const row = document.createElement("div");
      row.className = "memo-item";
      row.innerHTML = `
        <span class="budget-item-cat" title="${escapeHtml(cat.label)}">${cat.emoji}</span>
        <div class="budget-item-info">
          <div class="budget-item-label">${escapeHtml(entry.label)}</div>
          <div class="budget-item-date">${entry.date ? formatDate(entry.date) : ""}</div>
        </div>
        <span class="budget-item-amount">${euroFmt(entry.amount)}</span>
        <button class="memo-item-delete" aria-label="Supprimer">✕</button>
      `;
      row.querySelector(".memo-item-delete").addEventListener("click", () => {
        state.budget = state.budget.filter(b => b.id !== entry.id);
        saveState();
        renderBudgetList();
        updateBudgetBadge();
      });
      budgetList.appendChild(row);
    });
  }

  function addBudgetEntry() {
    const label = budgetLabelInput.value.trim();
    const amount = parseFloat(budgetAmountInput.value);
    if (!label || isNaN(amount) || amount <= 0) {
      showToast("Ajoute un nom et un montant valide");
      return;
    }
    if (!Array.isArray(state.budget)) state.budget = [];
    state.budget.push({
      id: uid(),
      label: label,
      amount: amount,
      category: budgetCategorySelect.value,
      date: budgetDateInput.value || new Date().toISOString().slice(0, 10),
    });
    saveState();
    budgetLabelInput.value = "";
    budgetAmountInput.value = "";
    renderBudgetList();
    updateBudgetBadge();
    budgetLabelInput.focus();
  }

  function openBudgetModal() {
    budgetYearLabel.textContent = "— " + state.label;
    budgetDateInput.value = new Date().toISOString().slice(0, 10);
    renderBudgetList();
    budgetModalOverlay.hidden = false;
  }

  budgetBtn.addEventListener("click", openBudgetModal);
  budgetModalClose.addEventListener("click", () => { budgetModalOverlay.hidden = true; });
  budgetModalOverlay.addEventListener("click", (e) => { if (e.target === budgetModalOverlay) budgetModalOverlay.hidden = true; });
  budgetAddBtn.addEventListener("click", addBudgetEntry);

  function renderYearsModal() {
    yearsList.innerHTML = "";
    sortedYearIds().forEach(id => {
      const y = yearsData.years[id];
      const isCurrent = id === yearsData.currentYearId;
      const plantedArea = y.zones.reduce((sum, z) => sum + z.w * z.h, 0);
      const card = document.createElement("div");
      card.className = "year-card" + (isCurrent ? " year-card-active" : "");
      card.innerHTML = `
        <div class="year-card-info">
          <div class="year-card-title">${escapeHtml(y.label)} ${isCurrent ? '<span class="year-badge">Actif</span>' : ""}</div>
          <div class="year-card-sub">${y.zones.length} zone(s) · ${plantedArea.toFixed(2).replace(".", ",")} m² plantés</div>
        </div>
        <div class="year-card-actions">
          <button class="icon-btn small year-rename-btn" aria-label="Renommer">✏️</button>
          <button class="icon-btn small year-delete-btn" aria-label="Supprimer">🗑️</button>
        </div>
      `;
      card.querySelector(".year-card-info").addEventListener("click", () => {
        switchYear(id);
        yearsModalOverlay.hidden = true;
      });
      card.querySelector(".year-rename-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const next = prompt("Nouveau nom pour cette année :", y.label);
        if (next && next.trim()) {
          renameYear(id, next.trim());
          renderYearsModal();
        }
      });
      card.querySelector(".year-delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (Object.keys(yearsData.years).length <= 1) {
          showToast("Impossible de supprimer la seule année");
          return;
        }
        if (confirm(`Supprimer définitivement "${y.label}" et tout son contenu ?`)) {
          deleteYear(id);
          renderYearsModal();
        }
      });
      yearsList.appendChild(card);
    });
  }

  function openYearsModal() {
    renderYearsModal();
    newYearForm.hidden = true;
    yearsModalOverlay.hidden = false;
  }

  yearSwitchBtn.addEventListener("click", openYearsModal);
  yearsModalClose.addEventListener("click", () => { yearsModalOverlay.hidden = true; });
  yearsModalOverlay.addEventListener("click", (e) => { if (e.target === yearsModalOverlay) yearsModalOverlay.hidden = true; });

  addYearBtn.addEventListener("click", () => {
    const nextLabel = String(new Date().getFullYear() + 1);
    const existingLabels = Object.values(yearsData.years).map(y => y.label);
    newYearLabel.value = existingLabels.includes(nextLabel) ? "" : nextLabel;
    newYearMode = "blank";
    newYearBlankBtn.classList.add("active");
    newYearDuplicateBtn.classList.remove("active");
    newYearForm.hidden = false;
    newYearLabel.focus();
  });
  cancelNewYearBtn.addEventListener("click", () => { newYearForm.hidden = true; });
  newYearBlankBtn.addEventListener("click", () => {
    newYearMode = "blank";
    newYearBlankBtn.classList.add("active");
    newYearDuplicateBtn.classList.remove("active");
  });
  newYearDuplicateBtn.addEventListener("click", () => {
    newYearMode = "duplicate";
    newYearDuplicateBtn.classList.add("active");
    newYearBlankBtn.classList.remove("active");
  });
  createYearBtn.addEventListener("click", () => {
    createYear(newYearLabel.value, newYearMode);
    newYearForm.hidden = true;
    yearsModalOverlay.hidden = true;
    showToast("Nouvelle année créée");
  });

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

  /* ===================== Export PDF (sans dépendance externe) ===================== */
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function renderPlanToCanvas() {
    const PAD = 44;
    const CELL = 46; // px par mètre, plus grand qu'à l'écran pour une meilleure qualité d'impression
    const RULER_L = 34, RULER_T = 30;
    const HEADER_H = 96;
    const LEGEND_ROW_H = 28;
    const LEGEND_COLS = 2;
    const legendRows = state.zones.length > 0 ? Math.ceil(state.zones.length / LEGEND_COLS) : 0;

    const gridW = state.gardenW * CELL;
    const gridH = state.gardenH * CELL;
    const canvasW = Math.max(760, PAD * 2 + RULER_L + gridW);
    const legendH = state.zones.length > 0 ? (34 + legendRows * LEGEND_ROW_H) : 20;
    const canvasH = HEADER_H + RULER_T + gridH + PAD + legendH + PAD;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#FBF8EF";
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.fillStyle = "#2B2114";
    ctx.font = "bold 26px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "left";
    ctx.fillText("🌱 Mon Potager", PAD, 42);
    ctx.font = "14px Arial, sans-serif";
    ctx.fillStyle = "#8a8170";
    const surface = (state.gardenW * state.gardenH).toFixed(1).replace(".", ",");
    const planted = state.zones.reduce((s, z) => s + z.w * z.h, 0).toFixed(1).replace(".", ",");
    ctx.fillText(
      `${state.label} · ${state.gardenW}×${state.gardenH} m (${surface} m²) · ${planted} m² plantés · exporté le ${new Date().toLocaleDateString("fr-FR")}`,
      PAD, 66
    );

    const gx = PAD + RULER_L;
    const gy = HEADER_H + RULER_T;

    ctx.strokeStyle = "#DED6BC";
    ctx.lineWidth = 1;
    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "#9a8f78";
    for (let i = 0; i <= state.gardenW; i++) {
      const x = gx + i * CELL;
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gridH); ctx.stroke();
      if (i < state.gardenW) ctx.fillText(String(i), x + 3, gy - 8);
    }
    for (let j = 0; j <= state.gardenH; j++) {
      const y = gy + j * CELL;
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gridW, y); ctx.stroke();
      if (j < state.gardenH) ctx.fillText(String(j), gx - 20, y + 12);
    }
    ctx.strokeStyle = "#B7AD92";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, gy, gridW, gridH);

    state.zones.forEach(zone => {
      const plant = getPlant(zone);
      const zx = gx + zone.x * CELL;
      const zy = gy + zone.y * CELL;
      const zw = zone.w * CELL;
      const zh = zone.h * CELL;

      ctx.fillStyle = hexToRgba(plant.color, 0.22);
      roundRectPath(ctx, zx, zy, zw, zh, 6);
      ctx.fill();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = plant.color;
      ctx.lineWidth = 2;
      roundRectPath(ctx, zx, zy, zw, zh, 6);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = "center";
      const cx = zx + zw / 2;
      const cy = zy + zh / 2;
      const showVariety = !!zone.variety && zh > 40;
      ctx.font = "18px Arial, sans-serif";
      ctx.fillStyle = "#2B2114";
      ctx.fillText(plant.emoji, cx, cy - (showVariety ? 12 : 4));
      ctx.font = "bold 12px Arial, sans-serif";
      ctx.fillText(plant.name, cx, cy + (showVariety ? 8 : 16));
      if (showVariety) {
        ctx.font = "10px Arial, sans-serif";
        ctx.fillStyle = "#8a8170";
        ctx.fillText(zone.variety, cx, cy + 24);
      }
      ctx.textAlign = "left";
    });

    if (state.zones.length > 0) {
      let ly = gy + gridH + 30;
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillStyle = "#2B2114";
      ctx.fillText("Légende", PAD, ly);
      ly += 22;
      const colW = (canvasW - PAD * 2) / LEGEND_COLS;
      state.zones.forEach((zone, idx) => {
        const plant = getPlant(zone);
        const col = idx % LEGEND_COLS;
        const row = Math.floor(idx / LEGEND_COLS);
        const lx = PAD + col * colW;
        const yy = ly + row * LEGEND_ROW_H;
        ctx.fillStyle = plant.color;
        ctx.beginPath(); ctx.arc(lx + 6, yy - 4, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2B2114";
        ctx.font = "12px Arial, sans-serif";
        const label = zone.variety ? `${plant.name} — ${zone.variety}` : plant.name;
        ctx.fillText(label, lx + 20, yy, colW - 24);
      });
    } else {
      ctx.font = "13px Arial, sans-serif";
      ctx.fillStyle = "#9a8f78";
      ctx.fillText("Aucune planche pour l'instant.", PAD, gy + gridH + 26);
    }

    return canvas;
  }

  function base64ToUint8Array(base64) {
    const binary = atob(base64.split(",").pop());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // Construit un PDF minimal (une page, une image JPEG plein cadre) à la main,
  // sans bibliothèque externe : c'est le format le plus simple valide.
  function buildPdfFromJpeg(jpegDataUrl, widthPx, heightPx) {
    const PX_TO_PT = 0.75; // 96dpi -> 72pt/inch
    const widthPt = (widthPx * PX_TO_PT).toFixed(2);
    const heightPt = (heightPx * PX_TO_PT).toFixed(2);
    const jpegBytes = base64ToUint8Array(jpegDataUrl);

    const enc = new TextEncoder();
    const chunks = [];
    let offset = 0;
    const offsets = {};

    function push(strOrBytes) {
      const bytes = typeof strOrBytes === "string" ? enc.encode(strOrBytes) : strOrBytes;
      chunks.push(bytes);
      offset += bytes.length;
    }

    push("%PDF-1.4\n");

    offsets[1] = offset;
    push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    offsets[2] = offset;
    push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

    offsets[3] = offset;
    push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

    offsets[4] = offset;
    push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    push(jpegBytes);
    push("\nendstream\nendobj\n");

    const content = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im0 Do\nQ`;
    offsets[5] = offset;
    push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);

    const xrefStart = offset;
    let xref = "xref\n0 6\n0000000000 65535 f \n";
    for (let i = 1; i <= 5; i++) {
      xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    push(xref);
    push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

    const total = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) { out.set(c, pos); pos += c.length; }
    return out;
  }

  function exportPlanToPdf() {
    if (state.zones.length === 0) {
      showToast("Ajoute au moins une planche avant d'exporter");
      return;
    }
    try {
      const canvas = renderPlanToCanvas();
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const pdfBytes = buildPdfFromJpeg(jpegDataUrl, canvas.width, canvas.height);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeLabel = state.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
      a.href = url;
      a.download = `mon-potager-${safeLabel || "plan"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      showToast("PDF exporté");
    } catch (e) {
      showToast("Impossible de générer le PDF");
    }
  }

  exportPdfBtn.addEventListener("click", exportPlanToPdf);

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
    if (versionTag) versionTag.textContent = "Mon Potager · v2";
    PX_PER_M = BASE_PX_PER_M * zoomLevel;
    zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
    zoomInBtn.disabled = zoomLevel >= MAX_ZOOM;
    zoomOutBtn.disabled = zoomLevel <= MIN_ZOOM;
    renderCanvasSize();
    renderZones();
    renderLegend();
    updateStats();
    renderList();
    renderYearBar();
    renderWeatherCard();
    refreshWeather(false);
    refineSavedLocationLabel();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js").then((reg) => {
          // Vérifie activement une nouvelle version à chaque ouverture/retour sur l'app
          reg.update();
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") reg.update();
          });
        }).catch(() => {});
      });

      // Dès qu'une nouvelle version prend le contrôle, on recharge une fois
      // pour être sûr d'utiliser le HTML/JS/CSS à jour (corrige les bugs déjà résolus
      // qui semblent "ne pas fonctionner" à cause d'une ancienne version en cache).
      let swRefreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (swRefreshed) return;
        swRefreshed = true;
        window.location.reload();
      });
    }
  }

  function refineSavedLocationLabel() {
    const loc = loadLocation();
    if (!loc || loc.source !== "geo" || loc.label !== "Ma position") return;
    reverseGeocode(loc.lat, loc.lon).then(place => {
      if (!place) return;
      const current = loadLocation();
      if (current && current.lat === loc.lat && current.lon === loc.lon) {
        current.label = place;
        saveLocation(current);
        renderWeatherCard();
      }
    });
  }

  init();
})();
