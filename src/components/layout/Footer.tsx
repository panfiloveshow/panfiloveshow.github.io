import { ArrowUpRight, Building2, FileText, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { LOGIN_URL, REGISTER_URL } from '@/lib/anchors';

const COLUMNS = [
  {
    title: 'Продукт',
    items: [
      { label: 'Возможности', href: '/#features' },
      { label: 'Тарифы', href: '/#pricing' },
      { label: 'Интерфейс', href: '/#demo' },
      { label: 'Сценарии', href: '/#proof' },
    ],
  },
  {
    title: 'Решения',
    items: [
      { label: 'Wildberries', href: '/#features' },
      { label: 'Ozon', href: '/#features' },
      { label: 'Яндекс Маркет', href: '/#features' },
      { label: 'Для агентств', href: '/#features' },
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

const LEGAL = [
  { label: 'Оператор', value: 'ИП ЗУБАРЕВ ДАНИЛ ВИКТОРОВИЧ', icon: Building2 },
  { label: 'ИНН', value: '644154992160', icon: FileText },
  { label: 'Город', value: 'Нижний Новгород', icon: MapPin },
  { label: 'Контакт', value: 'hello@sellico.ru', icon: Mail, href: 'mailto:hello@sellico.ru' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative isolate scroll-mt-32 overflow-hidden bg-[#07110f] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_14%,rgba(45,187,144,0.18),transparent_34%),radial-gradient(circle_at_8%_92%,rgba(61,130,240,0.08),transparent_34%),linear-gradient(180deg,#07110f_0%,#06100e_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg-dark opacity-38 [background-size:72px_72px]" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent"
      />

      <Container className="lg:max-w-none lg:px-16">
        <div className="py-10 lg:py-14">
          <div className="grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <a href="/#hero" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-brand-300/30 bg-brand-400/15 text-lg font-black text-brand-200 shadow-[0_0_40px_rgba(45,187,144,0.18)]">
                  S
                </span>
                <span className="text-2xl font-semibold tracking-tight">Sellico</span>
              </a>
              <p className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Операционный контур для marketplace-команд.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={REGISTER_URL}
                className="group flex min-h-20 items-center justify-between rounded-lg border border-brand-300/25 bg-brand-400 px-4 py-3 text-ink-950 shadow-[0_22px_60px_-28px_rgba(71,209,165,0.9)] transition-transform hover:-translate-y-0.5 sm:min-h-24 sm:px-5 sm:py-4"
              >
                <span>
                  <span className="block text-sm font-semibold">Начать бесплатно</span>
                  <span className="mt-1 block text-xs font-medium text-ink-900/70">14 дней без карты</span>
                </span>
                <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={20} />
              </a>
              <a
                href="https://t.me/sellico"
                className="group flex min-h-20 items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-white backdrop-blur transition-colors hover:border-white/20 hover:bg-white/[0.09] sm:min-h-24 sm:px-5 sm:py-4"
              >
                <span>
                  <span className="block text-sm font-semibold">Написать в Telegram</span>
                  <span className="mt-1 block text-xs font-medium text-white/55">быстрый контакт с командой</span>
                </span>
                <Send className="text-brand-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={19} />
              </a>
            </div>
          </div>

          <div className="grid gap-10 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <nav className="grid gap-8 sm:grid-cols-3" aria-label="Навигация в подвале">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-200">
                    {col.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {col.items.map((it) => (
                      <li key={it.label}>
                        <a
                          href={it.href}
                          className="text-sm text-white/62 transition-colors hover:text-white"
                        >
                          {it.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur sm:p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck size={17} className="text-brand-200" />
                Юридическая информация
              </div>
              <dl className="mt-5 grid gap-4">
                {LEGAL.map(({ label, value, icon: Icon, href }) => (
                  <div key={label} className="grid min-w-0 grid-cols-[20px_1fr] gap-2.5 sm:grid-cols-[22px_1fr] sm:gap-3">
                    <Icon size={16} className="mt-0.5 text-brand-200/80" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-sm leading-5 text-white/70">
                        {href ? (
                          <a href={href} className="transition-colors hover:text-white">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/42">
                Полные реквизиты, цели обработки данных, сроки хранения, порядок отзыва согласия и меры защиты указаны в политике обработки персональных данных.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/10 pt-6 text-xs text-white/42 xl:flex-row xl:items-center xl:justify-between">
            <p>© {year} Sellico. Все права защищены.</p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 xl:justify-end">
              <a href="/privacy" className="transition-colors hover:text-white">
                Политика обработки персональных данных
              </a>
              <a href="/personal-data-consent" className="transition-colors hover:text-white">
                Согласие на обработку данных
              </a>
              <a href="mailto:hello@sellico.ru" className="transition-colors hover:text-white">
                hello@sellico.ru
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

      <div className="pointer-events-none overflow-hidden border-t border-white/10 px-4 pb-3 pt-4 sm:px-8 lg:px-12">
        <p className="select-none text-center text-[clamp(4.4rem,21vw,6.4rem)] font-black uppercase leading-none text-white/[0.03] sm:text-[11rem] lg:text-[16rem] xl:text-[20rem] 2xl:text-[24rem]">
          Sellico
        </p>
      </div>
    </footer>
  );
}
