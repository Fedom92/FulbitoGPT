import { makePlayerId } from './id.js';

export const MAX_PLAYERS = 30;
export const MAX_PLAYER_NAME_LENGTH = 10;

// 'team': one team's formation over the whole pitch; colors are fixed per player.
// 'match': two teams, one per half; a player's color is the half it stands on.
export const MODE_TEAM = 'team';
export const MODE_MATCH = 'match';

export function normalizeMode(mode) {
  return mode === MODE_MATCH ? MODE_MATCH : MODE_TEAM;
}

// Match mode splits the pitch: top = blue, bottom = red, so dragging across
// the halfway line switches a player's team.
export const HALFWAY_Y = 50;

export function teamForY(y) {
  return y < HALFWAY_Y ? 'blue' : 'red';
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function mirrorForTeam(y, team) {
  return team === 'blue' ? y : 100 - y;
}

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const PER_ROW = 4;
const ROW_NEAR_GOAL_Y = 12;
const ROW_NEAR_HALFWAY_Y = 40;

// Evenly spaced rows inside one half, from the team's own goal toward the
// halfway line. Extra players go to the forward rows.
export function layoutPositions(count, team) {
  if (count <= 0) return [];
  const rows = Math.ceil(count / PER_ROW);
  const base = Math.floor(count / rows);
  const extra = count % rows;
  const positions = [];

  for (let r = 0; r < rows; r++) {
    const inRow = base + (r >= rows - extra ? 1 : 0);
    const y =
      rows === 1
        ? (ROW_NEAR_GOAL_Y + ROW_NEAR_HALFWAY_Y) / 2
        : ROW_NEAR_GOAL_Y + (r * (ROW_NEAR_HALFWAY_Y - ROW_NEAR_GOAL_Y)) / (rows - 1);
    for (let i = 0; i < inRow; i++) {
      positions.push({ x: round2(((i + 1) * 100) / (inRow + 1)), y: round2(mirrorForTeam(y, team)) });
    }
  }
  return positions;
}

// Re-places every player of each team on a tidy grid in its own half.
export function layoutTeams(players) {
  const byTeam = { blue: [], red: [] };
  players.forEach((p) => byTeam[p.team === 'red' ? 'red' : 'blue'].push(p));

  const placed = new Map();
  for (const team of ['blue', 'red']) {
    const positions = layoutPositions(byTeam[team].length, team);
    byTeam[team].forEach((p, i) => placed.set(p.id, { ...p, team, ...positions[i] }));
  }
  return players.map((p) => placed.get(p.id));
}

// Random, balanced split of everyone on the pitch.
export function shuffleTeams(players) {
  const shuffled = shuffle(players);
  // With an odd count, randomly pick which side gets the extra player.
  const blueCount =
    shuffled.length % 2 === 0 || Math.random() < 0.5
      ? Math.ceil(shuffled.length / 2)
      : Math.floor(shuffled.length / 2);
  const assigned = shuffled.map((p, i) => ({ ...p, team: i < blueCount ? 'blue' : 'red' }));
  // Positions follow the shuffled order, but the list keeps its original order.
  const placed = new Map(layoutTeams(assigned).map((p) => [p.id, p]));
  return players.map((p) => placed.get(p.id));
}

// Adds a batch of names, balancing team sizes with the players already on the
// pitch. 'random' shuffles the names first; 'ordered' sends the first part of
// the list to blue (top) and the rest to red (bottom).
export function addPlayersBalanced(existing, names, distribution) {
  const ordered = distribution === 'random' ? shuffle(names) : names;
  const existingBlue = existing.filter((p) => p.team !== 'red').length;
  const total = existing.length + ordered.length;
  const newBlue = Math.min(ordered.length, Math.max(0, Math.ceil(total / 2) - existingBlue));

  const added = ordered.map((name, i) => ({
    id: makePlayerId(),
    name,
    team: i < newBlue ? 'blue' : 'red',
    x: 50,
    y: 50,
  }));
  return layoutTeams([...existing, ...added]);
}

// First free spot near the middle of the pitch (team mode) or of the team's
// half (match mode), so players added one by one don't pile up on one point.
export function spawnPosition(players, team, mode) {
  const taken = (x, y) => players.some((p) => Math.hypot(p.x - x, p.y - y) < 8);
  if (mode !== MODE_MATCH) {
    for (const dy of [0, -12, 12]) {
      for (const dx of [0, -20, 20, -35, 35]) {
        if (!taken(50 + dx, 50 + dy)) return { x: 50 + dx, y: 50 + dy };
      }
    }
    return { x: 50, y: 50 };
  }

  const centerY = (ROW_NEAR_GOAL_Y + ROW_NEAR_HALFWAY_Y) / 2;
  for (const dy of [0, -10, 10]) {
    for (const dx of [0, -20, 20, -35, 35]) {
      const x = 50 + dx;
      const y = mirrorForTeam(centerY + dy, team);
      if (!taken(x, y)) return { x, y };
    }
  }
  return { x: 50, y: mirrorForTeam(centerY, team) };
}

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu;
const BULLET = /^\s*[-*•·>]+\s*/u;
const NUMBER_PREFIX = /^\s*\d+\s*[-.):°º]*\s*/u;

