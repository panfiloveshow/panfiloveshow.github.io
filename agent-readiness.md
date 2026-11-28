# Обнаружение Sellico AI-агентами

Реализация для статического лендинга, публичного Streamable HTTP MCP-сервера и существующего публичного API тарифов.

## Выпуск 16 ноября 2026 (v2 — SEO / GEO / AEO / Agentic 98/100)

- Активный релиз на `sellico.ru`: `/var/www/html/landing/releases/seo-geo-aeo-v2-20261116` (предыдущий сохранён в `/var/www/html/landing/previous` → `seo-geo-aeo-oauth-20261116`, старые хешированные `assets` перенесены).
- Полностью устранён разрыв SSR/JS на главной `/`: `render_page.py` подтвердил `js_gap.significant: false` (`reasons: []`, `1 442` слова и `130` ссылок в сыром HTML до гидрации), добавлен блок прямого AEO-ответа (`data-direct-answer`), `WebPage.abstract` и `SpeakableSpecification`.
- Все **55 публичных HTML и Markdown страниц** прошли инструментальный аудит без ошибок и предупреждений:
  - `page_checks.py`: **47 / 47** проверок (`0` замечаний, `empty_alt: 0`, `missing_alt: 0`, на декоративных логотипах проставлен `aria-hidden="true"`).
  - `agentic_check.py --ua-matrix`: **P0 4/4, P1 5/5, P2 5/5, P3 2/2 pass** (`0 fail`, `0 warn`), `llms.txt` (`format_notes: []` по `llmstxt.org v2`), `/.well-known/ai-catalog.json` (`warnings: []`, стандартные ARD 1.0 MIME-типы), `/.well-known/agent-card.json` (`200 OK`).
  - `agent_ux_check.py`: **100 / 100** (`0` неназванных интерактивных узлов).
  - `isitagentready.com`: **Level 5 / 5 («Agent-Native»)** — активны Streamable HTTP MCP (`POST /mcp`), OAuth 2.0 / OIDC Discovery (`ES256`), Protected Resource Metadata (`RFC 9728`), `auth.md` и A2A Agent Card (`/.well-known/agent-card.json` + JSON-RPC обработчик `POST /a2a` в `scripts/mcp-server.mjs`).
- Из JSON-LD удалён устаревший тип `HowTo`, таблица `/compare/` приведена к 4 колонкам под стандарт Google Featured Snippet, на страницах Wildberries, Ozon и Яндекс Маркета добавлены статические `<picture>` (`avif`/`webp`) и `ImageObject`.
- **IndexNow принял 27 + 8 обновлённых URL (`HTTP 200`).**
- В `/home/crm_admin/sellico-mcp-rollout/` подготовлен обновлённый `apply-mcp-and-nginx.sh` (активирует прокси `POST /a2a`, `Strict-Transport-Security ... includeSubDomains` и изолированные заголовки `Permissions-Policy` + `Content-Security-Policy` только на 4 публичных location лендинга, не затрагивая камеру/микрофон Sellico Meet в `/crm/`), а в `deploy/publish-timeweb-dns-aid.mjs` — скрипт идемпотентной публикации DNS-AID (`SVCB` / `TXT`) через API Timeweb Cloud.

## Выпуск 29 октября 2026

- Активный релиз: `/var/www/html/landing/releases/service-schema-final-20261029-o0754qzj`.
- Предыдущий релиз сохранён: `/var/www/html/landing/releases/service-schema-20261029-p7lofgnj`.
- Текущая модель: SaaS-подписка — `Service` с `OfferCatalog`, калькуляторы —
  `WebPage` с предложением бесплатного доступа (`Offer.price: 0`). Все 4 тарифа
  сохранены, Enterprise — `minPrice: 40000`. Google-карточка приложения без
  настоящего рейтинга/отзыва не заявляется. URL-тесты главной, тарифов, Wildberries
  и калькулятора маржи завершились без ошибок и предупреждений. Подробности:
  [rich-results-audit.md](rich-results-audit.md).
