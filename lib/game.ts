export const STORAGE_KEY = 'diezmil.game.v1';
export const TARGET = 10000;
export type Player = { id: string; name: string; score: number; color: number };
export type Turn = { playerId: string; points: number; at: string };
export type Game = { version: 1; status: 'home' | 'setup' | 'playing' | 'finished'; players: Player[]; current: number; turns: Turn[]; input: string };
export const emptyGame = (): Game => ({version: 1, status: 'home', players: [], current: 0, turns: [], input: ''});
export const format = (value: number) => new Intl.NumberFormat('de-DE').format(value);
export function scoreValue(input: string): number | null {
 if (!/^\d*$/.test(input)) return null;
 const value = Number(input || 0);
 return Number.isSafeInteger(value) && value >= 0 && value <= 1000000 ? value : null;
}
export function saveTurn(game: Game): Game {
 const points = scoreValue(game.input);
 if (game.status !== 'playing' || points === null || !game.players[game.current]) return game;
 const player = game.players[game.current];
 const players = game.players.map(p => p.id === player.id ? {...p, score:p.score+points} : p);
 const won = players[game.current].score >= TARGET;
 return {...game, players, turns:[...game.turns,{playerId:player.id,points,at:new Date().toISOString()}], input:'', status:won?'finished':'playing',current:won?game.current:(game.current+1)%players.length};
}
export function undoTurn(game: Game): Game {
 const last=game.turns.at(-1);
 if (!last) return game;
 return {...game,status:'playing',players:game.players.map(p=>p.id===last.playerId?{...p,score:p.score-last.points}:p),current:game.players.findIndex(p=>p.id===last.playerId),turns:game.turns.slice(0,-1),input:String(last.points)};
}
export function decodeGame(raw: string): Game | null {
 try {
 const g = JSON.parse(raw) as Game;
 if(g.version!==1 || !['home','setup','playing','finished'].includes(g.status) || !Array.isArray(g.players) || !Array.isArray(g.turns) || typeof g.input!=='string' || !Number.isInteger(g.current)) return null;
 if(g.players.some(p=>!p || typeof p.id!=='string' || typeof p.name!=='string' || !p.name.trim() || p.name.length>40 || !Number.isSafeInteger(p.score) || p.score<0 || !Number.isInteger(p.color) || p.color<0)) return null;
 if(new Set(g.players.map(p=>p.id)).size!==g.players.length) return null;
 if(g.current<0 || (g.players.length>0 && g.current>=g.players.length) || (['playing','finished'].includes(g.status) && !g.players.length)) return null;
 if(g.turns.some(t=>!t || !g.players.some(p=>p.id===t.playerId) || !Number.isSafeInteger(t.points) || t.points<0 || t.points>1000000 || typeof t.at!=='string')) return null;
 const totals=new Map(g.players.map(p=>[p.id,0]));
 for(const t of g.turns) totals.set(t.playerId,totals.get(t.playerId)!+t.points);
 if(g.players.some(p=>totals.get(p.id)!==p.score)) return null;
 if(g.status==='finished' && g.players[g.current]?.score<TARGET) return null;
 if(g.status==='playing' && g.players.some(p=>p.score>=TARGET)) return null;
 return g;
 } catch {return null;}
}
