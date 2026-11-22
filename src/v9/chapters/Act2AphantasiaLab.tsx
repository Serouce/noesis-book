import { useEffect, useState } from 'react';
import { Eye, Timer, Volume2, VolumeX } from 'lucide-react';
import { useExplorer } from '../../v7/context/ExplorerContext';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { DossierTrigger } from '../components/NoesisDossierSheet';
import { assetUrl } from '../utils/assetUrl';
import { ruTypo } from '../utils/ruTypo';

function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
    window.setTimeout(() => {
      void ctx.close();
    }, 950);
  } catch {
    // Ignore autoplay / audio context limits cleanly
  }
}

interface VividnessLevel {
  score: number;
  label: string;
  archetype: string;
  population: string;
  pupilDeltaPct: number;
  explain: string;
  imgFilter: string;
  imgOpacity: number;
}

const VIVIDNESS_LEVELS: VividnessLevel[] = [
  {
    score: 0,
    label: '0 · Полная темнота',
    archetype: 'Афантазия (внутренний экран выключен)',
    population: '~2–4% людей',
    pupilDeltaPct: 0,
    explain:
      'Вы точно знаете, что такое яблоко, какого оно цвета и формы, — но с закрытыми глазами перед вами нет никакой картинки. Знание есть, визуальных квалиа воображения — нет.',
    imgFilter: 'grayscale(1) brightness(0.1)',
    imgOpacity: 0,
  },
  {
    score: 1,
    label: '1 · Едва уловимый след',
    archetype: 'Гипофантазия (на грани темноты)',
    population: '~10% людей',
    pupilDeltaPct: -1,
    explain:
      'Мелькает едва различимый серый намёк на круглый контур, почти без цвета и объёма — и тут же растворяется.',
    imgFilter: 'grayscale(0.95) contrast(0.75) blur(3.5px) brightness(0.62)',
    imgOpacity: 0.24,
  },
  {
    score: 2,
    label: '2 · Туманный силуэт',
    archetype: 'Слабое зрительное воображение',
    population: '~20% людей',
    pupilDeltaPct: -2,
    explain:
      'Силуэт яблока узнаваем, проступает приглушённый тёмно-красный тон, но детали кожуры и тень остаются размытыми.',
    imgFilter: 'saturate(0.42) blur(2.2px) contrast(0.9)',
    imgOpacity: 0.56,
  },
  {
    score: 3,
    label: '3 · Ясный полупрозрачный образ',
    archetype: 'Типичное зрительное воображение',
    population: '~45% людей',
    pupilDeltaPct: -4,
    explain:
      'Отчётливое красное яблоко с черенком — вы легко удерживаете его в уме, хотя чувствуете, что оно чуть мягче реальной фотографии.',
    imgFilter: 'saturate(0.78) blur(0.9px)',
    imgOpacity: 0.84,
  },
  {
    score: 4,
    label: '4 · Чёткий цветной образ',
    archetype: 'Яркое зрительное воображение',
    population: '~15% людей',
    pupilDeltaPct: -5,
    explain:
      'Насыщенный цвет, объём и блик света на кожуре; можно мысленно повернуть яблоко в руке и разглядеть черенок.',
    imgFilter: 'saturate(0.96) blur(0.25px)',
    imgOpacity: 0.96,
  },
  {
    score: 5,
    label: '5 · Как живая фотография',
    archetype: 'Гиперфантазия (эффект присутствия)',
    population: '~3–5% людей',
    pupilDeltaPct: -6,
    explain:
      'Ослепительно резкий внутренний снимок — видны крапинки на кожуре, тень на бумаге и ощущение веса. Почти как открытые глаза.',
    imgFilter: 'saturate(1.06) contrast(1.03)',
    imgOpacity: 1,
  },
];

/**
 * ACT II · TEST 04 (PROMOTED TO MAINSTREAM!): "5-секундный тест красного яблока (Афантазия)"
 * - Swiss anti-priming shutter keeps the studio Leica still-life (/v9/aphantasia-apple.jpg) concealed until 5s timer finishes or user explicitly opens the scale.
 * - Honest 2-step preview (0..5) -> commit ("Записать X / 5 в Паспорт книги").
 * - Relative Pupillary Light Reflex (Δ зрачка: 0% -> −14%, Kay et al., eLife 2022) comparing bright vs dark imagined stimuli.
 */
