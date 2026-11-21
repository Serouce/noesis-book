import { BookInterlude } from '../../v7/components/BookInterlude';
import { Chapter5CajalTurntable } from '../../v7/components/Chapter5CajalTurntable';
import { Chapter4SplitHemispheres3D } from '../../v10/chapters/Chapter4SplitHemispheres3D';
import { Chapter5BrainAtlas3D } from '../../v10/chapters/Chapter5BrainAtlas3D';
import { Chapter6CajalRunway3D } from '../../v10/chapters/Chapter6CajalRunway3D';
import { ActBottomTurn, ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

/**
 * ACT III · "Под черепом" (NOESIS v10 Showreel Edition)
 * 1. Half-Title (GSAP 3.15 SplitText)
 * 2. Chapter 04: 240vh Full-Screen 3D PBR Split-Brain Hemispheres + Thomas Metzinger's Ego Tunnel
 * 3. Chapter 05: 320vh Continuous Apple-Class 3D Brain Flight (Cerebellum 69B -> SCAN 2023 -> COGITATE 2025 -> High-Order Thalamus)
 * 4. Chapter 06: 220vh Organic 3D Cajal Branching Neuron Forest ×1000 -> Dieter Rams Turntable & 2.2s Propofol Cut-to-Black!
 */
export default function Act3View({ onSwitchAct, visitedActs }: ActViewProps) {
  return (
    <div data-act-root="act-3">
      <ActTopAnchor actId="act-3" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />

      <BookInterlude
        id="act-3-interlude"
        partCode="АКТ III · ПОД ЧЕРЕПОМ"
        title="Вскрытие субъекта"
        statement="Мы узнали, как мозг конструирует реальность. Теперь пора открыть череп — развести полушария, облететь кору в 3D и спуститься в одну-единственную живую клетку."
        footnote="Глава 04 (Туннель Эго и раскол) · Глава 05 (3D-Атлас COGITATE) · Глава 06 (Лес Кахаля и Пропофол)"
      />

      <Chapter4SplitHemispheres3D />

      <Chapter5BrainAtlas3D />

      <Chapter6CajalRunway3D />

      <Chapter5CajalTurntable onNextChapter={() => onSwitchAct('act-4', 'ch-6')} />

      <ActBottomTurn actId="act-3" onSwitchAct={onSwitchAct} fromDark />
    </div>
  );
}
