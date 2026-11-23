import * as THREE from 'three';
import type { ProceduralTextures } from './textures';
import type { DialogueEmotion } from './types';

export interface NateRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  heldBook: THREE.Group;
  heldBookLeftPage: THREE.Mesh;
  heldBookRightPage: THREE.Mesh;
  flightAura: THREE.Mesh;
  contactShadow: THREE.Mesh;
  leftEye: THREE.Object3D;
  rightEye: THREE.Object3D;
  pocketGroup: THREE.Group;
  pocketFlap: THREE.Mesh;
  shoulderAnchor: THREE.Group;
  heldSword: THREE.Group;
  dorsalSwordGroup: THREE.Group;
  heldFireBow: THREE.Group;
  fireStringTop: THREE.Mesh;
  fireStringBot: THREE.Mesh;
  fireArrowPreview: THREE.Group;
  heldArcaneBow: THREE.Group;
  arcStringTop: THREE.Mesh;
  arcStringBot: THREE.Mesh;
  arcArrowPreview: THREE.Group;
  magicAuraGroup: THREE.Group;
}

export interface JafrRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftStalk: THREE.Group;
  rightStalk: THREE.Group;
  shellGroup: THREE.Group;
  mouthMesh: THREE.Mesh;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  bubble: THREE.Mesh;
  contactShadow: THREE.Mesh;
}

export function createNateModel(tex: ProceduralTextures): NateRig {
  const root = new THREE.Group();

  const shadowMat = new THREE.MeshBasicMaterial({
    map: tex.contactShadow,
    transparent: true,
    depthWrite: false,
    opacity: 0.48,
  });
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.03;
  root.add(contactShadow);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const skinMat = new THREE.MeshStandardMaterial({
    map: tex.nateSkin,
    roughness: 0.56,
    metalness: 0.02,
  });
  const shirtMat = new THREE.MeshPhysicalMaterial({
    map: tex.nateTunic,
    normalMap: tex.nateTunicNormal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.84,
    metalness: 0.02,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xfff5e6),
  });
  const vestLeatherMat = new THREE.MeshStandardMaterial({
    map: tex.nateLeather,
    normalMap: tex.nateLeatherNormal,
    normalScale: new THREE.Vector2(0.9, 0.9),
    color: 0xd99c68,
    roughness: 0.5,
    metalness: 0.08,
  });
  const darkLeatherMat = new THREE.MeshStandardMaterial({
    map: tex.nateLeather,
    normalMap: tex.nateLeatherNormal,
    normalScale: new THREE.Vector2(0.95, 0.95),
    color: 0x915a37,
    roughness: 0.44,
    metalness: 0.12,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x2c1b10,
    roughness: 0.92,
    metalness: 0.04,
  });
  const silverMat = new THREE.MeshPhysicalMaterial({
    color: 0xd3d9e0,
    roughness: 0.22,
    metalness: 0.92,
    clearcoat: 0.45,
  });
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2b154,
    roughness: 0.24,
    metalness: 0.9,
    clearcoat: 0.4,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    map: tex.natePants,
    roughness: 0.86,
    metalness: 0.04,
  });
  const bedrollMat = new THREE.MeshStandardMaterial({
    color: 0xa1805b,
    roughness: 0.88,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    map: tex.nateHair,
    normalMap: tex.nateHairNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: 0.56,
    metalness: 0.08,
  });
  const scarfMat = new THREE.MeshPhysicalMaterial({
    map: tex.nateCape,
    normalMap: tex.nateCapeNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.78,
    metalness: 0.04,
    sheen: 0.45,
    sheenColor: new THREE.Color(0xeb6a5b),
    side: THREE.DoubleSide,
  });

  // 1. Torso: Cream Cotton Shirt + Center Button Placket
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.56, 16), shirtMat);
  torso.position.y = 1.04;
  torso.scale.set(1.06, 1, 0.86);
  torso.castShadow = true;
  bodyPivot.add(torso);

  const lowerShirt = new THREE.Mesh(new THREE.CylinderGeometry(0.232, 0.245, 0.16, 16), shirtMat);
  lowerShirt.position.y = 0.75;
  lowerShirt.scale.set(1.05, 1, 0.86);
  bodyPivot.add(lowerShirt);

  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.42, 0.02), shirtMat);
  placket.position.set(0, 1.02, 0.195);
  bodyPivot.add(placket);
  for (let b = 0; b < 4; b++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 8), darkLeatherMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0.89 + b * 0.085, 0.206);
    bodyPivot.add(btn);
  }

  // 2. Open Brown Leather Explorer Vest (left/right front panels + back + lapels + buckles)
  [-1, 1].forEach((side) => {
    const vestPanel = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.48, 0.25), vestLeatherMat);
    vestPanel.position.set(side * 0.132, 1.04, 0.04);
    vestPanel.rotation.y = side * 0.16;
    vestPanel.castShadow = true;
    bodyPivot.add(vestPanel);

    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.17, 0.04), vestLeatherMat);
    lapel.position.set(side * 0.105, 1.22, 0.185);
    lapel.rotation.z = side * 0.22;
    lapel.rotation.y = side * 0.14;
    bodyPivot.add(lapel);

    const chestPocket = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.09, 0.03), darkLeatherMat);
    chestPocket.position.set(side * 0.135, 1.07, 0.19);
    chestPocket.rotation.y = side * 0.16;
    bodyPivot.add(chestPocket);

    const vestStrap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.24, 0.035), darkLeatherMat);
    vestStrap.position.set(side * 0.155, 1.22, 0.155);
    vestStrap.rotation.x = -0.2;
    bodyPivot.add(vestStrap);

    const vestBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.044, 0.042), silverMat);
    vestBuckle.position.set(side * 0.155, 1.15, 0.195);
    bodyPivot.add(vestBuckle);
  });

  const vestBack = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.5, 0.16), vestLeatherMat);
  vestBack.position.set(0, 1.04, -0.105);
  vestBack.castShadow = true;
  bodyPivot.add(vestBack);

  // 3. Signature Red Bandana / Neckerchief around neck + Draped V-fold + Trailing Tail (cape)
  const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.052, 10, 20), scarfMat);
  scarfRing.rotation.x = Math.PI / 2 + 0.18;
  scarfRing.position.set(0, 1.33, 0.015);
  scarfRing.castShadow = true;
  bodyPivot.add(scarfRing);

  const scarfInnerFold = new THREE.Mesh(new THREE.TorusGeometry(0.148, 0.036, 8, 18), scarfMat);
  scarfInnerFold.rotation.x = Math.PI / 2 + 0.28;
  scarfInnerFold.position.set(0, 1.295, 0.035);
  bodyPivot.add(scarfInnerFold);

  const bibShape = new THREE.Shape();
  bibShape.moveTo(-0.155, 0.11);
  bibShape.quadraticCurveTo(0, 0.08, 0.155, 0.11);
  bibShape.lineTo(0.035, -0.095);
  bibShape.quadraticCurveTo(0, -0.135, -0.035, -0.095);
  bibShape.closePath();
  const bibGeo = new THREE.ExtrudeGeometry(bibShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
  const scarfFrontBib = new THREE.Mesh(bibGeo, scarfMat);
  scarfFrontBib.position.set(0, 1.2, 0.168);
  scarfFrontBib.rotation.x = -0.14;
  scarfFrontBib.castShadow = true;
  bodyPivot.add(scarfFrontBib);

  // Trailing crimson bandana fold at nape of neck (animated smoothly by animateNate via rig.cape)
  const capeGeo = new THREE.PlaneGeometry(0.22, 0.17, 3, 3);
  capeGeo.translate(0, -0.085, 0);
  const cape = new THREE.Mesh(capeGeo, scarfMat);
  cape.position.set(0, 1.36, -0.17);
  cape.rotation.x = 0.72;
  cape.castShadow = true;
  bodyPivot.add(cape);

  // 4. Heavy Leather Utility Belt, Brushed Silver Buckle, Pouches & Universal Snail Pocket
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.256, 0.095, 16), darkLeatherMat);
  belt.position.y = 0.775;
  belt.scale.set(1.06, 1, 0.88);
  belt.castShadow = true;
  bodyPivot.add(belt);

  const buckleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.098, 0.042), silverMat);
  buckleFrame.position.set(0, 0.775, 0.228);
  bodyPivot.add(buckleFrame);
  const buckleCenter = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.056, 0.046), darkLeatherMat);
  buckleCenter.position.set(0, 0.775, 0.232);
  bodyPivot.add(buckleCenter);

  // Small belt utility pouches on left hip
  [
    [-0.17, 0.19, 0.28],
    [-0.255, 0.05, 1.35],
  ].forEach(([px, pz, ry]) => {
    const pGroup = new THREE.Group();
    pGroup.position.set(px, 0.745, pz);
    pGroup.rotation.y = ry;
    const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.115, 0.075), vestLeatherMat);
    pBox.castShadow = true;
    const pFlap = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, 0.082), darkLeatherMat);
    pFlap.position.y = 0.045;
    const pSnap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8), silverMat);
    pSnap.rotation.x = Math.PI / 2;
    pSnap.position.set(0, 0.03, 0.042);
    pGroup.add(pBox, pFlap, pSnap);
    bodyPivot.add(pGroup);
  });

  // Universal Snail Pocket (US Pocket) on Nate's right hip with hinged flap & glowing cyan gem
  const pocketGroup = new THREE.Group();
  pocketGroup.position.set(0.265, 0.75, 0.06);
  const pocketBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.185, 0.18), darkLeatherMat);
  pocketBody.castShadow = true;
  const pocketRim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.032, 0.19), brassMat);
  pocketRim.position.y = 0.088;
  const pocketFlap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.19), vestLeatherMat);
  pocketFlap.position.set(0, 0.106, 0);
  const pocketGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.03, 0),
    new THREE.MeshStandardMaterial({
      color: 0x72efdd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    })
  );
  pocketGem.position.set(0.082, 0.038, 0.048);
  pocketGroup.add(pocketBody, pocketRim, pocketFlap, pocketGem);
  bodyPivot.add(pocketGroup);

  // 5. Explorer Leather Backpack + Top Rolled Sleeping Bedroll
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 1.01, -0.265);
  bodyPivot.add(backpackGroup);

  const packMain = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.39, 0.19), vestLeatherMat);
  packMain.castShadow = true;
  backpackGroup.add(packMain);

  const packTopFlap = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.2), darkLeatherMat);
  packTopFlap.position.set(0, 0.165, -0.01);
  backpackGroup.add(packTopFlap);

  [-0.1, 0.1].forEach((sx) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.35, 0.025), darkLeatherMat);
    strap.position.set(sx, 0, -0.102);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.038, 0.03), silverMat);
    buckle.position.set(sx, 0.05, -0.108);
    backpackGroup.add(strap, buckle);
  });

  [-0.195, 0.195].forEach((px) => {
    const sidePocket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.21, 0.12), darkLeatherMat);
    sidePocket.position.set(px, -0.04, 0.01);
    backpackGroup.add(sidePocket);
  });

  // Rolled canvas bedroll strapped cleanly across top of backpack
  const bedroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.4, 14),
    bedrollMat
  );
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 0.235, -0.02);
  bedroll.castShadow = true;
  backpackGroup.add(bedroll);

  [-0.11, 0.11].forEach((cx) => {
    const cinch = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.032, 12), darkLeatherMat);
    cinch.rotation.z = Math.PI / 2;
    cinch.position.set(cx, 0.235, -0.02);
    backpackGroup.add(cinch);
  });

  // Shoulder straps arching smoothly from backpack over chest
  [-1, 1].forEach((side) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.026, 8, 14, Math.PI), darkLeatherMat);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(side * 0.155, 1.24, -0.02);
    bodyPivot.add(arch);
  });

  // Right shoulder anchor where Jafr rides during Chapter 2
  const shoulderAnchor = new THREE.Group();
  shoulderAnchor.position.set(0.29, 1.35, -0.02);
  bodyPivot.add(shoulderAnchor);

  // 6. Stylized Boy Head, Warm Face, Expressive Eyes, Thick Brows & Tousled Spiky Hair
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.36, 0);
  bodyPivot.add(headGroup);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.095, 0.15, 12), skinMat);
  neck.position.y = 0.04;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 20), skinMat);
  head.position.y = 0.235;
  head.scale.set(0.98, 1.03, 1.01);
  head.castShadow = true;
  headGroup.add(head);

  const chinContour = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), skinMat);
  chinContour.position.set(0, 0.14, 0.065);
  chinContour.scale.set(0.92, 0.72, 0.92);
  headGroup.add(chinContour);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.031, 10, 10), skinMat);
  nose.position.set(0, 0.21, 0.228);
  nose.scale.set(1.05, 0.85, 1.15);
  headGroup.add(nose);

  // Confident friendly smile arc
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.044, 0.0085, 6, 14, Math.PI * 0.72),
    new THREE.MeshBasicMaterial({ color: 0x7c3a2b })
  );
  smile.position.set(0, 0.165, 0.205);
  smile.rotation.z = Math.PI + Math.PI * 0.14;
  smile.rotation.x = 0.25;
  headGroup.add(smile);

  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 10), skinMat);
    ear.position.set(side * 0.222, 0.22, -0.01);
    ear.scale.set(0.55, 1.05, 0.75);
    headGroup.add(ear);
  });

  // Sculpted Tousled Spiky Brown Hair (crown dome, nape locks, sideburns & swept bangs)
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.244, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.64),
    hairMat
  );
  hairCap.position.set(0, 0.255, -0.025);
  hairCap.rotation.x = -0.34;
  hairCap.castShadow = true;
  headGroup.add(hairCap);

  // Back-of-head hair volume & nape locks
  const backHair = new THREE.Mesh(
    new THREE.SphereGeometry(0.236, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat
  );
  backHair.position.set(0, 0.225, -0.055);
  backHair.rotation.x = -1.15;
  headGroup.add(backHair);

  // Sideburns framing temples
  [-1, 1].forEach((side) => {
    const sideburn = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.12, 7), hairMat);
    sideburn.position.set(side * 0.205, 0.23, 0.085);
    sideburn.rotation.x = Math.PI - 0.18;
    sideburn.rotation.z = side * 0.14;
    headGroup.add(sideburn);
  });

  // Swept-up crown spikes & textured forehead fringe tufts matching the character showcase
  const hairTufts: [number, number, number, number, number, number, number, number][] = [
    // [x, y, z, rx, ry, rz, radius, height]
    [-0.12, 0.37, 0.165, 0.92, 0.1, 0.42, 0.052, 0.17],
    [-0.04, 0.39, 0.18, 0.96, 0.05, 0.26, 0.056, 0.18],
    [0.05, 0.395, 0.175, 0.9, -0.1, 0.18, 0.058, 0.185],
    [0.13, 0.365, 0.155, 0.85, -0.15, -0.35, 0.05, 0.16],
    // Upper crown swept-back spikes
    [-0.09, 0.485, 0.04, -0.35, 0.15, 0.45, 0.065, 0.21],
    [0.01, 0.515, 0.02, -0.45, 0, 0.18, 0.072, 0.23],
    [0.11, 0.485, 0.03, -0.38, -0.15, -0.38, 0.064, 0.2],
    [-0.14, 0.44, -0.08, -0.78, 0.25, 0.55, 0.06, 0.19],
    [0.0, 0.47, -0.11, -0.88, 0, 0.1, 0.068, 0.21],
    [0.14, 0.44, -0.08, -0.78, -0.25, -0.55, 0.06, 0.19],
    // Back crown & nape spiky locks
    [-0.09, 0.32, -0.21, -1.65, 0.2, 0.3, 0.052, 0.16],
    [0.0, 0.34, -0.225, -1.7, 0, 0, 0.058, 0.17],
    [0.09, 0.32, -0.21, -1.65, -0.2, -0.3, 0.052, 0.16],
  ];
  hairTufts.forEach(([x, y, z, rx, ry, rz, rad, h]) => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 7), hairMat);
    tuft.position.set(x, y, z);
    tuft.rotation.set(rx, ry, rz);
    tuft.scale.set(1.15, 1.0, 0.68);
    tuft.castShadow = true;
    headGroup.add(tuft);
  });

  // Expressive Eyes (sclera + warm hazel-brown iris + dark pupil + white catchlight + lash rim)
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x613518 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x160d07 });
  const lashMat = new THREE.MeshBasicMaterial({ color: 0x26150a });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x2f190c, roughness: 0.7 });

  const eyeGroups: THREE.Group[] = [];
  [-1, 1].forEach((side) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * 0.082, 0.242, 0.196);
    headGroup.add(eyeGroup);
    eyeGroups.push(eyeGroup);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 12), eyeWhiteMat);
    sclera.scale.set(1.02, 1.15, 0.56);
    eyeGroup.add(sclera);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.029, 10, 10), irisMat);
    iris.position.set(0, 0, 0.017);
    iris.scale.set(1, 1.12, 0.45);
    eyeGroup.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), pupilMat);
    pupil.position.set(0, 0, 0.025);
    pupil.scale.set(1, 1.08, 0.4);
    eyeGroup.add(pupil);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 6, 6), eyeWhiteMat);
    glint.position.set(0.011, 0.013, 0.03);
    eyeGroup.add(glint);

    const upperLash = new THREE.Mesh(
      new THREE.TorusGeometry(0.043, 0.005, 6, 12, Math.PI * 0.9),
      lashMat
    );
    upperLash.position.set(0, 0.008, 0.014);
    upperLash.rotation.z = Math.PI * 0.05;
    eyeGroup.add(upperLash);

    // Expressive arched brown eyebrow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.022, 0.026), browMat);
    brow.position.set(side * 0.084, 0.308, 0.205);
    brow.rotation.z = -side * 0.11;
    headGroup.add(brow);
  });
  const [leftEye, rightEye] = eyeGroups;

  // 7. Arms: Rolled-Up Cream Sleeves, Exposed Forearms & Fingerless Leather Gloves
  function createArm(side: number): THREE.Group {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.285, 1.26, 0);

    // Upper cream shirt sleeve
    const upperSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.076, 0.21, 12),
      shirtMat
    );
    upperSleeve.position.y = -0.105;
    upperSleeve.castShadow = true;
    pivot.add(upperSleeve);

    // Folded rolled-up shirt cuff just above elbow
    const rolledCuff = new THREE.Mesh(new THREE.TorusGeometry(0.073, 0.022, 8, 14), shirtMat);
    rolledCuff.rotation.x = Math.PI / 2;
    rolledCuff.position.y = -0.205;
    rolledCuff.castShadow = true;
    pivot.add(rolledCuff);

    // Exposed warm skin forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.055, 0.2, 10), skinMat);
    forearm.position.y = -0.305;
    forearm.castShadow = true;
    pivot.add(forearm);

    // Fingerless dark leather glove cuff + palm wrap
    const gloveCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.063, 0.061, 0.05, 10),
      darkLeatherMat
    );
    gloveCuff.position.y = -0.405;
    pivot.add(gloveCuff);

    const glovePalm = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.072, 0.098), darkLeatherMat);
    glovePalm.position.set(0, -0.455, 0.005);
    glovePalm.castShadow = true;
    pivot.add(glovePalm);

    // Exposed fingers & thumb sticking cleanly out of fingerless glove
    const fingers = new THREE.Mesh(new THREE.SphereGeometry(0.044, 8, 8), skinMat);
    fingers.position.set(0, -0.502, 0.01);
    fingers.scale.set(0.95, 0.85, 1.05);
    pivot.add(fingers);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.032, 4, 6), skinMat);
    thumb.position.set(-side * 0.052, -0.468, 0.042);
    thumb.rotation.z = side * 0.4;
    pivot.add(thumb);

    return pivot;
  }

  const leftArm = createArm(-1);
  const rightArm = createArm(1);
  bodyPivot.add(leftArm, rightArm);

  // Sculpted Pelicon Broadsword attached cleanly to Nate's right-hand grip socket
  const heldSword = new THREE.Group();
  heldSword.position.set(0, -0.5, 0.045);
  heldSword.rotation.x = Math.PI / 2 - 0.14;
  heldSword.visible = false;
  const bladeMat = new THREE.MeshPhysicalMaterial({
    map: tex.damascusSteel,
    color: 0xebf2fa,
    metalness: 0.9,
    roughness: 0.16,
    clearcoat: 0.65,
  });
  const swGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.22, 10), darkLeatherMat);
  const swGripWrap = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 6, 12), brassMat);
  swGripWrap.rotation.x = Math.PI / 2;
  const swPommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), brassMat);
  swPommel.position.y = -0.125;
  const swGuardCenter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.062), brassMat);
  swGuardCenter.position.y = 0.115;
  const swGuardGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.018, 0),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.25, roughness: 0.15 })
  );
  swGuardGem.position.set(0, 0.115, 0.034);
  [-1, 1].forEach((qs) => {
    const quillion = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.13, 8), brassMat);
    quillion.position.set(qs * 0.085, 0.13, 0);
    quillion.rotation.z = -qs * 1.18;
    const tipOrb = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), brassMat);
    tipOrb.position.set(qs * 0.142, 0.155, 0);
    heldSword.add(quillion, tipOrb);
  });
  const swBladeMain = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.88, 0.016), bladeMat);
  swBladeMain.position.y = 0.565;
  const swFuller = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.72, 0.021),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.26 })
  );
  swFuller.position.y = 0.53;
  const swTip = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.15, 4), bladeMat);
  swTip.rotation.y = Math.PI / 4;
  swTip.scale.set(1.25, 1, 0.42);
  swTip.position.y = 1.075;
  heldSword.add(swGrip, swGripWrap, swPommel, swGuardCenter, swGuardGem, swBladeMain, swFuller, swTip);
  rightArm.add(heldSword);

  // Dorsal Sheathed Greatsword + Leather-and-Gold Scabbard on Nate's back (matches Concept Sheet 1)
  const dorsalSwordGroup = new THREE.Group();
  dorsalSwordGroup.position.set(0.02, 1.02, -0.225);
  dorsalSwordGroup.rotation.set(0.14, 0.04, -0.58);
  dorsalSwordGroup.visible = false;
  const scabbard = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.92, 0.036), darkLeatherMat);
  scabbard.position.y = -0.05;
  const scabbardTip = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.14, 4), brassMat);
  scabbardTip.rotation.x = Math.PI;
  scabbardTip.rotation.y = Math.PI / 4;
  scabbardTip.scale.set(1.15, 1, 0.5);
  scabbardTip.position.y = -0.57;
  const scabbardCollar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.046), brassMat);
  scabbardCollar.position.y = 0.39;
  const dGuard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.036, 0.052), brassMat);
  dGuard.position.y = 0.44;
  const dGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.2, 8), darkLeatherMat);
  dGrip.position.y = 0.55;
  const dPommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), brassMat);
  dPommel.position.y = 0.67;
  dorsalSwordGroup.add(scabbard, scabbardTip, scabbardCollar, dGuard, dGrip, dPommel);
  bodyPivot.add(dorsalSwordGroup);

  // Sculpted Recurve Bow Builder with Articulated Bowstring Segments & Nocked Arrow
  const buildSculptedBow = (limbColor: number, emissiveHex: number, emissiveInt: number, stringHex: number, arrowTipHex: number) => {
    const bowGroup = new THREE.Group();
    bowGroup.position.set(-0.02, -0.49, 0.06);
    bowGroup.visible = false;

    const limbMat = new THREE.MeshPhysicalMaterial({
      color: limbColor,
      emissive: emissiveHex,
      emissiveIntensity: emissiveInt,
      metalness: 0.68,
      roughness: 0.26,
      clearcoat: 0.4,
    });
    const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.22, 10), brassMat);
    bowGroup.add(riser);

    [-1, 1].forEach((dir) => {
      const limbUpper = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 18, Math.PI * 0.48), limbMat);
      limbUpper.rotation.y = Math.PI / 2;
      limbUpper.position.set(0, dir * 0.14, 0.02);
      if (dir > 0) {
        limbUpper.rotation.z = -0.15;
      } else {
        limbUpper.rotation.z = Math.PI + 0.15;
        limbUpper.rotation.x = Math.PI;
      }
      const hornTip = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 6), brassMat);
      hornTip.position.set(0, dir * 0.49, -0.14);
      hornTip.rotation.x = dir > 0 ? -0.9 : Math.PI + 0.9;
      bowGroup.add(limbUpper, hornTip);
    });

    const coreGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.036, 0),
      new THREE.MeshStandardMaterial({ color: arrowTipHex, emissive: emissiveHex, emissiveIntensity: emissiveInt + 0.1, roughness: 0.2 })
    );
    coreGem.position.set(0, 0, 0.038);
    bowGroup.add(coreGem);

    const strMat = new THREE.MeshBasicMaterial({ color: stringHex });
    const stringTop = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.5, 6), strMat);
    const stringBot = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.5, 6), strMat);
    stringTop.position.set(0, 0.24, -0.14);
    stringBot.position.set(0, -0.24, -0.14);
    bowGroup.add(stringTop, stringBot);

    const arrowGroup = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.72, 6),
      new THREE.MeshStandardMaterial({ color: 0xead8b8, roughness: 0.5 })
    );
    shaft.rotation.x = Math.PI / 2;
    const headCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.026, 0.1, 4),
      new THREE.MeshStandardMaterial({ color: arrowTipHex, emissive: emissiveHex, emissiveIntensity: 0.35, roughness: 0.2 })
    );
    headCone.rotation.x = Math.PI / 2;
    headCone.position.z = 0.38;
    const fletch = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.008, 0.11),
      new THREE.MeshBasicMaterial({ color: stringHex })
    );
    fletch.position.z = -0.3;
    arrowGroup.add(shaft, headCone, fletch);
    arrowGroup.position.set(0, 0, 0.18);
    bowGroup.add(arrowGroup);

    return { bowGroup, stringTop, stringBot, arrowGroup };
  };

  const fireBowParts = buildSculptedBow(0xd97706, 0xc2410c, 0.24, 0xfef08a, 0xfb923c);
  const heldFireBow = fireBowParts.bowGroup;
  const fireStringTop = fireBowParts.stringTop;
  const fireStringBot = fireBowParts.stringBot;
  const fireArrowPreview = fireBowParts.arrowGroup;
  leftArm.add(heldFireBow);

  const arcBowParts = buildSculptedBow(0x6d28d9, 0x7e22ce, 0.28, 0xddd6fe, 0x67e8f9);
  const heldArcaneBow = arcBowParts.bowGroup;
  const arcStringTop = arcBowParts.stringTop;
  const arcStringBot = arcBowParts.stringBot;
  const arcArrowPreview = arcBowParts.arrowGroup;
  leftArm.add(heldArcaneBow);

  // 8. Legs: Olive-Sage Cargo Pants, Knee Pads & Chunky Buckled Lace-Up Boots (flush y=0)
  function createLeg(side: number): THREE.Group {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.135, 0.68, 0);

    // Olive cargo pant leg
    const pantLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.088, 0.35, 12), pantsMat);
    pantLeg.position.y = -0.175;
    pantLeg.castShadow = true;
    pivot.add(pantLeg);

    // Outer thigh cargo pocket + stitched flap
    const cargoPocket = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.135, 0.125), pantsMat);
    cargoPocket.position.set(side * 0.094, -0.14, 0.008);
    cargoPocket.castShadow = true;
    pivot.add(cargoPocket);
    const cargoFlap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.038, 0.132), pantsMat);
    cargoFlap.position.set(side * 0.096, -0.085, 0.008);
    pivot.add(cargoFlap);

    // Rounded brown leather knee pad + strap
    const kneePad = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), darkLeatherMat);
    kneePad.position.set(0, -0.245, 0.078);
    kneePad.scale.set(1.02, 1.25, 0.45);
    kneePad.castShadow = true;
    pivot.add(kneePad);

    const kneeStrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.094, 0.094, 0.025, 12),
      darkLeatherMat
    );
    kneeStrap.position.y = -0.245;
    pivot.add(kneeStrap);

    // Bloused pant cuff over boot collar
    const pantCuff = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.026, 8, 14), pantsMat);
    pantCuff.rotation.x = Math.PI / 2;
    pantCuff.position.y = -0.345;
    pivot.add(pantCuff);

    // Tall explorer leather boot shaft
    const bootShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.094, 0.098, 0.25, 12),
      vestLeatherMat
    );
    bootShaft.position.y = -0.475;
    bootShaft.castShadow = true;
    pivot.add(bootShaft);

    const bootCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.102, 0.096, 0.05, 12),
      darkLeatherMat
    );
    bootCollar.position.y = -0.375;
    pivot.add(bootCollar);

    // Twin buckled leather ankle/shin straps
    [-0.415, -0.505].forEach((sy) => {
      const strap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.101, 0.101, 0.026, 12),
        darkLeatherMat
      );
      strap.position.y = sy;
      const bBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.032, 0.034), silverMat);
      bBuckle.position.set(side * 0.098, sy, 0.02);
      pivot.add(strap, bBuckle);
    });

    // Cross-laced boot front tongue bars
    [-0.43, -0.47, -0.51].forEach((ly) => {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.02), soleMat);
      lace.position.set(0, ly, 0.095);
      pivot.add(lace);
    });

    // Chunky rounded leather boot toe + heel + lugged sole (bottom flush at y = -0.68 -> world y = 0)
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.105, 0.235), vestLeatherMat);
    toe.position.set(0, -0.595, 0.052);
    toe.castShadow = true;
    pivot.add(toe);

    const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 10), darkLeatherMat);
    toeCap.position.set(0, -0.598, 0.125);
    toeCap.scale.set(1.0, 0.68, 0.85);
    pivot.add(toeCap);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.168, 0.048, 0.258), soleMat);
    sole.position.set(0, -0.656, 0.048);
    sole.castShadow = true;
    pivot.add(sole);

    return pivot;
  }

  const leftLeg = createLeg(-1);
  const rightLeg = createLeg(1);
  bodyPivot.add(leftLeg, rightLeg);

  // Held Mysterious Book prop (with real ornate arcane glass/manuscript texture)
  const heldBook = new THREE.Group();
  heldBook.position.set(0, 1.02, 0.42);
  heldBook.visible = false;
  const coverMat = new THREE.MeshStandardMaterial({
    map: tex.arcaneGlass,
    color: 0xd9c5ff,
    roughness: 0.38,
    metalness: 0.32,
    emissive: 0x3b1e7a,
    emissiveIntensity: 0.18,
  });
  const pageMat = new THREE.MeshStandardMaterial({
    map: tex.bookPage,
    emissive: 0x7dd3fc,
    emissiveIntensity: 0.12,
    roughness: 0.6,
  });
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), brassMat);
  heldBook.add(spine);
  const leftCover = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.025), coverMat);
  leftCover.position.set(-0.12, 0, 0.02);
  leftCover.rotation.y = 0.45;
  const rightCover = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.025), coverMat);
  rightCover.position.set(0.12, 0, 0.02);
  rightCover.rotation.y = -0.45;
  const heldBookLeftPage = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.28), pageMat);
  heldBookLeftPage.position.set(-0.11, 0, 0.036);
  heldBookLeftPage.rotation.y = 0.45;
  const heldBookRightPage = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.28), pageMat);
  heldBookRightPage.position.set(0.11, 0, 0.036);
  heldBookRightPage.rotation.y = -0.45;
  heldBook.add(leftCover, rightCover, heldBookLeftPage, heldBookRightPage);
  bodyPivot.add(heldBook);

  // Flight magic circle under boots
  const flightAura = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.65, 28),
    new THREE.MeshBasicMaterial({
      color: 0x6fe7ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  flightAura.rotation.x = -Math.PI / 2;
  flightAura.position.y = 0.1;
  root.add(flightAura);

  // Act 9 Hidden Magic Swirling Golden Rune Rings
  const magicAuraGroup = new THREE.Group();
  magicAuraGroup.visible = false;
  for (let r = 0; r < 3; r++) {
    const mRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55 + r * 0.24, 0.018, 8, 32),
      new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0xfbbf24 : 0x72efdd,
        transparent: true,
        opacity: 0.78,
      })
    );
    mRing.rotation.x = Math.PI / 2 + (r - 1) * 0.28;
    mRing.position.y = 0.45 + r * 0.42;
    magicAuraGroup.add(mRing);
  }
  root.add(magicAuraGroup);

  return {
    root,
    bodyPivot,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    heldBook,
    heldBookLeftPage,
    heldBookRightPage,
    flightAura,
    contactShadow,
    leftEye,
    rightEye,
    pocketGroup,
    pocketFlap,
    shoulderAnchor,
    heldSword,
    dorsalSwordGroup,
    heldFireBow,
    fireStringTop,
    fireStringBot,
    fireArrowPreview,
    heldArcaneBow,
    arcStringTop,
    arcStringBot,
    arcArrowPreview,
    magicAuraGroup,
  };
}

