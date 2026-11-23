import * as THREE from 'three';
import type { ProceduralTextures } from './textures';

export const CH2_SHORE_START_POS = new THREE.Vector3(0, 0.45, 14.5);
export const CH2_HOUSE_POS = new THREE.Vector3(0, 15.5, -108);
export const CH2_DOOR_POS = new THREE.Vector3(0, 15.77, -101.6);
export const CH2_INTERIOR_SPAWN = new THREE.Vector3(0, 15.66, -103.8);
export const CH2_BED_POS = new THREE.Vector3(3.4, 15.66, -111.8);
export const CH2_BOX_POS = new THREE.Vector3(-3.4, 15.66, -113.2);
export const CH2_TENT_POS = new THREE.Vector3(-9.6, 15.5, -105.5);
export const CH2_PORTAL_POS = new THREE.Vector3(16.0, 17.5, -104.5);
export const CH2_RUINS_POS = new THREE.Vector3(46, 19.5, -148);

const STREAM_1_Z = -28;
const STREAM_2_Z = -68;

/**
 * Continuous winding mountain path centerline connecting the exact Beachhead spawn (z = 14.5)
 * directly up to the Mountain House front porch steps (z = -99, x = 0).
 */
export function getCh2TrailCenterX(z: number): number {
  if (z >= 10 || z <= -99) return 0;
  const u = (10 - z) / 109;
  return Math.sin(u * Math.PI * 2.0) * 8.0;
}

function pushOutAABB(
  pos: THREE.Vector3,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): void {
  if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
    const dLeft = Math.abs(pos.x - minX);
    const dRight = Math.abs(maxX - pos.x);
    const dBack = Math.abs(pos.z - minZ);
    const dFront = Math.abs(maxZ - pos.z);
    const m = Math.min(dLeft, dRight, dBack, dFront);
    if (m === dLeft) pos.x = minX;
    else if (m === dRight) pos.x = maxX;
    else if (m === dBack) pos.z = minZ;
    else pos.z = maxZ;
  }
}

function getStreamChannelCarve(z: number): number {
  const d1 = Math.abs(z - STREAM_1_Z);
  const d2 = Math.abs(z - STREAM_2_Z);
  let carve = 0;
  if (d1 < 3.6) {
    carve = Math.max(carve, Math.cos((d1 / 3.6) * (Math.PI / 2)) * 1.15);
  }
  if (d2 < 3.6) {
    carve = Math.max(carve, Math.cos((d2 / 3.6) * (Math.PI / 2)) * 1.15);
  }
  return carve;
}

/**
 * Computes C1-continuous ground height for the Unknown Island coast, sandy beach,
 * ascending mountain trail with carved stream valleys, and the cliffside plateau + portal terrace.
 */
export function getCh2TerrainHeight(x: number, z: number): number {
  if (z >= 18) {
    return Math.max(-3.6, 0.35 - (z - 18) * 0.16);
  }
  if (z >= -2) {
    const t = (18 - z) / 20;
    const rippleFade = Math.sin(t * Math.PI);
    const ripple = (Math.sin(x * 0.14) * 0.16 + Math.cos(z * 0.28) * 0.1) * rippleFade;
    return 0.35 + t * 1.45 + ripple * 0.45;
  }
  if (z >= -99) {
    const u = (-2 - z) / 97;
    const smoothU = u * u * (3 - 2 * u);
    const edgeFade = Math.sin(u * Math.PI);
    const trailCenterX = getCh2TrailCenterX(z);
    const offTrail = Math.max(0, Math.abs(x - trailCenterX) - 4.4);
    const ridgeLift = Math.min(5.0, offTrail * 0.24) * edgeFade;
    const carve = getStreamChannelCarve(z);
    return 1.8 + smoothU * 13.7 + ridgeLift - carve;
  }
  // Mountain plateau around House, Tent & elevated Portal overlook platform
  const distFromPortal = Math.hypot(x - CH2_PORTAL_POS.x, z - CH2_PORTAL_POS.z);
  if (distFromPortal <= 5.4) {
    return CH2_PORTAL_POS.y;
  }
  if (distFromPortal <= 7.8) {
    const ramp = 1 - THREE.MathUtils.smoothstep(distFromPortal, 5.4, 7.8);
    return THREE.MathUtils.lerp(15.5, CH2_PORTAL_POS.y, ramp);
  }

  const distFromPlateauCenter = Math.hypot(x, z + 109);
  const edgeSmooth = THREE.MathUtils.clamp((-99 - z) / 14, 0, 1);
  if (distFromPlateauCenter <= 23.5) {
    return 15.5;
  }
  const slopeUp = Math.min(10, (distFromPlateauCenter - 23.5) * 0.28) * edgeSmooth;
  return 15.5 + slopeUp;
}

function getTerrainWithoutStream(x: number, z: number): number {
  const u = (-2 - z) / 97;
  const smoothU = u * u * (3 - 2 * u);
  const edgeFade = Math.sin(u * Math.PI);
  const trailCenterX = getCh2TrailCenterX(z);
  const offTrail = Math.max(0, Math.abs(x - trailCenterX) - 4.4);
  const ridgeLift = Math.min(5.0, offTrail * 0.24) * edgeFade;
  return 1.8 + smoothU * 13.7 + ridgeLift;
}

export function getCh2WalkSurface(
  x: number,
  z: number,
  insideHouse: boolean
): { y: number; surface: 'sand' | 'grass' | 'stone' | 'wood' } {
  if (insideHouse) {
    return { y: 15.66, surface: 'wood' };
  }
  // Wooden front porch & steps leading directly from the mountain trail into the Mountain House
  if (Math.abs(x) < 3.4 && z >= -102.2 && z <= -100.1) {
    return { y: 15.77, surface: 'wood' };
  }
  if (Math.abs(x) < 2.1 && z > -100.1 && z <= -99.0) {
    const stepT = THREE.MathUtils.clamp((-99.0 - z) / 1.1, 0, 1);
    return { y: THREE.MathUtils.lerp(15.5, 15.77, stepT), surface: 'wood' };
  }

  // Stone Stairway connecting House Courtyard up to Elevated Rocky Portal Platform
  if (x >= 8.2 && x <= 12.8 && z >= -106.4 && z <= -101.8) {
    const stairT = THREE.MathUtils.clamp((x - 8.2) / 4.2, 0, 1);
    return { y: THREE.MathUtils.lerp(15.5, CH2_PORTAL_POS.y, stairT) + 0.04, surface: 'stone' };
  }

  // Elevated Rocky Portal Platform Top
  if (Math.hypot(x - CH2_PORTAL_POS.x, z - CH2_PORTAL_POS.z) <= 5.5) {
    return { y: CH2_PORTAL_POS.y + 0.06, surface: 'stone' };
  }

  // Wooden Arched Bridges across Stream 1 (z=-28) and Stream 2 (z=-68)
  for (const sz of [STREAM_1_Z, STREAM_2_Z]) {
    const bx = getCh2TrailCenterX(sz);
    if (Math.abs(z - sz) <= 3.1 && Math.abs(x - bx) <= 2.35) {
      const bankBase = getTerrainWithoutStream(bx, sz);
      const archProgress = (sz - z) / 3.1; // -1..1
      const archLift = (1 - archProgress * archProgress) * 0.52;
      return { y: bankBase + 0.24 + archLift, surface: 'wood' };
    }
  }

  const y = getCh2TerrainHeight(x, z);
  const trailCenterX = getCh2TrailCenterX(z);
  // Stone steps on steep sections (-46..-54 and -82..-92)
  if (
    ((z <= -45.5 && z >= -54.5) || (z <= -81.5 && z >= -92.5)) &&
    Math.abs(x - trailCenterX) < 2.35
  ) {
    return { y: y + 0.08, surface: 'stone' };
  }

  if (z <= 14.8 && z >= -99.2 && Math.abs(x - trailCenterX) < 2.4) {
    return { y: y + 0.04, surface: z > 2 ? 'sand' : 'stone' };
  }
  if (z > -2) {
    return { y, surface: 'sand' };
  }
  return { y, surface: 'grass' };
}

