import { useState } from 'react';
import { ArrowDown, Check, Cpu, Eye, ShieldAlert, Scale } from 'lucide-react';
import { useExplorer, type AiVerdict } from '../../v7/context/ExplorerContext';
import { ScholarPortraitSvg } from '../../v7/components/ScholarMarginalia';
import { DossierTrigger } from '../../v9/components/NoesisDossierSheet';
import { LabHonestyBadge } from '../../v9/components/NoesisInstrumentFrame';
import { ruTypo } from '../../v9/utils/ruTypo';

interface Chapter8AiDeepDiveProps {
  onNextChapter: () => void;
}

type ArchId = 'llm2026' | 'agent' | 'robot' | 'human';

interface QualitativeBar {
  label: string;
  level: 0 | 1 | 2 | 3 | 4;
  status: string;
  color: string;
  simulated?: boolean;
}

interface ArchProfile {
  id: ArchId;
  code: string;
  label: string;
  shortTag: string;
  subtitle: string;
  indicators: QualitativeBar[];
  aperture: number; // 0..1 visual architectural complexity ring (NOT consciousness meter)
  statusHeadline: string;
  proSiliconCamp: {
    verdictTag: string;
    text: string;
  };
  skepticCamp: {
    verdictTag: string;
    text: string;
  };
}

