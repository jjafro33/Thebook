import * as THREE from 'three';
import {
  createPeliconWarriorModel,
  createTownCitizenModel,
  type PeliconWarriorRig,
  type TownCitizenRig,
} from './models';
import type { ProceduralTextures } from './textures';
import type { Ch4StoryFlags, Ch4SubZone } from './types';

// --- Key Spatial Anchors across Chapter 4 (Pelicon Desert & Castle) ---
export const CH4_DESERT_SPAWN = new THREE.Vector3(0, 0, 122);
export const CH4_WOUNDED_WARRIOR_POS = new THREE.Vector3(2.2, 0, 108);
export const CH4_DROPPED_SWORD_POS = new THREE.Vector3(1.1, 0, 108.9);

// Combat Zones along -Z road
export const CH4_WALL_ZONE_Z = 76; // Area 1: Desert Wall (z ~ 90..62)
export const CH4_FIRE_BOW_POS = new THREE.Vector3(-6.2, 0, 50);
export const CH4_MARKET_ZONE_Z = 24; // Area 2: Abandoned Market (z ~ 44..2)
export const CH4_ARCANE_BOW_POS = new THREE.Vector3(6.2, 0, -6);
export const CH4_ROAD_ZONE_Z = -42; // Area 3: Castle Road (z ~ -12..-68)

// Castle Exterior Courtyard & Gates
export const CH4_COURTYARD_POS = new THREE.Vector3(0, 0, -80);
export const CH4_CASTLE_DOOR_POS = new THREE.Vector3(0, 0.3, -95.2);
export const CH4_BALCONY_EITA_POS = new THREE.Vector3(0, 9.6, -93.4);

// Pelicon Town Celebration & Desert Outskirts (West avenue from Courtyard)
export const CH4_TOWN_GATE_POS = new THREE.Vector3(-23.5, 0, -88);
export const CH4_TOWN_PLAZA_POS = new THREE.Vector3(-52, 0, -94);
export const CH4_OUTSKIRTS_POS = new THREE.Vector3(-82, 0, -98);
export const CH4_AGNES_CHURCH_POS = new THREE.Vector3(-156, 3.2, -126);

// Castle Interior (subZone: 'castle_interior')
export const CH4_CASTLE_INTERIOR_SPAWN = new THREE.Vector3(0, 0, 18.5);
export const CH4_CASTLE_EXIT_DOOR_POS = new THREE.Vector3(0, 0, 22.0);
export const CH4_EITA_DOOR_POS = new THREE.Vector3(0, 3.8, -22.8);
export const CH4_EITA_ROOM_POS = new THREE.Vector3(0, 3.8, -29.8);
export const CH4_SHELF_POS = new THREE.Vector3(4.1, 3.8, -28.2);
export const CH4_JOURNAL_POS = new THREE.Vector3(-3.6, 3.8, -26.8);

export interface Ch4ObservationAnchor {
  id: string;
  label: string;
  position: THREE.Vector3;
}

export interface Chapter4WorldObjects {
  group: THREE.Group;
  tunnelGroup: THREE.Group;
  desertGroup: THREE.Group;
  castleInteriorGroup: THREE.Group;

  // Opening Book -> Desert Tunnel pieces
  openingBookGroup: THREE.Group;
  openingPageLeft: THREE.Mesh;
  openingPageRight: THREE.Mesh;
  openingBell: THREE.Group;
  openingCrystal: THREE.Mesh;
  tunnelRings: THREE.Mesh[];
  tunnelPages: THREE.Mesh[];
  tunnelDunes: THREE.Mesh[];
  tunnelEitaSilhouette: THREE.Group;

  // Desert Battlefield dynamic nodes
  skyDome: THREE.Mesh;
  desertBirds: { mesh: THREE.Group; center: THREE.Vector3; radius: number; speed: number; phase: number }[];
  desertClouds: THREE.Group[];
  smokePlumes: THREE.Mesh[];
  sandParticles: THREE.Points;

  droppedSwordGroup: THREE.Group;
  fireBowPickupGroup: THREE.Group;
  fireBowOrb: THREE.Mesh;
  arcaneBowPickupGroup: THREE.Group;
  arcaneBowOrb: THREE.Mesh;

  victoryBannerMesh: THREE.Mesh;
  castleGateLeft: THREE.Group;
  castleGateRight: THREE.Group;
  balconyHeartParticles: THREE.Points;

  // Town celebration + Outskirts
  townGroup: THREE.Group;
  townCitizens: { rig: TownCitizenRig; phase: number; cheering: boolean }[];
  outskirtsSymbolGroup: THREE.Group;
  agnesChurchGroup: THREE.Group;

  // Castle Interior
  eitaRoomDoorPivot: THREE.Group;
  castleExitDoorPivot: THREE.Group;
  curtainLeft: THREE.Mesh;
  curtainRight: THREE.Mesh;
  chandeliers: THREE.Group[];
  guardLeft: PeliconWarriorRig;
  guardRight: PeliconWarriorRig;
  journalPickupMesh: THREE.Group;
  magicAwakenFloorRing: THREE.Mesh;
  magicAwakenPillars: THREE.Group;

  observationAnchors: {
    desert: Ch4ObservationAnchor[];
    castle_interior: Ch4ObservationAnchor[];
  };

  setSubZoneVisible: (zone: Ch4SubZone) => void;
  updateVisuals: (time: number, dt: number, flags: Ch4StoryFlags, subZone: Ch4SubZone) => void;
  dispose: () => void;
}

export function getCh4DesertTerrainHeight(x: number, z: number): number {
  // Keep main battlefield road, courtyard, town avenue & outskirts walkable and smooth
  const roadFlatten = Math.exp(-Math.pow(x / 18, 4));
  const townCorridor =
    z < -68 && z > -122 && x <= 10 && x >= -96
      ? Math.exp(-Math.pow((z + 92) / 19, 4))
      : 0;
  const flatFactor = Math.max(roadFlatten, townCorridor);
  const rawDune =
    Math.sin(x * 0.045) * 2.1 +
    Math.cos(z * 0.04) * 1.9 +
    Math.sin((x + z) * 0.025) * 2.6;
  const sideRise = Math.max(0, Math.abs(x) - 24) * 0.16 * (1 - townCorridor);
  return Math.max(-0.4, rawDune * (1 - flatFactor * 0.92) + sideRise);
}

export function getCh4WalkSurface(
  x: number,
  z: number,
  subZone: Ch4SubZone,
  _flags: Ch4StoryFlags
): number {
  if (subZone === 'tunnel') return 0;
  if (subZone === 'castle_interior') {
    // Ground floor: z >= 3.5 -> y = 0
    // Grand Staircase: z from 3.5 down to -11.5 -> rises smoothly from 0 to 3.8
    // Upper Gallery & Princess Eita Room: z <= -11.5 -> y = 3.8
    if (z >= 3.5) return 0;
    if (z <= -11.5) return 3.8;
    const t = (3.5 - z) / 15.0;
    return THREE.MathUtils.clamp(t, 0, 1) * 3.8;
  }
  return getCh4DesertTerrainHeight(x, z);
}

