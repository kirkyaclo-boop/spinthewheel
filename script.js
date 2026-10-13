/**
 * ColorSpin — Interactive Wheel of Colors & Choice
 * Modern Canvas Wheel with Web Audio API sound synthesis, Confetti, and Palette customization.
 */

(function () {
  'use strict';

  // --- Supported Color Keywords Mapping ---
  const COLOR_NAME_MAP = {
    'black': '#000000',
    'white': '#ffffff',
    'dark': '#000000',
    'light': '#ffffff',
    'red': '#ef4444',
    'crimson': '#dc2626',
    'blue': '#3b82f6',
    'navy': '#1e3a8a',
    'green': '#22c55e',
    'emerald': '#10b981',
    'yellow': '#eab308',
    'amber': '#f59e0b',
    'orange': '#f97316',
    'purple': '#a855f7',
    'violet': '#8b5cf6',
    'pink': '#ec4899',
    'magenta': '#d946ef',
    'cyan': '#06b6d4',
    'teal': '#14b8a6',
    'gray': '#64748b',
    'grey': '#64748b',
    'brown': '#78350f',
    'gold': '#ffd700',
    'silver': '#cbd5e1'
  };

  // Shade words: positive = lighter, negative = darker (HSL lightness points)
  const SHADE_MODIFIERS = {
    'light': 22,
    'pale': 30,
    'pastel': 28,
    'dark': -22,
    'deep': -16
  };

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
  }

  function shadeHex(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const l = Math.max(8, Math.min(92, hsl.l + amount));
    return hslToHex(hsl.h, hsl.s, l);
  }

  // Resolve any CSS color name (e.g. "maroon", "skyblue") via the browser
  const cssColorCtx = document.createElement('canvas').getContext('2d');
  function resolveCssColor(name) {
    if (!cssColorCtx || !/^[a-z]+$/.test(name)) return null;
    cssColorCtx.fillStyle = '#010203';
    cssColorCtx.fillStyle = name;
    const result = cssColorCtx.fillStyle;
    return result === '#010203' ? null : result;
  }

  function resolveBaseColor(name) {
    return COLOR_NAME_MAP[name] || resolveCssColor(name);
  }

  function resolveColorFromName(str) {
    if (!str) return null;
    const clean = str.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
    if (COLOR_NAME_MAP[clean]) return COLOR_NAME_MAP[clean];
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return clean;

    // "light blue", "dark-green", "lightblue", "darkred"...
    for (const word of Object.keys(SHADE_MODIFIERS)) {
      if (clean.startsWith(word)) {
        const base = resolveBaseColor(clean.slice(word.length).trim().replace(/ /g, ''));
        if (base) return shadeHex(base, SHADE_MODIFIERS[word]);
      }
    }

    return resolveCssColor(clean.replace(/ /g, ''));
  }

  // --- Curated Preset Palettes ---
  const PALETTES = [
    {
      id: 'rainbow',
      name: 'Rainbow Royale',
      colors: [
        { name: 'Crimson Red', color: '#ff2a55' },
        { name: 'Vivid Orange', color: '#ff7700' },
        { name: 'Cyber Amber', color: '#ffbb00' },
        { name: 'Emerald Mint', color: '#00d26a' },
        { name: 'Ocean Azure', color: '#00b4d8' },
        { name: 'Royal Indigo', color: '#4361ee' },
        { name: 'Electric Violet', color: '#7b2cbf' },
        { name: 'Hot Magenta', color: '#f72585' }
      ]
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      colors: [
        { name: 'Neon Pink', color: '#ff007f' },
        { name: 'Electric Cyan', color: '#00f5d4' },
        { name: 'Acid Lime', color: '#70e000' },
        { name: 'Ultraviolet', color: '#9d4edd' },
        { name: 'Laser Yellow', color: '#fee440' },
        { name: 'Hyper Orange', color: '#ff5400' },
        { name: 'Matrix Green', color: '#00f0ff' },
        { name: 'Deep Nebula', color: '#3a0ca3' }
      ]
    },
    {
      id: 'sunset',
      name: 'Sunset Mirage',
      colors: [
        { name: 'Twilight Plum', color: '#3d085a' },
        { name: 'Sangria Rose', color: '#881b63' },
        { name: 'Burning Velvet', color: '#c72c41' },
        { name: 'Coral Flame', color: '#e95a32' },
        { name: 'Sunset Amber', color: '#f38938' },
        { name: 'Golden Glow', color: '#f7b733' },
        { name: 'Apricot Peach', color: '#fca311' },
        { name: 'Warm Lilac', color: '#5e2a84' }
      ]
    },
    {
      id: 'pastels',
      name: 'Pastel Dream',
      colors: [
        { name: 'Strawberry Cream', color: '#ff8fab' },
        { name: 'Peach Sorbet', color: '#ffbe0b' },
        { name: 'Buttercup', color: '#fcf6bd' },
        { name: 'Mint Gelato', color: '#b9fbc0' },
        { name: 'Sky Glaze', color: '#98f5e1' },
        { name: 'Baby Azure', color: '#a0c4ff' },
        { name: 'Lilac Mist', color: '#bdb2ff' },
        { name: 'Sweet Orchid', color: '#ffc6ff' }
      ]
    },
    {
      id: 'jewels',
      name: 'Royal Jewels',
      colors: [
        { name: 'Imperial Ruby', color: '#b5179e' },
        { name: 'Ceylon Sapphire', color: '#1a3a8f' },
        { name: 'Colombian Emerald', color: '#05668d' },
        { name: 'Amethyst Crystal', color: '#7209b7' },
        { name: 'Golden Topaz', color: '#d4a373' },
        { name: 'Jade Mineral', color: '#028090' },
        { name: 'Rose Quartz', color: '#e07a5f' },
        { name: 'Deep Tourmaline', color: '#3d348b' }
      ]
    },
    {
      id: 'earth',
      name: 'Earthy Botanicals',
      colors: [
        { name: 'Forest Moss', color: '#2d6a4f' },
        { name: 'Spiced Ochre', color: '#bc6c25' },
        { name: 'Sage Leaf', color: '#52b788' },
        { name: 'Warm Terracotta', color: '#d08c5d' },
        { name: 'Burnt Umber', color: '#603813' },
        { name: 'Deep Olive', color: '#386641' },
        { name: 'Desert Dune', color: '#dda15e' },
        { name: 'Rust Sienna', color: '#9c413d' }
      ]
    }
  ];

  // --- Initial Default Slices ---
  const DEFAULT_SLICES = [
    { text: 'Crimson Red', color: '#ff2a55' },
    { text: 'Vivid Orange', color: '#ff7700' },
    { text: 'Cyber Amber', color: '#ffbb00' },
    { text: 'Emerald Mint', color: '#00d26a' },
    { text: 'Ocean Azure', color: '#00b4d8' },
    { text: 'Royal Indigo', color: '#4361ee' },
    { text: 'Electric Violet', color: '#7b2cbf' },
    { text: 'Hot Magenta', color: '#f72585' }
  ];

  // --- Application State ---
  let slices = JSON.parse(localStorage.getItem('colorspin_slices')) || [...DEFAULT_SLICES];
  let spinHistory = JSON.parse(localStorage.getItem('colorspin_history')) || [];
  let settings = {
    duration: 5,
    sound: true,
    autoRemovePrompt: true,
    confetti: true,
    showHex: false
  };

  // Wheel State
  let currentAngle = 0;
  let isSpinning = false;
  let spinAnimationId = null;
  let lastTickIndex = -1;
  let currentWinner = null;

  // Secret Hotkey Override State (Hidden from UI)
  let secretAvoidDark = false;
  let secretAvoidLight = false;
  let secretForceDark = false;
  let secretForceLight = false;

  // Audio Context
  let audioCtx = null;

  // DOM Elements
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const pointerNeedle = document.getElementById('pointerNeedle');
  const wheelHalo = document.getElementById('wheelHalo');
  const mainSpinBtn = document.getElementById('mainSpinBtn');
  const centerSpinBtn = document.getElementById('centerSpinBtn');
  const spinBtnText = document.getElementById('spinBtnText');
  const sliceCountBadge = document.getElementById('sliceCountBadge');
  const spinSpeedBadge = document.getElementById('spinSpeedBadge');

  const choicesList = document.getElementById('choicesList');
  const addChoiceForm = document.getElementById('addChoiceForm');
  const newChoiceText = document.getElementById('newChoiceText');
  const newChoiceColor = document.getElementById('newChoiceColor');
  const newColorPreview = document.getElementById('newColorPreview');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const randomizeColorsBtn = document.getElementById('randomizeColorsBtn');
  const resetChoicesBtn = document.getElementById('resetChoicesBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const palettesGrid = document.getElementById('palettesGrid');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundOnIcon = document.getElementById('soundOnIcon');
  const soundOffIcon = document.getElementById('soundOffIcon');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Winner Modal Elements
  const winnerModal = document.getElementById('winnerModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const winnerTitle = document.getElementById('winnerTitle');
  const winnerColorSwatch = document.getElementById('winnerColorSwatch');
  const winnerHexText = document.getElementById('winnerHexText');
  const winnerHexPill = document.getElementById('winnerHexPill');
  const copyHexBtn = document.getElementById('copyHexBtn');
  const spinAgainModalBtn = document.getElementById('spinAgainModalBtn');
  const removeWinnerModalBtn = document.getElementById('removeWinnerModalBtn');

  // Custom Confirmation Modal Elements
  const confirmModal = document.getElementById('confirmModal');
  const confirmModalTitle = document.getElementById('confirmModalTitle');
  const confirmModalDesc = document.getElementById('confirmModalDesc');
  const confirmModalActionBtn = document.getElementById('confirmModalActionBtn');
  const confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');
  const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');
  const confirmIconWrapper = document.getElementById('confirmIconWrapper');
  let confirmActionCallback = null;

  // Settings Elements
  const durationPills = document.querySelectorAll('.duration-pill');
  const soundSettingCheck = document.getElementById('soundSettingCheck');
  const autoRemovePromptCheck = document.getElementById('autoRemovePromptCheck');
  const confettiSettingCheck = document.getElementById('confettiSettingCheck');
  const showHexOnWheelCheck = document.getElementById('showHexOnWheelCheck');
  const toast = document.getElementById('toastNotification');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  // ==========================================================================
  // Audio Synthesis Engine (Web Audio API)
  // ==========================================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTickSound(pitchMultiplier = 1) {
    if (!settings.sound || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      const now = audioCtx.currentTime;

      osc.frequency.setValueAtTime(650 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  function playFanfareSound() {
    if (!settings.sound || !audioCtx) return;
    try {
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.35 },
        { freq: 659.25, time: 0.10, dur: 0.35 },
        { freq: 783.99, time: 0.20, dur: 0.40 },
        { freq: 1046.5, time: 0.32, dur: 0.90 }
      ];

      const now = audioCtx.currentTime;

      notes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(0.28, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
      });
    } catch (e) {}
  }

  // ==========================================================================
  // Wheel Drawing (Canvas 2D)
  // ==========================================================================
  function setupCanvasDPI() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  function getContrastColor(hexColor) {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#0f172a' : '#ffffff';
  }

  function drawWheel() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 14;

    ctx.clearRect(0, 0, width, height);

    const totalSlices = slices.length;
    if (totalSlices === 0) return;

    const sliceAngle = (2 * Math.PI) / totalSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    // 1. Draw Slices
    for (let i = 0; i < totalSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const slice = slices[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();

      // Subtle radial shading
      const grad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Draw Slice Label
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      const textColor = getContrastColor(slice.color);
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      let fontSize = 16;
      if (totalSlices > 16) fontSize = 11;
      else if (totalSlices > 12) fontSize = 13;
      else if (totalSlices < 6) fontSize = 18;

      ctx.font = `700 ${fontSize}px "Outfit", sans-serif`;
      ctx.shadowColor = textColor === '#ffffff' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.35)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      let label = slice.text;
      const maxTextLength = totalSlices > 14 ? 12 : 18;
      if (label.length > maxTextLength) {
        label = label.substring(0, maxTextLength - 1) + '…';
      }

      const textDistance = radius - 26;
      ctx.fillText(label, textDistance, 0);

      if (settings.showHex) {
        ctx.font = `600 ${Math.max(9, fontSize - 4)}px monospace`;
        ctx.globalAlpha = 0.85;
        ctx.fillText(slice.color.toUpperCase(), textDistance, fontSize + 3);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }

    // 3. Metallic Outer Bezel and Pegs
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    for (let i = 0; i < totalSlices; i++) {
      const pegAngle = i * sliceAngle;
      const pegX = Math.cos(pegAngle) * (radius - 4);
      const pegY = Math.sin(pegAngle) * (radius - 4);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fill();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.stroke();
  }

  function getWinningSlice(angle) {
    const totalSlices = slices.length;
    if (totalSlices === 0) return null;

    const sliceAngle = (2 * Math.PI) / totalSlices;
    let normalized = (-Math.PI / 2 - angle) % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;

    const index = Math.floor(normalized / sliceAngle);
    return {
      index: index % totalSlices,
      slice: slices[index % totalSlices]
    };
  }

  // ==========================================================================
  // Secret Hotkey Helpers (Dark / Light Slice Detection)
  // ==========================================================================
  function hexToRgb(hex) {
    let clean = (hex || '').replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  const DARK_NAME_RE = /\b(black|dark|deep)/;
  const LIGHT_NAME_RE = /\b(white|light|pale|pastel)/;

  // Shade from the name wins (black = dark, white = light); otherwise judge the color itself
  function getSliceShade(slice) {
    if (!slice) return null;
    const text = (slice.text || '').toLowerCase().trim();
    if (DARK_NAME_RE.test(text)) return 'dark';
    if (LIGHT_NAME_RE.test(text)) return 'light';
    const rgb = hexToRgb((slice.color || '').trim());
    if (!rgb) return null;
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const lightness = rgbToHsl(rgb.r, rgb.g, rgb.b).l;
    // Dark needs low brightness AND low lightness, so pure red/blue stay normal
    if (brightness < 80 && lightness < 45) return 'dark';
    if (lightness >= 72) return 'light';
    return null;
  }

  function isSliceDark(slice) {
    return getSliceShade(slice) === 'dark';
  }

  function isSliceLight(slice) {
    return getSliceShade(slice) === 'light';
  }

  // ==========================================================================
  // Spin Physics & Animation Engine
  // ==========================================================================
  function startSpin() {
    if (isSpinning) return;
    if (slices.length < 2) {
      showToast('Add at least 2 choices to spin!');
      return;
    }

    initAudio();
    isSpinning = true;
    updateControlsState();
    closeModal();
    closeConfirmModal();

    wheelHalo.classList.add('spinning');

    const totalSlices = slices.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    // Filter candidate winning slices based on hotkeys
    let candidateIndices = slices.map((_, i) => i);

    if (secretForceDark) {
      const darkIndices = candidateIndices.filter(i => isSliceDark(slices[i]));
      if (darkIndices.length > 0) candidateIndices = darkIndices;
    } else if (secretForceLight) {
      const lightIndices = candidateIndices.filter(i => isSliceLight(slices[i]));
      if (lightIndices.length > 0) candidateIndices = lightIndices;
    } else {
      if (secretAvoidDark) {
        const nonDarkIndices = candidateIndices.filter(i => !isSliceDark(slices[i]));
        if (nonDarkIndices.length > 0) candidateIndices = nonDarkIndices;
      }
      if (secretAvoidLight) {
        const nonLightIndices = candidateIndices.filter(i => !isSliceLight(slices[i]));
        if (nonLightIndices.length > 0) candidateIndices = nonLightIndices;
      }
    }

    // Pick winning slice
    const targetWinnerIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];

    // Target angle calculation: pointer (-PI/2) lands comfortably within target slice
    const jitter = (0.18 + Math.random() * 0.64) * sliceAngle;
    const alphaTarget = targetWinnerIndex * sliceAngle + jitter;

    let finalAngleNorm = (-Math.PI / 2 - alphaTarget) % (2 * Math.PI);
    if (finalAngleNorm < 0) finalAngleNorm += 2 * Math.PI;

    let currentAngleNorm = currentAngle % (2 * Math.PI);
    if (currentAngleNorm < 0) currentAngleNorm += 2 * Math.PI;

    let deltaAngle = finalAngleNorm - currentAngleNorm;
    if (deltaAngle < 0) deltaAngle += 2 * Math.PI;

    const minFullSpins = 6 + Math.floor(Math.random() * 3);
    const totalAngleToRotate = minFullSpins * (2 * Math.PI) + deltaAngle;

    const startRot = currentAngle;
    const targetRot = currentAngle + totalAngleToRotate;
    const durationMs = settings.duration * 1000;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    lastTickIndex = -1;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      currentAngle = startRot + totalAngleToRotate * easedProgress;
      drawWheel();

      const currentWinning = getWinningSlice(currentAngle);
      if (currentWinning && currentWinning.index !== lastTickIndex) {
        lastTickIndex = currentWinning.index;
        triggerPointerFlutter();
        const speedRatio = 1 - progress;
        playTickSound(0.9 + speedRatio * 0.4);
      }

      if (progress < 1) {
        spinAnimationId = requestAnimationFrame(animate);
      } else {
        currentAngle = targetRot % (2 * Math.PI);
        drawWheel();
        finishSpin();
      }
    }

    spinAnimationId = requestAnimationFrame(animate);
  }

  function triggerPointerFlutter() {
    pointerNeedle.classList.add('flutter');
    setTimeout(() => {
      pointerNeedle.classList.remove('flutter');
    }, 70);
  }

  function finishSpin() {
    isSpinning = false;
    wheelHalo.classList.remove('spinning');
    updateControlsState();

    const winnerInfo = getWinningSlice(currentAngle);
    if (!winnerInfo) return;

    currentWinner = winnerInfo;

    // Secret overrides only last for one spin
    secretAvoidDark = false;
    secretAvoidLight = false;
    secretForceDark = false;
    secretForceLight = false;

    playFanfareSound();

    if (settings.confetti) {
      fireConfetti(winnerInfo.slice.color);
    }

    addToHistory(winnerInfo.slice);
  }

  function updateControlsState() {
    mainSpinBtn.disabled = isSpinning;
    centerSpinBtn.disabled = isSpinning;
    spinBtnText.textContent = isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL';
    sliceCountBadge.textContent = `${slices.length} Colors`;
    spinSpeedBadge.textContent = `${settings.duration}s Spin`;
  }

  // ==========================================================================
  // Winner Modal & Confirmation Modal
  // ==========================================================================
  function showWinnerModal(winningSlice) {
    winnerTitle.textContent = winningSlice.text;
    winnerColorSwatch.style.backgroundColor = winningSlice.color;
    winnerColorSwatch.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 60px ${winningSlice.color}`;
    winnerHexText.textContent = winningSlice.color.toUpperCase();

    winnerModal.classList.remove('hidden');
  }

  function closeModal() {
    winnerModal.classList.add('hidden');
  }

  function removeCurrentWinner() {
    if (!currentWinner) return;
    const indexToRemove = currentWinner.index;
    if (slices.length <= 2) {
      showToast('Need at least 2 choices on the wheel!');
      closeModal();
      return;
    }

    const removed = slices.splice(indexToRemove, 1);
    saveSlices();
    renderChoicesList();
    drawWheel();
    updateControlsState();
    closeModal();
    showToast(`Removed "${removed[0].text}" from wheel`);
  }

  // Custom Confirmation Modal Engine
  function showConfirmModal({ title, desc, actionText, isDanger, onConfirm }) {
    confirmModalTitle.textContent = title;
    confirmModalDesc.textContent = desc;
    confirmModalActionBtn.textContent = actionText;
    confirmModalActionBtn.className = isDanger ? 'modal-primary-btn btn-danger' : 'modal-primary-btn';
    confirmIconWrapper.className = isDanger ? 'confirm-icon-wrapper' : 'confirm-icon-wrapper info';
    confirmActionCallback = onConfirm;
    confirmModal.classList.remove('hidden');
  }

  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmActionCallback = null;
  }

  confirmModalActionBtn.addEventListener('click', () => {
    if (confirmActionCallback) {
      confirmActionCallback();
    }
    closeConfirmModal();
  });

  confirmModalCancelBtn.addEventListener('click', closeConfirmModal);
  closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });

  // ==========================================================================
  // Confetti Engine
  // ==========================================================================
  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function fireConfetti(primaryColor) {
    const count = 120;
    const colors = [
      primaryColor,
      '#ffffff',
      '#ffd700',
      '#ff0077',
      '#00f0ff',
      '#7928ca'
    ];

    confettiParticles = [];
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const velocity = 8 + Math.random() * 16;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.35,
        drag: 0.94
      });
    }

    if (!confettiAnimId) {
      runConfettiLoop();
    }
  }

  function runConfettiLoop() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeCount = 0;
    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      if (p.opacity <= 0.01) continue;
      activeCount++;

      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    if (activeCount > 0) {
      confettiAnimId = requestAnimationFrame(runConfettiLoop);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

  // ==========================================================================
  // Choices List & Color Customization
  // ==========================================================================
  function saveSlices() {
    localStorage.setItem('colorspin_slices', JSON.stringify(slices));
  }

  function renderChoicesList() {
    choicesList.innerHTML = '';

    slices.forEach((slice, index) => {
      const row = document.createElement('div');
      row.className = 'choice-row';
      row.innerHTML = `
        <div class="row-color-picker" title="Change Color">
          <input type="color" value="${slice.color}" class="row-color-input" data-index="${index}">
          <span class="row-swatch" style="background-color: ${slice.color}"></span>
        </div>
        <input type="text" class="row-label-input" value="${escapeHtml(slice.text)}" data-index="${index}" maxlength="32">
        <span class="row-hex-tag">${slice.color.toUpperCase()}</span>
        <button class="delete-row-btn" data-index="${index}" title="Remove Choice" aria-label="Delete ${slice.text}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      `;
      choicesList.appendChild(row);
    });

    updateControlsState();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-detect color while typing in the add choice input
  newChoiceText.addEventListener('input', () => {
    const matched = resolveColorFromName(newChoiceText.value);
    if (matched) {
      newChoiceColor.value = matched;
      newColorPreview.style.backgroundColor = matched;
    }
  });

  // Handle changes in Choices list
  choicesList.addEventListener('input', (e) => {
    const target = e.target;
    const index = parseInt(target.getAttribute('data-index'), 10);
    if (isNaN(index) || !slices[index]) return;

    if (target.classList.contains('row-color-input')) {
      slices[index].color = target.value;
      const swatch = target.nextElementSibling;
      if (swatch) swatch.style.backgroundColor = target.value;
      const hexTag = target.closest('.choice-row').querySelector('.row-hex-tag');
      if (hexTag) hexTag.textContent = target.value.toUpperCase();
      saveSlices();
      drawWheel();
    } else if (target.classList.contains('row-label-input')) {
      const textVal = target.value.trim();
      slices[index].text = textVal || `Color ${index + 1}`;

      // Auto-set color if label matches a recognized color name like "black"
      const matched = resolveColorFromName(textVal);
      if (matched) {
        slices[index].color = matched;
        const row = target.closest('.choice-row');
        if (row) {
          const colorInput = row.querySelector('.row-color-input');
          const swatch = row.querySelector('.row-swatch');
          const hexTag = row.querySelector('.row-hex-tag');
          if (colorInput) colorInput.value = matched;
          if (swatch) swatch.style.backgroundColor = matched;
          if (hexTag) hexTag.textContent = matched.toUpperCase();
        }
      }
      saveSlices();
      drawWheel();
    }
  });

  choicesList.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.delete-row-btn');
    if (delBtn) {
      const index = parseInt(delBtn.getAttribute('data-index'), 10);
      if (slices.length <= 2) {
        showToast('You must have at least 2 choices!');
        return;
      }
      slices.splice(index, 1);
      saveSlices();
      renderChoicesList();
      drawWheel();
    }
  });

  // Add new choice
  addChoiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const textVal = newChoiceText.value.trim();
    let colorVal = newChoiceColor.value;

    if (!textVal) {
      newChoiceText.focus();
      return;
    }

    // If user typed "black", ensure color added is black!
    const matched = resolveColorFromName(textVal);
    if (matched) {
      colorVal = matched;
    }

    slices.push({
      text: textVal,
      color: colorVal
    });

    saveSlices();
    renderChoicesList();
    drawWheel();

    newChoiceText.value = '';
    const nextHue = Math.floor(Math.random() * 360);
    const nextColorHex = hslToHex(nextHue, 85, 60);
    newChoiceColor.value = nextColorHex;
    newColorPreview.style.backgroundColor = nextColorHex;
    newChoiceText.focus();
  });

  newChoiceColor.addEventListener('input', () => {
    newColorPreview.style.backgroundColor = newChoiceColor.value;
  });

  // Shuffle Slices
  shuffleBtn.addEventListener('click', () => {
    for (let i = slices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slices[i], slices[j]] = [slices[j], slices[i]];
    }
    saveSlices();
    renderChoicesList();
    drawWheel();
    showToast('Slices shuffled!');
  });

  // Randomize Colors
  randomizeColorsBtn.addEventListener('click', () => {
    const startHue = Math.random() * 360;
    const goldenRatio = 137.5;

    slices.forEach((slice, i) => {
      const hue = (startHue + i * goldenRatio) % 360;
      slice.color = hslToHex(hue, 85, 58);
    });

    saveSlices();
    renderChoicesList();
    drawWheel();
    showToast('Generated fresh vibrant colors!');
  });

  // Reset to default (with custom modal)
  resetChoicesBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Reset to Default Colors?',
      desc: 'This will restore the original 8 vibrant rainbow colors. Any custom choices or colors you have added will be replaced.',
      actionText: 'Reset to Default',
      isDanger: false,
      onConfirm: () => {
        slices = JSON.parse(JSON.stringify(DEFAULT_SLICES));
        saveSlices();
        renderChoicesList();
        drawWheel();
        showToast('Reset to default rainbow colors');
      }
    });
  });

  // Clear All (with custom modal)
  clearAllBtn.addEventListener('click', () => {
    showConfirmModal({
      title: 'Clear All Choices?',
      desc: 'Are you sure you want to remove all choices? The wheel will be reset to 2 starter blank items.',
      actionText: 'Clear Everything',
      isDanger: true,
      onConfirm: () => {
        slices = [
          { text: 'Choice 1', color: '#8b5cf6' },
          { text: 'Choice 2', color: '#ec4899' }
        ];
        saveSlices();
        renderChoicesList();
        drawWheel();
        showToast('All choices cleared');
      }
    });
  });

  // ==========================================================================
  // Palettes Grid
  // ==========================================================================
  function renderPalettes() {
    palettesGrid.innerHTML = '';
    PALETTES.forEach(palette => {
      const card = document.createElement('div');
      card.className = 'palette-card';
      card.setAttribute('data-id', palette.id);

      const swatchesHtml = palette.colors
        .map(c => `<div class="palette-color-slice" style="background-color: ${c.color};" title="${c.name} (${c.color})"></div>`)
        .join('');

      card.innerHTML = `
        <div class="palette-card-header">
          <span class="palette-name">${palette.name}</span>
          <span class="palette-apply-tag">Apply Palette</span>
        </div>
        <div class="palette-swatches-row">
          ${swatchesHtml}
        </div>
      `;

      card.addEventListener('click', () => {
        applyPalette(palette);
      });

      palettesGrid.appendChild(card);
    });
  }

  function applyPalette(palette) {
    slices = palette.colors.map(c => ({
      text: c.name,
      color: c.color
    }));
    saveSlices();
    renderChoicesList();
    drawWheel();
    showToast(`Applied "${palette.name}" palette!`);
    switchTab('tab-choices');
  }

  // ==========================================================================
  // History Management
  // ==========================================================================
  function saveHistory() {
    localStorage.setItem('colorspin_history', JSON.stringify(spinHistory));
  }

  function addToHistory(winningSlice) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    spinHistory.unshift({
      text: winningSlice.text,
      color: winningSlice.color,
      time: timestamp
    });

    if (spinHistory.length > 50) spinHistory.pop();
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    historyCount.textContent = spinHistory.length;
    if (spinHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <p>No spins yet! Hit "SPIN" to pick a winning color.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = '';
    spinHistory.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `
        <div class="history-item-left">
          <span class="history-swatch" style="background-color: ${item.color};"></span>
          <div>
            <div class="history-name">${escapeHtml(item.text)}</div>
            <div class="history-time">${item.color.toUpperCase()}</div>
          </div>
        </div>
        <span class="history-time">${item.time}</span>
      `;
      historyList.appendChild(row);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    if (spinHistory.length === 0) return;
    showConfirmModal({
      title: 'Clear Spin History?',
      desc: 'Are you sure you want to delete all past spin results?',
      actionText: 'Clear History',
      isDanger: true,
      onConfirm: () => {
        spinHistory = [];
        saveHistory();
        renderHistory();
        showToast('History cleared');
      }
    });
  });

  // ==========================================================================
  // Tab Navigation
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // ==========================================================================
  // Settings & Toggles
  // ==========================================================================
  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      durationPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      settings.duration = parseInt(pill.getAttribute('data-duration'), 10);
      updateControlsState();
      showToast(`Duration set to ${settings.duration}s`);
    });
  });

  soundSettingCheck.addEventListener('change', () => {
    settings.sound = soundSettingCheck.checked;
    updateSoundIcons();
  });

  soundToggleBtn.addEventListener('click', () => {
    initAudio();
    settings.sound = !settings.sound;
    soundSettingCheck.checked = settings.sound;
    updateSoundIcons();
    showToast(settings.sound ? 'Sound enabled' : 'Sound muted');
  });

  function updateSoundIcons() {
    soundOnIcon.classList.toggle('hidden', !settings.sound);
    soundOffIcon.classList.toggle('hidden', settings.sound);
  }

  autoRemovePromptCheck.addEventListener('change', () => {
    settings.autoRemovePrompt = autoRemovePromptCheck.checked;
  });

  confettiSettingCheck.addEventListener('change', () => {
    settings.confetti = confettiSettingCheck.checked;
  });

  showHexOnWheelCheck.addEventListener('change', () => {
    settings.showHex = showHexOnWheelCheck.checked;
    drawWheel();
  });

  // Fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });

  // Copy Hex Pill
  function copyWinnerHex() {
    const hex = winnerHexText.textContent;
    navigator.clipboard.writeText(hex).then(() => {
      showToast(`Copied ${hex} to clipboard!`);
    }).catch(() => {
      showToast(`Code: ${hex}`);
    });
  }

  winnerHexPill.addEventListener('click', copyWinnerHex);

  // Winner Modal Buttons
  closeModalBtn.addEventListener('click', closeModal);
  spinAgainModalBtn.addEventListener('click', () => {
    closeModal();
    setTimeout(startSpin, 300);
  });
  removeWinnerModalBtn.addEventListener('click', removeCurrentWinner);

  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) closeModal();
  });

  // ==========================================================================
  // Secret Hotkeys & Keyboard Shortcuts (Hidden from UI)
  // ==========================================================================
  // F1 / F2 must be held for this long before they toggle
  const SECRET_HOLD_MS = 1000;
  const secretHoldTimers = {};

  // Each hold arms the override for the next spin only (cleared in finishSpin)
  function armSecretDark(force) {
    secretForceDark = force;
    secretAvoidDark = !force;
    console.log(`[Secret] ${force ? 'Force' : 'Avoid'} Dark armed for next spin`);
  }

  function armSecretLight(force) {
    secretForceLight = force;
    secretAvoidLight = !force;
    console.log(`[Secret] ${force ? 'Force' : 'Avoid'} Light armed for next spin`);
  }

  document.addEventListener('keyup', (e) => {
    const key = e.code || e.key;
    if (secretHoldTimers[key]) {
      clearTimeout(secretHoldTimers[key]);
      delete secretHoldTimers[key];
    }
  });

  document.addEventListener('keydown', (e) => {
    // Hidden Hotkey: hold F1 for 1s = Avoid Dark colors (or Shift+F1 = Force Dark)
    // Hidden Hotkey: hold F2 for 1s = Avoid Light colors (or Shift+F2 = Force Light)
    const key = e.code || e.key;
    if (key === 'F1' || key === 'F2') {
      e.preventDefault(); // Prevent browser help window / rename
      if (e.repeat || secretHoldTimers[key]) return; // already timing this hold
      const force = e.shiftKey;
      secretHoldTimers[key] = setTimeout(() => {
        delete secretHoldTimers[key];
        if (key === 'F1') armSecretDark(force);
        else armSecretLight(force);
      }, SECRET_HOLD_MS);
      return;
    }

    // Hidden Hotkey: F3 = Clear all overrides back to normal random
    if (e.key === 'F3' || e.code === 'F3') {
      e.preventDefault();
      secretAvoidDark = false;
      secretAvoidLight = false;
      secretForceDark = false;
      secretForceLight = false;
      console.log('[Secret] Hotkeys reset');
      return;
    }

    if (e.key === 'Escape') {
      if (!confirmModal.classList.contains('hidden')) {
        closeConfirmModal();
      } else if (!winnerModal.classList.contains('hidden')) {
        closeModal();
      }
    } else if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      startSpin();
    }
  });

  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  mainSpinBtn.addEventListener('click', startSpin);
  centerSpinBtn.addEventListener('click', startSpin);

  window.addEventListener('resize', () => {
    setupCanvasDPI();
    drawWheel();
  });

  setupCanvasDPI();
  renderChoicesList();
  renderPalettes();
  renderHistory();
  drawWheel();
  updateControlsState();
})();
