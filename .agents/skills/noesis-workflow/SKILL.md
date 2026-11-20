---
name: noesis-workflow
description: >-
  Полный инженерный, дизайнерский и QA-регламент проекта NOESIS v7 (интерактивная русская мини-книга о сознании).
  Активируй этот скилл всегда при первом запуске проекта на новом компьютере (проверка и установка Git, Node.js, pnpm, Python/Pillow и зависимостей),
  при продолжении работы с точки передачи (handoff_state.md), при редактировании глав src/v7/
  или перед проведением визуальной приёмки через browser и visual-design-critic.
---

# NOESIS v7 — Инженерный и визуальный регламент

Этот скилл хранит всё необходимое, чтобы на любом новом компьютере (включая чистый Windows-ноутбук без установленных инструментов) агент мгновенно развернул окружение, вошёл в полный контекст проекта и работал по тем же стандартам качества (`9.5+/10`).

## Опорные файлы внутри скилла
* Текущая точка остановки, карта файлов и очередь правок критика (`6 P0 + 4 P1`): [handoff_state.md](./references/handoff_state.md)
* Готовые системные промпты субагентов (`visual-design-critic` и `socratic-partner`): [subagent_prompts.md](./references/subagent_prompts.md)
* Утверждённый архитектурный план v7: [implementation_plan.md](./references/implementation_plan.md)
* Протокол 5 раундов Сократовского диалога: [socratic_dialogue_v7.md](./references/socratic_dialogue_v7.md)

---

## Полная карта стека (всё уже прописано в `package.json` и ставится одной командой `pnpm.cmd install`)

* **Ядро:** `React 19.3`, `TypeScript`, `Vite 8.3`, `Tailwind CSS v4` — нативный JS/WASM, **НЕ требует C++ / Visual Studio Build Tools (`node-gyp`)**.
* **Анимация и скролл:** `GSAP 3.15 (ScrollTrigger)`, `Lenis 1.3`, `Motion 14`.
* **Графика, оптика и звук:** `d3-scale`, `d3-shape` (ЭЭГ), `lucide-react`, чистый SVG/Canvas (нейрон Кахаля, проигрыватель Рамса, ризограф-калька), встроенный браузерный `Web Audio API` (0 внешних MP3).
* **Локальные кириллические переменные шрифты:** `@fontsource-variable/golos-text`, `@fontsource-variable/literata` (`opsz` + `opsz-italic`), `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` (работают офлайн, без Google Fonts!).
* **3D / WebGL / GLTF (важное уточнение!):** пакеты `three`, `@react-three/fiber`, `@react-three/drei`, `three-mesh-bvh`, `@gltf-transform/*`, `meshoptimizer`, `draco3dgltf` **сохранены в `package.json`** (чтобы компилировался старый архив `src/v6/` и чтобы стек был под рукой, если пользователь однажды попросит *новый* скульптурный 3D/шейдерный объект). **В самой NOESIS v7 WebGL и старый «бумажный» 3D-мозг (`brain_anatomy.glb`) намеренно НЕ используются** — ради музейной чёткости и 120 FPS (итоговый бандл всего `~183 КБ` gzip).
* **Встроенные субагенты Antigravity:** `browser` (всегда `Model: "flash"`) и `image-generator` доступны из коробки. Двух профильных субагентов (`visual-design-critic` и `socratic-partner`) нужно определить через `define_subagent` по шаблонам из [subagent_prompts.md](./references/subagent_prompts.md).

---

## Шаг 0. Полная проверка и автонастройка нового ноутбука (Windows / PowerShell)

Выполняй эту проверку при первом открытии проекта на новой машине:

1. **Проверить все системные инструменты за один проход:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   git --version
   node -v
   npm.cmd -v
   pnpm.cmd -v
   python --version
   ```
2. **Если нет `Git`** (например, проект скачали с GitHub как ZIP):
   ```powershell
   winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
   ```
3. **Если нет `Node.js`:**
   ```powershell
   winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
   ```
   *(Если Windows запросит подтверждение UAC — попроси пользователя нажать «Да»; если `winget` недоступен, дай ссылку `https://nodejs.org/`.)*
   После установки ОБЯЗАТЕЛЬНО обнови `$env:Path` из `Machine` + `User` и проверь `node -v`.
4. **Если нет `pnpm`:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   npm.cmd install -g pnpm
   ```
   *(На Windows всегда вызывай `pnpm.cmd` и `npm.cmd`, чтобы PowerShell не блокировал `.ps1`-скрипты!)*
5. **Python + Pillow / NumPy — ТОЛЬКО по необходимости:**
   * Для сборки и запуска сайта Python **НЕ обязателен** (`pnpm.cmd run preview` работает без него).
   * Если понадобится заново бинаризовать Иллюзию Муни или выравнивать новые студийные картинки, проверь `python -c "import PIL, numpy"` и при отсутствии установи:
     ```powershell
     winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements
     pip install pillow numpy
     ```
6. **Установить ВСЕ npm-зависимости проекта и проверить сборку:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   pnpm.cmd install
   pnpm.cmd run build
   ```
   *Ожидаемый результат:* `tsc -b && vite build` завершается с кодом `0`, `dist/assets/index-*.js` ~`180–200 КБ` gzip.
7. **Запустить локальный превью-сервер `dist/` на `http://127.0.0.1:4173/` (`IsDaemon: true`):**
   *(Всегда открывать через `http://127.0.0.1:4173/`, НЕ двойным кликом по `dist/index.html` через `file://`, так как студийные пластины подключены по путям `/v7/...` и `/v6/...`!)*
   * С Python: `python -m http.server 4173 --bind 127.0.0.1 --directory "<путь-к-проекту>\dist"`
   * Без Python: `pnpm.cmd run preview -- --host 127.0.0.1 --port 4173`

---

## Шаг 1. Войти в точную точку остановки
Прочитай [handoff_state.md](./references/handoff_state.md) целиком и начинай ровно с открытой очереди правок (`6 P0 + 4 P1` от визуального критика).

---

## Шаг 2. Обязательный цикл визуальной приёмки (до показа пользователю)
1. Пересобери продакшн: `pnpm.cmd run build`.
2. Запусти `browser` строго на **`Model: "flash"`**: открой `http://127.0.0.1:4173/` (hard reload, `1440×900`), проверь `0` ошибок консоли, `0` упавших сетевых запросов (`status >= 400`), `0` битых картинок, сними чистые скриншоты.
3. Запусти **`visual-design-critic`** (`Model: "inherit"`, промпт в [subagent_prompts.md](./references/subagent_prompts.md)) — передай ему **ТОЛЬКО пути к PNG-скриншотам** (без исходного кода!).
4. Полируй до оценки **9.5+/10** и только потом показывай пользователю.

---

## Шаг 3. Синхронизация обратно в GitHub (`Serouce/noesis-book`)
```powershell
git status
git add .
git commit -m "NOESIS v7: <кратко, что сделано>"
git push
```
На другом ПК достаточно выполнить `git pull` (и `pnpm.cmd install`, если менялся `package.json`).