export type NateCh2Pose =
  | 'normal'
  | 'lying'
  | 'waking'
  | 'exhausted'
  | 'gesture'
  | 'kneel'
  | 'sitBed'
  | 'sleepBed'
  | 'hug'
  | 'magicAwaken';

export function animateNate(
  rig: NateRig,
  dt: number,
  time: number,
  opts: {
    speed: number;
    isRunning: boolean;
    isGrounded: boolean;
    isFlying: boolean;
    isSitting: boolean;
    hasBook: boolean;
    shocked: boolean;
    ch2Pose?: NateCh2Pose;
    pocketOpen?: boolean;
    ch4Weapon?: 'none' | 'sword' | 'fire_bow' | 'arcane_bow';
    hasSwordCollected?: boolean;
    swordSwingTimer?: number;
    swordComboStep?: number;
    isBlocking?: boolean;
    isDodging?: boolean;
    bowAiming?: boolean;
    hitReactionTimer?: number;
  }
): void {
  const blend = 1 - Math.exp(-12 * dt);

  rig.pocketFlap.rotation.z = THREE.MathUtils.lerp(
    rig.pocketFlap.rotation.z,
    opts.pocketOpen ? -1.15 : 0,
    blend
  );

  const weapon = opts.ch4Weapon ?? 'none';
  rig.heldSword.visible = weapon === 'sword';
  rig.dorsalSwordGroup.visible = Boolean(opts.hasSwordCollected) && weapon !== 'sword';
  rig.heldFireBow.visible = weapon === 'fire_bow';
  rig.heldArcaneBow.visible = weapon === 'arcane_bow';
  rig.magicAuraGroup.visible = opts.ch2Pose === 'magicAwaken';
  if (rig.magicAuraGroup.visible) {
    rig.magicAuraGroup.children.forEach((ch, idx) => {
      ch.rotation.z += dt * (1.8 + idx * 0.7) * (idx % 2 === 0 ? 1 : -1);
      ch.position.y = 0.45 + idx * 0.42 + Math.sin(time * 3.5 + idx) * 0.08;
    });
  }

  const blinkPhase = time % 3.9;
  const pose = opts.ch2Pose ?? 'normal';
  const eyesClosed = pose === 'lying' || pose === 'sleepBed';
  const eyeScaleY = eyesClosed
    ? 0.1
    : blinkPhase > 3.76 && !opts.shocked
    ? 0.14
    : opts.shocked
    ? 1.14
    : 1.0;
  rig.leftEye.scale.y = THREE.MathUtils.lerp(rig.leftEye.scale.y, eyeScaleY, 0.45);
  rig.rightEye.scale.y = THREE.MathUtils.lerp(rig.rightEye.scale.y, eyeScaleY, 0.45);

  rig.heldBook.visible = opts.hasBook;
  rig.bodyPivot.rotation.z = THREE.MathUtils.lerp(rig.bodyPivot.rotation.z, 0, blend);
  rig.headGroup.rotation.y = THREE.MathUtils.lerp(rig.headGroup.rotation.y, 0, blend);

  if (pose === 'lying') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, 0.24, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -Math.PI / 2 + 0.08, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0.08, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -0.05, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, 0.18, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.1, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.32, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.28, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, 0.12, blend);
    rig.headGroup.rotation.y = THREE.MathUtils.lerp(rig.headGroup.rotation.y, 0.22, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 0.05, blend);
    rig.contactShadow.visible = false;
    (rig.flightAura.material as THREE.MeshBasicMaterial).opacity = 0;
    return;
  }

  if (pose === 'waking') {
    // Sitting up on the sand, touching chin in confusion & looking around
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, -0.38, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -0.14, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, -1.25, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -0.88, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, 0.35, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.35, blend);
    // Right hand raised touching chin!
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -2.05, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, -0.32, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, 0.08, blend);
    rig.headGroup.rotation.y = THREE.MathUtils.lerp(
      rig.headGroup.rotation.y,
      Math.sin(time * 2.1) * 0.45,
      blend
    );
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 0.72, blend);
    rig.contactShadow.visible = true;
    (rig.flightAura.material as THREE.MeshBasicMaterial).opacity = 0;
    return;
  }

  if (pose === 'kneel') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, -0.34, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.28, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, -1.1, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0.9, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -1.05, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -1.15, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, 0.25, blend);
    rig.contactShadow.visible = true;
    return;
  }

  if (pose === 'sitBed') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, -0.02, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.06, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, -1.22, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -1.22, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.35, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.35, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(
      rig.headGroup.rotation.x,
      0.12 + Math.sin(time * 1.4) * 0.05,
      blend
    );
    rig.contactShadow.visible = false;
    return;
  }

  if (pose === 'sleepBed') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, 0.26, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -Math.PI / 2 + 0.04, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0.05, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -0.04, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.15, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.15, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.18, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.18, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 0.04, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, 0.05, blend);
    rig.contactShadow.visible = false;
    return;
  }

  if (pose === 'hug') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, 0, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.06, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -1.15, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -1.15, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, 0.28, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, -0.28, blend);
    rig.headGroup.rotation.y = THREE.MathUtils.lerp(rig.headGroup.rotation.y, 0.14, blend);
    rig.contactShadow.visible = true;
    return;
  }

  if (pose === 'magicAwaken') {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(
      rig.bodyPivot.position.y,
      0.08 + Math.sin(time * 3.2) * 0.05,
      blend
    );
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -0.08, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.5, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.5, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.55, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.55, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 1.08 + Math.sin(time * 8) * 0.12, blend);
    rig.contactShadow.visible = true;
    return;
  }

  if (pose === 'gesture') {
    // Non-verbal expression gesture (shrugging / pointing forward)
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, 0, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.05, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.75, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(
      rig.rightArm.rotation.x,
      -1.05 + Math.sin(time * 4.5) * 0.14,
      blend
    );
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.35, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.35, blend);
    rig.headGroup.rotation.y = THREE.MathUtils.lerp(
      rig.headGroup.rotation.y,
      Math.sin(time * 2.2) * 0.25,
      blend
    );
    rig.contactShadow.visible = true;
    return;
  }

  if (opts.isSitting) {
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, -0.28, blend);
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, -1.35, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, -1.35, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.78, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.78, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.2, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.2, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(
      rig.headGroup.rotation.x,
      opts.shocked ? -0.18 + Math.sin(time * 24) * 0.03 : 0.22,
      blend
    );
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 0.45, blend);
    (rig.flightAura.material as THREE.MeshBasicMaterial).opacity = 0;
    rig.contactShadow.visible = false;
    return;
  }

  rig.contactShadow.visible = !opts.isFlying;

  if (opts.isFlying) {
    const tilt = Math.min(0.65, opts.speed * 0.04 + 0.18);
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(
      rig.bodyPivot.position.y,
      Math.sin(time * 3.5) * 0.09,
      blend
    );
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, tilt, blend);
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0.22, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0.36, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, 0.35, blend);
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, 0.35, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.55, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.55, blend);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, -tilt * 0.7, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(
      rig.cape.rotation.x,
      1.18 + Math.sin(time * 10) * 0.14,
      blend
    );
    const auraMat = rig.flightAura.material as THREE.MeshBasicMaterial;
    auraMat.opacity = THREE.MathUtils.lerp(auraMat.opacity, 0.72, blend);
    rig.flightAura.rotation.z += dt * 3.2;
    return;
  }

  const exhausted = pose === 'exhausted';
  const auraMat = rig.flightAura.material as THREE.MeshBasicMaterial;
  auraMat.opacity = THREE.MathUtils.lerp(auraMat.opacity, 0, blend);
  rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(
    rig.bodyPivot.rotation.x,
    exhausted ? 0.14 + Math.sin(time * 1.9) * 0.025 : opts.isRunning ? 0.14 : 0,
    blend
  );

  if (!opts.isGrounded) {
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, -0.45, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0.35, blend);
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.5, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.5, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 0.98, blend);
    return;
  }

  if (opts.speed > 0.35) {
    const strideFreq = exhausted ? 5.6 : opts.isRunning ? 12.5 : 8.5;
    const strideAmp = exhausted ? 0.38 : opts.isRunning ? 0.85 : 0.55;
    const phase = time * strideFreq;
    rig.leftLeg.rotation.x = Math.sin(phase) * strideAmp;
    rig.rightLeg.rotation.x = -Math.sin(phase) * strideAmp;
    if (opts.hasBook) {
      rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.68, blend);
      rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.68, blend);
    } else {
      rig.leftArm.rotation.x = -Math.sin(phase) * strideAmp * (exhausted ? 0.45 : 0.75);
      rig.rightArm.rotation.x = Math.sin(phase) * strideAmp * (exhausted ? 0.45 : 0.75);
    }
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, exhausted ? -0.14 : -0.08, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, exhausted ? 0.14 : 0.08, blend);
    rig.bodyPivot.position.y = Math.abs(Math.sin(phase)) * (exhausted ? 0.025 : opts.isRunning ? 0.08 : 0.04);
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, exhausted ? 0.16 : 0, blend);
    rig.cape.rotation.x = THREE.MathUtils.lerp(
      rig.cape.rotation.x,
      (opts.isRunning ? 1.02 : 0.78) + Math.sin(phase * 1.1) * 0.08,
      blend
    );
  } else {
    rig.leftLeg.rotation.x = THREE.MathUtils.lerp(rig.leftLeg.rotation.x, 0, blend);
    rig.rightLeg.rotation.x = THREE.MathUtils.lerp(rig.rightLeg.rotation.x, 0, blend);
    rig.leftArm.rotation.x = THREE.MathUtils.lerp(
      rig.leftArm.rotation.x,
      opts.hasBook ? -0.68 : exhausted ? 0.1 : 0,
      blend
    );
    rig.rightArm.rotation.x = THREE.MathUtils.lerp(
      rig.rightArm.rotation.x,
      opts.hasBook ? -0.68 : exhausted ? 0.1 : 0,
      blend
    );
    rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, exhausted ? -0.12 : -0.06, blend);
    rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, exhausted ? 0.12 : 0.06, blend);
    // Heavy breathing idle bob when exhausted
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(
      rig.bodyPivot.position.y,
      exhausted ? Math.sin(time * 2.1) * 0.035 : Math.sin(time * 2.1) * 0.02,
      blend
    );
    rig.headGroup.rotation.x = THREE.MathUtils.lerp(
      rig.headGroup.rotation.x,
      exhausted ? 0.18 + Math.sin(time * 2.1) * 0.05 : 0,
      blend
    );
    rig.cape.rotation.x = THREE.MathUtils.lerp(
      rig.cape.rotation.x,
      0.7 + Math.sin(time * 1.8) * 0.04,
      blend
    );
  }

  // Chapter 4 Combat Arm & Upper-Body Overrides (3-Hit Combo Sword, Guard/Block, Bow String Draw, Dodge, Hit Reaction)
  if (opts.hitReactionTimer && opts.hitReactionTimer > 0) {
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -0.26, 0.45);
  }
  if (opts.isDodging) {
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0.36, 0.55);
    rig.bodyPivot.position.y = THREE.MathUtils.lerp(rig.bodyPivot.position.y, -0.18, 0.55);
    rig.cape.rotation.x = THREE.MathUtils.lerp(rig.cape.rotation.x, 1.15, 0.55);
  }
  if (weapon === 'sword') {
    if (opts.swordSwingTimer && opts.swordSwingTimer > 0) {
      const p = 1 - Math.min(1, opts.swordSwingTimer / 0.34);
      const combo = (opts.swordComboStep ?? 0) % 3;
      if (combo === 0) {
        // Diagonal downward cleave
        rig.rightArm.rotation.x = -2.2 + p * 2.65;
        rig.rightArm.rotation.z = 0.58 - p * 1.15;
      } else if (combo === 1) {
        // Horizontal backhand slash
        rig.rightArm.rotation.x = -1.25;
        rig.rightArm.rotation.z = -0.85 + p * 1.9;
        rig.bodyPivot.rotation.z = (0.5 - p) * 0.14;
      } else {
        // Rising heavy uppercut slash
        rig.rightArm.rotation.x = 0.35 - p * 2.55;
        rig.rightArm.rotation.z = 0.25;
      }
    } else if (opts.isBlocking) {
      // Defensive guard stance holding sword diagonally across chest
      rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -1.28, 0.55);
      rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, -0.75, 0.55);
      rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -1.05, 0.55);
      rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, 0.35, 0.55);
    } else {
      rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -0.62, blend);
      rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, 0.22, blend);
    }
  } else if (weapon === 'fire_bow' || weapon === 'arcane_bow') {
    const pullAmt = opts.bowAiming ? 1.0 : 0.0;
    const stringDrawZ = THREE.MathUtils.lerp(-0.14, -0.34, pullAmt);
    const arrowDrawZ = THREE.MathUtils.lerp(0.18, -0.02, pullAmt);
    const activeTop = weapon === 'fire_bow' ? rig.fireStringTop : rig.arcStringTop;
    const activeBot = weapon === 'fire_bow' ? rig.fireStringBot : rig.arcStringBot;
    const activeArrow = weapon === 'fire_bow' ? rig.fireArrowPreview : rig.arcArrowPreview;

    // Anchor bowstring segments between horn tips (y = +-0.48, z = -0.14) and drawing nock (y = 0, z = stringDrawZ)
    const dz = stringDrawZ - -0.14;
    const segLen = Math.hypot(0.48, dz);
    const tilt = Math.atan2(dz, 0.48);
    activeTop.position.set(0, 0.24, -0.14 + dz * 0.5);
    activeTop.rotation.x = tilt;
    activeTop.scale.set(1, segLen / 0.5, 1);
    activeBot.position.set(0, -0.24, -0.14 + dz * 0.5);
    activeBot.rotation.x = -tilt;
    activeBot.scale.set(1, segLen / 0.5, 1);
    activeArrow.position.z = arrowDrawZ;

    if (opts.bowAiming) {
      rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -1.52, 0.48);
      rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.06, 0.48);
      rig.rightArm.rotation.x = THREE.MathUtils.lerp(rig.rightArm.rotation.x, -1.46, 0.48);
      rig.rightArm.rotation.z = THREE.MathUtils.lerp(rig.rightArm.rotation.z, -0.28, 0.48);
    } else {
      rig.leftArm.rotation.x = THREE.MathUtils.lerp(rig.leftArm.rotation.x, -0.52, blend);
      rig.leftArm.rotation.z = THREE.MathUtils.lerp(rig.leftArm.rotation.z, -0.18, blend);
    }
  }
}

