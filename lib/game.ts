export const STORAGE_KEY = 'diezmil.game.v1';
export const TARGET = 10000;
export const SCORELESS_LIMIT = 3;

export type Player = { id: string; name: string; score: number; color: number };
export type Rules = { exactTarget: boolean; scorelessPenalty: boolean; tiePenalty: boolean };
export type TiePenalty = { playerId: string; points: number; previousScore: number };
export type Turn = {
 playerId: string;
 points: number;
 scoreChange: number;
 bust: boolean;
 penalty: number;
 tiePenalties: TiePenalty[];
 at: string;
};
export type Game = {
 version: 5;
 status: 'home' | 'setup' | 'playing' | 'finished';
 players: Player[];
 current: number;
 turns: Turn[];
 input: string;
 rules: Rules;
 scorelessPenaltySince: number;
};

export const emptyGame = (): Game => ({version: 5, status: 'home', players: [], current: 0, turns: [], input: '', rules: {exactTarget: true, scorelessPenalty: true, tiePenalty: true}, scorelessPenaltySince: 0});
export const format = (value: number) => new Intl.NumberFormat('de-DE').format(value);

export function scoreValue(input: string): number | null {
 if (!/^\d*$/.test(input)) return null;
 const value = Number(input || 0);
 return Number.isSafeInteger(value) && value >= 0 && value <= 1000000 ? value : null;
}

export function scorelessTurns(turns: Turn[], playerId: string, since = 0): number {
 let count = 0;
 for (let index = turns.length - 1; index >= since; index--) {
  const turn = turns[index];
  if (turn.playerId !== playerId) continue;
  if (turn.penalty > 0) break;
  if (!turn.bust && turn.points > 0) break;
  count++;
 }
 return count % SCORELESS_LIMIT;
}

export function scoringTurnAtRisk(turns: Turn[], playerId: string): Turn | undefined {
 const available: Turn[] = [];
 for (const turn of turns) {
  if (turn.playerId === playerId) {
   if (!turn.bust && turn.points > 0 && turn.scoreChange > 0) available.push(turn);
   if (turn.penalty > 0) available.pop();
  }
  if (turn.tiePenalties.some(penalty => penalty.playerId === playerId)) available.pop();
 }
 return available.at(-1);
}

export function scoreAtRisk(turns: Turn[], playerId: string): number {
 return scoringTurnAtRisk(turns, playerId)?.scoreChange ?? 0;
}

export function playerTurnHistory(turns: Turn[], playerId: string) {
 let total = 0;
 let number = 0;
 return turns.flatMap((turn, index) => {
  const tiePenalty = turn.tiePenalties.find(penalty => penalty.playerId === playerId);
  if (turn.playerId !== playerId && !tiePenalty) return [];
  if (!tiePenalty) number++;
  total += tiePenalty ? -tiePenalty.points : turn.scoreChange;
  return [{turn, number, total, tiePenalty, index}];
 });
}

// Only newly banked points trigger ties. Resolve all opponents against the
// same pre-turn scores, so a deduction cannot trigger another deduction.
export function previewTiePenalties(game: Game, points = scoreValue(game.input)): TiePenalty[] {
 const player = game.players[game.current];
 if (game.status !== 'playing' || !game.rules.tiePenalty || !player || points === null || points <= 0) return [];
 const total = player.score + points;
 if (game.rules.exactTarget && total > TARGET) return [];
 return game.players.flatMap(opponent => {
  if (opponent.id === player.id || opponent.score !== total) return [];
  const deduction = scoreAtRisk(game.turns, opponent.id);
  return deduction > 0 ? [{playerId: opponent.id, points: deduction, previousScore: opponent.score}] : [];
 });
}

export function changeRule(game: Game, rule: keyof Rules, enabled: boolean): Game {
 if ((game.status !== 'setup' && game.status !== 'playing') || game.rules[rule] === enabled) return game;
 return {
  ...game,
  rules: {...game.rules, [rule]: enabled},
  scorelessPenaltySince: rule === 'scorelessPenalty' ? game.turns.length : game.scorelessPenaltySince,
 };
}

function createTurn(turns: Turn[], player: Player, points: number, rules: Rules, scorelessPenaltySince: number, at = new Date().toISOString()): Turn {
 const bust = rules.exactTarget && player.score + points > TARGET;
 const pointsAdded = bust ? 0 : points;
 const reachesPenalty = rules.scorelessPenalty && pointsAdded === 0 && scorelessTurns(turns, player.id, scorelessPenaltySince) === SCORELESS_LIMIT - 1;
 const penalty = reachesPenalty ? scoreAtRisk(turns, player.id) : 0;
 return {playerId: player.id, points, scoreChange: pointsAdded - penalty, bust, penalty, tiePenalties: [], at};
}

