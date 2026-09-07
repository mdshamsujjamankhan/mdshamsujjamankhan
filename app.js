'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let width, height, points, animation, visible = true;
function resize() {
  const box = canvas.getBoundingClientRect();
  width = box.width; height = box.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  points = Array.from({length: width < 600 ? 32 : 65}, (_, i) => ({x: ((i * 137.51 + 41) % 997) / 997 * width, y: ((i * 219.83 + 81) % 991) / 991 * height, vx: Math.sin(i * 7) * .09, vy: Math.cos(i * 3) * .09}));
  draw();
}
function draw() {
  ctx.clearRect(0, 0, width, height);
  points.forEach((p, i) => {
    if (!reduced.matches) {p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > width) p.vx *= -1; if (p.y < 0 || p.y > height) p.vy *= -1;}
    for (let j = i + 1; j < points.length; j++) {
      const q = points[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 185) {ctx.beginPath(); ctx.strokeStyle = `rgba(105,223,195,${(1 - d / 185) * .35})`; ctx.lineWidth = .7; ctx.moveTo(p.x, p.y);ctx.lineTo(q.x, q.y);ctx.stroke();}
    }
    ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,Math.PI*2);ctx.fillStyle='rgba(105,223,195,.55)';ctx.fill();
  });
}
function tick() {if (visible && !reduced.matches) draw(); animation = requestAnimationFrame(tick);}
if (ctx) {resize();window.addEventListener('resize',resize);new IntersectionObserver(entries => {visible = entries[0].isIntersecting;}).observe(canvas);tick();}

// A decorative follower preserves the native cursor and all pointer interactions.
const cursorRing = document.querySelector('.cursor-ring');
const cursorEnabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0, cursorFrame = 0;
function followCursor() {
  cursorX += (targetX - cursorX) * .2;
  cursorY += (targetY - cursorY) * .2;
  cursorRing.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
  if (Math.abs(targetX - cursorX) + Math.abs(targetY - cursorY) > .1) cursorFrame = requestAnimationFrame(followCursor);
  else cursorFrame = 0;
}
function hideCursor() {
  cursorRing.classList.remove('is-visible', 'is-hovering', 'is-pressed');
  cancelAnimationFrame(cursorFrame); cursorFrame = 0;
}
document.addEventListener('pointermove', event => {
  if (!cursorEnabled.matches || event.pointerType !== 'mouse') {hideCursor();return;}
  targetX = event.clientX; targetY = event.clientY;
  if (!cursorRing.classList.contains('is-visible')) {cursorX = targetX;cursorY = targetY;}
  cursorRing.classList.add('is-visible');
  cursorRing.classList.toggle('is-hovering', !!event.target.closest('a, button, summary, input, select, textarea'));
  if (!cursorFrame) cursorFrame = requestAnimationFrame(followCursor);
}, {passive:true});
document.addEventListener('pointerdown', () => cursorRing.classList.add('is-pressed'), {passive:true});
document.addEventListener('pointerup', () => cursorRing.classList.remove('is-pressed'), {passive:true});
document.documentElement.addEventListener('pointerleave', hideCursor);
window.addEventListener('blur', hideCursor);
cursorEnabled.addEventListener('change', hideCursor);
