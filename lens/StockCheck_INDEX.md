> живе доки: назавжди (індекс продукту — дім оголошень StockCheck, Р-9) · читається: першим у сесії StockCheck, після `lens-governance:CLAUDE.md`
> дім оголошено: `lens-governance:kernel/Lens_INDEX.md` §5 «Реєстр продуктів» · заведено 05.10.2026 (переїзд, журнал GW крок 3)
> гейт: `python3 <ядро>/kernel/Lens_validate.py --product <корінь цього репо>` (Р-4′: гейт перевіряє лише свій репо)

# StockCheck · INDEX — що живе в цьому репо

Шляхи — від кореня репо. Гейт звіряє `lens/` · `sessions/` · `tools/` з цим індексом в обидва боки. `archive/` — історія, не оголошується поштучно. Сайт — корінь (`index.html`), не канон.

## Черга

| файл | роль |
|---|---|
| `lens/StockCheck_CHERGA.md` | відкрите, читається цілком на старті. Стеля — `lens-governance:kernel/Lens_INDEX.md` §5 (пункти й вік) |

## Живі самері (стеля 2)

| файл | що |
|---|---|
| `sessions/StockCheck_session_summary_b32_7_s20s21_STORAGE_TRUTH.md` | останнє (15.08.2026): втрата даних, правда індикатора, persistent storage · b32.5 → b32.7 |
| `sessions/StockCheck_session_summary_b32_5_s18s19_STORAGE_DONE.md` | попереднє: пам'ять додатка, b32.5 |

## Канон

| файл | що |
|---|---|
| `lens/StockCheck_MASTER_LOCK.md` | головний лок продукту |
| `lens/StockCheck_brand_valuesLOCK.md` | бренд |
| `lens/StockCheck_materiality_valuesLOCK.md` | матеріальність |
| `lens/StockCheck_glyph_valuesLOCK.md` | гліф |
| `lens/StockCheck_tails_valuesLOCK.md` | хвости |
| `lens/StockCheck_money_home_valuesLOCK.md` | гроші на головній |
| `lens/StockCheck_NETS_register.md` | реєстр мереж (пара — гейт реєстру, `SC-2`) |
| `lens/Фармастор_v2_MASTER_LOCK.md` | Фармастор (попередня назва) — головний лок, історія продукту |
| `lens/Фармастор_v2_PORT_REGISTER.md` | Фармастор — реєстр порту |
| `lens/Фармастор_history_badge_valuesLOCK.md` | Фармастор — бейдж історії |

## Інструменти

| файл | що |
|---|---|
| `tools/StockCheck_marks_gate_v2_1.py` | гейт міток мереж |
| `tools/StockCheck_net_cut_v2_1.py` | нарізка ассетів мереж |
| `tools/StockCheck_msl_gen.py` | генератор DATA-блока з `sources/Файл для замовлення з MSL.xlsx` — єдине джерело бази |
| `tools/StockCheck_h2_msl_data.py` | гейт звірки DATA-блока з xlsx (пара до `msl_gen`) |
| `tools/StockCheck_icon_gen.py` | генератор іконок PWA з локнутого гліфа |
| `tools/StockCheck_b32_7_s21_smoke.js` | смоук живого білда: `node tools/StockCheck_b32_7_s21_smoke.js index.html` → ✓ 124 ✗ 0 (06.10.2026) |
| `tools/StockCheck_money_stagebench_v2.html` | стенд форми грошей О-49 + мітки мережі О-51 (ред. s15c) |
| `tools/StockCheck_money_stagebench_v2_smoke.js` | матриця стенда — ✓ 103 (06.10.2026; потрібен `jsdom`) |

**Не знайдено ніде** (оголошувались у ядрі живими; Konst 06.10: у Project їх нема — інших не шукати): StockCheck_money_stagebench_SPEC_v1.md · StockCheck_b32_2_port_smoke.js · StockCheck_net_pack_v2.py · nets_assets_v2.js · _MANIFEST.txt · StockCheck_nets_register_gate.py. Втрата зафіксована (wsd 1.10), не архівація: пакувальник мереж і гейт реєстру — відтворити, коли знадобляться (`SC-4`); смоук b32.2 витіснено смоуком b32.7.

## Живий білд

Сайт = `index.html` у корені: `b32_7_s21_persist`, v2.27.2 (md5 `285a0c68` ≡ `StockCheck_port_b32_7_s21_persist.html` з Project — копію не тримаємо; ≡ живий сайт). Device-вирок — у самері `b32_7` (`sessions/`).
