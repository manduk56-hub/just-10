'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Crosshair, Keyboard, Pickaxe, RotateCcw, Target, Trophy, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
type Phase = 'ready' | 'running' | 'stopped';
type Attempt = { time: number; timeout: boolean };
const TARGET = 10000, LIMIT = 12000;
const format = (ms: number) => (ms / 1000).toFixed(3);

function MiningScene({ elapsed, phase, success }: { elapsed: number; phase: Phase; success: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const assets = useRef<Record<string, HTMLImageElement>>({});
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    const names = ['stone', 'obsidian', 'diamond_pickaxe', ...Array.from({ length: 10 }, (_, i) => `destroy_stage_${i}`)];
    Promise.all(names.map(name => new Promise<void>((resolve, reject) => {
      const img = new Image(); img.onload = () => { assets.current[name] = img; resolve(); }; img.onerror = reject; img.src = `/textures/${name}.png`;
    }))).then(() => { if (alive) setLoaded(true); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !loaded) return;
    const img = assets.current;
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = '#161c1d'; ctx.fillRect(0, 0, 800, 600);
    for (let row = 0; row < 7; row++) for (let col = 0; col < 9; col++) {
      ctx.globalAlpha = 0.055 + ((row * 3 + col * 7) % 4) * 0.013;
      ctx.drawImage(img.stone, col * 100 - (row % 2) * 25, row * 100 - 40, 100, 100);
    }
    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(400, 255, 20, 400, 280, 520);
    vignette.addColorStop(0, '#29393328'); vignette.addColorStop(1, '#080c0ee8'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, 800, 600);
    ctx.strokeStyle = '#53665d13'; ctx.lineWidth = 1;
    for (let n = 0; n < 10; n++) {
      ctx.beginPath(); ctx.moveTo(400, 290); ctx.lineTo(n * 150 - 280, 600); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 440 + n * n * 4); ctx.lineTo(800, 440 + n * n * 4); ctx.stroke();
    }
    ctx.fillStyle = '#05080970'; ctx.beginPath(); ctx.ellipse(400, 458, 155, 29, 0, 0, Math.PI * 2); ctx.fill();
    const broken = phase === 'stopped' && success;
    const shake = phase === 'running' ? Math.sin(elapsed / 36) * Math.max(0, Math.sin(elapsed / 90)) * 2 : 0;
    const size = broken ? 0.4 : 0.95;
    const crackLevel = Math.min(9, Math.max(0, Math.floor(elapsed / 850)));
    ctx.save(); ctx.translate(400 + shake, broken ? 275 : 260); ctx.scale(size, size);
    const face = (a: number, b: number, c: number, d: number, x: number, y: number, shade: string) => {
      ctx.save(); ctx.transform(a, b, c, d, x, y); ctx.drawImage(img.obsidian, 0, 0, 16, 16); ctx.fillStyle = shade; ctx.fillRect(0, 0, 16, 16);
      if (elapsed > 700 && !broken) { ctx.globalAlpha = 0.8; ctx.drawImage(img[`destroy_stage_${Math.min(9, Math.floor(elapsed / 1000))}`], 0, 0, 16, 16); }
      if (crackLevel > 0 && !broken) {
        ctx.globalAlpha = 0.76; ctx.strokeStyle = '#d9c8e8'; ctx.lineWidth = 0.62; ctx.lineCap = 'square'; ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(7, 3); ctx.lineTo(9, 6); ctx.lineTo(8, 9);
        if (crackLevel > 1) { ctx.moveTo(7, 3); ctx.lineTo(4, 5); ctx.lineTo(2, 8); }
        if (crackLevel > 2) { ctx.moveTo(9, 6); ctx.lineTo(12, 5); ctx.lineTo(14, 7); }
        if (crackLevel > 3) { ctx.moveTo(8, 9); ctx.lineTo(6, 12); ctx.lineTo(7, 16); }
        if (crackLevel > 4) { ctx.moveTo(8, 9); ctx.lineTo(11, 11); ctx.lineTo(13, 15); }
        if (crackLevel > 5) { ctx.moveTo(4, 5); ctx.lineTo(5, 1); ctx.moveTo(12, 5); ctx.lineTo(15, 3); }
        if (crackLevel > 6) { ctx.moveTo(6, 12); ctx.lineTo(3, 13); ctx.lineTo(1, 15); }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.restore();
    };
    face(8, 4, -8, 4, 0, -144, '#9b8ad513'); face(8, 4, 0, 10, -128, -80, '#0000000a'); face(8, -4, 0, 10, 0, -16, '#00000044'); ctx.restore();
    if (phase === 'running' || broken) {
      for (let i = 0; i < 13; i++) { const t = ((elapsed / 520 + i * 0.127) % 1); ctx.globalAlpha = 1 - t; ctx.fillStyle = broken ? '#a5e4ac' : ['#685277', '#403448', '#83709b'][i % 3]; ctx.fillRect(410 + Math.sin(i * 4.2) * (30 + t * 135), 260 + Math.cos(i * 3.2) * 65 + t * 130, 5 + i % 4, 5 + i % 4); } ctx.globalAlpha = 1;
    }
    if (!broken) { ctx.save(); ctx.translate(555, 322); ctx.rotate(phase === 'running' ? -0.24 - Math.max(0, Math.sin(elapsed / 90)) * 0.68 : -0.23); ctx.drawImage(img.diamond_pickaxe, -106, -134, 232, 232); ctx.restore(); }
    ctx.strokeStyle = '#e8eee99a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(392, 240); ctx.lineTo(408, 240); ctx.moveTo(400, 232); ctx.lineTo(400, 248); ctx.stroke();
  }, [elapsed, phase, success, loaded]);
  return <><canvas ref={canvas} width="800" height="600" role="img" aria-label={phase === 'running' ? '다이아몬드 곡괭이로 흑요석을 캐는 중' : success ? '채굴한 흑요석' : '흑요석과 다이아몬드 곡괭이'} />{failed && <div className="scene-error">텍스처를 불러오지 못했어요. 새로고침해 주세요.<br />타이머는 계속 사용할 수 있어요.</div>}</>;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('ready'); const [elapsed, setElapsed] = useState(0); const [attempts, setAttempts] = useState<Attempt[]>([]); const [sound, setSound] = useState(true);
  const start = useRef(0), running = useRef(false), soundEnabled = useRef(true), audio = useRef<AudioContext | null>(null), lastHit = useRef(0);
  const error = elapsed - TARGET, success = phase === 'stopped' && Math.abs(error) <= 100, timeout = phase === 'stopped' && attempts[0]?.timeout;
  const timerHidden = phase === 'running' && elapsed >= 6000;
  const best = attempts.length ? Math.min(...attempts.map(a => Math.abs(a.time - TARGET))) : null;
  const play = useCallback((kind: 'hit' | 'start' | 'success' | 'stop') => {
    if (!soundEnabled.current) return;
    try { const ac = audio.current ?? (audio.current = new AudioContext()); if (ac.state === 'suspended') void ac.resume().catch(() => {});
      const osc = ac.createOscillator(), gain = ac.createGain(); osc.type = kind === 'hit' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(kind === 'hit' ? 125 : kind === 'success' ? 880 : kind === 'start' ? 440 : 280, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(kind === 'hit' ? 35 : kind === 'success' ? 1320 : 180, ac.currentTime + 0.1);
      gain.gain.setValueAtTime(kind === 'hit' ? 0.065 : 0.09, ac.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.connect(gain); gain.connect(ac.destination); osc.start(); osc.stop(ac.currentTime + 0.16);
    } catch { /* Audio is optional. */ }
  }, []);
  const finish = useCallback((time: number, timedOut = false) => { if (!running.current) return; running.current = false; setElapsed(time); setPhase('stopped'); setAttempts(prev => [{ time, timeout: timedOut }, ...prev].slice(0, 50)); play(Math.abs(time - TARGET) <= 100 ? 'success' : 'stop'); }, [play]);
  const act = useCallback(() => { if (running.current) { const time = performance.now() - start.current; finish(Math.min(LIMIT, time), time >= LIMIT); } else { start.current = performance.now(); running.current = true; lastHit.current = 0; setElapsed(0); setPhase('running'); play('start'); } }, [finish, play]);
  const reset = useCallback(() => { running.current = false; setPhase('ready'); setElapsed(0); }, []);
  useEffect(() => { const keydown = (event: KeyboardEvent) => { if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return; const target = event.target as HTMLElement; if (target.closest('input,textarea,select,[contenteditable="true"],button,a')) return; event.preventDefault(); act(); }; window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown); }, [act]);
  useEffect(() => { if (phase !== 'running') return; let frame: number; const tick = () => { if (!running.current) return; const time = performance.now() - start.current; if (time >= LIMIT) { finish(LIMIT, true); return; } setElapsed(time); if (time - lastHit.current > 540) { lastHit.current = time; play('hit'); } frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [phase, finish, play]);
  useEffect(() => () => { void audio.current?.close(); }, []);
  const resultTitle = timeout ? '조금 늦었어요!' : success ? '완벽한 채굴!' : error < 0 ? '조금 더 기다려볼까요?' : '아깝다, 조금 늦었어요!';
  return <div className="app-shell">
    <header className="site-header"><a className="brand" href="/" aria-label="JUST 10 홈"><span className="brand-icon"><Pickaxe size={21} /></span>JUST 10<span className="brand-dot">.</span></a><div className="header-right"><span className="edition">A LITTLE TIMING CHALLENGE</span><span className="version">v1.0</span></div></header>
    <main>
      <div className="intro"><div><p className="eyebrow"><span /> THE OBSIDIAN CHALLENGE</p><h1>딱 10초, 캐낼 수 있나요<span>?</span></h1><p className="intro-description">다이아몬드 곡괭이 한 자루. 흑요석 한 블록. 그리고 당신의 타이밍.</p></div><div className="target-badge"><Target size={18} /><span>목표 시간 <strong>10.000s</strong></span></div></div>
      <section className="game" aria-label="10초 타이밍 게임">
        <div className={`mine-scene ${phase === 'running' ? 'mining' : ''}`}>
          <div className="scene-top"><span className="world-label"><span className="live-dot" /> OVERWORLD <span className="world-divider">/</span> Y: −59</span><Button variant="ghost" size="icon" className="sound-button" aria-label={sound ? '소리 끄기' : '소리 켜기'} aria-pressed={sound} onClick={() => { setSound(!sound); soundEnabled.current = !sound; }}>{sound ? <Volume2 /> : <VolumeX />}</Button></div>
          <MiningScene elapsed={elapsed} phase={phase} success={success} />
          {success && <div className="success-banner" role="status" aria-live="assertive"><span className="success-check"><Check size={20} strokeWidth={3} /></span><span className="success-copy"><span>OBSIDIAN MINED</span><strong>10초 성공!</strong><small>오차 ±{format(Math.abs(error))}초</small></span></div>}
          <div className="block-label"><span className="tiny-caption">{success ? 'BLOCK COLLECTED' : 'TARGET BLOCK'}</span><strong>{success ? '흑요석 획득!' : '흑요석'}</strong><span className="block-id">minecraft:obsidian</span>{phase === 'running' && <span className="block-damage">균열 단계 {Math.min(10, Math.max(1, Math.floor(elapsed / 850)))} / 10</span>}</div>
          <div className="scene-bottom"><div className="tool-slot"><img src="/textures/diamond_pickaxe.png" alt="" /><span><strong>다이아몬드 곡괭이</strong><small>DIAMOND PICKAXE</small></span></div><span className="mining-status">{phase === 'running' ? <><span className="live-dot" /> 채굴 중</> : success ? <><Check size={13} /> 채굴 완료</> : <><Crosshair size={13} /> 채굴 준비</>}</span></div>
        </div>
        <div className="timer-panel">
          <div className="timer-top"><span className="tiny-caption">YOUR TIMING</span><span className={`status-pill ${phase}`}>{phase === 'ready' ? '준비 완료' : phase === 'running' ? '집중해 주세요' : '도전 완료'}</span></div>
          <div className="timer-center"><p className="timer-label">{timerHidden ? '이제 감각으로 멈춰보세요.' : phase === 'running' ? '10초가 되는 순간, 멈추세요.' : phase === 'stopped' ? '당신이 멈춘 순간' : '당신의 10초를 기다리는 중'}</p><div className={`timer-digits ${success ? 'success' : ''}`} aria-hidden="true">{timerHidden ? <span className="unknown-time">??.???</span> : <>{format(elapsed).split('.')[0]}<span>.{format(elapsed).split('.')[1]}</span></>}</div><span className="seconds">SECONDS</span></div>
          <div className={`feedback ${phase === 'stopped' ? 'result' : ''} ${success ? 'perfect' : ''}`} role="status" aria-live="polite">{phase === 'stopped' ? <><strong>{resultTitle}</strong><span>{timeout ? '12초가 지나 도전이 종료됐어요.' : `목표보다 ${format(Math.abs(error))}초 ${error < 0 ? '빨랐어요' : '늦었어요'}`}{success && ' · 성공 범위 ±0.100초'}</span></> : <><strong>{phase === 'running' ? '곡괭이의 리듬에 집중하세요.' : '준비됐나요?'}</strong><span>{phase === 'running' ? '스페이스바를 한 번 더 누르면 멈춰요.' : '스페이스바를 누르면 채굴이 시작돼요.'}</span></>}</div>
          <Button className={`main-action ${phase === 'running' ? 'stop-action' : ''}`} onClick={act} onKeyDown={event => { if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) act(); } }} onKeyUp={event => { if (event.code === 'Space') event.preventDefault(); }}><span>{phase === 'ready' ? <Pickaxe size={19} /> : phase === 'running' ? <span className="stop-icon" /> : <RotateCcw size={18} />}{phase === 'ready' ? '채굴 시작하기' : phase === 'running' ? '지금 멈추기' : '다시 도전하기'}</span><kbd>SPACE</kbd></Button>
          <div className="action-note"><span>클릭 / 스페이스바 · 12초 자동 종료</span><Button variant="ghost" size="sm" onClick={reset} aria-label="현재 도전 초기화"><RotateCcw size={12} /> 초기화</Button></div>
        </div>
      </section>
      <section className="records" aria-label="이번 방문의 기록"><div className="best-record"><span className="record-icon"><Trophy size={18} /></span><div><span className="tiny-caption">BEST PRECISION</span><strong>{best === null ? <span className="no-record">첫 기록에 도전해 보세요</span> : <>±{format(best)}<small>초</small></>}</strong></div></div><div className="recent-records"><div className="recent-title">최근 도전 <span>{attempts.length}</span></div><div className="attempt-list">{attempts.length === 0 ? <span className="empty-record">아직 기록이 없어요. 첫 블록을 캐볼까요?</span> : attempts.slice(0, 5).map((a, i) => <span key={`${attempts.length}-${i}`} className={`attempt ${Math.abs(a.time - TARGET) <= 100 ? 'good' : ''}`}>{format(a.time)}<small>s</small>{i === 0 && <span className="new-dot" />}</span>)}</div></div><span className="session-note">이번 방문의 기록</span></section>
      <section className="how-to" aria-label="플레이 방법"><div className="how-heading"><Keyboard size={17} /><span>HOW TO PLAY</span></div><div><span className="step-number">01</span><p><strong>스페이스바로 시작</strong><span>타이머와 채굴이 함께 시작돼요.</span></p></div><div><span className="step-number">02</span><p><strong>10초에 한 번 더</strong><span>정확한 순간에 채굴을 멈추세요.</span></p></div><div><span className="step-number">03</span><p><strong>오차를 더 작게</strong><span>±0.100초 안에 멈추면 채굴 성공!</span></p></div></section>
    </main>
    <footer><span>작은 도전, 완벽한 타이밍.</span><a href="https://github.com/PrismarineJS/minecraft-assets" target="_blank" rel="noreferrer">Minecraft 텍스처 <ArrowUpRight size={12} /></a><span>비공식 팬 미니게임 · Mojang / Microsoft와 무관합니다.</span></footer>
  </div>;
}

