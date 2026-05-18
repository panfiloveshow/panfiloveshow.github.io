import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { LOGIN_URL, REGISTER_URL, scrollToSection } from '@/lib/anchors';
import { track } from '@/lib/analytics';

const NAV = [
  { id: 'wow', label: 'Модули' },
  { id: 'features', label: 'Операционка' },
  { id: 'how', label: 'Как работает' },
  { id: 'demo', label: 'Интерфейс' },
  { id: 'proof', label: 'Сценарии' },
  { id: 'pricing', label: 'Тарифы' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrolledRef = useRef(false);

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

  const handleNav = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'py-2.5' : 'py-5',
      )}
    >
      <Container className="lg:max-w-none lg:px-16">
        <div
          className={cn(
            'relative flex items-center justify-between rounded-2xl transition-all duration-300',
            scrolled
              ? 'h-14 border border-ink-950/[0.06] bg-white/85 px-4 shadow-card-soft backdrop-blur-md sm:px-5'
              : 'h-14 bg-transparent px-1',
          )}
        >
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNav('hero');
            }}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="Sellico — главная"
          >
            <div className="relative grid h-8 w-8 place-items-center">
              <img src="/logo.svg" alt="" className="h-7 w-7" />
            </div>
            <span className="text-[1.08rem] font-bold tracking-[-0.02em] text-ink-950">
              sellico
            </span>
          </a>

          <nav className="hidden items-center gap-5 lg:absolute lg:left-[252px] lg:flex xl:gap-7" aria-label="Главное меню">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="rounded-xl px-0 py-2 text-[15px] font-medium text-ink-600 transition-colors hover:text-ink-950"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              as="a"
              href={LOGIN_URL}
              variant="ghost"
              size="sm"
              className="hidden px-3 text-[13px] text-ink-950 xl:inline-flex"
              onClick={() => track('cta_click_header', { target: 'login' })}
            >
              Войти
            </Button>
            <Button
              as="a"
              href={REGISTER_URL}
              variant="primary"
              size="sm"
              className="hidden rounded-xl bg-brand-600 px-4 text-[13px] hover:bg-brand-500 sm:inline-flex"
              onClick={() => track('cta_click_header', { target: 'register' })}
            >
              Подключить магазин
            </Button>
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink-950/10 bg-white/80 text-ink-950 backdrop-blur lg:hidden"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-ink-950/[0.06] bg-white/95 shadow-card-soft backdrop-blur-md lg:hidden">
            <nav className="flex flex-col p-2" aria-label="Мобильное меню">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="w-full rounded-xl px-4 py-3 text-left text-[0.95rem] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-ink-950"
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink-950/[0.06] p-2 pt-3">
                <Button as="a" href={LOGIN_URL} variant="secondary" size="sm">
                  Войти
                </Button>
                <Button as="a" href={REGISTER_URL} variant="primary" size="sm">
                  Попробовать
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
