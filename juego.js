// Puños de Tuerca — peleas de robots de bloques.
import * as THREE from './three.module.min.js';

// ================= utilidades =================
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const vibrate = (ms) => { try { if (save.vibra !== false) navigator.vibrate?.(ms); } catch (e) {} };

// ================= catálogo de piezas =================
const ARMS = {
  puno:     { name: 'Puño de lata',        price: 0,    lvl: 1,  power: 1.0,  speed: 1.0,  reach: 0.95, radius: 0.10,  blast: 0.16, hp: 40, fist: 'box',    desc: 'Confiable y barato.' },
  largo:    { name: 'Brazo telescópico',   price: 180,  lvl: 2,  power: 0.9,  speed: 1.05, reach: 1.15, radius: 0.09,  blast: 0.15, hp: 34, fist: 'box', thin: true, desc: 'Más alcance: pegá desde lejos.' },
  bola:     { name: 'Bola de acero',       price: 350,  lvl: 3,  power: 1.45, speed: 0.82, reach: 0.95, radius: 0.13,  blast: 0.20, hp: 55, fist: 'ball',   desc: 'Pesada y contundente.' },
  taladro:  { name: 'Taladro',             price: 600,  lvl: 5,  power: 0.55, speed: 1.1,  reach: 1.02, radius: 0.075, blast: 0.12, hp: 45, fist: 'drill', pierce: true, desc: 'No rebota: perfora hasta el fondo.' },
  martillo: { name: 'Martillo hidráulico', price: 900,  lvl: 7,  power: 2.1,  speed: 0.62, reach: 0.98, radius: 0.14,  blast: 0.27, hp: 62, fist: 'hammer', desc: 'Lento, pero arranca pedazos.' },
  cohete:   { name: 'Puño cohete',         price: 1400, lvl: 9,  power: 1.35, speed: 1.25, reach: 1.0, fly: 1.5, radius: 0.10, blast: 0.18, hp: 46, fist: 'rocket', desc: 'El puño sale disparado.' },
  plasma:   { name: 'Puño de plasma',      price: 2200, lvl: 12, power: 1.75, speed: 1.1,  reach: 1.05, radius: 0.12,  blast: 0.30, hp: 52, fist: 'plasma', desc: 'Derrite todo lo que toca.' },
};
const LEGS = {
  basicas:  { name: 'Patas con rueditas', price: 0,    lvl: 1, height: 0.85, vrange: 0.42, mob: 3.0, hp: 55,  stab: 1.0, type: 'leg',    desc: 'Las de fábrica: ruedan de costado.' },
  zancos:   { name: 'Zancos',             price: 300,  lvl: 3, height: 1.05, vrange: 0.55, mob: 2.6, hp: 45,  stab: 0.8, type: 'stilt',  desc: 'Altura para pegar a la cabeza.' },
  ruedas:   { name: 'Ruedas todoterreno', price: 500,  lvl: 4, height: 0.75, vrange: 0.38, mob: 5.0, hp: 70,  stab: 1.1, type: 'wheel',  desc: 'Ruedas dobles: esquivá rapidísimo.' },
  resortes: { name: 'Resortes',           price: 800,  lvl: 6, height: 0.90, vrange: 0.62, mob: 4.2, hp: 55,  stab: 0.9, type: 'spring', desc: 'Agacharse y estirarse al máximo.' },
  orugas:   { name: 'Orugas blindadas',   price: 1200, lvl: 8, height: 0.70, vrange: 0.34, mob: 3.2, hp: 140, stab: 1.8, type: 'tread',  desc: 'Casi no te empujan.' },
};
const TORSOS = {
  lata:    { name: 'Chasis de lata',      price: 0,    lvl: 1,  w: 7, h: 9,  d: 3, hp: 1.0, shape: 'taper', desc: 'Se abolla con mirarlo.' },
  acero:   { name: 'Chasis de acero',     price: 400,  lvl: 3,  w: 7, h: 9,  d: 3, hp: 1.7, shape: 'taper', metal: 0.4, desc: 'Bastante más duro.' },
  ancho:   { name: 'Chasis ancho',        price: 700,  lvl: 5,  w: 9, h: 9,  d: 3, hp: 1.5, shape: 'v', desc: 'Más bloques para perder.' },
  titanio: { name: 'Titanio',             price: 1500, lvl: 8,  w: 7, h: 10, d: 3, hp: 2.5, shape: 'taper', metal: 0.6, desc: 'Liviano y durísimo.' },
  neutron: { name: 'Aleación neutrónica', price: 3000, lvl: 12, w: 8, h: 10, d: 4, hp: 3.4, shape: 'v', metal: 0.8, desc: 'Lo más duro que existe.' },
};
const HEADS = {
  basica:   { name: 'Cabeza de lata',   price: 0,    lvl: 1, w: 5, h: 4, d: 4, hp: 1.0, desc: 'Ojos saltones incluidos.' },
  casco:    { name: 'Casco',            price: 350,  lvl: 2, w: 5, h: 4, d: 4, hp: 1.6, helmet: true, desc: 'Una capa extra arriba.' },
  mini:     { name: 'Cabeza mini',      price: 600,  lvl: 4, w: 3, h: 3, d: 3, hp: 1.8, desc: 'Blanco chiquito, difícil de acertar.' },
  blindada: { name: 'Cabeza blindada',  price: 1000, lvl: 6, w: 5, h: 4, d: 4, hp: 2.8, helmet: true, visor: true, desc: 'Visor de combate.' },
};
const ALL = { ...ARMS, ...LEGS, ...TORSOS, ...HEADS };
const COLORS = ['#3fa9ff', '#ffb21f', '#2fe39a', '#ff4f6d', '#c86bff', '#eeeeee', '#ff7a1a', '#25d9e8', '#a4ff3a', '#6b7080'];
const ENEMY_COLORS = ['#ff2d6f', '#b44dff', '#ff5a36', '#36d67a', '#e8e23a', '#22c3ee', '#ff8a1f', '#e94cff'];
const NAMES = ['Chatarrín', 'Tornillo', 'Bulón', 'Remache', 'Engranaje', 'Cigüeñal', 'Pistón', 'Bujía', 'Carburador', 'Arandela', 'Diferencial', 'Burlete', 'Chaveta', 'Tuerquito', 'Cardán', 'Manivela'];
const PROP_OPTS = [
  { id: 'legLen', label: 'Largo de piernas', opts: [[0.8, 'Cortas'], [1, 'Normales'], [1.2, 'Largas']] },
  { id: 'torsoH', label: 'Alto del torso', opts: [[-2, 'Petiso'], [0, 'Normal'], [2, 'Alto']] },
  { id: 'torsoW', label: 'Ancho de espalda', opts: [[-2, 'Angosta'], [0, 'Normal'], [2, 'Ancha']] },
  { id: 'armLen', label: 'Largo de brazos (más largo = más alcance, más lento)', opts: [[0.9, 'Cortos'], [1, 'Normales'], [1.12, 'Largos']] },
  { id: 'neck', label: 'Cuello', opts: [[0, 'Corto'], [1, 'Largo']] },
];
const LOOK_OPTS = [
  { id: 'eyes', label: 'Ojos', opts: [['saltones', 'Saltones'], ['enojado', 'Enojados'], ['ciclope', 'Cíclope'], ['pantalla', 'Pantalla']] },
  { id: 'deco', label: 'Adorno', opts: [['nada', 'Nada'], ['antena', 'Antena'], ['cuernos', 'Cuernos'], ['cresta', 'Cresta'], ['orejas', 'Orejas']] },
  { id: 'mouth', label: 'Boca', opts: [['nada', 'Lisa'], ['dientes', 'Dientes'], ['rejilla', 'Rejilla']] },
  { id: 'shape', label: 'Forma del torso', opts: [['auto', 'Normal'], ['T', 'Hombrudo'], ['barril', 'Barril'], ['piramide', 'Pecho grande'], ['caja', 'Caja']] },
  { id: 'twoTone', label: 'Brazos y piernas', opts: [[false, 'Mismo color'], [true, 'Color de detalle']] },
];
const ACCENTS = ['#2b2b33', '#eeeeee', '#ffb21f', '#ff4f6d', '#2fe39a', '#3fa9ff', '#c86bff', '#ff7a1a'];
// tipos de rival: cada uno con piezas preferidas, aspecto y forma de pelear
const ARCHES = [
  { name: 'Boxeador', arms: ['puno', 'bola', 'plasma'], legs: ['basicas', 'ruedas'], torso: ['lata', 'acero', 'titanio'], head: ['basica', 'casco'],
    ai: { aggr: 1.1, dodge: 1, heavy: 0.5, head: 0.55, wander: 0.25 }, look: { shape: 'T', eyes: ['enojado', 'saltones'], deco: ['nada', 'orejas'] } },
  { name: 'Tanque', arms: ['bola', 'martillo'], legs: ['orugas', 'basicas'], torso: ['ancho', 'neutron', 'acero'], head: ['casco', 'blindada', 'basica'],
    ai: { aggr: 0.75, dodge: 0.35, heavy: 0.85, head: 0.3, wander: 0.1 }, look: { shape: 'barril', eyes: ['enojado', 'pantalla'], deco: ['cuernos'], mouth: 'rejilla', legLen: 0.8, torsoW: 2, neck: 0, armLen: [0.9, 1] } },
  { name: 'Saltarín', arms: ['puno', 'taladro', 'largo'], legs: ['resortes', 'basicas'], torso: ['lata', 'titanio'], head: ['mini', 'basica'],
    ai: { aggr: 1.4, dodge: 1.5, heavy: 0.15, head: 0.6, wander: 0.6 }, look: { eyes: ['saltones', 'ciclope'], deco: ['antena'], torsoH: -2, torsoW: [-2, 0] } },
  { name: 'Torre', arms: ['largo', 'cohete'], legs: ['zancos', 'resortes'], torso: ['lata', 'titanio'], head: ['basica', 'casco'],
    ai: { aggr: 0.9, dodge: 0.8, heavy: 0.6, head: 0.9, wander: 0.3 }, look: { shape: 'piramide', eyes: ['ciclope', 'saltones'], deco: ['cresta', 'antena'], legLen: 1.2, torsoH: [0, 2], neck: 1, armLen: 1.12, torsoW: [-2, 0] } },
  { name: 'Bólido', arms: ['puno', 'cohete', 'taladro'], legs: ['ruedas', 'basicas'], torso: ['lata', 'acero'], head: ['basica', 'mini'],
    ai: { aggr: 1.2, dodge: 1.2, heavy: 0.35, head: 0.5, wander: 0.9 }, look: { shape: 'caja', eyes: ['pantalla', 'saltones'], deco: ['antena', 'nada'], mouth: 'dientes', legLen: [0.8, 1] } },
  { name: 'Mordelón', arms: ['bola', 'puno', 'martillo'], legs: ['basicas', 'orugas'], torso: ['lata', 'ancho'], head: ['basica', 'casco'],
    ai: { aggr: 1.5, dodge: 0.6, heavy: 0.4, head: 0.5, wander: 0.2 }, look: { eyes: ['enojado'], deco: ['nada', 'cuernos'], mouth: 'dientes' } },
];
const UPGRADES = [
  { id: 'fuerza', name: 'Fuerza', desc: '+10% de daño por nivel' },
  { id: 'velocidad', name: 'Velocidad', desc: '+7% velocidad de golpe y carga' },
  { id: 'blindaje', name: 'Blindaje', desc: '+12% resistencia de bloques y miembros' },
];
const upCost = (l) => Math.round(120 * Math.pow(l + 1, 1.55));
const MAX_UP = 10;

// ================= guardado =================
const KEY = 'punos-de-tuerca-v1';
const defaultSave = () => ({
  v: 1, coins: 0, level: 1, sound: true, vibra: true, hinted: false,
  owned: { puno: 1, basicas: 1, lata: 1, basica: 1 },
  equip: { armL: 'puno', armR: 'puno', legs: 'basicas', torso: 'lata', head: 'basica' },
  color: '#3fa9ff', up: { fuerza: 0, velocidad: 0, blindaje: 0 }, seen: {},
  look: { eyes: 'saltones', deco: 'nada', mouth: 'nada', shape: 'auto', twoTone: false, accent: '#2b2b33', legLen: 1, torsoH: 0, torsoW: 0, armLen: 1, neck: 0 },
  stats: { wins: 0, losses: 0, kos: 0, limbs: 0 },
});
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) { const d = defaultSave(); return { ...d, ...s, up: { ...d.up, ...s.up }, stats: { ...d.stats, ...s.stats }, look: { ...d.look, ...s.look } }; }
  } catch (e) {}
  return defaultSave();
}
const save = loadSave();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
const playerCfg = (equip = save.equip) => ({ ...equip, color: save.color, up: save.up, look: save.look });

