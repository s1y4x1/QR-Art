// Global State
let userText = document.getElementById('text-input').value;
let eccLevel = document.getElementById('ecc-level').value;
let version = parseInt(document.getElementById('version-range').value) || 0;
let maskPattern = -1; // -1 for auto
let encodingMode = document.getElementById('encoding-mode').value;
const BINARIZE_THRESHOLD = 128;
let appendHash = false;
let bestAutoMask = 0;
let lastManualMask = 0;

// Color State
let foregroundColor = '#000000';
let backgroundColor = '#ffffff';

// Upload Info
let uploadInfo = {
    mime: null,
    name: null,
    isGif: false,
    isVideo: false,
    isAnimated: false,
    animatedType: null,
    gifFrames: null,
    gifFullFrames: null,
    gifWidth: 0,
    gifHeight: 0,
    gifBuffer: null,
    videoObjectUrl: null,
    videoDuration: 0,
    videoFps: 30,
    videoElement: null,
    firstFrameUrl: null
};

const GIF_WORKER_SOURCE = `!function(t){function e(r){if(i[r])return i[r].exports;var s=i[r]={exports:{},id:r,loaded:!1};return t[r].call(s.exports,s,s.exports,e),s.loaded=!0,s.exports}var i={};return e.m=t,e.c=i,e.p="",e(0)}([function(t,e,i){var r,s;r=i(1),s=function(t){var e,i,s,o;return e=new r(t.width,t.height),0===t.index?e.writeHeader():e.firstFrame=!1,e.setTransparent(t.transparent),e.setRepeat(t.repeat),e.setDelay(t.delay),e.setQuality(t.quality),e.setDither(t.dither),e.setGlobalPalette(t.globalPalette),e.addFrame(t.data),t.last&&e.finish(),t.globalPalette===!0&&(t.globalPalette=e.getGlobalPalette()),s=e.stream(),t.data=s.pages,t.cursor=s.cursor,t.pageSize=s.constructor.pageSize,t.canTransfer?(o=function(){var e,r,s,o;for(s=t.data,o=[],e=0,r=s.length;e<r;e++)i=s[e],o.push(i.buffer);return o}(),self.postMessage(t,o)):self.postMessage(t)},self.onmessage=function(t){return s(t.data)}},function(t,e,i){function r(){this.page=-1,this.pages=[],this.newPage()}function s(t,e){this.width=~~t,this.height=~~e,this.transparent=null,this.transIndex=0,this.repeat=-1,this.delay=0,this.image=null,this.pixels=null,this.indexedPixels=null,this.colorDepth=null,this.colorTab=null,this.neuQuant=null,this.usedEntry=new Array,this.palSize=7,this.dispose=-1,this.firstFrame=!0,this.sample=10,this.dither=!1,this.globalPalette=!1,this.out=new r}var o=i(2),n=i(3);r.pageSize=4096,r.charMap={};for(var a=0;a<256;a++)r.charMap[a]=String.fromCharCode(a);r.prototype.newPage=function(){this.pages[++this.page]=new Uint8Array(r.pageSize),this.cursor=0},r.prototype.getData=function(){for(var t="",e=0;e<this.pages.length;e++)for(var i=0;i<r.pageSize;i++)t+=r.charMap[this.pages[e][i]];return t},r.prototype.writeByte=function(t){this.cursor>=r.pageSize&&this.newPage(),this.pages[this.page][this.cursor++]=t},r.prototype.writeUTFBytes=function(t){for(var e=t.length,i=0;i<e;i++)this.writeByte(t.charCodeAt(i))},r.prototype.writeBytes=function(t,e,i){for(var r=i||t.length,s=e||0;s<r;s++)this.writeByte(t[s])},s.prototype.setDelay=function(t){this.delay=Math.round(t/10)},s.prototype.setFrameRate=function(t){this.delay=Math.round(100/t)},s.prototype.setDispose=function(t){t>=0&&(this.dispose=t)},s.prototype.setRepeat=function(t){this.repeat=t},s.prototype.setTransparent=function(t){this.transparent=t},s.prototype.addFrame=function(t){this.image=t,this.colorTab=this.globalPalette&&this.globalPalette.slice?this.globalPalette:null,this.getImagePixels(),this.analyzePixels(),this.globalPalette===!0&&(this.globalPalette=this.colorTab),this.firstFrame&&(this.writeLSD(),this.writePalette(),this.repeat>=0&&this.writeNetscapeExt()),this.writeGraphicCtrlExt(),this.writeImageDesc(),this.firstFrame||this.globalPalette||this.writePalette(),this.writePixels(),this.firstFrame=!1},s.prototype.finish=function(){this.out.writeByte(59)},s.prototype.setQuality=function(t){t<1&&(t=1),this.sample=t},s.prototype.setDither=function(t){t===!0&&(t="FloydSteinberg"),this.dither=t},s.prototype.setGlobalPalette=function(t){this.globalPalette=t},s.prototype.getGlobalPalette=function(){return this.globalPalette&&this.globalPalette.slice&&this.globalPalette.slice(0)||this.globalPalette},s.prototype.writeHeader=function(){this.out.writeUTFBytes("GIF89a")},s.prototype.analyzePixels=function(){this.colorTab||(this.neuQuant=new o(this.pixels,this.sample),this.neuQuant.buildColormap(),this.colorTab=this.neuQuant.getColormap()),this.dither?this.ditherPixels(this.dither.replace("-serpentine",""),null!==this.dither.match(/-serpentine/)):this.indexPixels(),this.pixels=null,this.colorDepth=8,this.palSize=7,null!==this.transparent&&(this.transIndex=this.findClosest(this.transparent,!0))},s.prototype.indexPixels=function(){var t=this.pixels.length/3;this.indexedPixels=new Uint8Array(t);for(var e=0,i=0;i<t;i++){var r=this.findClosestRGB(255&this.pixels[e++],255&this.pixels[e++],255&this.pixels[e++]);this.usedEntry[r]=!0,this.indexedPixels[i]=r}},s.prototype.ditherPixels=function(t,e){var i={FalseFloydSteinberg:[[3/8,1,0],[3/8,0,1],[.25,1,1]],FloydSteinberg:[[7/16,1,0],[3/16,-1,1],[5/16,0,1],[1/16,1,1]],Stucki:[[8/42,1,0],[4/42,2,0],[2/42,-2,1],[4/42,-1,1],[8/42,0,1],[4/42,1,1],[2/42,2,1],[1/42,-2,2],[2/42,-1,2],[4/42,0,2],[2/42,1,2],[1/42,2,2]],Atkinson:[[1/8,1,0],[1/8,2,0],[1/8,-1,1],[1/8,0,1],[1/8,1,1],[1/8,0,2]]};if(!t||!i[t])throw"Unknown dithering kernel: "+t;var r=i[t],s=0,o=this.height,n=this.width,a=this.pixels,h=e?-1:1;this.indexedPixels=new Uint8Array(this.pixels.length/3);for(var l=0;l<o;l++){e&&(h*=-1);for(var u=1==h?0:n-1,p=1==h?n:0;u!==p;u+=h){s=l*n+u;var f=3*s,c=a[f],y=a[f+1],w=a[f+2];f=this.findClosestRGB(c,y,w),this.usedEntry[f]=!0,this.indexedPixels[s]=f,f*=3;for(var d=this.colorTab[f],g=this.colorTab[f+1],x=this.colorTab[f+2],b=c-d,v=y-g,P=w-x,m=1==h?0:r.length-1,B=1==h?r.length:0;m!==B;m+=h){var S=r[m][1],T=r[m][2];if(S+u>=0&&S+u<n&&T+l>=0&&T+l<o){var M=r[m][0];f=s+S+T*n,f*=3,a[f]=Math.max(0,Math.min(255,a[f]+b*M)),a[f+1]=Math.max(0,Math.min(255,a[f+1]+v*M)),a[f+2]=Math.max(0,Math.min(255,a[f+2]+P*M))}}}}},s.prototype.findClosest=function(t,e){return this.findClosestRGB((16711680&t)>>16,(65280&t)>>8,255&t,e)},s.prototype.findClosestRGB=function(t,e,i,r){if(null===this.colorTab)return-1;if(this.neuQuant&&!r)return this.neuQuant.lookupRGB(t,e,i);for(var s=0,o=16777216,n=this.colorTab.length,a=0,h=0;a<n;h++){var l=t-(255&this.colorTab[a++]),u=e-(255&this.colorTab[a++]),p=i-(255&this.colorTab[a++]),f=l*l+u*u+p*p;(!r||this.usedEntry[h])&&f<o&&(o=f,s=h)}return s},s.prototype.getImagePixels=function(){var t=this.width,e=this.height;this.pixels=new Uint8Array(t*e*3);for(var i=this.image,r=0,s=0,o=0;o<e;o++)for(var n=0;n<t;n++)this.pixels[s++]=i[r++],this.pixels[s++]=i[r++],this.pixels[s++]=i[r++],r++},s.prototype.writeGraphicCtrlExt=function(){this.out.writeByte(33),this.out.writeByte(249),this.out.writeByte(4);var t,e;null===this.transparent?(t=0,e=0):(t=1,e=2),this.dispose>=0&&(e=7&dispose),e<<=2,this.out.writeByte(0|e|0|t),this.writeShort(this.delay),this.out.writeByte(this.transIndex),this.out.writeByte(0)},s.prototype.writeImageDesc=function(){this.out.writeByte(44),this.writeShort(0),this.writeShort(0),this.writeShort(this.width),this.writeShort(this.height),this.firstFrame||this.globalPalette?this.out.writeByte(0):this.out.writeByte(128|this.palSize)},s.prototype.writeLSD=function(){this.writeShort(this.width),this.writeShort(this.height),this.out.writeByte(240|this.palSize),this.out.writeByte(0),this.out.writeByte(0)},s.prototype.writeNetscapeExt=function(){this.out.writeByte(33),this.out.writeByte(255),this.out.writeByte(11),this.out.writeUTFBytes("NETSCAPE2.0"),this.out.writeByte(3),this.out.writeByte(1),this.writeShort(this.repeat),this.out.writeByte(0)},s.prototype.writePalette=function(){this.out.writeBytes(this.colorTab);for(var t=768-this.colorTab.length,e=0;e<t;e++)this.out.writeByte(0)},s.prototype.writeShort=function(t){this.out.writeByte(255&t),this.out.writeByte(t>>8&255)},s.prototype.writePixels=function(){var t=new n(this.width,this.height,this.indexedPixels,this.colorDepth);t.encode(this.out)},s.prototype.stream=function(){return this.out},t.exports=s},function(t,e){function i(t,e){function i(){z=[],E=new Int32Array(256),R=new Int32Array(s),U=new Int32Array(s),Q=new Int32Array(s>>3);var t,e;for(t=0;t<s;t++)e=(t<<n+8)/s,z[t]=new Float64Array([e,e,e,0]),U[t]=h/s,R[t]=0}function c(){for(var t=0;t<s;t++)z[t][0]>>=n,z[t][1]>>=n,z[t][2]>>=n,z[t][3]=t}function w(t,e,i,r,s){z[e][0]-=t*(z[e][0]-i)/b,z[e][1]-=t*(z[e][1]-r)/b,z[e][2]-=t*(z[e][2]-s)/b}function x(t,e,i,r,o){for(var n,a,h=Math.abs(e-t),l=Math.min(e+t,s),u=e+1,p=e-1,f=1;u<l||p>h;)a=Q[f++],u<l&&(n=z[u++],n[0]-=a*(n[0]-i)/B,n[1]-=a*(n[1]-r)/B,n[2]-=a*(n[2]-o)/B),p>h&&(n=z[p--],n[0]-=a*(n[0]-i)/B,n[1]-=a*(n[1]-r)/B,n[2]-=a*(n[2]-o)/B)}function v(t,e,i){t=0|t,e=0|e,i=0|i;var r,o,h,c,y,w=~(1<<31),d=w,g=-1,x=g;for(r=0;r<s;r++)o=z[r],h=Math.abs((0|o[0])-t)+Math.abs((0|o[1])-e)+Math.abs((0|o[2])-i)|0,h<w&&(w=h,g=r),c=h-((0|R[r])>>a-n),c<d&&(d=c,x=r),y=U[r]>>u,U[r]-=y,R[r]+=y<<l;return U[g]+=p,R[g]-=f,x}function m(){var t,e,i,r,n,a,h=0,l=0;for(t=0;t<s;t++){for(i=z[t],n=t,a=i[1],e=t+1;e<s;e++)r=z[e],r[1]<a&&(n=e,a=r[1]);if(r=z[n],t!=n&&(e=r[0],r[0]=i[0],i[0]=e,e=r[1],r[1]=i[1],i[1]=e,e=r[2],r[2]=i[2],i[2]=e,e=r[3],r[3]=i[3],i[3]=e),a!=h){for(E[h]=l+t>>1,e=h+1;e<a;e++)E[e]=t;h=a,l=t}}for(E[h]=l+o>>1,e=h+1;e<256;e++)E[e]=o}function C(t,e,i){t=0|t,e=0|e,i=0|i;for(var r,o,n,a=1e3,h=-1,l=0|E[e],u=l-1;l<s||u>=0;)l<s&&(o=z[l],n=(0|o[1])-e,n>=a?l=s:(l++,n<0&&(n=-n),r=(0|o[0])-t,r<0&&(r=-r),n+=r,n<a&&(r=(0|o[2])-i,r<0&&(r=-r),n+=r,n<a&&(a=n,h=0|o[3])))),u>=0&&(o=z[u],n=e-(0|o[1]),n>=a?u=-1:(u--,n<0&&(n=-n),r=(0|o[0])-t,r<0&&(r=-r),n+=r,n<a&&(r=(0|o[2])-i,r<0&&(r=-r),n+=r,n<a&&(a=n,h=0|o[3]))));return h}function I(){var i,s=t.length,o=30+(e-1)/3,a=s/(3*e),h=~~(a/r),l=b,u=d,p=u>>y;for(p<=1&&(p=0),i=0;i<p;i++)Q[i]=l*((p*p-i*i)*P/(p*p));var f;s<A?(e=1,f=3):f=s%S!==0?3*S:s%T!==0?3*T:s%M!==0?3*F:3*F;var c,m,B,C,I=0;for(i=0;i<a;)if(c=(255&t[I])<<n,m=(255&t[I+1])<<n,B=(255&t[I+2])<<n,C=v(c,m,B),w(l,C,c,m,B),0!==p&&x(p,C,c,m,B),I+=f,I>=s&&(I-=s),i++,0===h&&(h=1),i%h===0)for(l-=l/o,u-=u/g,p=u>>y,p<=1&&(p=0),C=0;C<p;C++)Q[C]=l*((p*p-C*C)*P/(p*p))}function D(){i(),I(),c(),m()}function G(){for(var t=[],e=[],i=0;i<s;i++)e[z[i][3]]=i;for(var r=0,o=0;o<s;o++){var n=e[o];t[r++]=z[n][0],t[r++]=z[n][1],t[r++]=z[n][2]}return t}var z,E,R,U,Q;this.buildColormap=D,this.getColormap=G,this.lookupRGB=C}var r=100,s=256,o=s-1,n=4,a=16,h=1<<a,l=10,u=10,p=h>>u,f=h<<l-u,c=s>>3,y=6,w=1<<y,d=c*w,g=30,x=10,b=1<<x,v=8,P=1<<v,m=x+v,B=1<<m,S=499,T=491,M=487,F=503,A=3*F;t.exports=i},function(t,e){function i(t,e,i,a){function h(t,e){S[x++]=t,x>=254&&c(e)}function l(t){u(o),A=P+2,C=!0,d(P,t)}function u(t){for(var e=0;e<t;++e)T[e]=-1}function p(t,e){var i,n,a,h,p,f,c;for(v=t,C=!1,n_bits=v,b=y(n_bits),P=1<<t-1,m=P+1,A=P+2,x=0,h=w(),c=0,i=o;i<65536;i*=2)++c;c=8-c,f=o,u(f),d(P,e);t:for(;(n=w())!=r;)if(i=(n<<s)+h,a=n<<c^h,T[a]!==i){if(T[a]>=0){p=f-a,0===a&&(p=1);do if((a-=p)<0&&(a+=f),T[a]===i){h=M[a];continue t}while(T[a]>=0)}d(h,e),h=n,A<1<<s?(M[a]=A++,T[a]=i):l(e)}else h=M[a];d(h,e),d(m,e)}function f(i){i.writeByte(B),remaining=t*e,curPixel=0,p(B+1,i),i.writeByte(0)}function c(t){x>0&&(t.writeByte(x),t.writeBytes(S,0,x),x=0)}function y(t){return(1<<t)-1}function w(){if(0===remaining)return r;--remaining;var t=i[curPixel++];return 255&t}function d(t,e){for(g&=n[F],F>0?g|=t<<F:g=t,F+=n_bits;F>=8;)h(255&g,e),g>>=8,F-=8;if((A>b||C)&&(C?(b=y(n_bits=v),C=!1):(++n_bits,b=n_bits==s?1<<s:y(n_bits))),t==m){for(;F>0;)h(255&g,e),g>>=8,F-=8;c(e)}}var g,x,b,v,P,m,B=Math.max(2,a),S=new Uint8Array(256),T=new Int32Array(o),M=new Int32Array(o),F=0,A=0,C=!1;this.encode=f}var r=-1,s=12,o=5003,n=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535];t.exports=i}]);
//# sourceMappingURL=gif.worker.js.map`;
let gifWorkerBlobUrl = null;

function getGifWorkerScriptUrl() {
    if (!gifWorkerBlobUrl) {
        const blob = new Blob([GIF_WORKER_SOURCE], { type: 'application/javascript' });
        gifWorkerBlobUrl = URL.createObjectURL(blob);
    }
    return gifWorkerBlobUrl;
}

function ensureGifPreviewCanvas(width, height) {
    if (!gifPreviewCanvas) {
        gifPreviewCanvas = document.createElement('canvas');
        gifPreviewCtx = gifPreviewCanvas.getContext('2d', { willReadFrequently: true });
    }
    gifPreviewCanvas.width = width;
    gifPreviewCanvas.height = height;
}

function createGifFrameRenderer(ctx, canvas) {
    let prevFrame = null;
    let prevRestore = null;

    return {
        reset() {
            prevFrame = null;
            prevRestore = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        draw(frame) {
            if (prevFrame) {
                if (prevFrame.disposalType === 2) {
                    ctx.clearRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
                } else if (prevFrame.disposalType === 3 && prevRestore) {
                    ctx.putImageData(prevRestore, 0, 0);
                }
            }

            let restoreCurrent = null;
            if (frame.disposalType === 3) {
                restoreCurrent = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }

            const w = frame.dims.width;
            const h = frame.dims.height;
            const dest = ctx.getImageData(frame.dims.left, frame.dims.top, w, h);
            const dd = dest.data;
            const sd = frame.patch;

            for (let i = 0; i < sd.length; i += 4) {
                const sa = sd[i + 3] / 255;
                if (sa <= 0) continue;

                if (sa >= 1) {
                    dd[i] = sd[i];
                    dd[i + 1] = sd[i + 1];
                    dd[i + 2] = sd[i + 2];
                    dd[i + 3] = 255;
                    continue;
                }

                const da = dd[i + 3] / 255;
                const outA = sa + da * (1 - sa);
                if (outA <= 0) {
                    dd[i] = 0;
                    dd[i + 1] = 0;
                    dd[i + 2] = 0;
                    dd[i + 3] = 0;
                    continue;
                }

                dd[i] = Math.round((sd[i] * sa + dd[i] * da * (1 - sa)) / outA);
                dd[i + 1] = Math.round((sd[i + 1] * sa + dd[i + 1] * da * (1 - sa)) / outA);
                dd[i + 2] = Math.round((sd[i + 2] * sa + dd[i + 2] * da * (1 - sa)) / outA);
                dd[i + 3] = Math.round(outA * 255);
            }

            ctx.putImageData(dest, frame.dims.left, frame.dims.top);

            prevFrame = frame;
            prevRestore = restoreCurrent;
        }
    };
}

function getGifFrameDelayMs(frame) {
    if (!frame) return 100;
    if (typeof frame.delayMs === 'number') return Math.max(10, frame.delayMs);
    if (typeof frame.delayTime === 'number') return Math.max(10, frame.delayTime);
    const d = typeof frame.delay === 'number' ? frame.delay : 10;
    if (d <= 0) return 10;
    if (d <= 50) return Math.max(10, d * 10);
    return Math.max(10, d);
}

function drawFullFrameToCanvas(fullFrame, ctx, canvas) {
    if (!fullFrame || !fullFrame.rgba) return;
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    imgData.data.set(fullFrame.rgba);
    ctx.putImageData(imgData, 0, 0);
}

function stopGifPreview() {
    previewSessionToken += 1;
    computeCancelRequested = true;
    if (gifPreviewTimer) {
        clearTimeout(gifPreviewTimer);
        gifPreviewTimer = null;
    }
    gifPreviewRunning = false;
    if (videoPreviewRafId) {
        cancelAnimationFrame(videoPreviewRafId);
        videoPreviewRafId = null;
    }
    videoPreviewRunning = false;
    if (uploadInfo && uploadInfo.videoElement) {
        uploadInfo.videoElement.pause();
    }
}

function cleanupVideoObjectUrl() {
    if (uploadInfo && uploadInfo.videoObjectUrl) {
        URL.revokeObjectURL(uploadInfo.videoObjectUrl);
        uploadInfo.videoObjectUrl = null;
    }
}

function seekVideo(video, timeSec, timeoutMs = 2500) {
    return new Promise((resolve, reject) => {
        if (!video) {
            reject(new Error('video is null'));
            return;
        }
        let settled = false;
        let timer = null;
        const done = (ok, err) => {
            if (settled) return;
            settled = true;
            if (timer) clearTimeout(timer);
            cleanup();
            if (ok) resolve();
            else reject(err || new Error('video seek failed'));
        };
        const onSeeked = () => {
            done(true);
        };
        const onError = () => {
            done(false, new Error('video seek failed'));
        };
        const cleanup = () => {
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', onError);
        };
        video.addEventListener('seeked', onSeeked, { once: true });
        video.addEventListener('error', onError, { once: true });
        const safeDuration = getSafeVideoDuration(video, 0);
        const maxTime = safeDuration > 0 ? Math.max(0, safeDuration - 0.001) : Math.max(0, Number(timeSec) || 0);
        const targetTime = Math.max(0, Math.min(Number(timeSec) || 0, maxTime));
        if (Math.abs((Number(video.currentTime) || 0) - targetTime) < 0.0005) {
            done(true);
            return;
        }
        timer = setTimeout(() => {
            // 某些浏览器后台时 seeked 事件会被延迟/丢失，超时后继续流程避免卡死。
            done(true);
        }, Math.max(500, timeoutMs || 2500));
        video.currentTime = targetTime;
    });
}

function getSafeVideoDuration(video, fallback = 0) {
    if (video) {
        const d = Number(video.duration);
        if (Number.isFinite(d) && d > 0) return d;
        try {
            if (video.seekable && video.seekable.length > 0) {
                const end = Number(video.seekable.end(video.seekable.length - 1));
                if (Number.isFinite(end) && end > 0) return end;
            }
        } catch (_) {}
    }
    const fb = Number(fallback);
    return (Number.isFinite(fb) && fb > 0) ? fb : 0;
}

function waitNextVideoFrame(video, timeoutMs = 1200) {
    return new Promise((resolve) => {
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            resolve();
        };

        const timer = setTimeout(() => {
            done();
        }, Math.max(100, timeoutMs));

        if (video && typeof video.requestVideoFrameCallback === 'function') {
            video.requestVideoFrameCallback(() => {
                clearTimeout(timer);
                done();
            });
            return;
        }

        const raf = requestAnimationFrame(() => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
            done();
        });
    });
}

function waitForVideoClockAdvance(video, previousTimeSec, timeoutMs = 5000) {
    return new Promise((resolve) => {
        let settled = false;
        const done = () => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve();
        };
        const onTick = () => {
            const ct = Math.max(0, Number(video && video.currentTime) || 0);
            if ((video && video.ended) || ct > previousTimeSec + 0.0005) {
                done();
            }
        };
        const cleanup = () => {
            if (!video) return;
            video.removeEventListener('timeupdate', onTick);
            video.removeEventListener('ended', onTick);
            if (timer) clearTimeout(timer);
        };

        const timer = setTimeout(() => {
            done();
        }, Math.max(1000, timeoutMs));

        if (video) {
            video.addEventListener('timeupdate', onTick);
            video.addEventListener('ended', onTick);
            if (typeof video.requestVideoFrameCallback === 'function') {
                video.requestVideoFrameCallback(() => {
                    onTick();
                    done();
                });
            }
        }

        onTick();
    });
}

async function cooperativeYield() {
    if (typeof document !== 'undefined' && !!document.hidden) {
        await Promise.resolve();
        return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
}

function waitForVideoDataReady(video, timeoutMs = 2000) {
    return new Promise((resolve) => {
        if (!video) {
            resolve();
            return;
        }
        if ((video.readyState || 0) >= 2) {
            resolve();
            return;
        }

        let settled = false;
        let timer = null;
        const done = () => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve();
        };
        const cleanup = () => {
            video.removeEventListener('loadeddata', done);
            video.removeEventListener('canplay', done);
            if (timer) clearTimeout(timer);
        };

        video.addEventListener('loadeddata', done, { once: true });
        video.addEventListener('canplay', done, { once: true });
        timer = setTimeout(done, Math.max(500, timeoutMs || 2000));
    });
}

async function extractVideoFirstFrame(video) {
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (width <= 0 || height <= 0) return null;
    const firstCanvas = document.createElement('canvas');
    firstCanvas.width = width;
    firstCanvas.height = height;
    const fctx = firstCanvas.getContext('2d', { willReadFrequently: true });

    await waitForVideoDataReady(video, 2200);
    await seekVideo(video, 0, 3000);
    await waitNextVideoFrame(video, 1000);
    fctx.clearRect(0, 0, width, height);
    fctx.drawImage(video, 0, 0, width, height);

    const p = fctx.getImageData(0, 0, 1, 1).data;
    if (p[3] <= 1) {
        const probeTime = Math.min(0.04, Math.max(0, getSafeVideoDuration(video, 0) - 0.001));
        await seekVideo(video, probeTime, 1200);
        await waitNextVideoFrame(video, 800);
        await seekVideo(video, 0, 1200);
        await waitNextVideoFrame(video, 800);
        fctx.clearRect(0, 0, width, height);
        fctx.drawImage(video, 0, 0, width, height);
    }

    return firstCanvas.toDataURL('image/png');
}

async function processSingleFrameCanvas(frameCanvas, isExport = false) {
    const prevBytes = [...currentSuffixBytes];
    if (lastWhitenMode === 'white') {
        setSuffixUniform(0);
    } else if (lastWhitenMode === 'black') {
        setSuffixUniform(1);
    }
    optimizationImageSourceOverride = frameCanvas;
    try {
        await applyImport(false, frameCanvas, true);
        renderQR(isExport, frameCanvas);
        const frameBytes = [...currentSuffixBytes];
        const frameStats = lastArtisticSolveStats ? { ...lastArtisticSolveStats } : null;
        return {
            qrSnapshot: snapshotQrDarkMatrix(generatedQR),
            suffixBytes: frameBytes,
            artisticStats: frameStats
        };
    } finally {
        optimizationImageSourceOverride = null;
        currentSuffixBytes = prevBytes;
    }
}

window.qrArtistProcessSingleFrame = processSingleFrameCanvas;

function getAutoCellSizeCandidate() {
    if (isImageBasisMode()) {
        if (!generatedQR || !previewImg) return null;
        const imgW = previewImg.naturalWidth || previewImg.width || 0;
        if (imgW <= 0) return null;
        const modules = generatedQR.getModuleCount() + 2 * qrMargin;
        if (modules <= 0) return null;
        return Math.max(0.1, Math.round((imgW / modules) * 10) / 10);
    }
    if (!importState.active || !previewImg) return null;
    const imgW = previewImg.naturalWidth || previewImg.width || 0;
    const imgH = previewImg.naturalHeight || previewImg.height || 0;
    if (imgW === 0 || imgH === 0) return null;
    if (!generatedQR) return null;

    const ovStyle = window.getComputedStyle(importOverlay);
    const ovBorderLeft = parseFloat(ovStyle.borderLeftWidth) || 0;
    const ovBorderRight = parseFloat(ovStyle.borderRightWidth) || 0;
    const currentContentW = Math.max(0, importState.width - ovBorderLeft - ovBorderRight);
    if (currentContentW <= 0) return null;

    const zoom = zoomLevel || 1;
    const outputImageW = currentContentW / zoom;
    const scale = imgW / outputImageW;
    if (!Number.isFinite(scale) || scale <= 0) return null;

    const targetSize = Math.max(0.1, Math.round(CELL_SIZE * scale * 10) / 10);
    return targetSize;
}

function updateAutoCellSizeButtonLabel() {
    if (!cellSizeAutoBtn) return;
    if (!importState.active || !hasImageUpload) return;
    const candidate = getAutoCellSizeCandidate();
    if (!candidate) return;
    cellSizeAutoBtn.textContent = `自动(${candidate.toFixed(1)})`;
}

function refreshCellSizeAutoButtonVisibility() {
    if (!cellSizeAutoBtn) return;
    const show = !!(hasImageUpload && !isImageBasisMode());
    cellSizeAutoBtn.style.display = show ? 'inline-flex' : 'none';
    if (show) updateAutoCellSizeButtonLabel();
}