export function createJafrModel(tex: ProceduralTextures): JafrRig {
  const root = new THREE.Group();

  const shadowMat = new THREE.MeshBasicMaterial({
    map: tex.contactShadow,
    transparent: true,
    depthWrite: false,
    opacity: 0.38,
  });
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  root.add(contactShadow);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const snailSkin = new THREE.MeshPhysicalMaterial({
    color: 0xe6d79d,
    roughness: 0.32,
    metalness: 0.02,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
  });
  const shellMain = new THREE.MeshPhysicalMaterial({
    map: tex.jafrShell,
    roughness: 0.24,
    metalness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });
  const shellGold = new THREE.MeshPhysicalMaterial({
    color: 0xdfb256,
    roughness: 0.2,
    metalness: 0.75,
    clearcoat: 0.6,
  });

  // Soft foot & head
  const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 6, 12), snailSkin);
  foot.rotation.x = Math.PI / 2;
  foot.position.set(0, 0.1, 0);
  foot.castShadow = true;
  bodyGroup.add(foot);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), snailSkin);
  head.position.set(0, 0.15, 0.17);
  bodyGroup.add(head);

  // Expressive animated mouth synced with dialogue
  const mouthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0x3b1f1a })
  );
  mouthMesh.position.set(0, 0.115, 0.275);
  mouthMesh.scale.set(1.25, 0.35, 0.6);
  bodyGroup.add(mouthMesh);

  // Expressive eyestalks with eyelids
  const eyelidMeshes: THREE.Mesh[] = [];
  function makeStalk(side: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(side * 0.055, 0.22, 0.21);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.14, 8), snailSkin);
    stem.position.y = 0.07;
    g.add(stem);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    eye.position.y = 0.15;
    g.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.021, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x1a1f29 })
    );
    pupil.position.set(0, 0.15, 0.026);
    g.add(pupil);
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.041, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      snailSkin
    );
    lid.position.y = 0.15;
    lid.scale.y = 0.12;
    g.add(lid);
    eyelidMeshes.push(lid);
    return g;
  }

  const leftStalk = makeStalk(-1);
  const rightStalk = makeStalk(1);
  bodyGroup.add(leftStalk, rightStalk);
  const [leftEyelid, rightEyelid] = eyelidMeshes;

  // True 3D Spiral Shell (TubeGeometry along helical spiral) + magical bioluminescent accents
  const shellGroup = new THREE.Group();
  shellGroup.position.set(0, 0.25, -0.05);
  bodyGroup.add(shellGroup);

  const spiralPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const ang = t * Math.PI * 4.2;
    const rad = 0.14 * (1 - t * 0.72);
    spiralPts.push(new THREE.Vector3(t * 0.13, Math.sin(ang) * rad, Math.cos(ang) * rad));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts);
  const spiralTube = new THREE.Mesh(
    new THREE.TubeGeometry(spiralCurve, 40, 0.068, 10, false),
    shellMain
  );
  spiralTube.castShadow = true;
  shellGroup.add(spiralTube);

  const shellCore = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 14), shellMain);
  shellCore.scale.set(0.85, 1.0, 1.0);
  shellGroup.add(shellCore);

  const shellRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.024, 8, 18), shellGold);
  shellRim.rotation.y = Math.PI / 2;
  shellRim.position.set(0.09, 0, 0);
  shellGroup.add(shellRim);

  // Subtle magical glowing shell spots
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0x72efdd,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.55,
    roughness: 0.2,
  });
  [
    [-0.08, 0.1, 0.09],
    [-0.1, -0.05, -0.08],
    [0.02, 0.12, -0.07],
  ].forEach(([sx, sy, sz]) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), spotMat);
    spot.position.set(sx, sy, sz);
    shellGroup.add(spot);
  });

  // Protective magic bubble when flying
  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(0.37, 18, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8be9ff,
      transparent: true,
      opacity: 0.26,
      roughness: 0.08,
      metalness: 0.15,
      depthWrite: false,
    })
  );
  bubble.position.y = 0.22;
  bubble.visible = false;
  root.add(bubble);

  return {
    root,
    bodyGroup,
    leftStalk,
    rightStalk,
    shellGroup,
    mouthMesh,
    leftEyelid,
    rightEyelid,
    bubble,
    contactShadow,
  };
}

export function animateJafrExpression(
  rig: JafrRig,
  time: number,
  opts: { isTalking: boolean; isSleeping: boolean; mood: 'curious' | 'excited' | 'talking' | 'resting' | 'sleeping' | 'alert' }
): void {
  const mouthOpen = opts.isTalking
    ? 0.45 + Math.abs(Math.sin(time * 17.5)) * 1.15
    : opts.mood === 'excited'
    ? 0.55
    : 0.28;
  rig.mouthMesh.scale.y = THREE.MathUtils.lerp(rig.mouthMesh.scale.y, mouthOpen, 0.35);

  const lidScale = opts.isSleeping ? 1.05 : opts.mood === 'resting' ? 0.55 : 0.12;
  rig.leftEyelid.scale.y = THREE.MathUtils.lerp(rig.leftEyelid.scale.y, lidScale, 0.25);
  rig.rightEyelid.scale.y = THREE.MathUtils.lerp(rig.rightEyelid.scale.y, lidScale, 0.25);

  const stalkSway = opts.isSleeping ? 0.02 : opts.mood === 'alert' || opts.mood === 'excited' ? 0.22 : 0.13;
  const freq = opts.mood === 'alert' ? 7.5 : opts.mood === 'excited' ? 6.5 : 4.2;
  rig.leftStalk.rotation.x = Math.sin(time * freq) * stalkSway + (opts.isSleeping ? 0.35 : 0);
  rig.rightStalk.rotation.x = -Math.sin(time * freq) * stalkSway + (opts.isSleeping ? 0.35 : 0);
  rig.leftStalk.rotation.z = opts.mood === 'curious' ? 0.14 + Math.sin(time * 1.9) * 0.08 : 0;
  rig.rightStalk.rotation.z = opts.mood === 'curious' ? -0.14 + Math.sin(time * 1.9) * 0.08 : 0;

  // Idle head/body look-around when curious or excited
  rig.bodyGroup.rotation.y = opts.isSleeping
    ? 0
    : opts.mood === 'excited'
    ? Math.sin(time * 3.6) * 0.18
    : Math.sin(time * 1.25) * 0.14;

  const breath = Math.sin(time * (opts.isSleeping ? 1.8 : 4.0)) * 0.04;
  rig.bodyGroup.scale.set(1 + breath, 1 - breath, 1);
}

