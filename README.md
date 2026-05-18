# Sellico Landing

High-conversion B2B SaaS landing page для Sellico — операционной системы для продавцов на маркетплейсах (Wildberries, Ozon, Яндекс Маркет).

## Stack

- **Vite 5** + **React 18** + **TypeScript 5**
- **Tailwind CSS 3.4** + кастомные токены и анимации
- **Framer Motion 11** для скролл-анимаций, parallax, spotlight
- **lucide-react** иконки
- **@fontsource-variable/inter** (self-host, без CLS)
- **pnpm** package manager

## Команды

```bash
pnpm install        # установка зависимостей
pnpm dev            # dev-сервер (Vite, по умолчанию :5173)
pnpm build          # production-сборка → dist/
pnpm preview        # локальный preview production-сборки
pnpm typecheck      # tsc -b --noEmit
pnpm lint           # ESLint
```

## Структура секций

1. **Header** — sticky, glass-on-scroll, navigation + CTA.
2. **Hero** — display-2xl типографика, scroll-progress, mesh + glow-orbs, CSS-perspective DashboardMock.
3. **LogosStrip** — marquee из SVG-логотипов маркетплейсов и партнёров.
4. **ProblemSolution** — chaos vs Sellico split.
5. **FeaturesSection** — bento-grid из 6 фич с gradient-borders.
6. **WowSection (dark)** — comparison старого стека vs Sellico, spotlight.
7. **HowItWorks** — 4 шага со scroll-progress connector.
8. **InterfaceDemo (dark)** — табы по модулям + tilt-эффект на скриншоты.
9. **SocialProof** — animated counters + кейсы.
10. **PricingSection** — 4 тарифа (Старт / Про / Бизнес / Энтерпрайз).
11. **FaqSection** — 8 раскрывающихся вопросов.
12. **FinalCta (dark)** — большой email-form CTA с glow.
13. **Footer** — 4 колонки + ИП реквизиты + status link.

## Дизайн-система

Брендинг согласован с production-фронтом sellico.ru:

- **Primary brand**: `#2CBA66` (brand-500), accent `#5BE49B`.
- **Dark surfaces**: `#0A0E14` (ink-900), `#06080C` (ink-950) для wow/demo/cta секций.
- **Light surfaces**: `#FAFAFA` (surface-light), `#F4F6F8` (surface-muted).
- **Body text**: `#212B36` (ink-100), серые тона ink-300/400/500.
- **Шрифты**: Inter Variable (sans), JetBrains Mono (числа/метрики).

Кастомные утилиты в `src/styles/globals.css`:

- `glass-light`, `glass-dark` — glassmorphism.
- `gradient-text-brand` — зелёный градиент для акцентов в заголовках.
- `mask-fade-y`, `mask-fade-x` — мягкое затухание границ секций и marquee.
- `grid-bg-light`, `grid-bg-dark` — pixel-perfect grid backdrops.
- `noise-overlay` — SVG-noise через `::after` для премиум-текстуры.
- `conic-glow` — anim conic-gradient orbits для Hero/CTA.
- `gradient-border` — animated gradient ring на cards.
- `spotlight` — cursor-tracking radial gradient (через `Spotlight` компонент).

## Аналитика и события

`src/lib/analytics.ts` оборачивает Yandex.Metrika `reachGoal`:

- `cta_click_hero | _header | _pricing | _final` — CTA-клики
- `pricing_select` — выбор тарифа
- `faq_open` — раскрытие FAQ
- `lead_submit` — submit email-формы
- `scroll_50 | _75 | _100` — глубина скролла

Чтобы включить — установи `YM_COUNTER_ID` в `analytics.ts` и подключи Метрику в `index.html` (после согласия cookies).

## Cookie / 152-ФЗ

`CookieBanner` показывается через 800ms после загрузки на первом визите, состояние хранится в `localStorage:sellico:cookie-consent`. Yandex.Metrika инициализируется только после согласия.

## Деплой

```bash
bash deploy.sh
```

Скрипт повторяет паттерн `front 2/frontend/deploy-prod-dist.sh`: локальный `pnpm build` → бэкап `dist/` на сервере → `rsync --delete` нового dist на удалённый таргет.

**Default target:** `crm_admin@sellico.ru:/var/www/html/landing/dist` (ещё не финализирован — поддомен укажет владелец).

Override через env:

```bash
DEPLOY_REMOTE=user@host \
DEPLOY_DIST_PATH=/var/www/landing.sellico.ru \
SSHPASS='...' bash deploy.sh
```

## Как тестировать

1. `pnpm dev` → визуальный обход секций на desktop (1440×900) и mobile (375×667).
2. `pnpm build && pnpm preview` → проверка production-бандла.
3. Lighthouse mobile: цель Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO = 100.
4. Keyboard tab: focus-rings видны на всех CTA, корректный focus order.
5. CTA wiring: «Попробовать бесплатно» → `https://sellico.ru/register`.
6. Email-форма Final CTA → submit → редирект на `/register?email=...`.

## Что отложено на v2

- **Реальный r3f-сцена** в Hero (сейчас CSS-perspective + Framer parallax — даёт 90% эффекта при 5% сложности).
- **Реальные скриншоты модулей** в `public/screenshots/` (сейчас высокачественные HTML-mock).
- **Yandex.Metrika counter ID** — требует подключения после получения counter.
- **Telegram-бот webhook** для лидов из email-формы (сейчас только редирект на `/register?email=...`).
- **Prerender** через `vite-plugin-prerender` для FCP-критичной разметки.