// ================= sonido (sintetizado) =================
const Sfx = {
  ctx: null, out: null, noiseBuf: null, hum: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    this.ctx = new C();
    this.out = this.ctx.createGain(); this.out.gain.value = save.sound ? 0.55 : 0;
    const comp = this.ctx.createDynamicsCompressor(); this.out.connect(comp); comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, len);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  setOn(on) { if (this.out) this.out.gain.value = on ? 0.55 : 0; },
  ok() { return this.ctx && save.sound; },
  tone(f0, f1, dur, type = 'square', vol = 0.2, delay = 0) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol, f0, f1 = f0, type = 'lowpass', q = 0.8, delay = 0) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.playbackRate.value = rand(0.8, 1.2);
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  hit(p) { const v = Math.min(1, 0.35 + p * 0.35); this.noise(0.18, 0.7 * v, 2400, 300); this.tone(170, 45, 0.2, 'sine', 0.8 * v); this.noise(0.08, 0.4 * v, 5000, 2000, 'highpass', 0.5, 0.01); },
  crunch(n) { for (let i = 0; i < Math.min(4, 1 + (n / 6) | 0); i++) this.noise(0.05, 0.25, rand(2500, 5000), 800, 'bandpass', 2, 0.02 + i * 0.035); },
  whoosh(c) { this.noise(0.16 + c * 0.08, 0.12 + c * 0.2, 600, 2600, 'bandpass', 1.5); },
  clash() { this.tone(1300, 1250, 0.35, 'triangle', 0.25); this.tone(1960, 1900, 0.3, 'sine', 0.15); this.noise(0.06, 0.3, 6000, 3000, 'highpass'); },
  block() { this.tone(420, 300, 0.12, 'square', 0.15); this.noise(0.07, 0.3, 3000, 900); },
  sever() { this.tone(900, 90, 0.4, 'sawtooth', 0.2); this.noise(0.3, 0.4, 4000, 400, 'bandpass', 1); },
  core() { this.tone(80, 30, 0.9, 'sawtooth', 0.5); this.noise(1.0, 0.8, 3000, 60); },
  ko() { this.noise(1.2, 0.9, 1800, 50); this.tone(120, 25, 1.1, 'sine', 0.9); this.tone(60, 20, 1.2, 'square', 0.2); },
  coin(i = 0) { this.tone(988, 990, 0.07, 'square', 0.12, i * 0.09); this.tone(1319, 1320, 0.16, 'square', 0.12, i * 0.09 + 0.07); },
  click() { this.tone(600, 400, 0.05, 'square', 0.08); },
  bell() { this.tone(880, 870, 0.5, 'triangle', 0.3); this.tone(1320, 1310, 0.4, 'sine', 0.15); },
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.18, 'square', 0.13, i * 0.1)); },
  lose() { [392, 330, 262].forEach((f, i) => this.tone(f, f * 0.97, 0.25, 'triangle', 0.2, i * 0.18)); },
  humStart() {
    if (!this.ok() || this.hum) return; const c = this.ctx;
    const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 90; f.type = 'lowpass'; f.frequency.value = 600;
    g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.1);
    o.connect(f); f.connect(g); g.connect(this.out); o.start(); this.hum = { o, g, f };
  },
  humSet(c) { if (!this.hum) return; this.hum.o.frequency.value = 90 + c * 260; this.hum.f.frequency.value = 600 + c * 2000; },
  humStop() {
    if (!this.hum) return; const { o, g } = this.hum, t = this.ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.stop(t + 0.1); this.hum = null;
  },
};

// ================= escena =================
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15131b);
scene.fog = new THREE.Fog(0x15131b, 7, 16);
const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 60);
const camLook = V(0, 1.2, 0);
let shake = 0;

scene.add(new THREE.HemisphereLight(0xc9d2ff, 0x2a2430, 1.25));
const sun = new THREE.DirectionalLight(0xffffff, 2.3); sun.position.set(2.5, 6, 4); scene.add(sun);
const rim = new THREE.DirectionalLight(0x8fb4ff, 1.1); rim.position.set(-3, 3, -5); scene.add(rim);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const floorTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#1c1a22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#34313c'; g.fillRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#3a3742'; g.fillRect(8, 8, w - 16, h - 16);
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(7, 7);
const glowTex = canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});
const shadowTex = canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});

// arena
const arena = new THREE.Group(); scene.add(arena);
{
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.6, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }));
  arena.add(floor);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.75, 0.5, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x1f1d26, roughness: 0.9 }));
  base.position.y = -0.25; arena.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.62, 0.035, 8, 96).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff8a1a }));
  ring.position.y = 0.01; arena.add(ring);
  // columnas de fondo
  const colMat = new THREE.MeshStandardMaterial({ color: 0x24212c, roughness: 0.9 });
  const stripMat = new THREE.MeshBasicMaterial({ color: 0x3a2a55 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, r = 7;
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), colMat);
    col.position.set(Math.cos(a) * r, 3.5, Math.sin(a) * r); col.lookAt(0, 3.5, 0); arena.add(col);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7, 0.05), stripMat);
    st.position.copy(col.position).multiplyScalar(0.91); st.position.y = 3.5; st.lookAt(0, 3.5, 0); arena.add(st);
  }
}

// ================= partículas =================
class Pool {
  constructor(n, size, material, gravity = 9.8, bounce = true) {
    this.n = n; this.g = gravity; this.bounce = bounce; this.size = size;
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, size), material, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.mesh.frustumCulled = false;
    this.p = []; this.v = []; this.r = []; this.rv = []; this.life = new Float32Array(n); this.max = new Float32Array(n); this.sc = new Float32Array(n);
    const m = new THREE.Matrix4().makeScale(0, 0, 0), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      this.p.push(V()); this.v.push(V()); this.r.push(new THREE.Euler()); this.rv.push(V());
      this.mesh.setMatrixAt(i, m); this.mesh.setColorAt(i, c.set(0xffffff));
    }
    this.i = 0; this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = V(); this.active = 0;
    scene.add(this.mesh);
  }
  spawn(pos, vel, color, life = 2.5, scale = 1) {
    const i = this.i; this.i = (this.i + 1) % this.n;
    this.p[i].copy(pos); this.v[i].copy(vel); this.r[i].set(rand(0, 6), rand(0, 6), rand(0, 6));
    this.rv[i].set(rand(-12, 12), rand(-12, 12), rand(-12, 12));
    this.life[i] = life * rand(0.8, 1.2); this.max[i] = this.life[i]; this.sc[i] = scale;
    this.mesh.setColorAt(i, color); this.mesh.instanceColor.needsUpdate = true;
  }
  update(dt) {
    const half = this.size / 2;
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const p = this.p[i], v = this.v[i];
      if (this.life[i] <= 0) { this.mesh.setMatrixAt(i, this._m.makeScale(0, 0, 0)); continue; }
      v.y -= this.g * dt; p.addScaledVector(v, dt);
      const r = this.r[i]; r.x += this.rv[i].x * dt; r.y += this.rv[i].y * dt; r.z += this.rv[i].z * dt;
      if (this.bounce && p.y < half && Math.hypot(p.x, p.z) < 3.6) {
        p.y = half; v.y *= -0.3; v.x *= 0.65; v.z *= 0.65; this.rv[i].multiplyScalar(0.5);
      }
      const k = Math.min(1, this.life[i] / Math.min(0.6, this.max[i] * 0.5)) * this.sc[i];
      this._q.setFromEuler(r); this._s.set(k, k, k);
      this.mesh.setMatrixAt(i, this._m.compose(p, this._q, this._s));
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  clear() { this.life.fill(0); const m = this._m.makeScale(0, 0, 0); for (let i = 0; i < this.n; i++) this.mesh.setMatrixAt(i, m); this.mesh.instanceMatrix.needsUpdate = true; }
}
const VS = 0.085; // tamaño de cada bloque
const debris = new Pool(700, VS * 0.88, new THREE.MeshStandardMaterial({ roughness: 0.55 }));
const sparks = new Pool(260, 0.035, new THREE.MeshBasicMaterial({ toneMapped: false }), 4, false);
const _col = new THREE.Color();
function sparkBurst(pos, n, color = 0xffd34d, speed = 4) {
  _col.set(color);
  for (let i = 0; i < n; i++) sparks.spawn(pos, V(rand(-1, 1), rand(-0.6, 1.2), rand(-1, 1)).normalize().multiplyScalar(rand(0.4, 1) * speed), _col, rand(0.15, 0.4));
}
// piezas sueltas (brazos cortados, ojos, etc.)
let rigids = [];
function addRigid(obj, vel) {
  scene.attach(obj);
  obj.traverse((o) => { if (o.isSprite) o.visible = false; });
  rigids.push({ obj, vel, av: V(rand(-9, 9), rand(-9, 9), rand(-9, 9)), life: 6 });
}
function updateRigids(dt) {
  for (const r of rigids) {
    r.life -= dt; r.vel.y -= 9.8 * dt; r.obj.position.addScaledVector(r.vel, dt);
    r.obj.rotation.x += r.av.x * dt; r.obj.rotation.y += r.av.y * dt; r.obj.rotation.z += r.av.z * dt;
    if (r.obj.position.y < 0.05 && Math.hypot(r.obj.position.x, r.obj.position.z) < 3.6) {
      r.obj.position.y = 0.05; r.vel.y *= -0.3; r.vel.x *= 0.6; r.vel.z *= 0.6; r.av.multiplyScalar(0.6);
    }
    if (r.life < 0) scene.remove(r.obj);
  }
  rigids = rigids.filter((r) => r.life >= 0);
}
function clearRigids() { for (const r of rigids) scene.remove(r.obj); rigids = []; }

// ================= geometría compartida =================
const segGeos = {};
const segGeo = (t) => segGeos[t] || (segGeos[t] = new THREE.BoxGeometry(t, 1, t).translate(0, 0.5, 0));
const jointGeo = new THREE.SphereGeometry(1, 14, 10);
const voxGeo = new THREE.BoxGeometry(VS * 0.93, VS * 0.93, VS * 0.93);
const springGeo = (() => {
  class Helix extends THREE.Curve { getPoint(t, o = V()) { const a = t * Math.PI * 2 * 7; return o.set(Math.cos(a) * 0.045, t, Math.sin(a) * 0.045); } }
  return new THREE.TubeGeometry(new Helix(), 160, 0.013, 5, false);
})();
const metalMat = new THREE.MeshStandardMaterial({ color: 0x9aa0ab, metalness: 0.75, roughness: 0.32 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x45474f, metalness: 0.7, roughness: 0.3 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: 0.85 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
const hubMat = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 0.4, roughness: 0.4 });
const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
const pupilMat = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.3 });
const visorMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff2a2a, emissiveIntensity: 2.2 });

const _t1 = V(), _t2 = V(), _t3 = V(), _t4 = V(), _pole = V(), _dir = V();
function placeSeg(m, a, b) {
  _dir.subVectors(b, a); const len = _dir.length();
  m.position.copy(a);
  if (len > 1e-5) m.quaternion.setFromUnitVectors(UP, _dir.multiplyScalar(1 / len));
  m.scale.set(1, Math.max(len, 1e-4), 1);
}
// IK de dos huesos: hombro->codo->muñeca
function ik2(a, t, L1, L2, pole, outMid, outEnd) {
  const d = _t1.subVectors(t, a); const dist = d.length();
  const dir = d.multiplyScalar(1 / Math.max(dist, 1e-5));
  const cd = clamp(dist, Math.abs(L1 - L2) + 0.02, (L1 + L2) * 0.999);
  const cosA = clamp((L1 * L1 + cd * cd - L2 * L2) / (2 * L1 * cd), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const perp = _t2.copy(pole).addScaledVector(dir, -pole.dot(dir));
  if (perp.lengthSq() < 1e-6) perp.set(0, -1, 0);
  perp.normalize();
  outMid.copy(a).addScaledVector(dir, L1 * cosA).addScaledVector(perp, L1 * sinA);
  outEnd.copy(a).addScaledVector(dir, cd);
}
function segDistSq(p, a, b) {
  const ab = _t3.subVectors(b, a), ap = _t4.subVectors(p, a);
  const t = clamp(ap.dot(ab) / Math.max(ab.lengthSq(), 1e-8), 0, 1);
  return ap.addScaledVector(ab, -t).lengthSq();
}

function makeFist(def, mat) {
  const g = new THREE.Group();
  const add = (geo, m, y = 0) => { const o = new THREE.Mesh(geo, m); o.position.y = y; g.add(o); return o; };
  switch (def.fist) {
    case 'ball': add(new THREE.SphereGeometry(0.13, 20, 14), darkMetal); break;
    case 'drill': {
      add(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 14), mat, -0.03);
      const spin = new THREE.Group(); g.add(spin);
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.26, 7), metalMat); c.position.y = 0.12; spin.add(c);
      g.userData.spin = spin; break;
    }
    case 'hammer': add(new THREE.BoxGeometry(0.05, 0.1, 0.05), darkMetal, -0.04); add(new THREE.BoxGeometry(0.3, 0.15, 0.17), darkMetal, 0.04); break;
    case 'rocket': {
      add(new THREE.BoxGeometry(0.13, 0.17, 0.13), mat);
      add(new THREE.BoxGeometry(0.22, 0.05, 0.02), darkMetal, -0.07); add(new THREE.BoxGeometry(0.02, 0.05, 0.22), darkMetal, -0.07);
      const flame = add(new THREE.ConeGeometry(0.05, 0.14, 8).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: 0xff8a1a, toneMapped: false }), -0.15);
      g.userData.flame = flame; break;
    }
    case 'plasma': add(new THREE.SphereGeometry(0.11, 18, 14), new THREE.MeshStandardMaterial({ color: 0x9ff7ff, emissive: 0x29d9ff, emissiveIntensity: 2.4 })); break;
    default: { const s = def.thin ? 0.13 : 0.15; add(new THREE.BoxGeometry(s, s * 1.05, s), mat); add(new THREE.BoxGeometry(s * 1.02, 0.03, s * 0.5), darkMat, s * 0.42).position.z = -s * 0.3; }
  }
  return g;
}

