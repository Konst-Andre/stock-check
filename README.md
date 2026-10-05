> живе доки: назавжди (вхід у репо продукту) · розкладка — Р-7, `lens-governance:kernel/Lens_REPO_LAYOUT.md` §4

# StockCheck

PWA для перевірки залишків аптеки за MSL-базою (сімейство Lens; попередня назва — Фармастор). Один HTML-файл.
Правила роботи — у ядрі родини [`Konst-Andre/lens-governance`](https://github.com/Konst-Andre/lens-governance) (`CLAUDE.md` · `kernel/`). Цей репо самодостатній: код, канон, самері — тут.

## Де що

| тека | роль |
|---|---|
| `index.html` · `manifest.json` · `icons/` (корінь) | **сайт** — GitHub Pages з кореня `main` (живий білд `b32_7_s21_persist`, md5 ≡ сайт 05.10.2026). За Р-7 сайт має жити в `docs/` — переїзд окремим прод-кроком (`SC-1` черги) |
| `lens/` | канон: `StockCheck_INDEX.md` (що живе) · `StockCheck_CHERGA.md` (відкрите) · MASTER_LOCK · values-LOCK-и · реєстр мереж · локи Фармастора (історія продукту) |
| `tools/` | скрипти: гейт міток · нарізка мереж |
| `sessions/` | живі самері (стеля 2) — поки порожньо: обидва живі самері лежать лише в Project (`SC-2`) |
| `sources/` | вихідні дані: MSL-база xlsx · архіви логотипів і міток |
| `archive/` | витіснене: самері · стенди · матриці StockCheck і Фармастора (`Farmastor/` — латиниця, Ф5) |

## Як почати сесію

Сесія Claude Code: **першим — адаптувати репо під каркас** за `lens-governance:tools/claude-code/ADOPT.md` (тут ще нема `CLAUDE.md`, `tools/env_check.sh`, журналу аудиту — `frame_check` покаже). Далі: `lens/StockCheck_CHERGA.md` цілком → найновіше самері в `sessions/`.
Гейт продукту: `python3 <lens-governance>/kernel/Lens_validate.py --product .`
