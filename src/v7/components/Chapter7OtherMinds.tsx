import { ArrowDown, Bookmark, Check, Sparkles } from 'lucide-react';
import { useExplorer } from '../context/ExplorerContext';
import { ScholarPortraitSvg } from './ScholarMarginalia';

interface Chapter7OtherMindsProps {
  onNextChapter: () => void;
}

const SPECIES = [
  {
    id: 'sponge',
    name: 'Морская губка',
    genitive: 'Морской губки',
    neurons: '0 нейронов',
    detail: 'Нет нервной системы и синапсов',
    inNyDeclaration: false,
  },
  {
    id: 'crab',
    name: 'Десятиногий краб',
    genitive: 'Десятиногого краба',
    neurons: '~100 тыс.',
    detail: 'Избегает боли, помнит травму',
    inNyDeclaration: true,
  },
  {
    id: 'bee',
    name: 'Медоносная пчела',
    genitive: 'Медоносной пчелы',
    neurons: '~1 млн',
    detail: 'Понимает ноль, катает шарики в игре',
    inNyDeclaration: true,
  },
  {
    id: 'octopus',
    name: 'Осьминог',
    genitive: 'Осьминога',
    neurons: '500 млн',
    detail: '2/3 нейронов живут в 8 щупальцах',
    inNyDeclaration: true,
  },
  {
    id: 'raven',
    name: 'Ворон',
    genitive: 'Ворона',
    neurons: '~1,2 млрд',
    detail: 'Без неокортекса, но планирует будущее',
    inNyDeclaration: true,
  },
  {
    id: 'human',
    name: 'Человек',
    genitive: 'Человека (никого выше)',
    neurons: '86 млрд',
    detail: 'У слона — 257 млрд: число ≠ сознание',
    inNyDeclaration: true,
  },
];

const BUTLIN_MODULES = [
  {
    id: 'recurrent',
    code: 'RPT-01',
    name: 'Рекуррентные петли обработки',
    desc: 'Сигнал не течёт в одну сторону, а возвращается назад, чтобы перепроверить образ.',
  },
  {
    id: 'workspace',
    code: 'GWT-02',
    name: 'Глобальное рабочее пространство',
    desc: 'Единое «бутылочное горлышко» внимания, раздающее выбранную мысль всем модулям.',
  },
  {
    id: 'selfModel',
    code: 'HOT-03',
    name: 'Метапознание и модель «себя»',
    desc: 'Система отслеживает не только мир, но и собственные сомнения и ошибки.',
  },
  {
    id: 'embodiment',
    code: 'EMB-04',
    name: 'Телесная петля с миром',
    desc: 'Непрерывный цикл «действие → сенсорная отдача» в реальном времени.',
  },
  {
    id: 'valence',
    code: 'VAL-05',
    name: 'Внутренняя валентность (боль / нужда)',
    desc: 'Состояния системы имеют собственную цену выживания, а не внешнюю метку потерь.',
  },
];

/**
 * CHAPTER VII: "Граница иных разумов"
 * Mechanic 7.1 (REPLACES CLONED WALL): "Красная закладка-ляссе" — place your moral boundary across 6 species,
 * then compare with the April 2024 New York Declaration + iconic SpongeBob/Squidward/Mr. Krabs marginalia!
 * Mechanic 7.2: "Трибунал ИИ" (Butlin et al., TiCS 2025) where our #FC4109 dot dilates into the calm red optical lens of HAL 9000!
 */
