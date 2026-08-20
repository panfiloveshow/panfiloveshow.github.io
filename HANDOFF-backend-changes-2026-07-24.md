# Передача разработчику: изменения на бэкенде sellico.ru

**Дата работ:** 2026-07-24
**Сервер:** `sellico.ru`, код бэкенда: `/var/www/html/backend`
**Стек:** Laravel 12.53.0, PHP 8.4.18 (php8.4-fpm), MySQL `api_db`, LibreOffice 24.2.7.2 (конвертация DOCX→PDF), nginx.
**Автор изменений:** правки внесены вручную (копированием файлов + правкой `.env`), развёрнуты на прод.

> 🔴 **КРИТИЧНО — ПРОЧТИ ДО СЛЕДУЮЩЕГО PUSH В MAIN.** Все изменения ниже применены на боевом сервере, но их НЕТ в `github.com/wadimtruskov/placesales_api` (main). Твой GitHub Actions деплой (`.github/workflows/deploy.yml`) на каждый push в `main` делает **`rsync --delete` в `/var/www/html/backend`** — следующий push в main СОТРЁТ с прода всё из этого документа (договоры, счета, Альфа-TLS, фикс лимитов) и вдобавок код промо-баннеров от 23.07 (`app/Http/Controllers/Api/PromoBanners/*`, `app/Models/PromoBanner.php` — их в GitHub-репо тоже нет).
>
> **Точное состояние прода запушено в ветку `prod-snapshot-2026-07-24`** (3 коммита: first commit → полный снапшот прода → тесты). Перед любым деплоем: смержи её в main (при конфликтах в пересекающихся файлах прод-версия — источник правды работающего прода; свои недодеплоенные фичи сохраняй). Учти, что твой `tests/Unit/WorkspaceContractPdfGeneratorTest.php` может потребовать адаптации к новому генератору. Серверный git-чекаут был оторван от GitHub с самого начала (деплой шёл rsync-ом мимо .git) — после мержа стоит синхронизировать и его.

Бэкапы всех оригиналов до правок: `/home/crm_admin/archive/legal-docs-2026-07-24/`.

---

## 1. Что вообще делали (контекст задачи)

Три блока проблем, всё вокруг раздела «Юридические данные» workspace и оплаты подписки:

1. **Генерация договоров** выдавала документ с пустыми полями (прочерки в колонтитуле, пустая дата окончания, незаполненный телефон, «КПП: -» у ИП) и без подписи. Счета формировались с реквизитами-заглушками из нулей.
2. **Оплата подписки** («Продлить тариф») падала с 502; после починки — ложно показывала «оплата успешна» при отмене и выбрасывала из сессии.
3. **Удаления** сохранённых договоров/счетов в ЛК не было.

---

## 2. Изменённые/добавленные файлы на бэкенде (снять в git)

| Файл | Тип | Раздел |
|---|---|---|
| `app/Services/Legal/WorkspaceContractPdfGenerator.php` | изменён | 3 |
| `app/Http/Controllers/Api/WorkspaceLegalDocumentController.php` | изменён | 3, 5 |
| `resources/templates/legal/sellico-contract.docx` | заменён | 3 |
| `resources/certs/ca-bundle-with-russian.pem` | **новый** | 4 |
| `resources/certs/russian_trusted_root_ca.crt` | **новый** | 4 |
| `resources/certs/russian_trusted_sub_ca.crt` | **новый** | 4 |
| `app/Services/Payments/Alfa/AlfaPaymentService.php` | изменён | 4, 6 |
| `config/services.php` | изменён | 4 |
| `routes/api.php` | изменён | 5 |
| `.env` | изменён | все (см. раздел 7) |

Роуты и конфиг закешированы (`php artisan route:cache`, `config:cache`). **После любых своих правок роутов/`.env` пересобирай кеши**, иначе изменения не подхватятся.

---

## 3. Генерация договоров

### 3.1. Шаблон `resources/templates/legal/sellico-contract.docx`

Механизм генерации: `WorkspaceContractPdfGenerator::generate()` открывает DOCX как zip, делает **строковые замены** по всем `word/*.xml` (тело + колонтитулы), затем `soffice --headless --convert-to pdf`. Замены завязаны на точные строки — если редактируешь шаблон в Word, помни, что Word дробит текст на runs и строка может перестать находиться (для этого добавлена валидация, см. 3.3).

