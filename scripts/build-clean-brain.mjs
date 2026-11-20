import { NodeIO, Document } from '@gltf-transform/core';
import {
  KHRDracoMeshCompression,
  KHRMeshQuantization,
  EXTMeshoptCompression,
} from '@gltf-transform/extensions';
import { weld, simplify, prune, quantize } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { resolve } from 'node:path';

const INPUT_PATH = resolve('public/models/brain_anatomy.glb');
const OUTPUT_PATH = resolve('public/models/brain_realistic_clean.glb');

const KEEP_MATERIALS = new Set([
  'Brain',
  'Temporal lobe',
  'Cerebellum',
  'Nucleus',
]);

function classifyNode(name, matName) {
  const n = name.toLowerCase();

  if (
    n.includes('artery') ||
    n.includes('vein') ||
    n.includes('sinus') ||
    n.includes('nerve') ||
    n.includes('bone') ||
    n.includes('cartilage') ||
    n.includes('radiation') ||
    n.includes('tract') ||
    n.includes('lcr') ||
    n.includes('ventricle') ||
    n.includes('choroid') ||
    n.includes('cistern')
  ) {
    return null;
  }

  if (
    n.includes('thalam') ||
    n.includes('hippocamp') ||
    n.includes('caudate') ||
    n.includes('putamen') ||
    n.includes('amygdal') ||
    n.includes('fornix') ||
    n.includes('corpus callosum') ||
    n.includes('geniculate') ||
    n.includes('habenula') ||
    n.includes('mamillary') ||
    n.includes('septal') ||
    n.includes('pineal') ||
    n.includes('hypophysis') ||
    n.includes('red nucleus')
  ) {
    return 'thalamus_limbic';
  }

  if (!KEEP_MATERIALS.has(matName)) return null;

  if (
    matName === 'Cerebellum' ||
    n.includes('cerebell') ||
    n.includes('vermis') ||
    n.includes('flocculus') ||
    n.includes('tonsil') ||
    n.includes('semilunar') ||
    n.includes('quadrangular') ||
    n.includes('biventral') ||
    n.includes('gracile') ||
    n.includes('culmen') ||
    n.includes('declive') ||
    n.includes('central lobule') ||
    n.includes('pons') ||
    n.includes('medulla') ||
    n.includes('midbrain') ||
    n.includes('peduncle') ||
    n.includes('colliculus') ||
    n.includes('olive') ||
    n.includes('interpeduncular')
  ) {
    return 'cerebellum_stem';
  }

  const isRight = n.endsWith('.r') || n.includes('.r ') || n.includes('right');
  const side = isRight ? 'R' : 'L';

  if (
    n.includes('occipital') ||
    n.includes('calcarine') ||
    n.includes('cuneus') ||
    n.includes('lingual') ||
    n.includes('lunate')
  ) {
    return `occipital_${side}`;
  }

  if (
    n.includes('parietal') ||
    n.includes('postcentral') ||
    n.includes('angular') ||
    n.includes('supramarginal') ||
    n.includes('precuneus') ||
    n.includes('jensen') ||
    n.includes('central sulcus')
  ) {
    return `parietal_${side}`;
  }

  if (
    n.includes('frontal') ||
    n.includes('orbital') ||
    n.includes('precentral') ||
    n.includes('frontomarginal') ||
    n.includes('frontopolar') ||
    n.includes('rectus') ||
    n.includes('olfactory') ||
    n.includes('paracentral')
  ) {
    return `frontal_${side}`;
  }

  if (
    n.includes('temporal') ||
    n.includes('collateral') ||
    n.includes('parahippocamp') ||
    n.includes('insula') ||
    n.includes('lat_fis') ||
    n.includes('cingulate')
  ) {
    return `temporal_${side}`;
  }

  return `frontal_${side}`;
}

function isSulcusMesh(name) {
  const n = name.toLowerCase();
  return (
    n.includes('sulcus') ||
    n.includes('sulci') ||
    n.includes('lat_fis') ||
    n.includes('fossa') ||
    n.includes('calcarine')
  );
}

