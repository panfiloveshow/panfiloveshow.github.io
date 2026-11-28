import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  Calculator,
  ChartColumn,
  ChevronDown,
  ListChecks,
  Megaphone,
  Menu,
  MessageSquare,
  Search,
  Store,
  Truck,
  X,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { LOGIN_URL, REGISTER_URL, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { useDialogFocus } from '@/hooks/useDialogFocus';

// Каждый пункт ведёт на свою страницу: раньше все восемь скроллили в одну секцию лендинга.
const PRODUCT_ITEMS = [
  { icon: ChartColumn, title: 'Юнит-экономика', desc: 'Прибыль и маржинальность по SKU', href: '/unit-economics/' },
  { icon: Truck, title: 'Остатки и поставки', desc: 'Автопланы и контроль запаса', href: '/supply-planning/' },
  { icon: Search, title: 'SEO карточек', desc: 'Аудит и AI-генерация описаний', href: '/seo-cards/' },
  { icon: Megaphone, title: 'Реклама и цены', desc: 'Кампании в связке с экономикой', href: '/advertising/' },
  { icon: MessageSquare, title: 'Отзывы и заявки', desc: 'Очереди, статусы и ответственные', href: '/reviews/' },
  { icon: ListChecks, title: 'Задачи и команда', desc: 'Канбан, роли и дедлайны', href: '/team/' },
  { icon: Store, title: 'Маркетплейсы', desc: 'Wildberries, Ozon, Яндекс Маркет', href: '/marketplaces/' },
  { icon: Calculator, title: 'Калькуляторы', desc: 'Юнит-экономика, ДРР, оборачиваемость', href: '/calculators/' },
];

// Страницы, доступные из мобильного меню отдельным блоком
const MOBILE_PAGES = [
  { label: 'Юнит-экономика', href: '/unit-economics/' },
  { label: 'Остатки и поставки', href: '/supply-planning/' },
  { label: 'SEO карточек', href: '/seo-cards/' },
  { label: 'Маркетплейсы', href: '/marketplaces/' },
  { label: 'Сравнения систем', href: '/compare/' },
  { label: 'Калькуляторы', href: '/calculators/' },
  { label: 'Глоссарий', href: '/glossary/' },
  { label: 'Статьи', href: '/articles/' },
];

// Секции, при которых пункт «Продукт» считается активным
const PRODUCT_SECTIONS = ['wow', 'features', 'demo'];

const NAV = [
  { id: 'how', label: 'Как работает' },
  { id: 'demo', label: 'Интерфейс' },
  { id: 'proof', label: 'Сценарии' },
  { id: 'pricing', label: 'Тарифы' },
];

const MOBILE_NAV = [
  { id: 'wow', label: 'Модули' },
  { id: 'features', label: 'Операционка' },
  ...NAV,
];

const OBSERVED_SECTIONS = ['wow', 'features', 'how', 'demo', 'proof', 'pricing'];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const scrolledRef = useRef(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  useDialogFocus(open, mobileDialogRef, () => setOpen(false), { initialFocusRef: mobileCloseRef });

  useEffect(() => {
    let frame = 0;

    const updateScrolled = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 12;
      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(updateScrolled);
      }
    };

    updateScrolled();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Подсветка активной секции в навигации
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const id of OBSERVED_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Закрытие дропдауна по Escape
  useEffect(() => {
    if (!productOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProductOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [productOpen]);

  const openProduct = () => {
    window.clearTimeout(closeTimer.current);
    setProductOpen(true);
  };
  const closeProduct = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setProductOpen(false), 140);
  };

  const handleNav = (id: string) => {
    setOpen(false);
    setProductOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  const onArticles = window.location.pathname.startsWith('/articles');

  const navItemClass = (isActive: boolean) =>
    cn(
      // Компактные отступы сохраняют все пункты на ширине 1024–1279 px.
      'flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200 xl:px-3.5',
      isActive
        ? 'bg-[#eaf6f0] text-[#144f40]'
        : 'text-[#475569] hover:bg-[#f1f8f4] hover:text-[#144f40]',
    );

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 border-b border-[#e8eeeb] bg-white transition-shadow duration-200', scrolled && 'shadow-[0_3px_14px_rgba(20,50,35,0.04)]')}>
      <Container className="lg:max-w-[1600px] lg:px-[clamp(40px,4.1vw,64px)]">
        <div className="flex h-[72px] items-center justify-between gap-3 lg:h-[clamp(66px,5.2vw,82px)]">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNav('hero');
            }}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="Sellico — главная"
          >
            <img src="/logo.svg" alt="" aria-hidden="true" width={32} height={32} className="h-8 w-8 lg:h-[clamp(32px,2.5vw,40px)] lg:w-[clamp(32px,2.5vw,40px)]" />
            <span className="text-[26px] font-bold tracking-[-0.05em] text-[#19282e] lg:text-[clamp(24px,1.9vw,30px)]">
              sellico
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Главное меню">
            {/* Продукт — мега-дропдаун */}
            <div className="relative" onMouseEnter={openProduct} onMouseLeave={closeProduct}>
              <button
                onClick={() => setProductOpen((s) => !s)}
                aria-expanded={productOpen}
                aria-haspopup="true"
                className={navItemClass(productOpen || PRODUCT_SECTIONS.includes(active))}
              >
                Продукт
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', productOpen && 'rotate-180')}
                />
              </button>

              {productOpen && (
                <div className="absolute left-1/2 top-[calc(100%+14px)] w-[640px] -translate-x-1/2 animate-rise-fade rounded-3xl border border-[#e3ece6] bg-white p-2.5 shadow-[0_18px_48px_rgba(20,50,35,0.12)]">
                  <div className="grid grid-cols-2 gap-1">
                    {PRODUCT_ITEMS.map(({ icon: Icon, title, desc, href }) => (
                      <a
                        key={title}
                        href={href}
                        className="group flex items-start gap-3 rounded-2xl p-3 text-left transition-colors duration-200 hover:bg-[#eff8f3]"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d5eee2] bg-[#e9f7ef] text-[#198569] transition-colors duration-200 group-hover:bg-[#dff2e8]">
                          <Icon size={16} />
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-semibold text-[#233b31]">{title}</span>{' '}
                          <span className="mt-0.5 block text-xs leading-snug text-[#475569]">{desc}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between border-t border-[#e3ece6] px-3 py-2.5">
                    <div className="flex items-center gap-4">
                      <a
                        href="/features/"
                        className="text-[13px] font-medium text-[#475569] transition-colors hover:text-[#144f40]"
                      >
                        Все возможности
                      </a>
                      <a
                        href="/compare/"
                        className="text-[13px] font-medium text-[#475569] transition-colors hover:text-[#144f40]"
                      >
                        Сравнения
                      </a>
                    </div>
                    <button
                      onClick={() => handleNav('demo')}
                      className="flex items-center gap-1 text-[13px] font-semibold text-[#144f40] transition-colors hover:text-[#0d3b2f]"
                    >
                      Смотреть интерфейс
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={navItemClass(active === item.id)}
              >
                {item.label}
              </button>
            ))}
            {/* Раздел, а не секция лендинга: обычная ссылка, иначе на десктопе в статьи не попасть */}
            <a
              href="/articles/"
              aria-current={onArticles ? 'page' : undefined}
              className={navItemClass(onArticles)}
            >
              Статьи
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              as="a"
              href={LOGIN_URL}
              variant="ghost"
              size="sm"
              className="hidden rounded-xl px-4 text-[14px] !text-[#475569] hover:bg-[#f1f8f4] xl:inline-flex"
              onClick={() => track('cta_click_header_login', { target: 'login' })}
            >
              Войти
            </Button>
            <Button
              as="a"
              href={REGISTER_URL}
              variant="ghost"
              size="sm"
              className="hidden !h-[clamp(40px,3.2vw,50px)] gap-1.5 whitespace-nowrap rounded-xl !bg-[#eaf7f1] px-[22px] text-[14px] !text-[#144f40] hover:!bg-[#dcefe5] sm:inline-flex"
              onClick={() => track('cta_click_header_register', { target: 'register' })}
            >
              Подключить магазин
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#deebe3] bg-[#f2f8f4] text-[#144f40] lg:hidden"
              aria-label="Открыть меню"
              aria-expanded={open}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </Container>

      {/* Полноэкранное мобильное меню — через портал, т.к. backdrop-blur хедера
          делает его containing block для fixed-потомков */}
      {open && createPortal(
        <div
          ref={mobileDialogRef}
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          tabIndex={-1}
        >
          <div
            className="absolute inset-0 bg-white"
            onClick={() => setOpen(false)}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,187,144,0.18),transparent_45%)]"
          />
          <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-8 pt-4">
            <h2 id="mobile-menu-title" className="sr-only">Меню Sellico</h2>
            <div className="flex h-12 items-center justify-between">
              <a href="#hero" onClick={(e) => { e.preventDefault(); handleNav('hero'); }} className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="" aria-hidden="true" width={32} height={32} className="h-8 w-8" />
                <span className="text-[26px] font-bold tracking-[-0.05em] text-[#19282e] lg:text-[clamp(24px,1.9vw,30px)]">sellico</span>
              </a>
              <button
                ref={mobileCloseRef}
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#deebe3] bg-[#f2f8f4] text-[#216b58]"
                aria-label="Закрыть меню"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-1" aria-label="Мобильное меню">
              {MOBILE_NAV.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="animate-rise-fade rounded-2xl px-3 py-3 text-left text-[28px] font-semibold tracking-tight text-[#233b31] transition-colors hover:text-[#198569]"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  {item.label}
                </button>
              ))}
              <span className="mx-3 mt-5 border-t border-[#e3ece6] pt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#475569]">
                Разделы
              </span>
              {MOBILE_PAGES.map((page) => (
                <a
                  key={page.href}
                  href={page.href}
                  className="rounded-2xl px-3 py-2 text-left text-lg font-semibold text-[#475569] transition-colors hover:text-[#144f40]"
                >
                  {page.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto grid gap-2.5">
              <Button
                as="a"
                href={REGISTER_URL}
                variant="ghost"
                size="md"
                className="w-full rounded-xl !bg-[#087f5e] !text-white hover:!bg-[#076d50]"
                iconRight={<ArrowUpRight size={16} />}
                onClick={() => track('cta_click_header_register', { target: 'register' })}
              >
                Подключить магазин
              </Button>
              <Button
                as="a"
                href={LOGIN_URL}
                variant="ghost"
                size="md"
                className="w-full rounded-xl !bg-[#eaf7f1] !text-[#144f40]"
                onClick={() => track('cta_click_header_login', { target: 'login' })}
              >
                Войти
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