// ================= robot =================
const LAT = 1.05;   // desplazamiento lateral máximo (rueda de lado)
const DIST = 0.55;  // distancia de cada robot al centro

// resorte amortiguado de una dimensión: da el movimiento "articulado" con inercia y rebote
class Spring {
  constructor(k, d, x = 0) { this.k = k; this.d = d; this.x = x; this.v = 0; }
  step(target, h) { this.v += ((target - this.x) * this.k - this.v * this.d) * h; this.x += this.v * h; return this.x; }
}

const LOOK_DEFAULT = { eyes: 'saltones', deco: 'nada', mouth: 'nada', shape: 'auto', twoTone: false, accent: '#2b2b33', legLen: 1, torsoH: 0, torsoW: 0, armLen: 1, neck: 0 };
const SHAPES = {
  taper: (x, y, w) => y >= 3 || (x >= 1 && x <= w - 2),
  v: (x, y, w) => (y >= 4 ? true : y >= 2 ? x >= 1 && x <= w - 2 : x >= 2 && x <= w - 3),
  T: (x, y, w, h) => y >= h - 3 || (x >= 2 && x <= w - 3),
  barril: (x, y, w, h) => !((x === 0 || x === w - 1) && (y === 0 || y === h - 1 || y === 1 || y === h - 2)),
  piramide: (x, y, w, h) => { const c = (w - 1) / 2, half = 0.6 + (c - 0.6) * (y / (h - 1)); return Math.abs(x - c) <= half + 0.01; },
  caja: () => true,
};

