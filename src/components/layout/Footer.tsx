import { ArrowUpRight, Mail, Send } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { REGISTER_URL, LOGIN_URL } from '@/lib/anchors';

const COLUMNS = [
  {
    title: 'Продукт',
    items: [
      { label: 'Возможности', href: '/features/' },
      { label: 'Тарифы', href: '/pricing/' },
      { label: 'Интерфейс', href: '/#demo' },
      { label: 'Сценарии', href: '/#proof' },
    ],
  },
  {
    title: 'Решения',
    items: [
      { label: 'Wildberries', href: '/marketplaces/#wildberries' },
      { label: 'Ozon', href: '/marketplaces/#ozon' },
      { label: 'Яндекс Маркет', href: '/marketplaces/#yandex-market' },
      { label: 'Для агентств', href: '/features/#team' },
    ],
  },
  {
    title: 'Компания',
    items: [
      { label: 'Войти', href: LOGIN_URL },
      { label: 'Регистрация', href: REGISTER_URL },
      { label: 'Telegram', href: 'https://t.me/sellico' },
      { label: 'Поддержка', href: 'mailto:hello@sellico.ru' },
    ],
  },
];

const SOCIALS = [
  { label: 'Telegram', href: 'https://t.me/sellico', icon: Send },
  { label: 'Почта', href: 'mailto:hello@sellico.ru', icon: Mail },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative isolate scroll-mt-32 overflow-hidden bg-[#07110f] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_14%,rgba(45,187,144,0.14),transparent_34%),radial-gradient(circle_at_8%_92%,rgba(61,130,240,0.07),transparent_34%),linear-gradient(180deg,#07110f_0%,#06100e_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent"
      />

      <Container className="lg:max-w-none lg:px-16">
        <div className="pb-10 pt-24 lg:pb-14">
          <div className="grid items-stretch gap-4 lg:grid-cols-[350px_1fr]">
            {/* Левая карточка — брендовый градиент */}
            <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[28px] p-8 shadow-[0_12px_40px_rgba(45,187,144,0.22)]">
              <div
                aria-hidden
                className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_82%_-10%,rgba(100,213,184,0.5),transparent_52%),radial-gradient(circle_at_0%_110%,rgba(45,187,144,0.35),transparent_50%),linear-gradient(155deg,#155743_0%,#0e3a2d_48%,#092319_100%)]"
              />
              <div
                aria-hidden
                className="absolute inset-[-45%] z-0 animate-orbit-slow bg-[conic-gradient(from_0deg,rgba(100,213,184,0.4),transparent_28%,rgba(45,187,144,0.32)_52%,transparent_74%,rgba(100,213,184,0.4))] blur-3xl"
              />
              <div aria-hidden className="grid-bg-dark absolute inset-0 z-0 opacity-60" />

              <a href="/#hero" className="relative z-[1] inline-flex items-center gap-2.5 transition-opacity hover:opacity-90">
                <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" />
                <span className="text-[22px] font-bold tracking-tight">Sellico</span>
              </a>

              <div className="relative z-[1] mb-7 mt-auto">
                <p className="text-[19px] leading-[1.45] text-white">
                  Операционный контур
                  <br />
                  <span className="text-white/65">для marketplace-команд.</span>
                </p>
              </div>

              <div className="relative z-[1] flex items-center justify-between gap-3">
                <span className="font-hand text-[19px] font-semibold tracking-[0.3px] text-white/90">
                  Мы на связи!
                </span>
                <div className="flex gap-[7px]">
                  {SOCIALS.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#0e1014] shadow-[0_6px_18px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_10px_24px_rgba(0,0,0,0.45),0_4px_10px_rgba(0,0,0,0.3)]"
                    >
                      <Icon size={15} className="text-white" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая карточка — тёмное стекло */}
            <div className="relative flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.045] p-10 backdrop-blur max-sm:p-6 max-sm:pt-28">
              {/* Плавающий кубик */}
              <a
                href={REGISTER_URL}
                className="absolute -top-9 right-10 z-10 flex flex-col items-start gap-1.5 max-sm:-top-7 max-sm:right-3"
                aria-label="Начать бесплатно"
              >
                <img
                  src="/logo.svg"
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rotate-[-8deg] rounded-[22px] border border-white/10 bg-[#102c22] p-4 shadow-[8px_14px_28px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:rotate-[-4deg] max-sm:h-[72px] max-sm:w-[72px]"
                />
                <span className="mt-1 flex rotate-[-4deg] items-center gap-1.5">
                  <ArrowUpRight size={20} className="text-white/72" aria-hidden />
                  <span className="whitespace-nowrap font-hand text-xl font-semibold text-white/72">
                    3 дня бесплатно!
                  </span>
                </span>
              </a>

              <nav className="flex flex-wrap gap-x-16 gap-y-8 pt-2 max-sm:gap-x-10" aria-label="Навигация в подвале">
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    <h3 className="mb-[18px] font-hand text-2xl font-semibold italic text-white/72">
                      {col.title}
                    </h3>
                    <ul>
                      {col.items.map((it) => (
                        <li key={it.label}>
                          <a
                            href={it.href}
                            className="mb-3.5 block text-sm font-semibold text-white/85 transition-colors duration-200 hover:text-brand-300"
                          >
                            {it.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="mt-12 flex items-end justify-between max-sm:mt-6 max-sm:flex-col max-sm:items-start max-sm:gap-6">
                <p className="text-[12.5px] font-medium text-white/70">
                  © {year} Sellico. Все права защищены.
                </p>
                <div className="flex flex-col gap-3.5">
                  <p className="text-[15px] leading-[1.45] text-white/75">
                    Маркетплейсы не ждут.
                    <strong className="block text-[19px] font-bold text-white">Начните с Sellico.</strong>
                  </p>
                  <div className="flex w-[310px] items-center rounded-xl border border-white/10 bg-white/[0.06] p-[5px] shadow-[0_2px_10px_rgba(0,0,0,0.2)] max-sm:w-full">
                    <span className="flex-1 px-3.5 py-[11px] text-[13.5px] text-white/72">
                      3 дня · без карты
                    </span>
                    <a
                      href={REGISTER_URL}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-[22px] py-[11px] text-[13.5px] font-semibold text-ink-950 shadow-[0_6px_20px_rgba(71,209,165,0.28),0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-px hover:bg-brand-300 hover:shadow-[0_10px_26px_rgba(71,209,165,0.38),0_4px_12px_rgba(0,0,0,0.22)]"
                    >
                      Начать
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Юридическая строка */}
          <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 text-xs text-white/70 xl:flex-row xl:items-center xl:justify-between">
            <p className="max-w-md leading-5">
              ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ · ИНН 644154992160 · Нижний Новгород ·{' '}
              <a href="mailto:hello@sellico.ru" className="transition-colors hover:text-white">
                hello@sellico.ru
              </a>
            </p>
            <div className="w-full max-w-[420px] xl:w-[30vw] xl:max-w-[500px]" aria-label="Платежные системы и эквайринг">
              <img
                src="/brand/horizontal-logos.png"
                alt="МИР, СБП, Visa, Mastercard, PayKeeper"
                width={3056}
                height={238}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 xl:justify-end">
              <a href="/privacy/" className="transition-colors hover:text-white">
                Политика обработки персональных данных
              </a>
              <a href="/personal-data-consent/" className="transition-colors hover:text-white">
                Согласие на обработку данных
              </a>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-brand-300/15 bg-brand-300/[0.08] px-3 py-1.5 text-brand-100/80">
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-brand-300" />
                </span>
                Сервис работает
              </span>
            </div>
          </div>
        </div>
      </Container>

      <div className="pointer-events-none -mt-4 overflow-hidden px-4 pb-3 sm:px-8 lg:px-12">
        <p className="select-none text-center text-[clamp(4rem,20vw,6.4rem)] font-black uppercase leading-none text-white/[0.03] sm:text-[11rem] lg:text-[16rem] xl:text-[20rem] 2xl:text-[24rem]">
          Sellico
        </p>
      </div>
    </footer>
  );
}