Что изменено внутри шаблона:
- **П. 12.1**: `«действует до «____» ______________ 20____ г.»` → `«действует в течение 1 (одного) года с даты подписания»`. Пустая дата убрана, автопролонгация в пункте сохранена.
- **Телефон Исполнителя** в реквизитах: плейсхолдер `[+7 (___) ___-__-__]` заменён константой `+7 (966) 020-70-61`. (Плейсхолдер телефона **Заказчика** оставлен — его заполняет код.)
- **Новый п. 14.7** — признание факсимиле (п. 2 ст. 160 ГК РФ). Юридическое основание для подписи-картинки.
- **Подпись-факсимиле Исполнителя**: вставлено изображение `word/media/signature-zubarev.png` (прозрачный PNG, ~3.8×1.68 см) над строкой подписи в разделе 15. Добавлены: relationship `rIdSigZ` в `word/_rels/document.xml.rels` и `Default Extension="png"` в `[Content_Types].xml`. Подпись Заказчика намеренно НЕ вставляется.

Документ вырос с 8 до 9 страниц (из-за п. 14.7 + блока подписи).

### 3.2. `WorkspaceContractPdfGenerator.php`

1. **Колонтитул**: в `templateReplacements()` добавлена замена строки колонтитула `Договор Sellico № ____ от «____» …` → `Договор Sellico № {номер} от {дата}`. Метод получил 3-й параметр `Carbon $generatedAt` (вызов обновлён).
2. **КПП для ИП**: замена строки ИНН/КПП стала условной по `entity_type` — для `ip` печатается только ИНН, «КПП: -» убрано.
3. **Номер договора** (`contractNumber()`): при повторной генерации в тот же день добавляется суффикс. Первая — `SLC-{ws}-{Ymd}`, вторая — `…-2` и т.д. Считается по `metadata->contract_number LIKE 'SLC-{ws}-{Ymd}%'`.
4. **Пост-валидация** — новый метод `assertNoUnfilledPlaceholders()`: после заполнения ищет в тексте маркеры незаполненности (`[_`, `«____»`, `20____`, `[+7 (`, `[Полное`, `[должность`, `[Устава`). Если найдены → `RuntimeException` со списком, генерация падает (контроллер вернёт 500 + запись в лог) вместо молчаливой выдачи битого PDF. Вызывается перед конвертацией в PDF.
5. Добавлен импорт `App\Models\WorkspaceLegalDocument`.

### 3.3. Замечание для доработки

Механизм замен хрупкий (точные строки в XML). Если будете часто менять шаблон — стоит перейти на нормальный шаблонизатор (например, `phpoffice/phpword` с TemplateProcessor и `{placeholder}`-плейсхолдерами), чтобы правки шаблона в Word не ломали подстановку. Сейчас валидация (3.2.4) хотя бы делает поломку явной.

---

## 4. Оплата: TLS до шлюза Альфа-Банка (502 «Продлить тариф»)

**Корень проблемы:** шлюз `alfa.rbsuat.com` работает на сертификатах **НУЦ Минцифры (Russian Trusted Root CA)**, которых нет в системном хранилище Ubuntu → TLS-хендшейк из PHP падал с `self-signed certificate in certificate chain` → `ConnectionException` → `OrderController` возвращал 502.

**Решение (без прав root, всё внутри проекта):**
- В `resources/certs/` положены корни НУЦ (скачаны с gu-st.ru): `russian_trusted_root_ca.crt` (действует до 27.02.2032), `russian_trusted_sub_ca.crt`. Нормализованы переводы строк (в исходниках были CRLF без завершающего `\n`, при склейке PEM ломался).
- Собран бандл `ca-bundle-with-russian.pem` = системные CA (`/etc/ssl/certs/ca-certificates.crt`) + оба корня НУЦ.
- `AlfaPaymentService`: конструктор читает `services.alfa_payment.ca_bundle`; если файл существует — HTTP-клиент получает `->withOptions(['verify' => $bundle])`. Без конфига поведение прежнее (системные CA).
- `config/services.php`: добавлен `'ca_bundle' => env('ALFA_PAYMENT_CA_BUNDLE')`.
- `.env`: `ALFA_PAYMENT_CA_BUNDLE=/var/www/html/backend/resources/certs/ca-bundle-with-russian.pem`.