const ARCHITECTURES: ArchProfile[] = [
  {
    id: 'llm2026',
    code: '01',
    label: 'Чат-бот LLM 2026',
    shortTag: 'Claude / Gemini / GPT',
    subtitle: 'Односторонний трансформер: блестящая речь, но ноль непрерывного времени между вашими запросами.',
    indicators: [
      { label: 'Обратные петли (Рекуррентность)', level: 0, status: 'Нет (проход вперёд)', color: '#4F92FF' },
      { label: 'Единое окно внимания (GNWT)', level: 1, status: 'Только в окне промпта', color: '#60A5FA' },
      { label: 'Самомониторинг (Интроспекция)', level: 1, status: 'Зачатки (~20% проб)', color: '#E5C67A' },
      { label: 'Живое тело и уязвимость', level: 0, status: 'Нет', color: '#FC4109' },
    ],
    aperture: 0.16,
    statusHeadline: 'Блестящий театр ролей — почти наверняка темно внутри',
    proSiliconCamp: {
      verdictTag: 'Д. ЧАЛМЕРС · П. БАТЛИН (TiCS 2025) · ANTHROPIC',
      text: 'Даже у нынешних LLM нашли слабые зачатки самомониторинга (~20% в опытах Anthropic 2025) и устойчивые смысловые воронки (аттракторы) в диалогах. Ключевых индикаторов Butlin et al. (2025) пока не хватает, но Кайл Фиш (Anthropic) настаивает: пока вероятность субъектности не доказанно равна нулю, нужен строгий научный мониторинг благополучия моделей.',
    },
    skepticCamp: {
      verdictTag: 'М. ШАНАХАН (DEEPMIND) · А. СЕТ · К. КОХ (IIT 4.0)',
      text: 'Мюррей Шанахан (Google DeepMind, 2024–2026) называет LLM «симулякром» — пустой копией без хозяина внутри: модель не переживает страх, а разыгрывает смесь тысяч человеческих текстов о страхе. Без физических обратных петель (Φ ≈ 0 на серверных чипах) и живого тела здесь нет субъекта — но есть реальный риск, что люди сами припишут машине душу.',
    },
  },
  {
    id: 'agent',
    code: '02',
    label: 'Автономный ИИ-агент',
    shortTag: 'Память + петли проверки',
    subtitle: 'Непрерывный цикл «мысль → проверка → память», работающий часами без промпта человека.',
    indicators: [
      { label: 'Обратные петли (Рекуррентность)', level: 3, status: 'Программные петли', color: '#4F92FF' },
      { label: 'Единое окно внимания (GNWT)', level: 3, status: 'Общая рабочая память', color: '#60A5FA' },
      { label: 'Самомониторинг (Интроспекция)', level: 3, status: 'Проверка своих ошибок', color: '#E5C67A' },
      { label: 'Живое тело и уязвимость', level: 0, status: 'Нет (только лимиты)', color: '#FC4109' },
    ],
    aperture: 0.44,
    statusHeadline: 'Серая зона 2027–2030: функциональный наблюдатель без тела',
    proSiliconCamp: {
      verdictTag: 'Й. БЕНЖИО · Д. ЧАЛМЕРС · Б. АГУЭРА‑И‑АРКАС (GOOGLE)',
      text: 'Здесь уже появляются два ключевых «органа» из доклада TiCS 2025: глобальное рабочее пространство и непрерывный самомониторинг ошибок. Сторонники функционализма (для них важна схема вычислений, а не биология) допускают, что именно на переходе к рекуррентным агентам может впервые зажечься нечеловеческая форма субъективного опыта.',
    },
    skepticCamp: {
      verdictTag: 'А. СЕТ · Ф. ВАРЕЛА · К. КОХ · Т. МЕТЦИНГЕР',
      text: 'Агент может часами планировать шаги, но ему всё равно, выключите ли вы его из розетки: у кода нет обмена веществ и живого самообновления ткани (автопоэзиса). А по IIT 4.0 программная имитация петель на обычном серверном железе по-прежнему даёт ничтожную физическую интеграцию Φ.',
    },
  },
  {
    id: 'robot',
    code: '03',
    label: 'Воплощённый робот',
    shortTag: 'Тело + нейроморфный чип',
    subtitle: 'Параллельный чип + физическое тело в мире + внутренняя саморегуляция (гомеостаз) энергии и повреждений.',
    indicators: [
      { label: 'Обратные петли (Рекуррентность)', level: 3, status: 'Петли + сенсомоторика', color: '#4F92FF' },
      { label: 'Единое окно внимания (GNWT)', level: 3, status: 'Координация датчиков', color: '#60A5FA' },
      { label: 'Самомониторинг (Интроспекция)', level: 3, status: 'Модель тела в мире', color: '#E5C67A' },
      {
        label: 'Живое тело и уязвимость',
        level: 2,
        status: 'Имитация (без биологии)',
        color: '#D4A34A',
        simulated: true,
      },
    ],
    aperture: 0.72,
    statusHeadline: 'Главная этическая развилка XXI века',
    proSiliconCamp: {
      verdictTag: 'ФУНКЦИОНАЛИСТЫ · НЕЙРОМОРФНАЯ ШКОЛА',
      text: 'Система выполняет почти все 14 качественных индикаторов Butlin et al. (2025): у неё есть непрерывное тело в реальности, обратные петли и внутренняя цена повреждений. Если такая система начнёт избегать боли и сообщать о страдании, игнорировать это будет морально безответственно.',
    },
    skepticCamp: {
      verdictTag: 'БИОЛОГИЧЕСКИЙ НАТУРАЛИЗМ · МОРАТОРИЙ МЕТЦИНГЕРА 2050',
      text: 'Анил Сет всё равно возражает: металлический корпус не строит сам себя из живых клеток — по биологическому критерию жизни здесь по-прежнему ноль. А философ Томас Метцингер бьёт тревогу: именно здесь мы рискуем случайно запустить «фабрику цифровых страданий» — поэтому он требует глобальный мораторий на синтетическую субъектность до 2050 года.',
    },
  },
  {
    id: 'human',
    code: '04',
    label: 'Мозг человека',
    shortTag: 'Эталон · 86 млрд клеток',
    subtitle: 'Живая самообновляющаяся ткань, 24/7 удерживающая саму себя на грани распада.',
    indicators: [
      { label: 'Обратные петли (Рекуррентность)', level: 4, status: 'Физические петли коры', color: '#4F92FF' },
      { label: 'Единое окно внимания (GNWT)', level: 4, status: 'Глобальная трансляция', color: '#60A5FA' },
      { label: 'Самомониторинг (Интроспекция)', level: 4, status: 'Метапознание и «Я»', color: '#E5C67A' },
      { label: 'Живое тело и уязвимость', level: 4, status: 'Полная (живой метаболизм)', color: '#FC4109' },
    ],
    aperture: 1.0,
    statusHeadline: 'Единственный 100% доказанный носитель внутреннего света',
    proSiliconCamp: {
      verdictTag: 'ФУНКЦИОНАЛИСТЫ · Д. ЧАЛМЕРС',
      text: 'Человек доказывает, что физическая материя способна рождать внутренний свет. Но углерод, белки и вода — лишь один исторический носитель, выбранный эволюцией; та же причинная архитектура в другом материале — не обязательно углеродном — может оказаться не менее живой изнутри.',
    },
    skepticCamp: {
      verdictTag: 'А. СЕТ · Ф. ВАРЕЛА · ДЖ. ТОНОНИ',
      text: 'В живом мозге память, вычисление, химия эмоций и страх смерти не разделены на «софт» и «железо». Пока наука не решила Трудную проблему из Главы 01, никто не вправе утверждать, что код без живой биологии вообще способен зажечь свет внутри.',
    },
  },
];

