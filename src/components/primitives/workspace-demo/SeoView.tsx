import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  Grid3X3,
  Layers,
  List,
  Package,
  Play,
  Search,
  SearchCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type SeoTab = 'dashboard' | 'cards' | 'bulk-ai' | 'bulk' | 'credentials';

const seoTabs: Array<{ id: SeoTab; label: string; icon: LucideIcon; count?: string }> = [
  { id: 'dashboard', label: 'Обзор', icon: Grid3X3 },
  { id: 'cards', label: 'Карточки', icon: Package, count: '312' },
  { id: 'bulk-ai', label: 'AI генерация', icon: Sparkles },
  { id: 'bulk', label: 'Массовое описание', icon: Layers },
  { id: 'credentials', label: 'Магазины', icon: Store, count: '8' },
];

const seoStores = [
  { id: 'north', name: 'Магазин Север', marketplace: 'Ozon', count: 74, tone: 'blue' },
  { id: 'home', name: 'Дом и порядок', marketplace: 'Ozon', count: 48, tone: 'blue' },
  { id: 'line', name: 'Линия дома', marketplace: 'Ozon', count: 62, tone: 'blue' },
  { id: 'season', name: 'Новый сезон', marketplace: 'Ozon', count: 35, tone: 'blue' },
  { id: 'city', name: 'Городской склад', marketplace: 'Wildberries', count: 42, tone: 'pink' },
  { id: 'simple', name: 'Простые вещи', marketplace: 'Wildberries', count: 27, tone: 'pink' },
  { id: 'vector', name: 'Вектор', marketplace: 'Wildberries', count: 16, tone: 'pink' },
  { id: 'base', name: 'Базовый магазин', marketplace: 'Wildberries', count: 8, tone: 'pink' },
] as const;

const seoProducts = [
  { id: 'organizer', title: 'Органайзер для хранения с разделителями', score: 87, price: '1 790 ₽', sku: 'SKU-1042' },
  { id: 'holder', title: 'Держатель настольный универсальный', score: 82, price: '1 240 ₽', sku: 'SKU-1186' },
  { id: 'container', title: 'Контейнер складной для дома', score: 76, price: '2 190 ₽', sku: 'SKU-1264' },
  { id: 'stand', title: 'Подставка для аксессуаров', score: 69, price: '890 ₽', sku: 'SKU-1308' },
];

