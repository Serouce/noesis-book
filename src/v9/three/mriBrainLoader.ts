import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetUrl } from '../utils/assetUrl';

export interface MriBrainGeometries {
  cortexLeft: THREE.BufferGeometry;
  cortexRight: THREE.BufferGeometry;
  cerebellum: THREE.BufferGeometry;
  subcortex: THREE.BufferGeometry;
}

let cachedPromise: Promise<MriBrainGeometries> | null = null;

/**
 * Loads the real human MRI surface atlas once per session and caches immutable BufferGeometries:
 * - Cortex_Left / Cortex_Right: FreeSurfer fsaverage5 pial surfaces (20,480 tris each) with real sulcal depth + curvature baked in COLOR_0
 * - Cerebellum: SUIT MNI152 anatomical cerebellum mesh (15,646 tris)
 * - Subcortex: CIT168 MNI152 deep subcortical nuclei / thalamus assembly (8,984 tris)
 */
export function loadMriBrainGeometries(): Promise<MriBrainGeometries> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = new Promise<MriBrainGeometries>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      assetUrl('/v9/noesis-mri-brain.glb'),
      (gltf) => {
        // CRITICAL: KHR_mesh_quantization stores per-mesh dequantization scale & offset on each node's transform matrix!
        // Baking matrixWorld directly into a cloned BufferGeometry restores exact millimeter MNI152 alignment across all 4 meshes!
        gltf.scene.updateMatrixWorld(true);
        const found: Partial<MriBrainGeometries> = {};
        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const rawGeo = obj.geometry;
          if (!rawGeo) return;
          const geo = rawGeo.clone();
          geo.applyMatrix4(obj.matrixWorld);
          if (!geo.attributes.normal) geo.computeVertexNormals();
          geo.computeBoundingSphere();

          if (obj.name === 'Cortex_Left') found.cortexLeft = geo;
          else if (obj.name === 'Cortex_Right') found.cortexRight = geo;
          else if (obj.name === 'Cerebellum') found.cerebellum = geo;
          else if (obj.name === 'Subcortex') found.subcortex = geo;
        });

        if (found.cortexLeft && found.cortexRight && found.cerebellum && found.subcortex) {
          resolve(found as MriBrainGeometries);
        } else {
          cachedPromise = null;
          reject(new Error('Incomplete MRI GLB anatomy nodes in /v9/noesis-mri-brain.glb'));
        }
      },
      undefined,
      (err) => {
        cachedPromise = null;
        reject(err);
      },
    );
  });

  return cachedPromise;
}

/**
 * Preload MRI GLB quietly in idle time so Acts I, IV & V open instantaneously.
 */
export function prefetchMriBrain() {
  if (typeof window === 'undefined') return;
  loadMriBrainGeometries().catch(() => {
    // Non-fatal prefetch; active component handles retries & fallback cleanly
  });
}