function setStaticGifPreview() {
    if (uploadInfo && uploadInfo.isVideo && uploadInfo.firstFrameUrl) {
        previewImg.src = uploadInfo.firstFrameUrl;
        return;
    }
    if (!uploadInfo || !uploadInfo.gifFrames || !uploadInfo.gifFrames.length) return;
    const width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    const height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    ensureGifPreviewCanvas(width, height);
    gifPreviewCtx.clearRect(0, 0, width, height);
    if (uploadInfo.gifFullFrames && uploadInfo.gifFullFrames.length) {
        drawFullFrameToCanvas(uploadInfo.gifFullFrames[0], gifPreviewCtx, gifPreviewCanvas);
    } else {
        const renderer = createGifFrameRenderer(gifPreviewCtx, gifPreviewCanvas);
        renderer.reset();
        const firstFrame = uploadInfo.gifFrames[0];
        renderer.draw(firstFrame);
    }
    previewImg.src = gifPreviewCanvas.toDataURL('image/png');
}

async function startVideoPreview(token = previewSessionToken) {
    if (!uploadInfo || !uploadInfo.isVideo || !uploadInfo.videoElement || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
    const artisticOn = !!(artisticModeCb && artisticModeCb.checked);
    if (artisticOn) {
        const probeVideo = uploadInfo.videoElement;
        const width = probeVideo.videoWidth || uploadInfo.gifWidth || 0;
        const height = probeVideo.videoHeight || uploadInfo.gifHeight || 0;
        if (width > 0 && height > 0) {
            const probeCanvas = document.createElement('canvas');
            probeCanvas.width = width;
            probeCanvas.height = height;
            const pctx = probeCanvas.getContext('2d', { willReadFrequently: true });
            try {
                await seekVideo(probeVideo, 0);
            } catch (_) {}
            pctx.drawImage(probeVideo, 0, 0, width, height);
            const touchEc = doesFrameTouchEcRegion(probeCanvas);
            if (!touchEc) {
                await startLiveVideoPreview(token);
                return;
            }
        }
    }

    if (!artisticOn) {
        await startLiveVideoPreview(token);
        return;
    }
    const cache = await processVideoFramesForPreview('正在逐帧计算动态预览', { forExport: false, artisticOn: true });
    if (token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
    if (!cache || !cache.frames || !cache.frames.length) {
        dynamicPreviewCb.checked = false;
        return;
    }
    startRenderedFramePreview(cache, token);
}

function doesFrameTouchEcRegion(imageSource) {
    if (!imageSource || !pixelMap || !pixelMap.length || !importState.active) return false;
    const source = getSourceDimensions(imageSource);
    const sourceW = source.width;
    const sourceH = source.height;
    if (sourceW <= 0 || sourceH <= 0) return false;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = sourceW;
    tmpCanvas.height = sourceH;
    const tCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    tCtx.drawImage(imageSource, 0, 0, sourceW, sourceH);
    const imgData = tCtx.getImageData(0, 0, sourceW, sourceH);

    const basisMode = isImageBasisMode();
    const qrSize = pixelMap.length;
    const totalModulesVisual = qrSize + 2 * qrMargin;
    let qrStartX = 0;
    let qrStartY = 0;
    let moduleW = CELL_SIZE;
    let moduleH = CELL_SIZE;
    let imageBoxX = 0;
    let imageBoxY = 0;
    let imageBoxW = Math.max(1, canvas.width);
    let imageBoxH = Math.max(1, canvas.height);

    if (basisMode) {
        const basisBox = getBasisQrBoxInternal();
        qrStartX = basisBox.x;
        qrStartY = basisBox.y;
        moduleW = basisBox.width / totalModulesVisual;
        moduleH = basisBox.height / totalModulesVisual;
    } else {
        const displayW = parseFloat(canvas.style.width) || canvas.width;
        const displayH = parseFloat(canvas.style.height) || canvas.height;
        const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
        imageBoxX = box.x;
        imageBoxY = box.y;
        imageBoxW = Math.max(1, box.width);
        imageBoxH = Math.max(1, box.height);
    }

    for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
            const cell = pixelMap[r][c];
            if (!cell || cell.type !== 'ec') continue;

            const cx = qrStartX + (c + qrMargin) * moduleW + (moduleW / 2);
            const cy = qrStartY + (r + qrMargin) * moduleH + (moduleH / 2);

            const localX = Math.floor(((cx - imageBoxX) / imageBoxW) * sourceW);
            const localY = Math.floor(((cy - imageBoxY) / imageBoxH) * sourceH);
            if (localX < 0 || localY < 0 || localX >= sourceW || localY >= sourceH) continue;

            const idx = (localY * sourceW + localX) * 4;
            if (imgData.data[idx + 3] > 10) {
                return true;
            }
        }
    }
    return false;
}

