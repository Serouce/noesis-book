import { useCallback } from 'react';
import { Chapter1MaryRoom } from '../../v7/components/Chapter1MaryRoom';
import { Act2AphantasiaLab } from '../chapters/Act2AphantasiaLab';
import { Act2OverflowBlindsightTime } from '../chapters/Act2OverflowBlindsightTime';
import { ActBottomTurn, ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

export default function Act2View({
  onSwitchAct,
  onCh1HudTheme,
  visitedActs,
}: ActViewProps) {
  const noop = useCallback(() => undefined, []);
  const handleHudTheme = useCallback(
    (theme: 'light' | 'dark') => {
      onCh1HudTheme?.(theme);
    },
    [onCh1HudTheme],
  );

  return (
    <div data-act-root="act-2">
      <ActTopAnchor actId="act-2" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />
      <Chapter1MaryRoom
        onHudThemeChange={handleHudTheme}
        onActiveChange={noop}
        onNextChapter={() => onSwitchAct('act-3')}
      />
      <Act2AphantasiaLab />
      <Act2OverflowBlindsightTime />
      <ActBottomTurn actId="act-2" onSwitchAct={onSwitchAct} />
    </div>
  );
}
