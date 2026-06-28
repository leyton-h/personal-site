/* Ambient neural web — vanilla canvas, no libs, runs in the browser.
   A 3D point cloud drifting toward the viewer, linked into a dendritic
   mesh with curved branches and travelling "firing" pulses, projected
   with perspective so it recedes into depth. State persists across page
   navigations via sessionStorage so the web feels continuous. */
(function () {
  var canvas = document.getElementById('bg-neural');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W, H, DPR, cx, cy, focal, COUNT, raf, T = 0;
  var NEAR = 1.2, FAR = 18, SPEED = 0.01, LINK = 140, KEY = 'neuralState';
  var nodes = [], pulses = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function makeNode(z) {
    return { x: rand(-2.4, 2.4), y: rand(-2.4, 2.4), z: z, ph: rand(0, 6.2832), amp: rand(0.02, 0.07) };
  }
  function targetCount() { return Math.max(44, Math.min(96, Math.floor((W * H) / 15000))); }

  function metrics() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2; focal = Math.min(W, H) * 0.92;
  }
  function fitCount() {
    COUNT = targetCount();
    while (nodes.length < COUNT) nodes.push(makeNode(rand(NEAR, FAR)));
    if (nodes.length > COUNT) nodes.length = COUNT;
  }

  function restore() {
    try {
      var st = JSON.parse(sessionStorage.getItem(KEY));
      if (st && st.nodes && st.nodes.length) { nodes = st.nodes; T = st.T || 0; return true; }
    } catch (e) {}
    return false;
  }
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ nodes: nodes, T: T })); } catch (e) {}
  }

  function frame() {
    T += 0.016;
    ctx.clearRect(0, 0, W, H);
    ctx.shadowBlur = 0;

    var pts = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!reduce) {
        n.z -= SPEED;
        if (n.z < NEAR) { n = nodes[i] = makeNode(FAR); }
      }
      var s = focal / n.z;
      var depth = 1 - (n.z - NEAR) / (FAR - NEAR);            // 0 far .. 1 near
      var dx = Math.sin(T + n.ph) * n.amp;
      var dy = Math.cos(T * 0.8 + n.ph) * n.amp;
      pts.push({ sx: cx + (n.x + dx) * s, sy: cy + (n.y + dy) * s, s: s, depth: depth });
    }

    // dendritic links — curved, electric blue, thicker when near
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var lx = pts[a].sx - pts[b].sx, ly = pts[a].sy - pts[b].sy;
        var dist = Math.sqrt(lx * lx + ly * ly);
        if (dist < LINK) {
          var t = 1 - dist / LINK;
          var md = Math.min(pts[a].depth, pts[b].depth);
          var alpha = t * 0.27 * (0.3 + 0.7 * md);
          var mx = (pts[a].sx + pts[b].sx) / 2, my = (pts[a].sy + pts[b].sy) / 2;
          var nx = -ly / (dist || 1), ny = lx / (dist || 1);
          var bow = (dist * 0.14) * Math.sin(T * 0.6 + a * 0.7 + b);
          ctx.strokeStyle = 'rgba(74,108,255,' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.6 + md * 1.3;
          ctx.beginPath();
          ctx.moveTo(pts[a].sx, pts[a].sy);
          ctx.quadraticCurveTo(mx + nx * bow, my + ny * bow, pts[b].sx, pts[b].sy);
          ctx.stroke();
        }
      }
    }

    // spawn firing pulses along near links
    if (!reduce && pulses.length < 20 && Math.random() < 0.11) {
      var si = (Math.random() * pts.length) | 0;
      for (var j = 0; j < pts.length; j++) {
        if (j === si) continue;
        var px = pts[si].sx - pts[j].sx, py = pts[si].sy - pts[j].sy;
        if (px * px + py * py < LINK * LINK) { pulses.push({ a: si, b: j, t: 0, sp: rand(0.014, 0.032) }); break; }
      }
    }
    for (var pi = pulses.length - 1; pi >= 0; pi--) {
      var pu = pulses[pi];
      pu.t += reduce ? 0.5 : pu.sp;
      if (pu.t >= 1 || pu.a >= pts.length || pu.b >= pts.length) { pulses.splice(pi, 1); continue; }
      var A = pts[pu.a], B = pts[pu.b];
      var ex = A.sx + (B.sx - A.sx) * pu.t, ey = A.sy + (B.sy - A.sy) * pu.t;
      var fade = 1 - Math.abs(0.5 - pu.t) * 2;
      ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(40,80,255,1)';
      ctx.fillStyle = 'rgba(198,212,255,' + (0.32 + 0.66 * fade).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, 6.2832); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // nodes — glowing electric-blue synapses
    for (var k = 0; k < pts.length; k++) {
      var p = pts[k];
      var r = Math.min(5, Math.max(0.5, p.s * 0.013 * (0.6 + p.depth)));
      var na = 0.16 + p.depth * 0.72;
      ctx.shadowBlur = 6 + p.depth * 18;
      ctx.shadowColor = 'rgba(40,70,255,' + (0.7 * p.depth).toFixed(3) + ')';
      ctx.fillStyle = 'hsla(226,100%,66%,' + na.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 6.2832); ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (!reduce) raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    metrics(); fitCount();
    if (reduce) frame(); else raf = requestAnimationFrame(frame);
  });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });

  metrics();
  restore();
  fitCount();
  if (reduce) frame(); else raf = requestAnimationFrame(frame);
})();
