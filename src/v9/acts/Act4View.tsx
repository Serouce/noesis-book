import { useCallback } from 'react';
import { Chapter4WagerAndDiopter } from '../../v7/components/Chapter4WagerAndDiopter';
import { ScrollMicroZoom } from '../../v7/components/ScrollMicroZoom';
import { Chapter5CajalTurntable } from '../../v7/components/Chapter5CajalTurntable';
import { Chapter6IcuJournal } from '../../v7/components/Chapter6IcuJournal';
import { ActBottomTurn, ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

export default function Act4View({
  onNavigateLocal,
  onSwitchAct,
  visitedActs,
}: ActViewProps) {
  const noop = useCallback(() => undefined, []);

  return (
    <div data-act-root="act-4">
      <ActTopAnchor actId="act-4" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />
      <Chapter4WagerAndDiopter onNextChapter={() => onNavigateLocal('micro-zoom')} />
      <ScrollMicroZoom />
      <Chapter5CajalTurntable onNextChapter={() => onNavigateLocal('ch-6')} />
      <Chapter6IcuJournal
        onDarkInView={noop}
        onNextChapter={() => onSwitchAct('act-4')}
      />
      <ActBottomTurn actId="act-4" onSwitchAct={onSwitchAct} fromDark />
    </div>
  );
}
