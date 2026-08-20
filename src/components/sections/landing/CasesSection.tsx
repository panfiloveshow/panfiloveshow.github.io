import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { SECTION_IDS } from '@/lib/anchors';
import { cn } from '@/lib/cn';
import { reveal } from './data';

type SellerStory = {
  id: string;
  number: string;
  tone: 'rose' | 'dark' | 'mint';
  eyebrow: string;
  title: string;
  facts: string[];
  platforms: string[];
  task: string[];
  solution: string[];
  result: [string, string][];
  timeline: string;
};

const caseStories: SellerStory[] = [
  {
    id: 'fashion',
    number: 'Кейс 1',
    tone: 'rose',
    eyebrow: 'Бренд одежды',
    title: 'Продажи росли, а нужные размеры постоянно заканчивались',
    facts: [
      '2 магазина на Wildberries',
      '1 400 SKU с размерной сеткой',
      'поставки планировались вручную раз в неделю',
    ],
    platforms: ['WILDBERRIES'],
    task: [
      'увидеть дефицит по размерам до потери продаж',
      'не рекламировать товары без достаточного запаса',
      'собирать план поставок без ручной сверки таблиц',
    ],
    solution: [
      'объединили остатки, продажи и рекламу в одном контуре',
      'настроили сигналы по критичным размерам',
      'связали рекламные ставки с доступностью товара',
    ],
    result: [
      ['+38%', 'выручка за 8 недель'],
      ['18 → 7%', 'товаров в дефиците'],
    ],
    timeline: '12 дней до запуска автоплана',
  },
  {
    id: 'home',
    number: 'Кейс 2',
    tone: 'dark',
    eyebrow: 'Товары для дома',
    title: 'Оборот был большим, но часть ассортимента продавалась в минус',
    facts: [
      'собственное производство',
      'WB, Ozon и Яндекс Маркет',
      'комиссии и логистика считались в разных отчётах',
    ],
    platforms: ['WILDBERRIES', 'OZON', 'ЯНДЕКС МАРКЕТ'],
    task: [
      'посчитать реальную прибыль каждого SKU',
      'найти товары, которые съедают оборотный капитал',
      'сформировать понятный план цен и производства',
    ],
    solution: [
      'пересчитали себестоимость с комиссиями и возвратами',
      'разделили ассортимент по прибыли и оборачиваемости',
      'скорректировали цены и производственный план',
    ],
    result: [
      ['+8,6 п.п.', 'к чистой марже'],
      ['34 → 9', 'убыточных SKU'],
    ],
    timeline: '21 день до первой полной модели прибыли',
  },
  {
    id: 'agency',
    number: 'Кейс 3',
    tone: 'mint',
    eyebrow: 'Marketplace-агентство',
    title: 'Менеджеры тратили пятницу на сбор клиентских отчётов',
    facts: [
      '18 кабинетов у 7 клиентов',
      'команда из 11 менеджеров',
      'задачи, отчёты и переписка жили отдельно',
    ],
    platforms: ['WILDBERRIES', 'OZON'],
    task: [
      'собирать отчёты по всем кабинетам автоматически',
      'видеть просроченные задачи и ответственных',
      'давать клиенту понятный итог без десяти файлов',
    ],
    solution: [
      'собрали кабинеты и роли команды в одном пространстве',
      'создали единый шаблон еженедельного отчёта',
      'настроили задачи из сигналов по рекламе и остаткам',
    ],
    result: [
      ['6 ч → 40 мин', 'подготовка отчёта'],
      ['×2,1', 'скорость обработки задач'],
    ],
    timeline: '9 дней до подключения всей команды',
  },
];


