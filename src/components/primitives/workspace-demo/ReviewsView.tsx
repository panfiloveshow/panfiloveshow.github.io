import { useState } from 'react';
import { ChevronDown, MessageCircle, RefreshCw, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const demoReviews = [
  {
    id: 'review-1',
    product: 'Набор контейнеров для хранения',
    text: 'Удобный размер, крышки закрываются плотно. Всё пришло без повреждений.',
    author: 'Марина',
    date: '23 июл.',
    rating: 5,
    answered: false,
  },
  {
    id: 'review-2',
    product: 'Органайзер для кухни',
    text: 'Выглядит аккуратно, но хотелось бы больше вариантов цвета.',
    author: 'Анна',
    date: '23 июл.',
    rating: 4,
    answered: false,
  },
  {
    id: 'review-3',
    product: 'Полка настольная универсальная',
    text: 'Собрали быстро, все детали на месте. Спасибо продавцу.',
    author: 'Покупатель',
    date: '22 июл.',
    rating: 5,
    answered: true,
  },
  {
    id: 'review-4',
    product: 'Набор дорожных чехлов',
    text: 'Материал хороший, в чемодане стало заметно больше порядка.',
    author: 'Елена',
    date: '21 июл.',
    rating: 5,
    answered: true,
  },
];

export function ReviewsView() {
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered' | 'answered'>('unanswered');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const visibleReviews = demoReviews.filter((review) => {
    const matchesTab = activeTab === 'all' || (activeTab === 'answered' ? review.answered : !review.answered);
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch
      || review.product.toLowerCase().includes(normalizedSearch)
      || review.author.toLowerCase().includes(normalizedSearch)
      || review.text.toLowerCase().includes(normalizedSearch);
    return matchesTab && matchesSearch;
  });

  const reviewStats = [
    { label: 'Всего', value: '248', className: 'border-[#eef0f2] bg-white text-[#111827]' },
    { label: 'Без ответа', value: '36', className: 'border-[#fee2e2] bg-[#fff8f8] text-[#dc2626]', dot: true },
    { label: 'Отвечено', value: '212', className: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#059669]' },
    { label: 'Средняя оценка', value: '4.7 ★', className: 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]' },
  ];

  return (
    <section aria-label="Отзывы" className="min-h-[662px] bg-[#fbfcfd] p-3 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#111827] sm:text-[25px]">Отзывы</h3>
          <p className="mt-1 text-[9px] text-[#9ca3af]">248 отзывов · 36 требуют ответа</p>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Настройки отзывов" className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#eef0f2] bg-[#f7f8fa] text-[#9ca3af]"><Settings size={14} /></button>
          <button type="button" aria-label="Обновить отзывы" className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#eef0f2] bg-[#f7f8fa] text-[#9ca3af]"><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        {reviewStats.map((stat) => (
          <section key={stat.label} className={cn('relative min-h-[92px] rounded-[14px] border p-4', stat.className)}>
            {stat.dot ? <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#ef4444] shadow-[0_0_0_4px_rgba(239,68,68,.08)]" /> : null}
            <p className="text-[8px] font-semibold uppercase tracking-[0.05em] opacity-70">{stat.label}</p>
            <p className="mt-3 text-[20px] font-extrabold leading-none tracking-[-0.03em]">{stat.value}</p>
          </section>
        ))}
        <section className="col-span-2 min-h-[92px] rounded-[14px] border border-[#bfdbfe] bg-[#eff6ff] p-4 text-[#2563eb] lg:col-span-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.05em]">Лимит ответов</p>
          <p className="mt-3 text-[18px] font-extrabold leading-none">36/500 ⚡</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dbeafe]"><div className="h-full w-[7.2%] rounded-full bg-[#3b82f6]" /></div>
          <p className="mt-1.5 text-[7px] font-semibold text-[#60a5fa]">осталось 464</p>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-[16px] border border-[#eef0f2] bg-white shadow-[0_8px_30px_-28px_rgba(15,23,42,.55)]">
        <div className="flex overflow-x-auto border-b border-[#eef0f2] px-3 sm:px-5">
          {([
            ['all', 'Все 248'],
            ['unanswered', 'Без ответа 36'],
            ['answered', 'Отвечено 212'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative h-11 shrink-0 px-3 text-[9px] font-semibold',
                activeTab === id ? 'text-[#111827]' : 'text-[#9ca3af]',
              )}
            >
              {label}
              {activeTab === id ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#111827]" /> : null}
            </button>
          ))}
        </div>

        <div className="border-b border-[#eef0f2] p-3 sm:p-4">
          <label className="relative block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d1d5db]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Поиск по отзывам"
              placeholder="Поиск по товару, автору, тексту…"
              className="h-10 w-full rounded-[10px] border border-[#eef0f2] bg-[#f7f8fa] pl-9 pr-3 text-[9px] outline-none focus:border-[#111827] focus:bg-white"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#eef0f2] bg-[#f7f8fa] px-3 text-[9px] font-semibold text-[#4b5563]">Все оценки <ChevronDown size={12} /></button>
            <button type="button" className="flex h-9 min-w-0 flex-1 items-center justify-between rounded-[10px] border border-[#eef0f2] bg-[#f7f8fa] px-3 text-[9px] text-[#9ca3af]">Магазин <ChevronDown size={12} /></button>
          </div>
        </div>

        <div>
          {visibleReviews.length ? visibleReviews.map((review) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setSelectedReview((current) => current === review.id ? null : review.id)}
              className={cn(
                'relative block w-full border-b border-[#f3f4f6] px-4 py-4 text-left last:border-0 hover:bg-[#fafbfc] sm:px-5',
                selectedReview === review.id && 'border-l-[3px] border-l-[#111827] bg-[#f7f8fa]',
              )}
            >
              {!review.answered ? <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-[#ef4444]" /> : null}
              <div className="flex items-center gap-2">
                <span className="rounded-[6px] bg-[#f3e8ff] px-2 py-1 text-[7px] font-bold text-[#a855f7]">WB</span>
                <span className="text-[9px] tracking-[0.12em] text-[#f59e0b]">
                  {'★'.repeat(review.rating)}<span className="text-[#e5e7eb]">{'★'.repeat(5 - review.rating)}</span>
                </span>
              </div>
              <p className="mt-2 text-[10px] font-bold text-[#1f2937]">{review.product}</p>
              <p className="mt-1.5 text-[9px] text-[#9ca3af]">{review.text}</p>
              <div className="mt-3 flex items-center justify-between text-[7px] text-[#c0c6ce]">
                <span>{review.author}</span>
                <span>{review.date}</span>
              </div>
              {selectedReview === review.id ? (
                <span className="mt-3 flex items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white p-2.5 text-[8px] text-[#64748b]">
                  <MessageCircle size={12} className="text-[#10b981]" />
                  {review.answered ? 'Ответ отправлен покупателю' : 'Написать ответ покупателю'}
                </span>
              ) : null}
            </button>
          )) : (
            <div className="grid min-h-[240px] place-items-center p-8 text-center">
              <div>
                <MessageCircle className="mx-auto text-[#d1d5db]" size={26} />
                <p className="mt-3 text-[11px] font-semibold text-[#111827]">Отзывы не найдены</p>
                <p className="mt-1 text-[8px] text-[#9ca3af]">Измените запрос или фильтры</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