export function Act2AphantasiaLab() {
  const { state, setAphantasiaScore } = useExplorer();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [chimeEnabled, setChimeEnabled] = useState(false);
  const [appleRevealed, setAppleRevealed] = useState<boolean>(() => state.aphantasiaScore !== null);
  const [previewScore, setPreviewScore] = useState<number>(state.aphantasiaScore ?? 3);

  useEffect(() => {
    if (state.aphantasiaScore !== null) {
      setAppleRevealed(true);
    }
  }, [state.aphantasiaScore]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const id = window.setTimeout(() => {
      if (countdown === 1) {
        if (chimeEnabled) playGentleChime();
        setAppleRevealed(true);
      }
      setCountdown((c) => (c !== null && c > 1 ? c - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [countdown, chimeEnabled]);

  const activeLevel = VIVIDNESS_LEVELS[previewScore] ?? VIVIDNESS_LEVELS[3];
  const isSaved = state.aphantasiaScore !== null;

  // Map realistic relative pupillary constriction (0% -> -6%, Kay et al., eLife 2022) to legible SVG radius (15px -> 7.5px)
  const pupilRadius = 15 + (activeLevel.pupilDeltaPct / 6) * 7.5;

  return (
    <section
      id="ch-aphantasia"
      className="relative bg-[#FAF9F5] text-[#141413] py-18 md:py-24 border-b border-[#141413]/10"
      aria-label="Глава 02 — Внутренний проектор и афантазия"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">АКТ II · ГЛАВА 02 · ВНУТРЕННИЙ ПРОЕКТОР</span>
          <span>АФАНТАЗИЯ И ЗРАЧОК · стр. 32</span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 5 cols: Editorial Hook + 5-sec Prompt + Dossier */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-[clamp(30px,4.2vw,50px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Два человека рядом —</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                и два совершенно разных экрана в голове.
              </span>
            </h2>

            <p className="text-[15.5px] leading-[1.68] text-[#2F2E2B]">
              {ruTypo(
                'Мы привыкли думать, что все видят мир изнутри одинаково. Но пока вы читаете это предложение, примерно у одного человека из тридцати нет вообще никакого «внутреннего кино» — это состояние называется ',
              )}
              <strong className="font-semibold text-[#141413]">афантазией</strong>.
            </p>

            <div className="p-4 rounded-xl bg-[#F3F1E9] border border-[#141413]/12 space-y-3">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.13em] text-[#FC4109] font-semibold">
                ШАГ 1 · ПРОСТОЙ ОПЫТ ЗА 5 СЕКУНД
              </div>
              <p className="font-serif-editorial italic text-[16.5px] leading-[1.52] text-[#141413]">
                {ruTypo(
                  'Закройте глаза на 5 секунд и представьте свежее красное яблоко на белой бумаге. Насколько чётко вы его видите?',
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCountdown(5)}
                  className="v6-pill h-9 px-4 rounded-full bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5] font-mono-tech text-[10.5px] uppercase tracking-[0.09em] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-[#FC4109]" />
                  <span>
                    {countdown !== null && countdown > 0
                      ? `Закройте глаза… ${countdown} сек`
                      : countdown === 0
                        ? '5 секунд вышли · выберите уровень →'
                        : 'Таймер 5 секунд (по желанию)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChimeEnabled((v) => !v)}
                  className={`v6-pill h-9 px-3 rounded-full border font-mono-tech text-[10px] uppercase tracking-[0.08em] inline-flex items-center gap-1.5 cursor-pointer ${
                    chimeEnabled
                      ? 'bg-[#004EDF]/12 border-[#004EDF]/40 text-[#004EDF]'
                      : 'bg-[#FAF9F5] border-[#141413]/14 text-[#5E5D59] hover:text-[#141413]'
                  }`}
                  title="Тихий звуковой сигнал в конце 5 секунд (чтобы не подглядывать)"
                >
                  {chimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{chimeEnabled ? 'Сигнал вкл' : 'Без звука'}</span>
                </button>
              </div>
            </div>

            <p className="text-[14px] leading-[1.64] text-[#4B4A46]">
              {ruTypo(
                'Долгое время скептики спорили: вдруг люди с афантазией просто иначе подбирают слова? В 2022 году (Kay et al., eLife) это проверили объективно по зрачку: когда человек с воображением представляет яркое солнце, его зрачок сам сужается — а при афантазии остаётся неподвижным.',
              )}
            </p>

            <DossierTrigger
              dossier="aphantasia-2025"
              label="Зрачковый тест (eLife 2022) и споры о зрительной коре (Current Biology 2025)"
              meta="Архивное досье II.2 · Уровень 2"
              className="w-full"
            />
          </div>

          {/* Right 7 cols: Studio Apple Plate + 0..5 Dial + Live Pupillary Reflex */}
          <div className="lg:col-span-7">
            <NoesisInstrumentFrame
              code="ПРИБОР II.1 · ШКАЛА ЯРКОСТИ ВНУТРЕННЕГО ОБРАЗА (0–5)"
              badge="self-test"
              telemetry={
                isSaved
                  ? `В ПАСПОРТЕ: ${state.aphantasiaScore} / 5`
                  : 'ВЫБЕРИТЕ ВАШ УРОВЕНЬ 0–5'
              }
              surface="vellum"
              footnote="Ваш балл сохраняется в Паспорт Bone · Kay et al. (eLife, 2022)"
            >
              <div className="space-y-5">
                {/* 0..5 Tactile Selector Pills (Preview first -> explicit Save button!) */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-6 gap-2">
                    {VIVIDNESS_LEVELS.map((lvl) => {
                      const isChosen = state.aphantasiaScore === lvl.score;
                      const isPreviewOnly = appleRevealed && previewScore === lvl.score && !isChosen;
                      return (
                        <button
                          key={lvl.score}
                          type="button"
                          disabled={!appleRevealed}
                          onClick={() => setPreviewScore(lvl.score)}
                          className={`v6-pill py-2.5 rounded-xl border font-mono-tech text-[13px] font-bold ${
                            !appleRevealed
                              ? 'bg-[#FAF9F5]/60 text-[#141413]/35 border-[#141413]/10 cursor-not-allowed'
                              : isChosen
                                ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] shadow-sm cursor-pointer'
                                : isPreviewOnly
                                  ? 'bg-[#004EDF]/10 text-[#004EDF] border-[#004EDF] border-dashed cursor-pointer'
                                  : 'bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#141413] border-[#141413]/14 cursor-pointer'
                          }`}
                        >
                          {lvl.score}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59] px-0.5">
                    <span>0 · полная тьма</span>
                    <span className="text-center">
                      {!appleRevealed
                        ? 'сначала закройте глаза или откройте шторку'
                        : !isSaved
                          ? `предпросмотр ${previewScore}/5 · запишите ниже`
                          : previewScore !== state.aphantasiaScore
                            ? `в паспорте ${state.aphantasiaScore}/5 · просмотр ${previewScore}/5`
                            : `в паспорте: ${state.aphantasiaScore}/5`}
                    </span>
                    <span>5 · как фотография</span>
                  </div>
                </div>

                {/* Main Split Visual: Left = Studio Apple Plate (with anti-priming Swiss Shutter!), Right = Pupil Reflex + Diagnosis */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Studio Leica Apple Photograph with programmatic vividness filter + anti-priming shutter */}
                  <div className="sm:col-span-6">
                    <div
                      className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#141413]/15 transition-colors duration-300"
                      style={{
                        backgroundColor: !appleRevealed || previewScore === 0 ? '#141413' : '#FAF9F5',
                      }}
                    >
                      <img
                        src={assetUrl('/v9/aphantasia-apple.jpg')}
                        alt="Студийное изображение красного яблока для шкалы яркости воображения"
                        className="w-full h-full object-cover select-none transition-all duration-300"
                        style={{
                          filter: activeLevel.imgFilter,
                          opacity: appleRevealed ? activeLevel.imgOpacity : 0,
                        }}
                        draggable={false}
                      />

                      {!appleRevealed && (
                        <div className="absolute inset-0 bg-[#141413] text-[#FAF9F5] p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between font-mono-tech text-[9.5px] uppercase tracking-[0.13em] text-[#9EA4B0]">
                            <span className="text-[#FC4109] font-semibold">ШТОРКА · БЕЗ ПОДСКАЗКИ</span>
                            <span>+</span>
                          </div>

                          <div className="text-center space-y-2.5 my-auto">
                            {countdown !== null && countdown > 0 ? (
                              <>
                                <div className="font-mono-tech text-[42px] leading-none font-bold text-[#FC4109] tabular-nums">
                                  0{countdown}
                                </div>
                                <p className="font-serif-editorial italic text-[15px] text-[#FAF9F5]/85 leading-snug">
                                  {ruTypo('Закройте глаза и удерживайте образ красного яблока…')}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 mx-auto rounded-full border border-[#FAF9F5]/22 flex items-center justify-center font-mono-tech text-[11px] text-[#FAF9F5]/65">
                                  5с
                                </div>
                                <p className="font-serif-editorial italic text-[15px] text-[#FAF9F5]/85 leading-snug">
                                  {ruTypo(
                                    'Фото скрыто, чтобы не сбить ваш внутренний экран. Закройте глаза на 5 секунд или откройте шкалу вручную.',
                                  )}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => setAppleRevealed(true)}
                              className="v6-pill w-full py-2.5 px-3.5 rounded-full bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#141413] font-sans-ui text-[12.5px] font-medium cursor-pointer"
                            >
                              Я уже представил · Открыть шкалу
                            </button>
                          </div>
                        </div>
                      )}

                      {appleRevealed && previewScore === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                          <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
                            ЭКРАН ВЫКЛЮЧЕН
                          </span>
                          <span className="font-serif-editorial italic text-[16px] text-[#FAF9F5]/80 mt-2">
                            «Я знаю, что яблоко красное и круглое — но перед глазами просто темнота».
                          </span>
                        </div>
                      )}

                      {appleRevealed && (
                        <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between font-mono-tech text-[9.5px] uppercase tracking-[0.1em]">
                          <span className="px-2 py-0.5 rounded bg-[#141413]/78 text-[#FAF9F5]">
                            {activeLevel.label}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#FAF9F5]/92 text-[#141413] border border-[#141413]/12">
                            {activeLevel.population}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Archetype Readout + Objective Pupil Light Reflex */}
                  <div className="sm:col-span-6 space-y-4">
                    <div>
                      <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold">
                        {appleRevealed ? 'ПРОФИЛЬ ВООБРАЖЕНИЯ' : 'ПОСЛЕ ПРЕДСТАВЛЕНИЯ'}
                      </div>
                      <h3 className="font-display font-bold text-[18px] leading-snug text-[#141413] mt-1">
                        {appleRevealed ? activeLevel.archetype : 'Сначала представьте яблоко'}
                      </h3>
                      <p className="text-[13.5px] leading-[1.58] text-[#3B3A37] mt-1.5">
                        {ruTypo(
                          appleRevealed
                            ? activeLevel.explain
                            : 'Запустите 5-секундный таймер или нажмите «Я уже представил · Открыть шкалу» на шторке, чтобы выбрать уровень от 0 до 5 без зрительной подсказки.',
                        )}
                      </p>
                    </div>

                    {/* Objective Pupillary Light Reflex Gauge (Kay et al., eLife 2022) */}
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#141413]/12 flex items-center gap-4">
                      <svg viewBox="0 0 88 54" className="w-20 h-12 shrink-0" aria-hidden="true">
                        <path
                          d="M 4 27 Q 44 -4, 84 27 Q 44 58, 4 27 Z"
                          fill="#FAF9F5"
                          stroke="#141413"
                          strokeWidth="1.6"
                        />
                        <circle cx="44" cy="27" r="19" fill="#E8E4D9" stroke="#141413" strokeWidth="1.2" />
                        <circle
                          cx="44"
                          cy="27"
                          r={appleRevealed ? pupilRadius : 13}
                          fill="#141413"
                          style={{ transition: 'r 260ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                        />
                        <circle cx="49" cy="22" r="2.2" fill="#FAF9F5" opacity="0.85" />
                      </svg>
                      <div className="min-w-0">
                        <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.11em] text-[#5E5D59] inline-flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#FC4109]" />
                          <span>РЕФЛЕКС ЗРАЧКА · ЯРКОЕ VS ТЁМНОЕ</span>
                        </div>
                        <div className="font-mono-tech text-[13.5px] font-bold text-[#141413] mt-0.5">
                          {appleRevealed ? (
                            <>
                              Δ зрачка: {activeLevel.pupilDeltaPct === 0 ? '0%' : `${activeLevel.pupilDeltaPct}%`}{' '}
                              <span className="text-[11px] font-normal text-[#5E5D59]">
                                {previewScore === 0
                                  ? '(нет отклика · eLife 2022)'
                                  : previewScore >= 4
                                    ? '(сильное сужение · eLife 2022)'
                                    : '(умеренное сужение · eLife 2022)'}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11.5px] font-normal text-[#5E5D59]">
                              Шкала откроется после 5-секундной пробы
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {appleRevealed && (!isSaved || previewScore !== state.aphantasiaScore) && (
                      <button
                        type="button"
                        onClick={() => setAphantasiaScore(previewScore)}
                        className="v6-pill w-full py-2.5 px-4 rounded-full bg-[#FC4109] hover:bg-[#E43806] text-[#FAF9F5] font-sans-ui text-[13px] font-medium cursor-pointer"
                      >
                        {isSaved
                          ? `Обновить в Паспорте на «${previewScore} / 5»`
                          : `Записать «${previewScore} / 5» в Паспорт книги`}
                      </button>
                    )}

                    {appleRevealed && isSaved && previewScore === state.aphantasiaScore && (
                      <div className="w-full py-2.5 px-4 rounded-full bg-[#0D7A5F]/10 border border-[#0D7A5F]/25 text-[#0D7A5F] font-mono-tech text-[11px] uppercase tracking-[0.09em] text-center font-semibold">
                        ✓ Записано в Паспорт книги: {state.aphantasiaScore} / 5
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </NoesisInstrumentFrame>
          </div>
        </div>

        {/* Domino transition bridge to Ch. II.3 */}
        <div className="mt-12 pt-6 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[16px] text-[#3B3A37] max-w-[680px]">
            {ruTypo(
              'Внутренний экран у разных людей настроен по-разному. Но даже если ваш проектор работает на 5 из 5 — показывает ли он реальность в прямом эфире?',
            )}
          </p>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
            ДАЛЕЕ · ГЛАВА 03 ↓
          </span>
        </div>
      </div>
    </section>
  );
}