function transformPoint(m, x, y, z) {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

// Recompute silky-smooth area-weighted vertex normals across welded triangles (eliminates flat Play-Doh facets!)
function recomputeSmoothNormals(posArray, idxArray) {
  const vCount = posArray.length / 3;
  const normals = new Float32Array(vCount * 3);

  for (let i = 0; i < idxArray.length; i += 3) {
    const i0 = idxArray[i] * 3;
    const i1 = idxArray[i + 1] * 3;
    const i2 = idxArray[i + 2] * 3;

    const ax = posArray[i0], ay = posArray[i0 + 1], az = posArray[i0 + 2];
    const bx = posArray[i1], by = posArray[i1 + 1], bz = posArray[i1 + 2];
    const cx = posArray[i2], cy = posArray[i2 + 1], cz = posArray[i2 + 2];

    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;

    // Cross product magnitude is proportional to triangle area -> smooth area-weighted averaging!
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;

    normals[i0] += nx; normals[i0 + 1] += ny; normals[i0 + 2] += nz;
    normals[i1] += nx; normals[i1 + 1] += ny; normals[i1 + 2] += nz;
    normals[i2] += nx; normals[i2 + 1] += ny; normals[i2 + 2] += nz;
  }

  for (let i = 0; i < vCount; i++) {
    const o = i * 3;
    const len = Math.hypot(normals[o], normals[o + 1], normals[o + 2]) || 1;
    normals[o] /= len;
    normals[o + 1] /= len;
    normals[o + 2] /= len;
  }

  return normals;
}

// Gentle 1-pass Laplacian vertex smoothing along shared topology to polish organic gyral curvature
function gentleLaplacianSmooth(posArray, idxArray, factor = 0.24) {
  const vCount = posArray.length / 3;
  const accum = new Float32Array(vCount * 3);
  const counts = new Uint16Array(vCount);

  for (let i = 0; i < idxArray.length; i += 3) {
    const a = idxArray[i], b = idxArray[i + 1], c = idxArray[i + 2];
    const pairs = [[a, b], [b, c], [c, a]];
    for (const [u, v] of pairs) {
      accum[u * 3] += posArray[v * 3];
      accum[u * 3 + 1] += posArray[v * 3 + 1];
      accum[u * 3 + 2] += posArray[v * 3 + 2];
      counts[u] += 1;

      accum[v * 3] += posArray[u * 3];
      accum[v * 3 + 1] += posArray[u * 3 + 1];
      accum[v * 3 + 2] += posArray[u * 3 + 2];
      counts[v] += 1;
    }
  }

  const out = new Float32Array(posArray.length);
  for (let i = 0; i < vCount; i++) {
    const o = i * 3;
    const c = counts[i];
    if (c > 0) {
      out[o] = posArray[o] * (1 - factor) + (accum[o] / c) * factor;
      out[o + 1] = posArray[o + 1] * (1 - factor) + (accum[o + 1] / c) * factor;
      out[o + 2] = posArray[o + 2] * (1 - factor) + (accum[o + 2] / c) * factor;
    } else {
      out[o] = posArray[o];
      out[o + 1] = posArray[o + 1];
      out[o + 2] = posArray[o + 2];
    }
  }
  return out;
}

async function main() {
  await MeshoptSimplifier.ready;
  await MeshoptEncoder.ready;

  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression, KHRMeshQuantization, EXTMeshoptCompression])
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'meshopt.encoder': MeshoptEncoder,
    });

  const srcDoc = await io.read(INPUT_PATH);
  const buckets = new Map();
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const node of srcDoc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const nodeName = node.getName() || mesh.getName() || '';
    const prims = mesh.listPrimitives();
    if (!prims.length) continue;

    const matName = prims[0].getMaterial()?.getName() || '';
    const group = classifyNode(nodeName, matName);
    if (!group) continue;

    const worldMat = node.getWorldMatrix();
    const sulcus = isSulcusMesh(nodeName);

    if (!buckets.has(group)) {
      buckets.set(group, { positions: [], sulcusFlags: [], indices: [], vertCount: 0 });
    }
    const bucket = buckets.get(group);

    for (const prim of prims) {
      const posAcc = prim.getAttribute('POSITION');
      if (!posAcc) continue;

      const posArr = posAcc.getArray();
      const baseVertex = bucket.vertCount;
      const count = posAcc.getCount();

      for (let i = 0; i < count; i++) {
        const [wx, wy, wz] = transformPoint(
          worldMat,
          posArr[i * 3],
          posArr[i * 3 + 1],
          posArr[i * 3 + 2],
        );
        bucket.positions.push(wx, wy, wz);
        if (wx < minX) minX = wx;
        if (wy < minY) minY = wy;
        if (wz < minZ) minZ = wz;
        if (wx > maxX) maxX = wx;
        if (wy > maxY) maxY = wy;
        if (wz > maxZ) maxZ = wz;
        bucket.sulcusFlags.push(sulcus ? 1 : 0);
      }

      const idxAcc = prim.getIndices();
      if (idxAcc) {
        const idxArr = idxAcc.getArray();
        for (let i = 0; i < idxArr.length; i++) {
          bucket.indices.push(baseVertex + idxArr[i]);
        }
      } else {
        for (let i = 0; i < count; i++) {
          bucket.indices.push(baseVertex + i);
        }
      }

      bucket.vertCount += count;
    }
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const maxSpan = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = 2.05 / maxSpan;

  // Radial outer envelope for smooth sulcus Cavity AO
  const THETA_BINS = 42;
  const PHI_BINS = 21;
  const maxRadiusGrid = new Float32Array(THETA_BINS * PHI_BINS);

  for (const [group, b] of buckets.entries()) {
    if (group === 'thalamus_limbic') continue;
    for (let i = 0; i < b.vertCount; i++) {
      const x = (b.positions[i * 3] - cx) * scale;
      const y = (b.positions[i * 3 + 1] - cy) * scale;
      const z = (b.positions[i * 3 + 2] - cz) * scale;
      const r = Math.hypot(x, y, z);
      if (r < 0.001) continue;
      const theta = Math.atan2(z, x) + Math.PI;
      const phi = Math.acos(Math.max(-1, Math.min(1, y / r)));
      const tb = Math.min(THETA_BINS - 1, Math.floor((theta / (Math.PI * 2)) * THETA_BINS));
      const pb = Math.min(PHI_BINS - 1, Math.floor((phi / Math.PI) * PHI_BINS));
      const idx = pb * THETA_BINS + tb;
      if (r > maxRadiusGrid[idx]) maxRadiusGrid[idx] = r;
    }
  }

  const outDoc = new Document();
  const outBuffer = outDoc.createBuffer('brain_buffer');
  const outScene = outDoc.createScene('AnatomicalBrainStudio');

  for (const [group, b] of buckets.entries()) {
    const rawPos = new Float32Array(b.vertCount * 3);
    for (let i = 0; i < b.vertCount; i++) {
      rawPos[i * 3] = (b.positions[i * 3] - cx) * scale;
      rawPos[i * 3 + 1] = (b.positions[i * 3 + 1] - cy) * scale;
      rawPos[i * 3 + 2] = (b.positions[i * 3 + 2] - cz) * scale;
    }
    const rawIdx = new Uint32Array(b.indices);

    // For cortical regions, run 2 gentle Laplacian passes to transform crisp CAD polygons into silky porcelain gyri!
    const isCortex = group !== 'thalamus_limbic' && group !== 'cerebellum_stem';
    let smoothPos = rawPos;
    if (isCortex) {
      smoothPos = gentleLaplacianSmooth(rawPos, rawIdx, 0.28);
      smoothPos = gentleLaplacianSmooth(smoothPos, rawIdx, 0.22);
    }

    const smoothNorms = recomputeSmoothNormals(smoothPos, rawIdx);
    const colFloat = new Float32Array(b.vertCount * 3);

    for (let i = 0; i < b.vertCount; i++) {
      const x = smoothPos[i * 3];
      const y = smoothPos[i * 3 + 1];
      const z = smoothPos[i * 3 + 2];
      const nx = smoothNorms[i * 3];
      const ny = smoothNorms[i * 3 + 1];
      const nz = smoothNorms[i * 3 + 2];

      const r = Math.hypot(x, y, z) || 0.001;
      const theta = Math.atan2(z, x) + Math.PI;
      const phi = Math.acos(Math.max(-1, Math.min(1, y / r)));
      const tb = Math.min(THETA_BINS - 1, Math.floor((theta / (Math.PI * 2)) * THETA_BINS));
      const pb = Math.min(PHI_BINS - 1, Math.floor((phi / Math.PI) * PHI_BINS));
      const outerR = maxRadiusGrid[pb * THETA_BINS + tb] || r;

      const depthRatio = Math.max(0, Math.min(1, (outerR - r) / 0.26));
      const radialDot = (x * nx + y * ny + z * nz) / r;
      const normalCavity = Math.max(0, Math.min(1, (radialDot + 0.35) / 1.35));

      let ao = 0.98;
      if (group === 'thalamus_limbic') {
        ao = 0.80 + 0.20 * normalCavity;
      } else if (group === 'cerebellum_stem') {
        ao = 0.72 + 0.26 * normalCavity;
      } else {
        const sulcusPenalty = b.sulcusFlags[i] ? 0.20 : 0.0;
        ao = 0.99 - sulcusPenalty - depthRatio * 0.18 - (1 - normalCavity) * 0.14;
        ao = Math.max(0.54, Math.min(1.0, ao));
      }

      colFloat[i * 3] = ao;
      colFloat[i * 3 + 1] = ao * 0.99;
      colFloat[i * 3 + 2] = ao * 0.97;
    }

    const posAcc = outDoc.createAccessor(`${group}_pos`).setType('VEC3').setArray(smoothPos).setBuffer(outBuffer);
    const normAcc = outDoc.createAccessor(`${group}_norm`).setType('VEC3').setArray(smoothNorms).setBuffer(outBuffer);
    const colAcc = outDoc.createAccessor(`${group}_col`).setType('VEC3').setArray(colFloat).setBuffer(outBuffer);
    const idxAcc = outDoc.createAccessor(`${group}_idx`).setType('SCALAR').setArray(rawIdx).setBuffer(outBuffer);

    const mat = outDoc
      .createMaterial(`${group}_mat`)
      .setBaseColorFactor([0.94, 0.92, 0.88, 1])
      .setRoughnessFactor(0.58)
      .setMetallicFactor(0.01);

    const prim = outDoc
      .createPrimitive()
      .setAttribute('POSITION', posAcc)
      .setAttribute('NORMAL', normAcc)
      .setAttribute('COLOR_0', colAcc)
      .setIndices(idxAcc)
      .setMaterial(mat);

    const outMesh = outDoc.createMesh(group).addPrimitive(prim);
    outScene.addChild(outDoc.createNode(group).setMesh(outMesh));
  }

  // Keep FULL cortical fidelity! Weld gently + light simplify only at high fidelity (0.72) + recompute smooth normals
  await outDoc.transform(
    weld({ tolerance: 0.0005 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.72, error: 0.002 }),
  );

  // Recompute silky-smooth normals POST-simplify on every mesh so ZERO faceted triangles survive!
  for (const mesh of outDoc.getRoot().listMeshes()) {
    const prim = mesh.listPrimitives()[0];
    const posAcc = prim.getAttribute('POSITION');
    const idxAcc = prim.getIndices();
    if (posAcc && idxAcc) {
      const smoothedNormals = recomputeSmoothNormals(posAcc.getArray(), idxAcc.getArray());
      prim.getAttribute('NORMAL')?.setArray(smoothedNormals);
    }
  }

  await outDoc.transform(
    quantize({ quantizePosition: 14, quantizeNormal: 12, quantizeColor: 8 }),
    prune(),
  );

  let total = 0;
  for (const m of outDoc.getRoot().listMeshes()) {
    const c = m.listPrimitives()[0].getAttribute('POSITION').getCount();
    total += c;
    console.log(`  Smooth ${m.getName().padEnd(18)} -> ${String(c).padStart(6)} verts`);
  }
  console.log(`Final smooth sculptural brain: ${total.toLocaleString()} verts across 10 regions.`);
  await io.write(OUTPUT_PATH, outDoc);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