- Полный адрес оператора подтверждён по действующему согласию на обработку данных
  и добавлен в разметку всех 51 страниц и видимое содержимое контактов. Повторный
  Google-тест контактов и тарифов подтвердил отсутствие предупреждений организации.
  IndexNow принял все 51 обновлённый URL (HTTP 200).
- Проверка Google Rich Results Test выявила несовместимость типа цен с парсером
  приложений Google. Объявлены оба типа: PriceSpecification и UnitPriceSpecification.
  После публикации главная, тарифы и Wildberries прошли повторный URL-тест:
  по 3 элемента без критических ошибок; предупреждения о типе цен исчезли.
  Подробности и ссылки на результаты: [rich-results-audit.md](rich-results-audit.md).
- Последующее обновление Schema.org исправило тарифы Enterprise, синхронизировало FAQ
  и убрало неподтверждённое время HowTo. JSON-LD всех 51 страниц проверен на production;
  пять типов страниц прошли официальный Schema.org Validator без ошибок и предупреждений.
  IndexNow принял 5 URL с изменённой разметкой (HTTP 200).
- Проверены SHA-256 всех 281 файла; ссылка dist переключена атомарно.
  Старые хешированные assets сохранены для уже открытых страниц.
- Production-главная загрузилась в браузере без ошибок JavaScript и ресурсов.
  Публичный API тарифов, /login и /crm/ отвечают HTTP 200.
- IndexNow принял 3 изменённых URL (HTTP 200).
- Nginx применён через sudo; nginx -t завершился успешно. Резервная копия:
  `/var/backups/sellico-agent-discovery.kVbpQgCY`.
- На production проверены HTTP Link, Vary: Accept, выбор Markdown, q=0, HEAD,
  все 51 страницы через Accept и все 51 прямые Markdown URL. Каталоги имеют
  правильный MIME, ARD отдаёт CORS *, SHA-256 навыка соответствует файлу.
- robots.txt содержит согласованную Content Signals политику. Неизвестные URL
  возвращают 404; вход, CRM и публичный API тарифов работают.
- Все три WebMCP-инструмента вызваны из production-бандла с тестовым modelContext:
  поиск нашёл тарифы, чтение вернуло Markdown, расчёт маржи вернул ожидаемую прибыль.
  Ошибок JavaScript и загрузки ресурсов не обнаружено. Нативный WebMCP отдельно не проверялся.

## Статус пунктов аудита

| Пункт | Статус |
| --- | --- |
| Link (RFC 8288) | Заголовки главной и HTML-ссылки на каталоги, MCP Server Card и A2A Agent Card опубликованы и проверены на production. |
| DNS-AID / DNSSEC | Провайдер — Timeweb. DNSKEY опубликован (`Key Tag 17472`, `Alg 13`); готов `deploy/publish-timeweb-dns-aid.mjs` для SVCB/TXT записей и параметры `DS` для регистратора. |
| Markdown negotiation | 55 публичных страниц получают `index.md` из HTML той же сборки. Nginx и Vite выбирают Markdown при `Accept: text/markdown`, исключая `q=0`, с `Vary: Accept` и правильным MIME. |
| Content Signals | Во всех группах `robots.txt`: `search=yes, ai-input=yes, ai-train=no`. Доступ к публичным страницам открыт для всех поисковых и AI-ботов; `/crm/` закрыт. |
| API catalog (RFC 9727) | `/.well-known/api-catalog` с `application/linkset+json` описывает реальный публичный API тарифов и ссылается на OpenAPI и документацию. |
| OAuth/OIDC discovery | Опубликованы `/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration` и `/.well-known/jwks.json` (`ES256`) для анонимных read-only агентских токенов; CRM на Laravel Sanctum полностью изолирована. |
| OAuth Protected Resource | Опубликован `/.well-known/oauth-protected-resource` (RFC 9728) со скоупами чтения публичных данных (`mcp:tools:read`, `public:catalog:read`, `public:pricing:read`). |
| Auth.md | Опубликован `/auth.md` с инструкцией регистрации read-only агентских сессий (`POST /agent/identity` → `POST /oauth2/token`). |
| MCP Server Card | Активен stateless Streamable HTTP MCP-сервер (`POST /mcp`, 5 read-only инструментов) и карточка `/.well-known/mcp/server-card.json` (`/mcp/server-card`). |
| A2A Agent Card | Опубликована карточка `/.well-known/agent-card.json` (A2A v1.0) и реализован stateless JSON-RPC обработчик `POST /a2a` (`SendMessage` / `message/send`). |
| Agent Skills | /.well-known/agent-skills/index.json, schema v0.2.0, реальный SKILL.md и SHA-256 при сборке. |
| WebMCP | Поиск, чтение публичных страниц и расчёт маржи. document.modelContext, fallback на navigator.modelContext, AbortSignal и обработка ошибок регистрации. |
| ARD / ai-catalog | /.well-known/ai-catalog.json, host, стабильные URN, media types, запросы-примеры, ровно один url/data, CORS *. Draft-формат; совместимость зависит от клиента. |
| x402 | Текущая оплата через redirect в ЮKassa; x402 не реализован. Нужны отдельные backend middleware, сеть, facilitator и получатель средств. |
| MPP | Нужны метод оплаты, backend SDK и подтверждение транзакций. Публичное чтение бесплатно; x-payment-info не добавляется. |
| UCP | Нужна реализация commerce capabilities и endpoints. Профиль не создаётся. |
| ACP | Нужно действующее commerce API с checkout/services. Метаданные не создаются. |