export function clampToCh4Bounds(
  pos: THREE.Vector3,
  subZone: Ch4SubZone,
  flags: Ch4StoryFlags
): void {
  if (subZone === 'tunnel') {
    pos.x = THREE.MathUtils.clamp(pos.x, -4, 4);
    pos.z = THREE.MathUtils.clamp(pos.z, -4, 4);
    return;
  }
  if (subZone === 'castle_interior') {
    // Ground hall width [-10.5, 10.5]; Staircase [-4.5, 4.5]; Bedroom [-6.4, 6.4]
    if (pos.z > 3.5) {
      pos.x = THREE.MathUtils.clamp(pos.x, -10.5, 10.5);
    } else if (pos.z > -12) {
      pos.x = THREE.MathUtils.clamp(pos.x, -4.4, 4.4);
    } else if (pos.z > -22.5) {
      pos.x = THREE.MathUtils.clamp(pos.x, -7.2, 7.2);
    } else {
      pos.x = THREE.MathUtils.clamp(pos.x, -6.2, 6.2);
    }
    const minZ = flags.eitaRoomEntered ? -36.5 : -22.2;
    pos.z = THREE.MathUtils.clamp(pos.z, minZ, 21.8);
    // Keep bedroom doorway narrow when closed
    if (pos.z < -21.8 && pos.z > -24.2 && !flags.eitaRoomEntered) {
      pos.z = -21.8;
    }
    return;
  }

  // Desert zone bounds
  // Prevent skipping Desert Wall before Area 1 cleared? Allow wall arch at [-4.5, 4.5]
  if (pos.z < 77 && pos.z > 73 && Math.abs(pos.x) > 4.2) {
    pos.x = Math.sign(pos.x) * 4.2;
  }
  // West Town Gate opens after castleEscaped
  if (pos.z <= -68 && pos.z >= -114 && pos.x < -21 && flags.castleEscaped) {
    pos.x = THREE.MathUtils.clamp(pos.x, -92, 22);
    pos.z = THREE.MathUtils.clamp(pos.z, -110, -70);
  } else {
    pos.x = THREE.MathUtils.clamp(pos.x, -21, 21);
    pos.z = THREE.MathUtils.clamp(pos.z, -94.2, 132);
  }
}