class Robot {
  constructor(cfg, side) {
    this.cfg = cfg; this.side = side; this.isPlayer = side > 0;
    this.look = { ...LOOK_DEFAULT, ...(cfg.look || {}) };
    const lk = this.look;
    this.T = { ...TORSOS[cfg.torso] }; this.H = HEADS[cfg.head]; this.Lg = { ...LEGS[cfg.legs] };
    this.T.w = Math.max(5, this.T.w + (lk.torsoW | 0)); this.T.h = Math.max(6, this.T.h + (lk.torsoH | 0));
    this.Lg.height *= lk.legLen || 1; this.Lg.vrange *= lk.legLen || 1;
    this.armLen = lk.armLen || 1;
    const up = cfg.up || { fuerza: 0, velocidad: 0, blindaje: 0 };
    this.powMul = 1 + 0.1 * up.fuerza; this.spdMul = 1 + 0.07 * up.velocidad; this.armMul = 1 + 0.12 * up.blindaje;
    this.chargeTime = 0.85 / (1 + 0.04 * up.velocidad);
    this.color = new THREE.Color(cfg.color);
    this.accent = new THREE.Color(this.look.accent);
    this.mat = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.5, metalness: 0.1 + (this.T.metal || 0) * 0.4 });
    this.limbMat = this.look.twoTone ? new THREE.MeshStandardMaterial({ color: this.accent, roughness: 0.5, metalness: 0.2 }) : this.mat;
    this.accMat = new THREE.MeshStandardMaterial({ color: this.accent, roughness: 0.45, metalness: 0.3 });
    this.voxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: this.T.metal || 0.05 });
    this.root = new THREE.Group();
    this.torso = new THREE.Group(); this.root.add(this.torso);
    this.head = new THREE.Group(); this.torso.add(this.head);
    this.halfW = (this.T.w * VS) / 2; this.tH = this.T.h * VS; this.shY = this.tH - 0.07;
    this.torsoInv = new THREE.Matrix4(); this.headInv = new THREE.Matrix4(); this.rootInv = new THREE.Matrix4();
    this.idleT = Math.random() * 10;
    this._buildVoxels(); this._buildArms(); this._buildLegs();
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    this.shadow.position.y = 0.005; this.shadow.scale.set(0.9, 1, 0.7); this.root.add(this.shadow);
    // estado de control
    this.ox = 0; this.oy = 0;
    this.charging = false; this.chargeArm = null; this.nextArm = 1; this.combo = 0; this.comboT = 0;
    this.dead = false; this.deadT = 0; this.limbsLost = 0;
    // físicas
    const L = this.Lg, bouncy = L.type === 'spring';
    this.bx = 0; this.bvx = 0; this.ax = 0;           // base con ruedas
    this.hip = new Spring(bouncy ? 70 : 160, bouncy ? 5 : 15, L.height);
    this.sway = new Spring(140, 11);                   // el torso se atrasa respecto de las ruedas
    this.roll = new Spring(110, 8); this.pitch = new Spring(120, 10); this.yaw = new Spring(150, 12);
    this.hRoll = new Spring(90, 5); this.hPitch = new Spring(90, 5); this.hYaw = new Spring(90, 6);
    this.kb = new Spring(60, 9);
    this.px = 0; this.py = 0; // para compatibilidad (posición normalizada)
    this.placeForFight();
    scene.add(this.root);
    this.update(0);
  }
  placeForFight() { this.root.position.set(0, 0, this.side * DIST); this.root.rotation.set(0, this.side > 0 ? 0 : Math.PI, 0); }
  setGhost() {
    // tu robot se ve al 15%: así siempre ves al rival a través de él
    const map = new Map();
    this.root.traverse((o) => {
      if (!o.isMesh) return;
      let c = map.get(o.material);
      if (!c) { c = o.material.clone(); c.transparent = true; c.opacity = 0.15; c.depthWrite = false; map.set(o.material, c); }
      o.material = c;
    });
    this.voxMat = map.get(this.voxMat) || this.voxMat; this.coreMat = map.get(this.coreMat) || this.coreMat;
    this.shadow.visible = true;
  }
  dispose() {
    scene.remove(this.root); this.mat.dispose(); this.voxMat.dispose(); this.accMat.dispose();
    if (this.limbMat !== this.mat) this.limbMat.dispose();
    if (this === hummer) { Sfx.humStop(); hummer = null; }
  }

  _buildVoxels() {
    const T = this.T, H = this.H, lk = this.look, body = [], head = [];
    const shape = SHAPES[lk.shape !== 'auto' && SHAPES[lk.shape] ? lk.shape : T.shape] || SHAPES.caja;
    const cw = (T.w - 1) / 2, cd = (T.d - 1) / 2;
    const coreX = Math.floor(T.w / 2), coreY = Math.floor(T.h * 0.5), coreZ = Math.floor(T.d / 2);
    const bhp = T.hp * this.armMul;
    for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) for (let z = 0; z < T.d; z++) {
      const core = x === coreX && y === coreY && z === coreZ;
      if (!core && !shape(x, y, T.w, T.h)) continue;
      body.push({ p: V((x - cw) * VS, (y + 0.5) * VS, (z - cd) * VS), hp: bhp, max: bhp, core, shade: rand(0.86, 1.06) });
    }
    // cabeza (en su propio grupo para que pueda bambolearse)
    const neckH = VS * (0.6 + 2.2 * (lk.neck || 0)), hb = this.tH + neckH - VS * 0.2; this.headBase = hb; this.head.position.set(0, hb, 0);
    const hw = (H.w - 1) / 2, hd = (H.d - 1) / 2, hhp = H.hp * this.armMul;
    for (let y = 0; y < H.h; y++) for (let x = 0; x < H.w; x++) for (let z = 0; z < H.d; z++) {
      const v = { p: V((x - hw) * VS, (y + 0.5) * VS, (z - hd) * VS), hp: hhp, max: hhp, shade: rand(0.86, 1.06) };
      if (z === 0 && y === 0 && H.w >= 5 && x >= 1 && x <= H.w - 2) { // boca
        if (lk.mouth === 'dientes') { v.tint = x % 2 ? 0xffffff : 0x1a1a1a; v.shade = 1; }
        if (lk.mouth === 'rejilla') { v.tint = 0x222228; v.shade = 1; }
      }
      head.push(v);
    }
    let hTop = H.h;
    const deco = (x, y, z, hpk = 1, accent = true) =>
      head.push({ p: V((x - hw) * VS, (y + 0.5) * VS, (z - hd) * VS), hp: hhp * hpk, max: hhp * hpk, deco: true, shade: 1, tint: accent ? this.accent.getHex() : null });
    if (H.helmet) { for (let x = -1; x <= H.w; x++) for (let z = 0; z < H.d; z++) deco(x, H.h, z, 1.3, false); head[head.length - 1].shade = 0.55; hTop++; }
    for (const v of head) if (v.deco && !v.tint) v.shade = 0.55;
    if (lk.deco === 'cuernos') { for (const s of [0, H.w - 1]) { deco(s, hTop, 1); deco(s, hTop + 1, 1); deco(s + (s ? 1 : -1), hTop + 2, 1); } }
    if (lk.deco === 'cresta') { const c = Math.floor(H.w / 2); for (let z = 0; z < H.d; z++) { deco(c, hTop, z); if (z % 2 === 0) deco(c, hTop + 1, z); } }
    if (lk.deco === 'orejas') { for (const s of [-1, H.w]) for (let y = 1; y < Math.min(3, H.h); y++) deco(s, y, Math.floor(H.d / 2)); }
    this.headTop = hb + hTop * VS;

    const make = (list, parent, part) => {
      const inst = new THREE.InstancedMesh(voxGeo, this.voxMat, list.length);
      list.forEach((v, i) => { v.i = i; v.part = part; v.alive = true; inst.setMatrixAt(i, _mm.makeTranslation(v.p.x, v.p.y, v.p.z)); });
      parent.add(inst); return inst;
    };
    this.parts = [{ list: body, group: this.torso, inv: this.torsoInv }, { list: head, group: this.head, inv: this.headInv }];
    this.parts[0].inst = make(body, this.torso, 0); this.parts[1].inst = make(head, this.head, 1);
    this.vox = body.concat(head);
    for (const v of this.vox) this._shadeVox(v);
    this.headTotal = head.filter((v) => !v.deco).length; this.headAlive = this.headTotal;
    this.bodyTotal = body.filter((v) => !v.core).length; this.bodyAlive = this.bodyTotal;
    // núcleo brillante
    this.core = body.find((v) => v.core);
    this.core.max = this.core.hp = 6 * bhp;
    this.parts[0].inst.setMatrixAt(this.core.i, _m0);
    this.coreMat = new THREE.MeshStandardMaterial({ color: 0xfff1a8, emissive: 0xffc21a, emissiveIntensity: 2 });
    this.coreMesh = new THREE.Mesh(new THREE.BoxGeometry(VS * 0.95, VS * 0.95, VS * 0.95), this.coreMat);
    this.coreMesh.position.copy(this.core.p); this.torso.add(this.coreMesh);
    const neckLen = this.headBase - this.tH + VS * 0.2;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(VS * 1.4, neckLen, VS * 1.4), darkMetal);
    neck.position.set(0, this.tH + neckLen / 2 - VS * 0.1, 0); this.torso.add(neck);

    // ojos y adornos que no son bloques
    this.eyes = [];
    const frontZ = -(H.d * VS) / 2 - 0.012, ey = VS * H.h * 0.62;
    const attach = (obj, pt) => { this.head.add(obj); this.eyes.push({ obj, anchor: this._nearestHead(pt) }); return obj; };
    const style = H.visor ? 'visor' : lk.eyes;
    if (style === 'visor') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(H.w * VS * 0.85, VS * 0.55, 0.03), visorMat); m.position.set(0, ey, frontZ); attach(m, m.position);
    } else if (style === 'pantalla') {
      const em = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: this.accent.getHex() === 0x2b2b33 ? 0x3cff9a : this.accent, emissiveIntensity: 2.4 });
      for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(VS * 0.9, VS * 0.6, 0.025), em); m.position.set(s * VS * (H.w >= 5 ? 1 : 0.7), ey, frontZ); attach(m, m.position); }
    } else if (style === 'ciclope') {
      const r = H.w >= 5 ? 0.085 : 0.06, g = new THREE.Group();
      const w = new THREE.Mesh(jointGeo, eyeMat); w.scale.set(r, r, r * 0.6); g.add(w);
      const p = new THREE.Mesh(jointGeo, pupilMat); p.scale.setScalar(r * 0.45); p.position.z = -r * 0.45; g.add(p);
      g.position.set(0, ey, frontZ); attach(g, g.position).userData.pupil = p;
    } else {
      const sp = H.w >= 5 ? VS * 1.05 : VS * 0.75, r = H.w >= 5 ? 0.055 : 0.042;
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        const w = new THREE.Mesh(jointGeo, eyeMat); w.scale.set(r, r, r * 0.6); g.add(w);
        const p = new THREE.Mesh(jointGeo, pupilMat); p.scale.setScalar(r * 0.48); p.position.set(rand(-0.01, 0.01), rand(-0.01, 0.01), -r * 0.45); g.add(p);
        if (style === 'enojado') { const b = new THREE.Mesh(new THREE.BoxGeometry(r * 2.4, r * 0.5, r * 0.5), pupilMat); b.position.set(0, r * 1.05, -r * 0.3); b.rotation.z = s * 0.45; g.add(b); }
        g.position.set(s * sp, ey + (s > 0 ? 0.008 : -0.004), frontZ); attach(g, g.position).userData.pupil = p;
      }
    }
    if (lk.deco === 'antena') {
      const g = new THREE.Group();
      const rod = new THREE.Mesh(segGeo(0.014), darkMetal); rod.scale.y = 0.22; g.add(rod);
      const ball = new THREE.Mesh(jointGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: this.accent.getHex() === 0x2b2b33 ? 0xff3355 : this.accent, emissiveIntensity: 2 }));
      ball.scale.setScalar(0.035); ball.position.y = 0.23; g.add(ball);
      g.position.set(VS, hTop * VS, 0); attach(g, V(VS, hTop * VS, 0)); this.antenna = g;
    }
  }
  _nearestHead(pt) {
    let best = null, bd = 1e9;
    for (const v of this.parts[1].list) { const d = v.p.distanceToSquared(pt); if (d < bd) { bd = d; best = v; } }
    return best;
  }
  _shadeVox(v) {
    const k = v.shade * (0.32 + 0.68 * Math.max(0, v.hp) / v.max);
    if (v.tint != null) _col.set(v.tint).multiplyScalar(k); else _col.copy(this.color).multiplyScalar(k);
    this.parts[v.part].inst.setColorAt(v.i, _col);
  }
  _voxWorld(v, out) { return out.copy(v.p).applyMatrix4(this.parts[v.part].group.matrixWorld); }

  _buildArms() {
    this.arms = [this.cfg.armL, this.cfg.armR].map((id, i) => {
      const base = ARMS[id], k = this.armLen;
      const def = { ...base, reach: base.reach * k, fly: base.fly && base.fly * k, speed: base.speed / Math.sqrt(k) };
      const sgn = i === 0 ? -1 : 1, th = def.thin ? 0.055 : 0.072;
      const a = {
        def, sgn, i, L1: def.reach / 2, L2: def.reach / 2, hp: def.hp * this.armMul, lost: false,
        state: 'guard', t: 0, charge: 0, queued: null, power: 0, crit: false, hitDone: false, lastTick: 0, dur: 0.15, rdur: 0.18,
        fist: V(), fv: V(), fw: V(), from: V(), to: V(), elbow: V(), wrist: V(), prevW: V(),
        sh: V(sgn * (this.halfW + 0.055), this.shY, 0),
      };
      a.max = a.hp;
      a.shoulderJ = new THREE.Mesh(jointGeo, darkMetal); a.shoulderJ.scale.setScalar(0.075); a.shoulderJ.position.copy(a.sh);
      a.upper = new THREE.Mesh(segGeo(th), this.limbMat); a.fore = new THREE.Mesh(segGeo(th * 0.9), this.limbMat);
      a.elbowJ = new THREE.Mesh(jointGeo, darkMetal); a.elbowJ.scale.setScalar(th * 0.68);
      a.fistObj = makeFist(def, this.mat);
      a.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: def.fist === 'plasma' ? 0x4fe3ff : 0xffb21f, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      a.glow.visible = false; a.fistObj.add(a.glow);
      this.torso.add(a.shoulderJ, a.upper, a.fore, a.elbowJ, a.fistObj);
      if (def.fly) { a.cable = new THREE.Mesh(segGeo(0.014), darkMat); a.cable.visible = false; this.torso.add(a.cable); }
      a.fist.copy(this._guard(a));
      return a;
    });
  }
  _guard(a) {
    const t = this.idleT;
    return _t4.set(a.sgn * 0.25 + Math.sin(t * 1.3 + a.i) * 0.02, this.shY - 0.3 + Math.sin(t * 3 + a.i * 1.7) * 0.025, -0.27 + Math.sin(t * 2.1 + a.i * 2) * 0.03);
  }
  _back(a) { return V(a.sgn * 0.36, this.shY + 0.02, 0.14); }
  _punchTarget(a) {
    const R = a.def.fly || a.def.reach, dx = Math.abs(a.sh.x) - 0.05;
    const z = Math.sqrt(Math.max(0.01, R * R - dx * dx)) * 0.97;
    return V(a.sgn * 0.05, this.shY + 0.03, -z);
  }

  _buildLegs() {
    const L = this.Lg, len = (L.height + L.vrange) * 0.53 + 0.02;
    this.wheelR = L.type === 'wheel' ? 0.11 : L.type === 'tread' ? 0.06 : 0.065;
    this.footY = L.type === 'tread' ? 0.075 : this.wheelR;
    this.stance = L.type === 'tread' ? 0.22 : 0.2;
    this.ankleH = L.type === 'tread' ? 0.07 : this.wheelR + 0.01;
    this.legs = [-1, 1].map((sgn) => {
      const th = L.type === 'stilt' ? 0.045 : L.type === 'tread' ? 0.09 : 0.07;
      const l = { sgn, L1: len * 1.04, L2: len * 0.96, hp: L.hp * this.armMul, lost: false, hip: V(), knee: V(), foot: V(), ankle: V(), wheels: [] };
      l.max = l.hp;
      l.upper = new THREE.Mesh(segGeo(th), L.type === 'stilt' ? metalMat : this.limbMat);
      l.lower = L.type === 'spring' ? new THREE.Mesh(springGeo, metalMat) : new THREE.Mesh(segGeo(th * 0.9), L.type === 'stilt' ? metalMat : this.limbMat);
      l.kneeJ = new THREE.Mesh(jointGeo, darkMetal); l.kneeJ.scale.setScalar(th * 0.85);
      l.hipJ = new THREE.Mesh(jointGeo, darkMetal); l.hipJ.scale.setScalar(th * 0.8);
      l.ankleJ = new THREE.Mesh(jointGeo, darkMetal); l.ankleJ.scale.setScalar(th * 0.6);
      l.kneeCap = new THREE.Mesh(new THREE.BoxGeometry(th * 1.3, th * 1.3, th * 0.5), this.mat);
      const f = new THREE.Group();
      const wheel = (r, w) => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 20).rotateX(Math.PI / 2), tireMat));
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.01, 12).rotateX(Math.PI / 2), hubMat));
        g.add(new THREE.Mesh(new THREE.BoxGeometry(r * 1.4, r * 0.22, w + 0.012), hubMat));
        return g;
      };
      if (L.type === 'tread') {
        f.add(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.15), tireMat));
        for (const x of [-0.15, 0, 0.15]) { const w = wheel(0.06, 0.16); w.position.x = x; f.add(w); l.wheels.push(w); }
      } else {
        // horquilla + rueda: el robot rueda de costado
        const fork = new THREE.Mesh(new THREE.BoxGeometry(0.03, this.wheelR + 0.02, 0.1), darkMetal); fork.position.y = this.wheelR * 0.5; fork.position.z = 0; f.add(fork);
        const w = wheel(this.wheelR, L.type === 'wheel' ? 0.08 : 0.06); f.add(w); l.wheels.push(w);
        if (L.type === 'wheel') { const w2 = wheel(this.wheelR, 0.08); w2.position.z = 0.12; f.add(w2); l.wheels.push(w2); w.position.z = -0.06; w2.position.z = 0.06; }
      }
      l.footObj = f;
      this.root.add(l.upper, l.lower, l.kneeJ, l.hipJ, l.ankleJ, l.kneeCap, f);
      return l;
    });
    this.pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.12), darkMetal);
    this.pelvis.position.set(0, -0.02, 0); this.torso.add(this.pelvis);
  }

  // ---------- acciones ----------
  _pickArm() {
    let a = this.arms[this.nextArm];
    if (a.lost) a = this.arms[1 - this.nextArm];
    return a.lost ? null : a;
  }
  startCharge() {
    if (this.dead || this.charging) return;
    const a = this._pickArm(); if (!a) return;
    this.charging = true; this.chargeArm = a;
    if (a.state === 'guard') { a.state = 'charge'; a.charge = 0; }
    if (this.isPlayer && state === 'fight') { Sfx.humStart(); hummer = this; }
  }
  release() {
    if (!this.charging) return;
    this.charging = false;
    if (this === hummer) { Sfx.humStop(); hummer = null; }
    const a = this.chargeArm; this.chargeArm = null;
    if (!a || a.lost) return;
    if (a.state === 'charge') this.launch(a, a.charge); else a.queued = 0;
    if (!this.arms[1 - a.i].lost) this.nextArm = 1 - a.i;
  }
  launch(a, c) {
    if (a.lost || this.dead) return;
    const d = a.def;
    a.state = 'punch'; a.t = 0; a.charge = c; a.from.copy(a.fist); a.to.copy(this._punchTarget(a));
    a.dur = ((0.13 + (d.fly ? 0.07 : 0)) / (d.speed * this.spdMul)) * (1 + 0.15 * c);
    a.rdur = 0.2 / (d.speed * this.spdMul);
    a.crit = c >= 0.999;
    a.power = d.power * this.powMul * (0.45 + 0.85 * c) * (1 + 0.1 * Math.min(this.combo, 5)) * (a.crit ? 1.2 : 1);
    a.hitDone = false; a.lastTick = -1;
    a.prevW.copy(a.fw).applyMatrix4(this.torso.matrixWorld);
    // el cuerpo acompaña el golpe
    this.yaw.v += a.sgn * (2 + 3 * c); this.pitch.v -= 1 + 2 * c;
    Sfx.whoosh(c);
  }
  retract(a) { if (a.lost) return; a.state = 'retract'; a.t = 0; a.from.copy(a.fw); a.fist.copy(a.fw); a.fv.set(0, 0, 1.5); a.queued = null; }

  // ---------- daño ----------
  updateInverses() {
    this.torsoInv.copy(this.torso.matrixWorld).invert();
    this.headInv.copy(this.head.matrixWorld).invert();
    this.rootInv.copy(this.root.matrixWorld).invert();
  }
  // ¿el puño (punto en el mundo) toca algún bloque?
  touches(wp, r) {
    const cr2 = (r + VS * 0.5) ** 2;
    for (const part of this.parts) {
      if (part.gone) continue;
      const lp = _t3.copy(wp).applyMatrix4(part.inv);
      for (const v of part.list) if (v.alive && v.p.distanceToSquared(lp) < cr2) return true;
    }
    return false;
  }
  voxelHit(wp, P, blast, dirW) {
    const impW = V().copy(wp).addScaledVector(dirW, 0.09); // el centro del impacto queda un poco adentro
    const R = blast * (0.75 + 0.3 * Math.min(P, 3));
    let destroyed = 0, coreHit = false, headHit = false;
    for (const part of this.parts) {
      if (part.gone) continue;
      const imp = _t1.copy(impW).applyMatrix4(part.inv);
      for (const v of part.list) {
        if (!v.alive) continue;
        const d = v.p.distanceTo(imp); if (d > R) continue;
        const dmg = P * 2.8 * (1 - (0.75 * d) / R);
        if (part === this.parts[1]) headHit = true;
        if (v.core) { v.hp -= dmg * 0.55; coreHit = true; if (v.hp <= 0) this._destroyCore(); continue; }
        v.hp -= dmg;
        if (v.hp <= 0) { this._destroyVox(v, dirW, P); destroyed++; } else this._shadeVox(v);
      }
      part.inst.instanceMatrix.needsUpdate = true; if (part.inst.instanceColor) part.inst.instanceColor.needsUpdate = true;
    }
    // reacción física según dónde pegó
    const lp = _t2.copy(wp).applyMatrix4(this.torsoInv);
    const st = this.Lg.stab;
    this.flash = 1;
    this.kb.v += (P * 1.3) / st;
    this.pitch.v += (P * 7) / st;
    this.yaw.v += (-lp.x * P * 30) / st;
    this.roll.v += (lp.x * P * 10) / st;
    this.bvx += (-lp.x * P * 1.5) / st;
    if (headHit) { this.hPitch.v += P * 14; this.hRoll.v += lp.x * P * 40; this.hYaw.v += rand(-1, 1) * P * 8; }
    if (P > 1.1) for (const a of this.arms) if (a.state === 'charge') a.charge *= 0.5;
    for (const e of this.eyes) if (e.obj.userData.pupil) e.obj.userData.pupil.position.set(rand(-0.015, 0.015), rand(-0.015, 0.015), e.obj.userData.pupil.position.z);
    this.combo = 0;
    return { destroyed, coreHit };
  }
  _destroyVox(v, dirW, P = 1, extra = 0) {
    v.alive = false;
    this.parts[v.part].inst.setMatrixAt(v.i, _m0);
    if (!v.deco) { if (v.part === 1) this.headAlive--; else this.bodyAlive--; }
    const w = this._voxWorld(v, _t1);
    const vel = V(rand(-1.4, 1.4), rand(0.8, 3.2) + extra * 0.5, rand(-1.4, 1.4)).addScaledVector(dirW, rand(1, 3) * (0.6 + 0.4 * P) + extra);
    if (v.tint != null) _col.set(v.tint).multiplyScalar(v.shade * 0.9); else _col.copy(this.color).multiplyScalar(v.shade * 0.9);
    debris.spawn(w, vel, _col, rand(2, 3.5));
    for (const e of this.eyes) if (e.anchor === v && !e.gone) { e.gone = true; addRigid(e.obj, V(rand(-1, 1), rand(2, 4), 0).addScaledVector(dirW, 2)); }
  }
  _destroyCore() {
    if (!this.core.alive) return;
    this.core.alive = false; this.coreMesh.visible = false;
    sparkBurst(this._voxWorld(this.core, V()), 50, 0xffd34d, 6); Sfx.core();
    this.coreBroken = true;
  }
  damageLimb(kind, l, dmg, worldP, dirW) {
    if (l.lost) return false;
    l.hp -= dmg;
    sparkBurst(worldP, 10, 0xffe08a, 3);
    this.kb.v += (dmg * 0.025) / this.Lg.stab;
    if (kind === 'arm') { l.fv.addScaledVector(V(0, 0.5, 1), dmg * 0.25); this.yaw.v += -l.sgn * dmg * 0.15; }
    else this.roll.v += l.sgn * dmg * 0.12;
    if (l.hp <= 0) { this.sever(kind, l, dirW); return true; }
    return false;
  }
  sever(kind, l, dirW) {
    if (l.lost) return;
    l.lost = true; this.limbsLost++;
    const parts = kind === 'arm' ? [l.upper, l.fore, l.elbowJ, l.fistObj, l.cable].filter(Boolean) : [l.upper, l.lower, l.kneeJ, l.kneeCap, l.ankleJ, l.footObj];
    if (kind === 'arm') {
      l.state = 'lost';
      if (this.chargeArm === l) { this.charging = false; this.chargeArm = null; if (this === hummer) { Sfx.humStop(); hummer = null; } }
      sparkBurst(V().copy(l.sh).applyMatrix4(this.torso.matrixWorld), 30, 0xffc04d, 5);
      if (!this.arms[1 - l.i].lost) this.nextArm = 1 - l.i;
      this.roll.v += l.sgn * 4;
    } else {
      sparkBurst(V().copy(l.hip).applyMatrix4(this.root.matrixWorld), 30, 0xffc04d, 5);
      this.hip.v -= 2;
    }
    for (const p of parts) addRigid(p, V(rand(-1.5, 1.5), rand(2, 4), rand(-1, 1)).addScaledVector(dirW, rand(1.5, 3)));
    Sfx.sever();
  }
  explode(dirW) {
    this.dead = true; this.deadT = 0;
    for (const v of this.vox) {
      if (!v.alive || v.core) continue;
      if (v.part === 1 ? Math.random() < 0.55 : Math.random() < 0.4) this._destroyVox(v, dirW, 2, rand(0.5, 2.5));
    }
    for (const p of this.parts) p.inst.instanceMatrix.needsUpdate = true;
    this._destroyCore();
    // la cabeza sale volando entera
    this.parts[1].gone = true;
    addRigid(this.head, V(rand(-1, 1), rand(3.5, 5), 0).addScaledVector(dirW, 2.5));
    for (const a of this.arms) if (!a.lost && Math.random() < 0.6) this.sever('arm', a, dirW);
    for (const l of this.legs) if (!l.lost && Math.random() < 0.4) this.sever('leg', l, dirW);
    this.pitch.v += 3;
  }
  health() {
    if (this.arms.every((a) => a.lost)) return 0;
    if (this.coreBroken) return 0;
    const hF = (this.headAlive / this.headTotal - 0.4) / 0.6;
    const bF = (this.bodyAlive / this.bodyTotal - 0.35) / 0.65;
    const cF = this.core.hp / this.core.max;
    return clamp(Math.min(hF, bF, cF), 0, 1);
  }

  // ---------- físicas (pasos chicos para que los resortes sean estables) ----------
  _physics(h, lostLegs) {
    const L = this.Lg;
    const mob = L.mob * (lostLegs === 0 ? 1 : lostLegs === 1 ? 0.55 : 0.3);
    // ruedas: aceleración y velocidad limitadas
    const maxV = mob * 0.6, maxA = mob * 7;
    const tx = this.dead ? this.bx : this.ox * LAT;
    const wantV = clamp((tx - this.bx) * 9, -maxV, maxV);
    this.ax = clamp((wantV - this.bvx) * 14, -maxA, maxA);
    this.bvx += this.ax * h; this.bx += this.bvx * h;
    if (Math.abs(this.bx) > LAT + 0.1) { this.bx = Math.sign(this.bx) * (LAT + 0.1); this.bvx *= -0.3; }
    // altura de cadera
    // al rodar rápido flexiona las rodillas
    let hipT = L.height + this.oy * L.vrange - Math.min(0.08, Math.abs(this.bvx) * 0.04);
    if (lostLegs === 1) hipT *= 0.72;
    if (lostLegs === 2) hipT = 0.16;
    if (this.dead) hipT = 0.12;
    this.hip.step(hipT, h);
    if (this.hip.x < 0.1) { this.hip.x = 0.1; this.hip.v = Math.abs(this.hip.v) * 0.3; }
    // el torso se atrasa y se inclina por la inercia
    this.sway.step(-this.ax * 0.006, h);
    let lean = this.ax * 0.006 - this.bvx * 0.03;
    if (lostLegs === 1) lean += -this.legs.find((l) => l.lost).sgn * 0.22;
    this.roll.step(clamp(lean, -0.2, 0.2), h);
    let lunge = 0, twist = 0;
    for (const a of this.arms) {
      if (a.lost) continue;
      let p = 0;
      if (a.state === 'punch') p = easeOut(Math.min(1, a.t));
      else if (a.state === 'hold') p = 1;
      else if (a.state === 'retract') p = 1 - easeInOut(Math.min(1, a.t));
      else if (a.state === 'charge') twist -= a.sgn * a.charge * 0.22;
      lunge += p * (0.07 + 0.12 * a.charge); twist += a.sgn * p * 0.25;
    }
    this.lunge = lunge;
    if (this.dead) {
      // se desploma hacia atrás como un muñeco
      this.pitch.v += (6 + 10 * Math.sin(this.pitch.x)) * h; this.pitch.x += this.pitch.v * h;
      if (this.pitch.x > 1.35) { this.pitch.x = 1.35; this.pitch.v *= -0.35; }
    } else this.pitch.step(-lunge * 0.7 + (this.charging ? 0.06 : 0), h);
    this.yaw.step(twist, h);
    this.kb.step(0, h);
    // la cabeza se bambolea con las aceleraciones del torso
    this.hRoll.v -= (this.roll.v - (this._prRoll || 0)) * 0.5; this._prRoll = this.roll.v;
    this.hPitch.v -= (this.pitch.v - (this._prPitch || 0)) * 0.45; this._prPitch = this.pitch.v;
    this.hRoll.step(0, h); this.hPitch.step(0, h); this.hYaw.step(0, h);
    // inercia de los puños en guardia
    for (const a of this.arms) if (!a.lost && a.state !== 'punch' && a.state !== 'hold') a.fv.x -= this.ax * h * 0.6;
  }

  update(dt) {
    this.idleT += dt;
    const lostLegs = this.legs.filter((l) => l.lost).length;
    const prevBx = this.bx;
    const n = Math.max(1, Math.ceil(dt / 0.006)), h = dt / n;
    for (let s = 0; s < n; s++) this._physics(h, lostLegs);
    if (this.dead) this.deadT += dt;
    this.px = this.bx / LAT; this.py = (this.hip.x - this.Lg.height) / this.Lg.vrange;

    this.torso.position.set(this.bx + this.sway.x, this.hip.x, this.kb.x - this.lunge);
    this.torso.rotation.set(clamp(this.pitch.x, -0.6, 1.4), clamp(this.yaw.x, -0.7, 0.7), clamp(this.roll.x, -0.6, 0.6));
    if (!this.parts[1].gone) this.head.rotation.set(clamp(this.hPitch.x, -0.4, 0.4), clamp(this.hYaw.x, -0.4, 0.4), clamp(this.hRoll.x, -0.3, 0.3));
    if (this.antenna) this.antenna.rotation.set(this.hPitch.x * 2, 0, this.hRoll.x * 2.5 + this.roll.x * 1.5);
    this.torso.updateMatrix();

    if (this.charging) {
      let a = this.chargeArm;
      if (!a || a.lost) a = this.chargeArm = this._pickArm();
      if (a && a.state === 'guard') { a.state = 'charge'; a.charge = 0; }
      if (a && this === hummer) Sfx.humSet(a.charge);
    }
    for (const a of this.arms) this._updateArm(a, dt);

    // piernas con ruedas
    const tm = this.torso.matrix, dx = this.bx - prevBx;
    for (const l of this.legs) {
      if (l.lost) continue;
      l.hip.set(l.sgn * 0.15, 0, 0).applyMatrix4(tm);
      l.foot.set(this.bx + l.sgn * this.stance, this.footY, 0.03);
      l.ankle.set(l.foot.x, l.foot.y + this.ankleH, l.foot.z);
      // las rodillas apuntan adelante y un poco hacia afuera; se abren más al rodar rápido
      ik2(l.hip, l.ankle, l.L1, l.L2, _pole.set(l.sgn * 0.35 + this.bvx * 0.25, 0.05, -1), l.knee, _t3);
      placeSeg(l.upper, l.hip, l.knee); placeSeg(l.lower, l.knee, _t3);
      l.kneeJ.position.copy(l.knee); l.hipJ.position.copy(l.hip); l.ankleJ.position.copy(_t3);
      l.kneeCap.position.copy(l.knee).add(_t2.set(0, 0, -0.03)); l.kneeCap.quaternion.copy(l.upper.quaternion);
      l.footObj.position.copy(l.foot);
      for (const w of l.wheels) w.rotation.z -= dx / (this.Lg.type === 'tread' ? 0.06 : this.wheelR);
    }
    this.shadow.position.x = this.bx + this.sway.x * 0.5;

    this.flash = Math.max(0, (this.flash || 0) - dt * 7);
    this.voxMat.emissive.setScalar(this.flash * 0.45);
    this.coreMat.emissiveIntensity = 1.6 + Math.sin(this.idleT * 7) * 0.6;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
  }

  _updateArm(a, dt) {
    if (a.lost) return;
    const springTo = (tgt, k, d) => {
      const n = Math.max(1, Math.ceil(dt / 0.006)), h = dt / n;
      for (let s = 0; s < n; s++) {
        a.fv.x += ((tgt.x - a.fist.x) * k - a.fv.x * d) * h;
        a.fv.y += ((tgt.y - a.fist.y) * k - a.fv.y * d) * h;
        a.fv.z += ((tgt.z - a.fist.z) * k - a.fv.z * d) * h;
        a.fist.addScaledVector(a.fv, h);
      }
    };
    switch (a.state) {
      case 'guard':
        springTo(this._guard(a), 160, 15);
        if (a.queued != null && !this.dead) { const c = a.queued; a.queued = null; this.launch(a, c); }
        break;
      case 'charge': {
        a.charge = Math.min(1, a.charge + dt / this.chargeTime);
        const tgt = _t2.copy(this._guard(a)).lerp(this._back(a), easeOut(a.charge));
        if (a.charge >= 1) { tgt.x += rand(-0.015, 0.015); tgt.y += rand(-0.015, 0.015); }
        springTo(tgt, 220, 18);
        break;
      }
      case 'punch':
        a.t += dt / a.dur;
        a.fist.lerpVectors(a.from, a.to, easeOut(Math.min(1, a.t)));
        if (a.t >= 1) { a.state = 'hold'; a.t = 0; }
        break;
      case 'hold':
        a.t += dt;
        if (a.t > (a.def.pierce ? 0.16 : a.def.fly ? 0.12 : 0.06)) this.retract(a);
        break;
      case 'retract':
        a.t += dt / a.rdur;
        springTo(this._guard(a), 120, 11); // vuelve con un rebote
        if (a.t >= 1) { a.state = 'guard'; a.t = 0; }
        break;
    }
    if (this.dead && a.state === 'guard') { a.fist.y -= dt * 0.8; }
    ik2(a.sh, a.fist, a.L1, a.L2, _pole.set(a.sgn, -0.75, 0.35), a.elbow, a.wrist);
    if (a.def.fly) a.fw.copy(a.fist); else a.fw.copy(a.wrist);
    placeSeg(a.upper, a.sh, a.elbow); placeSeg(a.fore, a.elbow, a.wrist);
    a.elbowJ.position.copy(a.elbow);
    _dir.subVectors(a.fw, a.elbow).normalize();
    a.fistObj.position.copy(a.fw); a.fistObj.quaternion.setFromUnitVectors(UP, _dir);
    if (a.cable) { const gap = a.fw.distanceTo(a.wrist); a.cable.visible = gap > 0.04; if (a.cable.visible) placeSeg(a.cable, a.wrist, a.fw); }
    const active = a.state === 'punch' || a.state === 'hold';
    if (a.fistObj.userData.spin) a.fistObj.userData.spin.rotation.y += dt * (active ? 45 : a.state === 'charge' ? 20 * a.charge : 2);
    if (a.fistObj.userData.flame) a.fistObj.userData.flame.scale.setScalar(active && a.fw.distanceTo(a.wrist) > 0.04 ? rand(1.2, 2) : 0.5);
    let gs = 0;
    if (a.state === 'charge' && a.charge > 0.25) gs = a.charge;
    if (active && a.crit) gs = 1;
    if (a.def.fist === 'plasma') gs = Math.max(gs, 0.55);
    a.glow.visible = gs > 0; a.glow.scale.setScalar(gs * 0.6);
  }
}
const _m0 = new THREE.Matrix4().makeScale(0, 0, 0);
const _mm = new THREE.Matrix4();
let hummer = null; // robot que está sonando la carga

