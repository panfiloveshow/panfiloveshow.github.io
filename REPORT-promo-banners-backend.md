# Отчёт: промо-баннеры лендинга — что сделано на бэкенде sellico.ru

Дата: 2026-07-23. Сервер: sellico.ru, код: `/var/www/html/backend` (Laravel 12, MySQL `api_db`, PHP-FPM от `www-data`). Все изменения — точечные, существующий код не менялся (кроме двух файлов роутов, см. п. 4).

## 1. Что это

Слайдер баннеров на главной sellico.ru переводится с захардкоженного текста на картинки, управляемые из админ-консоли CRM (sellico.ru/crm → Админ → «Баннеры»). Бэкенд хранит баннеры и отдаёт два API: публичный (для лендинга) и админский CRUD.

## 2. База данных

Новая таблица `promo_banners` (существующие таблицы не тронуты):

| Колонка | Тип | Описание |
|---|---|---|
| `id` | bigint PK | |
| `title` | varchar | внутреннее название |
| `image` | varchar | путь в storage к desktop-картинке (`promo-banners/xxx.webp`) |
| `image_mobile` | varchar null | путь к mobile-картинке |
| `alt` | varchar null | alt-текст |
| `link` | varchar(2048) null | URL клика |
| `sort_order` | int, default 0 | порядок в слайдере |
| `is_active` | bool, default true | |
| `active_from` | timestamp null | начало окна показа |
| `active_until` | timestamp null | конец окна показа |
| `created_at`/`updated_at` | timestamps | |

Миграция: `database/migrations/2026_07_23_100000_create_promo_banners_table.php`.
Запускалась точечно (чтобы не потянуть чужие незапущенные миграции):

```bash
php artisan migrate --path=database/migrations/2026_07_23_100000_create_promo_banners_table.php --force
```

## 3. Новые файлы (полные пути)

- `app/Models/PromoBanner.php` — модель (fillable + casts, ничего больше).
- `app/Http/Controllers/Api/PromoBanners/PublicPromoBannerController.php` — публичная выдача.
- `app/Http/Controllers/Api/PromoBanners/AdminPromoBannerController.php` — админский CRUD с загрузкой файлов.
- `database/migrations/2026_07_23_100000_create_promo_banners_table.php`.

## 4. Изменённые файлы (только роуты)

`routes/api.php` — одна строка после публичного `POST /public/applications`:

```php
Route::get('/public/promo-banners', [\App\Http\Controllers\Api\PromoBanners\PublicPromoBannerController::class, 'index']);
```

`routes/admin.php` — импорт `AdminPromoBannerController` + 4 строки в начале группы `auth:sanctum + admin` (prefix `admin`):

```php
Route::get('/promo-banners', [AdminPromoBannerController::class, 'index']);
Route::post('/promo-banners', [AdminPromoBannerController::class, 'store']);
Route::post('/promo-banners/{promoBanner}', [AdminPromoBannerController::class, 'update']);
Route::delete('/promo-banners/{promoBanner}', [AdminPromoBannerController::class, 'destroy']);
```

Update сделан через POST (не PUT/PATCH), потому что PHP не парсит multipart у PUT — фронт шлёт FormData обычным POST.

После правки роутов выполнено `php artisan route:cache` (на сервере включён кеш роутов `bootstrap/cache/routes-v7.php` — **после любых правок роутов его нужно пересобирать**).

## 5. API

### Публичный: `GET /api/public/promo-banners` (без авторизации)

Отдаёт активные (`is_active = true`) баннеры, попадающие в окно `active_from`/`active_until` (NULL = без ограничения), сортировка `sort_order ASC, id ASC`. Заголовок `Cache-Control: public, max-age=300`.

```json
{"data":[{"id":1,"image":"/storage/promo-banners/x.webp","image_mobile":null,"link":"https://...","alt":"..."}]}
```

URL картинок строятся через существующий хелпер `App\Support\StorageUrl::publicUrl()` (относительные `/storage/...` — лендинг живёт на том же домене).

### Админский CRUD: `/api/admin/promo-banners` (middleware `auth:sanctum` + `admin`, т.е. `users.is_admin`)

