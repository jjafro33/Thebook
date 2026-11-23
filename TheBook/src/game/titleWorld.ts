import * as THREE from 'three';
import type { ProceduralTextures } from './textures';
import type { IntroStage } from './types';

export interface TitleWorldRig {
  group: THREE.Group;
  pedestalPos: THREE.Vector3;
  bookGroup: THREE.Group;
  leftCoverPivot: THREE.Group;
  rightCoverPivot: THREE.Group;
  pagePivots: THREE.Group[];
  pageSignMats: THREE.MeshStandardMaterial[];
  bookCoreLight: THREE.PointLight;
  heroSparkMesh: THREE.Mesh;
  dustPoints: THREE.Points;
  dustPositions: Float32Array;
  chandelierRings: THREE.Group[];
  castleSkyGlow: THREE.Mesh;
}

export function createTitleWorld(tex: ProceduralTextures): TitleWorldRig {
  const group = new THREE.Group();
  const pedestalPos = new THREE.Vector3(2.2, 0, -1.8);

  // Materials matching AAA realistic fantasy aesthetic
  const floorMat = new THREE.MeshStandardMaterial({
    map: tex.palaceMarble,
    roughness: 0.42,
    metalness: 0.14,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.ashlarStone,
    normalMap: tex.ashlarStoneNormal,
    roughness: 0.72,
    metalness: 0.08,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.mahoganyWood,
    roughness: 0.56,
    metalness: 0.08,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd9a84e,
    roughness: 0.26,
    metalness: 0.88,
  });
  const coverMat = new THREE.MeshStandardMaterial({
    map: tex.royalBlueEmbroidery,
    normalMap: tex.royalBlueEmbroideryNormal,
    roughness: 0.44,
    metalness: 0.28,
  });
  const pageMat = new THREE.MeshStandardMaterial({
    color: 0xf4ead2,
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  // Grand circular stone sanctuary floor
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 0.5, 48), floorMat);
  floor.position.set(0, -0.25, -4);
  floor.receiveShadow = true;
  group.add(floor);

  // Raised mosaic dais beneath the stone pedestal
  const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.2, 0.24, 16), stoneMat);
  dais1.position.set(pedestalPos.x, 0.12, pedestalPos.z);
  dais1.receiveShadow = true;
  group.add(dais1);

  const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.1, 0.22, 16), stoneMat);
  dais2.position.set(pedestalPos.x, 0.34, pedestalPos.z);
  dais2.receiveShadow = true;
  group.add(dais2);

  const daisRing = new THREE.Mesh(new THREE.TorusGeometry(3.82, 0.055, 10, 48), brassMat);
  daisRing.rotation.x = Math.PI / 2;
  daisRing.position.set(pedestalPos.x, 0.46, pedestalPos.z);
  group.add(daisRing);

  // Carved Stone Pedestal
  const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 0.35, 8), stoneMat);
  pedBase.position.set(pedestalPos.x, 0.62, pedestalPos.z);
  pedBase.castShadow = true;
  pedBase.receiveShadow = true;
  group.add(pedBase);

  const pedShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 1.05, 8), stoneMat);
  pedShaft.position.set(pedestalPos.x, 1.32, pedestalPos.z);
  pedShaft.castShadow = true;
  group.add(pedShaft);

  const pedCap = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 0.72, 0.24, 8), stoneMat);
  pedCap.position.set(pedestalPos.x, 1.94, pedestalPos.z);
  pedCap.castShadow = true;
  group.add(pedCap);

  const pedCollar = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.04, 8, 24), brassMat);
  pedCollar.rotation.x = Math.PI / 2;
  pedCollar.position.set(pedestalPos.x, 1.82, pedestalPos.z);
  group.add(pedCollar);

  // Slanted brass lectern cradle
  const lectern = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 0.98), brassMat);
  lectern.position.set(pedestalPos.x, 2.18, pedestalPos.z);
  lectern.rotation.x = 0.32;
  lectern.rotation.y = -0.22;
  group.add(lectern);

  // === HERO ANCIENT BOOK ("THE BOOK") ===
  const bookGroup = new THREE.Group();
  bookGroup.position.set(pedestalPos.x, 2.27, pedestalPos.z);
  bookGroup.rotation.set(0.32, -0.22, 0);
  group.add(bookGroup);

  const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.94, 12), brassMat);
  spineMesh.rotation.x = Math.PI / 2;
  bookGroup.add(spineMesh);

  const leftCoverPivot = new THREE.Group();
  const rightCoverPivot = new THREE.Group();
  bookGroup.add(leftCoverPivot, rightCoverPivot);

  // Left & Right ornate covers (pivot along spine x = 0)
  const leftBoard = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.055, 0.92), coverMat);
  leftBoard.position.set(-0.34, 0, 0);
  leftBoard.castShadow = true;
  leftCoverPivot.add(leftBoard);

  const rightBoard = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.055, 0.92), coverMat);
  rightBoard.position.set(0.34, 0, 0);
  rightBoard.castShadow = true;
  rightCoverPivot.add(rightBoard);

  // Brass corner bosses & Front cover engraved medallion logo
  const bossGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.07, 6);
  [
    [-0.6, 0.38],
    [-0.6, -0.38],
  ].forEach(([bx, bz]) => {
    const b = new THREE.Mesh(bossGeo, brassMat);
    b.position.set(bx, 0, bz);
    leftCoverPivot.add(b);
  });
  [
    [0.6, 0.38],
    [0.6, -0.38],
  ].forEach(([bx, bz]) => {
    const b = new THREE.Mesh(bossGeo, brassMat);
    b.position.set(bx, 0, bz);
    rightCoverPivot.add(b);
  });

  // Emblem plaque visible when book rests closed
  const emblemRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.018, 8, 28),
    new THREE.MeshStandardMaterial({
      color: 0xf6d378,
      emissive: 0xd9a84e,
      emissiveIntensity: 0.42,
      roughness: 0.25,
      metalness: 0.9,
    })
  );
  emblemRing.rotation.x = Math.PI / 2;
  emblemRing.position.set(0.34, 0.036, 0);
  rightCoverPivot.add(emblemRing);

  const emblemGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.06, 0),
    new THREE.MeshStandardMaterial({
      color: 0x72efdd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.15,
      metalness: 0.3,
    })
  );
  emblemGem.position.set(0.34, 0.042, 0);
  rightCoverPivot.add(emblemGem);

  // Page blocks attached to left & right covers
  const leftBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.075, 0.84), pageMat);
  leftBlock.position.set(-0.32, 0.062, 0);
  leftCoverPivot.add(leftBlock);

  const rightBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.075, 0.84), pageMat);
  rightBlock.position.set(0.32, 0.062, 0);
  rightCoverPivot.add(rightBlock);

  // Glowing ancient sigils printed on the inner facing parchment blocks
  const pageSignMats: THREE.MeshStandardMaterial[] = [];
  for (let side = 0; side < 2; side++) {
    const sigilMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xd9a84e,
      emissiveIntensity: 0.0,
      roughness: 0.5,
    });
    pageSignMats.push(sigilMat);
    const sigil = new THREE.Mesh(new THREE.RingGeometry(0.11, 0.145, 24), sigilMat);
    sigil.rotation.x = -Math.PI / 2;
    sigil.position.set(side === 0 ? -0.32 : 0.32, 0.104, 0);
    (side === 0 ? leftCoverPivot : rightCoverPivot).add(sigil);

    for (let l = 0; l < 4; l++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.015), sigilMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(side === 0 ? -0.32 : 0.32, 0.103, -0.24 + l * 0.16);
      (side === 0 ? leftCoverPivot : rightCoverPivot).add(line);
    }
  }

  // Animated individual turning pages
  const pagePivots: THREE.Group[] = [];
  for (let i = 0; i < 5; i++) {
    const pPivot = new THREE.Group();
    pPivot.position.set(0, 0.106, 0);
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 0.81, 8, 2), pageMat);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.x = 0.285;
    pPivot.add(sheet);
    bookGroup.add(pPivot);
    pagePivots.push(pPivot);
  }

  // Soft controlled light emerging from inside the book
  const bookCoreLight = new THREE.PointLight(0xfde68a, 0, 9.5);
  bookCoreLight.position.set(pedestalPos.x, 2.75, pedestalPos.z + 0.15);
  group.add(bookCoreLight);

  // Tiny golden spark particle for Scene 1 opening beat
  const heroSparkMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe49e })
  );
  heroSparkMesh.position.set(pedestalPos.x, 2.55, pedestalPos.z);
  group.add(heroSparkMesh);

  // === ENORMOUS ANCIENT LIBRARY BOOKSHELVES & ARCHES ===
  const shelfCount = 12;
  const radius = 15.5;
  for (let i = 0; i < shelfCount; i++) {
    const angle = -Math.PI * 0.88 + (i / (shelfCount - 1)) * Math.PI * 1.12 - Math.PI * 0.18;
    // Leave central back window bay open for the enchanted castle vista
    if (Math.abs(Math.sin(angle)) < 0.22 && Math.cos(angle) < 0) continue;

    const sx = Math.sin(angle) * radius;
    const sz = Math.cos(angle) * radius - 3;
    const bay = new THREE.Group();
    bay.position.set(sx, 0, sz);
    bay.lookAt(0, 0, -3);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 12.5, 0.8), woodMat);
    frame.position.y = 6.25;
    frame.castShadow = true;
    frame.receiveShadow = true;
    bay.add(frame);

    const pilasterL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 13.0, 1.05), stoneMat);
    pilasterL.position.set(-2.05, 6.5, 0.15);
    bay.add(pilasterL);

    // Stocked book shelves (6 tiers)
    const bookColors = [0x6b2121, 0x1e3a5f, 0x2c4a35, 0x5c4028, 0x4c285e, 0x8a5a2b];
    for (let tier = 0; tier < 6; tier++) {
      const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.14, 0.85), woodMat);
      shelfBoard.position.set(0, 1.2 + tier * 1.85, 0.14);
      bay.add(shelfBoard);

      for (let b = 0; b < 8; b++) {
        const bh = 0.55 + ((i * 7 + tier * 3 + b * 5) % 4) * 0.11;
        const bookRow = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, bh, 0.5),
          new THREE.MeshStandardMaterial({
            color: bookColors[(i + tier + b) % bookColors.length],
            roughness: 0.72,
          })
        );
        bookRow.position.set(-1.35 + b * 0.38, 1.28 + tier * 1.85 + bh * 0.5, 0.24);
        bay.add(bookRow);
      }
    }

    group.add(bay);
  }

  // Tall Gothic Arch & Enchanted Castle Silhouette visible through central window bay
  const windowArchGroup = new THREE.Group();
  windowArchGroup.position.set(1.6, 0, -17.5);
  group.add(windowArchGroup);

  const archColL = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 13, 12), stoneMat);
  archColL.position.set(-4.6, 6.5, 0);
  const archColR = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 13, 12), stoneMat);
  archColR.position.set(4.6, 6.5, 0);
  const archTop = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.55, 10, 28, Math.PI), stoneMat);
  archTop.position.set(0, 12.6, 0);
  windowArchGroup.add(archColL, archColR, archTop);

  // Mullion glass bars
  for (let m = -2; m <= 2; m++) {
    const mullion = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 13.5, 8), brassMat);
    mullion.position.set(m * 1.65, 6.8, 0);
    windowArchGroup.add(mullion);
  }

  // Enchanted Castle distant silhouette & moonlit backdrop outside the window
  const castleGroup = new THREE.Group();
  castleGroup.position.set(2.4, -0.5, -38);
  group.add(castleGroup);

  const castleMat = new THREE.MeshStandardMaterial({
    color: 0x1a2642,
    roughness: 0.85,
    metalness: 0.12,
  });
  const keepTower = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.3, 18, 12), castleMat);
  keepTower.position.set(0, 9, 0);
  const spireMain = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8.5, 12), castleMat);
  spireMain.position.set(0, 22, 0);
  castleGroup.add(keepTower, spireMain);

  [-5.5, 5.2].forEach((tx, idx) => {
    const sideTower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 2.0, idx === 0 ? 14 : 15.5, 10),
      castleMat
    );
    sideTower.position.set(tx, 7.2, idx === 0 ? 2 : -1.5);
    const sideSpire = new THREE.Mesh(new THREE.ConeGeometry(2.0, 5.5, 10), castleMat);
    sideSpire.position.set(tx, idx === 0 ? 16.5 : 17.5, idx === 0 ? 2 : -1.5);
    const windowGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.3, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf6d378 })
    );
    windowGlow.position.set(tx, 10.2, idx === 0 ? 3.8 : 0.3);
    castleGroup.add(sideTower, sideSpire, windowGlow);
  });

  const castleSkyGlow = new THREE.Mesh(
    new THREE.CircleGeometry(18, 32),
    new THREE.MeshBasicMaterial({
      color: 0x243b6b,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  castleSkyGlow.position.set(2.4, 11.5, -52);
  group.add(castleSkyGlow);

  // Subtle brass chandeliers suspended high overhead
  const chandelierRings: THREE.Group[] = [];
  [
    [-5.8, 10.6, -5.5],
    [6.8, 10.8, -6.2],
  ].forEach(([cx, cy, cz]) => {
    const ch = new THREE.Group();
    ch.position.set(cx, cy, cz);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 8, 24), brassMat);
    ring.rotation.x = Math.PI / 2;
    ch.add(ring);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 6, 6), brassMat);
    chain.position.y = 3;
    ch.add(chain);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd27d })
      );
      flame.position.set(Math.cos(a) * 1.5, 0.16, Math.sin(a) * 1.5);
      ch.add(flame);
    }
    const warmLt = new THREE.PointLight(0xffb86b, 14, 22);
    warmLt.position.set(0, -0.3, 0);
    ch.add(warmLt);
    group.add(ch);
    chandelierRings.push(ch);
  });

  // Floating Golden Dust Motes
  const dustCount = 220;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 24;
    dustPositions[i * 3 + 1] = 0.5 + Math.random() * 11;
    dustPositions[i * 3 + 2] = -14 + Math.random() * 20;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustPoints = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: tex.softParticle,
      color: 0xf8d98c,
      size: 0.19,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  dustPoints.frustumCulled = false;
  group.add(dustPoints);

  return {
    group,
    pedestalPos,
    bookGroup,
    leftCoverPivot,
    rightCoverPivot,
    pagePivots,
    pageSignMats,
    bookCoreLight,
    heroSparkMesh,
    dustPoints,
    dustPositions,
    chandelierRings,
    castleSkyGlow,
  };
}