export function saveTurn(game: Game): Game {
 const points = scoreValue(game.input);
 if (game.status !== 'playing' || points === null || !game.players[game.current]) return game;
 const player = game.players[game.current];
 const turn = createTurn(game.turns, player, points, game.rules, game.scorelessPenaltySince);
 turn.tiePenalties = previewTiePenalties(game, points);
 const players = game.players.map(p => {
  if (p.id === player.id) return {...p, score: p.score + turn.scoreChange};
  const penalty = turn.tiePenalties.find(penalty => penalty.playerId === p.id);
  return penalty ? {...p, score: p.score - penalty.points} : p;
 });
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
  players: game.players.map(p => p.id === last.playerId ? {...p, score: p.score - last.scoreChange} : {...p, score: p.score + (last.tiePenalties.find(penalty => penalty.playerId === p.id)?.points ?? 0)}),
  current: game.players.findIndex(p => p.id === last.playerId),
  turns: game.turns.slice(0, -1),
  scorelessPenaltySince: Math.min(game.scorelessPenaltySince, game.turns.length - 1),
  input: String(last.points),
 };
}

type StoredGame = Omit<Game, 'version' | 'turns' | 'rules' | 'scorelessPenaltySince'> & {
 version: 1 | 2 | 3 | 4 | 5;
 turns: Array<Partial<Turn> & Pick<Turn, 'playerId' | 'points' | 'at'>>;
 rules?: Partial<Rules>;
 scorelessPenaltySince?: number;
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
  version: 5,
  turns: g.turns.map(turn => ({playerId: turn.playerId, points: turn.points, scoreChange: turn.points, bust: false, penalty: 0, tiePenalties: [], at: turn.at})),
  rules: {exactTarget: false, scorelessPenalty: false, tiePenalty: false},
  scorelessPenaltySince: g.turns.length,
 };
}

export function decodeGame(raw: string): Game | null {
 try {
  const g = JSON.parse(raw) as StoredGame;
  if (![1, 2, 3, 4, 5].includes(g.version) || !validBaseGame(g)) return null;
  if (g.version === 1) {
   const oldTotals = new Map(g.players.map(p => [p.id, 0]));
   for (const turn of g.turns) oldTotals.set(turn.playerId, oldTotals.get(turn.playerId)! + turn.points);
   if (g.players.some(p => oldTotals.get(p.id)! !== p.score)) return null;
   return migrateV1(g);
  }
  const rules: Rules = g.version === 2
   ? {exactTarget: true, scorelessPenalty: true, tiePenalty: false}
   : {exactTarget: g.rules?.exactTarget === true, scorelessPenalty: g.rules?.scorelessPenalty === true, tiePenalty: g.version === 5 && g.rules?.tiePenalty === true};
  if (g.version >= 3 && (typeof g.rules?.exactTarget !== 'boolean' || typeof g.rules?.scorelessPenalty !== 'boolean')) return null;
  if (g.version === 5 && (typeof g.rules?.tiePenalty !== 'boolean' || g.turns.some(turn => !Array.isArray(turn.tiePenalties)))) return null;
  if (g.version >= 4 && (!Number.isInteger(g.scorelessPenaltySince) || g.scorelessPenaltySince! < 0 || g.scorelessPenaltySince! > g.turns.length)) return null;
  const turns = g.turns.map(turn => ({...turn, tiePenalties: g.version === 5 ? turn.tiePenalties : []})) as Turn[];
  if (turns.some(turn => !Number.isSafeInteger(turn.scoreChange) || !Number.isSafeInteger(turn.penalty) || turn.penalty < 0 || typeof turn.bust !== 'boolean' || turn.scoreChange !== (turn.bust ? 0 : turn.points) - turn.penalty || (g.version < 4 && ((!rules.exactTarget && turn.bust) || (!rules.scorelessPenalty && turn.penalty > 0))))) return null;
  const totals = new Map(g.players.map(p => [p.id, 0]));
  const previousTurns: Turn[] = [];
  for (const turn of turns) {
   totals.set(turn.playerId, totals.get(turn.playerId)! + turn.scoreChange);
   const affected = new Set<string>();
   for (const penalty of turn.tiePenalties) {
    if (!penalty || !totals.has(penalty.playerId) || penalty.playerId === turn.playerId || affected.has(penalty.playerId) || !Number.isSafeInteger(penalty.points) || penalty.points <= 0 || turn.bust || turn.scoreChange <= 0 || penalty.previousScore !== totals.get(penalty.playerId) || penalty.previousScore !== totals.get(turn.playerId) || penalty.points !== scoreAtRisk(previousTurns, penalty.playerId) || penalty.points > penalty.previousScore) return null;
    affected.add(penalty.playerId);
    totals.set(penalty.playerId, penalty.previousScore - penalty.points);
   }
   previousTurns.push(turn);
  }
  if (g.players.some(p => totals.get(p.id)! !== p.score || (rules.exactTarget && p.score > TARGET))) return null;
  if (g.status === 'finished' && (rules.exactTarget ? g.players[g.current]?.score !== TARGET : g.players[g.current]?.score < TARGET)) return null;
  if (g.status === 'playing' && g.players.some(p => rules.exactTarget ? p.score === TARGET : p.score >= TARGET)) return null;
  return {...g, version: 5, turns, rules, scorelessPenaltySince: g.version >= 4 ? g.scorelessPenaltySince! : rules.scorelessPenalty ? 0 : turns.length};
 } catch {
  return null;
 }
}
