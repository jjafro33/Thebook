import * as THREE from 'three';

export interface PathSample {
  u: number;
  distanceAlong: number;
  distanceRemaining: number;
  lateralDist: number;
  closestPoint: THREE.Vector3;
  tangent: THREE.Vector3;
}

export const TOTAL_JOURNEY_METERS = 1000;

function buildExactOneKmCurve(): THREE.CatmullRomCurve3 {
  // Scenic winding valley route from Nate's cottage (0,0,0) to Ench Library
  const rawPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(6, 0, -45),
    new THREE.Vector3(24, 0.2, -95),
    new THREE.Vector3(52, 0.4, -148),
    new THREE.Vector3(44, 0.6, -210),
    new THREE.Vector3(10, 0.9, -268),
    new THREE.Vector3(-32, 1.3, -328),
    new THREE.Vector3(-48, 1.8, -395),
    new THREE.Vector3(-18, 2.2, -460),
    new THREE.Vector3(28, 2.8, -525),
    new THREE.Vector3(55, 3.6, -595),
    new THREE.Vector3(36, 4.4, -668),
    new THREE.Vector3(-12, 5.4, -735),
    new THREE.Vector3(-26, 6.6, -805),
    new THREE.Vector3(0, 7.8, -875),
    new THREE.Vector3(0, 8.5, -935),
  ];

  const tempCurve = new THREE.CatmullRomCurve3(rawPoints, false, 'catmullrom', 0.5);
  const rawLength = tempCurve.getLength();
  const scaleXZ = TOTAL_JOURNEY_METERS / rawLength;

  // Scale X and Z proportionally so arc length is precisely 1000.00m
  const scaledPoints = rawPoints.map(
    (p) => new THREE.Vector3(p.x * scaleXZ, p.y, p.z * scaleXZ)
  );
  const exactCurve = new THREE.CatmullRomCurve3(scaledPoints, false, 'catmullrom', 0.5);

  // Fine-tune final scale pass to account for Y elevation delta
  const len2 = exactCurve.getLength();
  const fineScale = TOTAL_JOURNEY_METERS / len2;
  const finalPoints = scaledPoints.map(
    (p) => new THREE.Vector3(p.x * fineScale, p.y * fineScale, p.z * fineScale)
  );
  return new THREE.CatmullRomCurve3(finalPoints, false, 'catmullrom', 0.5);
}

export const JOURNEY_CURVE = buildExactOneKmCurve();
export const JOURNEY_SAMPLES = 500;
const sampledPoints: THREE.Vector3[] = JOURNEY_CURVE.getSpacedPoints(JOURNEY_SAMPLES);
const sampledTangents: THREE.Vector3[] = [];
for (let i = 0; i <= JOURNEY_SAMPLES; i++) {
  sampledTangents.push(JOURNEY_CURVE.getTangentAt(i / JOURNEY_SAMPLES).normalize());
}

export const LIBRARY_PLAZA_POS = sampledPoints[JOURNEY_SAMPLES].clone();
export const LIBRARY_ENTRANCE_DIR = sampledTangents[JOURNEY_SAMPLES].clone();

export const BRIDGE_U_POSITIONS = [0.165, 0.472];

export interface BridgeFrame {
  u: number;
  pos: THREE.Vector3;
  tan: THREE.Vector3;
  perp: THREE.Vector3;
}

export const BRIDGE_FRAMES: BridgeFrame[] = BRIDGE_U_POSITIONS.map((u) => {
  const pos = JOURNEY_CURVE.getPointAt(u);
  const tan = JOURNEY_CURVE.getTangentAt(u).normalize();
  const perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
  return { u, pos, tan, perp };
});

const b1 = BRIDGE_FRAMES[0];
const b2 = BRIDGE_FRAMES[1];

// Brook curve winding beside the village, passing perpendicularly West->East under Bridge 1
// and East->West under Bridge 2, then staying cleanly West of the upper valley road.
const brookPoints = [
  new THREE.Vector3(-34, -0.58, 24),
  new THREE.Vector3(-18, -0.50, -45),
  new THREE.Vector3(6, -0.38, -108),
  new THREE.Vector3(b1.pos.x - b1.perp.x * 26, b1.pos.y - 0.55, b1.pos.z - b1.perp.z * 26),
  new THREE.Vector3(b1.pos.x, b1.pos.y - 0.55, b1.pos.z), // Directly under Bridge 1
  new THREE.Vector3(b1.pos.x + b1.perp.x * 26, b1.pos.y - 0.55, b1.pos.z + b1.perp.z * 26),
  new THREE.Vector3(62, 0.25, -245),
  new THREE.Vector3(18, 0.82, -335),
  new THREE.Vector3(b2.pos.x + b2.perp.x * 26, b2.pos.y - 0.55, b2.pos.z + b2.perp.z * 26),
  new THREE.Vector3(b2.pos.x, b2.pos.y - 0.55, b2.pos.z), // Directly under Bridge 2
  new THREE.Vector3(b2.pos.x - b2.perp.x * 26, b2.pos.y - 0.55, b2.pos.z - b2.perp.z * 26),
  new THREE.Vector3(-56, b2.pos.y + 0.15, -520),
  new THREE.Vector3(-50, b2.pos.y + 0.85, -630),
  new THREE.Vector3(-56, b2.pos.y + 1.55, -745),
  new THREE.Vector3(-48, b2.pos.y + 2.25, -855),
];
export const BROOK_CURVE = new THREE.CatmullRomCurve3(brookPoints, false, 'catmullrom', 0.5);
const brookSamples = BROOK_CURVE.getSpacedPoints(720);