export interface MotherFaceRig {
  leftLid: THREE.Mesh;
  rightLid: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  smileMouth: THREE.Mesh;
  openMouth: THREE.Mesh;
  leftIris: THREE.Mesh;
  rightIris: THREE.Mesh;
}

export function createNpcModel(
  opts: {
    variant: 'mother' | 'student' | 'scholar';
    robeColor?: number;
    hasHat?: boolean;
  },
  tex?: ProceduralTextures
): {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  faceRig?: MotherFaceRig;
} {
  const root = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({
    map: tex?.nateSkin,
    color: opts.variant === 'mother' ? 0xf5d6c3 : 0xeec4a2,
    roughness: 0.54,
    metalness: 0.02,
  });

  if (opts.variant === 'mother') {
    // Realistic Enchanted Library Mother Model (Royal Blue & Ivory Gold-Filigree Gown + Golden Glasses + Brown Updo)
    const blueDressMat = new THREE.MeshPhysicalMaterial({
      map: tex?.royalBlueEmbroidery,
      normalMap: tex?.royalBlueEmbroideryNormal,
      color: tex?.royalBlueEmbroidery ? 0xffffff : 0x1e3a8a,
      roughness: 0.56,
      metalness: 0.08,
      sheen: 0.45,
      sheenColor: new THREE.Color(0x93c5fd),
    });
    const ivoryMat = new THREE.MeshPhysicalMaterial({
      map: tex?.ivoryLace,
      color: tex?.ivoryLace ? 0xffffff : 0xf4ede0,
      roughness: 0.62,
      sheen: 0.3,
    });
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2b652,
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.45,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      map: tex?.nateHair,
      color: 0x523121,
      roughness: 0.55,
      metalness: 0.06,
    });
    const hairHighlightMat = new THREE.MeshStandardMaterial({
      color: 0x764731,
      roughness: 0.5,
    });

    // Ivory lace underskirt + royal blue gold-embroidered split overskirt
    const innerSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.46, 0.92, 20), ivoryMat);
    innerSkirt.position.y = 0.46;
    innerSkirt.castShadow = true;
    root.add(innerSkirt);

    const outerSkirtMat = blueDressMat.clone();
    outerSkirtMat.side = THREE.DoubleSide;
    const outerSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.195, 0.49, 0.88, 20, 1, true, -Math.PI * 0.78, Math.PI * 1.56),
      outerSkirtMat
    );
    outerSkirt.rotation.y = Math.PI;
    outerSkirt.position.y = 0.45;
    outerSkirt.castShadow = true;
    root.add(outerSkirt);

    const goldHem = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.016, 6, 28), goldMat);
    goldHem.rotation.x = Math.PI / 2;
    goldHem.position.y = 0.04;
    root.add(goldHem);

    // Sculpted waist belt + blue-and-gold bodice + delicate collar
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.165, 0.48, 16), blueDressMat);
    torso.position.y = 1.14;
    torso.castShadow = true;
    root.add(torso);

    const bodiceInsert = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.15, 0.34, 12, 1, false, -0.5, 1.0),
      ivoryMat
    );
    bodiceInsert.position.set(0, 1.16, 0.025);
    root.add(bodiceInsert);

    const waistBelt = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.022, 8, 20), goldMat);
    waistBelt.rotation.x = Math.PI / 2;
    waistBelt.position.y = 0.92;
    const beltSapphire = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.032, 0),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.15 })
    );
    beltSapphire.position.set(0, 0.92, 0.185);
    beltSapphire.scale.set(1, 1.1, 0.45);
    const neckBrooch = new THREE.Mesh(new THREE.OctahedronGeometry(0.028, 0), goldMat);
    neckBrooch.position.set(0, 1.32, 0.14);
    neckBrooch.scale.set(1, 1, 0.4);
    root.add(waistBelt, beltSapphire, neckBrooch);

    // Shoulder capelet mantle
    const capelet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.28, 0.2, 16, 1, true),
      outerSkirtMat
    );
    capelet.position.y = 1.31;
    root.add(capelet);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.068, 0.12, 10), skinMat);
    neck.position.y = 1.42;
    root.add(neck);

    // Sculpted Realistic Human Head + Glasses + Expressive Face
    const head = new THREE.Group();
    head.position.set(0, 1.47, 0);
    root.add(head);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.185, 24, 20), skinMat);
    skull.position.y = 0.18;
    skull.scale.set(0.95, 1.06, 0.96);
    skull.castShadow = true;
    head.add(skull);

    const jawChin = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), skinMat);
    jawChin.position.set(0, 0.1, 0.045);
    jawChin.scale.set(0.9, 0.72, 0.9);
    head.add(jawChin);

    const noseBridge = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.042, 6), skinMat);
    noseBridge.rotation.x = Math.PI * 0.32;
    noseBridge.position.set(0, 0.165, 0.18);
    head.add(noseBridge);

    // Warm rose cheeks
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf4a5a5, transparent: true, opacity: 0.42 });
    [-1, 1].forEach((s) => {
      const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), blushMat);
      cheek.position.set(s * 0.095, 0.145, 0.152);
      cheek.rotation.y = s * 0.38;
      head.add(cheek);
    });

    // Articulated Eyes (sclera, warm hazel iris, pupil, specular glint, lashes, blinking lid)
    const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x6b4423 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x160f0c });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const buildEye = (side: number) => {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), scleraMat);
      sclera.position.set(side * 0.064, 0.195, 0.154);
      sclera.scale.set(1.06, 0.92, 0.45);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.021, 12, 10), irisMat);
      iris.position.set(side * 0.064, 0.195, 0.164);
      iris.scale.set(1.0, 1.05, 0.42);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), pupilMat);
      pupil.position.set(side * 0.064, 0.195, 0.17);
      pupil.scale.set(1, 1, 0.4);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), glintMat);
      glint.position.set(side * 0.064 + 0.007, 0.203, 0.174);
      const lash = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.009, 0.016), hairMat);
      lash.position.set(side * 0.064, 0.219, 0.164);
      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(0.034, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
        skinMat
      );
      lid.position.set(side * 0.064, 0.198, 0.155);
      lid.scale.set(1.08, 0.08, 0.55);
      head.add(sclera, iris, pupil, glint, lash, lid);
      return { iris, lid };
    };
    const lEye = buildEye(-1);
    const rEye = buildEye(1);

    const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.011, 0.015), hairMat);
    leftBrow.position.set(-0.064, 0.242, 0.162);
    leftBrow.rotation.z = 0.07;
    const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.011, 0.015), hairMat);
    rightBrow.position.set(0.064, 0.242, 0.162);
    rightBrow.rotation.z = -0.07;
    head.add(leftBrow, rightBrow);

    // Lip-sync Mouth (Gentle smile + open speaking cavity)
    const smileMouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.0065, 6, 12, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0xb4555e })
    );
    smileMouth.rotation.z = Math.PI;
    smileMouth.position.set(0, 0.125, 0.172);
    const openMouth = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0x8f3844 })
    );
    openMouth.scale.set(1.15, 0.85, 0.4);
    openMouth.position.set(0, 0.118, 0.172);
    openMouth.visible = false;
    head.add(smileMouth, openMouth);

    // Signature Wire-Rimmed Golden Glasses (Enchanted Library Mother Character Sheet)
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xeff6ff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.06,
      metalness: 0.1,
    });
    [-1, 1].forEach((gs) => {
      const frame = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.0045, 8, 20), goldMat);
      frame.position.set(gs * 0.064, 0.195, 0.194);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.041, 18), lensMat);
      lens.position.set(gs * 0.064, 0.195, 0.193);
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.17), goldMat);
      temple.position.set(gs * 0.108, 0.197, 0.112);
      head.add(frame, lens, temple);
    });
    const glassesBridge = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 10, Math.PI), goldMat);
    glassesBridge.position.set(0, 0.198, 0.194);
    head.add(glassesBridge);

    // Swept Chestnut-Brown Updo, Soft Side Curls, High Bun & Gold Hairpin
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.196, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
      hairMat
    );
    hairCap.position.set(0, 0.2, -0.02);
    hairCap.rotation.x = -0.25;
    head.add(hairCap);

    const updoBun = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), hairHighlightMat);
    updoBun.position.set(0, 0.295, -0.175);
    updoBun.scale.set(1.08, 0.92, 0.9);
    const hairpin = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.01, 6, 16), goldMat);
    hairpin.position.set(0, 0.305, -0.13);
    hairpin.rotation.x = 0.72;
    head.add(updoBun, hairpin);

    [-1, 1].forEach((hs) => {
      const sideCurl = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.016, 0.22, 8), hairHighlightMat);
      sideCurl.position.set(hs * 0.145, 0.16, 0.075);
      sideCurl.rotation.z = hs * 0.16;
      const earStud = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), goldMat);
      earStud.position.set(hs * 0.175, 0.145, 0.01);
      head.add(sideCurl, earStud);
    });

    // Articulated Royal Puffed Sleeves + Forearms + Hands
    function makeMotherArm(side: number): THREE.Group {
      const g = new THREE.Group();
      g.position.set(side * 0.225, 1.32, 0);
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.078, 12, 10), ivoryMat);
      puff.position.y = -0.06;
      puff.scale.set(0.95, 1.15, 0.95);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.044, 0.25, 10), blueDressMat);
      sleeve.position.y = -0.22;
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.009, 6, 12), goldMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.34;
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.15, 10), skinMat);
      forearm.position.y = -0.41;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), skinMat);
      hand.position.y = -0.5;
      g.add(puff, sleeve, cuff, forearm, hand);
      return g;
    }

    const leftArm = makeMotherArm(-1);
    const rightArm = makeMotherArm(1);
    root.add(leftArm, rightArm);

    const faceRig: MotherFaceRig = {
      leftLid: lEye.lid,
      rightLid: rEye.lid,
      leftBrow,
      rightBrow,
      smileMouth,
      openMouth,
      leftIris: lEye.iris,
      rightIris: rEye.iris,
    };

    return { root, leftArm, rightArm, head, faceRig };
  }

  const robeHex = opts.robeColor ?? 0x26486b;
  const robeMat = new THREE.MeshStandardMaterial({ color: robeHex, roughness: 0.72 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xdab254,
    roughness: 0.4,
    metalness: 0.65,
  });

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 0.92, 14), robeMat);
  skirt.position.y = 0.46;
  skirt.castShadow = true;
  root.add(skirt);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.48, 14), robeMat);
  torso.position.y = 1.12;
  torso.castShadow = true;
  root.add(torso);

  const sash = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.33, 0.64, 12, 1, false, -0.55, 1.1),
    accentMat
  );
  sash.position.y = 0.65;
  root.add(sash);

  const head = new THREE.Group();
  head.position.y = 1.42;
  root.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), skinMat);
  skull.position.y = 0.16;
  skull.castShadow = true;
  head.add(skull);

  const hairMat = new THREE.MeshStandardMaterial({
    color: opts.variant === 'scholar' ? 0xcfd6de : 0x422a1b,
    roughness: 0.78,
  });
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.224, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hair.position.set(0, 0.18, -0.02);
  hair.rotation.x = -0.2;
  head.add(hair);

  if (opts.hasHat) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.03, 16), robeMat);
    brim.position.y = 0.34;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.48, 14), robeMat);
    cone.position.y = 0.57;
    const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 16), accentMat);
    hatBand.rotation.x = Math.PI / 2;
    hatBand.position.y = 0.36;
    head.add(brim, cone, hatBand);
  }

  function makeArm(side: number): THREE.Group {
    const g = new THREE.Group();
    g.position.set(side * 0.28, 1.3, 0);
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.44, 10), robeMat);
    sl.position.y = -0.22;
    g.add(sl);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat);
    hd.position.y = -0.47;
    g.add(hd);
    return g;
  }

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  root.add(leftArm, rightArm);

  return { root, leftArm, rightArm, head };
}

export function animateMotherNpc(
  npc: { root: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Group; faceRig?: MotherFaceRig },
  time: number,
  opts: { talking?: boolean; emotion?: string; lookAtYaw?: number }
): void {
  const talking = Boolean(opts.talking);
  const expr = opts.emotion ?? 'calm';

  // Gentle breathing & speaking hand gestures
  const breath = Math.sin(time * 2.1) * 0.02;
  npc.leftArm.rotation.x = talking ? -0.35 + Math.sin(time * 3.8) * 0.14 : -0.14 + breath;
  npc.rightArm.rotation.x = talking ? -0.45 + Math.cos(time * 4.2) * 0.18 : -0.14 - breath;
  npc.leftArm.rotation.z = talking ? -0.12 : -0.06;
  npc.rightArm.rotation.z = talking ? 0.12 : 0.06;

  npc.head.rotation.y = (opts.lookAtYaw ?? 0) + (talking ? Math.sin(time * 2.6) * 0.07 : Math.sin(time * 0.9) * 0.04);
  npc.head.rotation.x = talking ? Math.sin(time * 5.2) * 0.045 : Math.sin(time * 1.4) * 0.02;

  const fr = npc.faceRig;
  if (!fr) return;

  // Natural blinking cycle every ~3.6s
  const blinkPhase = time % 3.6;
  const blinkAmt = blinkPhase < 0.14 ? Math.sin((blinkPhase / 0.14) * Math.PI) : 0;
  const lidY = 0.08 + blinkAmt * 0.95;
  fr.leftLid.scale.y = lidY;
  fr.rightLid.scale.y = lidY;

  // Lip-sync mouth & 8 emotional brow/mouth poses
  if (expr === 'surprised') {
    fr.smileMouth.visible = false;
    fr.openMouth.visible = true;
    fr.openMouth.scale.set(1.0, 1.15, 0.4);
    fr.leftBrow.position.y = 0.256;
    fr.rightBrow.position.y = 0.256;
    fr.leftBrow.rotation.z = 0.15;
    fr.rightBrow.rotation.z = -0.15;
  } else {
    const mouthTalkOpen = talking && Math.sin(time * 12) > 0.1;
    fr.smileMouth.visible = !mouthTalkOpen;
    fr.openMouth.visible = mouthTalkOpen;
    if (mouthTalkOpen) {
      fr.openMouth.scale.set(1.25, 0.55 + Math.abs(Math.sin(time * 13)) * 0.7, 0.4);
    }
    fr.smileMouth.scale.set(expr === 'happy' ? 1.24 : expr === 'sad' ? 0.85 : 1.04, 1, 1);
    fr.smileMouth.rotation.z = expr === 'sad' ? 0 : Math.PI;
    const isWorried = expr === 'concerned' || expr === 'sad' || expr === 'emotional';
    const isAngry = expr === 'angry';
    fr.leftBrow.position.y = isWorried ? 0.249 : expr === 'curious' ? 0.252 : 0.242;
    fr.rightBrow.position.y = expr === 'curious' ? 0.242 : isWorried ? 0.249 : 0.242;
    fr.leftBrow.rotation.z = isAngry ? -0.22 : isWorried ? -0.14 : 0.08;
    fr.rightBrow.rotation.z = isAngry ? 0.22 : isWorried ? 0.14 : -0.08;
  }
}

export function createCottageModel(tex: ProceduralTextures, scale = 1): THREE.Group {
  const g = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: tex.cobbleRoughness,
    color: 0x9b9286,
    roughness: 0.9,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    map: tex.plaster,
    color: 0xeadac0,
    roughness: 0.85,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: tex.woodRoughness,
    color: 0xb97a46,
    roughness: 0.72,
  });
  const beamMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    color: 0x6f4323,
    roughness: 0.78,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    map: tex.roofTerracotta,
    normalMap: tex.roofTerracottaNormal,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughness: 0.62,
    metalness: 0.05,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xffd57a,
    emissive: 0xff9f2e,
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d33,
    roughness: 0.35,
    metalness: 0.85,
  });

  // Stone foundation plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.88, 5.9), stoneMat);
  base.position.y = 0.44;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // Cream plaster main walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.25, 5.4), wallMat);
  walls.position.y = 2.48;
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  // Corner timber posts & horizontal belt beams
  [
    [-3.22, -2.72],
    [3.22, -2.72],
    [-3.22, 2.72],
    [3.22, 2.72],
  ].forEach(([bx, bz]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.45, 0.28), beamMat);
    beam.position.set(bx, 2.48, bz);
    beam.castShadow = true;
    g.add(beam);
  });
  const belt = new THREE.Mesh(new THREE.BoxGeometry(6.65, 0.22, 5.65), beamMat);
  belt.position.y = 2.68;
  g.add(belt);

  // Terracotta gabled pitched roof with overhanging timber ridge
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-4.05, 0);
  roofShape.lineTo(0, 3.05);
  roofShape.lineTo(4.05, 0);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 6.6, bevelEnabled: false });
  roofGeo.translate(0, 0, -3.3);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 4.02;
  roof.castShadow = true;
  roof.receiveShadow = true;
  g.add(roof);

  // Front & back cream plaster gable inlays
  const gableInlayShape = new THREE.Shape();
  gableInlayShape.moveTo(-3.15, 0);
  gableInlayShape.lineTo(0, 2.45);
  gableInlayShape.lineTo(3.15, 0);
  gableInlayShape.closePath();
  const gableInlay = new THREE.Mesh(
    new THREE.ExtrudeGeometry(gableInlayShape, { depth: 5.5, bevelEnabled: false }),
    wallMat
  );
  gableInlay.position.set(0, 4.08, -2.75);
  g.add(gableInlay);

  const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 6.85), woodMat);
  ridgeBeam.position.set(0, 7.05, 0);
  ridgeBeam.castShadow = true;
  g.add(ridgeBeam);

  // Stone Chimney & Rim
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.8, 0.95), stoneMat);
  chimney.position.set(1.95, 5.9, -1.1);
  chimney.castShadow = true;
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.22, 1.16), stoneMat);
  chimneyCap.position.set(1.95, 7.32, -1.1);
  g.add(chimney, chimneyCap);

  // Front stone step, arched wooden door + twin lanterns
  const doorStep = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.22, 0.72), stoneMat);
  doorStep.position.set(0, 0.11, 3.12);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.05, 0.22), woodMat);
  door.position.set(0, 1.48, 2.74);
  const doorArch = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.1, 7, 14, Math.PI), beamMat);
  doorArch.position.set(0, 2.25, 2.75);
  const doorRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 12), ironMat);
  doorRing.position.set(0.34, 1.45, 2.87);
  g.add(doorStep, door, doorArch, doorRing);

  [-0.92, 0.92].forEach((lx) => {
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.24, 6), glowMat);
    lantern.position.set(lx, 2.25, 2.95);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.12, 6), ironMat);
    cap.position.set(lx, 2.41, 2.95);
    g.add(lantern, cap);
  });

  // Upper gable glowing window & mini timber balcony
  const upBalcony = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.14, 0.68), beamMat);
  upBalcony.position.set(0, 3.85, 3.02);
  const upRail = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.09, 0.1), woodMat);
  upRail.position.set(0, 4.38, 3.31);
  const upWin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.14), glowMat);
  upWin.position.set(0, 4.78, 2.74);
  const upWinFrame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.2, 0.08), beamMat);
  upWinFrame.position.set(0, 4.78, 2.72);
  g.add(upBalcony, upRail, upWinFrame, upWin);

  // Shuttered glowing windows + flower boxes with blossoms
  [-1.98, 1.98].forEach((wx) => {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.12, 0.12), beamMat);
    winFrame.position.set(wx, 2.25, 2.71);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.92, 0.15), glowMat);
    win.position.set(wx, 2.25, 2.72);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.2, 0.34), woodMat);
    sill.position.set(wx, 1.64, 2.84);
    const leaves = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.2, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x458b3c, roughness: 0.82 })
    );
    leaves.position.set(wx, 1.78, 2.86);
    const bloom = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshStandardMaterial({ color: wx < 0 ? 0xfb7185 : 0xfde047, roughness: 0.6 })
    );
    bloom.position.set(wx, 1.88, 2.88);
    g.add(winFrame, win, sill, leaves, bloom);
  });

  g.scale.setScalar(scale);
  return g;
}