export function updateTitleWorld(
  rig: TitleWorldRig,
  camera: THREE.PerspectiveCamera,
  hemiLight: THREE.HemisphereLight,
  sunLight: THREE.DirectionalLight,
  stage: IntroStage,
  introElapsed: number,
  totalTime: number,
  dt: number,
  pointerNdcX: number,
  pointerNdcY: number
): void {
  // Drift golden dust particles gently upward
  const count = rig.dustPositions.length / 3;
  for (let i = 0; i < count; i++) {
    let x = rig.dustPositions[i * 3];
    let y = rig.dustPositions[i * 3 + 1];
    y += dt * 0.24;
    x += Math.sin(totalTime * 0.65 + i) * dt * 0.08;
    if (y > 11.5) y = 0.4;
    rig.dustPositions[i * 3] = x;
    rig.dustPositions[i * 3 + 1] = y;
  }
  rig.dustPoints.geometry.attributes.position.needsUpdate = true;

  rig.chandelierRings.forEach((ch, idx) => {
    ch.rotation.y = Math.sin(totalTime * 0.35 + idx) * 0.08;
  });

  const ped = rig.pedestalPos;

  // Book opening / page-turning / closing animation driven by introStage & introElapsed
  let openFactor = 0; // 0 = closed flat, 1 = wide open
  let sigilGlow = 0;
  let bookLightTarget = 1.8;

  if (stage === 'intro_dark') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 0.2, 1.8);
    hemiLight.intensity = THREE.MathUtils.lerp(0.01, 0.16, p);
    sunLight.intensity = THREE.MathUtils.lerp(0.0, 0.22, p);
    rig.heroSparkMesh.visible = true;
    rig.heroSparkMesh.scale.setScalar(0.6 + Math.sin(totalTime * 5) * 0.25);
    rig.bookCoreLight.intensity = 0.25 + p * 0.6;
  } else if (stage === 'intro_library') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 1.8, 4.4);
    hemiLight.intensity = THREE.MathUtils.lerp(0.16, 0.72, p);
    sunLight.intensity = THREE.MathUtils.lerp(0.22, 0.85, p);
    rig.heroSparkMesh.visible = true;
    rig.heroSparkMesh.position.y = 2.55 + Math.sin(totalTime * 3) * 0.08;
    rig.bookCoreLight.intensity = 0.8 + p * 1.4;
  } else if (stage === 'intro_book') {
    hemiLight.intensity = 0.75;
    sunLight.intensity = 0.92;
    rig.heroSparkMesh.visible = false;
    openFactor = THREE.MathUtils.smoothstep(introElapsed, 4.4, 6.2);
    sigilGlow = THREE.MathUtils.smoothstep(introElapsed, 5.2, 7.0) * 0.58;
    bookLightTarget = 1.6 + openFactor * 3.8;
    rig.bookCoreLight.intensity = THREE.MathUtils.lerp(rig.bookCoreLight.intensity, bookLightTarget, 0.1);
  } else if (stage === 'intro_title') {
    hemiLight.intensity = 0.78;
    sunLight.intensity = 0.96;
    rig.heroSparkMesh.visible = false;
    openFactor = 1.0;
    sigilGlow = 0.55 + Math.sin(totalTime * 2.4) * 0.08;
    rig.bookCoreLight.intensity = 4.8 + Math.sin(totalTime * 2.2) * 0.4;
  } else if (stage === 'intro_close') {
    hemiLight.intensity = 0.76;
    sunLight.intensity = 0.92;
    rig.heroSparkMesh.visible = false;
    openFactor = 1.0 - THREE.MathUtils.smoothstep(introElapsed, 14.5, 16.3);
    sigilGlow = openFactor * 0.45;
    rig.bookCoreLight.intensity = 1.4 + openFactor * 3.2;
  } else {
    // Interactive Main Menu resting state: gentle open/breathing book shimmer
    hemiLight.intensity = 0.76;
    sunLight.intensity = 0.94;
    rig.heroSparkMesh.visible = false;
    openFactor = 0.92;
    sigilGlow = 0.34 + Math.sin(totalTime * 1.6) * 0.06;
    rig.bookCoreLight.intensity = 2.6 + Math.sin(totalTime * 1.8) * 0.3;
  }

  // Hinge covers naturally (closed: leftCover folded over rightCover, or flat rest)
  // When openFactor = 0, closed book cover rests flat on right half (leftCover rotated -PI over rightCover, or symmetric closed clasp)
  const rightAngle = THREE.MathUtils.lerp(0.0, -0.22, openFactor);
  const leftAngle = THREE.MathUtils.lerp(-Math.PI + 0.08, 0.22, openFactor);
  rig.rightCoverPivot.rotation.z = rightAngle;
  rig.leftCoverPivot.rotation.z = leftAngle;

  // Inner sigil glow
  rig.pageSignMats.forEach((m) => {
    m.emissiveIntensity = sigilGlow;
  });

  // Realistic sequential page-turning physics during Scene 2 & subtle menu breeze turn
  rig.pagePivots.forEach((pPivot, idx) => {
    let flip = 0;
    if (stage === 'intro_book' || stage === 'intro_title') {
      const start = 5.4 + idx * 0.78;
      flip = THREE.MathUtils.smoothstep(introElapsed, start, start + 1.15);
    } else if (stage === 'intro_close') {
      flip = 1.0 - THREE.MathUtils.smoothstep(introElapsed, 14.5, 15.6);
    } else if (stage === 'menu') {
      const cycle = ((totalTime * 0.18 + idx * 0.2) % 1.0);
      flip = cycle < 0.35 ? THREE.MathUtils.smoothstep(cycle, 0.0, 0.35) : 1.0 - THREE.MathUtils.smoothstep(cycle, 0.65, 1.0);
    }
    const maxFan = THREE.MathUtils.lerp(0.05, Math.PI - 0.36, openFactor);
    pPivot.rotation.z = flip * maxFan;
    pPivot.position.y = 0.106 + Math.sin(flip * Math.PI) * 0.065;
  });

  // Cinematic Camera Choreography
  if (stage === 'intro_dark') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 0, 1.8);
    camera.position.set(
      THREE.MathUtils.lerp(ped.x - 1.5, ped.x - 0.4, p),
      THREE.MathUtils.lerp(3.2, 3.0, p),
      THREE.MathUtils.lerp(6.8, 5.4, p)
    );
    camera.lookAt(ped.x, 2.5, ped.z);
  } else if (stage === 'intro_library') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 1.8, 4.4);
    camera.position.set(
      THREE.MathUtils.lerp(ped.x - 0.4, -3.6, p),
      THREE.MathUtils.lerp(3.0, 5.6, p),
      THREE.MathUtils.lerp(5.4, 8.2, p)
    );
    camera.lookAt(
      THREE.MathUtils.lerp(ped.x, 1.2, p),
      THREE.MathUtils.lerp(2.5, 3.8, p),
      THREE.MathUtils.lerp(ped.z, -6.5, p)
    );
  } else if (stage === 'intro_book') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 4.4, 9.8);
    camera.position.set(
      THREE.MathUtils.lerp(-3.6, ped.x - 0.55, p),
      THREE.MathUtils.lerp(5.6, 3.35, p),
      THREE.MathUtils.lerp(8.2, ped.z + 2.15, p)
    );
    camera.lookAt(ped.x, 2.32, ped.z);
  } else if (stage === 'intro_title') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 9.8, 14.5);
    camera.position.set(
      THREE.MathUtils.lerp(ped.x - 0.55, ped.x + 0.15, p),
      THREE.MathUtils.lerp(3.35, 3.65, p),
      THREE.MathUtils.lerp(ped.z + 2.15, ped.z + 3.6, p)
    );
    camera.lookAt(ped.x - 0.35, 2.65, ped.z);
  } else if (stage === 'intro_close') {
    const p = THREE.MathUtils.smoothstep(introElapsed, 14.5, 17.5);
    camera.position.set(
      THREE.MathUtils.lerp(ped.x + 0.15, -1.9, p),
      THREE.MathUtils.lerp(3.65, 3.35, p),
      THREE.MathUtils.lerp(ped.z + 3.6, 3.85, p)
    );
    camera.lookAt(
      THREE.MathUtils.lerp(ped.x - 0.35, 1.05, p),
      THREE.MathUtils.lerp(2.65, 2.75, p),
      THREE.MathUtils.lerp(ped.z, -3.5, p)
    );
  } else {
    // Interactive Main Menu framing: pedestal & castle bay cleanly right of left/upper-center UI, with gentle parallax
    const swayX = Math.sin(totalTime * 0.28) * 0.22 + pointerNdcX * 0.32;
    const swayY = Math.cos(totalTime * 0.22) * 0.1 + pointerNdcY * 0.16;
    camera.position.set(-1.9 + swayX, 3.35 + swayY, 3.85);
    camera.lookAt(1.05, 2.75, -3.5);
  }
}
