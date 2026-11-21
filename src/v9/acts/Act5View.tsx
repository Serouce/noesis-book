import { useCallback } from 'react';
import { Chapter7OtherMinds } from '../../v7/components/Chapter7OtherMinds';
import { Chapter8BoneEndpaper } from '../../v7/components/Chapter8BoneEndpaper';
import { ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

export default function Act5View({
  onNavigateLocal,
  onSwitchAct,
  onScrollTop,
  visitedActs,
}: ActViewProps) {
  const noop = useCallback(() => undefined, []);

  return (
    <div data-act-root="act-4">
      <ActTopAnchor actId="act-4" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />
      <Chapter7OtherMinds onNextChapter={() => onNavigateLocal('ch-8')} />
      <Chapter8BoneEndpaper
        onFooterInView={noop}
        onScrollTop={onScrollTop}
        onSwitchAct={onSwitchAct}
      />
    </div>
  );
}