export function createWoodenBridgeModel(tex: ProceduralTextures): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: tex.woodRoughness,
    color: 0xb97a46,
    roughness: 0.74,
  });
  const darkWoodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    normalMap: tex.woodNormal,
    color: 0x6f4323,
    roughness: 0.82,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.cobble,
    normalMap: tex.cobbleNormal,
    color: 0x928b80,
    roughness: 0.9,
  });

  // Arched plank deck: top surface follows archTop = cos((z / 8.2) * PI/2) * 0.9 + 0.08
  for (let i = -7; i <= 7; i++) {
    const z = i * 1.1;
    const archTop = Math.cos((z / 8.2) * (Math.PI / 2)) * 0.9 + 0.08;
    const tilt = Math.sin((z / 8.2) * (Math.PI / 2)) * 0.16;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 0.98), woodMat);
    plank.position.set(0, archTop - 0.12, z);
    plank.rotation.x = tilt;
    plank.castShadow = true;
    plank.receiveShadow = true;
    g.add(plank);
  }

  // Deep stone bank abutments & sloped cobblestone approach aprons connecting smoothly to the road
  [-1, 1].forEach((endSign) => {
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.3, 1.5), stoneMat);
    abutment.position.set(0, -1.03, endSign * 8.35);
    abutment.receiveShadow = true;
    abutment.castShadow = true;
    g.add(abutment);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.24, 1.35), stoneMat);
    apron.position.set(0, -0.04, endSign * 9.05);
    apron.rotation.x = endSign * 0.075;
    apron.receiveShadow = true;
    g.add(apron);
  });

  [-2.68, 2.68].forEach((sx) => {
    const railPts: THREE.Vector3[] = [];
    const midRailPts: THREE.Vector3[] = [];
    for (let i = -7; i <= 7; i++) {
      const z = i * 1.1;
      const archTop = Math.cos((z / 8.2) * (Math.PI / 2)) * 0.9 + 0.08;
      railPts.push(new THREE.Vector3(sx, archTop + 1.04, z));
      midRailPts.push(new THREE.Vector3(sx, archTop + 0.54, z));
      if (Math.abs(i) % 2 === 1 || i === 0) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.24, 0.24), darkWoodMat);
        post.position.set(sx, archTop + 0.48, z);
        post.castShadow = true;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), woodMat);
        cap.position.set(sx, archTop + 1.14, z);
        g.add(post, cap);
      }
    }
    // Smoothly curved arched top & middle handrails following the bridge curve
    const topRailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts), 24, 0.095, 6, false);
    const midRailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(midRailPts), 24, 0.06, 6, false);
    const topRail = new THREE.Mesh(topRailGeo, darkWoodMat);
    const midRail = new THREE.Mesh(midRailGeo, woodMat);
    topRail.castShadow = true;
    g.add(topRail, midRail);

    // Submerged timber support pilings anchoring bridge deep into the riverbed under the water
    [-3.6, 0, 3.6].forEach((pz) => {
      const archTop = Math.cos((pz / 8.2) * (Math.PI / 2)) * 0.9 + 0.08;
      const pilingH = archTop + 2.25;
      const piling = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, pilingH, 8),
        darkWoodMat
      );
      piling.position.set(sx * 0.88, archTop - pilingH * 0.5 - 0.1, pz);
      piling.castShadow = true;
      g.add(piling);
    });

    // Arched under-deck longitudinal stringer beams
    const stringerPts: THREE.Vector3[] = [];
    for (let i = -7; i <= 7; i++) {
      const z = i * 1.1;
      const archTop = Math.cos((z / 8.2) * (Math.PI / 2)) * 0.9 + 0.08;
      stringerPts.push(new THREE.Vector3(sx * 0.85, archTop - 0.28, z));
    }
    const stringer = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stringerPts), 20, 0.16, 6, false),
      darkWoodMat
    );
    g.add(stringer);
  });

  return g;
}

