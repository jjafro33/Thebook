import * as THREE from 'three';

const ASSET_URLS = {
  sky: '/src/assets/images/sky_enchantable_island_1795334851579.jpg',
  cobble: '/src/assets/images/tex_stone_cobble_1795334852637.jpg',
  grass: '/src/assets/images/tex_meadow_grass_1795334851303.jpg',
  wood: '/src/assets/images/tex_carved_oak_1795334851837.jpg',
  arcaneGlass: '/src/assets/images/tex_arcane_glass_1795334852403.jpg',
};

function createCanvas(width: number, height = width): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function makeCanvasTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  anisotropy = 4,
  isColor = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a tangent-space normal map + roughness map from a loaded color image
 * using Sobel height gradients. Output canvases keep fixed dimensions to avoid WebGL resize bugs.
 */
function bakeNormalAndRoughnessFromImage(
  img: HTMLImageElement,
  normalCanvas: HTMLCanvasElement,
  roughCanvas: HTMLCanvasElement,
  strength: number,
  roughMin: number,
  roughMax: number
): void {
  const size = normalCanvas.width;
  const [tmpCan, tmpCtx] = createCanvas(size);
  tmpCtx.drawImage(img, 0, 0, size, size);
  const src = tmpCtx.getImageData(0, 0, size, size).data;

  const heightMap = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const r = src[i * 4];
    const g = src[i * 4 + 1];
    const b = src[i * 4 + 2];
    heightMap[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  const nCtx = normalCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);

  const rCtx = roughCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(size, size);

  const sampleH = (x: number, y: number) => {
    const wx = (x + size) % size;
    const wy = (y + size) % size;
    return heightMap[wy * size + wx];
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = sampleH(x - 1, y - 1);
      const t = sampleH(x, y - 1);
      const tr = sampleH(x + 1, y - 1);
      const l = sampleH(x - 1, y);
      const r = sampleH(x + 1, y);
      const bl = sampleH(x - 1, y + 1);
      const b = sampleH(x, y + 1);
      const br = sampleH(x + 1, y + 1);

      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const dz = 1.0;
      const invLen = 1 / Math.hypot(dx, dy, dz);

      const idx = (y * size + x) * 4;
      nImg.data[idx] = Math.round((-dx * invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 1] = Math.round((-dy * invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 2] = Math.round((dz * invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 3] = 255;

      const h = heightMap[y * size + x];
      const roughVal = Math.round(THREE.MathUtils.lerp(roughMax, roughMin, h) * 255);
      rImg.data[idx] = roughVal;
      rImg.data[idx + 1] = roughVal;
      rImg.data[idx + 2] = roughVal;
      rImg.data[idx + 3] = 255;
    }
  }

  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
}

function bakeNormalFromCanvas(
  srcCanvas: HTMLCanvasElement,
  normalCanvas: HTMLCanvasElement,
  strength: number
): void {
  const size = normalCanvas.width;
  const [tmpCan, tmpCtx] = createCanvas(size);
  tmpCtx.drawImage(srcCanvas, 0, 0, size, size);
  const src = tmpCtx.getImageData(0, 0, size, size).data;
  const hMap = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    hMap[i] = (0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2]) / 255;
  }
  const nCtx = normalCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);
  const sampleH = (x: number, y: number) => hMap[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = sampleH(x - 1, y - 1);
      const t = sampleH(x, y - 1);
      const tr = sampleH(x + 1, y - 1);
      const l = sampleH(x - 1, y);
      const r = sampleH(x + 1, y);
      const bl = sampleH(x - 1, y + 1);
      const b = sampleH(x, y + 1);
      const br = sampleH(x + 1, y + 1);
      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
      const invLen = 1 / Math.hypot(dx, dy, 1.0);
      const idx = (y * size + x) * 4;
      nImg.data[idx] = Math.round((-dx * invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 1] = Math.round((-dy * invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 2] = Math.round((invLen * 0.5 + 0.5) * 255);
      nImg.data[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);
}

function loadRealAssetIntoFixedCanvasTex(
  url: string,
  colorCanvas: HTMLCanvasElement,
  colorTex: THREE.CanvasTexture,
  normalCanvas?: HTMLCanvasElement,
  normalTex?: THREE.CanvasTexture,
  roughCanvas?: HTMLCanvasElement,
  roughTex?: THREE.CanvasTexture,
  normalStrength = 2.6,
  roughMin = 0.4,
  roughMax = 0.92
): void {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const ctx = colorCanvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, colorCanvas.width, colorCanvas.height);
    colorTex.needsUpdate = true;

    if (normalCanvas && normalTex && roughCanvas && roughTex) {
      bakeNormalAndRoughnessFromImage(
        img,
        normalCanvas,
        roughCanvas,
        normalStrength,
        roughMin,
        roughMax
      );
      normalTex.needsUpdate = true;
      roughTex.needsUpdate = true;
    }
  };
  img.src = url;
}