export function clampToCh2Corridor(pos: THREE.Vector3, insideHouse: boolean): void {
  if (insideHouse) {
    pos.x = THREE.MathUtils.clamp(pos.x, -4.55, 4.55);
    pos.z = THREE.MathUtils.clamp(pos.z, -113.85, -102.25);
    // Solid AABB furniture collisions inside the Mountain House
    pushOutAABB(pos, 1.95, 4.8, -113.6, -109.9); // Old Wooden Bed (right side)
    pushOutAABB(pos, -4.3, -2.5, -114.0, -112.45); // Wooden Supply Box (storage corner)
    pushOutAABB(pos, -1.85, 0.65, -109.15, -107.25); // Dining Table
    pushOutAABB(pos, -5.0, -3.1, -109.65, -107.95); // Stone Fireplace
    pushOutAABB(pos, -1.3, 1.7, -114.2, -113.05); // Back Wall Shelves
    return;
  }

  // Exterior shoreline + mountain path + portal platform corridor
  pos.z = THREE.MathUtils.clamp(pos.z, -121, 18.2);
  if (pos.z > 6) {
    pos.x = THREE.MathUtils.clamp(pos.x, -26, 26);
  } else if (pos.z >= -98) {
    const trailCenterX = getCh2TrailCenterX(pos.z);
    // Keep players on bridge width when crossing stream channels
    const onStream1 = Math.abs(pos.z - STREAM_1_Z) < 2.2;
    const onStream2 = Math.abs(pos.z - STREAM_2_Z) < 2.2;
    const halfCorr = onStream1 || onStream2 ? 2.15 : 12.5;
    pos.x = THREE.MathUtils.clamp(pos.x, trailCenterX - halfCorr, trailCenterX + halfCorr);
  } else {
    pos.x = THREE.MathUtils.clamp(pos.x, -18, 22.8);
  }

  // Solid exterior Mountain House walls (leaves porch at z=-101.6..-100.1 completely walkable)
  pushOutAABB(pos, -5.7, 5.7, -114.6, -101.55);

  // Tent obstacle outside beside the house
  const dxTent = pos.x - CH2_TENT_POS.x;
  const dzTent = pos.z - CH2_TENT_POS.z;
  const dTent = Math.hypot(dxTent, dzTent);
  if (dTent < 2.25 && dTent > 0.001) {
    pos.x = CH2_TENT_POS.x + (dxTent / dTent) * 2.25;
    pos.z = CH2_TENT_POS.z + (dzTent / dTent) * 2.25;
  }
}

export interface Chapter2WorldObjects {
  group: THREE.Group;
  oceanMesh: THREE.Mesh;
  oceanUniforms: { uTime: { value: number }; uSurge: { value: number } };
  streamUniforms: { uTime: { value: number } };
  skyDome: THREE.Mesh;
  skyMat: THREE.MeshBasicMaterial;
  sunDisc: THREE.Mesh;
  clouds: THREE.Mesh[];
  swayTrees: { group: THREE.Group; phase: number }[];
  houseExteriorGroup: THREE.Group;
  houseInteriorGroup: THREE.Group;
  doorPivot: THREE.Group;
  boxLidPivot: THREE.Group;
  boxTonicMesh: THREE.Group;
  boxFruitMeshes: THREE.Mesh[];
  fireplaceLight: THREE.PointLight;
  porchLanternLight: THREE.PointLight;
  portalGroup: THREE.Group;
  portalRuneMeshes: THREE.Mesh[];
  portalOrbitRings: THREE.Mesh[];
  portalEnergyMesh: THREE.Mesh;
  portalEnergyUniforms: {
    uTime: { value: number };
    uIntensity: { value: number };
    uExpand: { value: number };
  };
  portalFloatingStones: { mesh: THREE.Mesh; angle: number; radius: number; yOffset: number; speed: number }[];
  portalParticles: THREE.Points;
  portalLight: THREE.PointLight;
  portalHaloMesh: THREE.Mesh;
  highlightRings: {
    id: 'house' | 'tent' | 'ruins' | 'portal';
    label: string;
    anchor: THREE.Vector3;
    ring: THREE.Mesh;
  }[];
  magicParticles: THREE.Points;
  trailMotes: THREE.Points;
}