export function createEnchLibraryExterior(tex: ProceduralTextures): {
  group: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  runeRing: THREE.Mesh;
} {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.ashlarStone,
    normalMap: tex.ashlarStoneNormal,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughnessMap: tex.cobbleRoughness,
    color: 0xa2a6b2,
    roughness: 0.78,
  });
  const darkSlate = new THREE.MeshStandardMaterial({ map: tex.roofSlate, color: 0x263447, roughness: 0.55 });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2b75a,
    roughness: 0.22,
    metalness: 0.9,
    clearcoat: 0.4,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.mahoganyWood,
    normalMap: tex.woodNormal,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: tex.woodRoughness,
    color: 0x7b4e2e,
    roughness: 0.62,
  });
  // Real generated stained-glass artwork on towering Ench Library lancet windows!
  const windowGlow = new THREE.MeshStandardMaterial({
    map: tex.arcaneGlass,
    emissiveMap: tex.arcaneGlass,
    emissive: 0x4ca9bf,
    emissiveIntensity: 0.18,
    roughness: 0.28,
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 1.4, 36), stoneMat);
  plinth.position.y = 0.7;
  plinth.receiveShadow = true;
  group.add(plinth);

  const rotundaLower = new THREE.Mesh(new THREE.CylinderGeometry(16.5, 17.5, 18, 36), stoneMat);
  rotundaLower.position.y = 10;
  rotundaLower.castShadow = true;
  rotundaLower.receiveShadow = true;
  group.add(rotundaLower);

  const cornice = new THREE.Mesh(new THREE.TorusGeometry(16.9, 0.45, 10, 36), goldMat);
  cornice.rotation.x = Math.PI / 2;
  cornice.position.y = 19;
  group.add(cornice);

  const rotundaUpper = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 13.5, 10, 32), stoneMat);
  rotundaUpper.position.y = 23.5;
  rotundaUpper.castShadow = true;
  group.add(rotundaUpper);

  const dome = new THREE.Mesh(new THREE.ConeGeometry(13.8, 12, 32), darkSlate);
  dome.position.y = 34.5;
  dome.castShadow = true;
  group.add(dome);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.55, 6.5, 12), goldMat);
  spire.position.y = 42.5;
  group.add(spire);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const cx = Math.sin(a) * 17.4;
    const cz = Math.cos(a) * 17.4;
    if (Math.abs(a) > 0.32 && Math.abs(a - Math.PI * 2) > 0.32) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.78, 18, 12), stoneMat);
      col.position.set(cx, 10, cz);
      col.castShadow = true;
      const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.1, 12), stoneMat);
      colBase.position.set(cx, 1.55, cz);
      const colCap = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.72, 0.9, 12), stoneMat);
      colCap.position.set(cx, 18.6, cz);
      const capGold = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.09, 6, 16), goldMat);
      capGold.rotation.x = Math.PI / 2;
      capGold.position.set(cx, 18.2, cz);
      group.add(col, colBase, colCap, capGold);
    }
    const winAngle = a + 0.26;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 6.8), windowGlow);
    win.position.set(Math.sin(winAngle) * 17.15, 11.5, Math.cos(winAngle) * 17.15);
    win.rotation.y = winAngle;
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.9, 0.14), stoneMat);
    mullion.position.set(Math.sin(winAngle) * 17.24, 11.5, Math.cos(winAngle) * 17.24);
    mullion.rotation.y = winAngle;
    const sill = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.24, 0.38), stoneMat);
    sill.position.set(Math.sin(winAngle) * 17.24, 8.05, Math.cos(winAngle) * 17.24);
    sill.rotation.y = winAngle;
    group.add(win, mullion, sill);
  }

  const portico = new THREE.Mesh(new THREE.BoxGeometry(9.8, 10.8, 4.4), stoneMat);
  portico.position.set(0, 6.2, 16.5);
  portico.castShadow = true;
  group.add(portico);

  const portalRecess = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 7.6, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x0e1828 })
  );
  portalRecess.position.set(0, 4.8, 18.4);
  group.add(portalRecess);

  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-2.7, 1.4, 18.65);
  const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2.65, 7.2, 0.42), woodMat);
  leftDoor.position.set(1.32, 3.6, 0);
  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.48), goldMat);
  leftTrim.position.set(1.32, 3.6, 0);
  leftDoorPivot.add(leftDoor, leftTrim);
  group.add(leftDoorPivot);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(2.7, 1.4, 18.65);
  const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2.65, 7.2, 0.42), woodMat);
  rightDoor.position.set(-1.32, 3.6, 0);
  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.48), goldMat);
  rightTrim.position.set(-1.32, 3.6, 0);
  rightDoorPivot.add(rightDoor, rightTrim);
  group.add(rightDoorPivot);

  const runeRing = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 7.2),
    new THREE.MeshBasicMaterial({
      map: tex.runeCircle,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  runeRing.position.set(0, 12.2, 18.85);
  group.add(runeRing);

  return { group, leftDoorPivot, rightDoorPivot, runeRing };
}

export interface LibraryDynamicObjects {
  group: THREE.Group;
  floatingBooks: {
    group: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    orbitRadius: number;
    orbitSpeed: number;
    baseY: number;
    phase: number;
  }[];
  flyingChairs: {
    group: THREE.Group;
    basePos: THREE.Vector3;
    phase: number;
    isTarget: boolean;
  }[];
  targetChairPos: THREE.Vector3;
  targetChairGroup: THREE.Group;
  targetBookGroup: THREE.Group;
  targetBookPos: THREE.Vector3;
  targetBeacon: THREE.Mesh;
  astrolabeRings: THREE.Mesh[];
  floorRune: THREE.Mesh;
  libraryLights: THREE.PointLight[];
  npcs: {
    group: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    head: THREE.Group;
    mode: 'fly' | 'read' | 'discuss' | 'browse' | 'sit';
    orbitRadius?: number;
    orbitSpeed?: number;
    basePos: THREE.Vector3;
    phase: number;
    greeting?: { speaker: string; text: string };
    greeted?: boolean;
  }[];
  walkablePlatforms: { x: number; y: number; z: number; radius: number }[];
}

export function createEnchLibraryInterior(tex: ProceduralTextures): LibraryDynamicObjects {
  const group = new THREE.Group();

  const marbleMat = new THREE.MeshPhysicalMaterial({
    map: tex.marble,
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 0.65,
    clearcoatRoughness: 0.15,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    map: tex.ashlarStone,
    normalMap: tex.ashlarStoneNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    color: 0x5c667a,
    roughness: 0.7,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.mahoganyWood,
    normalMap: tex.woodNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: tex.woodRoughness,
    color: 0x7c4a2b,
    roughness: 0.52,
  });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe3b856,
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 0.4,
  });
  const velvetMat = new THREE.MeshPhysicalMaterial({
    color: 0x6f2238,
    roughness: 0.7,
    sheen: 0.8,
    sheenColor: new THREE.Color(0xc06c84),
  });

  const walkablePlatforms: { x: number; y: number; z: number; radius: number }[] = [];

  // Giant circular marble floor (radius 44m)
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 1.2, 48), marbleMat);
  floor.position.y = -0.6;
  floor.receiveShadow = true;
  group.add(floor);

  const floorRug = new THREE.Mesh(new THREE.CylinderGeometry(12.2, 12.2, 0.04, 36), velvetMat);
  floorRug.position.y = 0.015;
  floorRug.receiveShadow = true;
  group.add(floorRug);

  const floorRune = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 22),
    new THREE.MeshBasicMaterial({
      map: tex.runeCircle,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    })
  );
  floorRune.rotation.x = -Math.PI / 2;
  floorRune.position.y = 0.045;
  group.add(floorRune);

  // Outer colossal rotunda wall + Stained-glass lancet panels with stone mullions inside!
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1a2334,
    roughness: 0.78,
    metalness: 0.1,
    side: THREE.BackSide,
  });
  const outerWall = new THREE.Mesh(new THREE.CylinderGeometry(44.2, 44.2, 62, 40, 1, true), wallMat);
  outerWall.position.y = 31;
  group.add(outerWall);

  const innerGlassMat = new THREE.MeshStandardMaterial({
    map: tex.arcaneGlass,
    emissiveMap: tex.arcaneGlass,
    emissive: 0x45a3b8,
    emissiveIntensity: 0.16,
    roughness: 0.28,
  });
  for (let w = 0; w < 8; w++) {
    const a = (w / 8) * Math.PI * 2;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 16), innerGlassMat);
    panel.position.set(Math.sin(a) * 43.2, 43, Math.cos(a) * 43.2);
    panel.rotation.y = a + Math.PI;
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.28, 16.4, 0.35), stoneMat);
    mullion.position.set(Math.sin(a) * 42.9, 43, Math.cos(a) * 42.9);
    mullion.rotation.y = a + Math.PI;
    const corniceCap = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 0.45), goldMat);
    corniceCap.position.set(Math.sin(a) * 42.9, 34.8, Math.cos(a) * 42.9);
    corniceCap.rotation.y = a + Math.PI;
    group.add(panel, mullion, corniceCap);
  }

  // Celestial Starry Dome Ceiling
  const domeMat = new THREE.MeshStandardMaterial({
    map: tex.celestialDome,
    emissiveMap: tex.celestialDome,
    emissive: 0x1e3f7a,
    emissiveIntensity: 0.14,
    roughness: 0.48,
    side: THREE.BackSide,
  });
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(44.5, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.5),
    domeMat
  );
  dome.position.y = 58;
  group.add(dome);

  // Towering Central Magical Core Spire + Carved Buttresses + Subtle Light Shaft
  const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 5.2, 6, 16), stoneMat);
  coreBase.position.y = 3;
  group.add(coreBase);

  const coreCollar = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.24, 8, 24), goldMat);
  coreCollar.rotation.x = Math.PI / 2;
  coreCollar.position.y = 6.0;
  group.add(coreCollar);

  for (let p = 0; p < 4; p++) {
    const a = (p / 4) * Math.PI * 2 + Math.PI / 4;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.95, 14, 1.4), stoneMat);
    rib.position.set(Math.sin(a) * 4.2, 7, Math.cos(a) * 4.2);
    rib.rotation.y = a;
    group.add(rib);
  }

  const coreBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 2.2, 62, 18, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x72efdd,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  coreBeam.position.y = 32;
  group.add(coreBeam);

  // Rotating Celestial Astrolabe Rings overhead
  const astrolabeRings: THREE.Mesh[] = [];
  [11, 15, 20].forEach((rad, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.35, 10, 48), goldMat);
    ring.position.y = 46 - i * 3;
    ring.rotation.x = 0.4 + i * 0.35;
    group.add(ring);
    astrolabeRings.push(ring);
  });

  // 3 Tiered Floating Gallery Rings + Towering Bookshelves + Instanced Books
  const tierHeights = [10, 21, 33];
  const shelfMatrices: THREE.Matrix4[] = [];
  const bookMatrices: THREE.Matrix4[] = [];
  const bookColors: THREE.Color[] = [];
  const dummy = new THREE.Object3D();
  const palette = [0x8b2635, 0x2e5e4e, 0x2b4c7e, 0x6b3fa0, 0xb8860b, 0x7a4928];

  tierHeights.forEach((ty, tierIdx) => {
    const innerR = 25 + tierIdx * 1.8;
    const outerR = 42;
    const ringGeo = new THREE.RingGeometry(innerR, outerR, 40);
    const ringFloor = new THREE.Mesh(ringGeo, marbleMat);
    ringFloor.rotation.x = -Math.PI / 2;
    ringFloor.position.y = ty;
    group.add(ringFloor);

    const rail = new THREE.Mesh(new THREE.TorusGeometry(innerR + 0.3, 0.22, 8, 40), goldMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = ty + 1.05;
    group.add(rail);

    const shelfCount = 24;
    for (let s = 0; s < shelfCount; s++) {
      const a = (s / shelfCount) * Math.PI * 2;
      const sx = Math.sin(a) * 40.5;
      const sz = Math.cos(a) * 40.5;
      dummy.position.set(sx, ty + 3.6, sz);
      dummy.rotation.set(0, a + Math.PI, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      shelfMatrices.push(dummy.matrix.clone());

      for (let row = 0; row < 4; row++) {
        for (let b = -3; b <= 3; b++) {
          const offsetX = b * 0.42;
          const bx = sx + Math.cos(a) * offsetX - Math.sin(a) * 0.45;
          const bz = sz - Math.sin(a) * offsetX - Math.cos(a) * 0.45;
          dummy.position.set(bx, ty + 1.2 + row * 1.45, bz);
          dummy.rotation.set(0, a + Math.PI, (Math.random() - 0.5) * 0.08);
          dummy.scale.set(0.8 + Math.random() * 0.3, 0.8 + Math.random() * 0.4, 1);
          dummy.updateMatrix();
          bookMatrices.push(dummy.matrix.clone());
          bookColors.push(new THREE.Color(palette[(s + row + b + 10) % palette.length]));
        }
      }
    }
  });

  for (let s = 0; s < 22; s++) {
    const a = (s / 22) * Math.PI * 2;
    if (Math.abs(a) < 0.25) continue;
    const sx = Math.sin(a) * 39;
    const sz = Math.cos(a) * 39;
    dummy.position.set(sx, 3.6, sz);
    dummy.rotation.set(0, a + Math.PI, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    shelfMatrices.push(dummy.matrix.clone());
  }

  const shelfMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(3.6, 7.2, 1.1),
    woodMat,
    shelfMatrices.length
  );
  shelfMatrices.forEach((m, idx) => shelfMesh.setMatrixAt(idx, m));
  shelfMesh.instanceMatrix.needsUpdate = true;
  shelfMesh.computeBoundingSphere();
  group.add(shelfMesh);

  const booksInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.24, 0.85, 0.55),
    new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.1 }),
    bookMatrices.length
  );
  bookMatrices.forEach((m, idx) => {
    booksInst.setMatrixAt(idx, m);
    booksInst.setColorAt(idx, bookColors[idx]);
  });
  booksInst.instanceMatrix.needsUpdate = true;
  if (booksInst.instanceColor) booksInst.instanceColor.needsUpdate = true;
  booksInst.computeBoundingSphere();
  group.add(booksInst);

  [-1, 1].forEach((side) => {
    const stairCenter = new THREE.Vector3(side * 22, 0, -6);
    for (let step = 0; step < 38; step++) {
      const a = step * 0.22 * side;
      const sx = stairCenter.x + Math.cos(a) * 4.2;
      const sz = stairCenter.z + Math.sin(a) * 4.2;
      const sy = step * 0.55;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.32, 1.1), stoneMat);
      tread.position.set(sx, sy, sz);
      tread.rotation.y = -a;
      group.add(tread);
    }
  });

  // Floating magical platforms
  const platformCoords = [
    { x: -11, y: 6.5, z: -10, radius: 3.8 },
    { x: 9, y: 12.0, z: -14, radius: 4.0 },
    { x: -6, y: 17.5, z: -18, radius: 4.2 },
    { x: 0, y: 22.0, z: -20, radius: 5.8 },
    { x: 11, y: 22.5, z: -16, radius: 4.6 },
  ];
  platformCoords.forEach((p, idx) => {
    const plat = new THREE.Group();
    plat.position.set(p.x, p.y, p.z);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(p.radius, p.radius * 0.72, 0.9, 24), stoneMat);
    disc.position.y = -0.45;
    disc.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(p.radius - 0.1, 0.16, 8, 28), goldMat);
    rim.rotation.x = Math.PI / 2;
    const underGlow = new THREE.Mesh(
      new THREE.ConeGeometry(p.radius * 0.65, 2.2, 14),
      new THREE.MeshBasicMaterial({
        color: idx === 3 ? 0xffd166 : 0x56cfe1,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      })
    );
    underGlow.rotation.x = Math.PI;
    underGlow.position.y = -1.8;
    plat.add(disc, rim, underGlow);
    group.add(plat);
    walkablePlatforms.push(p);
  });

  // Ground-floor Wooden Study Desks with Open Tomes & Brass Lamps + Hanging Chandeliers
  const deskLampMat = new THREE.MeshStandardMaterial({
    color: 0xf7d08a,
    emissive: 0xd99b43,
    emissiveIntensity: 0.25,
    roughness: 0.28,
  });
  const deskSpots = [
    { x: -14, y: 0, z: 14, rot: 0.6 },
    { x: 14, y: 0, z: 12, rot: -0.7 },
    { x: -16, y: 0, z: -14, rot: 2.2 },
    { x: 15, y: 0, z: -15, rot: -2.1 },
    { x: 16.5, y: 10, z: 22.5, rot: -0.4 },
    { x: -20.5, y: 10, z: -22.5, rot: 2.4 },
  ];
  deskSpots.forEach((ds) => {
    const desk = new THREE.Group();
    desk.position.set(ds.x, ds.y, ds.z);
    desk.rotation.y = ds.rot;
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.35), woodMat);
    top.position.y = 1.05;
    top.receiveShadow = true;
    [
      [-1.1, -0.52],
      [1.1, -0.52],
      [-1.1, 0.52],
      [1.1, 0.52],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.14), woodMat);
      leg.position.set(lx, 0.52, lz);
      desk.add(leg);
    });
    const tome = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.07, 0.42),
      new THREE.MeshStandardMaterial({ map: tex.bookPage, roughness: 0.7 })
    );
    tome.position.set(-0.25, 1.15, 0.05);
    tome.rotation.y = 0.18;
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.45, 8), goldMat);
    lampStem.position.set(0.8, 1.32, -0.25);
    const lampOrb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), deskLampMat);
    lampOrb.position.set(0.8, 1.6, -0.25);
    desk.add(top, tome, lampStem, lampOrb);
    group.add(desk);
  });

  for (let ch = 0; ch < 4; ch++) {
    const a = (ch / 4) * Math.PI * 2 + Math.PI / 4;
    const cx = Math.sin(a) * 16;
    const cz = Math.cos(a) * 16;
    const chand = new THREE.Group();
    chand.position.set(cx, 38, cz);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 18, 6), goldMat);
    chain.position.y = 9;
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.12, 8, 24), goldMat);
    hoop.rotation.x = Math.PI / 2;
    const innerHoop = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 6, 18), goldMat);
    innerHoop.rotation.x = Math.PI / 2;
    innerHoop.position.y = -0.35;
    chand.add(chain, hoop, innerHoop);
    for (let k = 0; k < 6; k++) {
      const ka = (k / 6) * Math.PI * 2;
      const candleStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, 0.28, 6),
        new THREE.MeshStandardMaterial({ color: 0xf7efe1, roughness: 0.75 })
      );
      candleStick.position.set(Math.cos(ka) * 2.1, 0.16, Math.sin(ka) * 2.1);
      const bulb = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 6), deskLampMat);
      bulb.position.set(Math.cos(ka) * 2.1, 0.4, Math.sin(ka) * 2.1);
      chand.add(candleStick, bulb);
    }
    group.add(chand);
  }

  // Target Book Pedestal & Mysterious Book (Scene 7)
  const targetBookPos = new THREE.Vector3(0, 22.0, -20);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 1.35, 14), stoneMat);
  pedestal.position.set(targetBookPos.x, targetBookPos.y + 0.68, targetBookPos.z);
  group.add(pedestal);

  const targetBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 26, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  targetBeacon.position.set(targetBookPos.x, targetBookPos.y + 13, targetBookPos.z);
  group.add(targetBeacon);

  const targetBookGroup = new THREE.Group();
  targetBookGroup.position.set(targetBookPos.x, targetBookPos.y + 1.85, targetBookPos.z);
  const tbCoverMat = new THREE.MeshStandardMaterial({
    map: tex.arcaneGlass,
    color: 0xe9d5ff,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.18,
    roughness: 0.3,
    metalness: 0.4,
  });
  const tbCover = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.88), tbCoverMat);
  const tbClasp = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.17, 0.18), goldMat);
  const tbGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 16, 14),
    new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    })
  );
  targetBookGroup.add(tbCover, tbClasp, tbGlow);
  group.add(targetBookGroup);

  // Floating Animated Books
  const floatingBooks: LibraryDynamicObjects['floatingBooks'] = [];
  const fbCoverMat = new THREE.MeshStandardMaterial({ color: 0x5a2a38, roughness: 0.55 });
  const fbPageMat = new THREE.MeshStandardMaterial({
    color: 0xf4e8c8,
    emissive: 0xffe4a0,
    emissiveIntensity: 0.03,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 24; i++) {
    const bg = new THREE.Group();
    const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.62), fbPageMat);
    leftWing.position.x = -0.22;
    const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.62), fbPageMat);
    rightWing.position.x = 0.22;
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.64, 0.12), fbCoverMat);
    bg.add(spine, leftWing, rightWing);
    group.add(bg);
    floatingBooks.push({
      group: bg,
      leftWing,
      rightWing,
      orbitRadius: 9 + (i % 5) * 4.5,
      orbitSpeed: (i % 2 === 0 ? 1 : -1) * (0.18 + (i % 4) * 0.06),
      baseY: 6 + (i % 6) * 5.2,
      phase: (i / 24) * Math.PI * 2,
    });
  }

  // Flying Chairs
  const flyingChairs: LibraryDynamicObjects['flyingChairs'] = [];
  const targetChairPos = new THREE.Vector3(11, 23.2, -16);
  function buildChair(): THREE.Group {
    const cg = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 1.05), velvetMat);
    seat.position.y = 0.65;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 0.16), velvetMat);
    back.position.set(0, 1.25, -0.46);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.1, 1.12), woodMat);
    frame.position.y = 0.56;
    [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.56, 8), woodMat);
      leg.position.set(lx, 0.28, lz);
      cg.add(leg);
    });
    const runeGlow = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.55, 16),
      new THREE.MeshBasicMaterial({
        color: 0x72efdd,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      })
    );
    runeGlow.rotation.x = Math.PI / 2;
    runeGlow.position.y = 0.05;
    cg.add(seat, back, frame, runeGlow);
    return cg;
  }

  const targetChairGroup = buildChair();
  targetChairGroup.position.copy(targetChairPos);
  targetChairGroup.rotation.y = -0.45;
  group.add(targetChairGroup);
  flyingChairs.push({
    group: targetChairGroup,
    basePos: targetChairPos.clone(),
    phase: 0,
    isTarget: true,
  });

  for (let c = 0; c < 6; c++) {
    const cg = buildChair();
    const ang = (c / 6) * Math.PI * 2 + 0.5;
    const bp = new THREE.Vector3(Math.cos(ang) * 16, 9 + (c % 3) * 6, Math.sin(ang) * 16);
    cg.position.copy(bp);
    cg.rotation.y = -ang;
    group.add(cg);
    flyingChairs.push({ group: cg, basePos: bp, phase: c * 1.1, isTarget: false });
  }

  // Living Library NPCs
  const npcs: LibraryDynamicObjects['npcs'] = [];
  const npcSpecs: {
    mode: 'fly' | 'read' | 'discuss' | 'browse' | 'sit';
    pos: THREE.Vector3;
    robe: number;
    hat: boolean;
    orbitR?: number;
    greeting?: { speaker: string; text: string };
  }[] = [
    {
      mode: 'read',
      pos: new THREE.Vector3(-6, 0, -4),
      robe: 0x26486b,
      hat: true,
      greeting: { speaker: 'Student 1', text: 'Hi, Nate!' },
    },
    {
      mode: 'browse',
      pos: new THREE.Vector3(7, 0, -8),
      robe: 0x2e5e4e,
      hat: false,
      greeting: { speaker: 'Student 2', text: 'Looking for a new spellbook?' },
    },
    { mode: 'fly', pos: new THREE.Vector3(0, 14, 0), robe: 0x6b3fa0, hat: true, orbitR: 15 },
    { mode: 'fly', pos: new THREE.Vector3(0, 26, 0), robe: 0x8b2635, hat: true, orbitR: 19 },
    { mode: 'discuss', pos: new THREE.Vector3(-12, 0, 8), robe: 0x3b4d6b, hat: false },
    { mode: 'discuss', pos: new THREE.Vector3(-10.4, 0, 8.6), robe: 0x61442b, hat: true },
    { mode: 'read', pos: new THREE.Vector3(14, 10, 20), robe: 0x26486b, hat: true },
    { mode: 'browse', pos: new THREE.Vector3(-18, 10, -24), robe: 0x5c2d50, hat: false },
    { mode: 'fly', pos: new THREE.Vector3(0, 18, 0), robe: 0x2e5e4e, hat: true, orbitR: 12 },
  ];

  npcSpecs.forEach((spec, idx) => {
    const npc = createNpcModel({
      variant: idx % 3 === 0 ? 'scholar' : 'student',
      robeColor: spec.robe,
      hasHat: spec.hat,
    });
    npc.root.position.copy(spec.pos);
    group.add(npc.root);
    npcs.push({
      group: npc.root,
      leftArm: npc.leftArm,
      rightArm: npc.rightArm,
      head: npc.head,
      mode: spec.mode,
      orbitRadius: spec.orbitR,
      orbitSpeed: (idx % 2 === 0 ? 1 : -1) * 0.24,
      basePos: spec.pos.clone(),
      phase: idx * 1.4,
      greeting: spec.greeting,
      greeted: false,
    });
  });

  const libraryLights: THREE.PointLight[] = [];
  const l1 = new THREE.PointLight(0xffe1a8, 58, 75, 1.4);
  l1.position.set(0, 20, 0);
  const l2 = new THREE.PointLight(0x72efdd, 42, 65, 1.4);
  l2.position.set(0, 38, -8);
  const l3 = new THREE.PointLight(0xffd166, 34, 48, 1.4);
  l3.position.set(0, 25, -20);
  group.add(l1, l2, l3);
  libraryLights.push(l1, l2, l3);

  return {
    group,
    floatingBooks,
    flyingChairs,
    targetChairPos,
    targetChairGroup,
    targetBookGroup,
    targetBookPos,
    targetBeacon,
    astrolabeRings,
    floorRune,
    libraryLights,
    npcs,
    walkablePlatforms,
  };
}

export interface LumiRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  haloRing: THREE.Mesh;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  light: THREE.PointLight;
  motes: THREE.Group;
}

export function createLumiModel(): LumiRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 1.45;
  root.add(bodyGroup);

  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0xbefcf1,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.72,
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.85,
  });
  const mantleMat = new THREE.MeshStandardMaterial({
    color: 0x72efdd,
    emissive: 0x14b8a6,
    emissiveIntensity: 0.45,
    roughness: 0.42,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.65,
    metalness: 0.65,
    roughness: 0.25,
  });

  // Primary translucent spirit body + tapered tail
  const headOrb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), coreMat);
  bodyGroup.add(headOrb);

  const lowerWisp = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.56, 14), mantleMat);
  lowerWisp.rotation.x = Math.PI;
  lowerWisp.position.y = -0.36;
  bodyGroup.add(lowerWisp);

  // Crown ears / leaf-crests
  [-1, 1].forEach((s) => {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.26, 8), mantleMat);
    crest.position.set(s * 0.21, 0.26, -0.04);
    crest.rotation.z = -s * 0.42;
    crest.rotation.x = -0.2;
    bodyGroup.add(crest);
  });

  // Expressive glowing eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0xecfeff });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), eyeMat);
  leftEye.position.set(-0.115, 0.04, 0.3);
  leftEye.scale.set(0.95, 1.2, 0.55);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), eyeMat);
  rightEye.position.set(0.115, 0.04, 0.3);
  rightEye.scale.set(0.95, 1.2, 0.55);
  [-0.115, 0.115].forEach((ex) => {
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), pupilMat);
    glint.position.set(ex + 0.015, 0.06, 0.33);
    bodyGroup.add(glint);
  });
  bodyGroup.add(leftEye, rightEye);

  // Delicate translucent sprite wings
  const wingGeo = new THREE.PlaneGeometry(0.46, 0.28);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0,
    emissive: 0x5eead4,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    roughness: 0.3,
  });
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.38, 0.06, -0.14);
  leftWing.rotation.y = 0.45;
  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.38, 0.06, -0.14);
  rightWing.rotation.y = -0.45;
  bodyGroup.add(leftWing, rightWing);

  // Golden floating ring halo & orbiting spirit motes
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.032, 8, 28), goldMat);
  haloRing.rotation.x = Math.PI / 3;
  bodyGroup.add(haloRing);

  const motes = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const mote = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), goldMat);
    mote.position.set(Math.cos(a) * 0.68, (i % 2 === 0 ? 1 : -1) * 0.16, Math.sin(a) * 0.68);
    motes.add(mote);
  }
  bodyGroup.add(motes);

  const light = new THREE.PointLight(0x5eead4, 12, 16, 1.4);
  bodyGroup.add(light);

  return { root, bodyGroup, haloRing, leftWing, rightWing, leftEye, rightEye, light, motes };
}

export function animateLumi(rig: LumiRig, time: number, talking: boolean): void {
  rig.bodyGroup.position.y = 1.45 + Math.sin(time * 2.4) * 0.2;
  rig.haloRing.rotation.z = time * 1.1;
  rig.haloRing.rotation.y = Math.sin(time * 0.8) * 0.35;
  rig.motes.rotation.y = -time * 1.5;
  const flap = Math.sin(time * (talking ? 11 : 6.5)) * 0.32;
  rig.leftWing.rotation.y = 0.45 + flap;
  rig.rightWing.rotation.y = -0.45 - flap;
  const eyePulse = talking ? 1.0 + Math.abs(Math.sin(time * 8)) * 0.15 : 1.0;
  rig.leftEye.scale.y = 1.2 * eyePulse;
  rig.rightEye.scale.y = 1.2 * eyePulse;
  rig.light.intensity = talking ? 15 + Math.sin(time * 7) * 3 : 11;
}

export interface OrvellanRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  staffGroup: THREE.Group;
  staffCrystal: THREE.Mesh;
  heldBook: THREE.Mesh;
  auraRing: THREE.Mesh;
}