> При деплое в другое окружение бандл нужно пересобрать (системная часть CA берётся с конкретной машины) либо вынести генерацию бандла в deploy-скрипт.

**Вторая причина 502 (вскрылась после TLS-фикса):** шлюз возвращает платёжную форму на домене `uatpayment2way.com`, а в `PAYMENT_FORM_ALLOWED_HOSTS` (белый список хостов формы) был только `alfa.rbsuat.com` → бэк отклонял «неожиданный» URL. Исправлено в `.env` (раздел 7). **Аналогичный allowlist есть и на фронте** — см. раздел 8.

---

## 5. Удаление документов в ЛК

- **Новый эндпоинт:** `DELETE /api/workspaces/{workspace}/legal-documents/{document}` → метод `destroy()` в `WorkspaceLegalDocumentController`.
  - Доступ: владелец workspace или админ (тот же `authorizeManageLegal`, что и генерация).
  - **Подписанные (`status=signed`) и оплаченные (`status=paid`) документы удалить нельзя** → 422.
  - Удаляются: PDF + исходный DOCX (`metadata.source_docx_path`) из storage + запись в БД. Пишется в журнал активности (`workspace_legal_document_deleted`).
- `routes/api.php:113` — регистрация роута (после `…/download`).
- В `WorkspaceLegalDocumentController::generateContract` добавлена 1 строка: номер договора пишется в колонку `document_number` (раньше был только в JSON `metadata`, колонка всегда NULL).

Фронтовая кнопка удаления — в репо CRM-фронта (front2), см. раздел 8.

---

## 6. Оплата: ложное «оплата успешна» при отмене

При отмене оплаты на 3DS-странице банк возвращал пользователя на тот же `?payment=return`, что и при успехе (в `.env` `ALFA_PAYMENT_FAIL_URL` дублировал returnUrl, а `AlfaPaymentService` при отсутствии failUrl подставляет returnUrl). Итог — праздничный экран «Проверяем оплату» при любом исходе.

- `AlfaPaymentService::prepareRegisterPayload()`: если `failUrl` не задан явно — теперь берётся из `config('services.alfa_payment.fail_url')` (с параметрами `payment_workspace`, `order_id`, utm), а не из returnUrl.
- `.env`: `ALFA_PAYMENT_FAIL_URL=https://sellico.ru/crm/feed?payment=fail`.

БД при этом была честная: отменённые заказы оставались `in_progress`/`cancelled`, подписка не продлевалась. Джоба `CheckOrderPaymentStatus` корректно различает статусы банка (2=оплачен, 3/4/6=отказ) — не трогали.

---

## 7. Изменения в `.env` (все ключи)

```env
# Генерация договоров — версия шаблона (пишется в каждую запись документа)
LEGAL_CONTRACT_TEMPLATE_VERSION=2026-07-24         # было 2026-05-20

# Реквизиты поставщика для СЧЕТОВ (были ОТСУТСТВУЮЩИЕ → счета шли с ИНН из нулей!)
LEGAL_INVOICE_SUPPLIER_NAME="ИП Зубарев Данил Викторович"
LEGAL_INVOICE_SUPPLIER_INN=644154992160
LEGAL_INVOICE_SUPPLIER_KPP=
LEGAL_INVOICE_SUPPLIER_OGRN=325527500011480
LEGAL_INVOICE_SUPPLIER_LEGAL_ADDRESS="603096, Россия, Нижегородская область, Нижний Новгород, ул. Светлоярская, 38, 73"
LEGAL_INVOICE_SUPPLIER_BANK_NAME="ФИЛИАЛ \"НИЖЕГОРОДСКИЙ\" АО \"АЛЬФА-БАНК\""
LEGAL_INVOICE_SUPPLIER_BANK_BIK=042202824
LEGAL_INVOICE_SUPPLIER_BANK_ACCOUNT=40802810129080004711
LEGAL_INVOICE_SUPPLIER_CORRESPONDENT_ACCOUNT=30101810200000000824
LEGAL_INVOICE_SUPPLIER_SIGNER_NAME="Зубарев Д.В."
LEGAL_INVOICE_SUPPLIER_SIGNER_TITLE="Индивидуальный предприниматель"

# Оплата — TLS до шлюза Альфа
ALFA_PAYMENT_CA_BUNDLE=/var/www/html/backend/resources/certs/ca-bundle-with-russian.pem

# Оплата — белый список хостов платёжной формы (добавлен uatpayment2way.com)
PAYMENT_FORM_ALLOWED_HOSTS=alfa.rbsuat.com,uatpayment2way.com

# Оплата — отдельный fail URL (был = return URL)
ALFA_PAYMENT_FAIL_URL=https://sellico.ru/crm/feed?payment=fail
```

