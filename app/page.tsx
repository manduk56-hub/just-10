'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
type Phase = 'ready' | 'running' | 'stopped';
type Attempt = { time: number; timeout: boolean };
const TARGET = 10000, LIMIT = 12000, TOLERANCE = 100;
const format = (ms: number) => (ms / 1000).toFixed(3);

function AchievementIcon({ obtained = false, large = false }: { obtained?: boolean; large?: boolean }) {
  return <span className={`record-icon ${obtained ? 'obtained' : ''} ${large ? 'achievement-emblem' : ''}`} aria-hidden="true"><span className="obsidian-icon"><span className="obsidian-top" /><span className="obsidian-left" /><span className="obsidian-right" /></span></span>;
}

function AchievementDialog({ time, onClose, onReset }: { time: number; onClose: () => void; onReset: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = () => { dialog.current?.close(); onClose(); };
  const reset = () => { dialog.current?.close(); onReset(); };
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { if (element?.open) element.close(); };
  }, []);
  return <dialog ref={dialog} className="achievement-dialog" aria-labelledby="achievement-title" aria-describedby="achievement-description" onCancel={event => { event.preventDefault(); dismiss(); }} onKeyDown={event => { event.stopPropagation(); if (event.code === 'Space') event.preventDefault(); }}>
    <button type="button" className="achievement-close" aria-label="업적 팝업 닫기" onClick={dismiss}><X size={20} /></button>
    <p className="achievement-kicker">ADVANCEMENT MADE!</p>
    <h2 id="achievement-title">업적 완료!</h2>
    <AchievementIcon obtained large />
    <h3>아이스 버킷 챌린지</h3>
    <p id="achievement-description">흑요석 채굴 성공!<br />목표 10초의 ±0.100초 안에 멈췄어요.</p>
    <div className="achievement-result"><div><span>멈춘 시간</span><strong>{format(time)}<small>초</small></strong></div><div><span>목표와의 오차</span><strong>±{format(Math.abs(time - TARGET))}<small>초</small></strong></div></div>
    <Button className="main-action achievement-confirm" autoFocus onClick={dismiss}>기록 확인하기</Button>
    <Button variant="ghost" className="achievement-retry" onClick={reset}><img src="/textures/diamond_pickaxe.png" alt="" />처음으로 돌아가기</Button>
  </dialog>;
}