export function createOrvellanModel(tex: ProceduralTextures): OrvellanRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const cloakMat = new THREE.MeshStandardMaterial({
    map: tex.nateCape,
    color: 0x162647,
    roughness: 0.78,
    metalness: 0.08,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd9a84e,
    metalness: 0.75,
    roughness: 0.28,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    map: tex.nateSkin,
    color: 0xe6cbb8,
    roughness: 0.65,
  });
  const beardMat = new THREE.MeshStandardMaterial({
    color: 0xd8dee9,
    roughness: 0.82,
  });
  const staffWoodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    color: 0x3b2618,
    roughness: 0.72,
  });

  // Layered dark-blue wizard robe & mantle
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.5, 1.48, 16), cloakMat);
  robe.position.y = 0.74;
  robe.castShadow = true;
  bodyPivot.add(robe);

  const goldHem = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.025, 6, 20), trimMat);
  goldHem.rotation.x = Math.PI / 2;
  goldHem.position.y = 0.05;
  bodyPivot.add(goldHem);

  const shoulderCape = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.44, 14), cloakMat);
  shoulderCape.position.y = 1.28;
  shoulderCape.castShadow = true;
  bodyPivot.add(shoulderCape);

  const chestSash = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.92, 0.04), trimMat);
  chestSash.position.set(0, 0.96, 0.29);
  bodyPivot.add(chestSash);

  // Elderly wizard head, silver beard, brows & expressive eyes
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.54, 0);
  bodyPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 16), skinMat);
  head.position.y = 0.2;
  head.castShadow = true;
  headGroup.add(head);

  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.44, 10), beardMat);
  beard.rotation.x = Math.PI;
  beard.position.set(0, -0.02, 0.14);
  beard.scale.set(1.05, 1, 0.65);
  headGroup.add(beard);

  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.045, 0.06), beardMat);
  mustache.position.set(0, 0.13, 0.195);
  headGroup.add(mustache);

  const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  [-1, 1].forEach((s) => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeWhite);
    sclera.position.set(s * 0.072, 0.22, 0.185);
    sclera.scale.set(1, 0.85, 0.5);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), irisMat);
    iris.position.set(s * 0.072, 0.22, 0.2);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.022, 0.028), beardMat);
    brow.position.set(s * 0.072, 0.265, 0.19);
    brow.rotation.z = -s * 0.12;
    headGroup.add(sclera, iris, brow);
  });

  // Hood / Wizard Mantle Cap
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.65),
    cloakMat
  );
  hood.position.set(0, 0.22, -0.03);
  hood.rotation.x = -0.35;
  headGroup.add(hood);

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.38, 0);
  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.56, 10), cloakMat);
  lSleeve.position.y = -0.26;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), skinMat);
  lHand.position.y = -0.56;
  const heldBook = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.36, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.55 })
  );
  heldBook.position.set(0.08, -0.48, 0.18);
  heldBook.rotation.set(-0.65, 0.35, 0.2);
  leftArm.add(lSleeve, lHand, heldBook);
  bodyPivot.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.38, 0);
  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.56, 10), cloakMat);
  rSleeve.position.y = -0.26;
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), skinMat);
  rHand.position.y = -0.56;

  // Ancient Magical Staff
  const staffGroup = new THREE.Group();
  staffGroup.position.set(0.06, -0.54, 0.1);
  const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 2.05, 10), staffWoodMat);
  staffPole.position.y = 0.28;
  const staffRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.026, 8, 20), trimMat);
  staffRing.position.y = 1.36;
  const staffCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.11, 0),
    new THREE.MeshStandardMaterial({
      color: 0x72efdd,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.1,
      roughness: 0.15,
    })
  );
  staffCrystal.position.y = 1.36;
  const staffGlow = new THREE.PointLight(0x38bdf8, 6, 9, 1.4);
  staffGlow.position.y = 1.36;
  staffGroup.add(staffPole, staffRing, staffCrystal, staffGlow);
  rightArm.add(rSleeve, rHand, staffGroup);
  bodyPivot.add(rightArm);

  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.85, 28),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.04;
  root.add(auraRing);

  return { root, bodyPivot, headGroup, leftArm, rightArm, staffGroup, staffCrystal, heldBook, auraRing };
}

export function animateOrvellan(rig: OrvellanRig, time: number, talking: boolean, walking: boolean): void {
  const sway = Math.sin(time * (talking ? 3.2 : 1.4));
  rig.headGroup.rotation.y = sway * (talking ? 0.16 : 0.08);
  rig.headGroup.rotation.x = walking ? 0.05 : 0.08 + Math.sin(time * 1.1) * 0.04;
  rig.leftArm.rotation.x = walking ? Math.sin(time * 4.5) * 0.25 : -0.35 + sway * 0.06;
  rig.rightArm.rotation.x = walking ? -Math.sin(time * 4.5) * 0.25 : -0.25 + Math.cos(time * 2) * 0.05;
  rig.staffCrystal.rotation.y = time * 1.6;
  rig.auraRing.rotation.z = time * 0.45;
}

// ---------------------------------------------------------------------------
// Chapter 4 Characters: Princess Eita Yusa, Sneh, Pelicon Warriors & Citizens
// ---------------------------------------------------------------------------

export interface EitaRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftLid: THREE.Mesh;
  rightLid: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  smileMouth: THREE.Mesh;
  surprisedMouth: THREE.Mesh;
  hairBackUpper: THREE.Group;
  hairBackLower: THREE.Group;
  hairLeftStrand: THREE.Group;
  hairRightStrand: THREE.Group;
  skirtPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  shoulderAnchor: THREE.Group;
  handHoldTarget: THREE.Object3D;
}

export function createEitaModel(tex: ProceduralTextures): EitaRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const skinMat = new THREE.MeshStandardMaterial({
    map: tex.nateSkin,
    color: 0xf7dbc9,
    roughness: 0.5,
    metalness: 0.02,
  });
  const ivorySilkMat = new THREE.MeshStandardMaterial({
    map: tex.ivoryLace,
    color: 0xfef5ee,
    roughness: 0.54,
    metalness: 0.05,
  });
  const royalBlueMat = new THREE.MeshStandardMaterial({
    map: tex.royalBlueEmbroidery,
    normalMap: tex.royalBlueEmbroideryNormal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    color: 0xffffff,
    roughness: 0.48,
    metalness: 0.14,
  });
  const roseAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd99b6a,
    roughness: 0.45,
    metalness: 0.25,
  });
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6b84c,
    metalness: 0.85,
    roughness: 0.22,
    clearcoat: 0.35,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    map: tex.nateHair,
    color: 0x4b2a1e,
    roughness: 0.56,
    metalness: 0.08,
  });
  const highlightHairMat = new THREE.MeshStandardMaterial({
    color: 0x7c4a33,
    roughness: 0.52,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xc89352,
    roughness: 0.45,
    metalness: 0.18,
  });

  // Legs + shoes (partially under full-length split overskirt)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.095, 0.72, 0);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.095, 0.72, 0);
  [leftLeg, rightLeg].forEach((leg) => {
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.044, 0.66, 10), skinMat);
    calf.position.y = -0.33;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.2), shoeMat);
    shoe.position.set(0, -0.68, 0.04);
    shoe.castShadow = true;
    leg.add(calf, shoe);
    bodyPivot.add(leg);
  });

  // Modest ankle-length layered ivory lace & royal-blue gold-embroidered Pelicon court gown
  const skirtPivot = new THREE.Group();
  skirtPivot.position.set(0, 0.88, 0);
  const innerSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.4, 0.78, 18), ivorySilkMat);
  innerSkirt.position.y = -0.39;
  innerSkirt.castShadow = true;
  const blueOverSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.44, 0.66, 20, 1, true, -Math.PI * 0.78, Math.PI * 1.56),
    royalBlueMat
  );
  blueOverSkirt.rotation.y = Math.PI;
  blueOverSkirt.position.y = -0.34;
  blueOverSkirt.material = royalBlueMat.clone();
  blueOverSkirt.material.side = THREE.DoubleSide;
  const goldHem = new THREE.Mesh(new THREE.TorusGeometry(0.395, 0.016, 6, 24), goldMat);
  goldHem.rotation.x = Math.PI / 2;
  goldHem.position.y = -0.76;
  const sashFront = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.56, 0.025), roseAccentMat);
  sashFront.position.set(0, -0.28, 0.24);
  sashFront.rotation.x = -0.22;
  skirtPivot.add(innerSkirt, blueOverSkirt, goldHem, sashFront);
  bodyPivot.add(skirtPivot);

  // Bodice & waist
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.145, 0.44, 14), ivorySilkMat);
  torso.position.y = 1.09;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const blueCorset = new THREE.Mesh(new THREE.CylinderGeometry(0.164, 0.15, 0.31, 16), royalBlueMat);
  blueCorset.position.y = 1.04;
  bodyPivot.add(blueCorset);

  const goldBelt = new THREE.Mesh(new THREE.TorusGeometry(0.156, 0.022, 6, 18), goldMat);
  goldBelt.rotation.x = Math.PI / 2;
  goldBelt.position.y = 0.89;
  bodyPivot.add(goldBelt);

  // Royal chest emblem & delicate necklace with sapphire pendant
  const royalEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), goldMat);
  royalEmblem.position.set(0, 1.15, 0.162);
  royalEmblem.scale.set(1, 1.1, 0.45);
  const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.01, 6, 16), goldMat);
  necklace.rotation.x = Math.PI / 2 + 0.18;
  necklace.position.set(0, 1.29, 0.03);
  const necklaceGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.018, 0),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.4, roughness: 0.15 })
  );
  necklaceGem.position.set(0, 1.26, 0.125);
  bodyPivot.add(royalEmblem, necklace, necklaceGem);

  // Shoulder ornaments & Sneh shoulder anchor
  [-1, 1].forEach((side) => {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), goldMat);
    pauldron.position.set(side * 0.21, 1.27, 0);
    pauldron.rotation.z = -side * 0.35;
    bodyPivot.add(pauldron);
  });

  const shoulderAnchor = new THREE.Group();
  shoulderAnchor.position.set(0.24, 1.36, 0.01);
  bodyPivot.add(shoulderAnchor);

  // Neck + Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.064, 0.12, 10), skinMat);
  neck.position.y = 1.34;
  bodyPivot.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.38, 0);
  bodyPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 24, 20), skinMat);
  head.position.y = 0.18;
  head.scale.set(0.93, 1.04, 0.96);
  head.castShadow = true;
  headGroup.add(head);

  // Sculpted cheekbones & gold drop earrings
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf4a3a8, transparent: true, opacity: 0.42 });
  [-1, 1].forEach((s) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), skinMat);
    cheek.position.set(s * 0.088, 0.145, 0.122);
    cheek.scale.set(1.1, 0.85, 0.7);
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.028, 10), blushMat);
    blush.position.set(s * 0.09, 0.145, 0.148);
    blush.rotation.y = s * 0.35;
    const earRing = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), goldMat);
    earRing.position.set(s * 0.165, 0.125, 0.015);
    earRing.scale.set(0.7, 1.35, 0.7);
    headGroup.add(cheek, blush, earRing);
  });

  // Expressive Hazel-Amber Eyes + Eyelids + Brows
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x7a4b2a });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e1410 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const createEye = (side: number) => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), eyeWhiteMat);
    sclera.position.set(side * 0.062, 0.195, 0.148);
    sclera.scale.set(1.05, 1.0, 0.45);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), irisMat);
    iris.position.set(side * 0.062, 0.195, 0.158);
    iris.scale.set(1.0, 1.05, 0.42);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), pupilMat);
    pupil.position.set(side * 0.062, 0.195, 0.165);
    pupil.scale.set(1, 1, 0.4);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), glintMat);
    glint.position.set(side * 0.062 + 0.009, 0.205, 0.17);
    const lash = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.01, 0.018), hairMat);
    lash.position.set(side * 0.062, 0.222, 0.16);
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.038, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      skinMat
    );
    lid.position.set(side * 0.062, 0.198, 0.149);
    lid.scale.set(1.08, 0.08, 0.55);
    headGroup.add(sclera, iris, pupil, glint, lash, lid);
    return { iris, lid };
  };
  const lEye = createEye(-1);
  const rEye = createEye(1);

  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.011, 0.016), hairMat);
  leftBrow.position.set(-0.062, 0.245, 0.155);
  leftBrow.rotation.z = 0.08;
  const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.011, 0.016), hairMat);
  rightBrow.position.set(0.062, 0.245, 0.155);
  rightBrow.rotation.z = -0.08;
  headGroup.add(leftBrow, rightBrow);

  const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.044, 6), skinMat);
  noseBridge.rotation.x = -0.22;
  noseBridge.position.set(0, 0.174, 0.168);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), skinMat);
  noseTip.position.set(0, 0.156, 0.176);
  headGroup.add(noseBridge, noseTip);

  const smileMouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.0065, 6, 12, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xb95863 })
  );
  smileMouth.rotation.z = Math.PI;
  smileMouth.position.set(0, 0.125, 0.164);
  const surprisedMouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0x993e4c })
  );
  surprisedMouth.scale.set(0.9, 1.2, 0.4);
  surprisedMouth.position.set(0, 0.118, 0.164);
  surprisedMouth.visible = false;
  headGroup.add(smileMouth, surprisedMouth);

  // Royal Golden Filigree Tiara / Circlet
  const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.014, 8, 22), goldMat);
  circlet.rotation.x = Math.PI / 2 - 0.14;
  circlet.position.set(0, 0.28, -0.005);
  const circletArch = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 6, 12, Math.PI), goldMat);
  circletArch.position.set(0, 0.305, 0.152);
  const circletGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.024, 0),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.25, roughness: 0.18 })
  );
  circletGem.position.set(0, 0.31, 0.165);
  headGroup.add(circlet, circletArch, circletGem);

  // Detailed Hair Cap + Bangs + Articulated Long Flowing Strands
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.188, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.68),
    hairMat
  );
  hairCap.position.set(0, 0.2, -0.015);
  hairCap.rotation.x = -0.22;
  headGroup.add(hairCap);

  [-0.08, 0, 0.08].forEach((bx, idx) => {
    const bang = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.11, 7), idx === 1 ? highlightHairMat : hairMat);
    bang.position.set(bx, 0.295, 0.135);
    bang.rotation.set(0.55, 0, bx * -1.4);
    headGroup.add(bang);
  });

  const hairBackUpper = new THREE.Group();
  hairBackUpper.position.set(0, 0.22, -0.15);
  const backTopMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.34, 12), hairMat);
  backTopMesh.position.y = -0.17;
  backTopMesh.scale.set(1.15, 1, 0.55);
  backTopMesh.castShadow = true;
  hairBackUpper.add(backTopMesh);

  const hairBackLower = new THREE.Group();
  hairBackLower.position.set(0, -0.32, 0);
  const backLowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.13, 0.42, 12), highlightHairMat);
  backLowMesh.position.y = -0.2;
  backLowMesh.scale.set(1.15, 1, 0.5);
  const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 10), hairMat);
  tailTip.rotation.x = Math.PI;
  tailTip.position.y = -0.5;
  tailTip.scale.set(1.1, 1, 0.45);
  hairBackLower.add(backLowMesh, tailTip);
  hairBackUpper.add(hairBackLower);
  headGroup.add(hairBackUpper);

  const hairLeftStrand = new THREE.Group();
  hairLeftStrand.position.set(-0.145, 0.2, 0.04);
  const lStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.018, 0.42, 8), hairMat);
  lStrand.position.y = -0.21;
  hairLeftStrand.add(lStrand);

  const hairRightStrand = new THREE.Group();
  hairRightStrand.position.set(0.145, 0.2, 0.04);
  const rStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.018, 0.42, 8), highlightHairMat);
  rStrand.position.y = -0.21;
  hairRightStrand.add(rStrand);
  headGroup.add(hairLeftStrand, hairRightStrand);

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.205, 1.24, 0);
  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.26, 10), ivorySilkMat);
  lSleeve.position.y = -0.13;
  const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.034, 0.24, 10), skinMat);
  lFore.position.y = -0.36;
  const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.01, 6, 12), goldMat);
  lCuff.rotation.x = Math.PI / 2;
  lCuff.position.y = -0.26;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), skinMat);
  lHand.position.y = -0.49;
  leftArm.add(lSleeve, lFore, lCuff, lHand);
  bodyPivot.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.205, 1.24, 0);
  const rSleeve = lSleeve.clone();
  const rFore = lFore.clone();
  const rCuff = lCuff.clone();
  const rHand = lHand.clone();
  const handHoldTarget = new THREE.Object3D();
  handHoldTarget.position.set(0, -0.5, 0.02);
  rightArm.add(rSleeve, rFore, rCuff, rHand, handHoldTarget);
  bodyPivot.add(rightArm);

  return {
    root,
    bodyPivot,
    headGroup,
    leftEye: lEye.iris,
    rightEye: rEye.iris,
    leftLid: lEye.lid,
    rightLid: rEye.lid,
    leftBrow,
    rightBrow,
    smileMouth,
    surprisedMouth,
    hairBackUpper,
    hairBackLower,
    hairLeftStrand,
    hairRightStrand,
    skirtPivot,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shoulderAnchor,
    handHoldTarget,
  };
}