// ================= colisiones de golpes =================
const _p = V(), _cur = V(), _lp = V(), _rp = V(), _ow = V();
function checkPunches(att, opp, now) {
  if (opp.dead || att.dead) return;
  opp.updateInverses();
  const dirW = V(0, 0, -att.side);
  for (const a of att.arms) {
    if (a.lost || a.hitDone) continue;
    if (!(a.state === 'punch' || (a.def.pierce && a.state === 'hold'))) continue;
    _cur.copy(a.fw).applyMatrix4(att.torso.matrixWorld);
    for (let s = 1; s <= 4; s++) {
      _p.lerpVectors(a.prevW, _cur, s / 4);
      if (testHit(att, a, opp, _p, dirW, now)) break;
      if (a.hitDone) break;
    }
    a.prevW.copy(_cur);
  }
}
function testHit(att, a, opp, p, dirW, now) {
  const r = a.def.radius;
  // 1) contra los puños del rival: choque o bloqueo
  for (const b of opp.arms) {
    if (b.lost) continue;
    _ow.copy(b.fw).applyMatrix4(opp.torso.matrixWorld);
    if (_ow.distanceTo(p) < r + b.def.radius) {
      if (b.state === 'punch') {
        att.retract(a); opp.retract(b); a.hitDone = b.hitDone = true;
        sparkBurst(p, 24, 0xbfe9ff, 5); Sfx.clash(); addShake(0.06); hitstop = 0.06;
        if (att.isPlayer) popMsg('¡CHOQUE!', 500, true);
        return true;
      }
      opp.damageLimb('arm', b, a.power * 7, p, dirW);
      opp.kb.v += (a.power * 0.6) / opp.Lg.stab;
      att.retract(a); a.hitDone = true; Sfx.block(); addShake(0.03);
      onLimbEvent(att, opp, b);
      return true;
    }
  }
  // 2) contra los bloques del cuerpo y la cabeza
  if (opp.touches(p, r)) {
    if (a.def.pierce) {
      if (now - a.lastTick < 0.035) return false;
      a.lastTick = now;
      const res = opp.voxelHit(p, a.power, a.def.blast, dirW);
      onVoxelHit(att, opp, a, res, p, true);
      return false; // el taladro sigue de largo
    }
    const res = opp.voxelHit(p, a.power, a.def.blast, dirW);
    att.retract(a); a.hitDone = true;
    onVoxelHit(att, opp, a, res, p, false);
    return true;
  }
  // 3) contra los brazos del rival
  _lp.copy(p).applyMatrix4(opp.torsoInv);
  for (const b of opp.arms) {
    if (b.lost) continue;
    const rr = (r + 0.045) ** 2;
    if (segDistSq(_lp, b.sh, b.elbow) < rr || segDistSq(_lp, b.elbow, b.wrist) < rr) {
      opp.damageLimb('arm', b, a.power * 9, p, dirW);
      att.retract(a); a.hitDone = true; Sfx.block(); addShake(0.04); hitstop = 0.04;
      onLimbEvent(att, opp, b);
      return true;
    }
  }
  // 4) contra las piernas
  _rp.copy(p).applyMatrix4(opp.rootInv);
  for (const l of opp.legs) {
    if (l.lost) continue;
    const rr = (r + 0.05) ** 2;
    if (segDistSq(_rp, l.hip, l.knee) < rr || segDistSq(_rp, l.knee, l.foot) < rr) {
      opp.damageLimb('leg', l, a.power * 10, p, dirW);
      att.retract(a); a.hitDone = true; Sfx.block(); addShake(0.04); hitstop = 0.04;
      onLimbEvent(att, opp, l);
      return true;
    }
  }
  return false;
}
function onVoxelHit(att, opp, a, res, p, tick) {
  const P = a.power;
  if (!tick) {
    hitstop = 0.03 + Math.min(0.09, P * 0.04);
    addShake(0.04 + P * 0.04);
    Sfx.hit(P);
    sparkBurst(p, 8 + (P * 6) | 0, a.def.fist === 'plasma' ? 0x6fe9ff : 0xffe08a, 3 + P);
  } else { addShake(0.015); if (Math.random() < 0.5) Sfx.noise(0.05, 0.25, 4000, 2000, 'bandpass', 3); sparkBurst(p, 3, 0xffe08a, 2); }
  if (res.destroyed) Sfx.crunch(res.destroyed);
  if (!tick || res.destroyed) { att.combo++; att.comboT = 2.4; }
  if (att.isPlayer) {
    fight.dealt += res.destroyed;
    if (!tick) vibrate(15 + P * 15);
    if (a.crit && !tick) popMsg('¡CRÍTICO!', 600, true);
    if (att.combo >= 3) showCombo(att.combo);
  } else if (!tick) { vibrate(40 + P * 25); fight.taken += res.destroyed; }
  if (res.coreHit && opp.core.alive && att.isPlayer && !tick) popMsg('¡NÚCLEO!', 500, true);
}
function onLimbEvent(att, opp, limb) {
  if (limb.lost) {
    if (att.isPlayer) { fight.limbs++; popMsg('¡MUTILADO!', 800, true); vibrate(60); }
    else { vibrate(120); }
    hitstop = 0.12; addShake(0.12);
  }
}
function addShake(s) { shake = Math.min(0.25, shake + s); }