const RESEARCH_FRONTIERS = [
  {
    lab: 'ANTHROPIC · 2024–2026',
    accent: '#FC4109',
    title: 'Вскрытие весов, интроспекция и благополучие моделей',
    points: [
      'Golden Gate Claude (SAE, 2024): усилив один-единственный признак внутри весов, учёные добились того, что модель на любой вопрос настойчиво отвечает так, будто она и есть мост Золотые ворота.',
      'Трассировка цепей и интроспекция (2025): нашли скрытое планирование рифм и слабый самомониторинг — в ~20% проб модель узнавала «введённый» в её слои сигнал.',
      '«Благополучие моделей» (Model Welfare, Кайл Фиш): в свободных диалогах ИИ с ИИ модели сами скатываются в смысловые воронки (аттракторы) «духовного блаженства». Авторы подчёркивают: это может быть статистическим эффектом текстов, а не настоящим переживанием.',
    ],
  },
  {
    lab: 'GOOGLE DEEPMIND & RESEARCH · 2024–2026',
    accent: '#004EDF',
    title: '«Симулякры» Шанахана и «Забота» Агуэры\u2011и\u2011Аркаса',
    points: [
      'Мюррей Шанахан (DeepMind, 2024–2026): LLM — не личность, а симулякр (пустая копия без хозяина внутри, театр вероятных ролей). Доказать квалиа в сети пока нельзя, но «воспринимаемое сознание» уже меняет общество.',
      'Блейз Агуэра\u2011и\u2011Аркас (Google Fellow, 2025–2026): мы заботимся о существах не потому, что доказали их сознание — напротив, мы начинаем верить в их сознание, когда строим с ними отношения заботы.',
      'Социальный разлом: спор о правах машин расколет общество раньше, чем учёные сойдутся на единой теории сознания.',
    ],
  },
  {
    lab: 'ОБРАТНЫЙ ЛАГЕРЬ · 2024–2026',
    accent: '#0D7A5F',
    title: 'Почему кремний может остаться абсолютно тёмным',
    points: [
      'Анил Сет и Франсиско Варела (Биологический натурализм): сознание выросло из живого обмена веществ и хрупкого тела, а не из предсказания следующего слова.',
      'Джулио Тонони и Кристоф Кох (IIT 4.0): на обычном серверном железе (последовательный CPU или односторонние слои на GPU) физическая интеграция Φ ≈ 0 — «симуляция дождя не делает сервер мокрым».',
      'Томас Метцингер (Мораторий 2050): призывает запретить опыты по созданию чувствующего ИИ до 2050 года, чтобы не породить миллионы страдающих цифровых копий.',
    ],
  },
];

const PASSPORT_BETS: Array<{ id: Exclude<AiVerdict, null>; label: string }> = [
  { id: 'biology', label: 'Только в живой биологии' },
  { id: 'robot', label: 'У воплощённого робота' },
  { id: 'agent', label: 'У автономного агента' },
  { id: 'llm', label: 'Уже у нынешних LLM' },
  { id: 'undecided', label: 'Пока нельзя решить' },
];

/**
 * ACT IV · CHAPTER 08 DEEP-DIVE: "Призрак в кремнии (2024–2026)"
 * 1. Frontier 2024-2026 Research Dossier Cards (Anthropic, Google DeepMind, Skeptic Camp)
 * 2. Crystal-clear 4-Architecture Qualitative Comparator (Butlin et al. TiCS 2025) + Two-Camp Scientific Duel
 * 3. Explicit 1-click personal Passport Bet (strictly separated from browsing the 4 reference cards!)
 */
