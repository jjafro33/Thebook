import * as THREE from 'three';
import type { ProceduralTextures } from './textures';
import {
  BROOK_CURVE,
  BRIDGE_U_POSITIONS,
  getBrookDistance,
  getTerrainHeight,
  JOURNEY_CURVE,
  LIBRARY_ENTRANCE_DIR,
  LIBRARY_PLAZA_POS,
} from './worldPath';
import {
  createCottageModel,
  createEnchLibraryExterior,
  createNpcModel,
  createWoodenBridgeModel,
} from './models';

export interface VillageWorldObjects {
  group: THREE.Group;
  skyDome: THREE.Mesh;
  brookMesh: THREE.Mesh;
  brookUniforms: { uTime: { value: number } };
  waterfallUniforms: { uTime: { value: number } };
  waterwheels: THREE.Group[];
  banners: THREE.Mesh[];
  grassMesh: THREE.InstancedMesh;
  grassUniforms: { uTime: { value: number } };
  motherNpc: ReturnType<typeof createNpcModel>;
  motherPos: THREE.Vector3;
  libraryExterior: ReturnType<typeof createEnchLibraryExterior>;
  libraryBeaconRing: THREE.Mesh;
  objectiveBeam: THREE.Mesh;
  pathMarkers: THREE.Mesh[];
}

