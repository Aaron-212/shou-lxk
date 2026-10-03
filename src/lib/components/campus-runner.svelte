<script lang="ts">
import { onMount } from "svelte";
import { Play, RotateCcw, Pause } from "@lucide/svelte";
import { GROUND, STUDENT_X, newRun, jump, step } from "#lib/runner.js";

let canvas: HTMLCanvasElement;
let jumpButton: HTMLButtonElement;
let status = $state<"ready" | "running" | "paused" | "over">("ready");
let gpa = $state(0);
let distance = $state(0);
let run = newRun();
let frame = 0;
let lastTime = 0;

function draw() {
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, 800, 260);
  ctx.fillStyle = "#121e29";
  ctx.fillRect(0, 0, 800, 260);
  // A quiet campus skyline, drawn locally without image requests.
  ctx.fillStyle = "#1c2e3e";
  for (let i = 0; i < 10; i++) {
    const x = ((((i * 110 - run.distance * 0.12) % 1100) + 1100) % 1100) - 110;
    const h = 25 + (i % 4) * 15;
    ctx.fillRect(x, GROUND - h, 64, h);
    ctx.fillStyle = "#2c4052";
    for (let w = 0; w < 4; w++) ctx.fillRect(x + 8 + w * 13, GROUND - h + 10, 5, 5);
    ctx.fillStyle = "#1c2e3e";
  }
  ctx.fillStyle = "#3b5366";
  ctx.fillRect(0, GROUND, 800, 2);
  ctx.fillStyle = "#23394a";
  for (let i = 0; i < 24; i++) ctx.fillRect(i * 41 - (run.distance % 41), GROUND + 17 + (i % 3) * 7, 12, 2);
  ctx.fillStyle = "#adc3d0";
  ctx.font = "10px monospace";
  ctx.fillText("SHOU  /  CAMPUS RUN", 24, 28);
  ctx.fillStyle = "#d4e8f2";
  ctx.beginPath();
  ctx.arc(717, 47, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#121e29";
  ctx.beginPath();
  ctx.arc(725, 41, 15, 0, Math.PI * 2);
  ctx.fill();
  for (const building of run.obstacles) {
    const y = GROUND - building.height;
    ctx.fillStyle = "#87a7bc";
    ctx.fillRect(building.x, y, building.width, building.height);
    ctx.fillStyle = "#b5d2e3";
    ctx.fillRect(building.x - 3, y, building.width + 6, 4);
    ctx.fillStyle = "#304b60";
    for (let row = 0; row < Math.floor((building.height - 10) / 12); row++) {
      for (let col = 0; col < 3; col++) ctx.fillRect(building.x + 5 + col * 10, y + 9 + row * 12, 5, 6);
    }
    ctx.fillRect(building.x + building.width / 2 - 4, GROUND - 10, 8, 10);
  }
  for (const point of run.points) {
    ctx.fillStyle = "#e8bf67";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#443b26";
    ctx.font = "bold 11px monospace";
    ctx.fillText("G", point.x - 3.5, point.y + 4);
  }
  const x = STUDENT_X,
    y = GROUND - run.y - 44;
  // Glasses, satchel, blue jacket and moving legs make the student recognizable.
  ctx.fillStyle = "#e4b996";
  ctx.fillRect(x + 7, y + 3, 19, 17);
  ctx.fillStyle = "#1b1119";
  ctx.fillRect(x + 5, y, 21, 6);
  ctx.fillRect(x + 5, y + 3, 4, 10);
  ctx.strokeStyle = "#111e2a";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 13, y + 8, 6, 5);
  ctx.strokeRect(x + 22, y + 8, 6, 5);
  ctx.beginPath();
  ctx.moveTo(x + 19, y + 10);
  ctx.lineTo(x + 22, y + 10);
  ctx.stroke();
  ctx.fillStyle = "#449ed4";
  ctx.fillRect(x + 5, y + 20, 19, 15);
  ctx.fillStyle = "#e4b996";
  ctx.fillRect(x + 23, y + 22, 5, 10);
  ctx.fillStyle = "#c38e50";
  ctx.fillRect(x, y + 20, 7, 14);
  const stride = run.y > 0 ? 3 : Math.sin(run.distance * 0.12) * 4;
  ctx.fillStyle = "#dee9ee";
  ctx.fillRect(x + 6, y + 34, 6, 9 - stride);
  ctx.fillRect(x + 18, y + 34, 6, 9 + stride);
  ctx.fillStyle = "#71a9c6";
  ctx.fillRect(x + 5, y + 41 - stride, 9, 3);
  ctx.fillRect(x + 18, y + 41 + stride, 9, 3);
}

