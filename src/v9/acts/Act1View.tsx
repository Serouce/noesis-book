import { Plate00Mooney } from '../../v7/components/Plate00Mooney';
import { PrologueConsciousness } from '../../v7/components/PrologueConsciousness';
import { ActBottomTurn } from '../components/ActTransitionBridge';
import type { ActId } from '../utils/hashRouter';

export interface ActViewProps {
  onNavigateLocal: (sectionId: string) => void;
  onSwitchAct: (actId: ActId, sectionId?: string) => void;
  onCh1HudTheme?: (theme: 'light' | 'dark') => void;
  onScrollTop: () => void;
  visitedActs: Record<string, boolean>;
}

export default function Act1View({ onNavigateLocal, onSwitchAct }: ActViewProps) {
  return (
    <div data-act-root="act-1">
      <Plate00Mooney onContinueToCh1={() => onNavigateLocal('prologue')} />
      <PrologueConsciousness onContinueToPart1={() => onSwitchAct('act-2')} />
      <ActBottomTurn actId="act-1" onSwitchAct={onSwitchAct} />
    </div>
  );
}
