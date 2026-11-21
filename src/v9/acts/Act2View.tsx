import { BookInterlude } from '../../v7/components/BookInterlude';
import { Chapter1MaryRoom } from '../../v7/components/Chapter1MaryRoom';
import { Chapter3VellumError } from '../../v7/components/Chapter3VellumError';
import { Chapter2PrismAndAphantasia } from '../../v10/chapters/Chapter2PrismAndAphantasia';
import { Chapter3FlashLagOnly } from '../../v10/chapters/Chapter3FlashLagOnly';
import { ActBottomTurn, ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

/**
 * ACT II · "Театр восприятия" (NOESIS v10 Showreel Edition)
 * 1. Half-Title (GSAP 3.15 SplitText)
 * 2. Chapter 02: Mary's Room Color Metamorphosis + Live WebGL Glass Optical Prism (Impossible Magenta) + 5-sec Aphantasia
 * 3. Chapter 03: 35mm Leica Monochrom "Drei Gläser" Controlled Hallucination + Pure Optical Flash-Lag 80ms
 */
export default function Act2View({
  onSwitchAct,
  onNavigateLocal,
  onCh1HudTheme,
  visitedActs,
}: ActViewProps) {
  return (
    <div data-act-root="act-2">
      <ActTopAnchor actId="act-2" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />

      <BookInterlude
        id="act-2-interlude"
        partCode="АКТ II · ТЕАТР ВОСПРИЯТИЯ"
        title="Мир, которого нет снаружи"
        statement="Если вы закроете глаза, физический мир не станет чёрным — в нём вообще нет цветов, звуков и «прямого эфира». Всё это монтирует ваш мозг."
        footnote="Глава 02 (Комната Мэри · Призма · Афантазия) · Глава 03 (Три пальца · Время 80 мс)"
      />

      <Chapter1MaryRoom
        onHudThemeChange={onCh1HudTheme}
        onActiveChange={() => {}}
        onNextChapter={() => onNavigateLocal('ch-prism')}
      />

      <Chapter2PrismAndAphantasia />

      <Chapter3VellumError onNextChapter={() => onNavigateLocal('ch-time')} />

      <Chapter3FlashLagOnly />

      <ActBottomTurn actId="act-2" onSwitchAct={onSwitchAct} />
    </div>
  );
}
