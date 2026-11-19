import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyGame, saveTurn, undoTurn, entryState, activeScorelessTurns, previewTiePenalties, decodeGame, changeRule, type Game} from '../lib/game';
const game = (): Game => ({...emptyGame(), status: 'playing', players: ['Ana','Bruno','Carla'].map((name,color)=>({id:name,name,color,score:0}))});
const score = (g: Game, current: number, points: number) => saveTurn({...g,current,input:String(points)});
const totals = (g: Game) => g.players.map(p=>p.score);
function ready() {let g=game();for(let i=0;i<3;i++)g=score(g,i,300);return g;}

test('matching opening scores, including the final entry, keep all 300 points',()=>{
 let g=game();
 for(let i=0;i<3;i++){
  const pending={...g,current:i,input:'300'};
  assert.deepEqual(previewTiePenalties(pending),[]);
  g=saveTurn(pending);
  assert.deepEqual(g.turns.at(-1)?.tiePenalties,[]);
  assert.equal(entryState(g).ready,i===2);
 }
 assert.deepEqual(totals(g),[300,300,300]);
 assert.equal(entryState(g).since,3);
 assert.deepEqual(decodeGame(JSON.stringify(g)),g);
});

test('pre-300 zeros never count; third zero after everyone reaches 300 deducts the last score',()=>{
 let g=score(game(),0,500);
 for(let i=0;i<5;i++)g=score(g,0,0);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 assert.equal(g.players[0].score,500);
 g=score(score(g,1,300),2,300);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 for(let i=1;i<=2;i++){g=score(g,0,0);assert.equal(activeScorelessTurns(g,'Ana'),i);assert.equal(g.players[0].score,500);}
 g=score(g,0,0);
 assert.equal(g.turns.at(-1)?.penalty,500);
 assert.equal(g.players[0].score,0);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 assert.equal(entryState(g).ready,true);
 assert.equal(activeScorelessTurns(undoTurn(g),'Ana'),2);
});

test('after entry, ties deduct normally; undo restores every affected score',()=>{
 let g=score(ready(),0,200);
 const pending={...g,current:1,input:'200'};
 assert.deepEqual(previewTiePenalties(pending),[{playerId:'Ana',points:200,previousScore:500}]);
 g=saveTurn(pending);
 assert.deepEqual(totals(g),[300,500,300]);
 assert.deepEqual(undoTurn(g),pending);
 assert.deepEqual(decodeGame(JSON.stringify(g)),g);
});

test('undoing the last entry returns to protected entry phase, also after reload',()=>{
 const g=undoTurn(ready());
 assert.equal(entryState(g).ready,false);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 assert.deepEqual(previewTiePenalties(g),[]);
 assert.equal(entryState(decodeGame(JSON.stringify(g))!).ready,false);
 assert.deepEqual(totals(saveTurn(g)),[300,300,300]);
});

test('points below 300 always count; entry is reached by running total',()=>{
 let g=score(game(),0,100);
 assert.equal(g.players[0].score,100);
 assert.equal(entryState(g).entered.has('Ana'),false);
 g=score(g,0,200);
 assert.equal(g.players[0].score,300);
 assert.equal(entryState(g).entered.has('Ana'),true);
});

test('before everyone reaches 300, small matching scores do not tie-penalize',()=>{
 const g=score(game(),0,100);
 const pending={...g,current:1,input:'100'};
 assert.deepEqual(previewTiePenalties(pending),[]);
 assert.deepEqual(totals(saveTurn(pending)),[100,100,0]);
});

test('with the rule off, both penalties apply from the first turn',()=>{
 let g=changeRule(game(),'penaltiesAfterEntry',false);
 g=score(g,0,100);
 assert.deepEqual(previewTiePenalties({...g,current:1,input:'100'}),[{playerId:'Ana',points:100,previousScore:100}]);
 for(let i=0;i<3;i++)g=score(g,0,0);
 assert.equal(g.players[0].score,0);
 assert.equal(g.turns.at(-1)?.penalty,100);
});

test('turning the rule off midgame starts penalties with a fresh streak',()=>{
 let g=score(score(game(),0,100),0,0);
 g=changeRule(g,'penaltiesAfterEntry',false);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 g=score(score(g,0,0),0,0);
 assert.equal(g.players[0].score,100);
 g=score(g,0,0);
 assert.equal(g.players[0].score,0);
});

test('saves from before this rule keep penalties from the first turn',()=>{
 const saved=score({...game(),rules:{...game().rules,penaltiesAfterEntry:false}},0,100);
 const old=JSON.parse(JSON.stringify(saved));delete old.rules.penaltiesAfterEntry;
 assert.equal(decodeGame(JSON.stringify(old))?.rules.penaltiesAfterEntry,false);
 assert.equal(decodeGame(JSON.stringify(saved))?.rules.penaltiesAfterEntry,false);
 assert.equal(decodeGame(JSON.stringify(game()))?.rules.penaltiesAfterEntry,true);
});

test('a late join pauses penalties and starts fresh streaks after their entry',()=>{
 let g=score(score(ready(),0,0),0,0);
 g={...g,players:[...g.players,{id:'Dani',name:'Dani',color:3,score:0}]};
 assert.equal(entryState(g).ready,false);
 g=score(g,0,0);
 assert.equal(g.players[0].score,300);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 g=score(g,3,300);
 assert.deepEqual(totals(g),[300,300,300,300]);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 assert.equal(entryState(g).ready,true);
});

test('rule toggles remain independent and start a new streak after entry',()=>{
 let g=score(score(ready(),0,0),0,0);
 g=changeRule(changeRule(g,'scorelessPenalty',false),'scorelessPenalty',true);
 assert.equal(activeScorelessTurns(g,'Ana'),0);
 g=score(g,0,0);
 assert.equal(activeScorelessTurns(g,'Ana'),1);
 assert.equal(g.players[0].score,300);
});