async function startLiveVideoPreview(token = previewSessionToken) {
    if (!uploadInfo || !uploadInfo.isVideo || !uploadInfo.videoElement || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
    const video = uploadInfo.videoElement;
    const width = video.videoWidth || uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    const height = video.videoHeight || uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    if (width <= 0 || height <= 0) return;

    ensureGifPreviewCanvas(width, height);
    videoPreviewRunning = true;
    const originalBytes = [...currentSuffixBytes];
    let processingFrame = false;
    let lastVideoTime = -1;

    try {
        video.loop = true;
        video.playbackRate = 1;
        video.currentTime = 0;
        await video.play();
    } catch (_) {
        try {
            await seekVideo(video, 0);
        } catch (_) {
            return;
        }
    }

    function scheduleNext() {
        if (!videoPreviewRunning || token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
        videoPreviewRafId = requestAnimationFrame(() => {
            tick();
        });
    }

    async function tick() {
        if (!videoPreviewRunning || token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;

        if (processingFrame) {
            scheduleNext();
            return;
        }

        const nowTime = Math.max(0, Number(video.currentTime) || 0);
        if (!video.ended && Math.abs(nowTime - lastVideoTime) < 0.0005) {
            scheduleNext();
            return;
        }

        processingFrame = true;
        try {
            gifPreviewCtx.clearRect(0, 0, width, height);
            gifPreviewCtx.drawImage(video, 0, 0, width, height);

            currentSuffixBytes = [...originalBytes];
            if (lastWhitenMode === 'white') {
                setSuffixUniform(0);
            } else if (lastWhitenMode === 'black') {
                setSuffixUniform(1);
            }
            await applyImport(false, gifPreviewCanvas, false, { skipArtisticPass: true });
            renderQR(false, gifPreviewCanvas);
            if (previewImg) {
                previewImg.src = gifPreviewCanvas.toDataURL('image/png');
            }
            lastVideoTime = nowTime;
        } finally {
            processingFrame = false;
        }

        if (video.ended) {
            try {
                video.currentTime = 0;
                await video.play();
                lastVideoTime = -1;
            } catch (_) {}
        }

        scheduleNext();
    }

    scheduleNext();
}

function startRenderedFramePreview(cache, token = previewSessionToken) {
    if (!cache || !cache.frames || !cache.frames.length) return;
    gifPreviewIndex = 0;
    gifPreviewRunning = true;

    const tick = () => {
        if (!gifPreviewRunning || token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
        const item = cache.frames[gifPreviewIndex];
        if (item && item.imageData) {
            ctx.putImageData(item.imageData, 0, 0);
            updateArtisticWarning(item.artisticStats || null);
        }
        gifPreviewIndex = (gifPreviewIndex + 1) % cache.frames.length;
        gifPreviewTimer = setTimeout(tick, item && item.delay ? item.delay : 33);
    };
    tick();
}

async function processVideoFramesForPreview(reason = '正在处理视频帧', options = {}) {
    if (!uploadInfo || !uploadInfo.isVideo || !uploadInfo.videoObjectUrl) return null;
    const forExport = !!options.forExport;
    const artisticOn = options.artisticOn !== undefined
        ? !!options.artisticOn
        : !!(artisticModeCb && artisticModeCb.checked);
    const cacheKey = `${getAnimatedArtCacheKey()}::video-${forExport ? 'export' : 'preview'}::${artisticOn ? 'art' : 'plain'}`;
    if (animatedArtCache && animatedArtCache.key === cacheKey && animatedArtCache.frames && animatedArtCache.frames.length) {
        return animatedArtCache;
    }

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.src = uploadInfo.videoObjectUrl;
    await new Promise((resolve, reject) => {
        const onLoaded = () => {
            cleanup();
            resolve();
        };
        const onError = () => {
            cleanup();
            reject(new Error('视频加载失败'));
        };
        const cleanup = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
        };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
        video.addEventListener('error', onError, { once: true });
    });

    const width = video.videoWidth || uploadInfo.gifWidth || 0;
    const height = video.videoHeight || uploadInfo.gifHeight || 0;
    if (width <= 0 || height <= 0) return null;

    const fps = Math.max(1, Math.min(60, Math.round(uploadInfo.videoFps || 30)));
    const duration = Math.max(0.01, getSafeVideoDuration(video, uploadInfo.videoDuration || 0.01));
    uploadInfo.videoDuration = duration;
    const totalFrames = Math.max(1, Math.floor(duration * fps));
    const delay = Math.max(10, Math.round(1000 / fps));
    const shouldShowProgress = forExport ? true : (artisticOn && totalFrames > 20);
    const showFrameProgress = forExport ? artisticOn : (artisticOn && totalFrames > 20);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = width;
    frameCanvas.height = height;
    const fctx = frameCanvas.getContext('2d', { willReadFrequently: true });

    const frames = [];
    const originalBytes = [...currentSuffixBytes];
    computeCancelRequested = false;
    suppressComputeOverlay = shouldShowProgress || artisticOn;
    const frameEpsilon = 1 / Math.max(120, fps * 4);
    if (shouldShowProgress) {
        showComputeOverlay('计算中...', reason, { showFrameProgress });
        setComputeProgress(0, totalFrames);
        if (showFrameProgress) {
            setFrameComputeProgress(0, 1);
        }
    }

    try {
        try { video.pause(); } catch (_) {}

        for (let i = 0; i < totalFrames; i++) {
            if (computeCancelRequested) return null;
            if (shouldShowProgress) {
                if (computeSubtitle) computeSubtitle.textContent = reason;
                if (showFrameProgress) {
                    setFrameComputeProgress(0, 1);
                }
            }

            const targetTime = Math.min(Math.max(0, duration - frameEpsilon), i / fps);
            await seekVideo(video, targetTime);

            if (computeCancelRequested) return null;
            fctx.clearRect(0, 0, width, height);
            fctx.drawImage(video, 0, 0, width, height);

            const capturedTime = Math.min(duration, Math.max(0, Number(video.currentTime) || targetTime));

            if (artisticOn) {
                animatedFrameProgressContext = { frameIndex: i, totalFrames };
                await processSingleFrameCanvas(frameCanvas, forExport);
                animatedFrameProgressContext = null;
            } else {
                currentSuffixBytes = [...originalBytes];
                if (lastWhitenMode === 'white') {
                    setSuffixUniform(0);
                } else if (lastWhitenMode === 'black') {
                    setSuffixUniform(1);
                }
                await applyImport(false, frameCanvas, false, { skipArtisticPass: true });
                renderQR(forExport, frameCanvas);
            }
            if (computeCancelRequested) return null;
            frames.push({
                imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
                delay,
                timeSec: capturedTime,
                artisticStats: lastArtisticSolveStats ? { ...lastArtisticSolveStats } : null
            });

            if (shouldShowProgress) {
                if (showFrameProgress) {
                    setFrameComputeProgress(1, 1);
                }
                setComputeProgress(i + 1, totalFrames);
            }
        }

        animatedArtCache = { key: cacheKey, frames };
        return animatedArtCache;
    } finally {
        try { video.pause(); } catch (_) {}
        currentSuffixBytes = [...originalBytes];
        animatedFrameProgressContext = null;
        suppressComputeOverlay = false;
        renderQR(false);
        if (shouldShowProgress) hideComputeOverlay();
    }
}

function getAnimatedArtCacheKey() {
    const precise = (value) => Number(Number(value || 0).toFixed(4));
    return JSON.stringify({
        version,
        eccLevel,
        maskPattern,
        userText,
        encodingMode,
        appendHash,
        cell: CELL_SIZE,
        fg: foregroundColor,
        bg: backgroundColor,
        art: !!(artisticModeCb && artisticModeCb.checked),
        covered: !!(allowCoveredFreedomCb && allowCoveredFreedomCb.checked),
        basis: isImageBasisMode(),
        importActive: !!importState.active,
        importW: precise(importState.width),
        importH: precise(importState.height),
        importX: precise(importState.relX),
        importY: precise(importState.relY),
        frames: uploadInfo && uploadInfo.gifFrames ? uploadInfo.gifFrames.length : 0,
        isVideo: !!(uploadInfo && uploadInfo.isVideo),
        videoDuration: precise(uploadInfo && uploadInfo.videoDuration ? uploadInfo.videoDuration : 0),
        videoFps: precise(uploadInfo && uploadInfo.videoFps ? uploadInfo.videoFps : 0)
    });
}

function invalidateAnimatedArtCache() {
    animatedArtCache = null;
}

function shouldDirectAnimatedRecompute() {
    return !!(
        dynamicPreviewCb &&
        dynamicPreviewCb.checked &&
        uploadInfo &&
        uploadInfo.isAnimated &&
        ((uploadInfo.gifFrames && uploadInfo.gifFrames.length) || uploadInfo.isVideo) &&
        artisticModeCb &&
        artisticModeCb.checked &&
        hasImageUpload &&
        importState.active
    );
}

async function restartDynamicPreviewWithRecompute() {
    if (!dynamicPreviewCb || !dynamicPreviewCb.checked) return;
    if (!uploadInfo || !uploadInfo.isAnimated) return;
    if (!uploadInfo.isVideo && (!uploadInfo.gifFrames || !uploadInfo.gifFrames.length)) return;
    const nonce = ++dynamicPreviewRestartNonce;
    stopGifPreview();
    invalidateAnimatedArtCache();
    await startGifPreview();
    if (nonce !== dynamicPreviewRestartNonce) return;
}

function snapshotQrDarkMatrix(qr) {
    if (!qr || typeof qr.getModuleCount !== 'function' || typeof qr.isDark !== 'function') {
        return null;
    }
    const count = qr.getModuleCount();
    const matrix = new Array(count);
    for (let r = 0; r < count; r++) {
        const row = new Array(count);
        for (let c = 0; c < count; c++) {
            row[c] = !!qr.isDark(r, c);
        }
        matrix[r] = row;
    }
    return { count, matrix };
}

function createQrFromSnapshot(snapshot) {
    if (!snapshot || !snapshot.matrix || !snapshot.count) return null;
    return {
        getModuleCount: () => snapshot.count,
        isDark: (r, c) => !!(snapshot.matrix[r] && snapshot.matrix[r][c])
    };
}

async function processAnimatedFramesForArt(reason = '正在处理动图帧') {
    if (!uploadInfo || !uploadInfo.isAnimated || !uploadInfo.gifFrames || !uploadInfo.gifFrames.length) return null;

    const cacheKey = getAnimatedArtCacheKey();
    if (animatedArtCache && animatedArtCache.key === cacheKey && animatedArtCache.frames && animatedArtCache.frames.length === uploadInfo.gifFrames.length) {
        return animatedArtCache;
    }
    const totalFrames = uploadInfo.gifFrames.length;

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    frameCanvas.height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    const fctx = frameCanvas.getContext('2d', { willReadFrequently: true });
    const frameRenderer = createGifFrameRenderer(fctx, frameCanvas);
    frameRenderer.reset();

    const originalBytes = [...currentSuffixBytes];
    const originalQrSnapshot = snapshotQrDarkMatrix(generatedQR);
    const frames = [];
    computeCancelRequested = false;
    showComputeOverlay('计算中...', reason, { showFrameProgress: true });
    setComputeProgress(0, totalFrames);
    setFrameComputeProgress(0, 1);

    suppressComputeOverlay = true;
    try {
        for (let idx = 0; idx < totalFrames; idx++) {
            if (computeCancelRequested) return null;
            if (computeSubtitle) computeSubtitle.textContent = reason;
            setFrameComputeProgress(0, 1);

            const frame = uploadInfo.gifFrames[idx];
            const fullFrame = uploadInfo.gifFullFrames && uploadInfo.gifFullFrames[idx];
            if (fullFrame) {
                drawFullFrameToCanvas(fullFrame, fctx, frameCanvas);
            } else {
                frameRenderer.draw(frame);
            }

            currentSuffixBytes = [...originalBytes];
            if (lastWhitenMode === 'white') {
                setSuffixUniform(0);
            } else if (lastWhitenMode === 'black') {
                setSuffixUniform(1);
            }

            animatedFrameProgressContext = { frameIndex: idx, totalFrames };
            optimizationImageSourceOverride = frameCanvas;
            await applyImport(false, frameCanvas, true);
            if (computeCancelRequested) return null;

            const frameStats = lastArtisticSolveStats
                ? {
                    ...lastArtisticSolveStats,
                    hasTargets: !!lastArtisticSolveStats.hasTargets,
                    remainingMismatch: Number(lastArtisticSolveStats.remainingMismatch || 0),
                    totalTargets: Number(lastArtisticSolveStats.totalTargets || 0),
                    coveredFreedomUsed: Number(lastArtisticSolveStats.coveredFreedomUsed || 0)
                }
                : null;

            frames.push({
                suffixBytes: [...currentSuffixBytes],
                qrSnapshot: snapshotQrDarkMatrix(generatedQR),
                artisticStats: frameStats,
                delay: fullFrame ? Math.max(10, fullFrame.delay || 10) : getGifFrameDelayMs(frame)
            });
            setComputeProgress(idx + 1, totalFrames);
            setFrameComputeProgress(1, 1);
            animatedFrameProgressContext = null;
        }

        animatedArtCache = { key: cacheKey, frames };
        return animatedArtCache;
    } finally {
        optimizationImageSourceOverride = null;
        suppressComputeOverlay = false;
        animatedFrameProgressContext = null;
        currentSuffixBytes = [...originalBytes];
        const restoredQr = createQrFromSnapshot(originalQrSnapshot);
        if (restoredQr) {
            generatedQR = restoredQr;
        }
        renderQR(false);
        hideComputeOverlay();
    }
}

function startCachedGifPreview(cache, token = previewSessionToken) {
    if (!cache || !cache.frames || !cache.frames.length) return;
    const width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    const height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    ensureGifPreviewCanvas(width, height);
    const renderer = createGifFrameRenderer(gifPreviewCtx, gifPreviewCanvas);
    renderer.reset();
    gifPreviewIndex = 0;
    gifPreviewRunning = true;

    const tick = () => {
        if (!gifPreviewRunning || token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
        const frame = uploadInfo.gifFrames[gifPreviewIndex];
        const fullFrame = uploadInfo.gifFullFrames && uploadInfo.gifFullFrames[gifPreviewIndex];
        if (fullFrame) {
            drawFullFrameToCanvas(fullFrame, gifPreviewCtx, gifPreviewCanvas);
        } else {
            renderer.draw(frame);
        }

        const item = cache.frames[gifPreviewIndex];
        const prevQr = generatedQR;
        const prevBytes = currentSuffixBytes;
        const frameQr = createQrFromSnapshot(item.qrSnapshot);
        if (frameQr) {
            generatedQR = frameQr;
        }
        currentSuffixBytes = item.suffixBytes ? [...item.suffixBytes] : prevBytes;
        renderQR(false, gifPreviewCanvas);
        updateArtisticWarning(item.artisticStats || null);
        generatedQR = prevQr;
        currentSuffixBytes = prevBytes;

        if (previewImg) previewImg.src = gifPreviewCanvas.toDataURL('image/png');
        gifPreviewIndex = (gifPreviewIndex + 1) % cache.frames.length;
        gifPreviewTimer = setTimeout(tick, item.delay || 80);
    };
    tick();
}

async function startGifPreview() {
    if (!uploadInfo || !uploadInfo.isAnimated || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
    const token = ++previewSessionToken;
    computeCancelRequested = false;
    animatedPreviewBaseSuffixBytes = [...currentSuffixBytes];

    if (uploadInfo.isVideo) {
        await startVideoPreview(token);
        return;
    }

    if (!uploadInfo.gifFrames) return;

    if (artisticModeCb && artisticModeCb.checked) {
        const cache = await processAnimatedFramesForArt('正在逐帧计算动态预览');
        if (token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
        if (!cache) {
            dynamicPreviewCb.checked = false;
            return;
        }
        startCachedGifPreview(cache, token);
        return;
    }

    const width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    const height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    ensureGifPreviewCanvas(width, height);
    const renderer = createGifFrameRenderer(gifPreviewCtx, gifPreviewCanvas);
    renderer.reset();
    gifPreviewIndex = 0;
    gifPreviewRunning = true;

    const originalBytes = [...currentSuffixBytes];

    const tick = () => {
        if (!gifPreviewRunning || token !== previewSessionToken || !dynamicPreviewCb || !dynamicPreviewCb.checked) return;
        const frame = uploadInfo.gifFrames[gifPreviewIndex];
        const fullFrame = uploadInfo.gifFullFrames && uploadInfo.gifFullFrames[gifPreviewIndex];
        if (fullFrame) {
            drawFullFrameToCanvas(fullFrame, gifPreviewCtx, gifPreviewCanvas);
        } else {
            renderer.draw(frame);
        }

        currentSuffixBytes = [...originalBytes];
        if (lastWhitenMode === 'white') {
            setSuffixUniform(0);
        } else if (lastWhitenMode === 'black') {
            setSuffixUniform(1);
        }
        applyImport(false, gifPreviewCanvas);
        renderQR(false, gifPreviewCanvas);
        if (previewImg) previewImg.src = gifPreviewCanvas.toDataURL('image/png');

        const delay = fullFrame ? Math.max(10, fullFrame.delay || 10) : getGifFrameDelayMs(frame);
        gifPreviewIndex = (gifPreviewIndex + 1) % uploadInfo.gifFrames.length;
        gifPreviewTimer = setTimeout(tick, delay);
    };

    tick();
}

// Drawing State
let drawnPixels = new Map(); 
let activeTool = 'pen'; 
let isDragging = false;
let currentDragTarget = null;
let pendingDrawRecompute = false;
let currentSuffixBytes = []; 
let lastCapacity = 0;
let generatedQR = null;
let hasUserEdits = false;
let hasImageUpload = false;
let arrowMovePending = false;
let lastWhitenMode = 'none'; // 'white', 'black', 'none'
let gifPreviewTimer = null;
let gifPreviewRunning = false;
let gifPreviewIndex = 0;
let gifPreviewCanvas = null;
let gifPreviewCtx = null;
let gifPreviewPrevImageData = null;
let videoPreviewRafId = null;
let videoPreviewRunning = false;
let previewSessionToken = 0;
let animatedPreviewBaseSuffixBytes = null;
let lastCopiedAnimatedUrl = null;

// History & Zoom
let historyStack = [];
let historyStep = -1;
let zoomLevel = 1.0;
let lastDrawPos = null;

// Map Data
let pixelMap = []; // 2D array: { type: 'data'|'ec'|'func', globalBitIndex, maskVal }
let totalDataBits = 0;
let totalDataBytes = 0;
let dataByteBlockRow = [];
let ecInterleavedBlockRow = [];
let ecInterleavedBlockCol = [];
let headerBitLength = 0; 
let payloadStartBit = 0; // Header + UserText + '#'
let payloadEditableEndBit = 0; // Exclusive end bit index of editable suffix payload

// DOM Elements
const canvas = document.getElementById('qr-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const previewArea = document.querySelector('.preview-area');
const canvasWrapper = document.querySelector('.canvas-wrapper');
canvasWrapper.style.position = 'relative';

const fileInput = document.getElementById('img-upload');
const importBtn = document.getElementById('import-btn');

// Overlay Elements
const importOverlay = document.getElementById('import-overlay');
const previewImg = document.getElementById('preview-img');
const deleteHintLayer = document.getElementById('delete-hint-layer');

let importState = {
    active: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    relX: 0, // Relative to canvas.offsetLeft
    relY: 0, // Relative to canvas.offsetTop
    isDragging: false,
    lastX: 0,
    lastY: 0,
    lastMoveDx: 0,
    lastMoveDy: 0,
    dragGrabOffsetX: 0,
    dragGrabOffsetY: 0
};

const textInput = document.getElementById('text-input');
const encodingWarning = document.getElementById('encoding-warning');
const textOverflowWarning = document.getElementById('text-overflow-warning');
const artisticWarning = document.getElementById('artistic-warning');
const computeOverlay = document.getElementById('compute-overlay');
const computeTitle = document.getElementById('compute-title');
const computeSubtitle = document.getElementById('compute-subtitle');
const computeProgressBar = document.getElementById('compute-progress-bar');
const computeProgressText = document.getElementById('compute-progress-text');
const computeFrameProgressGroup = document.getElementById('compute-frame-progress-group');
const computeFrameProgressBar = document.getElementById('compute-frame-progress-bar');
const computeFrameProgressText = document.getElementById('compute-frame-progress-text');
const computeCancelBtn = document.getElementById('compute-cancel-btn');
const eccSelect = document.getElementById('ecc-level');
const verRange = document.getElementById('version-range');
const verDisplay = document.getElementById('version-display');
const maskAutoBtn = document.getElementById('mask-auto-btn');
const maskButtons = document.querySelectorAll('.mask-btn[data-mask]');
const encodingSelect = document.getElementById('encoding-mode');
const clearBtn = document.getElementById('clear-draw');
const whitenBtn = document.getElementById('whiten-btn');
const downloadBtn = document.getElementById('download-btn');
const toolPen = document.getElementById('tool-pen');
const fgColorInput = document.getElementById('fg-color');
const bgColorInput = document.getElementById('bg-color');
const fgColorHexInput = document.getElementById('fg-color-hex');
const bgColorHexInput = document.getElementById('bg-color-hex');
const cellSizeAutoBtn = document.getElementById('cell-size-auto-btn');
const embedImageCb = document.getElementById('embed-image-cb');
const dynamicPreviewCb = document.getElementById('dynamic-preview-cb');
const invertToneCb = document.getElementById('invert-tone-cb');
const exportAudioCb = document.getElementById('export-audio-cb');
const imageBasisCb = document.getElementById('image-basis-cb');
const artisticModeCb = document.getElementById('artistic-mode');
const allowCoveredFreedomCb = document.getElementById('allow-covered-freedom');
const moduleStyleSelect = document.getElementById('module-style');
const finderStyleSelect = document.getElementById('finder-style');
const alignmentStyleSelect = document.getElementById('alignment-style');
const moduleStyleSummary = document.getElementById('module-style-summary');
const finderStyleSummary = document.getElementById('finder-style-summary');
const alignStyleSummary = document.getElementById('align-style-summary');
const maskModeSummary = document.getElementById('mask-mode-summary');
const moduleStyleButtons = document.querySelectorAll('.style-btn[data-style-target="module"]');
const finderStyleButtons = document.querySelectorAll('.style-btn[data-style-target="finder"]');
const alignStyleButtons = document.querySelectorAll('.style-btn[data-style-target="align"]');
const imageSizeGroup = document.getElementById('image-size-group');
const imageSizeWInput = document.getElementById('img-size-w');
const imageSizeHInput = document.getElementById('img-size-h');
const imageSizeResetBtn = document.getElementById('img-size-reset-btn');

let CELL_SIZE = 8;
let qrMargin = 1;
let moduleStyle = 'square';
let finderStyle = 'classic';
let alignStyle = 'classic';
let lastNonBasisImportRect = null;
let basisImageWidth = 0;
let basisImageHeight = 0;
let lastArtisticSolveStats = null;
let computeCancelRequested = false;
let qrComputeRunId = 0;
let optimizationImageSourceOverride = null;
let animatedArtCache = null;
let suppressComputeOverlay = false;
let padFreedomModeActive = false;
let dynamicPreviewRestartNonce = 0;
let computeProgressStartMs = 0;
let computeProgressLastDone = 0;
let computeProgressLastTotal = 1;
let animatedFrameProgressContext = null;

function isImageBasisMode() {
    return !!(imageBasisCb && !imageBasisCb.disabled && imageBasisCb.checked && hasImageUpload);
}

function getSourceDimensions(imageSource = previewImg) {
    if (!imageSource) return { width: 0, height: 0 };
    return {
        width: imageSource.naturalWidth || imageSource.videoWidth || imageSource.width || 0,
        height: imageSource.naturalHeight || imageSource.videoHeight || imageSource.height || 0
    };
}

function isToneInverted() {
    return !!(invertToneCb && !invertToneCb.disabled && invertToneCb.checked);
}

function getTargetColorFromLuminance(lum) {
    const dark = Number(lum) < BINARIZE_THRESHOLD;
    if (isToneInverted()) {
        return dark ? 0 : 1;
    }
    return dark ? 1 : 0;
}

function isFinderCell(r, c, count) {
    const inTL = r >= 0 && r <= 6 && c >= 0 && c <= 6;
    const inTR = r >= 0 && r <= 6 && c >= count - 7 && c <= count - 1;
    const inBL = r >= count - 7 && r <= count - 1 && c >= 0 && c <= 6;
    return inTL || inTR || inBL;
}

function getFinderLocalCoord(r, c, count) {
    if (r >= 0 && r <= 6 && c >= 0 && c <= 6) return { x: c, y: r };
    if (r >= 0 && r <= 6 && c >= count - 7 && c <= count - 1) return { x: c - (count - 7), y: r };
    if (r >= count - 7 && r <= count - 1 && c >= 0 && c <= 6) return { x: c, y: r - (count - 7) };
    return null;
}

function getVersionFromCount(count) {
    return Math.max(1, Math.round((count - 17) / 4));
}

function getAlignmentCenters(count) {
    if (!qrcode.QRUtil || !qrcode.QRUtil.getPatternPosition) return [];
    const version = getVersionFromCount(count);
    if (version < 2) return [];
    const positions = qrcode.QRUtil.getPatternPosition(version) || [];
    const centers = [];
    positions.forEach((ry) => {
        positions.forEach((cx) => {
            const overlapsFinder =
                (ry < 9 && cx < 9) ||
                (ry < 9 && cx > count - 9) ||
                (ry > count - 9 && cx < 9);
            if (!overlapsFinder) centers.push({ r: ry, c: cx });
        });
    });
    return centers;
}

function getAlignLocalCoord(r, c, count) {
    const centers = getAlignmentCenters(count);
    for (let i = 0; i < centers.length; i++) {
        const cc = centers[i];
        if (r >= cc.r - 2 && r <= cc.r + 2 && c >= cc.c - 2 && c <= cc.c + 2) {
            return { x: c - (cc.c - 2), y: r - (cc.r - 2) };
        }
    }
    return null;
}

const FINDER_CIRCLE_7 = [
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 0]
];

const ALIGN_CIRCLE_5 = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
];

// 用户指定模板：'-' 在极昼=0，极夜=1。
const FINDER_POLAR_7 = [
    [null, null, null, 1, null, null, null],
    [null, null, null, 0, null, null, null],
    [null, null, null, 1, null, null, null],
    [1, 0, 1, 1, 1, 0, 1],
    [null, null, null, 1, null, null, null],
    [null, null, null, 0, null, null, null],
    [null, null, null, 1, null, null, null]
];

const ALIGN_POLAR_5 = [
    [null, null, 1, null, null],
    [null, null, 0, null, null],
    [1, 0, 1, 0, 1],
    [null, null, 0, null, null],
    [null, null, 1, null, null]
];

function isAuroraCrossBit(localX, localY, size) {
    const mid = Math.floor(size / 2);
    return localX === mid || localY === mid;
}

function isAuroraWhiteNotch(localX, localY, size) {
    const mid = Math.floor(size / 2);
    if (localY === mid && (localX === 1 || localX === size - 2)) return true;
    if (localX === mid && (localY === 1 || localY === size - 2)) return true;
    return false;
}

function getStyledFinderBit(style, localX, localY, size) {
    if (style === 'classic') return null;
    if (style === 'aurora') {
        if (!isAuroraCrossBit(localX, localY, size)) return false;
        return !isAuroraWhiteNotch(localX, localY, size);
    }
    if (size === 7) {
        if (style === 'circle') return FINDER_CIRCLE_7[localY][localX] === 1;
        const v = FINDER_POLAR_7[localY][localX];
        if (v === null) return style === 'polar-night';
        return v === 1;
    }
    if (style === 'circle') return ALIGN_CIRCLE_5[localY][localX] === 1;
    const v = ALIGN_POLAR_5[localY][localX];
    if (v === null) return style === 'polar-night';
    return v === 1;
}

function getClassicFinderBit(localX, localY, size) {
    if (size === 7) {
        const outer = localX === 0 || localX === 6 || localY === 0 || localY === 6;
        const core = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
        return outer || core;
    }
    const outer = localX === 0 || localX === 4 || localY === 0 || localY === 4;
    const core = localX === 2 && localY === 2;
    return outer || core;
}

function getFinderAlignOverride(style, r, c, count) {
    if (style === 'classic') return null;

    const finderLocal = getFinderLocalCoord(r, c, count);
    if (finderLocal) {
        return getStyledFinderBit(style, finderLocal.x, finderLocal.y, 7);
    }

    const alignLocal = getAlignLocalCoord(r, c, count);
    if (alignLocal) {
        return getStyledFinderBit(style, alignLocal.x, alignLocal.y, 5);
    }

    return null;
}

function isFinderAlignTransparentCell(style, r, c, count) {
    if (style !== 'aurora') return false;

    const finderLocal = getFinderLocalCoord(r, c, count);
    if (finderLocal) return !isAuroraCrossBit(finderLocal.x, finderLocal.y, 7);

    const alignLocal = getAlignLocalCoord(r, c, count);
    if (alignLocal) return !isAuroraCrossBit(alignLocal.x, alignLocal.y, 5);

    return false;
}

function drawRoundedRectPath(drawCtx, x, y, w, h, radii) {
    const tl = Math.max(0, Math.min(Math.min(w, h) / 2, radii.tl || 0));
    const tr = Math.max(0, Math.min(Math.min(w, h) / 2, radii.tr || 0));
    const br = Math.max(0, Math.min(Math.min(w, h) / 2, radii.br || 0));
    const bl = Math.max(0, Math.min(Math.min(w, h) / 2, radii.bl || 0));

    drawCtx.beginPath();
    drawCtx.moveTo(x + tl, y);
    drawCtx.lineTo(x + w - tr, y);
    if (tr > 0) drawCtx.quadraticCurveTo(x + w, y, x + w, y + tr);
    else drawCtx.lineTo(x + w, y);
    drawCtx.lineTo(x + w, y + h - br);
    if (br > 0) drawCtx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    else drawCtx.lineTo(x + w, y + h);
    drawCtx.lineTo(x + bl, y + h);
    if (bl > 0) drawCtx.quadraticCurveTo(x, y + h, x, y + h - bl);
    else drawCtx.lineTo(x, y + h);
    drawCtx.lineTo(x, y + tl);
    if (tl > 0) drawCtx.quadraticCurveTo(x, y, x + tl, y);
    else drawCtx.lineTo(x, y);
    drawCtx.closePath();
}

function drawLiquidConnectedModule(drawCtx, x, y, w, h, color, neighbors, carveColor = '#ffffff') {
    const ox = x;
    const oy = y;
    const boxW = w;
    const boxH = h;
    const base = Math.min(boxW, boxH);
    const radius = Math.max(1, base * 0.46);

    const tl = (!neighbors.up && !neighbors.left) ? radius : 0;
    const tr = (!neighbors.up && !neighbors.right) ? radius : 0;
    const br = (!neighbors.down && !neighbors.right) ? radius : 0;
    const bl = (!neighbors.down && !neighbors.left) ? radius : 0;

    drawCtx.fillStyle = color;
    drawRoundedRectPath(drawCtx, ox, oy, boxW, boxH, { tl, tr, br, bl });
    drawCtx.fill();

    // 仅在“折角包围块”（仅两侧相邻、对侧为空）上补1/4四角星扇形（astroid），不使用1/4圆扇形。
    const fillet = Math.max(1, base * 0.34);
    drawCtx.fillStyle = color;

    const fillQuarterStarPatch = (cx, cy, sx, sy, r) => {
        const steps = 14;
        drawCtx.beginPath();
        drawCtx.moveTo(cx, cy);
        drawCtx.lineTo(cx + sx * r, cy);
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * (Math.PI / 2);
            const px = cx + sx * r * Math.pow(Math.cos(t), 3);
            const py = cy + sy * r * Math.pow(Math.sin(t), 3);
            drawCtx.lineTo(px, py);
        }
        drawCtx.closePath();
        drawCtx.fill();
    };

    if (neighbors.up && neighbors.left && !neighbors.upLeft) {
        fillQuarterStarPatch(ox, oy, -1, -1, fillet);
    }
    if (neighbors.up && neighbors.right && !neighbors.upRight) {
        fillQuarterStarPatch(ox + boxW, oy, 1, -1, fillet);
    }
    if (neighbors.down && neighbors.right && !neighbors.downRight) {
        fillQuarterStarPatch(ox + boxW, oy + boxH, 1, 1, fillet);
    }
    if (neighbors.down && neighbors.left && !neighbors.downLeft) {
        fillQuarterStarPatch(ox, oy + boxH, -1, 1, fillet);
    }
}

function drawStyledModuleOn(drawCtx, x, y, w, h, style, color) {
    const size = Math.min(w, h);
    const ox = x + (w - size) / 2;
    const oy = y + (h - size) / 2;

    drawCtx.fillStyle = color;
    if (style === 'circle') {
        drawCtx.beginPath();
        drawCtx.arc(ox + size / 2, oy + size / 2, size / 2, 0, Math.PI * 2);
        drawCtx.fill();
        return;
    }
    if (style === 'rounded') {
        const radius = Math.max(1, size * 0.22);
        drawRoundedRectPath(drawCtx, ox, oy, size, size, { tl: radius, tr: radius, br: radius, bl: radius });
        drawCtx.fill();
        return;
    }
    if (style === 'diamond') {
        drawCtx.beginPath();
        drawCtx.moveTo(ox + size / 2, oy);
        drawCtx.lineTo(ox + size, oy + size / 2);
        drawCtx.lineTo(ox + size / 2, oy + size);
        drawCtx.lineTo(ox, oy + size / 2);
        drawCtx.closePath();
        drawCtx.fill();
        return;
    }
    if (style === 'liquid') {
        const radius = Math.max(1, size * 0.45);
        drawRoundedRectPath(drawCtx, ox, oy, size, size, { tl: radius, tr: radius, br: radius, bl: radius });
        drawCtx.fill();
        return;
    }
    drawCtx.fillRect(x, y, w, h);
}

function drawStyledModule(x, y, w, h, style, color) {
    drawStyledModuleOn(ctx, x, y, w, h, style, color);
}

function drawBullseye(drawCtx, cx, cy, moduleSize, outerModules, innerModules, coreModules, fgColor, bgColor) {
    const outerR = (outerModules / 2) * moduleSize;
    const innerR = (innerModules / 2) * moduleSize;
    const coreR = (coreModules / 2) * moduleSize;

    drawCtx.fillStyle = fgColor;
    drawCtx.beginPath();
    drawCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = bgColor;
    drawCtx.beginPath();
    drawCtx.arc(cx, cy, innerR, 0, Math.PI * 2);
    drawCtx.fill();

    drawCtx.fillStyle = fgColor;
    drawCtx.beginPath();
    drawCtx.arc(cx, cy, coreR, 0, Math.PI * 2);
    drawCtx.fill();
}

function drawCircleFinderStyle(drawCtx, count, qrOriginX, qrOriginY, moduleW, moduleH, fgColor, bgColor, drawFinder = true, drawAlign = true) {
    const unit = Math.min(moduleW, moduleH);
    const offsetX = (moduleW - unit) / 2;
    const offsetY = (moduleH - unit) / 2;

    const finderStarts = [
        { r: 0, c: 0 },
        { r: 0, c: count - 7 },
        { r: count - 7, c: 0 }
    ];

    if (drawFinder) {
        finderStarts.forEach((pos) => {
            const x0 = qrOriginX + (pos.c + qrMargin) * moduleW + offsetX;
            const y0 = qrOriginY + (pos.r + qrMargin) * moduleH + offsetY;
            const cx = x0 + 3.5 * unit;
            const cy = y0 + 3.5 * unit;
            drawBullseye(drawCtx, cx, cy, unit, 7, 5, 3, fgColor, bgColor);
        });
    }

    if (drawAlign) {
        const alignCenters = getAlignmentCenters(count);
        alignCenters.forEach((ac) => {
            const x0 = qrOriginX + (ac.c - 2 + qrMargin) * moduleW + offsetX;
            const y0 = qrOriginY + (ac.r - 2 + qrMargin) * moduleH + offsetY;
            const cx = x0 + 2.5 * unit;
            const cy = y0 + 2.5 * unit;
            drawBullseye(drawCtx, cx, cy, unit, 5, 3, 1, fgColor, bgColor);
        });
    }
}

function refreshImageSizeControlVisibility() {
    if (!imageSizeGroup) return;
    const show = isImageBasisMode();
    imageSizeGroup.style.display = show ? 'flex' : 'none';
    if (imageSizeWInput) imageSizeWInput.disabled = !hasImageUpload || !show;
    if (imageSizeHInput) imageSizeHInput.disabled = !hasImageUpload || !show;
    if (imageSizeResetBtn) imageSizeResetBtn.disabled = !hasImageUpload || !show;
    refreshCellSizeAutoButtonVisibility();
}

function syncImageSizeInputs() {
    if (!imageSizeWInput || !imageSizeHInput || !importState.active) return;
    if (isImageBasisMode()) {
        imageSizeWInput.value = Math.max(1, Math.round(basisImageWidth || canvas.width || 1));
        imageSizeHInput.value = Math.max(1, Math.round(basisImageHeight || canvas.height || 1));
        return;
    }
    imageSizeWInput.value = Math.max(1, Math.round(importState.width));
    imageSizeHInput.value = Math.max(1, Math.round(importState.height));
}

function scaleBasisScene(scale) {
    if (!isImageBasisMode() || !importState.active) return;
    if (!Number.isFinite(scale) || scale <= 0) return;

    basisImageWidth = Math.max(1, Math.round((basisImageWidth || canvas.width || 1) * scale));
    basisImageHeight = Math.max(1, Math.round((basisImageHeight || canvas.height || 1) * scale));

    importState.width = Math.max(20, importState.width * scale);
    importState.height = Math.max(20, importState.height * scale);
    importState.relX *= scale;
    importState.relY *= scale;
    importState.x = canvas.offsetLeft + importState.relX;
    importState.y = canvas.offsetTop + importState.relY;
    syncCellSizeFromBasisBox();
}

function syncCellSizeFromBasisBox(moduleCountOverride) {
    if (!isImageBasisMode() || !importState.active) return;
    const qrModules = Number.isFinite(moduleCountOverride)
        ? moduleCountOverride
        : (generatedQR ? generatedQR.getModuleCount() : 0);
    if (qrModules <= 0) return;
    const modules = qrModules + 2 * qrMargin;
    if (modules <= 0) return;
    const box = getBasisQrBoxInternal();
    const next = Math.max(0.1, Math.round((Math.min(box.width, box.height) / modules) * 10) / 10);
    if (!Number.isFinite(next) || next <= 0) return;
    CELL_SIZE = next;
    const cellSizeInput = document.getElementById('cell-size-input');
    if (cellSizeInput) cellSizeInput.value = next.toFixed(1);
}

function getOverlayInnerBoxInternal(canvasW, canvasH, displayW, displayH) {
    const offsets = getCanvasContentOffsets();
    const relX = importState.relX || 0;
    const relY = importState.relY || 0;
    const ovStyle = window.getComputedStyle(importOverlay);
    const ovBorderLeft = parseFloat(ovStyle.borderLeftWidth) || 0;
    const ovBorderRight = parseFloat(ovStyle.borderRightWidth) || 0;
    const ovBorderTop = parseFloat(ovStyle.borderTopWidth) || 0;
    const ovBorderBottom = parseFloat(ovStyle.borderBottomWidth) || 0;
    const ratioX = displayW > 0 ? (canvasW / displayW) : 1;
    const ratioY = displayH > 0 ? (canvasH / displayH) : 1;

    return {
        x: (relX - offsets.left + ovBorderLeft) * ratioX,
        y: (relY - offsets.top + ovBorderTop) * ratioY,
        width: Math.max(0, (importState.width - ovBorderLeft - ovBorderRight) * ratioX),
        height: Math.max(0, (importState.height - ovBorderTop - ovBorderBottom) * ratioY)
    };
}

function getBasisQrBoxInternal() {
    if (!importState.active || importState.width <= 0 || importState.height <= 0) {
        return {
            x: 0,
            y: 0,
            width: Math.max(1, canvas.width),
            height: Math.max(1, canvas.height)
        };
    }
    const displayW = parseFloat(canvas.style.width) || canvas.width;
    const displayH = parseFloat(canvas.style.height) || canvas.height;
    const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
    return {
        x: box.x,
        y: box.y,
        width: Math.max(1, box.width),
        height: Math.max(1, box.height)
    };
}

function initImportOverlayByMode(natW, natH) {
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    const viewW = wrapperRect.width;
    const viewH = wrapperRect.height;

    if (isImageBasisMode()) {
        const displayW = parseFloat(canvas.style.width) || canvas.width || viewW;
        const displayH = parseFloat(canvas.style.height) || canvas.height || viewH;
        const base = Math.min(displayW, displayH) * 0.6;
        importState.width = Math.max(20, base);
        importState.height = Math.max(20, base);
        importState.x = canvas.offsetLeft + (displayW - importState.width) / 2;
        importState.y = canvas.offsetTop + (displayH - importState.height) / 2;
    } else {
        const aspect = natW / natH;
        let initW = viewW * 0.5;
        let initH = initW / aspect;
        importState.width = initW;
        importState.height = initH;
        importState.x = canvasWrapper.scrollLeft + (viewW - initW) / 2;
        importState.y = canvasWrapper.scrollTop + (viewH - initH) / 2;
    }

    importState.relX = importState.x - canvas.offsetLeft;
    importState.relY = importState.y - canvas.offsetTop;
}

function setDeleteZoneRect(node, show, left, top, width, height) {
    if (!node) return;
    node.style.display = show ? 'flex' : 'none';
    if (!show) return;
    node.style.left = `${Math.max(0, left)}px`;
    node.style.top = `${Math.max(0, top)}px`;
    node.style.width = `${Math.max(0, width)}px`;
    node.style.height = `${Math.max(0, height)}px`;
}

function updateDeleteZones(activeSides = { left: false, right: false, top: false, bottom: false }, bounds = null) {
    if (!deleteHintLayer) return;
    const zones = {
        left: deleteHintLayer.querySelector('.delete-hint-left'),
        right: deleteHintLayer.querySelector('.delete-hint-right'),
        top: deleteHintLayer.querySelector('.delete-hint-top'),
        bottom: deleteHintLayer.querySelector('.delete-hint-bottom')
    };
    if (!zones.left || !zones.right || !zones.top || !zones.bottom) return;

    const areaRect = previewArea ? previewArea.getBoundingClientRect() : canvasWrapper.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const aw = areaRect.width;
    const ah = areaRect.height;
    const canvasLeft = canvasRect.left - areaRect.left;
    const canvasTop = canvasRect.top - areaRect.top;
    const canvasRight = canvasLeft + canvasRect.width;
    const canvasBottom = canvasTop + canvasRect.height;

    const leftBound = bounds && Number.isFinite(bounds.left) ? bounds.left : canvasLeft;
    const rightBound = bounds && Number.isFinite(bounds.right) ? bounds.right : canvasRight;
    const topBound = bounds && Number.isFinite(bounds.top) ? bounds.top : canvasTop;
    const bottomBound = bounds && Number.isFinite(bounds.bottom) ? bounds.bottom : canvasBottom;

    const leftW = Math.max(0, Math.min(aw, leftBound));
    const rightX = Math.max(0, Math.min(aw, rightBound));
    const topH = Math.max(0, Math.min(ah, topBound));
    const bottomY = Math.max(0, Math.min(ah, bottomBound));

    setDeleteZoneRect(zones.left, !!activeSides.left && leftW > 0, 0, 0, leftW, ah);
    setDeleteZoneRect(zones.right, !!activeSides.right && rightX < aw, rightX, 0, aw - rightX, ah);
    setDeleteZoneRect(zones.top, !!activeSides.top && topH > 0, 0, 0, aw, topH);
    setDeleteZoneRect(zones.bottom, !!activeSides.bottom && bottomY < ah, 0, bottomY, aw, ah - bottomY);
}

function areAdjacentSides(a, b) {
    const pair = `${a}|${b}`;
    return pair === 'left|top' || pair === 'top|left' ||
        pair === 'top|right' || pair === 'right|top' ||
        pair === 'right|bottom' || pair === 'bottom|right' ||
        pair === 'bottom|left' || pair === 'left|bottom';
}

function getPointerDeleteBounds() {
    const areaRect = previewArea ? previewArea.getBoundingClientRect() : canvasWrapper.getBoundingClientRect();
    const qrRect = getQrRect();
    const w = importState.width;
    const h = importState.height;
    const gx = importState.dragGrabOffsetX;
    const gy = importState.dragGrabOffsetY;

    const leftClient = qrRect.left - (w - gx);
    const rightClient = qrRect.right + gx;
    const topClient = qrRect.top - (h - gy);
    const bottomClient = qrRect.bottom + gy;

    return {
        left: leftClient - areaRect.left,
        right: rightClient - areaRect.left,
        top: topClient - areaRect.top,
        bottom: bottomClient - areaRect.top
    };
}

function getExceededSidesByDistance(imgRect, qrRect) {
    const dist = {
        left: Math.max(0, qrRect.left - imgRect.left),
        right: Math.max(0, imgRect.right - qrRect.right),
        top: Math.max(0, qrRect.top - imgRect.top),
        bottom: Math.max(0, imgRect.bottom - qrRect.bottom)
    };

    const positive = Object.entries(dist)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);

    const sides = { left: false, right: false, top: false, bottom: false };
    if (positive.length === 0) return { sides, dist, hasExceed: false };

    const [firstSide] = positive[0];
    sides[firstSide] = true;

    if (positive.length >= 2) {
        const [secondSide] = positive[1];
        if (areAdjacentSides(firstSide, secondSide)) {
            sides[secondSide] = true;
        }
    }

    return { sides, dist, hasExceed: true };
}

function clearDeleteZones() {
    if (!deleteHintLayer) return;
    ['.delete-hint-left', '.delete-hint-right', '.delete-hint-top', '.delete-hint-bottom'].forEach((sel) => {
        const node = deleteHintLayer.querySelector(sel);
        if (node) node.style.display = 'none';
    });
}

function init() {
    // Determine initial version if auto
    updateQR();

    if (embedImageCb) {
        embedImageCb.disabled = true;
    }

    if (invertToneCb) {
        invertToneCb.checked = false;
        invertToneCb.disabled = true;
        invertToneCb.addEventListener('change', async () => {
            if (!hasImageUpload) return;
            invalidateAnimatedArtCache();
            resetSuffix();
            await updateQR({ skipArtisticPass: true });
            if (importState.active) {
                await applyImport(true, previewImg, true);
                return;
            }
            await updateQR({ skipArtisticPass: true });
        });
    }

    if (exportAudioCb) {
        exportAudioCb.checked = true;
        exportAudioCb.disabled = true;
    }

    if (artisticModeCb) {
        artisticModeCb.checked = false;
        artisticModeCb.disabled = true;
    }
    if (allowCoveredFreedomCb) {
        allowCoveredFreedomCb.checked = false;
        allowCoveredFreedomCb.disabled = true;
    }

    if (imageBasisCb) {
        imageBasisCb.disabled = true;
        imageBasisCb.checked = false;
        imageBasisCb.addEventListener('change', async () => {
            if (!hasImageUpload) {
                imageBasisCb.checked = false;
                return;
            }
            const toBasis = imageBasisCb.checked;
            if (importState.active && previewImg) {
                if (toBasis) {
                    const natW = previewImg.naturalWidth || previewImg.width || 1;
                    const natH = previewImg.naturalHeight || previewImg.height || 1;
                    if (!(basisImageWidth > 0 && basisImageHeight > 0)) {
                        basisImageWidth = natW;
                        basisImageHeight = natH;
                    }
                    lastNonBasisImportRect = {
                        width: importState.width,
                        height: importState.height,
                        relX: importState.relX,
                        relY: importState.relY
                    };
                    initImportOverlayByMode(natW, natH);
                } else {
                    if (lastNonBasisImportRect) {
                        importState.width = lastNonBasisImportRect.width;
                        importState.height = lastNonBasisImportRect.height;
                        importState.relX = lastNonBasisImportRect.relX;
                        importState.relY = lastNonBasisImportRect.relY;
                    } else {
                        const natW = previewImg.naturalWidth || previewImg.width || 1;
                        const natH = previewImg.naturalHeight || previewImg.height || 1;
                        const centerX = importState.relX + importState.width / 2;
                        const centerY = importState.relY + importState.height / 2;
                        importState.width = importState.width;
                        importState.height = importState.width * (natH / natW);
                        importState.relX = centerX - importState.width / 2;
                        importState.relY = centerY - importState.height / 2;
                    }
                    importState.x = canvas.offsetLeft + importState.relX;
                    importState.y = canvas.offsetTop + importState.relY;
                    const candidate = getAutoCellSizeCandidate();
                    if (candidate) {
                        CELL_SIZE = candidate;
                        const cellSizeInput = document.getElementById('cell-size-input');
                        if (cellSizeInput) cellSizeInput.value = candidate.toFixed(1);
                    }
                }

                renderQR(false);
                updateOverlayTransform();
                await applyImport(false, previewImg, true);
                syncImageSizeInputs();
            } else {
                renderQR(false);
            }
            refreshImageSizeControlVisibility();
            updateOverlayVisibility();
        });
    }

    if (moduleStyleSelect) {
        moduleStyle = moduleStyleSelect.value || moduleStyle;
        moduleStyleSelect.addEventListener('change', () => {
            moduleStyle = moduleStyleSelect.value;
            syncStyleButtonState('module');
            updateOptionSummaries();
            renderQR(false);
        });
    }

    if (finderStyleSelect) {
        finderStyle = finderStyleSelect.value || finderStyle;
        finderStyleSelect.addEventListener('change', () => {
            finderStyle = finderStyleSelect.value;
            syncStyleButtonState('finder');
            updateOptionSummaries();
            renderQR(false);
        });
    }

    if (alignmentStyleSelect) {
        alignStyle = alignmentStyleSelect.value || alignStyle;
        alignmentStyleSelect.addEventListener('change', () => {
            alignStyle = alignmentStyleSelect.value;
            syncStyleButtonState('align');
            updateOptionSummaries();
            renderQR(false);
        });
    }

    if (imageSizeWInput) {
        imageSizeWInput.addEventListener('change', async () => {
            if (!importState.active) return;
            let w = parseInt(imageSizeWInput.value, 10);
            if (isImageBasisMode()) {
                const oldW = Math.max(1, Math.round(basisImageWidth || canvas.width || 1));
                if (!Number.isFinite(w) || w < 1) w = oldW;
                const scale = w / oldW;
                scaleBasisScene(scale);
                updateOverlayTransform();
                updateOutOfBoundsState();
                await applyImport(false, previewImg, true);
                syncCellSizeFromBasisBox();
                syncImageSizeInputs();
                return;
            }
            if (!Number.isFinite(w) || w < 1) w = Math.max(1, Math.round(importState.width));
            const centerX = importState.relX + importState.width / 2;
            importState.width = w;
            importState.relX = centerX - importState.width / 2;
            importState.x = canvas.offsetLeft + importState.relX;
            updateOverlayTransform();
            updateOutOfBoundsState();
            await applyImport(false, previewImg, true);
            syncImageSizeInputs();
        });
    }

    if (imageSizeHInput) {
        imageSizeHInput.addEventListener('change', async () => {
            if (!importState.active) return;
            let h = parseInt(imageSizeHInput.value, 10);
            if (isImageBasisMode()) {
                const oldH = Math.max(1, Math.round(basisImageHeight || canvas.height || 1));
                if (!Number.isFinite(h) || h < 1) h = oldH;
                const scale = h / oldH;
                scaleBasisScene(scale);
                updateOverlayTransform();
                updateOutOfBoundsState();
                await applyImport(false, previewImg, true);
                syncCellSizeFromBasisBox();
                syncImageSizeInputs();
                return;
            }
            if (!Number.isFinite(h) || h < 1) h = Math.max(1, Math.round(importState.height));
            const centerY = importState.relY + importState.height / 2;
            importState.height = h;
            importState.relY = centerY - importState.height / 2;
            importState.y = canvas.offsetTop + importState.relY;
            updateOverlayTransform();
            updateOutOfBoundsState();
            await applyImport(false, previewImg, true);
            syncImageSizeInputs();
        });
    }

    if (imageSizeResetBtn) {
        imageSizeResetBtn.addEventListener('click', () => {
            restoreImportOverlayToNaturalSize();
        });
    }

    if (dynamicPreviewCb) {
        dynamicPreviewCb.disabled = true;
        dynamicPreviewCb.checked = false;
        dynamicPreviewCb.addEventListener('change', async () => {
            if (dynamicPreviewCb.checked) {
                startGifPreview();
            } else {
                stopGifPreview();
                if (uploadInfo && uploadInfo.isAnimated && (uploadInfo.gifFrames || uploadInfo.isVideo)) {
                    if (animatedPreviewBaseSuffixBytes && animatedPreviewBaseSuffixBytes.length) {
                        currentSuffixBytes = [...animatedPreviewBaseSuffixBytes];
                    }
                    setStaticGifPreview();

                    const artisticOn = !!(artisticModeCb && artisticModeCb.checked);
                    if (uploadInfo.isVideo && gifPreviewCanvas) {
                        await applyImport(false, gifPreviewCanvas, true, { skipArtisticPass: !artisticOn });
                        renderQR(false, gifPreviewCanvas);
                    } else {
                        await applyImport(false, previewImg, true, { skipArtisticPass: !artisticOn });
                        renderQR(false);
                    }
                    animatedPreviewBaseSuffixBytes = null;
                    return;
                }
                renderQR(false);
            }
        });
    }
    
    // Cell Size Input
    const cellSizeInput = document.getElementById('cell-size-input');
    if (cellSizeInput) {
        cellSizeInput.addEventListener('change', async (e) => {
            let val = parseFloat(e.target.value);
            if (!Number.isFinite(val)) val = CELL_SIZE;
            if (val < 0.1) val = 0.1;
            if (val > 100) val = 100;
            val = Math.round(val * 10) / 10;
            const oldSize = CELL_SIZE;
            if (oldSize > 0) {
                const ratio = val / oldSize;
                CELL_SIZE = val;
                if (importState.active && importState.width > 0) {
                    if (isImageBasisMode()) {
                        scaleBasisScene(ratio);
                        syncCellSizeFromBasisBox();
                    } else {
                        importState.width *= ratio;
                        importState.height *= ratio;
                        importState.relX *= ratio;
                        importState.relY *= ratio;
                    }
                    importState.x = canvas.offsetLeft + importState.relX;
                    importState.y = canvas.offsetTop + importState.relY;
                    updateOverlayTransform();
                }
            } else {
                CELL_SIZE = val;
            }
            renderQR(false);
            if (importState.active && hasImageUpload) {
                await applyImport(false, previewImg, true);
            }
        });
    }

    if (cellSizeAutoBtn) {
        cellSizeAutoBtn.addEventListener('click', async () => {
            applyOriginalImageSize();
            renderQR(false);
            if (importState.active && hasImageUpload) {
                await applyImport(false, previewImg, true);
            }
        });
    }

    if (fgColorInput) {
        foregroundColor = fgColorInput.value || foregroundColor;
        fgColorInput.addEventListener('input', () => {
            foregroundColor = fgColorInput.value;
            syncHexInputs();
            renderQR(false);
        });
    }

    if (bgColorInput) {
        backgroundColor = bgColorInput.value || backgroundColor;
        bgColorInput.addEventListener('input', () => {
            backgroundColor = bgColorInput.value;
            syncHexInputs();
            renderQR(false);
        });
    }

    if (fgColorHexInput) {
        fgColorHexInput.addEventListener('input', () => {
            handleHexInput(fgColorHexInput, fgColorInput, true);
        });
    }

    if (bgColorHexInput) {
        bgColorHexInput.addEventListener('input', () => {
            handleHexInput(bgColorHexInput, bgColorInput, false);
        });
    }

    textInput.addEventListener('input', async (e) => {
        userText = e.target.value;
        // On text change, we keep suffix bytes if possible?
        // No, size changes, validation changes. Clear suffix.
        resetSuffix();
        if (shouldDirectAnimatedRecompute()) {
            await restartDynamicPreviewWithRecompute();
            return;
        }
        if (hasImageUpload && importState.active) {
            await updateQR({ skipArtisticPass: true });
            await refitImageAfterQrUpdate(true);
        } else {
            await updateQR();
        }
    });
    
    eccSelect.addEventListener('change', async (e) => {
        eccLevel = e.target.value;
        resetSuffix();
        if (shouldDirectAnimatedRecompute()) {
            await restartDynamicPreviewWithRecompute();
            return;
        }
        await updateQR({ skipArtisticPass: true });
        await refitImageAfterQrUpdate(true);
    });
    
    verRange.addEventListener('input', async (e) => {
        let val = parseInt(e.target.value);
        if (val < 0) val = 0;
        if (val > 40) val = 40;
        version = val;
        
        // Sync Input Box
        const vInput = document.getElementById('version-input');
        if(vInput && vInput.value != version) vInput.value = version;

        // verDisplay.textContent = version === 0 ? "鑷姩" : version; // Removed span
        resetSuffix();
        if (shouldDirectAnimatedRecompute()) {
            await restartDynamicPreviewWithRecompute();
            return;
        }
        await updateQR({ skipArtisticPass: true });
        await refitImageAfterQrUpdate(true);
    });

    // Version Input Box Listener
    const verInput = document.getElementById('version-input');
    if (verInput) {
        verInput.addEventListener('change', async (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 40) val = 40;
            e.target.value = val;
            
            // Sync Range
            version = val;
            verRange.value = val;
            
            resetSuffix();
            if (shouldDirectAnimatedRecompute()) {
                await restartDynamicPreviewWithRecompute();
                return;
            }
            await updateQR({ skipArtisticPass: true });
            await refitImageAfterQrUpdate(true);
        });
    }

    setupMaskButtons();

    encodingSelect.addEventListener('change', async (e) => {
        encodingMode = e.target.value;
        resetSuffix();
        if (shouldDirectAnimatedRecompute()) {
            await restartDynamicPreviewWithRecompute();
            return;
        }
        if (hasImageUpload && importState.active) {
            await updateQR({ skipArtisticPass: true });
            await refitImageAfterQrUpdate(true);
        } else {
            await updateQR();
        }
    });

    const embedCb = document.getElementById('embed-image-cb');
    if (embedCb) {
        embedCb.checked = true; // Default to checked
        embedCb.addEventListener('change', () => {
             updateOverlayVisibility(); // Toggle overlay
             renderQR(false); // Toggle canvas render
        });
    }

    // Tools
    if (toolPen) {
        toolPen.addEventListener('click', () => setTool('pen'));
    }
    
    clearBtn.addEventListener('click', () => {
        // Manually clear bytes instead of full reset to allow Undo
        currentSuffixBytes.fill(0);
        currentSuffixBytes = []; 
        
        // Clear Uploaded Image
        if (importState.active || previewImg.src) {
             importState.active = false;
             importState.width = 0;
             importState.height = 0;
             importOverlay.style.display = 'none';
             importOverlay.classList.remove('import-outside');
             importOverlay.classList.remove('image-basis');
             clearDeleteZones();
             previewImg.removeAttribute('src'); // Clear src to stop renderQR from drawing
             fileInput.value = ''; 
             cleanupVideoObjectUrl();
             uploadInfo = {
                 mime: null,
                 name: null,
                 isGif: false,
                 isVideo: false,
                 isAnimated: false,
                 animatedType: null,
                 gifFrames: null,
                 gifFullFrames: null,
                 gifWidth: 0,
                 gifHeight: 0,
                 gifBuffer: null,
                 videoObjectUrl: null,
                 videoDuration: 0,
                 videoFps: 30,
                 videoElement: null,
                 firstFrameUrl: null
             };
             stopGifPreview();
             if (embedImageCb) {
                 embedImageCb.checked = false;
                 embedImageCb.disabled = true;
             }
             if (dynamicPreviewCb) {
                 dynamicPreviewCb.checked = false;
                 dynamicPreviewCb.disabled = true;
             }
             if (imageBasisCb) {
                 imageBasisCb.checked = false;
                 imageBasisCb.disabled = true;
             }
             if (artisticModeCb) {
                 artisticModeCb.checked = false;
                 artisticModeCb.disabled = true;
             }
             if (allowCoveredFreedomCb) {
                 allowCoveredFreedomCb.checked = false;
                 allowCoveredFreedomCb.disabled = true;
             }
             if (invertToneCb) {
                 invertToneCb.checked = false;
                 invertToneCb.disabled = true;
             }
             if (exportAudioCb) {
                 exportAudioCb.checked = true;
                 exportAudioCb.disabled = true;
             }
             if (cellSizeAutoBtn) {
                 cellSizeAutoBtn.style.display = 'none';
             }
        }

        hasUserEdits = false;
        hasImageUpload = false;
        maskPattern = -1;
        refreshImageSizeControlVisibility();
        updateMaskControls();

        updateQR();
        saveHistory(); // Save the cleared state
    });
    whitenBtn.addEventListener('click', () => {
        // Toggle Logic
        let targetColor = 0; // White
        if (lastWhitenMode === 'white') {
             targetColor = 1; // Black
             lastWhitenMode = 'black';
               whitenBtn.title = "再次点击一键全白";
        } else {
             targetColor = 0; // White
             lastWhitenMode = 'white';
               whitenBtn.title = "再次点击一键全黑";
        }

        // Fix logic stability:
        // If "Auto Mask" is active, modifying data to be visually uniform (White/Black)
        // will cause the Auto-Penalty algorithm to choose a mask that scambles it.
        // We MUST LOCK the mask to the current visual mask to preserve the user's intent.
        if (maskPattern === -1) {
            // Use the last calculated mask (real), or fallback to 0
            const bestMask = (lastState.mask >= 0) ? lastState.mask : 0;
            maskPattern = bestMask;
            
            // Sync UI
            updateMaskControls();
        }

        hasUserEdits = true;
        lockAutoMaskIfNeeded();
        setSuffixUniform(targetColor);
        drawnPixels.clear(); // Clear manual edits blocking the fill
        
        updateQR();
        saveHistory(); 
    });
    downloadBtn.addEventListener('click', async () => {
        await exportAndDownload();
    });

    const artCheck = document.getElementById('artistic-mode');
    if(artCheck) {
        artCheck.addEventListener('change', async () => {
             if (allowCoveredFreedomCb) {
                 allowCoveredFreedomCb.disabled = !artCheck.checked;
                 if (!artCheck.checked) allowCoveredFreedomCb.checked = false;
             }
             if (shouldDirectAnimatedRecompute()) {
                 await restartDynamicPreviewWithRecompute();
                 return;
             }
             await updateQR();
             await restartDynamicPreviewWithRecompute();
        });
    }

    if (allowCoveredFreedomCb) {
        allowCoveredFreedomCb.addEventListener('change', async () => {
            resetSuffix();
            if (shouldDirectAnimatedRecompute()) {
                await restartDynamicPreviewWithRecompute();
                return;
            }
            await updateQR({ skipArtisticPass: true });
            await refitImageAfterQrUpdate(true);
        });
    }

    if (computeCancelBtn) {
        computeCancelBtn.addEventListener('click', () => {
            computeCancelRequested = true;
            qrComputeRunId += 1;
            if (computeSubtitle) computeSubtitle.textContent = '正在取消...';
        });
    }

    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);

    // Import Interaction
    importOverlay.addEventListener('mousedown', startImportDrag);
    // Move and Up are global (in case mouse leaves overlay)
    document.addEventListener('mousemove', moveImportDrag);
    document.addEventListener('mouseup', endImportDrag);

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) drawAt(e);
    });
    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (pendingDrawRecompute) {
                const artOn = !!(artisticModeCb && artisticModeCb.checked);
                updateQR({ skipArtisticPass: !artOn });
                pendingDrawRecompute = false;
            }
            saveHistory();
        }
    });
    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            if (pendingDrawRecompute) {
                const artOn = !!(artisticModeCb && artisticModeCb.checked);
                updateQR({ skipArtisticPass: !artOn });
                pendingDrawRecompute = false;
            }
            saveHistory();
        }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    // Zoom
    canvasWrapper.addEventListener('wheel', handleWheel, { passive: false }); // Move listener to wrapper
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', handleGlobalKey);
    document.addEventListener('keyup', handleGlobalKeyUp);

    // Sidebar splitter
    initSidebarSplitter();

    // Render mask previews
    renderMaskGallery();
    renderStyleGallery();
    setupStyleGalleryButtons();
    syncStyleButtonState('module');
    syncStyleButtonState('finder');
    syncStyleButtonState('align');
    updateMaskControls();
    updateOptionSummaries();
    refreshImageSizeControlVisibility();
    syncHexInputs();
}

