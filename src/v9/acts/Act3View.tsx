import { Chapter3VellumError } from '../../v7/components/Chapter3VellumError';
import { Chapter2SplitSpine } from '../../v7/components/Chapter2SplitSpine';
import { ActBottomTurn, ActTopAnchor } from '../components/ActTransitionBridge';
import type { ActViewProps } from './Act1View';

/**
 * Act III (v9.1 fixed methodological order):
 * 1. Controlled Hallucination & Bayesian Prior ("Drei Gläser") FIRST — establishes top-down prior!
 * 2. Split-Brain ("Left Interpreter" + Optic Chiasm) SECOND — reveals how narrative "I" rationalizes action!
 */
export default function Act3View({
  onNavigateLocal,
  onSwitchAct,
  visitedActs,
}: ActViewProps) {
  return (
    <div data-act-root="act-3">
      <ActTopAnchor actId="act-3" visitedActs={visitedActs} onSwitchAct={onSwitchAct} />
      <Chapter3VellumError onNextChapter={() => onNavigateLocal('ch-2')} />
      <Chapter2SplitSpine onNextChapter={() => onSwitchAct('act-4')} />
      <ActBottomTurn actId="act-3" onSwitchAct={onSwitchAct} />
    </div>
  );
}