export function createChapter2World(tex: ProceduralTextures): Chapter2WorldObjects {
  const group = new THREE.Group();
  group.visible = false;

  // 1. Dynamic Sky Dome
  const skyGeo = new THREE.SphereGeometry(320, 32, 20);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0xff9b6a,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyDome);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(11, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xffcf7d, fog: false })
  );
  sunDisc.position.set(-48, 38, 195);
  group.add(sunDisc);

  const clouds: THREE.Mesh[] = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xb788b5,
    emissive: 0x5c365e,
    emissiveIntensity: 0.12,
    roughness: 0.95,
    transparent: true,
    opacity: 0.78,
  });
  for (let i = 0; i < 16; i++) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(6 + (i % 4) * 2.5, 10, 8), cloudMat);
    cloud.scale.set(2.4, 0.52, 1.3);
    cloud.position.set(-130 + ((i * 19) % 260), 44 + (i % 3) * 9, 90 + (i % 5) * 25);
    group.add(cloud);
    clouds.push(cloud);
  }

  // 2. Sculpted Sandy Beach, Mountain Trail with Stream Valleys & Elevated Portal Platform
  const segX = 110;
  const segZ = 160;
  const width = 180;
  const depth = 220;
  const terrainGeo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, 0, -50);

  const posAttr = terrainGeo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(posAttr.count * 3);
  const sandColor = new THREE.Color(0xdcc293);
  const wetSandColor = new THREE.Color(0x9e845c);
  const grassColor = new THREE.Color(0x346a3c);
  const mossColor = new THREE.Color(0x28563c);
  const rockColor = new THREE.Color(0x63676f);
  const pathDirtColor = new THREE.Color(0x8c7758);
  const cTmp = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const h = getCh2TerrainHeight(vx, vz);
    posAttr.setY(i, h);

    if (vz > 14.5) {
      cTmp.copy(wetSandColor);
    } else if (vz > -3) {
      const blend = THREE.MathUtils.clamp((-vz + 2) / 5, 0, 1);
      cTmp.copy(sandColor).lerp(grassColor, blend * 0.72);
    } else {
      const trailCenterX = getCh2TrailCenterX(vz);
      const distTrail = Math.abs(vx - trailCenterX);
      const inStream = Math.abs(vz - STREAM_1_Z) < 2.8 || Math.abs(vz - STREAM_2_Z) < 2.8;
      if (inStream) {
        cTmp.copy(mossColor);
      } else if (vz >= -100 && distTrail < 3.1) {
        cTmp.copy(pathDirtColor);
      } else if (Math.hypot(vx - CH2_PORTAL_POS.x, vz - CH2_PORTAL_POS.z) < 7.2) {
        cTmp.copy(rockColor);
      } else if (h > 17.5 || (vz < -8 && distTrail > 16)) {
        cTmp.copy(rockColor);
      } else {
        cTmp.copy(grassColor);
      }
    }
    colors[i * 3] = cTmp.r;
    colors[i * 3 + 1] = cTmp.g;
    colors[i * 3 + 2] = cTmp.b;
  }
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    map: tex.plaster,
    normalMap: tex.grassNormal,
    normalScale: new THREE.Vector2(0.55, 0.55),
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.03,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 2B. Continuous Winding Dirt-and-Stone Pathway starting at Nate's Wake-Up Spot (z=14.5 -> z=-99.2)
  const pathSegs = 160;
  const pathHalfW = 2.25;
  const pathPositions: number[] = [];
  const pathUvs: number[] = [];
  const pathIndices: number[] = [];
  for (let i = 0; i <= pathSegs; i++) {
    const t = i / pathSegs;
    const pz = THREE.MathUtils.lerp(14.5, -99.2, t);
    const px = getCh2TrailCenterX(pz);
    const prevZ = pz + 0.5;
    const nextZ = pz - 0.5;
    const dx = getCh2TrailCenterX(nextZ) - getCh2TrailCenterX(prevZ);
    const dz = -1.0;
    const len = Math.hypot(dx, dz) || 1;
    const perpX = -dz / len;
    const perpZ = dx / len;

    const lx = px - perpX * pathHalfW;
    const lz = pz - perpZ * pathHalfW;
    const rx = px + perpX * pathHalfW;
    const rz = pz + perpZ * pathHalfW;
    const ly = getCh2TerrainHeight(lx, lz) + 0.05;
    const ry = getCh2TerrainHeight(rx, rz) + 0.05;
    pathPositions.push(lx, ly, lz, rx, ry, rz);
    pathUvs.push(0, t * 30, 1, t * 30);
    if (i < pathSegs) {
      const b = i * 2;
      pathIndices.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
  }
  const ch2PathGeo = new THREE.BufferGeometry();
  ch2PathGeo.setAttribute('position', new THREE.Float32BufferAttribute(pathPositions, 3));
  ch2PathGeo.setAttribute('uv', new THREE.Float32BufferAttribute(pathUvs, 2));
  ch2PathGeo.setIndex(pathIndices);
  ch2PathGeo.computeVertexNormals();
  const ch2PathMesh = new THREE.Mesh(
    ch2PathGeo,
    new THREE.MeshStandardMaterial({
      map: tex.cobble,
      normalMap: tex.cobbleNormal,
      normalScale: new THREE.Vector2(0.9, 0.9),
      color: 0xc2b094,
      roughness: 0.84,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  ch2PathMesh.receiveShadow = true;
  group.add(ch2PathMesh);

  // Materials used for path craft, bridges, steps & cabin
  const rockMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x6c707a,
    roughness: 0.92,
  });
  const stepStoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x9b9488,
    roughness: 0.85,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    roughnessMap: tex.woodRoughness,
    color: 0x7a5536,
    roughness: 0.78,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    color: 0x452f1e,
    roughness: 0.85,
  });
  const guideLanternMat = new THREE.MeshStandardMaterial({
    color: 0xffd580,
    emissive: 0xffa73b,
    emissiveIntensity: 0.36,
    roughness: 0.25,
  });

  // 2C. Two Flowing Mountain Streams & Arched Wooden Bridges along the trail
  const streamUniforms = { uTime: { value: 0 } };
  const streamMat = new THREE.MeshPhysicalMaterial({
    map: tex.water,
    normalMap: tex.waterNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x44a6c4,
    roughness: 0.09,
    metalness: 0.18,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.88,
  });
  streamMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = streamUniforms.uTime;
    shader.vertexShader =
      `uniform float uTime;\nvarying vec3 vStreamPos;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vStreamPos = position;
        transformed.y += sin(position.x * 0.7 - uTime * 3.0) * 0.045;`
      );
    shader.fragmentShader =
      `uniform float uTime;\nvarying vec3 vStreamPos;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float ripple = 0.5 + 0.5 * sin(vStreamPos.x * 1.4 - uTime * 3.6 + vStreamPos.z * 2.1);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.85, 0.96, 1.0), ripple * 0.24);`
      );
  };

  [STREAM_1_Z, STREAM_2_Z].forEach((sz) => {
    const bx = getCh2TrailCenterX(sz);
    const bankBase = getTerrainWithoutStream(bx, sz);

    // Stream water ribbon curving across hillside
    const streamGeo = new THREE.PlaneGeometry(46, 5.2, 42, 8);
    streamGeo.rotateX(-Math.PI / 2);
    const sp = streamGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < sp.count; i++) {
      const lx = sp.getX(i);
      const lz = sp.getZ(i);
      const worldX = bx + lx;
      const worldZ = sz + lz;
      const wy = getTerrainWithoutStream(worldX, worldZ) - 0.55;
      sp.setY(i, wy);
    }
    streamGeo.computeVertexNormals();
    const streamWater = new THREE.Mesh(streamGeo, streamMat);
    streamWater.position.set(bx, 0, sz);
    group.add(streamWater);

    // Arched Wooden Bridge spanning the stream along path direction
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(bx, bankBase + 0.22, sz);
    const plankCount = 15;
    for (let p = 0; p < plankCount; p++) {
      const u = (p / (plankCount - 1)) * 2 - 1; // -1..1
      const zOff = u * 3.0;
      const archY = (1 - u * u) * 0.52;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.38), woodMat);
      plank.position.set(0, archY, zOff);
      plank.rotation.x = -u * 0.14;
      plank.castShadow = true;
      plank.receiveShadow = true;
      bridgeGroup.add(plank);
    }
    // Side timber stringers & posts + rails
    [-2.05, 2.05].forEach((rx) => {
      for (let p = 0; p < 5; p++) {
        const u = (p / 4) * 2 - 1;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.05, 0.16), darkWoodMat);
        post.position.set(rx, (1 - u * u) * 0.5 + 0.45, u * 2.85);
        post.castShadow = true;
        bridgeGroup.add(post);
      }
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 6.0), darkWoodMat);
      railBar.position.set(rx, 1.08, 0);
      bridgeGroup.add(railBar);
    });
    // Bridge approach lantern post
    const lPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.75, 6), darkWoodMat);
    lPost.position.set(2.3, 0.85, 2.9);
    const bLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.26, 6), guideLanternMat);
    bLantern.position.set(2.1, 1.62, 2.9);
    bridgeGroup.add(lPost, bLantern);
    group.add(bridgeGroup);
  });

  // 2D. Stone Steps along Steep Mountain Sections (-46..-54 and -82..-92)
  const steepRanges: [number, number][] = [
    [-46, -54],
    [-82, -92],
  ];
  steepRanges.forEach(([zStart, zEnd]) => {
    const steps = Math.round(Math.abs(zEnd - zStart) / 0.85);
    for (let s = 0; s <= steps; s++) {
      const sz = THREE.MathUtils.lerp(zStart, zEnd, s / steps);
      const sx = getCh2TrailCenterX(sz);
      const nextX = getCh2TrailCenterX(sz - 0.8);
      const yaw = Math.atan2(nextX - sx, -0.8);
      const sy = getCh2TerrainHeight(sx, sz);
      const tread = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.24, 0.72), stepStoneMat);
      tread.position.set(sx, sy + 0.04, sz);
      tread.rotation.y = yaw;
      tread.receiveShadow = true;
      tread.castShadow = true;
      group.add(tread);
    }
  });

  // 2E. Wooden Signposts with Directional Planks & Warm Turn Lanterns
  [
    { z: 8.5, side: 1, hasSign: true },
    { z: -12, side: -1, hasSign: false },
    { z: -23.5, side: 1, hasSign: true },
    { z: -43, side: -1, hasSign: true },
    { z: -63, side: 1, hasSign: true },
    { z: -80, side: -1, hasSign: false },
    { z: -91, side: 1, hasSign: true },
  ].forEach(({ z, side, hasSign }) => {
    const gx = getCh2TrailCenterX(z) + side * 2.55;
    const gy = getCh2TerrainHeight(gx, z);
    const nextX = getCh2TrailCenterX(z - 6);
    const pointYaw = Math.atan2(nextX - gx, -6);

    const postGroup = new THREE.Group();
    postGroup.position.set(gx, gy, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.9, 6), darkWoodMat);
    post.position.y = 0.95;
    post.castShadow = true;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), darkWoodMat);
    arm.position.set(-side * 0.24, 1.75, 0);
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.25, 6), guideLanternMat);
    lantern.position.set(-side * 0.44, 1.56, 0);
    postGroup.add(post, arm, lantern);

    if (hasSign) {
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.08), woodMat);
      signBoard.position.set(0, 1.4, 0);
      signBoard.rotation.y = pointYaw + Math.PI / 2;
      signBoard.castShadow = true;
      postGroup.add(signBoard);
    }
    group.add(postGroup);
  });

  // 2F. Flowers, Bushes & Moss Rocks lining the walkable mountain path
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.88 });
  const flowerColors = [0xffcf5c, 0xf2849e, 0x9ef0ff, 0xfdf6e3];
  const flowerMats = flowerColors.map(
    (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55 })
  );
  for (let i = 0; i < 64; i++) {
    const fz = THREE.MathUtils.lerp(11, -96, i / 63);
    if (Math.abs(fz - STREAM_1_Z) < 3.4 || Math.abs(fz - STREAM_2_Z) < 3.4) continue;
    const side = i % 2 === 0 ? -1 : 1;
    const fx = getCh2TrailCenterX(fz) + side * (2.65 + (i % 3) * 0.55);
    const fy = getCh2TerrainHeight(fx, fz);

    if (i % 3 === 0) {
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + (i % 2) * 0.16, 1), bushMat);
      bush.position.set(fx, fy + 0.25, fz);
      bush.scale.set(1.2, 0.8, 1.2);
      bush.castShadow = true;
      group.add(bush);
    } else {
      const fMat = flowerMats[i % flowerMats.length];
      for (let b = 0; b < 3; b++) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 7), fMat);
        blossom.position.set(fx + (b - 1) * 0.22, fy + 0.14, fz + ((b % 2) - 0.5) * 0.22);
        group.add(blossom);
      }
    }
  }

  // 3. Vast Animated Ocean with Custom Shore Surge Shader (no vMapUv)
  const oceanGeo = new THREE.PlaneGeometry(480, 260, 120, 64);
  oceanGeo.rotateX(-Math.PI / 2);
  oceanGeo.translate(0, 0.25, 138);

  const oceanUniforms = {
    uTime: { value: 0 },
    uSurge: { value: 0 },
  };
  const oceanMat = new THREE.MeshPhysicalMaterial({
    map: tex.water,
    normalMap: tex.waterNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x3b8fa8,
    roughness: 0.1,
    metalness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: 0.89,
  });
  oceanMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = oceanUniforms.uTime;
    shader.uniforms.uSurge = oceanUniforms.uSurge;
    shader.vertexShader =
      `uniform float uTime;\nuniform float uSurge;\nvarying vec3 vOceanPos;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vOceanPos = position;
        float swell = sin(position.z * 0.16 - uTime * 1.45) * 0.22 + cos(position.x * 0.11 + uTime * 1.1) * 0.14;
        float shoreWave = sin(position.z * 0.45 - uTime * 2.2) * 0.08;
        transformed.y += swell + shoreWave + uSurge * 0.12;`
      );
    shader.fragmentShader =
      `uniform float uTime;\nvarying vec3 vOceanPos;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float foamZone = smoothstep(22.0, 10.5, vOceanPos.z);
        float foamCrest = smoothstep(0.45, 0.92, sin(vOceanPos.z * 0.55 - uTime * 2.1 + sin(vOceanPos.x * 0.22) * 1.4));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.84, 0.94, 0.98), foamZone * foamCrest * 0.52);`
      );
  };
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.receiveShadow = true;
  group.add(oceanMesh);

  // 4. Rocky Coastal Formations & Distant Mountains
  const cliffCoords = [
    [-30, 12, 5.2],
    [-25, 4, 3.6],
    [28, 10, 4.8],
    [22, 1, 3.1],
    [-19, -28, 4.4],
    [20, -44, 5.1],
    [-22, -76, 6.0],
    [24, -84, 5.6],
    [-42, -130, 14.0],
    [48, -136, 15.5],
    [0, -158, 18.0],
  ];
  cliffCoords.forEach(([rx, rz, sc], idx) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(sc, 1), rockMat);
    const ry = getCh2TerrainHeight(rx, rz);
    rock.position.set(rx, ry + sc * 0.35, rz);
    rock.rotation.set(idx * 0.4, idx * 0.9, idx * 0.3);
    rock.scale.set(1.2, 0.9, 1.1);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  });

  // 5. Strange Fantasy Trees & Lush Coastal Vegetation
  const trunkMat = new THREE.MeshStandardMaterial({ map: tex.bark, color: 0x4b3527, roughness: 0.9 });
  const strangeLeafMat = new THREE.MeshStandardMaterial({ color: 0x2f6d4f, roughness: 0.82 });
  const tealLeafMat = new THREE.MeshStandardMaterial({ color: 0x28786e, roughness: 0.78 });
  const swayTrees: Chapter2WorldObjects['swayTrees'] = [];

  for (let i = 0; i < 42; i++) {
    const z = -6 - ((i * 2.5) % 108);
    const trailX = getCh2TrailCenterX(z);
    const side = i % 2 === 0 ? -1 : 1;
    const x = trailX + side * (7.2 + (i % 5) * 3.1);
    if (Math.hypot(x, z + 108) < 15.5 || Math.hypot(x - CH2_PORTAL_POS.x, z - CH2_PORTAL_POS.z) < 9.5) {
      continue;
    }

    const tg = new THREE.Group();
    const ty = getCh2TerrainHeight(x, z);
    tg.position.set(x, ty, z);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.4, 3.8, 8), trunkMat);
    trunk.position.y = 1.9;
    trunk.rotation.z = side * 0.08;
    trunk.castShadow = true;
    tg.add(trunk);

    const matChoice = i % 3 === 0 ? tealLeafMat : strangeLeafMat;
    for (let c = 0; c < 3; c++) {
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45 - c * 0.25, 1), matChoice);
      crown.position.set((c - 1) * 0.55, 3.7 + c * 0.75, c % 2 === 0 ? 0.3 : -0.3);
      crown.scale.set(1.25, 0.72, 1.25);
      crown.castShadow = true;
      tg.add(crown);
    }

    group.add(tg);
    swayTrees.push({ group: tg, phase: i * 0.7 });
  }

  // 6. Distant Mysterious Monolithic Ruins (Observation Mode landmark)
  const ruinsGroup = new THREE.Group();
  ruinsGroup.position.copy(CH2_RUINS_POS);
  for (let p = 0; p < 5; p++) {
    const a = (p / 5) * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5 + (p % 2) * 2.5, 1.4), rockMat);
    pillar.position.set(Math.cos(a) * 5.2, 3.6, Math.sin(a) * 5.2);
    pillar.rotation.z = (p - 2) * 0.04;
    pillar.castShadow = true;
    ruinsGroup.add(pillar);
  }
  const ruinArch = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.55, 8, 24, Math.PI), rockMat);
  ruinArch.position.y = 6.8;
  ruinsGroup.add(ruinArch);
  group.add(ruinsGroup);

  // 7. Subtle Glowing Footprints guiding along trail + Crate
  const footprintMat = new THREE.MeshBasicMaterial({
    color: 0x72efdd,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  for (let f = 0; f < 30; f++) {
    const z = 12.5 - f * 3.8;
    const tx = getCh2TrailCenterX(z) + (f % 2 === 0 ? -0.35 : 0.35);
    const fy = getCh2WalkSurface(tx, z, false).y + 0.03;
    const print = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.48), footprintMat);
    print.rotation.x = -Math.PI / 2;
    print.position.set(tx, fy, z);
    group.add(print);
  }

  const trailCrate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), woodMat);
  const crateX = getCh2TrailCenterX(-60) - 3.6;
  trailCrate.position.set(crateX, getCh2TerrainHeight(crateX, -60) + 0.45, -60);
  trailCrate.castShadow = true;
  group.add(trailCrate);

  // 8. Abandoned Tent pitched OUTSIDE BESIDE the Mountain House
  const tentGroup = new THREE.Group();
  tentGroup.position.copy(CH2_TENT_POS);
  tentGroup.rotation.y = 0.35;
  const canvasMat = new THREE.MeshStandardMaterial({ color: 0xb69b6d, roughness: 0.92, side: THREE.DoubleSide });
  const tentShape = new THREE.Shape();
  tentShape.moveTo(-1.7, 0);
  tentShape.lineTo(0, 2.05);
  tentShape.lineTo(1.7, 0);
  tentShape.closePath();
  const tentGeo = new THREE.ExtrudeGeometry(tentShape, { depth: 3.1, bevelEnabled: false });
  tentGeo.translate(0, 0, -1.55);
  const tentMesh = new THREE.Mesh(tentGeo, canvasMat);
  tentMesh.castShadow = true;
  tentMesh.receiveShadow = true;
  const tentDoorDark = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 1.65, 3),
    new THREE.MeshBasicMaterial({ color: 0x16120e })
  );
  tentDoorDark.position.set(0, 0.85, 1.54);
  const tentStake1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), darkWoodMat);
  tentStake1.position.set(0, 1.1, 1.65);
  const campLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.6, 8), trunkMat);
  campLog.rotation.z = Math.PI / 2;
  campLog.position.set(2.4, 0.18, 0.8);
  tentGroup.add(tentMesh, tentDoorDark, tentStake1, campLog);
  group.add(tentGroup);

  // 9. Mountain House EXTERIOR (warm cottage landmark visible up the trail)
  const houseExteriorGroup = new THREE.Group();
  houseExteriorGroup.position.copy(CH2_HOUSE_POS);
  const roofMat = new THREE.MeshStandardMaterial({ map: tex.roofSlate, color: 0x8f3f33, roughness: 0.72 });

  const extPlinth = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.6, 13.0), rockMat);
  extPlinth.position.y = 0.2;
  extPlinth.receiveShadow = true;
  houseExteriorGroup.add(extPlinth);

  const extPorch = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.26, 3.2), darkWoodMat);
  extPorch.position.set(0, 0.14, 6.2);
  extPorch.receiveShadow = true;
  houseExteriorGroup.add(extPorch);

  const step1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 0.58), darkWoodMat);
  step1.position.set(0, 0.07, 8.65);
  step1.receiveShadow = true;
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.18, 0.58), darkWoodMat);
  step2.position.set(0, 0.14, 8.1);
  step2.receiveShadow = true;
  houseExteriorGroup.add(step1, step2);

  const extWalls = new THREE.Mesh(new THREE.BoxGeometry(10.8, 4.4, 12.2), woodMat);
  extWalls.position.y = 2.6;
  extWalls.castShadow = true;
  extWalls.receiveShadow = true;
  houseExteriorGroup.add(extWalls);

  const hRoofShape = new THREE.Shape();
  hRoofShape.moveTo(-6.3, 0);
  hRoofShape.lineTo(0, 3.6);
  hRoofShape.lineTo(6.3, 0);
  hRoofShape.closePath();
  const hRoofGeo = new THREE.ExtrudeGeometry(hRoofShape, { depth: 13.4, bevelEnabled: false });
  hRoofGeo.translate(0, 0, -6.7);
  const extRoof = new THREE.Mesh(hRoofGeo, roofMat);
  extRoof.position.y = 4.75;
  extRoof.castShadow = true;
  houseExteriorGroup.add(extRoof);

  // Tall Stone Chimney & Upper Gable Window so House is easy to spot from down the mountain path
  const extChimney = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.4, 1.3), rockMat);
  extChimney.position.set(-3.4, 7.2, -1.2);
  extChimney.castShadow = true;
  houseExteriorGroup.add(extChimney);

  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffd580,
    emissive: 0xffa73b,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  const gableWin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.25), lanternGlowMat);
  gableWin.position.set(0, 6.2, 6.18);
  houseExteriorGroup.add(gableWin);

  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.9, 0.32), darkWoodMat);
  doorFrame.position.set(0, 1.65, 6.12);
  houseExteriorGroup.add(doorFrame);

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.78, 0.35, 6.18);
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.55, 0.16), darkWoodMat);
  doorLeaf.position.set(0.78, 1.28, 0);
  const doorKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9a84e, metalness: 0.85, roughness: 0.25 })
  );
  doorKnob.position.set(1.38, 1.22, 0.1);
  doorPivot.add(doorLeaf, doorKnob);
  houseExteriorGroup.add(doorPivot);

  const porchLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.32, 6), lanternGlowMat);
  porchLantern.position.set(1.45, 2.75, 6.35);
  const porchLanternLight = new THREE.PointLight(0xffb454, 14, 18, 1.6);
  porchLanternLight.position.set(1.45, 2.6, 6.5);
  houseExteriorGroup.add(porchLantern, porchLanternLight);

  [-2.8, 2.8].forEach((wx) => {
    const extWin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.15, 0.18), lanternGlowMat);
    extWin.position.set(wx, 2.55, 6.12);
    houseExteriorGroup.add(extWin);
  });
  const porchCrate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 1.0), woodMat);
  porchCrate.position.set(-3.6, 0.55, 6.2);
  houseExteriorGroup.add(porchCrate);
  group.add(houseExteriorGroup);

  // 10. Mountain House INTERIOR
  const houseInteriorGroup = new THREE.Group();
  houseInteriorGroup.position.copy(CH2_HOUSE_POS);
  houseInteriorGroup.visible = false;

  const intFloor = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.28, 12.4), woodMat);
  intFloor.position.y = 0.02;
  intFloor.receiveShadow = true;
  houseInteriorGroup.add(intFloor);

  const intBackWall = new THREE.Mesh(new THREE.BoxGeometry(10.8, 4.5, 0.35), woodMat);
  intBackWall.position.set(0, 2.25, -6.2);
  const intLeftBack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.5, 6.8), woodMat);
  intLeftBack.position.set(-5.25, 2.25, -2.9);
  const intLeftFront = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.5, 2.6), woodMat);
  intLeftFront.position.set(-5.25, 2.25, 4.9);
  const intLeftWinLow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 3.2), woodMat);
  intLeftWinLow.position.set(-5.25, 0.7, 2.1);
  const intLeftWinHigh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 3.2), woodMat);
  intLeftWinHigh.position.set(-5.25, 3.8, 2.1);
  const intRightWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.5, 12.6), woodMat);
  intRightWall.position.set(5.25, 2.25, 0);
  const intFrontLeft = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.5, 0.35), woodMat);
  intFrontLeft.position.set(-3.2, 2.25, 6.15);
  const intFrontRight = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.5, 0.35), woodMat);
  intFrontRight.position.set(3.2, 2.25, 6.15);
  const intFrontTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.35), woodMat);
  intFrontTop.position.set(0, 3.75, 6.15);
  const intCeiling = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 12.6), darkWoodMat);
  intCeiling.position.set(0, 4.55, 0);
  houseInteriorGroup.add(
    intBackWall,
    intLeftBack,
    intLeftFront,
    intLeftWinLow,
    intLeftWinHigh,
    intRightWall,
    intFrontLeft,
    intFrontRight,
    intFrontTop,
    intCeiling
  );

  for (let bz = -4.2; bz <= 4.2; bz += 2.8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.28, 0.32), darkWoodMat);
    beam.position.set(0, 4.25, bz);
    houseInteriorGroup.add(beam);
  }
  const intLanternCord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), darkWoodMat);
  intLanternCord.position.set(0.4, 3.9, -0.4);
  const intLanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.34, 8), lanternGlowMat);
  intLanternBody.position.set(0.4, 3.45, -0.4);
  const intLanternLight = new THREE.PointLight(0xffd28a, 10, 14, 1.4);
  intLanternLight.position.set(0.4, 3.3, -0.4);
  houseInteriorGroup.add(intLanternCord, intLanternBody, intLanternLight);

  const dustCount = 75;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 9.2;
    dustPos[i * 3 + 1] = 0.5 + Math.random() * 3.5;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 11.2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const indoorDust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0xffe8b8,
      size: 0.14,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
  );
  houseInteriorGroup.add(indoorDust);

  const fireplace = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 1.2), rockMat);
  fireplace.position.set(-4.35, 1.6, -0.8);
  const fireEmber = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xff8b33 })
  );
  fireEmber.position.set(-3.95, 0.55, -0.8);
  const fireplaceLight = new THREE.PointLight(0xff9f45, 18, 16, 1.4);
  fireplaceLight.position.set(-3.3, 1.2, -0.8);
  houseInteriorGroup.add(fireplace, fireEmber, fireplaceLight);

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 1.4), darkWoodMat);
  tableTop.position.set(-0.6, 0.95, -0.2);
  houseInteriorGroup.add(tableTop);
  [
    [-1.4, -0.7],
    [0.2, -0.7],
    [-1.4, 0.3],
    [0.2, 0.3],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.14), darkWoodMat);
    leg.position.set(lx, 0.48, lz);
    houseInteriorGroup.add(leg);
  });

  const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.65), darkWoodMat);
  shelfFrame.position.set(0.2, 1.5, -5.65);
  houseInteriorGroup.add(shelfFrame);

  const bedGroup = new THREE.Group();
  bedGroup.position.set(3.4, 0.15, -3.8);
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.48, 3.15), darkWoodMat);
  bedFrame.position.y = 0.28;
  const bedHeadboard = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.25, 0.2), darkWoodMat);
  bedHeadboard.position.set(0, 0.72, -1.5);
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.26, 2.85),
    new THREE.MeshStandardMaterial({ color: 0xd9cdb8, roughness: 0.92 })
  );
  mattress.position.y = 0.62;
  const blanket = new THREE.Mesh(
    new THREE.BoxGeometry(2.08, 0.14, 2.05),
    new THREE.MeshStandardMaterial({ color: 0x3b5c78, roughness: 0.88 })
  );
  blanket.position.set(0, 0.72, 0.36);
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.18, 0.58),
    new THREE.MeshStandardMaterial({ color: 0xf0ebe0, roughness: 0.88 })
  );
  pillow.position.set(0, 0.8, -1.05);
  bedGroup.add(bedFrame, bedHeadboard, mattress, blanket, pillow);
  houseInteriorGroup.add(bedGroup);

  const supplyBoxGroup = new THREE.Group();
  supplyBoxGroup.position.set(-3.4, 0.15, -5.2);
  const boxBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.78, 0.92), woodMat);
  boxBase.position.y = 0.39;
  const boxLidPivot = new THREE.Group();
  boxLidPivot.position.set(0, 0.78, -0.46);
  const boxLid = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.14, 0.96), darkWoodMat);
  boxLid.position.set(0, 0.06, 0.46);
  const boxClasp = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.14, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xd9a84e, metalness: 0.85, roughness: 0.25 })
  );
  boxClasp.position.set(0, 0.02, 0.94);
  boxLidPivot.add(boxLid, boxClasp);

  const boxTonicMesh = new THREE.Group();
  boxTonicMesh.position.set(-0.28, 0.75, 0.05);
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.34, 10),
    new THREE.MeshStandardMaterial({
      color: 0x72efdd,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.36,
      roughness: 0.15,
    })
  );
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), woodMat);
  cork.position.y = 0.2;
  boxTonicMesh.add(bottle, cork);

  const boxFruitMeshes: THREE.Mesh[] = [];
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xe65c4f, roughness: 0.48 });
  [
    [0.14, 0.72, 0.14],
    [0.36, 0.72, -0.05],
    [0.2, 0.72, -0.18],
  ].forEach(([fx, fy, fz]) => {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), fruitMat);
    fruit.position.set(fx, fy, fz);
    supplyBoxGroup.add(fruit);
    boxFruitMeshes.push(fruit);
  });

  supplyBoxGroup.add(boxBase, boxLidPivot, boxTonicMesh);
  houseInteriorGroup.add(supplyBoxGroup);
  group.add(houseInteriorGroup);

  // 10B. Elevated Rocky Platform, Stone Stairway & Ancient Magical Portal beside Mountain House
  const portalStairGroup = new THREE.Group();
  for (let s = 0; s < 6; s++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 3.8), stepStoneMat);
    const t = s / 5;
    st.position.set(8.4 + t * 4.2, 15.65 + t * 1.85, -104.2);
    st.castShadow = true;
    st.receiveShadow = true;
    portalStairGroup.add(st);
  }
  group.add(portalStairGroup);

  const portalGroup = new THREE.Group();
  portalGroup.position.copy(CH2_PORTAL_POS);
  portalGroup.rotation.y = -0.35; // Angled slightly toward the house courtyard so glow & silhouette shine nicely

  const carvedStoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x565b66,
    roughness: 0.88,
    metalness: 0.08,
  });
  const runeStoneTrimMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    color: 0x7b7263,
    roughness: 0.72,
    metalness: 0.18,
  });

  // Elevated Rocky Platform Slab + Perimeter Boulders
  const platformSlab = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.4, 2.3, 14), carvedStoneMat);
  platformSlab.position.y = -1.1;
  platformSlab.receiveShadow = true;
  platformSlab.castShadow = true;
  portalGroup.add(platformSlab);

  for (let b = 0; b < 7; b++) {
    const a = (b / 7) * Math.PI * 2 + 0.4;
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + (b % 3) * 0.25, 1), rockMat);
    boulder.position.set(Math.cos(a) * 5.2, -0.1, Math.sin(a) * 5.2);
    boulder.scale.set(1.2, 0.7, 1.1);
    boulder.receiveShadow = true;
    portalGroup.add(boulder);
  }

  // Carved Stone Altar Plinth beneath the Ring
  const portalPlinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.65, 2.4), carvedStoneMat);
  portalPlinth.position.y = 0.25;
  portalPlinth.receiveShadow = true;
  portalPlinth.castShadow = true;
  portalGroup.add(portalPlinth);

  // Ancient Circular Carved Stone Ring (major landmark!)
  const archCenterY = 3.15;
  const portalRingFrame = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.46, 12, 32), carvedStoneMat);
  portalRingFrame.position.y = archCenterY;
  portalRingFrame.castShadow = true;
  portalRingFrame.receiveShadow = true;
  portalGroup.add(portalRingFrame);

  const outerStoneBorder = new THREE.Mesh(new THREE.TorusGeometry(3.12, 0.16, 8, 32), runeStoneTrimMat);
  outerStoneBorder.position.y = archCenterY;
  portalGroup.add(outerStoneBorder);

  // 8 Individually Ignitable Carved Runestones + Outer Ancient Glyph Tablets
  const portalRuneMeshes: THREE.Mesh[] = [];
  for (let r = 0; r < 8; r++) {
    const a = (r / 8) * Math.PI * 2 + Math.PI / 2;
    const rx = Math.cos(a) * 2.65;
    const ry = archCenterY + Math.sin(a) * 2.65;

    const stoneSocket = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.68), runeStoneTrimMat);
    stoneSocket.position.set(rx, ry, 0);
    stoneSocket.rotation.z = a - Math.PI / 2;
    portalGroup.add(stoneSocket);

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: r % 2 === 0 ? 0x38bdf8 : 0x8b5cf6,
      emissiveIntensity: 0.08,
      roughness: 0.25,
    });
    const runeGlyph = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.74), runeMat);
    runeGlyph.position.set(rx, ry, 0);
    runeGlyph.rotation.z = a - Math.PI / 2;
    portalGroup.add(runeGlyph);
    portalRuneMeshes.push(runeGlyph);
  }

  // Slowly Rotating Carved Magical Rings
  const portalOrbitRings: THREE.Mesh[] = [];
  [2.32, 2.92].forEach((rad, idx) => {
    const ringMat = new THREE.MeshStandardMaterial({
      color: idx === 0 ? 0x72efdd : 0xa78bfa,
      emissive: idx === 0 ? 0x0ea5e9 : 0x7c3aed,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.055, 8, 48), ringMat);
    ring.position.set(0, archCenterY, idx === 0 ? 0.08 : -0.08);
    portalGroup.add(ring);
    portalOrbitRings.push(ring);
  });

  // Mysterious Swirling Blue / Cyan / Violet Portal Energy Field (ShaderMaterial using vUv only)
  const portalEnergyUniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 0.14 },
    uExpand: { value: 1.0 },
  };
  const portalEnergyMat = new THREE.ShaderMaterial({
    uniforms: portalEnergyUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uExpand;
      varying vec2 vUv;

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float dist = length(p);
        if (dist > 1.0) discard;

        float angle = atan(p.y, p.x);
        float swirl = sin(angle * 4.0 + dist * 9.0 - uTime * 2.6);
        float ripple = cos(dist * 14.0 - uTime * 3.4 + swirl * 0.65);
        float core = exp(-dist * 2.1);

        vec3 deepBlue = vec3(0.10, 0.32, 0.76);
        vec3 cyanGlow = vec3(0.32, 0.90, 0.96);
        vec3 violetTint = vec3(0.56, 0.30, 0.92);

        vec3 col = mix(deepBlue, violetTint, 0.5 + 0.5 * sin(angle * 2.0 + uTime));
        col = mix(col, cyanGlow, smoothstep(-0.3, 0.8, swirl * 0.5 + ripple * 0.5));
        col += vec3(0.85, 0.97, 1.0) * core * 0.65;

        float edgeFade = smoothstep(1.0, 0.68, dist);
        float alpha = clamp((0.28 + 0.68 * edgeFade) * uIntensity * uExpand, 0.0, 0.96);
        gl_FragColor = vec4(col * (0.65 + uIntensity * 0.85), alpha);
      }
    `,
  });
  const portalEnergyMesh = new THREE.Mesh(new THREE.CircleGeometry(2.26, 48), portalEnergyMat);
  portalEnergyMesh.position.y = archCenterY;
  portalGroup.add(portalEnergyMesh);

  // Soft Rock Bounce Glow Disc beneath Portal
  const portalHaloMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 4.8, 32),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  portalHaloMesh.rotation.x = -Math.PI / 2;
  portalHaloMesh.position.y = 0.08;
  portalGroup.add(portalHaloMesh);

  // Portal Blue-Cyan-Violet PointLight illuminating nearby platform rocks & gable
  const portalLight = new THREE.PointLight(0x52c8ff, 4.5, 28, 1.5);
  portalLight.position.set(0, archCenterY, 0.5);
  portalGroup.add(portalLight);

  // 6 Floating Carved Stones Orbiting the Ancient Portal
  const portalFloatingStones: Chapter2WorldObjects['portalFloatingStones'] = [];
  for (let fs = 0; fs < 6; fs++) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.28 + (fs % 2) * 0.12, 0),
      runeStoneTrimMat
    );
    const angle = (fs / 6) * Math.PI * 2;
    const radius = 3.55 + (fs % 2) * 0.45;
    const yOffset = archCenterY + ((fs % 3) - 1) * 0.85;
    stone.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * 0.65);
    portalGroup.add(stone);
    portalFloatingStones.push({
      mesh: stone,
      angle,
      radius,
      yOffset,
      speed: (fs % 2 === 0 ? 1 : -1) * (0.35 + fs * 0.06),
    });
  }

  // Inward-Spiraling Magical Portal Particles
  const ppCount = 96;
  const ppPos = new Float32Array(ppCount * 3);
  for (let i = 0; i < ppCount; i++) {
    const a = (i / ppCount) * Math.PI * 2;
    const rad = 1.2 + Math.random() * 2.8;
    ppPos[i * 3] = Math.cos(a) * rad;
    ppPos[i * 3 + 1] = archCenterY + Math.sin(a) * rad * 0.9;
    ppPos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
  }
  const ppGeo = new THREE.BufferGeometry();
  ppGeo.setAttribute('position', new THREE.BufferAttribute(ppPos, 3));
  const portalParticles = new THREE.Points(
    ppGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0x72efdd,
      size: 0.28,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
  );
  portalGroup.add(portalParticles);
  group.add(portalGroup);

  // 11. Observation Mode 3D Landmark Highlight Rings (including Portal once discovered)
  const highlightSpecs: {
    id: 'house' | 'tent' | 'ruins' | 'portal';
    label: string;
    anchor: THREE.Vector3;
    radius: number;
    color: number;
  }[] = [
    {
      id: 'house',
      label: 'Mountain House (Shelter)',
      anchor: new THREE.Vector3(0, 21.5, -108),
      radius: 8.5,
      color: 0x72efdd,
    },
    {
      id: 'tent',
      label: 'Abandoned Tent',
      anchor: new THREE.Vector3(CH2_TENT_POS.x, CH2_TENT_POS.y + 3.2, CH2_TENT_POS.z),
      radius: 3.0,
      color: 0xf4e4c2,
    },
    {
      id: 'portal',
      label: 'Ancient Stone Portal',
      anchor: new THREE.Vector3(CH2_PORTAL_POS.x, CH2_PORTAL_POS.y + 4.5, CH2_PORTAL_POS.z),
      radius: 4.5,
      color: 0x60a5fa,
    },
    {
      id: 'ruins',
      label: 'Distant Monolith Ruins',
      anchor: new THREE.Vector3(CH2_RUINS_POS.x, CH2_RUINS_POS.y + 10.5, CH2_RUINS_POS.z),
      radius: 8.5,
      color: 0xd9a84e,
    },
  ];
  const highlightRings: Chapter2WorldObjects['highlightRings'] = [];
  highlightSpecs.forEach((spec) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(spec.radius - 0.35, spec.radius, 32),
      new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(spec.anchor.x, spec.anchor.y - 2.6, spec.anchor.z);
    ring.visible = false;
    group.add(ring);
    highlightRings.push({
      id: spec.id,
      label: spec.label,
      anchor: spec.anchor,
      ring,
    });
  });

  // 12. Subtle Guiding Trail Motes along the walkable path & Island Magic Particles
  const tmCount = 90;
  const tmPos = new Float32Array(tmCount * 3);
  for (let i = 0; i < tmCount; i++) {
    const pz = THREE.MathUtils.lerp(13, -98, i / (tmCount - 1));
    const px = getCh2TrailCenterX(pz) + Math.sin(i * 1.7) * 1.6;
    const py = getCh2WalkSurface(px, pz, false).y + 0.65 + (i % 4) * 0.25;
    tmPos[i * 3] = px;
    tmPos[i * 3 + 1] = py;
    tmPos[i * 3 + 2] = pz;
  }
  const tmGeo = new THREE.BufferGeometry();
  tmGeo.setAttribute('position', new THREE.BufferAttribute(tmPos, 3));
  const trailMotes = new THREE.Points(
    tmGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0x72efdd,
      size: 0.26,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    })
  );
  group.add(trailMotes);

  const pCount = 260;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 90;
    pPos[i * 3 + 1] = 1 + Math.random() * 26;
    pPos[i * 3 + 2] = 20 - Math.random() * 145;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const magicParticles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0xffe4a8,
      size: 0.32,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    })
  );
  magicParticles.frustumCulled = false;
  group.add(magicParticles);

  return {
    group,
    oceanMesh,
    oceanUniforms,
    streamUniforms,
    skyDome,
    skyMat,
    sunDisc,
    clouds,
    swayTrees,
    houseExteriorGroup,
    houseInteriorGroup,
    doorPivot,
    boxLidPivot,
    boxTonicMesh,
    boxFruitMeshes,
    fireplaceLight,
    porchLanternLight,
    portalGroup,
    portalRuneMeshes,
    portalOrbitRings,
    portalEnergyMesh,
    portalEnergyUniforms,
    portalFloatingStones,
    portalParticles,
    portalLight,
    portalHaloMesh,
    highlightRings,
    magicParticles,
    trailMotes,
  };
}

const _sunsetSky = new THREE.Color(0xe6845c);
const _eveningSky = new THREE.Color(0x3a2f59);
const _nightSky = new THREE.Color(0x0b1224);
const _morningSky = new THREE.Color(0x9bcbe2);

const _sunsetFog = new THREE.Color(0xc97b62);
const _eveningFog = new THREE.Color(0x393154);
const _nightFog = new THREE.Color(0x0d1528);
const _morningFog = new THREE.Color(0x9dc2d6);

const _tmpColorA = new THREE.Color();
const _tmpColorB = new THREE.Color();

export function updateChapter2Atmosphere(
  world: Chapter2WorldObjects,
  timeOfDay: number,
  time: number,
  scene: THREE.Scene,
  hemiLight: THREE.HemisphereLight,
  sunLight: THREE.DirectionalLight,
  insideHouse: boolean
): void {
  const t = THREE.MathUtils.clamp(timeOfDay, 0, 1);

  if (t < 0.45) {
    const k = t / 0.45;
    _tmpColorA.copy(_sunsetSky).lerp(_eveningSky, k);
    _tmpColorB.copy(_sunsetFog).lerp(_eveningFog, k);
    hemiLight.intensity = THREE.MathUtils.lerp(0.85, 0.56, k);
    sunLight.intensity = THREE.MathUtils.lerp(1.5, 0.75, k);
    sunLight.color.setHex(0xffb478).lerp(new THREE.Color(0xc898c8), k);
  } else if (t < 0.78) {
    const k = (t - 0.45) / 0.33;
    _tmpColorA.copy(_eveningSky).lerp(_nightSky, k);
    _tmpColorB.copy(_eveningFog).lerp(_nightFog, k);
    hemiLight.intensity = THREE.MathUtils.lerp(0.56, 0.32, k);
    sunLight.intensity = THREE.MathUtils.lerp(0.75, 0.35, k);
    sunLight.color.setHex(0xc898c8).lerp(new THREE.Color(0x7ca2d6), k);
  } else {
    const k = (t - 0.78) / 0.22;
    _tmpColorA.copy(_nightSky).lerp(_morningSky, k);
    _tmpColorB.copy(_nightFog).lerp(_morningFog, k);
    hemiLight.intensity = THREE.MathUtils.lerp(0.32, 0.92, k);
    sunLight.intensity = THREE.MathUtils.lerp(0.35, 1.48, k);
    sunLight.color.setHex(0x7ca2d6).lerp(new THREE.Color(0xfff1cf), k);
  }

  world.skyMat.color.copy(_tmpColorA);
  scene.background = _tmpColorB.clone();
  if (scene.fog instanceof THREE.FogExp2) {
    scene.fog.color.copy(_tmpColorB);
    scene.fog.density = insideHouse ? 0.0022 : t > 0.6 && t < 0.85 ? 0.0052 : 0.0036;
  }

  const sunY =
    t < 0.5
      ? THREE.MathUtils.lerp(36, 4, t / 0.5)
      : t < 0.8
      ? THREE.MathUtils.lerp(42, 48, (t - 0.5) / 0.3)
      : THREE.MathUtils.lerp(14, 52, (t - 0.8) / 0.2);
  world.sunDisc.position.set(t >= 0.8 ? 42 : -48, sunY, 195);
  (world.sunDisc.material as THREE.MeshBasicMaterial).color.setHex(
    t > 0.48 && t < 0.82 ? 0xdde8ff : t >= 0.82 ? 0xfff5d4 : 0xffbe6b
  );

  world.oceanUniforms.uTime.value = time;
  world.oceanUniforms.uSurge.value = Math.sin(time * 1.15);
  world.streamUniforms.uTime.value = time;
  world.portalEnergyUniforms.uTime.value = time;

  // Slowly rotating magical rune rings & orbiting floating stones
  world.portalOrbitRings[0].rotation.z = time * 0.28;
  world.portalOrbitRings[1].rotation.z = -time * 0.2;
  world.portalFloatingStones.forEach((fs, idx) => {
    const a = fs.angle + time * fs.speed;
    fs.mesh.position.set(
      Math.cos(a) * fs.radius,
      fs.yOffset + Math.sin(time * 1.6 + idx) * 0.24,
      Math.sin(a) * 0.72
    );
    fs.mesh.rotation.x += 0.008;
    fs.mesh.rotation.y += 0.011;
  });

  // Inward-drifting portal particles
  const pAttr = world.portalParticles.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pAttr.count; i++) {
    let x = pAttr.getX(i);
    let y = pAttr.getY(i) - 3.15;
    let z = pAttr.getZ(i);
    const len = Math.hypot(x, y);
    if (len < 0.25) {
      const a = (i / pAttr.count) * Math.PI * 2 + time;
      const rad = 2.6 + Math.random() * 1.4;
      x = Math.cos(a) * rad;
      y = Math.sin(a) * rad;
      z = (Math.random() - 0.5) * 1.8;
    } else {
      const pull = 0.025;
      const cosR = Math.cos(0.03);
      const sinR = Math.sin(0.03);
      const nx = x * cosR - y * sinR;
      const ny = x * sinR + y * cosR;
      x = nx * (1 - pull);
      y = ny * (1 - pull);
      z *= 0.96;
    }
    pAttr.setXYZ(i, x, y + 3.15, z);
  }
  pAttr.needsUpdate = true;

  world.swayTrees.forEach((tr) => {
    tr.group.rotation.z = Math.sin(time * 1.3 + tr.phase) * 0.035;
  });
  world.clouds.forEach((cl, idx) => {
    cl.position.x += 0.018 * (idx % 2 === 0 ? 1 : 0.6);
    if (cl.position.x > 140) cl.position.x = -140;
  });
  world.fireplaceLight.intensity = 16 + Math.sin(time * 11) * 2.5 + Math.cos(time * 17) * 1.5;
  world.porchLanternLight.intensity = 13 + Math.sin(time * 7) * 1.2;
}