Не менялись, но важны для понимания: `ALFA_PAYMENT_BASE_URL=https://alfa.rbsuat.com/payment/rest` (см. раздел 9), `ALFA_PAYMENT_RETURN_URL=https://sellico.ru/crm/feed?payment=return`.

---

## 8. Что сделано на фронте CRM (репо front2/frontend-from-server)

Кратко (детальный отчёт по фронту не велся, но для контекста):
- `src/shared/billing/billingOrdersApi.ts`: в allowlist платёжных хостов добавлен `uatpayment2way.com`; добавлен хелпер `redirectToPaymentForm()` (стэшит токены перед уходом на форму).
- `src/shared/services/tokenStorage.ts`: токены хранятся в `sessionStorage` (защита от XSS), но он не переживает редирект через 3DS-страницу банка (COOP рвёт browsing context) → был вылет в логин. Добавлен стэш токенов в `localStorage` с TTL 15 мин на время платёжного редиректа + восстановление при возврате.
- `src/components/subscription/SubscriptionModal.tsx`, `src/shared/billing/PaymentSuccessCelebration.tsx`: уходы на форму через `redirectToPaymentForm()`; поправлен копирайт экрана «Проверяем оплату».
- `WorkspaceSettingsPage.tsx` + `workspaceApi.ts`: метод `deleteWorkspaceLegalDocument()` и кнопка удаления с подтверждением в «Сохранённых документах» (скрыта для подписанных).

Фронт собирается `VITE_APP_BASE=/crm/ npm run build:prod`, деплой — `deploy-prod-dist.sh` (rsync dist в `/var/www/html/frontend/dist`).

---

## 9. ⚠️ КРИТИЧНО для продакшена: платёжный шлюз в ТЕСТЕ

`ALFA_PAYMENT_BASE_URL=https://alfa.rbsuat.com/payment/rest` — это **UAT-песочница** Альфа-Банка. Всё выше чинит интеграцию, но **реальные деньги через песочницу не ходят**. Для боевых платежей нужно:
1. Получить от банка боевой URL эквайринга (обычно `payment.alfabank.ru`) и боевые креды мерчанта (`ALFA_PAYMENT_USER_NAME`/`PASSWORD` или токен).
2. Обновить в `.env`: `ALFA_PAYMENT_BASE_URL`, креды, `ALFA_PAYMENT_RETURN_URL`/`FAIL_URL` (если меняется хост).
3. В `PAYMENT_FORM_ALLOWED_HOSTS` **и в аналогичном allowlist на фронте** (`billingOrdersApi.ts`, `DEFAULT_PAYMENT_FORM_HOSTS`) добавить боевой домен платёжной формы.
4. Проверить, что тип эквайринга в договоре с банком — **классический интернет-эквайринг (ECOM/RBS REST API)**, на котором написан код (`register.do`/`getOrderStatus.do`). НЕ PayKeeper (это другой продукт с другим API — код под него не подойдёт).
5. Боевой сертификат Альфы, скорее всего, тоже цепочки НУЦ Минцифры — бандл из раздела 4 подойдёт, но проверить `curl --cacert` до боевого хоста.

---

## 9bis. Счета: редизайн, цена, подпись, флоу подтверждения (вечер 24.07)

