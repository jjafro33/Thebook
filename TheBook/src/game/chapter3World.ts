import * as THREE from 'three';
import {
  createLumiModel,
  createOrvellanModel,
  type LumiRig,
  type OrvellanRig,
} from './models';
import type { ProceduralTextures } from './textures';
import type { Ch3SubZone } from './types';

// --- Key Spatial Anchors across Chapter 3 ---
export const CH3_SPAWN_POS = new THREE.Vector3(0, 0, 29);
export const CH3_HOUSE_POS = new THREE.Vector3(0, 0, 10);
export const CH3_LETTER_POS = new THREE.Vector3(0.1, 0.28, 15.25);
export const CH3_EXTERIOR_DOOR_POS = new THREE.Vector3(0, 0.24, 14.6);

// House Interior (subZone: 'house_interior')
export const CH3_INTERIOR_BED_POS = new THREE.Vector3(-2.6, 0, 7.6);
export const CH3_INTERIOR_DOOR_POS = new THREE.Vector3(0, 0, 13.4);
export const CH3_INTERIOR_CLOCK_POS = new THREE.Vector3(3.9, 0, 7.2);

// Whispering Woods & Surface Trail (subZone: 'surface')
export const CH3_TENT_POS = new THREE.Vector3(-7.2, 0, 16.5);
export const CH3_SIGN_POS = new THREE.Vector3(2.9, 0, -21.5);
export const CH3_LUMI_POS = new THREE.Vector3(-2.4, 0.2, -31.5);
export const CH3_STONES_PLATFORM_POS = new THREE.Vector3(0, 0.4, -78);
export const CH3_STAIR_DESCENT_POS = new THREE.Vector3(0, 0.4, -78);

// Elarion Underground City & Library & Archive (subZone: 'elarion')
export const CH3_ELARION_SPAWN = new THREE.Vector3(0, 0, 36);
export const CH3_STATUE_POS = new THREE.Vector3(0, 0, -14);
export const CH3_ORVELLAN_POS = new THREE.Vector3(0, 0, -49);
export const CH3_ARCHIVE_POS = new THREE.Vector3(0, 0, -75);
export const CH3_NORTHERN_GATE_POS = new THREE.Vector3(0, 0.8, -120);

// Valley of Silent Bells (subZone: 'valley')
export const CH3_VALLEY_SPAWN = new THREE.Vector3(0, 0, 16);
export const CH3_BOOK_TOWER_POS = new THREE.Vector3(0, 0, -115);

export interface Ch3CollectibleNode {
  id: 'broken_compass' | 'old_wooden_toy' | 'torn_blue_fabric' | 'small_silver_key';
  name: string;
  description: string;
  position: THREE.Vector3;
  group: THREE.Group;
  ring: THREE.Mesh;
  needle?: THREE.Mesh;
  collected: boolean;
}

export interface Ch3FragmentNode {
  id: 'sun' | 'moon' | 'star';
  title: string;
  position: THREE.Vector3;
  group: THREE.Group;
  ring: THREE.Mesh;
  collected: boolean;
}

export interface Ch3InspectableNode {
  id: string;
  label: string;
  text: string;
  position: THREE.Vector3;
  ring: THREE.Mesh;
}

export interface Ch3EscapeSwitch {
  id: string;
  barrierIndex: number;
  position: THREE.Vector3;
  crystal: THREE.Mesh;
  ring: THREE.Mesh;
  activated: boolean;
}

export interface MemoryStoneNode {
  id: 'stone_west' | 'stone_east' | 'stone_north';
  symbol: 'sun' | 'moon' | 'star';
  title: string;
  clue: string;
  position: THREE.Vector3;
  group: THREE.Group;
  crystal: THREE.Mesh;
  runeDial: THREE.Mesh;
  ring: THREE.Mesh;
  collected: boolean;
}

export interface Chapter3WorldObjects {
  group: THREE.Group;
  // Sub-realms
  tunnelGroup: THREE.Group;
  houseInteriorGroup: THREE.Group;
  surfaceGroup: THREE.Group;
  elarionGroup: THREE.Group;
  valleyGroup: THREE.Group;

  // Tunnel animation pieces
  tunnelRings: THREE.Mesh[];
  tunnelPages: THREE.Mesh[];
  tunnelBuildings: THREE.Mesh[];
  tunnelShadow: THREE.Group;

  // House Interior pieces
  clockHourHand: THREE.Mesh;
  clockMinuteHand: THREE.Mesh;
  interiorDoorPivot: THREE.Group;
  interiorSunbeam: THREE.Mesh;

  // Exterior & Surface pieces
  skyDome: THREE.Mesh;
  exteriorDoorPivot: THREE.Group;
  letterEnvelopeGroup: THREE.Group;
  letterGoldenSymbol: THREE.Mesh;
  letterHighlight: THREE.Mesh;
  footprintMeshes: THREE.Mesh[];
  collectibles: Ch3CollectibleNode[];
  fragments: Ch3FragmentNode[];
  lumiRig: LumiRig;
  memoryStones: MemoryStoneNode[];
  platformRunes: THREE.Mesh[];
  stairTrapdoor: THREE.Mesh;
  hiddenStairGroup: THREE.Group;
  swayTrees: { group: THREE.Group; phase: number }[];
  ambientMotes: THREE.Points;

  // Elarion pieces
  elarionInspectables: Ch3InspectableNode[];
  memoryVisionGroup: THREE.Group;
  memoryShadowCloud: THREE.Mesh;
  memoryCitizens: { group: THREE.Group; basePos: THREE.Vector3; phase: number }[];
  elarionFloatingBooks: { group: THREE.Group; basePos: THREE.Vector3; phase: number }[];
  orvellanRig: OrvellanRig;
  archiveBookGroup: THREE.Group;
  archiveBookLeftPage: THREE.Mesh;
  archiveBookRightPage: THREE.Mesh;
  archiveKeyMesh: THREE.Group;
  escapeLights: THREE.PointLight[];
  escapeBarriers: THREE.Mesh[];
  escapeSwitches: Ch3EscapeSwitch[];
  bellKeeperShadow: THREE.Group;
  escapeDust: THREE.Points;
  leftGatePivot: THREE.Group;
  rightGatePivot: THREE.Group;
  gateRunes: THREE.Mesh[];
  goldenKeyMesh: THREE.Group;

  // Valley pieces
  valleyBells: THREE.Group[];
  bookTowerGroup: THREE.Group;

  // Observation landmarks
  observationAnchors: {
    id: string;
    label: string;
    subZone: Ch3SubZone;
    anchor: THREE.Vector3;
    ring: THREE.Mesh;
  }[];
}

