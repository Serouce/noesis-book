import { BookInterlude } from '../../v7/components/BookInterlude';
import { Chapter6IcuJournal } from '../../v7/components/Chapter6IcuJournal';
import { Chapter7OtherMinds } from '../../v7/components/Chapter7OtherMinds';
import { Chapter8BoneEndpaper } from '../../v7/components/Chapter8BoneEndpaper';
import { ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

/**
 * ACT IV · "Границы разума" (NOESIS v10 Showreel Edition)
 * Opens seamlessly inside the dark ICU room (right after Act III's Propofol Cut-to-Black!),
 * emerges at dawn into Animal Consciousness (NY 2024 + Sea Sponge), 3D Silicon Qualia + HAL 9000,
 * and closes on the flippable Cotton Bone Passport & Control Probe #0!
 */
export default function Act4View({
  onSwitchAct,
  onNavigateLocal,
  visitedActs,
}: ActViewProps) {
  return (
    <div data-act-root="act-4">
      <ActTopAnchor actId="act-4" visitedActs={visitedActs} onSwitchAct={onSwitchAct} dark />

      <Chapter6IcuJournal
        onDarkInView={() => {}}
        onNextChapter={() => onNavigateLocal('part-4-dawn')}
      />

      <BookInterlude
        id="part-4-dawn"
        partCode="АКТ IV · ГРАНИЦЫ РАЗУМА"
        title="Где ещё горит этот свет?"
        statement="Если сознание можно услышать у молчащего человека в коме, где оно заканчивается в живой природе — и способно ли вспыхнуть в кремнии?"
        footnote="Глава 07 (Кома и Животные NY 2024) · Глава 08 (3D Кремний · HAL 9000 · Форзац Bone)"
        fromDark
      />

      <Chapter7OtherMinds onNextChapter={() => onNavigateLocal('ch-8')} />

      <Chapter8BoneEndpaper
        onFooterInView={() => {}}
        onScrollTop={() => onSwitchAct('act-1', 'plate-00')}
        onSwitchAct={onSwitchAct}
      />
    </div>
  );
}