export function getNearestPathInfo(x: number, z: number): PathSample {
  let bestIdx = 0;
  let bestDistSq = Infinity;
  for (let i = 0; i <= JOURNEY_SAMPLES; i++) {
    const p = sampledPoints[i];
    const dx = x - p.x;
    const dz = z - p.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      bestIdx = i;
    }
  }
  const u = bestIdx / JOURNEY_SAMPLES;
  const distanceAlong = u * TOTAL_JOURNEY_METERS;
  const distanceRemaining = Math.max(0, TOTAL_JOURNEY_METERS - distanceAlong);
  return {
    u,
    distanceAlong,
    distanceRemaining,
    lateralDist: Math.sqrt(bestDistSq),
    closestPoint: sampledPoints[bestIdx],
    tangent: sampledTangents[bestIdx],
  };
}

export function getBrookDistance(x: number, z: number): { dist: number; waterY: number } {
  let bestD2 = Infinity;
  let bestY = -0.3;
  for (let i = 0; i < brookSamples.length; i++) {
    const p = brookSamples[i];
    const dx = x - p.x;
    const dz = z - p.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestY = p.y;
    }
  }
  return { dist: Math.sqrt(bestD2), waterY: bestY };
}

const WATERFALL_POINTS = [BROOK_CURVE.getPointAt(0.06), BROOK_CURVE.getPointAt(0.255)];

export interface Chapter1AudioContext {
  riverProximity: number;
  waterfallProximity: number;
  riverPan: number;
  forestProximity: number;
}

export function getChapter1AudioContext(
  x: number,
  z: number,
  listenerYaw: number
): Chapter1AudioContext {
  let bestIdx = 0;
  let bestD2 = Infinity;
  for (let i = 0; i < brookSamples.length; i++) {
    const p = brookSamples[i];
    const dx = x - p.x;
    const dz = z - p.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestIdx = i;
    }
  }
  const bestPt = brookSamples[bestIdx];
  const brookDist = Math.sqrt(bestD2);
  const riverProximity = THREE.MathUtils.clamp(1 - Math.max(0, brookDist - 3.5) / 36, 0, 1);

  let nearestWfDist = Infinity;
  for (const wf of WATERFALL_POINTS) {
    const d = Math.hypot(x - wf.x, z - wf.z);
    if (d < nearestWfDist) nearestWfDist = d;
  }
  const waterfallProximity = THREE.MathUtils.clamp(1 - Math.max(0, nearestWfDist - 6) / 34, 0, 1);

  // Compute stereo pan toward nearest river bend relative to listener facing yaw
  const toRiverX = bestPt.x - x;
  const toRiverZ = bestPt.z - z;
  const len = Math.hypot(toRiverX, toRiverZ);
  let riverPan = 0;
  if (len > 0.5) {
    // Listener right vector when facing (-sin(yaw), 0, -cos(yaw)) is (cos(yaw), 0, -sin(yaw))
    const rightX = Math.cos(listenerYaw);
    const rightZ = -Math.sin(listenerYaw);
    const dot = (toRiverX * rightX + toRiverZ * rightZ) / len;
    const panWeight = THREE.MathUtils.smoothstep(brookDist, 2.5, 14);
    riverPan = THREE.MathUtils.clamp(dot * panWeight * 0.82, -0.85, 0.85);
  }

  // Forest density along the valley corridor: quiet in Brook Village yard, dense in valley woods, tapering at Library plaza
  const pathInfo = getNearestPathInfo(x, z);
  const enterWoods = THREE.MathUtils.smoothstep(pathInfo.u, 0.05, 0.22);
  const exitWoods = 1 - THREE.MathUtils.smoothstep(pathInfo.u, 0.89, 0.985);
  const lateralTreeBoost = THREE.MathUtils.smoothstep(pathInfo.lateralDist, 3.0, 11.5) * 0.28;
  const forestProximity = THREE.MathUtils.clamp(
    (0.14 + 0.68 * enterWoods * exitWoods + lateralTreeBoost * exitWoods),
    0,
    1
  );

  return {
    riverProximity,
    waterfallProximity,
    riverPan,
    forestProximity,
  };
}