function tick(time: number) {
  if (status !== "running") return;
  if (lastTime) step(run, (time - lastTime) / 1000);
  lastTime = time;
  gpa = run.gpa;
  distance = Math.floor(run.distance / 10);
  draw();
  if (run.over) {
    status = "over";
    return;
  }
  frame = requestAnimationFrame(tick);
}
function start() {
  if (status === "ready" || status === "over") {
    run = newRun();
    gpa = 0;
    distance = 0;
  }
  status = "running";
  lastTime = 0;
  jumpButton?.focus({ preventScroll: true });
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(tick);
}
function pause() {
  if (status === "running") {
    status = "paused";
    cancelAnimationFrame(frame);
  }
}
function activate() {
  if (status !== "running") start();
  jump(run);
}
function keyboard(event: KeyboardEvent) {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    if (!event.repeat) activate();
  }
  if (event.code === "Escape") pause();
}
onMount(() => {
  draw();
  const visibility = () => {
    if (document.hidden) pause();
  };
  document.addEventListener("visibilitychange", visibility);
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", visibility);
  };
});
</script>

<section class="runner" aria-label="校园跑酷小游戏">
  <header class="runner-bar">
    <div>
      <span class="runner-tag">课间十分钟</span>
      <h2>GPA 大作战</h2>
    </div>
    <div class="runner-score"><span><strong>{gpa}</strong> GPA POINTS</span><span>{distance} m</span></div>
  </header>
  <div class="runner-stage">
    <canvas
      bind:this={canvas}
      width="800"
      height="260"
      aria-label="戴眼镜的学生跳过高矮不同的教学楼，收集金色 GPA 积分。"
    ></canvas>
    <button
      bind:this={jumpButton}
      class="runner-touch"
      type="button"
      onclick={activate}
      onkeydown={keyboard}
      aria-label={status === "running" ? "跳跃" : "开始或继续游戏"}
    ></button>
    {#if status !== "running"}<div class="runner-overlay" aria-live="polite">
        <span
          >{status === "ready"
            ? "等一等，也可以跑一跑。"
            : status === "over"
              ? `课间结束！收集了 ${gpa} 个 GPA POINTS`
              : "休息一下，随时继续。"}</span
        ><button type="button" onclick={start}
          >{#if status === "over"}<RotateCcw class="size-4" />{:else}<Play class="size-4" />{/if}{status === "over"
            ? "再跑一次"
            : status === "paused"
              ? "继续游戏"
              : "开始游戏"}</button
        >
      </div>{/if}
  </div>
  <footer class="runner-help">
    <p><kbd>空格</kbd> / <kbd>↑</kbd> 跳跃 · 手机轻点画面 · 躲开教学楼，收集金色 G</p>
    <button type="button" onclick={pause} disabled={status !== "running"} aria-label="暂停游戏"
      ><Pause class="size-4" /></button
    >
  </footer>
  <p class="sr-only" role="status">
    {status === "over" ? `游戏结束，获得 ${gpa} 个 GPA 积分。可重新开始。` : "小游戏不会影响真实成绩。"}
  </p>
</section>

<style>
.runner {
  overflow: hidden;
  border: 1px solid #314555;
  border-radius: 16px;
  background: #172531;
  color: #dce7ef;
  text-align: left;
}
.runner-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #2b3c4b;
}
.runner-tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #90a7b7;
}
.runner-bar h2 {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 600;
}
.runner-score {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 10px;
  color: #96aebf;
  letter-spacing: 0.06em;
}
.runner-score strong {
  font-size: 22px;
  color: #ebc16c;
  margin-right: 4px;
}
.runner-stage {
  position: relative;
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}
.runner-touch {
  position: absolute;
  inset: 0;
  touch-action: manipulation;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.runner-touch:focus-visible {
  outline: 2px solid #65b6f3;
  outline-offset: -4px;
}
.runner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #0e1825a8;
  pointer-events: none;
  padding: 16px;
  text-align: center;
}
.runner-overlay span {
  font-size: 14px;
}
.runner-overlay button {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #5aafe5;
  color: #102232;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
.runner-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #2b3c4b;
  color: #9cb2c2;
  font-size: 11px;
  line-height: 1.8;
}
.runner-help button {
  padding: 7px;
  border: 1px solid #385062;
  border-radius: 5px;
}
.runner-help button:disabled {
  opacity: 0.4;
}
kbd {
  border: 1px solid #3c5364;
  border-radius: 3px;
  padding: 1px 4px;
}
@media (max-width: 480px) {
  .runner-bar {
    padding: 14px;
  }
  .runner-score {
    gap: 8px;
  }
  .runner-score strong {
    font-size: 18px;
  }
  .runner-help {
    padding: 10px 14px;
  }
  .runner-overlay {
    gap: 10px;
  }
  .runner-overlay span {
    font-size: 12px;
  }
}
</style>