export function createChapter4World(tex: ProceduralTextures): Chapter4WorldObjects {
  const group = new THREE.Group();

  const tunnelGroup = new THREE.Group();
  const desertGroup = new THREE.Group();
  const castleInteriorGroup = new THREE.Group();
  group.add(tunnelGroup, desertGroup, castleInteriorGroup);

  const sandMat = new THREE.MeshStandardMaterial({
    map: tex.desertSand,
    normalMap: tex.desertSandNormal,
    color: 0xeabf7a,
    roughness: 0.88,
    metalness: 0.04,
  });
  const sandstoneMat = new THREE.MeshStandardMaterial({
    map: tex.sandstone,
    normalMap: tex.ashlarStoneNormal,
    normalScale: new THREE.Vector2(0.75, 0.75),
    color: 0xd9a86c,
    roughness: 0.8,
    metalness: 0.06,
  });
  const ashlarTrimMat = new THREE.MeshStandardMaterial({
    map: tex.ashlarStone,
    normalMap: tex.ashlarStoneNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0xc2b29b,
    roughness: 0.72,
    metalness: 0.08,
  });
  const darkStoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    color: 0x7a6552,
    roughness: 0.85,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.mahoganyWood,
    normalMap: tex.woodNormal,
    color: 0x7a4b2a,
    roughness: 0.68,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xebb948,
    metalness: 0.78,
    roughness: 0.25,
  });
  const marbleMat = new THREE.MeshStandardMaterial({
    map: tex.palaceMarble,
    color: 0xfdf6e9,
    roughness: 0.34,
    metalness: 0.08,
  });
  const peliconBannerMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const kingBannerMat = new THREE.MeshStandardMaterial({
    color: 0x881337,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const roseClothMat = new THREE.MeshStandardMaterial({
    color: 0xf4a9bc,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });

  // =========================================================================
  // 1. TUNNEL SUB-ZONE (Valley of Silent Bells -> Golden Book Portal)
  // =========================================================================
  const bellDais = new THREE.Mesh(new THREE.CylinderGeometry(8, 9.5, 0.7, 24), darkStoneMat);
  bellDais.position.y = -0.35;
  tunnelGroup.add(bellDais);

  const openingCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.48,
      roughness: 0.14,
    })
  );
  openingCrystal.position.set(-1.8, 1.5, -2.5);
  tunnelGroup.add(openingCrystal);

  const towerSilhouette = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 5.2, 34, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  towerSilhouette.position.set(0, 16, -34);
  tunnelGroup.add(towerSilhouette);

  const openingBell = new THREE.Group();
  openingBell.position.set(0, 7.2, -9);
  const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.85, 2.5, 18, 1, true), goldMat);
  const bellRim = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.14, 10, 24), goldMat);
  bellRim.rotation.x = Math.PI / 2;
  bellRim.position.y = -1.25;
  openingBell.add(bellBody, bellRim);
  tunnelGroup.add(openingBell);

  const openingBookGroup = new THREE.Group();
  openingBookGroup.position.set(0, 1.75, -3.2);
  const coverMat = new THREE.MeshStandardMaterial({
    color: 0x7c2d12,
    emissive: 0xd97706,
    emissiveIntensity: 0.22,
  });
  const goldenPageMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.34,
    side: THREE.DoubleSide,
  });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 1.15), goldMat);
  const openingPageLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.08), goldenPageMat);
  openingPageLeft.rotation.x = -Math.PI / 2;
  openingPageLeft.position.set(-0.42, 0.05, 0);
  const openingPageRight = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.08), goldenPageMat);
  openingPageRight.rotation.x = -Math.PI / 2;
  openingPageRight.position.set(0.42, 0.05, 0);
  const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 1.18), coverMat);
  const bookGlow = new THREE.PointLight(0xfbbf24, 14, 18, 1.4);
  bookGlow.position.y = 0.6;
  openingBookGroup.add(spine, coverMesh, openingPageLeft, openingPageRight, bookGlow);
  tunnelGroup.add(openingBookGroup);

  const tunnelRings: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(4.2 + (i % 3) * 0.45, 0.075, 8, 32),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfbbf24 : 0x38bdf8,
        transparent: true,
        opacity: 0.42,
      })
    );
    ring.position.set(0, 1.6, -4 - i * 4.5);
    tunnelRings.push(ring);
    tunnelGroup.add(ring);
  }

  const tunnelPages: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.88),
      new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      })
    );
    const angle = (i / 16) * Math.PI * 2;
    p.position.set(Math.cos(angle) * 3.1, 1.8 + Math.sin(angle) * 1.8, -6 - i * 2.2);
    tunnelPages.push(p);
    tunnelGroup.add(p);
  }

  const tunnelDunes: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const dune = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 1.9, 6),
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0x92400e,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.65,
      })
    );
    dune.position.set((i % 2 === 0 ? -1 : 1) * 4.2, 0.8 + (i % 3) * 0.9, -12 - i * 6);
    tunnelDunes.push(dune);
    tunnelGroup.add(dune);
  }

  const tunnelEitaSilhouette = new THREE.Group();
  const silMat = new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.75 });
  const silBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.42, 1.4, 12), silMat);
  const silHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), silMat);
  silHead.position.y = 0.92;
  tunnelEitaSilhouette.add(silBody, silHead);
  tunnelEitaSilhouette.position.set(0, 2.2, -26);
  tunnelGroup.add(tunnelEitaSilhouette);

  // =========================================================================
  // 2. PELICON DESERT BATTLEFIELD, CASTLE EXTERIOR & TOWN
  // =========================================================================
  // Sunset Desert Sky Dome
  const skyGeo = new THREE.SphereGeometry(340, 24, 16);
  const skyColors = new Float32Array(skyGeo.attributes.position.count * 3);
  const posAttr = skyGeo.attributes.position;
  const cZenith = new THREE.Color(0x1e2952);
  const cMid = new THREE.Color(0xc2543a);
  const cHorizon = new THREE.Color(0xf7b05b);
  for (let i = 0; i < posAttr.count; i++) {
    const y = THREE.MathUtils.clamp((posAttr.getY(i) + 20) / 340, 0, 1);
    const col =
      y < 0.28
        ? cHorizon.clone().lerp(cMid, y / 0.28)
        : cMid.clone().lerp(cZenith, (y - 0.28) / 0.72);
    skyColors[i * 3] = col.r;
    skyColors[i * 3 + 1] = col.g;
    skyColors[i * 3 + 2] = col.b;
  }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColors, 3));
  const skyDome = new THREE.Mesh(
    skyGeo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })
  );
  desertGroup.add(skyDome);

  // Glowing sunset sun disc on western horizon
  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(22, 32),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  sunDisc.position.set(-220, 48, -140);
  sunDisc.lookAt(0, 0, 0);
  desertGroup.add(sunDisc);

  // Sculpted Pelicon Desert Ground Mesh
  const groundGeo = new THREE.PlaneGeometry(340, 340, 110, 110);
  groundGeo.rotateX(-Math.PI / 2);
  const gPos = groundGeo.attributes.position;
  for (let i = 0; i < gPos.count; i++) {
    const vx = gPos.getX(i);
    const vz = gPos.getZ(i);
    gPos.setY(i, getCh4DesertTerrainHeight(vx, vz));
  }
  groundGeo.computeVertexNormals();
  const desertGround = new THREE.Mesh(groundGeo, sandMat);
  desertGround.receiveShadow = true;
  desertGroup.add(desertGround);

  // Flagstone road from Market through Courtyard into Town
  for (let rz = 56; rz >= -86; rz -= 4.2) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.14, 3.6), sandstoneMat);
    slab.position.set(0, getCh4DesertTerrainHeight(0, rz) + 0.04, rz);
    slab.receiveShadow = true;
    desertGroup.add(slab);
  }
  for (let rx = -10; rx >= -84; rx -= 4.2) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 8.2), sandstoneMat);
    slab.position.set(rx, getCh4DesertTerrainHeight(rx, -92) + 0.04, -92);
    slab.receiveShadow = true;
    desertGroup.add(slab);
  }

  // Rocky Desert Mountains around perimeter
  const mountainSpots: [number, number, number, number][] = [
    [-75, 95, 28, 34],
    [68, 88, 24, 30],
    [-82, 20, 30, 38],
    [76, 12, 28, 36],
    [72, -62, 26, 32],
    [45, -135, 32, 42],
    [-125, -40, 34, 44],
    [-145, -165, 36, 46],
    [0, -165, 38, 48],
  ];
  mountainSpots.forEach(([mx, mz, rad, h]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 7), darkStoneMat);
    m.position.set(mx, h * 0.42, mz);
    m.rotation.y = mx * 0.1;
    m.castShadow = true;
    desertGroup.add(m);
  });

  // Desert vegetation (cacti & dry desert palms along flanks)
  const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.75 });
  const palmLocations: [number, number][] = [
    [-14, 114],
    [15, 98],
    [-15, 62],
    [16, 42],
    [-15, 16],
    [15, -18],
    [-17, -54],
    [17, -64],
    [-34, -84],
    [-64, -102],
  ];
  palmLocations.forEach(([px, pz]) => {
    const palm = new THREE.Group();
    const py = getCh4DesertTerrainHeight(px, pz);
    palm.position.set(px, py, pz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 4.4, 8), woodMat);
    trunk.position.y = 2.2;
    trunk.rotation.z = Math.sin(px) * 0.08;
    palm.add(trunk);
    for (let f = 0; f < 5; f++) {
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.2, 5), palmLeafMat);
      frond.position.set(0, 4.3, 0);
      frond.rotation.z = 1.15;
      frond.rotation.y = (f / 5) * Math.PI * 2;
      palm.add(frond);
    }
    desertGroup.add(palm);
  });

  // --- Area 1: Ancient Desert Wall & Watchtowers (z ~ 75) ---
  const wallY = getCh4DesertTerrainHeight(0, 75);
  [-13.5, 13.5].forEach((wx) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(18, 6.2, 2.4), sandstoneMat);
    wall.position.set(wx, wallY + 3.0, 75);
    wall.castShadow = true;
    wall.receiveShadow = true;
    desertGroup.add(wall);

    // Watchtower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.4, 9.8, 4.4), sandstoneMat);
    tower.position.set(wx * 1.15, wallY + 4.8, 75);
    tower.castShadow = true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.4, 4), woodMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(wx * 1.15, wallY + 10.8, 75);
    desertGroup.add(tower, roof);
  });

  // Torn Kingdom Banners along the battlefield
  const createFieldBanner = (x: number, z: number, mat: THREE.Material) => {
    const by = getCh4DesertTerrainHeight(x, z);
    const g = new THREE.Group();
    g.position.set(x, by, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8), woodMat);
    pole.position.y = 2.25;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.8), mat);
    cloth.position.set(0.56, 3.3, 0);
    g.add(pole, cloth);
    desertGroup.add(g);
  };
  createFieldBanner(-8.5, 102, peliconBannerMat);
  createFieldBanner(9.0, 84, kingBannerMat);
  createFieldBanner(-9.5, 42, kingBannerMat);
  createFieldBanner(9.5, 10, kingBannerMat);
  createFieldBanner(-10, -34, kingBannerMat);
  createFieldBanner(10, -56, peliconBannerMat);

  // Protective Wooden Barricades & Crates
  const addBarricade = (x: number, z: number, rotY = 0) => {
    const by = getCh4DesertTerrainHeight(x, z);
    const bar = new THREE.Group();
    bar.position.set(x, by, z);
    bar.rotation.y = rotY;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 0.45), woodMat);
    plank.position.y = 0.6;
    plank.castShadow = true;
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), woodMat);
    crate.position.set(1.1, 0.48, 0.55);
    bar.add(plank, crate);
    desertGroup.add(bar);
  };
  addBarricade(-5.5, 92, 0.25);
  addBarricade(6.0, 82, -0.3);
  addBarricade(-6.2, 30, 0.2);
  addBarricade(5.8, 12, -0.22);
  addBarricade(-5.8, -28, 0.18);
  addBarricade(6.0, -48, -0.2);

  // --- Area 2: Abandoned Market (Stalls, Tents, Barrels, Lanterns) ---
  const addMarketStall = (x: number, z: number, color: number, rotY: number) => {
    const my = getCh4DesertTerrainHeight(x, z);
    const stall = new THREE.Group();
    stall.position.set(x, my, z);
    stall.rotation.y = rotY;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 1.4), woodMat);
    counter.position.y = 0.5;
    counter.castShadow = true;
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8);
    [-1.5, 1.5].forEach((px) => {
      const p1 = new THREE.Mesh(postGeo, woodMat);
      p1.position.set(px, 1.4, -0.6);
      const p2 = new THREE.Mesh(postGeo, woodMat);
      p2.position.set(px, 1.4, 0.6);
      stall.add(p1, p2);
    });
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.14, 2.0),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
    );
    awning.position.set(0, 2.75, 0);
    awning.rotation.x = 0.14;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.85, 10), woodMat);
    barrel.position.set(2.1, 0.42, 0.2);
    stall.add(counter, awning, barrel);
    desertGroup.add(stall);
  };
  addMarketStall(-10.5, 36, 0xb91c1c, 0.35);
  addMarketStall(10.5, 32, 0xd97706, -0.4);
  addMarketStall(-11, 18, 0x0f766e, 0.25);
  addMarketStall(10.8, 16, 0x7c2d12, -0.25);

  // --- Collectible Dropped Sword, Magical Fire Bow Shrine & Arcane Burst Bow Altar ---
  const droppedSwordGroup = new THREE.Group();
  droppedSwordGroup.position.copy(CH4_DROPPED_SWORD_POS);
  droppedSwordGroup.position.y = getCh4DesertTerrainHeight(CH4_DROPPED_SWORD_POS.x, CH4_DROPPED_SWORD_POS.z) + 0.18;
  const dBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.95, 0.028),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.88, roughness: 0.18 })
  );
  dBlade.rotation.z = Math.PI / 2 - 0.15;
  const dHilt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), goldMat);
  dHilt.position.set(-0.42, 0.06, 0);
  const swordRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.75, 24),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  swordRing.rotation.x = -Math.PI / 2;
  swordRing.position.y = -0.1;
  droppedSwordGroup.add(dBlade, dHilt, swordRing);
  desertGroup.add(droppedSwordGroup);

  const fireBowPickupGroup = new THREE.Group();
  fireBowPickupGroup.position.set(
    CH4_FIRE_BOW_POS.x,
    getCh4DesertTerrainHeight(CH4_FIRE_BOW_POS.x, CH4_FIRE_BOW_POS.z),
    CH4_FIRE_BOW_POS.z
  );
  const firePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 1.0, 12), sandstoneMat);
  firePedestal.position.y = 0.5;
  const fireBowOrb = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.05, 8, 18, Math.PI * 1.15),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xea580c,
      emissiveIntensity: 0.42,
      metalness: 0.7,
    })
  );
  fireBowOrb.position.y = 1.65;
  fireBowOrb.rotation.z = -Math.PI * 0.58;
  const fireLight = new THREE.PointLight(0xf97316, 8, 12, 1.5);
  fireLight.position.y = 1.8;
  fireBowPickupGroup.add(firePedestal, fireBowOrb, fireLight);
  desertGroup.add(fireBowPickupGroup);

  const arcaneBowPickupGroup = new THREE.Group();
  arcaneBowPickupGroup.position.set(
    CH4_ARCANE_BOW_POS.x,
    getCh4DesertTerrainHeight(CH4_ARCANE_BOW_POS.x, CH4_ARCANE_BOW_POS.z),
    CH4_ARCANE_BOW_POS.z
  );
  const arcPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.95, 1.0, 12), darkStoneMat);
  arcPedestal.position.y = 0.5;
  const arcaneBowOrb = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.055, 8, 18, Math.PI * 1.15),
    new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 0.46,
      metalness: 0.75,
    })
  );
  arcaneBowOrb.position.y = 1.65;
  arcaneBowOrb.rotation.z = -Math.PI * 0.58;
  const arcLight = new THREE.PointLight(0xa855f7, 10, 12, 1.5);
  arcLight.position.y = 1.8;
  arcaneBowPickupGroup.add(arcPedestal, arcaneBowOrb, arcLight);
  desertGroup.add(arcaneBowPickupGroup);

  // --- Pelicon Royal Castle Exterior & Upper Balcony ---
  const castleY = getCh4DesertTerrainHeight(0, -106);
  const castleExt = new THREE.Group();
  castleExt.position.set(0, castleY, -106);

  const keepBody = new THREE.Mesh(new THREE.BoxGeometry(34, 18, 22), sandstoneMat);
  keepBody.position.y = 9;
  keepBody.castShadow = true;
  keepBody.receiveShadow = true;
  castleExt.add(keepBody);

  // Carved stone cornice, rooftop battlements / crenellations & arched leaded facade windows
  const keepCornice = new THREE.Mesh(new THREE.BoxGeometry(34.8, 0.75, 22.8), ashlarTrimMat);
  keepCornice.position.y = 18.0;
  castleExt.add(keepCornice);
  for (let mx = -14; mx <= 14; mx += 3.5) {
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.45, 0.95), ashlarTrimMat);
    merlon.position.set(mx, 19.05, 10.95);
    merlon.castShadow = true;
    castleExt.add(merlon);
  }
  const facadeGlassMat = new THREE.MeshStandardMaterial({
    map: tex.arcaneGlass,
    color: 0xdbeafe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.14,
    roughness: 0.25,
  });
  [-9.5, -5.5, 5.5, 9.5].forEach((wx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.4, 0.45), ashlarTrimMat);
    frame.position.set(wx, 11.2, 11.05);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 3.8), facadeGlassMat);
    pane.position.set(wx, 11.2, 11.3);
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.85, 0.14), ashlarTrimMat);
    mullion.position.set(wx, 11.2, 11.34);
    castleExt.add(frame, pane, mullion);
  });

  // Twin grand corner towers & central spire
  [-16, 16].forEach((tx) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 26, 14), sandstoneMat);
    tower.position.set(tx, 13, 8);
    tower.castShadow = true;
    const towerCollar = new THREE.Mesh(new THREE.CylinderGeometry(4.65, 4.65, 0.9, 14), ashlarTrimMat);
    towerCollar.position.set(tx, 25.4, 8);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), goldMat);
    dome.position.set(tx, 26, 8);
    castleExt.add(tower, towerCollar, dome);
  });
  const centralDome = new THREE.Mesh(new THREE.SphereGeometry(6.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), goldMat);
  centralDome.position.set(0, 18, 0);
  castleExt.add(centralDome);

  // Hoistable Pelicon Victory Banner
  const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 14, 8), goldMat);
  flagMast.position.set(0, 25, 4);
  const victoryBannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.8), peliconBannerMat);
  victoryBannerMesh.position.set(2.3, 21.5, 4);
  castleExt.add(flagMast, victoryBannerMesh);

  // Swinging Castle Gates
  const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(8.4, 7.2, 2.2), goldMat);
  gateFrame.position.set(0, 3.6, 10.6);
  castleExt.add(gateFrame);

  const castleGateLeft = new THREE.Group();
  castleGateLeft.position.set(-3.2, 0, 11.2);
  const gLeftPanel = new THREE.Mesh(new THREE.BoxGeometry(3.15, 6.4, 0.4), woodMat);
  gLeftPanel.position.set(1.58, 3.2, 0);
  castleGateLeft.add(gLeftPanel);

  const castleGateRight = new THREE.Group();
  castleGateRight.position.set(3.2, 0, 11.2);
  const gRightPanel = new THREE.Mesh(new THREE.BoxGeometry(3.15, 6.4, 0.4), woodMat);
  gRightPanel.position.set(-1.58, 3.2, 0);
  castleGateRight.add(gRightPanel);
  castleExt.add(castleGateLeft, castleGateRight);

  // Princess Eita's Upper Royal Balcony
  const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.5, 3.8), marbleMat);
  balconySlab.position.set(0, 9.35, 12.2);
  const balconyRail = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.0, 0.25), goldMat);
  balconyRail.position.set(0, 10.1, 13.95);
  const balconyArch = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.2, 0.6), darkStoneMat);
  balconyArch.position.set(0, 11.8, 10.9);
  castleExt.add(balconySlab, balconyRail, balconyArch);

  // Subtle heart-shaped / rose-gold magical particles around Balcony Eita
  const heartCount = 24;
  const heartPos = new Float32Array(heartCount * 3);
  for (let i = 0; i < heartCount; i++) {
    const t = (i / heartCount) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3) * 0.065;
    const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.065;
    heartPos[i * 3] = hx;
    heartPos[i * 3 + 1] = hy;
    heartPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  const heartGeo = new THREE.BufferGeometry();
  heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPos, 3));
  const balconyHeartParticles = new THREE.Points(
    heartGeo,
    new THREE.PointsMaterial({ color: 0xf472b6, size: 0.22, transparent: true, opacity: 0.0 })
  );
  balconyHeartParticles.position.set(0, 11.2, 13.4);
  castleExt.add(balconyHeartParticles);
  desertGroup.add(castleExt);

  // --- Ambient Desert Life (Birds, Clouds, Smoke, Sandstorm Dust) ---
  const desertBirds: Chapter4WorldObjects['desertBirds'] = [];
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x292524, side: THREE.DoubleSide });
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Group();
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.2), birdMat);
    lw.position.x = -0.32;
    lw.rotation.z = 0.25;
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.2), birdMat);
    rw.position.x = 0.32;
    rw.rotation.z = -0.25;
    b.add(lw, rw);
    desertGroup.add(b);
    desertBirds.push({
      mesh: b,
      center: new THREE.Vector3((i % 2 === 0 ? -18 : 18), 22 + (i % 3) * 5, 40 - i * 24),
      radius: 14 + i * 2.5,
      speed: 0.35 + (i % 3) * 0.12,
      phase: i * 1.1,
    });
  }

  const desertClouds: THREE.Group[] = [];
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfed7aa, transparent: true, opacity: 0.65 });
  for (let i = 0; i < 7; i++) {
    const c = new THREE.Group();
    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(4 + p * 1.5, 10, 8), cloudMat);
      puff.scale.set(1.8, 0.55, 1.1);
      puff.position.set((p - 1) * 4.5, (p % 2) * 1.2, 0);
      c.add(puff);
    }
    c.position.set(-90 + i * 32, 46 + (i % 2) * 8, -50 - i * 14);
    desertClouds.push(c);
    desertGroup.add(c);
  }

  const smokePlumes: THREE.Mesh[] = [];
  const smokeMat = new THREE.MeshBasicMaterial({ color: 0x57534e, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(4.5, 22, 8), smokeMat);
    s.position.set(28 + i * 9, 10, 80 - i * 26);
    smokePlumes.push(s);
    desertGroup.add(s);
  }

  const sandCount = 450;
  const sandArr = new Float32Array(sandCount * 3);
  for (let i = 0; i < sandCount; i++) {
    sandArr[i * 3] = (Math.random() - 0.5) * 120;
    sandArr[i * 3 + 1] = Math.random() * 14 + 0.3;
    sandArr[i * 3 + 2] = (Math.random() - 0.5) * 240;
  }
  const sandGeo = new THREE.BufferGeometry();
  sandGeo.setAttribute('position', new THREE.BufferAttribute(sandArr, 3));
  const sandParticles = new THREE.Points(
    sandGeo,
    new THREE.PointsMaterial({ color: 0xfde68a, size: 0.24, transparent: true, opacity: 0.55 })
  );
  desertGroup.add(sandParticles);

  // --- Pelicon Celebrating Town + Desert Outskirts + Agnes's Church ---
  const townGroup = new THREE.Group();
  desertGroup.add(townGroup);

  const townBuildings: [number, number, number, number, number][] = [
    [-34, -82, 7, 5.5, 6],
    [-48, -80, 8, 6.2, 6],
    [-64, -81, 7, 5.4, 6],
    [-38, -104, 7.5, 5.8, 6],
    [-56, -105, 8.5, 6.8, 6],
    [-70, -104, 7, 5.5, 6],
  ];
  townBuildings.forEach(([bx, bz, bw, bh, bd]) => {
    const by = getCh4DesertTerrainHeight(bx, bz);
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), sandstoneMat);
    b.position.set(bx, by + bh * 0.5, bz);
    b.castShadow = true;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.3, 0.35, bd + 0.3), goldMat);
    trim.position.set(bx, by + bh + 0.15, bz);
    townGroup.add(b, trim);
  });

  // Reopened Town Market Stalls & Festive Lantern Strings
  addMarketStall(-44, -86, 0x0f766e, 0.05);
  addMarketStall(-60, -86, 0xe11d48, -0.05);
  for (let lx = -30; lx >= -76; lx -= 7.5) {
    const ly = getCh4DesertTerrainHeight(lx, -92);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), woodMat);
    post.position.set(lx, ly + 2.1, -87.5);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lantern.position.set(lx, ly + 4.1, -87.5);
    townGroup.add(post, lantern);
  }

  // Celebrating Citizens, Musicians & Children
  const townCitizens: Chapter4WorldObjects['townCitizens'] = [];
  const citizenSpecs: { x: number; z: number; yaw: number; child?: boolean; color: number; prop: 'flag' | 'lute' | 'drum' | 'none' }[] = [
    { x: -34, z: -88, yaw: 0.4, color: 0x0f766e, prop: 'flag' },
    { x: -41, z: -96, yaw: -0.3, color: 0xd97706, prop: 'flag' },
    { x: -47, z: -87.5, yaw: 0.2, child: true, color: 0xf43f5e, prop: 'none' },
    { x: -53, z: -97, yaw: 0.1, color: 0x2563eb, prop: 'lute' },
    { x: -57, z: -88, yaw: -0.25, color: 0x9333ea, prop: 'drum' },
    { x: -64, z: -96, yaw: 0.35, child: true, color: 0x10b981, prop: 'flag' },
    { x: -69, z: -89, yaw: -0.2, color: 0xea580c, prop: 'none' },
  ];
  citizenSpecs.forEach((spec, idx) => {
    const rig = createTownCitizenModel(tex, {
      child: spec.child,
      tunicColor: spec.color,
      prop: spec.prop,
    });
    rig.root.position.set(spec.x, getCh4DesertTerrainHeight(spec.x, spec.z), spec.z);
    rig.root.rotation.y = spec.yaw;
    townGroup.add(rig.root);
    townCitizens.push({ rig, phase: idx * 0.9, cheering: spec.prop !== 'lute' && spec.prop !== 'drum' });
  });

  // Distant Agnes's Church Silhouette + Twilight Sky Symbol
  const agnesChurchGroup = new THREE.Group();
  agnesChurchGroup.position.copy(CH4_AGNES_CHURCH_POS);
  const churchMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
  const nave = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 16), churchMat);
  nave.position.y = 4.5;
  const steeple = new THREE.Mesh(new THREE.BoxGeometry(4.2, 18, 4.2), churchMat);
  steeple.position.set(0, 12, 4);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(3.2, 10, 4), churchMat);
  spire.rotation.y = Math.PI / 4;
  spire.position.set(0, 26, 4);
  const roseWindow = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 16),
    new THREE.MeshBasicMaterial({ color: 0xfde047 })
  );
  roseWindow.position.set(0, 13, 6.2);
  agnesChurchGroup.add(nave, steeple, spire, roseWindow);
  desertGroup.add(agnesChurchGroup);

  const outskirtsSymbolGroup = new THREE.Group();
  outskirtsSymbolGroup.position.set(CH4_AGNES_CHURCH_POS.x + 10, 38, CH4_AGNES_CHURCH_POS.z + 10);
  const skyRingOuter = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.28, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 })
  );
  const skyStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(3.2, 0),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
  );
  outskirtsSymbolGroup.add(skyRingOuter, skyStar);
  outskirtsSymbolGroup.visible = false;
  desertGroup.add(outskirtsSymbolGroup);

  // =========================================================================
  // 3. PELICON CASTLE INTERIOR (Marble Hall, Staircase & Princess Eita Room)
  // =========================================================================
  // Ground floor marble (z: 22 -> 3.5)
  const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 21), marbleMat);
  hallFloor.position.set(0, -0.2, 13);
  hallFloor.receiveShadow = true;
  castleInteriorGroup.add(hallFloor);

  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x9d174d, roughness: 0.65 });
  const hallCarpet = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, 18), carpetMat);
  hallCarpet.position.set(0, 0.02, 13);
  castleInteriorGroup.add(hallCarpet);

  // Grand Marble Staircase (z: 3.5 -> -11.5, climbing y: 0 -> 3.8)
  const stepCount = 16;
  for (let s = 0; s < stepCount; s++) {
    const t = (s + 0.5) / stepCount;
    const sy = t * 3.8;
    const sz = 3.5 - t * 15.0;
    const step = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, 1.05), marbleMat);
    step.position.set(0, sy - 0.15, sz);
    step.receiveShadow = true;
    castleInteriorGroup.add(step);
  }
  [-4.5, 4.5].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 15.6), goldMat);
    rail.position.set(rx, 2.68, -4);
    rail.rotation.x = Math.atan2(3.8, 15);
    castleInteriorGroup.add(rail);
    for (let b = 0; b <= 8; b++) {
      const bt = b / 8;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.9, 8), marbleMat);
      post.position.set(rx, bt * 3.8 + 0.45, 3.5 - bt * 15.0);
      castleInteriorGroup.add(post);
    }
  });

  // Upper Gallery & Princess Eita Room Floor (z: -11.5 -> -38, y = 3.8)
  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 27), marbleMat);
  upperFloor.position.set(0, 3.6, -24.8);
  upperFloor.receiveShadow = true;
  castleInteriorGroup.add(upperFloor);

  // Castle Interior Walls, Carved Marble Pilasters & Framed Royal Paintings
  const leftHallWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 62), sandstoneMat);
  leftHallWall.position.set(-11.4, 5.8, -8);
  const rightHallWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 62), sandstoneMat);
  rightHallWall.position.set(11.4, 5.8, -8);
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(24, 0.6, 62), marbleMat);
  ceiling.position.set(0, 11.8, -8);
  castleInteriorGroup.add(leftHallWall, rightHallWall, ceiling);

  [-8, 0, 8, 16].forEach((pz, idx) => {
    [-10.9, 10.9].forEach((px) => {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.45, 11.4, 0.85), ashlarTrimMat);
      pilaster.position.set(px, 5.7, pz);
      castleInteriorGroup.add(pilaster);
    });
    if (idx < 3) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.4, 1.75), goldMat);
      frame.position.set(-10.92, 4.6, pz - 4);
      const canvas = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.0, 1.38),
        new THREE.MeshStandardMaterial({ color: idx % 2 === 0 ? 0x1d4ed8 : 0x0f766e, roughness: 0.65 })
      );
      canvas.position.set(-10.85, 4.6, pz - 4);
      castleInteriorGroup.add(frame, canvas);
    }
  });

  // Bedroom walls + doorway around z = -22.8
  [-4.8, 4.8].forEach((wx) => {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(6.8, 7.6, 0.6), marbleMat);
    seg.position.set(wx, 7.6, -22.8);
    castleInteriorGroup.add(seg);
  });
  const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 0.6), goldMat);
  doorHeader.position.set(0, 9.3, -22.8);
  castleInteriorGroup.add(doorHeader);

  const eitaRoomDoorPivot = new THREE.Group();
  eitaRoomDoorPivot.position.set(-1.3, 3.8, -22.8);
  const eitaDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 0.24), woodMat);
  eitaDoorLeaf.position.set(1.3, 1.7, 0);
  const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), goldMat);
  doorHandle.position.set(2.3, 1.5, 0.16);
  eitaRoomDoorPivot.add(eitaDoorLeaf, doorHandle);
  castleInteriorGroup.add(eitaRoomDoorPivot);

  // Main Exit Door at z = 22.4
  const southWallLeft = new THREE.Mesh(new THREE.BoxGeometry(9.6, 12, 0.8), sandstoneMat);
  southWallLeft.position.set(-6.8, 5.8, 22.8);
  const southWallRight = new THREE.Mesh(new THREE.BoxGeometry(9.6, 12, 0.8), sandstoneMat);
  southWallRight.position.set(6.8, 5.8, 22.8);
  const castleExitDoorPivot = new THREE.Group();
  castleExitDoorPivot.position.set(-2.0, 0, 22.5);
  const exitLeaf = new THREE.Mesh(new THREE.BoxGeometry(4.0, 5.4, 0.32), woodMat);
  exitLeaf.position.set(2.0, 2.7, 0);
  castleExitDoorPivot.add(exitLeaf);
  castleInteriorGroup.add(southWallLeft, southWallRight, castleExitDoorPivot);

  // Columns with capitals & Chandeliers
  const chandeliers: THREE.Group[] = [];
  for (let cz = 16; cz >= -16; cz -= 16) {
    [-6.2, 6.2].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 11.4, 12), marbleMat);
      col.position.set(cx, 5.7, cz);
      const colCap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 1.3), goldMat);
      colCap.position.set(cx, 11.2, cz);
      castleInteriorGroup.add(col, colCap);
    });
    const chand = new THREE.Group();
    chand.position.set(0, 10.6, cz);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 24), goldMat);
    ring.rotation.x = Math.PI / 2;
    const cLight = new THREE.PointLight(0xfde68a, 11, 22, 1.4);
    chand.add(ring, cLight);
    chandeliers.push(chand);
    castleInteriorGroup.add(chand);
  }

  // Two Warriors standing outside Princess Eita's Door
  const guardLeft = createPeliconWarriorModel(tex, 'ally');
  guardLeft.root.position.set(-2.4, 3.8, -21.2);
  const guardRight = createPeliconWarriorModel(tex, 'ally');
  guardRight.root.position.set(2.4, 3.8, -21.2);
  castleInteriorGroup.add(guardLeft.root, guardRight.root);

  // --- Princess Eita's Bedroom Interior (z: -23.5 -> -37.5, y: 3.8) ---
  const roomRug = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.04, 24), roseClothMat);
  roomRug.position.set(0, 3.82, -30.0);
  castleInteriorGroup.add(roomRug);

  // Royal Bed
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 3.4), woodMat);
  bedFrame.position.set(-4.1, 4.18, -31.5);
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 3.1), marbleMat);
  mattress.position.set(-4.1, 4.72, -31.5);
  const pinkBlanket = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.38, 2.1), roseClothMat);
  pinkBlanket.position.set(-4.1, 4.74, -30.95);
  castleInteriorGroup.add(bedFrame, mattress, pinkBlanket);

  // Bookshelf (at CH4_SHELF_POS where Sneh rolls!)
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.2, 2.8), woodMat);
  shelf.position.set(CH4_SHELF_POS.x + 0.5, CH4_SHELF_POS.y + 1.6, CH4_SHELF_POS.z);
  castleInteriorGroup.add(shelf);
  for (let b = 0; b < 8; b++) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.42, 0.16),
      new THREE.MeshStandardMaterial({ color: b % 2 === 0 ? 0xf472b6 : 0xf59e0b })
    );
    book.position.set(CH4_SHELF_POS.x + 0.2, CH4_SHELF_POS.y + 1.35 + (b > 3 ? 0.9 : 0), CH4_SHELF_POS.z - 0.8 + (b % 4) * 0.45);
    castleInteriorGroup.add(book);
  }

  // Writing Desk + Eita's Story Journal
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 2.2), woodMat);
  desk.position.set(CH4_JOURNAL_POS.x - 0.2, CH4_JOURNAL_POS.y + 0.45, CH4_JOURNAL_POS.z);
  const journalPickupMesh = new THREE.Group();
  journalPickupMesh.position.set(CH4_JOURNAL_POS.x, CH4_JOURNAL_POS.y + 0.96, CH4_JOURNAL_POS.z);
  const jCover = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.2 })
  );
  journalPickupMesh.add(jCover);
  castleInteriorGroup.add(desk, journalPickupMesh);

  // Large Sunset Desert Balcony Window + Moving Curtains
  const northWindowWall = new THREE.Mesh(new THREE.BoxGeometry(16, 7.8, 0.6), marbleMat);
  northWindowWall.position.set(0, 7.6, -37.8);
  const sunsetWindowPane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 4.4),
    new THREE.MeshBasicMaterial({ color: 0xfb923c })
  );
  sunsetWindowPane.position.set(0, 7.2, -37.4);
  const curtainLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 5.2), roseClothMat);
  curtainLeft.position.set(-2.3, 7.1, -37.2);
  const curtainRight = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 5.2), roseClothMat);
  curtainRight.position.set(2.3, 7.1, -37.2);
  const roomWarmLight = new THREE.PointLight(0xfbbf24, 16, 18, 1.4);
  roomWarmLight.position.set(0, 8.2, -30);
  castleInteriorGroup.add(northWindowWall, sunsetWindowPane, curtainLeft, curtainRight, roomWarmLight);

  // Act 9 Golden Magic Awakening Floor Ring & Swirling Pillars
  const magicAwakenFloorRing = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.9, 32),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  magicAwakenFloorRing.rotation.x = -Math.PI / 2;
  magicAwakenFloorRing.position.set(0, 3.85, -30);
  const magicAwakenPillars = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xfbbf24 : 0x38bdf8, transparent: true, opacity: 0.75 })
    );
    beam.position.set(Math.cos(a) * 1.65, 5.6, -30 + Math.sin(a) * 1.65);
    magicAwakenPillars.add(beam);
  }
  magicAwakenPillars.visible = false;
  castleInteriorGroup.add(magicAwakenFloorRing, magicAwakenPillars);

  const setSubZoneVisible = (zone: Ch4SubZone) => {
    tunnelGroup.visible = zone === 'tunnel';
    desertGroup.visible = zone === 'desert';
    castleInteriorGroup.visible = zone === 'castle_interior';
  };

  const updateVisuals = (time: number, dt: number, flags: Ch4StoryFlags, subZone: Ch4SubZone) => {
    if (subZone === 'tunnel') {
      openingBell.rotation.z = Math.sin(time * 3.8) * 0.16;
      openingCrystal.rotation.y = time * 1.5;
      openingBookGroup.position.y = 1.75 + Math.sin(time * 2.2) * 0.14;
      openingPageLeft.rotation.z = 0.28 + Math.sin(time * 6) * 0.12;
      openingPageRight.rotation.z = -0.28 - Math.sin(time * 6) * 0.12;
      tunnelRings.forEach((r, idx) => {
        r.rotation.z = time * (0.4 + idx * 0.07) * (idx % 2 === 0 ? 1 : -1);
      });
      tunnelPages.forEach((p, idx) => {
        p.rotation.x = time * 1.8 + idx;
        p.rotation.y = time * 1.2 + idx * 0.6;
      });
      tunnelEitaSilhouette.position.y = 2.2 + Math.sin(time * 1.8) * 0.25;
      return;
    }

    if (subZone === 'castle_interior') {
      // Curtain wind animation (stronger during Golden Magic Awakening!)
      const breeze = flags.powerAwakened ? 0.28 : 0.07;
      curtainLeft.rotation.z = Math.sin(time * 3.2) * breeze;
      curtainRight.rotation.z = -Math.cos(time * 3.0) * breeze;
      chandeliers.forEach((c, i) => {
        c.rotation.y = Math.sin(time * 0.4 + i) * 0.04;
      });
      // Door animations
      const targetEitaDoor = flags.eitaRoomEntered ? Math.PI * 0.48 : 0;
      eitaRoomDoorPivot.rotation.y += (targetEitaDoor - eitaRoomDoorPivot.rotation.y) * Math.min(1, dt * 6);
      const targetExitDoor = flags.castleEscaped ? Math.PI * 0.5 : 0;
      castleExitDoorPivot.rotation.y += (targetExitDoor - castleExitDoorPivot.rotation.y) * Math.min(1, dt * 5);

      if (flags.powerAwakened) {
        magicAwakenFloorRing.rotation.z = time * 1.8;
        magicAwakenPillars.rotation.y = -time * 1.4;
      }
      return;
    }

    // Desert Visual Updates
    droppedSwordGroup.visible = !flags.swordCollected;
    if (droppedSwordGroup.visible) {
      dBlade.position.y = Math.sin(time * 3) * 0.05;
    }

    fireBowPickupGroup.visible = !flags.fireBowCollected;
    if (fireBowPickupGroup.visible) {
      fireBowOrb.rotation.y = time * 1.4;
      fireBowOrb.position.y = 1.65 + Math.sin(time * 2.5) * 0.12;
    }

    arcaneBowPickupGroup.visible = flags.marketCleared && !flags.arcaneBowUnlocked;
    if (arcaneBowPickupGroup.visible) {
      arcaneBowOrb.rotation.y = -time * 1.6;
      arcaneBowOrb.position.y = 1.65 + Math.sin(time * 2.8) * 0.12;
    }

    // Victory Banner & Castle Gates
    const targetBannerY = flags.victoryAchieved ? 29.8 : 21.5;
    victoryBannerMesh.position.y += (targetBannerY - victoryBannerMesh.position.y) * Math.min(1, dt * 2.2);
    const targetGateAngle = flags.victoryAchieved ? Math.PI * 0.46 : 0;
    castleGateLeft.rotation.y += (-targetGateAngle - castleGateLeft.rotation.y) * Math.min(1, dt * 2.4);
    castleGateRight.rotation.y += (targetGateAngle - castleGateRight.rotation.y) * Math.min(1, dt * 2.4);

    // Balcony Heart Particles (subtle glow during Act 6)
    const heartMat = balconyHeartParticles.material as THREE.PointsMaterial;
    const wantHearts = flags.balconyEitaSeen && !flags.castleEntered ? 0.85 : 0.0;
    heartMat.opacity += (wantHearts - heartMat.opacity) * Math.min(1, dt * 3);
    balconyHeartParticles.position.y = 11.2 + Math.sin(time * 2.2) * 0.2;

    // Town Celebration visibility & citizens
    townGroup.visible = flags.castleEscaped || flags.townCelebrated;
    if (townGroup.visible) {
      for (const c of townCitizens) {
        c.rig.leftArm.rotation.x = c.cheering ? -2.0 + Math.sin(time * 6 + c.phase) * 0.3 : -0.4;
        c.rig.rightArm.rotation.x = c.cheering ? -2.0 + Math.cos(time * 6 + c.phase) * 0.3 : -0.5;
        c.rig.bodyPivot.position.y = c.cheering ? Math.abs(Math.sin(time * 5 + c.phase)) * 0.1 : 0;
      }
    }

    // Desert Outskirts Twilight Symbol
    outskirtsSymbolGroup.visible = flags.outskirtsReached;
    if (outskirtsSymbolGroup.visible) {
      skyRingOuter.rotation.z = time * 0.35;
      skyStar.rotation.y = -time * 0.65;
    }

    // Birds, clouds, sandstorms
    for (const b of desertBirds) {
      const ang = time * b.speed + b.phase;
      b.mesh.position.set(
        b.center.x + Math.cos(ang) * b.radius,
        b.center.y + Math.sin(ang * 2) * 1.4,
        b.center.z + Math.sin(ang) * b.radius
      );
      b.mesh.rotation.y = -ang;
    }
    for (const c of desertClouds) {
      c.position.x += dt * 1.1;
      if (c.position.x > 130) c.position.x = -130;
    }
    const posArr = sandParticles.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posArr.count; i++) {
      let sx = posArr.getX(i) + dt * 9.5;
      if (sx > 60) sx = -60;
      posArr.setX(i, sx);
    }
    posArr.needsUpdate = true;
  };

  const observationAnchors: Chapter4WorldObjects['observationAnchors'] = {
    desert: [
      { id: 'obs_wall', label: 'Desert Outer Wall', position: new THREE.Vector3(0, 3, 75) },
      { id: 'obs_market', label: 'Abandoned Desert Market', position: new THREE.Vector3(0, 2, 26) },
      { id: 'obs_castle', label: 'Pelicon Royal Castle', position: new THREE.Vector3(0, 12, -106) },
      { id: 'obs_church', label: "Distant Agnes's Church", position: CH4_AGNES_CHURCH_POS.clone() },
    ],
    castle_interior: [
      { id: 'obs_stairs', label: 'Grand Marble Staircase', position: new THREE.Vector3(0, 2.5, -4) },
      { id: 'obs_eita_door', label: "Princess Eita's Door", position: CH4_EITA_DOOR_POS.clone() },
      { id: 'obs_window', label: 'Desert Sunset Window', position: new THREE.Vector3(0, 7.2, -37) },
    ],
  };

  const dispose = () => {
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).geometry.dispose();
      }
    });
  };

  return {
    group,
    tunnelGroup,
    desertGroup,
    castleInteriorGroup,
    openingBookGroup,
    openingPageLeft,
    openingPageRight,
    openingBell,
    openingCrystal,
    tunnelRings,
    tunnelPages,
    tunnelDunes,
    tunnelEitaSilhouette,
    skyDome,
    desertBirds,
    desertClouds,
    smokePlumes,
    sandParticles,
    droppedSwordGroup,
    fireBowPickupGroup,
    fireBowOrb,
    arcaneBowPickupGroup,
    arcaneBowOrb,
    victoryBannerMesh,
    castleGateLeft,
    castleGateRight,
    balconyHeartParticles,
    townGroup,
    townCitizens,
    outskirtsSymbolGroup,
    agnesChurchGroup,
    eitaRoomDoorPivot,
    castleExitDoorPivot,
    curtainLeft,
    curtainRight,
    chandeliers,
    guardLeft,
    guardRight,
    journalPickupMesh,
    magicAwakenFloorRing,
    magicAwakenPillars,
    observationAnchors,
    setSubZoneVisible,
    updateVisuals,
    dispose,
  };
}