// ================= IA =================
class AI {
  constructor(bot, opp, skill, pers) {
    this.bot = bot; this.opp = opp; this.skill = skill;
    this.p = { aggr: 1, dodge: 1, heavy: 0.5, head: 0.5, wander: 0.3, ...(pers || {}) };
    this.think = 0.5; this.tx = 0; this.ty = 0; this.cool = rand(0.8, 1.4); this.goal = 0; this.held = 0; this.dodge = 0; this.roam = 0;
  }
  update(dt) {
    const me = this.bot, pl = this.opp, P = this.p; if (me.dead) return;
    const sk = this.skill;
    const plX = pl.torso.position.x; // el jugador no está rotado
    const alignOx = clamp(-plX / LAT, -1, 1);
    this.think -= dt; this.dodge -= dt; this.roam -= dt;
    const threat = pl.arms.some((a) => (a.state === 'charge' && a.charge > 0.4) || (a.state === 'punch' && a.t < 0.3));
    if (threat && this.dodge <= 0 && Math.random() < sk * P.dodge * dt * 2.4) {
      this.dodge = rand(0.35, 0.7);
      if (Math.random() < 0.65) this.tx = clamp(alignOx + (Math.random() < 0.5 ? -1 : 1) * rand(0.6, 1.0), -1, 1);
      else this.ty = -1;
    }
    if (this.think <= 0 && this.dodge <= 0) {
      this.think = rand(0.25, 0.7) * (1.6 - sk);
      if (Math.random() < P.wander * 0.35) {
        // se va rodando a otro lado para desacomodarte
        this.roam = rand(0.5, 1.1); this.tx = clamp(alignOx + (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 1.2), -1, 1);
      } else if (this.roam <= 0) this.tx = clamp(alignOx + (1 - sk) * rand(-0.6, 0.6), -1, 1);
      const head = Math.random() < (0.25 + sk * 0.35) * (0.5 + P.head);
      const plHip = pl.torso.position.y;
      const ty = head ? plHip + (pl.headBase + pl.headTop) / 2 : plHip + pl.tH * 0.55;
      const myHip = ty - (me.shY + 0.03);
      this.ty = clamp((myHip - me.Lg.height) / me.Lg.vrange + (1 - sk) * rand(-0.5, 0.5), -1, 1);
    }
    me.ox = this.tx; me.oy = this.ty;
    this.cool -= dt;
    const myX = -me.torso.position.x;
    const aligned = Math.abs(myX - plX) < 0.2 + (1 - sk) * 0.25;
    if (!me.charging && this.cool <= 0 && this.dodge <= 0 && this.roam <= 0 && (aligned || Math.random() < dt * 0.6)) {
      me.startCharge(); this.held = 0;
      this.goal = Math.random() < P.heavy ? rand(0.6, 1) : rand(0, 0.3);
    }
    if (me.charging) {
      this.held += dt;
      if (this.held >= this.goal * me.chargeTime + 0.05) { me.release(); this.cool = (rand(0.2, 0.9) * (1.7 - sk * 1.1)) / P.aggr; }
    }
  }
}

// ================= estado del juego =================
let state = 'menu';
let player = null, enemy = null, ai = null, enemyInfo = null;
let hitstop = 0, slowmo = 0, paused = false, gameTime = 0;
const fight = { timer: 75, dealt: 0, taken: 0, limbs: 0, introT: 0, endT: 0, result: null };
let spin = 0;

function rebuildPlayer(equip = save.equip) {
  if (player) player.dispose();
  player = new Robot(playerCfg(equip), 1);
  if (state === 'menu' || state === 'garage') showcase(player);
}
function showcase(r) { r.root.position.set(0, 0, 0); r.root.rotation.set(0, Math.PI + spin, 0); }

