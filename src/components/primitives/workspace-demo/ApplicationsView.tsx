import { useState } from 'react';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  History,
  Inbox,
  Info,
  Link2,
  List,
  Mail,
  Phone,
  RefreshCw,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const applicationCards = [
  { id: '#24', title: 'Запрос консультации', source: 'Сайт', person: 'Анна', date: 'Сегодня' },
  { id: '#23', title: 'Подключение нового магазина', source: 'Сайт', person: 'Михаил', date: 'Вчера' },
  { id: '#21', title: 'Вопрос по тарифу', source: 'Telegram', person: 'Елена', date: '22 июл.' },
  { id: '#19', title: 'Запрос демонстрации', source: 'Сайт', person: 'Алексей', date: '20 июл.' },
  { id: '#18', title: 'Помощь с интеграцией', source: 'Telegram', person: 'Мария', date: '19 июл.' },
  { id: '#17', title: 'Обратная связь', source: 'Сайт', person: 'Игорь', date: '18 июл.' },
];

export function ApplicationsView() {
  const [gridView, setGridView] = useState(true);
  const metrics = [
    { label: 'Новые', value: '24', detail: 'Поступили недавно', icon: CheckCircle2, dark: true },
    { label: 'В работе', value: '3', detail: 'Конвертированы в лиды', icon: BarChart3 },
    { label: 'Всего заявок', value: '24', detail: 'Сайт 18 · TG 6', icon: Inbox },
    { label: 'В архиве', value: '2', detail: 'Неактуальные', icon: Info },
    { label: 'Среднее время, дн', value: '1,2', detail: 'До первого ответа', icon: Clock3 },
  ];

  return (
    <section aria-label="Заявки" className="min-h-[662px] bg-[#fbfcfd] p-3 sm:p-5">
      <section className="relative overflow-hidden rounded-[20px] border border-[#dfeae3] bg-[#eef5f1] px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute -right-6 -top-12 h-40 w-40 rounded-full border-[28px] border-white/35" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[8px] font-semibold text-[#466956]"><span className="h-2 w-2 rounded-full bg-[#22c55e]" />Входящие обращения</p>
            <h3 className="mt-1 text-[24px] font-extrabold tracking-[-0.04em] text-[#102018] sm:text-[28px]">Заявки</h3>
            <p className="mt-1 max-w-[430px] text-[9px] leading-relaxed text-[#65776c]">Соберите обращения из сайта и Telegram в одной очереди и быстро передавайте готовые заявки в работу.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#154d38] px-4 text-[8px] font-bold uppercase tracking-[0.03em] text-white shadow-[0_8px_18px_-8px_rgba(21,77,56,.55)]">
              <Link2 size={13} /> Подключить сайт
            </button>
            {[Bell, RefreshCw, History].map((Icon, index) => (
              <button key={index} type="button" aria-label={index === 0 ? 'Уведомления заявок' : index === 1 ? 'Обновить заявки' : 'История заявок'} className="grid h-9 w-9 place-items-center rounded-full border border-[#d8e5dc] bg-white text-[#4f6d5d]">
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-3 grid overflow-hidden rounded-[18px] border border-[#e2e8e4] bg-white sm:grid-cols-5">
        {metrics.map(({ label, value, detail, icon: Icon, dark }) => (
          <div key={label} className={cn('min-h-[94px] border-b border-[#e5e7eb] p-4 sm:border-b-0 sm:border-r last:border-0', dark && 'bg-[#154d38] text-white')}>
            <p className={cn('flex items-center gap-2 text-[8px] font-semibold', dark ? 'text-white/70' : 'text-[#78877f]')}><Icon size={13} className={dark ? 'text-[#5ee49d]' : 'text-[#29b56e]'} />{label}</p>
            <p className={cn('mt-2 text-[19px] font-extrabold', dark ? 'text-white' : 'text-[#183126]')}>{value}</p>
            <p className={cn('mt-1 text-[7px]', dark ? 'text-white/55' : 'text-[#9aa69f]')}>{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-[#17241d]">Очередь заявок</h4>
          <p className="mt-1 text-[8px] text-[#8a9890]">24 обращения</p>
        </div>
        <div className="flex rounded-[9px] bg-[#f0f4f1] p-1">
          <button type="button" onClick={() => setGridView(false)} aria-label="Список заявок" className={cn('grid h-7 w-7 place-items-center rounded-[7px]', !gridView && 'bg-white shadow-sm')}><List size={12} /></button>
          <button type="button" onClick={() => setGridView(true)} aria-label="Сетка заявок" className={cn('grid h-7 w-7 place-items-center rounded-[7px]', gridView && 'bg-white shadow-sm')}><BarChart3 size={12} /></button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 rounded-[14px] border border-[#e2e8e4] bg-white p-2.5">
        <label className="relative min-w-[190px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9991]" />
          <input aria-label="Поиск заявок" placeholder="Имя, компания или текст заявки" className="h-9 w-full rounded-[9px] border border-[#e2e8e4] pl-9 pr-3 text-[8px] outline-none" />
        </label>
        {['Все источники', 'Все статусы', 'Сначала новые'].map((label) => (
          <button key={label} type="button" className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#e2e8e4] px-3 text-[8px] text-[#506158]">{label}<ChevronDown size={11} /></button>
        ))}
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#d4ded8] px-3 text-[8px] font-bold uppercase text-[#37463e]"><Filter size={12} />Ещё фильтры</button>
      </div>

      <div className={cn('mt-3 grid gap-3', gridView ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
        {applicationCards.map((card) => (
          <article key={card.id} className="relative overflow-hidden rounded-[16px] border border-[#e2e8e4] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(15,23,42,.55)]">
            <span className="absolute inset-y-0 left-0 w-0.5 bg-[#22c55e]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-[8px] font-semibold text-[#607269]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#eef5f1]"><Inbox size={10} /></span>{card.source}</p>
                <p className="mt-1 text-[7px] text-[#a0aaa4]">{card.id}</p>
              </div>
              <span className="rounded-full bg-[#f0edff] px-2 py-1 text-[7px] font-bold text-[#7567e8]">Новая</span>
            </div>
            <h5 className="mt-3 text-[11px] font-bold text-[#18251e]">{card.title}</h5>
            <p className="mt-2 line-clamp-2 min-h-[28px] text-[8px] leading-relaxed text-[#7a8981]">Новое обращение клиента. Контактные данные скрыты в демонстрационной версии.</p>
            <div className="mt-3 flex items-center rounded-[10px] bg-[#f7f9f8] p-2">
              <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-[#e6f7ee] text-[9px] font-bold text-[#168a55]">{card.person[0]}</span>
              <div className="ml-2">
                <p className="text-[8px] font-semibold text-[#33443b]">{card.person}</p>
                <p className="text-[7px] text-[#9aa69f]">Частное лицо</p>
              </div>
              <div className="ml-auto flex gap-1">
                <button type="button" aria-label="Позвонить" className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#6c7e74]"><Phone size={11} /></button>
                <button type="button" aria-label="Написать" className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#6c7e74]"><Mail size={11} /></button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#edf0ee] pt-3">
              <span className="text-[7px] text-[#8b9991]">{card.date}</span>
              <button type="button" className="inline-flex items-center gap-1 rounded-[8px] bg-[#1eae64] px-3 py-2 text-[8px] font-bold text-white">В работу <ChevronRight size={11} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