export interface ProceduralTextures {
  grass: THREE.CanvasTexture;
  grassNormal: THREE.CanvasTexture;
  grassRoughness: THREE.CanvasTexture;
  cobble: THREE.CanvasTexture;
  cobbleNormal: THREE.CanvasTexture;
  cobbleRoughness: THREE.CanvasTexture;
  wood: THREE.CanvasTexture;
  woodNormal: THREE.CanvasTexture;
  woodRoughness: THREE.CanvasTexture;
  plaster: THREE.CanvasTexture;
  roofSlate: THREE.CanvasTexture;
  roofTerracotta: THREE.CanvasTexture;
  roofTerracottaNormal: THREE.CanvasTexture;
  awningStripes: THREE.CanvasTexture;
  bannerCrest: THREE.CanvasTexture;
  waterfallFoam: THREE.CanvasTexture;
  bark: THREE.CanvasTexture;
  marble: THREE.CanvasTexture;
  runeCircle: THREE.CanvasTexture;
  bookPage: THREE.CanvasTexture;
  arcaneGlass: THREE.CanvasTexture;
  skyVillage: THREE.CanvasTexture;
  celestialDome: THREE.CanvasTexture;
  softParticle: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  water: THREE.CanvasTexture;
  waterNormal: THREE.CanvasTexture;
  nateTunic: THREE.CanvasTexture;
  nateTunicNormal: THREE.CanvasTexture;
  nateCape: THREE.CanvasTexture;
  nateCapeNormal: THREE.CanvasTexture;
  nateLeather: THREE.CanvasTexture;
  nateLeatherNormal: THREE.CanvasTexture;
  natePants: THREE.CanvasTexture;
  nateHair: THREE.CanvasTexture;
  nateHairNormal: THREE.CanvasTexture;
  nateSkin: THREE.CanvasTexture;
  jafrShell: THREE.CanvasTexture;
  desertSand: THREE.CanvasTexture;
  desertSandNormal: THREE.CanvasTexture;
  sandstone: THREE.CanvasTexture;
  palaceMarble: THREE.CanvasTexture;
  snehShell: THREE.CanvasTexture;
  royalBlueEmbroidery: THREE.CanvasTexture;
  royalBlueEmbroideryNormal: THREE.CanvasTexture;
  ivoryLace: THREE.CanvasTexture;
  damascusSteel: THREE.CanvasTexture;
  ashlarStone: THREE.CanvasTexture;
  ashlarStoneNormal: THREE.CanvasTexture;
  mahoganyWood: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextures {
  const aniso = Math.min(8, maxAnisotropy || 4);

  const makeNeutralNormalCanvas = (size = 256) => {
    const [c, ctx] = createCanvas(size);
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, 0, size, size);
    return c;
  };
  const makeNeutralRoughCanvas = (size = 256, val = 200) => {
    const [c, ctx] = createCanvas(size);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, 0, size, size);
    return c;
  };

  // 1. Lush Meadow Grass (512x512 fixed size)
  const [gCan, gCtx] = createCanvas(512);
  gCtx.fillStyle = '#3d6b35';
  gCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4200; i++) {
    gCtx.fillStyle = i % 3 === 0 ? '#4e843f' : '#2e5729';
    gCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 5);
  }
  const grass = makeCanvasTexture(gCan, 44, 44, aniso, true);
  const gNormCan = makeNeutralNormalCanvas(256);
  const grassNormal = makeCanvasTexture(gNormCan, 44, 44, aniso, false);
  const gRoughCan = makeNeutralRoughCanvas(256, 220);
  const grassRoughness = makeCanvasTexture(gRoughCan, 44, 44, aniso, false);
  loadRealAssetIntoFixedCanvasTex(
    ASSET_URLS.grass,
    gCan,
    grass,
    gNormCan,
    grassNormal,
    gRoughCan,
    grassRoughness,
    2.2,
    0.7,
    0.96
  );

  // 2. Mossy Medieval Cobblestone (512x512 fixed size)
  const [cCan, cCtx] = createCanvas(512);
  cCtx.fillStyle = '#6c6559';
  cCtx.fillRect(0, 0, 512, 512);
  const cobble = makeCanvasTexture(cCan, 2, 160, aniso, true);
  const cNormCan = makeNeutralNormalCanvas(256);
  const cobbleNormal = makeCanvasTexture(cNormCan, 2, 160, aniso, false);
  const cRoughCan = makeNeutralRoughCanvas(256, 180);
  const cobbleRoughness = makeCanvasTexture(cRoughCan, 2, 160, aniso, false);
  loadRealAssetIntoFixedCanvasTex(
    ASSET_URLS.cobble,
    cCan,
    cobble,
    cNormCan,
    cobbleNormal,
    cRoughCan,
    cobbleRoughness,
    3.2,
    0.45,
    0.9
  );

  // 3. Carved Oak & Mahogany Wood (512x512 fixed size)
  const [wCan, wCtx] = createCanvas(512);
  wCtx.fillStyle = '#6b4528';
  wCtx.fillRect(0, 0, 512, 512);
  const wood = makeCanvasTexture(wCan, 2, 2, aniso, true);
  const wNormCan = makeNeutralNormalCanvas(256);
  const woodNormal = makeCanvasTexture(wNormCan, 2, 2, aniso, false);
  const wRoughCan = makeNeutralRoughCanvas(256, 190);
  const woodRoughness = makeCanvasTexture(wRoughCan, 2, 2, aniso, false);
  loadRealAssetIntoFixedCanvasTex(
    ASSET_URLS.wood,
    wCan,
    wood,
    wNormCan,
    woodNormal,
    wRoughCan,
    woodRoughness,
    2.6,
    0.48,
    0.88
  );

  // 4. Arcane Stained Glass & Illuminated Tome (512x512 fixed power-of-2 size)
  const [agCan, agCtx] = createCanvas(512, 512);
  agCtx.fillStyle = '#1d3268';
  agCtx.fillRect(0, 0, 512, 512);
  const arcaneGlass = makeCanvasTexture(agCan, 1, 1, aniso, true);
  arcaneGlass.wrapS = THREE.ClampToEdgeWrapping;
  arcaneGlass.wrapT = THREE.ClampToEdgeWrapping;
  loadRealAssetIntoFixedCanvasTex(ASSET_URLS.arcaneGlass, agCan, arcaneGlass);

  // 5. Sky Enchantable Island Panorama (1024x512 fixed power-of-2 size)
  const [skyCan, skyCtx] = createCanvas(1024, 512);
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#5a949e');
  skyGrad.addColorStop(0.55, '#95bac2');
  skyGrad.addColorStop(1, '#c4d9d2');
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 1024, 512);
  const skyVillage = makeCanvasTexture(skyCan, 1, 1, aniso, true);
  skyVillage.wrapS = THREE.ClampToEdgeWrapping;
  skyVillage.wrapT = THREE.ClampToEdgeWrapping;
  loadRealAssetIntoFixedCanvasTex(ASSET_URLS.sky, skyCan, skyVillage);

  // 6. Medieval Cottage Cream Plaster
  const [pCan, pCtx] = createCanvas(256);
  pCtx.fillStyle = '#d9cfb8';
  pCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    const shade = 195 + Math.floor(Math.random() * 34);
    pCtx.fillStyle = `rgba(${shade},${shade - 10},${shade - 25},0.35)`;
    pCtx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }
  const plaster = makeCanvasTexture(pCan, 2, 2, aniso, true);

  // 7. Slate / Shingle Roof
  const [rCan, rCtx] = createCanvas(256);
  rCtx.fillStyle = '#33414f';
  rCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 24) {
    for (let x = 0; x < 256; x += 32) {
      const ox = x + ((y / 24) % 2) * 16;
      const v = 45 + Math.floor(Math.random() * 26);
      rCtx.fillStyle = `rgb(${v}, ${v + 12}, ${v + 24})`;
      rCtx.fillRect(ox % 256, y, 30, 21);
    }
  }
  const roofSlate = makeCanvasTexture(rCan, 3, 3, aniso, true);

  // 8. Tree Bark
  const [bCan, bCtx] = createCanvas(128);
  bCtx.fillStyle = '#4c3524';
  bCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 150; i++) {
    bCtx.fillStyle = i % 2 === 0 ? '#372518' : '#5e4430';
    bCtx.fillRect(Math.random() * 128, Math.random() * 128, 3, 18 + Math.random() * 25);
  }
  const bark = makeCanvasTexture(bCan, 1, 3, aniso, true);

  // 9. Library Polished Marble & Gold Inlay
  const [mCan, mCtx] = createCanvas(512);
  mCtx.fillStyle = '#151d28';
  mCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 48; i++) {
    mCtx.strokeStyle =
      i % 3 === 0 ? 'rgba(218, 185, 110, 0.16)' : 'rgba(130, 165, 200, 0.1)';
    mCtx.lineWidth = 1 + Math.random() * 2.2;
    mCtx.beginPath();
    mCtx.moveTo(Math.random() * 512, Math.random() * 512);
    mCtx.bezierCurveTo(
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512
    );
    mCtx.stroke();
  }
  mCtx.strokeStyle = 'rgba(218, 180, 92, 0.36)';
  mCtx.lineWidth = 5;
  mCtx.strokeRect(12, 12, 488, 488);
  const marble = makeCanvasTexture(mCan, 8, 8, aniso, true);

  // 10. Celestial Starry Vault for Ench Library Dome
  const [cdCan, cdCtx] = createCanvas(512);
  const cdGrad = cdCtx.createRadialGradient(256, 256, 20, 256, 256, 256);
  cdGrad.addColorStop(0, '#182f5c');
  cdGrad.addColorStop(0.55, '#0f1932');
  cdGrad.addColorStop(1, '#080d1a');
  cdCtx.fillStyle = cdGrad;
  cdCtx.fillRect(0, 0, 512, 512);
  for (let s = 0; s < 280; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const rad = 0.6 + Math.random() * 1.5;
    cdCtx.fillStyle = s % 5 === 0 ? '#efd281' : '#8fd8f2';
    cdCtx.beginPath();
    cdCtx.arc(sx, sy, rad, 0, Math.PI * 2);
    cdCtx.fill();
  }
  cdCtx.strokeStyle = 'rgba(217, 168, 78, 0.2)';
  cdCtx.lineWidth = 2;
  [90, 155, 220].forEach((r) => {
    cdCtx.beginPath();
    cdCtx.arc(256, 256, r, 0, Math.PI * 2);
    cdCtx.stroke();
  });
  const celestialDome = makeCanvasTexture(cdCan, 2, 1, aniso, true);

  // 11. Arcane Rune Circle (Crisp gold & cyan filigree)
  const [rcCan, rcCtx] = createCanvas(512);
  rcCtx.clearRect(0, 0, 512, 512);
  rcCtx.strokeStyle = '#e5be64';
  rcCtx.lineWidth = 4;
  rcCtx.beginPath();
  rcCtx.arc(256, 256, 230, 0, Math.PI * 2);
  rcCtx.stroke();
  rcCtx.lineWidth = 2.5;
  rcCtx.beginPath();
  rcCtx.arc(256, 256, 182, 0, Math.PI * 2);
  rcCtx.stroke();
  rcCtx.strokeStyle = '#68cde8';
  rcCtx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rcCtx.beginPath();
    rcCtx.moveTo(256 + Math.cos(a) * 188, 256 + Math.sin(a) * 188);
    rcCtx.lineTo(256 + Math.cos(a) * 224, 256 + Math.sin(a) * 224);
    rcCtx.stroke();
    rcCtx.beginPath();
    rcCtx.arc(
      256 + Math.cos(a + 0.13) * 206,
      256 + Math.sin(a + 0.13) * 206,
      8,
      0,
      Math.PI * 2
    );
    rcCtx.stroke();
  }
  rcCtx.strokeStyle = 'rgba(110, 210, 238, 0.72)';
  for (let k = 0; k < 2; k++) {
    rcCtx.beginPath();
    for (let v = 0; v <= 3; v++) {
      const ang = (v / 3) * Math.PI * 2 + k * (Math.PI / 3);
      const px = 256 + Math.cos(ang) * 165;
      const py = 256 + Math.sin(ang) * 165;
      if (v === 0) rcCtx.moveTo(px, py);
      else rcCtx.lineTo(px, py);
    }
    rcCtx.stroke();
  }
  const runeCircle = makeCanvasTexture(rcCan, 1, 1, aniso, true);
  runeCircle.wrapS = THREE.ClampToEdgeWrapping;
  runeCircle.wrapT = THREE.ClampToEdgeWrapping;

  // 12. Mysterious Book Page Texture
  const [bpCan, bpCtx] = createCanvas(256);
  bpCtx.fillStyle = '#ead9b3';
  bpCtx.fillRect(0, 0, 256, 256);
  bpCtx.strokeStyle = '#8b6226';
  bpCtx.lineWidth = 4;
  bpCtx.strokeRect(14, 14, 228, 228);
  bpCtx.strokeStyle = '#2d8bb8';
  bpCtx.lineWidth = 3;
  bpCtx.beginPath();
  bpCtx.arc(128, 128, 62, 0, Math.PI * 2);
  bpCtx.stroke();
  bpCtx.fillStyle = '#432f1c';
  for (let l = 0; l < 10; l++) {
    if (l >= 3 && l <= 6) continue;
    bpCtx.fillRect(32, 32 + l * 19, 192, 3);
  }
  const bookPage = makeCanvasTexture(bpCan, 1, 1, aniso, true);

  // 13. Soft Radial Particle Sprite
  const [spCan, spCtx] = createCanvas(64);
  const grad = spCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  spCtx.fillStyle = grad;
  spCtx.fillRect(0, 0, 64, 64);
  const softParticle = makeCanvasTexture(spCan, 1, 1, 1, true);

  // 14. Soft Radial Contact Shadow
  const [csCan, csCtx] = createCanvas(128);
  const csGrad = csCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
  csGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
  csGrad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  csGrad.addColorStop(1, 'rgba(0,0,0,0)');
  csCtx.fillStyle = csGrad;
  csCtx.fillRect(0, 0, 128, 128);
  const contactShadow = makeCanvasTexture(csCan, 1, 1, 1, true);

  // 15. Flowing Brook Water Caustics & Normal Ripples
  const [waCan, waCtx] = createCanvas(512);
  const waGrad = waCtx.createLinearGradient(0, 0, 512, 0);
  waGrad.addColorStop(0, '#46a8c4');
  waGrad.addColorStop(0.25, '#2b86ab');
  waGrad.addColorStop(0.5, '#1f6e94');
  waGrad.addColorStop(0.75, '#2b86ab');
  waGrad.addColorStop(1, '#46a8c4');
  waCtx.fillStyle = waGrad;
  waCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 540; i++) {
    const wx = Math.random() * 512;
    const wy = Math.random() * 512;
    const len = 24 + Math.random() * 56;
    waCtx.strokeStyle =
      i % 4 === 0
        ? 'rgba(215, 248, 255, 0.34)'
        : i % 3 === 0
        ? 'rgba(155, 228, 245, 0.24)'
        : 'rgba(16, 62, 88, 0.24)';
    waCtx.lineWidth = 1.5 + Math.random() * 2.8;
    waCtx.beginPath();
    waCtx.moveTo(wx, wy);
    waCtx.bezierCurveTo(wx + 9, wy + len * 0.35, wx - 9, wy + len * 0.7, wx, wy + len);
    waCtx.stroke();
  }
  const water = makeCanvasTexture(waCan, 2, 1, aniso, true);
  const [wnCan] = createCanvas(256);
  bakeNormalFromCanvas(waCan, wnCan, 3.4);
  const waterNormal = makeCanvasTexture(wnCan, 2, 1, aniso, false);

  // 15b. Warm Terracotta Clay Cottage Roof Shingles + Normal Map
  const [rtCan, rtCtx] = createCanvas(512);
  rtCtx.fillStyle = '#9c331b';
  rtCtx.fillRect(0, 0, 512, 512);
  const tileRows = 10;
  const tileCols = 8;
  const tileH = 512 / tileRows;
  const tileW = 512 / tileCols;
  for (let row = 0; row < tileRows; row++) {
    const offsetX = (row % 2) * (tileW * 0.5);
    for (let col = -1; col <= tileCols; col++) {
      const tx = col * tileW + offsetX;
      const ty = row * tileH;
      const shade = ((row * 7 + col * 13) & 3);
      const tilePalette = ['#c94d2c', '#b94122', '#d45c36', '#ad381b'];
      rtCtx.fillStyle = tilePalette[shade];
      rtCtx.beginPath();
      rtCtx.roundRect(tx + 3, ty + 2, tileW - 6, tileH - 3, [4, 4, 12, 12]);
      rtCtx.fill();
      // Top bevel highlight & bottom lip shadow
      rtCtx.fillStyle = 'rgba(255, 196, 152, 0.18)';
      rtCtx.fillRect(tx + 6, ty + 4, tileW - 12, 5);
      rtCtx.fillStyle = 'rgba(54, 14, 6, 0.38)';
      rtCtx.fillRect(tx + 4, ty + tileH - 6, tileW - 8, 5);
    }
  }
  const roofTerracotta = makeCanvasTexture(rtCan, 3, 3, aniso, true);
  const [rtnCan] = createCanvas(256);
  bakeNormalFromCanvas(rtCan, rtnCan, 2.8);
  const roofTerracottaNormal = makeCanvasTexture(rtnCan, 3, 3, aniso, false);

  // 15c. Red & Cream Striped Market Stall Awning
  const [awCan, awCtx] = createCanvas(256);
  const stripeW = 32;
  for (let x = 0; x < 256; x += stripeW) {
    awCtx.fillStyle = (x / stripeW) % 2 === 0 ? '#c83424' : '#f4ead5';
    awCtx.fillRect(x, 0, stripeW, 256);
    awCtx.fillStyle = 'rgba(0,0,0,0.06)';
    awCtx.fillRect(x, 0, 3, 256);
  }
  const awningStripes = makeCanvasTexture(awCan, 2, 1, aniso, true);

  // 15d. Crimson Heraldic Village Pennant Banner
  const [bnCan, bnCtx] = createCanvas(128, 256);
  bnCtx.fillStyle = '#b91c1c';
  bnCtx.fillRect(0, 0, 128, 256);
  bnCtx.strokeStyle = '#facc15';
  bnCtx.lineWidth = 6;
  bnCtx.strokeRect(8, 8, 112, 232);
  bnCtx.fillStyle = '#fde68a';
  bnCtx.beginPath();
  bnCtx.arc(64, 108, 22, 0, Math.PI * 2);
  bnCtx.fill();
  bnCtx.fillStyle = '#b91c1c';
  bnCtx.beginPath();
  bnCtx.arc(64, 108, 12, 0, Math.PI * 2);
  bnCtx.fill();
  const bannerCrest = makeCanvasTexture(bnCan, 1, 1, aniso, true);
  bannerCrest.wrapS = THREE.ClampToEdgeWrapping;
  bannerCrest.wrapT = THREE.ClampToEdgeWrapping;

  // 15e. Cascading Waterfall Vertical Streaks & White Foam
  const [wfCan, wfCtx] = createCanvas(256);
  const wfGrad = wfCtx.createLinearGradient(0, 0, 0, 256);
  wfGrad.addColorStop(0, '#7fe0f5');
  wfGrad.addColorStop(0.5, '#3da9d4');
  wfGrad.addColorStop(1, '#dcf7ff');
  wfCtx.fillStyle = wfGrad;
  wfCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) {
    const sx = Math.random() * 256;
    const sy = Math.random() * 256;
    const h = 28 + Math.random() * 68;
    wfCtx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(186,242,255,0.28)';
    wfCtx.fillRect(sx, sy, 2 + Math.random() * 4, h);
  }
  const waterfallFoam = makeCanvasTexture(wfCan, 2, 2, aniso, true);

  // 16. Nate Cream Cotton Shirt: Warm Ivory Twill + Front Button Placket Detail
  const [ntCan, ntCtx] = createCanvas(512);
  ntCtx.fillStyle = '#ebe2d1';
  ntCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 4) {
    ntCtx.fillStyle = y % 8 === 0 ? 'rgba(255,252,245,0.22)' : 'rgba(130,112,88,0.06)';
    ntCtx.fillRect(0, y, 512, 2);
  }
  for (let x = 0; x < 512; x += 4) {
    ntCtx.fillStyle = x % 8 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(120,102,80,0.05)';
    ntCtx.fillRect(x, 0, 2, 512);
  }
  // Subtle seam & fabric fold shading
  ntCtx.strokeStyle = 'rgba(148, 128, 102, 0.28)';
  ntCtx.lineWidth = 2;
  ntCtx.strokeRect(8, 8, 496, 496);
  const nateTunic = makeCanvasTexture(ntCan, 1, 1, aniso, true);
  const [ntnCan] = createCanvas(256);
  bakeNormalFromCanvas(ntCan, ntnCan, 1.4);
  const nateTunicNormal = makeCanvasTexture(ntnCan, 1, 1, aniso, false);

  // 17. Nate Crimson Neckerchief / Bandana Cloth
  const [ncCan, ncCtx] = createCanvas(512);
  const ncGrad = ncCtx.createLinearGradient(0, 0, 0, 512);
  ncGrad.addColorStop(0, '#c83a2c');
  ncGrad.addColorStop(0.55, '#b12d21');
  ncGrad.addColorStop(1, '#8c2017');
  ncCtx.fillStyle = ncGrad;
  ncCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3200; i++) {
    ncCtx.fillStyle = i % 2 === 0 ? 'rgba(255,210,190,0.04)' : 'rgba(60,10,5,0.07)';
    ncCtx.fillRect(Math.random() * 512, Math.random() * 512, 3, 5);
  }
  // Subtle darker stitched border on scarf
  ncCtx.strokeStyle = 'rgba(105, 20, 14, 0.55)';
  ncCtx.lineWidth = 10;
  ncCtx.strokeRect(10, 10, 492, 492);
  const nateCape = makeCanvasTexture(ncCan, 1, 1, aniso, true);
  nateCape.wrapS = THREE.ClampToEdgeWrapping;
  nateCape.wrapT = THREE.ClampToEdgeWrapping;
  const [ncnCan] = createCanvas(256);
  bakeNormalFromCanvas(ncCan, ncnCan, 1.6);
  const nateCapeNormal = makeCanvasTexture(ncnCan, 1, 1, aniso, false);

  // 18. Nate Stitched Explorer Leather (Vest, Backpack, Belt, Gloves, Knee Pads, Boots)
  const [nlCan, nlCtx] = createCanvas(256);
  nlCtx.fillStyle = '#754626';
  nlCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    nlCtx.fillStyle = i % 2 === 0 ? 'rgba(148,96,54,0.22)' : 'rgba(54,28,12,0.22)';
    nlCtx.fillRect(Math.random() * 256, Math.random() * 256, 4, 3);
  }
  nlCtx.strokeStyle = '#cf9e61';
  nlCtx.setLineDash([6, 5]);
  nlCtx.lineWidth = 2;
  nlCtx.strokeRect(10, 10, 236, 236);
  nlCtx.setLineDash([]);
  const nateLeather = makeCanvasTexture(nlCan, 1, 1, aniso, true);
  const [nlnCan] = createCanvas(256);
  bakeNormalFromCanvas(nlCan, nlnCan, 2.2);
  const nateLeatherNormal = makeCanvasTexture(nlnCan, 1, 1, aniso, false);

  // 19. Nate Olive-Sage Cargo Trousers
  const [npCan, npCtx] = createCanvas(256);
  npCtx.fillStyle = '#4e5e41';
  npCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    for (let x = 0; x < 256; x += 6) {
      npCtx.fillStyle = ((x + y) / 3) % 2 === 0 ? 'rgba(140,160,120,0.08)' : 'rgba(30,38,24,0.12)';
      npCtx.fillRect(x, y, 4, 2);
    }
  }
  npCtx.strokeStyle = 'rgba(110, 126, 92, 0.32)';
  npCtx.setLineDash([5, 4]);
  npCtx.lineWidth = 1.5;
  npCtx.strokeRect(8, 8, 240, 240);
  npCtx.setLineDash([]);
  const natePants = makeCanvasTexture(npCan, 2, 2, aniso, true);

  // 20. Nate Tousled Chestnut-Brown Hair Strands
  const [nhCan, nhCtx] = createCanvas(256);
  nhCtx.fillStyle = '#472816';
  nhCtx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 3) {
    nhCtx.fillStyle = x % 9 === 0 ? '#693e24' : x % 6 === 0 ? '#55311c' : '#311a0d';
    nhCtx.fillRect(x, 0, 2, 256);
  }
  const nateHair = makeCanvasTexture(nhCan, 2, 1, aniso, true);
  const [nhnCan] = createCanvas(256);
  bakeNormalFromCanvas(nhCan, nhnCan, 2.1);
  const nateHairNormal = makeCanvasTexture(nhnCan, 2, 1, aniso, false);

  // 21. Nate Warm Stylized Skin with Rosy Cheek Blush
  const [nsCan, nsCtx] = createCanvas(256);
  const nsGrad = nsCtx.createRadialGradient(128, 128, 18, 128, 128, 128);
  nsGrad.addColorStop(0, '#f7cbb0');
  nsGrad.addColorStop(1, '#e7ae89');
  nsCtx.fillStyle = nsGrad;
  nsCtx.fillRect(0, 0, 256, 256);
  nsCtx.fillStyle = 'rgba(232, 114, 102, 0.18)';
  nsCtx.beginPath();
  nsCtx.arc(90, 148, 25, 0, Math.PI * 2);
  nsCtx.arc(166, 148, 25, 0, Math.PI * 2);
  nsCtx.fill();
  const nateSkin = makeCanvasTexture(nsCan, 1, 1, aniso, true);

  // 22. Jafr Banded Amber-Terracotta Spiral Shell
  const [jsCan, jsCtx] = createCanvas(256);
  jsCtx.fillStyle = '#b86832';
  jsCtx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 24) {
    jsCtx.fillStyle = x % 48 === 0 ? '#d98a45' : '#85421b';
    jsCtx.fillRect(x, 0, 10, 256);
    jsCtx.fillStyle = 'rgba(240, 200, 125, 0.28)';
    jsCtx.fillRect(x + 10, 0, 3, 256);
  }
  const jafrShell = makeCanvasTexture(jsCan, 3, 1, aniso, true);

  // 23. Golden Pelicon Desert Sand with Wind Ripples & Normal Map
  const [dsCan, dsCtx] = createCanvas(512);
  const dsGrad = dsCtx.createLinearGradient(0, 0, 512, 512);
  dsGrad.addColorStop(0, '#ddb16b');
  dsGrad.addColorStop(0.5, '#d2a058');
  dsGrad.addColorStop(1, '#c9934b');
  dsCtx.fillStyle = dsGrad;
  dsCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 16) {
    dsCtx.strokeStyle = y % 32 === 0 ? 'rgba(255, 224, 165, 0.24)' : 'rgba(130, 82, 32, 0.16)';
    dsCtx.lineWidth = 4;
    dsCtx.beginPath();
    dsCtx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      dsCtx.lineTo(x, y + Math.sin((x / 512) * Math.PI * 2) * 5);
    }
    dsCtx.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    dsCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 232, 180, 0.16)' : 'rgba(110, 68, 25, 0.12)';
    dsCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const desertSand = makeCanvasTexture(dsCan, 28, 28, aniso, true);
  const [dsnCan] = createCanvas(256);
  bakeNormalFromCanvas(dsCan, dsnCan, 2.2);
  const desertSandNormal = makeCanvasTexture(dsnCan, 28, 28, aniso, false);

  // 24. Sun-Baked Pelicon Sandstone Masonry
  const [ssCan, ssCtx] = createCanvas(256);
  ssCtx.fillStyle = '#c89b66';
  ssCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    const off = (row % 2) * 32;
    for (let col = -1; col < 5; col++) {
      const x = col * 64 + off;
      const shade = 185 + ((row * 7 + col * 11) & 3) * 8;
      ssCtx.fillStyle = `rgb(${shade}, ${shade - 38}, ${shade - 82})`;
      ssCtx.fillRect(x + 2, y + 2, 60, 28);
      ssCtx.fillStyle = 'rgba(255,235,200,0.16)';
      ssCtx.fillRect(x + 3, y + 3, 58, 4);
    }
  }
  const sandstone = makeCanvasTexture(ssCan, 3, 3, aniso, true);

  // 25. Royal Pelicon Cream & Gold Palace Marble
  const [pmCan, pmCtx] = createCanvas(256);
  pmCtx.fillStyle = '#efe3cf';
  pmCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 24; i++) {
    pmCtx.strokeStyle = i % 3 === 0 ? 'rgba(217, 168, 78, 0.25)' : 'rgba(180, 155, 130, 0.2)';
    pmCtx.lineWidth = 1.5;
    pmCtx.beginPath();
    pmCtx.moveTo(Math.random() * 256, Math.random() * 256);
    pmCtx.bezierCurveTo(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 256
    );
    pmCtx.stroke();
  }
  pmCtx.strokeStyle = 'rgba(205, 162, 74, 0.35)';
  pmCtx.lineWidth = 4;
  pmCtx.strokeRect(4, 4, 248, 248);
  const palaceMarble = makeCanvasTexture(pmCan, 6, 6, aniso, true);

  // 26. Sneh Pink Magical Spiral Shell
  const [snCan, snCtx] = createCanvas(256);
  snCtx.fillStyle = '#f472b6';
  snCtx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 24) {
    snCtx.fillStyle = x % 48 === 0 ? '#fbcfe8' : '#db2777';
    snCtx.fillRect(x, 0, 10, 256);
    snCtx.fillStyle = 'rgba(254, 240, 138, 0.32)';
    snCtx.fillRect(x + 10, 0, 3, 256);
  }
  const snehShell = makeCanvasTexture(snCan, 3, 1, aniso, true);

  // 27. Royal Blue & Golden Filigree Damask Gown Fabric (Enchanted Library Mother & Princess Eita)
  const [rbCan, rbCtx] = createCanvas(256);
  const rbGrad = rbCtx.createLinearGradient(0, 0, 0, 256);
  rbGrad.addColorStop(0, '#1e3a8a');
  rbGrad.addColorStop(0.55, '#172554');
  rbGrad.addColorStop(1, '#1e3a8a');
  rbCtx.fillStyle = rbGrad;
  rbCtx.fillRect(0, 0, 256, 256);
  // Subtle fabric weave
  rbCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  rbCtx.lineWidth = 1;
  for (let y = 0; y < 256; y += 4) {
    rbCtx.beginPath();
    rbCtx.moveTo(0, y);
    rbCtx.lineTo(256, y);
    rbCtx.stroke();
  }
  // Intricate Golden Filigree Flourishes & Border Hem
  rbCtx.strokeStyle = '#d4af37';
  rbCtx.lineWidth = 2.4;
  for (let x = 32; x < 256; x += 64) {
    for (let y = 40; y < 210; y += 72) {
      rbCtx.beginPath();
      rbCtx.arc(x, y, 14, 0, Math.PI * 2);
      rbCtx.stroke();
      rbCtx.beginPath();
      rbCtx.moveTo(x, y - 22);
      rbCtx.quadraticCurveTo(x + 14, y, x, y + 22);
      rbCtx.quadraticCurveTo(x - 14, y, x, y - 22);
      rbCtx.stroke();
      rbCtx.fillStyle = '#fde68a';
      rbCtx.beginPath();
      rbCtx.arc(x, y, 3, 0, Math.PI * 2);
      rbCtx.fill();
    }
  }
  rbCtx.fillStyle = '#c89e2e';
  rbCtx.fillRect(0, 224, 256, 6);
  rbCtx.fillStyle = '#f5d061';
  rbCtx.fillRect(0, 234, 256, 4);
  const royalBlueEmbroidery = makeCanvasTexture(rbCan, 2, 1, aniso, true);
  const rbNormCan = makeNeutralNormalCanvas(256);
  bakeNormalFromCanvas(rbCan, rbNormCan, 1.8);
  const royalBlueEmbroideryNormal = makeCanvasTexture(rbNormCan, 2, 1, aniso, false);

  // 28. Ivory Silk & Gold Lace Underskirt / Bodice
  const [ilCan, ilCtx] = createCanvas(256);
  ilCtx.fillStyle = '#f6efe2';
  ilCtx.fillRect(0, 0, 256, 256);
  ilCtx.strokeStyle = 'rgba(202, 165, 92, 0.42)';
  ilCtx.lineWidth = 1.5;
  for (let x = 16; x < 256; x += 32) {
    ilCtx.beginPath();
    ilCtx.moveTo(x, 0);
    ilCtx.lineTo(x, 256);
    ilCtx.stroke();
    for (let y = 24; y < 256; y += 48) {
      ilCtx.beginPath();
      ilCtx.arc(x, y, 8, 0, Math.PI * 2);
      ilCtx.stroke();
    }
  }
  const ivoryLace = makeCanvasTexture(ilCan, 2, 1, aniso, true);

  // 29. Damascus Brushed Steel Blade Texture
  const [dmCan, dmCtx] = createCanvas(128, 256);
  const dmGrad = dmCtx.createLinearGradient(0, 0, 128, 0);
  dmGrad.addColorStop(0, '#94a3b8');
  dmGrad.addColorStop(0.45, '#e2e8f0');
  dmGrad.addColorStop(0.5, '#f8fafc');
  dmGrad.addColorStop(0.55, '#cbd5e1');
  dmGrad.addColorStop(1, '#64748b');
  dmCtx.fillStyle = dmGrad;
  dmCtx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 36; i++) {
    dmCtx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(51,65,85,0.18)';
    dmCtx.lineWidth = 1.2;
    dmCtx.beginPath();
    const y0 = i * 8;
    dmCtx.moveTo(0, y0);
    dmCtx.bezierCurveTo(42, y0 + 10, 86, y0 - 10, 128, y0);
    dmCtx.stroke();
  }
  const damascusSteel = makeCanvasTexture(dmCan, 1, 2, aniso, true);

  // 30. Ashlar Limestone Masonry (Castle & Grand Library Stonework)
  const [asCan, asCtx] = createCanvas(256);
  asCtx.fillStyle = '#c2b9ac';
  asCtx.fillRect(0, 0, 256, 256);
  const rows = 8;
  const rowH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 32;
    for (let x = -32; x < 256; x += 64) {
      const shade = 178 + Math.floor((Math.sin(r * 7 + x) * 0.5 + 0.5) * 26);
      asCtx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 10})`;
      asCtx.fillRect(x + offset + 2, r * rowH + 2, 60, rowH - 4);
    }
  }
  const ashlarStone = makeCanvasTexture(asCan, 4, 4, aniso, true);
  const asNormCan = makeNeutralNormalCanvas(256);
  bakeNormalFromCanvas(asCan, asNormCan, 2.4);
  const ashlarStoneNormal = makeCanvasTexture(asNormCan, 4, 4, aniso, false);

  // 31. Carved Mahogany Bookcase Wood
  const [mhCan, mhCtx] = createCanvas(256);
  mhCtx.fillStyle = '#4a2518';
  mhCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    mhCtx.fillStyle = y % 6 === 0 ? 'rgba(28, 12, 6, 0.28)' : 'rgba(130, 72, 44, 0.22)';
    mhCtx.fillRect(0, y, 256, 2);
  }
  mhCtx.strokeStyle = 'rgba(217, 168, 78, 0.25)';
  mhCtx.lineWidth = 3;
  mhCtx.strokeRect(8, 8, 240, 240);
  const mahoganyWood = makeCanvasTexture(mhCan, 2, 2, aniso, true);

  const all = [
    grass,
    grassNormal,
    grassRoughness,
    cobble,
    cobbleNormal,
    cobbleRoughness,
    wood,
    woodNormal,
    woodRoughness,
    plaster,
    roofSlate,
    roofTerracotta,
    roofTerracottaNormal,
    awningStripes,
    bannerCrest,
    waterfallFoam,
    bark,
    marble,
    runeCircle,
    bookPage,
    arcaneGlass,
    skyVillage,
    celestialDome,
    softParticle,
    contactShadow,
    water,
    waterNormal,
    nateTunic,
    nateTunicNormal,
    nateCape,
    nateCapeNormal,
    nateLeather,
    nateLeatherNormal,
    natePants,
    nateHair,
    nateHairNormal,
    nateSkin,
    jafrShell,
    desertSand,
    desertSandNormal,
    sandstone,
    palaceMarble,
    snehShell,
    royalBlueEmbroidery,
    royalBlueEmbroideryNormal,
    ivoryLace,
    damascusSteel,
    ashlarStone,
    ashlarStoneNormal,
    mahoganyWood,
  ];

  return {
    grass,
    grassNormal,
    grassRoughness,
    cobble,
    cobbleNormal,
    cobbleRoughness,
    wood,
    woodNormal,
    woodRoughness,
    plaster,
    roofSlate,
    roofTerracotta,
    roofTerracottaNormal,
    awningStripes,
    bannerCrest,
    waterfallFoam,
    bark,
    marble,
    runeCircle,
    bookPage,
    arcaneGlass,
    skyVillage,
    celestialDome,
    softParticle,
    contactShadow,
    water,
    waterNormal,
    nateTunic,
    nateTunicNormal,
    nateCape,
    nateCapeNormal,
    nateLeather,
    nateLeatherNormal,
    natePants,
    nateHair,
    nateHairNormal,
    nateSkin,
    jafrShell,
    desertSand,
    desertSandNormal,
    sandstone,
    palaceMarble,
    snehShell,
    royalBlueEmbroidery,
    royalBlueEmbroideryNormal,
    ivoryLace,
    damascusSteel,
    ashlarStone,
    ashlarStoneNormal,
    mahoganyWood,
    dispose: () => all.forEach((t) => t.dispose()),
  };
}
