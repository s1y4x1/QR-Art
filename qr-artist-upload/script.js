// Global State
let userText = document.getElementById('text-input').value;
let eccLevel = document.getElementById('ecc-level').value;
let version = parseInt(document.getElementById('version-range').value) || 0;
let maskPattern = parseInt(document.getElementById('mask-pattern').value); // -1 for auto
let encodingMode = document.getElementById('encoding-mode').value;

// Drawing State
let drawnPixels = new Map(); 
let activeTool = 'pen'; 
let isDragging = false;
let currentDragTarget = null;
let currentSuffixBytes = []; 
let lastCapacity = 0;
let generatedQR = null;

// History & Zoom
let historyStack = [];
let historyStep = -1;
let zoomLevel = 1.0;
let lastDrawPos = null;

// Map Data
let pixelMap = []; // 2D array: { type: 'data'|'ec'|'func', globalBitIndex, maskVal }
let totalDataBits = 0;
let headerBitLength = 0; 
let payloadStartBit = 0; // Header + UserText + '#'

// DOM Elements
const canvas = document.getElementById('qr-canvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.querySelector('.canvas-wrapper'); // Add Wrapper
// Ensure wrapper has relative positioning for overlay
canvasWrapper.style.position = 'relative';

const fileInput = document.getElementById('img-upload');
const importBtn = document.getElementById('import-btn');

// Overlay Elements
const importOverlay = document.getElementById('import-overlay');
const previewImg = document.getElementById('preview-img');
// const btnImportOk = document.getElementById('import-ok'); // Removed
// const btnImportCancel = document.getElementById('import-cancel'); // Removed

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
    lastY: 0
};

const textInput = document.getElementById('text-input');
const eccSelect = document.getElementById('ecc-level');
const verRange = document.getElementById('version-range');
const verDisplay = document.getElementById('version-display');
const maskSelect = document.getElementById('mask-pattern');
const encodingSelect = document.getElementById('encoding-mode');
const clearBtn = document.getElementById('clear-draw');
const whitenBtn = document.getElementById('whiten-btn');
const downloadBtn = document.getElementById('download-btn');
const toolPen = document.getElementById('tool-pen');
// const toolEraser = document.getElementById('tool-eraser'); // Removed

let CELL_SIZE = 8;
let qrMargin = 1;

function init() {
    // Determine initial version if auto
    updateQR();
    
    // Cell Size Input
    const cellSizeInput = document.getElementById('cell-size-input');
    if (cellSizeInput) {
        cellSizeInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (val < 1) val = 1;
            if (val > 100) val = 100;
            CELL_SIZE = val;
            renderQR(false); 
        });
    }

    textInput.addEventListener('input', (e) => {
        userText = e.target.value;
        // On text change, we keep suffix bytes if possible?
        // No, size changes, validation changes. Clear suffix.
        resetSuffix();
        updateQR();
    });
    
    eccSelect.addEventListener('change', (e) => {
        eccLevel = e.target.value;
        resetSuffix();
        updateQR();
    });
    
    verRange.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (val < 0) val = 0;
        if (val > 40) val = 40;
        version = val;
        
        // Sync Input Box
        const vInput = document.getElementById('version-input');
        if(vInput && vInput.value != version) vInput.value = version;

        // verDisplay.textContent = version === 0 ? "自动" : version; // Removed span
        resetSuffix();
        updateQR();
    });

    // Version Input Box Listener
    const verInput = document.getElementById('version-input');
    if (verInput) {
        verInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 40) val = 40;
            e.target.value = val;
            
            // Sync Range
            version = val;
            verRange.value = val;
            
            resetSuffix();
            updateQR();
        });
    }

    maskSelect.addEventListener('change', (e) => {
        maskPattern = parseInt(e.target.value);
        updateQR();
    });

    encodingSelect.addEventListener('change', (e) => {
        encodingMode = e.target.value;
        resetSuffix();
        updateQR();
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
    toolPen.addEventListener('click', () => setTool('pen'));
    
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
             previewImg.removeAttribute('src'); // Clear src to stop renderQR from drawing
             fileInput.value = ''; 
        }

        updateQR();
        saveHistory(); // Save the cleared state
    });
    let lastWhitenMode = 'none'; // 'white', 'black', 'none'

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
            const maskSel = document.getElementById('mask-pattern-select');
            if (maskSel) maskSel.value = bestMask;
        }

        setSuffixUniform(targetColor);
        drawnPixels.clear(); // Clear manual edits blocking the fill
        
        updateQR();
        saveHistory(); 
    });
    downloadBtn.addEventListener('click', () => {
        // Redraw only black and white for export
        renderQR(true); 
        
        const link = document.createElement('a');
        link.download = (userText || 'qrcode') + '.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
        
        // Restore Overlay
        renderQR(false); 
    });

    const artCheck = document.getElementById('artistic-mode');
    if(artCheck) {
        artCheck.addEventListener('change', () => {
             renderQR(false); // Re-render to apply logic 
        });
    }

    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);
    
    // Import Controls removed per user request
    // Buttons are removed from HTML via UI hiding but listeners were here.
    // Removed btnImportOk/Cancel listeners.

    // Import Interaction
    importOverlay.addEventListener('mousedown', startImportDrag);
    // Move and Up are global (in case mouse leaves overlay)
    document.addEventListener('mousemove', moveImportDrag);
    document.addEventListener('mouseup', endImportDrag);
    // importOverlay.addEventListener('wheel', scaleImportImg, { passive: false }); // Disabled by user request

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) drawAt(e);
    });
    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            saveHistory();
        }
    });
    canvas.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            saveHistory();
        }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    // Zoom
    canvasWrapper.addEventListener('wheel', handleWheel, { passive: false }); // Move listener to wrapper
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', handleGlobalKey);
}

