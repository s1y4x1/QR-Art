/* QR-Art embed protocol v1. The editor and extension hosts remain independent. */
(() => {
  'use strict';
  const canvas = document.getElementById('qr'), ctx = canvas.getContext('2d');
  const status = document.getElementById('status');
  // Five-column, seven-row bitmap glyphs (least significant bit is the top row).
  const font = {
    '0':[62,81,73,69,62],'1':[0,66,127,64,0],'2':[66,97,81,73,70],'3':[33,65,69,75,49],
    '4':[24,20,18,127,16],'5':[39,69,69,69,57],'6':[60,74,73,73,48],'7':[1,113,9,5,3],
    '8':[54,73,73,73,54],'9':[6,73,73,41,30],
    A:[126,17,17,17,126],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],
    E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],
    I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],
    M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],
    Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],
    U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],
    Y:[7,8,112,8,7],Z:[97,81,73,69,67],
    a:[32,84,84,84,120],b:[127,72,68,68,56],c:[56,68,68,68,32],d:[56,68,68,72,127],
    e:[56,84,84,84,24],f:[8,126,9,1,2],g:[12,82,82,82,62],h:[127,8,4,4,120],
    i:[0,68,125,64,0],j:[32,64,68,61,0],k:[127,16,40,68,0],l:[0,65,127,64,0],
    m:[124,4,24,4,120],n:[124,8,4,4,120],o:[56,68,68,68,56],p:[124,20,20,20,8],
    q:[8,20,20,24,124],r:[124,8,4,4,8],s:[72,84,84,84,32],t:[4,63,68,64,32],
    u:[60,64,64,32,124],v:[28,32,64,32,28],w:[60,64,48,64,60],x:[68,40,16,40,68],
    y:[12,80,80,80,60],z:[68,100,84,76,68],
    '.':[0,96,96,0,0],'/':[32,16,8,4,2],'-':[8,8,8,8,8],'_':[64,64,64,64,64],
    ':':[0,54,54,0,0],'?':[2,1,81,9,6],'=':[20,20,20,20,20],'&':[54,73,85,34,80],
    '%':[99,19,8,100,99],'#':[20,127,20,127,20],'~':[8,4,8,16,8],' ':[0,0,0,0,0]
  };
  let state = null, ownerOrigin = null, requestId = null, animation = 0, paused = false, started = 0, previous = -1;
  const reply = message => { if (parent !== window && ownerOrigin !== null) parent.postMessage({ protocol: 1, requestId, ...message }, ownerOrigin === 'null' ? '*' : ownerOrigin); };
  function build(config) {
    const text = String(config.text || '');
    if (!text || text.length > 512) throw new Error('二维码内容长度无效');
    const version = config.version ?? 5, level = config.ecc ?? 'L', mask = config.mask ?? 7;
    if (version !== 5 || level !== 'L' || mask !== 7) throw new Error('当前嵌入模式支持版本 5、L 容错、掩码 7');
    const bytes = new TextEncoder().encode(text);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    const blocks = qrcode.QRRSBlock.getRSBlocks(version, qrcode.QRErrorCorrectionLevel[level]);
    const dataBytes = blocks.reduce((sum, block) => sum + block.dataCount, 0);
    const padStart = Math.ceil((4 + 8 + bytes.length * 8 + 4) / 8);
    if (padStart >= dataBytes) throw new Error('内容过长，版本 5 没有足够的自由绘制空间');
    const make = (pad, track = false) => { const qr = qrcode(version, level); qr.setModuleBitTracking(track); qr.addData(binary, 'Byte'); qr.setCustomPadBytes(pad); qr.makeMasked(mask); return qr; };
    const base = make(new Array(dataBytes - padStart).fill(0), true), count = base.getModuleCount();
    const offsets = []; let offset = 0;
    for (const block of blocks) { offsets.push(offset); offset += block.dataCount; }
    const streamToLinear = [];
    for (let column = 0; column < Math.max(...blocks.map(block => block.dataCount)); column++)
      blocks.forEach((block, row) => { if (column < block.dataCount) streamToLinear.push(offsets[row] + column); });
    const maskFn = qrcode.QRUtil.getMaskFunction(mask), cells = [];
    for (let y = 0; y < count; y++) for (let x = 0; x < count; x++) {
      const bit = base.getModuleBitIndex(y, x);
      if (bit === null || bit >= dataBytes * 8) continue;
      const linear = streamToLinear[Math.floor(bit / 8)] * 8 + bit % 8;
      if (linear >= padStart * 8) cells.push({ x, y, bit: linear - padStart * 8, mask: maskFn(y,x) ? 1 : 0 });
    }
    const label = text.replace(/^https?:\/\//i, '');
    const lines = [];
    for (let i = 0; i < label.length; i += 2) lines.push(label.slice(i,i + 2));
    return { text, make, base, count, cells, label, lines, padStart, dataBytes, tapeHeight: lines.length * 8 + 16,
      animate: config.animate !== false, stepMs: 180 / Math.min(4,Math.max(.1,Number(config.speed) || 1)) };
  }
  function drawFrame(step = 0) {
    if (!state) return;
    const s = state, pad = new Array(s.dataBytes - s.padStart).fill(0);
    for (const cell of s.cells) {
      let dark = 0;
      // Screenshot's central rectangle: columns 11..22, full height. Function modules stay untouched.
      if (cell.x >= 11 && cell.x < 23) {
        const sourceY = (cell.y + step) % s.tapeHeight;
        const line = s.lines[Math.floor(sourceY / 8)], row = sourceY % 8, x = cell.x - 11;
        if (line && row < 7 && x % 6 < 5) {
          const glyph = font[line[Math.floor(x / 6)]] || font['?'];
          if (line[Math.floor(x / 6)]) dark = (glyph[x % 6] >> row) & 1;
        }
      }
      if (dark ^ cell.mask) pad[cell.bit >> 3] |= 1 << (7 - cell.bit % 8);
    }
    const qr = s.make(pad), moduleSize = 8, margin = 8;
    const size = s.count * moduleSize + 2 * margin;
    if (canvas.width !== size) canvas.width = canvas.height = size;
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,size,size); ctx.fillStyle = '#000';
    for (let y=0;y<s.count;y++) for(let x=0;x<s.count;x++) if(qr.isDark(y,x)) ctx.fillRect(margin+x*moduleSize,margin+y*moduleSize,moduleSize,moduleSize);
    s.qr = qr; s.step = step;
  }
  function stop() { cancelAnimationFrame(animation); animation = 0; }
  function tick(time) {
    animation = 0;
    if (!state || paused || document.hidden || !state.animate) return;
    const step = Math.floor((time - started) / state.stepMs) % state.tapeHeight;
    if (step !== previous) { drawFrame(step); previous = step; }
    animation = requestAnimationFrame(tick);
  }
  function resume() { if (state && !paused && !document.hidden && state.animate && !animation) animation = requestAnimationFrame(tick); }
  function render(config) {
    stop(); state = build(config); started = performance.now(); previous = 0;
    drawFrame(0); canvas.hidden = false; status.hidden = true; canvas.setAttribute('aria-label',state.text); resume();
    return { size: canvas.width, modules: state.count, label: state.label };
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || parent === window || event.data?.protocol !== 1) return;
    if (ownerOrigin !== null && event.origin !== ownerOrigin) return;
    if (event.data.type === 'QR_ART_RENDER') {
      ownerOrigin = event.origin; requestId = event.data.requestId;
      try { reply({ type: 'QR_ART_RENDERED', ...render(event.data.config || {}) }); }
      catch (error) { stop(); state = null; canvas.hidden = true; status.hidden = false; status.textContent = '无法生成艺术二维码'; reply({type:'QR_ART_ERROR',message:String(error.message || error)}); }
    } else if (event.data.type === 'QR_ART_PAUSE' && ownerOrigin !== null) {
      paused = event.data.paused === true; if (paused) stop(); else resume();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else resume(); });
  window.addEventListener('pagehide', stop);
  // Useful to local previews/tests; callers have no access to the parent page.
  globalThis.QRArtEmbed = { render, drawFrame, stop, getState: () => state };
  if (parent !== window) parent.postMessage({type:'QR_ART_READY',protocol:1}, '*');
})();
