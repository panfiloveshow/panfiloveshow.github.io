import { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Link2,
  Monitor,
  Plus,
  Store,
  Umbrella,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const organizerTabs = [
  { id: 'schedule', label: 'Расписание', icon: CalendarDays },
  { id: 'offline', label: 'Оффлайн', icon: Store },
  { id: 'online', label: 'Онлайн', icon: Monitor },
  { id: 'vacation', label: 'Отпуска', icon: Umbrella },
] as const;

function MiniCalendar() {
  const days = Array.from({ length: 35 }, (_, index) => index - 2);
  return (
    <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#1f2937]">Июль 2026</p>
        <div className="flex gap-1 text-[#64748b]">
          <ChevronLeft size={13} />
          <ChevronRight size={13} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-[7px] font-bold text-[#94a3b8]">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[8px] text-[#334155]">
        {days.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className={cn(
              'mx-auto grid h-6 w-6 place-items-center rounded-[7px]',
              day === 24 && 'bg-[#6366f1] font-bold text-white',
              (day < 1 || day > 31) && 'text-transparent',
            )}
          >
            {day > 0 && day <= 31 ? day : '0'}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OrganizerView() {
  const [tab, setTab] = useState<(typeof organizerTabs)[number]['id']>('schedule');
  const actionCards = [
    { label: 'Видеозвонок', detail: 'Sellico Meet', icon: Video },
    { label: 'Оффлайн', detail: 'Личная встреча', icon: Store },
    { label: 'Онлайн', detail: 'Удалённо', icon: Monitor },
    { label: 'Отпуск', detail: 'Подать заявку', icon: Umbrella },
  ];

  return (
    <section aria-label="Органайзер" className="min-h-[662px] bg-[#fbfcfd] p-3 sm:p-5">
      <section className="relative overflow-hidden rounded-[20px] border border-[#e4eee8] bg-[#f5faf7] px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-70 [background:radial-gradient(circle_at_65%_30%,rgba(111,202,153,.24),transparent_24%),linear-gradient(115deg,transparent_15%,rgba(213,238,224,.55)_16%,transparent_40%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#111827] sm:text-[25px]">Организатор</h3>
            <p className="mt-1 text-[10px] text-[#737373]">Расписание, встречи и отпуска команды</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 text-[9px] font-bold text-[#171717] shadow-sm">
              <Video size={14} /> Видеозвонок
            </button>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#101010] px-4 text-[9px] font-bold text-white">
              <Plus size={14} /> Событие
            </button>
          </div>
        </div>
      </section>

      <div className="mt-3 flex overflow-x-auto border-b border-[#e5e7eb]">
        {organizerTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'relative inline-flex h-10 shrink-0 items-center gap-1.5 px-3 text-[9px] font-semibold',
              tab === id ? 'text-[#171717]' : 'text-[#737373]',
            )}
          >
            <Icon size={13} />
            {label}
            {tab === id ? <span className="absolute inset-x-2 bottom-0 h-px bg-[#171717]" /> : null}
          </button>
        ))}
      </div>

      {tab === 'schedule' ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-[1.05fr_1fr_250px]">
          <div className="grid min-h-[390px] grid-rows-[auto_1fr] gap-3">
            <div className="flex items-center justify-between rounded-[18px] border border-[#e5e7eb] bg-white p-4">
              <div>
                <p className="text-[12px] font-bold text-[#171717]">Сегодня</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.05em] text-[#737373]">пятница · свободно</p>
              </div>
              <button type="button" aria-label="Добавить событие сегодня" className="grid h-9 w-9 place-items-center rounded-full bg-[#0d0d0d] text-white"><Plus size={17} /></button>
            </div>
            <div className="grid place-items-center rounded-[20px] border border-[#e5e7eb] bg-white p-6 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#e5e7eb] text-[#a3a3a3]"><Coffee size={20} /></span>
                <p className="mt-4 text-[12px] font-bold text-[#171717]">Свободный день</p>
                <p className="mt-2 text-[9px] leading-relaxed text-[#737373]">Нет запланированных активностей.<br />Нажмите +, чтобы создать.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {actionCards.map(({ label, detail, icon: Icon }) => (
              <button key={label} type="button" className="min-h-[112px] rounded-[18px] border border-[#e5e7eb] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[#e5e7eb] text-[#171717]"><Icon size={14} /></span>
                <p className="mt-5 text-[10px] font-bold text-[#171717]">{label}</p>
                <p className="mt-1 text-[8px] text-[#737373]">{detail}</p>
              </button>
            ))}
            <div className="sm:col-span-2 rounded-[18px] border border-[#e5e7eb] bg-white p-4">
              <div className="flex items-center gap-2">
                <Link2 size={14} />
                <p className="text-[11px] font-bold text-[#171717]">Ссылка бронирования компании</p>
                <span className="ml-auto rounded-full bg-[#22c55e] px-2 py-1 text-[7px] font-bold text-white">Активна</span>
              </div>
              <p className="mt-2 max-w-[270px] text-[8px] leading-relaxed text-[#737373]">Постоянная страница со свободными слотами для видеозвонка.</p>
              <div className="mt-3 rounded-[12px] bg-[#f7f8f8] px-3 py-2.5 text-[9px] font-semibold text-[#1f2937]">
                Созвон с Sellico
              </div>
            </div>
          </div>

          <MiniCalendar />
        </div>
      ) : (
        <div className="mt-4 grid min-h-[390px] place-items-center rounded-[20px] border border-[#e5e7eb] bg-white p-8 text-center">
          <div>
            {tab === 'offline' ? <Store className="mx-auto text-[#10b981]" size={28} /> : tab === 'online' ? <Monitor className="mx-auto text-[#10b981]" size={28} /> : <Umbrella className="mx-auto text-[#10b981]" size={28} />}
            <p className="mt-4 text-[14px] font-bold text-[#111827]">
              {tab === 'offline' ? 'Офлайн-встречи' : tab === 'online' ? 'Онлайн-расписание' : 'Отпуска команды'}
            </p>
            <p className="mt-2 text-[9px] text-[#737373]">Раздел готов для планирования новых событий.</p>
          </div>
        </div>
      )}
    </section>
  );
}
