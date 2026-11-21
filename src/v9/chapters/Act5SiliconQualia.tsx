import { useState } from 'react';
import { Cpu, Flame, MessageSquareText, Sprout } from 'lucide-react';
import { NoesisInstrumentFrame } from '../components/NoesisInstrumentFrame';
import { DossierTrigger } from '../components/NoesisDossierSheet';
import { NoesisBrainStage3D } from '../../v10/webgl/NoesisBrainStage3D';
import { ruTypo } from '../utils/ruTypo';

type SiliconLens = 'chalmers' | 'iit_cpu' | 'varela';

/**
 * ACT V · COMPACT HIGH-IMPACT AI BLOCK (Audit-trimmed from 6 redundant widgets to 2 razor-sharp strikes):
 * 1. Compact Strike 1: Turing 2025 (73% with persona vs 36% without) + Searle's Chinese Room + Engineering Dossier V.A (SAE / Circuit Tracing / Introspection ~20% / Metzinger 2050).
 * 2. Strike 2 (HERO 3D INSTRUMENT OF ACT V): Chalmers Fading Qualia (0% -> 100% block-by-block 3D MRI silicon replacement) + invariant speech readout + 3-school lens (Chalmers vs IIT Hardware vs Varela Autopoiesis)!
 */
export function Act5SiliconQualia() {
  const [siliconPct, setSiliconPct] = useState(0);
  const [lens, setLens] = useState<SiliconLens>('chalmers');

  const qualiaIntensity = (() => {
    if (lens === 'chalmers') return 100; // Organizational invariance: identical functional role -> identical bright red!
    if (lens === 'iit_cpu') {
      // Sequential CPU collapses Phi steeply even with identical input/output!
      return Math.max(2, Math.round(100 * Math.pow(1 - siliconPct / 100, 1.85)));
    }
    // Varela Autopoiesis: biological self-maintenance & vulnerability vanish as organic tissue is replaced
    return Math.max(0, Math.round(100 - siliconPct));
  })();

  const lensCopy: Record<
    SiliconLens,
    { tag: string; title: string; verdict: string; accent: string }
  > = {
    chalmers: {
      tag: 'Д. ЧАЛМЕРС · ОРГАНИЗАЦИОННАЯ ИНВАРИАНТНОСТЬ (1995)',
      title: 'Если речь и поведение не меняются — опыт не может тайно «погаснуть»',
      verdict:
        'Чалмерс ставит ловушку: допустим, на 50% кремния субъект стал видеть тускло-розовый вместо алого, но при этом продолжает горячо клясться «я вижу яркий алый!». Тогда его собственное сознание полностью оторвалось от его суждений и памяти — а это абсурд. Значит, при сохранении точной архитектуры связей опыт сохраняется и в кремнии.',
      accent: '#004EDF',
    },
    iit_cpu: {
      tag: 'ДЖ. ТОНОНИ · IIT: НЕЙРОМОРФНЫЙ ЧИП ПРОТИВ ОБЫЧНОГО CPU',
      title: 'То же поведение на последовательном процессоре роняет Φ почти до нуля',
      verdict:
        'Теория интегрированной информации возражает: два устройства могут выдавать одинаковые ответы, но иметь разную физическую причинную структуру. Если заменить живые параллельные нейроны последовательной симуляцией на обычном сервере (CPU/GPU), реальная интеграция Φ обрушится — снаружи останутся те же слова, внутри наступит темнота.',
      accent: '#FC4109',
    },
    varela: {
      tag: 'Ф. ВАРЕЛА & А. СЕТ · БИОЛОГИЧЕСКИЙ АВТОПОЭЗИС (1974 → 2024)',
      title: 'Живая клетка боится умереть — кремниевой матрице всё равно',
      verdict:
        'Франсиско Варела и Анил Сет напоминают: живой мозг не просто «считает функции» — каждая клетка каждую секунду сама строит и чинит себя на грани распада (автопоэзис). По их гипотезе, субъективность корнями уходит в эту биологическую уязвимость. Выключи обмен веществ — и останется безупречный, но пустой двойник.',
      accent: '#0D7A5F',
    },
  };

  const activeLens = lensCopy[lens];

  return (
    <div className="max-w-[1240px] mx-auto px-5 md:px-12 lg:px-20 mt-18 md:mt-24 space-y-14">
      {/* STRIKE 1: COMPACT TURING 2025 (73% vs 36%) + SEARLE'S CHINESE ROOM + ENGINEERING DOSSIER V.A */}
      <div className="rounded-2xl border border-[#141413]/14 bg-[#F3F1E9] p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
            ГРАНИЦА МАШИН · ПОЧЕМУ ТЕСТ ТЬЮРИНГА СЛОМАЛСЯ (2025)
          </div>
          <h3 className="font-serif-editorial text-[26px] md:text-[34px] leading-[1.12] tracking-[-0.02em] text-[#141413]">
            {ruTypo('Убедительная речь давно перестала быть уликой сознания')}
          </h3>
          <p className="text-[14.5px] leading-[1.66] text-[#353431]">
            {ruTypo(
              'Ещё в 1980 году Джон Сёрл предложил «Китайскую комнату»: человек внутри не знает ни иероглифа, но по толстой книге правил выдаёт безупречные ответы наружу. В 2025 году эксперимент Jones & Bergen (UCSD) подтвердил эту трещину вживую: модель принимали за человека в ',
            )}
            <strong className="font-semibold text-[#141413]">73% случаев</strong>
            {ruTypo(
              ' — но лишь когда ей велели играть роль конкретного интроверта с интернет-сленгом (persona-промпт). Стоило убрать театральную маску, и результат рухнул до ',
            )}
            <strong className="font-semibold text-[#141413]">36%</strong>.
          </p>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 font-mono-tech">
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#FC4109]/35">
              <div className="text-[10px] uppercase tracking-[0.11em] text-[#FC4109] font-semibold">
                С PERSONA-ПРОМПТОМ
              </div>
              <div className="font-serif-display text-[34px] leading-none text-[#141413] mt-2">73%</div>
              <p className="font-sans-ui text-[12px] leading-[1.45] text-[#4F4E4A] mt-2">
                Люди принимали ИИ за живого собеседника чаще, чем реальных людей.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#141413]/14">
              <div className="text-[10px] uppercase tracking-[0.11em] text-[#5E5D59] font-semibold">
                БЕЗ РОЛЕВОЙ МАСКИ
              </div>
              <div className="font-serif-display text-[34px] leading-none text-[#5E5D59] mt-2">36%</div>
              <p className="font-sans-ui text-[12px] leading-[1.45] text-[#4F4E4A] mt-2">
                Без актёрской инструкции иллюзия живого субъекта рассыпается вдвое.
              </p>
            </div>
          </div>

          <DossierTrigger
            dossier="ai-mechanistic-2026"
            label="Вскрытие трансформеров 2024–2026: «Мост Золотые ворота», Circuit Tracing, интроспекция ~20% и мораторий Метцингера 2050"
            meta="Инженерное досье IV.2 · Уровень 2"
            className="w-full"
          />
        </div>
      </div>

      {/* STRIKE 2 (HERO 3D INSTRUMENT OF ACT V): CHALMERS FADING QUALIA (0% -> 100% SILICON) + VARELA AUTOPOIESIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[#FC4109] font-semibold">
            МЫСЛЕННЫЙ ЭКСПЕРИМЕНТ · ВЫЦВЕТАЮЩИЕ КВАЛИА (1995)
          </div>
          <h3 className="text-[clamp(28px,3.8vw,44px)] leading-[1.08] tracking-[-0.028em]">
            <span className="font-display font-bold block text-[#141413]">Заменим ваш мозг</span>
            <span className="font-serif-display italic font-normal text-[#30302E] block mt-1">
              нейрон за нейроном на кремний.
            </span>
          </h3>
          <p className="text-[15px] leading-[1.68] text-[#353431]">
            {ruTypo(
              'Представьте, что врачи заменяют участки вашей коры микросхемами, в точности повторяющими электрический вход и выход живых клеток. Сдвигайте ползунок справа от 0% к 100% — и посмотрите, как три главные школы науки отвечают на вопрос: ',
            )}
            <strong className="font-semibold text-[#141413]">
              в какой момент погаснет ваш внутренний свет?
            </strong>
          </p>

          {/* 3-School Lens Switcher */}
          <div className="space-y-2">
            {(
              [
                { id: 'chalmers', icon: Cpu, label: '1. Чалмерс · Функционализм (опыт сохраняется)' },
                { id: 'iit_cpu', icon: Flame, label: '2. Тонони · IIT (на обычном CPU гаснет)' },
                { id: 'varela', icon: Sprout, label: '3. Варела · Автопоэзис (нужна живая ткань)' },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = lens === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLens(opt.id)}
                  className={`v6-pill w-full text-left px-4 py-3 rounded-xl border text-[13px] font-medium flex items-center gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                      : 'bg-[#F3F1E9] hover:bg-[#EAE7DC] text-[#141413] border-[#141413]/12'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#FC4109]' : 'text-[#5E5D59]'}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-[#F3F1E9] border border-[#141413]/12 p-4 space-y-1.5">
            <div
              className="font-mono-tech text-[10px] uppercase tracking-[0.12em] font-semibold"
              style={{ color: activeLens.accent }}
            >
              {activeLens.tag}
            </div>
            <div className="font-display font-bold text-[14.5px] text-[#141413] leading-snug">
              {ruTypo(activeLens.title)}
            </div>
            <p className="text-[13px] leading-[1.58] text-[#3B3A37]">{ruTypo(activeLens.verdict)}</p>
          </div>
        </div>

        {/* Right 7 cols: Real 3D MRI Silicon Phase-Transition Shader + Invariant Speech vs Subjective Qualia Meter */}
        <div className="lg:col-span-7">
          <NoesisInstrumentFrame
            code="ПРИБОР IV.2 · 3D КРИСТАЛЛИЗАЦИЯ КОРЫ (ВЫЦВЕТАЮЩИЕ КВАЛИА)"
            badge="reconstruction"
            telemetry={`КРЕМНИЙ: ${siliconPct}% · ЖИВАЯ ТКАНЬ: ${100 - siliconPct}%`}
            surface="vellum"
            footnote="Chalmers (1995) · Tononi (IIT) · Maturana & Varela (Автопоэзис) · МРТ-атлас ICBM152"
          >
            <div className="space-y-4">
              {/* Live Anatomical 3D MRI Brain with Architectural Micro-Voxel Silicon Replacement Shader! */}
              <div className="rounded-xl border border-[#141413]/14 bg-[#FAF9F5] overflow-hidden">
                <NoesisBrainStage3D
                  mode="silicon"
                  progress={siliconPct / 100}
                  className="w-full h-[360px] sm:h-[420px]"
                  caption="МРТ-АТЛАС ICBM152 · ПОБЛОЧНАЯ КРИСТАЛЛИЗАЦИЯ КОРЫ В КРЕМНИЙ"
                />
              </div>

              {/* Silicon Replacement Slider */}
              <div className="rounded-xl bg-[#FAF9F5] border border-[#141413]/12 p-4 space-y-2">
                <div className="flex items-center justify-between font-mono-tech text-[10.5px] uppercase tracking-[0.11em]">
                  <span className="text-[#141413] font-semibold">ДОЛЯ КРЕМНИЕВЫХ БЛОКОВ:</span>
                  <span className="text-[#FC4109] font-bold">{siliconPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={siliconPct}
                  onChange={(e) => setSiliconPct(Number(e.target.value))}
                  className="w-full accent-[#FC4109] cursor-pointer"
                  aria-label="Доля замены коры на кремний от 0 до 100 процентов"
                />
                <div className="flex justify-between font-mono-tech text-[9.5px] uppercase text-[#5E5D59]">
                  <span>0% · живой мозг</span>
                  <span>50% · гибрид</span>
                  <span>100% · чистый кремний</span>
                </div>
              </div>

              {/* Split Readout: External Speech (100% Invariant!) vs Internal Qualia (Depends on School!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#141413] text-[#FAF9F5] space-y-1.5">
                  <div className="font-mono-tech text-[9.5px] uppercase tracking-[0.12em] text-[#9AA3B2] inline-flex items-center gap-1.5">
                    <MessageSquareText className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>ВНЕШНИЙ ОТЧЁТ (НЕИЗМЕНЕН!)</span>
                  </div>
                  <p className="font-serif-editorial italic text-[15px] leading-snug text-[#FAF9F5]">
                    «Я по-прежнему вижу ослепительно яркий алый цвет — ничего не изменилось!»
                  </p>
                  <div className="font-mono-tech text-[9.5px] text-[#34D399]">
                    ПОВЕДЕНИЕ И РЕЧЬ: 100% ИДЕНТИЧНЫ
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#141413]/14 space-y-2">
                  <div className="flex items-center justify-between font-mono-tech text-[9.5px] uppercase tracking-[0.12em] text-[#5E5D59]">
                    <span>ВНУТРЕННИЙ СВЕТ (ПО ВЫБРАННОЙ ШКОЛЕ)</span>
                    <strong className="text-[#141413]">{qualiaIntensity}%</strong>
                  </div>
                  <div className="h-6 rounded-lg border border-[#141413]/14 overflow-hidden bg-[#141413] flex items-center px-2.5">
                    <div
                      className="h-3 rounded-sm transition-all duration-300"
                      style={{
                        width: `${Math.max(4, qualiaIntensity)}%`,
                        backgroundColor: `rgba(252, 65, 9, ${0.15 + (qualiaIntensity / 100) * 0.85})`,
                      }}
                    />
                  </div>
                  <div className="font-mono-tech text-[9.5px] text-[#5E5D59]">
                    {qualiaIntensity >= 90
                      ? 'КВАЛИА АЛОГО ПОЛНОСТЬЮ СОХРАННЫ'
                      : qualiaIntensity > 15
                        ? 'ПАРАДОКС: ВНУТРИ ТУСКНЕЕТ, СНАРУЖИ КЛЯНЁТСЯ В ЯРКОСТИ'
                        : 'ВНУТРИ ПОЛНАЯ ТЕМНОТА ПРИ ИДЕАЛЬНОЙ РЕЧИ'}
                  </div>
                </div>
              </div>
            </div>
          </NoesisInstrumentFrame>
        </div>
      </div>
    </div>
  );
}
