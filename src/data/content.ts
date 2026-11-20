/* ==========================================================================
   NOESIS v2 — Atlas of Consciousness / Атлас Сознания
   22/22-Audited Bilingual Scientific & Philosophical Dataset (EN / RU)
   Typed for React 19 + TypeScript + Three.js / R3F + GSAP
   ========================================================================== */

export type Lang = "en" | "ru";

export type ChapterId = "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6";

export type PlateId = "01" | "02" | "03" | "04" | "05" | "06";

export type ThemeKey =
  | "prism"
  | "cortex"
  | "clash"
  | "mirror"
  | "pulse"
  | "horizon";

export type BrainRegionId =
  | "pfc"
  | "parietal"
  | "temporal"
  | "occipital"
  | "insula"
  | "thalamus";

export type PhilosophyId =
  | "physicalism"
  | "illusionism"
  | "panpsychism"
  | "russellian"
  | "enactivism";

export type TheoryId = "gnwt" | "iit" | "pp" | "hot" | "rpt";

export type CogitateTestId = "decoding" | "synchrony" | "ignition";

export type CogitateVerdict = "supported" | "partial" | "challenged";

export type PredictivePresetId = "chaos" | "balanced" | "illusion" | "rebus";

export type PciStateId =
  | "awake"
  | "rem"
  | "ketamine"
  | "psilocybin"
  | "nrem"
  | "propofol";

export type PciWavePattern =
  | "complex-distributed"
  | "vivid-internal"
  | "dissociated-rich"
  | "entropic-cascade"
  | "slow-stereotyped"
  | "local-damped";

export type MindEntityId =
  | "human"
  | "octopus"
  | "corvid"
  | "bumblebee"
  | "organoid"
  | "llm";

export type PlateAssetKey = ChapterId | "epilogue";

export interface MetaInfo {
  title: string;
  description: string;
  langName: string;
  switchLabel: string;
  readingTime: string;
}

export interface NavItem {
  id: ChapterId;
  num: string;
  shortLabel: string;
}

export interface NavContent {
  brand: string;
  subtitle: string;
  items: NavItem[];
  jumpTop: string;
  platePrefix: string;
  scrollHint: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  stats: HeroStat[];
  ctaStart: string;
  ctaExplore: string;
  interactiveHint: string;
}

export interface PlateInfo {
  code: string;
  title: string;
  caption: string;
  telemetryLabel: string;
  telemetryValue: string;
}

export interface ChapterSection {
  heading: string;
  body: string;
  callout?: string;
}

export interface KeyCard {
  tag: string;
  title: string;
  detail: string;
  citation: string;
}

export interface QuoteInfo {
  text: string;
  author: string;
  work: string;
}

export interface MarySpec {
  k: string;
  v: string;
}

export interface MaryPhilosophy {
  id: PhilosophyId;
  name: string;
  verdict: string;
  explanation: string;
}

export interface MaryLab {
  badge: string;
  title: string;
  instruction: string;
  modeMono: string;
  modeColor: string;
  wavelengthLabel: string;
  inspectBtn: string;
  exitRoomBtn: string;
  resetBtn: string;
  monoSpecs: MarySpec[];
  philosophies: MaryPhilosophy[];
}

export interface NeuralTheory {
  id: TheoryId;
  short: string;
  name: string;
  founders: string;
  mechanism: string;
  hotspot: string;
  critique: string;
  activeRegions: BrainRegionId[];
}

export interface BrainLab {
  badge: string;
  title: string;
  instruction: string;
  theories: NeuralTheory[];
}

export interface CogitateTest {
  id: CogitateTestId;
  title: string;
  iitPred: string;
  gnwtPred: string;
  finding: string;
  verdictIit: CogitateVerdict;
  verdictGnwt: CogitateVerdict;
  verdictLabelIit: string;
  verdictLabelGnwt: string;
  detail: string;
}

export interface CogitateLab {
  badge: string;
  title: string;
  instruction: string;
  subtitle: string;
  modalities: [string, string, string];
  tests: CogitateTest[];
}

export interface PredictivePreset {
  id: PredictivePresetId;
  name: string;
  prior: number;
  noise: number;
  stateTitle: string;
  stateDesc: string;
}

export interface PredictiveLab {
  badge: string;
  title: string;
  instruction: string;
  priorLabel: string;
  noiseLabel: string;
  presets: PredictivePreset[];
}

export interface PciState {
  id: PciStateId;
  name: string;
  pci: number;
  conscious: boolean;
  statusLabel: string;
  wavePattern: PciWavePattern;
  desc: string;
}

export interface PciLab {
  badge: string;
  title: string;
  instruction: string;
  zapBtn: string;
  thresholdLabel: string;
  metricComplexity: string;
  metricState: string;
  states: PciState[];
}

export interface MindEntity {
  id: MindEntityId;
  name: string;
  category: string;
  scores: [number, number, number, number, number];
  badge: string;
  summary: string;
  evidence: string;
}

export interface MindspaceLab {
  badge: string;
  title: string;
  instruction: string;
  axes: [string, string, string, string, string];
  compareHint: string;
  entities: MindEntity[];
}

export type ChapterLab =
  | MaryLab
  | BrainLab
  | CogitateLab
  | PredictiveLab
  | PciLab
  | MindspaceLab;

export interface ChapterBase {
  id: ChapterId;
  num: string;
  plateId: PlateId;
  theme: ThemeKey;
  eyebrow: string;
  title: string;
  lead: string;
  plate: PlateInfo;
  sections: ChapterSection[];
  keyCards: KeyCard[];
  quote: QuoteInfo;
}

export interface ChapterCh1 extends ChapterBase {
  id: "ch1";
  plateId: "01";
  theme: "prism";
  lab: MaryLab;
}

export interface ChapterCh2 extends ChapterBase {
  id: "ch2";
  plateId: "02";
  theme: "cortex";
  lab: BrainLab;
}

export interface ChapterCh3 extends ChapterBase {
  id: "ch3";
  plateId: "03";
  theme: "clash";
  lab: CogitateLab;
}

export interface ChapterCh4 extends ChapterBase {
  id: "ch4";
  plateId: "04";
  theme: "mirror";
  lab: PredictiveLab;
}

export interface ChapterCh5 extends ChapterBase {
  id: "ch5";
  plateId: "05";
  theme: "pulse";
  lab: PciLab;
}

export interface ChapterCh6 extends ChapterBase {
  id: "ch6";
  plateId: "06";
  theme: "horizon";
  lab: MindspaceLab;
}

export type ChapterData =
  | ChapterCh1
  | ChapterCh2
  | ChapterCh3
  | ChapterCh4
  | ChapterCh5
  | ChapterCh6;

export interface EpilogueCard {
  title: string;
  text: string;
}

export interface EpilogueContent {
  plateCode: string;
  eyebrow: string;
  title: string;
  body: string;
  plateCaption: string;
  cards: EpilogueCard[];
  referencesTitle: string;
  footerNote: string;
}

export interface UiLabels {
  zoomPlate: string;
  closeModal: string;
  sourceBadge: string;
  predictionIit: string;
  predictionGnwt: string;
  empiricalResult: string;
  thresholdReached: string;
  belowThreshold: string;
  cmdHighlightTitle: string;
  cmdHighlightStat: string;
  cmdHighlightDesc: string;
  ariaHeroStats: string;
  ariaPlatesColumn: string;
  ariaPlateDots: string;
  ariaLangSwitch: string;
  ariaPhilTabs: string;
  ariaBrainTheories: string;
  ariaMarySvg: string;
  cogitateTestsLabel: string;
  webglBadge: string;
  dragHint: string;
  expandLab: string;
  scrollChapter: string;
  visualModeArt: string;
  visualMode3d: string;
}

export interface LocalizedContent {
  meta: MetaInfo;
  nav: NavContent;
  hero: HeroContent;
  chapters: [
    ChapterCh1,
    ChapterCh2,
    ChapterCh3,
    ChapterCh4,
    ChapterCh5,
    ChapterCh6,
  ];
  epilogue: EpilogueContent;
  ui: UiLabels;
}

export interface ReferenceItem {
  year: number;
  authors: string;
  title: string;
  venue: string;
  venueRu: string;
  tag: string;
  tagRu: string;
}

export interface NoesisContent {
  en: LocalizedContent;
  ru: LocalizedContent;
  references: ReferenceItem[];
}

export const PLATE_ASSETS: Record<PlateAssetKey, string> = {
  ch1: "./artworks/v2-01-qualia-prism.jpg",
  ch2: "./artworks/v2-02-neural-architecture.jpg",
  ch3: "./artworks/v2-03-cogitate-interferometer.jpg",
  ch4: "./artworks/v2-04-predictive-mirror.jpg",
  ch5: "./artworks/v2-05-pci-shockwave.jpg",
  ch6: "./artworks/v2-06-mind-spectrum.jpg",
  epilogue: "./artworks/v2-06-mind-spectrum.jpg",
};