// Keeps whole words up to the max length ("Rodri amigo de Luqui" -> "Rodri"),
// and only cuts mid-word when the first word alone is too long.
function shortenName(name) {
  if (name.length <= MAX_PLAYER_NAME_LENGTH) return name;
  let short = '';
  for (const word of name.split(' ')) {
    const next = short ? `${short} ${word}` : word;
    if (next.length > MAX_PLAYER_NAME_LENGTH) break;
    short = next;
  }
  return short || name.slice(0, MAX_PLAYER_NAME_LENGTH);
}

// ---- Team mode: one team over the whole pitch, own goal at the bottom ----

const KEEPER_Y = 90;
const BACK_ROW_Y = 72;
const FRONT_ROW_Y = 22;

// First player in goal, the rest in rows of up to 4 from defense to attack
// (11 players -> 4-3-3). Extra players go to the back rows.
export function layoutFullField(count) {
  if (count <= 0) return [];
  const positions = [{ x: 50, y: KEEPER_Y }];
  const outfield = count - 1;
  if (outfield === 0) return positions;

  const rows = Math.max(Math.ceil(outfield / PER_ROW), outfield >= 3 ? 2 : 1);
  const base = Math.floor(outfield / rows);
  const extra = outfield % rows;
  for (let r = 0; r < rows; r++) {
    const inRow = base + (r < extra ? 1 : 0);
    const y = rows === 1 ? (BACK_ROW_Y + FRONT_ROW_Y) / 2 : BACK_ROW_Y - (r * (BACK_ROW_Y - FRONT_ROW_Y)) / (rows - 1);
    for (let i = 0; i < inRow; i++) {
      positions.push({ x: round2(((i + 1) * 100) / (inRow + 1)), y: round2(y) });
    }
  }
  return positions;
}

// Adds a batch of names with one color and re-places everyone over the whole
// pitch, keeping the current order (existing players first).
export function addPlayersFullField(existing, names, team) {
  const added = names.map((name) => ({ id: makePlayerId(), name, team, x: 50, y: 50 }));
  const all = [...existing, ...added];
  const positions = layoutFullField(all.length);
  return all.map((p, i) => ({ ...p, ...positions[i] }));
}

// ---- Switching modes: each mode remembers its own arrangement ----

export function snapshotLayout(players) {
  return Object.fromEntries(players.map((p) => [p.id, { x: p.x, y: p.y, team: p.team }]));
}

// First time a mode is used: team mode spreads everyone over the whole pitch;
// match mode keeps the colors if both are already in use, or splits the
// players in two balanced random teams.
function freshArrangement(players, mode) {
  if (mode === MODE_MATCH) {
    const colors = new Set(players.map((p) => (p.team === 'red' ? 'red' : 'blue')));
    return colors.size > 1 ? layoutTeams(players) : shuffleTeams(players);
  }
  const positions = layoutFullField(players.length);
  return players.map((p, i) => ({ ...p, ...positions[i] }));
}

// Arrangement when switching into `mode`. `saved` holds where each player was
// the last time that mode was active (undefined the first time). Players added
// since then go to a free spot (in match mode, on the smaller team).
export function arrangeForMode(players, mode, saved) {
  if (!saved || !players.some((p) => saved[p.id])) return freshArrangement(players, mode);

  const placed = players.map((p) => (saved[p.id] ? { ...p, ...saved[p.id] } : null));
  players.forEach((p, i) => {
    if (placed[i]) return;
    const current = placed.filter(Boolean);
    let team = p.team === 'red' ? 'red' : 'blue';
    if (mode === MODE_MATCH) {
      const blue = current.filter((q) => q.team !== 'red').length;
      team = blue <= current.length - blue ? 'blue' : 'red';
    }
    placed[i] = { ...p, team, ...spawnPosition(current, team, mode) };
  });
  return placed;
}

// Parses a list pasted from a WhatsApp group. Group lists number every spot
// ("1. Leo", "2 Alexis"); when a list is numbered, unnumbered lines are titles
// ("Futbol jueves 20.00") and numbers without a name are empty spots ("13").
export function parsePlayerList(text) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(EMOJI, '').replace(BULLET, ''));
  const isNumbered = (line) => NUMBER_PREFIX.test(line);
  const numberedList = lines.filter(isNumbered).length >= 2;

  return lines
    .filter((line) => !numberedList || isNumbered(line))
    .map((line) => line.replace(NUMBER_PREFIX, '').replace(BULLET, '').replace(/\s+/g, ' ').trim())
    .filter((name) => name.length > 0 && !name.endsWith(':'))
    .map(shortenName);
}