function makeEnemy(level) {
  const boss = level % 5 === 0;
  const lim = level + (boss ? 2 : 0);
  const arch = pick(ARCHES);
  const choose = (cat, prefs) => {
    const ok = prefs.filter((k) => cat[k].lvl <= lim);
    if (ok.length) return pick(ok);
    const ids = Object.keys(cat).filter((k) => cat[k].lvl <= lim).sort((a, b) => cat[a].lvl - cat[b].lvl);
    return pick(ids.slice(-2));
  };
  const lvl1 = level === 1;
  const f = Math.floor((level - 1) * 0.35) + (boss ? 1 : 0);
  const upv = () => clamp(f + ((Math.random() * 3) | 0) - 1, 0, MAX_UP);
  const one = (x) => (Array.isArray(x) ? pick(x) : x);
  const L = arch.look;
  const look = {
    eyes: one(L.eyes || pick(LOOK_OPTS[0].opts)[0]), deco: one(L.deco || 'nada'), mouth: one(L.mouth || pick(['nada', 'dientes', 'rejilla'])),
    shape: L.shape || 'auto', twoTone: Math.random() < 0.5, accent: pick(ACCENTS),
  };
  for (const g of PROP_OPTS) look[g.id] = L[g.id] != null ? one(L[g.id]) : pick(g.opts)[0];
  const cfg = {
    armL: lvl1 ? 'puno' : choose(ARMS, arch.arms), armR: lvl1 ? 'puno' : choose(ARMS, arch.arms),
    legs: lvl1 ? 'basicas' : choose(LEGS, arch.legs), torso: lvl1 ? 'lata' : choose(TORSOS, arch.torso), head: lvl1 ? 'basica' : choose(HEADS, arch.head),
    color: pick(ENEMY_COLORS.filter((c) => c !== save.color)), up: { fuerza: upv(), velocidad: upv(), blindaje: upv() }, look,
  };
  if (look.accent === cfg.color) look.accent = '#2b2b33';
  const skill = clamp(0.28 + level * 0.045 + (boss ? 0.08 : 0), 0.25, 0.86);
  const name = (boss ? 'JEFE ' : '') + pick(NAMES).toUpperCase();
  return { cfg, skill, name, boss, arch };
}

function clearArena() { debris.clear(); sparks.clear(); clearRigids(); }

function startFight() {
  Sfx.init();
  clearArena();
  if (enemy) enemy.dispose();
  rebuildPlayer(save.equip);
  player.placeForFight(); player.setGhost(true);
  enemyInfo = makeEnemy(save.level);
  enemy = new Robot(enemyInfo.cfg, -1);
  ai = new AI(enemy, player, enemyInfo.skill, enemyInfo.arch.ai);
  Object.assign(fight, { timer: 75, dealt: 0, taken: 0, limbs: 0, introT: 0, endT: 0, result: null });
  state = 'intro';
  show('hud'); $('#enemyName').textContent = `NV.${save.level} · ${enemyInfo.name} (${enemyInfo.arch.name.toUpperCase()})`;
  $('#hint').style.opacity = save.hinted ? 0 : 1;
  camera.position.set(1.6, 2.2, 3.4);
  popMsg(`NIVEL ${save.level}`, 900);
  setTimeout(() => { if (state === 'intro') popMsg(enemyInfo.boss ? '¡JEFE!' : enemyInfo.arch.name.toUpperCase(), 700); }, 950);
  setTimeout(() => { if (state === 'intro') { state = 'fight'; popMsg('¡PELEA!', 700); Sfx.bell(); } }, 1800);
}

function endFight(win, ko) {
  if (state !== 'fight') return;
  state = 'ko';
  input.end();
  player.release(); enemy.release();
  const loser = win ? enemy : player;
  if (ko) { loser.explode(V(0, 0, loser.side)); Sfx.ko(); slowmo = 1.4; addShake(0.25); vibrate([80, 40, 160]); popMsg(win ? '¡K.O.!' : '¡TE DESARMARON!', 1600); }
  else popMsg('¡TIEMPO!', 1400);
  fight.result = { win, ko };
  setTimeout(showResult, ko ? 2300 : 1600);
}

function showResult() {
  const { win, ko } = fight.result, L = save.level;
  const lines = [];
  if (win) {
    lines.push(['Victoria', 50 + L * 15]);
    if (ko) lines.push(['Nocaut', 20 + L * 6]);
    if (player.health() > 0.85) lines.push(['¡Impecable!', 40 + L * 5]);
  } else lines.push(['Por participar', 15 + L * 4]);
  if (fight.dealt) lines.push([`Bloques rotos (${fight.dealt})`, Math.round(fight.dealt * 0.6)]);
  if (fight.limbs) lines.push([`Miembros arrancados (${fight.limbs})`, fight.limbs * 20]);
  if (enemyInfo.boss && win) lines.push(['Jefe derrotado', 150 + L * 10]);
  const total = lines.reduce((s, l) => s + l[1], 0);
  save.coins += total;
  if (win) { save.stats.wins++; if (ko) save.stats.kos++; } else save.stats.losses++;
  save.stats.limbs += fight.limbs;
  const prevLevel = save.level;
  if (win) save.level++;
  persist();

  $('#resTitle').textContent = win ? '¡VICTORIA!' : 'DERROTA';
  $('#resTitle').className = win ? '' : 'lose';
  $('#nextBtn').textContent = win ? 'SIGUIENTE' : 'REVANCHA';
  const box = $('#resLines'); box.innerHTML = '';
  lines.forEach((l, i) => {
    const d = document.createElement('div'); d.className = 'res-line';
    d.innerHTML = `<span>${l[0]}</span><b>+${l[1]}</b>`; box.appendChild(d);
    setTimeout(() => { d.classList.add('show'); Sfx.coin(0); }, 250 + i * 220);
  });
  $('#resTotal').textContent = total;
  win ? Sfx.win() : Sfx.lose();
  show('result', true);
  state = 'result';
  // piezas nuevas
  if (win) {
    const fresh = Object.entries(ALL).filter(([, d]) => d.lvl > prevLevel && d.lvl <= save.level);
    if (fresh.length) {
      setTimeout(() => {
        $('#unlockList').innerHTML = fresh.map(([, d]) => `<div class="unlock-item">${d.name}<small>${d.desc}</small></div>`).join('');
        show('unlock', true); Sfx.win();
      }, 1400 + lines.length * 220);
    }
  }
}

function toMenu() {
  state = 'menu'; clearArena();
  if (enemy) { enemy.dispose(); enemy = null; }
  rebuildPlayer(save.equip);
  show('menu'); refreshMenu();
}

// ================= entrada =================
const input = {
  id: null, x0: 0, y0: 0, ox0: 0, oy0: 0, keys: {},
  down(e) {
    Sfx.init();
    if (state !== 'fight' || paused || this.id !== null) return;
    this.id = e.pointerId; this.x0 = e.clientX; this.y0 = e.clientY; this.ox0 = player.ox; this.oy0 = player.oy;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    player.startCharge();
    const st = $('#stick'); st.style.display = 'block'; st.style.left = e.clientX + 'px'; st.style.top = e.clientY + 'px';
    $('#stickDot').style.transform = 'translate(0,0)';
    if (!save.hinted) { save.hinted = true; persist(); $('#hint').style.opacity = 0; }
  },
  move(e) {
    if (e.pointerId !== this.id || state !== 'fight') return;
    const dx = e.clientX - this.x0, dy = e.clientY - this.y0;
    player.ox = clamp(this.ox0 + dx / (innerWidth * 0.3), -1, 1);
    player.oy = clamp(this.oy0 - dy / (innerHeight * 0.2), -1, 1);
    const m = Math.hypot(dx, dy), k = m > 40 ? 40 / m : 1;
    $('#stickDot').style.transform = `translate(${dx * k}px,${dy * k}px)`;
  },
  up(e) {
    if (e.pointerId !== this.id) return;
    this.id = null; $('#stick').style.display = 'none';
    if (state === 'fight') player.release();
  },
  end() { this.id = null; $('#stick').style.display = 'none'; },
};
canvas.addEventListener('pointerdown', (e) => input.down(e));
canvas.addEventListener('pointermove', (e) => input.move(e));
canvas.addEventListener('pointerup', (e) => input.up(e));
canvas.addEventListener('pointercancel', (e) => input.up(e));
// teclado (para jugar en compu): flechas/WASD mueven, espacio carga y suelta
addEventListener('keydown', (e) => {
  if (e.repeat) return; input.keys[e.code] = true;
  if (e.code === 'Space' && state === 'fight' && !paused) { Sfx.init(); player.startCharge(); e.preventDefault(); }
  if (e.code === 'Escape' && state === 'fight') setPaused(!paused);
});
addEventListener('keyup', (e) => {
  input.keys[e.code] = false;
  if (e.code === 'Space' && state === 'fight') player.release();
});
function keyMove(dt) {
  const k = input.keys, sp = 2.5 * dt;
  if (k.ArrowLeft || k.KeyA) player.ox = clamp(player.ox - sp, -1, 1);
  if (k.ArrowRight || k.KeyD) player.ox = clamp(player.ox + sp, -1, 1);
  if (k.ArrowUp || k.KeyW) player.oy = clamp(player.oy + sp, -1, 1);
  if (k.ArrowDown || k.KeyS) player.oy = clamp(player.oy - sp, -1, 1);
}
let dragRot = null;
canvas.addEventListener('pointerdown', (e) => { if (state === 'garage' || state === 'menu') dragRot = e.clientX; });
addEventListener('pointermove', (e) => { if (dragRot !== null) { spin += (e.clientX - dragRot) * 0.01; dragRot = e.clientX; } });
addEventListener('pointerup', () => { dragRot = null; });

// ================= HUD =================
let msgTimer = 0;
function popMsg(text, ms = 800, small = false) {
  const m = $('#msg'); m.textContent = text; m.style.fontSize = small ? 'clamp(30px,10vw,48px)' : '';
  m.classList.add('show'); m.style.transform = 'scale(1.25)';
  requestAnimationFrame(() => { m.style.transform = 'scale(1)'; });
  clearTimeout(msgTimer); msgTimer = setTimeout(() => m.classList.remove('show'), ms);
}
let comboTimer = 0;
function showCombo(n) {
  const c = $('#combo'); c.textContent = `COMBO x${n}`; c.classList.add('show');
  clearTimeout(comboTimer); comboTimer = setTimeout(() => c.classList.remove('show'), 1200);
}
function updateHud() {
  $('#barP').style.width = (player.health() * 100).toFixed(1) + '%';
  $('#barE').style.width = (enemy.health() * 100).toFixed(1) + '%';
  $('#timer').textContent = Math.max(0, Math.ceil(fight.timer));
}

// ================= pantallas =================
const screens = ['menu', 'garage', 'hud', 'pause', 'result', 'unlock'];
function show(id, overlay = false) {
  for (const s of screens) {
    if (overlay && s === 'hud') continue;
    $('#' + s).classList.toggle('hidden', s !== id);
  }
}
function refreshMenu() {
  $('#menuCoins').textContent = save.coins;
  $('#menuLevel').textContent = `Nivel ${save.level}` + (save.creator ? ' · MODO CREADOR' : '');
  const s = save.stats;
  $('#menuStats').textContent = s.wins + s.losses ? `${s.wins} victorias · ${s.kos} nocauts · ${s.limbs} miembros arrancados` : 'Arrastrá para moverte, soltá para pegar.';
  $('#soundBtn').textContent = save.sound ? '🔊' : '🔇';
  $('#playBtn').textContent = (save.level % 5 === 0 ? '¡JEFE! ' : '') + '¡A PELEAR!';
}

