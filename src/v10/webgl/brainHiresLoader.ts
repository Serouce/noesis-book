import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetUrl } from '../../v9/utils/assetUrl';

export interface HiResBrainGeometries {
  cortexLeft: THREE.BufferGeometry;
  cortexRight: THREE.BufferGeometry;
  cerebellum: THREE.BufferGeometry;
  subcortex: THREE.BufferGeometry;
  brainstem: THREE.BufferGeometry;
}

let cachedPromise: Promise<HiResBrainGeometries> | null = null;

/**
 * Loads the NOESIS v10 high-resolution anatomical MRI atlas once per session (~122k tris):
 * - Cortex_Left / Cortex_Right: BrainMesh_ICBM152 hi-res (44,236 tris each) with 14-ring sculptural sulcal AO & curvature in COLOR_0
 * - Cerebellum: SUIT MNI152 (21,906 tris) with anatomical folia ridges
 * - Subcortex: CIT168 MNI152 Thalamus & deep nuclei (11,230 tris)
 * - Brainstem: MNI152 Pons + Medulla Oblongata completing the museum anatomical silhouette
 */
export function loadHiResBrainGeometries(): Promise<HiResBrainGeometries> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = new Promise<HiResBrainGeometries>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      assetUrl('/v10/noesis-brain-hires.glb'),
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const found: Partial<HiResBrainGeometries> = {};

        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh) || !obj.geometry) return;
          const geo = obj.geometry.clone();
          // Bake KHR_mesh_quantization node transform into world MNI152 space!
          geo.applyMatrix4(obj.matrixWorld);
          geo.computeVertexNormals();
          geo.computeBoundingSphere();

          // Convert baked sulcal AO (0..1 in R) into subtle warm porcelain/ivory PBR vertex colors
          // AND keep original sulcal/curvature data in a custom `aSulc` attribute for shader overlays!
          const colAttr = geo.attributes.color;
          if (colAttr) {
            const n = colAttr.count;
            const sulcArr = new Float32Array(n * 2);
            const pbrCol = new Float32Array(n * 3);
            const isCortex = obj.name === 'Cortex_Left' || obj.name === 'Cortex_Right';

            for (let i = 0; i < n; i += 1) {
              const r = colAttr.getX(i); // sulcal AO (0=deep crevice, 1=gyral crown)
              const g = colAttr.getY(i); // curvature / folia
              sulcArr[i * 2] = r;
              sulcArr[i * 2 + 1] = g;

              // Warm sculptural museum porcelain shading (high contrast in sulci so folds read like Bernini marble!)
              const ao = isCortex
                ? Math.pow(THREE.MathUtils.clamp(r, 0, 1), 0.78)
                : Math.pow(THREE.MathUtils.clamp(r, 0, 1), 0.72);
              const shade = isCortex ? 0.44 + ao * 0.56 : 0.50 + ao * 0.50;
              // Warm alabaster tint (slightly cooler in deep sulci, ivory on gyral crowns)
              pbrCol[i * 3] = Math.min(1, shade * 1.0);
              pbrCol[i * 3 + 1] = Math.min(1, shade * (0.965 + ao * 0.02));
              pbrCol[i * 3 + 2] = Math.min(1, shade * (0.91 + ao * 0.03));
            }
            geo.setAttribute('aSulc', new THREE.BufferAttribute(sulcArr, 2));
            geo.setAttribute('color', new THREE.BufferAttribute(pbrCol, 3));
          }

          if (obj.name === 'Cortex_Left') found.cortexLeft = geo;
          else if (obj.name === 'Cortex_Right') found.cortexRight = geo;
          else if (obj.name === 'Cerebellum') found.cerebellum = geo;
          else if (obj.name === 'Subcortex') found.subcortex = geo;
          else if (obj.name === 'Brainstem') found.brainstem = geo;
        });

        if (
          found.cortexLeft &&
          found.cortexRight &&
          found.cerebellum &&
          found.subcortex &&
          found.brainstem
        ) {
          resolve(found as HiResBrainGeometries);
        } else {
          cachedPromise = null;
          reject(new Error('Incomplete v10 Hi-Res Brain GLB nodes'));
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

export function prefetchHiResBrain() {
  if (typeof window === 'undefined') return;
  loadHiResBrainGeometries().catch(() => {});
}