export function getTerrainHeight(x: number, z: number): number {
  const pathInfo = getNearestPathInfo(x, z);
  const basePathY = pathInfo.closestPoint.y;

  // Smooth rolling hill profile outside the guided corridor
  const hillNoise =
    Math.sin(x * 0.035) * Math.cos(z * 0.03) * 2.4 +
    Math.sin(x * 0.08 + z * 0.06) * 0.85;

  const corridorBlend = THREE.MathUtils.smoothstep(pathInfo.lateralDist, 4.5, 22.0);
  let height = basePathY + hillNoise * corridorBlend;

  // Raise distant valley ridges beyond 26m from the path
  if (pathInfo.lateralDist > 26) {
    height += Math.pow((pathInfo.lateralDist - 26) * 0.18, 1.35);
  }

  // Flat grand plaza around Ench Library entrance
  const distToLib = Math.hypot(x - LIBRARY_PLAZA_POS.x, z - LIBRARY_PLAZA_POS.z);
  if (distToLib < 28) {
    const flatBlend = 1 - THREE.MathUtils.smoothstep(distToLib, 18, 28);
    height = THREE.MathUtils.lerp(height, LIBRARY_PLAZA_POS.y, flatBlend);
  }

  // Flat village courtyard around Nate's house
  const distToHome = Math.hypot(x, z);
  if (distToHome < 24) {
    const homeBlend = 1 - THREE.MathUtils.smoothstep(distToHome, 14, 24);
    height = THREE.MathUtils.lerp(height, 0, homeBlend);
  }

  // Keep riverbank ground at or above bank height so water never floats above low terrain dips,
  // then carve a crisp riverbed channel strictly inside 8.2m so bridge abutments sit flush on the banks.
  const brook = getBrookDistance(x, z);
  if (brook.dist < 15.5) {
    const bankRimMin = brook.waterY + 0.55;
    if (height < bankRimMin) {
      const rimBlend = 1 - THREE.MathUtils.smoothstep(brook.dist, 8.2, 15.5);
      height = THREE.MathUtils.lerp(height, bankRimMin, rimBlend);
    }
  }
  if (brook.dist < 8.2) {
    const riverBedY = brook.waterY - 1.45;
    const bankBlend = 1 - THREE.MathUtils.smoothstep(brook.dist, 4.2, 8.2);
    height = THREE.MathUtils.lerp(height, riverBedY, bankBlend);
  }

  return height;
}

export function getWalkSurfaceHeight(x: number, z: number): { y: number; surface: 'grass' | 'stone' | 'wood' } {
  // Check exact oriented wooden bridge deck & stone approach ramps first
  for (const bf of BRIDGE_FRAMES) {
    const dx = x - bf.pos.x;
    const dz = z - bf.pos.z;
    const along = dx * bf.tan.x + dz * bf.tan.z;
    const across = Math.abs(dx * bf.perp.x + dz * bf.perp.z);
    if (Math.abs(along) <= 9.4 && across <= 2.95) {
      if (Math.abs(along) <= 8.2) {
        const archTop = Math.cos((along / 8.2) * (Math.PI / 2)) * 0.9 + 0.08;
        return { y: bf.pos.y + archTop, surface: 'wood' };
      }
      const rampT = (9.4 - Math.abs(along)) / 1.2;
      const roadY = getTerrainHeight(x, z) + 0.04;
      return { y: THREE.MathUtils.lerp(roadY, bf.pos.y + 0.08, rampT), surface: 'stone' };
    }
  }

  const pathInfo = getNearestPathInfo(x, z);
  const terrainY = getTerrainHeight(x, z);
  if (pathInfo.lateralDist < 2.9 || Math.hypot(x - LIBRARY_PLAZA_POS.x, z - LIBRARY_PLAZA_POS.z) < 18) {
    return { y: terrainY, surface: 'stone' };
  }
  return { y: terrainY, surface: 'grass' };
}

export function clampToGuidedCorridor(pos: THREE.Vector3): void {
  // Keep Nate cleanly within the wooden railings while crossing either bridge on foot
  for (const bf of BRIDGE_FRAMES) {
    const dx = pos.x - bf.pos.x;
    const dz = pos.z - bf.pos.z;
    const along = dx * bf.tan.x + dz * bf.tan.z;
    if (Math.abs(along) <= 8.35 && pos.y < bf.pos.y + 2.4) {
      const acrossSigned = dx * bf.perp.x + dz * bf.perp.z;
      const clampedAcross = THREE.MathUtils.clamp(acrossSigned, -2.25, 2.25);
      if (clampedAcross !== acrossSigned) {
        pos.x = bf.pos.x + bf.tan.x * along + bf.perp.x * clampedAcross;
        pos.z = bf.pos.z + bf.tan.z * along + bf.perp.z * clampedAcross;
      }
      return;
    }
  }

  const info = getNearestPathInfo(pos.x, pos.z);
  const maxCorridorRadius = info.u > 0.96 ? 15.5 : info.u < 0.04 ? 11.5 : 10.5;
  if (info.lateralDist > maxCorridorRadius) {
    const dx = pos.x - info.closestPoint.x;
    const dz = pos.z - info.closestPoint.z;
    const scale = maxCorridorRadius / Math.max(0.001, info.lateralDist);
    pos.x = info.closestPoint.x + dx * scale;
    pos.z = info.closestPoint.z + dz * scale;
  }
  // Keep Nate cleanly outside his cottage front wall during Scene 3+
  if (pos.z > 1.0) {
    pos.z = 1.0;
  }
}