function createSignCanvasTexture(line1: string, line2: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#4a321f';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#2b1b10';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 240);
  ctx.fillStyle = '#f4e4c2';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(line1, 256, 102);
  ctx.fillStyle = '#99f6e4';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText(line2, 256, 158);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function createArchiveBookPageTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f5e7c4';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#b4822c';
  ctx.lineWidth = 8;
  ctx.strokeRect(22, 22, 468, 468);

  // Stylized portrait circle of Nate
  ctx.fillStyle = '#e7d2a4';
  ctx.beginPath();
  ctx.arc(256, 148, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8b5e1a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Silhouette boy hair + bandana
  ctx.fillStyle = '#3e2717';
  ctx.beginPath();
  ctx.arc(256, 138, 36, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#c83e2b';
  ctx.fillRect(226, 174, 60, 18);

  // Two glowing names
  ctx.fillStyle = '#5b390c';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('NATELEON KENNEDY', 256, 300);

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('JAFR', 256, 368);

  ctx.fillStyle = '#785a28';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText('Recorded by THE BOOK', 256, 434);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createClockFaceTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f7ebd2';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8b5e22';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.fillStyle = '#2b1b10';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillText(String(i), 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function getCh3WalkSurface(
  x: number,
  z: number,
  subZone: Ch3SubZone = 'surface'
): { y: number; surface: 'grass' | 'stone' | 'wood' } {
  if (subZone === 'house_interior') {
    return { y: 0, surface: 'wood' };
  }
  if (subZone === 'valley') {
    if (Math.abs(x) < 4.5 && z < -25 && z > -75) {
      return { y: 0.25, surface: 'stone' };
    }
    return { y: 0, surface: 'grass' };
  }
  if (subZone === 'elarion') {
    // Entry staircase steps down from +48 to +36
    if (z > 36) {
      const t = THREE.MathUtils.clamp((z - 36) / 12, 0, 1);
      return { y: t * 3.8, surface: 'stone' };
    }
    // Bridge over subterranean stream at z = 6..12
    if (Math.abs(x) < 4.5 && z > 5 && z < 14) {
      const arch = Math.sin(((z - 5) / 9) * Math.PI) * 0.55;
      return { y: arch, surface: 'stone' };
    }
    // Northern gate staircase (-108 -> -122)
    if (z < -108) {
      const t = THREE.MathUtils.clamp((-108 - z) / 12, 0, 1);
      return { y: t * 0.8, surface: 'stone' };
    }
    return { y: 0, surface: 'stone' };
  }

  // 'surface' subZone: House porch, stream bridge, circular stone platform
  if (Math.abs(x) < 4.6 && z >= 13.6 && z <= 16.4) {
    return { y: 0.24, surface: 'wood' };
  }
  // Wooden footbridge across Whispering Woods stream around z = -24
  if (Math.abs(x) < 3.2 && z >= -26.5 && z <= -21.5) {
    return { y: 0.28, surface: 'wood' };
  }
  // Circular Memory Stones Platform at (0, 0.4, -78)
  if (Math.hypot(x, z + 78) < 9.5) {
    return { y: 0.4, surface: 'stone' };
  }
  const trailX = z > 15 ? 0 : Math.sin(((15 - z) / 95) * Math.PI * 1.8) * 3.8;
  if (Math.abs(x - trailX) < 3.0) {
    return { y: 0.04, surface: 'stone' };
  }
  return { y: 0, surface: 'grass' };
}

function pushOutBox(pos: THREE.Vector3, minX: number, maxX: number, minZ: number, maxZ: number): void {
  if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
    const dL = Math.abs(pos.x - minX);
    const dR = Math.abs(maxX - pos.x);
    const dB = Math.abs(pos.z - minZ);
    const dF = Math.abs(maxZ - pos.z);
    const m = Math.min(dL, dR, dB, dF);
    if (m === dL) pos.x = minX;
    else if (m === dR) pos.x = maxX;
    else if (m === dB) pos.z = minZ;
    else pos.z = maxZ;
  }
}

export function clampToCh3Bounds(
  pos: THREE.Vector3,
  subZone: Ch3SubZone = 'surface',
  activeBarriers: boolean[] = [false, false]
): void {
  if (subZone === 'house_interior') {
    pos.x = THREE.MathUtils.clamp(pos.x, -4.1, 4.1);
    pos.z = THREE.MathUtils.clamp(pos.z, 5.2, 13.6);
    // Keep around bed
    pushOutBox(pos, -4.2, -1.2, 6.0, 9.2);
    return;
  }
  if (subZone === 'valley') {
    pos.x = THREE.MathUtils.clamp(pos.x, -38, 38);
    pos.z = THREE.MathUtils.clamp(pos.z, -102, 22);
    return;
  }
  if (subZone === 'elarion') {
    pos.z = THREE.MathUtils.clamp(pos.z, -120.5, 44);
    if (pos.z < -78) {
      pos.x = THREE.MathUtils.clamp(pos.x, -10.5, 10.5);
    } else if (pos.z < -36 && pos.z > -66) {
      // Circular library rotunda limits
      pos.x = THREE.MathUtils.clamp(pos.x, -18.5, 18.5);
    } else {
      pos.x = THREE.MathUtils.clamp(pos.x, -26, 26);
    }
    // Active escape barriers prevent rushing north until switches are triggered
    if (activeBarriers[0] && pos.z < -90.5) {
      pos.z = -90.5;
    }
    if (activeBarriers[1] && pos.z < -105.5) {
      pos.z = -105.5;
    }
    return;
  }

  // 'surface' bounds
  pos.z = THREE.MathUtils.clamp(pos.z, -89.5, 34.5);
  pos.x = THREE.MathUtils.clamp(pos.x, -23.5, 23.5);
  pushOutBox(pos, -6.2, 6.2, 4.4, 13.6);
}

export function createChapter3World(tex: ProceduralTextures): Chapter3WorldObjects {
  const group = new THREE.Group();
  group.visible = false;

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(340, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0x1a283f, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  group.add(skyDome);

  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x7c828f,
    roughness: 0.85,
  });
  const darkStoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    color: 0x3b4454,
    roughness: 0.88,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    color: 0x5c3e27,
    roughness: 0.78,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xe6b856,
    metalness: 0.85,
    roughness: 0.24,
    emissive: 0x7c5012,
    emissiveIntensity: 0.22,
  });
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4ee,
    metalness: 0.9,
    roughness: 0.2,
  });
  const cyanCrystalMat = new THREE.MeshStandardMaterial({
    color: 0x72efdd,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.36,
    roughness: 0.16,
  });

  // =========================================================================
  // SUB-REALM 1: PORTAL TUNNEL CINEMATIC GROUP
  // =========================================================================
  const tunnelGroup = new THREE.Group();
  tunnelGroup.visible = false;
  group.add(tunnelGroup);

  const tunnelTube = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 8.5, 60, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.26,
      side: THREE.BackSide,
    })
  );
  tunnelTube.rotation.x = Math.PI / 2;
  tunnelGroup.add(tunnelTube);

  const tunnelRings: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.8 + (i % 2) * 0.7, 0.12, 8, 36),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x72efdd : 0xfde68a,
        transparent: true,
        opacity: 0.72,
      })
    );
    ring.position.z = 20 - i * 5.2;
    tunnelGroup.add(ring);
    tunnelRings.push(ring);
  }

  const tunnelPages: THREE.Mesh[] = [];
  const pageMat = new THREE.MeshStandardMaterial({
    color: 0xf7ebd2,
    emissive: 0xd9a84e,
    emissiveIntensity: 0.18,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 18; i++) {
    const page = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.9), pageMat);
    const a = (i / 18) * Math.PI * 2;
    page.position.set(Math.cos(a) * 3.4, Math.sin(a) * 3.1, 14 - (i % 9) * 3.5);
    tunnelGroup.add(page);
    tunnelPages.push(page);
  }

  const tunnelBuildings: THREE.Mesh[] = [];
  const silMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.42 });
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5 + (i % 3) * 1.4, 1.6), silMat);
    b.position.set((i % 2 === 0 ? -1 : 1) * 5.2, -1.8, 12 - i * 4.5);
    tunnelGroup.add(b);
    tunnelBuildings.push(b);
  }

  const tunnelShadow = new THREE.Group();
  tunnelShadow.position.set(0, 0, -24);
  const shBody = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 3.2, 10),
    new THREE.MeshBasicMaterial({ color: 0x05070c, transparent: true, opacity: 0.85 })
  );
  const shEyes = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.07, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  shEyes.position.set(0, 0.7, 0.45);
  tunnelShadow.add(shBody, shEyes);
  tunnelGroup.add(tunnelShadow);

  // =========================================================================
  // SUB-REALM 2: HOUSE INTERIOR GROUP (ACT 1)
  // =========================================================================
  const houseInteriorGroup = new THREE.Group();
  houseInteriorGroup.visible = false;
  group.add(houseInteriorGroup);

  const intFloor = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.2, 9.6), woodMat);
  intFloor.position.set(0, -0.1, 9.5);
  intFloor.receiveShadow = true;
  const intWallMat = new THREE.MeshStandardMaterial({ map: tex.plaster, color: 0xa69b88, roughness: 0.86 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.4, 0.25), intWallMat);
  backWall.position.set(0, 2.2, 4.7);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.4, 9.6), intWallMat);
  leftWall.position.set(-4.7, 2.2, 9.5);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.4, 9.6), intWallMat);
  rightWall.position.set(4.7, 2.2, 9.5);
  const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.4, 0.25), intWallMat);
  frontWallL.position.set(-2.9, 2.2, 14.1);
  const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.4, 0.25), intWallMat);
  frontWallR.position.set(2.9, 2.2, 14.1);
  const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.25), intWallMat);
  frontHeader.position.set(0, 3.7, 14.1);
  const intCeiling = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.25, 9.8), woodMat);
  intCeiling.position.set(0, 4.4, 9.5);
  houseInteriorGroup.add(intFloor, backWall, leftWall, rightWall, frontWallL, frontWallR, frontHeader, intCeiling);

  // Interior Swinging Front Door
  const interiorDoorPivot = new THREE.Group();
  interiorDoorPivot.position.set(-0.9, 0, 14.05);
  const intDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.0, 0.14), woodMat);
  intDoorPanel.position.set(0.9, 1.5, 0);
  const intKnob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), goldMat);
  intKnob.position.set(1.62, 1.45, -0.1);
  interiorDoorPivot.add(intDoorPanel, intKnob);
  houseInteriorGroup.add(interiorDoorPivot);

  // Wooden Bed + Pillow
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 2.8), woodMat);
  bedFrame.position.set(-2.7, 0.28, 7.6);
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(1.82, 0.25, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x3b4d6b, roughness: 0.85 })
  );
  mattress.position.set(-2.7, 0.65, 7.6);
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.16, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf4e4c2, roughness: 0.85 })
  );
  pillow.position.set(-2.7, 0.82, 6.75);
  houseInteriorGroup.add(bedFrame, mattress, pillow);

  // Morning Sunlight Window & Volumetric Beam
  const winPane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.6),
    new THREE.MeshBasicMaterial({ color: 0xfff3c4 })
  );
  winPane.rotation.y = -Math.PI / 2;
  winPane.position.set(4.54, 2.4, 8.8);
  const interiorSunbeam = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 5.4, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffe8a3,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  interiorSunbeam.position.set(2.2, 1.4, 8.8);
  interiorSunbeam.rotation.z = -Math.PI / 3;
  const intLight = new THREE.PointLight(0xffdf9e, 18, 16, 1.4);
  intLight.position.set(0, 3.6, 9.2);
  houseInteriorGroup.add(winPane, interiorSunbeam, intLight);

  // Animated Grandfather Clock on Wall
  const clockGroup = new THREE.Group();
  clockGroup.position.set(3.85, 0, 6.2);
  const clockCase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.8, 0.55), woodMat);
  clockCase.position.y = 1.4;
  const clockDial = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 24),
    new THREE.MeshBasicMaterial({ map: createClockFaceTexture() })
  );
  clockDial.position.set(0, 2.25, 0.29);
  const handMat = new THREE.MeshBasicMaterial({ color: 0x1e1b18 });
  const clockHourHand = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.18, 0.02), handMat);
  clockHourHand.geometry.translate(0, 0.08, 0);
  clockHourHand.position.set(0, 2.25, 0.31);
  const clockMinuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.25, 0.02), handMat);
  clockMinuteHand.geometry.translate(0, 0.11, 0);
  clockMinuteHand.position.set(0, 2.25, 0.32);
  clockGroup.add(clockCase, clockDial, clockHourHand, clockMinuteHand);
  houseInteriorGroup.add(clockGroup);

  // =========================================================================
  // SUB-REALM 3: SURFACE REALM (HOUSE EXTERIOR, FOOTPRINTS, WHISPERING WOODS, STONES)
  // =========================================================================
  const surfaceGroup = new THREE.Group();
  surfaceGroup.visible = false;
  group.add(surfaceGroup);

  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x2a364b, roughness: 0.94 });
  [
    [-48, -110, 24],
    [0, -135, 30],
    [50, -112, 26],
    [-55, -35, 19],
    [55, -28, 20],
  ].forEach(([rx, rz, sc], idx) => {
    const peak = new THREE.Mesh(new THREE.ConeGeometry(sc * 0.95, sc * 1.45, 7), ridgeMat);
    peak.position.set(rx, sc * 0.42, rz);
    peak.rotation.y = idx * 0.6;
    surfaceGroup.add(peak);
  });

  const groundMat = new THREE.MeshStandardMaterial({
    map: tex.grass,
    normalMap: tex.grassNormal,
    color: 0x2d5846,
    roughness: 0.9,
  });
  const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(150, 180, 32, 40), groundMat);
  groundPlane.rotation.x = -Math.PI / 2;
  groundPlane.position.set(0, 0, -34);
  groundPlane.receiveShadow = true;
  surfaceGroup.add(groundPlane);

  // Small forest stream + Wooden plank bridge around z = -24
  const streamMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 4.2),
    new THREE.MeshStandardMaterial({
      map: tex.water,
      normalMap: tex.waterNormal,
      color: 0x2a889e,
      roughness: 0.18,
      metalness: 0.1,
    })
  );
  streamMesh.rotation.x = -Math.PI / 2;
  streamMesh.position.set(0, 0.03, -24);
  surfaceGroup.add(streamMesh);

  const streamBridge = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 5.2), woodMat);
  streamBridge.position.set(0, 0.18, -24);
  streamBridge.receiveShadow = true;
  surfaceGroup.add(streamBridge);

  // Wooden Fences & Campsite Tent near House
  const tentGroup = new THREE.Group();
  tentGroup.position.copy(CH3_TENT_POS);
  const tentCanvas = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 2.2, 4),
    new THREE.MeshStandardMaterial({ color: 0xb08a58, roughness: 0.88 })
  );
  tentCanvas.position.y = 1.1;
  tentCanvas.rotation.y = Math.PI / 4;
  tentCanvas.castShadow = true;
  tentGroup.add(tentCanvas);
  surfaceGroup.add(tentGroup);

  [-1, 1].forEach((s) => {
    for (let f = 0; f < 3; f++) {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.18), woodMat);
      fence.position.set(s * (7.2 + f * 3.3), 0.45, 13.5 - f * 1.2);
      fence.rotation.y = s * 0.22;
      surfaceGroup.add(fence);
    }
  });

  // Wildflowers & Blue Whispering Flowers
  const flowerBlueMat = new THREE.MeshStandardMaterial({
    color: 0x72efdd,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.28,
  });
  for (let i = 0; i < 42; i++) {
    const fx = ((i * 19) % 40) - 20;
    const fz = 26 - ((i * 7) % 105);
    const fl = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.16, 0),
      fz < -8 ? flowerBlueMat : new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0xf472b6 })
    );
    fl.position.set(fx, 0.18, fz);
    surfaceGroup.add(fl);
  }

  // Mysterious House Exterior
  const houseGroup = new THREE.Group();
  houseGroup.position.copy(CH3_HOUSE_POS);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.5, 10.2), stoneMat);
  plinth.position.y = 0.25;
  const porch = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.26, 3.2), woodMat);
  porch.position.set(0, 0.14, 5.2);
  porch.receiveShadow = true;
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 4.8, 8.8),
    new THREE.MeshStandardMaterial({ map: tex.plaster, color: 0xbcb09c, roughness: 0.85 })
  );
  walls.position.y = 2.8;
  walls.castShadow = true;
  walls.receiveShadow = true;

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-6.6, 0);
  roofShape.lineTo(0, 3.9);
  roofShape.lineTo(6.6, 0);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 10.2, bevelEnabled: false });
  roofGeo.translate(0, 0, -5.1);
  const manorRoof = new THREE.Mesh(
    roofGeo,
    new THREE.MeshStandardMaterial({ map: tex.roofSlate, color: 0x3b4861, roughness: 0.72 })
  );
  manorRoof.position.y = 5.1;
  manorRoof.castShadow = true;

  const exteriorDoorPivot = new THREE.Group();
  exteriorDoorPivot.position.set(-0.85, 0.3, 4.42);
  const extDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.8, 0.22), woodMat);
  extDoorPanel.position.set(0.85, 1.4, 0);
  exteriorDoorPivot.add(extDoorPanel);

  const winGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe4a8,
    emissive: 0xffb74d,
    emissiveIntensity: 0.32,
  });
  [-3.2, 3.2].forEach((wx) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.35, 0.22), winGlowMat);
    w.position.set(wx, 2.7, 4.42);
    houseGroup.add(w);
  });
  const porchLight = new THREE.PointLight(0xffcb77, 14, 20, 1.4);
  porchLight.position.set(0, 3.2, 5.6);
  houseGroup.add(plinth, porch, walls, manorRoof, exteriorDoorPivot, porchLight);
  surfaceGroup.add(houseGroup);

  // Black Envelope with Golden Symbol on porch ground at CH3_LETTER_POS
  const letterEnvelopeGroup = new THREE.Group();
  letterEnvelopeGroup.position.copy(CH3_LETTER_POS);
  const envMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.04, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x161820, roughness: 0.55 })
  );
  const letterGoldenSymbol = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.018, 6, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.36,
      metalness: 0.8,
      roughness: 0.2,
    })
  );
  letterGoldenSymbol.rotation.x = Math.PI / 2;
  letterGoldenSymbol.position.y = 0.03;
  const letterHighlight = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.52, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  letterHighlight.rotation.x = -Math.PI / 2;
  letterHighlight.position.y = 0.02;
  letterEnvelopeGroup.add(envMesh, letterGoldenSymbol, letterHighlight);
  surfaceGroup.add(letterEnvelopeGroup);

  // Glowing Footprints from Tent/Porch into Whispering Woods (with intentional gaps)
  const footprintMeshes: THREE.Mesh[] = [];
  const footprintWaypoints: [number, number][] = [
    [-5.8, 16.2],
    [-3.8, 15.8],
    [1.8, 15.6],
    [5.8, 13.8],
    [8.2, 9.6],
    [7.0, 4.0],
    [2.8, -1.5],
    // Intentional gap (-3..-9)
    [-1.2, -10.0],
    [-2.4, -15.5],
    // Intentional gap (-17..-21)
    [-0.8, -22.5],
    [-1.6, -28.0],
    [-2.2, -33.5],
  ];
  footprintWaypoints.forEach(([fx, fz], idx) => {
    const pm = new THREE.MeshBasicMaterial({
      color: 0x72efdd,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    });
    const print = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.54), pm);
    print.rotation.x = -Math.PI / 2;
    print.position.set(fx + (idx % 2 === 0 ? -0.22 : 0.22), 0.06, fz);
    surfaceGroup.add(print);
    footprintMeshes.push(print);
  });

  // 4 Optional Collectibles (Broken Compass, Old Wooden Toy, Torn Blue Fabric, Small Silver Key)
  const collectibles: Ch3CollectibleNode[] = [];
  const makeCollectRing = () => {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.55, 20),
      new THREE.MeshBasicMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.05;
    return r;
  };

  // 1. Broken Compass
  const compPos = new THREE.Vector3(-6.8, 0, 14.0);
  const compG = new THREE.Group();
  compG.position.copy(compPos);
  const compCase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 16), goldMat);
  compCase.position.y = 0.32;
  const compFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 16),
    new THREE.MeshBasicMaterial({ color: 0xf7ebd2 })
  );
  compFace.rotation.x = -Math.PI / 2;
  compFace.position.y = 0.375;
  const compNeedle = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.02, 0.32),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  compNeedle.position.y = 0.39;
  const compRing = makeCollectRing();
  compG.add(compCase, compFace, compNeedle, compRing);
  surfaceGroup.add(compG);
  collectibles.push({
    id: 'broken_compass',
    name: 'Broken Compass',
    description: 'An ancient brass compass whose cracked needle stubbornly points toward the Whispering Woods.',
    position: compPos,
    group: compG,
    ring: compRing,
    needle: compNeedle,
    collected: false,
  });

  // 2. Old Wooden Toy
  const toyPos = new THREE.Vector3(8.2, 0, 7.5);
  const toyG = new THREE.Group();
  toyG.position.copy(toyPos);
  const toyBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.2), woodMat);
  toyBody.position.y = 0.34;
  const toyHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), woodMat);
  toyHead.position.set(0.18, 0.5, 0);
  const toyRing = makeCollectRing();
  toyG.add(toyBody, toyHead, toyRing);
  surfaceGroup.add(toyG);
  collectibles.push({
    id: 'old_wooden_toy',
    name: 'Old Wooden Toy',
    description: 'A hand-carved wooden toy left behind long ago. Faint initials "A.U." are etched beneath.',
    position: toyPos,
    group: toyG,
    ring: toyRing,
    collected: false,
  });

  // 3. Torn Blue Fabric
  const fabPos = new THREE.Vector3(-9.4, 0, -2.5);
  const fabG = new THREE.Group();
  fabG.position.copy(fabPos);
  const fabPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.9, 8), woodMat);
  fabPost.position.y = 0.45;
  const fabCloth = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.78, side: THREE.DoubleSide })
  );
  fabCloth.position.set(0.24, 0.65, 0);
  fabCloth.rotation.y = 0.4;
  const fabRing = makeCollectRing();
  fabG.add(fabPost, fabCloth, fabRing);
  surfaceGroup.add(fabG);
  collectibles.push({
    id: 'torn_blue_fabric',
    name: 'Torn Blue Fabric',
    description: 'A strip of azure cloak fabric woven with silver thread from the lost kingdom of Aurelia.',
    position: fabPos,
    group: fabG,
    ring: fabRing,
    collected: false,
  });

  // 4. Small Silver Key
  const keyPos = new THREE.Vector3(9.2, 0, -14.0);
  const sKeyG = new THREE.Group();
  sKeyG.position.copy(keyPos);
  const keyBow = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), silverMat);
  keyBow.position.y = 0.58;
  const keyStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), silverMat);
  keyStem.position.y = 0.34;
  const keyRing = makeCollectRing();
  sKeyG.add(keyBow, keyStem, keyRing);
  surfaceGroup.add(sKeyG);
  collectibles.push({
    id: 'small_silver_key',
    name: 'Small Silver Key',
    description: 'A delicate silver key found along the forest edge. Fits the old keepsakes of Aurelia.',
    position: keyPos,
    group: sKeyG,
    ring: keyRing,
    collected: false,
  });

  // Wooden Sign in Whispering Woods
  const signG = new THREE.Group();
  signG.position.copy(CH3_SIGN_POS);
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.0, 8), woodMat);
  signPost.position.y = 1.0;
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.15, 0.14),
    new THREE.MeshStandardMaterial({
      map: createSignCanvasTexture('WELCOME TO THE WHISPERING WOODS', 'THE TREES REMEMBER EVERYTHING.'),
      roughness: 0.72,
    })
  );
  signBoard.position.y = 1.75;
  signBoard.rotation.y = -0.25;
  signG.add(signPost, signBoard);
  surfaceGroup.add(signG);

  // Whispering Woods Trees & Sunbeams
  const swayTrees: Chapter3WorldObjects['swayTrees'] = [];
  const trunkMat = new THREE.MeshStandardMaterial({ map: tex.bark, color: 0x3a2a24, roughness: 0.92 });
  const woodLeafA = new THREE.MeshStandardMaterial({ color: 0x265f54, roughness: 0.78 });
  const woodLeafB = new THREE.MeshStandardMaterial({
    color: 0x3e7788,
    emissive: 0x164e63,
    emissiveIntensity: 0.18,
    roughness: 0.72,
  });

  for (let i = 0; i < 46; i++) {
    const z = -6 - ((i * 2.9) % 82);
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (6.4 + ((i * 3.9) % 16.5));
    if (Math.hypot(x, z + 78) < 11) continue;

    const tg = new THREE.Group();
    tg.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.48, 5.6, 8), trunkMat);
    trunk.position.y = 2.8;
    trunk.castShadow = true;
    tg.add(trunk);

    const leafMat = i % 3 === 0 ? woodLeafB : woodLeafA;
    for (let c = 0; c < 3; c++) {
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.85 - c * 0.3, 1), leafMat);
      canopy.position.set((c - 1) * 0.42, 5.3 + c * 0.95, 0);
      canopy.scale.set(1.22, 0.78, 1.22);
      canopy.castShadow = true;
      tg.add(canopy);
    }
    surfaceGroup.add(tg);
    swayTrees.push({ group: tg, phase: i * 0.55 });
  }

  // Lumi — Composite Floating Forest Spirit
  const lumiRig = createLumiModel();
  lumiRig.root.position.copy(CH3_LUMI_POS);
  surfaceGroup.add(lumiRig.root);

  // 3 Symbol Fragments hidden in nearby Whispering Woods Ruins
  const fragSpecs: { id: 'sun' | 'moon' | 'star'; title: string; pos: THREE.Vector3; color: number }[] = [
    { id: 'sun', title: 'Sun Symbol Fragment', pos: new THREE.Vector3(-14.5, 0, -50), color: 0xfbbf24 },
    { id: 'moon', title: 'Moon Symbol Fragment', pos: new THREE.Vector3(14.5, 0, -58), color: 0x93c5fd },
    { id: 'star', title: 'Star Symbol Fragment', pos: new THREE.Vector3(-11.5, 0, -73), color: 0x72efdd },
  ];
  const fragments: Ch3FragmentNode[] = fragSpecs.map((sp) => {
    const g = new THREE.Group();
    g.position.copy(sp.pos);
    const ruinBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.15, 0.6, 6), stoneMat);
    ruinBase.position.y = 0.3;
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({
        color: sp.color,
        emissive: sp.color,
        emissiveIntensity: 0.42,
        roughness: 0.2,
      })
    );
    shard.position.y = 1.25;
    const ring = makeCollectRing();
    ring.scale.setScalar(1.6);
    g.add(ruinBase, shard, ring);
    surfaceGroup.add(g);
    return {
      id: sp.id,
      title: sp.title,
      position: sp.pos.clone(),
      group: g,
      ring,
      collected: false,
    };
  });

  // Circular Memory Stones Platform & Hidden Staircase
  const platGroup = new THREE.Group();
  platGroup.position.copy(CH3_STONES_PLATFORM_POS);
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.8, 0.8, 28), stoneMat);
  dais.position.y = -0.4;
  dais.receiveShadow = true;
  platGroup.add(dais);

  const platformRunes: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rune = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.08, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.15,
      })
    );
    rune.position.set(Math.cos(a) * 4.5, 0.05, Math.sin(a) * 4.5);
    platGroup.add(rune);
    platformRunes.push(rune);
  }

  const stairTrapdoor = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.18, 18), darkStoneMat);
  stairTrapdoor.position.y = 0.04;
  platGroup.add(stairTrapdoor);

  const hiddenStairGroup = new THREE.Group();
  hiddenStairGroup.visible = false;
  for (let s = 0; s < 6; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 0.65), stoneMat);
    step.position.set(0, -0.35 - s * 0.28, -0.8 + s * 0.45);
    hiddenStairGroup.add(step);
  }
  const stairGlow = new THREE.PointLight(0x72efdd, 14, 14, 1.4);
  stairGlow.position.y = 1.1;
  hiddenStairGroup.add(stairGlow);
  platGroup.add(hiddenStairGroup);
  surfaceGroup.add(platGroup);

  const stoneSpecs: {
    id: MemoryStoneNode['id'];
    symbol: 'sun' | 'moon' | 'star';
    title: string;
    clue: string;
    pos: THREE.Vector3;
    color: number;
  }[] = [
    {
      id: 'stone_west',
      symbol: 'sun',
      title: 'Sun Stone',
      clue: 'The Sun remembers the beginning.',
      pos: new THREE.Vector3(-5.2, 0.4, -75.0),
      color: 0xfbbf24,
    },
    {
      id: 'stone_east',
      symbol: 'moon',
      title: 'Moon Stone',
      clue: 'The Moon remembers the silence.',
      pos: new THREE.Vector3(5.2, 0.4, -75.0),
      color: 0x93c5fd,
    },
    {
      id: 'stone_north',
      symbol: 'star',
      title: 'Star Stone',
      clue: 'The Star remembers the way home.',
      pos: new THREE.Vector3(0, 0.4, -84.2),
      color: 0x72efdd,
    },
  ];
  const memoryStones: MemoryStoneNode[] = stoneSpecs.map((sp) => {
    const g = new THREE.Group();
    g.position.copy(sp.pos);
    const monolith = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.8, 0.85), stoneMat);
    monolith.position.y = 1.9;
    monolith.castShadow = true;
    const runeDial = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.08, 8, 16),
      new THREE.MeshStandardMaterial({
        color: sp.color,
        emissive: sp.color,
        emissiveIntensity: 0.45,
        metalness: 0.6,
        roughness: 0.3,
      })
    );
    runeDial.position.set(0, 2.35, 0.48);
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.MeshStandardMaterial({
        color: sp.color,
        emissive: sp.color,
        emissiveIntensity: 0.6,
        roughness: 0.18,
      })
    );
    crystal.position.y = 4.25;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.4, 24),
      new THREE.MeshBasicMaterial({
        color: sp.color,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    g.add(monolith, runeDial, crystal, ring);
    surfaceGroup.add(g);
    return {
      id: sp.id,
      symbol: sp.symbol,
      title: sp.title,
      clue: sp.clue,
      position: sp.pos.clone(),
      group: g,
      crystal,
      runeDial,
      ring,
      collected: false,
    };
  });

  // Floating Forest Spores
  const mCount = 220;
  const mPos = new Float32Array(mCount * 3);
  for (let i = 0; i < mCount; i++) {
    mPos[i * 3] = (Math.random() - 0.5) * 48;
    mPos[i * 3 + 1] = 0.8 + Math.random() * 8.5;
    mPos[i * 3 + 2] = 30 - Math.random() * 120;
  }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const ambientMotes = new THREE.Points(
    mGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0xa7f3d0,
      size: 0.28,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    })
  );
  ambientMotes.frustumCulled = false;
  surfaceGroup.add(ambientMotes);

  // =========================================================================
  // SUB-REALM 4: ELARION UNDERGROUND CITY, LIBRARY & ARCHIVE (ACTS 5-9)
  // =========================================================================
  const elarionGroup = new THREE.Group();
  elarionGroup.visible = false;
  group.add(elarionGroup);

  const cavernFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 200),
    new THREE.MeshStandardMaterial({ map: tex.cobble, color: 0x3b485c, roughness: 0.84 })
  );
  cavernFloor.rotation.x = -Math.PI / 2;
  cavernFloor.position.set(0, 0, -40);
  cavernFloor.receiveShadow = true;
  elarionGroup.add(cavernFloor);

  // Underground Cavern Vault Ceiling & Glowing Crystals
  const cavernVault = new THREE.Mesh(
    new THREE.CylinderGeometry(58, 60, 220, 14, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x10192b, side: THREE.BackSide, roughness: 0.95 })
  );
  cavernVault.rotation.x = Math.PI / 2;
  cavernVault.rotation.z = Math.PI / 2;
  cavernVault.position.set(0, 0, -40);
  elarionGroup.add(cavernVault);

  // Descending Ancient Entry Staircase (+48 -> +36)
  for (let s = 0; s < 10; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.45, 1.4), stoneMat);
    step.position.set(0, (9 - s) * 0.4, 36.5 + (9 - s) * 1.15);
    step.receiveShadow = true;
    elarionGroup.add(step);
  }

  // Underground Canal & Stone Bridge (z = 5..14) + Cavern Waterfalls
  const elWater = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 9),
    new THREE.MeshStandardMaterial({ color: 0x1d688a, emissive: 0x0c4a6e, emissiveIntensity: 0.18, roughness: 0.18 })
  );
  elWater.rotation.x = -Math.PI / 2;
  elWater.position.set(0, 0.04, 9.5);
  elarionGroup.add(elWater);

  const elBridge = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.45, 10), stoneMat);
  elBridge.position.set(0, 0.2, 9.5);
  elarionGroup.add(elBridge);

  [-28, 28].forEach((wx) => {
    const wf = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 28),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.48, side: THREE.DoubleSide })
    );
    wf.position.set(wx, 14, 9.5);
    wf.rotation.y = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
    elarionGroup.add(wf);
  });

  // Glowing Cavern Crystals & Ancient City Ruins / Shops
  const escapeLights: THREE.PointLight[] = [];
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 28 - i * 13;
    const crys = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.8, 6), cyanCrystalMat);
    crys.position.set(side * 22, 1.4, z);
    crys.rotation.z = -side * 0.25;
    elarionGroup.add(crys);

    if (i % 2 === 0) {
      const pt = new THREE.PointLight(0x38bdf8, 18, 28, 1.4);
      pt.position.set(side * 12, 6.5, z);
      elarionGroup.add(pt);
      escapeLights.push(pt);
    }
  }

  // Abandoned Market Stalls & Ruined Buildings
  const stallMat = new THREE.MeshStandardMaterial({ color: 0x4f3b2c, roughness: 0.85 });
  const awningMat = new THREE.MeshStandardMaterial({ color: 0x3b4d6b, roughness: 0.85 });
  [-12, 12].forEach((sx) => {
    [22, -2].forEach((sz) => {
      const stall = new THREE.Group();
      stall.position.set(sx, 0, sz);
      const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.4), stallMat);
      base.position.y = 0.6;
      const top = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.25, 2.8), awningMat);
      top.position.y = 2.6;
      stall.add(base, top);
      elarionGroup.add(stall);
    });
  });

  // Inspectable Elarion Lore Objects (Abandoned Shop, Ancient Document, Fallen Inscription)
  const elarionInspectables: Ch3InspectableNode[] = [
    {
      id: 'market_ledger',
      label: 'Abandoned Merchant Ledger',
      text: '“Day of the Seventh Bell: The sky above the dome split into ink and gold. Citizens walked toward the Library, then simply vanished.”',
      position: new THREE.Vector3(-10.5, 0, 22),
      ring: makeCollectRing(),
    },
    {
      id: 'scholar_scroll',
      label: 'Ancient Scholar Scroll',
      text: '“Elarion was never buried by stone—it was folded inside THE BOOK to shelter the memories of Aurelia.”',
      position: new THREE.Vector3(10.5, 0, -2),
      ring: makeCollectRing(),
    },
  ];
  elarionInspectables.forEach((ins) => {
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.8), woodMat);
    table.position.set(ins.position.x, 0.4, ins.position.z);
    ins.ring.position.copy(ins.position).setY(0.06);
    elarionGroup.add(table, ins.ring);
  });

  // Giant Broken-Faced Wizard Statue holding a Book (-14)
  const statueGroup = new THREE.Group();
  statueGroup.position.copy(CH3_STATUE_POS);
  const stPedestal = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.8, 4.4), darkStoneMat);
  stPedestal.position.y = 0.9;
  const stRobe = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.65, 5.2, 12), stoneMat);
  stRobe.position.y = 4.4;
  const stHead = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 12), stoneMat);
  stHead.position.y = 7.6;
  // Broken upper face fracture
  const stCrack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.75), darkStoneMat);
  stCrack.position.set(0.25, 7.75, 0.52);
  stCrack.rotation.z = 0.35;
  const stBook = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.4), goldMat);
  stBook.position.set(0, 4.9, 1.25);
  stBook.rotation.x = -0.35;
  const stPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.85, 0.25),
    new THREE.MeshStandardMaterial({
      map: createSignCanvasTexture('THE FIRST READER SHALL', 'OPEN THE LAST PAGE.'),
      roughness: 0.6,
    })
  );
  stPlaque.position.set(0, 1.1, 2.25);
  statueGroup.add(stPedestal, stRobe, stHead, stCrack, stBook, stPlaque);
  elarionGroup.add(statueGroup);

  // Memory Vision Cinematic Group (Ghostly bustling city + Black Cloud)
  const memoryVisionGroup = new THREE.Group();
  memoryVisionGroup.visible = false;
  elarionGroup.add(memoryVisionGroup);

  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.58 });
  const memoryCitizens: Chapter3WorldObjects['memoryCitizens'] = [];
  for (let i = 0; i < 16; i++) {
    const cg = new THREE.Group();
    const bp = new THREE.Vector3(((i % 4) - 1.5) * 5.2, 0, -4 - Math.floor(i / 4) * 5.5);
    cg.position.copy(bp);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.25, 8), ghostMat);
    body.position.y = 0.65;
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), ghostMat);
    hd.position.y = 1.48;
    cg.add(body, hd);
    memoryVisionGroup.add(cg);
    memoryCitizens.push({ group: cg, basePos: bp, phase: i * 0.7 });
  }
  const memoryShadowCloud = new THREE.Mesh(
    new THREE.SphereGeometry(16, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x090512, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
  );
  memoryShadowCloud.position.set(0, 8, -14);
  memoryVisionGroup.add(memoryShadowCloud);

  // Ancient Library of Elarion (z = -34 to -64)
  const libWallMat = new THREE.MeshStandardMaterial({ color: 0x222c40, roughness: 0.8 });
  const elarionFloatingBooks: Chapter3WorldObjects['elarionFloatingBooks'] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    if (Math.abs(Math.sin(a)) < 0.26) continue; // Keep North & South arch openings clear!
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 9.5, 1.3), libWallMat);
    shelf.position.set(Math.sin(a) * 19, 4.75, -50 + Math.cos(a) * 19);
    shelf.rotation.y = a;
    elarionGroup.add(shelf);
  }
  for (let b = 0; b < 12; b++) {
    const bg = new THREE.Group();
    const bp = new THREE.Vector3(Math.sin(b * 0.9) * 11, 4.2 + (b % 3) * 1.4, -49 + Math.cos(b * 0.9) * 11);
    bg.position.copy(bp);
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.16), b % 2 === 0 ? goldMat : cyanCrystalMat);
    bg.add(bk);
    elarionGroup.add(bg);
    elarionFloatingBooks.push({ group: bg, basePos: bp, phase: b * 0.65 });
  }

  // Orvellan — The Last Keeper of Elarion
  const orvellanRig = createOrvellanModel(tex);
  orvellanRig.root.position.copy(CH3_ORVELLAN_POS);
  elarionGroup.add(orvellanRig.root);

  // Archive of Readers (z = -68 to -82): Pillars + Giant Floating Golden Book
  const archiveGroup = new THREE.Group();
  archiveGroup.position.copy(CH3_ARCHIVE_POS);
  for (let p = 0; p < 6; p++) {
    const a = (p / 6) * Math.PI * 2;
    const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 10, 10), stoneMat);
    pil.position.set(Math.cos(a) * 7.8, 5, Math.sin(a) * 7.8);
    archiveGroup.add(pil);
  }
  const archivePedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.3, 0.6, 16), goldMat);
  archivePedestal.position.y = 0.3;
  archiveGroup.add(archivePedestal);

  const archiveBookGroup = new THREE.Group();
  archiveBookGroup.position.set(0, 2.35, 0);
  const pageTex = createArchiveBookPageTexture();
  const archivePageMat = new THREE.MeshStandardMaterial({
    map: pageTex,
    emissive: 0xfde68a,
    emissiveIntensity: 0.25,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });
  const archiveBookLeftPage = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.7), archivePageMat);
  archiveBookLeftPage.position.set(-0.68, 0, 0);
  archiveBookLeftPage.rotation.y = 0.35;
  const archiveBookRightPage = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.7), archivePageMat);
  archiveBookRightPage.position.set(0.68, 0, 0);
  archiveBookRightPage.rotation.y = -0.35;
  const archiveSpine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.75, 0.24), goldMat);
  const archiveLight = new THREE.PointLight(0xffd166, 20, 18, 1.4);
  archiveBookGroup.add(archiveBookLeftPage, archiveBookRightPage, archiveSpine, archiveLight);
  archiveGroup.add(archiveBookGroup);

  const archiveKeyMesh = new THREE.Group();
  archiveKeyMesh.position.set(0, 1.5, 2.2);
  archiveKeyMesh.visible = false;
  archiveGroup.add(archiveKeyMesh);
  elarionGroup.add(archiveGroup);

  // Escape Route Obstacles, Waystone Switches, Bell Keeper Shadow & Falling Dust
  const escapeBarriers: THREE.Mesh[] = [];
  const escapeSwitches: Ch3EscapeSwitch[] = [];
  const barrierZs = [-92, -107];
  const switchSpecs = [
    { id: 'sw_1', barrierIndex: 0, pos: new THREE.Vector3(-7.2, 0, -88) },
    { id: 'sw_2', barrierIndex: 1, pos: new THREE.Vector3(7.2, 0, -103) },
  ];
  barrierZs.forEach((bz) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(20, 5.5, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0xa855f7,
        emissiveIntensity: 0.34,
        transparent: true,
        opacity: 0.78,
      })
    );
    bar.position.set(0, 2.75, bz);
    bar.visible = false;
    elarionGroup.add(bar);
    escapeBarriers.push(bar);
  });
  switchSpecs.forEach((sp) => {
    const g = new THREE.Group();
    g.position.copy(sp.pos);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 1.0, 8), darkStoneMat);
    ped.position.y = 0.5;
    const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), cyanCrystalMat.clone());
    crys.position.y = 1.65;
    const ring = makeCollectRing();
    ring.scale.setScalar(1.4);
    g.add(ped, crys, ring);
    elarionGroup.add(g);
    escapeSwitches.push({
      id: sp.id,
      barrierIndex: sp.barrierIndex,
      position: sp.pos.clone(),
      crystal: crys,
      ring,
      activated: false,
    });
  });

  // Bell Keeper Distant Shadow Figure
  const bellKeeperShadow = new THREE.Group();
  bellKeeperShadow.position.set(0, 0, -112);
  bellKeeperShadow.visible = false;
  const bkBody = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 3.8, 10),
    new THREE.MeshBasicMaterial({ color: 0x05070c })
  );
  bkBody.position.y = 1.9;
  const bkEyes = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.08, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  bkEyes.position.set(0, 2.85, 0.5);
  bellKeeperShadow.add(bkBody, bkEyes);
  elarionGroup.add(bellKeeperShadow);

  const dCount = 180;
  const dPos = new Float32Array(dCount * 3);
  for (let i = 0; i < dCount; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 24;
    dPos[i * 3 + 1] = Math.random() * 14;
    dPos[i * 3 + 2] = -70 - Math.random() * 55;
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const escapeDust = new THREE.Points(
    dGeo,
    new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.2, transparent: true, opacity: 0.55 })
  );
  escapeDust.visible = false;
  elarionGroup.add(escapeDust);

  // Northern Gate (-120)
  const gateGroup = new THREE.Group();
  gateGroup.position.copy(CH3_NORTHERN_GATE_POS);
  [-4.4, 4.4].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8.8, 1.6), darkStoneMat);
    pillar.position.set(px, 4.4, 0);
    gateGroup.add(pillar);
  });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.4, 1.8), darkStoneMat);
  archTop.position.set(0, 8.8, 0);
  gateGroup.add(archTop);

  const gateRunes: THREE.Mesh[] = [];
  for (let r = 0; r < 4; r++) {
    const gr = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xd9a84e, emissiveIntensity: 0.2 })
    );
    gr.position.set(r < 2 ? -4.4 : 4.4, 2.4 + (r % 2) * 3.2, 0.9);
    gateGroup.add(gr);
    gateRunes.push(gr);
  }

  const leftGatePivot = new THREE.Group();
  leftGatePivot.position.set(-3.65, 0, 0);
  const leftGateDoor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.6, 0.32), goldMat);
  leftGateDoor.position.set(1.8, 3.8, 0);
  leftGatePivot.add(leftGateDoor);

  const rightGatePivot = new THREE.Group();
  rightGatePivot.position.set(3.65, 0, 0);
  const rightGateDoor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.6, 0.32), goldMat);
  rightGateDoor.position.set(-1.8, 3.8, 0);
  rightGatePivot.add(rightGateDoor);

  const goldenKeyMesh = new THREE.Group();
  goldenKeyMesh.position.set(0, 2.1, 0.45);
  goldenKeyMesh.visible = false;
  const gkBow = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 18), goldMat);
  gkBow.position.z = 0.25;
  const gkShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.62, 8), goldMat);
  gkShaft.rotation.x = Math.PI / 2;
  goldenKeyMesh.add(gkBow, gkShaft);

  gateGroup.add(leftGatePivot, rightGatePivot, goldenKeyMesh);
  elarionGroup.add(gateGroup);

  // =========================================================================
  // SUB-REALM 5: THE VALLEY OF SILENT BELLS (ACT 10)
  // =========================================================================
  const valleyGroup = new THREE.Group();
  valleyGroup.visible = false;
  group.add(valleyGroup);

  const valleyGround = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 280),
    new THREE.MeshStandardMaterial({ map: tex.grass, color: 0x25494a, roughness: 0.9 })
  );
  valleyGround.rotation.x = -Math.PI / 2;
  valleyGround.position.set(0, 0, -85);
  valleyGroup.add(valleyGround);

  // Silent River & Ancient Bridge
  const silentRiver = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e5c78, roughness: 0.14, metalness: 0.15 })
  );
  silentRiver.rotation.x = -Math.PI / 2;
  silentRiver.position.set(0, 0.05, -50);
  valleyGroup.add(silentRiver);

  const valBridge = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.65, 32), stoneMat);
  valBridge.position.set(0, 0.18, -50);
  valleyGroup.add(valBridge);

  // Massive Surrounding Valley Mountains
  [
    [-85, -140, 48],
    [85, -140, 50],
    [-110, -45, 38],
    [110, -45, 40],
    [0, -210, 62],
  ].forEach(([mx, mz, ms]) => {
    const mt = new THREE.Mesh(new THREE.ConeGeometry(ms * 1.1, ms * 1.6, 8), ridgeMat);
    mt.position.set(mx, ms * 0.55, mz);
    valleyGroup.add(mt);
  });

  // Floating Giant Ancient Bells across the Valley
  const valleyBells: THREE.Group[] = [];
  const bellPositions = [
    [-22, 16, -24],
    [22, 18, -28],
    [-34, 24, -64],
    [34, 22, -68],
    [-16, 20, -90],
    [18, 21, -92],
  ];
  bellPositions.forEach(([bx, by, bz]) => {
    const bp = new THREE.Group();
    bp.position.set(bx, by, bz);
    const bellCone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.4, 14), goldMat);
    const bellRim = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.24, 8, 20), goldMat);
    bellRim.rotation.x = Math.PI / 2;
    bellRim.position.y = -1.6;
    bp.add(bellCone, bellRim);
    valleyGroup.add(bp);
    valleyBells.push(bp);
  });

  // Colossal Tower Made Entirely of Books (CH3_BOOK_TOWER_POS)
  const bookTowerGroup = new THREE.Group();
  bookTowerGroup.position.copy(CH3_BOOK_TOWER_POS);
  const bookColors = [0x6b2f24, 0x244c6b, 0x5c4724, 0x3b2c5c, 0x275447];
  for (let tier = 0; tier < 14; tier++) {
    const w = 14 - tier * 0.62;
    const h = 3.2 - tier * 0.08;
    const d = 11 - tier * 0.45;
    const bookBlock = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: bookColors[tier % bookColors.length], roughness: 0.72 })
    );
    bookBlock.position.y = tier * 2.8 + h * 0.5;
    bookBlock.rotation.y = (tier % 2 === 0 ? 1 : -1) * 0.14 * (tier % 3);
    const pagesStrip = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.92, h * 0.72, d * 0.94),
      new THREE.MeshStandardMaterial({ color: 0xf4e4c2, emissive: 0xd9a84e, emissiveIntensity: 0.28 })
    );
    pagesStrip.position.copy(bookBlock.position);
    pagesStrip.rotation.copy(bookBlock.rotation);
    bookTowerGroup.add(bookBlock, pagesStrip);
  }
  const towerBeacon = new THREE.PointLight(0xffd166, 60, 120, 1.3);
  towerBeacon.position.set(0, 42, 12);
  bookTowerGroup.add(towerBeacon);
  valleyGroup.add(bookTowerGroup);

  // Observation Markers for Chapter 3 (activated via V)
  const obsSpecs: { id: string; label: string; subZone: Ch3SubZone; anchor: THREE.Vector3 }[] = [
    { id: 'footprints', label: 'Glowing Footprints', subZone: 'surface', anchor: new THREE.Vector3(-2.0, 0.3, 14.5) },
    { id: 'woods_sign', label: 'Whispering Woods', subZone: 'surface', anchor: CH3_SIGN_POS.clone().add(new THREE.Vector3(0, 1.8, 0)) },
    { id: 'lumi', label: 'Lumi · Forest Guardian', subZone: 'surface', anchor: CH3_LUMI_POS.clone().add(new THREE.Vector3(0, 1.5, 0)) },
    { id: 'stones_altar', label: 'Three Memory Stones', subZone: 'surface', anchor: CH3_STONES_PLATFORM_POS.clone().add(new THREE.Vector3(0, 2.2, 0)) },
    { id: 'statue', label: 'Broken Wizard Statue', subZone: 'elarion', anchor: CH3_STATUE_POS.clone().add(new THREE.Vector3(0, 4.0, 0)) },
    { id: 'orvellan', label: 'Ancient Library · Orvellan', subZone: 'elarion', anchor: CH3_ORVELLAN_POS.clone().add(new THREE.Vector3(0, 2.0, 0)) },
    { id: 'north_gate', label: 'Northern Gate', subZone: 'elarion', anchor: CH3_NORTHERN_GATE_POS.clone().add(new THREE.Vector3(0, 3.0, 0)) },
  ];
  const observationAnchors = obsSpecs.map((o) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.25, 24),
      new THREE.MeshBasicMaterial({
        color: 0x72efdd,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(o.anchor.x, 0.12, o.anchor.z);
    ring.visible = false;
    (o.subZone === 'elarion' ? elarionGroup : surfaceGroup).add(ring);
    return { ...o, ring };
  });

  return {
    group,
    tunnelGroup,
    houseInteriorGroup,
    surfaceGroup,
    elarionGroup,
    valleyGroup,
    tunnelRings,
    tunnelPages,
    tunnelBuildings,
    tunnelShadow,
    clockHourHand,
    clockMinuteHand,
    interiorDoorPivot,
    interiorSunbeam,
    skyDome,
    exteriorDoorPivot,
    letterEnvelopeGroup,
    letterGoldenSymbol,
    letterHighlight,
    footprintMeshes,
    collectibles,
    fragments,
    lumiRig,
    memoryStones,
    platformRunes,
    stairTrapdoor,
    hiddenStairGroup,
    swayTrees,
    ambientMotes,
    elarionInspectables,
    memoryVisionGroup,
    memoryShadowCloud,
    memoryCitizens,
    elarionFloatingBooks,
    orvellanRig,
    archiveBookGroup,
    archiveBookLeftPage,
    archiveBookRightPage,
    archiveKeyMesh,
    escapeLights,
    escapeBarriers,
    escapeSwitches,
    bellKeeperShadow,
    escapeDust,
    leftGatePivot,
    rightGatePivot,
    gateRunes,
    goldenKeyMesh,
    valleyBells,
    bookTowerGroup,
    observationAnchors,
  };
}
