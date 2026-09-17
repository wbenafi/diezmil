'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Plus, Trash2, X, RotateCcw, List, Dice5, Users, Zap, ChartNoAxesColumnIncreasing, Trophy, MoreHorizontal, Check, HardDrive } from 'lucide-react';
import { emptyGame, decodeGame, format, saveTurn, undoTurn, scoreValue, STORAGE_KEY, type Game, type Player } from '@/lib/game';

function Avatar({player}: {player:Player}) {return <span className={`avatar color-${player.color%6}`} aria-hidden="true">{Array.from(player.name)[0]?.toUpperCase()}</span>}

export default function Home() {
 const [game,setGame]=useState<Game>(emptyGame);
 const [ready,setReady]=useState(false);
 const [storageError,setStorageError]=useState('');
 const [name,setName]=useState('');
 const [nameError,setNameError]=useState('');
 const [history,setHistory]=useState(false);
 const [menu,setMenu]=useState(false);
 const [addingPlayer,setAddingPlayer]=useState(false);
 const addPlayerButton=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const nameInput=useRef<HTMLInputElement>(null);
 const scoreInput=useRef<HTMLInputElement>(null);
 const menuRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{try {const raw=localStorage.getItem(STORAGE_KEY);if(raw){const restored=decodeGame(raw);if(restored)setGame(restored);else setStorageError('No pudimos recuperar la partida guardada. Podés empezar una nueva.');}}catch{setStorageError('El almacenamiento no está disponible. La partida solo se conservará mientras esta página esté abierta.');}setReady(true);},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(game));}catch{setStorageError('No pudimos guardar la partida en este dispositivo. No cierres esta página para seguir jugando.');}},[game,ready]);
 useEffect(()=>{if(!menu)return;function close(e:PointerEvent){if(!menuRef.current?.contains(e.target as Node))setMenu(false)}function escape(e:KeyboardEvent){if(e.key==='Escape')setMenu(false)}document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}},[menu]);
 const current=game.players[game.current];
 const last=game.turns.at(-1);
 const lastPlayer=game.players.find(p=>p.id===last?.playerId);
 const points=scoreValue(game.input);
 function newGame(){setMenu(false);if(game.status==='playing'){dialog.current?.showModal();return;}beginSetup();}
 function beginSetup(){setGame({...emptyGame(),status:'setup'});setHistory(false);setAddingPlayer(false);setName('');setNameError('');dialog.current?.close();}
 function addPlayer(){const clean=name.trim();if(!clean){setNameError('Escribí el nombre del jugador.');nameInput.current?.focus();return;}setGame(g=>({...g,players:[...g.players,{id:Array.from(crypto.getRandomValues(new Uint8Array(16)), byte=>byte.toString(16).padStart(2,'0')).join(''),name:clean,score:0,color:g.players.length?Math.max(...g.players.map(p=>p.color))+1:0}]}));setName('');setNameError('');if(game.status==='playing'){setAddingPlayer(false);addPlayerButton.current?.focus();}else{nameInput.current?.focus();}}
 function closeAddPlayer(){setAddingPlayer(false);setName('');setNameError('');addPlayerButton.current?.focus();}
 function move(index:number,direction:number){setGame(g=>{const players=[...g.players];[players[index],players[index+direction]]=[players[index+direction],players[index]];return {...g,players}})}
 function setScore(input:string){setGame(g=>({...g,input}));}
 function undo(){setGame(undoTurn);setHistory(false);}
 function scoreboard(final=false) {
  const players=final?[...game.players].sort((a,b)=>b.score-a.score):game.players;
  return <ol className={`scoreboard ${final?'final-board':''}`} aria-label={final?'Clasificación final':'Puntajes de los jugadores'}>
   {players.map(p=>{
    const rank=1+game.players.filter(other=>other.score>p.score).length;
    const medal=p.score>0?['🥇','🥈','🥉'][rank-1]:undefined;
    return <li key={p.id} className={`score-row ${p.id===current?.id?'is-current':''}`} aria-current={!final&&p.id===current?.id?'step':undefined}>
     {final&&<span className="rank">{rank}</span>}
     <Avatar player={p}/>
     <span className="player-name">{p.name}{!final&&p.id===current?.id&&<small>En turno</small>}</span>
     <span className="score-total">{medal&&<span className="score-medal" role="img" aria-label={`${rank}º puesto`} title={`${rank}º puesto`}>{medal}</span>}<strong>{format(p.score)}</strong></span>
    </li>;
   })}
  </ol>;
 }

 if(!ready)return <main className="loading"><Dice5 size={36}/><p>Cargando tu mesa…</p></main>;
 return <div className={`app ${game.status==='home'?'home-app':''}`}>
 {storageError&&<div className="storage-warning" role="alert">{storageError}<button className="icon-button" aria-label="Cerrar aviso" onClick={()=>setStorageError('')}><X size={18}/></button></div>}
 {game.status==='home'?<main className="landing">
 <div className="landing-brand"><Dice5 size={26}/><span>El marcador de tu mesa</span></div>
 <div className="landing-copy"><h1>10.000</h1><p className="tagline">Misma mesa. Mejores partidas.</p><p className="intro">Los dados en la mesa.<br/>Los puntos, acá.</p><button className="primary landing-cta" onClick={newGame}>Nueva partida <ArrowRight size={22}/></button><span className="local-note"><HardDrive size={14}/> Tu partida se guarda en este dispositivo</span></div>
 <div className="dice-scene"><div className="table-light"/><Image className="poker-dice-hero" src="/images/poker-dice-hero.png" alt="Dados de póquer con A, K, Q, J, 10 y 9" fill sizes="(max-width: 700px) 82vw, 520px" preload/></div>
 <div className="features"><span><Users/>Fácil de usar</span><span><Zap/>Para cualquier grupo</span><span><ChartNoAxesColumnIncreasing/>Solo jugá</span></div>
 </main>:<>
 <header className="app-header">{game.status==='setup'||history?<button className="icon-button" aria-label="Volver" onClick={()=>history?setHistory(false):setGame(g=>({...g,status:'home'}))}><ArrowLeft/></button>:<Dice5 className="brand-dice" size={30}/>}
 <span className="header-title">{history?'Historial':game.status==='setup'?'Nueva partida':'10.000'}</span>
 {game.status!=='setup'&&!history?<div className="menu-wrap" ref={menuRef}><button className="icon-button" aria-label="Opciones de partida" aria-expanded={menu} onClick={()=>setMenu(!menu)}><MoreHorizontal/></button>{menu&&<div className="menu"><button onClick={()=>{setHistory(true);setMenu(false)}}><List size={18}/>Ver historial</button><button onClick={newGame}><RotateCcw size={18}/>Nueva partida</button></div>}</div>:<span className="header-spacer"/>}</header>
 <main>
 {history?<section className="history-screen"><h1>Turno a turno</h1><p className="muted">{game.turns.length} {game.turns.length===1?'turno guardado':'turnos guardados'}</p>{game.turns.length===0?<div className="empty-state"><List size={36}/><h2>La partida está por empezar</h2><p>Los puntos que guardés aparecerán acá.</p><button className="secondary" onClick={()=>setHistory(false)}>Volver a la partida <ArrowRight size={18}/></button></div>:<ol className="history-list">{game.turns.map((turn,i)=>{const p=game.players.find(p=>p.id===turn.playerId)!;return <li key={i}><span className="turn-number">{i+1}</span><Avatar player={p}/><span className="player-name">{p.name}</span><strong>+{format(turn.points)}</strong></li>}).reverse()}</ol>}{last&&<button className="secondary wide" onClick={undo}><RotateCcw size={18}/>Deshacer último turno</button>}</section>
 :game.status==='setup'?<section className="setup-screen"><div><h1>Jugadores</h1><p className="muted">Agregá los jugadores en el orden de los turnos.</p></div><ol className="setup-list">{game.players.map((p,i)=><li key={p.id}><div className="reorder"><button aria-label={`Subir a ${p.name}`} disabled={i===0} onClick={()=>move(i,-1)}><ArrowUp size={16}/></button><button aria-label={`Bajar a ${p.name}`} disabled={i===game.players.length-1} onClick={()=>move(i,1)}><ArrowDown size={16}/></button></div><Avatar player={p}/><span className="player-name">{p.name}</span><button className="icon-button remove" aria-label={`Quitar a ${p.name}`} onClick={()=>setGame(g=>({...g,players:g.players.filter(x=>x.id!==p.id)}))}><Trash2 size={20}/></button></li>)}</ol><form className="add-player" onSubmit={e=>{e.preventDefault();addPlayer()}}><label htmlFor="player-name">{game.players.length?'Agregar jugador':'¿Quiénes juegan hoy?'}</label><div className="add-input"><input ref={nameInput} id="player-name" maxLength={40} autoComplete="off" placeholder="Nombre del jugador" value={name} onChange={e=>{setName(e.target.value);setNameError('')}} aria-invalid={!!nameError} aria-describedby={nameError?'name-error':undefined}/><button className="icon-button" aria-label="Agregar jugador" type="submit"><Plus/></button></div>{nameError&&<p className="error" id="name-error">{nameError}</p>}</form><div className="setup-bottom"><p className="setup-hint">{game.players.length?`${game.players.length} ${game.players.length===1?'jugador listo':'jugadores listos'}. Que empiece la buena suerte.`:'Una mesa, tus amigos y los dados.'}</p><button className="primary wide" disabled={!game.players.length} onClick={()=>{setGame(g=>({...g,status:'playing'}));setName('')}}>Empezar partida <ArrowRight size={22}/></button></div></section>
 :game.status==='playing'?<div className="game-layout"><section className="standings"><div className="section-heading"><h1>La mesa</h1><span>Meta: 10.000</span></div>{scoreboard()}<div className="standings-tools"><p className="desktop-note"><Users size={16}/> {game.players.length} {game.players.length===1?'jugador':'jugadores'} · Turno {game.turns.length+1}</p><button ref={addPlayerButton} className="ghost add-during-game" aria-label="Agregar jugador a la partida" aria-expanded={addingPlayer} aria-controls="midgame-player-form" onClick={()=>{if(addingPlayer){closeAddPlayer();}else{setName('');setNameError('');setAddingPlayer(true);}}}><Plus size={16}/>Jugador</button></div>
 {addingPlayer&&<form id="midgame-player-form" className="add-player midgame-player" onSubmit={e=>{e.preventDefault();addPlayer()}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeAddPlayer();}}}>
 <label htmlFor="midgame-player-name">Nuevo jugador · se suma al final con 0 puntos</label>
 <div className="add-input"><input ref={nameInput} autoFocus id="midgame-player-name" maxLength={40} autoComplete="off" placeholder="Nombre del jugador" value={name} onChange={e=>{setName(e.target.value);setNameError('')}} aria-invalid={!!nameError} aria-describedby={nameError?'midgame-name-error':undefined}/><button className="icon-button" type="submit" aria-label="Confirmar nuevo jugador"><Check size={20}/></button><button className="icon-button" type="button" aria-label="Cancelar nuevo jugador" onClick={closeAddPlayer}><X size={18}/></button></div>
 {nameError&&<p className="error" id="midgame-name-error">{nameError}</p>}
 </form>}</section><section className={`turn-panel player-tone-${current.color%6}`}><div className="current-player" aria-live="polite"><p>Turno de</p><h2 key={current.id}>{current.name}</h2></div><form onSubmit={e=>{e.preventDefault();setGame(saveTurn)}}><div className={`score-input ${points===null?'invalid':''}`}><label htmlFor="score">Puntaje del turno</label><div><input ref={scoreInput} id="score" inputMode="numeric" autoComplete="off" value={game.input} placeholder="0" onChange={e=>setScore(e.target.value)} aria-invalid={points===null} aria-describedby={points===null?'score-error':undefined}/>{game.input&&<button type="button" className="icon-button clear" aria-label="Borrar puntaje" onClick={()=>{setScore('');scoreInput.current?.focus()}}><X/></button>}</div></div>{points===null&&<p id="score-error" className="error">Ingresá un número entero entre 0 y 1.000.000.</p>}<div className="quick-add">{[50,100,500].map(n=><button key={n} type="button" disabled={points===null||(points??0)+n>1000000} onClick={()=>setGame(g=>({...g,input:String((scoreValue(g.input)??0)+n)}))}>+{n}</button>)}</div><button className="primary wide save" disabled={points===null} type="submit">Guardar {points===null?'puntaje':format(points)} <ArrowRight size={22}/></button></form>{last&&lastPlayer?<div className="last-turn"><div><span className="muted">Último turno</span><p><span className={`dot color-${lastPlayer.color%6}`}/><span>{lastPlayer.name} +{format(last.points)}</span><Check size={14}/></p></div><button className="secondary undo" onClick={undo}><RotateCcw size={18}/>Deshacer</button></div>:<p className="first-turn">Tirá los dados y anotá tus puntos.</p>}</section></div>
 :<section className="winner-screen"><div className="celebration" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i} style={{'--i':i} as CSSProperties}/>)}<Trophy size={94} strokeWidth={1.3}/></div><h1>¡{current.name} ganó!</h1><p className="muted">Alcanzó {format(current.score)} puntos</p>{scoreboard(true)}<button className="primary wide" onClick={newGame}><RotateCcw size={20}/>Nueva partida</button><button className="secondary wide" onClick={()=>setHistory(true)}><List size={20}/>Ver historial</button><button className="ghost" onClick={undo}><RotateCcw size={16}/>Deshacer último turno</button></section>}
 </main>
 </>}
 <footer className="app-footer">
  {game.status!=='home'&&<span className="save-status">{storageError ? <>Guardado local no disponible</> : <><span className="saved-dot"/> Guardado en este dispositivo</>}</span>}
  <span className="footer-credit">by <a href="https://github.com/wbenafi" target="_blank" rel="noreferrer">Walter Benavides</a></span>
 </footer>
 <dialog aria-labelledby="restart-title" ref={dialog} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><div className="confirm-content"><h2 id="restart-title">¿Empezar otra partida?</h2><p>Se perderán los puntos y el historial de la partida actual.</p><button className="primary wide" onClick={beginSetup}>Sí, nueva partida <ArrowRight size={20}/></button><button className="secondary wide" autoFocus onClick={()=>dialog.current?.close()}>Seguir jugando</button></div></dialog>
 </div>;
}