function setTool(tool) {
    activeTool = tool;
    if (toolPen) {
        toolPen.classList.toggle('active', tool === 'pen');
    }
}

function parseHexColor(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return { r, g, b };
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
}

function rgbaFromHex(hex, alpha) {
    const { r, g, b } = parseHexColor(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeHexInput(value) {
    return (value || '').trim().replace('#', '').toLowerCase();
}

function handleHexInput(textInput, colorInput, isForeground) {
    const hex = normalizeHexInput(textInput.value);
    const isValid = /^[0-9a-f]{6}$/.test(hex);
    if (!isValid) {
        textInput.classList.add('invalid');
        return;
    }
    textInput.classList.remove('invalid');
    const next = `#${hex}`;
    colorInput.value = next;
    if (isForeground) foregroundColor = next;
    else backgroundColor = next;
    syncHexInputs();
    renderQR(false);
}

function syncHexInputs() {
    if (fgColorHexInput && fgColorInput) {
        fgColorHexInput.value = normalizeHexInput(fgColorInput.value);
        fgColorHexInput.classList.remove('invalid');
        fgColorInput.style.backgroundColor = fgColorInput.value;
    }
    if (bgColorHexInput && bgColorInput) {
        bgColorHexInput.value = normalizeHexInput(bgColorInput.value);
        bgColorHexInput.classList.remove('invalid');
        bgColorInput.style.backgroundColor = bgColorInput.value;
    }
}

function ensureGifuctLoaded() {
    return new Promise((resolve) => {
        if (window.gifuct) return resolve(true);
        const existing = document.querySelector('script[data-gifuct-loader]');
        if (existing) {
            existing.addEventListener('load', () => resolve(!!window.gifuct), { once: true });
            existing.addEventListener('error', () => resolve(false), { once: true });
            return;
        }
        const s = document.createElement('script');
        s.dataset.gifuctLoader = '1';
        s.src = 'vendor/gifuct-core.js';
        s.onload = () => resolve(!!window.gifuct);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
    });
}

async function parseGifFromBuffer(buffer) {
    if (!buffer) return null;
    const ok = await ensureGifuctLoaded();
    if (!ok || !window.gifuct) return null;
    const gif = window.gifuct.parseGIF(buffer);
    const frames = window.gifuct.decompressFrames(gif, true);
    const width = gif.lsd.width;
    const height = gif.lsd.height;

    const composeCanvas = document.createElement('canvas');
    composeCanvas.width = width;
    composeCanvas.height = height;
    const composeCtx = composeCanvas.getContext('2d', { willReadFrequently: true });
    const composeRenderer = createGifFrameRenderer(composeCtx, composeCanvas);
    composeRenderer.reset();

    const fullFrames = [];
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        composeRenderer.draw(frame);
        const snapshot = composeCtx.getImageData(0, 0, width, height);
        fullFrames.push({
            rgba: new Uint8ClampedArray(snapshot.data),
            width,
            height,
            delay: getGifFrameDelayMs(frame)
        });
    }

    return { frames, fullFrames, width, height };
}

async function parseAnimatedPngFromBuffer(buffer) {
    if (!buffer || typeof ImageDecoder === 'undefined') return null;
    try {
        const decoder = new ImageDecoder({ data: buffer, type: 'image/png' });
        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;
        if (!track || !track.animated || track.frameCount <= 1) {
            decoder.close();
            return null;
        }

        const width = decoder.tracks.selectedTrack.codedWidth || track.codedWidth;
        const height = decoder.tracks.selectedTrack.codedHeight || track.codedHeight;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });

        const fullFrames = [];
        const frames = [];

        for (let i = 0; i < track.frameCount; i++) {
            const result = await decoder.decode({ frameIndex: i });
            const vf = result.image;
            const durationUs = typeof vf.duration === 'number' ? vf.duration : 100000;
            const delayMs = Math.max(10, Math.round(durationUs / 1000));

            tctx.clearRect(0, 0, width, height);
            tctx.drawImage(vf, 0, 0, width, height);
            const shot = tctx.getImageData(0, 0, width, height);
            fullFrames.push({
                rgba: new Uint8ClampedArray(shot.data),
                width,
                height,
                delay: delayMs
            });
            frames.push({ delayMs });
            vf.close();
        }

        decoder.close();
        return { frames, fullFrames, width, height };
    } catch (_) {
        return null;
    }
}

function canUseAutoMask() {
    return !hasUserEdits && !hasImageUpload;
}

function updateMaskControls() {
    if (maskAutoBtn) {
        maskAutoBtn.textContent = `自动（当前：${bestAutoMask}）`;
        maskAutoBtn.style.display = canUseAutoMask() ? 'inline-flex' : 'none';
        maskAutoBtn.classList.toggle('active', maskPattern === -1);
    }
    if (maskButtons) {
        maskButtons.forEach((btn) => {
            const val = parseInt(btn.dataset.mask);
            btn.classList.toggle('active', val === maskPattern);
        });
    }
    updateOptionSummaries();
}

function applyOriginalImageSize() {
    if (!importState.active || !previewImg) return;
    const imgW = previewImg.naturalWidth || previewImg.width || 0;
    const imgH = previewImg.naturalHeight || previewImg.height || 0;
    if (imgW === 0 || imgH === 0) return;

    if (!generatedQR) return;
    const oldSize = CELL_SIZE;
    const targetSize = getAutoCellSizeCandidate();
    if (!targetSize) return;
    const ratio = targetSize / oldSize;

    const oldRelX = importState.relX;
    const oldRelY = importState.relY;

    CELL_SIZE = targetSize;
    const cellSizeInput = document.getElementById('cell-size-input');
    if (cellSizeInput) cellSizeInput.value = targetSize.toFixed(1);
    if (cellSizeAutoBtn) cellSizeAutoBtn.textContent = `自动(${targetSize.toFixed(1)})`;

    importState.width = importState.width * ratio;
    importState.height = importState.height * ratio;
    importState.relX = oldRelX * ratio;
    importState.relY = oldRelY * ratio;
    importState.x = canvas.offsetLeft + importState.relX;
    importState.y = canvas.offsetTop + importState.relY;
    updateOverlayTransform();
    updateOutOfBoundsState();
}

async function restoreImportOverlayToNaturalSize() {
    if (!importState.active || !previewImg) return;
    const imgW = previewImg.naturalWidth || previewImg.width || 0;
    const imgH = previewImg.naturalHeight || previewImg.height || 0;
    if (imgW <= 0 || imgH <= 0) return;

    if (isImageBasisMode()) {
        const oldW = Math.max(1, basisImageWidth || canvas.width || imgW);
        basisImageWidth = imgW;
        basisImageHeight = imgH;
        const scale = imgW / oldW;
        importState.width = Math.max(20, importState.width * scale);
        importState.height = Math.max(20, importState.height * scale);
        importState.relX *= scale;
        importState.relY *= scale;
        importState.x = canvas.offsetLeft + importState.relX;
        importState.y = canvas.offsetTop + importState.relY;

        updateOverlayTransform();
        updateOutOfBoundsState();
        await applyImport(false, previewImg, true);
        syncImageSizeInputs();
        return;
    }

    const centerX = importState.relX + importState.width / 2;
    const centerY = importState.relY + importState.height / 2;

    importState.width = imgW;
    importState.height = imgH;
    importState.relX = centerX - importState.width / 2;
    importState.relY = centerY - importState.height / 2;
    importState.x = canvas.offsetLeft + importState.relX;
    importState.y = canvas.offsetTop + importState.relY;

    updateOverlayTransform();
    updateOutOfBoundsState();
    await applyImport(false, previewImg, true);
    syncImageSizeInputs();
}

async function setMaskPattern(nextMask) {
    if (nextMask === -1 && !canUseAutoMask()) return;
    if (nextMask !== -1) lastManualMask = nextMask;
    maskPattern = nextMask;
    if (hasImageUpload && importState.active) {
        if (shouldDirectAnimatedRecompute()) {
            await restartDynamicPreviewWithRecompute();
            updateMaskControls();
            return;
        }
        await updateQR({ skipArtisticPass: true });
        await applyImport(false, previewImg, true);
    } else {
        await updateQR();
    }
    updateMaskControls();
}

function lockAutoMaskIfNeeded() {
    if (!canUseAutoMask() && maskPattern === -1) {
        const autoMask = (typeof bestAutoMask === 'number' && bestAutoMask >= 0)
            ? bestAutoMask
            : ((lastState && typeof lastState.mask === 'number' && lastState.mask >= 0) ? lastState.mask : 0);
        maskPattern = autoMask;
        lastManualMask = autoMask;
        updateQR();
    }
    updateMaskControls();
}

function setupMaskButtons() {
    if (!maskButtons) return;
    maskButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.dataset.mask);
            setMaskPattern(val);
        });
    });
}

function guessMimeFromName(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    if (lower.endsWith('.apng')) return 'image/apng';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.bmp')) return 'image/bmp';
    if (lower.endsWith('.mp4')) return 'video/mp4';
    if (lower.endsWith('.webm')) return 'video/webm';
    if (lower.endsWith('.ogg') || lower.endsWith('.ogv')) return 'video/ogg';
    return null;
}


function getMaskFuncByIndex(maskIndex) {
    switch (maskIndex) {
        case 0: return (i, j) => (i + j) % 2 === 0;
        case 1: return (i, j) => i % 2 === 0;
        case 2: return (i, j) => j % 3 === 0;
        case 3: return (i, j) => (i + j) % 3 === 0;
        case 4: return (i, j) => ((Math.floor(i / 2) + Math.floor(j / 3)) % 2) === 0;
        case 5: return (i, j) => ((i * j) % 2 + (i * j) % 3) === 0;
        case 6: return (i, j) => (((i * j) % 2 + (i * j) % 3) % 2) === 0;
        case 7: return (i, j) => (((i * j) % 3 + (i + j) % 2) % 2) === 0;
        default: return () => false;
    }
}

function renderMaskGallery() {
    const gallery = document.getElementById('mask-gallery');
    if (!gallery) return;
    const canvases = gallery.querySelectorAll('canvas[data-mask]');
    canvases.forEach((c) => {
        const idx = parseInt(c.dataset.mask);
        const ctx = c.getContext('2d', { willReadFrequently: true });
        const cells = 9;
        const size = Math.floor(c.width / cells);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        const maskFunc = getMaskFuncByIndex(idx);
        for (let i = 0; i < cells; i++) {
            for (let j = 0; j < cells; j++) {
                if (maskFunc(i, j)) {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(j * size, i * size, size, size);
                }
            }
        }
    });
}

function drawModulePreviewPattern(pCtx, style, darkColor) {
    const moduleSize = 16;
    const cols = 5;
    const rows = 5;
    const patternW = cols * moduleSize;
    const patternH = rows * moduleSize;
    const padX = Math.floor((pCtx.canvas.width - patternW) / 2);
    const padY = Math.floor((pCtx.canvas.height - patternH) / 2);
    const cw = moduleSize;
    const ch = moduleSize;
    const pattern = [
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 0, 1, 1, 0]
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!pattern[r][c]) continue;
            const x = padX + c * cw;
            const y = padY + r * ch;

            if (style === 'liquid') {
                const up = r > 0 && pattern[r - 1][c] === 1;
                const right = c < cols - 1 && pattern[r][c + 1] === 1;
                const down = r < rows - 1 && pattern[r + 1][c] === 1;
                const left = c > 0 && pattern[r][c - 1] === 1;
                const upLeft = r > 0 && c > 0 && pattern[r - 1][c - 1] === 1;
                const upRight = r > 0 && c < cols - 1 && pattern[r - 1][c + 1] === 1;
                const downLeft = r < rows - 1 && c > 0 && pattern[r + 1][c - 1] === 1;
                const downRight = r < rows - 1 && c < cols - 1 && pattern[r + 1][c + 1] === 1;
                drawLiquidConnectedModule(pCtx, x, y, cw, ch, darkColor, {
                    up, right, down, left,
                    upLeft, upRight, downLeft, downRight
                }, '#ffffff');
            } else {
                drawStyledModuleOn(pCtx, x, y, cw, ch, style, darkColor);
            }
        }
    }
}

function drawEyePreviewPattern(pCtx, style, darkColor, moduleCount, originX, originY, moduleSize) {
    if (style === 'circle') {
        const bg = '#ffffff';
        if (moduleCount === 7) {
            drawBullseye(
                pCtx,
                originX + (moduleCount * moduleSize) / 2,
                originY + (moduleCount * moduleSize) / 2,
                moduleSize,
                7,
                5,
                3,
                darkColor,
                bg
            );
        } else {
            drawBullseye(
                pCtx,
                originX + (moduleCount * moduleSize) / 2,
                originY + (moduleCount * moduleSize) / 2,
                moduleSize,
                5,
                3,
                1,
                darkColor,
                bg
            );
        }
        return;
    }

    for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
            const isDark = (style === 'classic')
                ? getClassicFinderBit(c, r, moduleCount)
                : getStyledFinderBit(style, c, r, moduleCount);
            if (!isDark) continue;
            drawStyledModuleOn(
                pCtx,
                originX + c * moduleSize,
                originY + r * moduleSize,
                moduleSize,
                moduleSize,
                'square',
                darkColor
            );
        }
    }
}

function drawFinderPreviewPattern(pCtx, style, darkColor) {
    const moduleSize = Math.max(6, Math.floor(Math.min(pCtx.canvas.width, pCtx.canvas.height) / 7));
    const finderSize = 7 * moduleSize;
    const originX = Math.floor((pCtx.canvas.width - finderSize) / 2);
    const originY = Math.floor((pCtx.canvas.height - finderSize) / 2);
    drawEyePreviewPattern(pCtx, style, darkColor, 7, originX, originY, moduleSize);
}

function drawAlignPreviewPattern(pCtx, style, darkColor) {
    const moduleSize = Math.max(6, Math.floor(Math.min(pCtx.canvas.width, pCtx.canvas.height) / 5));
    const alignSize = 5 * moduleSize;
    const originX = Math.floor((pCtx.canvas.width - alignSize) / 2);
    const originY = Math.floor((pCtx.canvas.height - alignSize) / 2);
    drawEyePreviewPattern(pCtx, style, darkColor, 5, originX, originY, moduleSize);
}

function renderStyleGallery() {
    const canvases = document.querySelectorAll('canvas[data-style-preview]');
    canvases.forEach((canvasNode) => {
        const key = canvasNode.dataset.stylePreview || '';
        if (!key) return;
        const parts = key.split('-');
        const target = parts[0];
        const style = parts.slice(1).join('-');
        const pCtx = canvasNode.getContext('2d', { willReadFrequently: true });
        if (!pCtx) return;
        pCtx.imageSmoothingEnabled = false;

        pCtx.clearRect(0, 0, canvasNode.width, canvasNode.height);
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, canvasNode.width, canvasNode.height);
        pCtx.strokeStyle = '#d7d7d7';
        pCtx.strokeRect(0.5, 0.5, canvasNode.width - 1, canvasNode.height - 1);

        if (target === 'module') {
            drawModulePreviewPattern(pCtx, style, '#111111');
        } else if (target === 'finder') {
            drawFinderPreviewPattern(pCtx, style, '#111111');
        } else if (target === 'align') {
            drawAlignPreviewPattern(pCtx, style, '#111111');
        }
    });
}

function syncStyleButtonState(target) {
    const buttons = target === 'module'
        ? moduleStyleButtons
        : (target === 'finder' ? finderStyleButtons : alignStyleButtons);
    const value = target === 'module'
        ? moduleStyle
        : (target === 'finder' ? finderStyle : alignStyle);
    if (!buttons) return;
    buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.style === value);
    });
}

function getModuleStyleLabel(style) {
    const map = {
        square: '方块',
        rounded: '圆角',
        circle: '圆点',
        diamond: '菱形',
        liquid: '液态'
    };
    return map[style] || '方块';
}

function getFinderStyleLabel(style) {
    const map = {
        classic: '经典',
        circle: '圆形',
        'polar-day': '极昼',
        'polar-night': '极夜',
        aurora: '极光'
    };
    return map[style] || '经典';
}

function getMaskModeLabel() {
    if (maskPattern === -1) return `自动（${bestAutoMask}）`;
    if (maskPattern === -2) return '无（展示掩码前）';
    return `掩码 ${maskPattern}`;
}

function updateOptionSummaries() {
    if (moduleStyleSummary) moduleStyleSummary.textContent = `${getModuleStyleLabel(moduleStyle)}`;
    if (finderStyleSummary) finderStyleSummary.textContent = `${getFinderStyleLabel(finderStyle)}`;
    if (alignStyleSummary) alignStyleSummary.textContent = `${getFinderStyleLabel(alignStyle)}`;
    if (maskModeSummary) maskModeSummary.textContent = `${getMaskModeLabel()}`;
}

function setupStyleGalleryButtons() {
    if (moduleStyleButtons) {
        moduleStyleButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                moduleStyle = btn.dataset.style || 'square';
                if (moduleStyleSelect) moduleStyleSelect.value = moduleStyle;
                syncStyleButtonState('module');
                updateOptionSummaries();
                renderQR(false);
            });
        });
    }
    if (finderStyleButtons) {
        finderStyleButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                finderStyle = btn.dataset.style || 'classic';
                if (finderStyleSelect) finderStyleSelect.value = finderStyle;
                syncStyleButtonState('finder');
                updateOptionSummaries();
                renderQR(false);
            });
        });
    }
    if (alignStyleButtons) {
        alignStyleButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                alignStyle = btn.dataset.style || 'classic';
                if (alignmentStyleSelect) alignmentStyleSelect.value = alignStyle;
                syncStyleButtonState('align');
                updateOptionSummaries();
                renderQR(false);
            });
        });
    }
}

function initSidebarSplitter() {
    const splitter = document.getElementById('sidebar-splitter');
    const container = document.querySelector('.container');
    if (!splitter || !container) return;

    let dragging = false;

    const onMove = (e) => {
        if (!dragging) return;
        const rect = container.getBoundingClientRect();
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        if (isPortrait) {
            const minH = 200;
            const maxH = rect.height - 200;
            let next = e.clientY - rect.top;
            next = Math.max(minH, Math.min(maxH, next));
            container.style.setProperty('--sidebar-size-portrait', `${next}px`);
        } else {
            const minW = 220;
            const maxW = rect.width - 220;
            let next = e.clientX - rect.left;
            next = Math.max(minW, Math.min(maxW, next));
            container.style.setProperty('--sidebar-size', `${next}px`);
        }
    };

    const onUp = () => {
        dragging = false;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
    };

    splitter.addEventListener('pointerdown', (e) => {
        dragging = true;
        e.preventDefault();
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    });
}

function resetSuffix() {
    currentSuffixBytes = [];
    lastCapacity = 0;
    payloadStartBit = 0;
    payloadEditableEndBit = 0;
    historyStack = [];
    historyStep = -1;
}

