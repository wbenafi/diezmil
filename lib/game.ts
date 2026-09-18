export const STORAGE_KEY = 'diezmil.game.v1';
export const TARGET = 10000;
export const SCORELESS_LIMIT = 3;

export type Player = { id: string; name: string; score: number; color: number };
export type Rules = { exactTarget: boolean; scorelessPenalty: boolean };
export type Turn = {
 playerId: string;
 points: number;
 scoreChange: number;
 bust: boolean;
 penalty: number;
 at: string;
};
export type Game = {
 version: 3;
 status: 'home' | 'setup' | 'playing' | 'finished';
 players: Player[];
 current: number;
 turns: Turn[];
 input: string;
 rules: Rules;
};

export const emptyGame = (): Game => ({version: 3, status: 'home', players: [], current: 0, turns: [], input: '', rules: {exactTarget: false, scorelessPenalty: false}});
export const format = (value: number) => new Intl.NumberFormat('de-DE').format(value);

export function scoreValue(input: string): number | null {
 if (!/^\d*$/.test(input)) return null;
 const value = Number(input || 0);
 return Number.isSafeInteger(value) && value >= 0 && value <= 1000000 ? value : null;
}

export function scorelessTurns(turns: Turn[], playerId: string): number {
 let count = 0;
 for (let index = turns.length - 1; index >= 0; index--) {
  const turn = turns[index];
  if (turn.playerId !== playerId) continue;
  if (turn.penalty > 0) break;
  if (!turn.bust && turn.points > 0) break;
  count++;
 }
 return count;
}

function latestScoringTurn(turns: Turn[], playerId: string): Turn | undefined {
 const available: Turn[] = [];
 for (const turn of turns) {
  if (turn.playerId !== playerId) continue;
  if (!turn.bust && turn.points > 0 && turn.scoreChange > 0) available.push(turn);
  if (turn.penalty > 0) available.pop();
 }
 return available.at(-1);
}

function createTurn(turns: Turn[], player: Player, points: number, rules: Rules, at = new Date().toISOString()): Turn {
 const bust = rules.exactTarget && player.score + points > TARGET;
 const pointsAdded = bust ? 0 : points;
 const reachesPenalty = rules.scorelessPenalty && pointsAdded === 0 && scorelessTurns(turns, player.id) === SCORELESS_LIMIT - 1;
 const penalty = reachesPenalty ? latestScoringTurn(turns, player.id)?.scoreChange ?? 0 : 0;
 return {playerId: player.id, points, scoreChange: pointsAdded - penalty, bust, penalty, at};
}

export function saveTurn(game: Game): Game {
 const points = scoreValue(game.input);
 if (game.status !== 'playing' || points === null || !game.players[game.current]) return game;
 const player = game.players[game.current];
 const turn = createTurn(game.turns, player, points, game.rules);
 const players = game.players.map(p => p.id === player.id ? {...p, score: p.score + turn.scoreChange} : p);
 const won = game.rules.exactTarget ? players[game.current].score === TARGET : players[game.current].score >= TARGET;
 return {
  ...game,
  players,
  turns: [...game.turns, turn],
  input: '',
  status: won ? 'finished' : 'playing',
  current: won ? game.current : (game.current + 1) % players.length,
 };
}

export function undoTurn(game: Game): Game {
 const last = game.turns.at(-1);
 if (!last) return game;
 return {
  ...game,
  status: 'playing',
  players: game.players.map(p => p.id === last.playerId ? {...p, score: p.score - last.scoreChange} : p),
  current: game.players.findIndex(p => p.id === last.playerId),
  turns: game.turns.slice(0, -1),
  input: String(last.points),
 };
}

type StoredGame = Omit<Game, 'version' | 'turns' | 'rules'> & {
 version: 1 | 2 | 3;
 turns: Array<Partial<Turn> & Pick<Turn, 'playerId' | 'points' | 'at'>>;
 rules?: Partial<Rules>;
};

function validBaseGame(g: StoredGame): boolean {
 if (!['home', 'setup', 'playing', 'finished'].includes(g.status) || !Array.isArray(g.players) || !Array.isArray(g.turns) || typeof g.input !== 'string' || !Number.isInteger(g.current)) return false;
 if (g.players.some(p => !p || typeof p.id !== 'string' || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 40 || !Number.isSafeInteger(p.score) || p.score < 0 || !Number.isInteger(p.color) || p.color < 0)) return false;
 if (new Set(g.players.map(p => p.id)).size !== g.players.length) return false;
 if (g.current < 0 || (g.players.length > 0 && g.current >= g.players.length) || (['playing', 'finished'].includes(g.status) && !g.players.length)) return false;
 return !g.turns.some(t => !t || !g.players.some(p => p.id === t.playerId) || !Number.isSafeInteger(t.points) || t.points < 0 || t.points > 1000000 || typeof t.at !== 'string');
}

function migrateV1(g: StoredGame): Game {
 return {
  ...g,
  version: 3,
  turns: g.turns.map(turn => ({playerId: turn.playerId, points: turn.points, scoreChange: turn.points, bust: false, penalty: 0, at: turn.at})),
  rules: {exactTarget: false, scorelessPenalty: false},
 };
}

export function decodeGame(raw: string): Game | null {
 try {
  const g = JSON.parse(raw) as StoredGame;
  if (![1, 2, 3].includes(g.version) || !validBaseGame(g)) return null;
  if (g.version === 1) {
   const oldTotals = new Map(g.players.map(p => [p.id, 0]));
   for (const turn of g.turns) oldTotals.set(turn.playerId, oldTotals.get(turn.playerId)! + turn.points);
   if (g.players.some(p => oldTotals.get(p.id)! !== p.score)) return null;
   return migrateV1(g);
  }
  const rules: Rules = g.version === 2
   ? {exactTarget: true, scorelessPenalty: true}
   : {exactTarget: g.rules?.exactTarget === true, scorelessPenalty: g.rules?.scorelessPenalty === true};
  if (g.version === 3 && (typeof g.rules?.exactTarget !== 'boolean' || typeof g.rules?.scorelessPenalty !== 'boolean')) return null;
  const turns = g.turns as Turn[];
  if (turns.some(turn => !Number.isSafeInteger(turn.scoreChange) || !Number.isSafeInteger(turn.penalty) || turn.penalty < 0 || typeof turn.bust !== 'boolean' || turn.scoreChange !== (turn.bust ? 0 : turn.points) - turn.penalty || (!rules.exactTarget && turn.bust) || (!rules.scorelessPenalty && turn.penalty > 0))) return null;
  const totals = new Map(g.players.map(p => [p.id, 0]));
  for (const turn of turns) totals.set(turn.playerId, totals.get(turn.playerId)! + turn.scoreChange);
  if (g.players.some(p => totals.get(p.id)! !== p.score || (rules.exactTarget && p.score > TARGET))) return null;
  if (g.status === 'finished' && (rules.exactTarget ? g.players[g.current]?.score !== TARGET : g.players[g.current]?.score < TARGET)) return null;
  if (g.status === 'playing' && g.players.some(p => rules.exactTarget ? p.score === TARGET : p.score >= TARGET)) return null;
  return {...g, version: 3, turns, rules} as Game;
 } catch {
  return null;
 }
}
