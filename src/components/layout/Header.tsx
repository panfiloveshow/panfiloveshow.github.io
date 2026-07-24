import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  ChartColumn,
  ChevronDown,
  ListChecks,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Search,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { LOGIN_URL, REGISTER_URL, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';
import { useDialogFocus } from '@/hooks/useDialogFocus';

const PRODUCT_ITEMS = [
  { icon: Users, title: 'CRM и продажи', desc: 'Лиды, заявки и воронка продаж', id: 'wow' },
  { icon: Package, title: 'Товары и каталог', desc: 'Карточки, остатки, себестоимость', id: 'wow' },
  { icon: ChartColumn, title: 'Финансы', desc: 'Выручка, расходы, ABC-анализ', id: 'wow' },
  { icon: Truck, title: 'Поставки', desc: 'Автопланы и контроль остатков', id: 'wow' },
  { icon: ListChecks, title: 'Задачи и команда', desc: 'Канбан, роли и дедлайны', id: 'wow' },
  { icon: Search, title: 'SEO и карточки', desc: 'Аудит и AI-генерация описаний', id: 'wow' },
  { icon: Megaphone, title: 'Реклама', desc: 'Кампании, ставки и фразы', id: 'wow' },
  { icon: MessageSquare, title: 'Отзывы и связи', desc: 'Автоответы, почта и чат', id: 'wow' },
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

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200',
      isActive
        ? 'bg-white/[0.12] text-white'
        : 'text-white/78 hover:bg-white/[0.06] hover:text-white',
    );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'py-2 max-lg:border-b max-lg:border-ink-950/[0.06] max-lg:bg-white/70 max-lg:backdrop-blur-xl lg:py-2.5'
          : 'py-3 max-lg:border-b max-lg:border-transparent lg:py-4',
      )}
    >
      <Container className="lg:max-w-none lg:px-16">
        {/* На десктопе весь бар — тёмная стеклянная капсула */}
        <div
          className={cn(
            'flex h-11 items-center justify-between gap-3 transition-all duration-300',
            'lg:h-14 lg:rounded-full lg:border lg:pl-5 lg:pr-2 lg:backdrop-blur-xl',
            scrolled
              ? 'lg:border-white/[0.09] lg:bg-[#0b1512]/95 lg:shadow-[0_1px_0_rgba(255,255,255,0.07)_inset,0_24px_60px_-24px_rgba(9,14,23,0.6)]'
              : 'lg:border-white/[0.07] lg:bg-[#0b1512]/85 lg:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_18px_48px_-26px_rgba(9,14,23,0.45)]',
          )}
        >
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNav('hero');
            }}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="Sellico — главная"
          >
            <img src="/logo.svg" alt="" className="h-7 w-7" />
            <span className="text-[1.08rem] font-bold tracking-[-0.02em] text-ink-950 lg:text-white">
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
                <div className="absolute left-1/2 top-[calc(100%+14px)] w-[640px] -translate-x-1/2 animate-rise-fade rounded-3xl border border-white/10 bg-[#0b1512]/95 p-2.5 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_32px_80px_-24px_rgba(9,14,23,0.7)] backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {PRODUCT_ITEMS.map(({ icon: Icon, title, desc, id }) => (
                      <button
                        key={title}
                        onClick={() => handleNav(id)}
                        className="group flex items-start gap-3 rounded-2xl p-3 text-left transition-colors duration-200 hover:bg-white/[0.06]"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-300/20 bg-brand-400/10 text-brand-300 transition-colors duration-200 group-hover:bg-brand-400/20">
                          <Icon size={16} />
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-semibold text-white">{title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-white/72">{desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between border-t border-white/10 px-3 py-2.5">
                    <button
                      onClick={() => handleNav('features')}
                      className="text-[13px] font-medium text-white/75 transition-colors hover:text-white"
                    >
                      Все возможности
                    </button>
                    <button
                      onClick={() => handleNav('demo')}
                      className="flex items-center gap-1 text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
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
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              as="a"
              href={LOGIN_URL}
              variant="ghost"
              size="sm"
              className="hidden rounded-full px-4 text-[13px] text-white/75 hover:bg-white/[0.07] hover:text-white xl:inline-flex"
              onClick={() => track('cta_click_header', { target: 'login' })}
            >
              Войти
            </Button>
            <Button
              as="a"
              href={REGISTER_URL}
              variant="primary"
              size="sm"
              className="hidden gap-1.5 whitespace-nowrap rounded-full px-[18px] text-[13px] sm:inline-flex"
              iconRight={
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              }
              onClick={() => track('cta_click_header', { target: 'register' })}
            >
              Подключить магазин
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 bg-white/80 text-ink-950 backdrop-blur lg:hidden"
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
            className="absolute inset-0 bg-[#07110f]/95 backdrop-blur-xl"
            onClick={() => setOpen(false)}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(45,187,144,0.18),transparent_45%)]"
          />
          <div className="relative flex h-full flex-col px-6 pb-8 pt-4">
            <h2 id="mobile-menu-title" className="sr-only">Меню Sellico</h2>
            <div className="flex h-12 items-center justify-between">
              <a href="#hero" onClick={(e) => { e.preventDefault(); handleNav('hero'); }} className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="" className="h-7 w-7 brightness-0 invert" />
                <span className="text-[1.08rem] font-bold tracking-[-0.02em] text-white">sellico</span>
              </a>
              <button
                ref={mobileCloseRef}
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white"
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
                  className="animate-rise-fade rounded-2xl px-3 py-3 text-left text-[28px] font-semibold tracking-tight text-white/85 transition-colors hover:text-brand-300"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto grid gap-2.5">
              <Button
                as="a"
                href={REGISTER_URL}
                variant="primary"
                size="md"
                className="w-full rounded-full"
                iconRight={<ArrowUpRight size={16} />}
                onClick={() => track('cta_click_header', { target: 'register' })}
              >
                Подключить магазин
              </Button>
              <Button
                as="a"
                href={LOGIN_URL}
                variant="dark"
                size="md"
                className="w-full rounded-full border-white/15"
                onClick={() => track('cta_click_header', { target: 'login' })}
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
