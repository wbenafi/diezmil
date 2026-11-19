import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyGame, saveTurn, undoTurn, changeRule, decodeGame, scoreAtRisk, scorelessTurns, playerTurnHistory, previewTiePenalties, type Game} from '../lib/game';

const game = (): Game => ({...emptyGame(), rules: {exactTarget: false, scorelessPenalty: false, tiePenalty: false, penaltiesAfterEntry: false}, status: 'playing', players: ['Ana', 'Bruno', 'Carla'].map((name, color) => ({id: name, name, color, score: 0}))});
const score = (game: Game, current: number, points: number) => saveTurn({...game, current, input: String(points)});
function ready() {
 let g = score(game(), 0, 1000);
 g = score(g, 0, 500);
 return changeRule(g, 'tiePenalty', true);
}

test('ties are optional, previewed without mutation, and remove the last positive score after zero turns', () => {
 let g = score(ready(), 0, 0);
 g = score(g, 0, 0);
 g = {...g, current: 1, input: '1500'};
 const before = structuredClone(g);
 assert.deepEqual(previewTiePenalties(g), [{playerId: 'Ana', points: 500, previousScore: 1500}]);
 assert.deepEqual(g, before);
 const saved = saveTurn(g);
 assert.deepEqual(saved.players.map(p => p.score), [1000, 1500, 0]);
 assert.equal(saved.turns.length, g.turns.length + 1);
 assert.equal(scoreAtRisk(saved.turns, 'Ana'), 1000);
 assert.equal(scorelessTurns(saved.turns, 'Ana'), 2);
 assert.deepEqual(undoTurn(saved), g);
 assert.deepEqual(decodeGame(JSON.stringify(saved)), saved);
 assert.deepEqual(saveTurn(changeRule(g, 'tiePenalty', false)).players.map(p => p.score), [1500, 1500, 0]);
});

test('all tied opponents lose a score, but resulting ties do not cascade', () => {
 let g = changeRule(ready(), 'tiePenalty', false);
 g = score(g, 1, 800);
 g = score(g, 1, 700);
 g = score(g, 2, 1000);
 g = {...g, players: [...g.players, {id: 'Dani', name: 'Dani', color: 3, score: 0}]};
 const saved = score(changeRule(g, 'tiePenalty', true), 3, 1500);
 assert.deepEqual(saved.players.map(p => p.score), [1000, 800, 1000, 1500]);
 assert.equal(saved.turns.at(-1)?.tiePenalties.length, 2);
 assert.deepEqual(undoTurn(saved).players, g.players);
 assert.deepEqual(decodeGame(JSON.stringify(saved)), saved);
});

test('zero turns, busts, and losses never trigger a tie', () => {
 let g = score(changeRule(ready(), 'tiePenalty', false), 1, 1500);
 g = changeRule(g, 'tiePenalty', true);
 for (const saved of [score(g, 1, 0), score(changeRule(g, 'exactTarget', true), 1, 10000)]) {
  assert.equal(saved.turns.at(-1)?.tiePenalties.length, 0);
  assert.equal(saved.players[0].score, 1500);
 }
 let loss = score(changeRule(g, 'tiePenalty', false), 1, 500);
 loss = changeRule(changeRule(loss, 'tiePenalty', true), 'scorelessPenalty', true);
 for (let i = 0; i < 3; i++) loss = score(loss, 1, 0);
 assert.deepEqual(loss.players.map(p => p.score), [1500, 1500, 0]);
 assert.equal(loss.turns.at(-1)?.tiePenalties.length, 0);
 assert.equal(score(changeRule(game(), 'tiePenalty', true), 0, 0).turns[0].tiePenalties.length, 0);
});

test('the two penalties share available annotations, and undo restores eligibility', () => {
 let g = score(ready(), 1, 1500);
 g = changeRule(g, 'scorelessPenalty', true);
 for (let i = 0; i < 3; i++) g = score(g, 0, 0);
 assert.equal(g.players[0].score, 0);
 assert.equal(g.turns.at(-1)?.penalty, 1000);
 assert.equal(scoreAtRisk(g.turns, 'Ana'), 0);
 assert.equal(scoreAtRisk(undoTurn(g).turns, 'Ana'), 1000);
 assert.deepEqual(decodeGame(JSON.stringify(g)), g);
 // A three-turn penalty first must also remove the annotation from tie eligibility.
 let reverse = changeRule(ready(), 'scorelessPenalty', true);
 for (let i = 0; i < 3; i++) reverse = score(reverse, 0, 0);
 reverse = score(reverse, 1, 1000);
 assert.equal(reverse.players[0].score, 0);
 assert.equal(reverse.turns.at(-1)?.tiePenalties[0].points, 1000);
});

test('successive ties consume distinct scoring turns without producing negative totals', () => {
 let g = score(ready(), 1, 1500);
 g = score(g, 2, 1000);
 assert.deepEqual(g.players.map(p => p.score), [0, 1500, 1000]);
 assert.equal(scoreAtRisk(g.turns, 'Ana'), 0);
 assert.deepEqual(decodeGame(JSON.stringify(g)), g);
});

test('player history includes incoming deductions without inventing turns', () => {
 let g = score(ready(), 1, 1500);
 g = score(g, 0, 50);
 const history = playerTurnHistory(g.turns, 'Ana');
 assert.deepEqual(history.map(({number,total}) => [number,total]), [[1,1000],[2,1500],[2,1000],[3,1050]]);
 assert.equal(history[2].tiePenalty?.points, 500);
 assert.equal(history[2].turn.playerId, 'Bruno');
});

test('changing the rule is prospective and saved deductions survive disabling it', () => {
 const g = score(ready(), 1, 1500);
 const disabled = changeRule(g, 'tiePenalty', false);
 assert.deepEqual(disabled.players, g.players);
 assert.deepEqual(decodeGame(JSON.stringify(disabled)), disabled);
 assert.equal(undoTurn(disabled).players[0].score, 1500);
});

test('version 4 saves retain their scores, input, and history with ties disabled', () => {
 const current = score(changeRule(ready(), 'tiePenalty', false), 1, 1500);
 const old = {...current, version: 4, input: '250', rules: {exactTarget: false, scorelessPenalty: false}, turns: current.turns.map(({tiePenalties, ...turn}) => turn)};
 const restored = decodeGame(JSON.stringify(old))!;
 assert.equal(restored.version, 5);
 assert.equal(restored.rules.tiePenalty, false);
 assert.equal(restored.input, '250');
 assert.deepEqual(restored.players, current.players);
 assert.deepEqual(restored.turns, current.turns);
});

test('malformed tie records cannot alter restored scores', () => {
 const saved = score(ready(), 1, 1500);
 for (const change of [
  (g: any) => {delete g.turns.at(-1).tiePenalties;},
  (g: any) => {g.turns.at(-1).tiePenalties[0].points = -500;},
  (g: any) => {g.turns.at(-1).tiePenalties[0].previousScore = 2000;},
  (g: any) => {g.turns.at(-1).tiePenalties[0].playerId = 'unknown';},
  (g: any) => {g.turns.at(-1).tiePenalties[0].playerId = 'Bruno';},
  (g: any) => {g.turns.at(-1).tiePenalties.push(g.turns.at(-1).tiePenalties[0]);},
  (g: any) => {g.turns.at(-1).tiePenalties[0].points = 400; g.players[0].score = 1100;},
 ]) {
  const corrupt = structuredClone(saved);
  change(corrupt);
  assert.equal(decodeGame(JSON.stringify(corrupt)), null);
 }
});
