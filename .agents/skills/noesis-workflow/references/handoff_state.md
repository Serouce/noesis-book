# NOESIS v10.7 (Final Audited Release — Web + Mobile) — Точка передачи (Handoff State)

Дата фиксации: **22 ноября 2026 (NOESIS v10.7 · Ceremonial Transitions & Full Strict Audit)**
Актуальная ветка: **`main`** · локальный тег **`checkpoint-v10.7-final`** · Live URL (Netlify): **`https://noesis-book.netlify.app`**
Статус сборки: **`pnpm.cmd run build` — 0 ошибок TS/Vite (`1.63s`), `dist/` свежий.**

## Итоги финального строгого аудита (Web + Mobile, v10.7)
* **Слепой `visual-design-critic` (Desktop `1440×900`):** **`9.8 / 10` (`PASS`)**, `0 P0`, `0 P1`.
* **Слепой `visual-design-critic` (Mobile `390×844`):** **`9.7 / 10` (`PASS`)**, `0 P0`, `0 P1`.
* **Беспощадный `brutal-full-auditor` (код, WebGL-шейдеры, гонки таймеров, UX, a11y, наука 2020–2026, Netlify):** **`9.7 / 10` (`PASS`)**, `0 P0`, `0 P1`, `0` регрессий.
* **Живой `browser` QA (`?v=1071`, `1440×900` + `390×844`):** `0` ошибок консоли/страницы, `0` HTTP `>= 400` (`36` запросов), `0px` горизонтального скролла во всех 4 Актах на обеих платформах, стресс-тест отмены Leica-шторки через `history.back()` пройден на 100%.

## Что сделано в v10.7 поверх v10.6
1. **Церемониальные удлинённые переходы между Актами и главами (`App.tsx`, `index.css`, `useEditorialChoreography.ts`):**
   - Leica-шторка: `500ms` закрытие (`clip-path`) → `540ms` чистый свап DOM + `520ms` выдержка со штампом Акта (курсивный подзаголовок, алая линейка `760ms`, длительность чтения) → `540ms` механическое открытие с отложенным `opacity` (`180ms ease 380ms`). Внутриактовые переходы Lenis продлены до `1.35s` (`1.15s` наверх).
   - Полная защита от гонок (`transitionSeqRef` + `clearTransitionTimers()` для быстрого `A→B→A`, `history.back()` и `A→B→C`), блокировка сквозных кликов (`pointer-events-auto` на закрытой шторке), `ActErrorBoundary` со сбросом шторки и `lenis.start()`, привязка `useEditorialChoreography` к `mountedSeq` из `ActMountSignal`, устранение двойного `ScrollTrigger.update()`.
2. **WebGL-математика, мобильный overdraw и чистый ресурс-менеджмент (`LeibnizMillCanvas.tsx`, `TransformerVsBrainCanvas.tsx`, `NoesisBrainStage3D.tsx`, `OrganicCajalForest3D.tsx`, `OpticalPrismCanvas.tsx`):**
   - Исправлена матрица `rot2` (CCW) и порядок `Rz → Rx(tilt) → +zOff` в «Мельнице Лейбница» — все частицы 100% копланарны 3D-шестерням.
   - Синхронизированы брейкпоинты с Tailwind `lg:` (`rw >= 1024`), добавлена ветка landscape `< 1024px`, в Трансформере мобильный масштаб `0.52` удерживает все 6 слоёв в `360–390px`, на `< 768px` `COUNT = 2400` + `dpr <= 1.5` + `uPointScale` убирают overdraw.
   - Сброс `touchOrbitEnabled`/`userDragged` при выходе из `inNear` в `NoesisBrainStage3D.tsx`, строгий `rootMargin: 24px` (`<= 1` активного WebGL-контекста на стыках), полная очистка `roomEnv`/`envRt`/`somataInst` и `webglcontextlost`/`webglcontextrestored` во всех сценах.
3. **Кросс-платформенный визуал, доступность и научная точность (`Chapter3VellumError.tsx`, `Chapter8BoneEndpaper.tsx`, `BookIndexDrawer.tsx`, `Plate00Mooney.tsx`, `ExplorerContext.tsx`, `NoesisInstrumentFrame.tsx`, `Chapter5CajalTurntable.tsx`, `Chapter6IcuJournal.tsx`, `Act2AphantasiaLab.tsx`, `Chapter8AiDeepDive.tsx`):**
   - Мобильный `Drei Gläser`: статус вынесен над 35-мм фото (лицо и пальцы 100% открыты), шапка `NoesisInstrumentFrame` переносится чисто без обрубка `...`.
   - Мобильный Паспорт Bone: портрет + штамп в верхней строке, цитата на всю ширину карточки (исчезли 13-строчная колонка и 150px чёрная дыра на обороте), `inert` + `aria-hidden` на скрытой стороне, единый индекс `№ 00`, нейтральный `0 / 3 верных`, кнопки `w-full` на телефоне, `aiVerdict` включён в `missingAnchors` (`из 4`).
   - Мобильный дровер `BookIndexDrawer`: ровный правый край карточек (убран `-mx-2.5`), блокировка скролла `html + body` (1 скроллбар), 1-строчный заголовок `NOESIS · ИЗДАНИЕ 2026`.
   - Убран тач-спойлер на фото Муни (`Plate00Mooney.tsx`) + `onClick` a11y + `aria-hidden` на скрытом снимке; единое обращение на «вы» (`ОПЫТ НА СЕБЕ`); вычищены все 5 ошибочных «справа/слева» на мобилке; круглая красная точка в Пропофоле (`shrink-0`) и неразрывный `5‑HT2A`; реалистичная шкала зрачка `0..-6%` (`eLife 2022`); `simulated: true` для программных петель ИИ-агента; `base: '/'` в `vite.config.ts` и `max-age=86400` в `netlify.toml`.

## Хронология версий
| Версия | Git-тег | Статус |
|---|---|---|
| **NOESIS v10.7 (ТЕКУЩАЯ)** | **`checkpoint-v10.7-final` (`HEAD -> main`)** | **ФИНАЛЬНЫЙ РЕЛИЗ (`Desktop 9.8` / `Mobile 9.7` / `Аудит 9.7`, `0 P0`, `0 P1`)** |
| NOESIS v10.6 | `checkpoint-v10.6-mobile` (`05d0dbc`) | Первый полный мобильный редизайн (деплой на Netlify) |
| NOESIS v10.5 | `checkpoint-v10.5-cinema` (`626c27c`) | Cinema & AI Deep-Dive Edition (`9.7` / `9.7`) |
| NOESIS v10 | `checkpoint-v10-showreel` (`81f4fef`) | Базовый релиз v10 Showreel Edition (`9.6` / `9.7`) |
| NOESIS v9.2 | `checkpoint-v9.2-3d-mri` (`cee06bc`) | Прошлая 5-актная версия на `fsaverage5` |
| NOESIS v8 | `checkpoint-v8-9.9` (`086b6d2`) | Прошлая 2D-версия |