function isEditableDataCell(cell) {
    if (!cell || cell.type !== 'data') return false;
    return cell.globalBitIndex >= payloadStartBit && cell.globalBitIndex < payloadEditableEndBit;
}

function updateTextOverflowWarning(limitInfo) {
    if (!textOverflowWarning) return;
    if (!limitInfo || !limitInfo.exceeds) {
        textOverflowWarning.style.display = 'none';
        textOverflowWarning.textContent = '';
        return;
    }
    textOverflowWarning.style.display = 'block';
    textOverflowWarning.textContent = `${limitInfo.current}/${limitInfo.max}`;
}

function getEncodingValidationError(mode, text) {
    const s = text || '';
    if (!s) return '';
    if (mode === 'Numeric') {
        return /^[0-9]*$/.test(s) ? '' : '当前编码格式仅支持数字 0-9';
    }
    if (mode === 'Alphanumeric') {
        return /^[0-9A-Z $%*+\-./:]*$/.test(s)
            ? ''
            : '当前编码格式仅支持大写字母、数字与 $%*+-./:';
    }
    return '';
}

function updateEncodingWarning(message) {
    if (!encodingWarning) return;
    if (!message) {
        encodingWarning.style.display = 'none';
        encodingWarning.textContent = '';
        return;
    }
    encodingWarning.style.display = 'block';
    encodingWarning.textContent = message;
}

async function refitImageAfterQrUpdate(forceRecalc = false) {
    if (hasImageUpload && importState.active) {
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
        await applyImport(false, previewImg, forceRecalc);
    }
}

function updateArtisticWarning(stats) {
    if (!artisticWarning) return;
    if (!stats || !stats.hasTargets || stats.remainingMismatch <= 0) {
        artisticWarning.style.display = 'none';
        artisticWarning.textContent = '';
        return;
    }
    artisticWarning.style.display = 'block';
    const extra = (stats.coveredFreedomUsed > 0)
        ? `，已启用覆盖区补自由位 ${stats.coveredFreedomUsed}`
        : '';
    artisticWarning.textContent = `纠错区仅尽力拟合（未匹配 ${stats.remainingMismatch}/${stats.totalTargets}${extra}）`;
}

