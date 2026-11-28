# Sellico для AI-агентов

Публичная справочная информация и расчётные инструменты российской операционной системы Sellico (`sellico.ru` — ИП Зубарев Д. В., ИНН 644154992160, свидетельство Роспатента № 2026686895; не связана с зарубежным `sellico.com`) доступны без регистрации и API-ключей. Приватные данные магазинов в CRM доступны только авторизованному владельцу кабинета.

## Обнаружение и чтение

- [MCP Server Card (SEP-1649)](https://sellico.ru/.well-known/mcp/server-card.json) — метаданные публичного MCP-сервера.
- [A2A Agent Card (v1.0)](https://sellico.ru/.well-known/agent-card.json) — карточка публичного read-only A2A-агента (`POST https://sellico.ru/a2a`).
- [API-каталог](https://sellico.ru/.well-known/api-catalog) — RFC 9727 (`application/linkset+json`).
- [OpenAPI](https://sellico.ru/openapi.json) — публичные HTTP-операции чтения.
- [Индекс страниц](https://sellico.ru/agent-pages.json) — канонические пути, заголовки и Markdown URL.
- [Индекс навыков](https://sellico.ru/.well-known/agent-skills/index.json) — Agent Skills v0.2.0 с контрольной суммой SHA-256.
- [AI-каталог (ARD)](https://sellico.ru/.well-known/ai-catalog.json) — машиночитаемый реестр ресурсов.
- [Краткая справка для LLM](https://sellico.ru/llms.txt) и [расширенная справка](https://sellico.ru/llms-full.txt).

Для любой публичной HTML-страницы отправьте `Accept: text/markdown` по её каноническому URL: сервер вернёт Markdown-представление с `Vary: Accept`. Прямые ссылки на `index.md` из `agent-pages.json` работают и без согласования заголовков.

## Публичный Streamable HTTP MCP-сервер

Endpoint: `POST https://sellico.ru/mcp` (протокол MCP `2025-06-18`, stateless Streamable HTTP, авторизация не требуется).

Доступные read-only инструменты (`readOnlyHint: true`, `destructiveHint: false`):

1. `sellico_search_pages` — поиск по всем каноническим страницам продукта, маркетплейсов, сравнений (`/compare/*`), статей, глоссария и калькуляторов.
2. `sellico_read_page` — чтение очищенного Markdown конкретной страницы по её каноническому пути.
3. `sellico_get_pricing` — актуальные тарифы в рублях (`Старт` 3 000 ₽, `Про` 8 000 ₽, `Бизнес` 15 000 ₽, `Enterprise` от 40 000 ₽), лимиты и правила 3-дневного теста без карты.
4. `sellico_calculate_margin` — расчёт чистой прибыли, валовой и чистой маржинальности, наценки, цены безубыточности и цены под целевую маржу.
5. `sellico_calculate_unit_economics` — полный расчёт юнит-экономики товара для Wildberries, Ozon и Яндекс Маркета с поправкой логистики на процент выкупа и возвраты.

## Публичный A2A-агент (Agent-to-Agent v1.0)

- Agent Card: `GET https://sellico.ru/.well-known/agent-card.json`
- JSON-RPC Endpoint: `POST https://sellico.ru/a2a` (поддерживает `SendMessage` / `message/send`, возвращает read-only ответы по тарифам, функциональности, маркетплейсам и формулам юнит-экономики без авторизации).

## Публичное HTTP API тарифов

`GET https://sellico.ru/api/public/billing-plans` возвращает JSON с базовыми месячными ценами тарифов в рублях (`title`, `monthly_price`). Вызов не создаёт заказ и не инициирует списание средств; итоговые условия подтверждаются пользователем в кабинете перед оплатой.

## Инструменты браузера (WebMCP)

В браузерах с поддержкой `modelContext` (WebMCP) фронтенд регистрирует локальные read-only инструменты `search_sellico`, `read_sellico_page` и `calculate_sellico_margin`. Они выполняются без отправки заявок и без платёжных операций.

## Авторизация агентов (`auth.md` и OAuth 2.0) и изоляция CRM

- Для программных агентов опубликован манифест [auth.md](https://sellico.ru/auth.md), метаданные защищённого ресурса `/.well-known/oauth-protected-resource` (RFC 9728), метаданные сервера авторизации `/.well-known/oauth-authorization-server` / `/.well-known/openid-configuration` (RFC 8414) и публичный набор ключей `/.well-known/jwks.json` (`ES256`).
- Агенты могут зарегистрировать анонимную read-only сессию через `POST https://sellico.ru/agent/identity` (`{"type":"anonymous"}`), обменять `identity_assertion` на `Bearer` JWT в `POST https://sellico.ru/oauth2/token` (со скоупами `mcp:tools:read`, `public:catalog:read`, `public:pricing:read`), проверить токен в `GET https://sellico.ru/agent/me` и отозвать его в `POST https://sellico.ru/oauth2/revoke`.
- Приватные данные магазинов в CRM ([вход](https://sellico.ru/login), [регистрация](https://sellico.ru/register)) полностью изолированы на уровне Laravel Sanctum: агентские токены не дают доступа к кабинетам продавцов и не выполняют платёжных операций.
