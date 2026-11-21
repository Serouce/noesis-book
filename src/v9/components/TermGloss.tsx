import { useEffect, useId, useRef, useState } from 'react';
import { ruTypo } from '../utils/ruTypo';

export const GLOSSARY_TERMS: Record<string, { label: string; definition: string }> = {
  квалиа: {
    label: 'Квалиа (лат. qualia)',
    definition:
      'Субъективное качество переживания — то, «каково это» чувствовать алый цвет, боль или запах кофе изнутри первого лица.',
  },
  приор: {
    label: 'Приор (байесовский прогноз)',
    definition:
      'Внутреннее ожидание мозга о том, что он должен увидеть прямо сейчас, построенное на прошлом опыте ещё до прихода сигнала.',
  },
  хиазма: {
    label: 'Зрительная хиазма',
    definition:
      'Анатомический перекрёст зрительных нервов в основании мозга: оба левых поля зрения идут в правое полушарие, оба правых — в левое.',
  },
  каллозотомия: {
    label: 'Каллозотомия',
    definition:
      'Хирургическое рассечение мозолистого тела (~200 млн аксонов между полушариями), применявшееся при тяжёлой эпилепсии.',
  },
  'pci*': {
    label: 'PCI* (индекс сложности возмущения)',
    definition:
      'Мера сжимаемости коркового эха после магнитного импульса ТМС: ниже 0.31 — нет сознания, выше 0.31 — кора интегрирована и дифференцирована.',
  },
  cmd: {
    label: 'CMD (когнитивно-моторная диссоциация)',
    definition:
      'Скрытое сознание: человек слышит и понимает команды, его кора отвечает по фМРТ/ЭЭГ, но тело полностью парализовано.',
  },
  гнвт: {
    label: 'GNWT (теория глобального нейронного рабочего пространства)',
    definition:
      'Теория С. Деана и Ж.-П. Шанжё: информация становится осознанной, когда «вспыхивает» и рассылается по лобно-теменной сети.',
  },
  иит: {
    label: 'IIT (теория интегрированной информации)',
    definition:
      'Теория Дж. Тонони и К. Коха: сознание — это несводимая внутренняя структура причинных связей системы (прежде всего в задней «горячей зоне» коры).',
  },
};

interface TermGlossProps {
  termKey: keyof typeof GLOSSARY_TERMS | string;
  children: string;
  customDefinition?: string;
  dark?: boolean;
}

/**
 * Click/tap/keyboard inline micro-glossary for cold Act jumps.
 * Never shifts scrollHeight; renders as an anchored floating paper slip.
 */
export function TermGloss({ termKey, children, customDefinition, dark = false }: TermGlossProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  const entry = GLOSSARY_TERMS[termKey.toLowerCase()];
  const definition = customDefinition ?? entry?.definition;
  const heading = entry?.label ?? children;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!definition) {
    return <span>{children}</span>;
  }

  return (
    <span ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`inline cursor-help border-b border-dotted transition-colors ${
          dark
            ? 'border-[#89B0FF]/70 text-[#FAF9F5] hover:border-[#FC4109]'
            : 'border-[#004EDF]/60 text-inherit hover:border-[#FC4109]'
        }`}
      >
        {children}
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-40 w-[260px] sm:w-[300px] p-3 rounded-xl border text-left shadow-[0_14px_34px_rgba(20,20,19,0.22)] pointer-events-auto ${
            dark
              ? 'bg-[#181D27] text-[#FAF9F5] border-[#FAF9F5]/20'
              : 'bg-[#FAF9F5] text-[#141413] border-[#141413]/16'
          }`}
          style={{ animation: 'fadeScaleIn 150ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          <span
            className={`block font-mono-tech text-[9.5px] uppercase tracking-[0.12em] font-semibold ${
              dark ? 'text-[#89B0FF]' : 'text-[#004EDF]'
            }`}
          >
            {heading}
          </span>
          <span
            className={`block mt-1 font-sans-ui text-[12.5px] leading-[1.52] font-normal not-italic ${
              dark ? 'text-[#FAF9F5]/85' : 'text-[#30302E]'
            }`}
          >
            {ruTypo(definition)}
          </span>
        </span>
      )}
    </span>
  );
}