function formatDurationHMS(totalSeconds) {
    const sec = Math.max(0, Math.round(totalSeconds || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatProgressCount(value) {
    if (Number.isInteger(value)) return `${value}`;
    return `${Math.round(value * 10) / 10}`;
}

function showComputeOverlay(titleText, subtitleText, options = {}) {
    if (!computeOverlay) return;
    const showFrameProgress = !!options.showFrameProgress;
    computeCancelRequested = false;
    computeProgressStartMs = performance.now();
    computeProgressLastDone = 0;
    computeProgressLastTotal = 1;
    computeOverlay.style.display = 'flex';
    if (computeTitle) computeTitle.textContent = titleText || '计算中...';
    if (computeSubtitle) computeSubtitle.textContent = subtitleText || '正在处理';
    if (computeProgressBar) computeProgressBar.style.width = '0%';
    if (computeProgressText) computeProgressText.textContent = '0% (0/1) · 预计剩余 --:--';
    if (computeFrameProgressGroup) computeFrameProgressGroup.style.display = showFrameProgress ? 'block' : 'none';
    if (computeFrameProgressBar) computeFrameProgressBar.style.width = '0%';
    if (computeFrameProgressText) computeFrameProgressText.textContent = '0% (0/1)';
}

function setComputeProgress(done, total) {
    if (!computeOverlay || !computeProgressBar || !computeProgressText) return;
    const t = Math.max(1, total || 1);
    const d = Math.max(0, Math.min(t, done || 0));
    if (!computeProgressStartMs || d < computeProgressLastDone || t !== computeProgressLastTotal) {
        computeProgressStartMs = performance.now();
    }
    computeProgressLastDone = d;
    computeProgressLastTotal = t;

    const pct = Math.round((d / t) * 100);
    computeProgressBar.style.width = `${pct}%`;

    let etaText = '--:--';
    if (d >= t) {
        etaText = '00:00';
    } else if (d > 0) {
        const elapsedSec = (performance.now() - computeProgressStartMs) / 1000;
        if (elapsedSec > 0.05) {
            const speed = d / elapsedSec;
            if (speed > 0) {
                const remainSec = (t - d) / speed;
                etaText = formatDurationHMS(remainSec);
            }
        }
    }

    const frameMode = !!(computeFrameProgressGroup && computeFrameProgressGroup.style.display !== 'none');
    const shownDone = frameMode ? Math.min(t, Math.floor(d)) : Math.round(d);
    const shownTotal = frameMode ? Math.floor(t) : Math.round(t);
    computeProgressText.textContent = `${pct}% (${formatProgressCount(shownDone)}/${formatProgressCount(shownTotal)}) · 预计剩余 ${etaText}`;
}

function setFrameComputeProgress(done, total) {
    if (!computeOverlay || !computeFrameProgressBar || !computeFrameProgressText) return;
    const t = Math.max(1, total || 1);
    const d = Math.max(0, Math.min(t, done || 0));
    const pct = Math.round((d / t) * 100);
    computeFrameProgressBar.style.width = `${pct}%`;
    computeFrameProgressText.textContent = `${pct}% (${formatProgressCount(d)}/${formatProgressCount(t)})`;
}

function hideComputeOverlay() {
    if (!computeOverlay) return;
    computeOverlay.style.display = 'none';
}

function isFormatInfoCell(rr, cc, count) {
    if (rr === count - 8 && cc === 8) return true;
    if (cc === 8 && rr < 9) return true;
    if (cc === 8 && rr >= count - 8) return true;
    if (rr === 8 && cc < 9) return true;
    if (rr === 8 && cc >= count - 8) return true;
    return false;
}

function buildSuffixStringFromBytes(bytes, startBit, endBit) {
    let out = '';
    let ptr = startBit;
    while (ptr <= endBit - 8) {
        let val = 0;
        for (let i = 0; i < 8; i++) {
            const g = ptr + i;
            const bIdx = Math.floor(g / 8);
            const bitPos = 7 - (g % 8);
            if (bIdx < bytes.length && (bytes[bIdx] & (1 << bitPos))) {
                val |= (1 << (7 - i));
            }
        }
        out += String.fromCharCode(val);
        ptr += 8;
    }
    return out;
}

function collectBytesFromBitRange(bytes, startBit, endBit) {
    const out = [];
    let ptr = startBit;
    while (ptr <= endBit - 8) {
        let val = 0;
        for (let i = 0; i < 8; i++) {
            const g = ptr + i;
            const bIdx = Math.floor(g / 8);
            const bitPos = 7 - (g % 8);
            if (bIdx < bytes.length && (bytes[bIdx] & (1 << bitPos))) {
                val |= (1 << (7 - i));
            }
        }
        out.push(val & 0xff);
        ptr += 8;
    }
    return out;
}

function createQrFromSuffix(typeNumber, mask, hasSeparator, suffixStr, padBytes = null) {
    const qr = qrcode(typeNumber, eccLevel);
    if (userText && userText.length > 0) {
        try {
            if (encodingMode === 'Byte') qr.addData(unescape(encodeURIComponent(userText)), 'Byte');
            else qr.addData(userText, encodingMode);
        } catch (_) {
            qr.addData(unescape(encodeURIComponent(userText)), 'Byte');
        }
    }
    if (padBytes && padBytes.length > 0 && qr.setCustomPadBytes) {
        qr.setCustomPadBytes(padBytes);
    } else {
        qr.addData(hasSeparator ? ('#' + suffixStr) : suffixStr, 'Byte');
    }
    if (mask !== -1 && qr.makeMasked) qr.makeMasked(mask);
    else qr.make();
    return qr;
}

async function optimizeSuffixForArtisticMode(typeNumber, evalMask, hasSeparator, usePadFreedomMode = false, options = {}) {
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const isCanceled = typeof options.isCanceled === 'function' ? options.isCanceled : (() => false);
    const sourceImage = optimizationImageSourceOverride || previewImg;
    if (!pixelMap || !generatedQR || !sourceImage || !importState.active) {
        lastArtisticSolveStats = null;
        return { canceled: false };
    }
    const src = getSourceDimensions(sourceImage);
    if (src.width <= 0 || src.height <= 0) {
        lastArtisticSolveStats = null;
        return { canceled: false };
    }

    const basisMode = isImageBasisMode();
    const totalModules = generatedQR.getModuleCount() + 2 * qrMargin;
    let qrStartX = 0;
    let qrStartY = 0;
    let moduleW = CELL_SIZE;
    let moduleH = CELL_SIZE;
    let imageBoxX = 0;
    let imageBoxY = 0;
    let imageBoxW = Math.max(1, basisImageWidth || canvas.width || src.width);
    let imageBoxH = Math.max(1, basisImageHeight || canvas.height || src.height);

    const evalCanvasW = basisMode
        ? Math.max(1, Math.round(basisImageWidth || src.width))
        : (generatedQR.getModuleCount() + 2 * qrMargin) * CELL_SIZE;
    const evalCanvasH = basisMode
        ? Math.max(1, Math.round(basisImageHeight || src.height))
        : evalCanvasW;

    if (basisMode) {
        const basisBox = getBasisQrBoxInternal();
        qrStartX = basisBox.x;
        qrStartY = basisBox.y;
        moduleW = basisBox.width / totalModules;
        moduleH = basisBox.height / totalModules;
        imageBoxX = 0;
        imageBoxY = 0;
        imageBoxW = evalCanvasW;
        imageBoxH = evalCanvasH;
    } else {
        const displayW = parseFloat(canvas.style.width) || canvas.width || evalCanvasW;
        const displayH = parseFloat(canvas.style.height) || canvas.height || evalCanvasH;
        const box = getOverlayInnerBoxInternal(evalCanvasW, evalCanvasH, displayW, displayH);
        imageBoxX = box.x;
        imageBoxY = box.y;
        imageBoxW = Math.max(1, box.width);
        imageBoxH = Math.max(1, box.height);
    }

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = src.width;
    tmpCanvas.height = src.height;
    const tCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    tCtx.drawImage(sourceImage, 0, 0, src.width, src.height);
    const imgData = tCtx.getImageData(0, 0, src.width, src.height).data;

    const targetAt = (r, c) => {
        const cx = qrStartX + (c + qrMargin) * moduleW + moduleW / 2;
        const cy = qrStartY + (r + qrMargin) * moduleH + moduleH / 2;
        const localX = Math.floor(((cx - imageBoxX) / imageBoxW) * src.width);
        const localY = Math.floor(((cy - imageBoxY) / imageBoxH) * src.height);
        if (localX < 0 || localX >= src.width || localY < 0 || localY >= src.height) return null;
        const idx = (localY * src.width + localX) * 4;
        const rr = imgData[idx];
        const gg = imgData[idx + 1];
        const bb = imgData[idx + 2];
        const aa = imgData[idx + 3];
        if (aa < 10) return null;
        const a = aa / 255;
        const bg = parseHexColor(backgroundColor || '#ffffff');
        const rB = rr * a + bg.r * (1 - a);
        const gB = gg * a + bg.g * (1 - a);
        const bB = bb * a + bg.b * (1 - a);
        const lum = 0.299 * rB + 0.587 * gB + 0.114 * bB;
        return getTargetColorFromLuminance(lum);
    };

    const mutableByBlock = new Map();
    const coveredMutableByBlock = new Map();
    const ecTargetsByBlock = new Map();
    const count = generatedQR.getModuleCount();
    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            const cell = pixelMap[r] ? pixelMap[r][c] : null;
            if (!cell) continue;
            if (cell.type === 'ec' && !isFormatInfoCell(r, c, count)) {
                const t = targetAt(r, c);
                if (t !== null && Number.isFinite(cell.ecBlockRow) && cell.ecBlockRow >= 0) {
                    if (!ecTargetsByBlock.has(cell.ecBlockRow)) ecTargetsByBlock.set(cell.ecBlockRow, []);
                    ecTargetsByBlock.get(cell.ecBlockRow).push({ r, c, t });
                }
                continue;
            }
            if (!isEditableDataCell(cell)) continue;
            const t = targetAt(r, c);
            const byteIndex = Math.floor(cell.globalBitIndex / 8);
            const blockRow = dataByteBlockRow[byteIndex];
            if (!Number.isFinite(blockRow)) continue;
            if (t === null) {
                if (!mutableByBlock.has(blockRow)) mutableByBlock.set(blockRow, []);
                mutableByBlock.get(blockRow).push(cell.globalBitIndex);
            } else {
                if (!coveredMutableByBlock.has(blockRow)) coveredMutableByBlock.set(blockRow, []);
                coveredMutableByBlock.get(blockRow).push(cell.globalBitIndex);
            }
        }
    }

    if (!ecTargetsByBlock.size) {
        lastArtisticSolveStats = {
            hasTargets: false,
            totalTargets: 0,
            remainingMismatch: 0,
            coverageLimited: false
        };
        return { canceled: false };
    }

    const solveLinearGF2 = (matrix, rhs, varCount) => {
        const rowCount = matrix.length;
        const aug = matrix.map((row, i) => row.slice().concat([rhs[i] & 1]));
        let pivotRow = 0;
        const pivots = [];

        for (let col = 0; col < varCount && pivotRow < rowCount; col++) {
            let sel = -1;
            for (let r = pivotRow; r < rowCount; r++) {
                if (aug[r][col]) {
                    sel = r;
                    break;
                }
            }
            if (sel === -1) continue;
            if (sel !== pivotRow) {
                const tmp = aug[pivotRow];
                aug[pivotRow] = aug[sel];
                aug[sel] = tmp;
            }

            for (let r = 0; r < rowCount; r++) {
                if (r === pivotRow) continue;
                if (!aug[r][col]) continue;
                for (let c = col; c <= varCount; c++) {
                    aug[r][c] ^= aug[pivotRow][c];
                }
            }

            pivots.push({ row: pivotRow, col });
            pivotRow++;
        }

        for (let r = 0; r < rowCount; r++) {
            let allZero = true;
            for (let c = 0; c < varCount; c++) {
                if (aug[r][c]) {
                    allZero = false;
                    break;
                }
            }
            if (allZero && aug[r][varCount]) return null;
        }

        const x = new Array(varCount).fill(0);
        for (let i = pivots.length - 1; i >= 0; i--) {
            const p = pivots[i];
            let v = aug[p.row][varCount];
            for (let c = p.col + 1; c < varCount; c++) {
                if (aug[p.row][c]) v ^= x[c];
            }
            x[p.col] = v & 1;
        }
        return x;
    };

    const work = currentSuffixBytes.slice();
    let totalTargets = 0;
    let totalFreedoms = 0;
    let remainingMismatch = 0;
    let blocksNoFreedom = 0;
    let coveredFreedomUsed = 0;

    const allTargetRows = [...ecTargetsByBlock.keys()];
    const totalProgressSteps = Math.max(1, allTargetRows.length * 3);
    for (let bi = 0; bi < allTargetRows.length; bi++) {
        if (isCanceled()) return { canceled: true };
        const row = allTargetRows[bi];
        const primaryFreedoms = (mutableByBlock.get(row) || []);
        const coveredFreedoms = (coveredMutableByBlock.get(row) || []);
        let freedoms = [...new Set(primaryFreedoms)];
        const extraCoveredFreedoms = [...new Set(coveredFreedoms)].filter((g) => !freedoms.includes(g));
        const targets = (ecTargetsByBlock.get(row) || []);
        if (!targets.length) continue;
        totalTargets += targets.length;
        const allowCoveredFreedom = !!(allowCoveredFreedomCb && allowCoveredFreedomCb.checked);
        totalFreedoms += freedoms.length + (allowCoveredFreedom ? extraCoveredFreedoms.length : 0);
        if (!freedoms.length && allowCoveredFreedom && extraCoveredFreedoms.length) {
            freedoms = extraCoveredFreedoms.slice();
            coveredFreedomUsed += freedoms.length;
        }
        if (!freedoms.length) {
            blocksNoFreedom += 1;
            remainingMismatch += targets.length;
            if (onProgress) onProgress(bi * 3 + 3, totalProgressSteps);
            continue;
        }

        const evalQrBits = (bytes) => {
            const suffix = usePadFreedomMode ? '' : buildSuffixStringFromBytes(bytes, payloadStartBit, payloadEditableEndBit);
            const padBytes = usePadFreedomMode ? collectBytesFromBitRange(bytes, payloadStartBit, payloadEditableEndBit) : null;
            const qrEval = createQrFromSuffix(typeNumber, evalMask, hasSeparator, suffix, padBytes);
            const bits = new Array(targets.length);
            for (let i = 0; i < targets.length; i++) {
                const p = targets[i];
                bits[i] = qrEval.isDark(p.r, p.c) ? 1 : 0;
            }
            return bits;
        };

        const evalMismatchFromBits = (bits) => {
            let mismatch = 0;
            for (let i = 0; i < targets.length; i++) {
                if (bits[i] !== targets[i].t) mismatch++;
            }
            return mismatch;
        };

        const baseBits = evalQrBits(work);
        let bestMismatch = evalMismatchFromBits(baseBits);

        const rhs = new Array(targets.length);
        for (let i = 0; i < targets.length; i++) rhs[i] = baseBits[i] ^ targets[i].t;

        const matrix = Array.from({ length: targets.length }, () => new Array(freedoms.length).fill(0));
        for (let j = 0; j < freedoms.length; j++) {
            if (isCanceled()) return { canceled: true };
            const g = freedoms[j];
            const bIdx = Math.floor(g / 8);
            const bitPos = 7 - (g % 8);
            if (bIdx < 0 || bIdx >= work.length) continue;

            work[bIdx] ^= (1 << bitPos);
            const flipBits = evalQrBits(work);
            work[bIdx] ^= (1 << bitPos);

            for (let i = 0; i < targets.length; i++) {
                matrix[i][j] = baseBits[i] ^ flipBits[i];
            }

            if ((j & 31) === 31) {
                await cooperativeYield();
            }
        }
        if (onProgress) onProgress(bi * 3 + 1, totalProgressSteps);

        const solution = solveLinearGF2(matrix, rhs, freedoms.length);
        let workingBits = baseBits.slice();
        if (solution) {
            for (let j = 0; j < freedoms.length; j++) {
                if (isCanceled()) return { canceled: true };
                if (!solution[j]) continue;
                const g = freedoms[j];
                const bIdx = Math.floor(g / 8);
                const bitPos = 7 - (g % 8);
                if (bIdx < 0 || bIdx >= work.length) continue;
                work[bIdx] ^= (1 << bitPos);
            }
            workingBits = evalQrBits(work);
            bestMismatch = evalMismatchFromBits(workingBits);
        }
        if (onProgress) onProgress(bi * 3 + 2, totalProgressSteps);

        if (!solution) {
            workingBits = baseBits.slice();
            bestMismatch = evalMismatchFromBits(workingBits);
        }

        // Local improvement on top of linear solve result:
        // try beneficial single-bit flips using the precomputed influence matrix.
        const hillPasses = 3;
        for (let pass = 0; pass < hillPasses && bestMismatch > 0; pass++) {
            let improvedThisPass = false;
            for (let j = 0; j < freedoms.length; j++) {
                if (isCanceled()) return { canceled: true };
                let delta = 0;
                for (let i = 0; i < targets.length; i++) {
                    if (!matrix[i][j]) continue;
                    const beforeMismatch = workingBits[i] !== targets[i].t;
                    delta += beforeMismatch ? -1 : 1;
                }
                if (delta >= 0) continue;

                const g = freedoms[j];
                const bIdx = Math.floor(g / 8);
                const bitPos = 7 - (g % 8);
                if (bIdx < 0 || bIdx >= work.length) continue;
                work[bIdx] ^= (1 << bitPos);

                for (let i = 0; i < targets.length; i++) {
                    if (matrix[i][j]) workingBits[i] ^= 1;
                }

                bestMismatch += delta;
                improvedThisPass = true;
                if ((j & 63) === 63) {
                    await cooperativeYield();
                }
                if (bestMismatch <= 0) break;
            }
            if (!improvedThisPass) break;
        }

        // Final precise check against fully rebuilt QR state.
        bestMismatch = evalMismatchFromBits(evalQrBits(work));

        if (allowCoveredFreedom && extraCoveredFreedoms.length > 0 && bestMismatch > 0) {
            let usedCoveredInRow = 0;
            for (let pass = 0; pass < 2 && bestMismatch > 0; pass++) {
                let improved = false;
                for (let i = 0; i < extraCoveredFreedoms.length; i++) {
                    if (isCanceled()) return { canceled: true };
                    const g = extraCoveredFreedoms[i];
                    const bIdx = Math.floor(g / 8);
                    const bitPos = 7 - (g % 8);
                    if (bIdx < 0 || bIdx >= work.length) continue;

                    work[bIdx] ^= (1 << bitPos);
                    const nowMismatch = evalMismatchFromBits(evalQrBits(work));
                    if (nowMismatch <= bestMismatch) {
                        if (nowMismatch < bestMismatch) improved = true;
                        bestMismatch = nowMismatch;
                        usedCoveredInRow += 1;
                    } else {
                        work[bIdx] ^= (1 << bitPos);
                    }

                    if ((i & 31) === 31) {
                        await cooperativeYield();
                    }
                    if (bestMismatch <= 0) break;
                }
                if (!improved) break;
            }
            coveredFreedomUsed += usedCoveredInRow;
        }

        remainingMismatch += bestMismatch;

        if (onProgress) onProgress(bi * 3 + 3, totalProgressSteps);
        if ((bi & 1) === 1) {
            await cooperativeYield();
        }
    }

    currentSuffixBytes = work;
    lastArtisticSolveStats = {
        hasTargets: totalTargets > 0,
        totalTargets,
        remainingMismatch,
        coveredFreedomUsed,
        coverageLimited: blocksNoFreedom > 0 || totalFreedoms < totalTargets
    };
    return { canceled: false };
}

// --- Core Mapping Logic ---

function buildPixelMap(typeNumber, ecLevel, mask) {
    if(!qrcode.QRUtil || !qrcode.QRRSBlock) {
        console.error("Library not patched correctly. Missing exports.");
        return;
    }

    const moduleCount = typeNumber * 4 + 17;
    pixelMap = Array(moduleCount).fill().map(() => Array(moduleCount).fill(null));

    // Get RS Blocks
    const rsBlocks = qrcode.QRRSBlock.getRSBlocks(typeNumber, qrcode.QRErrorCorrectionLevel[ecLevel]);
    let tDcCount = 0;
    let maxDcCount = 0;
    rsBlocks.forEach(b => { 
        tDcCount += b.dataCount; 
        maxDcCount = Math.max(maxDcCount, b.dataCount);
    });
    totalDataBytes = tDcCount;
    totalDataBits = tDcCount * 8;

    dataByteBlockRow = new Array(tDcCount).fill(0);
    let dataByteOffset = 0;
    for (let r = 0; r < rsBlocks.length; r++) {
        const dc = rsBlocks[r].dataCount;
        for (let i = 0; i < dc; i++) dataByteBlockRow[dataByteOffset + i] = r;
        dataByteOffset += dc;
    }

    ecInterleavedBlockRow = [];
    ecInterleavedBlockCol = [];
    let maxEcCount = 0;
    rsBlocks.forEach((b) => {
        const ec = b.totalCount - b.dataCount;
        if (ec > maxEcCount) maxEcCount = ec;
    });
    for (let i = 0; i < maxEcCount; i++) {
        for (let r = 0; r < rsBlocks.length; r++) {
            const ec = rsBlocks[r].totalCount - rsBlocks[r].dataCount;
            if (i < ec) {
                ecInterleavedBlockRow.push(r);
                ecInterleavedBlockCol.push(i);
            }
        }
    }

    // Mark Reserved Function Areas (simulation)
    const markRect = (r1, c1, r2, c2) => {
        for(let r=r1; r<=r2; r++) for(let c=c1; c<=c2; c++) {
            if(r>=0 && r<moduleCount && c>=0 && c<moduleCount) pixelMap[r][c] = { type: 'func' };
        }
    };
    
    markRect(0,0,8,8); // Finder TL
    markRect(0, moduleCount-8, 8, moduleCount-1); // Finder TR
    markRect(moduleCount-8, 0, moduleCount-1, 8); // Finder BL
    
    // Alignment (Must check collision with Finders)
    if (typeNumber >= 2) {
        let positions = qrcode.QRUtil.getPatternPosition(typeNumber);
        for(let i=0; i<positions.length; i++) {
            for(let j=0; j<positions.length; j++) {
                let r = positions[i];
                let c = positions[j];
                // Checks if center (r,c) is already occupied (by Finder)
                // If occupied, skip. Else mark 5x5 region.
                if (!pixelMap[r] || !pixelMap[r][c]) {
                    markRect(r-2, c-2, r+2, c+2);
                }
            }
        }
    }

    // Timing Patterns (After Alignment, in library order, but for marking 'func', 
    // it effectively occupies space if not already occupied).
    // Library logic: Skips if occupied.
    // Our logic: Mark 'func'. If it overwrites Alignment, it's still 'func'. 
    // But we must NOT overwrite valid Alignment with Data.
    // Actually, Library draws Timing Pattern over Alignment? No, Timing skips.
    // So if (pixelMap[i][6]) is Alignment, we keep it as Alignment. 
    // But both are Func.
    // The only danger is if we leave a hole.
    for(let i=0; i<moduleCount; i++) {
        // Mark Timing Vertical
        pixelMap[i][6] = { type: 'func' }; 
        // Mark Timing Horizontal
        pixelMap[6][i] = { type: 'func' }; 
    }
    
    // Version Info
    if (typeNumber >= 7) {
        markRect(0, moduleCount-11, 5, moduleCount-9);
        markRect(moduleCount-11, 0, moduleCount-9, 5);
    }
    
    // --- De-Interleaving Lookup ---
    // Standard Interleaving Rule: 
    // Take byte 0 from Block 1, Byte 0 from Block 2...
    // Flatten this to get the "Stream Byte Index".
    // We want reverse: StreamByteIndex -> LinearByteIndex (where Linear is concatenated blocks).
    // Actually, qrcode logic places Interleaved Sequence onto the Matrix.
    // So "StreamByteIndex" in ZigZag == "Interleaved Index".
    // We need to map "Interleaved Index" -> "Original Data Index".
    
    // Construct the "Interleaved to Original" Map
    const interleavedToLinear = new Array(tDcCount);
    let k = 0; // interleaved index
    for (let i = 0; i < maxDcCount; i++) {
        for (let r = 0; r < rsBlocks.length; r++) {
            if (i < rsBlocks[r].dataCount) {
                // Calculate "Original Linear Index" of Byte i in Block r
                // Original Index = (Sum of prev blocks data count) + i
                let offset = 0;
                for(let prev=0; prev<r; prev++) offset += rsBlocks[prev].dataCount;
                interleavedToLinear[k] = offset + i;
                k++;
            }
        }
    }

    // --- ZigZag Scan ---
    let inc = -1;
    let row = moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = qrcode.QRUtil.getMaskFunction(mask);

    for (let col = moduleCount - 1; col > 0; col -= 2) {
        if (col == 6) col -= 1;
        while (true) {
            for (let c = 0; c < 2; c += 1) {
                if (pixelMap[row][col - c] === null) {
                    // Start placing Data
                    // Then EC
                    // Check if we are in Data range
                    let type = 'ec';
                    let globalBit = -1;
                    let ecInterleavedByte = -1;
                    let ecBlockRow = -1;
                    let ecBlockCol = -1;
                    
                    if (byteIndex < tDcCount) {
                        type = 'data';
                        // Map Interleaved Byte -> Original Byte
                        const origByte = interleavedToLinear[byteIndex];
                        // FIXED: Bit Order. Library places MSB first (Bit 7).
                        // Our bitIndex goes 7 -> 6 -> ... 0.
                        // So first pixel (bitIndex 7) should map to logical Bit 7 of the byte? 
                        // Wait. buffer.put writes MSB at current buffer pos.
                        // If we write 0x80 (10000000), buffer has 1 at pos 0.
                        // Matrix takes bit at pos 0.
                        // So P1 (bitIndex 7) corresponds to Bit MSB.
                        // My `writeBufferBits` (and `drawAt`) handles buffer index.
                        // `drawAt`: bitPos = 7 - (globalPos % 8).
                        // If globalPos = X*8 + 0 => bitPos = 7 (MSB).
                        // So we want P1 (bitIndex 7) to have globalPos with remainder 0.
                        // So globalBit = origByte * 8 + (7 - bitIndex).
                        // When bitIndex=7, globalBit = +0. Remainder 0. bitPos=7 (MSB). Correct.
                        // When bitIndex=0, globalBit = +7. Remainder 7. bitPos=0 (LSB). Correct.
                        globalBit = origByte * 8 + (7 - bitIndex); 
                    } else {
                        ecInterleavedByte = byteIndex - tDcCount;
                        ecBlockRow = ecInterleavedBlockRow[ecInterleavedByte] ?? -1;
                        ecBlockCol = ecInterleavedBlockCol[ecInterleavedByte] ?? -1;
                    }
                    
                    pixelMap[row][col-c] = {
                        type: type,
                        globalBitIndex: globalBit,
                        maskVal: maskFunc(row, col-c) ? 1 : 0,
                        ecInterleavedByte: ecInterleavedByte,
                        ecBlockRow: ecBlockRow,
                        ecBlockCol: ecBlockCol
                    };

                    bitIndex -= 1;
                    if (bitIndex == -1) {
                        byteIndex += 1;
                        bitIndex = 7;
                    }
                }
            }
            row += inc;
            if (row < 0 || moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
            }
        }
    }
}


// --- Update Logic ---

let lastState = { ver: -1, ecc: '', mask: -100 };

function fitToScreen() {
    // Reset Zoom to fit the container
    // We should measure the available space in .preview-area, 
    // because .canvas-wrapper shrinks to content.
    const container = document.querySelector('.preview-area'); 
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const w = rect.width - 80; // Approximate padding/margin safety
    const h = rect.height - 80; 
    
    if (w <= 0 || h <= 0) {
        zoomLevel = 1; // Fallback
        return;
    }
    
    // QR Size
    // typeNumber is in lastState.ver
    // If lastState.ver is invalid, guess based on 1
    const ver = lastState.ver > 0 ? lastState.ver : 1;
    const count = ver * 4 + 17;
    const baseSize = (count + 2 * qrMargin) * CELL_SIZE;
    
    const scale = Math.min(w / baseSize, h / baseSize);
    
    // Apply initial zoom (90% of fit)
    zoomLevel = Math.max(0.1, scale * 0.9);
}
function setSuffixUniform(targetColor) { // targetColor: 0=White, 1=Black
    if (!pixelMap) return;
    const basisMode = isImageBasisMode();
    let checkCoverage = false;
    let imgData = null;
    let sourceW = 0;
    let sourceH = 0;
    let qrStartX = 0;
    let qrStartY = 0;
    let moduleW = CELL_SIZE;
    let moduleH = CELL_SIZE;
    let imageBoxX = 0;
    let imageBoxY = 0;
    let imageBoxW = 1;
    let imageBoxH = 1;

    if (previewImg.src && importState.width > 0) {
        const src = getSourceDimensions(previewImg);
        sourceW = src.width;
        sourceH = src.height;
        if (sourceW > 0 && sourceH > 0) {
            checkCoverage = true;
            try {
                const tc = document.createElement('canvas');
                tc.width = sourceW;
                tc.height = sourceH;
                const tempCtx = tc.getContext('2d', { willReadFrequently: true });
                tempCtx.drawImage(previewImg, 0, 0, sourceW, sourceH);
                imgData = tempCtx.getImageData(0, 0, sourceW, sourceH);

                const count = generatedQR ? generatedQR.getModuleCount() : pixelMap.length;
                const totalModules = count + 2 * qrMargin;
                if (basisMode) {
                    const basisBox = getBasisQrBoxInternal();
                    qrStartX = basisBox.x;
                    qrStartY = basisBox.y;
                    moduleW = basisBox.width / totalModules;
                    moduleH = basisBox.height / totalModules;
                    imageBoxX = 0;
                    imageBoxY = 0;
                    imageBoxW = canvas.width;
                    imageBoxH = canvas.height;
                } else {
                    const displayW = parseFloat(canvas.style.width) || canvas.width;
                    const displayH = parseFloat(canvas.style.height) || canvas.height;
                    const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
                    qrStartX = 0;
                    qrStartY = 0;
                    moduleW = CELL_SIZE;
                    moduleH = CELL_SIZE;
                    imageBoxX = box.x;
                    imageBoxY = box.y;
                    imageBoxW = Math.max(1, box.width);
                    imageBoxH = Math.max(1, box.height);
                }
            } catch (e) {
                console.warn('Cannot read image data (CORS?):', e);
                checkCoverage = false;
            }
        }
    }

    const len = pixelMap.length;
    for(let r=0; r<len; r++) {
        for(let c=0; c<len; c++) {
            const cell = pixelMap[r][c];
            if (isEditableDataCell(cell)) {
                 
                 let effectiveTarget = targetColor;
                 let needsChange = true;

                 if (checkCoverage && imgData) {
                     const modCX = qrStartX + (c + qrMargin) * moduleW + moduleW / 2;
                     const modCY = qrStartY + (r + qrMargin) * moduleH + moduleH / 2;
                            const ix = Math.floor(((modCX - imageBoxX) / imageBoxW) * sourceW);
                            const iy = Math.floor(((modCY - imageBoxY) / imageBoxH) * sourceH);

                     if (ix >= 0 && iy >= 0 && ix < imgData.width && iy < imgData.height) {
                             const idx = (iy * imgData.width + ix) * 4;
                             const rVal = imgData.data[idx];
                             const gVal = imgData.data[idx+1];
                             const bVal = imgData.data[idx+2];
                             const aVal = imgData.data[idx+3];
                             if (aVal < 10) {
                                 effectiveTarget = targetColor;
                             } else {
                             
                                 const bgVal = (targetColor === 0) ? 255 : 0; // targetColor 0=White, 1=Black.
                                 const fA = aVal / 255.0;
                                 const blendR = rVal * fA + bgVal * (1 - fA);
                                 const blendG = gVal * fA + bgVal * (1 - fA);
                                 const blendB = bVal * fA + bgVal * (1 - fA);
                                 const luma = 0.299 * blendR + 0.587 * blendG + 0.114 * blendB;
                                 effectiveTarget = getTargetColorFromLuminance(luma);
                             }
                     }
                 }
            
                 if (needsChange) {
                    const maskBit = (maskPattern === -2) ? 0 : cell.maskVal; // 0 or 1
                    // We want Pixel = effectiveTarget
                    // Pixel = Data ^ Mask
                    // Data = Pixel ^ Mask = effectiveTarget ^ Mask
                    
                    const globalPos = cell.globalBitIndex;
                    const bIdx = Math.floor(globalPos / 8);
                    const bitPos = 7 - (globalPos % 8);
                    
                    if (bIdx < currentSuffixBytes.length) {
                        const reqBit = effectiveTarget ^ maskBit;
                        if(reqBit) currentSuffixBytes[bIdx] |= (1<<bitPos);
                        else currentSuffixBytes[bIdx] &= ~(1<<bitPos);
                    }
                 }
            }
        }
    }
}

function stringToUtf8ByteArray(str) {
    // Basic unescape/encodeURIComponent hack for UTF-8 bytes
    const utf8Str = unescape(encodeURIComponent(str));
    const arr = [];
    for(let i = 0; i < utf8Str.length; i++) {
        arr.push(utf8Str.charCodeAt(i));
    }
    return arr;
}
   
async function updateQR(options = {}) {
    const runId = ++qrComputeRunId;
    const skipArtisticPass = !!options.skipArtisticPass;
    const encodingError = getEncodingValidationError(encodingMode, userText || '');
    const artisticModeOn = document.getElementById('artistic-mode') && document.getElementById('artistic-mode').checked;
    const shouldShowCompute = artisticModeOn && hasImageUpload && importState.active && !skipArtisticPass && !suppressComputeOverlay;
    const usePadFreedomMode = true;
    padFreedomModeActive = usePadFreedomMode;
    if (shouldShowCompute) {
        showComputeOverlay('计算中...', '正在准备求解任务');
        setComputeProgress(0, 100);
    }
    updateEncodingWarning(encodingError);
    if (encodingError) {
        updateTextOverflowWarning(null);
        updateArtisticWarning(null);
        if (!suppressComputeOverlay) hideComputeOverlay();
        return;
    }

    // 1. Calculate Minimum Version Required by iterating capacities
    // This replaces the old try-catch method which often defaulted to 1.
    let minVersion = 1;
    
    // Define overhead for length indicators (Bits)
    // Mode: Numeric(1), Alphanumeric(2), Byte(4)
    // Ver: 1-9, 10-26, 27-40
    const getLengthBits = (mode, v) => {
        if (mode === 'Numeric') return v < 10 ? 10 : (v < 27 ? 12 : 14);
        if (mode === 'Alphanumeric') return v < 10 ? 9 : (v < 27 ? 11 : 13);
        return v < 10 ? 8 : 16; // Byte
    };

    const getBitLength = (mode, text) => {
        if (!text) return 0;
        if (mode === 'Numeric') {
            const len = text.length;
            const d3 = Math.floor(len / 3);
            const rem = len % 3;
            return d3 * 10 + (rem === 2 ? 7 : (rem === 1 ? 4 : 0));
        }
        if (mode === 'Alphanumeric') {
            const len = text.length;
            const d2 = Math.floor(len / 2);
            const rem = len % 2;
            return d2 * 11 + (rem === 1 ? 6 : 0);
        }
        // Byte (UTF-8)
        const utf8 = unescape(encodeURIComponent(text));
        return utf8.length * 8;
    };

    const getMaxInputCountForV40 = (mode, budgetBits) => {
        if (budgetBits <= 0) return 0;
        if (mode === 'Byte') return Math.floor(budgetBits / 8);
        let n = 0;
        while (true) {
            const testText = '0'.repeat(n + 1);
            if (getBitLength(mode, testText) > budgetBits) break;
            n += 1;
        }
        return n;
    };

    // We need to fit User Text (Segment 1) + Suffix/Padding (Segment 2)
    // Segment 2 payload can be zero-length. Only count '#' when it is actually appended.
    const hasSeparatorForEst = appendHash && !!(userText && userText.length > 0);
    const seg2PayloadBits = hasSeparatorForEst ? 8 : 0;
    
    for (let v = 1; v <= 40; v++) {
        // Get Capacity
        const rsBlocks = qrcode.QRRSBlock.getRSBlocks(v, qrcode.QRErrorCorrectionLevel[eccLevel]);
        let capacityBytes = 0;
        rsBlocks.forEach(b => capacityBytes += b.dataCount);
        const capacityBits = capacityBytes * 8;

        let totalBits = 0;

        // Segment 1: User Text
        if (userText && userText.length > 0) {
            totalBits += 4; // Mode
            totalBits += getLengthBits(encodingMode, v);
            totalBits += getBitLength(encodingMode, userText);
        }

        // Segment 2: Suffix (disabled when using pad freedom mode)
        if (!usePadFreedomMode) {
            totalBits += 4; // Mode (Byte)
            totalBits += getLengthBits('Byte', v);
            totalBits += seg2PayloadBits;
        }

        if (totalBits <= capacityBits) {
             minVersion = v;
             break;
        }
        if (v === 40) minVersion = 40;
    }

    const rsBlocks40 = qrcode.QRRSBlock.getRSBlocks(40, qrcode.QRErrorCorrectionLevel[eccLevel]);
    let capacityBits40 = 0;
    rsBlocks40.forEach((b) => { capacityBits40 += b.dataCount; });
    capacityBits40 *= 8;
    const seg1HeaderBits40 = (userText && userText.length > 0) ? (4 + getLengthBits(encodingMode, 40)) : 0;
    const seg2FixedBits40 = usePadFreedomMode ? 0 : (4 + getLengthBits('Byte', 40) + seg2PayloadBits);
    const budgetBits40 = capacityBits40 - seg1HeaderBits40 - seg2FixedBits40;
    const totalBitsAt40 = seg1HeaderBits40 + ((userText && userText.length > 0) ? getBitLength(encodingMode, userText) : 0) + seg2FixedBits40;
    const fitsAtV40 = totalBitsAt40 <= capacityBits40;
    const maxCount40 = getMaxInputCountForV40(encodingMode, budgetBits40);
    const currentCount = encodingMode === 'Byte'
        ? unescape(encodeURIComponent(userText || '')).length
        : (userText || '').length;

    updateTextOverflowWarning({
        exceeds: !fitsAtV40,
        max: Math.max(0, maxCount40),
        current: currentCount
    });

    if (!fitsAtV40) {
        updateArtisticWarning(null);
        if (!suppressComputeOverlay) hideComputeOverlay();
        return;
    }

    // 2. Adjust Logic for Slider
    // We allow Slider Min to be 0 (for Auto), so we DON'T force min attribute to minVersion.
    // Instead we use logic to snap invalid manual values.
    /* 
    if (verRange.min != minVersion) {
        verRange.min = minVersion;
    }
    */

    let typeNumber = version;
    
    // If user's selected version is too small (and not Auto/0), upgrade it.
    if (typeNumber > 0 && typeNumber < minVersion) {
        typeNumber = minVersion;
        // Check Validity and Auto-Upgrade the slider/input
        version = minVersion;
        verRange.value = minVersion;
        const vInput = document.getElementById('version-input');
        if(vInput) vInput.value = minVersion;
    }
    
    if (typeNumber === 0) {
        typeNumber = minVersion;
    }

    if (isImageBasisMode() && importState.active) {
        const basisCount = typeNumber * 4 + 17;
        syncCellSizeFromBasisBox(basisCount);
    }
    
    // Check if verDisplay exists logic replaced:
    const vInput = document.getElementById('version-input');
    if(vInput && version === 0 && document.activeElement !== vInput) {
         // If auto (0), show the calculated version as placeholder or value?
         // User wants to see "0" usually, but maybe they want to see "Auto (3)"?
         // Input type=number showing "0" is fine. We can explain it in UI.
         // Actually better: If version is 0, keep input as 0.
         // Do not overwrite input with typeNumber if mode is Auto.
    }
    
    const isNoMask = maskPattern === -2;
    let maskForMake = isNoMask ? -1 : maskPattern;
    // If mask is Auto (-1), use Dummy Mask 0 for capacity/structure calculation
    const tempMask = (maskForMake === -1) ? 0 : maskForMake;

    // Rebuild Map check
    const needRebuild = !pixelMap || 
                        pixelMap.length !== typeNumber*4+17 ||
                        lastState.ver !== typeNumber ||
                        lastState.ecc !== eccLevel ||
                        // If mask is fixed, check it. If Auto, we always rebuild in drawGrid, 
                        // but here we just need structure for Data calc. 
                        (maskForMake !== -1 && lastState.mask !== maskForMake) ||
                        (maskForMake === -1 && lastState.mask === -100); // Init case

    if (needRebuild) {
        buildPixelMap(typeNumber, eccLevel, tempMask);
        lastState = { ver: typeNumber, ecc: eccLevel, mask: tempMask }; // Temp state
        if (!isImageBasisMode()) {
            fitToScreen();
        }
    }
    
    // Fill Suffix Buffer to Capacity
    const capacityBytes = totalDataBits / 8;
    if (currentSuffixBytes.length !== capacityBytes) {
        currentSuffixBytes = new Array(capacityBytes).fill(32); // fill space
    }

    // Helper to write bits to buffer
    const writeBufferBits = (buffer, targetBitArray) => {
        const len = buffer.getLengthInBits();
        for(let i=0; i<len; i++) {
             const bit = buffer.getAt(i);
             const bIdx = Math.floor(i / 8);
             const bitPos = 7 - (i % 8);
             if(bIdx < targetBitArray.length) {
                 if(bit) targetBitArray[bIdx] |= (1<<bitPos);
                 else targetBitArray[bIdx] &= ~(1<<bitPos);
             }
        }
        return len;
    };

    // Construct Prefix BitStream using Library
    // This handles Mode Indicator + Count Indicator + Data
    const prefixBuffer = new qrcode.QRBitBuffer();
    
    // Segment 1: User Text (Only if not empty)
    if (userText && userText.length > 0) {
        let data1;
        try {
            if (encodingMode === 'Numeric') data1 = new qrcode.QRNumber(userText);
            else if (encodingMode === 'Alphanumeric') data1 = new qrcode.QRAlphaNum(userText);
            else {
                 // Use custom UTF-8 bytes for Chinese support
                 // QR8bitByte expects a string, but treats it as bytes (charCodeAt < 256).
                 // So we pass the "binary string" representation of UTF-8.
                 const utf8Str = unescape(encodeURIComponent(userText));
                 data1 = new qrcode.QR8bitByte(utf8Str); 
            }
        } catch(e) {
            // Fallback if data invalid for mode (e.g. "ABC" in Numeric)
            console.warn("Encoding failed for mode " + encodingMode + ", falling back to Byte.");
            const utf8Str = unescape(encodeURIComponent(userText));
            data1 = new qrcode.QR8bitByte(utf8Str);
            // We should ideally update UI or minVersion calc, but simple fallback is safe for now.
            // Note: If we fallback here, the `minVersion` calc above might have been wrong (it used getBitLength of wrong mode).
            // But since Byte mode covers everything, and typically requires MORE bits than Numeric/Alpha, 
            // if we sized for Numeric but switched to Byte, we might overflow.
            // So we really should catch this BEFORE minVersion calc or inside it.
            // However, implementing full validation in `updateQR` loop is expensive.
            // Let's rely on standard logic: If user forces Numeric but writes Text, we can't save them perfectly.
            // But fallback prevents crash.
        }
        
        // Seg 1 Header manual write
        prefixBuffer.put(data1.getMode(), 4);
        prefixBuffer.put(data1.getLength(), qrcode.QRUtil.getLengthInBits(data1.getMode(), typeNumber));
        data1.write(prefixBuffer);
    }
    
    let hasSeparator = false;
    if (!usePadFreedomMode) {
        // Segment 2 Header: For the Suffix Part
        // We treat Suffix as the rest (Byte Mode)
        // 1. Mode (Byte = 4, 4 bits)
        prefixBuffer.put(4, 4);

        // 2. Separator '#' (Only if User Text exists)
        hasSeparator = appendHash;

        // 3. Count Indicator
        const countBits = typeNumber < 10 ? 8 : 16;

        // Calculate available bits for suffix
        const currentBits = prefixBuffer.getLengthInBits();

        // available = Total - CurrentPrefix - LenHeader of Seg2
        const availableBits = totalDataBits - currentBits - countBits;

        // Suffix Payload = Separator(#) + SuffixData
        const maxPayloadBytes = Math.floor(availableBits / 8);

        prefixBuffer.put(maxPayloadBytes, countBits);

        // 4. The '#' Character (if needed)
        if (hasSeparator) {
            prefixBuffer.put(0x23, 8);
        }

        // Now we have the full Prefix Bitstream (Seg1 + Seg2Header + Possible#)
        writeBufferBits(prefixBuffer, currentSuffixBytes);

        payloadStartBit = prefixBuffer.getLengthInBits();
        const editableSuffixBytes = Math.max(0, maxPayloadBytes - (hasSeparator ? 1 : 0));
        payloadEditableEndBit = Math.min(totalDataBits, payloadStartBit + editableSuffixBytes * 8);
    } else {
        // Pad freedom mode: keep only actual user payload and expose pad bytes as freedom bits.
        writeBufferBits(prefixBuffer, currentSuffixBytes);
        const segBits = prefixBuffer.getLengthInBits();
        const termBits = Math.min(4, Math.max(0, totalDataBits - segBits));
        const afterTermBits = segBits + termBits;
        payloadStartBit = Math.min(totalDataBits, Math.ceil(afterTermBits / 8) * 8);
        payloadEditableEndBit = totalDataBits;
    }

    if (!skipArtisticPass && artisticModeOn && hasImageUpload && importState.active) {
        const evalMask = (maskForMake === -1) ? 0 : maskForMake;
        if (!suppressComputeOverlay && computeSubtitle) computeSubtitle.textContent = '正在拟合纠错码区';
        try {
            const result = await optimizeSuffixForArtisticMode(typeNumber, evalMask, hasSeparator, usePadFreedomMode, {
                onProgress: (done, total) => {
                    if (suppressComputeOverlay) {
                        setFrameComputeProgress(done, total);
                        if (animatedFrameProgressContext && animatedFrameProgressContext.totalFrames > 0) {
                            const t = Math.max(1, total || 1);
                            const d = Math.max(0, Math.min(t, done || 0));
                            const overallDone = animatedFrameProgressContext.frameIndex + (d / t);
                            setComputeProgress(overallDone, animatedFrameProgressContext.totalFrames);
                        }
                    } else {
                        setComputeProgress(done, total);
                        setFrameComputeProgress(done, total);
                    }
                },
                isCanceled: () => computeCancelRequested || runId !== qrComputeRunId
            });
            if (result && result.canceled) {
                if (!suppressComputeOverlay) hideComputeOverlay();
                return;
            }
            if (!suppressComputeOverlay) {
                setComputeProgress(100, 100);
                setFrameComputeProgress(100, 100);
            }
        } finally {
            if (!suppressComputeOverlay) hideComputeOverlay();
        }
    } else {
        lastArtisticSolveStats = null;
        if (!suppressComputeOverlay) hideComputeOverlay();
    }
    updateArtisticWarning(lastArtisticSolveStats);
    
    // RENDER
    // Reconstruct Suffix String to pass to Lib
    // We need to extract Suffix Chars from `currentSuffixBytes` starting at `payloadStartBit`.
    
    let constructedSuffix = ""; // Fixed: Renamed from suffixStr to avoid conflict
    let ptr = payloadStartBit;
    
    // Read 8-bit chunks
    while(ptr <= totalDataBits - 8) {
        let val = 0;
        for(let i=0; i<8; i++) {
            const globalPos = ptr + i;
            const bIdx = Math.floor(globalPos / 8);
            const bitPos = 7 - (globalPos % 8);
            // Safe access
            if (bIdx < currentSuffixBytes.length) {
                if (currentSuffixBytes[bIdx] & (1<<bitPos)) val |= (1 << (7-i));
            }
        }
        // This 'val' is a raw byte (0-255).
        // Since we are creating a "Byte Mode" string for `QR8bitByte`,
        // each charCode must be 0-255.
        // String.fromCharCode(val) creates a UTF-16 unit with value < 256.
        // `qrcode` lib will read it as byte.
        constructedSuffix += String.fromCharCode(val);
        ptr += 8;
    }
    
    let padBytesForRender = null;
    if (usePadFreedomMode) {
        constructedSuffix = '';
        padBytesForRender = collectBytesFromBitRange(currentSuffixBytes, payloadStartBit, payloadEditableEndBit);
    }

    drawGrid(constructedSuffix, typeNumber, maskForMake, hasSeparator, padBytesForRender); 
    updateMaskControls();
    refreshCellSizeAutoButtonVisibility();
}

function drawGrid(suffixStr, type, mask, hasSeparator, padBytesForRender = null) {
    let qr = qrcode(type, eccLevel);
    
    // Add Segment 1
    if (userText && userText.length > 0) {
        try {
            if (encodingMode === 'Byte') {
                 // For library, pass the UTF-8 encoded "binary string"
                 qr.addData(unescape(encodeURIComponent(userText)), 'Byte');
            } else {
                 // Numeric/AlphaNum
                 qr.addData(userText, encodingMode);
            }
        } catch(e) {
             // Fallback
             qr.addData(unescape(encodeURIComponent(userText)), 'Byte');
        }
    }
    
    if (padBytesForRender && padBytesForRender.length > 0 && qr.setCustomPadBytes) {
        qr.setCustomPadBytes(padBytesForRender);
    } else {
        // Add Segment 2
        let seg2Data = suffixStr;
        if (hasSeparator) seg2Data = "#" + suffixStr;
        qr.addData(seg2Data, 'Byte');
    }

    // Critical: Mask
    // If mask is -1, use make() to calculate best penalty. Else force mask.
    if (mask !== -1 && qr.makeMasked) {
        qr.makeMasked(mask);
    } else {
        qr.make(); // Auto
    }

    // Sync PixelMap to the chosen Auto Mask
    // This allows visual logic (Artistic Mode) to see the correct mask values
    if (mask === -1 && qr.maskPattern !== undefined) {
         const realMask = qr.maskPattern;
         // Rebuild Map with Real Mask
         buildPixelMap(type, eccLevel, realMask);
         lastState.mask = realMask; // Update state so we don't rebuild unnecessarily next time?
            bestAutoMask = realMask;
         // Actually, if maskPattern is -1, we loop via updateQR -> tempMask 0 -> Rebuild 0.
         // Then here Rebuild Real.
         // This is fine.
    }
    
    // Store QR and Render
    generatedQR = qr;
    renderQR(false);
}

function renderQR(isExport, imageOverride) {
    if (!generatedQR) return;
    const count = generatedQR.getModuleCount();
    const baseSize = (count + 2 * qrMargin) * CELL_SIZE;
    const imageSource = imageOverride || previewImg;
    const srcDim = getSourceDimensions(imageSource);
    const imageReady = srcDim.width > 0 && srcDim.height > 0;
    const basisMode = isImageBasisMode();

    let canvasW = baseSize;
    let canvasH = baseSize;
    if (basisMode && imageReady) {
        // In image-basis mode, keep image pixel size fixed.
        canvasW = Math.max(1, Math.round(basisImageWidth || srcDim.width));
        canvasH = Math.max(1, Math.round(basisImageHeight || srcDim.height));
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    const displayW = Math.max(1, Math.floor(canvasW * zoomLevel));
    const displayH = Math.max(1, Math.floor(canvasH * zoomLevel));
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    canvas.style.transform = '';
    canvas.style.imageRendering = 'pixelated';
    canvasWrapper.style.aspectRatio = `${canvasW} / ${canvasH}`;

    const fgColor = foregroundColor || '#000000';
    const bgColor = backgroundColor || '#ffffff';
    const embedImage = document.getElementById('embed-image-cb') && document.getElementById('embed-image-cb').checked;
    const artisticMode = document.getElementById('artistic-mode') && document.getElementById('artistic-mode').checked;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let imgDrawX = 0, imgDrawY = 0, imgDrawW = 0, imgDrawH = 0;
    let hasImage = false;
    let offData = null;
    let bgData = null;

    if (imageReady && importState.width > 0 && (basisMode || embedImage || artisticMode)) {
        try {
            hasImage = true;
            if (basisMode) {
                imgDrawX = 0;
                imgDrawY = 0;
                imgDrawW = canvas.width;
                imgDrawH = canvas.height;
            } else {
                const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
                imgDrawX = box.x;
                imgDrawY = box.y;
                imgDrawW = box.width;
                imgDrawH = box.height;
            }

            const offCan = document.createElement('canvas');
            offCan.width = canvas.width;
            offCan.height = canvas.height;
            const offCtx = offCan.getContext('2d', { willReadFrequently: true });
            offCtx.clearRect(0, 0, offCan.width, offCan.height);
            offCtx.drawImage(imageSource, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
            offData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;

            const shouldDrawBg = basisMode || (embedImage && (isExport || !importState.active));
            if (shouldDrawBg) {
                ctx.drawImage(imageSource, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
            }
            bgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error(e);
        }
    }

    let qrOriginX = 0;
    let qrOriginY = 0;
    let qrW = (count + 2 * qrMargin) * CELL_SIZE;
    let qrH = qrW;
    if (basisMode && importState.active && importState.width > 0) {
        const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
        qrOriginX = box.x;
        qrOriginY = box.y;
        qrW = Math.max(1, box.width);
        qrH = Math.max(1, box.height);
    }

    const moduleW = qrW / (count + 2 * qrMargin);
    const moduleH = qrH / (count + 2 * qrMargin);

    const sampleModuleCoverage = (x, y, w, h) => {
        if (!offData || w <= 0 || h <= 0) {
            return { coverage: 0, lum: 0.5, transparent: true };
        }
        const x0 = Math.max(0, Math.floor(x));
        const y0 = Math.max(0, Math.floor(y));
        const x1 = Math.min(canvas.width - 1, Math.ceil(x + w) - 1);
        const y1 = Math.min(canvas.height - 1, Math.ceil(y + h) - 1);
        if (x1 < x0 || y1 < y0) {
            return { coverage: 0, lum: 0.5, transparent: true };
        }

        const sampleCols = 8;
        const sampleRows = 8;
        let total = 0;
        let opaque = 0;
        let lumSum = 0;

        for (let sy = 0; sy < sampleRows; sy++) {
            const py = Math.min(y1, Math.max(y0, Math.round(y0 + ((sy + 0.5) * (y1 - y0 + 1) / sampleRows) - 0.5)));
            for (let sx = 0; sx < sampleCols; sx++) {
                const px = Math.min(x1, Math.max(x0, Math.round(x0 + ((sx + 0.5) * (x1 - x0 + 1) / sampleCols) - 0.5)));
                const idx = (py * canvas.width + px) * 4;
                total += 1;
                const alpha = offData[idx + 3];
                if (alpha > 10) {
                    opaque += 1;
                    const rr = offData[idx];
                    const gg = offData[idx + 1];
                    const bb = offData[idx + 2];
                    lumSum += (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255.0;
                }
            }
        }

        const coverage = total > 0 ? (opaque / total) : 0;
        const lum = opaque > 0 ? (lumSum / opaque) : 0.5;
        return { coverage, lum, transparent: opaque === 0 };
    };

    const isFormatInfo = (rr, cc) => {
        if (rr === count - 8 && cc === 8) return true;
        if (cc === 8 && rr < 9) return true;
        if (cc === 8 && rr >= count - 8) return true;
        if (rr === 8 && cc < 9) return true;
        if (rr === 8 && cc >= count - 8) return true;
        return false;
    };

    const finalDark = Array.from({ length: count }, () => Array(count).fill(false));
    const finalStyle = Array.from({ length: count }, () => Array(count).fill('square'));

    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            let isDark = generatedQR.isDark(r, c);
            const cell = pixelMap[r] ? pixelMap[r][c] : null;
            const showUnmasked = (maskPattern === -2);

            if (showUnmasked && cell && (cell.type === 'data' || cell.type === 'ec')) {
                isDark = isDark ^ (cell.maskVal === 1);
            }

            const x = qrOriginX + (c + qrMargin) * moduleW;
            const y = qrOriginY + (r + qrMargin) * moduleH;
            const isFinder = isFinderCell(r, c, count);
            const isAlign = !!getAlignLocalCoord(r, c, count);
            const activeStyle = isFinder ? finderStyle : (isAlign ? alignStyle : moduleStyle);

            if (drawnPixels.has(`${r},${c}`)) {
                const val = drawnPixels.get(`${r},${c}`);
                if (val === 1) isDark = true;
                if (val === 0) isDark = false;
            }

            if (cell && cell.type === 'func' && (isFinder || isAlign)) {
                const eyeStyle = isFinder ? finderStyle : alignStyle;
                const override = getFinderAlignOverride(eyeStyle, r, c, count);
                if (override !== null) isDark = override;
            }

            finalDark[r][c] = isDark;
            finalStyle[r][c] = activeStyle;
        }
    }

    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            const cell = pixelMap[r] ? pixelMap[r][c] : null;
            const isDark = finalDark[r][c];
            const activeStyle = finalStyle[r][c];
            const x = qrOriginX + (c + qrMargin) * moduleW;
            const y = qrOriginY + (r + qrMargin) * moduleH;
            const isFinder = isFinderCell(r, c, count);
            const isAlign = !!getAlignLocalCoord(r, c, count);
            const deferCircleFinder = (
                activeStyle === 'circle' &&
                cell &&
                cell.type === 'func' &&
                (isFinder || isAlign)
            );

            if (deferCircleFinder) {
                if (!isExport && cell) {
                    if (cell.type === 'func') {
                        ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
                        ctx.fillRect(x, y, moduleW, moduleH);
                    } else if (cell.type === 'ec') {
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
                        ctx.fillRect(x, y, moduleW, moduleH);
                    } else if (cell.type === 'data' && !isEditableDataCell(cell)) {
                        ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
                        ctx.fillRect(x, y, moduleW, moduleH);
                    }
                }
                continue;
            }

            if (cell && cell.type === 'func' && (isFinder || isAlign) && isFinderAlignTransparentCell(activeStyle, r, c, count)) {
                continue;
            }

            let coverRatio = 0;
            let sampledLum = 0.5;
            let moduleTransparent = true;
            if (hasImage && offData) {
                const sampled = sampleModuleCoverage(x, y, moduleW, moduleH);
                coverRatio = sampled.coverage;
                sampledLum = sampled.lum;
                moduleTransparent = sampled.transparent;
            }

            const covered = coverRatio > 0;
            const basisGhost = basisMode && embedImage;
            const nonBasisGhost = !basisMode && embedImage && covered;
            const useGhost = (basisGhost || nonBasisGhost) && cell && (cell.type === 'data' || cell.type === 'ec');
            const isProtectedOverlayCell = !!(cell && (cell.type === 'ec' || (cell.type === 'data' && !isEditableDataCell(cell))));
            if (useGhost) {
                const smallSize = Math.min(moduleW, moduleH) / 2;
                const offsetX = (moduleW - smallSize) / 2;
                const offsetY = (moduleH - smallSize) / 2;
                const cx = Math.floor(x + moduleW / 2);
                const cy = Math.floor(y + moduleH / 2);
                let lum = sampledLum;
                let isTransparent = moduleTransparent;

                if (isTransparent && bgData && cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
                    const idx = (cy * canvas.width + cx) * 4;
                    const rr = bgData.data[idx];
                    const gg = bgData.data[idx + 1];
                    const bb = bgData.data[idx + 2];
                    lum = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255.0;
                    isTransparent = false;
                }

                if (isTransparent) {
                    drawStyledModule(
                        x,
                        y,
                        moduleW,
                        moduleH,
                        activeStyle,
                        isDark ? fgColor : bgColor
                    );
                } else {
                    let alpha = 0.3;
                    let shouldDraw = false;
                    if (isDark) {
                        if (lum >= 0.25) {
                            shouldDraw = true;
                            alpha = Math.max(0, Math.min(1, 1 - (0.25 / lum)));
                        }
                        if (isProtectedOverlayCell) {
                            if (!shouldDraw) {
                                shouldDraw = true;
                                alpha = 0.35;
                            } else {
                                alpha = Math.max(alpha, 0.35);
                            }
                        }
                        if (shouldDraw) {
                            drawStyledModule(
                                x + offsetX,
                                y + offsetY,
                                smallSize,
                                smallSize,
                                activeStyle,
                                rgbaFromHex(fgColor, alpha.toFixed(2))
                            );
                        }
                    } else {
                        if (lum <= 0.80) {
                            shouldDraw = true;
                            alpha = (lum >= 1) ? 1 : ((0.80 - lum) / (1.0 - lum));
                            alpha = Math.max(0, Math.min(1, alpha));
                        }
                        if (shouldDraw) {
                            drawStyledModule(
                                x + offsetX,
                                y + offsetY,
                                smallSize,
                                smallSize,
                                activeStyle,
                                rgbaFromHex(bgColor, alpha.toFixed(2))
                            );
                        }
                    }
                }
            } else if (activeStyle === 'liquid' && isDark) {
                const up = r > 0 && finalDark[r - 1][c] && finalStyle[r - 1][c] === 'liquid';
                const right = c < count - 1 && finalDark[r][c + 1] && finalStyle[r][c + 1] === 'liquid';
                const down = r < count - 1 && finalDark[r + 1][c] && finalStyle[r + 1][c] === 'liquid';
                const left = c > 0 && finalDark[r][c - 1] && finalStyle[r][c - 1] === 'liquid';
                const upLeft = r > 0 && c > 0 && finalDark[r - 1][c - 1] && finalStyle[r - 1][c - 1] === 'liquid';
                const upRight = r > 0 && c < count - 1 && finalDark[r - 1][c + 1] && finalStyle[r - 1][c + 1] === 'liquid';
                const downLeft = r < count - 1 && c > 0 && finalDark[r + 1][c - 1] && finalStyle[r + 1][c - 1] === 'liquid';
                const downRight = r < count - 1 && c < count - 1 && finalDark[r + 1][c + 1] && finalStyle[r + 1][c + 1] === 'liquid';
                drawLiquidConnectedModule(ctx, x, y, moduleW, moduleH, fgColor, {
                    up, right, down, left,
                    upLeft, upRight, downLeft, downRight
                }, bgColor);
            } else {
                drawStyledModule(x, y, moduleW, moduleH, activeStyle, isDark ? fgColor : bgColor);
            }

            if (!isExport && cell) {
                if (cell.type === 'func') {
                    ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
                    ctx.fillRect(x, y, moduleW, moduleH);
                } else if (cell.type === 'ec') {
                    ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
                    ctx.fillRect(x, y, moduleW, moduleH);
                } else if (cell.type === 'data' && !isEditableDataCell(cell)) {
                    ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
                    ctx.fillRect(x, y, moduleW, moduleH);
                }
            }
        }
    }

    if (finderStyle === 'circle' || alignStyle === 'circle') {
        drawCircleFinderStyle(
            ctx,
            count,
            qrOriginX,
            qrOriginY,
            moduleW,
            moduleH,
            fgColor,
            bgColor,
            finderStyle === 'circle',
            alignStyle === 'circle'
        );
    }
}

function startDraw(e) {
    // Note: History is saved on 'mouseup' to capture the full stroke as one state
    isDragging = true;
    hasUserEdits = true;
    lockAutoMaskIfNeeded();
    
    // Left (0) = 1 (Black/Set), Right (2) = 0 (White/Unset)
    // Actually standard: Button 0 (Left) -> 1, Button 2 (Right) -> 0.
    // If Pen Tool: Left=Black, Right=White.
    let val = 1;
    if (e.button === 2 || e.shiftKey) val = 0;
    
    currentDragTarget = val;
    
    // Init last pos
    lastDrawPos = getMapCoord(e);
    
    // Draw initial point
    drawAt(e);
}

function getMapCoord(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const c = Math.floor(x/CELL_SIZE) - qrMargin;
    const r = Math.floor(y/CELL_SIZE) - qrMargin;
    return { r, c };
}

function drawAt(e) {
    const { r, c } = getMapCoord(e);
    let changed = false;
    
    if (lastDrawPos) {
        changed = plotLine(lastDrawPos.r, lastDrawPos.c, r, c, currentDragTarget);
    }
    lastDrawPos = { r, c };

    if (changed) {
        pendingDrawRecompute = true;
    }
}

function plotLine(r0, c0, r1, c1, color) {
    let dx = Math.abs(c1 - c0);
    let dy = Math.abs(r1 - r0);
    let sx = (c0 < c1) ? 1 : -1;
    let sy = (r0 < r1) ? 1 : -1;
    let err = dx - dy;
    let changed = false;
    
    while(true) {
        changed = modifyPixel(r0, c0, color) || changed;
        if (r0 === r1 && c0 === c1) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; c0 += sx; }
        if (e2 < dx) { err += dx; r0 += sy; }
    }
    return changed;
}