## Сборка и проверка

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm preview
```

Сборка создаёт каталоги, OpenAPI, индекс страниц и Markdown в dist и проверяет
ссылки, SHA-256 навыка, Content Signals и соответствие HTML/Markdown.
`pnpm check:agents` проверяет готовый dist. HTTP-тест использует локальный сервер
и проверяет HTML по умолчанию, Markdown главной и вложенной страницы, q=0, HEAD,
MIME, Link, CORS и настоящий 404.

Vite dev/preview читают подготовленные Markdown и каталоги из dist. После изменения
контента и перед проверкой выполните `pnpm build`. При отсутствии сборки машинный
endpoint отвечает 404, без подстановки HTML приложения. Браузерные инструменты
доступны в браузерах с экспериментальной реализацией WebMCP.
В браузере проверены регистрация из production-бандла и вызовы всех трёх инструментов
с тестовым modelContext. Нативная реализация WebMCP браузера отдельно не проверялась.

## Применение на сервере

`deploy/nginx-sellico.conf` — пример server-level конфигурации статики лендинга,
подключающий companion `deploy/nginx-agent-discovery.conf`. Не заменяйте этим
примером полный production-конфиг: у Sellico также есть API, CRM, TLS и другие location.

Действующий `/etc/nginx/sites-enabled/default` прочитан по SSH. Для него подготовлен
рендерер, который добавляет include и обработку четырёх публичных location, сохраняя
остальные блоки. Он пишет только отдельный файл, не устанавливает конфигурацию и не
перезагружает Nginx:

```bash
python3 deploy/prepare-nginx-agent-discovery.py original.conf candidate.conf
diff -u original.conf candidate.conf
```

В companion добавлены точные location `/unit-economics/index.md` и
`/seo-cards/index.md`: на production более общие CRM-префиксы иначе перехватили бы
эти Markdown-файлы. Повторный запуск рендерера не дублирует настройки; при отличии
структуры он завершается ошибкой без перезаписи исходника.

1. Установите companion в `/etc/nginx/snippets/sellico-agent-discovery.conf`.
2. Подключите его внутри server лендинга до regex-location.
3. Перенесите Link и Vary в точный location главной; обработку
   `$sellico_accept_markdown` — в homepage, HTML и общий location публичного лендинга.
   Если есть точные location отдельных страниц, добавьте обработку и в них.
4. Сохраните защитные заголовки: в Nginx 1.24 добавление add_header в location
   отменяет наследование add_header от родителя.
5. Сделайте бэкап действующей конфигурации, проверьте `nginx -t`, затем reload.

deploy.sh теперь исключает из rsync только `/.well-known/acme-challenge/`.
Каталоги и навыки публикуются вместе со сборкой. Пользователю деплоя нужен доступ
к созданию этих файлов внутри .well-known; права на ACME challenges менять не нужно.
GitHub Pages раздаёт прямые Markdown/JSON URL. HTTP Link, согласование форматов
и MIME extensionless api-catalog требуют сервера или CDN.

Проверки после выпуска:

```bash
curl -I https://sellico.ru/
curl -i -H 'Accept: text/markdown' https://sellico.ru/
curl -i -H 'Accept: text/markdown' https://sellico.ru/calculators/margin/
curl -i -H 'Accept: text/markdown;q=0, text/html' https://sellico.ru/
curl -i https://sellico.ru/.well-known/api-catalog
curl -i https://sellico.ru/.well-known/ai-catalog.json
curl -i https://sellico.ru/.well-known/agent-skills/index.json
```

## Оставшиеся интеграции

После выпуска манифеста для ARD можно опубликовать TXT `_catalog._agents.sellico.ru`
со значением `url=https://sellico.ru/.well-known/ai-catalog.json`.
Это обнаружение ARD, а не реализация DNS-AID. SVCB/HTTPS для DNS-AID должны указывать
на реально обслуживаемый discovery endpoint и реальные ALPN/параметры протокола.
Запись _a2a с alpn=a2a требует A2A-сервиса. DNSSEC настраивается у DNS-провайдера
с публикацией DS у регистратора.