export function animateEita(
  rig: EitaRig,
  time: number,
  opts: {
    walkPhase?: number;
    walking?: boolean;
    talking?: boolean;
    expression?: DialogueEmotion | 'gentle' | 'smile' | 'hug';
    wind?: number;
    lookAtYaw?: number;
    lookAtPitch?: number;
  }
): void {
  const walk = opts.walking ? (opts.walkPhase ?? time * 5.2) : 0;
  const wind = opts.wind ?? 0.55;
  const expr = opts.expression ?? 'gentle';

  // Natural blinking cycle every ~3.4 seconds
  const blinkCycle = time % 3.4;
  const blinkAmt = blinkCycle < 0.14 ? Math.sin((blinkCycle / 0.14) * Math.PI) : 0;
  const lidScaleY = 0.08 + blinkAmt * 0.95;
  rig.leftLid.scale.y = lidScaleY;
  rig.rightLid.scale.y = lidScaleY;

  // Facial expressions (full 8-emotion + legacy hug/gentle/smile support)
  if (expr === 'surprised') {
    rig.smileMouth.visible = false;
    rig.surprisedMouth.visible = true;
    rig.leftBrow.position.y = 0.258;
    rig.rightBrow.position.y = 0.258;
    rig.leftBrow.rotation.z = 0.16;
    rig.rightBrow.rotation.z = -0.16;
  } else {
    rig.smileMouth.visible = true;
    rig.surprisedMouth.visible = false;
    const isHappy = expr === 'smile' || expr === 'hug' || expr === 'happy';
    const isNegative = expr === 'concerned' || expr === 'sad' || expr === 'angry';
    rig.smileMouth.rotation.z = isNegative ? 0 : Math.PI;
    rig.smileMouth.position.y = isNegative ? 0.114 : 0.125;
    rig.smileMouth.scale.set(
      isHappy ? 1.28 : expr === 'sad' ? 0.8 : 1.0,
      opts.talking ? 1.0 + Math.abs(Math.sin(time * 9)) * 0.45 : 1.0,
      1
    );
    const browY = expr === 'emotional' || expr === 'curious' ? 0.252 : expr === 'angry' ? 0.238 : 0.245;
    rig.leftBrow.position.y = browY;
    rig.rightBrow.position.y = expr === 'curious' ? 0.244 : browY;
    const browTilt = expr === 'angry' ? -0.18 : expr === 'emotional' || expr === 'sad' || expr === 'concerned' ? -0.1 : 0.08;
    rig.leftBrow.rotation.z = browTilt;
    rig.rightBrow.rotation.z = -browTilt;
  }

  // Head look & talk nod
  const talkNod = opts.talking ? Math.sin(time * 6.5) * 0.06 : Math.sin(time * 1.4) * 0.025;
  rig.headGroup.rotation.y = (opts.lookAtYaw ?? 0) + (opts.talking ? Math.sin(time * 2.8) * 0.08 : 0);
  rig.headGroup.rotation.x = (opts.lookAtPitch ?? 0) + talkNod;

  // Flowing hair animation in desert wind / movement
  const windGust = Math.sin(time * 2.1) * 0.08 + Math.sin(time * 4.3) * 0.04;
  rig.hairBackUpper.rotation.x = 0.14 + wind * 0.24 + windGust + (opts.walking ? 0.18 : 0);
  rig.hairBackUpper.rotation.z = Math.sin(time * 1.7) * 0.05 * wind;
  rig.hairBackLower.rotation.x = 0.1 + wind * 0.28 + Math.cos(time * 3.1) * 0.08;
  rig.hairBackLower.rotation.z = Math.cos(time * 2.3) * 0.07 * wind;
  rig.hairLeftStrand.rotation.x = -0.04 + wind * 0.15 + Math.sin(time * 2.5) * 0.05;
  rig.hairLeftStrand.rotation.z = 0.08 + wind * 0.08;
  rig.hairRightStrand.rotation.x = -0.04 + wind * 0.15 + Math.cos(time * 2.5) * 0.05;
  rig.hairRightStrand.rotation.z = -0.08 - wind * 0.08;

  // Body / arms / legs / skirt sway
  if (expr === 'hug') {
    rig.bodyPivot.position.y = 0;
    rig.bodyPivot.rotation.x = 0.06;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
    rig.leftArm.rotation.set(-1.15, 0.35, -0.18);
    rig.rightArm.rotation.set(-1.15, -0.35, 0.18);
    rig.skirtPivot.rotation.x = 0.04;
  } else if (opts.walking) {
    const stride = Math.sin(walk);
    rig.bodyPivot.position.y = Math.abs(Math.cos(walk)) * 0.035;
    rig.bodyPivot.rotation.x = 0.04;
    rig.leftLeg.rotation.x = stride * 0.42;
    rig.rightLeg.rotation.x = -stride * 0.42;
    rig.leftArm.rotation.set(-stride * 0.32, 0, -0.08);
    rig.rightArm.rotation.set(stride * 0.32, 0, 0.08);
    rig.skirtPivot.rotation.x = 0.08 + Math.abs(stride) * 0.06;
  } else {
    rig.bodyPivot.position.y = Math.sin(time * 1.9) * 0.012;
    rig.bodyPivot.rotation.x = 0;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
    const gesture = opts.talking ? Math.sin(time * 4.2) * 0.18 : Math.sin(time * 1.4) * 0.04;
    rig.leftArm.rotation.set(-0.15 + gesture * 0.7, 0, -0.09);
    rig.rightArm.rotation.set(-0.22 - gesture, 0, 0.09);
    rig.skirtPivot.rotation.x = wind * 0.06 + windGust * 0.3;
  }
}

export interface SnehRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  shell: THREE.Mesh;
  leftEyeStalk: THREE.Group;
  rightEyeStalk: THREE.Group;
  sparkleGroup: THREE.Group;
  scaleBase: number;
}

export function createSnehModel(tex: ProceduralTextures): SnehRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const pinkBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf9a8d4,
    roughness: 0.48,
    metalness: 0.04,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xfce7f3,
    roughness: 0.55,
  });
  const shellMat = new THREE.MeshStandardMaterial({
    map: tex.snehShell,
    color: 0xf472b6,
    roughness: 0.36,
    metalness: 0.14,
  });
  const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.24, 8, 12), pinkBodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 0.11, 0.03);
  body.castShadow = true;

  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.34), bellyMat);
  foot.position.set(0, 0.03, 0.03);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), pinkBodyMat);
  head.position.set(0, 0.16, 0.2);

  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 16), shellMat);
  shell.position.set(0, 0.24, -0.06);
  shell.scale.set(0.92, 1.0, 1.08);
  shell.castShadow = true;

  const shellBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.155, 0.025, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, metalness: 0.35 })
  );
  shellBand.rotation.y = Math.PI / 2;
  shellBand.position.set(0, 0.24, -0.06);

  const createStalk = (x: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0.23, 0.23);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.12, 8), pinkBodyMat);
    stalk.position.y = 0.055;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), eyeWhite);
    eye.position.set(0, 0.12, 0.01);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), pupilMat);
    pupil.position.set(0, 0.12, 0.036);
    g.add(stalk, eye, pupil);
    return g;
  };
  const leftEyeStalk = createStalk(-0.055);
  const rightEyeStalk = createStalk(0.055);

  const sparkleGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const mote = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.022, 0),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xf9a8d4 : 0xfef08a })
    );
    mote.position.set(Math.cos(a) * 0.24, 0.26 + (i % 2) * 0.08, Math.sin(a) * 0.24);
    sparkleGroup.add(mote);
  }

  bodyPivot.add(body, foot, head, shell, shellBand, leftEyeStalk, rightEyeStalk, sparkleGroup);
  return { root, bodyPivot, shell, leftEyeStalk, rightEyeStalk, sparkleGroup, scaleBase: 1 };
}

export function animateSneh(
  rig: SnehRig,
  time: number,
  mode: 'idle' | 'crawl' | 'talk' | 'roll'
): void {
  rig.sparkleGroup.rotation.y = time * 1.4;
  if (mode === 'roll') {
    rig.bodyPivot.rotation.x = time * 10;
    rig.bodyPivot.position.y = Math.abs(Math.sin(time * 8)) * 0.08;
    return;
  }
  rig.bodyPivot.rotation.x = 0;
  if (mode === 'crawl') {
    rig.bodyPivot.position.y = Math.abs(Math.sin(time * 7)) * 0.035;
    rig.shell.rotation.z = Math.sin(time * 7) * 0.08;
    rig.leftEyeStalk.rotation.x = Math.sin(time * 5) * 0.12;
    rig.rightEyeStalk.rotation.x = -Math.sin(time * 5) * 0.12;
  } else if (mode === 'talk') {
    rig.bodyPivot.position.y = Math.abs(Math.sin(time * 6)) * 0.05;
    rig.leftEyeStalk.rotation.z = 0.08 + Math.sin(time * 8) * 0.12;
    rig.rightEyeStalk.rotation.z = -0.08 - Math.sin(time * 8) * 0.12;
  } else {
    rig.bodyPivot.position.y = Math.sin(time * 2.5) * 0.015;
    rig.shell.rotation.z = Math.sin(time * 1.8) * 0.03;
    rig.leftEyeStalk.rotation.set(Math.sin(time * 1.9) * 0.06, 0, 0.05);
    rig.rightEyeStalk.rotation.set(Math.cos(time * 2.1) * 0.06, 0, -0.05);
  }
}

export interface PeliconWarriorRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  shieldMesh: THREE.Mesh;
  swordMesh: THREE.Group;
  struckArrow: THREE.Group;
}

export function createPeliconWarriorModel(
  tex: ProceduralTextures,
  variant: 'ally' | 'wounded' | 'enemy' | 'captain'
): PeliconWarriorRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const isEnemy = variant === 'enemy' || variant === 'captain';
  const armorMat = new THREE.MeshStandardMaterial({
    color: isEnemy ? 0x475569 : 0xca8a04,
    metalness: 0.65,
    roughness: 0.32,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    map: tex.nateCape,
    color: isEnemy ? 0x881337 : 0x0f766e,
    roughness: 0.72,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    map: tex.nateSkin,
    color: 0xd9a88b,
    roughness: 0.62,
  });

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.84, 0);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, 0.84, 0);
  [leftLeg, rightLeg].forEach((leg) => {
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.78, 10), clothMat);
    shin.position.y = -0.39;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.24), armorMat);
    boot.position.set(0, -0.78, 0.04);
    leg.add(shin, boot);
    bodyPivot.add(leg);
  });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.62, 12), armorMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.54, 0.05), clothMat);
  tabard.position.set(0, 1.0, 0.21);
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.75, 0.04), clothMat);
  cape.position.set(0, 1.08, -0.22);
  cape.rotation.x = 0.14;
  bodyPivot.add(tabard, cape);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.52, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), skinMat);
  head.position.y = 0.18;
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
    armorMat
  );
  helm.position.y = 0.21;
  headGroup.add(head, helm);

  if (variant === 'captain' || !isEnemy) {
    const crest = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, variant === 'captain' ? 0.22 : 0.12, 0.28),
      clothMat
    );
    crest.position.set(0, 0.4, -0.02);
    headGroup.add(crest);
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: isEnemy ? 0xfca5a5 : 0x1e293b });
  [-0.065, 0.065].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), eyeMat);
    eye.position.set(ex, 0.19, 0.165);
    headGroup.add(eye);
  });
  bodyPivot.add(headGroup);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.3, 1.38, 0);
  const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.54, 10), clothMat);
  lArmMesh.position.y = -0.27;
  const shieldMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 14), armorMat);
  shieldMesh.rotation.z = Math.PI / 2;
  shieldMesh.position.set(-0.08, -0.36, 0.1);
  leftArm.add(lArmMesh, shieldMesh);
  bodyPivot.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.3, 1.38, 0);
  const rArmMesh = lArmMesh.clone();
  const swordMesh = new THREE.Group();
  swordMesh.position.set(0, -0.52, 0.12);
  swordMesh.rotation.x = Math.PI / 2 - 0.2;
  const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.04), armorMat);
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.78, 0.022),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.18 })
  );
  blade.position.y = 0.42;
  swordMesh.add(hilt, blade);
  rightArm.add(rArmMesh, swordMesh);
  bodyPivot.add(rightArm);

  // Stylized prop arrow (used non-graphically during Act 2 wounded warrior cutscene)
  const struckArrow = new THREE.Group();
  const arrowShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.72, 6),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf97316, emissiveIntensity: 0.28 })
  );
  arrowShaft.rotation.x = Math.PI / 3;
  struckArrow.add(arrowShaft);
  struckArrow.position.set(-0.18, 1.18, 0.22);
  struckArrow.visible = false;
  bodyPivot.add(struckArrow);

  return {
    root,
    bodyPivot,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shieldMesh,
    swordMesh,
    struckArrow,
  };
}

export function animatePeliconWarrior(
  rig: PeliconWarriorRig,
  time: number,
  state: 'idle' | 'walk' | 'attack' | 'cheer' | 'wounded' | 'down' | 'vanish',
  phase = 0
): void {
  if (state === 'down') {
    rig.bodyPivot.rotation.x = -Math.PI * 0.46;
    rig.bodyPivot.position.y = 0.22;
    rig.leftArm.rotation.set(0.2, 0, -0.35);
    rig.rightArm.rotation.set(0.1, 0, 0.35);
    return;
  }
  if (state === 'wounded') {
    rig.bodyPivot.rotation.x = -Math.PI * 0.36;
    rig.bodyPivot.position.y = 0.34;
    rig.headGroup.rotation.x = 0.35 + Math.sin(time * 2) * 0.04;
    rig.rightArm.rotation.set(-0.4, 0, 0.25);
    return;
  }
  if (state === 'cheer') {
    rig.bodyPivot.rotation.x = 0;
    rig.bodyPivot.position.y = Math.abs(Math.sin(time * 6 + phase)) * 0.14;
    rig.rightArm.rotation.set(-2.4 + Math.sin(time * 8 + phase) * 0.3, 0, 0.2);
    rig.leftArm.rotation.set(-1.9 + Math.cos(time * 7 + phase) * 0.25, 0, -0.2);
    return;
  }
  rig.bodyPivot.rotation.x = 0;
  if (state === 'attack') {
    const swing = Math.sin(time * 9 + phase);
    rig.bodyPivot.position.y = 0.04;
    rig.rightArm.rotation.set(-1.35 + swing * 0.9, 0, 0.2);
    rig.leftArm.rotation.set(-0.85, 0.45, -0.15);
    rig.leftLeg.rotation.x = 0.22;
    rig.rightLeg.rotation.x = -0.22;
  } else if (state === 'walk') {
    const s = Math.sin(time * 6.5 + phase);
    rig.bodyPivot.position.y = Math.abs(Math.cos(time * 6.5 + phase)) * 0.045;
    rig.leftLeg.rotation.x = s * 0.48;
    rig.rightLeg.rotation.x = -s * 0.48;
    rig.leftArm.rotation.set(-s * 0.35 - 0.3, 0, -0.1);
    rig.rightArm.rotation.set(s * 0.35 - 0.25, 0, 0.1);
  } else {
    rig.bodyPivot.position.y = Math.sin(time * 2 + phase) * 0.02;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
    rig.leftArm.rotation.set(-0.35, 0, -0.12);
    rig.rightArm.rotation.set(-0.25, 0, 0.12);
  }
}

export interface TownCitizenRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  propGroup: THREE.Group;
}

export function createTownCitizenModel(
  tex: ProceduralTextures,
  opts: { child?: boolean; tunicColor: number; prop: 'flag' | 'lute' | 'drum' | 'none' }
): TownCitizenRig {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const scale = opts.child ? 0.72 : 1.0;
  bodyPivot.scale.setScalar(scale);

  const tunicMat = new THREE.MeshStandardMaterial({
    map: tex.nateTunic,
    color: opts.tunicColor,
    roughness: 0.65,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    map: tex.nateSkin,
    color: 0xe6bf9f,
    roughness: 0.6,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: tex.wood,
    color: 0x7c4a21,
    roughness: 0.65,
  });

  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 1.12, 12), tunicMat);
  robe.position.y = 0.56;
  robe.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skinMat);
  head.position.y = 1.28;
  const turban = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.055, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 })
  );
  turban.rotation.x = Math.PI / 2;
  turban.position.y = 1.38;
  bodyPivot.add(robe, head, turban);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 1.04, 0);
  const lMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.04, 0.44, 8), tunicMat);
  lMesh.position.y = -0.22;
  leftArm.add(lMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, 1.04, 0);
  const rMesh = lMesh.clone();
  rightArm.add(rMesh);

  const propGroup = new THREE.Group();
  if (opts.prop === 'flag') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 6), woodMat);
    pole.position.set(0, 0.15, 0.12);
    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    cloth.position.set(0.25, 0.62, 0.12);
    propGroup.add(pole, cloth);
    rightArm.add(propGroup);
  } else if (opts.prop === 'lute') {
    const luteBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), woodMat);
    luteBody.scale.set(0.85, 1.15, 0.45);
    luteBody.position.set(0, 0.9, 0.24);
    const luteNeck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.03), woodMat);
    luteNeck.position.set(0.18, 1.08, 0.24);
    luteNeck.rotation.z = -0.65;
    propGroup.add(luteBody, luteNeck);
    bodyPivot.add(propGroup);
  } else if (opts.prop === 'drum') {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.16, 0.26, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 })
    );
    drum.position.set(0, 0.85, 0.25);
    propGroup.add(drum);
    bodyPivot.add(propGroup);
  }

  bodyPivot.add(leftArm, rightArm);
  return { root, bodyPivot, leftArm, rightArm, propGroup };
}

export function animateTownCitizen(
  rig: TownCitizenRig,
  time: number,
  phase: number,
  cheering: boolean
): void {
  const bounce = cheering ? Math.abs(Math.sin(time * 5.2 + phase)) * 0.12 : Math.sin(time * 2 + phase) * 0.02;
  rig.bodyPivot.position.y = bounce;
  if (cheering) {
    rig.leftArm.rotation.set(-2.1 + Math.sin(time * 7 + phase) * 0.32, 0, -0.2);
    rig.rightArm.rotation.set(-2.1 + Math.cos(time * 6.5 + phase) * 0.32, 0, 0.2);
  } else {
    rig.leftArm.rotation.set(-0.4 + Math.sin(time * 4 + phase) * 0.15, 0, -0.1);
    rig.rightArm.rotation.set(-0.5 + Math.cos(time * 4.5 + phase) * 0.18, 0, 0.1);
  }
}