function modifyPixel(r, c, targetColor) {
    if (!pixelMap || r<0 || c<0 || r>=pixelMap.length || c>=pixelMap.length) return false;
    const cell = pixelMap[r][c];
    if (!isEditableDataCell(cell)) return false;

    const maskBit = (maskPattern === -2) ? 0 : cell.maskVal;
    // targetColor (1=Black, 0=White)
    // If Mask=0, Data=1 -> Black. Data=0 -> White.
    // If Mask=1, Data=1 -> White. Data=0 -> Black.
    // Pixel = Data ^ Mask.
    // We want Pixel = targetColor.
    // targetColor = Data ^ Mask => Data = targetColor ^ Mask.
    const reqBit = targetColor ^ maskBit;
    
    const globalPos = cell.globalBitIndex;
    const bIdx = Math.floor(globalPos / 8);
    const bitPos = 7 - (globalPos % 8);
    
    if (bIdx >= currentSuffixBytes.length) return false;

    const before = (currentSuffixBytes[bIdx] >> bitPos) & 1;
    if (before === reqBit) return false;

    if (reqBit) currentSuffixBytes[bIdx] |= (1<<bitPos);
    else currentSuffixBytes[bIdx] &= ~(1<<bitPos);
    return true;
}

// --- History & Zoom ---

function saveHistory() {
    // If we are back in history, cut off the future
    if (historyStep < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyStep + 1);
    }
    // Save deep copy of suffix bytes AND import state
    const state = {
        bytes: [...currentSuffixBytes],
        import: { ...importState }
    };

    historyStack.push(state);
    historyStep++;
    
    if (historyStack.length > 50) {
        historyStack.shift();
        historyStep--;
    }
}

function undo() {
    // Stop any active dragging
    endImportDrag();
    
    if (historyStep > 0) {
        historyStep--;
        const state = historyStack[historyStep];
        currentSuffixBytes = [...state.bytes];
        if (state.import) {
            importState = { 
                ...state.import,
                isDragging: false,
                isResizing: false,
                resizeHandle: null 
            };
            // Update Overlay UI
            updateOverlayTransform();
            updateOverlayVisibility();
        }
        updateQR();
    }
}

function redo() {
    // Stop any active dragging
    endImportDrag();

    if (historyStep < historyStack.length - 1) {
        historyStep++;
        const state = historyStack[historyStep];
        currentSuffixBytes = [...state.bytes];
        if (state.import) {
            importState = { 
                ...state.import,
                isDragging: false,
                isResizing: false,
                resizeHandle: null 
            };
            
            updateOverlayTransform();
            updateOverlayVisibility();
        }
        updateQR();
    }
}

function handleWheel(e) {
    e.preventDefault();
    
    // 1. Horizontal Scroll (Ctrl + Shift + Wheel)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
         canvasWrapper.scrollLeft += e.deltaY;
         return;
    }
    
    // 2. Vertical Scroll (Ctrl + Wheel)
    if (e.ctrlKey || e.metaKey) {
        canvasWrapper.scrollTop += e.deltaY;
        return;
    }
    
    // 3. Zoom (Wheel only)
    // Calculate Mouse Position relative to Content
    const rect = canvasWrapper.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; 
    const mouseY = e.clientY - rect.top;

    const scrollX = canvasWrapper.scrollLeft;
    const scrollY = canvasWrapper.scrollTop;
    
    // Current Dimensions
    const currentW = parseFloat(canvas.style.width) || canvas.width;
    const currentH = parseFloat(canvas.style.height) || canvas.height;
    
    // Calculate cursor position Ratio relative to the Canvas Image
    const cLeft = canvas.offsetLeft;
    const cTop = canvas.offsetTop;
    
    const absX = scrollX + mouseX;
    const absY = scrollY + mouseY;
    
    const relX = absX - cLeft;
    const relY = absY - cTop;
    
    const rx = relX / currentW;
    const ry = relY / currentH;
    
    // Apply Zoom
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const oldZoom = zoomLevel;
    
    // Calculate Fit Scale (Min Zoom)
    // "100%" from user perspective basically means "Fit to Screen"
    // So we allow zooming out until it fits the wrapper.
    const wrapperW = canvasWrapper.clientWidth;
    const wrapperH = canvasWrapper.clientHeight;
    const fitScale = Math.min(
        (wrapperW - 20) / canvas.width, 
        (wrapperH - 20) / canvas.height
    ); // -20 for padding
    
    // Min limit is the smaller of 1.0 or fitScale
    // (If QR is huge, fitScale < 1.0. We want to allow shrinking to fitScale.)
    const minLimit = Math.min(1.0, fitScale);

    let potentialZoom = zoomLevel * delta;
    if (potentialZoom < minLimit) potentialZoom = minLimit;
    if (potentialZoom > 50.0) potentialZoom = 50.0;
    
    zoomLevel = potentialZoom;
    
    const ratio = zoomLevel / oldZoom;
    if (ratio === 1) return; // No change

    // Update Image State to stick to Canvas Content
    if (importState.active || importState.width > 0) {
        importState.relX *= ratio;
        importState.relY *= ratio;
        importState.width *= ratio;
        importState.height *= ratio;
    }

    // New Dimensions
    const newW = Math.floor(canvas.width * zoomLevel);
    const newH = Math.floor(canvas.height * zoomLevel);
    
    canvas.style.width = newW + 'px';
    canvas.style.height = newH + 'px';
    
    // Adjust Scroll to keep Ratio
    // We want the point under the mouse (rx, ry) to remain under the mouse.
    // New Content Pos = NewSize * rx
    // New Scroll Pos = New Content Pos - MouseX + NewCanvasOffset? 
    // Actually, simple formula: 
    // NewScroll = OldScroll + (MouseRelToContent * (Ratio - 1))
    // But we are in a scroll wrapper.
    
    // Let's use the explicit logic:
    // New Pixel X of point = newSize * rx + cLeftNew (cLeft usually 0 or centered margin)
    // Wait, if css changed to block/absolute, cLeft might change or stay 0.
    // Assuming cLeft stays relatively 0 (top-left aligned in scroll view):
    
    canvasWrapper.scrollLeft = (newW * rx) - mouseX + (cLeft * ratio);
    canvasWrapper.scrollTop = (newH * ry) - mouseY + (cTop * ratio);
    
    // Correction: Standard Zoom-At-Cursor logic for scroll containers
    // Wrapper.scrollLeft += (mouseX + scrollLeft) * (rate - 1) ? No.
    // Correct: 
    // newScrollLeft = (scrollLeft + mouseX) * ratio - mouseX
    // IF content is at 0,0. 
    // Since we have offsets, stick to previous reliable formula or this simpler one.
    // Previous: canvasWrapper.scrollLeft = (newSize * rx) - mouseX;
    // This worked well when cLeft was negligible. With new centering layout, let's keep it but re-verify.
    // Actually let's just stick to the previous working one:
    canvasWrapper.scrollLeft = (newW * rx + cLeft) - mouseX;
    // Previous: (newSize * rx) - mouseX. 
    // (newSize * rx) is the new Pixel Position relative to Canvas Origin.
    // - mouseX shifts it so that pixel is at mouseX visual spot.
    // This assumes Canvas Origin is at (ScrollLeft + 0).
    // If Canvas has Margin, Canvas Origin is at (ScrollLeft + Margin).
    // So if we ignore Margin change, it's roughly correct.
    canvasWrapper.scrollLeft = (newW * rx) - mouseX;
    canvasWrapper.scrollTop = (newH * ry) - mouseY;

    // Update Absolute X/Y based on new Pos
    if (importState.active || importState.width > 0) {
        const newCLeft = canvas.offsetLeft;
        const newCTop = canvas.offsetTop;
        
        // This 'x/y' is absolute in wrapper document flow. 
        // ImportState.relX is distance from Canvas Border.
        importState.x = newCLeft + importState.relX;
        importState.y = newCTop + importState.relY;
        
        updateOverlayTransform();
    }
}






function handleGlobalKey(e) {
    // 1. Image Movement (Arrow Keys)
    if (importState.active && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        let moved = false;

        switch(e.key) {
            case 'ArrowLeft': dx = -step; moved = true; break;
            case 'ArrowRight': dx = step; moved = true; break;
            case 'ArrowUp': dy = -step; moved = true; break;
            case 'ArrowDown': dy = step; moved = true; break;
        }

        if (moved) {
            e.preventDefault();

            const clamped = clampToKeepCanvasOverlap(importState.x + dx, importState.y + dy);
            importState.x = clamped.x;
            importState.y = clamped.y;
            importState.relX = importState.x - canvas.offsetLeft;
            importState.relY = importState.y - canvas.offsetTop;
            
            updateOverlayTransform();
            updateOutOfBoundsState();
            arrowMovePending = true;
            return;
        }
    }

    // Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
    }
    // Ctrl+Y
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
    }
    // Ctrl+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyToClipboard();
    }
}

function handleGlobalKeyUp(e) {
    if (!importState.active) return;
    if (!arrowMovePending) return;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
        arrowMovePending = false;
        updateOutOfBoundsState();
        applyImport(true);
    }
}

async function copyToClipboard() {
    const mime = getOutputMime();
    try {
        if (mime === 'image/gif') {
            const blob = await exportGifBlob();
            try {
                const item = new ClipboardItem({ 'image/gif': blob });
                await navigator.clipboard.write([item]);
            } catch (err) {
                if (lastCopiedAnimatedUrl) URL.revokeObjectURL(lastCopiedAnimatedUrl);
                lastCopiedAnimatedUrl = URL.createObjectURL(blob);
                await navigator.clipboard.writeText(lastCopiedAnimatedUrl);
            }
        } else {
            const blob = await exportCurrentBlob(mime);
            try {
                const item = new ClipboardItem({ [mime]: blob });
                await navigator.clipboard.write([item]);
            } catch (err) {
                if (lastCopiedAnimatedUrl) URL.revokeObjectURL(lastCopiedAnimatedUrl);
                lastCopiedAnimatedUrl = URL.createObjectURL(blob);
                await navigator.clipboard.writeText(lastCopiedAnimatedUrl);
            }
        }
        alert('已复制到剪贴板');
    } catch (e) {
        console.error(e);
        alert('复制失败');
    }
}

function getOutputMime() {
    if (uploadInfo && uploadInfo.isVideo) return 'video/webm';
    if (uploadInfo && uploadInfo.isAnimated && uploadInfo.gifFrames) return 'image/gif';
    if (uploadInfo && uploadInfo.mime) {
        if (uploadInfo.mime === 'image/jpg' || uploadInfo.mime === 'image/jpeg') return 'image/jpeg';
        if (uploadInfo.mime === 'image/apng') return 'image/png';
        if (uploadInfo.mime === 'image/png') return 'image/png';
        if (uploadInfo.mime === 'image/webp') return 'image/webp';
        if (uploadInfo.mime === 'image/bmp') return 'image/bmp';
    }
    return 'image/png';
}

function getOutputExtension(mime) {
    switch (mime) {
        case 'video/webm': return 'webm';
        case 'image/jpeg': return 'jpg';
        case 'image/png': return 'png';
        case 'image/webp': return 'webp';
        case 'image/gif': return 'gif';
        case 'image/bmp': return 'bmp';
        default: return 'png';
    }
}

async function exportAndDownload() {
    const mime = getOutputMime();
    try {
        const blob = await exportCurrentBlob(mime);
        const link = document.createElement('a');
        const ext = getOutputExtension(mime);
        link.download = (userText || 'qrcode') + '.' + ext;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (e) {
        console.error(e);
        alert('保存失败');
    }
}

async function exportCurrentBlob(mime) {
    if (mime === 'video/webm' && uploadInfo && uploadInfo.isVideo) {
        return await exportVideoBlob();
    }
    if (mime === 'image/gif' && uploadInfo && uploadInfo.gifFrames) {
        return await exportGifBlob();
    }
    return await exportStaticBlob(mime);
}

function exportStaticBlob(mime) {
    return new Promise((resolve, reject) => {
        renderQR(true);
        canvas.toBlob((blob) => {
            renderQR(false);
            if (!blob) {
                reject(new Error('Export failed'));
                return;
            }
            resolve(blob);
        }, mime || 'image/png');
    });
}

async function exportGifBlob() {
    if (!uploadInfo || !window.GIF) {
        return await exportStaticBlob('image/png');
    }

    if (!uploadInfo.gifFrames && uploadInfo.gifBuffer) {
        let parsed = null;
        if (uploadInfo.animatedType === 'apng') {
            parsed = await parseAnimatedPngFromBuffer(uploadInfo.gifBuffer);
        } else {
            parsed = await parseGifFromBuffer(uploadInfo.gifBuffer);
        }
        if (parsed) {
            uploadInfo.gifFrames = parsed.frames;
            uploadInfo.gifFullFrames = parsed.fullFrames;
            uploadInfo.gifWidth = parsed.width;
            uploadInfo.gifHeight = parsed.height;
        }
    }

    if (!uploadInfo.gifFrames) {
        return await exportStaticBlob('image/png');
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: getGifWorkerScriptUrl()
    });

    const artisticOn = !!(artisticModeCb && artisticModeCb.checked);
    if (artisticOn) {
        const cache = await processAnimatedFramesForArt('正在逐帧计算导出内容');
        if (!cache || !cache.frames || !cache.frames.length) {
            throw new Error('导出已取消');
        }

        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
        frameCanvas.height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
        const fctx = frameCanvas.getContext('2d', { willReadFrequently: true });
        const frameRenderer = createGifFrameRenderer(fctx, frameCanvas);
        frameRenderer.reset();

        for (let i = 0; i < cache.frames.length; i++) {
            const item = cache.frames[i];
            const frame = uploadInfo.gifFrames[i];
            const fullFrame = uploadInfo.gifFullFrames && uploadInfo.gifFullFrames[i];
            if (fullFrame) {
                drawFullFrameToCanvas(fullFrame, fctx, frameCanvas);
            } else {
                frameRenderer.draw(frame);
            }

            const prevQr = generatedQR;
            const prevBytes = currentSuffixBytes;
            const frameQr = createQrFromSnapshot(item.qrSnapshot);
            if (frameQr) {
                generatedQR = frameQr;
            }
            currentSuffixBytes = item.suffixBytes ? [...item.suffixBytes] : prevBytes;
            renderQR(true, frameCanvas);
            generatedQR = prevQr;
            currentSuffixBytes = prevBytes;

            const delay = item.delay || (fullFrame ? Math.max(10, fullFrame.delay || 10) : getGifFrameDelayMs(frame));
            gif.addFrame(canvas, { copy: true, delay });
        }
        renderQR(false);

        return await new Promise((resolve) => {
            gif.on('finished', (blob) => resolve(blob));
            gif.render();
        });
    }

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = uploadInfo.gifWidth || previewImg.naturalWidth || previewImg.width;
    frameCanvas.height = uploadInfo.gifHeight || previewImg.naturalHeight || previewImg.height;
    const fctx = frameCanvas.getContext('2d', { willReadFrequently: true });
    const frameRenderer = createGifFrameRenderer(fctx, frameCanvas);
    frameRenderer.reset();

    const originalBytes = [...currentSuffixBytes];
    const totalFrames = uploadInfo.gifFrames.length;
    const shouldShowProgress = totalFrames > 20;
    if (shouldShowProgress) {
        showComputeOverlay('计算中...', '正在逐帧计算导出内容', { showFrameProgress: true });
        setComputeProgress(0, totalFrames);
        setFrameComputeProgress(0, 1);
    }

    try {
        for (let idx = 0; idx < totalFrames; idx++) {
            if (computeCancelRequested) {
                throw new Error('导出已取消');
            }
            if (shouldShowProgress) {
                if (computeSubtitle) computeSubtitle.textContent = '正在逐帧计算导出内容';
                setFrameComputeProgress(0, 1);
            }

            const frame = uploadInfo.gifFrames[idx];
            const fullFrame = uploadInfo.gifFullFrames && uploadInfo.gifFullFrames[idx];
            if (fullFrame) {
                drawFullFrameToCanvas(fullFrame, fctx, frameCanvas);
            } else {
                frameRenderer.draw(frame);
            }

            currentSuffixBytes = [...originalBytes];
            if (lastWhitenMode === 'white') {
                setSuffixUniform(0);
            } else if (lastWhitenMode === 'black') {
                setSuffixUniform(1);
            }
            await applyImport(false, frameCanvas);
            renderQR(true, frameCanvas);
            const delay = fullFrame ? Math.max(10, fullFrame.delay || 10) : getGifFrameDelayMs(frame);
            gif.addFrame(canvas, { copy: true, delay });

            if (shouldShowProgress) {
                setFrameComputeProgress(1, 1);
                setComputeProgress(idx + 1, totalFrames);
            }
        }
    } finally {
        currentSuffixBytes = [...originalBytes];
        updateQR();
        if (shouldShowProgress) hideComputeOverlay();
    }

    return await new Promise((resolve) => {
        gif.on('finished', (blob) => resolve(blob));
        gif.render();
    });
}

function pickWebmRecorderMimeType(hasAudioTrack = true) {
    const candidates = hasAudioTrack
        ? [
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp9,opus',
            'video/webm'
        ]
        : [
            'video/webm;codecs=vp8',
            'video/webm;codecs=vp9',
            'video/webm'
        ];
    for (const mime of candidates) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
            return mime;
        }
    }
    return '';
}

function readEbmlVint(bytes, offset, forId = false) {
    if (!bytes || offset < 0 || offset >= bytes.length) return null;
    const first = bytes[offset];
    if (!first) return null;
    let mask = 0x80;
    let len = 1;
    while (len <= 8 && (first & mask) === 0) {
        mask >>= 1;
        len += 1;
    }
    if (len > 8 || offset + len > bytes.length) return null;

    let value = 0;
    if (forId) {
        for (let i = 0; i < len; i++) {
            value = (value * 256) + bytes[offset + i];
        }
    } else {
        value = first & (mask - 1);
        for (let i = 1; i < len; i++) {
            value = (value * 256) + bytes[offset + i];
        }
        const unknownValue = (Math.pow(2, 7 * len) - 1);
        if (value === unknownValue) value = -1;
    }

    return { length: len, value };
}

function readUintBigEndian(bytes, offset, length) {
    let value = 0;
    for (let i = 0; i < length; i++) {
        value = (value * 256) + bytes[offset + i];
    }
    return value;
}

function findEbmlElement(bytes, start, end, targetId) {
    let pos = Math.max(0, start || 0);
    const limit = Math.min(bytes.length, end || bytes.length);
    while (pos < limit) {
        const idInfo = readEbmlVint(bytes, pos, true);
        if (!idInfo) break;
        const sizeInfo = readEbmlVint(bytes, pos + idInfo.length, false);
        if (!sizeInfo) break;

        const dataStart = pos + idInfo.length + sizeInfo.length;
        const dataEnd = sizeInfo.value < 0 ? limit : Math.min(limit, dataStart + sizeInfo.value);
        if (dataStart > limit || dataEnd < dataStart) break;

        if (idInfo.value === targetId) {
            return {
                id: idInfo.value,
                start: pos,
                headerSize: idInfo.length + sizeInfo.length,
                dataStart,
                dataEnd,
                size: dataEnd - dataStart
            };
        }

        if (dataEnd === pos) break;
        pos = dataEnd;
    }
    return null;
}

async function patchWebmDurationMetadata(blob, durationSec) {
    if (!blob || !(durationSec > 0)) return blob;
    try {
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const segment = findEbmlElement(bytes, 0, bytes.length, 0x18538067);
        if (!segment) return blob;

        const info = findEbmlElement(bytes, segment.dataStart, segment.dataEnd, 0x1549A966);
        if (!info) return blob;

        const durationElem = findEbmlElement(bytes, info.dataStart, info.dataEnd, 0x4489);
        if (!durationElem || (durationElem.size !== 4 && durationElem.size !== 8)) return blob;

        const scaleElem = findEbmlElement(bytes, info.dataStart, info.dataEnd, 0x2AD7B1);
        let timecodeScaleNs = 1000000;
        if (scaleElem && scaleElem.size > 0 && scaleElem.size <= 8) {
            const rawScale = readUintBigEndian(bytes, scaleElem.dataStart, scaleElem.size);
            if (Number.isFinite(rawScale) && rawScale > 0) {
                timecodeScaleNs = rawScale;
            }
        }

        const durationValue = (durationSec * 1e9) / timecodeScaleNs;
        const view = new DataView(buffer);
        if (durationElem.size === 4) {
            view.setFloat32(durationElem.dataStart, durationValue, false);
        } else {
            view.setFloat64(durationElem.dataStart, durationValue, false);
        }

        return new Blob([buffer], { type: blob.type || 'video/webm' });
    } catch (err) {
        console.warn('WebM 时长元数据修复失败，返回原始导出文件:', err);
        return blob;
    }
}

