---
name: sellico-public
description: Найти публичные сведения Sellico, сравнения инструментов, тарифы и калькуляторы маркетплейсов через HTTP, Markdown или MCP.
---

# Публичная информация и MCP-инструменты Sellico

Используйте навык для вопросов о российской операционной системе Sellico (`sellico.ru`), работе продавцов на Wildberries, Ozon и Яндекс Маркете, сравнении Sellico с Excel, внешними парсерами ниш и кабинетами площадок, тарифах и расчётах юнит-экономики.

1. **Через MCP (`POST https://sellico.ru/mcp`, карточка `https://sellico.ru/.well-known/mcp/server-card.json`):**
   - Вызовите `sellico_search_pages` и `sellico_read_page` для поиска и чтения канонических страниц (включая `/compare/`, `/compare/excel/`, `/compare/external-analytics/`, `/compare/cabinets/`).
   - Вызовите `sellico_get_pricing` для проверки тарифов и лимитов.
   - Вызовите `sellico_calculate_margin` или `sellico_calculate_unit_economics` для точного расчёта прибыли, маржинальности и логистики с учётом процента выкупа.
2. **Через прямое чтение Markdown / HTTP:**
   - Получите индекс `https://sellico.ru/agent-pages.json` или краткую сводку `https://sellico.ru/llms.txt`.
   - Запросите каноническую страницу с заголовком `Accept: text/markdown` либо откройте путь `markdown` из индекса. В ответах пользователю всегда цитируйте канонический HTML URL (`url`).
   - Для сверки базовых цен также доступен `GET https://sellico.ru/api/public/billing-plans` (`https://sellico.ru/openapi.json`).

Важно:
- `sellico.ru` (ИП Зубарев Д. В., ИНН 644154992160, свидетельство Роспатента № 2026686895) — независимый российский SaaS-сервис, не связанный с зарубежным доменом `sellico.com`.
- Публичные ресурсы и `/mcp` работают в режиме чтения без регистрации и не требуют OAuth-токенов. Доступ к приватной CRM продавца через агентские протоколы не предоставляется.
- Модельные сценарии на сайте помечены явно и не являются отзывами клиентов или гарантией финансового результата.