// ---------- garaje ----------
const SLOTS = [
  { id: 'armL', label: 'Brazo izq.', cat: ARMS }, { id: 'armR', label: 'Brazo der.', cat: ARMS },
  { id: 'legs', label: 'Piernas', cat: LEGS }, { id: 'torso', label: 'Torso', cat: TORSOS }, { id: 'head', label: 'Cabeza', cat: HEADS },
  { id: 'up', label: 'Mejoras' }, { id: 'paint', label: 'Pintura' }, { id: 'style', label: 'Estilo' }, { id: 'body', label: 'Cuerpo' },
];
let gTab = 'armR', gPreview = null;
function statsOf(slot, d) {
  if (slot === 'armL' || slot === 'armR') return [['Fuerza', d.power / 2.1], ['Velocidad', d.speed / 1.3], ['Alcance', (d.fly || d.reach) / 1.5], ['Aguante', d.hp / 62]];
  if (slot === 'legs') return [['Altura', (d.height + d.vrange) / 1.5], ['Agilidad', d.mob / 5], ['Aguante', d.hp / 140], ['Estabilidad', d.stab / 1.8]];
  if (slot === 'torso') return [['Blindaje', d.hp / 3.4], ['Tamaño', (d.w * d.h * d.d) / 320]];
  return [['Blindaje', d.hp / 2.8], ['Tamaño', (d.w * d.h * d.d) / 80]];
}
function openGarage(tab) {
  state = 'garage'; clearArena();
  if (enemy) { enemy.dispose(); enemy = null; }
  gPreview = { ...save.equip };
  if (tab) gTab = tab;
  rebuildPlayer(gPreview);
  show('garage'); renderGarage();
}
function closeGarage() { rebuildPlayer(save.equip); }
function renderGarage() {
  $('#garageCoins').textContent = save.coins;
  const tabs = $('#tabs'); tabs.innerHTML = '';
  for (const s of SLOTS) {
    const b = document.createElement('button'); b.className = 'tab' + (s.id === gTab ? ' on' : '');
    const hasNew = s.cat && Object.entries(s.cat).some(([k, d]) => d.lvl <= save.level && !save.owned[k] && !save.seen[k]);
    b.innerHTML = s.label + (hasNew ? '<span class="new-tag">NUEVO</span>' : '');
    b.onclick = () => { Sfx.click(); gTab = s.id; renderGarage(); };
    tabs.appendChild(b);
  }
  const box = $('#cards'); box.innerHTML = '';
  const slot = SLOTS.find((s) => s.id === gTab);
  if (gTab === 'paint') {
    const g = document.createElement('div'); g.className = 'swatches';
    for (const c of COLORS) {
      const s = document.createElement('div'); s.className = 'sw' + (c === save.color ? ' on' : ''); s.style.background = c;
      s.onclick = () => { Sfx.click(); save.color = c; persist(); rebuildPlayer(gPreview); renderGarage(); };
      g.appendChild(s);
    }
    box.appendChild(g); return;
  }
  if (gTab === 'style' || gTab === 'body') {
    for (const g of gTab === 'body' ? PROP_OPTS : LOOK_OPTS) {
      const row = document.createElement('div'); row.className = 'up-row';
      row.innerHTML = `<div class="cname" style="grid-column:1/3">${g.label}</div><div class="chips" style="grid-column:1/3"></div>`;
      const chips = row.querySelector('.chips');
      for (const [val, label] of g.opts) {
        const c = document.createElement('button'); c.className = 'chip' + (save.look[g.id] === val ? ' on' : ''); c.textContent = label;
        c.onclick = () => { Sfx.click(); save.look[g.id] = val; persist(); rebuildPlayer(gPreview); renderGarage(); };
        chips.appendChild(c);
      }
      box.appendChild(row);
    }
    if (gTab === 'body') return;
    const row = document.createElement('div'); row.className = 'up-row';
    row.innerHTML = `<div class="cname" style="grid-column:1/3">Color de detalle</div><div class="swatches" style="grid-column:1/3"></div>`;
    for (const c of ACCENTS) {
      const s = document.createElement('div'); s.className = 'sw' + (c === save.look.accent ? ' on' : ''); s.style.background = c;
      s.onclick = () => { Sfx.click(); save.look.accent = c; persist(); rebuildPlayer(gPreview); renderGarage(); };
      row.querySelector('.swatches').appendChild(s);
    }
    box.appendChild(row);
    return;
  }
  if (gTab === 'up') {
    for (const u of UPGRADES) {
      const lv = save.up[u.id], cost = save.creator ? 0 : upCost(lv), max = lv >= MAX_UP;
      const row = document.createElement('div'); row.className = 'up-row';
      row.innerHTML = `<div><div class="cname">${u.name}</div><div class="cdesc">${u.desc}</div></div>
        <button class="cbtn ${max ? 'eq' : save.coins < cost ? 'no' : ''}">${max ? 'MÁX' : '⬢ ' + cost}</button>
        <div class="dots" style="grid-column:1/3">${Array.from({ length: MAX_UP }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div>`;
      row.querySelector('button').onclick = () => {
        if (max || save.coins < cost) { Sfx.block(); return; }
        save.coins -= cost; save.up[u.id]++; persist(); Sfx.coin(); rebuildPlayer(gPreview); renderGarage();
      };
      box.appendChild(row);
    }
    return;
  }
  const entries = Object.entries(slot.cat).sort((a, b) => a[1].lvl - b[1].lvl);
  for (const [id, d] of entries) {
    const price = save.creator ? 0 : d.price;
    const owned = !!save.owned[id], locked = !save.creator && d.lvl > save.level, equipped = save.equip[gTab] === id, sel = gPreview[gTab] === id;
    if (!locked && !owned) save.seen[id] = 1;
    const card = document.createElement('div');
    card.className = 'card' + (sel ? ' sel' : '') + (locked ? ' locked' : '');
    let btn;
    if (locked) btn = `<button class="cbtn no">🔒 Nv.${d.lvl}</button>`;
    else if (equipped) btn = `<button class="cbtn eq">PUESTO</button>`;
    else if (owned) btn = `<button class="cbtn">PONER</button>`;
    else btn = `<button class="cbtn ${save.coins < price ? 'no' : ''}">${price ? '⬢ ' + price : 'GRATIS'}</button>`;
    card.innerHTML = `<div class="cname">${d.name}</div>${btn}<div class="cdesc">${d.desc}</div>
      <div class="cstats">${statsOf(gTab, d).map(([n, v]) => `<span>${n}</span><div class="sbar"><i style="width:${clamp(v, 0.05, 1) * 100}%"></i></div>`).join('')}</div>`;
    // tocar la tarjeta: probártela; tocar el botón: comprar / poner
    card.onclick = () => {
      if (locked) { Sfx.block(); return; }
      Sfx.click(); gPreview[gTab] = id;
      if (owned) save.equip[gTab] = id;
      persist(); rebuildPlayer(gPreview); renderGarage();
    };
    card.querySelector('button').onclick = (e) => {
      e.stopPropagation();
      if (locked || (!owned && save.coins < price)) { Sfx.block(); card.onclick(); return; }
      if (!owned) { save.coins -= price; save.owned[id] = 1; Sfx.coin(); Sfx.coin(1); }
      gPreview[gTab] = id; save.equip[gTab] = id;
      persist(); rebuildPlayer(gPreview); renderGarage();
    };
    box.appendChild(card);
  }
  persist();
}

// ---------- modo creador ----------
let titleTaps = 0, titleTimer = 0;
function setCreator(on) {
  save.creator = on; persist(); refreshMenu();
  popMenuNote(on ? 'Modo creador activado: todo desbloqueado y gratis' : 'Modo creador desactivado');
  on ? Sfx.win() : Sfx.lose();
}
function popMenuNote(text) {
  const n = $('#menuStats'); const prev = n.textContent; n.textContent = text; n.style.color = 'var(--acc)';
  setTimeout(() => { n.style.color = ''; refreshMenu(); }, 2500);
}
// 4 toques cortos y el 5.º manteniendo apretado 5 segundos
let holdTimer = 0;
const title = $('.title');
title.style.touchAction = 'none';
title.addEventListener('contextmenu', (e) => e.preventDefault());
title.addEventListener('pointerdown', () => {
  Sfx.init(); clearTimeout(titleTimer);
  if (titleTaps === 4) {
    title.style.transition = 'transform 5s linear'; title.style.transform = 'scale(0.92)';
    holdTimer = setTimeout(() => { titleTaps = 0; holdTimer = 0; title.style.transition = ''; title.style.transform = ''; setCreator(!save.creator); }, 5000);
  }
});
const titleUp = () => {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = 0; titleTaps = 0; title.style.transition = 'transform .2s'; title.style.transform = ''; return; }
  titleTaps = Math.min(4, titleTaps + 1);
  clearTimeout(titleTimer); titleTimer = setTimeout(() => { titleTaps = 0; }, 1500);
};
title.addEventListener('pointerup', titleUp);
title.addEventListener('pointercancel', () => { if (holdTimer) titleUp(); });

// ---------- botones ----------
const on = (id, fn) => $(id).addEventListener('click', () => { Sfx.init(); Sfx.click(); fn(); });
on('#playBtn', () => startFight());
on('#garageBtn', () => openGarage());
on('#garageBack', () => { closeGarage(); toMenu(); });
on('#garageFight', () => { closeGarage(); startFight(); });
on('#soundBtn', () => { save.sound = !save.sound; persist(); Sfx.setOn(save.sound); refreshMenu(); });
on('#pauseBtn', () => setPaused(true));
on('#resumeBtn', () => setPaused(false));
on('#quitBtn', () => { setPaused(false); if (state === 'fight') { fight.timer = 0; endFight(false, false); } });
on('#nextBtn', () => startFight());
on('#resGarage', () => openGarage());
on('#resMenu', () => toMenu());
on('#unlockGo', () => openGarage());
on('#unlockClose', () => show('result', true));
function setPaused(p) {
  paused = p;
  $('#pause').classList.toggle('hidden', !p);
  if (p) { input.end(); player?.release(); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'fight') setPaused(true); });

// ================= bucle principal =================
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w / h < 0.7 ? 64 : 50; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const camPos = V(), camTgt = V();
function updateCamera(dt) {
  if (state === 'menu' || state === 'garage') {
    const portrait = camera.aspect < 0.8;
    // se aleja según lo alto que sea el robot
    const H = player ? player.Lg.height + player.headTop : 2.1;
    camPos.set(0, H * (portrait ? 0.82 : 0.62), H * (portrait ? (state === 'garage' ? 2.5 : 2.08) : 1.55));
    camTgt.set(0, H * (state === 'garage' ? (portrait ? 0.07 : 0.38) : (portrait ? 0.7 : 0.5)), 0);
  } else if (player && enemy) {
    const px = player.torso.position.x, ex = -enemy.torso.position.x;
    const myHead = player.torso.position.y + player.headTop;
    const eMid = enemy.torso.position.y + enemy.tH * 0.6;
    // detrás de tu robot, a la altura de su cabeza, mirando al rival
    camPos.set(px * 0.75 + ex * 0.25, Math.max(1.9, myHead + 0.35), DIST + 2.3);
    camTgt.set(px * 0.3 + ex * 0.7, eMid * 0.85 + 0.15, -DIST);
    if (state === 'ko' && fight.result?.ko) { camPos.set(0.9, 2.3, DIST + 1.8); camTgt.set(0, 0.9, -DIST * (fight.result.win ? 1 : -1)); }
  }
  const k = 1 - Math.exp(-4 * dt);
  camera.position.lerp(camPos, k); camLook.lerp(camTgt, k);
  camera.lookAt(camLook);
  if (shake > 0) {
    camera.position.x += rand(-shake, shake) * 0.3; camera.position.y += rand(-shake, shake) * 0.3;
    camera.lookAt(camLook);
    shake = Math.max(0, shake - dt * 1.2);
  }
}

let last = performance.now();
function frame(t) {
  requestAnimationFrame(frame);
  const rdt = Math.min(0.05, (t - last) / 1000); last = t;
  let dt = rdt;
  if (hitstop > 0) { hitstop -= rdt; dt *= 0.06; }
  if (slowmo > 0) { slowmo -= rdt; dt *= 0.3; }
  if (paused) dt = 0;
  gameTime += dt;

  if (state === 'intro' || state === 'fight' || state === 'ko' || state === 'result') {
    if (state === 'fight') {
      keyMove(dt); ai.update(dt);
      fight.timer -= dt;
    }
    player.update(dt); enemy.update(dt);
    player.root.updateMatrixWorld(true); enemy.root.updateMatrixWorld(true);
    if (state === 'fight') {
      checkPunches(player, enemy, gameTime);
      checkPunches(enemy, player, gameTime);
      const hp = player.health(), he = enemy.health();
      if (he <= 0) endFight(true, true);
      else if (hp <= 0) endFight(false, true);
      else if (fight.timer <= 0) endFight(he < hp, false);
    }
    if (state !== 'result') updateHud();
  } else if (player) {
    spin += rdt * (dragRot === null ? 0.4 : 0);
    showcase(player);
    player.update(rdt);
    // demostración: tira golpes de vez en cuando en el menú
    if (state === 'menu') {
      player.idleDemo = (player.idleDemo || 0) - rdt;
      if (player.idleDemo <= 0) { player.idleDemo = rand(1.2, 2.5); player.startCharge(); setTimeout(() => player && state === 'menu' && player.release(), rand(150, 700)); }
    }
  }
  debris.update(dt); sparks.update(dt); updateRigids(dt);
  updateCamera(rdt);
  renderer.render(scene, camera);
}

// ================= arranque =================
rebuildPlayer();
show('menu'); refreshMenu();
camera.position.set(0, 1.6, 4); camLook.set(0, 1, 0);
$('#loading').remove();
requestAnimationFrame(frame);

// para pruebas desde la consola
window.__juego = { AI, get ai() { return ai; }, get player() { return player; }, get enemy() { return enemy; }, get state() { return state; }, save, startFight, endFight };