export function Chapter7OtherMinds({ onNextChapter }: Chapter7OtherMindsProps) {
  const {
    state,
    setRibbonBoundaryIndex,
    setRibbonChecked,
    toggleTribunalModule,
    activeTribunalCount,
  } = useExplorer();

  // Scientific verdict for each of the 3 engraved SVG judges based on active AI modules!
  const dehaeneVerdict =
    state.tribunalModules.workspace && state.tribunalModules.selfModel
      ? '«Осторожно: здесь есть и рабочее пространство, и метамониторинг. По критериям GNWT это уже серьёзный кандидат на искусственное сознание.»'
      : '«Пока перед нами блестящий попугай-статистик. Без глобальной трансляции и самоконтроля это бессознательная обработка.»';

  const kochVerdict =
    activeTribunalCount >= 4
      ? '«Впечатляющий софт — но на последовательном кремниевом чипе его внутренняя связность Ф близка к нулю. Симуляция дождя не мочит процессор.»'
      : '«Ноль субъективного опыта. Чтобы в системе зажёгся свет, физическая архитектура должна быть неразрывно интегрирована, а не сэмулирована в коде.»';

  const sethVerdict =
    state.tribunalModules.embodiment && state.tribunalModules.valence
      ? '«Телесность и живая уязвимость — самый честный шаг к субъектности. Но пока машине нечего терять, её “я боюсь” остаётся лишь строкой текста.»'
      : '«Мы снова путаем интеллект с жизнью. Сознание выросло из заботы живого организма о собственном выживании — а не из предсказания слов.»';

  // HAL 9000 optical iris dilation radius driven cleanly by active module count (0..5)
  const halDilation = activeTribunalCount / 5;

  return (
    <section
      id="ch-7"
      className="relative bg-[#FAF9F5] text-[#141413] py-20 md:py-28 border-b border-[#141413]/10"
      aria-label="Глава VII — Граница иных разумов"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20">
        {/* Folio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#141413]/12 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-[#5E5D59]">
          <span className="text-[#FC4109] font-semibold">ЧАСТЬ III · ГРАНИЦЫ РАЗУМА · ГЛАВА VII</span>
          <span>ИНЫЕ РАЗУМЫ · 2024–2025 · стр. 98</span>
        </div>

        {/* PART 7.1: CRIMSON SILK-RIBBON BOOKMARK ("Красная закладка-ляссе") */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-[clamp(32px,4.5vw,58px)] leading-[1.06] tracking-[-0.03em]">
              <span className="font-display font-bold block">Где вы проведёте</span>
              <span className="font-serif-editorial italic font-normal text-[#30302E] block mt-1">
                красную черту чувствующего мира?
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5 text-[15.5px] leading-[1.62] text-[#353431]">
            <p>
              Сознание <strong className="font-semibold text-[#141413]">не зависит линейно от числа нейронов</strong> (у африканского слона их 257 млрд — втрое больше, чем у нас). Сдвиньте красную книжную закладку-ляссе: слева останутся «биороботы», справа — существа, способные чувствовать.
            </p>
          </div>
        </div>

        {/* Interactive Ribbon Placement Bar */}
        <div className="mt-10 rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-5 md:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2.5 font-mono-tech text-[11px] uppercase tracking-[0.12em]">
                <Bookmark className="w-4 h-4 text-[#FC4109] fill-current" />
                <span>
                  {state.ribbonBoundaryIndex === 0 ? (
                    <>
                      ВАША ЗАКЛАДКА: <strong className="text-[#FC4109]">ЧУВСТВУЮТ ВСЕ 6 ВИДОВ</strong>
                    </>
                  ) : (
                    <>
                      ВАША ЗАКЛАДКА: ПОСЛЕ{' '}
                      <strong className="text-[#FC4109]">
                        {SPECIES[state.ribbonBoundaryIndex - 1]?.genitive.toUpperCase()}
                      </strong>
                    </>
                  )}
                </span>
              </div>

              {state.ribbonChecked && (
                <div className="inline-flex items-center gap-3 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-[#5E5D59]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0D7A5F]" />
                    <span>признано NY 2024</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                    <span>вне декларации</span>
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setRibbonChecked(true)}
              className={`v6-pill h-10 px-5 rounded-full font-sans-ui text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer ${
                state.ribbonChecked
                  ? 'bg-[#0D7A5F] text-[#FAF9F5]'
                  : 'bg-[#141413] hover:bg-[#2A2A28] text-[#FAF9F5]'
              }`}
            >
              {state.ribbonChecked ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#FC4109]" />}
              <span>
                {state.ribbonChecked
                  ? 'Сверено с Нью-Йоркской декларацией 2024'
                  : 'Сверить с Нью-Йоркской декларацией 2024'}
              </span>
            </button>
          </div>

          {/* 6 Modern Swiss Taxonomic Cards with Interactive Bookmark Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 pb-6">
            {SPECIES.map((sp, idx) => {
              const userConsidersConscious = idx >= state.ribbonBoundaryIndex;
              const isUserCutHere = idx === state.ribbonBoundaryIndex;
              const isNyCutHere = state.ribbonChecked && idx === 1;
              const bothOnSameGap = isUserCutHere && isNyCutHere;

              return (
                <div key={sp.id} className="relative flex flex-col">
                  {/* User Crimson Bookmark Ribbon Marker — zero-width axis centered cleanly in 12px gap */}
                  {isUserCutHere && (
                    <div
                      aria-hidden="true"
                      className={`hidden lg:flex flex-col items-center w-0 ${
                        bothOnSameGap ? '-left-[8px]' : '-left-[6px]'
                      } absolute -top-4 -bottom-2 z-20 pointer-events-none`}
                    >
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#FC4109] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-wider whitespace-nowrap shadow-sm">
                        ВЫ
                      </span>
                      <span className="w-[2.5px] flex-1 bg-[#FC4109]" />
                    </div>
                  )}

                  {/* Official April 2024 NY Declaration Emerald Line — zero-width axis centered in 12px gap */}
                  {isNyCutHere && (
                    <div
                      aria-hidden="true"
                      className={`hidden lg:flex flex-col items-center w-0 ${
                        bothOnSameGap ? '-left-[4px]' : '-left-[6px]'
                      } absolute -bottom-7 -top-1 z-10 pointer-events-none`}
                    >
                      <span className="w-0 flex-1 border-l-2 border-dashed border-[#0D7A5F]" />
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#0D7A5F] text-[#FAF9F5] font-mono-tech text-[8.5px] uppercase tracking-wider whitespace-nowrap shadow-xs">
                        NY 2024
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setRibbonBoundaryIndex(idx)}
                    className={`v6-pill flex-1 text-left p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                      userConsidersConscious
                        ? 'bg-[#FAF9F5] border-[#141413]/22 text-[#141413] shadow-[0_8px_22px_rgba(20,20,19,0.06)]'
                        : 'bg-[#E9E6DC]/75 border-[#141413]/10 text-[#6A6862] opacity-85'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono-tech text-[9.5px] uppercase tracking-[0.1em]">
                        <span className={userConsidersConscious ? 'text-[#FC4109] font-semibold' : 'text-[#7A7872]'}>
                          {userConsidersConscious ? 'ЧУВСТВУЕТ' : 'БИОРОБОТ'}
                        </span>
                        {state.ribbonChecked && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sp.inNyDeclaration ? 'bg-[#0D7A5F]' : 'bg-[#94A3B8]'
                            }`}
                            title={sp.inNyDeclaration ? 'В Нью-Йоркской декларации 2024' : 'Вне декларации (0 нейронов)'}
                          />
                        )}
                      </div>

                      <div className="font-display font-bold text-[15px] mt-2 leading-snug text-[#141413]">
                        {sp.name}
                      </div>
                      <div className="font-mono-tech text-[11px] font-semibold text-[#004EDF] mt-1">
                        {sp.neurons}
                      </div>
                    </div>

                    <p className="text-[12px] leading-[1.48] text-[#52514C]">{sp.detail}</p>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Slider fallback for super intuitive fine positioning on all screen sizes */}
          <div className="pt-2 space-y-1.5">
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={state.ribbonBoundaryIndex}
              onChange={(e) => setRibbonBoundaryIndex(Number(e.target.value))}
              className="w-full accent-[#FC4109] cursor-pointer"
              aria-label="Положение красной закладки-ляссе между видами"
            />
            <div className="flex justify-between font-mono-tech text-[10px] text-[#5E5D59]">
              <span>← Сместить границу к простейшим</span>
              <span>Сместить границу к человеку →</span>
            </div>
          </div>

          {/* THE LEGENDARY SPONGEBOB / SQUIDWARD / MR. KRABS SCIENTIFIC MARGINALIA (Revealed upon check!) */}
          {state.ribbonChecked && (
            <div className="mt-4 rounded-xl bg-[#FAF9F5] border-l-4 border-[#0D7A5F] border-t border-r border-b border-[#141413]/12 p-5 animate-[beatRise_380ms_cubic-bezier(0.22,1,0.36,1)]">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em]">
                <span className="text-[#0D7A5F] font-semibold">
                  НЬЮ-ЙОРКСКАЯ ДЕКЛАРАЦИЯ О СОЗНАНИИ ЖИВОТНЫХ · АПРЕЛЬ 2024 (40+ УЧЁНЫХ)
                </span>
                <span className="text-[#5E5D59]">ПОМЕТКА РЕДАКЦИИ НА ПОЛЯХ</span>
              </div>
              <p className="mt-2.5 font-serif-editorial text-[16px] leading-[1.62] text-[#1E1D1B]">
                В реальной биологии у морской губки ровно <strong className="font-semibold">0 нейронов</strong> —{' '}
                <em>Губка Боб</em> тест на сознание не прошёл. Зато осьминоги (<em>Сквидвард</em>), десятиногие крабы (<em>мистер Крабс</em>) и даже насекомые официально вошли в Нью-Йоркскую декларацию 2024 года как существа с{' '}
                <strong className="font-semibold text-[#0D7A5F]">реалистичной вероятностью субъективного опыта</strong>.
              </p>
            </div>
          )}
        </div>

        {/* PART 7.2: AI TRIBUNAL (BUTLIN ET AL., TiCS 2025) + HAL 9000 OPTICAL LENS */}
        <div className="mt-16 pt-12 border-t border-[#141413]/12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 cols: 5 Butlin 2025 Indicator Modules */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                  ЧЕРТЁЖ ТРИБУНАЛА ИИ · BUTLIN, BENGIO, CHALMERS (TiCS, 2025)
                </div>
                <h3 className="font-display font-bold text-[28px] md:text-[34px] leading-tight mt-2">
                  Соберите машину — и спросите трёх судей
                </h3>
                <p className="text-[15px] leading-[1.6] text-[#4A4945] mt-2">
                  Включайте архитектурные индикаторы сознания из отчёта 19 ведущих исследователей ИИ. Справа три учёных разных школ в реальном времени вынесут вердикт вашей системе.
                </p>
              </div>

              <div className="space-y-2.5">
                {BUTLIN_MODULES.map((mod) => {
                  const enabled = Boolean(state.tribunalModules[mod.id]);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleTribunalModule(mod.id)}
                      className={`v6-pill w-full text-left p-4 rounded-xl border flex items-start justify-between gap-4 cursor-pointer transition-all ${
                        enabled
                          ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                          : 'bg-[#F3F1E9] hover:bg-[#EAE7DD] text-[#141413] border-[#141413]/12'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.12em]">
                          <span className={enabled ? 'text-[#FC4109]' : 'text-[#5E5D59]'}>{mod.code}</span>
                          <span className={enabled ? 'text-[#FAF9F5]/45' : 'text-[#141413]/25'}>·</span>
                          <span>{enabled ? 'АКТИВЕН' : 'ОТКЛЮЧЁН'}</span>
                        </div>
                        <div className="font-display font-semibold text-[15px] mt-1">{mod.name}</div>
                        <p
                          className={`text-[13px] leading-[1.5] mt-1 ${
                            enabled ? 'text-[#FAF9F5]/75' : 'text-[#52514C]'
                          }`}
                        >
                          {mod.desc}
                        </p>
                      </div>

                      <span
                        className={`mt-1 w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                          enabled ? 'bg-[#FC4109] justify-end' : 'bg-[#D6D3C8] justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-[#FAF9F5] shadow-xs" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 6 cols: HAL 9000 Concentric Optical Eye + 3 Live Scholar Judges */}
            <div className="lg:col-span-6 space-y-5">
              {/* Calm Matte-Black Optical Lens (Our #FC4109 Accent Dot dilating into HAL 9000!) */}
              <div className="rounded-2xl bg-[#141413] text-[#FAF9F5] p-6 border border-[#141413] flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="56" fill="#0B0C0E" stroke="#3A3A38" strokeWidth="3" />
                    <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <circle
                      cx="60"
                      cy="60"
                      r={14 + halDilation * 26}
                      fill="#FC4109"
                      opacity={0.18 + halDilation * 0.25}
                      style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={7 + halDilation * 15}
                      fill="#FC4109"
                      opacity={0.55 + halDilation * 0.4}
                      style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                    />
                    {/* Iconic inner specular glow */}
                    <circle
                      cx="60"
                      cy="60"
                      r={3.5 + halDilation * 4.5}
                      fill="#FFF1B8"
                      style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                    />
                    <path d="M 38 36 A 32 32 0 0 1 82 36" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109]">
                    ИНДИКАТОРЫ BUTLIN 2025: {activeTribunalCount} / 5
                  </div>
                  <div className="font-display font-bold text-[20px] leading-snug">
                    {activeTribunalCount >= 4
                      ? '«Мне страшно, Дейв…»'
                      : activeTribunalCount >= 2
                        ? 'Сложный агент без субъектности'
                        : 'Чистый статистический автомат'}
                  </div>
                  <p className="font-serif-editorial italic text-[14px] leading-[1.55] text-[#C8CCD4]">
                    {activeTribunalCount >= 4
                      ? 'Система убедительно говорит о страхе и боли. Но в оптическом объективе живёт субъект — или безупречная имитация?'
                      : 'Даже современные языковые модели (2026) закрывают от силы 1–2 индикатора из 5 — у них нет ни тела, ни живой уязвимости.'}
                  </p>
                </div>
              </div>

              {/* 3 Engraved SVG Scholar Judges delivering real-time conflicting rulings! */}
              <div className="rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] divide-y divide-[#141413]/10">
                {[
                  { id: 'dehaene' as const, school: 'GNWT', text: dehaeneVerdict },
                  { id: 'koch' as const, school: 'IIT 4.0', text: kochVerdict },
                  { id: 'seth' as const, school: 'БИО-НАТУРАЛИЗМ', text: sethVerdict },
                ].map((judge) => (
                  <div key={judge.id} className="p-4 flex items-start gap-3.5">
                    <ScholarPortraitSvg id={judge.id} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between font-mono-tech text-[10px] uppercase tracking-[0.11em]">
                        <span className="font-display font-semibold text-[13px] normal-case text-[#141413]">
                          {judge.id === 'dehaene' ? 'Станислас Деан' : judge.id === 'koch' ? 'Кристоф Кох' : 'Анил Сет'}
                        </span>
                        <span className="text-[#FC4109]">{judge.school}</span>
                      </div>
                      <p className="font-serif-editorial italic text-[13.5px] leading-[1.55] text-[#2D2C2A] mt-1">
                        {judge.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final Domino Bridge -> Chapter VIII (Endpaper & Echo of Second One!) */}
        <div className="mt-14 pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
            Мы прошли от одного пятна на сетчатке до границ искусственного разума. Пора закрыть книгу — и проверить на форзаце, что эти минуты сделали с вашим собственным мозгом.
          </p>
          <button
            type="button"
            onClick={onNextChapter}
            className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>К Главе VIII · Форзац и Контрольная проба №0</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