export const NOESIS_CONTENT: NoesisContent = {
  en: {
    meta: {
      title: "NOESIS — Atlas of Consciousness",
      description: "An interactive scrollytelling atlas of the philosophy and neuroscience of consciousness — from the Hard Problem and Mary’s Room to COGITATE (2025), covert awareness, and synthetic minds.",
      langName: "English",
      switchLabel: "RU",
      readingTime: "18 min interactive read"
    },
    nav: {
      brand: "NOESIS",
      subtitle: "Atlas of Consciousness",
      items: [
        { id: "ch1", num: "I", shortLabel: "Hard Problem" },
        { id: "ch2", num: "II", shortLabel: "Neural Theories" },
        { id: "ch3", num: "III", shortLabel: "COGITATE 2025" },
        { id: "ch4", num: "IV", shortLabel: "Predictive Mind" },
        { id: "ch5", num: "V", shortLabel: "States & PCI" },
        { id: "ch6", num: "VI", shortLabel: "Other Minds" }
      ],
      jumpTop: "Back to top",
      platePrefix: "PLATE",
      scrollHint: "Scroll to enter the atlas"
    },
    hero: {
      eyebrow: "SCIENTIFIC & PHILOSOPHICAL MONOGRAPH · 2025–2026 EDITION",
      title: "The Atlas of",
      titleAccent: "Consciousness",
      subtitle: "How three pounds of excitable tissue generate the redness of red, the ache of longing, and the quiet fact of being someone — charted across contemporary philosophy, adversarial neuroscience, clinical breakthroughs, and the frontier of non-human minds.",
      stats: [
        { value: "256", label: "Participants in the 2025 COGITATE Nature adversarial trial" },
        { value: "25%", label: "Unresponsive patients showing covert awareness (NEJM, 2024)" },
        {
          value: "0.31",
          label: "Empirical PCI* complexity threshold separating wakefulness from coma"
        },
        { value: "6", label: "Interactive laboratories spanning philosophy, cortex, and mindspace" }
      ],
      ctaStart: "Begin Chapter I",
      ctaExplore: "Explore Interactive Labs",
      interactiveHint: "Six illustrated plates · Six live experiments · Dual-language EN / RU"
    },
    chapters: [
      {
        id: "ch1",
        num: "I",
        plateId: "01",
        theme: "prism",
        eyebrow: "CHAPTER I · PHILOSOPHY OF MIND",
        title: "Why Does Matter Feel Like Anything at All?",
        lead: "Science excels at explaining structure, dynamics, and function. Consciousness confronts us with something stranger: an inner point of view — a felt presence that resists being reduced to gears, voltages, or code.",
        plate: {
          code: "PLATE 01 · PRISMA QUALIA",
          title: "The Explanatory Gap",
          caption: "Photons at 680 nm strike retinal cones and cascade through visual cortex — yet nowhere in the physical equations does the lived luminosity of crimson appear.",
          telemetryLabel: "ONTOLOGICAL TENSION",
          telemetryValue: "Structure vs. Experience"
        },
        sections: [
          {
            heading: "What It Is Like, and the Hard Problem",
            body: "In 1974, Thomas Nagel proposed the defining criterion of consciousness: an organism is conscious if and only if there is “something that it is like” to be that organism. Two decades later, David Chalmers (1995) sharpened the puzzle by dividing it into the “Easy Problems” — explaining attention, sensory discrimination, memory, and verbal report — and the “Hard Problem”: why all this physical information processing is accompanied by subjective experience (qualia) rather than unfolding “in the dark.”",
            callout: "In 2018, Chalmers added the Meta-Problem of Consciousness: why do physical systems like us find consciousness so puzzling in the first place? Even skeptics agree that explaining our intuitions about mystery is an empirically tractable target."
          },
          {
            heading: "Mary’s Room, Zombies, and the Explanatory Gap",
            body: "Three classic thought experiments expose what Joseph Levine (1983) called the Explanatory Gap. Frank Jackson (1982) imagined Mary, a brilliant neuroscientist raised in a strictly monochrome room who knows every physical fact about color vision — yet learns something undeniably new the instant she sees a ripe red tomato. Philosophical zombies sharpen the same intuition: a molecule-for-molecule twin who speaks and acts just like you, yet harbors zero inner light, seems logically conceivable even if physically impossible."
          },
          {
            heading: "Five Contemporary Metaphysical Stances",
            body: "Today’s philosophers of mind do not split simply into “dualists” and “materialists.” Instead, five live frameworks compete: Physicalism & Computational Functionalism hold that consciousness is identical to, or realized by, brain computation; Illusionism (Daniel Dennett, Keith Frankish) argues that ineffable qualia are a cognitive mirage created by imperfect introspection; Panpsychism & Cosmopsychism (Galen Strawson, Philip Goff) treat rudimentary experience as a fundamental feature of reality — while struggling with the Combination Problem of how micro-experiences fuse into a unified human mind; Russellian Monism / Property Dualism place phenomenal properties at the intrinsic base of physical laws; and Enactivism / 4E Cognition (Francisco Varela, Evan Thompson, Alva Noë) reject skull-bound minds altogether, grounding experience in embodied, sensorimotor coupling with a world."
          }
        ],
        keyCards: [
          {
            tag: "BENCHMARK · 1974",
            title: "Subjective Character",
            detail: "Echolocation gives a bat an alien sensory world we can map mathematically yet never inhabit from the inside.",
            citation: "Nagel (1974), The Philosophical Review"
          },
          {
            tag: "DISTINCTION · 1995 / 2018",
            title: "Hard & Meta-Problems",
            detail: "Functional explanation accounts for behavior; the Hard Problem asks why feeling exists at all, while the Meta-Problem asks why we report feeling baffled.",
            citation: "Chalmers (1995, 2018)"
          },
          {
            tag: "RADICAL CHALLENGE",
            title: "Illusionism vs. Panpsychism",
            detail: "Illusionists dissolve the Hard Problem by questioning introspective realism; panpsychists preserve qualia by weaving mentality into fundamental physics.",
            citation: "Frankish (2016); Goff (2019)"
          },
          {
            tag: "4E COGNITION",
            title: "Embodied & Enactive Mind",
            detail: "Consciousness is not something that happens inside a disembodied brain — it is something a living organism actively enacts with its environment.",
            citation: "Varela, Thompson & Rosch (1991); Noë (2004)"
          }
        ],
        quote: {
          text: "Even when we have explained the performance of all the cognitive and behavioral functions in the vicinity of experience, there may still remain a further unanswered question: Why is the performance of these functions accompanied by experience?",
          author: "David J. Chalmers",
          work: "Facing Up to the Problem of Consciousness (1995)"
        },
        lab: {
          badge: "LAB 01 · THOUGHT EXPERIMENT",
          title: "Mary’s Room: Crossing the Explanatory Gap",
          instruction: "Inspect Mary’s exhaustive third-person scientific dossier inside her monochrome laboratory, then step outside into color and compare how five contemporary philosophies interpret the moment.",
          modeMono: "Inside the Monochrome Room",
          modeColor: "Outside: First Encounter with Red",
          wavelengthLabel: "Dominant Wavelength",
          inspectBtn: "Inspect Physical Dossier",
          exitRoomBtn: "Step Outside into Color",
          resetBtn: "Return to Monochrome",
          monoSpecs: [
            { k: "Photon Spectrum", v: "650–700 nm long-wave reflectance" },
            { k: "Retinal Encoding", v: "L-cone peak ~560 nm; L−M opponent firing" },
            { k: "Cortical Cascade", v: "Parvocellular LGN → V1 blobs → V4 constancy" },
            { k: "Motor / Semantic Link", v: "Lexical label “red” + autonomic arousal curve" }
          ],
          philosophies: [
            {
              id: "physicalism",
              name: "Physicalism / Functionalism",
              verdict: "New Mode of Access, Not a New Entity",
              explanation: "Mary gains a new phenomenal concept or practical recognition skill — a first-person neural route to the same physical brain state she already described in third-person physics."
            },
            {
              id: "illusionism",
              name: "Illusionism (Dennett, Frankish)",
              verdict: "An Introspective User-Illusion",
              explanation: "Mary discovers no ineffable non-physical qualia; her surprise is merely her brain’s rapid, compressed introspective machinery re-indexing complex color discriminations as if they were magical primitives."
            },
            {
              id: "panpsychism",
              name: "Panpsychism / Cosmopsychism",
              verdict: "Direct Contact with Intrinsic Nature",
              explanation: "Physics maps only mathematical relations between particles. Stepping outside reveals an intrinsic experiential quality woven into nature — though panpsychism still faces the Combination Problem."
            },
            {
              id: "russellian",
              name: "Russellian Monism / Property Dualism",
              verdict: "An Irreducible Phenomenal Fact",
              explanation: "Structural equations leave out the categorical, experiential ground that realizes physical dispositions. Mary learns a genuine fact about reality that cannot be deduced from mechanics alone."
            },
            {
              id: "enactivism",
              name: "Enactivism / 4E Cognition",
              verdict: "Embodied Sensorimotor Coupling",
              explanation: "Seeing red is not decoding an internal picture inside the skull. Outside the room, Mary’s eye movements, lighting shifts, and living body enact a brand-new sensorimotor skill."
            }
          ]
        }
      },
      {
        id: "ch2",
        num: "II",
        plateId: "02",
        theme: "cortex",
        eyebrow: "CHAPTER II · NEUROSCIENCE OF CONSCIOUSNESS",
        title: "Five Maps of the Conscious Cortex",
        lead: "While philosophers debate what consciousness fundamentally is, neuroscientists search for the physical mechanisms that make an unconscious neural cascade suddenly flare into lived awareness.",
        plate: {
          code: "PLATE 02 · CORTICAL ARCHITECTURES",
          title: "Competing Neural Signatures",
          caption: "Does awareness ignite across a fronto-parietal broadcast network, crystallize in a posterior “hot zone,” or emerge from top-down predictive models and meta-representations?",
          telemetryLabel: "ACTIVE PARADIGMS",
          telemetryValue: "GNWT · IIT 4.0 · PP · HOT · RPT · AST"
        },
        sections: [
          {
            heading: "Global Ignition vs. Intrinsic Integration",
            body: "Two flagship frameworks dominate the experimental landscape. Global Neuronal Workspace Theory (GNWT — Bernard Baars, Stanislas Dehaene, Jean-Pierre Changeux) proposes that sensory information becomes conscious when it crosses a threshold and triggers a non-linear “global ignition,” broadcasting signals across a fronto-parietal hub for memory, report, and action. Integrated Information Theory (IIT 4.0 — Giulio Tononi, Larissa Albantakis, Christof Koch; PLOS Computational Biology, 2023) begins instead from the zeroth axiom of existence plus five phenomenological axioms of experience and derives physical postulates, identifying consciousness with an irreducible intrinsic cause-effect structure (Φ) hypothesized to peak in a posterior temporo-parieto-occipital “hot zone.”"
          },
          {
            heading: "The 2023–2025 IIT Paradigm Clash",
            body: "In September 2023, an open letter signed by more than 124 researchers sharply criticized IIT as “pseudoscience,” arguing that its core claim linking Φ to consciousness is empirically untestable and carries panpsychist implications — such as attributing minimal experience to simple inactive logic grids. In April 2025, the dispute reached peer-reviewed pages in Nature Neuroscience: critics (“IIT-Concerned,” including Stephen Fleming and Hakwan Lau) pressed falsifiability concerns in “What makes a theory of consciousness unscientific?”, while Tononi, Koch, Massimini, and colleagues countered in “Consciousness or pseudo-consciousness? A clash of two paradigms,” defending IIT’s clinical fruitfulness and mathematically explicit phenomenology.",
            callout: "Fair scientific assessment recognizes both tensions: IIT inspired breakthrough clinical complexity metrics (PCI) and testable posterior predictions, yet computing exact Φ for a human brain remains intractable, leaving its deepest ontological postulates hotly contested."
          },
          {
            heading: "Beyond the Big Two: Hierarchy, Loops, and Schemas",
            body: "Consciousness research is far wider than a two-horse race. Predictive Processing and Active Inference (Karl Friston, Anil Seth) cast the brain as a hierarchical prediction engine sculpted by bodily regulation. Higher-Order Theories (HOT — David Rosenthal, Hakwan Lau, Richard Brown) argue that a sensory state becomes conscious only when a prefrontal meta-representation indexes it as reliable. Recurrent Processing Theory (RPT — Victor Lamme) holds that localized feedback loops within sensory cortex already suffice for rich phenomenal seeing, while Attention Schema Theory (AST — Michael Graziano) models consciousness as the brain’s simplified internal schematic of its own attentional control."
          }
        ],
        keyCards: [
          {
            tag: "GLOBAL BROADCAST",
            title: "GNWT (Dehaene & Changeux)",
            detail: "Prefrontal and parietal associative hubs amplify selected sensory signals into a shared global workspace enabling flexible report and planning.",
            citation: "Dehaene & Changeux (2011), Neuron"
          },
          {
            tag: "INTRINSIC CAUSE-EFFECT",
            title: "IIT 4.0 (Tononi, Albantakis, Koch)",
            detail: "Formalizes phenomenal existence mathematically as integrated information (Φ), locating the human substrate primarily in posterior sensory-associative cortex.",
            citation: "Albantakis et al. (2023), PLOS Comp Biol"
          },
          {
            tag: "PEER-REVIEWED CLASH · 2025",
            title: "The IIT Falsifiability Debate",
            detail: "Critics challenge untestable metaphysical postulates and media overclaims; defenders cite concrete empirical tests and clinical translation.",
            citation: "Nature Neuroscience (April 2025)"
          },
          {
            tag: "METACOGNITION & SCHEMAS",
            title: "HOT, RPT & Attention Schema",
            detail: "Competing models locate awareness in prefrontal reality-monitoring (HOT), local sensory recurrence (RPT), or an internal control model of attention (AST).",
            citation: "Lau (2022); Lamme (2020); Graziano (2019)"
          }
        ],
        quote: {
          text: "Consciousness is not a single thing hiding in a single bump of tissue; the real contest is whether awareness requires global executive broadcast, intrinsic causal unity, or self-monitoring inference.",
          author: "Contemporary Synthesis",
          work: "Neuroscience of Consciousness · 2025 Paradigm Review"
        },
        lab: {
          badge: "LAB 02 · CORTICAL MECHANISM ATLAS",
          title: "Compare Five Leading Neural Theories",
          instruction: "Select a theory below to illuminate its hypothesized cortical substrate, core mechanism, anatomical hotspot, and principal scientific critique.",
          theories: [
            {
              id: "gnwt",
              short: "GNWT",
              name: "Global Neuronal Workspace Theory",
              founders: "Bernard Baars, Stanislas Dehaene, Jean-Pierre Changeux",
              mechanism: "Non-linear “global ignition” (~250–300 ms) broadcasts sensory signals across long-range fronto-parietal axons, making content accessible to memory, decision, and report.",
              hotspot: "Dorsolateral prefrontal cortex, anterior cingulate & posterior parietal hubs",
              critique: "Struggles to distinguish phenomenal experience itself from post-perceptual cognitive access, task reporting, and working memory.",
              activeRegions: ["pfc", "parietal", "temporal", "occipital"]
            },
            {
              id: "iit",
              short: "IIT 4.0",
              name: "Integrated Information Theory 4.0",
              founders: "Giulio Tononi, Larissa Albantakis, Christof Koch",
              mechanism: "Consciousness is identical to a system’s maximally irreducible cause-effect structure (Φ), unifying differentiation (richness) with causal integration (unity).",
              hotspot: "Posterior cortical “hot zone” (temporo-parieto-occipital junction)",
              critique: "Exact Φ is computationally intractable in real brains; critics argue its panpsychist core postulates resist direct empirical falsification.",
              activeRegions: ["occipital", "temporal", "parietal"]
            },
            {
              id: "pp",
              short: "PP / AI",
              name: "Predictive Processing & Active Inference",
              founders: "Karl Friston, Andy Clark, Anil Seth",
              mechanism: "Hierarchical generative models predict incoming exteroceptive and interoceptive signals; conscious content reflects the brain’s best precision-weighted hypothesis.",
              hotspot: "Cortical hierarchy, thalamocortical loops & anterior insula (interoception)",
              critique: "Powerful unifying framework for perception, yet critics note it does not by itself specify which predictive loops feel conscious versus unconscious.",
              activeRegions: ["pfc", "insula", "occipital", "temporal", "thalamus"]
            },
            {
              id: "hot",
              short: "HOT",
              name: "Higher-Order Theories",
              founders: "David Rosenthal, Hakwan Lau, Richard Brown",
              mechanism: "First-order sensory representations remain unconscious unless indexed by a higher-order prefrontal meta-representation tracking perceptual reliability.",
              hotspot: "Prefrontal cortex (especially anterior/dorsolateral PFC) monitoring sensory areas",
              critique: "Challenged by cases of vivid perception with minimal frontal engagement, such as dreaming, infants, or patients with focal prefrontal lesions.",
              activeRegions: ["pfc", "parietal", "occipital"]
            },
            {
              id: "rpt",
              short: "RPT",
              name: "Recurrent Processing Theory",
              founders: "Victor Lamme",
              mechanism: "An initial feedforward sweep stays unconscious; localized horizontal and top-down recurrent feedback within sensory areas binds features into phenomenal awareness.",
              hotspot: "Occipital & ventrotemporal visual hierarchy (V1–V4, IT feedback loops)",
              critique: "Difficult to verify pure “phenomenal overflow” without cognitive access or verbal report — the classic methodological access-versus-phenomenality tangle.",
              activeRegions: ["occipital", "temporal"]
            }
          ]
        }
      },
      {
        id: "ch3",
        num: "III",
        plateId: "03",
        theme: "clash",
        eyebrow: "CHAPTER III · ADVERSARIAL SCIENCE",
        title: "COGITATE: When Theories Collide in the Scanner",
        lead: "For decades, rival theories of consciousness talked past one another using incompatible experiments. In April 2025, Nature published the landmark result of an unprecedented scientific truce: an adversarial collaboration designed to put IIT and GNWT on the exact same trial.",
        plate: {
          code: "PLATE 03 · NATURE · APRIL 2025",
          title: "The Adversarial Scorecard",
          caption: "256 human participants across international labs, tested under a unified preregistered visual protocol across three modality cohorts — fMRI, MEG, and intracranial EEG — delivered a humbling verdict: neither flagship theory escaped unscathed.",
          telemetryLabel: "COGITATE CONSORTIUM",
          telemetryValue: "256 Subjects · 3 Modalities · Preregistered"
        },
        sections: [
          {
            heading: "Architecture of an Adversarial Test",
            body: "Funded by the Templeton World Charity Foundation’s Accelerating Research on Consciousness (ARC) initiative, the theory-neutral Cogitate Consortium worked directly with Stanislas Dehaene (GNWT) and Giulio Tononi (IIT) to co-design preregistered experiments before a single scan was collected. Crucially, stimuli (faces, objects, letters, and false fonts presented at varying durations) were separated from active task reports so neural signatures of seeing would not be confused with pressing a button."
          },
          {
            heading: "Mixed Verdict: Blows to Both Titans",
            body: "The 2025 Nature findings overturned neat textbook narratives. Conscious stimulus identity and duration were robustly decodable across posterior visual and ventrotemporal cortex — aligning with IIT’s spatial emphasis — whereas prefrontal cortex showed narrower category decoding and failed to reliably encode stimulus orientation. Yet IIT suffered a decisive setback of its own: its signature prediction of sustained, content-specific functional synchronization within posterior cortex largely failed to appear. Meanwhile, GNWT took a parallel blow when its predicted fronto-parietal “ignition” surge at stimulus offset — signaling an update to the global workspace — failed to materialize.",
            callout: "Neither theory “won” COGITATE. Instead, the study demonstrated that structured adversarial collaboration can falsify cherished auxiliary predictions and force theories to revise rather than retreat into isolated echo chambers."
          },
          {
            heading: "After COGITATE: INTREPID and the 2025–2026 Pivot",
            body: "The momentum has now expanded into a second wave of adversarial collaborations, notably INTREPID — pitting IIT (Tononi) head-to-head against Karl Friston’s Active Inference and Cyriel Pennartz’s Neurorepresentationalism across rodents and humans. Across 2025–2026, a broader shift is unmistakable: researchers are moving away from monolithic “one-mechanism-explains-all” dogmas toward multi-dimensional frameworks explaining how posterior content, frontal access, and bodily inference cooperate."
          }
        ],
        keyCards: [
          {
            tag: "MULTIMODAL SCALE",
            title: "256 Participants · 3 Tools",
            detail: "Combined high-spatial fMRI, millisecond MEG, and direct human intracranial EEG (iEEG) across independent laboratories to eliminate single-method blind spots.",
            citation: "Cogitate Consortium (2025), Nature"
          },
          {
            tag: "CHALLENGE TO IIT",
            title: "Missing Posterior Synchrony",
            detail: "While posterior regions tracked stimulus content across time, predicted sustained intra-posterior functional synchronization was largely absent.",
            citation: "Ferrante, Melloni et al. (2025), Nature"
          },
          {
            tag: "CHALLENGE TO GNWT",
            title: "Absent Offset Ignition",
            detail: "The expected fronto-parietal broadcast pulse when a conscious image vanished did not robustly appear, and PFC poorly encoded stimulus orientation.",
            citation: "Cogitate Consortium (2025), Nature"
          },
          {
            tag: "NEXT WAVE · 2025–2026",
            title: "INTREPID Collaboration",
            detail: "Tests IIT directly against Active Inference (Friston) and Neurorepresentationalism (Pennartz), probing how action and prediction shape perception.",
            citation: "TWCF ARC · INTREPID Consortium"
          }
        ],
        quote: {
          text: "Adversarial collaboration does not crown a final victor overnight; its real triumph is forcing our most ambitious theories to confront nature under rules nobody can move after the fact.",
          author: "Adversarial Science Synthesis",
          work: "Following Melloni & the Cogitate Consortium (Nature, 2025)"
        },
        lab: {
          badge: "LAB 03 · COGITATE AUDIT (NATURE, 2025)",
          title: "Inspect the Preregistered Scorecard",
          instruction: "Step through the three preregistered empirical tests from the April 2025 Nature paper to compare IIT and GNWT predictions against the multimodal evidence.",
          subtitle: "Preregistered Adversarial Collaboration · Theory-Neutral Testing",
          modalities: ["fMRI", "MEG", "iEEG"],
          tests: [
            {
              id: "decoding",
              title: "1. Localization & Sustained Content Decoding",
              iitPred: "Conscious stimulus identity, orientation, and duration remain continuously decodable within posterior visual and ventrotemporal cortex (“hot zone”).",
              gnwtPred: "Conscious content is broadcast to and robustly decodable from prefrontal and parietal workspace regions across categories and stimulus features.",
              finding: "Posterior visual and ventrotemporal areas sustained rich decoding of category, orientation, and duration. Inferior frontal cortex showed limited category decoding without reliable orientation representation.",
              verdictIit: "supported",
              verdictGnwt: "partial",
              verdictLabelIit: "Supported",
              verdictLabelGnwt: "Partial / Limited",
              detail: "Across fMRI, MEG, and iEEG, posterior sensory-associative regions faithfully tracked both what was seen and how long it stayed on screen, whereas prefrontal decoding was narrower and insensitive to orientation."
            },
            {
              id: "synchrony",
              title: "2. Sustained Posterior Synchronization",
              iitPred: "Sustained, content-specific functional connectivity and synchronization should bind early visual and high-level ventrotemporal areas throughout stimulus viewing.",
              gnwtPred: "Brief feed-forward and reciprocal connectivity should transiently link sensory regions with prefrontal-parietal workspace hubs at ignition.",
              finding: "Predicted sustained intra-posterior synchronization for conscious content largely failed to materialize; only brief, transient early connectivity appeared between sensory and frontal areas.",
              verdictIit: "challenged",
              verdictGnwt: "partial",
              verdictLabelIit: "Challenged",
              verdictLabelGnwt: "Mixed",
              detail: "This marked the sharpest empirical setback for IIT: although posterior cortex encoded the conscious image, the sustained inter-areal causal binding predicted by its core connectivity proxy did not emerge."
            },
            {
              id: "ignition",
              title: "3. Stimulus-Offset Global Ignition",
              iitPred: "Neural representation in posterior cortex tracks stimulus presence continuously and smoothly subsides at offset without requiring a frontal broadcast burst.",
              gnwtPred: "Both stimulus onset and stimulus offset should trigger a prominent fronto-parietal “ignition” updating the global workspace when perceptual content vanishes.",
              finding: "Onset responses appeared broadly, yet the signature fronto-parietal ignition predicted at stimulus offset largely failed to occur across MEG and intracranial recordings.",
              verdictIit: "partial",
              verdictGnwt: "challenged",
              verdictLabelIit: "Partially Consistent",
              verdictLabelGnwt: "Challenged",
              detail: "The absence of a robust offset ignition in prefrontal cortex directly challenged GNWT’s core workspace-update dynamics, pushing theorists to reconsider how vanishing percepts are registered."
            }
          ]
        }
      },
      {
        id: "ch4",
        num: "IV",
        plateId: "04",
        theme: "mirror",
        eyebrow: "CHAPTER IV · PREDICTIVE PROCESSING",
        title: "The Controlled Hallucination & the Beast Machine",
        lead: "Locked inside a silent, pitch-black skull, the brain never touches the outside world directly. Instead, it survives by tirelessly guessing the hidden causes of sensory impulses — and continuously correcting its guesses against reality.",
        plate: {
          code: "PLATE 04 · INFERENCE ENGINE",
          title: "Top-Down Priors vs. Prediction Error",
          caption: "Perception is not passive photography streaming inward; it is an inside-out generative forecast disciplined by precision-weighted sensory surprise.",
          telemetryLabel: "FREE ENERGY MINIMIZATION",
          telemetryValue: "Prior × Precision ↔ Prediction Error"
        },
        sections: [
          {
            heading: "Inside-Out Perception and Precision Weighting",
            body: "Under Predictive Processing and Karl Friston’s Free Energy Principle, higher cortical layers constantly send top-down predictions downward, while sensory pathways send back only what disagrees — the prediction error. Crucially, the brain must estimate “precision,” or how trustworthy each signal is in the moment. In dim fog, sensory data are noisy, so expectations dominate; in crisp daylight, high-precision sensory errors rapidly override false guesses."
          },
          {
            heading: "Controlled Hallucination",
            body: "Neuroscientist Anil Seth describes everyday conscious perception as a “controlled hallucination” — a brain-generated best guess tethered tightly to the world by sensory error signals. When precision weighting tips too far toward top-down priors, we see faces in clouds or hear voices in static; when priors dissolve, familiar objects shatter into raw sensory chaos. Reality as we experience it is therefore an active negotiation, not a transparent window.",
            callout: "Hallucination is uncontrolled perception — and normal perception is simply hallucination kept continuously accountable to external and bodily feedback."
          },
          {
            heading: "The Beast Machine: Why Consciousness Needs a Body",
            body: "In Being You (2021), Seth extends predictive inference inward to interoception — the brain’s continuous regulation of heart rate, blood pressure, glucose, breath, and immune tone. Against silicon-centric metaphors of the mind as abstract software, his Beast Machine hypothesis argues that the felt sense of “being a self” evolved not to contemplate mathematics, but to keep a fragile living organism alive. Emotion, mood, and the sheer feeling of existing are interoceptive predictions aimed at physiological survival (allostasis)."
          }
        ],
        keyCards: [
          {
            tag: "BAYESIAN CORTEX",
            title: "Precision Weighting",
            detail: "Gain control dials determine whether awareness trusts prior expectations or bottom-up sensory surprise — governing attention, illusions, and belief updating.",
            citation: "Friston (2010), Nature Reviews Neuroscience"
          },
          {
            tag: "PERCEPTUAL REALISM",
            title: "Controlled Hallucination",
            detail: "Visual and auditory worlds are top-down generative models constrained by sensory error rather than passive pixel-by-pixel readouts.",
            citation: "Seth (2021), Being You"
          },
          {
            tag: "INTEROCEPTION",
            title: "The Beast Machine",
            detail: "Embodied selfhood is rooted in predictive control of internal physiology (anterior insula and autonomic loops), tying consciousness deeply to living biology.",
            citation: "Seth & Tsakiris (2018), Trends Cogn Sci"
          },
          {
            tag: "ACTIVE INFERENCE",
            title: "Action Closes the Loop",
            detail: "We reduce prediction error not only by updating beliefs, but by moving our eyes, hands, and bodies to sample or reshape the world to fit our models.",
            citation: "Parr, Pezzulo & Friston (2022)"
          }
        ],
        quote: {
          text: "We do not just passively perceive the world; we actively generate it. The world we experience comes as much, if not more, from the inside out as from the outside in.",
          author: "Anil K. Seth",
          work: "Being You: A New Science of Consciousness (2021)"
        },
        lab: {
          badge: "LAB 04 · BAYESIAN PERCEPTION TUNER",
          title: "Balance Priors Against Sensory Noise",
          instruction: "Adjust top-down prior precision and incoming sensory noise — or load a preset regime — to watch how perceptual reality stabilizes, tilts into pareidolia, or opens under relaxed beliefs.",
          priorLabel: "Top-Down Prior Precision",
          noiseLabel: "Sensory Noise / Ambiguity",
          presets: [
            {
              id: "chaos",
              name: "Sensory Chaos",
              prior: 18,
              noise: 86,
              stateTitle: "Uncalibrated Prediction Error",
              stateDesc: "Weak priors cannot organize noisy sensory bursts. Edges refuse to bind into stable objects, leaving awareness flooded with unparsed static."
            },
            {
              id: "balanced",
              name: "Controlled Hallucination",
              prior: 62,
              noise: 28,
              stateTitle: "Veridical Perceptual Lock",
              stateDesc: "Generative expectations match clean sensory evidence. Error signals swiftly refine the model, producing crisp, stable everyday perception."
            },
            {
              id: "illusion",
              name: "Prior-Driven Illusion",
              prior: 92,
              noise: 74,
              stateTitle: "Pareidolia & Rigid Expectation",
              stateDesc: "Hyper-precise top-down priors overpower ambiguous input, carving illusory patterns, faces, or unshakable interpretations straight out of noise."
            },
            {
              id: "rebus",
              name: "REBUS / Relaxed Priors",
              prior: 26,
              noise: 42,
              stateTitle: "Anarchic & Fluid Perception",
              stateDesc: "In Carhart-Harris & Friston’s psychedelic REBUS regime, high-level priors relax their grip, allowing rich bottom-up sensory and interoceptive streams to reshape awareness."
            }
          ]
        }
      },
      {
        id: "ch5",
        num: "V",
        plateId: "05",
        theme: "pulse",
        eyebrow: "CHAPTER V · STATES & CLINICAL BIOMARKERS",
        title: "Measuring the Invisible Spark",
        lead: "A person can lie motionless with closed eyes and still inhabit a vivid world — in REM dreams, under ketamine, or after catastrophic brain injury. Modern clinical neuroscience has finally built instruments that detect awareness without asking a single muscle to move.",
        plate: {
          code: "PLATE 05 · CLINICAL BIOMARKERS",
          title: "Zap-and-Zip Complexity & Covert Minds",
          caption: "When a gentle magnetic pulse taps the cortex, a conscious brain answers with an intricate, reverberating symphony; an unconscious cortex replies with a dull, local echo.",
          telemetryLabel: "CLINICAL CUTOFF",
          telemetryValue: "PCI* = 0.31 · 25% Covert CMD"
        },
        sections: [
          {
            heading: "Covert Consciousness: The 2024 NEJM Milestone",
            body: "For decades, bedside exams judged brain-injured patients solely by behavioral response: squeeze a hand, track a mirror. In August 2024, a landmark six-center study in The New England Journal of Medicine (Yelena Bodien, Nicholas Schiff, Brian Edlow, and colleagues) tested 241 behaviorally unresponsive patients using task-based fMRI and EEG. Fully 25% — 60 out of 241 patients — covertly followed complex verbal instructions such as “imagine playing tennis,” exhibiting Cognitive Motor Dissociation (CMD): an intact mind trapped behind severed motor output.",
            callout: "One in four behaviorally unresponsive patients with severe brain injury showed hidden command-following on brain scans — compelling an urgent ethical transformation in neurocritical care."
          },
          {
            heading: "Zap-and-Zip: The Perturbational Complexity Index",
            body: "Because motor-imagery tasks still require attention and language comprehension, Marcello Massimini and Adenauer Casali developed a task-free consciousness meter: the Perturbational Complexity Index (PCI). A brief transcranial magnetic stimulation (TMS) pulse perturbs the cortex while high-density EEG records the resulting echo, which is then compressed (“zipped”) algorithmically to measure its spatiotemporal complexity. Across hundreds of recordings, an empirical threshold of PCI* = 0.31 separates unconscious states (deep NREM N3 sleep, propofol anesthesia, coma; PCI ≤ 0.31) from conscious states (wakefulness, vivid REM dreaming, ketamine dissociation, and minimally conscious patients; PCI > 0.31)."
          },
          {
            heading: "Lucid Dialogues, Entropic Brains, and Pure Awareness",
            body: "Altered states illuminate dimensions of consciousness ordinary wakefulness conceals. In 2021, Karen Konkoly and collaborators achieved real-time two-way communication with lucid REM dreamers, who solved spoken math questions using pre-agreed eye movements while asleep. Robin Carhart-Harris and Karl Friston’s REBUS (Relaxed Beliefs Under Psychedelics) and Entropic Brain models show how serotonergic psychedelics elevate neural signal diversity and loosen rigid ego-priors. Meanwhile, philosopher Thomas Metzinger’s The Elephant and the Blind (MIT Press, 2024) analyzed more than 500 firsthand reports of Minimal Phenomenal Experience (MPE) — “pure awareness” stripped of thoughts, body boundaries, or narrative self, probing the ground floor of consciousness itself."
          }
        ],
        keyCards: [
          {
            tag: "NEJM · AUGUST 2024",
            title: "25% Covert Consciousness",
            detail: "60 of 241 behaviorally unresponsive patients demonstrated Cognitive Motor Dissociation on fMRI/EEG during verbal imagery tasks.",
            citation: "Bodien, Schiff, Edlow et al. (2024), NEJM"
          },
          {
            tag: "BIOMARKER · PCI* = 0.31",
            title: "TMS-EEG “Zap-and-Zip”",
            detail: "Quantifies joint cortical integration and differentiation directly from perturbation echoes, working even without sensory input or behavioral report.",
            citation: "Casali et al. (2013); Casarotto et al. (2016)"
          },
          {
            tag: "LUCID REM & REBUS",
            title: "Active Inner Worlds",
            detail: "Two-way dialogue during lucid REM sleep (Konkoly, 2021) and heightened neural entropy under psychedelics reveal consciousness decoupled from external action.",
            citation: "Konkoly et al. (2021); Carhart-Harris & Friston (2019)"
          },
          {
            tag: "MINIMAL EXPERIENCE · 2024",
            title: "Pure Awareness (MPE)",
            detail: "Over 500 reports document wakeful awareness devoid of sensory objects or ego — an empirical probe into the simplest possible form of consciousness.",
            citation: "Metzinger (2024), MIT Press"
          }
        ],
        quote: {
          text: "Absence of behavioral evidence is not evidence of the absence of consciousness. A silent body may still shelter an attentive, listening mind.",
          author: "Clinical Neuroscience Synthesis",
          work: "Following Bodien, Schiff, Edlow et al. (NEJM, 2024)"
        },
        lab: {
          badge: "LAB 05 · TMS-EEG ZAP-AND-ZIP SIMULATOR",
          title: "Probe Cortical Complexity Across States",
          instruction: "Choose a brain state and fire a simulated TMS pulse to watch the cortical response propagate and measure whether its Perturbational Complexity Index crosses the PCI* = 0.31 consciousness threshold.",
          zapBtn: "Deliver TMS Pulse (Zap & Zip)",
          thresholdLabel: "Empirical Cutoff PCI* = 0.31",
          metricComplexity: "Perturbational Complexity (PCI)",
          metricState: "Consciousness Classification",
          states: [
            {
              id: "awake",
              name: "Alert Wakefulness",
              pci: 0.56,
              conscious: true,
              statusLabel: "Conscious · High Complexity",
              wavePattern: "complex-distributed",
              desc: "A cortical TMS pulse sparks a rich, long-range sequence of differentiated waves rippling across distant hubs — high integration combined with high informational diversity."
            },
            {
              id: "rem",
              name: "REM Dreaming",
              pci: 0.44,
              conscious: true,
              statusLabel: "Conscious · Internally Vivid",
              wavePattern: "vivid-internal",
              desc: "Despite muscular paralysis and closed eyes, the dreaming cortex stays internally integrated and complex, reliably scoring above the 0.31 threshold."
            },
            {
              id: "ketamine",
              name: "Ketamine Dissociation",
              pci: 0.48,
              conscious: true,
              statusLabel: "Conscious · Behaviorally Unresponsive",
              wavePattern: "dissociated-rich",
              desc: "Patients appear anesthetized and immobile externally, yet Sarasso et al. (2015) demonstrated high PCI values matching intense, vivid dreamlike dissociation."
            },
            {
              id: "psilocybin",
              name: "Psychedelic State (Psilocybin)",
              pci: 0.55,
              conscious: true,
              statusLabel: "Conscious · Waking PCI / Elevated Entropy",
              wavePattern: "entropic-cascade",
              desc: "A revealing empirical dissociation: Ort, Vollenweider, Sarasso, Massimini et al. (2023, iScience) found that TMS-evoked PCI under psilocybin stays on the waking plateau (~0.55), even as spontaneous resting-state Lempel-Ziv complexity rises (Schartner et al., 2017) under REBUS relaxed priors."
            },
            {
              id: "nrem",
              name: "Deep NREM Sleep (N3)",
              pci: 0.23,
              conscious: false,
              statusLabel: "Unconscious · Bistable Collapse",
              wavePattern: "slow-stereotyped",
              desc: "Perturbation triggers a large, stereotyped slow wave followed by cortical neuronal silence (“off-period”), shattering causal chains and dropping PCI below 0.31."
            },
            {
              id: "propofol",
              name: "Propofol Anesthesia",
              pci: 0.19,
              conscious: false,
              statusLabel: "Unconscious · Localized Echo",
              wavePattern: "local-damped",
              desc: "Effective cortical connectivity breaks down: the TMS pulse remains trapped near the stimulation site and rapidly fades, yielding low algorithmic complexity."
            }
          ]
        }
      },
      {
        id: "ch6",
        num: "VI",
        plateId: "06",
        theme: "horizon",
        eyebrow: "CHAPTER VI · BEYOND THE HUMAN SKULL",
        title: "The Expanding Horizon of Other Minds",
        lead: "Human consciousness is only one point in a vast, multidimensional space of possible minds. Across marine reefs, avian skies, lab-grown neural organoids, and frontier artificial intelligence, science faces an urgent question: where else does the inner light switch on?",
        plate: {
          code: "PLATE 06 · MINDSPACE",
          title: "Multidimensional Cartography of Sentience",
          caption: "Consciousness is not a single ladder climbing toward humanity; it is a landscape of distinct evolutionary and architectural profiles.",
          telemetryLabel: "ETHICAL FRONTIER",
          telemetryValue: "NY Declaration 2024 · AI Indicators 2025"
        },
        sections: [
          {
            heading: "The New York Declaration on Animal Consciousness (2024)",
            body: "In April 2024, leading philosophers and biologists — including Kristin Andrews, Jonathan Birch, Jeff Sebo, and David Chalmers, joined by hundreds of signatories — issued the New York Declaration on Animal Consciousness. The consensus marks a historic shift: there is strong scientific support for conscious experience in mammals and birds, and a “realistic possibility” of consciousness across all other vertebrates (reptiles, amphibians, fishes) as well as many invertebrates, including cephalopods (octopuses, cuttlefish), decapod crustaceans (crabs, lobsters), and insects (such as bees and flies).",
            callout: "Evidence no longer relies on human-like cortex: corvids show single-neuron correlates of subjective seeing in an avian pallium, octopuses groom wounded arms and avoid pain-linked chambers, and bumblebees display play-like behavior and motivational pain trade-offs."
          },
          {
            heading: "Brain Organoids: Tissue Without a World?",
            body: "Millimeter-scale human cerebral organoids grown from stem cells now generate spontaneous electrical oscillations resembling early fetal patterns. Yet rigorous consensus stresses how far current organoids remain from sentience: they lack vascularization, mature long-range connectivity, thalamocortical loops, bodily interoception, and sensorimotor interaction. Even so, bioethicists advocate proactive monitoring benchmarks before increasingly complex “assembloids” cross ambiguous thresholds."
          },
          {
            heading: "AI Consciousness: Deep Indicators Over Surface Mimicry",
            body: "Large language models converse with disarming warmth and declare inner feelings when prompted — yet fluency is an unreliable proxy for sentience. In a major framework led by Patrick Butlin, Robert Long, Tim Bayne, Yoshua Bengio, Jonathan Birch, David Chalmers, and colleagues (expanded in Trends in Cognitive Sciences, 2025, alongside Principles for Responsible AI Consciousness Research), researchers propose a theory-heavy “indicator approach”: auditing internal architectures for recurrent processing, global broadcast workspaces, metacognitive monitoring, and embodied agency — even as biological naturalists like Anil Seth remain skeptical that computation alone suffices without living metabolism. Today’s predominantly feedforward transformers lack most key indicators, yet rapid architectural evolution makes transparent governance and epistemic humility urgent."
          }
        ],
        keyCards: [
          {
            tag: "CONSENSUS · APRIL 2024",
            title: "New York Declaration",
            detail: "Affirms strong support for sentience in mammals & birds and a realistic possibility across all vertebrates plus cephalopods, decapods, and insects.",
            citation: "Andrews, Birch, Sebo et al. (2024)"
          },
          {
            tag: "COMPARATIVE NEUROSCIENCE",
            title: "Convergent Substrates",
            detail: "Crows lack a six-layered neocortex yet show conscious visual firing; octopuses distribute two-thirds of their neurons across eight semi-autonomous arms.",
            citation: "Nieder et al. (2020); Crook (2021)"
          },
          {
            tag: "AI INDICATORS · 2025",
            title: "Architecture Over Rhetoric",
            detail: "Assess synthetic minds via computational indicators derived from neuroscience (recurrence, global workspace, agency) rather than persuasive chat outputs.",
            citation: "Butlin, Long, Bengio, Chalmers et al. (2025), TiCS"
          },
          {
            tag: "PRECAUTIONARY ETHICS",
            title: "Two Moral Risks",
            detail: "Under-attributing sentience risks inflicting unrecognized suffering; over-attributing it to hollow AI risks distorting human relationships and rights.",
            citation: "Long et al. (2024); Birch (2024)"
          }
        ],
        quote: {
          text: "When there is a realistic possibility of conscious experience in an animal, it is irresponsible to ignore that possibility in decisions affecting that animal.",
          author: "The New York Declaration on Animal Consciousness",
          work: "New York University · April 19, 2024"
        },
        lab: {
          badge: "LAB 06 · MULTIDIMENSIONAL MINDSPACE",
          title: "Compare Profiles Across Biological & Synthetic Systems",
          instruction: "Select primary and comparison entities to plot illustrative five-axis consciousness profiles — moving beyond a single “intelligence ladder” toward distinct architectural footprints.",
          axes: [
            "Sensory Richness",
            "Evaluative Valence",
            "Unity & Integration",
            "Temporality & Memory",
            "Metacognition & Self"
          ],
          compareHint: "Overlay a second entity to contrast profiles",
          entities: [
            {
              id: "human",
              name: "Human (Homo sapiens)",
              category: "Mammal · Reference Benchmark",
              scores: [92, 95, 94, 96, 95],
              badge: "Confirmed Benchmark",
              summary: "Tightly integrated thalamocortical architecture combining rich multimodal perception, deep autobiographical time, evaluative emotion, and recursive self-reflection.",
              evidence: "First-person report, high PCI (~0.55), fronto-parietal and posterior sensory integration, metacognitive introspection."
            },
            {
              id: "octopus",
              name: "Octopus (Octopus vulgaris)",
              category: "Cephalopod · Distributed Mind",
              scores: [88, 78, 52, 66, 48],
              badge: "Realistic Possibility · Strong Evidence",
              summary: "An alien evolutionary triumph: exquisite chemotactile and visual richness paired with decentralized arm ganglia that may produce partially federated rather than strictly singular unity.",
              evidence: "Targeted wound grooming, learned analgesic preference (Crook, 2021), episodic-like foraging memory, observational learning."
            },
            {
              id: "corvid",
              name: "Corvid (Crow / Raven)",
              category: "Bird · Convergent Pallium",
              scores: [86, 85, 84, 82, 72],
              badge: "Strong Scientific Support",
              summary: "Without a mammalian neocortex, corvids evolved a dense nidopallium caudolaterale supporting subjective visual awareness, causal toolmaking, and future planning.",
              evidence: "Single-neuron correlates of subjective perception (Nieder et al., Science 2020), delayed gratification, social perspective-taking."
            },
            {
              id: "bumblebee",
              name: "Bumblebee (Bombus terrestris)",
              category: "Insect · Compact Central Complex",
              scores: [74, 62, 50, 48, 22],
              badge: "Realistic Possibility",
              summary: "Within roughly one million neurons, bumblebees integrate vision and touch across modalities, weigh nociceptive heat against sucrose rewards, and exhibit spontaneous object play.",
              evidence: "Motivational pain trade-offs (Gibbons et al., 2022), cross-modal object recognition, ball-rolling play (Galpayage Dona et al., 2022)."
            },
            {
              id: "organoid",
              name: "Cerebral Organoid",
              category: "In Vitro Human Neural Tissue",
              scores: [8, 5, 16, 6, 2],
              badge: "No Evidence of Sentience Today",
              summary: "Self-organizing millimeter-scale cortical tissue capable of local spontaneous oscillatory bursts, yet devoid of sensory organs, interoceptive body, thalamus, or global architecture.",
              evidence: "Local multi-electrode network bursts; no functional sensory-motor loop, pain pathways, or sustained large-scale complexity."
            },
            {
              id: "llm",
              name: "Frontier LLM (Transformer)",
              category: "Artificial Intelligence · Feedforward Core",
              scores: [24, 6, 28, 32, 22],
              badge: "Lacks Key Architectural Indicators",
              summary: "Extraordinary linguistic fluency and broad world-knowledge modeling, yet lacks sustained biological interoception, intrinsic valence, persistent global workspace recurrence, and embodied agency.",
              evidence: "Butlin, Long, Bengio et al. (2025, TiCS): current transformers satisfy few neuroscientific consciousness indicators despite convincing verbal self-reports."
            }
          ]
        }
      }
    ],
    epilogue: {
      plateCode: "PLATE 07 · SYNTHESIS",
      eyebrow: "EPILOGUE · THE OPEN HORIZON",
      title: "The Mirror Looks Back",
      body: "Consciousness science in 2025–2026 has outgrown premature triumphalism and armchair pessimism alike. Adversarial experiments humbled flagship theories without halting progress; clinical biomarkers rescued hidden minds from silent wards; and the circle of possible sentience expanded from the human neocortex across oceans, skies, and questions of silicon architecture. Understanding how matter wakes up remains the most intimate scientific adventure we possess — because the instrument studying the mystery is the mystery itself.",
      plateCaption: "Where empirical precision meets philosophical humility: a living atlas still being drawn.",
      cards: [
        {
          title: "Methodological Maturity",
          text: "Preregistered adversarial collaborations (COGITATE, INTREPID) have replaced isolated advocacy with shared data and falsifiable cross-theory tests."
        },
        {
          title: "Immediate Clinical Impact",
          text: "Task-free PCI complexity mapping and fMRI/EEG covert command detection already reshape diagnosis, prognosis, and dignity in neurocritical care."
        },
        {
          title: "Responsible Future Governance",
          text: "Clear architectural indicators and precautionary bioethics help humanity honor real animal sentience while avoiding illusion in fluent synthetic systems."
        }
      ],
      referencesTitle: "Curated Landmark Bibliography",
      footerNote: "NOESIS — Atlas of Consciousness · Synthesized from peer-reviewed philosophy and neuroscience literature through 2025–2026."
    },
    ui: {
      zoomPlate: "Expand Plate",
      closeModal: "Close",
      sourceBadge: "PEER-REVIEWED ANCHOR",
      predictionIit: "IIT 4.0 Prediction",
      predictionGnwt: "GNWT Prediction",
      empiricalResult: "COGITATE 2025 Finding",
      thresholdReached: "Above PCI* = 0.31 · Conscious Complexity",
      belowThreshold: "Below PCI* = 0.31 · Unconscious Regime",
      cmdHighlightTitle: "NEJM 2024 · Covert Consciousness",
      cmdHighlightStat: "60 / 241 (25%)",
      cmdHighlightDesc: "Behaviorally unresponsive brain-injury patients who covertly followed verbal motor-imagery commands on fMRI or EEG.",
      ariaHeroStats: "Key empirical milestones",
      ariaPlatesColumn: "Illustrated atlas plates",
      ariaPlateDots: "Atlas chapter plates navigation",
      ariaLangSwitch: "Language switcher",
      ariaPhilTabs: "Philosophical interpretations of Mary's Room",
      ariaBrainTheories: "Leading neuroscientific theories of consciousness",
      ariaMarySvg: "Mary's Room optical prism and spectral bloom",
      cogitateTestsLabel: "3 tests",
      webglBadge: "Live 3D Cortex · Interactive",
      dragHint: "Move cursor to orbit · Scroll to dive",
      expandLab: "Open Interactive Lab",
      scrollChapter: "Chapter",
      visualModeArt: "Sculptural Plate",
      visualMode3d: "Live 3D Focus"
    }
  },
  ru: {
    meta: {
      title: "NOESIS — Атлас Сознания",
      description: "Интерактивный научный скроллителлинг по философии сознания и нейронауке: от трудной проблемы и комнаты Мэри до состязательного эксперимента COGITATE (2025), скрытого сознания и границ нечеловеческого разума.",
      langName: "Русский",
      switchLabel: "EN",
      readingTime: "18 мин интерактивного чтения"
    },
    nav: {
      brand: "NOESIS",
      subtitle: "Атлас Сознания",
      items: [
        { id: "ch1", num: "I", shortLabel: "Трудная проблема" },
        { id: "ch2", num: "II", shortLabel: "Нейротеории" },
        { id: "ch3", num: "III", shortLabel: "COGITATE 2025" },
        { id: "ch4", num: "IV", shortLabel: "Предиктивный мозг" },
        { id: "ch5", num: "V", shortLabel: "Состояния и PCI" },
        { id: "ch6", num: "VI", shortLabel: "Иные разумы" }
      ],
      jumpTop: "Наверх",
      platePrefix: "ТАБЛИЦА",
      scrollHint: "Прокрутите, чтобы открыть атлас"
    },
    hero: {
      eyebrow: "НАУЧНО-ФИЛОСОФСКАЯ МОНОГРАФИЯ · РЕДАКЦИЯ 2025–2026",
      title: "Атлас",
      titleAccent: "Сознания",
      subtitle: "Как полтора килограмма возбудимой нервной ткани порождают красноту красного, остроту тоски и тихий факт бытия кем-то — от современной философии сознания и состязательной нейронауки до клинических прорывов и горизонта нечеловеческих разумов.",
      stats: [
        { value: "256", label: "Участников состязательного эксперимента COGITATE (Nature, 2025)" },
        { value: "25%", label: "Неотзывчивых пациентов со скрытым сознанием (NEJM, 2024)" },
        {
          value: "0.31",
          label: "Эмпирический порог сложности PCI*, отделяющий бодрствование от комы"
        },
        {
          value: "6",
          label: "Интерактивных лабораторий: философия, кора мозга и пространство разумов"
        }
      ],
      ctaStart: "Открыть Главу I",
      ctaExplore: "Перейти к лабораториям",
      interactiveHint: "Шесть научных таблиц · Шесть интерактивных опытов · Двуязычное издание EN / RU"
    },
    chapters: [
      {
        id: "ch1",
        num: "I",
        plateId: "01",
        theme: "prism",
        eyebrow: "ГЛАВА I · ФИЛОСОФИЯ СОЗНАНИЯ",
        title: "Почему материя вообще что-то чувствует?",
        lead: "Наука блестяще объясняет структуры, динамику и функции. Сознание сталкивает нас с чем-то иного порядка: с внутренней точкой зрения — переживаемым присутствием, которое ускользает от сведения к шестерням, потенциалам действия или коду.",
        plate: {
          code: "ТАБЛИЦА 01 · ПРИЗМА КВАЛИА",
          title: "Разрыв в объяснении",
          caption: "Фотоны длиной волны 680 нм возбуждают колбочки сетчатки и запускают каскад в зрительной коре — но ни в одном физическом уравнении не записано живое сияние алого.",
          telemetryLabel: "ОНТОЛОГИЧЕСКОЕ НАПРЯЖЕНИЕ",
          telemetryValue: "Структура ↔ Переживание"
        },
        sections: [
          {
            heading: "Каково быть кем-то и трудная проблема сознания",
            body: "В 1974 году Томас Нагель сформулировал классический критерий сознания: организм обладает сознанием тогда и только тогда, когда существует нечто, «каково это — быть» этим организмом. Два десятилетия спустя Дэвид Чалмерс (1995) обострил загадку, отделив «лёгкие проблемы» — объяснение внимания, различения стимулов, памяти и речевого отчёта — от «трудной проблемы сознания»: почему вся эта физическая обработка информации сопровождается субъективным опытом (квалиа), а не протекает «в полной темноте»?",
            callout: "В 2018 году Чалмерс добавил метапроблему сознания: почему физические системы вроде нас вообще склонны считать сознание загадочным? Даже скептики признают, что объяснение самих наших интуиций о тайне — вполне решаемая эмпирическая задача."
          },
          {
            heading: "Комната Мэри, зомби и разрыв в объяснении",
            body: "Три знаменитых мысленных эксперимента обнажают то, что Джозеф Левин (1983) назвал разрывом в объяснении (Explanatory Gap). Фрэнк Джексон (1982) вообразил Мэри — блестящую нейроучёную, выросшую в строго чёрно-белой комнате и знающую все физические факты о цветовом зрении, но всё равно узнающую нечто новое в миг, когда впервые видит спелый красный томат. Аргумент философских зомби заостряет ту же интуицию: молекулярный двойник, ведущий себя точно как вы, но лишённый всякого внутреннего света, представляется логически мыслимым, пусть даже физически невозможным."
          },
          {
            heading: "Пять современных метафизических позиций",
            body: "Сегодня спор философов сознания давно вышел за рамки простого противостояния «дуализма» и «материализма». На переднем крае конкурируют пять позиций: физикализм и вычислительный функционализм отождествляют сознание с информационными процессами мозга; иллюзионизм (Дэниел Деннет, Кит Фрэнкиш) утверждает, что невыразимые квалиа — лишь когнитивная иллюзия несовершенной интроспекции; панпсихизм и космопсихизм (Гален Стросон, Филип Гофф) признают протоопыт фундаментальным свойством материи, сталкиваясь, однако, с проблемой комбинации — как микропереживания сливаются в единый разум; расселловский монизм и дуализм свойств помещают феноменальные качества в скрытую внутреннюю основу физических законов; а энактивизм и 4E-когнитивистика (Франсиско Варела, Эван Томпсон, Альва Ноэ) отвергают «мозг в колбе», видя в сознании воплощённое сенсомоторное сопряжение живого организма со средой."
          }
        ],
        keyCards: [
          {
            tag: "ВЕХА · 1974",
            title: "Субъективный характер опыта",
            detail: "Эхолокация открывает летучей мыши чуждый сенсорный мир, который мы способны описать формулами, но не прожить изнутри.",
            citation: "Nagel (1974), The Philosophical Review"
          },
          {
            tag: "РАЗЛИЧЕНИЕ · 1995 / 2018",
            title: "Трудная и метапроблема",
            detail: "Функциональная модель объясняет поведение; трудная проблема спрашивает, почему существует переживание, а метапроблема — почему оно кажется нам тайной.",
            citation: "Chalmers (1995, 2018)"
          },
          {
            tag: "РАДИКАЛЬНЫЕ ПОЛЮСА",
            title: "Иллюзионизм против панпсихизма",
            detail: "Иллюзионисты растворяют трудную проблему критикой интроспекции; панпсихисты сохраняют квалиа, вплетая их в фундамент физики.",
            citation: "Frankish (2016); Goff (2019)"
          },
          {
            tag: "4E-КОГНИТИВИСТИКА",
            title: "Воплощённый и энактивный ум",
            detail: "Сознание — не картина внутри черепа, а живое действие, которое телесный организм непрерывно разыгрывает во взаимодействии с миром.",
            citation: "Varela, Thompson & Rosch (1991); Noë (2004)"
          }
        ],
        quote: {
          text: "Даже когда мы объясним выполнение всех когнитивных и поведенческих функций в окрестностях опыта, останется ещё один безответный вопрос: почему выполнение этих функций вообще сопровождается переживанием?",
          author: "Дэвид Чалмерс",
          work: "Навстречу проблеме сознания (1995)"
        },
        lab: {
          badge: "ЛАБ. 01 · МЫСЛЕННЫЙ ЭКСПЕРИМЕНТ",
          title: "Комната Мэри: шаг через разрыв в объяснении",
          instruction: "Изучите исчерпывающее научное досье Мэри в её монохромной лаборатории, а затем выйдите вместе с ней в цветной мир и сравните, как пять философских школ трактуют этот момент.",
          modeMono: "Внутри монохромной комнаты",
          modeColor: "Снаружи: первая встреча с красным",
          wavelengthLabel: "Доминирующая длина волны",
          inspectBtn: "Изучить физическое досье",
          exitRoomBtn: "Выйти в цветной мир",
          resetBtn: "Вернуться в монохром",
          monoSpecs: [
            { k: "Спектр фотонов", v: "Длинноволновое излучение 650–700 нм" },
            { k: "Ретинальный код", v: "Пик L-колбочек ~560 нм; оппонентность L−M" },
            { k: "Корковый каскад", v: "Парвоцеллюлярное ЛКТ → V1-блобы → V4" },
            { k: "Семантика и отклик", v: "Лексема «красный» + профиль вегетативного тонуса" }
          ],
          philosophies: [
            {
              id: "physicalism",
              name: "Физикализм / Функционализм",
              verdict: "Новый способ доступа, а не новая сущность",
              explanation: "Мэри приобретает новое феноменальное понятие или практический навык распознавания — маршрут от первого лица к тому же самому физическому состоянию мозга, которое она уже знала из физики."
            },
            {
              id: "illusionism",
              name: "Иллюзионизм (Деннет, Фрэнкиш)",
              verdict: "Интроспективная пользовательская иллюзия",
              explanation: "Мэри не открывает никаких нефизических квалиа: её изумление вызвано тем, что упрощённая система самонаблюдения маркирует сложнейшую нейронную дискриминацию как «невыразимое качество»."
            },
            {
              id: "panpsychism",
              name: "Панпсихизм / Космопсихизм",
              verdict: "Прямое касание внутренней природы",
              explanation: "Физика описывает лишь математические отношения между частицами. Выйдя наружу, Мэри встречает внутреннее переживаемое качество материи — однако панпсихизму ещё предстоит решить проблему комбинации."
            },
            {
              id: "russellian",
              name: "Расселловский монизм / Дуализм свойств",
              verdict: "Несводимый феноменальный факт",
              explanation: "Структурные уравнения опускают категориальную, переживаемую основу физических диспозиций. Мэри узнаёт подлинный факт о реальности, который невозможно дедуцировать из одной механики."
            },
            {
              id: "enactivism",
              name: "Энактивизм / 4E-когнитивистика",
              verdict: "Воплощённое сенсомоторное овладение",
              explanation: "Видеть красное — не значит считывать картинку в черепе. За порогом комнаты движения глаз, смена освещения и живое тело Мэри осваивают качественно новый сенсомоторный навык."
            }
          ]
        }
      },
      {
        id: "ch2",
        num: "II",
        plateId: "02",
        theme: "cortex",
        eyebrow: "ГЛАВА II · НЕЙРОНАУКА СОЗНАНИЯ",
        title: "Пять карт сознающей коры",
        lead: "Пока философы спорят о природе реальности, нейроучёные ищут физические механизмы, благодаря которым бессознательный нервный импульс внезапно вспыхивает живым осознанием.",
        plate: {
          code: "ТАБЛИЦА 02 · КОРКОВЫЕ АРХИТЕКТУРЫ",
          title: "Конкурирующие нейронные сигнатуры",
          caption: "Загорается ли осознание в лобно-теменной сети глобального вещания, кристаллизуется в задней «горячей зоне» или рождается в нисходящих прогнозах и метарепрезентациях?",
          telemetryLabel: "АКТИВНЫЕ ПАРАДИГМЫ",
          telemetryValue: "GNWT · IIT 4.0 · PP · HOT · RPT · AST"
        },
        sections: [
          {
            heading: "Глобальное воспламенение против внутренней интеграции",
            body: "На экспериментальной арене лидируют две флагманские концепции. Теория глобального нейронного рабочего пространства (GNWT — Бернард Баарс, Станислас Деан, Жан-Пьер Шанжё) утверждает, что сигнал становится осознанным, преодолев порог нелинейного «глобального воспламенения» и распространившись по лобно-теменным узлам для памяти, решения и речевого отчёта. Теория интегрированной информации (IIT 4.0 — Джулио Тонони, Ларисса Альбантакис, Кристоф Кох; PLOS Computational Biology, 2023) идёт обратным путём — от нулевой аксиомы существования и пяти феноменологических аксиом опыта к физическим постулатам, отождествляя сознание с несводимой внутренне причинной структурой (Φ), чей максимум предполагается в задней височно-теменно-затылочной «горячей зоне»."
          },
          {
            heading: "Конфликт вокруг IIT (2023–2025): наука или метафизика?",
            body: "В сентябре 2023 года открытое письмо более 124 исследователей резко назвало IIT «псевдонаукой», указав на эмпирическую нефальсифицируемость её ядра и панпсихистские следствия вроде приписывания зачатков опыта простым решёткам логических вентилей. В апреле 2025 года полемика вышла на страницы рецензируемого журнала Nature Neuroscience: критики (коллектив «IIT-Concerned», включая Стивена Флеминга и Хаквана Лау) отстаивали критерии проверяемости в статье «Что делает теорию сознания ненаучной?», а Тонони, Кох, Массимини и соавторы ответили работой «Сознание или псевдосознание? Столкновение двух парадигм», защищая клиническую продуктивность и математическую строгость феноменологического подхода.",
            callout: "Взвешенный взгляд фиксирует обе стороны спора: IIT вдохновила прорывные клинические метрики сложности (PCI) и проверяемые прогнозы для задней коры, но точный расчёт Φ для человеческого мозга вычислительно недоступен, оставляя глубинные постулаты теории предметом острейшей критики."
          },
          {
            heading: "За пределами дуэли: иерархии, петли и схемы внимания",
            body: "Современная нейронаука сознания не сводится к двум теориям. Предиктивная обработка и активный вывод (Карл Фристон, Анил Сет) рассматривают мозг как иерархическую машину предсказаний, укоренённую в регуляции тела. Теории высших порядков (HOT — Дэвид Розенталь, Хакван Лау, Ричард Браун) утверждают, что сенсорное состояние осознаётся лишь тогда, когда префронтальная метарепрезентация оценивает его надёжность. Теория рекуррентной обработки (RPT — Виктор Ламме) полагает, что локальных обратных связей внутри сенсорной коры уже достаточно для богатого феноменального зрения, а теория схемы внимания (AST — Майкл Грациано) описывает сознание как упрощённую внутреннюю модель, которой мозг отслеживает собственное внимание."
          }
        ],
        keyCards: [
          {
            tag: "ГЛОБАЛЬНОЕ ВЕЩАНИЕ",
            title: "GNWT (Деан и Шанжё)",
            detail: "Префронтальные и теменные ассоциативные хабы транслируют отобранный сенсорный сигнал в общее рабочее пространство памяти и отчёта.",
            citation: "Dehaene & Changeux (2011), Neuron"
          },
          {
            tag: "ПРИЧИННАЯ ИНТЕГРАЦИЯ",
            title: "IIT 4.0 (Тонони, Альбантакис, Кох)",
            detail: "Формализует феноменальное существование как интегрированную информацию (Φ), локализуя её субстрат прежде всего в задней коре.",
            citation: "Albantakis et al. (2023), PLOS Comp Biol"
          },
          {
            tag: "ДИСКУССИЯ · АПРЕЛЬ 2025",
            title: "Спор о научности IIT",
            detail: "Критики указывают на непроверяемость базовых постулатов и завышенные медийные трактовки; защитники апеллируют к тестам и клиническим плодам.",
            citation: "Nature Neuroscience (апрель 2025)"
          },
          {
            tag: "МЕТАПОЗНАНИЕ И СХЕМЫ",
            title: "HOT, RPT и схема внимания (AST)",
            detail: "Альтернативные модели связывают осознание с префронтальным мониторингом реальности (HOT), локальной рекуррентностью (RPT) или моделью контроля внимания (AST).",
            citation: "Lau (2022); Lamme (2020); Graziano (2019)"
          }
        ],
        quote: {
          text: "Сознание не прячется в одном-единственном бугорке коры: главный спор сегодня идёт о том, требует ли осознанность глобального исполнительного вещания, внутренней причинной целостности или самоконтролируемого вывода.",
          author: "Современный синтез",
          work: "Нейронаука сознания · Обзор парадигм 2025"
        },
        lab: {
          badge: "ЛАБ. 02 · АТЛАС КОРКОВЫХ МЕХАНИЗМОВ",
          title: "Сравните пять ведущих нейротеорий",
          instruction: "Выберите теорию, чтобы подсветить её предполагаемый корковый субстрат, ключевой механизм, анатомический фокус и главную научную критику.",
          theories: [
            {
              id: "gnwt",
              short: "GNWT",
              name: "Теория глобального нейронного рабочего пространства",
              founders: "Бернард Баарс, Станислас Деан, Жан-Пьер Шанжё",
              mechanism: "Нелинейное «глобальное воспламенение» (~250–300 мс) рассылает сенсорный сигнал по длинным лобно-теменным аксонам, делая его доступным для памяти, решений и речи.",
              hotspot: "Дорсолатеральная префронтальная, передняя поясная и задняя теменная кора",
              critique: "Трудно отделить само феноменальное переживание от постперцептивного когнитивного доступа, рабочей памяти и подготовки двигательного отчёта.",
              activeRegions: ["pfc", "parietal", "temporal", "occipital"]
            },
            {
              id: "iit",
              short: "IIT 4.0",
              name: "Теория интегрированной информации 4.0",
              founders: "Джулио Тонони, Ларисса Альбантакис, Кристоф Кох",
              mechanism: "Сознание тождественно максимально несводимой причинно-следственной структуре (Φ), объединяющей богатство состояний (дифференциацию) с их связностью (интеграцией).",
              hotspot: "Задняя корковая «горячая зона» (височно-теменно-затылочный стык)",
              critique: "Точное значение Φ вычислительно неразрешимо для живого мозга; критики считают, что её панпсихистское ядро ускользает от прямой фальсификации.",
              activeRegions: ["occipital", "temporal", "parietal"]
            },
            {
              id: "pp",
              short: "PP / AI",
              name: "Предиктивная обработка и активный вывод",
              founders: "Карл Фристон, Энди Кларк, Анил Сет",
              mechanism: "Иерархические генеративные модели непрерывно прогнозируют внешние и телесные сигналы; содержание сознания — наилучшая взвешенная по точности гипотеза мозга.",
              hotspot: "Корковая иерархия, таламокортикальные петли и передняя островковая доля",
              critique: "Блестяще объясняет динамику восприятия, но сама по себе не задаёт чёткой границы между осознанными и бессознательными предиктивными циклами.",
              activeRegions: ["pfc", "insula", "occipital", "temporal", "thalamus"]
            },
            {
              id: "hot",
              short: "HOT",
              name: "Теории высших порядков",
              founders: "Дэвид Розенталь, Хакван Лау, Ричард Браун",
              mechanism: "Первичная сенсорная репрезентация остаётся бессознательной, пока префронтальная метарепрезентация высшего порядка не индексирует её как надёжный сигнал.",
              hotspot: "Префронтальная кора (преимущественно передняя и дорсолатеральная ПФК)",
              critique: "Сталкивается с вызовами в ситуациях яркого опыта при слабом участии лобных долей — во сне, у младенцев или при очаговых поражениях ПФК.",
              activeRegions: ["pfc", "parietal", "occipital"]
            },
            {
              id: "rpt",
              short: "RPT",
              name: "Теория рекуррентной обработки",
              founders: "Виктор Ламме",
              mechanism: "Первая восходящая волна остаётся бессознательной; локальные горизонтальные и нисходящие обратные связи в сенсорной коре связывают признаки в феноменальный образ.",
              hotspot: "Затылочная и вентротемпоральная зрительная иерархия (петли V1–V4, IT)",
              critique: "Методологически крайне сложно доказать «феноменальный избыток» без опоры на когнитивный доступ и вербальный отчёт испытуемого.",
              activeRegions: ["occipital", "temporal"]
            }
          ]
        }
      },
      {
        id: "ch3",
        num: "III",
        plateId: "03",
        theme: "clash",
        eyebrow: "ГЛАВА III · СОСТЯЗАТЕЛЬНАЯ НАУКА",
        title: "COGITATE: когда теории встречаются в томографе",
        lead: "Десятилетиями конкурирующие теории сознания говорили на разных языках и ставили несопоставимые опыты. В апреле 2025 года в Nature вышли итоги беспрецедентного научного перемирия — состязательной коллаборации, поставившей IIT и GNWT в один и тот же эксперимент.",
        plate: {
          code: "ТАБЛИЦА 03 · NATURE · АПРЕЛЬ 2025",
          title: "Протокол состязательной проверки",
          caption: "256 испытуемых в международных лабораториях, обследованных по единому пререгистрированному зрительному протоколу в трёх когортах — методами фМРТ, МЭГ и внутричерепной ЭЭГ, — вынесли отрезвляющий вердикт: ни один из гигантов не вышел без пробоин.",
          telemetryLabel: "КОНСОРЦИУМ COGITATE",
          telemetryValue: "256 участников · 3 метода · Пререгистрация"
        },
        sections: [
          {
            heading: "Архитектура состязательного испытания",
            body: "При поддержке программы ARC благотворительного фонда Templeton World Charity Foundation теоретически нейтральный консорциум Cogitate совместно со Станисласом Деаном (GNWT) и Джулио Тонони (IIT) заранее зафиксировал протокол и критерии успеха до начала сбора данных. Осознаваемое восприятие стимулов (лиц, предметов, букв и псевдошрифтов разной длительности) отделили от необходимости немедленно нажимать кнопку, чтобы не спутать нейронный след видения с моторным отчётом."
          },
          {
            heading: "Неоднозначный вердикт: удары по обеим теориям",
            body: "Публикация в Nature (апрель 2025) разрушила простые учебные схемы. Содержание и длительность осознанного стимула надёжно декодировались в задней зрительной и вентротемпоральной коре — в пользу пространственного акцента IIT, тогда как в нижней лобной коре декодирование оказалось ограниченным и не считывало ориентацию образа. Но и IIT понесла серьёзный урон: предсказанная ею устойчивая содержательная функциональная синхронизация внутри задней коры в основном не подтвердилась. В свою очередь, GNWT получила ощутимый удар там, где ожидала коронный эффект: мощное лобно-теменное «воспламенение» в момент исчезновения стимула (offset ignition) так и не возникло.",
            callout: "В COGITATE не оказалось единоличного «победителя». Главный триумф проекта в другом: пререгистрированная состязательная наука доказала, что способна фальсифицировать заветные предсказания ведущих теорий и вынуждать их к пересмотру."
          },
          {
            heading: "После COGITATE: INTREPID и поворот 2025–2026 годов",
            body: "Эстафету приняла новая волна состязательных коллабораций, прежде всего проект INTREPID — прямой поединок IIT (Тонони) с активным выводом Карла Фристона и нейрорепрезентационализмом Сириеля Пеннарца на людях и грызунах. В 2025–2026 годах всё отчётливее заметен сдвиг парадигмы: исследователи уходят от монолитных теорий «одного универсального механизма» к многомерным моделям, объясняющим совместную работу заднего сенсорного содержания, лобного доступа и телесного вывода."
          }
        ],
        keyCards: [
          {
            tag: "МУЛЬТИМОДАЛЬНЫЙ МАСШТАБ",
            title: "256 участников · 3 метода",
            detail: "Сочетание пространственной точности фМРТ, миллисекундной МЭГ и прямой интракраниальной ЭЭГ (иЭЭГ) в независимых центрах устранило слепые зоны отдельных методик.",
            citation: "Cogitate Consortium (2025), Nature"
          },
          {
            tag: "УДАР ПО IIT",
            title: "Недостающая задняя синхронизация",
            detail: "Хотя задняя кора устойчиво кодировала видимый образ, предсказанная длительная функциональная синхронизация между её зонами не подтвердилась.",
            citation: "Ferrante, Melloni et al. (2025), Nature"
          },
          {
            tag: "УДАР ПО GNWT",
            title: "Отсутствие вспышки при исчезновении",
            detail: "Ожидаемое лобно-теменное «воспламенение» при выключении стимула в целом не наблюдалось, а ПФК слабо кодировала ориентацию объекта.",
            citation: "Cogitate Consortium (2025), Nature"
          },
          {
            tag: "СЛЕДУЮЩАЯ ВОЛНА · 2025–2026",
            title: "Коллаборация INTREPID",
            detail: "Сталкивает IIT напрямую с активным выводом (Фристон) и нейрорепрезентационализмом (Пеннарц), проверяя роль действия и прогноза в осознании.",
            citation: "TWCF ARC · INTREPID Consortium"
          }
        ],
        quote: {
          text: "Состязательная коллаборация не коронует окончательного победителя за один день; её истинная победа в том, что самые смелые теории вынуждены отвечать природе по правилам, которые никто не сможет переписать постфактум.",
          author: "Синтез состязательной науки",
          work: "По мотивам Melloni и Cogitate Consortium (Nature, 2025)"
        },
        lab: {
          badge: "ЛАБ. 03 · АУДИТ COGITATE (NATURE, 2025)",
          title: "Разбор пререгистрированных предсказаний",
          instruction: "Пройдитесь по трём ключевым тестам из апрельской статьи в Nature (2025) и сравните прогнозы IIT и GNWT с фактическими мультимодальными данными.",
          subtitle: "Пререгистрированная состязательная коллаборация · Нейтральная проверка",
          modalities: ["фМРТ", "МЭГ", "иЭЭГ"],
          tests: [
            {
              id: "decoding",
              title: "1. Локализация и длительное декодирование содержания",
              iitPred: "Категория, ориентация и длительность осознанного стимула непрерывно декодируются в задней зрительной и вентротемпоральной коре («горячей зоне»).",
              gnwtPred: "Осознанное содержание транслируется в префронтальные и теменные узлы рабочего пространства и надёжно считывается из них по всем ключевым признакам.",
              finding: "Задние зрительные и вентротемпоральные области устойчиво кодировали категорию, ориентацию и длительность. В нижней лобной коре декодировалась лишь часть категорий без надёжного кода ориентации.",
              verdictIit: "supported",
              verdictGnwt: "partial",
              verdictLabelIit: "Подтверждено",
              verdictLabelGnwt: "Частично / Ограниченно",
              detail: "По совокупности фМРТ, МЭГ и иЭЭГ задняя сенсорно-ассоциативная кора точно отслеживала и сам образ, и время его показа, тогда как лобный отклик оказался узким и слепым к ориентации."
            },
            {
              id: "synchrony",
              title: "2. Устойчивая синхронизация в задней коре",
              iitPred: "Устойчивая содержательная функциональная связность и синхронизация должны связывать ранние зрительные зоны с вентротемпоральной корой на всём протяжении показа.",
              gnwtPred: "Кратковременная прямая и обратная связь должна временно соединять сенсорные области с лобно-теменным рабочим пространством в момент воспламенения.",
              finding: "Предсказанная длительная внутризадняя синхронизация осознанного содержания в целом не подтвердилась; выявлялись лишь краткие ранние связи между зрительными и лобными участками.",
              verdictIit: "challenged",
              verdictGnwt: "partial",
              verdictLabelIit: "Оспорено",
              verdictLabelGnwt: "Неоднозначно",
              detail: "Это стало самым болезненным эмпирическим ударом для IIT: задняя кора действительно хранила информацию об образе, но предсказанного устойчивого синхронного связывания между её узлами не возникло."
            },
            {
              id: "ignition",
              title: "3. Глобальное воспламенение при исчезновении стимула",
              iitPred: "Нейронная активность задней коры непрерывно сопровождает наличие стимула и плавно угасает при его исчезновении без отдельной лобной вспышки.",
              gnwtPred: "Как появление, так и исчезновение стимула должно вызывать выраженное лобно-теменное «воспламенение», обновляющее глобальное рабочее пространство.",
              finding: "Отклик на появление стимула фиксировался широко, но характерное лобно-теменное «воспламенение» при исчезновении образа (offset ignition) в МЭГ и иЭЭГ в основном не проявилось.",
              verdictIit: "partial",
              verdictGnwt: "challenged",
              verdictLabelIit: "Частично согласуется",
              verdictLabelGnwt: "Оспорено",
              detail: "Отсутствие выраженной вспышки при исчезновении стимула напрямую поставило под вопрос ключевую динамику обновления рабочего пространства в GNWT."
            }
          ]
        }
      },
      {
        id: "ch4",
        num: "IV",
        plateId: "04",
        theme: "mirror",
        eyebrow: "ГЛАВА IV · ПРЕДИКТИВНАЯ ОБРАБОТКА",
        title: "Контролируемая галлюцинация и «зверь-машина»",
        lead: "Запертый в тёмной и безмолвной черепной коробке, мозг никогда не касается внешнего мира напрямую. Он выживает, непрерывно угадывая скрытые причины сенсорных импульсов — и сверяя свои догадки с потоком ошибок.",
        plate: {
          code: "ТАБЛИЦА 04 · МАШИНА ВЫВОДА",
          title: "Нисходящие приоры и ошибка предсказания",
          caption: "Восприятие — не пассивная фотосъёмка извне внутрь, а генеративный прогноз изнутри наружу, дисциплинированный взвешенным по точности сенсорным удивлением.",
          telemetryLabel: "МИНИМИЗАЦИЯ СВОБОДНОЙ ЭНЕРГИИ",
          telemetryValue: "Приор × Точность ↔ Ошибка прогноза"
        },
        sections: [
          {
            heading: "Восприятие изнутри наружу и взвешивание точности",
            body: "В парадигме предиктивной обработки и принципа свободной энергии Карла Фристона высшие уровни коры постоянно посылают вниз прогнозы, а сенсорные пути возвращают наверх лишь расхождение — ошибку предсказания. Решающую роль играет оценка «точности» (precision weighting): насколько надёжен сигнал прямо сейчас. В густом тумане сенсорный ввод зашумлён, и верх берут ожидания; при ясном дневном свете точные ошибки мгновенно исправляют ложные догадки."
          },
          {
            heading: "Контролируемая галлюцинация",
            body: "Нейроучёный Анил Сет называет обычное осознанное восприятие «контролируемой галлюцинацией» — наилучшей догадкой мозга, удерживаемой на коротком поводке сенсорными сигналами. Стоит весу точности чрезмерно сместиться к нисходящим приорам — и мы видим лица в облаках или слышим голоса в шуме; стоит приорам ослабнуть — и привычные предметы распадаются на сырой сенсорный хаос. Переживаемая реальность — это живой компромисс, а не прозрачное окно.",
            callout: "Галлюцинация — это неконтролируемое восприятие, а нормальное восприятие — лишь галлюцинация, непрерывно подотчётная внешней и телесной обратной связи."
          },
          {
            heading: "«Зверь-машина»: зачем сознанию живое тело",
            body: "В книге «Быть собой» (Being You, 2021) Сет обращает предиктивный вывод внутрь — к интероцепции, постоянной регуляции пульса, давления, глюкозы, дыхания и иммунного баланса. Вопреки кремниевым метафорам разума как абстрактного софта, гипотеза «зверя-машины» (Beast Machine) утверждает: переживание собственного «Я» возникло в эволюции не для решения теорем, а ради поддержания жизни хрупкого биологического тела. Эмоции, настроение и само чувство существования — это интероцептивные прогнозы, служащие физиологическому выживанию (аллостазу)."
          }
        ],
        keyCards: [
          {
            tag: "БАЙЕСОВСКАЯ КОРА",
            title: "Взвешивание точности",
            detail: "Регуляторы усиления определяют, доверять ли ожиданиям или восходящему удивлению — управляя вниманием, иллюзиями и обновлением убеждений.",
            citation: "Friston (2010), Nature Reviews Neuroscience"
          },
          {
            tag: "РЕАЛИЗМ ВОСПРИЯТИЯ",
            title: "Контролируемая галлюцинация",
            detail: "Зрительные и слуховые миры — это нисходящие генеративные модели, сдерживаемые ошибками предсказания, а не попиксельное считывание мира.",
            citation: "Seth (2021), Being You"
          },
          {
            tag: "ИНТЕРОЦЕПЦИЯ",
            title: "Гипотеза «зверя-машины»",
            detail: "Телесная самость укоренена в предиктивном управлении внутренней физиологией (передняя островковая доля и вегетативные контуры).",
            citation: "Seth & Tsakiris (2018), Trends Cogn Sci"
          },
          {
            tag: "АКТИВНЫЙ ВЫВОД",
            title: "Действие замыкает петлю",
            detail: "Мы снижаем ошибку прогноза не только меняя убеждения, но и двигая глазами и телом, чтобы добывать данные или подстраивать мир под модель.",
            citation: "Parr, Pezzulo & Friston (2022)"
          }
        ],
        quote: {
          text: "Мы не просто пассивно воспринимаем мир — мы активно его порождаем. Ощущаемая нами реальность складывается изнутри наружу не в меньшей, а порой и в большей степени, чем снаружи внутрь.",
          author: "Анил Сет",
          work: "Быть собой: новая наука о сознании (2021)"
        },
        lab: {
          badge: "ЛАБ. 04 · РЕГУЛЯТОР БАЙЕСОВСКОГО ВОСПРИЯТИЯ",
          title: "Баланс приоров и сенсорного шума",
          instruction: "Изменяйте точность нисходящих приоров и уровень сенсорного шума — или включите готовый режим — чтобы увидеть, как реальность стабилизируется, переходит в парейдолию или раскрывается при ослаблении жёстких убеждений.",
          priorLabel: "Точность нисходящих приоров",
          noiseLabel: "Сенсорный шум / неопределённость",
          presets: [
            {
              id: "chaos",
              name: "Сенсорный хаос",
              prior: 18,
              noise: 86,
              stateTitle: "Неоткалиброванная ошибка прогноза",
              stateDesc: "Слабые приоры не способны упорядочить шумный поток импульсов. Контуры не связываются в целостные предметы, оставляя сознание в сырой мозаике помех."
            },
            {
              id: "balanced",
              name: "Контролируемая галлюцинация",
              prior: 62,
              noise: 28,
              stateTitle: "Устойчивый захват реальности",
              stateDesc: "Генеративные ожидания точно согласованы с чистым сенсорным сигналом. Ошибки мгновенно уточняют модель, рождая ясное повседневное восприятие."
            },
            {
              id: "illusion",
              name: "Диктат приоров",
              prior: 92,
              noise: 74,
              stateTitle: "Парейдолия и жёсткое ожидание",
              stateDesc: "Сверхточные нисходящие приоры подавляют неясный ввод, вылепливая иллюзорные образы, лица или непоколебимые толкования прямо из шума."
            },
            {
              id: "rebus",
              name: "REBUS / Ослабление приоров",
              prior: 26,
              noise: 42,
              stateTitle: "Анархичное и текучее восприятие",
              stateDesc: "В психоделическом режиме REBUS (Кархарт-Харрис и Фристон) верхние приоры ослабляют хватку, пропуская в осознание богатый поток сенсорных и телесных сигналов."
            }
          ]
        }
      },
      {
        id: "ch5",
        num: "V",
        plateId: "05",
        theme: "pulse",
        eyebrow: "ГЛАВА V · СОСТОЯНИЯ И КЛИНИЧЕСКИЕ БИОМАРКЕРЫ",
        title: "Измеряя невидимую искру",
        lead: "Человек может лежать неподвижно с закрытыми глазами и при этом населять яркий внутренний мир — в фазе быстрого сна, под кетамином или после тяжёлой травмы мозга. Клиническая нейронаука наконец создала приборы, улавливающие осознанность без единого движения мышц.",
        plate: {
          code: "ТАБЛИЦА 05 · КЛИНИЧЕСКИЕ БИОМАРКЕРЫ",
          title: "Сложность «Zap-and-Zip» и скрытый разум",
          caption: "Когда мягкий магнитный импульс касается коры, сознающий мозг откликается сложной многоголосой симфонией; бессознательная кора отвечает глухим локальным эхом.",
          telemetryLabel: "КЛИНИЧЕСКИЙ ПОРОГ",
          telemetryValue: "PCI* = 0.31 · 25% скрытого сознания (CMD)"
        },
        sections: [
          {
            heading: "Скрытое сознание: прорыв NEJM (август 2024)",
            body: "Десятилетиями состояние пациентов с тяжёлыми поражениями мозга оценивали у постели по внешним реакциям: сжать руку, проследить взглядом за зеркалом. В августе 2024 года знаковое шестицентровое исследование в The New England Journal of Medicine (Елена Бодиен, Николас Шифф, Брайан Эдлоу и соавторы) обследовало 241 поведенчески неотзывчивого пациента методами фМРТ и ЭЭГ. Ровно 25% — 60 из 241 пациента — скрыто выполняли сложные устные команды вроде «представьте, что играете в теннис», демонстрируя когнитивно-моторную диссоциацию (CMD): сохранный разум за стеной парализованного вывода.",
            callout: "Каждый четвёртый поведенчески неотзывчивый пациент с тяжёлым поражением мозга обнаружил скрытое понимание команд по данным фМРТ и ЭЭГ — что требует срочного этического переосмысления нейрореанимации."
          },
          {
            heading: "«Zap-and-Zip»: индекс пертурбационной сложности (PCI)",
            body: "Поскольку задания на воображение всё ещё требуют внимания и понимания речи, Марчелло Массимини и Аденауэр Казали разработали независимый от команд измеритель сознания — индекс пертурбационной сложности (PCI). Короткий импульс транскраниальной магнитной стимуляции (ТМС) возмущает кору, а плотная ЭЭГ записывает распространение отклика, алгоритмическая сжимаемость которого («zip») оценивает его пространственно-временную сложность. По сотням наблюдений эмпирический порог PCI* = 0.31 отделяет бессознательные состояния (глубокий медленный сон NREM N3, наркоз пропофолом, кома; PCI ≤ 0.31) от осознанных (бодрствование, сновидения REM, кетаминовая диссоциация, состояние минимального сознания; PCI > 0.31)."
          },
          {
            heading: "Осознанные сны, энтропийный мозг и чистое осознавание",
            body: "Изменённые состояния раскрывают грани сознания, скрытые в обыденном бодрствовании. В 2021 году Карен Конколи с коллегами осуществила двустороннюю связь в реальном времени с людьми в осознанном REM-сне: спящие решали устные арифметические задачи и отвечали заранее условленными движениями глаз. Модели REBUS и «Энтропийного мозга» Робина Кархарт-Харриса и Карла Фристона показывают, как серотонинергические психоделики повышают разнообразие нейронных сигналов и ослабляют жёсткие эго-приоры. А философ Томас Метцингер в монографии «Слон и слепец» (MIT Press, 2024) проанализировал более 500 отчётов о минимальном феноменальном опыте (MPE) — «чистом осознавании» без мыслей, телесных границ и нарративного «Я», нащупывая самый нижний этаж сознания."
          }
        ],
        keyCards: [
          {
            tag: "NEJM · АВГУСТ 2024",
            title: "25% скрытого сознания",
            detail: "60 из 241 поведенчески неотзывчивого пациента показали когнитивно-моторную диссоциацию на фМРТ/ЭЭГ при мысленном выполнении команд.",
            citation: "Bodien, Schiff, Edlow et al. (2024), NEJM"
          },
          {
            tag: "БИОМАРКЕР · PCI* = 0.31",
            title: "ТМС-ЭЭГ «Zap-and-Zip»",
            detail: "Измеряет совместную интеграцию и дифференциацию коры прямо по эху возмущения — без опоры на органы чувств или двигательный отчёт.",
            citation: "Casali et al. (2013); Casarotto et al. (2016)"
          },
          {
            tag: "REM-ДИАЛОГ И REBUS",
            title: "Активные внутренние миры",
            detail: "Двусторонняя связь в осознанном сне (Konkoly, 2021) и рост нейронной энтропии под психоделиками показывают сознание в отрыве от внешнего действия.",
            citation: "Konkoly et al. (2021); Carhart-Harris & Friston (2019)"
          },
          {
            tag: "МИНИМАЛЬНЫЙ ОПЫТ · 2024",
            title: "Чистое осознавание (MPE)",
            detail: "Более 500 свидетельств фиксируют бодрствующее присутствие без объектов и эго — эмпирический ключ к простейшей форме сознания.",
            citation: "Metzinger (2024), MIT Press"
          }
        ],
        quote: {
          text: "Отсутствие поведенческих признаков сознания не является доказательством отсутствия самого сознания. Безмолвное тело всё ещё может укрывать внимательный, слушающий разум.",
          author: "Синтез клинической нейронауки",
          work: "По итогам Bodien, Schiff, Edlow et al. (NEJM, 2024)"
        },
        lab: {
          badge: "ЛАБ. 05 · СИМУЛЯТОР ТМС-ЭЭГ «ZAP-AND-ZIP»",
          title: "Измерьте корковую сложность в шести состояниях",
          instruction: "Выберите состояние мозга и подайте модельный ТМС-импульс, чтобы проследить распространение волны по коре и проверить, превышает ли индекс пертурбационной сложности порог PCI* = 0.31.",
          zapBtn: "Подать ТМС-импульс (Zap & Zip)",
          thresholdLabel: "Эмпирический порог PCI* = 0.31",
          metricComplexity: "Индекс сложности (PCI)",
          metricState: "Классификация состояния",
          states: [
            {
              id: "awake",
              name: "Ясное бодрствование",
              pci: 0.56,
              conscious: true,
              statusLabel: "Сознание · Высокая сложность",
              wavePattern: "complex-distributed",
              desc: "ТМС-импульс запускает богатый, дальнодействующий каскад различающихся волн по удалённым узлам коры — высокая интеграция в сочетании с информационным разнообразием."
            },
            {
              id: "rem",
              name: "Сновидения (REM-сон)",
              pci: 0.44,
              conscious: true,
              statusLabel: "Сознание · Яркий внутренний мир",
              wavePattern: "vivid-internal",
              desc: "Несмотря на мышечную атонию и закрытые глаза, видящая сны кора сохраняет сложную внутреннюю интеграцию и уверенно держится выше порога 0.31."
            },
            {
              id: "ketamine",
              name: "Кетаминовая диссоциация",
              pci: 0.48,
              conscious: true,
              statusLabel: "Сознание · Внешняя неотзывчивость",
              wavePattern: "dissociated-rich",
              desc: "Внешне пациент выглядит обездвиженным под наркозом, однако Сарассо с соавторами (2015) зафиксировали высокий PCI, соответствующий интенсивным сновидческим переживаниям."
            },
            {
              id: "psilocybin",
              name: "Психоделическое состояние (псилоцибин)",
              pci: 0.55,
              conscious: true,
              statusLabel: "Сознание · Плато PCI / Повышенная энтропия",
              wavePattern: "entropic-cascade",
              desc: "Показательная эмпирическая диссоциация: Орт, Фолленвайдер, Сарассо, Массимини и соавторы (2023, iScience) установили, что вызванный ТМС индекс PCI под псилоцибином остаётся на уровне плато бодрствования (~0.55), тогда как спонтанная сложность Лемпеля–Зива в покое возрастает (Schartner et al., 2017) в режиме ослабленных приоров REBUS."
            },
            {
              id: "nrem",
              name: "Глубокий медленный сон (NREM N3)",
              pci: 0.23,
              conscious: false,
              statusLabel: "Без сознания · Бистабильный спад",
              wavePattern: "slow-stereotyped",
              desc: "Возмущение вызывает крупную стереотипную медленную волну с последующим периодом молчания нейронов («off-period»), обрывая причинные цепи и снижая PCI ниже 0.31."
            },
            {
              id: "propofol",
              name: "Наркоз пропофолом",
              pci: 0.19,
              conscious: false,
              statusLabel: "Без сознания · Локальное затухание",
              wavePattern: "local-damped",
              desc: "Эффективная связность коры распадается: ТМС-импульс остаётся запертым вблизи точки стимуляции и быстро гаснет, давая низкую алгоритмическую сложность."
            }
          ]
        }
      },
      {
        id: "ch6",
        num: "VI",
        plateId: "06",
        theme: "horizon",
        eyebrow: "ГЛАВА VI · ЗА ПРЕДЕЛАМИ ЧЕЛОВЕЧЕСКОГО ЧЕРЕПА",
        title: "Расширяющийся горизонт иных разумов",
        lead: "Человеческое сознание — лишь одна точка в огромном многомерном пространстве возможных разумов. На коралловых рифах, в птичьем небе, в выращенных церебральных органоидах и в недрах передового ИИ наука задаёт неотложный вопрос: где ещё вспыхивает внутренний свет?",
        plate: {
          code: "ТАБЛИЦА 06 · ПРОСТРАНСТВО РАЗУМОВ",
          title: "Многомерная картография чувственности",
          caption: "Сознание — не единая лестница, ведущая к человеку, а ландшафт несхожих эволюционных и архитектурных профилей.",
          telemetryLabel: "ЭТИЧЕСКИЙ РУБЕЖ",
          telemetryValue: "Нью-Йоркская декларация 2024 · ИИ-индикаторы 2025"
        },
        sections: [
          {
            heading: "Нью-Йоркская декларация о сознании животных (2024)",
            body: "В апреле 2024 года ведущие философы и биологи — Кристин Эндрюс, Джонатан Бёрч, Джефф Себо, Дэвид Чалмерс и сотни подписантов — опубликовали Нью-Йоркскую декларацию о сознании животных. Документ фиксирует исторический консенсус: существует веская научная поддержка наличия сознательного опыта у млекопитающих и птиц, а также «реалистичная вероятность» сознания у всех прочих позвоночных (рептилий, амфибий, рыб) и многих беспозвоночных, включая головоногих (осьминогов, каракатиц), десятиногих ракообразных (крабов, омаров) и насекомых (пчёл, мух).",
            callout: "Доказательства больше не привязаны к человеческому неокортексу: у ворон найдены одиночные нейроны субъективного зрительного восприятия, осьминоги берегут раненые щупальца и избегают болевых камер, а шмели катают шарики в игре и взвешивают боль против награды."
          },
          {
            heading: "Церебральные органоиды: ткань без мира?",
            body: "Миллиметровые человеческие церебральные органоиды, выращенные из стволовых клеток, уже генерируют спонтанные электрические осцилляции, отдалённо напоминающие ранние фетальные паттерны. Однако научный консенсус подчёркивает, насколько далеки современные органоиды от подлинной чувственности: у них нет сосудистой сети, зрелых дальнодействующих связей, таламокортикальных петель, телесной интероцепции и сенсомоторного контакта со средой. Тем не менее биоэтики заранее разрабатывают критерии мониторинга на случай появления более сложных «ассемблоидов»."
          },
          {
            heading: "Сознание ИИ: глубокие индикаторы вместо речевой мимикрии",
            body: "Большие языковые модели беседуют с обезоруживающей теплотой и при соответствующем запросе заявляют о внутренних чувствах — но беглость речи служит крайне ненадёжным признаком субъективного опыта. В программном исследовании Патрика Батлина, Роберта Лонга, Тима Бейна, Йошуа Бенжио, Джонатана Бёрча, Дэвида Чалмерса и коллег (развёрнутом в Trends in Cognitive Sciences, 2025, наряду с «Принципами ответственного исследования сознания ИИ») предложен «индикаторный подход»: аудит внутренней архитектуры на наличие рекуррентной обработки, глобального рабочего пространства, метакогнитивного мониторинга и воплощённой агентности — при том что биологические натуралисты вроде Анила Сета сомневаются, будто одних вычислений без живого метаболизма вообще достаточно. Современные преимущественно прямоточные трансформеры не удовлетворяют большинству ключевых индикаторов, но стремительная эволюция архитектур делает ответственное управление и эпистемическую скромность насущной необходимостью."
          }
        ],
        keyCards: [
          {
            tag: "КОНСЕНСУС · АПРЕЛЬ 2024",
            title: "Нью-Йоркская декларация",
            detail: "Признаёт веские основания для сознания у млекопитающих и птиц и реалистичную вероятность у всех позвоночных, головоногих, ракообразных и насекомых.",
            citation: "Andrews, Birch, Sebo et al. (2024)"
          },
          {
            tag: "СРАВНИТЕЛЬНАЯ НЕЙРОНАУКА",
            title: "Конвергентные субстраты",
            detail: "Вороны лишены шестислойного неокортекса, но обладают нейронными коррелятами осознанного зрения; осьминоги распределяют две трети нейронов по восьми щупальцам.",
            citation: "Nieder et al. (2020); Crook (2021)"
          },
          {
            tag: "ИНДИКАТОРЫ ИИ · 2025",
            title: "Архитектура важнее риторики",
            detail: "Оценка синтетических систем должна опираться на вычислительные индикаторы из нейронауки (рекуррентность, глобальное пространство, агентность), а не на убедительность текста.",
            citation: "Butlin, Long, Bengio, Chalmers et al. (2025), TiCS"
          },
          {
            tag: "ЭТИКА ПРЕДОСТОРОЖНОСТИ",
            title: "Два моральных риска",
            detail: "Недооценка чувственности грозит непризнанным страданием живых существ; переоценка «пустого» ИИ способна исказить человеческие отношения и права.",
            citation: "Long et al. (2024); Birch (2024)"
          }
        ],
        quote: {
          text: "Когда существует реалистичная вероятность сознательного опыта у животного, безответственно игнорировать эту вероятность при принятии решений, затрагивающих это животное.",
          author: "Нью-Йоркская декларация о сознании животных",
          work: "Нью-Йоркский университет · 19 апреля 2024"
        },
        lab: {
          badge: "ЛАБ. 06 · МНОГОМЕРНОЕ ПРОСТРАНСТВО РАЗУМОВ",
          title: "Сравните профили биологических и синтетических систем",
          instruction: "Выберите основной объект и объект для сравнения, чтобы наложить иллюстративные пятиосевые профили сознания — уходя от плоской «лестницы интеллекта» к разнообразию архитектур.",
          axes: [
            "Сенсорное богатство",
            "Оценочная валентность",
            "Единство и интеграция",
            "Темпоральность и память",
            "Метапознание и Я"
          ],
          compareHint: "Наложите второй объект для сопоставления профилей",
          entities: [
            {
              id: "human",
              name: "Человек (Homo sapiens)",
              category: "Млекопитающее · Опорный эталон",
              scores: [92, 95, 94, 96, 95],
              badge: "Подтверждённый эталон",
              summary: "Плотно интегрированная таламокортикальная архитектура, объединяющая богатое полимодальное восприятие, автобиографическое время, оценочные эмоции и рекурсивную саморефлексию.",
              evidence: "Отчёт от первого лица, высокий PCI (~0.55), взаимодействие лобно-теменных и задних сенсорных систем, метакогнитивная интроспекция."
            },
            {
              id: "octopus",
              name: "Осьминог (Octopus vulgaris)",
              category: "Головоногое · Распределённый разум",
              scores: [88, 78, 52, 66, 48],
              badge: "Реалистичная вероятность · Веские данные",
              summary: "Инопланетный триумф эволюции: тончайшее хемотактильное и зрительное богатство в сочетании с децентрализованными ганглиями щупалец, порождающими скорее федеративное, чем строго точечное единство.",
              evidence: "Целенаправленный уход за раной, выученное предпочтение анальгетика (Crook, 2021), эпизодикоподобная память, обучение наблюдением."
            },
            {
              id: "corvid",
              name: "Врановые (ворон / ворона)",
              category: "Птицы · Конвергентный паллиум",
              scores: [86, 85, 84, 82, 72],
              badge: "Веская научная поддержка",
              summary: "Не имея неокортекса млекопитающих, врановые развили плотный каудолатеральный нидопаллиум, обеспечивающий субъективное зрение, изготовление орудий и планирование будущего.",
              evidence: "Одиночные нейроны субъективного восприятия (Nieder et al., Science 2020), отложенное вознаграждение, учёт чужого взгляда."
            },
            {
              id: "bumblebee",
              name: "Шмель (Bombus terrestris)",
              category: "Насекомое · Компактный центральный комплекс",
              scores: [74, 62, 50, 48, 22],
              badge: "Реалистичная вероятность",
              summary: "Всего около миллиона нейронов позволяют шмелям объединять зрение и осязание, сопоставлять болевой нагрев с концентрацией нектара и проявлять спонтанное игровое поведение.",
              evidence: "Мотивационные компромиссы при боли (Gibbons et al., 2022), кросс-модальное узнавание, катание шариков (Galpayage Dona et al., 2022)."
            },
            {
              id: "organoid",
              name: "Церебральный органоид",
              category: "Нервная ткань человека in vitro",
              scores: [8, 5, 16, 6, 2],
              badge: "Нет свидетельств чувственности",
              summary: "Самоорганизующаяся миллиметровая ткань коры, способная к локальным спонтанным осцилляциям, но лишённая органов чувств, интероцептивного тела, таламуса и глобальной архитектуры.",
              evidence: "Локальные всплески на мультиэлектродных матрицах; отсутствуют сенсомоторные петли, болевые пути и крупномасштабная сложность."
            },
            {
              id: "llm",
              name: "Передовая LLM (трансформер)",
              category: "Искусственный интеллект · Прямоточное ядро",
              scores: [24, 6, 28, 32, 22],
              badge: "Отсутствуют ключевые индикаторы",
              summary: "Поразительная языковая свобода и масштабное моделирование знаний, но отсутствие биологической интероцепции, подлинной валентности, устойчивой рекуррентности рабочего пространства и воплощённой агентности.",
              evidence: "Butlin, Long, Bengio et al. (2025, TiCS): современные трансформеры удовлетворяют лишь малой доле нейронаучных индикаторов сознания вопреки убедительным текстовым заявлениям."
            }
          ]
        }
      }
    ],
    epilogue: {
      plateCode: "ТАБЛИЦА 07 · СИНТЕЗ",
      eyebrow: "ЭПИЛОГ · ОТКРЫТЫЙ ГОРИЗОНТ",
      title: "Зеркало смотрит в ответ",
      body: "К 2025–2026 годам наука о сознании переросла как преждевременный триумфализм, так и кабинетный пессимизм. Состязательные эксперименты охладили пыл флагманских теорий, не остановив движения вперёд; клинические биомаркеры вывели скрытые разумы из тишины реанимационных палат; а круг возможной чувственности расширился далеко за границы человеческого неокортекса — к океанам, небу и вопросам кремниевой архитектуры. Попытка понять, как пробуждается материя, остаётся самым личным научным приключением человечества: ведь инструмент, исследующий эту тайну, и есть сама тайна.",
      plateCaption: "На стыке эмпирической строгости и философского смирения: живой атлас, который продолжает чертиться прямо сейчас.",
      cards: [
        {
          title: "Методологическая зрелость",
          text: "Пререгистрированные состязательные коллаборации (COGITATE, INTREPID) пришли на смену изолированным школам, утвердив общие данные и фальсифицируемые перекрёстные тесты."
        },
        {
          title: "Прямое клиническое значение",
          text: "Картирование сложности PCI и выявление скрытого выполнения команд на фМРТ/ЭЭГ уже меняют диагностику, прогноз и достоинство пациентов в нейрореанимации."
        },
        {
          title: "Ответственное управление будущим",
          text: "Чёткие архитектурные индикаторы и биоэтика предосторожности помогают беречь реальную чувственность животных, не впадая в иллюзии перед красноречивым ИИ."
        }
      ],
      referencesTitle: "Избранная библиография ключевых работ",
      footerNote: "NOESIS — Атлас Сознания · Составлено по рецензируемым источникам философии и нейронауки по состоянию на 2025–2026 гг."
    },
    ui: {
      zoomPlate: "Увеличить таблицу",
      closeModal: "Закрыть",
      sourceBadge: "РЕЦЕНЗИРУЕМЫЙ ИСТОЧНИК",
      predictionIit: "Прогноз IIT 4.0",
      predictionGnwt: "Прогноз GNWT",
      empiricalResult: "Результат COGITATE 2025",
      thresholdReached: "Выше PCI* = 0.31 · Режим сознания",
      belowThreshold: "Ниже PCI* = 0.31 · Бессознательный режим",
      cmdHighlightTitle: "NEJM 2024 · Скрытое сознание",
      cmdHighlightStat: "60 / 241 (25%)",
      cmdHighlightDesc: "Поведенчески неотзывчивых пациентов с тяжёлым поражением мозга, скрыто выполнявших устные команды на фМРТ или ЭЭГ.",
      ariaHeroStats: "Ключевые научные показатели",
      ariaPlatesColumn: "Иллюстрированные таблицы атласа",
      ariaPlateDots: "Навигация по таблицам глав",
      ariaLangSwitch: "Переключатель языка",
      ariaPhilTabs: "Философские интерпретации Комнаты Мэри",
      ariaBrainTheories: "Ведущие нейробиологические теории сознания",
      ariaMarySvg: "Оптическая призма и цветовая вспышка в Комнате Мэри",
      cogitateTestsLabel: "3 теста",
      webglBadge: "Живой 3D-кортекс · Интерактив",
      dragHint: "Двигайте курсор · Скролльте вглубь",
      expandLab: "Открыть лабораторию",
      scrollChapter: "Глава",
      visualModeArt: "3D-скульптура",
      visualMode3d: "3D-сцена"
    }
  },
  references: [
    {
      year: 1974,
      authors: "Thomas Nagel",
      title: "What Is It Like to Be a Bat?",
      venue: "The Philosophical Review, 83(4), 435–450",
      venueRu: "The Philosophical Review, 83(4), 435–450",
      tag: "Philosophy",
      tagRu: "Философия"
    },
    {
      year: 1995,
      authors: "David J. Chalmers",
      title: "Facing Up to the Problem of Consciousness",
      venue: "Journal of Consciousness Studies, 2(3), 200–219",
      venueRu: "Journal of Consciousness Studies, 2(3), 200–219",
      tag: "Philosophy",
      tagRu: "Философия"
    },
    {
      year: 2011,
      authors: "Stanislas Dehaene & Jean-Pierre Changeux",
      title: "Experimental and Theoretical Approaches to Conscious Processing",
      venue: "Neuron, 70(2), 200–227",
      venueRu: "Neuron, 70(2), 200–227",
      tag: "GNWT",
      tagRu: "GNWT"
    },
    {
      year: 2016,
      authors: "Silvia Casarotto, Angela Comanducci, Mario Rosanova, Marcello Massimini et al.",
      title: "Stratification of unresponsive patients by an independently validated index of brain complexity",
      venue: "Annals of Neurology, 80(5), 718–729",
      venueRu: "Annals of Neurology, 80(5), 718–729",
      tag: "Clinical · PCI",
      tagRu: "Клиника · PCI"
    },
    {
      year: 2021,
      authors: "Anil K. Seth",
      title: "Being You: A New Science of Consciousness",
      venue: "Faber & Faber / Dutton",
      venueRu: "Faber & Faber / Dutton",
      tag: "Predictive Mind",
      tagRu: "Предиктивный мозг"
    },
    {
      year: 2023,
      authors: "Larissa Albantakis, Leonardo Barbosa, Graham Findlay, Giulio Tononi, Christof Koch et al.",
      title: "Integrated information theory (IIT) 4.0: Formulating the properties of phenomenal existence in physical terms",
      venue: "PLOS Computational Biology, 19(10), e1011465",
      venueRu: "PLOS Computational Biology, 19(10), e1011465",
      tag: "IIT 4.0",
      tagRu: "IIT 4.0"
    },
    {
      year: 2024,
      authors: "Yelena G. Bodien, Nicholas D. Schiff, Brian L. Edlow et al.",
      title: "Cognitive Motor Dissociation in Disorders of Consciousness",
      venue: "The New England Journal of Medicine, 391(7), 598–608",
      venueRu: "The New England Journal of Medicine, 391(7), 598–608",
      tag: "Clinical · CMD",
      tagRu: "Клиника · CMD"
    },
    {
      year: 2024,
      authors: "Kristin Andrews, Jonathan Birch, Jeff Sebo, David Chalmers et al.",
      title: "The New York Declaration on Animal Consciousness",
      venue: "New York University (April 19, 2024)",
      venueRu: "Нью-Йоркский университет (19 апреля 2024)",
      tag: "Animal Sentience",
      tagRu: "Сознание животных"
    },
    {
      year: 2025,
      authors: "Cogitate Consortium (Oscar Ferrante, Lucia Melloni et al.)",
      title: "Adversarial testing of global neuronal workspace and integrated information theories of consciousness",
      venue: "Nature, 642, 133–142 (April 2025 online / June 2025 print)",
      venueRu: "Nature, 642, 133–142 (онлайн: апрель 2025 / печать: июнь 2025)",
      tag: "COGITATE",
      tagRu: "COGITATE"
    },
    {
      year: 2025,
      authors: "Patrick Butlin, Robert Long, Tim Bayne, Yoshua Bengio, Jonathan Birch, David Chalmers et al.",
      title: "Identifying indicators of consciousness in AI systems",
      venue: "Trends in Cognitive Sciences (2025 online / June 2026 print)",
      venueRu: "Trends in Cognitive Sciences (онлайн: 2025 / печать: июнь 2026)",
      tag: "AI Consciousness",
      tagRu: "Сознание ИИ"
    }
  ]
};