function MiningScene({ elapsed, phase, success }: { elapsed: number; phase: Phase; success: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const assets = useRef<Record<string, HTMLImageElement>>({});
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    const names = ['stone', 'obsidian', 'diamond_pickaxe'];
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
    ctx.fillStyle = '#2c3c36'; ctx.fillRect(0, 0, 800, 600);
    for (let row = 0; row < 7; row++) for (let col = 0; col < 9; col++) {
      ctx.globalAlpha = 0.12 + ((row * 3 + col * 7) % 4) * 0.018;
      ctx.drawImage(img.stone, col * 100 - (row % 2) * 25, row * 100 - 40, 100, 100);
    }
    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(400, 255, 20, 400, 280, 520);
    vignette.addColorStop(0, '#58765a30'); vignette.addColorStop(1, '#182820a8'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, 800, 600);
    const broken = phase === 'stopped' && success;
    if (broken) {
      const aura = ctx.createRadialGradient(400, 260, 35, 400, 260, 230);
      aura.addColorStop(0, '#8dffe17a');
      aura.addColorStop(0.38, '#8a67d94a');
      aura.addColorStop(0.72, '#4fd3b523');
      aura.addColorStop(1, '#4fd3b500');
      ctx.fillStyle = aura; ctx.fillRect(150, 25, 500, 470);
    }
    ctx.fillStyle = '#05080970'; ctx.beginPath(); ctx.ellipse(400, 458, 155, 29, 0, 0, Math.PI * 2); ctx.fill();
    const shake = phase === 'running' ? Math.sin(elapsed / 36) * Math.max(0, Math.sin(elapsed / 90)) * 2 : 0;
    const size = broken ? 1.04 : 0.95;
    ctx.save(); ctx.translate(400 + shake, 260); ctx.scale(size, size);
    const face = (a: number, b: number, c: number, d: number, x: number, y: number, shade: string) => {
      ctx.save(); ctx.transform(a, b, c, d, x, y); ctx.drawImage(img.obsidian, 0, 0, 16, 16); ctx.fillStyle = shade; ctx.fillRect(0, 0, 16, 16);
      ctx.restore();
    };
    face(8, 4, -8, 4, 0, -144, '#9b8ad513'); face(8, 4, 0, 10, -128, -80, '#0000000a'); face(8, -4, 0, 10, 0, -16, '#00000044'); ctx.restore();
    if (broken) {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(400, 110); ctx.lineTo(533, 177); ctx.lineTo(533, 343); ctx.lineTo(400, 426); ctx.lineTo(267, 343); ctx.lineTo(267, 177); ctx.closePath();
      ctx.clip();
      const glint = ctx.createLinearGradient(265, 390, 535, 135);
      glint.addColorStop(0, '#79f0d200'); glint.addColorStop(0.38, '#79f0d214'); glint.addColorStop(0.48, '#e9fff096'); glint.addColorStop(0.58, '#a77cff38'); glint.addColorStop(1, '#a77cff00');
      ctx.fillStyle = glint; ctx.fillRect(240, 90, 320, 350);
      ctx.restore();
      ctx.strokeStyle = '#8dffe1c7'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(400, 110); ctx.lineTo(533, 177); ctx.lineTo(533, 343); ctx.lineTo(400, 426); ctx.lineTo(267, 343); ctx.lineTo(267, 177); ctx.closePath(); ctx.stroke();
    }
    if (phase === 'running' || broken) {
      for (let i = 0; i < (broken ? 20 : 13); i++) { const t = ((elapsed / 520 + i * 0.127) % 1); ctx.globalAlpha = broken ? 0.92 - t * 0.45 : 1 - t; ctx.fillStyle = broken ? ['#8dffe1', '#c9a6ff', '#f2fff8'][i % 3] : ['#685277', '#403448', '#83709b'][i % 3]; const particleSize = broken ? 5 + i % 5 : 5 + i % 4; ctx.fillRect(410 + Math.sin(i * 4.2) * (30 + t * 155), 245 + Math.cos(i * 3.2) * 80 + t * 145, particleSize, particleSize); } ctx.globalAlpha = 1;
    }
    if (!broken) { ctx.save(); ctx.translate(555, 322); ctx.rotate(phase === 'running' ? -0.24 - Math.max(0, Math.sin(elapsed / 90)) * 0.68 : -0.23); ctx.drawImage(img.diamond_pickaxe, -106, -134, 232, 232); ctx.restore(); }
    if (!broken) { ctx.strokeStyle = '#e8eee99a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(392, 240); ctx.lineTo(408, 240); ctx.moveTo(400, 232); ctx.lineTo(400, 248); ctx.stroke(); }
  }, [elapsed, phase, success, loaded]);
  return <><canvas ref={canvas} width="800" height="600" role="img" aria-label={phase === 'running' ? '다이아몬드 곡괭이로 흑요석을 캐는 중' : success ? '채굴한 흑요석' : '흑요석과 다이아몬드 곡괭이'} />{failed && <div className="scene-error">텍스처를 불러오지 못했어요. 새로고침해 주세요.<br />타이머는 계속 사용할 수 있어요.</div>}</>;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('ready'); const [elapsed, setElapsed] = useState(0); const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [achievementOpen, setAchievementOpen] = useState(false);
  const start = useRef(0), running = useRef(false);
  const error = elapsed - TARGET, success = phase === 'stopped' && Math.abs(error) <= TOLERANCE, timeout = phase === 'stopped' && attempts[0]?.timeout;
  const timerHidden = phase === 'running' && elapsed >= 6000;
  const best = attempts.length ? Math.min(...attempts.map(a => Math.abs(a.time - TARGET))) : null;
  const finish = useCallback((time: number, timedOut = false) => { if (!running.current) return; running.current = false; const won = !timedOut && Math.abs(time - TARGET) <= TOLERANCE; const attempt = { time, timeout: timedOut }; setElapsed(time); setPhase('stopped'); setAttempts(prev => [attempt, ...prev].slice(0, 50)); setAchievementOpen(won); }, []);
  const act = useCallback(() => { if (running.current) { const time = performance.now() - start.current; finish(Math.min(LIMIT, time), time >= LIMIT); } else { setAchievementOpen(false); start.current = performance.now(); running.current = true; setElapsed(0); setPhase('running'); } }, [finish]);
  const reset = useCallback(() => { running.current = false; setAchievementOpen(false); setElapsed(0); setPhase('ready'); }, []);
  useEffect(() => { const keydown = (event: KeyboardEvent) => { if (achievementOpen || event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return; const target = event.target as HTMLElement; if (target.closest('input,textarea,select,[contenteditable="true"],button,a')) return; event.preventDefault(); if (phase === 'stopped') reset(); else act(); }; window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown); }, [act, achievementOpen, phase, reset]);
  useEffect(() => { if (phase !== 'running') return; let frame: number; const tick = () => { if (!running.current) return; const time = performance.now() - start.current; if (time >= LIMIT) { finish(LIMIT, true); return; } setElapsed(time); frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [phase, finish]);
  const resultTitle = success ? '완벽한 채굴!' : null;
  return <div className="app-shell">
    <main>
      <section className="game" aria-label="10초 타이밍 게임">
        <div className={`mine-scene ${phase === 'running' ? 'mining' : ''}`}>
          <MiningScene elapsed={elapsed} phase={phase} success={success} />
          <div className="scene-bottom"><div className="hotbar" role="group" aria-label="마인크래프트 핫바: 2번 다이아몬드 곡괭이 선택됨"><span className="hotbar-slot" title="1번: 다이아몬드 검"><img src="/textures/diamond_sword.png" alt="다이아몬드 검" /></span><span className="hotbar-slot selected" title="2번: 다이아몬드 곡괭이 (선택됨)"><img src="/textures/diamond_pickaxe.png" alt="선택된 다이아몬드 곡괭이" /></span><span className="hotbar-slot" /><span className="hotbar-slot" /><span className="hotbar-slot" /><span className="hotbar-slot" title="6번: 물 양동이"><img src="/textures/water_bucket.png" alt="물 양동이" /></span><span className="hotbar-slot" title="7번: 용암 양동이"><img src="/textures/lava_bucket.png" alt="용암 양동이" /></span><span className="hotbar-slot" /><span className="hotbar-slot" title="9번: 횃불"><img src="/textures/torch.png" alt="횃불" /></span></div></div>
        </div>
        <div className="timer-panel">
          <div className="timer-top"><span className="timing-tolerance">성공 범위 <strong>±0.100초</strong></span>{phase !== 'running' && <span className={`status-pill ${phase}`}>{phase === 'ready' ? '준비 완료' : '도전 완료'}</span>}</div>
          <div className="timer-center"><p className="timer-label">{timerHidden ? '이제 감각으로 멈춰보세요.' : phase === 'running' ? '10초가 되는 순간, 멈추세요.' : phase === 'stopped' ? '당신이 멈춘 순간' : '당신의 10초를 기다리는 중'}</p><div className={`timer-digits ${phase} ${success ? 'success' : ''}`} aria-hidden="true">{timerHidden ? <span className="unknown-time">??.???</span> : <>{format(elapsed).split('.')[0]}<span>.{format(elapsed).split('.')[1]}</span></>}</div><span className="seconds">SECONDS</span></div>
          <div className={`feedback ${phase === 'stopped' ? 'result' : ''} ${success ? 'perfect' : ''}`} role="status" aria-live="polite">{phase === 'stopped' ? <>{resultTitle && <strong>{resultTitle}</strong>}<span>{timeout ? '12초가 지나 도전이 종료됐어요.' : `목표보다 ${format(Math.abs(error))}초 ${error < 0 ? '빨랐어요' : '늦었어요'}`}{success && ' · 성공 범위 ±0.100초'}</span></> : <>{phase === 'ready' && <strong>준비됐나요?</strong>}<span>{phase === 'running' ? '스페이스바를 한 번 더 누르면 멈춰요.' : '스페이스바를 누르면 채굴이 시작돼요.'}</span></>}</div>
          <Button className={`main-action ${phase === 'running' ? 'stop-action' : ''}`} onClick={phase === 'stopped' ? reset : act} onKeyDown={event => { if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) { if (phase === 'stopped') reset(); else act(); } } }} onKeyUp={event => { if (event.code === 'Space') event.preventDefault(); }}><span>{phase === 'ready' ? <img className="action-pickaxe" src="/textures/diamond_pickaxe.png" alt="" /> : phase === 'running' ? <span className="stop-icon" /> : <RotateCcw size={18} />}{phase === 'ready' ? '채굴 시작하기' : phase === 'running' ? '지금 멈추기' : '처음으로 돌아가기'}</span><kbd>SPACE</kbd></Button>
          <div className="action-note"><span>참가자당 한 번 · 12초 자동 종료</span></div>
        </div>
      </section>
      <section className="records" aria-label="참가자들의 도전 기록"><div className="best-record"><AchievementIcon obtained={best !== null && best <= TOLERANCE} /><div><span className="tiny-caption">BEST PRECISION</span><strong>{best === null ? <span className="no-record">첫 기록에 도전해 보세요</span> : <>±{format(best)}<small>초</small></>}</strong></div></div><div className="recent-records"><div className="recent-title">최근 도전 <span>{attempts.length}</span></div><div className="attempt-list">{attempts.length === 0 ? <span className="empty-record">아직 기록이 없어요. 첫 블록을 캐볼까요?</span> : attempts.slice(0, 5).map((a, i) => <span key={`${attempts.length}-${i}`} className={`attempt ${Math.abs(a.time - TARGET) <= TOLERANCE ? 'good' : ''}`}>{format(a.time)}<small>s</small>{i === 0 && <span className="new-dot" />}</span>)}</div></div></section>
    </main>
    <footer><span>작은 도전, 완벽한 타이밍.</span><a href="https://github.com/PrismarineJS/minecraft-assets" target="_blank" rel="noreferrer">Minecraft 텍스처 <ArrowUpRight size={12} /></a><span>비공식 팬 미니게임 · Mojang / Microsoft와 무관합니다.</span></footer>
    {achievementOpen && success && <AchievementDialog time={elapsed} onClose={() => setAchievementOpen(false)} onReset={reset} />}
  </div>;
}

