'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import pokerDiceHero from '@/public/images/poker-dice-hero.webp';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Plus, Trash2, X, RotateCcw, List, Dice5, Users, Zap, ChartNoAxesColumnIncreasing, Trophy, MoreHorizontal, Check, HardDrive, CircleMinus, Settings2, ChevronDown, Hourglass } from 'lucide-react';
import { emptyGame, decodeGame, format, saveTurn, undoTurn, changeRule, scoreValue, penaltyPhase, activeScorelessTurns, scoringTurnAtRisk, playerTurnHistory, previewTiePenalties, STORAGE_KEY, TARGET, type Game, type Player, type Rules, type Turn, type TiePenalty } from '@/lib/game';

function Avatar({player}: {player:Player}) {return <span className={`avatar color-${player.color%6}`} aria-hidden="true">{Array.from(player.name)[0]?.toUpperCase()}</span>}

function TurnResult({turn}: {turn: Turn}) {
 if (turn.bust) return <span className="turn-result is-bust">Se pasó con {format(turn.points)}{turn.penalty>0&&<> · −{format(turn.penalty)}</>}</span>;
 if (turn.penalty>0) return <span className="turn-result is-penalty">−{format(turn.penalty)} por 3 turnos sin sumar</span>;
 return <span className="turn-result">{turn.points>0?'+':''}{format(turn.points)}</span>;
}

function TieEffects({penalties,players,preview=false}:{penalties:TiePenalty[];players:Player[];preview?:boolean}) {
 if (!penalties.length) return null;
 return <div className={`tie-effects ${preview?'tie-preview':''}`}>
  {penalties.map(penalty=><div key={penalty.playerId} className="tie-effect">
   <span>{preview?'Empatás a':'Empate con'} <b>{players.find(player=>player.id===penalty.playerId)?.name}</b>: pierde su última anotación.</span>
   <span className="tie-effect-score"><b>−{format(penalty.points)}</b><span>{format(penalty.previousScore)} → {format(penalty.previousScore-penalty.points)} puntos</span></span>
  </div>)}
 </div>;
}

function RuleOptions({rules,onChange}:{rules:Rules;onChange:(rule:keyof Rules,enabled:boolean)=>void}) {
 return <div className="rules-list">
   <label className="rule-option"><span className="rule-copy"><strong>Llegar exacto a 10.000</strong><small>Si se pasa, el turno suma 0.</small></span><input type="checkbox" checked={rules.exactTarget} onChange={event=>onChange('exactTarget',event.target.checked)}/><span className="rule-switch" aria-hidden="true"><span/></span></label>
   <label className="rule-option"><span className="rule-copy"><strong>Penalización por 3 turnos</strong><small>Al tercero sin sumar, pierde su última anotación.</small></span><input type="checkbox" checked={rules.scorelessPenalty} onChange={event=>onChange('scorelessPenalty',event.target.checked)}/><span className="rule-switch" aria-hidden="true"><span/></span></label>
   <label className="rule-option"><span className="rule-copy"><strong>Penalización por empate</strong><small>Si al sumar empatás a otro, pierde su última anotación aún no descontada. Sin efecto en cadena.</small></span><input type="checkbox" checked={rules.tiePenalty} onChange={event=>onChange('tiePenalty',event.target.checked)}/><span className="rule-switch" aria-hidden="true"><span/></span></label>
   <label className="rule-option"><span className="rule-copy"><strong>Penalizaciones con 300 o más</strong><small>Los 3 turnos y el empate aplican cuando todos tengan 300 o más.</small></span><input type="checkbox" checked={rules.penaltiesAfterEntry} onChange={event=>onChange('penaltiesAfterEntry',event.target.checked)}/><span className="rule-switch" aria-hidden="true"><span/></span></label>
  </div>;
}

function RulesMenu({rules,onChange}:{rules:Rules;onChange:(rule:keyof Rules,enabled:boolean)=>void}) {
 const active=Object.values(rules).filter(Boolean).length;
 return <details className="rules-menu">
  <summary><span className="rules-summary-main"><Settings2 size={19}/><span><strong>Reglas de partida</strong><small>{active===0?'Sin reglas opcionales':`${active} ${active===1?'regla activa':'reglas activas'}`}</small></span></span><ChevronDown className="rules-chevron" size={18}/></summary>
  <RuleOptions rules={rules} onChange={onChange}/>
 </details>;
}