### Файлы
| Файл | Тип |
|---|---|
| `app/Services/Legal/WorkspaceInvoicePdfGenerator.php` | переписан рендер + движок PDF |
| `config/legal_documents.php` | +`pdf_chrome_binary` |
| `resources/legal/signature-zubarev.png` | **новый** (факсимиле для счёта) |
| `.env` | +`BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=true`, +`LEGAL_PDF_CHROME_BINARY` (через `apply-patches-3.sh`) |

### Что и почему
1. **Неверная цена (40 000 ₽ вместо 10 000 ₽).** Счёт брал цену через `PlanCatalog::monthlyPriceForWorkspace()`, которая использует индивидуальную цену workspace только при `billing.allow_workspace_price_override=true` (по умолчанию false → падала на прайс-лист, для enterprise 40 000). А оплата картой (`OrderController`) берёт `workspace->price` напрямую (10 000). Была рассинхронизация. Включён флаг `BILLING_ALLOW_WORKSPACE_PRICE_OVERRIDE=true` — теперь счёт = индивидуальная цена workspace, как и оплата картой.
2. **Движок PDF: LibreOffice → Chrome headless.** Счёт рендерится из HTML. LibreOffice даёт устаревший вид (без flex/radius/градиентов). На сервере есть `google-chrome` — `convertHtmlToPdf()` переключён на `google-chrome --headless=new --print-to-pdf` с фолбэком на LibreOffice, если Chrome недоступен. Путь ищется через `resolveChromeBinary()` (config `legal_documents.pdf_chrome_binary` → env `LEGAL_PDF_CHROME_BINARY` → хардкод `/usr/bin/google-chrome` и пр.).
   - **⚠️ Важный нюанс (SIGTRAP под FPM):** у `www-data` домашняя папка `/var/www` принадлежит root и не писабельна. Chrome без писабельного `$HOME` падает с SIGTRAP (signal 5, exit 133) — «Trace/breakpoint trap». Первая версия давала ровно это (500 «Unable to generate … invoice PDF»). Фикс: `Process` запускается с `env ['HOME' => $profileDirectory]` (папка под `storage/app/.../chrome-profile`, owned by www-data) + флаги `--disable-crash-reporter --disable-breakpad`. Воспроизведено и проверено под `sudo -u www-data`.
3. **Полностью новый дизайн** `renderHtml()`: бренд-шапка Sellico, «К оплате» крупным блоком, карточка реквизитов, блоки Поставщик/Покупатель, таблица позиций с фирменным хедером, итоги, сумма прописью, назначение платежа, футер. Одна страница A4.
4. **Подпись-факсимиле** на счёте: `signatureDataUri()` инлайнит PNG из `resources/legal/signature-zubarev.png` как base64 в HTML (Chrome рендерит).
5. **КПП у ИП** в реквизитах поставщика больше не выводится пустым (условный блок).

### Ответ на «проверяется ли оплата и продлевается ли тариф» (важно — это НЕ баг, флоу есть)
Счёт — это **безналичная оплата по банковскому переводу**, автоматической сверки с банком нет (и не бывает без интеграции банковской выписки — это отдельный крупный проект). Подтверждение **ручное, админом**:
- Админ-эндпоинты уже реализованы: `GET /api/admin/legal-documents/invoices`, `PATCH …/{document}/mark-paid`, `PATCH …/{document}/cancel` (`Api\Admin\WorkspaceLegalInvoiceController`).
- UI: `src/pages/admin/AdminInvoicesPage.tsx` в CRM-фронте.
- **`mark-paid` продлевает тариф автоматически**: в транзакции продлевает `paid_until` на период, вызывает `$workspace->changeType($plan)`, обновляет `price`, ставит счёту `status=signed`/`accepted_at`. То есть после того, как админ убедился в поступлении денег и нажал «оплачено», подписка продлевается сама.

Итого по вопросам пользователя: **оплата подтверждается вручную админом в разделе «Счета», и после подтверждения тариф продлевается автоматически.** Если нужна автоматизация сверки — см. раздел 10.

## 9ter. Баг: подтверждение оплаты сбрасывало лимиты и цену workspace (ночь 24.07)

**Симптом:** после успешного подтверждения оплаты (карта или счёт) у workspace сбрасывались индивидуальные лимиты (в т.ч. договорные enterprise: 500 интеграций, 500 000 товаров и т.п. → дефолты тарифа 6/300/20), а при карт-оплате — и индивидуальная цена (→ каталожная).

