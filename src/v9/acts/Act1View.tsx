import { Plate00Mooney } from '../../v7/components/Plate00Mooney';
import { Chapter1WhatIsConsciousness } from '../../v10/chapters/Chapter1WhatIsConsciousness';
import { LeibnizMillRunway } from '../../v10/chapters/LeibnizMillRunway';
import { ActBottomTurn } from '../components/ActTransitionBridge';
import type { ActId } from '../utils/hashRouter';

export interface ActViewProps {
  onNavigateLocal: (targetId: string) => void;
  onSwitchAct: (actId: ActId, secId?: string) => void;
  onCh1HudTheme: (theme: 'dark' | 'light') => void;
  onScrollTop: () => void;
  visitedActs: Record<string, boolean>;
}

/**
 * ACT I · "Тайна с нуля" (NOESIS v10 Showreel Edition)
 * 1. Plate 00 Mooney (instant tactile reveal on first touch, zero countdown clutter!)
 * 2. Chapter 01: Descartes -> Full-Screen 3,600-Particle WebGL Leibniz's Mill -> Nagel -> Chalmers' Hard Problem
 */
export default function Act1View({ onSwitchAct, onNavigateLocal }: ActViewProps) {
  return (
    <div data-act-root="act-1">
      <Plate00Mooney onContinueToCh1={() => onNavigateLocal('ch-01')} />
      <Chapter1WhatIsConsciousness leibnizSceneSlot={<LeibnizMillRunway />} />
      <ActBottomTurn actId="act-1" onSwitchAct={onSwitchAct} />
    </div>
  );
}