export default function Home() {
 const [game,setGame]=useState<Game>(emptyGame);
 const [ready,setReady]=useState(false);
 const [heroReady,setHeroReady]=useState(false);
 const [storageError,setStorageError]=useState('');
 const [name,setName]=useState('');
 const [nameError,setNameError]=useState('');
 const [history,setHistory]=useState(false);
 const [historyPlayerId,setHistoryPlayerId]=useState<string|null>(null);
 const [menu,setMenu]=useState(false);
 const [addingPlayer,setAddingPlayer]=useState(false);
 const addPlayerButton=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const rulesDialog=useRef<HTMLDialogElement>(null);
 const playerHistoryDialog=useRef<HTMLDialogElement>(null);
 const nameInput=useRef<HTMLInputElement>(null);
 const scoreInput=useRef<HTMLInputElement>(null);
 const menuRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const image=new window.Image();image.src=pokerDiceHero.src;image.decode().catch(()=>{}).finally(()=>setHeroReady(true));},[]);
 useEffect(()=>{try {const raw=localStorage.getItem(STORAGE_KEY);if(raw){const restored=decodeGame(raw);if(restored)setGame(restored);else setStorageError('No pudimos recuperar la partida guardada. Podés empezar una nueva.');}}catch{setStorageError('El almacenamiento no está disponible. La partida solo se conservará mientras esta página esté abierta.');}setReady(true);},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(game));}catch{setStorageError('No pudimos guardar la partida en este dispositivo. No cierres esta página para seguir jugando.');}},[game,ready]);
 useEffect(()=>{if(!menu)return;function close(e:PointerEvent){if(!menuRef.current?.contains(e.target as Node))setMenu(false)}function escape(e:KeyboardEvent){if(e.key==='Escape')setMenu(false)}document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}},[menu]);
 useEffect(()=>{const modal=playerHistoryDialog.current;if(!modal)return;if(historyPlayerId&&!modal.open)modal.showModal();if(!historyPlayerId&&modal.open)modal.close();},[historyPlayerId]);
 const current=game.players[game.current];
 const historyPlayer=game.players.find(p=>p.id===historyPlayerId);
 const playerHistory=historyPlayer?playerTurnHistory(game.turns,historyPlayer.id):[];
 const penaltiesOn=game.rules.scorelessPenalty||game.rules.tiePenalty;
 const penaltiesPaused=penaltiesOn&&!penaltyPhase(game).active;
 const riskTurn=!penaltiesPaused&&historyPlayer&&(game.rules.scorelessPenalty||game.rules.tiePenalty)?scoringTurnAtRisk(game.turns,historyPlayer.id):undefined;
 const atRisk=riskTurn?.scoreChange??0;
 const playerTurnCount=playerHistory.filter(entry=>!entry.tiePenalty).length;
 const tiePreview=previewTiePenalties(game);
 const last=game.turns.at(-1);
 const lastPlayer=game.players.find(p=>p.id===last?.playerId);
 const points=scoreValue(game.input);
 const willBust=game.rules.exactTarget&&!!current&&points!==null&&current.score+points>TARGET;
 function newGame(){setMenu(false);if(game.status==='playing'){dialog.current?.showModal();return;}beginSetup();}
 function beginSetup(){setGame({...emptyGame(),status:'setup'});setHistory(false);setHistoryPlayerId(null);setAddingPlayer(false);setName('');setNameError('');dialog.current?.close();}
 function addPlayer(){const clean=name.trim();if(!clean){setNameError('Escribí el nombre del jugador.');nameInput.current?.focus();return;}setGame(g=>({...g,players:[...g.players,{id:Array.from(crypto.getRandomValues(new Uint8Array(16)), byte=>byte.toString(16).padStart(2,'0')).join(''),name:clean,score:0,color:g.players.length?Math.max(...g.players.map(p=>p.color))+1:0}]}));setName('');setNameError('');if(game.status==='playing'){setAddingPlayer(false);addPlayerButton.current?.focus();}else{nameInput.current?.focus();}}
 function closeAddPlayer(){setAddingPlayer(false);setName('');setNameError('');addPlayerButton.current?.focus();}
 function move(index:number,direction:number){setGame(g=>{const players=[...g.players];[players[index],players[index+direction]]=[players[index+direction],players[index]];return {...g,players}})}
 function setScore(input:string){setGame(g=>({...g,input}));}
 function undo(){setGame(undoTurn);setHistory(false);}
 function setRule(rule:keyof Rules,enabled:boolean){setGame(g=>changeRule(g,rule,enabled));}
 function openRules(){setMenu(false);rulesDialog.current?.showModal();}
 function openHistory(playerId:string|null=null){if(playerId)setHistoryPlayerId(playerId);else setHistory(true);setMenu(false);}
 function scoreboard(final=false) {
  const players=final?[...game.players].sort((a,b)=>b.score-a.score):game.players;
  return <ol className={`scoreboard ${final?'final-board':''}`} aria-label={final?'Clasificación final':'Puntajes de los jugadores'}>
   {players.map(p=>{
   const rank=1+game.players.filter(other=>other.score>p.score).length;
   const medal=p.score>0?['🥇','🥈','🥉'][rank-1]:undefined;
   const scoreless=!final&&game.rules.scorelessPenalty?activeScorelessTurns(game,p.id):0;
   const tiePenalty=last?.tiePenalties.find(penalty=>penalty.playerId===p.id);
   return <li key={p.id} className={`score-row ${p.id===current?.id?'is-current':''} ${tiePenalty?'was-tied':''}`} aria-current={!final&&p.id===current?.id?'step':undefined}>
     <button className="score-row-button" aria-label={`Ver historial de ${p.name}, ${format(p.score)} puntos`} onClick={()=>openHistory(p.id)}>
      {final&&<span className="rank">{rank}</span>}
      <Avatar player={p}/>
      <span className="player-name"><span className="player-name-line"><span>{p.name}</span>{!final&&game.rules.scorelessPenalty&&scoreless>0&&<span className={`scoreless-streak ${scoreless>=3?'at-limit':''}`} title={`${scoreless} ${scoreless===1?'turno seguido':'turnos seguidos'} sin sumar`} aria-label={`${scoreless} ${scoreless===1?'turno seguido':'turnos seguidos'} sin sumar`}><CircleMinus size={11} aria-hidden="true"/>{scoreless}</span>}</span>{!final&&p.id===current?.id&&<small>En turno</small>}</span>
      <span className="score-total">{medal&&<span className="score-medal" role="img" aria-label={`${rank}º puesto`} title={`${rank}º puesto`}>{medal}</span>}<span className="score-values"><strong>{format(p.score)}</strong>{tiePenalty&&<small className="tie-deduction">−{format(tiePenalty.points)} por empate</small>}</span></span>
     </button>
    </li>;
   })}
  </ol>;
 }

 if(!ready||(game.status==='home'&&!heroReady))return <main className="loading"><Dice5 size={36}/><p>Cargando tu mesa…</p><span className="hero-preload" aria-hidden="true"><Image src={pokerDiceHero} alt="" fill sizes="(max-width: 700px) 82vw, 520px" preload unoptimized/></span></main>;
 return <div className={`app ${game.status==='home'?'home-app':''}`}>
 {storageError&&<div className="storage-warning" role="alert">{storageError}<button className="icon-button" aria-label="Cerrar aviso" onClick={()=>setStorageError('')}><X size={18}/></button></div>}
 {game.status==='home'?<main className="landing">
 <div className="landing-brand"><Dice5 size={26}/><span>El marcador de tu mesa</span></div>
 <div className="landing-copy"><h1>DiezMil</h1><p className="tagline">Misma mesa. Mejores partidas.</p><p className="intro">Los dados en la mesa.<br/>Los puntos, acá.</p><button className="primary landing-cta" onClick={newGame}>Nueva partida <ArrowRight size={22}/></button><span className="local-note"><HardDrive size={14}/> Tu partida se guarda en este dispositivo</span></div>
 <div className="dice-scene"><div className="table-light"/><Image className="poker-dice-hero" src={pokerDiceHero} alt="Dados de póquer con A, K, Q, J, 10 y 9" fill sizes="(max-width: 700px) 82vw, 520px" preload unoptimized/></div>
 <div className="features"><span><Users/>Fácil de usar</span><span><Zap/>Para cualquier grupo</span><span><ChartNoAxesColumnIncreasing/>Solo jugá</span></div>
 </main>:<>
 <header className="app-header">{game.status==='setup'||history?<button className="icon-button" aria-label="Volver" onClick={()=>history?setHistory(false):setGame(g=>({...g,status:'home'}))}><ArrowLeft/></button>:<Dice5 className="brand-dice" size={30}/>}
 <span className="header-title">{history?'Historial':game.status==='setup'?'Nueva partida':'DiezMil'}</span>
 {game.status!=='setup'&&!history?<div className="menu-wrap" ref={menuRef}><button className="icon-button" aria-label="Opciones de partida" aria-expanded={menu} onClick={()=>setMenu(!menu)}><MoreHorizontal/></button>{menu&&<div className="menu"><button onClick={()=>openHistory()}><List size={18}/>Ver historial</button>{game.status==='playing'&&<button onClick={openRules}><Settings2 size={18}/>Reglas de partida</button>}<button onClick={newGame}><RotateCcw size={18}/>Nueva partida</button></div>}</div>:<span className="header-spacer"/>}</header>
 <main>
 {history?<section className="history-screen"><h1>Turno a turno</h1><p className="muted">{game.turns.length} {game.turns.length===1?'turno guardado':'turnos guardados'}</p>{game.turns.length===0?<div className="empty-state"><List size={36}/><h2>La partida está por empezar</h2><p>Los puntos que guardés aparecerán acá.</p><button className="secondary" onClick={()=>setHistory(false)}>Volver a la partida <ArrowRight size={18}/></button></div>:<ol className="history-list">{game.turns.map((turn,i)=>{const p=game.players.find(p=>p.id===turn.playerId)!;return <li key={i} className="history-entry"><div className="history-entry-main"><span className="turn-number">{i+1}</span><Avatar player={p}/><span className="player-name">{p.name}</span><strong><TurnResult turn={turn}/></strong></div><TieEffects penalties={turn.tiePenalties} players={game.players}/></li>}).reverse()}</ol>}{last&&<button className="secondary wide" onClick={undo}><RotateCcw size={18}/>Deshacer último turno</button>}</section>
 :game.status==='setup'?<section className="setup-screen"><div><h1>Jugadores</h1><p className="muted">Agregá los jugadores en el orden de los turnos.</p></div><ol className="setup-list">{game.players.map((p,i)=><li key={p.id}><div className="reorder"><button aria-label={`Subir a ${p.name}`} disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={16}/></button><button aria-label={`Bajar a ${p.name}`} disabled={i===game.players.length-1} onClick={()=>move(i,1)}><ArrowDown size={16}/></button></div><Avatar player={p}/><span className="player-name">{p.name}</span><button className="icon-button remove" aria-label={`Quitar a ${p.name}`} onClick={()=>setGame(g=>({...g,players:g.players.filter(x=>x.id!==p.id)}))}><Trash2 size={20}/></button></li>)}</ol><form className="add-player" onSubmit={e=>{e.preventDefault();addPlayer()}}><label htmlFor="player-name">{game.players.length?'Agregar jugador':'¿Quiénes juegan hoy?'}</label><div className="add-input"><input ref={nameInput} id="player-name" maxLength={40} autoComplete="off" placeholder="Nombre del jugador" value={name} onChange={e=>{setName(e.target.value);setNameError('')}} aria-invalid={!!nameError} aria-describedby={nameError?'name-error':undefined}/><button className="icon-button" aria-label="Agregar jugador" type="submit"><Plus/></button></div>{nameError&&<p className="error" id="name-error">{nameError}</p>}</form><RulesMenu rules={game.rules} onChange={setRule}/><div className="setup-bottom"><p className="setup-hint">{game.players.length?`${game.players.length} ${game.players.length===1?'jugador listo':'jugadores listos'}. Que empiece la buena suerte.`:'Una mesa, tus amigos y los dados.'}</p><button className="primary wide" disabled={!game.players.length} onClick={()=>{setGame(g=>({...g,status:'playing'}));setName('')}}>Empezar partida <ArrowRight size={22}/></button></div></section>
 :game.status==='playing'?<div className="game-layout"><section className="standings"><div className="section-heading"><h1>La mesa</h1><span>{game.rules.exactTarget?'Meta exacta':'Meta'}: 10.000</span></div>{scoreboard()}<div className="standings-tools">{penaltiesPaused?<p className="penalty-pause" role="status"><Hourglass size={14} aria-hidden="true"/><span>Penalizaciones cuando <span className="penalty-pause-line">todos tengan 300 o más</span></span></p>:<p className="desktop-note"><Users size={16}/> {game.players.length} {game.players.length===1?'jugador':'jugadores'} · Turno {game.turns.length+1}</p>}<button ref={addPlayerButton} className="ghost add-during-game" aria-label="Agregar jugador a la partida" aria-expanded={addingPlayer} aria-controls="midgame-player-form" onClick={()=>{if(addingPlayer){closeAddPlayer();}else{setName('');setNameError('');setAddingPlayer(true);}}}><Plus size={16}/>Jugador</button></div>
 {addingPlayer&&<form id="midgame-player-form" className="add-player midgame-player" onSubmit={e=>{e.preventDefault();addPlayer()}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeAddPlayer();}}}>
 <label htmlFor="midgame-player-name">Nuevo jugador · se suma al final con 0 puntos</label>
 <div className="add-input"><input ref={nameInput} autoFocus id="midgame-player-name" maxLength={40} autoComplete="off" placeholder="Nombre del jugador" value={name} onChange={e=>{setName(e.target.value);setNameError('')}} aria-invalid={!!nameError} aria-describedby={nameError?'midgame-name-error':undefined}/><button className="icon-button" type="submit" aria-label="Confirmar nuevo jugador"><Check size={20}/></button><button className="icon-button" type="button" aria-label="Cancelar nuevo jugador" onClick={closeAddPlayer}><X size={18}/></button></div>
 {nameError&&<p className="error" id="midgame-name-error">{nameError}</p>}
 </form>}</section><section className={`turn-panel player-tone-${current.color%6}`}><div className="current-player" aria-live="polite"><p>Turno de</p><h2 key={current.id}>{current.name}</h2></div><form onSubmit={e=>{e.preventDefault();setGame(saveTurn)}}><div className={`score-input ${points===null?'invalid':''} ${willBust?'will-bust':''}`}><label htmlFor="score">Puntaje del turno</label><div><input ref={scoreInput} id="score" inputMode="numeric" autoComplete="off" value={game.input} placeholder="0" onChange={e=>setScore(e.target.value)} aria-invalid={points===null} aria-describedby={points===null?'score-error':willBust?'bust-warning':tiePreview.length?'tie-preview':undefined}/>{game.input&&<button type="button" className="icon-button clear" aria-label="Borrar puntaje" onClick={()=>{setScore('');scoreInput.current?.focus()}}><X/></button>}</div></div>{points===null&&<p id="score-error" className="error">Ingresá un número entero entre 0 y 1.000.000.</p>}{willBust&&<p id="bust-warning" className="bust-warning" role="status">Se pasa de 10.000. Este turno contará sin puntos.</p>}<div className="quick-add">{[50,100,500].map(n=><button key={n} type="button" disabled={points===null||(points??0)+n>1000000} onClick={()=>setGame(g=>({...g,input:String((scoreValue(g.input)??0)+n)}))}>+{n}</button>)}</div><div id="tie-preview" role="status" aria-atomic="true"><TieEffects penalties={tiePreview} players={game.players} preview/></div><button className={`primary wide save ${willBust?'bust-save':''}`} disabled={points===null} type="submit">{points===null?'Guardar puntaje':willBust?'Registrar pasada':`Guardar ${format(points)}`} <ArrowRight size={22}/></button></form>{last&&lastPlayer?<div className="last-turn" role="status" aria-atomic="true"><div><span className="muted">Último turno</span><p><span className={`dot color-${lastPlayer.color%6}`}/><span>{lastPlayer.name} · <TurnResult turn={last}/></span><Check size={14}/></p></div><button className="secondary undo" onClick={undo}><RotateCcw size={18}/>Deshacer</button><TieEffects penalties={last.tiePenalties} players={game.players}/></div>:<p className="first-turn">Tirá los dados y anotá tus puntos.</p>}</section></div>
 :<section className="winner-screen"><div className="celebration" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--i':i} as CSSProperties}/>)}<Trophy size={94} strokeWidth={1.3}/></div><h1>¡{current.name} ganó!</h1><p className="muted">{game.rules.exactTarget?`Llegó a ${format(current.score)} puntos exactos`:`Terminó con ${format(current.score)} puntos`}</p>{scoreboard(true)}<button className="primary wide" onClick={newGame}><RotateCcw size={20}/>Nueva partida</button><button className="secondary wide" onClick={()=>openHistory()}><List size={20}/>Ver historial</button><button className="ghost" onClick={undo}><RotateCcw size={16}/>Deshacer último turno</button></section>}
 </main>
 </>}
 <footer className="app-footer">
  {game.status!=='home'&&<span className="save-status">{storageError ? <>Guardado local no disponible</> : <><span className="saved-dot"/> Guardado en este dispositivo</>}</span>}
  <span className="footer-credit">by <a href="https://github.com/wbenafi" target="_blank" rel="noreferrer">Walter Benavides</a></span>
 </footer>
 <dialog aria-labelledby="restart-title" ref={dialog} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><div className="confirm-content"><h2 id="restart-title">¿Empezar otra partida?</h2><p>Se perderán los puntos y el historial de la partida actual.</p><button className="primary wide" onClick={beginSetup}>Sí, nueva partida <ArrowRight size={20}/></button><button className="secondary wide" autoFocus onClick={()=>dialog.current?.close()}>Seguir jugando</button></div></dialog>
 <dialog className="rules-dialog" aria-labelledby="live-rules-title" aria-describedby="live-rules-note" ref={rulesDialog} onClick={e=>{if(e.target===e.currentTarget)rulesDialog.current?.close()}}><div className="rules-dialog-content"><div className="rules-dialog-heading"><h2 id="live-rules-title">Reglas de partida</h2><button className="icon-button" aria-label="Cerrar reglas" onClick={()=>rulesDialog.current?.close()}><X size={20}/></button></div><p id="live-rules-note">Los cambios se aplican a los próximos turnos. Al activar la regla de 3 turnos, las tres rayitas empiezan de cero.</p><RuleOptions rules={game.rules} onChange={setRule}/></div></dialog>
 <dialog className="player-history-dialog" aria-labelledby="player-history-title" ref={playerHistoryDialog} onClose={()=>setHistoryPlayerId(null)} onClick={e=>{if(e.target===e.currentTarget)playerHistoryDialog.current?.close()}}>
 {historyPlayer&&<div className="player-history-content">
  <div className="player-history-heading"><Avatar player={historyPlayer}/><div><h2 id="player-history-title">Historial de {historyPlayer.name}</h2><p className="muted">{playerTurnCount} {playerTurnCount===1?'turno':'turnos'} · {format(historyPlayer.score)} puntos</p></div><button className="icon-button" aria-label="Cerrar historial" onClick={()=>playerHistoryDialog.current?.close()}><X size={20}/></button></div>
  {atRisk>0&&<div className="penalty-preview"><span>{game.rules.scorelessPenalty&&game.rules.tiePenalty?'Si alguien lo empata o llega a 3 turnos sin sumar':game.rules.tiePenalty?'Si alguien empata su puntaje':'Si llega a 3 turnos sin sumar'}</span><strong>{format(historyPlayer.score)} <ArrowRight size={16} aria-hidden="true"/> {format(historyPlayer.score-atRisk)}</strong><small>Se restarían los {format(atRisk)} puntos resaltados abajo.</small></div>}
  {playerHistory.length===0?<p className="player-history-empty">Todavía no tiene turnos guardados.</p>:<ol className="history-list player-turn-list">{[...playerHistory].reverse().map(({turn,number,total,tiePenalty,index})=><li key={index} className={turn===riskTurn?'is-at-risk':undefined}><div className="history-turn-copy"><span>{tiePenalty?`Empate provocado por ${game.players.find(player=>player.id===turn.playerId)?.name}`:`Turno ${number}`}</span><strong>{tiePenalty?<span className="turn-result is-penalty">−{format(tiePenalty.points)} por empate</span>:<TurnResult turn={turn}/>}</strong>{turn===riskTurn&&<small>Estos puntos se perderían</small>}</div><span className="history-running-total"><small>Total</small><strong>{format(total)}</strong></span></li>)}</ol>}
 </div>}
 </dialog>
 </div>;
}