function SeoMetricCard({
  label,
  value,
  detail,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail?: string;
  color: string;
  icon: LucideIcon;
}) {
  return (
    <section
      className="rounded-[16px] border bg-white p-4"
      style={{
        borderColor: `${color}2e`,
        background: `linear-gradient(135deg, #ffffff 0%, ${color}10 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#8b8792]">{label}</p>
          <p className="mt-2 text-[22px] font-extrabold tracking-[-0.04em] text-[#171520]">{value}</p>
          {detail ? <p className="mt-1 text-[7px] text-[#a29eaa]">{detail}</p> : null}
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]" style={{ color, backgroundColor: `${color}14` }}>
          <Icon size={17} />
        </span>
      </div>
    </section>
  );
}

function SeoDashboardView() {
  const grades = [
    { grade: 'A', range: '80–100 баллов', count: 184, percent: 59, color: '#10b981' },
    { grade: 'B', range: '60–79 баллов', count: 70, percent: 22, color: '#22c55e' },
    { grade: 'C', range: '40–59 баллов', count: 34, percent: 11, color: '#f59e0b' },
    { grade: 'D', range: '20–39 баллов', count: 16, percent: 5, color: '#f97316' },
    { grade: 'F', range: '0–19 баллов', count: 8, percent: 3, color: '#ef4444' },
  ];

  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <SeoMetricCard label="Всего карточек" value="312" color="#6768f5" icon={Package} />
        <SeoMetricCard label="Средний SEO Score" value="84.6" detail="диапазон: 38.2–96.4" color="#10b981" icon={BarChart3} />
        <SeoMetricCard label="Аудитов за 7 дней" value="96" color="#3b82f6" icon={ClipboardCheck} />
        <SeoMetricCard label="Улучшено за месяц" value="28" color="#f59e0b" icon={TrendingUp} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-[18px] border border-[#ebe9ef] bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h5 className="text-[13px] font-bold text-[#1e1b2b]">Распределение по оценкам</h5>
              <p className="mt-1 text-[8px] text-[#9b97a4]">312 карточек прошли аудит</p>
            </div>
            <span className="inline-flex self-start items-center gap-1.5 rounded-[8px] bg-[#ecfdf5] px-2.5 py-1.5 text-[8px] font-semibold text-[#10b981]">
              <CheckCircle2 size={12} />
              81% хорошие
            </span>
          </div>
          <div className="mt-5 space-y-3.5">
            {grades.map((item) => (
              <div key={item.grade}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-[7px] text-[9px] font-extrabold text-white" style={{ backgroundColor: item.color }}>
                    {item.grade}
                  </span>
                  <span className="text-[8px] font-medium text-[#625e69]">{item.range}</span>
                  <strong className="ml-auto text-[8px] text-[#27232e]">{item.count}</strong>
                  <span className="w-7 text-right text-[7px] text-[#aaa6b0]">{item.percent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${item.color}18` }}>
                  <span className="block h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <section className="rounded-[18px] border border-[#ebe9ef] bg-white p-4">
            <h5 className="text-[11px] font-bold text-[#1e1b2b]">Здоровье SEO</h5>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Отличные (A)', value: 184, color: '#10b981' },
                { label: 'Хорошие (B)', value: 70, color: '#22c55e' },
                { label: 'Проблемные (D+F)', value: 24, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-center text-[8px] text-[#625e69]">
                  <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                  <strong className="ml-auto text-[#221f29]">{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="flex items-center gap-3 rounded-[18px] border border-[#f5d6a0] bg-[#fffaf1] p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#fff0d1] text-[#f59e0b]"><TriangleAlert size={17} /></span>
            <div>
              <p className="text-[10px] font-bold text-[#27232e]">42 без аудита</p>
              <p className="mt-1 text-[7px] text-[#847f89]">Откройте карточку и запустите аудит</p>
            </div>
          </section>
          <section className="rounded-[18px] border border-[#d8d8ff] bg-[#f5f5ff] p-4">
            <p className="text-[9px] font-bold text-[#6667ee]">Совет</p>
            <p className="mt-2 text-[8px] leading-[1.55] text-[#625e69]">Карточки с оценкой C и ниже теряют позиции. Начните с аудита и улучшите описание с помощью AI.</p>
          </section>
        </div>
      </div>
    </>
  );
}

function SeoStoreFolder({
  storeItem,
  onOpen,
}: {
  storeItem: (typeof seoStores)[number];
  onOpen: () => void;
}) {
  const pink = storeItem.tone === 'pink';
  return (
    <button type="button" onClick={onOpen} className="group flex min-w-0 flex-col items-center rounded-[16px] p-3 text-center transition hover:bg-white hover:shadow-[0_12px_28px_-20px_rgba(50,42,80,.45)]">
      <span className="relative block h-12 w-16">
        <span className="absolute left-1 top-0 h-4 w-7 rounded-t-[5px]" style={{ backgroundColor: pink ? '#ec9bda' : '#91b5ff' }} />
        <span className="absolute inset-x-0 bottom-0 h-10 rounded-[6px]" style={{ background: pink ? 'linear-gradient(#f4b4e5,#f8d4ef)' : 'linear-gradient(#9ebeff,#d7e4ff)', border: `1px solid ${pink ? '#df82cd' : '#739ff6'}` }} />
        <span className="absolute -right-2 -top-1 rounded-full bg-[#696af4] px-1.5 py-0.5 text-[6px] font-bold text-white shadow">{storeItem.count}</span>
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-[6px] text-[7px] font-extrabold text-white shadow" style={{ backgroundColor: pink ? '#d500a3' : '#0969f6' }}>
          {pink ? 'W' : 'O'}
        </span>
      </span>
      <span className="mt-3 line-clamp-2 text-[8px] font-semibold text-[#302c3a]">{storeItem.name}</span>
      <span className="mt-1 text-[7px] text-[#a19ba8]">{storeItem.marketplace}</span>
    </button>
  );
}

function SeoProductsView({
  storeName,
  onBack,
  onProduct,
}: {
  storeName: string;
  onBack: () => void;
  onProduct: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#ebe9ef] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 self-start text-[8px] font-semibold text-[#6768f5]">
          <ChevronLeft size={13} />
          Все магазины
        </button>
        <p className="text-[10px] font-bold text-[#292531]">{storeName}</p>
        <span className="text-[7px] text-[#9b97a4]">4 карточки в демо</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {seoProducts.map((product, index) => (
          <button key={product.id} type="button" onClick={onProduct} className="overflow-hidden rounded-[17px] border border-[#ebe9ef] bg-white text-left shadow-[0_8px_28px_-24px_rgba(40,35,65,.5)] transition hover:-translate-y-0.5">
            <div className="relative grid h-28 place-items-center overflow-hidden bg-gradient-to-br from-[#f7f8fc] to-[#e8eeff]">
              <span className="absolute left-2 top-2 rounded-[7px] bg-white/90 px-2 py-1 text-[6px] font-bold text-[#0969f6]">OZON</span>
              <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border-2 border-[#10b981] bg-white text-[8px] font-extrabold text-[#10b981]">{product.score}</span>
              <span className={cn('grid h-14 w-16 place-items-center rounded-[14px] border text-[#7381a5] shadow-sm', index % 2 ? 'rotate-3 bg-[#fff9ef]' : '-rotate-2 bg-white')}>
                <Package size={27} strokeWidth={1.35} />
              </span>
            </div>
            <div className="p-3">
              <p className="line-clamp-2 min-h-[30px] text-[9px] font-semibold leading-[1.45] text-[#292531]">{product.title}</p>
              <div className="mt-2 flex items-center justify-between text-[7px] text-[#9b97a4]">
                <span>{product.sku}</span>
                <strong className="text-[#4b4655]">{product.price}</strong>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#dcfce7]">
                <span className="block h-full rounded-full bg-[#10b981]" style={{ width: `${product.score}%` }} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function SeoProductDetail({
  onBack,
  onOpenAi,
}: {
  onBack: () => void;
  onOpenAi: () => void;
}) {
  return (
    <div>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[8px] font-semibold text-[#6768f5]">
        <ChevronLeft size={13} />
        Назад к карточкам
      </button>
      <section className="mt-3 rounded-[18px] border border-[#e7e7eb] bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-20 w-24 shrink-0 place-items-center rounded-[14px] border border-[#e9e9ef] bg-gradient-to-br from-[#fff] to-[#eef2ff] text-[#7c84a5]">
            <Package size={34} strokeWidth={1.3} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="rounded-[6px] bg-[#eaf2ff] px-2 py-1 text-[6px] font-bold text-[#1672f8]">OZON</span>
            <h4 className="mt-2 text-[13px] font-bold text-[#24212c]">Органайзер для хранения с разделителями</h4>
            <p className="mt-1 text-[7px] text-[#9a96a1]">Магазин Север · SKU-1042 · Артикул изменён</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-[#10b981] bg-white text-[12px] font-extrabold text-[#10b981]">87</span>
          <div className="flex gap-2">
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[#10a96b] px-3 text-[7px] font-bold text-white"><ClipboardCheck size={12} />Аудит</button>
            <button type="button" onClick={onOpenAi} className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#c8eedc] bg-[#f5fff9] px-3 text-[7px] font-bold text-[#10a96b]"><Sparkles size={12} />AI-генерация</button>
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(230px,.8fr)]">
        <section className="rounded-[18px] border border-[#e7e7eb] bg-white p-4">
          <h5 className="text-[9px] font-bold text-[#292531]">Описание</h5>
          <div className="mt-3 space-y-3 text-[7px] leading-[1.7] text-[#625e69]">
            <p>Практичный органайзер помогает хранить аксессуары, документы и небольшие предметы в одном месте. Перегородки можно переставлять под нужный формат.</p>
            <p>Материал устойчив к ежедневному использованию, легко очищается и сохраняет форму. Нейтральный дизайн подходит для дома и рабочего пространства.</p>
            <p>Компактная конструкция экономит место и позволяет быстро находить нужные вещи.</p>
          </div>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((item) => <span key={item} className="grid h-14 w-16 place-items-center rounded-[10px] border border-[#e7e7eb] bg-[#f8fafc] text-[#94a3b8]"><Package size={20} /></span>)}
          </div>
        </section>
        <section className="rounded-[18px] border border-[#e7e7eb] bg-white p-4">
          <h5 className="text-[9px] font-bold text-[#292531]">Характеристики</h5>
          <dl className="mt-3 space-y-2">
            {[
              ['Бренд', 'Sellico Home'],
              ['Материал', 'Полипропилен'],
              ['Цвет', 'Светло-серый'],
              ['Страна', 'Россия'],
              ['Комплектация', '1 органайзер'],
              ['Гарантия', '12 месяцев'],
            ].map(([name, value]) => (
              <div key={name} className="flex gap-3 border-b border-[#f0f0f3] pb-2 text-[7px] last:border-0">
                <dt className="text-[#a19ca8]">{name}</dt>
                <dd className="ml-auto text-right font-medium text-[#4d4854]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="mt-3 rounded-[18px] border border-[#e7e7eb] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#4ade80] text-[9px] font-extrabold text-[#16a34a]">A<br />87</span>
            <div><p className="text-[14px] font-extrabold text-[#292531]">87.1 / 100</p><p className="mt-1 text-[7px] text-[#16a34a]">Оценка: A</p></div>
          </div>
          <button type="button" className="rounded-[8px] border border-[#93c5fd] px-3 py-2 text-[7px] font-semibold text-[#2563eb]">Запустить снова</button>
        </div>
        <h5 className="mt-5 text-[9px] font-bold text-[#292531]">Компоненты оценки</h5>
        <div className="mt-3 space-y-3">
          {[
            { label: 'Качество контента', value: 74, color: '#84cc16' },
            { label: 'Техническое качество', value: 100, color: '#22c55e' },
            { label: 'Соответствие платформе', value: 92, color: '#22c55e' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[7px]"><span className="text-[#625e69]">{item.label}</span><strong style={{ color: item.color }}>{item.value}/100</strong></div>
              <div className="mt-1 h-1.5 rounded-full bg-[#eef2f0]"><span className="block h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section className="rounded-[16px] border border-[#fde2ad] bg-white p-4">
          <p className="flex items-center gap-2 text-[8px] font-bold text-[#d97706]"><TriangleAlert size={13} />Предупреждения</p>
          <p className="mt-3 text-[7px] leading-[1.55] text-[#625e69]">Описание — один сплошной абзац. Разбейте его на 2–3 абзаца.</p>
        </section>
        <section className="rounded-[16px] border border-[#dbeafe] bg-white p-4">
          <p className="flex items-center gap-2 text-[8px] font-bold text-[#3b82f6]"><Sparkles size={13} />Рекомендации</p>
          <p className="mt-3 text-[7px] leading-[1.55] text-[#625e69]">Добавьте поисковые ключи естественно и сохраните читаемость текста.</p>
        </section>
      </div>
    </div>
  );
}

function SeoAiDialog({ onClose }: { onClose: () => void }) {
  const [generated, setGenerated] = useState(false);
  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center bg-[#10131a]/45 p-3 backdrop-blur-[2px]" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="seo-ai-dialog-title" className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,.65)]">
        <div className="flex items-start gap-3 border-b border-[#e7e7eb] px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#e9f8ef] text-[#3fa262]"><Sparkles size={15} /></span>
          <div>
            <h4 id="seo-ai-dialog-title" className="text-[13px] font-bold text-[#26222c]">AI-генератор описаний</h4>
            <p className="mt-0.5 text-[7px] text-[#9a96a1]">Генерация SEO-оптимизированных описаний</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть генератор" className="ml-auto grid h-8 w-8 place-items-center rounded-full text-[#7c8593] hover:bg-[#f3f4f6]"><X size={16} /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5">
          <div className="flex items-center justify-between rounded-[12px] border border-[#e8e8ec] p-3">
            <span className="rounded-full bg-[#2563eb] px-3 py-1 text-[7px] font-bold text-white">Ozon</span>
            <div className="flex items-center gap-3 text-[7px] text-[#7d7884]">Вариантов: <button type="button" className="font-bold text-[#25212b]">−</button><strong className="text-[#25212b]">1</strong><button type="button" className="font-bold text-[#25212b]">+</button></div>
          </div>
          <p className="mt-3 rounded-[10px] border border-[#edf0f5] bg-[#fafbfc] p-3 text-[7px] leading-[1.5] text-[#6f6b75]"><strong className="text-[#2563eb]">Ozon:</strong> заголовок до 150 символов, описание до 6000 символов. Ключи должны быть встроены естественно.</p>
          <section className="mt-3 rounded-[12px] border border-[#d8f0df] bg-[#fbfffc] p-3">
            <p className="flex items-center gap-1.5 text-[8px] font-bold text-[#3f7653]"><CheckCircle2 size={12} />Ключи из карточки</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['органайзер для дома', 'хранение вещей', 'контейнер', 'разделители', 'порядок'].map((key) => <span key={key} className="rounded-full bg-[#edf2fb] px-2 py-1 text-[6px] text-[#535c70]">{key}</span>)}
            </div>
          </section>
          <div className="mt-3 divide-y divide-[#e7e7eb] overflow-hidden rounded-[12px] border border-[#e7e7eb]">
            {['Переопределить ключевые слова', 'Переопределить характеристики'].map((label, index) => (
              <button key={label} type="button" className="flex h-11 w-full items-center gap-2 px-3 text-left text-[8px] font-medium text-[#625e69]">
                {index === 0 ? <Sparkles size={12} className="text-[#f59e0b]" /> : <List size={12} className="text-[#64748b]" />}
                {label}
                <ChevronDown size={12} className="ml-auto" />
              </button>
            ))}
          </div>
          {generated ? (
            <section className="mt-3 rounded-[12px] border border-[#ccebd9] bg-[#f7fff9] p-4">
              <p className="text-[8px] font-bold text-[#21734b]">Описание готово</p>
              <p className="mt-2 text-[8px] leading-[1.65] text-[#4f5f55]">Практичный органайзер с регулируемыми разделителями помогает поддерживать порядок дома и на рабочем месте. Компактная конструкция подходит для хранения аксессуаров, документов и небольших предметов.</p>
            </section>
          ) : null}
          <button type="button" onClick={() => setGenerated(true)} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#46a45e] text-[8px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(70,164,94,.75)]">
            <Sparkles size={13} />
            {generated ? 'Сгенерировать ещё вариант' : 'Сгенерировать описание'}
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e7e7eb] px-5 py-3">
          <button type="button" onClick={onClose} className="h-8 rounded-[8px] px-3 text-[7px] font-medium text-[#8a8590]">Отмена</button>
          <button type="button" disabled={!generated} onClick={onClose} className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[#bce6ce] px-4 text-[7px] font-bold text-white disabled:opacity-45"><Check size={12} />Применить</button>
        </div>
      </section>
    </div>
  );
}

function SeoSupportTab({ tab }: { tab: Exclude<SeoTab, 'dashboard' | 'cards'> }) {
  if (tab === 'credentials') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {seoStores.map((item) => (
          <section key={item.id} className="rounded-[17px] border border-[#e8e8ed] bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#eef8f2] text-[#10a96b]"><Store size={17} /></span>
              <div className="min-w-0"><p className="truncate text-[9px] font-bold text-[#292531]">{item.name}</p><p className="mt-1 text-[7px] text-[#9a96a1]">{item.marketplace}</p></div>
              <span className="ml-auto h-2 w-2 rounded-full bg-[#10b981]" />
            </div>
            <div className="mt-4 flex justify-between border-t border-[#f0f0f3] pt-3 text-[7px] text-[#8e8994]"><span>{item.count} карточек</span><strong className="text-[#10a96b]">Подключён</strong></div>
          </section>
        ))}
      </div>
    );
  }

  const ai = tab === 'bulk-ai';
  return (
    <section className="rounded-[18px] border border-[#e8e8ed] bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className={cn('grid h-11 w-11 place-items-center rounded-[13px]', ai ? 'bg-[#f1efff] text-[#6768f5]' : 'bg-[#eef8f2] text-[#10a96b]')}>
          {ai ? <Sparkles size={19} /> : <Layers size={19} />}
        </span>
        <div>
          <h4 className="text-[14px] font-bold text-[#292531]">{ai ? 'AI-генерация для группы товаров' : 'Массовое описание'}</h4>
          <p className="mt-1 text-[8px] text-[#97929d]">{ai ? 'Создайте варианты описаний для нескольких карточек одновременно.' : 'Синхронно обновляйте выбранные поля в карточках магазинов.'}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ['1', 'Выберите магазины', '8 подключённых магазинов'],
          ['2', ai ? 'Настройте генерацию' : 'Выберите поля', 'Шаблон и ключевые слова'],
          ['3', 'Проверьте результат', 'Применение только после проверки'],
        ].map(([step, title, detail]) => (
          <div key={step} className="rounded-[14px] border border-[#ecebf0] bg-[#fafafd] p-4">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#6768f5] text-[8px] font-bold text-white">{step}</span>
            <p className="mt-3 text-[9px] font-bold text-[#393442]">{title}</p>
            <p className="mt-1 text-[7px] text-[#9a96a1]">{detail}</p>
          </div>
        ))}
      </div>
      <button type="button" className="mt-5 inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#6768f5] px-4 text-[8px] font-bold text-white"><Play size={12} fill="currentColor" />Начать</button>
    </section>
  );
}

export function SeoView() {
  const [activeTab, setActiveTab] = useState<SeoTab>('dashboard');
  const [storeSearch, setStoreSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState<(typeof seoStores)[number] | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const normalizedSearch = storeSearch.trim().toLowerCase();
  const visibleStores = seoStores.filter((item) => !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch));

  const selectTab = (tab: SeoTab) => {
    setActiveTab(tab);
    setSelectedStore(null);
    setProductOpen(false);
  };

  return (
    <section aria-label="SEO-инструмент" className="min-h-[662px] bg-[#fafafa]">
      <div className="border-b border-[#e8e8ed] bg-white px-3 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-gradient-to-br from-[#7375ff] to-[#5d5ee8] text-white shadow-[0_7px_18px_-10px_rgba(93,94,232,.75)]"><SearchCheck size={20} /></span>
          <div>
            <h3 className="text-[18px] font-extrabold tracking-[-0.03em] text-[#1f1b2a] sm:text-[21px]">SEO-инструмент</h3>
            <p className="mt-0.5 text-[8px] text-[#aaa5b1]">8 магазинов · 312 карточек</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
          {seoTabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} type="button" onClick={() => selectTab(id)} className={cn('inline-flex h-10 shrink-0 items-center gap-1.5 rounded-t-[12px] px-3 text-[8px] font-semibold transition', activeTab === id ? 'bg-[#f1f0ff] text-[#6667ee]' : 'text-[#76717d] hover:bg-[#fafafa]')}>
              <Icon size={13} />
              {label}
              {count ? <span className={cn('rounded-full px-1.5 py-0.5 text-[6px]', activeTab === id ? 'bg-[#dfdeff] text-[#6667ee]' : 'bg-[#f0f0f2] text-[#a4a0aa]')}>{count}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3 sm:p-5">
        {activeTab === 'dashboard' ? <SeoDashboardView /> : null}
        {activeTab === 'cards' && productOpen ? <SeoProductDetail onBack={() => setProductOpen(false)} onOpenAi={() => setAiOpen(true)} /> : null}
        {activeTab === 'cards' && !productOpen && selectedStore ? <SeoProductsView storeName={selectedStore.name} onBack={() => setSelectedStore(null)} onProduct={() => setProductOpen(true)} /> : null}
        {activeTab === 'cards' && !productOpen && !selectedStore ? (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <SeoMetricCard label="Всего карточек" value="312" color="#6768f5" icon={Package} />
              <SeoMetricCard label="Требуют внимания" value="42" color="#f59e0b" icon={TriangleAlert} />
              <SeoMetricCard label="Хороший SEO" value="254" color="#10b981" icon={CheckCircle2} />
              <SeoMetricCard label="Без аудита" value="16" color="#8b5cf6" icon={Clock3} />
            </div>
            <div className="mt-3 flex flex-col gap-3 rounded-[16px] border border-[#e8e8ed] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block sm:w-[320px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a4a0aa]" />
                <input value={storeSearch} onChange={(event) => setStoreSearch(event.target.value)} aria-label="Поиск магазина SEO" placeholder="Поиск по названию..." className="h-9 w-full rounded-[10px] border border-[#dfdfe5] bg-white pl-9 pr-3 text-[8px] outline-none focus:border-[#6768f5]" />
              </label>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 self-start rounded-full border border-[#e5e5e9] px-3 text-[7px] text-[#716c77]"><SlidersHorizontal size={11} />Низкий SEO</button>
              <span className="text-[7px] text-[#a6a1ac]">8 магазинов · 312 карточек</span>
            </div>
            <section className="mt-3 grid grid-cols-2 gap-2 rounded-[18px] border border-[#efedf2] bg-[#fcfcfd] p-3 sm:grid-cols-4 xl:grid-cols-8">
              {visibleStores.map((storeItem) => <SeoStoreFolder key={storeItem.id} storeItem={storeItem} onOpen={() => setSelectedStore(storeItem)} />)}
            </section>
          </>
        ) : null}
        {activeTab !== 'dashboard' && activeTab !== 'cards' ? <SeoSupportTab tab={activeTab} /> : null}
      </div>
      {aiOpen ? createPortal(<SeoAiDialog onClose={() => setAiOpen(false)} />, document.body) : null}
    </section>
  );
}