**Корень:** оба подтверждения (`Jobs/CheckOrderPaymentStatus::markOrderAsCompleted` и `Api/Admin/WorkspaceLegalInvoiceController::markPaid`) безусловно вызывали `WorkSpace::changeType($plan)`. Метод предназначен для **смены** тарифа: пересеивает `workspace_limits` дефолтами из `WorkSpace::TYPE_LIMITS`, перетирает `price` каталожной ценой и пересчитывает `paid_until` по формуле конвертации остатка дней. При **продлении того же тарифа** всё это разрушительно. (Цена в счётном флоу выживала случайно — `markPaid` перезаписывает её после.)

**Фикс:** в обоих местах `changeType` теперь вызывается только при реальной смене типа (`if ($workspace->type !== $targetType)`). Продление того же тарифа не трогает ни лимиты, ни цену, ни фичи. Поведение при настоящем апгрейде/даунгрейде не менялось. После деплоя выполнен `php artisan queue:restart` (воркеры держат код джобы в памяти).

**Файлы:** `app/Jobs/CheckOrderPaymentStatus.php`, `app/Http/Controllers/Api/Admin/WorkspaceLegalInvoiceController.php` (бэкапы оригиналов — в архиве этой даты).

**Данные:** владелец восстановил лимиты workspace 3 вручную через админку до фикса; проверить стоит только `seo_generation`/`seo_audition` (сейчас 200/300 — это значения из дефолтов, если договорные были другими — поправить в админке).

**Разработчику на подумать:** `changeType()` сам по себе останется опасным (его может вызвать любой будущий код «на всякий случай»). Стоит разделить на `renewCurrentPlan()` (только paid_until) и `switchPlan()` (полная пересадка), либо принимать флаг `preserveCustomLimits`.

## 9quater. Тесты (добавлены 24.07, локальная копия репо)

Все правки этого дня покрыты тестами: `tests/` в репо (коммит «Cover 2026-07-24 backend fixes with tests»). 26 тестов / 64 assertions, sqlite `:memory:`, полный набор миграций проходит на sqlite. Запуск: `./vendor/bin/phpunit` (~0.6 сек). Покрыто: регрессия сброса лимитов при продлении (главный баг), нумерация договоров, замены шаблона + валидация плейсхолдеров, рендер счёта (цена workspace, подпись, КПП, суммы прописью), Alfa (CA-бандл, failUrl, валидация payload), удаление документов (HTTP, включая защиту signed). НЕ покрыто юнитами: сам Chrome-рендер PDF (интеграционный, проверялся вручную под www-data) и флоу admin mark-paid по HTTP (ядро логики покрыто через джобу — логика идентична).

## 10. Рекомендации на будущее (не сделано, на подумать)

- **Пакетная генерация**: договор без Приложения №1 (тарифы) — это договор без цены. Генерировать пакетом договор + Приложение №1 из тарифа workspace (данные уже есть в системе).
- **ПЭП-подписание клиентом**: поля `accepted_at` и статус `signed` в модели `WorkspaceLegalDocument` уже готовы под флоу подтверждения кодом на email.
- **Автозаполнение юрданных по ИНН** (DaData/ЕГРЮЛ) — меньше ручного ввода, меньше пустых полей.
- **Авто-УПД** кроном в конце месяца по активным подпискам.
- Перевести генерацию DOCX на нормальный шаблонизатор (см. 3.3).
- **Автосверка оплат по счетам**: интеграция банковской выписки (Альфа API/1С) → автоматический `mark-paid` вместо ручного. Пока подтверждает админ.
- Договор тоже можно перевести на Chrome-рендер из HTML (как счёт) — единый современный вид всех документов вместо DOCX-шаблона.

---

## 11. Откат

Оригиналы всех файлов до правок: `/home/crm_admin/archive/legal-docs-2026-07-24/`
(`*.orig.php`, `*.v1.php`, `*.v2-pre.php`, `sellico-contract.docx`, `env-backup`).

Порядок отката: вернуть файлы на место → `php artisan config:cache && php artisan route:cache`. Для `.env` — сверить с `env-backup`.