export function CasesSection() {
  const platformClass = (platform: string) => {
    if (platform === 'WILDBERRIES') return 'text-[#a91fb6]';
    if (platform === 'OZON') return 'text-[#1769ff]';
    return 'text-ink-950';
  };

  return (
    <section id={SECTION_IDS.proof} className="content-auto border-y border-ink-950/[0.06] bg-[#f3f8f5] py-16 lg:py-24">
      <Container className="lg:max-w-none lg:px-16">
        <motion.div {...reveal} className="max-w-4xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Типовые сценарии</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-ink-950 sm:text-6xl">
            Конкретная задача.
            <span className="block text-brand-700">Понятное решение.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
            Три модельные истории о том, как разные команды могут использовать Sellico в ежедневной работе.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {caseStories.map((item) => {
            const isDark = item.tone === 'dark';
            const shellClass =
              item.tone === 'rose'
                ? 'bg-[#f8dfdc] text-[#21173d]'
                : item.tone === 'dark'
                  ? 'bg-[#303149] text-white'
                  : 'bg-[#dff3e8] text-[#102b22]';

            return (
              <motion.article
                key={item.id}
                {...reveal}
                className={cn(
                  'flex min-w-0 flex-col overflow-hidden rounded-[28px] p-5 sm:p-7 lg:p-6 xl:p-8',
                  shellClass,
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cn(
                          'rounded-full border px-3.5 py-2 text-xs font-bold',
                          isDark ? 'border-white/70 text-white' : 'border-current',
                        )}
                      >
                        {item.number}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-[0.15em]',
                          isDark ? 'text-white/76' : 'text-current/70',
                        )}
                      >
                        Модельная история
                      </span>
                    </div>

                    <p className={cn('mt-7 text-xs font-bold uppercase tracking-[0.14em]', isDark ? 'text-emerald-300' : 'text-brand-700')}>
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-3 break-words text-2xl font-semibold leading-[1.1] tracking-[-0.035em] lg:min-h-[106px] xl:text-[28px]">
                      {item.title}
                    </h3>

                    <ul className={cn('mt-6 space-y-2 text-sm font-medium leading-relaxed', isDark ? 'text-white/76' : 'text-current/78')}>
                      {item.facts.map((fact) => (
                        <li key={fact} className="flex gap-3">
                          <span aria-hidden>—</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex min-h-14 flex-wrap items-end gap-x-4 gap-y-2 pt-8">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className={cn(
                          'text-base font-black tracking-[-0.04em] xl:text-lg',
                          isDark && platform === 'ЯНДЕКС МАРКЕТ' ? 'text-white' : platformClass(platform),
                        )}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid min-w-0 content-start gap-3">
                  <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                    <div className="flex items-start justify-between gap-5">
                      <h4 className="text-xl font-semibold tracking-[-0.025em]">Задача</h4>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff1bc] text-sm font-bold text-[#8c6d00]">?</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[13px] leading-relaxed text-[#39334f]">
                      {item.task.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span aria-hidden>—</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                    <div className="flex items-start justify-between gap-5">
                      <h4 className="text-xl font-semibold tracking-[-0.025em]">Что сделали</h4>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d8f7e7] text-lg text-[#1b8b61]">→</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[13px] leading-relaxed text-[#39334f]">
                      {item.solution.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span aria-hidden>—</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                      <div className="flex items-start justify-between gap-5">
                        <h4 className="text-xl font-semibold tracking-[-0.025em]">Возможный эффект</h4>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e2f1ff] text-sm font-bold text-[#3175ae]">✓</span>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-4">
                        {item.result.map(([value, label]) => (
                          <div key={label}>
                            <p className="text-2xl font-semibold tracking-[-0.05em] text-brand-700 xl:text-3xl">{value}</p>
                            <p className="mt-1 text-xs leading-snug text-[#666078]">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-white p-5 text-[#17132f] shadow-[0_18px_45px_-34px_rgba(28,22,54,.35)]">
                      <div className="flex items-start justify-between gap-5">
                        <h4 className="text-xl font-semibold tracking-[-0.025em]">Срок</h4>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1e5fb] text-sm font-bold text-[#8f51b9]">◷</span>
                      </div>
                      <p className="mt-5 text-sm font-medium leading-relaxed text-[#39334f]">{item.timeline}</p>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

      </Container>
    </section>
  );
}