export function createBrookVillageWorld(tex: ProceduralTextures): VillageWorldObjects {
  const group = new THREE.Group();

  // 0. Panoramic Sky Dome mapped with real high-res fantasy sky artwork
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(480, 32, 20),
    new THREE.MeshBasicMaterial({
      map: tex.skyVillage,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    })
  );
  group.add(skyDome);

  // 1. Expansive Sculpted Valley Terrain with Real Meadow Grass + Normal + Roughness
  const terrainGeo = new THREE.PlaneGeometry(360, 1180, 160, 520);
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, 0, -470);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setY(i, getTerrainHeight(x, z));
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    map: tex.grass,
    normalMap: tex.grassNormal,
    normalScale: new THREE.Vector2(0.75, 0.75),
    roughnessMap: tex.grassRoughness,
    color: 0xa2d472,
    roughness: 0.86,
    metalness: 0.02,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.receiveShadow = true;
  group.add(terrain);

  // 2. Guided Cobblestone Road Ribbon with Real Mossy Cobble + Normal + Wet Rainy Roughness
  const roadSegs = 460;
  const roadWidth = 4.6;
  const roadPositions: number[] = [];
  const roadUvs: number[] = [];
  const roadIndices: number[] = [];
  const roadSkip: boolean[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3();
  const bridgeCenters = BRIDGE_U_POSITIONS.map((bu) => JOURNEY_CURVE.getPointAt(bu));

  for (let i = 0; i <= roadSegs; i++) {
    const u = i / roadSegs;
    const pt = JOURNEY_CURVE.getPointAt(u);
    const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();

    const lx = pt.x - side.x * (roadWidth * 0.5);
    const lz = pt.z - side.z * (roadWidth * 0.5);
    const rx = pt.x + side.x * (roadWidth * 0.5);
    const rz = pt.z + side.z * (roadWidth * 0.5);

    const ly = getTerrainHeight(lx, lz) + 0.04;
    const ry = getTerrainHeight(rx, rz) + 0.04;

    roadPositions.push(lx, ly, lz, rx, ry, rz);
    roadUvs.push(0, u, 1, u);

    const nearBridge = bridgeCenters.some(
      (bc) => Math.hypot(pt.x - bc.x, pt.z - bc.z) < 7.6
    );
    roadSkip.push(nearBridge);
  }
  for (let i = 0; i < roadSegs; i++) {
    if (roadSkip[i] && roadSkip[i + 1]) continue;
    const base = i * 2;
    roadIndices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }
  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
  roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
  roadGeo.setIndex(roadIndices);
  roadGeo.computeVertexNormals();
  const roadMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    normalScale: new THREE.Vector2(1.05, 1.05),
    roughnessMap: tex.cobbleRoughness,
    color: 0xd7bea0,
    roughness: 0.74,
    metalness: 0.06,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // 3. Flowing River / Brook Ribbon & Pebbled Riverbed (passes visibly under both bridges)
  const brookSegs = 360;
  const brookWidth = 13.0;
  const bedWidth = 10.6;
  const bPos: number[] = [];
  const bUv: number[] = [];
  const bIdx: number[] = [];
  const bedPos: number[] = [];
  const bedUv: number[] = [];
  for (let i = 0; i <= brookSegs; i++) {
    const u = i / brookSegs;
    const pt = BROOK_CURVE.getPointAt(u);
    const tan = BROOK_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    bPos.push(
      pt.x - side.x * (brookWidth * 0.5),
      pt.y,
      pt.z - side.z * (brookWidth * 0.5),
      pt.x + side.x * (brookWidth * 0.5),
      pt.y,
      pt.z + side.z * (brookWidth * 0.5)
    );
    bUv.push(0, u * 54, 1, u * 54);

    bedPos.push(
      pt.x - side.x * (bedWidth * 0.5),
      pt.y - 1.25,
      pt.z - side.z * (bedWidth * 0.5),
      pt.x + side.x * (bedWidth * 0.5),
      pt.y - 1.25,
      pt.z + side.z * (bedWidth * 0.5)
    );
    bedUv.push(0, u * 48, 1, u * 48);

    if (i < brookSegs) {
      const base = i * 2;
      bIdx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const bedGeo = new THREE.BufferGeometry();
  bedGeo.setAttribute('position', new THREE.Float32BufferAttribute(bedPos, 3));
  bedGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bedUv, 2));
  bedGeo.setIndex(bIdx);
  bedGeo.computeVertexNormals();
  const riverBedMesh = new THREE.Mesh(
    bedGeo,
    new THREE.MeshStandardMaterial({
      map: tex.cobble,
      normalMap: tex.cobbleNormal,
      color: 0x5c5b4a,
      roughness: 0.92,
      metalness: 0.04,
    })
  );
  riverBedMesh.receiveShadow = true;
  group.add(riverBedMesh);

  const brookGeo = new THREE.BufferGeometry();
  brookGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
  brookGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bUv, 2));
  brookGeo.setIndex(bIdx);
  brookGeo.computeVertexNormals();

  const brookUniforms = { uTime: { value: 0 } };
  const brookMat = new THREE.MeshPhysicalMaterial({
    map: tex.water,
    normalMap: tex.waterNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x4fc3e0,
    emissive: 0x0b3c4d,
    emissiveIntensity: 0.14,
    roughness: 0.06,
    metalness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.84,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  brookMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = brookUniforms.uTime;
    shader.vertexShader =
      `uniform float uTime;\nvarying vec3 vBrookPos;\nvarying vec2 vBrookUv;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vBrookPos = position;
        vBrookUv = uv;
        transformed.y += sin(position.z * 0.85 + uTime * 3.1) * 0.045 + cos(position.x * 1.15 + uTime * 2.5) * 0.03;`
      );
    shader.fragmentShader =
      `uniform float uTime;\nvarying vec3 vBrookPos;\nvarying vec2 vBrookUv;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float bankEdge = abs(vBrookUv.x - 0.5) * 2.0;
        float foamEdge = smoothstep(0.78, 0.99, bankEdge);
        float ripple = sin(vBrookUv.y * 5.0 - uTime * 4.2 + sin(vBrookUv.x * 14.0) * 1.4);
        float streak = smoothstep(0.45, 0.95, ripple);
        diffuseColor.rgb += vec3(0.16, 0.28, 0.34) * streak;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.96, 1.0), foamEdge * (0.28 + 0.15 * streak));`
      );
  };
  const brookMesh = new THREE.Mesh(brookGeo, brookMat);
  brookMesh.receiveShadow = true;
  brookMesh.renderOrder = 2;
  group.add(brookMesh);

  // 4. Two Wooden Bridges Seated Flush on the Riverbanks Over the Flowing River
  BRIDGE_U_POSITIONS.forEach((bu) => {
    const bp = JOURNEY_CURVE.getPointAt(bu);
    const bt = JOURNEY_CURVE.getTangentAt(bu).normalize();
    const bridge = createWoodenBridgeModel(tex);
    bridge.position.set(bp.x, bp.y, bp.z);
    bridge.rotation.y = Math.atan2(bt.x, bt.z);
    group.add(bridge);
  });

  // 5. Nateleon's Cozy Fantasy Cottage (matching the Cozy Fantasy Cottage Asset Showcase)
  const homeGroup = new THREE.Group();
  homeGroup.position.set(0, 0, 5.2);
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: tex.woodRoughness,
    color: 0xb97a46,
    roughness: 0.72,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    color: 0x6f4323,
    roughness: 0.78,
  });
  const plasterMat = new THREE.MeshStandardMaterial({
    map: tex.plaster,
    color: 0xeadac0,
    roughness: 0.86,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: tex.roofTerracotta,
    normalMap: tex.roofTerracottaNormal,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughness: 0.62,
    metalness: 0.05,
  });
  const roofSlateMat = new THREE.MeshStandardMaterial({ map: tex.roofSlate, roughness: 0.75 });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    normalScale: new THREE.Vector2(0.9, 0.9),
    color: 0x928b80,
    roughness: 0.88,
  });
  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffd57a,
    emissive: 0xff9f2e,
    emissiveIntensity: 0.34,
    roughness: 0.25,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d33,
    roughness: 0.35,
    metalness: 0.85,
  });

  // Ground wooden floor & cobblestone foundation plinth
  const homeFloor = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.25, 7.8), woodMat);
  homeFloor.position.y = 0.05;
  homeFloor.receiveShadow = true;
  homeGroup.add(homeFloor);

  // Perimeter stone foundation plinth keeping interior wooden floor unobstructed
  [
    [0, 0.22, 3.9, 8.9, 0.44, 0.55],
    [-4.2, 0.22, 0, 0.55, 0.44, 8.3],
    [4.2, 0.22, 0, 0.55, 0.44, 8.3],
    [-2.75, 0.22, -3.9, 3.4, 0.44, 0.55],
    [2.75, 0.22, -3.9, 3.4, 0.44, 0.55],
  ].forEach(([px, py, pz, w, h, d]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat);
    p.position.set(px, py, pz);
    p.castShadow = true;
    p.receiveShadow = true;
    homeGroup.add(p);
  });

  // Main Cream Plaster Walls (leaving clean centered arched doorway at z = -3.9, x = -0.95..0.95)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8.4, 4.35, 0.36), plasterMat);
  backWall.position.set(0, 2.35, 3.72);
  backWall.castShadow = true;
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.35, 7.8), plasterMat);
  leftWall.position.set(-4.02, 2.35, 0);
  leftWall.castShadow = true;
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.35, 7.8), plasterMat);
  rightWall.position.set(4.02, 2.35, 0);
  rightWall.castShadow = true;
  const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(3.15, 4.35, 0.36), plasterMat);
  frontLeft.position.set(-2.62, 2.35, -3.72);
  frontLeft.castShadow = true;
  const frontRight = new THREE.Mesh(new THREE.BoxGeometry(3.15, 4.35, 0.36), plasterMat);
  frontRight.position.set(2.62, 2.35, -3.72);
  frontRight.castShadow = true;
  const frontTop = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.95, 0.36), plasterMat);
  frontTop.position.set(0, 3.55, -3.72);
  homeGroup.add(backWall, leftWall, rightWall, frontLeft, frontRight, frontTop);

  // Front & Back Triangular Cream Plaster Gables (filling under the steep pitched roof)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-4.18, 0);
  gableShape.lineTo(0, 3.45);
  gableShape.lineTo(4.18, 0);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.34, bevelEnabled: false });
  const frontGable = new THREE.Mesh(gableGeo, plasterMat);
  frontGable.position.set(0, 4.45, -3.88);
  const backGable = new THREE.Mesh(gableGeo, plasterMat);
  backGable.position.set(0, 4.45, 3.55);
  homeGroup.add(frontGable, backGable);

  // Heavy Oak Timber Corner Posts, Horizontal Belt Beams & Gable Framing
  [
    [-4.12, -3.82],
    [4.12, -3.82],
    [-4.12, 3.82],
    [4.12, 3.82],
    [-1.12, -3.84],
    [1.12, -3.84],
  ].forEach(([bx, bz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.5, 0.32), darkWoodMat);
    post.position.set(bx, 2.35, bz);
    post.castShadow = true;
    homeGroup.add(post);
  });
  // Horizontal floor-divider timber belt beam wrapping all 4 walls
  [
    [0, 2.65, -3.85, 8.65, 0.28, 0.26],
    [0, 2.65, 3.85, 8.65, 0.28, 0.26],
    [-4.15, 2.65, 0, 0.26, 0.28, 8.05],
    [4.15, 2.65, 0, 0.26, 0.28, 8.05],
    [0, 4.48, -3.88, 8.7, 0.28, 0.28],
    [0, 4.48, 3.88, 8.7, 0.28, 0.28],
  ].forEach(([tx, ty, tz, w, h, d]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkWoodMat);
    beam.position.set(tx, ty, tz);
    beam.castShadow = true;
    homeGroup.add(beam);
  });

  // Steep Terracotta-Red Main Roof Slopes + Overhanging Timber Rafters + Ridge Beam
  const slopeAngle = Math.atan2(3.85, 5.1);
  const slopeLen = Math.hypot(3.85, 5.1);
  [-1, 1].forEach((sideSign) => {
    const roofSlope = new THREE.Mesh(
      new THREE.BoxGeometry(slopeLen, 0.32, 9.2),
      roofMat
    );
    roofSlope.position.set(sideSign * 2.45, 6.12, 0);
    roofSlope.rotation.z = -sideSign * slopeAngle;
    roofSlope.castShadow = true;
    roofSlope.receiveShadow = true;
    homeGroup.add(roofSlope);

    // Timber gable bargeboard trim at front & back
    [-4.45, 4.45].forEach((bz) => {
      const barge = new THREE.Mesh(new THREE.BoxGeometry(slopeLen + 0.1, 0.26, 0.24), darkWoodMat);
      barge.position.set(sideSign * 2.45, 6.08, bz);
      barge.rotation.z = -sideSign * slopeAngle;
      homeGroup.add(barge);
    });
  });
  const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 9.5), woodMat);
  ridgeBeam.position.set(0, 7.98, 0);
  ridgeBeam.castShadow = true;
  homeGroup.add(ridgeBeam);

  // Right-Side Perpendicular Terracotta Wing (+X side, matching the showcase cottage!)
  const wingWalls = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.45, 4.2), plasterMat);
  wingWalls.position.set(5.1, 1.9, 0.1);
  wingWalls.castShadow = true;
  const wingPlinth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.44, 4.45), stoneMat);
  wingPlinth.position.set(5.1, 0.22, 0.1);
  const wingBelt = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.24, 4.35), darkWoodMat);
  wingBelt.position.set(5.1, 2.65, 0.1);
  homeGroup.add(wingWalls, wingPlinth, wingBelt);

  const wGableShape = new THREE.Shape();
  wGableShape.moveTo(-2.15, 0);
  wGableShape.lineTo(0, 1.95);
  wGableShape.lineTo(2.15, 0);
  wGableShape.closePath();
  const wingGable = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wGableShape, { depth: 0.3, bevelEnabled: false }),
    plasterMat
  );
  wingGable.rotation.y = Math.PI / 2;
  wingGable.position.set(6.15, 3.55, 0.1);
  homeGroup.add(wingGable);

  const wSlopeAng = Math.atan2(2.1, 2.6);
  const wSlopeLen = Math.hypot(2.1, 2.6);
  [-1, 1].forEach((zSign) => {
    const wSlope = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, wSlopeLen), roofMat);
    wSlope.position.set(5.1, 4.55, 0.1 + zSign * 1.25);
    wSlope.rotation.x = zSign * wSlopeAng;
    wSlope.castShadow = true;
    homeGroup.add(wSlope);
  });
  const wingRidge = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.32, 0.34), woodMat);
  wingRidge.position.set(5.1, 5.56, 0.1);
  homeGroup.add(wingRidge);

  // Round attic window on the side wing gable
  const roundWinFrame = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 8, 16), darkWoodMat);
  roundWinFrame.rotation.y = Math.PI / 2;
  roundWinFrame.position.set(6.46, 4.38, 0.1);
  const roundWinGlow = new THREE.Mesh(new THREE.CircleGeometry(0.38, 14), windowGlowMat);
  roundWinGlow.rotation.y = Math.PI / 2;
  roundWinGlow.position.set(6.47, 4.38, 0.1);
  homeGroup.add(roundWinFrame, roundWinGlow);

  // Pitched Roof Dormer Window jutting proudly out of the right front terracotta roof slope
  const dormerGroup = new THREE.Group();
  dormerGroup.position.set(2.55, 6.28, -1.65);
  const dormerBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.35, 1.65), plasterMat);
  dormerBox.castShadow = true;
  const dormerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 1.02), darkWoodMat);
  dormerFrame.position.set(0.74, -0.02, 0);
  const dormerGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.88), windowGlowMat);
  dormerGlow.rotation.y = Math.PI / 2;
  dormerGlow.position.set(0.79, -0.02, 0);
  const dMullionV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), darkWoodMat);
  dMullionV.position.set(0.8, -0.02, 0);
  const dMullionH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.86), darkWoodMat);
  dMullionH.position.set(0.8, -0.02, 0);
  const dRoofAng = Math.atan2(0.75, 0.95);
  [-1, 1].forEach((ds) => {
    const dr = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.2, 1.2), roofMat);
    dr.position.set(0.06, 0.88, ds * 0.45);
    dr.rotation.x = ds * dRoofAng;
    dr.castShadow = true;
    dormerGroup.add(dr);
  });
  dormerGroup.add(dormerBox, dormerFrame, dormerGlow, dMullionV, dMullionH);
  homeGroup.add(dormerGroup);

  // Tall Stone Brick Chimney (left slope) with puffing cozy chimney smoke
  const chimneyBase = new THREE.Mesh(new THREE.BoxGeometry(1.25, 4.4, 1.25), stoneMat);
  chimneyBase.position.set(-2.3, 6.5, 1.45);
  chimneyBase.castShadow = true;
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 1.5), stoneMat);
  chimneyCap.position.set(-2.3, 8.75, 1.45);
  const chimneyPot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.45, 10), ironMat);
  chimneyPot.position.set(-2.3, 9.05, 1.45);
  homeGroup.add(chimneyBase, chimneyCap, chimneyPot);
  for (let s = 0; s < 4; s++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.32 + s * 0.14, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.28 - s * 0.05,
        depthWrite: false,
      })
    );
    puff.position.set(-2.3 + s * 0.18, 9.5 + s * 0.65, 1.45 + s * 0.1);
    homeGroup.add(puff);
  }

  // Front Arched Doorway, Stone Threshold Steps, Open Heavy Oak Door & Porch Lanterns
  [-4.15, -4.65].forEach((sz, idx) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.5 + idx * 0.35, 0.18, 0.55), stoneMat);
    step.position.set(0, 0.22 - idx * 0.13, sz);
    step.receiveShadow = true;
    homeGroup.add(step);
  });
  // Timber Door Arch Frame
  const doorArch = new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.14, 8, 16, Math.PI),
    darkWoodMat
  );
  doorArch.position.set(0, 2.05, -3.86);
  homeGroup.add(doorArch);

  // Heavy Rounded Wooden Front Door (swung neatly inward on left hinge so Scene 1/2 stays open!)
  const openDoorGroup = new THREE.Group();
  openDoorGroup.position.set(-0.92, 1.25, -3.62);
  openDoorGroup.rotation.y = 1.18;
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.25, 0.14), woodMat);
  doorLeaf.position.set(0.77, 0, 0);
  doorLeaf.castShadow = true;
  const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 14), ironMat);
  doorRing.position.set(1.28, -0.05, -0.09);
  openDoorGroup.add(doorLeaf, doorRing);
  homeGroup.add(openDoorGroup);

  // Twin Hanging Iron Porch Lanterns flanking the front door
  [-1.32, 1.32].forEach((lx) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.38), ironMat);
    bracket.position.set(lx, 2.48, -4.02);
    const lanternGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.1, 0.28, 6),
      windowGlowMat
    );
    lanternGlass.position.set(lx, 2.24, -4.16);
    const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 6), ironMat);
    lanternCap.position.set(lx, 2.42, -4.16);
    homeGroup.add(bracket, lanternGlass, lanternCap);
  });

  // Front Upper Gable Balcony (Signature Feature!) + Arched Upper Attic Window
  const balconyDeck = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.18, 0.95), darkWoodMat);
  balconyDeck.position.set(0, 2.9, -4.32);
  balconyDeck.castShadow = true;
  homeGroup.add(balconyDeck);
  [-1.1, 1.1].forEach((bx) => {
    const corbel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.72), darkWoodMat);
    corbel.position.set(bx, 2.72, -4.22);
    homeGroup.add(corbel);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.14), darkWoodMat);
    post.position.set(bx * 1.18, 3.35, -4.72);
    homeGroup.add(post);
  });
  const balconyRail = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.1, 0.14), woodMat);
  balconyRail.position.set(0, 3.68, -4.72);
  homeGroup.add(balconyRail);
  for (let b = -3; b <= 3; b++) {
    const baluster = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.08), woodMat);
    baluster.position.set(b * 0.34, 3.32, -4.72);
    homeGroup.add(baluster);
  }
  // Upper arched glowing window directly behind balcony railing
  const upperWinFrame = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.48, 0.1), darkWoodMat);
  upperWinFrame.position.set(0, 4.15, -3.91);
  const upperWin = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.26, 0.14), windowGlowMat);
  upperWin.position.set(0, 4.15, -3.92);
  const upperWinMullionV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.28, 0.18), darkWoodMat);
  upperWinMullionV.position.set(0, 4.15, -3.92);
  const upperWinMullionH = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.08, 0.18), darkWoodMat);
  upperWinMullionH.position.set(0, 4.15, -3.92);
  const upperWinArch = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.1, 8, 14, Math.PI),
    darkWoodMat
  );
  upperWinArch.position.set(0, 4.78, -3.91);
  homeGroup.add(upperWinFrame, upperWin, upperWinMullionV, upperWinMullionH, upperWinArch);

  // Helper to mount glowing framed windows with wooden flower boxes & blossoms
  const addWindowWithPlanter = (
    wx: number,
    wy: number,
    wz: number,
    rotY: number,
    withFlowers = true
  ) => {
    const wg = new THREE.Group();
    wg.position.set(wx, wy, wz);
    wg.rotation.y = rotY;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.28, 0.12), darkWoodMat);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.04, 0.15), windowGlowMat);
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.06, 0.18), darkWoodMat);
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 0.18), darkWoodMat);
    wg.add(frame, glass, mullionV, mullionH);

    if (withFlowers) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.24, 0.34), woodMat);
      box.position.set(0, -0.72, 0.16);
      const greens = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 0.22, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x3b7a36, roughness: 0.85 })
      );
      greens.position.set(0, -0.56, 0.18);
      wg.add(box, greens);
      [-0.36, 0, 0.36].forEach((fx, fi) => {
        const bloom = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 7, 7),
          new THREE.MeshStandardMaterial({
            color: fi === 1 ? 0xfef08a : 0xfb7185,
            roughness: 0.6,
          })
        );
        bloom.position.set(fx, -0.46, 0.22);
        wg.add(bloom);
      });
    }
    homeGroup.add(wg);
  };

  // Front, Back & Side Glowing Windows
  addWindowWithPlanter(-2.65, 1.55, -3.92, Math.PI, true);
  addWindowWithPlanter(2.65, 1.55, -3.92, Math.PI, true);
  addWindowWithPlanter(-4.22, 1.55, -1.2, -Math.PI / 2, true);
  addWindowWithPlanter(-4.22, 1.55, 1.6, -Math.PI / 2, true);
  addWindowWithPlanter(6.42, 1.55, 0.1, Math.PI / 2, true);
  addWindowWithPlanter(-2.1, 1.55, 3.92, 0, true);
  addWindowWithPlanter(2.1, 1.55, 3.92, 0, true);

  // Cozy Interior Furniture (Fireplace, Area Rug, Round Dining Table, Loft & Wooden Staircase)
  const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.75, 1.05), stoneMat);
  hearth.position.set(0, 1.5, 3.05);
  const fireArch = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.05, 0.45),
    new THREE.MeshBasicMaterial({ color: 0x1a0d06 })
  );
  fireArch.position.set(0, 0.65, 2.65);
  const fireGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff8c2b })
  );
  fireGlow.position.set(0, 0.6, 2.55);
  const mantel = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.16, 1.18), darkWoodMat);
  mantel.position.set(0, 1.55, 2.98);

  const rug = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: 0x9b2d26, roughness: 0.9 })
  );
  rug.position.set(-2.1, 0.19, -1.0);
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.12, 18), woodMat);
  tableTop.position.set(-2.1, 0.92, -1.0);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.72, 10), darkWoodMat);
  tableLeg.position.set(-2.1, 0.54, -1.0);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.35, 0.55), woodMat);
  shelf.position.set(2.55, 1.35, 3.1);

  // Right-wall wooden staircase & upper cozy loft railing (visible in interior wide views!)
  for (let st = 0; st < 6; st++) {
    const stair = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.42), darkWoodMat);
    stair.position.set(3.38, 0.35 + st * 0.4, -1.6 + st * 0.44);
    homeGroup.add(stair);
  }
  const loftFloor = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 2.8), darkWoodMat);
  loftFloor.position.set(2.2, 2.72, 2.1);
  const loftRail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 0.12), woodMat);
  loftRail.position.set(2.2, 3.45, 0.75);
  homeGroup.add(loftFloor, loftRail);

  const hearthLight = new THREE.PointLight(0xffb457, 12, 16, 1.5);
  hearthLight.position.set(0, 1.65, 1.4);
  homeGroup.add(hearth, fireArch, fireGlow, mantel, rug, tableTop, tableLeg, shelf, hearthLight);

  // Exterior Cozy Props from the Showcase (Fence, Lantern Post, Flagstones, Barrels, Crate, Yard Tree, Sunflowers)
  const addFenceSection = (fx: number, fz: number, len: number) => {
    const fg = new THREE.Group();
    fg.position.set(fx, 0, fz);
    const posts = 3;
    for (let i = 0; i < posts; i++) {
      const px = -len / 2 + (i / (posts - 1)) * len;
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), stoneMat);
      pBase.position.set(px, 0.16, 0);
      const pWood = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.05, 0.2), woodMat);
      pWood.position.set(px, 0.58, 0);
      pWood.castShadow = true;
      fg.add(pBase, pWood);
    }
    [0.42, 0.85].forEach((ry) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.14, 0.1), darkWoodMat);
      rail.position.set(0, ry, 0);
      rail.castShadow = true;
      fg.add(rail);
    });
    homeGroup.add(fg);
  };
  addFenceSection(-3.7, -5.55, 3.8);
  addFenceSection(3.7, -5.55, 3.8);

  // Stepping flagstones from cottage front steps out to village road
  for (let s = 0; s < 5; s++) {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 + (s % 2) * 0.14, 0.62, 0.08, 7),
      stoneMat
    );
    stone.position.set((s % 2 === 0 ? -0.15 : 0.15), 0.04, -5.2 - s * 0.95);
    stone.receiveShadow = true;
    homeGroup.add(stone);
  }

  // Hanging Wooden Lantern Post on the left courtyard corner
  const lPost = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.9, 0.22), darkWoodMat);
  lPost.position.set(-5.35, 1.45, -4.65);
  lPost.castShadow = true;
  const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.16), darkWoodMat);
  lArm.position.set(-5.7, 2.75, -4.65);
  const lGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.36, 6), windowGlowMat);
  lGlow.position.set(-6.02, 2.38, -4.65);
  const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 6), ironMat);
  lCap.position.set(-6.02, 2.62, -4.65);
  homeGroup.add(lPost, lArm, lGlow, lCap);

  // Oak Barrels & Wooden Crates near porch/fence
  const addBarrel = (bx: number, bz: number) => {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.84, 12), woodMat);
    barrel.position.set(bx, 0.42, bz);
    barrel.castShadow = true;
    [-0.25, 0.25].forEach((hy) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 6, 14), ironMat);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.set(bx, 0.42 + hy, bz);
      homeGroup.add(hoop);
    });
    homeGroup.add(barrel);
  };
  addBarrel(2.15, -4.55);
  addBarrel(2.85, -4.85);
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 0.75), darkWoodMat);
  crate.position.set(-2.35, 0.36, -4.55);
  crate.castShadow = true;
  homeGroup.add(crate);

  // Lush Rounded Oak Tree shading the left side of the cottage (matching the showcase!)
  const yardTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.62, 3.6, 10),
    new THREE.MeshStandardMaterial({ map: tex.bark, roughness: 0.9 })
  );
  yardTrunk.position.set(-6.15, 1.8, -1.2);
  yardTrunk.castShadow = true;
  const yardLeafMat = new THREE.MeshStandardMaterial({ color: 0x4f9436, roughness: 0.78 });
  [
    [-6.15, 4.5, -1.2, 2.15],
    [-5.35, 5.2, -0.5, 1.65],
    [-6.95, 4.9, -1.7, 1.55],
    [-6.0, 5.9, -1.3, 1.45],
  ].forEach(([cx, cy, cz, r]) => {
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), yardLeafMat);
    canopy.position.set(cx, cy, cz);
    canopy.castShadow = true;
    homeGroup.add(canopy);
  });
  homeGroup.add(yardTrunk);

  // Sunflowers along the right cottage fence
  for (let sf = 0; sf < 3; sf++) {
    const sx = 5.45 + sf * 0.45;
    const sz = -4.85 + (sf % 2) * 0.4;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 1.25 + sf * 0.15, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b7a36, roughness: 0.85 })
    );
    stem.position.set(sx, 0.62, sz);
    const petals = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.06, 10),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 })
    );
    petals.rotation.x = Math.PI / 2;
    petals.position.set(sx, 1.25 + sf * 0.15, sz);
    homeGroup.add(stem, petals);
  }

  group.add(homeGroup);

  const motherNpc = createNpcModel({ variant: 'mother' }, tex);
  const motherPos = new THREE.Vector3(-1.3, 0.18, 6.8);
  motherNpc.root.position.copy(motherPos);
  motherNpc.root.rotation.y = 0.6;
  group.add(motherNpc.root);

  // Multi-Arrow Courtyard Wooden Signpost (matching Showcase "Structures")
  const signGroup = new THREE.Group();
  signGroup.position.set(3.8, getTerrainHeight(3.8, -6.5), -6.5);
  const signStone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.36, 7), stoneMat);
  signStone.position.y = 0.18;
  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.35, 8), darkWoodMat);
  signPost.position.y = 1.25;
  signPost.castShadow = true;
  const signBoard1 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.36, 0.11), woodMat);
  signBoard1.position.set(0.38, 2.08, 0.04);
  signBoard1.rotation.y = 0.25;
  signBoard1.castShadow = true;
  const signBoard2 = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.32, 0.11), woodMat);
  signBoard2.position.set(-0.32, 1.66, -0.04);
  signBoard2.rotation.y = -0.35;
  signBoard2.castShadow = true;
  signGroup.add(signStone, signPost, signBoard1, signBoard2);
  group.add(signGroup);

  // Terracotta-Roofed Stone Wishing Well with Hanging Bucket & Wildflowers
  const wellGroup = new THREE.Group();
  wellGroup.position.set(-6.4, getTerrainHeight(-6.4, -3.5), -3.5);
  const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 1.0, 14, 1, true), stoneMat);
  wellBase.position.y = 0.5;
  wellBase.castShadow = true;
  const wellRim = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.16, 8, 16), stoneMat);
  wellRim.rotation.x = Math.PI / 2;
  wellRim.position.y = 1.0;
  const wellWater = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 14),
    new THREE.MeshPhysicalMaterial({ color: 0x3ba8c9, roughness: 0.08, clearcoat: 1 })
  );
  wellWater.rotation.x = -Math.PI / 2;
  wellWater.position.y = 0.48;
  [-0.95, 0.95].forEach((px) => {
    const wp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.65, 0.16), darkWoodMat);
    wp.position.set(px, 1.72, 0);
    wp.castShadow = true;
    wellGroup.add(wp);
  });
  const wellRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.9, 8), woodMat);
  wellRoller.rotation.z = Math.PI / 2;
  wellRoller.position.y = 2.05;
  const wellRope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 6), woodMat);
  wellRope.position.y = 1.68;
  const wellBucket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 10), woodMat);
  wellBucket.position.y = 1.28;
  const wellRoofAng = Math.atan2(0.85, 1.15);
  const wellRoofLen = Math.hypot(0.85, 1.15);
  [-1, 1].forEach((ws) => {
    const wSlope = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, wellRoofLen), roofMat);
    wSlope.position.set(0, 2.78, ws * 0.48);
    wSlope.rotation.x = ws * wellRoofAng;
    wSlope.castShadow = true;
    wellGroup.add(wSlope);
  });
  const wellRidge = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.18, 0.18), darkWoodMat);
  wellRidge.position.y = 3.24;
  wellGroup.add(wellBase, wellRim, wellWater, wellRoller, wellRope, wellBucket, wellRidge);
  group.add(wellGroup);

  // 5b. Signature Whimsical Village Asset Pack: Cascading Cliff Waterfalls, Spinning Waterwheels, Market Stalls, Handcarts, Chests & Banners
  const waterfallUniforms = { uTime: { value: 0 } };
  const waterwheels: THREE.Group[] = [];
  const banners: THREE.Mesh[] = [];

  const wfMat = new THREE.MeshPhysicalMaterial({
    map: tex.waterfallFoam,
    color: 0x8be9ff,
    emissive: 0x1b6d8c,
    emissiveIntensity: 0.16,
    roughness: 0.14,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  wfMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterfallUniforms.uTime;
    shader.vertexShader =
      `varying vec2 vWfUv;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvWfUv = uv;`
      );
    shader.fragmentShader =
      `uniform float uTime;\nvarying vec2 vWfUv;\n` +
      shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float flow = sin(vWfUv.y * 18.0 + uTime * 7.5 + sin(vWfUv.x * 12.0) * 1.4);
        float streak = smoothstep(0.3, 0.92, flow);
        float splash = smoothstep(0.18, 0.0, vWfUv.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.88, 0.98, 1.0), streak * 0.42 + splash * 0.72);`
      );
  };

  const mossCapMat = new THREE.MeshStandardMaterial({ color: 0x5ca63e, roughness: 0.82 });
  const awningMat = new THREE.MeshStandardMaterial({
    map: tex.awningStripes,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const bannerMat = new THREE.MeshStandardMaterial({
    map: tex.bannerCrest,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const clayMat = new THREE.MeshStandardMaterial({ color: 0xc26c3b, roughness: 0.62 });
  const goldTrimMat = new THREE.MeshPhysicalMaterial({ color: 0xe6b84d, metalness: 0.85, roughness: 0.25 });
  const boulderMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x7b7870,
    roughness: 0.9,
  });

  // Helper: Mossy Cliff Waterfall + Spinning Timber Waterwheel Mill draining into the brook
  const addWaterfallMill = (brookU: number, outwardDirX: number, scale = 1, withWheel = true) => {
    const bp = BROOK_CURVE.getPointAt(brookU);
    const bt = BROOK_CURVE.getTangentAt(brookU).normalize();
    const perp = new THREE.Vector3(-bt.z, 0, bt.x).normalize();
    const dirSign = outwardDirX >= 0 ? 1 : -1;
    const cliffGroup = new THREE.Group();
    const cx = bp.x + perp.x * dirSign * (9.8 * scale);
    const cz = bp.z + perp.z * dirSign * (9.8 * scale);
    cliffGroup.position.set(cx, bp.y - 0.35, cz);
    cliffGroup.rotation.y = Math.atan2(-perp.x * dirSign, -perp.z * dirSign);

    // Terraced mossy cliff rocks
    [
      [0, 5.2, -3.5, 6.2, 11.2, 5.6],
      [-4.2, 3.8, -2.4, 4.4, 8.2, 4.4],
      [4.2, 4.1, -2.2, 4.6, 8.6, 4.6],
      [-2.2, 7.6, -4.4, 4.8, 7.4, 4.2],
      [2.1, 7.9, -4.5, 4.5, 7.8, 4.2],
    ].forEach(([rx, ry, rz, w, h, d]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 1), boulderMat);
      rock.position.set(rx, ry, rz);
      rock.scale.set(w, h, d);
      rock.castShadow = true;
      rock.receiveShadow = true;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), mossCapMat);
      cap.position.set(rx, ry + h * 0.36, rz);
      cap.scale.set(w * 0.85, 0.95, d * 0.85);
      cliffGroup.add(rock, cap);
    });

    // Shimmering cascading waterfall curtain & splash foam pool
    const cascade = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 10.6, 6, 12), wfMat);
    cascade.position.set(0, 5.2, -0.35);
    cascade.rotation.x = -0.14;
    cliffGroup.add(cascade);

    const splashPool = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 3.1, 20),
      new THREE.MeshBasicMaterial({
        color: 0xe6fbff,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    splashPool.rotation.x = -Math.PI / 2;
    splashPool.position.set(0, 0.42, 2.2);
    cliffGroup.add(splashPool);

    if (withWheel) {
      // Timber A-frame mill stand & rotating wooden waterwheel
      const frame = new THREE.Group();
      frame.position.set(3.2, 0.25, 1.4);
      [-0.75, 0.75].forEach((fx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.24), darkWoodMat);
        post.position.set(fx, 1.5, 0);
        post.castShadow = true;
        frame.add(post);
      });
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.9, 10), darkWoodMat);
      axle.rotation.z = Math.PI / 2;
      axle.position.y = 2.15;
      frame.add(axle);

      const wheel = new THREE.Group();
      wheel.position.set(0, 2.15, 0);
      [-0.42, 0.42].forEach((rx) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.13, 8, 22), woodMat);
        rim.rotation.y = Math.PI / 2;
        rim.position.x = rx;
        rim.castShadow = true;
        wheel.add(rim);
      });
      for (let sp = 0; sp < 8; sp++) {
        const ang = (sp / 8) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 3.45), darkWoodMat);
        spoke.rotation.x = ang;
        wheel.add(spoke);
        const paddle = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.36, 0.08), woodMat);
        paddle.position.set(0, Math.sin(ang) * 1.78, Math.cos(ang) * 1.78);
        paddle.rotation.x = -ang;
        paddle.castShadow = true;
        wheel.add(paddle);
      }
      frame.add(wheel);
      waterwheels.push(wheel);
      cliffGroup.add(frame);
    }

    cliffGroup.scale.setScalar(scale);
    group.add(cliffGroup);
  };

  // Landmark 1: Visible right beside the first brook bend near Nate's village yard!
  addWaterfallMill(0.06, -1, 1.0, true);
  // Landmark 2: Grand Upper Valley Cliff Waterfall beyond the first wooden bridge
  addWaterfallMill(0.255, 1, 1.25, true);

  // Helper: Red & White Striped Village Market Stall (from Showcase "Props & Decorations")
  const addMarketStall = (x: number, z: number, rotY: number) => {
    const sg = new THREE.Group();
    sg.position.set(x, getTerrainHeight(x, z), z);
    sg.rotation.y = rotY;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, 1.25), woodMat);
    counter.position.y = 0.52;
    counter.castShadow = true;
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 1.4), darkWoodMat);
    tableTop.position.y = 1.08;
    sg.add(counter, tableTop);
    [
      [-1.25, -0.58],
      [1.25, -0.58],
      [-1.25, 0.58],
      [1.25, 0.58],
    ].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.55, 0.14), darkWoodMat);
      pole.position.set(px, 1.35, pz);
      pole.castShadow = true;
      sg.add(pole);
    });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.14, 1.75), awningMat);
    awning.position.set(0, 2.65, 0.05);
    awning.rotation.x = 0.22;
    awning.castShadow = true;
    sg.add(awning);
    // Goods on stall & beside it: crate, barrel, clay jug
    const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 0.38, 10), clayMat);
    jug.position.set(-0.65, 1.34, 0.1);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.68), woodMat);
    crate.position.set(1.75, 0.34, 0.15);
    crate.castShadow = true;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.78, 10), darkWoodMat);
    barrel.position.set(-1.75, 0.39, 0.15);
    barrel.castShadow = true;
    sg.add(jug, crate, barrel);
    group.add(sg);
  };

  // Helper: Stylized Wooden Farm Handcart / Wagon (from Showcase "Structures")
  const addHandcart = (x: number, z: number, rotY: number) => {
    const cg = new THREE.Group();
    cg.position.set(x, getTerrainHeight(x, z), z);
    cg.rotation.y = rotY;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.55, 2.15), woodMat);
    bed.position.y = 0.78;
    bed.castShadow = true;
    cg.add(bed);
    [-0.45, 0.45].forEach((hx) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.3), darkWoodMat);
      handle.position.set(hx, 0.62, 1.55);
      handle.rotation.x = 0.18;
      cg.add(handle);
    });
    [-0.82, 0.82].forEach((wx) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 8, 14), darkWoodMat);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(wx, 0.52, -0.1);
      wheel.castShadow = true;
      cg.add(wheel);
      for (let s = 0; s < 4; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.06), woodMat);
        spoke.position.set(wx, 0.52, -0.1);
        spoke.rotation.x = (s / 4) * Math.PI;
        cg.add(spoke);
      }
    });
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.75), darkWoodMat);
    cargo.position.set(0.1, 1.25, -0.2);
    cg.add(cargo);
    group.add(cg);
  };

  // Helper: Iron-Bound Wooden Treasure Chest (from Showcase "Props & Decorations")
  const addTreasureChest = (x: number, z: number, rotY: number) => {
    const ch = new THREE.Group();
    ch.position.set(x, getTerrainHeight(x, z), z);
    ch.rotation.y = rotY;
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.52, 0.68), darkWoodMat);
    base.position.y = 0.26;
    base.castShadow = true;
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 1.06, 10, 1, false, 0, Math.PI),
      woodMat
    );
    lid.rotation.z = Math.PI / 2;
    lid.position.y = 0.52;
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.08), goldTrimMat);
    clasp.position.set(0, 0.48, 0.36);
    ch.add(base, lid, clasp);
    group.add(ch);
  };

  // Helper: Heraldic Crimson Banner Pole
  const addBanner = (x: number, z: number, rotY: number) => {
    const bg = new THREE.Group();
    bg.position.set(x, getTerrainHeight(x, z), z);
    bg.rotation.y = rotY;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8), darkWoodMat);
    pole.position.y = 1.8;
    pole.castShadow = true;
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 6), darkWoodMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.y = 3.25;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.75, 4, 6), bannerMat);
    cloth.position.set(0, 2.35, 0.05);
    banners.push(cloth);
    bg.add(pole, crossbar, cloth);
    group.add(bg);
  };

  // Place curated Market Stalls, Handcarts, Chests & Heraldic Banners in village plazas
  const stall1 = JOURNEY_CURVE.getPointAt(0.032);
  addMarketStall(stall1.x + 7.4, stall1.z, -1.25);
  const stall2 = JOURNEY_CURVE.getPointAt(0.085);
  addMarketStall(stall2.x - 7.6, stall2.z, 1.35);
  const stall3 = JOURNEY_CURVE.getPointAt(0.205);
  addMarketStall(stall3.x + 7.5, stall3.z, -1.45);

  const cart1 = JOURNEY_CURVE.getPointAt(0.058);
  addHandcart(cart1.x + 6.8, cart1.z, 0.65);
  const cart2 = JOURNEY_CURVE.getPointAt(0.145);
  addHandcart(cart2.x - 6.6, cart2.z, -0.8);

  addTreasureChest(-7.9, -2.1, 0.55);
  addTreasureChest(LIBRARY_PLAZA_POS.x - 9.5, LIBRARY_PLAZA_POS.z + 6.5, 0.4);

  addBanner(-5.2, -9.5, 0.2);
  addBanner(5.2, -9.5, -0.2);
  addBanner(LIBRARY_PLAZA_POS.x - 7.5, LIBRARY_PLAZA_POS.z + 3.0, 0.15);
  addBanner(LIBRARY_PLAZA_POS.x + 7.5, LIBRARY_PLAZA_POS.z + 3.0, -0.15);

  // 6. Brook Village Houses (Terracotta-roofed Cream & Timber Cottages)
  const cottageSpecs = [
    { u: 0.025, side: -1, dist: 14.5, rot: 1.4 },
    { u: 0.045, side: 1, dist: 15.0, rot: -1.6 },
    { u: 0.075, side: -1, dist: 16.0, rot: 1.3 },
    { u: 0.105, side: 1, dist: 15.5, rot: -1.5 },
    { u: 0.135, side: -1, dist: 16.5, rot: 1.8 },
    { u: 0.195, side: 1, dist: 17.5, rot: -1.2 },
    { u: 0.225, side: -1, dist: 17.0, rot: 1.6 },
  ];
  cottageSpecs.forEach((spec, i) => {
    const pt = JOURNEY_CURVE.getPointAt(spec.u);
    const tan = JOURNEY_CURVE.getTangentAt(spec.u).normalize();
    side.crossVectors(tan, up).normalize();
    const cx = pt.x + side.x * spec.side * spec.dist;
    const cz = pt.z + side.z * spec.side * spec.dist;
    const cy = getTerrainHeight(cx, cz);
    const cottage = createCottageModel(tex, 0.92 + (i % 3) * 0.08);
    cottage.position.set(cx, cy - 0.15, cz);
    cottage.rotation.y = spec.rot;
    group.add(cottage);
  });

  // 7. Organic Broadleaf & Conifer Forest Trees + Volumetric Sunbeams
  const trunkMat = new THREE.MeshStandardMaterial({ map: tex.bark, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b7a36, roughness: 0.82 });
  const treeCount = 340;
  const trunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.28, 0.52, 4.2, 8),
    trunkMat,
    treeCount
  );
  const crown1Inst = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(2.5, 1),
    leafMat,
    treeCount
  );
  const crown2Inst = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1.9, 1),
    leafMat,
    treeCount
  );
  trunkInst.castShadow = true;
  crown1Inst.castShadow = true;

  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();
  let tIdx = 0;
  for (let i = 0; i < treeCount; i++) {
    const u = 0.02 + (i / treeCount) * 0.94;
    const pt = JOURNEY_CURVE.getPointAt(u);
    const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    const sgn = i % 2 === 0 ? 1 : -1;
    const lat = 12.5 + ((i * 37) % 45) + (i % 3) * 3;
    const tx = pt.x + side.x * sgn * lat;
    const tz = pt.z + side.z * sgn * lat;
    const ty = getTerrainHeight(tx, tz);
    const sc = 0.85 + ((i * 17) % 100) / 140;

    dummy.position.set(tx, ty + 2.0 * sc, tz);
    dummy.rotation.set(0, i * 1.1, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(tIdx, dummy.matrix);

    dummy.position.set(tx, ty + 5.0 * sc, tz);
    dummy.scale.set(sc * 1.12, sc * 0.92, sc * 1.12);
    dummy.updateMatrix();
    crown1Inst.setMatrixAt(tIdx, dummy.matrix);

    dummy.position.set(tx + 0.5 * sc, ty + 6.7 * sc, tz - 0.3 * sc);
    dummy.scale.set(sc * 0.95, sc * 0.85, sc * 0.95);
    dummy.updateMatrix();
    crown2Inst.setMatrixAt(tIdx, dummy.matrix);

    cColor.setHSL(0.255 + ((i % 7) - 3) * 0.012, 0.6, 0.36 + (i % 5) * 0.032);
    crown1Inst.setColorAt(tIdx, cColor);
    crown2Inst.setColorAt(tIdx, cColor.clone().offsetHSL(-0.01, 0.04, 0.06));
    tIdx++;
  }
  trunkInst.instanceMatrix.needsUpdate = true;
  crown1Inst.instanceMatrix.needsUpdate = true;
  crown2Inst.instanceMatrix.needsUpdate = true;
  if (crown1Inst.instanceColor) crown1Inst.instanceColor.needsUpdate = true;
  if (crown2Inst.instanceColor) crown2Inst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  crown1Inst.computeBoundingSphere();
  crown2Inst.computeBoundingSphere();
  group.add(trunkInst, crown1Inst, crown2Inst);

  // Pink Cherry Blossom Trees (from Showcase "Trees & Nature")
  const cherryCount = 54;
  const cherryTrunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.24, 0.44, 3.8, 8),
    trunkMat,
    cherryCount
  );
  const cherryBloomMat = new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.72 });
  const cherryCrown1 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.2, 1), cherryBloomMat, cherryCount);
  const cherryCrown2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.65, 1), cherryBloomMat, cherryCount);
  cherryTrunkInst.castShadow = true;
  cherryCrown1.castShadow = true;
  for (let i = 0; i < cherryCount; i++) {
    const u = 0.015 + (i / cherryCount) * 0.94;
    const pt = JOURNEY_CURVE.getPointAt(u);
    const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    const sgn = i % 2 === 0 ? 1 : -1;
    const lat = 11.2 + ((i * 23) % 24);
    const tx = pt.x + side.x * sgn * lat;
    const tz = pt.z + side.z * sgn * lat;
    const ty = getTerrainHeight(tx, tz);
    const sc = 0.8 + ((i * 13) % 40) / 100;

    dummy.position.set(tx, ty + 1.8 * sc, tz);
    dummy.rotation.set(0, i * 1.4, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    cherryTrunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, ty + 4.4 * sc, tz);
    dummy.scale.set(sc * 1.1, sc * 0.88, sc * 1.1);
    dummy.updateMatrix();
    cherryCrown1.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx - 0.55 * sc, ty + 5.6 * sc, tz + 0.4 * sc);
    dummy.scale.set(sc * 0.9, sc * 0.82, sc * 0.9);
    dummy.updateMatrix();
    cherryCrown2.setMatrixAt(i, dummy.matrix);

    cColor.setHSL(0.92 + (i % 4) * 0.01, 0.76, 0.74 + (i % 3) * 0.04);
    cherryCrown1.setColorAt(i, cColor);
    cherryCrown2.setColorAt(i, cColor.clone().offsetHSL(0.01, 0, 0.05));
  }
  cherryTrunkInst.instanceMatrix.needsUpdate = true;
  cherryCrown1.instanceMatrix.needsUpdate = true;
  cherryCrown2.instanceMatrix.needsUpdate = true;
  if (cherryCrown1.instanceColor) cherryCrown1.instanceColor.needsUpdate = true;
  if (cherryCrown2.instanceColor) cherryCrown2.instanceColor.needsUpdate = true;
  cherryTrunkInst.computeBoundingSphere();
  cherryCrown1.computeBoundingSphere();
  cherryCrown2.computeBoundingSphere();
  group.add(cherryTrunkInst, cherryCrown1, cherryCrown2);

  // Evergreen Pine / Cypress Conifers along the Forest Ridges
  const pineCount = 140;
  const pineTrunkInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.42, 4.0, 7),
    trunkMat,
    pineCount
  );
  const pineCone1Inst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(2.1, 4.8, 7),
    new THREE.MeshStandardMaterial({ color: 0x265436, roughness: 0.85 }),
    pineCount
  );
  const pineCone2Inst = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1.5, 3.8, 7),
    new THREE.MeshStandardMaterial({ color: 0x2e6440, roughness: 0.84 }),
    pineCount
  );
  pineTrunkInst.castShadow = true;
  pineCone1Inst.castShadow = true;
  for (let i = 0; i < pineCount; i++) {
    const u = 0.03 + (i / pineCount) * 0.94;
    const pt = JOURNEY_CURVE.getPointAt(u);
    const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    const sgn = i % 2 === 0 ? -1 : 1;
    const lat = 19 + ((i * 29) % 42);
    const tx = pt.x + side.x * sgn * lat;
    const tz = pt.z + side.z * sgn * lat;
    const ty = getTerrainHeight(tx, tz);
    const sc = 0.9 + ((i * 19) % 100) / 130;

    dummy.position.set(tx, ty + 2.0 * sc, tz);
    dummy.rotation.set(0, i * 0.9, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    pineTrunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, ty + 5.1 * sc, tz);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    pineCone1Inst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, ty + 7.4 * sc, tz);
    dummy.scale.set(sc, sc, sc);
    dummy.updateMatrix();
    pineCone2Inst.setMatrixAt(i, dummy.matrix);
  }
  pineTrunkInst.instanceMatrix.needsUpdate = true;
  pineCone1Inst.instanceMatrix.needsUpdate = true;
  pineCone2Inst.instanceMatrix.needsUpdate = true;
  pineTrunkInst.computeBoundingSphere();
  pineCone1Inst.computeBoundingSphere();
  pineCone2Inst.computeBoundingSphere();
  group.add(pineTrunkInst, pineCone1Inst, pineCone2Inst);

  // Mossy Riverbank Stones & Boulders + Reed Clusters + Brook Lily Pads + Toadstool Mushrooms
  const rockMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x73766e,
    roughness: 0.88,
  });
  const rockMatrices: THREE.Matrix4[] = [];
  const reedMatrices: THREE.Matrix4[] = [];
  const lilyMatrices: THREE.Matrix4[] = [];
  const mushMatrices: THREE.Matrix4[] = [];
  for (let r = 0; r < 180; r++) {
    const bu = (r / 180) * 0.96 + 0.02;
    const bpt = BROOK_CURVE.getPointAt(bu);
    const btan = BROOK_CURVE.getTangentAt(bu).normalize();
    side.crossVectors(btan, up).normalize();
    const sgn = r % 2 === 0 ? 1 : -1;
    const bankDist = 5.6 + (r % 5) * 0.45;
    const rx = bpt.x + side.x * sgn * bankDist;
    const rz = bpt.z + side.z * sgn * bankDist;
    const info = bridgeCenters[0].distanceTo(bpt);
    const info2 = bridgeCenters[1].distanceTo(bpt);
    if (info < 9.0 || info2 < 9.0) continue;
    const ry = getTerrainHeight(rx, rz);
    dummy.position.set(rx, ry + 0.12, rz);
    dummy.rotation.set((r % 3) * 0.4, r * 1.3, (r % 4) * 0.3);
    const sx = 0.55 + (r % 4) * 0.24;
    const sy = 0.36 + (r % 3) * 0.16;
    const sz = 0.52 + (r % 5) * 0.2;
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    rockMatrices.push(dummy.matrix.clone());

    if (r % 2 === 0) {
      for (let k = 0; k < 3; k++) {
        const rrx = rx + (k - 1) * 0.22;
        const rrz = rz + ((k % 2) - 0.5) * 0.2;
        const rry = getTerrainHeight(rrx, rrz);
        dummy.position.set(rrx, rry + 0.55, rrz);
        dummy.rotation.set((k - 1) * 0.12, r + k, 0.08);
        dummy.scale.set(1, 0.8 + k * 0.2, 1);
        dummy.updateMatrix();
        reedMatrices.push(dummy.matrix.clone());
      }
    }

    // Floating Lily Pads on calm outer eddies of the brook
    if (r % 3 === 0) {
      const lx = bpt.x + side.x * sgn * (2.6 + (r % 3) * 0.65);
      const lz = bpt.z + side.z * sgn * (2.6 + (r % 3) * 0.65);
      dummy.position.set(lx, bpt.y + 0.06, lz);
      dummy.rotation.set(0, r * 0.9, 0);
      const ls = 0.75 + (r % 3) * 0.22;
      dummy.scale.set(ls, 1, ls);
      dummy.updateMatrix();
      lilyMatrices.push(dummy.matrix.clone());
    }

    // Red-and-white toadstool clusters tucked beside grassy banks & rocks
    if (r % 4 === 0) {
      const mx = rx + side.x * sgn * 1.35;
      const mz = rz + side.z * sgn * 1.35;
      const my = getTerrainHeight(mx, mz);
      dummy.position.set(mx, my + 0.16, mz);
      dummy.rotation.set(0.05, r * 1.1, 0);
      const ms = 0.8 + (r % 3) * 0.28;
      dummy.scale.set(ms, ms, ms);
      dummy.updateMatrix();
      mushMatrices.push(dummy.matrix.clone());
    }
  }
  const rockInst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.65, 1), rockMat, rockMatrices.length);
  rockMatrices.forEach((m, idx) => rockInst.setMatrixAt(idx, m));
  rockInst.instanceMatrix.needsUpdate = true;
  rockInst.computeBoundingSphere();
  rockInst.receiveShadow = true;
  group.add(rockInst);

  if (reedMatrices.length > 0) {
    const reedInst = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.025, 0.05, 1.35, 5),
      new THREE.MeshStandardMaterial({ color: 0x457d3b, roughness: 0.8 }),
      reedMatrices.length
    );
    reedMatrices.forEach((m, idx) => reedInst.setMatrixAt(idx, m));
    reedInst.instanceMatrix.needsUpdate = true;
    reedInst.computeBoundingSphere();
    group.add(reedInst);
  }

  if (lilyMatrices.length > 0) {
    const lilyInst = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.04, 12, 1, false, 0.2, Math.PI * 1.82),
      new THREE.MeshStandardMaterial({ color: 0x4ca64a, roughness: 0.65 }),
      lilyMatrices.length
    );
    lilyMatrices.forEach((m, idx) => lilyInst.setMatrixAt(idx, m));
    lilyInst.instanceMatrix.needsUpdate = true;
    lilyInst.computeBoundingSphere();
    group.add(lilyInst);
  }

  if (mushMatrices.length > 0) {
    const mushCapInst = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.24, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xd93829, roughness: 0.55 }),
      mushMatrices.length
    );
    const mushStemInst = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.22, 6),
      new THREE.MeshStandardMaterial({ color: 0xf4ead2, roughness: 0.78 }),
      mushMatrices.length
    );
    mushMatrices.forEach((m, idx) => {
      mushCapInst.setMatrixAt(idx, m);
      mushStemInst.setMatrixAt(idx, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, -0.14, 0)));
    });
    mushCapInst.instanceMatrix.needsUpdate = true;
    mushStemInst.instanceMatrix.needsUpdate = true;
    mushCapInst.computeBoundingSphere();
    mushStemInst.computeBoundingSphere();
    group.add(mushCapInst, mushStemInst);
  }

  // Subtle Atmospheric Valley Light Shafts
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xfff0c2,
    transparent: true,
    opacity: 0.024,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (let r = 0; r < 10; r++) {
    const pt = JOURNEY_CURVE.getPointAt(0.08 + r * 0.09);
    const ray = new THREE.Mesh(new THREE.ConeGeometry(7.5, 38, 12, 1, true), rayMat);
    ray.position.set(pt.x + 6, pt.y + 18, pt.z);
    ray.rotation.z = 0.35;
    ray.rotation.x = 0.15;
    group.add(ray);
  }

  // Distant Mountain Ring
  const mtnMat = new THREE.MeshStandardMaterial({ color: 0x3b5059, roughness: 0.95 });
  const mtnInst = new THREE.InstancedMesh(new THREE.ConeGeometry(46, 85, 6), mtnMat, 28);
  for (let m = 0; m < 28; m++) {
    const a = (m / 28) * Math.PI * 2;
    const rad = 220 + (m % 3) * 55;
    dummy.position.set(Math.cos(a) * rad, 24 + (m % 4) * 9, -460 + Math.sin(a) * 520);
    dummy.rotation.set(0, m * 0.7, 0);
    dummy.scale.set(1 + (m % 3) * 0.4, 0.9 + (m % 4) * 0.25, 1);
    dummy.updateMatrix();
    mtnInst.setMatrixAt(m, dummy.matrix);
  }
  mtnInst.instanceMatrix.needsUpdate = true;
  mtnInst.computeBoundingSphere();
  group.add(mtnInst);

  // Guided Corridor Fence Posts, Rails & Path Lanterns
  const postPairs = 90;
  const postMatrices: THREE.Matrix4[] = [];
  const railMatrices: THREE.Matrix4[] = [];
  const prevSidePts: (THREE.Vector3 | null)[] = [null, null];

  for (let p = 0; p < postPairs; p++) {
    const u = 0.01 + (p / postPairs) * 0.93;
    const pt = JOURNEY_CURVE.getPointAt(u);
    const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();

    const nearBridge = bridgeCenters.some(
      (bc) => Math.hypot(pt.x - bc.x, pt.z - bc.z) < 9.0
    );
    if (nearBridge) {
      prevSidePts[0] = null;
      prevSidePts[1] = null;
      continue;
    }

    for (let s = 0; s < 2; s++) {
      const sgn = s === 0 ? -1 : 1;
      const px = pt.x + side.x * sgn * 8.2;
      const pz = pt.z + side.z * sgn * 8.2;
      const py = getTerrainHeight(px, pz);
      dummy.position.set(px, py + 0.55, pz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      postMatrices.push(dummy.matrix.clone());

      const curPt = new THREE.Vector3(px, py + 0.88, pz);
      const prevPt = prevSidePts[s];
      if (prevPt) {
        const dist = prevPt.distanceTo(curPt);
        if (dist < 16) {
          dummy.position.lerpVectors(prevPt, curPt, 0.5);
          dummy.lookAt(curPt);
          dummy.scale.set(1, 1, dist);
          dummy.updateMatrix();
          railMatrices.push(dummy.matrix.clone());
        }
      }
      prevSidePts[s] = curPt;
    }
  }
  const postInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.12, 0.14, 1.15, 6),
    woodMat,
    Math.max(1, postMatrices.length)
  );
  postMatrices.forEach((m, idx) => postInst.setMatrixAt(idx, m));
  postInst.instanceMatrix.needsUpdate = true;
  postInst.computeBoundingSphere();
  group.add(postInst);

  if (railMatrices.length > 0) {
    const railInst = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.1, 0.1, 1),
      woodMat,
      railMatrices.length
    );
    railMatrices.forEach((m, idx) => railInst.setMatrixAt(idx, m));
    railInst.instanceMatrix.needsUpdate = true;
    railInst.computeBoundingSphere();
    group.add(railInst);
  }

  const pathMarkers: THREE.Mesh[] = [];
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffd57a,
    emissive: 0xff9f2e,
    emissiveIntensity: 0.34,
    roughness: 0.25,
  });
  for (let m = 1; m <= 14; m++) {
    let u = m / 15;
    let pt = JOURNEY_CURVE.getPointAt(u);
    let tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    const sgn = m % 2 === 0 ? 1 : -1;
    let mx = pt.x + side.x * sgn * 3.6;
    let mz = pt.z + side.z * sgn * 3.6;
    if (getBrookDistance(mx, mz).dist < 8.6) {
      u = Math.max(0.01, u - 0.014);
      pt = JOURNEY_CURVE.getPointAt(u);
      tan = JOURNEY_CURVE.getTangentAt(u).normalize();
      side.crossVectors(tan, up).normalize();
      mx = pt.x + side.x * sgn * 3.6;
      mz = pt.z + side.z * sgn * 3.6;
    }
    const my = getTerrainHeight(mx, mz);

    // Timber Lantern Post on Stone Base (matching Showcase "Structures")
    const lpGroup = new THREE.Group();
    lpGroup.position.set(mx, my, mz);
    lpGroup.rotation.y = Math.atan2(-side.x * sgn, -side.z * sgn);

    const baseStone = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.55), stoneMat);
    baseStone.position.y = 0.21;
    const timberPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), darkWoodMat);
    timberPost.position.y = 1.45;
    timberPost.castShadow = true;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.78), darkWoodMat);
    arm.position.set(0, 2.52, 0.34);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 6), ironMat);
    cap.position.set(0, 2.38, 0.64);
    const orb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.32, 6), lanternMat);
    orb.position.set(0, 2.15, 0.64);
    lpGroup.add(baseStone, timberPost, arm, cap, orb);
    group.add(lpGroup);
    pathMarkers.push(orb);
  }

  // Swaying Wild Grass & Flowers
  const grassCount = 1600;
  const grassGeo = new THREE.ConeGeometry(0.14, 0.72, 3);
  grassGeo.translate(0, 0.36, 0);
  const grassUniforms = { uTime: { value: 0 } };
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x5da043, roughness: 0.85 });
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = grassUniforms.uTime;
    shader.vertexShader =
      `uniform float uTime;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float sway = sin(uTime * 2.4 + position.y * 2.0 + instanceMatrix[3][0] * 0.4 + instanceMatrix[3][2] * 0.3) * 0.16;
        transformed.x += sway * position.y;`
      );
  };
  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
  const flowerInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.13, 6, 5),
    new THREE.MeshStandardMaterial({ roughness: 0.65 }),
    380
  );
  let fIdx = 0;
  const flowerPalette = [0xfde047, 0xf9a8d4, 0x93c5fd, 0xfef08a];
  for (let i = 0; i < grassCount; i++) {
    let u = (i / grassCount) * 0.96;
    let pt = JOURNEY_CURVE.getPointAt(u);
    let tan = JOURNEY_CURVE.getTangentAt(u).normalize();
    side.crossVectors(tan, up).normalize();
    const sgn = i % 2 === 0 ? 1 : -1;
    const lat = 3.2 + ((i * 23) % 100) * 0.12;
    let gx = pt.x + side.x * sgn * lat;
    let gz = pt.z + side.z * sgn * lat;
    if (getBrookDistance(gx, gz).dist < 7.8) {
      u = (u + 0.03) % 0.96;
      pt = JOURNEY_CURVE.getPointAt(u);
      tan = JOURNEY_CURVE.getTangentAt(u).normalize();
      side.crossVectors(tan, up).normalize();
      gx = pt.x + side.x * sgn * lat;
      gz = pt.z + side.z * sgn * lat;
    }
    const gy = getTerrainHeight(gx, gz);
    dummy.position.set(gx, gy, gz);
    dummy.rotation.set(0, i * 0.9, 0);
    const gs = 0.75 + (i % 5) * 0.18;
    dummy.scale.set(gs, gs, gs);
    dummy.updateMatrix();
    grassMesh.setMatrixAt(i, dummy.matrix);
    cColor.setHSL(0.28 + (i % 5) * 0.015, 0.52, 0.36 + (i % 4) * 0.04);
    grassMesh.setColorAt(i, cColor);

    if (i % 4 === 0 && fIdx < 380) {
      dummy.position.set(gx, gy + 0.38, gz);
      dummy.scale.set(1, 0.6, 1);
      dummy.updateMatrix();
      flowerInst.setMatrixAt(fIdx, dummy.matrix);
      flowerInst.setColorAt(fIdx, new THREE.Color(flowerPalette[fIdx % flowerPalette.length]));
      fIdx++;
    }
  }
  grassMesh.instanceMatrix.needsUpdate = true;
  if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;
  grassMesh.computeBoundingSphere();
  flowerInst.instanceMatrix.needsUpdate = true;
  if (flowerInst.instanceColor) flowerInst.instanceColor.needsUpdate = true;
  flowerInst.computeBoundingSphere();
  group.add(grassMesh, flowerInst);

  // 8. Grand Ench Library Exterior
  const libraryExterior = createEnchLibraryExterior(tex);
  const libAngle = Math.atan2(LIBRARY_ENTRANCE_DIR.x, LIBRARY_ENTRANCE_DIR.z);
  libraryExterior.group.position.set(
    LIBRARY_PLAZA_POS.x + LIBRARY_ENTRANCE_DIR.x * 22,
    LIBRARY_PLAZA_POS.y - 0.5,
    LIBRARY_PLAZA_POS.z + LIBRARY_ENTRANCE_DIR.z * 22
  );
  libraryExterior.group.rotation.y = libAngle + Math.PI;
  group.add(libraryExterior.group);

  const libraryBeaconRing = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2.3, 32),
    new THREE.MeshBasicMaterial({
      color: 0x6fe7ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  );
  libraryBeaconRing.rotation.x = -Math.PI / 2;
  libraryBeaconRing.position.set(
    LIBRARY_PLAZA_POS.x,
    LIBRARY_PLAZA_POS.y + 0.12,
    LIBRARY_PLAZA_POS.z
  );
  group.add(libraryBeaconRing);

  const objectiveBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 1.4, 85, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  objectiveBeam.position.set(
    LIBRARY_PLAZA_POS.x,
    LIBRARY_PLAZA_POS.y + 42,
    LIBRARY_PLAZA_POS.z
  );
  group.add(objectiveBeam);

  return {
    group,
    skyDome,
    brookMesh,
    brookUniforms,
    waterfallUniforms,
    waterwheels,
    banners,
    grassMesh,
    grassUniforms,
    motherNpc,
    motherPos,
    libraryExterior,
    libraryBeaconRing,
    objectiveBeam,
    pathMarkers,
  };
}