OAuth, агентская регистрация, MCP и платежи требуют backend-реализации и параметров
владельца сервиса. Для следующего этапа нужны выбранный issuer и модель прав,
MCP/A2A endpoints (если нужны), DNS-провайдер и способы оплаты с получателями и ценами.

## Результаты самостоятельной проверки 29 октября 2026

- NS: ns1.timeweb.ru, ns2.timeweb.ru, ns3.timeweb.org, ns4.timeweb.org.
  DNS-over-HTTPS Google вернул DNSKEY и RRSIG, но пустой ответ DS и AD=false.
  `_index._agents`, `_a2a._agents` и `_catalog._agents` вернули NXDOMAIN.
  Проверка DS необходима у регистратора; одной подписи зоны недостаточно для цепочки доверия.
- Timeweb документирует поддержку SVCB и HTTPS. Подключённого доступа к панели/API
  Timeweb в задаче нет; существующие NS менять не требуется.
- Политика использования контента объявлена через Content Signals без новых Disallow
  для публичных страниц. Google-Extended одновременно управляет обучением и grounding
  Gemini: его блокировка также ограничила бы разрешённое использование в AI-ответах.
- В `placesales_api/routes/api.php` вход выполняется через POST /login и /refresh,
  приватные маршруты защищены auth:sanctum. AuthController выдаёт Sanctum access/refresh
  tokens; вход через внешнего провайдера не превращает Sellico в OAuth issuer.
- `YooKassaPaymentService::registerOrder` создаёт RUB-платёж с redirect confirmation
  и Idempotence-Key order-{id}; результат оплаты проверяется сервером. Это существующий
  checkout пользователей, без реализации x402/MPP/UCP/ACP в проверенных routes.
- SSH crm_admin работает. Nginx применён пользователем через sudo и проверен
  после перезагрузки. Лендинг опубликован отдельным релизом. Backend, настройки DNS,
  пользователи, токены, заказы и платежи не изменялись.

Для текущего публичного лендинга полезны опубликованные в этой сборке каталоги,
Markdown, навыки и WebMCP. OAuth, отдельный MCP-сервис и commerce-протоколы следует
вводить как серверные возможности с отдельными правами доступа и платёжной моделью.
До их появления соответствующие пункты сканера останутся непройденными.

Спецификации: [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288),
[RFC 9727](https://www.rfc-editor.org/rfc/rfc9727),
[Agent Skills v0.2.0](https://github.com/cloudflare/agent-skills-discovery-rfc),
[WebMCP](https://webmachinelearning.github.io/webmcp/),
[ARD](https://agenticresourcediscovery.org/).
Справка провайдера: [SVCB в Timeweb](https://timeweb.com/ru/docs/domeny/resursnye-zapisi-domena-dns-zapisi/nastrojka-dns-zapisej/svcb/).
Авторизация: [Laravel Sanctum](https://laravel.com/framework/docs/13.x/sanctum).
Контроль Google: [Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended).