- `GET /api/admin/promo-banners` — все баннеры, полные поля.
- `POST /api/admin/promo-banners` — создание, multipart/form-data.
- `POST /api/admin/promo-banners/{id}` — обновление, multipart; файл не передан → картинка не меняется; `remove_image_mobile=1` — удалить mobile-картинку.
- `DELETE /api/admin/promo-banners/{id}` — удаление записи + файлов из storage.

Валидация: `title` required (string ≤255); `image` — файл jpeg/png/jpg/webp ≤5120 КБ (required при создании); `image_mobile` — то же, nullable; `alt` ≤255; `link` — url ≤2048; `sort_order` int; `is_active` boolean ('1'/'0'); `active_from`/`active_until` date, `active_until ≥ active_from`; булевы из FormData приходят строками '1'/'0'.

## 6. Файлы баннеров

Хранятся на диске `public`: `storage/app/public/promo-banners/`, раздаются nginx'ом как `https://sellico.ru/storage/promo-banners/...` (проверено: 200). Папку Laravel создаёт сам при первой загрузке (от `www-data`, как у `news/`). При замене/удалении баннера старые файлы удаляются контроллером (`Storage::disk('public')->delete`).

## 7. Инцидент при первом тесте (исправлен)

Симптом: после создания баннера из админки в БД оказалось `image = "0"`, на странице — 404 на `/storage/0`.

Причина: каталог `promo-banners` был создан вручную по SSH от `crm_admin` с правами 775 → PHP-FPM (`www-data`) не мог туда писать → `UploadedFile::store()` вернул `false`, а MySQL привёл `false` к строке `"0"`. Запись создалась «успешно» с битым путём.

Исправлено:
1. Каталог удалён — Laravel создаст его сам от `www-data` при первой загрузке (у родителя `storage/app/public/` права 777).
2. В контроллер добавлен guard: если `store()` вернул `false`/пустую строку — `abort(500, 'Не удалось сохранить файл баннера…')`, чтобы ошибка была явной, а не тихим `"0"` в БД.
3. Битая запись (id 3) и временный демо-баннер (id 2) удалены; сейчас таблица пуста, `GET /api/public/promo-banners` → `{"data":[]}`.

Разработчику: перепроверить загрузку из админки. Если вдруг 500 «Не удалось сохранить файл» — смотреть права на `storage/app/public/promo-banners` (должен владеть `www-data` или каталог должен быть ему доступен на запись).

## 8. Бэкапы / откат

- `/home/crm_admin/archive/promo-banners-2026-07-23/` — `api.php` и `admin.php` до правок.
- `/home/crm_admin/archive/dist-promo-banners-2026-07-23/` — dist CRM-фронта до деплоя.
- `/home/crm_admin/archive/landing-dist-promo-banners-2026-07-23/` — dist лендинга (лендинг НЕ деплоился, бэкап сделан на всякий случай).

Полный откат бэка: вернуть два файла роутов из архива, `php artisan route:cache`, удалить 4 новых файла, `php artisan migrate:rollback --path=database/migrations/2026_07_23_100000_create_promo_banners_table.php` (или просто `DROP TABLE promo_banners`).

## 9. Потребители API

- **Админ-консоль CRM** (sellico.ru/crm → «Баннеры», группа «Операции») — задеплоена, страница `src/pages/admin/AdminBannersPage.tsx` в репо CRM-фронта. Ходит в админский CRUD.
- **Лендинг** (репо «сайт селлико», `PromoBanner` в `src/components/sections/XwayInspiredLanding.tsx`) — код готов и собран, **на прод НЕ задеплоен** (по решению владельца). Пока не задеплоен, sellico.ru показывает старые текстовые слайды. После деплоя: если API отдаёт баннеры — показываются картинки; если список пуст/ошибка — фолбэк на текстовые слайды.

## 10. Рекомендации к картинкам (подсказаны в UI админки)

Desktop 2400×320 (15:2), mobile 1125×375 (3:1), webp/jpg/png до 5 МБ. Фронт кропает по центру через `object-cover`.

## 11. OPcache

На этом сервере `validate_timestamps=1` — правки PHP подхватываются в ~2 сек, рестарт php-fpm не нужен. Но кеш роутов (`route:cache`) пересобирать обязательно после изменения routes/*.
