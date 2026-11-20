/* QR-Art embed protocol v2: generic QR parameters and caller-supplied bitmap frames. */
(() => {
  'use strict';
  const canvas = document.getElementById('qr'), ctx = canvas.getContext('2d');
  const status = document.getElementById('status'), protocol = 2;
  let state = null, ownerOrigin = null, requestId = null, animation = 0, paused = false;
  let elapsed = 0, lastTime = null, previous = -1, finished = false;
  const reply = message => {
    if (parent !== window && ownerOrigin !== null)
      parent.postMessage({protocol, requestId, ...message}, ownerOrigin === 'null' ? '*' : ownerOrigin);
  };
  function integer(value, fallback, min, max, name) {
    const number = value ?? fallback;
    if (!Number.isInteger(number) || number < min || number > max) throw new Error(name + ' 参数无效');
    return number;
  }
  function color(value, fallback) {
    const result = value ?? fallback;
    if (typeof result !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(result)) throw new Error('颜色须为十六进制 RGB');
    return result;
  }
  function build(config) {
    const text = config.text;
    if (typeof text !== 'string' || text.length > 10000) throw new Error('二维码内容须为不超过 10000 字符的文本');
    const encoding = config.encoding ?? 'Byte', level = config.ecc ?? 'M';
    if (!['Byte','Numeric','Alphanumeric'].includes(encoding)) throw new Error('编码格式无效');
    if (!['L','M','Q','H'].includes(level)) throw new Error('容错等级无效');
    if (encoding === 'Numeric' && !/^\d*$/.test(text)) throw new Error('Numeric 只允许数字');
    if (encoding === 'Alphanumeric' && !/^[0-9A-Z $%*+./:\-]*$/.test(text)) throw new Error('Alphanumeric 包含不支持的字符');
    const rawVersion = config.version === 'auto' ? 0 : config.version;
    let version = integer(rawVersion, 0, 0, 40, '版本');
    const mask = integer(config.mask === 'auto' ? -1 : config.mask, -1, -1, 7, '掩码');
    const bytes = new TextEncoder().encode(text);
    const data = encoding === 'Byte' ? Array.from(bytes, byte => String.fromCharCode(byte)).join('') : text;
    const mode = {Numeric:1,Alphanumeric:2,Byte:4}[encoding];
    const payloadLength = encoding === 'Byte' ? bytes.length : text.length;
    const payloadBits = encoding === 'Byte' ? payloadLength * 8
      : encoding === 'Numeric' ? Math.floor(payloadLength / 3) * 10 + [0,4,7][payloadLength % 3]
      : Math.floor(payloadLength / 2) * 11 + payloadLength % 2 * 6;
    const capacity = v => qrcode.QRRSBlock.getRSBlocks(v, qrcode.QRErrorCorrectionLevel[level]).reduce((sum,b) => sum + b.dataCount,0);
    const prefixLength = v => 4 + qrcode.QRUtil.getLengthInBits(mode,v) + payloadBits;
    if (!version) {
      version = 1;
      while (version <= 40 && prefixLength(version) > capacity(version) * 8) version++;
    }
    if (version > 40 || prefixLength(version) > capacity(version) * 8) throw new Error('内容超过所选二维码版本容量');
    const blocks = qrcode.QRRSBlock.getRSBlocks(version,qrcode.QRErrorCorrectionLevel[level]);
    const dataBytes = capacity(version);
    const padStart = Math.ceil(Math.min(prefixLength(version) + 4, dataBytes * 8) / 8);
    const createQr = (pad, track = false, chosenMask = mask) => {
      const qr = qrcode(version, level);
      qr.setModuleBitTracking(track); qr.addData(data, encoding);
      if (pad?.length) qr.setCustomPadBytes(pad);
      if (chosenMask < 0) qr.make(); else qr.makeMasked(chosenMask);
      return qr;
    };
    const base = createQr(null,true), actualMask = base.getMaskPattern(), count = base.getModuleCount();
    const make = pad => createQr(pad,false,actualMask);
    const offsets = []; let offset = 0;
    for (const block of blocks) { offsets.push(offset); offset += block.dataCount; }
    const streamToLinear = [];
    for (let column = 0; column < Math.max(...blocks.map(block => block.dataCount)); column++)
      blocks.forEach((block,row) => { if (column < block.dataCount) streamToLinear.push(offsets[row] + column); });
    const maskFn = qrcode.QRUtil.getMaskFunction(actualMask), cells = [];
    for (let y=0;y<count;y++) for (let x=0;x<count;x++) {
      const bit = base.getModuleBitIndex(y,x);
      if (bit === null || bit >= dataBytes * 8) continue;
      const linear = streamToLinear[Math.floor(bit / 8)] * 8 + bit % 8;
      if (linear >= padStart * 8) cells.push({x,y,bit:linear-padStart*8,mask:maskFn(y,x) ? 1 : 0});
    }
    let art = null;
    if (config.art != null) {
      const input = config.art;
      const x = integer(input.x,0,0,count-1,'绘制 X'), y = integer(input.y,0,0,count-1,'绘制 Y');
      const width = integer(input.width,count-x,1,count-x,'绘制宽度'), height = integer(input.height,count-y,1,count-y,'绘制高度');
      const frames = input.frames;
      if (!Array.isArray(frames) || !frames.length || frames.length > 512 || frames.length * width * height > 2000000)
        throw new Error('绘制帧须为 1–512 帧，且总像素数不超过 2000000');
      for (const frame of frames) if (typeof frame !== 'string' || frame.length !== width*height || /[^01.]/.test(frame))
        throw new Error('绘制帧须为按行排列的 0、1、. 字符串，长度等于宽乘高');
      const frameDuration = input.frameDuration ?? 180;
      if (!Number.isFinite(frameDuration) || frameDuration < 16 || frameDuration > 60000) throw new Error('每帧时长须为 16–60000 毫秒');
      art = {x,y,width,height,frames,frameDuration,loop:input.loop !== false};
    }
    const paddingBackground = config.paddingBackground ?? 'original';
    if (!['original',0,1].includes(paddingBackground)) throw new Error('paddingBackground 须为 original、0 或 1');
    const moduleSize = integer(config.moduleSize,8,1,32,'模块边长');
    const margin = integer(config.margin,moduleSize*4,0,256,'外边距');
    if (count * moduleSize + 2 * margin > 2048) throw new Error('绘图尺寸不得超过 2048 像素');
    const moduleScale = config.moduleScale ?? 1, moduleShape = config.moduleShape ?? 'square';
    if (!Number.isFinite(moduleScale) || moduleScale < .2 || moduleScale > 1) throw new Error('模块缩放须为 0.2–1');
    if (!['square','circle'].includes(moduleShape)) throw new Error('模块样式须为 square 或 circle');
    return {text,version,level,mask:actualMask,make,base,count,cells,art,padStart,dataBytes,paddingBackground,
      moduleSize,margin,moduleScale,moduleShape,foreground:color(config.foreground,'#000000'),background:color(config.background,'#ffffff'),
      animate:config.animate !== false};
  }
  function drawFrame(index = 0) {
    if (!state) return;
    const s = state, frames = s.art?.frames;
    index = integer(index,0,0,frames ? frames.length-1 : 0,'帧索引');
    const pad = Array.from({length:s.dataBytes-s.padStart},(_,i) => i%2 ? 0x11 : 0xec);
    const frame = frames?.[index], art = s.art;
    for (const cell of s.cells) {
      let target = s.paddingBackground;
      if (art && cell.x >= art.x && cell.x < art.x+art.width && cell.y >= art.y && cell.y < art.y+art.height) {
        const pixel = frame[(cell.y-art.y)*art.width + cell.x-art.x];
        if (pixel !== '.') target = Number(pixel);
      }
      if (target === 'original') continue;
      const bit = 1 << (7-cell.bit%8), byte = cell.bit>>3;
      if (target ^ cell.mask) pad[byte] |= bit; else pad[byte] &= ~bit;
    }
    const qr = s.make(pad), size = s.count*s.moduleSize + 2*s.margin;
    if (canvas.width !== size) canvas.width = canvas.height = size;
    ctx.fillStyle = s.background; ctx.fillRect(0,0,size,size); ctx.fillStyle = s.foreground;
    for (let y=0;y<s.count;y++) for(let x=0;x<s.count;x++) if(qr.isDark(y,x)) {
      const fixed = s.base.getModuleBitIndex(y,x) === null;
      const scale = fixed ? 1 : s.moduleScale, edge = s.moduleSize*scale;
      const left = s.margin+x*s.moduleSize+(s.moduleSize-edge)/2, top = s.margin+y*s.moduleSize+(s.moduleSize-edge)/2;
      if (!fixed && s.moduleShape === 'circle') { ctx.beginPath(); ctx.arc(left+edge/2,top+edge/2,edge/2,0,Math.PI*2); ctx.fill(); }
      else ctx.fillRect(left,top,edge,edge);
    }
    s.qr = qr; s.frameIndex = index;
  }
  function stop() { cancelAnimationFrame(animation); animation = 0; lastTime = null; }
  function tick(time) {
    animation = 0;
    if (!state || paused || document.hidden || !state.animate) return;
    if (lastTime !== null) elapsed += time-lastTime;
    lastTime = time;
    const art = state.art, raw = Math.floor(elapsed/art.frameDuration);
    const index = art.loop ? raw%art.frames.length : Math.min(raw,art.frames.length-1);
    if (index !== previous) { drawFrame(index); previous = index; }
    if (!art.loop && raw >= art.frames.length-1) { finished = true; lastTime = null; return; }
    animation = requestAnimationFrame(tick);
  }
  function resume() {
    if (state?.art?.frames.length > 1 && !paused && !document.hidden && state.animate && !animation && !finished)
      animation = requestAnimationFrame(tick);
  }
  function render(config) {
    stop(); state = build(config); elapsed = 0; previous = 0; finished = false;
    drawFrame(0); canvas.hidden = false; status.hidden = true; canvas.setAttribute('aria-label',state.text); resume();
    const art = state.art;
    return {size:canvas.width,modules:state.count,version:state.version,ecc:state.level,mask:state.mask,
      editableModules:state.cells.length,artWritableModules:art ? state.cells.filter(c=>c.x>=art.x&&c.x<art.x+art.width&&c.y>=art.y&&c.y<art.y+art.height).length : 0,
      frameCount:art?.frames.length ?? 1};
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || parent === window || event.data?.protocol !== protocol) return;
    if (ownerOrigin !== null && event.origin !== ownerOrigin) return;
    if (event.data.type === 'QR_ART_RENDER') {
      ownerOrigin = event.origin; requestId = event.data.requestId;
      try { reply({type:'QR_ART_RENDERED',...render(event.data.config || {})}); }
      catch (error) { stop(); state=null; canvas.hidden=true; status.hidden=false; status.textContent='无法生成二维码'; reply({type:'QR_ART_ERROR',message:String(error.message || error)}); }
    } else if (event.data.type === 'QR_ART_PAUSE' && ownerOrigin !== null) {
      paused = event.data.paused === true; if (paused) stop(); else resume();
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else resume(); });
  window.addEventListener('pagehide',stop);
  globalThis.QRArtEmbed = {render,drawFrame,stop,getState:()=>state};
  if (parent !== window) parent.postMessage({type:'QR_ART_READY',protocol,capabilities:['bitmap-frames','qr-parameters']},'*');
})();