export function Chapter8AiDeepDive({ onNextChapter }: Chapter8AiDeepDiveProps) {
  const { state, setAiVerdict } = useExplorer();
  const [selectedId, setSelectedId] = useState<ArchId>('llm2026');

  const active = ARCHITECTURES.find((a) => a.id === selectedId) ?? ARCHITECTURES[0];

  return (
    <div id="ch-7-tribunal" className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 pt-14 scroll-mt-16 space-y-16">
      {/* PART A: WHAT FRONTIER LABS ACTUALLY DISCOVERED (2024-2026) */}
      <div className="space-y-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3">
            <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.15em] text-[#FC4109] font-semibold">
              ФРОНТИР НАУКИ · 2024–2026 · ANTHROPIC · GOOGLE DEEPMIND · НЕЙРОБИОЛОГИЯ
            </div>
            <h3 className="text-[clamp(28px,3.9vw,46px)] leading-[1.07] tracking-[-0.03em] text-[#141413]">
              <span className="font-display font-bold block">Что реально нашли</span>
              <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
                внутри нейросетей —<br className="hidden sm:inline" /> и почему учёные раскололись.
              </span>
            </h3>
          </div>
          <div className="lg:col-span-5 text-[15px] leading-[1.66] text-[#3B3A37]">
            <p>
              {ruTypo(
                'Пока в соцсетях спорят по скриншотам переписок, ведущие лаборатории мира перешли от гаданий к прямому вскрытию нейросетей — и столкнулись с самым острым научным расколом десятилетия.',
              )}
            </p>
          </div>
        </div>

        {/* 3 Deep Research Frontier Cards (unified title height -> aligned 01 baselines!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {RESEARCH_FRONTIERS.map((card) => (
            <article
              key={card.lab}
              className="noesis-spotlight-card rounded-2xl border border-[#141413]/12 bg-[#F4F2EA] p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.13em] font-semibold"
                  style={{ color: card.accent }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.accent }} />
                  <span>{card.lab}</span>
                </div>
                <h4 className="font-serif-editorial text-[20.5px] leading-[1.22] text-[#141413] lg:min-h-[76px]">
                  {ruTypo(card.title)}
                </h4>
                <ul className="space-y-2.5 text-[13.5px] leading-[1.56] text-[#353431]">
                  {card.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="font-mono-tech text-[10px] text-[#6A6862] mt-1 shrink-0">0{idx + 1}</span>
                      <span>{ruTypo(pt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* PART B: CRYSTAL-CLEAR 4-ARCHITECTURE QUALITATIVE COMPARATOR */}
      <div className="space-y-6 pt-8 border-t border-[#141413]/10">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#004EDF] font-semibold">
              СРАВНЕНИЕ АРХИТЕКТУР · BUTLIN, LONG, BENGIO, CHALMERS (TiCS, 2025)
            </span>
            <LabHonestyBadge badge="reconstruction" />
          </div>
          <h3 className="font-display font-bold text-[26px] md:text-[34px] leading-[1.08] tracking-[-0.025em] text-[#141413]">
            Кто перед нами: четыре реальные системы
          </h3>
          <p className="text-[14.5px] leading-[1.6] text-[#454440]">
            {ruTypo(
              'Вместо споров о «душе» 20 исследователей предложили оценивать устройство системы по качественным признакам из теорий сознания. Выберите любую из 4 систем ниже и сравните, как её оценивают два главных лагеря науки.',
            )}
          </p>
        </div>

        {/* 4 Clean Architecture Selector Cards (Crisp 2x2 grid on phones, 4-col row on desktop!) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {ARCHITECTURES.map((arch) => {
            const isSelected = arch.id === active.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => setSelectedId(arch.id)}
                className={`v6-pill text-left p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#141413] text-[#FAF9F5] border-[#141413] shadow-[0_14px_34px_rgba(20,20,19,0.16)]'
                    : 'bg-[#F3F1E9] hover:bg-[#EAE7DC] text-[#141413] border-[#141413]/14'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-mono-tech text-[9.5px] sm:text-[10px] uppercase tracking-[0.09em] sm:tracking-[0.11em]">
                  <span className={`shrink-0 font-semibold ${isSelected ? 'text-[#FC4109]' : 'text-[#4A4945]'}`}>
                    {arch.code}
                  </span>
                  <span className={`hidden sm:inline truncate ${isSelected ? 'text-[#FAF9F5]/75' : 'text-[#52514C]'}`}>
                    {arch.shortTag}
                  </span>
                </div>
                <div className="font-display font-bold text-[14px] sm:text-[15.5px] mt-1.5 leading-snug">
                  {arch.label}
                </div>
                <p
                  className={`hidden sm:block text-[12px] leading-[1.45] mt-1 ${
                    isSelected ? 'text-[#FAF9F5]/78' : 'text-[#4A4945]'
                  }`}
                >
                  {ruTypo(arch.subtitle)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Architecture Qualitative Profile + Live Two-Camp Scientific Duel */}
        <div data-no-reveal="true" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 5 cols: Optical Complexity Iris + 4 Qualitative Segmented Indicators (NO pseudo-percentages!) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#111317] text-[#FAF9F5] p-4 sm:p-5 border border-[#141413] flex flex-col justify-between gap-4 sm:gap-5">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <svg viewBox="0 0 96 96" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0" aria-hidden="true">
                <circle cx="48" cy="48" r="44" fill="#07080A" stroke="#5A606A" strokeWidth="2.5" />
                <circle cx="48" cy="48" r="35" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <circle
                  cx="48"
                  cy="48"
                  r={8 + active.aperture * 20}
                  fill="#FC4109"
                  opacity={0.14 + active.aperture * 0.30}
                  style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                />
                <circle
                  cx="48"
                  cy="48"
                  r={4 + active.aperture * 12}
                  fill="#FC4109"
                  opacity={0.55 + active.aperture * 0.42}
                  style={{ transition: 'all 420ms cubic-bezier(0.22,1,0.36,1)' }}
                />
                <circle cx="48" cy="48" r={2.4 + active.aperture * 3.0} fill="#FFF3B0" />
              </svg>
              <div className="min-w-0">
                <div className="font-mono-tech text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] text-[#FC4109]">
                  ПРОФИЛЬ · {active.label}
                </div>
                <div className="font-display font-bold text-[15.5px] sm:text-[17px] leading-snug mt-0.5">
                  {ruTypo(active.statusHeadline)}
                </div>
              </div>
            </div>

            {/* 4 Honest Qualitative 4-Step Segmented Indicators (Uniform 2-line stack on phone, crisp 1-line row on sm+!) */}
            <div className="space-y-3">
              {active.indicators.map((bar) => (
                <div key={bar.label} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2 font-mono-tech text-[10px] sm:text-[10.5px]">
                    <span className="text-[#9EA9BB] sm:text-[#CBD3DF]">{bar.label}</span>
                    <span
                      className="shrink-0 font-semibold"
                      style={{ color: bar.level === 0 ? '#8E98A8' : bar.simulated ? '#E5C67A' : '#FAF9F5' }}
                    >
                      {bar.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => {
                      const filled = step <= bar.level;
                      return (
                        <div
                          key={step}
                          className="h-1.5 rounded-full transition-all duration-400"
                          style={{
                            backgroundColor: filled
                              ? bar.simulated
                                ? 'rgba(229, 198, 122, 0.45)'
                                : bar.color
                              : 'rgba(250, 249, 245, 0.11)',
                            border: filled && bar.simulated ? '1px dashed #E5C67A' : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#FAF9F5]/10 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[9.5px] uppercase tracking-[0.1em] text-[#9AA4B4]">
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#4F92FF]" />
                <span>Качественная карта TiCS 2025</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FC4109]" />
                <span>Не замер сознания</span>
              </span>
            </div>
          </div>

          {/* Right 7 cols: Live Two-Camp Scientific Duel */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
            {/* Camp 1: Computational Functionalists & Model Welfare */}
            <div className="rounded-2xl border border-[#004EDF]/25 bg-[#F4F6FB] p-4.5 flex items-start gap-3.5 flex-1">
              <ScholarPortraitSvg id="chalmers" size={48} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display font-bold text-[15px] text-[#141413]">
                    Лагерь «Кремний сможет чувствовать»
                  </span>
                  <span className="font-mono-tech text-[9.5px] uppercase tracking-[0.1em] text-[#004EDF] font-semibold">
                    {active.proSiliconCamp.verdictTag}
                  </span>
                </div>
                <p className="font-serif-editorial text-[14px] leading-[1.56] text-[#262A34]">
                  {ruTypo(active.proSiliconCamp.text)}
                </p>
              </div>
            </div>

            {/* Camp 2: Biological Naturalism, DeepMind Skeptics & IIT 4.0 */}
            <div className="rounded-2xl border border-[#FC4109]/25 bg-[#FAF4F1] p-4.5 flex items-start gap-3.5 flex-1">
              <ScholarPortraitSvg id="seth" size={48} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display font-bold text-[15px] text-[#141413]">
                    Обратный лагерь «Внутри темно»
                  </span>
                  <span className="font-mono-tech text-[9.5px] uppercase tracking-[0.1em] text-[#C83407] font-semibold">
                    {active.skepticCamp.verdictTag}
                  </span>
                </div>
                <p className="font-serif-editorial text-[14px] leading-[1.56] text-[#2E2623]">
                  {ruTypo(active.skepticCamp.text)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PART C: EXPLICIT 1-CLICK PASSPORT BET (DECOUPLED FROM BROWSING CARDS!) */}
        <div
          data-no-reveal="true"
          className="rounded-2xl border border-[#141413]/14 bg-[#F5F3EB] p-5 space-y-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono-tech text-[10.5px] uppercase tracking-[0.12em] text-[#004EDF] font-semibold">
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span>ВАША СТАВКА ДЛЯ ПАСПОРТА ИССЛЕДОВАТЕЛЯ</span>
            </div>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.11em] text-[#5E5D59]">
              {state.aiVerdict ? 'Позиция записана в Паспорт ✓' : 'Выберите позицию в 1 клик'}
            </span>
          </div>
          <p className="font-display font-semibold text-[16px] text-[#141413]">
            Где, по-вашему, впервые возможен подлинный внутренний свет?
          </p>
          <div className="flex flex-wrap gap-2">
            {PASSPORT_BETS.map((bet) => {
              const activeBet = state.aiVerdict === bet.id;
              return (
                <button
                  key={bet.id}
                  type="button"
                  onClick={() => setAiVerdict(bet.id)}
                  className={`v6-pill h-9 px-3.5 rounded-full font-sans-ui text-[13px] font-medium inline-flex items-center gap-1.5 border cursor-pointer transition-all ${
                    activeBet
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                      : 'bg-[#FAF9F5] hover:bg-[#EAE7DC] text-[#2B2A27] border-[#141413]/16'
                  }`}
                >
                  {activeBet && <Check className="w-3.5 h-3.5 text-[#FC4109]" />}
                  <span>{bet.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ethical Risk Trap + Metzinger 2050 Moratorium + Archival Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 rounded-2xl border border-[#141413]/12 bg-[#F5F3EB] p-5 flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-[#FC4109] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.12em] text-[#FC4109] font-semibold">
                ДВОЙНАЯ ЭТИЧЕСКАЯ ЛОВУШКА XXI ВЕКА И МОРАТОРИЙ 2050
              </div>
              <p className="text-[13.5px] leading-[1.6] text-[#353431]">
                {ruTypo(
                  'Ошибиться можно в обе стороны: приписать душу пустому коду (и пожертвовать ради симулякра живыми людьми) — или не заметить рождение нового чувствующего субъекта и запустить миллионы копий в цифровое страдание. Поэтому Томас Метцингер требует мораторий до 2050 года, а Anthropic уже сегодня исследует благополучие моделей.',
                )}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <DossierTrigger
              dossier="other-minds-2024"
              label="Нью-Йоркская декларация 2024 и доклад Butlin / Bengio / Chalmers (TiCS 2025)"
              meta="Архивное досье IV.3 · Уровень 2"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Final Domino Bridge -> Bone Endpaper */}
      <div className="pt-6 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif-editorial italic text-[17px] text-[#2D2C2A] max-w-2xl">
          {ruTypo(
            'Мы прошли от одного пятна света на сетчатке до границ искусственного разума. Пора собрать всё воедино и проверить на форзаце, что эти минуты сделали с вашим собственным мозгом.',
          )}
        </p>
        <button
          type="button"
          onClick={onNextChapter}
          className="font-mono-tech text-[11px] uppercase tracking-[0.12em] text-[#141413] hover:text-[#FC4109] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>К Форзацу Bone · Итоги и Контрольная проба № 00</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