function setTool(tool) {
    activeTool = tool;
    toolPen.classList.toggle('active', tool === 'pen');
}

function resetSuffix() {
    currentSuffixBytes = [];
    lastCapacity = 0;
    historyStack = [];
    historyStep = -1;
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
    totalDataBits = tDcCount * 8;

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
                    }
                    
                    pixelMap[row][col-c] = {
                        type: type,
                        globalBitIndex: globalBit,
                        maskVal: maskFunc(row, col-c) ? 1 : 0
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
    
    // Check coverage setup
    const embedImage = document.getElementById('embed-image-cb') && document.getElementById('embed-image-cb').checked;
    let checkCoverage = false;
    let imgInternalX, imgInternalY, imgInternalW, imgInternalH;
    let tempCtx = null;
    let imgData = null;
    let imgRatioW = 1, imgRatioH = 1;

    if (embedImage && previewImg.src && importState.width > 0) {
        checkCoverage = true;
        
        const count = pixelMap.length;
        const sizePx = (count + 2 * qrMargin) * CELL_SIZE;  // Internal layout size
        const displaySize = parseFloat(canvas.style.width) || canvas.width; // Visual size
        const ratio = sizePx / displaySize; // Ratio: Internal / Visual
        
        const offsets = getCanvasContentOffsets();
        
        // RelX/RelY are Dist From Canvas Border. Convert to Content.
        const contentRelX = importState.relX - offsets.left;
        const contentRelY = importState.relY - offsets.top;

        imgInternalX = contentRelX * ratio;
        imgInternalY = contentRelY * ratio;
        imgInternalW = importState.width * ratio;
        imgInternalH = importState.height * ratio;

        // Create Temp Canvas to read image pixels
        try {
            const tc = document.createElement('canvas');
            tc.width = previewImg.naturalWidth || previewImg.width;
            tc.height = previewImg.naturalHeight || previewImg.height;
            tempCtx = tc.getContext('2d');
            tempCtx.drawImage(previewImg, 0, 0);
            imgData = tempCtx.getImageData(0, 0, tc.width, tc.height);
            
            imgRatioW = tc.width / imgInternalW; // Multiply internal-coord-dist by this to get image pixel coord
            imgRatioH = tc.height / imgInternalH;
        } catch(e) {
            console.warn("Cannot read image data (CORS?):", e);
            checkCoverage = false; // Fallback to overwrite all if image unreadable
        }
    }

    const len = pixelMap.length;
    for(let r=0; r<len; r++) {
        for(let c=0; c<len; c++) {
            const cell = pixelMap[r][c];
            if (cell && cell.type === 'data' && cell.globalBitIndex >= payloadStartBit) {
                 
                 let effectiveTarget = targetColor;
                 let needsChange = true;

                 if (checkCoverage && imgData) {
                     const x = (c+qrMargin)*CELL_SIZE;
                     const y = (r+qrMargin)*CELL_SIZE;
                     const modCX = x + CELL_SIZE/2;
                     const modCY = y + CELL_SIZE/2;
                     
                     // Check if module center is inside image rect
                     if (modCX >= imgInternalX && modCX <= imgInternalX + imgInternalW &&
                         modCY >= imgInternalY && modCY <= imgInternalY + imgInternalH) {
                         
                         // Map to image pixel
                         const ix = Math.floor((modCX - imgInternalX) * imgRatioW);
                         const iy = Math.floor((modCY - imgInternalY) * imgRatioH);
                         
                         // Check Bounds
                         if (ix >= 0 && iy >= 0 && ix < imgData.width && iy < imgData.height) {
                             const idx = (iy * imgData.width + ix) * 4;
                             const rVal = imgData.data[idx];
                             const gVal = imgData.data[idx+1];
                             const bVal = imgData.data[idx+2];
                             const aVal = imgData.data[idx+3];
                             
                             if (aVal < 50) {
                                 // Almost transparent: Treat as "Empty", use targetColor
                                 effectiveTarget = targetColor;
                             } else if (aVal > 200) {
                                 // Almost opaque: Preserve image -> SKIP
                                 needsChange = false;
                             } else {
                                 // Semi-transparent: Blend logic
                                 // User: "judge whether the lightness after becoming white/black ... belongs to black or white."
                                 // If I put White (255) behind it: 
                                 // Mixed = (Img * A) + (White * (1-A))
                                 // If I put Black (0) behind it:
                                 // Mixed = (Img * A) + (Black * (1-A))
                                 // The user wants the result to be 'targetColor'. 
                                 
                                 // Actually user said: "judge if ... belongs to black or white".
                                 // They probably mean: If the blended color is brighter than grey, make it a White module.
                                 // If darker, make it a Black module.
                                 
                                 // Let's implement blending with 'targetColor' as background.
                                 // If targetColor is White (255,255,255):
                                 // r' = (r*a + 255*(255-a))/255
                                 
                                 const bgVal = (targetColor === 0) ? 255 : 0; // targetColor 0=White, 1=Black.
                                 const fA = aVal / 255.0;
                                 
                                 const blendR = rVal * fA + bgVal * (1 - fA);
                                 const blendG = gVal * fA + bgVal * (1 - fA);
                                 const blendB = bVal * fA + bgVal * (1 - fA);
                                 
                                 // Luminance
                                 const luma = 0.299 * blendR + 0.587 * blendG + 0.114 * blendB;
                                 
                                 // If result is Light (>128), we should output a White module (0).
                                 // If result is Dark (<128), we should output a Black module (1).
                                 
                                 effectiveTarget = (luma < 128) ? 1 : 0; 
                             }
                         }
                     }
                 }
            
                 if (needsChange) {
                    const maskBit = cell.maskVal; // 0 or 1
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
   
function updateQR() {
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

    // We need to fit User Text (Segment 1) + Suffix/Padding (Segment 2)
    // Suffix Payload: If UserText exists, assume "#" + 1 space. Else 1 space.
    // Lower overhead to prevent early version jump in Numeric mode.
    const suffixStr = userText ? "# " : " ";
    
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

        // Segment 2: Suffix
        totalBits += 4; // Mode (Byte)
        totalBits += getLengthBits('Byte', v);
        totalBits += getBitLength('Byte', suffixStr);

        if (totalBits <= capacityBits) {
             minVersion = v;
             break;
        }
        if (v === 40) minVersion = 40;
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
    
    // Check if verDisplay exists logic replaced:
    const vInput = document.getElementById('version-input');
    if(vInput && version === 0 && document.activeElement !== vInput) {
         // If auto (0), show the calculated version as placeholder or value?
         // User wants to see "0" usually, but maybe they want to see "Auto (3)"?
         // Input type=number showing "0" is fine. We can explain it in UI.
         // Actually better: If version is 0, keep input as 0.
         // Do not overwrite input with typeNumber if mode is Auto.
    }
    
    let mask = maskPattern;
    // If mask is Auto (-1), use Dummy Mask 0 for capacity/structure calculation
    const tempMask = (mask === -1) ? 0 : mask;

    // Rebuild Map check
    const needRebuild = !pixelMap || 
                        pixelMap.length !== typeNumber*4+17 ||
                        lastState.ver !== typeNumber ||
                        lastState.ecc !== eccLevel ||
                        // If mask is fixed, check it. If Auto, we always rebuild in drawGrid, 
                        // but here we just need structure for Data calc. 
                        (mask !== -1 && lastState.mask !== mask) ||
                        (mask === -1 && lastState.mask === -100); // Init case

    if (needRebuild) {
        buildPixelMap(typeNumber, eccLevel, tempMask);
        lastState = { ver: typeNumber, ecc: eccLevel, mask: tempMask }; // Temp state
        fitToScreen();
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
    
    // Segment 2 Header: For the Suffix Part
    // We treat Suffix as the rest (Byte Mode)
    // 1. Mode (Byte = 4, 4 bits)
    prefixBuffer.put(4, 4);
    
    // 2. Separator '#' (Only if User Text exists)
    // Actually '#' is part of the DATA of Segment 2, OR we can append it to Segment 1?
    // In original code: `t.addData(userText + "#" + suffix, ...)`
    // So if userText exists, we want separator.
    // If we put '#' in Segment 2, we must count it in length.
    const hasSeparator = (userText && userText.length > 0);
    const separatorLen = hasSeparator ? 1 : 0;
    
    // 3. Count Indicator
    // Need calculate length of Suffix Chars.
    const countBits = typeNumber < 10 ? 8 : 16;
    
    // Calculate available bits for suffix
    const currentBits = prefixBuffer.getLengthInBits();
    
    // available bits for payload (separator + suffix)
    // We reserve space for headers + data.
    // Length Header itself takes `countBits`.
    // available = Total - CurrentPrefix (Mode+Len+Data of Seg1 + Mode of Seg2) - LenHeader of Seg2
    const availableBits = totalDataBits - currentBits - countBits; 
    
    // How many bytes can we fit?
    // Suffix Payload = Separator(#) + SuffixData
    const maxPayloadBytes = Math.floor(availableBits / 8);
    
    prefixBuffer.put(maxPayloadBytes, countBits);
    
    // 4. The '#' Character (if needed)
    if (hasSeparator) {
        prefixBuffer.put(0x23, 8);
    }
    
    // Now we have the full Prefix Bitstream (Seg1 + Seg2Header + Possible#)
    // Write this into our Master Buffer `currentSuffixBytes`
    // This overwrites the "Protected" area with correct headers
    writeBufferBits(prefixBuffer, currentSuffixBytes);
    
    payloadStartBit = prefixBuffer.getLengthInBits();
    
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
    
    drawGrid(constructedSuffix, typeNumber, mask, hasSeparator); 
}

function drawGrid(suffixStr, type, mask, hasSeparator) {
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
    
    // Add Segment 2
    let seg2Data = suffixStr;
    if (hasSeparator) seg2Data = "#" + suffixStr;
    
    qr.addData(seg2Data, 'Byte');

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
         // Actually, if maskPattern is -1, we loop via updateQR -> tempMask 0 -> Rebuild 0.
         // Then here Rebuild Real.
         // This is fine.
    }
    
    // Store QR and Render
    generatedQR = qr;
    renderQR(false);
}

function renderQR(isExport) {
    if (!generatedQR) return;
    
    const count = generatedQR.getModuleCount();
    const sizePx = (count + 2 * qrMargin) * CELL_SIZE;

    canvas.width = sizePx;
    canvas.height = sizePx;
    
    // Apply Zoom
    const displaySize = Math.floor(sizePx * zoomLevel);
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    canvas.style.transform = ''; 
    canvas.style.imageRendering = "pixelated"; 
    
    // Always start with white background (fixes transparency issues on export)
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // Background Image Mode
    const embedImage = document.getElementById('embed-image-cb') && document.getElementById('embed-image-cb').checked;
    
    
    // Check "Artistic Mode" (Exploit EC)
    const artisticMode = document.getElementById('artistic-mode') && document.getElementById('artistic-mode').checked;
    
    // PRE-CALCULATE IMAGE GEOMETRY & DATA
    // We unify coordinates here to prevent discrepancy between "Artistic Override" and "Visual Ghosting"
    let imgDrawX = 0, imgDrawY = 0, imgDrawW = 0, imgDrawH = 0;
    let hasImage = false;
    let offData = null;
    let bgData = null;

    if (previewImg.src && importState.width > 0 && (embedImage || artisticMode)) {
        try {
            hasImage = true;
            const ratio = sizePx / displaySize;
            const offsets = getCanvasContentOffsets();
            let relX = importState.relX;
            let relY = importState.relY;
             if (relX === 0 && relY === 0 && importState.x !== 0) {
                 relX = importState.x - canvas.offsetLeft;
                 relY = importState.y - canvas.offsetTop;
            }
            
            // UNIFIED GEOMETRY: Always adjust for 2px border on Overlay
            const borderAdjust = 2; 
            imgDrawX = Math.round((relX - offsets.left + borderAdjust) * ratio);
            imgDrawY = Math.round((relY - offsets.top + borderAdjust) * ratio);
            imgDrawW = Math.round(importState.width * ratio);
            imgDrawH = Math.round(importState.height * ratio);
            
            // Prepare offscreen canvas (Official Reference for Image Data)
            const offCan = document.createElement('canvas');
            offCan.width = canvas.width;
            offCan.height = canvas.height;
            const offCtx = offCan.getContext('2d');
            offCtx.clearRect(0,0, offCan.width, offCan.height);
            offCtx.drawImage(previewImg, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
            offData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            // Draw to Main Canvas (if needed)
            const shouldDrawBg = isExport || !importState.active;
            if (embedImage && shouldDrawBg) {
                 ctx.drawImage(previewImg, imgDrawX, imgDrawY, imgDrawW, imgDrawH);
                 bgData = ctx.getImageData(0, 0, canvas.width, canvas.height); 
            } else {
                 bgData = ctx.getImageData(0,0, canvas.width, canvas.height);
            }
        } catch(e) { console.error(e); }
    } else {
        // Just grab bgData for consistency if needed later? (Mostly white)
        // Optimization: not strictly needed loop will fail gracefully
    }

    for(let r=0; r<count; r++) {
        for(let c=0; c<count; c++) {
            let isDark = generatedQR.isDark(r,c);
            const cell = pixelMap[r] ? pixelMap[r][c] : null;

            // --- Artistic Mode Override (Exploit Error Correction) ---
            let artOverride = false;
            
            const isFormatInfo = (r, c) => {
                // Fixed Dark Module
                if (r === count - 8 && c === 8) return true;
                // Vertical Strip under TL Finder
                if (c === 8 && r < 9) return true;
                if (c === 8 && r >= count - 8) return true;
                // Horizontal Strip right of TL Finder
                if (r === 8 && c < 9) return true;
                if (r === 8 && c >= count - 8) return true;
                return false;
            };

            if (artisticMode && offData && cell && (cell.type === 'data' || cell.type === 'ec')) {
                if (!isFormatInfo(r, c)) {
                    // Sample Image
                    const cx = Math.floor((c + qrMargin) * CELL_SIZE + (CELL_SIZE / 2));
                    const cy = Math.floor((r + qrMargin) * CELL_SIZE + (CELL_SIZE / 2));
                    // Note: offData is drawn at imgDrawX/Y. Sampling at absolute canvas cx,cy is correct.
                    
                    if (cx >=0 && cx < canvas.width && cy >=0 && cy < canvas.height) {
                        const idx = (cy * canvas.width + cx) * 4;
                        // Check Alpha (Threshold 10)
                        if (offData[idx+3] > 10) {
                            const rr = offData[idx];
                            const gg = offData[idx+1];
                            const bb = offData[idx+2];
                            const lum = (0.299*rr + 0.587*gg + 0.114*bb);
                            // Binarization Threshold (128)
                            isDark = (lum < 128); 
                            artOverride = true;
                        }
                    }
                }
            }
            
            // Check manual draw overrides (Pen works on top of Art Mode)
            if (drawnPixels.has(`${r},${c}`)) {
                 const val = drawnPixels.get(`${r},${c}`);
                 if (val === 1) isDark = true;
                 if (val === 0) isDark = false; 
            }

            const x = (c+qrMargin)*CELL_SIZE;
            const y = (r+qrMargin)*CELL_SIZE;
            
            // Check coverage based on UNIFIED GEOMETRY
            let covered = false;
            
            if (hasImage && embedImage) {
                 const modCX = x + CELL_SIZE/2;
                 const modCY = y + CELL_SIZE/2;

                 if (modCX >= imgDrawX && modCX <= imgDrawX + imgDrawW &&
                     modCY >= imgDrawY && modCY <= imgDrawY + imgDrawH) {
                     covered = true;
                 }

                 // ROBUST COVERAGE: If Binarization (Artistic Mode) saw this pixel as part of the image (Alpha > 10),
                 // then MUST treat it as Covered (Ghost) to prevent "Large Black Squares" at the fringe.
                 // This ensures 100% consistency between the Logic Pass (Bits) and Visual Pass (Ghosts).
                 if (!covered && offData) {
                    const cx = Math.floor(modCX);
                    const cy = Math.floor(modCY);
                    if (cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
                        const idx = (cy * canvas.width + cx) * 4;
                        if (offData[idx+3] > 10) {
                             covered = true;
                        }
                    }
                 }
            }
            
            let useGhost = false;
            if (covered) {
                // New Logic: If inside image area (covered), always use Ghost style.
                // This applies to both Opaque and Transparent areas of the image.
                // It ensures uniform look inside the image bounds.
                if (cell && (cell.type === 'data' || cell.type === 'ec')) {
                    useGhost = true;
                }
            }
            
            if (useGhost) {
                // Modified rendering: Check luminance to decide whether to draw
                const smallSize = CELL_SIZE / 2;
                const offset = CELL_SIZE / 4;
                
                // Sample center pixel
                const cx = Math.floor(x + CELL_SIZE/2);
                const cy = Math.floor(y + CELL_SIZE/2);
                
                let lum = 0.5; // Default if OOB
                let isTransparent = false;

                // Priority: Use offData (Real Image) if available, as bgData might be white (if editing)
                if (offData && cx >= 0 && cx < canvas.width && cy >= 0 && cy < canvas.height) {
                    const idx = (cy * canvas.width + cx) * 4;
                    
                    // Check transparency (Alpha < 10)
                    if (offData[idx+3] <= 10) {
                         isTransparent = true;
                    } else {
                        const rr = offData[idx];
                        const gg = offData[idx+1];
                        const bb = offData[idx+2];
                        lum = (0.299*rr + 0.587*gg + 0.114*bb) / 255.0;
                    }
                } else if (bgData && cx >=0 && cx < canvas.width && cy >=0 && cy < canvas.height) {
                    // Fallback to bgData (Canvas). 
                    // Note: Cannot reliable detect transparency from white bgData, so assume Opaque.
                    const idx = (cy * canvas.width + cx) * 4;
                    const rr = bgData.data[idx];
                    const gg = bgData.data[idx+1];
                    const bb = bgData.data[idx+2];
                    lum = (0.299*rr + 0.587*gg + 0.114*bb) / 255.0;
                }
                
                // Special handling for Transparent areas: Display original module as small square
                if (isTransparent) {
                     ctx.fillStyle = isDark ? 'black' : 'white';
                     // White modules on white background are invisible, which is correct ("Retain them")
                     // Black modules on white background appear as small dots.
                     ctx.fillRect(x + offset, y + offset, smallSize, smallSize);
                } else {
                    let alpha = 0.3; // fallback default
                    let shouldDraw = false;
                    
                    if (isDark) {

                    // Target: Dark (< 0.25)
                    if (lum < 0.25) {
                        shouldDraw = false;
                    } else {
                        shouldDraw = true;
                        // Calculate alpha to reach 0.25
                        // lum * (1 - a) = 0.25 => a = 1 - 0.25/lum
                        alpha = 1 - (0.25 / lum);
                        if (alpha < 0) alpha = 0; // Should be covered by if catch
                    }
                    if (shouldDraw) {
                        alpha = Math.max(0, Math.min(1, alpha));
                        ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
                        ctx.fillRect(x + offset, y + offset, smallSize, smallSize);
                    }
                } else {
                    // Target: Light (> 0.80)
                    if (lum > 0.80) {
                        shouldDraw = false;
                    } else {
                        shouldDraw = true;
                        // Calculate alpha to reach 0.80
                        // lum * (1 - a) + a = 0.80 
                        // a * (1 - lum) = 0.80 - lum
                        // a = (0.80 - lum) / (1 - lum)
                        if (lum >= 1) alpha = 1; // pure white needed if lum is 1 (impossible if we want light)
                        else alpha = (0.80 - lum) / (1.0 - lum);
                    }
                    if (shouldDraw) {
                        alpha = Math.max(0, Math.min(1, alpha));
                        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
                        ctx.fillRect(x + offset, y + offset, smallSize, smallSize);
                    }
                }
              }
            } else {
                ctx.fillStyle = isDark ? 'black' : 'white';
                ctx.fillRect(x,y, CELL_SIZE, CELL_SIZE);
            }
            // ... (Visuals logic unchanged)
            
            // Visuals (Overlay) - Skip if isExport is true OR if embedImage is active (cleaner look?)
            // Requirement said "Save should include image".
            // Typically "Visuals" (Yellow/Blue/Gray pads) are for Editor mode.
            // If Embed Image is checked, we probably still want to see Editor guides unless exporting?
            // "不被选中，则一切照旧" implies old behavior.
            // If checked... maybe guides are distracting?
            // Let's hide guides if exporting, keep them if editing, even in Embed mode (maybe with low opacity).
            
            if (!isExport && cell) {
                if (cell.type === 'func') {
                     ctx.fillStyle = 'rgba(128, 128, 128, 0.4)'; 
                     ctx.fillRect(x,y, CELL_SIZE, CELL_SIZE);
                } else if (cell.type === 'ec') {
                     ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'; 
                     ctx.fillRect(x,y, CELL_SIZE, CELL_SIZE);
                } else if (cell.type === 'data') {
                    if (cell.globalBitIndex < payloadStartBit) {
                         ctx.fillStyle = 'rgba(255, 235, 59, 0.3)'; 
                         ctx.fillRect(x,y, CELL_SIZE, CELL_SIZE);
                    }
                } 
            }
        }
    }
}

function startDraw(e) {
    // Note: History is saved on 'mouseup' to capture the full stroke as one state
    isDragging = true;
    
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
    
    if (lastDrawPos) {
        plotLine(lastDrawPos.r, lastDrawPos.c, r, c, currentDragTarget);
    }
    lastDrawPos = { r, c };
    
    updateQR();
}

function plotLine(r0, c0, r1, c1, color) {
    let dx = Math.abs(c1 - c0);
    let dy = Math.abs(r1 - r0);
    let sx = (c0 < c1) ? 1 : -1;
    let sy = (r0 < r1) ? 1 : -1;
    let err = dx - dy;
    
    while(true) {
        modifyPixel(r0, c0, color);
        if (r0 === r1 && c0 === c1) break;
        let e2 = 2 * err;
        if (e2 > -dy) { err -= dy; c0 += sx; }
        if (e2 < dx) { err += dx; r0 += sy; }
    }
}

function modifyPixel(r, c, targetColor) {
    if (!pixelMap || r<0 || c<0 || r>=pixelMap.length || c>=pixelMap.length) return;
    const cell = pixelMap[r][c];
    if (!cell || cell.type !== 'data') return;
    if (cell.globalBitIndex < payloadStartBit) return; // Protected
    
    const maskBit = cell.maskVal;
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
    
    if (bIdx >= currentSuffixBytes.length) return;

    if (reqBit) currentSuffixBytes[bIdx] |= (1<<bitPos);
    else currentSuffixBytes[bIdx] &= ~(1<<bitPos);
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
    
    // Calculate cursor position Ratio relative to the Canvas Image
    const cLeft = canvas.offsetLeft;
    const cTop = canvas.offsetTop;
    
    const absX = scrollX + mouseX;
    const absY = scrollY + mouseY;
    
    const relX = absX - cLeft;
    const relY = absY - cTop;
    
    const rx = relX / currentW;
    const ry = relY / currentW;
    
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
    const newSize = Math.floor(canvas.width * zoomLevel);
    
    canvas.style.width = newSize + 'px';
    canvas.style.height = newSize + 'px'; // Keep aspect ratio square
    
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
    
    canvasWrapper.scrollLeft = (newSize * rx) - mouseX + (cLeft * ratio); // Approximate cLeft scaling?
    canvasWrapper.scrollTop = (newSize * ry) - mouseY + (cTop * ratio);
    
    // Correction: Standard Zoom-At-Cursor logic for scroll containers
    // Wrapper.scrollLeft += (mouseX + scrollLeft) * (rate - 1) ? No.
    // Correct: 
    // newScrollLeft = (scrollLeft + mouseX) * ratio - mouseX
    // IF content is at 0,0. 
    // Since we have offsets, stick to previous reliable formula or this simpler one.
    // Previous: canvasWrapper.scrollLeft = (newSize * rx) - mouseX;
    // This worked well when cLeft was negligible. With new centering layout, let's keep it but re-verify.
    // Actually let's just stick to the previous working one:
    canvasWrapper.scrollLeft = (newSize * rx + cLeft) - mouseX; // Wait, previous didn't have +cLeft
    // Previous: (newSize * rx) - mouseX. 
    // (newSize * rx) is the new Pixel Position relative to Canvas Origin.
    // - mouseX shifts it so that pixel is at mouseX visual spot.
    // This assumes Canvas Origin is at (ScrollLeft + 0).
    // If Canvas has Margin, Canvas Origin is at (ScrollLeft + Margin).
    // So if we ignore Margin change, it's roughly correct.
    canvasWrapper.scrollLeft = (newSize * rx) - mouseX;
    canvasWrapper.scrollTop = (newSize * ry) - mouseY;

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
            
            // importState.relX/relY is visual offset?
            // Let's verify usage. 
            // In handleWheel: importState.relX *= ratio; 
            // In applyImport: mappedX = Math.floor((pixelX - imgBoxParams.x) / imgBoxParams.width * imgWidth);
            // x = canvas.offsetLeft + relX.
            // If I press Right, I want to move Right visually.
            // relX is visual offset from canvas edge.
            // So relX += dx works perfectly.
            
            importState.relX += dx;
            importState.relY += dy;
            
            // Sync absolute coords
            const cLeft = canvas.offsetLeft;
            const cTop = canvas.offsetTop;
            importState.x = cLeft + importState.relX;
            importState.y = cTop + importState.relY;
            
            updateOverlayTransform();
            // Re-render to see changes in QR
            renderQR(false); 
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

function copyToClipboard() {
    renderQR(true);
    canvas.toBlob(blob => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
            alert('已复制到剪贴板');
        });
        renderQR(false); // Restore
    });
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(evt) {
        previewImg.src = evt.target.result;
        previewImg.onload = function() {
            if (historyStep === -1) saveHistory(); // Save pre-upload state
            
            // Auto-check Embed Image on Upload
            const embedCb = document.getElementById('embed-image-cb');
            if(embedCb && !embedCb.checked) embedCb.checked = true;
            
            startImportMode(previewImg.naturalWidth, previewImg.naturalHeight);
            applyImport(false); 
            saveHistory(); 
        };
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
}

function startImportMode(natW, natH) {
    importState.active = true;
    updateOverlayVisibility();
    
    // Initial Size: Fit to 50% of canvas or natural size, centered
    const canvasRect = canvas.getBoundingClientRect(); // Current visual size
    const wrapperRect = canvasWrapper.getBoundingClientRect(); // Wrapper viewport
    
    // We want to position relative to the Wrapper content area.
    // Actually, `canvas` is inside wrapper and might be scrolled.
    // The overlay is inside wrapper, so it moves with scroll.
    // We need to set left/top relative to wrapper's top-left corner (0,0 of scrollable area).
    // Initial pos: Center of current visible view.
    
    const viewW = wrapperRect.width;
    const viewH = wrapperRect.height;
    
    // Initial visual size for the image (try to match roughly 1/2 view)
    const aspect = natW / natH;
    let initW = viewW * 0.5;
    let initH = initW / aspect;
    
    importState.width = initW;
    importState.height = initH;
    importState.x = canvasWrapper.scrollLeft + (viewW - initW) / 2;
    importState.y = canvasWrapper.scrollTop + (viewH - initH) / 2;
    
    // Init Rel Pos
    importState.relX = importState.x - canvas.offsetLeft;
    importState.relY = importState.y - canvas.offsetTop;
    
    updateOverlayTransform();
    
    // Force hide buttons (Requested by user)
    document.getElementById('import-ok').style.display = 'none';
    document.getElementById('import-cancel').style.display = 'none';
}

function updateOverlayTransform() {
    importOverlay.style.width = importState.width + 'px';
    importOverlay.style.height = importState.height + 'px';
    importOverlay.style.left = importState.x + 'px';
    importOverlay.style.top = importState.y + 'px';
}

function updateOverlayVisibility() {
    const embedCb = document.getElementById('embed-image-cb');
    const ov = document.getElementById('import-overlay'); // Direct DOM access for safety
    if (!ov) return;

    // Show if Active AND (Checkbox Checked or Checkbox missing)
    // If Unchecked -> Hidden "Temporarily"
    const isChecked = !embedCb || embedCb.checked;
    
    // Fix: Ensure we strictly hide if unchecked, regardless of active state
    if (importState.active && isChecked) {
        ov.style.display = 'block';
    } else {
        ov.style.display = 'none';
    }
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
            if (h === 'se') {
                newW += dx;
                newH = newW / importState.aspect;
            } else if (h === 'sw') {
                newW -= dx;
                newX += dx;
                newH = newW / importState.aspect;
            } else if (h === 'ne') {
                newW += dx;
                newH = newW / importState.aspect;
                newY = importState.y + (importState.height - newH); 
            } else if (h === 'nw') {
                newW -= dx;
                newX += dx;
                newH = newW / importState.aspect;
                newY = importState.y + (importState.height - newH);
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
        didChange = true;
    } else if (importState.isDragging) { // Added else if to separate logic
        e.preventDefault();
        const dx = e.clientX - importState.lastX;
        const dy = e.clientY - importState.lastY;
        
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
         // applyImport(false); // Removed per user request (laggy)
         // Instead just update the Visual Ghosting
         renderQR(false);
    }
}

function endImportDrag() {
    if (importState.isDragging || importState.isResizing) {
        // Apply final changes to Data
        applyImport(true); 
    }
    
    importState.isDragging = false;
    importState.isResizing = false;
    importState.resizeHandle = null;
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

function applyImport(doSave = true) {
    if (!importState.active) return;
    
    // 1. Setup Coordinates and Temp Canvas
    const canvasRect = canvas.getBoundingClientRect();
    const offsets = getCanvasContentOffsets();
    
    // Safety check for size
    if (canvasRect.width === 0) return;

    const style = window.getComputedStyle(canvas);
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderRight = parseFloat(style.borderRightWidth) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    
    // Visual Content Dimensions
    const visualContentWidth = canvasRect.width - borderLeft - borderRight - paddingLeft - paddingRight;

    // Relative Image Position (Image TopLeft relative to Canvas Content TopLeft)
    // importState.relX = Distance from Border Edge. contentRelX = relX - offset.
    const imageRelX = importState.relX - offsets.left;
    const imageRelY = importState.relY - offsets.top;

    // Create Temp Canvas with Image (Visual Size)
    // We treat importState.width/height as "Visual Size".
    // We will sample this canvas.
    const tmpCanvas = document.createElement('canvas');
    const tW = Math.ceil(importState.width);
    const tH = Math.ceil(importState.height);
    tmpCanvas.width = tW;
    tmpCanvas.height = tH;
    const tCtx = tmpCanvas.getContext('2d');
    
    if (tW > 0 && tH > 0) {
        tCtx.drawImage(previewImg, 0, 0, tW, tH);
    }
    const imgData = tCtx.getImageData(0, 0, tW, tH);
    
    // 2. Loop Modules and Sample
    const qrSize = pixelMap.length;
    // CRITICAL FIX: The pixelMap is just the "Logic Matrix" (e.g. 21x21).
    // The VISUAL Canvas includes margins (4 modules on each side).
    // So Visual Width represents (qrSize + 2 * qrMargin) modules.
    const totalModulesVisual = qrSize + 2 * qrMargin;
    const moduleSizeVisual = visualContentWidth / totalModulesVisual; 
    
    let changed = false;

    for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
            const cell = pixelMap[r][c];
            // Only affect Valid Free Suffix Data
            if (cell && cell.type === 'data' && cell.globalBitIndex >= payloadStartBit) {
                // Determine Center of Module in Visual Content Coords
                // Grid (c) is internal 0..N.
                // Visual Position starts at qrMargin.
                const cx = (c + qrMargin) * moduleSizeVisual + (moduleSizeVisual / 2);
                const cy = (r + qrMargin) * moduleSizeVisual + (moduleSizeVisual / 2);
                
                // Map to Image Local Coords
                const localX = Math.floor(cx - imageRelX);
                const localY = Math.floor(cy - imageRelY);
                
                // Sample if inside image
                if (localX >= 0 && localX < tW && localY >= 0 && localY < tH) {
                    const idx = (localY * tW + localX) * 4;
                    const rr = imgData.data[idx];
                    const gg = imgData.data[idx+1];
                    const bb = imgData.data[idx+2];
                    const aa = imgData.data[idx+3];
                    
                    // Ignore transparent pixels 
                    if (aa < 10) continue; 
                    
                    const aNorm = aa / 255.0;
                    // Assume white background for blending
                    const rB = rr * aNorm + 255 * (1 - aNorm);
                    const gB = gg * aNorm + 255 * (1 - aNorm);
                    const bB = bb * aNorm + 255 * (1 - aNorm);
                    
                    const lum = (0.299*rB + 0.587*gB + 0.114*bB); // Range 0-255
                    
                    // Standard Binarization (Threshold 128)
                    // Users asked to revert strictly to standard binarization, 
                    // unrelated to the ghost rendering thresholds.
                    const targetColor = (lum < 128) ? 1 : 0; // Black : White
                    
                     // Apply
                     modifyPixel(r, c, targetColor);
                     changed = true;
                }
            }
        }
    }

    if (changed) {
        updateQR();
        if (doSave) saveHistory();
    }
    
    // cancelImport(); // No longer hiding overlay per "Realtime" request. User can manually close or keep open?
    // User didn't ask to keep it open... but said "when user uploads, drag... process realtime".
    // If we cancel import, the overlay disappears and user can't drag anymore.
    // So we MUST NOT call cancelImport() now.
    // cancelImport(); 
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
