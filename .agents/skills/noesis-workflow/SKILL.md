---
name: noesis-workflow
description: >-
  Полный инженерный, дизайнерский и QA-регламент проекта NOESIS v7 (интерактивная русская мини-книга о сознании).
  Активируй этот скилл всегда при первом запуске проекта на новом компьютере (проверка и установка Node.js/pnpm/зависимостей),
  при продолжении работы с точки передачи (handoff_state.md), при редактировании глав src/v7/
  или перед проведением визуальной приёмки через browser и visual-design-critic.
---

# NOESIS v7 — Инженерный и визуальный регламент

Этот скилл хранит всё необходимое, чтобы на любом новом компьютере (включая чистый Windows-ноутбук без установленного Node.js) агент мгновенно развернул окружение, вошёл в полный контекст проекта и работал по тем же стандартам качества (`9.5+/10`).

## Опорные файлы внутри скилла
* Текущая точка остановки, карта файлов и очередь правок критика (`6 P0 + 4 P1`): [handoff_state.md](./references/handoff_state.md)
* Готовые системные промпты субагентов (`visual-design-critic` и `socratic-partner`): [subagent_prompts.md](./references/subagent_prompts.md)
* Утверждённый архитектурный план v7: [implementation_plan.md](./references/implementation_plan.md)
* Протокол 5 раундов Сократовского диалога: [socratic_dialogue_v7.md](./references/socratic_dialogue_v7.md)

---

## Шаг 0. Проверка и автонастройка нового компьютера (Windows / PowerShell)

Выполняй эту проверку при первом открытии проекта на новой машине:

1. **Проверить `node`, `pnpm`, `git` и `python`:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   node -v
   npm.cmd -v
   pnpm.cmd -v
   git --version
   python --version
   ```
2. **Если `node` НЕ установлен (нет Node.js на ноутбуке):**
   * Установи официальный **Node.js LTS** через `winget`:
     ```powershell
     winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
     ```
   * *(Если `winget` запросит UAC/подтверждение администратора — предупреди пользователя нажать «Да» в окне Windows; если `winget` недоступен — дай прямую ссылку на официальный LTS-инсталлятор `https://nodejs.org/`.)*
   * После установки ОБЯЗАТЕЛЬНО обнови PATH в текущей сессии и проверь `node -v`:
     ```powershell
     $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
     node -v
     ```
3. **Если `pnpm` НЕ установлен:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   npm.cmd install -g pnpm
   ```
   *(На Windows всегда вызывай `pnpm.cmd` и `npm.cmd`, чтобы PowerShell не спотыкался о запрет запуска `.ps1`-скриптов!)*
4. **Установить зависимости проекта и проверить сборку:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   pnpm.cmd install
   pnpm.cmd run build
   ```
   *Ожидаемый результат:* `tsc -b && vite build` завершается с кодом `0`, бандл `dist/assets/index-*.js` ~`180–200 КБ` gzip (никакого Three.js!).
5. **Запустить локальный превью-сервер `dist/` на `http://127.0.0.1:4173/` (в фоне `IsDaemon: true`):**
   * Если есть Python:
     ```powershell
     python -m http.server 4173 --bind 127.0.0.1 --directory "<путь-к-проекту>\dist"
     ```
   * Если Python нет — используйте встроенный Vite Preview:
     ```powershell
     $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
     pnpm.cmd run preview -- --host 127.0.0.1 --port 4173
     ```

---

## Шаг 1. Войти в точную точку остановки
Прочитай [handoff_state.md](./references/handoff_state.md) целиком. Не дублируй уже выполненную работу — сразу начинай с первого открытого пункта в секции **«Текущая очередь правок»**.

---

## Шаг 2. Обязательный цикл визуальной приёмки (до показа пользователю)

Никогда не верь только в «зелёный `vite build`». После каждой серии UI-правок:
1. Пересобери продакшн: `pnpm.cmd run build`.
2. Запусти субагента **`browser`** строго с **`Model: "flash"`**:
   * Открой `http://127.0.0.1:4173/` (hard reload) на `1440×900`.
   * Проверь `0` ошибок консоли, `0` упавших сетевых запросов (`status >= 400`), `0` битых картинок.
   * Прокликай затронутые интерактивные механизмы и сними чистые скриншоты.
3. Определи (если ещё не определён в текущей сессии) субагента **`visual-design-critic`** по промпту из [subagent_prompts.md](./references/subagent_prompts.md) и передай ему **ТОЛЬКО пути к PNG-скриншотам** (без исходного кода!).
4. Исправляй все P0-замечания критика и перепроверяй, пока оценка не достигнет **9.5+/10**.

---

## Шаг 3. Синхронизация обратно в GitHub (если работаете с двух ПК)
Перед тем как закрыть ноутбук и вернуться на рабочий компьютер:
```powershell
git status
git add .
git commit -m "NOESIS v7: <кратко, что сделано>"
git push
```
На другом компьютере достаточно выполнить `git pull` и при изменении `package.json` — `pnpm.cmd install`.