async function exportVideoBlob() {
    if (!uploadInfo || !uploadInfo.isVideo || !uploadInfo.videoObjectUrl) {
        return await exportStaticBlob('image/png');
    }
    if (!window.MediaRecorder) {
        throw new Error('当前浏览器不支持视频导出');
    }

    const srcVideo = document.createElement('video');
    srcVideo.preload = 'auto';
    srcVideo.muted = true;
    srcVideo.volume = 0;
    srcVideo.playsInline = true;
    srcVideo.crossOrigin = 'anonymous';
    srcVideo.src = uploadInfo.videoObjectUrl;

    await new Promise((resolve, reject) => {
        const onLoaded = () => {
            cleanup();
            resolve();
        };
        const onError = () => {
            cleanup();
            reject(new Error('视频加载失败'));
        };
        const cleanup = () => {
            srcVideo.removeEventListener('loadedmetadata', onLoaded);
            srcVideo.removeEventListener('error', onError);
        };
        srcVideo.addEventListener('loadedmetadata', onLoaded, { once: true });
        srcVideo.addEventListener('error', onError, { once: true });
    });

    const previousCanvasVisibility = canvas.style.visibility;
    canvas.style.visibility = 'hidden';

    try {

        const cache = await processVideoFramesForPreview('正在逐帧计算导出内容', {
            forExport: true,
            artisticOn: !!(artisticModeCb && artisticModeCb.checked)
        });
        if (!cache || !cache.frames || !cache.frames.length) {
            throw new Error('导出已取消');
        }
    const totalFrames = cache.frames.length;
    const sourceDuration = Math.max(
        0.01,
        getSafeVideoDuration(srcVideo, uploadInfo.videoDuration || (totalFrames / Math.max(1, uploadInfo.videoFps || 30)))
    );
    const preferredFps = Math.max(1, Math.min(60, Math.round(uploadInfo.videoFps || 30)));
    const streamFps = preferredFps;
    const frameDelay = Math.max(10, Math.round(1000 / streamFps));
    const getFrameDelay = (idx) => {
        const item = cache.frames[idx];
        return Math.max(10, item && item.delay ? item.delay : frameDelay);
    };
    const frameDurationMs = cache.frames.reduce((sum, _item, idx) => sum + getFrameDelay(idx), 0);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = Math.max(1, canvas.width);
    outputCanvas.height = Math.max(1, canvas.height);
    const octx = outputCanvas.getContext('2d', { willReadFrequently: true });

    const stream = outputCanvas.captureStream(streamFps);
    let audioTrack = null;
    let hasAudioTrack = false;
    const shouldMergeAudio = !!(exportAudioCb ? exportAudioCb.checked : true);
    try {
        if (shouldMergeAudio) {
            const audioStream = srcVideo.captureStream ? srcVideo.captureStream() : null;
            if (audioStream) {
                const tracks = audioStream.getAudioTracks();
                if (tracks && tracks.length > 0) {
                    audioTrack = tracks[0];
                    stream.addTrack(audioTrack);
                    hasAudioTrack = true;
                }
            }
        }
    } catch (err) {
        console.warn('音轨合并失败，继续无音轨导出:', err);
    }

    const chunks = [];
    const recorderMime = pickWebmRecorderMimeType(hasAudioTrack);
    const recorder = recorderMime
        ? new MediaRecorder(stream, { mimeType: recorderMime, videoBitsPerSecond: 8_000_000 })
        : new MediaRecorder(stream);
    recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };

    const recorderDone = new Promise((resolve) => {
        recorder.onstop = () => resolve();
    });

    const useAudioClockMode = shouldMergeAudio && hasAudioTrack;
    const durationEstimate = Math.max(
        0.01,
        useAudioClockMode ? sourceDuration : (frameDurationMs / 1000)
    );

    const paintFrameByIndex = (index) => {
        const idx = Math.max(0, Math.min(totalFrames - 1, index));
        const item = cache.frames[idx];
        octx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        if (item && item.imageData) {
            octx.putImageData(item.imageData, 0, 0);
        }
    };

    computeCancelRequested = false;
    paintFrameByIndex(0);
    await new Promise((resolve) => setTimeout(resolve, 0));
    recorder.start();

    const shouldShowMergeProgress = useAudioClockMode;
    if (shouldShowMergeProgress) {
        showComputeOverlay('计算中...', '正在合并音频与视频', { showFrameProgress: false });
        setComputeProgress(0, totalFrames);
    }

    try {
        if (useAudioClockMode) {
            try {
                srcVideo.playbackRate = 1;
                srcVideo.currentTime = 0;
                await srcVideo.play();
            } catch (_) {
                throw new Error('导出视频失败：无法启动视频时钟');
            }

            let lastIndex = 0;
            let stagnantClockCount = 0;
            let lastClock = Math.max(0, Number(srcVideo.currentTime) || 0);
            const wallStart = performance.now();

            while (true) {
                if (computeCancelRequested) {
                    throw new Error('导出已取消');
                }

                const nowClock = Math.max(0, Number(srcVideo.currentTime) || 0);
                if (nowClock <= lastClock + 0.0005) {
                    stagnantClockCount += 1;
                } else {
                    stagnantClockCount = 0;
                }
                const forceWallClock = stagnantClockCount >= 3 || (typeof document !== 'undefined' && !!document.hidden);

                let normalized = 0;
                if (forceWallClock) {
                    normalized = Math.min(1, Math.max(0, (performance.now() - wallStart) / Math.max(1, durationEstimate * 1000)));
                } else {
                    normalized = durationEstimate > 0 ? Math.min(1, nowClock / durationEstimate) : 0;
                }

                const frameIndex = Math.max(0, Math.min(totalFrames - 1, Math.floor(normalized * totalFrames)));
                if (frameIndex !== lastIndex) {
                    paintFrameByIndex(frameIndex);
                    lastIndex = frameIndex;
                }

                if (shouldShowMergeProgress) {
                    const wallRemainSec = Math.max(0, durationEstimate - ((performance.now() - wallStart) / 1000));
                    const videoRemainSec = Math.max(0, sourceDuration - nowClock);
                    const remainSec = forceWallClock ? wallRemainSec : videoRemainSec;
                    setComputeProgress(frameIndex, totalFrames);
                    if (computeProgressText) {
                        const pct = Math.round((Math.max(0, Math.min(totalFrames, frameIndex)) / Math.max(1, totalFrames)) * 100);
                        computeProgressText.textContent = `${pct}% (${frameIndex}/${totalFrames}) · 预计剩余 ${formatDurationHMS(remainSec)}`;
                    }
                }

                lastClock = Math.max(lastClock, nowClock);
                const finishedByClock = !forceWallClock && (srcVideo.ended || nowClock >= sourceDuration - 0.03);
                const finishedByWall = forceWallClock && ((performance.now() - wallStart) >= (durationEstimate * 1000 - 30));
                if (finishedByClock || finishedByWall) {
                    break;
                }

                if (forceWallClock) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                } else {
                    await waitForVideoClockAdvance(srcVideo, nowClock, 1200);
                }
            }
        } else {
            for (let i = 1; i < totalFrames; i++) {
                if (computeCancelRequested) {
                    throw new Error('导出已取消');
                }
                await new Promise((resolve) => setTimeout(resolve, getFrameDelay(i - 1)));
                paintFrameByIndex(i);
            }
        }

        paintFrameByIndex(totalFrames - 1);
        if (shouldShowMergeProgress) {
            setComputeProgress(totalFrames, totalFrames);
        }
        await new Promise((resolve) => setTimeout(resolve, Math.max(100, getFrameDelay(totalFrames - 1))));
    } finally {
        renderQR(false);
        if (shouldShowMergeProgress) {
            hideComputeOverlay();
        }
        try { srcVideo.pause(); } catch (_) {}
        try {
            if (typeof recorder.requestData === 'function' && recorder.state === 'recording') {
                recorder.requestData();
            }
            if (recorder.state !== 'inactive') recorder.stop();
        } catch (_) {}
        await recorderDone;
    }

    const blobType = recorderMime || 'video/webm';
    if (!chunks.length) {
        throw new Error('导出视频失败：未生成帧数据');
    }
        const rawBlob = new Blob(chunks, { type: blobType });
        return await patchWebmDurationMetadata(rawBlob, durationEstimate);
    } finally {
        canvas.style.visibility = previousCanvasVisibility;
    }
}

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    stopGifPreview();
    invalidateAnimatedArtCache();
    cleanupVideoObjectUrl();

    const guessed = guessMimeFromName(file.name);
    const isVideo = !!(file.type && file.type.startsWith('video/'));
    uploadInfo = {
        mime: file.type || guessed || null,
        name: file.name || null,
        isGif: (file.type === 'image/gif') || (guessed === 'image/gif'),
        isVideo,
        isAnimated: false,
        animatedType: null,
        gifFrames: null,
        gifFullFrames: null,
        gifWidth: 0,
        gifHeight: 0,
        gifBuffer: null,
        videoObjectUrl: null,
        videoDuration: 0,
        videoFps: 30,
        videoElement: null,
        firstFrameUrl: null
    };

    if (uploadInfo.isVideo) {
        try {
            const objectUrl = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';
            video.src = objectUrl;
            await new Promise((resolve, reject) => {
                const onLoaded = () => {
                    cleanup();
                    resolve();
                };
                const onError = () => {
                    cleanup();
                    reject(new Error('视频加载失败'));
                };
                const cleanup = () => {
                    video.removeEventListener('loadedmetadata', onLoaded);
                    video.removeEventListener('error', onError);
                };
                video.addEventListener('loadedmetadata', onLoaded, { once: true });
                video.addEventListener('error', onError, { once: true });
            });

            uploadInfo.isAnimated = true;
            uploadInfo.animatedType = 'video';
            uploadInfo.videoObjectUrl = objectUrl;
            uploadInfo.videoDuration = Math.max(0, getSafeVideoDuration(video, 0));
            uploadInfo.videoElement = video;
            uploadInfo.gifWidth = video.videoWidth || 0;
            uploadInfo.gifHeight = video.videoHeight || 0;

            const firstFrameUrl = await extractVideoFirstFrame(video);
            uploadInfo.firstFrameUrl = firstFrameUrl;
        } catch (err) {
            console.warn('视频解析失败:', err);
            alert('浏览器无法解析该视频，请更换为可播放格式。');
            e.target.value = '';
            return;
        }
    }

    if (uploadInfo.isGif) {
        try {
            const buffer = await file.arrayBuffer();
            uploadInfo.gifBuffer = buffer;
            const parsed = await parseGifFromBuffer(buffer);
            if (parsed) {
                uploadInfo.gifFrames = parsed.frames;
                uploadInfo.gifFullFrames = parsed.fullFrames;
                uploadInfo.gifWidth = parsed.width;
                uploadInfo.gifHeight = parsed.height;
                uploadInfo.isAnimated = true;
                uploadInfo.animatedType = 'gif';
            }
        } catch (err) {
            console.warn('GIF解析失败:', err);
            uploadInfo.gifFrames = null;
            uploadInfo.gifFullFrames = null;
        }
    } else if (
        (file.type === 'image/png') ||
        (file.type === 'image/apng') ||
        (guessed === 'image/png') ||
        (guessed === 'image/apng')
    ) {
        try {
            const buffer = await file.arrayBuffer();
            const parsed = await parseAnimatedPngFromBuffer(buffer);
            if (parsed) {
                uploadInfo.gifFrames = parsed.frames;
                uploadInfo.gifFullFrames = parsed.fullFrames;
                uploadInfo.gifWidth = parsed.width;
                uploadInfo.gifHeight = parsed.height;
                uploadInfo.isAnimated = true;
                uploadInfo.animatedType = 'apng';
                uploadInfo.gifBuffer = buffer;
            }
        } catch (_) {
            // keep as static png
        }
    }

    previewImg.onload = function() {
        if (historyStep === -1) saveHistory(); // Save pre-upload state
        
        // Auto-check Embed Image on Upload
        if (embedImageCb) {
            embedImageCb.disabled = false;
            if (!embedImageCb.checked) embedImageCb.checked = true;
        }

        if (dynamicPreviewCb) {
            if (uploadInfo.isAnimated && (uploadInfo.gifFrames || uploadInfo.isVideo)) {
                dynamicPreviewCb.disabled = false;
                dynamicPreviewCb.checked = false;
            } else {
                dynamicPreviewCb.disabled = true;
                dynamicPreviewCb.checked = false;
            }
        }

        if (cellSizeAutoBtn) {
            cellSizeAutoBtn.style.display = 'inline-flex';
        }
        if (imageBasisCb) {
            imageBasisCb.disabled = false;
            imageBasisCb.checked = false;
        }
        if (artisticModeCb) {
            artisticModeCb.disabled = false;
        }
        if (allowCoveredFreedomCb) {
            allowCoveredFreedomCb.disabled = !(artisticModeCb && artisticModeCb.checked);
        }
        if (invertToneCb) {
            invertToneCb.disabled = false;
        }
        if (exportAudioCb) {
            exportAudioCb.disabled = !uploadInfo.isVideo;
            if (!uploadInfo.isVideo) {
                exportAudioCb.checked = true;
            }
        }

        hasImageUpload = true;
        basisImageWidth = previewImg.naturalWidth || previewImg.width || 0;
        basisImageHeight = previewImg.naturalHeight || previewImg.height || 0;
        refreshImageSizeControlVisibility();
        lockAutoMaskIfNeeded();
        
        startImportMode(previewImg.naturalWidth, previewImg.naturalHeight);
        applyImport(false); 
        saveHistory(); 
        previewImg.onload = null;
    };
    let objectUrl = null;
    if (!uploadInfo.isAnimated || (!uploadInfo.gifFrames && !uploadInfo.isVideo)) {
        objectUrl = URL.createObjectURL(file);
        previewImg.src = objectUrl;
    } else {
        setStaticGifPreview();
        if (previewImg.onload && previewImg.complete && ((previewImg.naturalWidth || previewImg.width || 0) > 0)) {
            const onloadHandler = previewImg.onload;
            previewImg.onload = null;
            onloadHandler.call(previewImg);
        }
    }
    e.target.value = ''; // Reset input
}

function startImportMode(natW, natH) {
    importState.active = true;
    initImportOverlayByMode(natW, natH);
    updateOverlayVisibility();
    updateOverlayTransform();
    syncImageSizeInputs();
    
    // Force hide buttons (Requested by user)
    document.getElementById('import-ok').style.display = 'none';
    document.getElementById('import-cancel').style.display = 'none';
}

function updateOverlayTransform() {
    importOverlay.style.width = importState.width + 'px';
    importOverlay.style.height = importState.height + 'px';
    importOverlay.style.left = importState.x + 'px';
    importOverlay.style.top = importState.y + 'px';
    const basis = isImageBasisMode();
    importOverlay.classList.toggle('image-basis', basis);
    if (previewImg) previewImg.style.display = basis ? 'none' : 'block';
    updateAutoCellSizeButtonLabel();
    syncImageSizeInputs();
}

function updateOverlayVisibility() {
    const embedCb = document.getElementById('embed-image-cb');
    const ov = document.getElementById('import-overlay'); // Direct DOM access for safety
    if (!ov) return;

    // Show if Active AND (Checkbox Checked or Checkbox missing)
    // If Unchecked -> Hidden "Temporarily"
    const isChecked = isImageBasisMode() ? true : (!embedCb || embedCb.checked);
    
    // Fix: Ensure we strictly hide if unchecked, regardless of active state
    if (importState.active && isChecked) {
        ov.style.display = 'block';
    } else {
        ov.style.display = 'none';
    }
}

function getImageRect() {
    return {
        left: importState.x,
        top: importState.y,
        right: importState.x + importState.width,
        bottom: importState.y + importState.height
    };
}

function getQrRect() {
    const left = canvas.offsetLeft;
    const top = canvas.offsetTop;
    const width = canvas.offsetWidth || canvas.getBoundingClientRect().width;
    const height = canvas.offsetHeight || canvas.getBoundingClientRect().height;
    return {
        left,
        top,
        right: left + width,
        bottom: top + height
    };
}

function hasOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

function clampToKeepCanvasOverlap(nextX, nextY) {
    const qrRect = getQrRect();
    const minOverlap = 1;
    const minX = qrRect.left - importState.width + minOverlap;
    const maxX = qrRect.right - minOverlap;
    const minY = qrRect.top - importState.height + minOverlap;
    const maxY = qrRect.bottom - minOverlap;
    return {
        x: Math.min(maxX, Math.max(minX, nextX)),
        y: Math.min(maxY, Math.max(minY, nextY))
    };
}

function updateOutOfBoundsState() {
    if (!importState.active) {
        clearDeleteZones();
        return false;
    }
    const imgRect = getImageRect();
    const qrRect = getQrRect();
    const exceed = getExceededSidesByDistance(imgRect, qrRect);
    const overlap = hasOverlap(imgRect, qrRect);
    importState.outOfBounds = !overlap;
    const isPointerDragging = importState.isDragging || importState.isResizing;
    if (importState.outOfBounds && isPointerDragging) {
        importOverlay.classList.add('import-outside');
        const bounds = getPointerDeleteBounds();
        updateDeleteZones(exceed.sides, bounds);
    } else {
        importOverlay.classList.remove('import-outside');
        clearDeleteZones();
    }
    return importState.outOfBounds;
}

function clearImportedImage() {
    importState.active = false;
    importState.width = 0;
    importState.height = 0;
    importOverlay.classList.remove('import-outside');
    importOverlay.classList.remove('image-basis');
    clearDeleteZones();
    importOverlay.style.display = 'none';
    previewImg.removeAttribute('src');
    fileInput.value = '';
    cleanupVideoObjectUrl();
    uploadInfo = {
        mime: null,
        name: null,
        isGif: false,
        isVideo: false,
        isAnimated: false,
        animatedType: null,
        gifFrames: null,
        gifFullFrames: null,
        gifWidth: 0,
        gifHeight: 0,
        gifBuffer: null,
        videoObjectUrl: null,
        videoDuration: 0,
        videoFps: 30,
        videoElement: null,
        firstFrameUrl: null
    };
    animatedArtCache = null;
    hasImageUpload = false;
    refreshImageSizeControlVisibility();
    stopGifPreview();
    if (embedImageCb) {
        embedImageCb.checked = false;
        embedImageCb.disabled = true;
    }
    if (dynamicPreviewCb) {
        dynamicPreviewCb.checked = false;
        dynamicPreviewCb.disabled = true;
    }
    if (imageBasisCb) {
        imageBasisCb.checked = false;
        imageBasisCb.disabled = true;
    }
    if (artisticModeCb) {
        artisticModeCb.checked = false;
        artisticModeCb.disabled = true;
    }
    if (allowCoveredFreedomCb) {
        allowCoveredFreedomCb.checked = false;
        allowCoveredFreedomCb.disabled = true;
    }
    if (invertToneCb) {
        invertToneCb.checked = false;
        invertToneCb.disabled = true;
    }
    if (exportAudioCb) {
        exportAudioCb.checked = true;
        exportAudioCb.disabled = true;
    }
    if (cellSizeAutoBtn) cellSizeAutoBtn.style.display = 'none';
    updateMaskControls();
    updateQR();
}

function startImportDrag(e) {
    if (!importState.active || e.target.tagName === 'BUTTON') return;
    
    // Check if clicking a handle
    if (e.target.classList.contains('resize-handle')) {
        e.preventDefault();
        importState.isResizing = true;
        importState.resizeHandle = e.target.dataset.handle;
        importState.lastX = e.clientX;
        importState.lastY = e.clientY;
        importState.startW = importState.width;
        importState.startH = importState.height;
        importState.startX = importState.x;
        importState.startY = importState.y;
        importState.aspect = importState.width / importState.height;
        importState.lastMoveDx = 0;
        importState.lastMoveDy = 0;
        importState.dragGrabOffsetX = importState.width / 2;
        importState.dragGrabOffsetY = importState.height / 2;
        e.stopPropagation();
        
        // Save history BEFORE modify
        // But drag is continuous. We want one undo step for the whole drag.
        // So we save history on Mousedown (start), and subsequent moves just update.
        saveHistory(); 
        
        return;
    }
    
    e.preventDefault();
    importState.isDragging = true;
    importState.lastX = e.clientX;
    importState.lastY = e.clientY;
    importState.lastMoveDx = 0;
    importState.lastMoveDy = 0;
    importState.dragGrabOffsetX = e.clientX - importState.x;
    importState.dragGrabOffsetY = e.clientY - importState.y;
    
    // Save history BEFORE drag starts
    saveHistory();
}

function moveImportDrag(e) {
    if (!importState.active) return;
    
    // Helper to sync Rel
    const syncRel = () => {
        // We assume valid x/y
        // We need canvas offset
        importState.relX = importState.x - canvas.offsetLeft;
        importState.relY = importState.y - canvas.offsetTop;
    };
    
    let didChange = false;
    
    if (importState.isResizing) {
        e.preventDefault();
        const dx = e.clientX - importState.lastX;
        const dy = e.clientY - importState.lastY;
        importState.lastMoveDx = dx;
        importState.lastMoveDy = dy;
        const h = importState.resizeHandle;
        
        const isCorner = ['nw','ne','sw','se'].includes(h);
        
        let newX = importState.x;
        let newY = importState.y;
        let newW = importState.width;
        let newH = importState.height;
        
        // Edge Resizing (Free)
        if (!isCorner) {
            if (h === 'e') newW += dx;
            if (h === 'w') { newW -= dx; newX += dx; }
            if (h === 's') newH += dy;
            if (h === 'n') { newH -= dy; newY += dy; }
        } 
        // Corner Resizing (Fixed Aspect)
        else {
            const dominantX = Math.abs(dx) >= Math.abs(dy);
            if (h === 'se') {
                if (dominantX) {
                    newW += dx;
                    newH = newW / importState.aspect;
                } else {
                    newH += dy;
                    newW = newH * importState.aspect;
                }
            } else if (h === 'sw') {
                if (dominantX) {
                    newW -= dx;
                    newX += dx;
                    newH = newW / importState.aspect;
                } else {
                    newH += dy;
                    newW = newH * importState.aspect;
                    newX = importState.x + (importState.width - newW);
                }
            } else if (h === 'ne') {
                if (dominantX) {
                    newW += dx;
                    newH = newW / importState.aspect;
                    newY = importState.y + (importState.height - newH);
                } else {
                    newH -= dy;
                    newY += dy;
                    newW = newH * importState.aspect;
                }
            } else if (h === 'nw') {
                if (dominantX) {
                    newW -= dx;
                    newX += dx;
                    newH = newW / importState.aspect;
                    newY = importState.y + (importState.height - newH);
                } else {
                    newH -= dy;
                    newY += dy;
                    newW = newH * importState.aspect;
                    newX = importState.x + (importState.width - newW);
                }
            }
        }
        
        // Minimum size limit
        if (newW < 20) newW = 20;
        if (newH < 20) newH = 20;

        importState.width = newW;
        importState.height = newH;
        importState.x = newX;
        importState.y = newY;
        
        importState.lastX = e.clientX;
        importState.lastY = e.clientY;
        updateOverlayTransform();
        syncRel();
        if (isImageBasisMode()) {
            syncCellSizeFromBasisBox();
        }
        didChange = true;
    } else if (importState.isDragging) { // Added else if to separate logic
        e.preventDefault();
        const dx = e.clientX - importState.lastX;
        const dy = e.clientY - importState.lastY;
        importState.lastMoveDx = dx;
        importState.lastMoveDy = dy;
        
        importState.x += dx;
        importState.y += dy;
        importState.lastX = e.clientX;
        importState.lastY = e.clientY;
        
        updateOverlayTransform();
        syncRel();
        didChange = true;
    }
    
    // Realtime Update!
    if (didChange) {
        updateOutOfBoundsState();
    }
}

function endImportDrag() {
    let shouldDelete = false;
    if (importState.isDragging || importState.isResizing) {
        shouldDelete = updateOutOfBoundsState();
        if (shouldDelete) {
            clearImportedImage();
            return;
        }
        // Apply final changes to Data
        applyImport(true, previewImg, true); 
    }
    
    importState.isDragging = false;
    importState.isResizing = false;
    importState.resizeHandle = null;
    importState.lastMoveDx = 0;
    importState.lastMoveDy = 0;
    clearDeleteZones();
    updateOutOfBoundsState();
}

function scaleImportImg(e) {
    if (!importState.active) return;
    e.preventDefault();
    e.stopPropagation(); // prevent canvas zoom
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    
    // Scale around center? Or mouse? Simple center for now or Top-Left.
    // Let's do center
    const oldW = importState.width;
    const oldH = importState.height;
    const newW = oldW * delta;
    const newH = oldH * delta;
    
    importState.x += (oldW - newW) / 2;
    importState.y += (oldH - newH) / 2;
    importState.width = newW;
    importState.height = newH;
    
    updateOverlayTransform();
}

function cancelImport() {
    importState.active = false;
    updateOverlayVisibility();
    // Hide buttons
    document.getElementById('import-ok').style.display = 'none';
    document.getElementById('import-cancel').style.display = 'none';
}

function getCanvasContentOffsets() {
    const style = window.getComputedStyle(canvas);
    return {
        // Fix: Use 0 if window.getComputedStyle returns empty strings during some states?
        // Fix: getComputedStyle might be returning scaled values if zoom transformed?
        // Actually, offsetLeft/Top includes margin. 
        // border/padding are inside offsetWidth.
        left: (parseFloat(style.borderLeftWidth)||0) + (parseFloat(style.paddingLeft)||0),
        top: (parseFloat(style.borderTopWidth)||0) + (parseFloat(style.paddingTop)||0)
    };
}

async function applyImport(doSave = true, imageSource = previewImg, forceRecalc = false, options = {}) {
    const hasExternalImageSource = !!imageSource && imageSource !== previewImg;
    const skipArtisticPass = !!options.skipArtisticPass;
    if (!importState.active && !hasExternalImageSource) return;
    const basisMode = isImageBasisMode();
    const canvasRect = canvas.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const sourceW = imageSource.naturalWidth || imageSource.width || 0;
    const sourceH = imageSource.naturalHeight || imageSource.height || 0;
    if (sourceW <= 0 || sourceH <= 0) return;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = sourceW;
    tmpCanvas.height = sourceH;
    const tCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    tCtx.drawImage(imageSource, 0, 0, sourceW, sourceH);
    const imgData = tCtx.getImageData(0, 0, sourceW, sourceH);

    const qrSize = pixelMap.length;
    const totalModulesVisual = qrSize + 2 * qrMargin;
    let qrStartX = 0;
    let qrStartY = 0;
    let moduleW = CELL_SIZE;
    let moduleH = CELL_SIZE;
    let imageBoxX = 0;
    let imageBoxY = 0;
    let imageBoxW = Math.max(1, canvas.width);
    let imageBoxH = Math.max(1, canvas.height);

    if (basisMode) {
        const basisBox = getBasisQrBoxInternal();
        qrStartX = basisBox.x;
        qrStartY = basisBox.y;
        moduleW = basisBox.width / totalModulesVisual;
        moduleH = basisBox.height / totalModulesVisual;
        imageBoxX = 0;
        imageBoxY = 0;
        imageBoxW = Math.max(1, canvas.width);
        imageBoxH = Math.max(1, canvas.height);
    } else {
        const displayW = parseFloat(canvas.style.width) || canvas.width;
        const displayH = parseFloat(canvas.style.height) || canvas.height;
        const box = getOverlayInnerBoxInternal(canvas.width, canvas.height, displayW, displayH);
        imageBoxX = box.x;
        imageBoxY = box.y;
        imageBoxW = Math.max(1, box.width);
        imageBoxH = Math.max(1, box.height);
    }

    let changed = false;

    for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
            const cell = pixelMap[r][c];
            // Only affect Valid Free Suffix Data
            if (isEditableDataCell(cell)) {
                const cx = qrStartX + (c + qrMargin) * moduleW + (moduleW / 2);
                const cy = qrStartY + (r + qrMargin) * moduleH + (moduleH / 2);

                let localX = -1;
                let localY = -1;

                localX = Math.floor(((cx - imageBoxX) / imageBoxW) * sourceW);
                localY = Math.floor(((cy - imageBoxY) / imageBoxH) * sourceH);

                if (localX >= 0 && localX < sourceW && localY >= 0 && localY < sourceH) {
                    const idx = (localY * sourceW + localX) * 4;
                    const rr = imgData.data[idx];
                    const gg = imgData.data[idx+1];
                    const bb = imgData.data[idx+2];
                    const aa = imgData.data[idx+3];
                    
                    // Ignore transparent pixels 
                    if (aa < 10) continue; 
                    
                    const aNorm = aa / 255.0;
                    const bg = parseHexColor(backgroundColor || '#ffffff');
                    const rB = rr * aNorm + bg.r * (1 - aNorm);
                    const gB = gg * aNorm + bg.g * (1 - aNorm);
                    const bB = bb * aNorm + bg.b * (1 - aNorm);
                    
                    const lum = (0.299*rB + 0.587*gB + 0.114*bB); // Range 0-255
                    
                    const targetColor = getTargetColorFromLuminance(lum);

                    modifyPixel(r, c, targetColor);
                    changed = true;
                }
            }
        }
    }

    if (changed || forceRecalc) {
        const directAnimatedRecompute = !hasExternalImageSource && shouldDirectAnimatedRecompute();
        if (directAnimatedRecompute) {
            await restartDynamicPreviewWithRecompute();
        } else {
            if (skipArtisticPass) {
                await updateQR({ skipArtisticPass: true });
            } else {
                await updateQR();
            }
            if (!hasExternalImageSource) {
                await restartDynamicPreviewWithRecompute();
            }
        }
        if (doSave) saveHistory();
    }
    
}

// Old method removed (applyImport replaced functionality)

// Replaces old processImage
function processImage(img) { 
    // Legacy support removed, now uses Overlay Flow
}

init();
// Initial snapshot
setTimeout(() => {
    if (historyStack.length === 0 && currentSuffixBytes.length > 0) {
        saveHistory();
    }
}, 500);
