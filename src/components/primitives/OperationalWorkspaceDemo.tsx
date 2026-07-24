import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  ClipboardCheck,
  Download,
  Edit3,
  Eye,
  Filter,
  Flag,
  Folder,
  Grid3X3,
  Headphones,
  History,
  Image,
  Inbox,
  Info,
  Landmark,
  Layers,
  List,
  Link2,
  Mail,
  Map,
  Maximize2,
  Menu,
  MessageCircle,
  Monitor,
  MoreVertical,
  Package,
  Paperclip,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Rss,
  Search,
  SearchCheck,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  TriangleAlert,
  Umbrella,
  UserCog,
  UserRound,
  Users,
  Video,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDialogFocus } from '@/hooks/useDialogFocus';

type ViewMode = 'list' | 'kanban' | 'calendar';
type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';
type WorkspaceArea = 'tasks' | 'organizer' | 'applications' | 'reviews' | 'coordination' | 'finance' | 'seo';

type DemoTask = {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  due: string;
  status: TaskStatus;
  wasOverdue?: boolean;
};

type StatusMeta = {
  label: string;
  color: string;
  soft: string;
  border: string;
  icon: LucideIcon;
};

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  area?: WorkspaceArea;
};

const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'review', 'completed', 'overdue'];

const statusMeta: Record<TaskStatus, StatusMeta> = {
  pending: {
    label: 'К выполнению',
    color: '#666666',
    soft: '#f2f2f2',
    border: '#d9d9d9',
    icon: Clock3,
  },
  in_progress: {
    label: 'В работе',
    color: '#2196f3',
    soft: '#eaf4ff',
    border: '#b8d8f7',
    icon: Play,
  },
  review: {
    label: 'На проверке',
    color: '#ff9800',
    soft: '#fff4e8',
    border: '#ffd39c',
    icon: CheckSquare,
  },
  completed: {
    label: 'Завершена',
    color: '#4caf50',
    soft: '#edf8ed',
    border: '#bde0bd',
    icon: CheckCircle2,
  },
  overdue: {
    label: 'Просрочена',
    color: '#ff4444',
    soft: '#fff0f0',
    border: '#ffb8b8',
    icon: TriangleAlert,
  },
};

const initialTasks: DemoTask[] = [
  {
    id: 'price',
    title: 'Поднять цены',
    description: 'Проверить позиции с маржой ниже целевого значения.',
    project: 'Магазин Север',
    assignee: 'М',
    due: '24 июл.',
    status: 'pending',
  },
  {
    id: 'certificates',
    title: 'Проверить документы качества',
    description: 'Собрать актуальные документы по товарам.',
    project: 'Каталог',
    assignee: 'А',
    due: '30 сент.',
    status: 'pending',
  },
  {
    id: 'campaign',
    title: 'Подготовить карточки к акции',
    description: 'Обновить заголовки и проверить изображения.',
    project: 'Контент',
    assignee: 'М',
    due: 'Сегодня',
    status: 'in_progress',
  },
  {
    id: 'seo',
    title: 'Обновить SEO',
    description: 'Подготовить запросы для новой коллекции.',
    project: 'Продвижение',
    assignee: 'К',
    due: '27 июл.',
    status: 'in_progress',
  },
  {
    id: 'supply',
    title: 'Согласовать план поставки',
    description: 'Проверить объёмы и даты отгрузки.',
    project: 'Поставки',
    assignee: 'А',
    due: '30 июл.',
    status: 'review',
  },
  {
    id: 'images',
    title: 'Проверить новые изображения',
    description: 'Сверить изображения с требованиями площадок.',
    project: 'Контент',
    assignee: 'И',
    due: '28 июл.',
    status: 'review',
  },
  {
    id: 'stocks',
    title: 'Обновить остатки по складам',
    description: 'Сверить доступные остатки и резерв.',
    project: 'Поставки',
    assignee: 'И',
    due: '23 июл.',
    status: 'completed',
  },
  {
    id: 'report',
    title: 'Собрать отчёт за неделю',
    description: 'Подготовить итоговые показатели команды.',
    project: 'Аналитика',
    assignee: 'М',
    due: '22 июл.',
    status: 'completed',
  },
  {
    id: 'headlines',
    title: 'Новые заглавные для рекламы',
    description: 'Обновить тексты рекламных объявлений.',
    project: 'Продвижение',
    assignee: 'К',
    due: '26 мая',
    status: 'overdue',
  },
  {
    id: 'content-plan',
    title: 'Согласовать контент-план',
    description: 'Проверить сроки и ответственных.',
    project: 'Контент',
    assignee: 'А',
    due: '20 июл.',
    status: 'overdue',
    wasOverdue: true,
  },
];

const sidebarSections: Array<{ title: string; items: SidebarItem[] }> = [
  {
    title: 'Рабочее пространство',
    items: [
      { label: 'Лента', icon: Rss },
      { label: 'Задачи', icon: CheckSquare, area: 'tasks' },
      { label: 'Организатор', icon: Sparkles, area: 'organizer' },
      { label: 'Роадмап', icon: Map },
      { label: 'Пользователи', icon: UserCog },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Лиды', icon: Users },
      { label: 'Клиенты', icon: UserCog },
      { label: 'Заявки', icon: CheckSquare, area: 'applications' },
      { label: 'Отзывы', icon: MessageCircle, area: 'reviews' },
    ],
  },
  {
    title: 'Каталог',
    items: [
      { label: 'Товары', icon: Package },
      { label: 'Координация', icon: BarChart3, area: 'coordination' },
    ],
  },
  {
    title: 'Финансы',
    items: [{ label: 'Финансы', icon: Landmark, area: 'finance' }],
  },
  {
    title: 'Автоматизация',
    items: [
      { label: 'SEO', icon: SearchCheck, area: 'seo' },
      { label: 'Реклама и цены', icon: TrendingUp },
    ],
  },
];

const chatRooms = [
  { id: 'selya', name: 'Селя', subtitle: 'Остатки, экономика, дефициты', initials: 'AI', bot: true },
  { id: 'marina', name: 'Марина', subtitle: 'Личный диалог', initials: 'М', time: '13:00' },
  { id: 'alexey', name: 'Алексей', subtitle: 'Личный диалог', initials: 'А', time: '13:16' },
  { id: 'team', name: 'Команда магазина', subtitle: 'Групповой чат', initials: 'К', time: '16:18' },
  { id: 'content', name: 'Контент и реклама', subtitle: 'Групповой чат', initials: 'К', time: '12:35' },
];

const calendarWeeks = [
  ['29', '30', '1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10', '11', '12'],
  ['13', '14', '15', '16', '17', '18', '19'],
];

const calendarEvents: Record<string, string[]> = {
  '29': ['Проверить остатки', 'Обновить цены'],
  '30': ['Подготовить карточки'],
  '1': ['Еженедельный отчёт'],
  '3': ['Обновить остатки', 'Согласовать поставку'],
  '4': ['Аудит карточек'],
  '7': ['Рассчитать себестоимость'],
  '8': ['Войти в акцию'],
  '9': ['Загрузить документы'],
  '10': ['Запросить остатки'],
  '11': ['Проверить изображения'],
  '12': ['Ответить покупателям'],
  '16': ['Поднять цены'],
  '17': ['Поставки на склады'],
  '18': ['Обновить показатели'],
};

function ProductMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-[10px] bg-[#ecfdf5]',
        size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
      )}
    >
      <img
        src="/logo.svg"
        alt=""
        width={size === 'md' ? 30 : 24}
        height={size === 'md' ? 30 : 24}
        className={size === 'md' ? 'h-[30px] w-[30px]' : 'h-6 w-6'}
      />
    </span>
  );
}

function Avatar({ initials, violet = false }: { initials: string; violet?: boolean }) {
  return (
    <span
      className={cn(
        'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold',
        violet ? 'bg-[#6366f1] text-white' : 'bg-[#ecfdf5] text-[#10b981]',
      )}
    >
      {initials}
    </span>
  );
}

function Sidebar({
  activeArea,
  onSelect,
}: {
  activeArea: WorkspaceArea;
  onSelect: (area: WorkspaceArea) => void;
}) {
  return (
    <aside className="hidden h-full w-[205px] shrink-0 border-r border-[#e5e7eb] bg-white lg:block">
      <div className="flex h-[68px] items-center gap-3 border-b border-[#eef0f2] px-5">
        <ProductMark />
        <div>
          <p className="text-[14px] font-bold text-[#111827]">Sellico</p>
          <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#a3a3a3]">Workspace</p>
        </div>
      </div>

      <div className="h-[calc(100%-68px)] overflow-y-auto px-3 py-4 [scrollbar-width:none]">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex ? 'mt-4' : ''}>
            <p className="px-2.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#a3a3a3]">
              {section.title}
            </p>
            <div className="mt-1.5 space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.area === activeArea;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => item.area && onSelect(item.area)}
                    disabled={!item.area}
                    className={cn(
                      'flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[10px] font-semibold',
                      isActive
                        ? 'border border-[#cfe9d9] bg-[#fbfefc] text-[#252525] shadow-[0_5px_14px_-10px_rgba(16,185,129,.65)]'
                        : item.area
                          ? 'text-[#777] hover:bg-[#f8faf9]'
                          : 'cursor-default text-[#999]',
                    )}
                  >
                    <Icon size={14} className={isActive ? 'text-[#10b981]' : 'text-[#8c8c8c]'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Toolbar({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="flex h-[58px] items-center justify-between border-b border-[#e5e7eb] bg-white px-3 sm:px-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Открыть меню"
          disabled
          aria-disabled="true"
          className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#e5e7eb] text-[#8b929d] lg:hidden"
        >
          <Menu size={16} />
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white px-3 text-[10px] font-semibold text-[#374151] shadow-sm"
        >
          <span className="grid h-5 w-5 place-items-center rounded-md bg-[#eef2ff] text-[#4f46e5]">S</span>
          Магазин Север
          <ChevronDown size={12} className="text-[#9ca3af]" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" disabled aria-disabled="true" aria-label="Поиск недоступен в демо" className="grid h-8 w-8 place-items-center rounded-full text-[#6b7280]">
          <Search size={15} />
        </button>
        <button type="button" aria-label="Открыть чат" onClick={onOpenChat} className="grid h-8 w-8 place-items-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6]">
          <MessageCircle size={15} />
        </button>
        <button type="button" disabled aria-disabled="true" aria-label="Уведомления недоступны в демо" className="grid h-8 w-8 place-items-center rounded-full text-[#6b7280]">
          <Bell size={15} />
        </button>
        <button type="button" disabled aria-disabled="true" aria-label="Настройки недоступны в демо" className="hidden h-8 w-8 place-items-center rounded-full text-[#6b7280] sm:grid">
          <Settings size={15} />
        </button>
        <Avatar initials="В" violet />
      </div>
    </div>
  );
}

const workspaceAreaMeta: Array<{ id: WorkspaceArea; label: string; icon: LucideIcon }> = [
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'organizer', label: 'Организатор', icon: Sparkles },
  { id: 'applications', label: 'Заявки', icon: Inbox },
  { id: 'reviews', label: 'Отзывы', icon: MessageCircle },
  { id: 'coordination', label: 'Координация', icon: BarChart3 },
  { id: 'finance', label: 'Финансы', icon: Landmark },
  { id: 'seo', label: 'SEO', icon: SearchCheck },
];

function MobileAreaNav({
  activeArea,
  onSelect,
}: {
  activeArea: WorkspaceArea;
  onSelect: (area: WorkspaceArea) => void;
}) {
  return (
    <nav aria-label="Разделы команды" className="grid grid-cols-4 gap-0.5 border-b border-[#e5e7eb] bg-white px-2 py-2 lg:hidden">
      {workspaceAreaMeta.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-current={activeArea === id ? 'page' : undefined}
          className={cn(
            'inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-[7px] font-semibold sm:gap-1.5 sm:px-3 sm:text-[9px]',
            activeArea === id ? 'bg-[#ecfdf5] text-[#087b57]' : 'text-[#64748b]',
          )}
        >
          <Icon size={11} className="shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </nav>
  );
}

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

function OrganizerView() {
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

const applicationCards = [
  { id: '#24', title: 'Запрос консультации', source: 'Сайт', person: 'Анна', date: 'Сегодня' },
  { id: '#23', title: 'Подключение нового магазина', source: 'Сайт', person: 'Михаил', date: 'Вчера' },
  { id: '#21', title: 'Вопрос по тарифу', source: 'Telegram', person: 'Елена', date: '22 июл.' },
  { id: '#19', title: 'Запрос демонстрации', source: 'Сайт', person: 'Алексей', date: '20 июл.' },
  { id: '#18', title: 'Помощь с интеграцией', source: 'Telegram', person: 'Мария', date: '19 июл.' },
  { id: '#17', title: 'Обратная связь', source: 'Сайт', person: 'Игорь', date: '18 июл.' },
];

function ApplicationsView() {
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

function ReviewsView() {
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

const financeBars = [66, 54, 46, 38, 32, 74, 62, 56, 49, 71, 52, 61, 82, 68, 58, 64, 49, 44, 35, 59, 47, 40, 51, 69, 48, 31, 24, 56, 42, 18];
const financeMetrics = [
  { label: 'Выкупленные товары', value: '1 284 630 ₽', detail: '487 шт.' },
  { label: 'Обр. логистика', value: '31 840 ₽', detail: 'Выкуп: 78,4%' },
  { label: 'Компенсация', value: '2 940 ₽', detail: '0,3%' },
  { label: 'Маржинальность', value: '24,8%', detail: '+2,1 п.п.' },
  { label: 'ROI', value: '31,2%', detail: '+4,7%' },
  { label: '% выкупа', value: '78,4%', detail: 'Данные воронки' },
  { label: 'Ср. цена продажи', value: '2 638 ₽', detail: '+6,2%' },
  { label: 'Ср. прибыль на товар', value: '654 ₽', detail: '+8,4%' },
  { label: 'Ср. логистика на товар', value: '164 ₽', detail: '−3,1%' },
  { label: 'Ср. продажи в день', value: '42 821 ₽', detail: '+12,6%' },
  { label: 'Капитализация', value: '4 820 000 ₽', detail: '8,2 млн розн.' },
  { label: 'Оборачиваемость', value: '64 дн.', detail: '51 дн. по заказам' },
];
const financeProducts = [
  { name: 'Органайзер модульный', sku: 'MS-1042', revenue: '186 420 ₽', sales: '72 шт.', expenses: '104 395 ₽', profit: '48 960 ₽', buyout: '82,4%', margin: '26,3%', abc: 'A' },
  { name: 'Набор контейнеров', sku: 'MS-1186', revenue: '142 815 ₽', sales: '54 шт.', expenses: '78 604 ₽', profit: '39 117 ₽', buyout: '79,8%', margin: '27,4%', abc: 'A' },
  { name: 'Полка настольная', sku: 'MS-0917', revenue: '96 730 ₽', sales: '38 шт.', expenses: '56 402 ₽', profit: '22 809 ₽', buyout: '76,1%', margin: '23,6%', abc: 'B' },
  { name: 'Чехлы дорожные, комплект', sku: 'MS-1240', revenue: '71 280 ₽', sales: '31 шт.', expenses: '43 602 ₽', profit: '15 946 ₽', buyout: '74,6%', margin: '22,4%', abc: 'B' },
  { name: 'Корзина для хранения', sku: 'MS-0834', revenue: '48 190 ₽', sales: '26 шт.', expenses: '31 408 ₽', profit: '8 924 ₽', buyout: '71,3%', margin: '18,5%', abc: 'C' },
  { name: 'Подставка для аксессуаров', sku: 'MS-1308', revenue: '24 670 ₽', sales: '14 шт.', expenses: '18 442 ₽', profit: '3 180 ₽', buyout: '68,2%', margin: '12,9%', abc: 'C' },
];

const abcColors: Record<string, string> = {
  A: '#10b981',
  B: '#fbbf24',
  C: '#f97316',
  D: '#ef4444',
  U: '#cbd5e1',
};

function FinanceAbcBar({
  title,
  segments,
}: {
  title: string;
  segments: Array<{ label: string; value: number; count: number }>;
}) {
  return (
    <div>
      <h5 className="text-[9px] font-bold text-[#1f2937]">{title}</h5>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#f1f5f9]">
        {segments.map((segment) => (
          <span key={segment.label} style={{ width: `${segment.value}%`, backgroundColor: abcColors[segment.label] }} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {segments.map((segment) => (
          <span key={segment.label} className="inline-flex items-center gap-1 text-[7px] text-[#64748b]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: abcColors[segment.label] }} />
            <strong className="text-[#334155]">{segment.label}</strong>
            {segment.value}% · {segment.count}
          </span>
        ))}
      </div>
    </div>
  );
}

function FinanceView() {
  const [period, setPeriod] = useState('30 дней');
  const [productSearch, setProductSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState('all');
  const heatmap = Array.from({ length: 7 * 24 }, (_, index) => ((index * 17 + Math.floor(index / 7) * 11) % 100));
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const visibleFinanceProducts = financeProducts.filter((product) => (
    (abcFilter === 'all' || product.abc === abcFilter)
    && (!normalizedProductSearch || product.name.toLowerCase().includes(normalizedProductSearch) || product.sku.toLowerCase().includes(normalizedProductSearch))
  ));

  return (
    <section aria-label="Финансы" className="min-h-[662px] bg-[#f8fafc] p-3 sm:p-5">
      <div className="flex flex-col gap-3 rounded-[15px] border border-[#e5e7eb] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {['Сегодня', 'Вчера', 'Неделя', '30 дней', '90 дней'].map((label) => (
            <button key={label} type="button" onClick={() => setPeriod(label)} className={cn('h-8 rounded-[8px] px-3 text-[8px] font-semibold', period === label ? 'bg-[#111827] text-white' : 'text-[#64748b] hover:bg-[#f1f5f9]')}>
              {label}
            </button>
          ))}
          <button type="button" className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#e5e7eb] px-3 text-[8px] text-[#64748b]">24 июн. – 24 июл. <ChevronDown size={11} /></button>
        </div>
        <button type="button" className="inline-flex h-8 items-center gap-2 self-start rounded-full border border-[#93c5fd] bg-[#eff6ff] px-3 text-[8px] font-bold text-[#2563eb] sm:self-auto">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2563eb] text-[7px] text-white">MS</span>
          Магазин Север
          <ChevronDown size={11} />
        </button>
      </div>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <p className="text-[9px] font-bold text-[#1f2937]">Выручка и прибыль — Магазин Север</p>
        <div className="mt-5 flex h-[150px] items-end gap-[3px] border-b border-[#eef2f7] px-1">
          {financeBars.map((bar, index) => (
            <div key={index} className="flex h-full min-w-0 flex-1 items-end gap-[1px]">
              <div className="w-1/2 rounded-t-[2px] bg-[#10b981]" style={{ height: `${bar}%` }} />
              <div className="w-1/2 rounded-t-[2px] bg-[#a7e4c8]" style={{ height: `${Math.max(12, bar - 14)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[6px] text-[#a3aab4]">
          {['24', '28', '2', '6', '10', '14', '18', '22'].map((day) => <span key={day}>{day}</span>)}
        </div>
      </section>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Выручка', value: '1 284 630 ₽', detail: '+12,6%', color: '#10b981' },
          { label: 'Все расходы', value: '726 840 ₽', detail: '56,6% от выручки', color: '#ef4444' },
          { label: 'Себестоимость', value: '238 120 ₽', detail: '18,5% от выручки', color: '#f59e0b' },
          { label: 'Прибыль', value: '319 670 ₽', detail: '24,8%', color: '#3b82f6' },
        ].map((metric) => (
          <section key={metric.label} className="relative overflow-hidden rounded-[15px] border border-[#e5e7eb] bg-white p-4">
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: metric.color }} />
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">{metric.label}</p>
            <p className="mt-2 text-[17px] font-extrabold tracking-[-0.03em]" style={{ color: metric.color }}>{metric.value}</p>
            <p className="mt-1 text-[7px] text-[#94a3b8]">{metric.detail}</p>
          </section>
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {financeMetrics.map((metric) => (
          <section key={metric.label} className="min-h-[82px] rounded-[14px] border border-[#e5e7eb] bg-white p-3">
            <p className="text-[7px] font-semibold uppercase tracking-[0.04em] text-[#94a3b8]">{metric.label}</p>
            <p className="mt-2 text-[13px] font-extrabold text-[#1f2937]">{metric.value}</p>
            <p className={cn('mt-1 text-[7px]', metric.detail.startsWith('−') ? 'text-[#ef4444]' : 'text-[#10b981]')}>{metric.detail}</p>
          </section>
        ))}
      </div>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold text-[#1f2937]"><Clock3 size={13} className="text-[#10b981]" />Тепловая карта заказов</p>
            <p className="mt-1 text-[7px] text-[#94a3b8]">Пн–Вс по 24 часам · интенсивность заказов</p>
          </div>
          <div className="flex gap-2 text-[7px] text-[#64748b]"><span className="rounded-[7px] bg-[#f1f5f9] px-2 py-1.5">Штуки</span><span className="rounded-[7px] border border-[#e5e7eb] px-2 py-1.5">24 июн. – 24 июл.</span></div>
        </div>
        <div className="mt-4 grid grid-cols-[20px_repeat(24,minmax(8px,1fr))] gap-1 overflow-x-auto">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].flatMap((day, dayIndex) => [
            <span key={`${day}-label`} className="grid h-4 place-items-center text-[6px] text-[#64748b]">{day}</span>,
            ...Array.from({ length: 24 }, (_, hour) => {
              const value = heatmap[dayIndex * 24 + hour];
              const color = value > 82 ? '#008f5b' : value > 62 ? '#36bd84' : value > 40 ? '#74d4aa' : value > 20 ? '#b9ead5' : '#edf7f2';
              return <span key={`${day}-${hour}`} className="h-4 min-w-2 rounded-[4px]" style={{ backgroundColor: color }} />;
            }),
          ])}
        </div>
        <div className="mt-3 flex items-center gap-1 text-[6px] text-[#94a3b8]">
          Меньше
          {['#edf7f2', '#b9ead5', '#74d4aa', '#36bd84', '#008f5b'].map((color) => <span key={color} className="h-2 w-4 rounded-full" style={{ backgroundColor: color }} />)}
          Больше
        </div>
      </section>

      <section className="mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-4">
        <h4 className="text-[10px] font-bold text-[#1f2937]">Расходы</h4>
        <p className="mt-1 text-[7px] text-[#94a3b8]">Распределение расходов и история за период</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div>
            <div className="flex h-7 overflow-hidden rounded-full">
              {[
                ['#fbbf24', '42%'],
                ['#84cc16', '23%'],
                ['#22c55e', '17%'],
                ['#60a5fa', '10%'],
                ['#8b5cf6', '8%'],
              ].map(([color, width]) => <span key={color} style={{ backgroundColor: color, width }} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[7px] text-[#64748b]">
              {['Комиссия', 'Реклама', 'Доставка', 'Прочее', 'Хранение'].map((label) => <span key={label}>{label}</span>)}
            </div>
          </div>
          <div className="flex h-[92px] items-end gap-1">
            {[44, 61, 53, 68, 72, 64, 78, 59, 84, 76, 52, 69, 63, 47, 74, 58].map((value, index) => (
              <span key={index} className="min-w-0 flex-1 rounded-t-[2px] bg-gradient-to-t from-[#fbbf24] via-[#84cc16] to-[#60a5fa]" style={{ height: `${value}%` }} />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="rounded-[16px] border border-[#e5e7eb] bg-white p-4">
          <h4 className="text-[10px] font-bold text-[#1f2937]">Остатки и товары в доставке</h4>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Все товары', value: '4 820 000 ₽', detail: '1 842 шт.' },
              { label: 'На складе для продажи', value: '4 126 400 ₽', detail: '85,6% · 1 576 шт.' },
              { label: 'В доставке', value: '693 600 ₽', detail: '14,4% · 266 шт.' },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-[12px] border border-[#e5e7eb] p-3">
                <p className="line-clamp-2 min-h-[20px] text-[6px] font-semibold uppercase tracking-[0.04em] text-[#94a3b8]">{item.label}</p>
                <p className="mt-2 truncate text-[11px] font-extrabold text-[#1f2937] sm:text-[13px]">{item.value}</p>
                <p className="mt-1 text-[6px] text-[#94a3b8] sm:text-[7px]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-[16px] border border-[#e5e7eb] bg-white p-4 sm:grid-cols-2">
          <FinanceAbcBar
            title="ABC-анализ прибыли"
            segments={[
              { label: 'A', value: 54, count: 2 },
              { label: 'B', value: 23, count: 2 },
              { label: 'C', value: 14, count: 2 },
              { label: 'D', value: 5, count: 0 },
              { label: 'U', value: 4, count: 0 },
            ]}
          />
          <FinanceAbcBar
            title="Доля выручки по ABC-классам"
            segments={[
              { label: 'A', value: 78, count: 2 },
              { label: 'B', value: 15, count: 2 },
              { label: 'C', value: 7, count: 2 },
              { label: 'D', value: 0, count: 0 },
            ]}
          />
        </section>
      </div>

      <section className="mt-3 overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
        <div className="grid gap-3 border-b border-[#e5e7eb] bg-[#f8fafc]/90 p-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-[#3b82f6]" />
            <div>
              <h4 className="text-[9px] font-extrabold text-[#1f2937]">Часть расходов не распределена по товарам</h4>
              <p className="mt-1 text-[7px] leading-relaxed text-[#64748b]">По товарам распределено 689 200 ₽, не распределено 37 640 ₽. Прибыль по товарам не включает эти общие списания.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TriangleAlert size={15} className="mt-0.5 shrink-0 text-[#f59e0b]" />
            <div>
              <h4 className="text-[9px] font-extrabold text-[#1f2937]">Себестоимость заполнена не у всех товаров</h4>
              <p className="mt-1 text-[7px] leading-relaxed text-[#64748b]">5 товаров с выручкой 18 420 ₽ имеют нулевую себестоимость. Прибыль по ним предварительная.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[#eef2f7] p-3 sm:flex-row sm:items-center">
          <label className="relative shrink-0">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              aria-label="Поиск финансов по товару"
              placeholder="Артикул или имя"
              className="h-8 w-full rounded-[8px] border border-[#e5e7eb] pl-8 pr-3 text-[8px] outline-none focus:border-[#111827] sm:w-[190px]"
            />
          </label>
          <div className="flex overflow-x-auto">
            {['all', 'A', 'B', 'C', 'D', 'U'].map((filter) => {
              const count = filter === 'all' ? financeProducts.length : financeProducts.filter((product) => product.abc === filter).length;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAbcFilter(filter)}
                  className={cn(
                    'h-8 shrink-0 border border-r-0 border-[#e5e7eb] px-2.5 text-[7px] font-semibold first:rounded-l-[8px] last:rounded-r-[8px] last:border-r',
                    abcFilter === filter ? 'border-[#111827] bg-[#111827] text-white' : 'bg-white text-[#64748b]',
                  )}
                >
                  {filter === 'all' ? 'Все (прибыль)' : filter}
                  <span className="ml-1 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[7px] text-[#94a3b8] sm:ml-auto">Сортировать по <strong className="text-[#64748b]">выручке</strong>, сначала <strong className="text-[#64748b]">высокая</strong></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-[#f8fafc] text-[7px] uppercase tracking-[0.04em] text-[#94a3b8]">
              <tr>
                {['Товар', 'Выкупы', 'ABC', 'Расходы', 'Прибыль', 'Процент выкупа', 'Маржинальность'].map((label) => <th key={label} className="px-4 py-2.5 font-semibold">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleFinanceProducts.length ? visibleFinanceProducts.map((product) => (
                <tr key={product.name} className="border-t border-[#eef2f7] text-[8px] text-[#475569] hover:bg-[#f8fbff]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-[#dcfce7] to-[#dbeafe] text-[8px] font-extrabold text-[#087b57]">MS</span>
                      <span>
                        <span className="block font-semibold text-[#1f2937]">{product.name}</span>
                        <span className="mt-1 block text-[6px] text-[#94a3b8]">Артикул: {product.sku}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-bold text-[#1f2937]">{product.revenue}</span>
                    <span className="mt-1 block text-[6px] text-[#94a3b8]">{product.sales}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full border text-[7px] font-extrabold" style={{ borderColor: `${abcColors[product.abc]}55`, backgroundColor: `${abcColors[product.abc]}18`, color: abcColors[product.abc] }}>{product.abc}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{product.expenses}</td>
                  <td className="px-4 py-3 font-bold text-[#10b981]">{product.profit}</td>
                  <td className="px-4 py-3 font-semibold text-[#3b82f6]">{product.buyout}</td>
                  <td className={cn('px-4 py-3 font-bold', Number.parseFloat(product.margin) >= 20 ? 'text-[#10b981]' : 'text-[#f59e0b]')}>{product.margin}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[8px] text-[#94a3b8]">Нет товаров по выбранному фильтру</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

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

function SeoView() {
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

type CoordinationMode = 'summary' | 'day';
type CoordinationMarketplace = 'all' | 'Ozon' | 'Wildberries';

const coordinationStores = [
  { name: 'Магазин Север', marketplace: 'Wildberries', seed: 7 },
  { name: 'Дом и порядок', marketplace: 'Ozon', seed: 12 },
  { name: 'Городской склад', marketplace: 'Wildberries', seed: 19 },
  { name: 'Линия дома', marketplace: 'Ozon', seed: 26 },
  { name: 'Вектор', marketplace: 'Wildberries', seed: 33 },
  { name: 'Простые вещи', marketplace: 'Ozon', seed: 41 },
  { name: 'Новый сезон', marketplace: 'Wildberries', seed: 48 },
  { name: 'Базовый магазин', marketplace: 'Ozon', seed: 55 },
  { name: 'Тёплый дом', marketplace: 'Wildberries', seed: 63 },
  { name: 'Полезные детали', marketplace: 'Ozon', seed: 71 },
];

const coordinationSummaryGroups = [
  { label: 'ИЮЛЬ', tone: '#fff8c9' },
  { label: 'Неделя 1', tone: '#d9f5f7' },
  { label: 'Неделя 2', tone: '#d9f5f7' },
  { label: 'Неделя 3', tone: '#d9f5f7' },
];

const coordinationSummaryMetrics = ['Продажа', 'Выручка', 'Прогноз', 'План'];
const coordinationDayMetrics = ['Продажа', 'Выручка', 'Ср чек', 'Общ.Показ', 'ДРР', 'Показы', 'Клики', 'Корзина', 'Заказ'];

function coordinationCellData(seed: number, group: number, metric: number, mode: CoordinationMode) {
  const hash = (seed * 37 + group * 23 + metric * 17) % 101;
  const tone = hash < 42 ? 'negative' : hash > 64 ? 'positive' : 'neutral';
  const direction = tone === 'positive' ? '↑↑ ' : tone === 'negative' ? '↓↓ ' : hash % 2 ? '→ ' : '';

  if (mode === 'summary') {
    const bases = [34 + ((seed * 13 + group * 31) % 790), 52_000 + ((seed * 19_431 + group * 73_770) % 930_000), 78_000 + ((seed * 27_019 + group * 41_500) % 1_140_000), 0];
    const value = bases[metric];
    return {
      tone: metric === 3 ? 'neutral' : tone,
      value: metric === 3 ? '—' : `${direction}${value.toLocaleString('ru-RU')}`,
    };
  }

  const values = [
    4 + ((seed * 11 + group * 17) % 230),
    8_500 + ((seed * 7_613 + group * 19_300) % 198_000),
    620 + ((seed * 137 + group * 449) % 5_900),
    2_300 + ((seed * 1_901 + group * 3_770) % 88_000),
    (1.2 + ((seed * 29 + group * 13) % 145) / 10).toFixed(2),
    1_100 + ((seed * 653 + group * 1_771) % 62_000),
    (0.8 + ((seed * 7 + group * 11) % 72) / 10).toFixed(2),
    (3.2 + ((seed * 5 + group * 17) % 285) / 10).toFixed(2),
    (8.5 + ((seed * 9 + group * 21) % 1_260) / 10).toFixed(2),
  ];
  const suffix = metric === 4 ? '%' : '';
  return { tone, value: `${direction}${Number(values[metric]).toLocaleString('ru-RU')}${suffix}` };
}

function CoordinationDataCell({
  seed,
  group,
  metric,
  mode,
}: {
  seed: number;
  group: number;
  metric: number;
  mode: CoordinationMode;
}) {
  const data = coordinationCellData(seed, group, metric, mode);
  return (
    <td
      className={cn(
        'h-8 min-w-[82px] border-b border-r border-[#dfe3e6] px-2 text-right font-mono text-[7px] font-semibold tabular-nums',
        data.tone === 'positive' && 'bg-[#dff2df] text-[#2e7d32]',
        data.tone === 'negative' && 'bg-[#ffd7da] text-[#d43a3a]',
        data.tone === 'neutral' && 'bg-white text-[#5b6067]',
      )}
    >
      {data.value}
    </td>
  );
}

function CoordinationTable({
  mode,
  stores,
}: {
  mode: CoordinationMode;
  stores: typeof coordinationStores;
}) {
  if (mode === 'summary') {
    return (
      <table className="min-w-[1540px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
            {coordinationSummaryGroups.map((group) => (
              <th key={group.label} colSpan={4} className="h-8 border-b border-r border-[#d9dde1] text-center text-[9px] font-bold text-[#30363d]" style={{ backgroundColor: group.tone }}>{group.label}</th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f1f3f4] px-2 text-[8px] font-bold text-[#61666d]">Магазин</th>
            {coordinationSummaryGroups.flatMap((group) => coordinationSummaryMetrics.map((metric) => (
              <th key={`${group.label}-${metric}`} className="h-8 min-w-[82px] border-b border-r border-[#d9dde1] px-2 text-center text-[7px] font-bold text-[#676b72]" style={{ backgroundColor: group.tone }}>{metric}</th>
            )))}
          </tr>
        </thead>
        <tbody>
          {stores.map((storeItem) => (
            <tr key={storeItem.name}>
              <th className="sticky left-0 z-20 h-9 border-b border-r border-[#dfe3e6] bg-white px-2">
                <span className="block max-w-[150px] truncate text-[8px] font-bold text-[#343941]">{storeItem.name}</span>
                <span className="mt-0.5 block text-[6px] font-medium text-[#888e95]">{storeItem.marketplace}</span>
              </th>
              {coordinationSummaryGroups.flatMap((group, groupIndex) => coordinationSummaryMetrics.map((metric, metricIndex) => (
                <CoordinationDataCell key={`${group.label}-${metric}`} seed={storeItem.seed} group={groupIndex} metric={metricIndex} mode="summary" />
              )))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const dayGroups = [
    { week: 'Неделя 4', date: '22 июля' },
    { week: 'Неделя 4', date: '21 июля' },
    { week: 'Неделя 3', date: '20 июля' },
  ];

  return (
    <table className="min-w-[2450px] border-separate border-spacing-0 text-left">
      <thead>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
          {dayGroups.map((group, index) => (
            <th key={group.date} colSpan={9} className={cn('h-7 border-b border-r border-[#c5d5e8] text-center text-[9px] font-bold', index % 2 ? 'bg-[#b7dff7] text-[#1766c2]' : 'bg-[#dcecff] text-[#1766c2]')}>{group.week}</th>
          ))}
        </tr>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f6f7f8]" />
          {dayGroups.map((group, index) => (
            <th key={group.date} colSpan={9} className={cn('h-7 border-b border-r border-[#c5d5e8] text-center text-[8px] font-bold', index % 2 ? 'bg-[#e8f5ff] text-[#1766c2]' : 'bg-[#eff5ff] text-[#1766c2]')}>{group.date}</th>
          ))}
        </tr>
        <tr>
          <th className="sticky left-0 z-30 min-w-[165px] border-b border-r border-[#d9dde1] bg-[#f1f3f4] px-2 text-[8px] font-bold text-[#61666d]">Магазин</th>
          {dayGroups.flatMap((group) => coordinationDayMetrics.map((metric) => (
            <th key={`${group.date}-${metric}`} className="h-8 min-w-[82px] border-b border-r border-[#d9dde1] bg-[#f7f8fa] px-2 text-center text-[7px] font-bold text-[#676b72]">{metric}</th>
          )))}
        </tr>
      </thead>
      <tbody>
        {stores.map((storeItem) => (
          <tr key={storeItem.name}>
            <th className="sticky left-0 z-20 h-9 border-b border-r border-[#dfe3e6] bg-white px-2">
              <span className="block max-w-[150px] truncate text-[8px] font-bold text-[#343941]">{storeItem.name}</span>
              <span className="mt-0.5 block text-[6px] font-medium text-[#888e95]">{storeItem.marketplace}</span>
            </th>
            {dayGroups.flatMap((group, groupIndex) => coordinationDayMetrics.map((metric, metricIndex) => (
              <CoordinationDataCell key={`${group.date}-${metric}`} seed={storeItem.seed} group={groupIndex} metric={metricIndex} mode="day" />
            )))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CoordinationView() {
  const [mode, setMode] = useState<CoordinationMode>('summary');
  const [searchValue, setSearchValue] = useState('');
  const [marketplace, setMarketplace] = useState<CoordinationMarketplace>('all');
  const [zoom, setZoom] = useState(100);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const visibleStores = coordinationStores.filter((storeItem) => (
    (marketplace === 'all' || storeItem.marketplace === marketplace)
    && (!normalizedSearch || storeItem.name.toLowerCase().includes(normalizedSearch))
  ));

  return (
    <section aria-label="Координация" className="min-h-[662px] bg-[#f8faf9] p-2 sm:p-3">
      <section className="overflow-hidden rounded-[14px] border border-[#dfe3e4] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#d9dde1] bg-[#f8f9fa] p-3 xl:flex-row xl:items-center xl:justify-between">
          <button type="button" className="inline-flex h-9 items-center gap-2 self-start rounded-full border border-[#b9dfc0] bg-[#f3fbf4] px-4 text-[8px] font-bold text-[#418d48]">
            <CalendarDays size={14} />
            1 мая — 24 июля 2026
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:justify-center">
            <div className="flex self-start overflow-hidden rounded-[10px] border border-[#d7dadd] bg-white">
              {[
                { id: 'summary' as const, label: 'Сводка' },
                { id: 'day' as const, label: 'По дням' },
              ].map((item) => (
                <button key={item.id} type="button" onClick={() => setMode(item.id)} className={cn('h-9 px-4 text-[8px] font-bold uppercase', mode === item.id ? 'bg-[#f1f3f4] text-[#20242a]' : 'text-[#777c84]')}>
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative block min-w-0 sm:w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
              <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} aria-label="Поиск магазина в координации" placeholder="Поиск магазина" className="h-9 w-full rounded-[10px] border border-[#cfd4d7] bg-white pl-9 pr-3 text-[8px] outline-none focus:border-[#58a469]" />
            </label>
            <label className="relative block sm:w-[140px]">
              <span className="pointer-events-none absolute -top-2 left-3 bg-[#f8f9fa] px-1 text-[6px] text-[#74869a]">Маркетплейс</span>
              <select value={marketplace} onChange={(event) => setMarketplace(event.target.value as CoordinationMarketplace)} aria-label="Фильтр маркетплейса" className="h-9 w-full appearance-none rounded-[10px] border border-[#cfd4d7] bg-white px-3 pr-8 text-[8px] text-[#3e444b] outline-none">
                <option value="all">Все</option>
                <option value="Ozon">Ozon</option>
                <option value="Wildberries">Wildberries</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777d83]" />
            </label>
          </div>

          <div className="flex items-center gap-0.5 self-start text-[#666b72] xl:self-auto">
            {mode === 'day' ? <button type="button" aria-label="Выбор колонок" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Grid3X3 size={14} /></button> : null}
            <button type="button" onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="Уменьшить масштаб" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><ZoomOut size={14} /></button>
            <span className="w-9 text-center text-[7px] font-semibold">{zoom}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} aria-label="Увеличить масштаб" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><ZoomIn size={14} /></button>
            <button type="button" aria-label="Обновить" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><RefreshCw size={14} /></button>
            <button type="button" aria-label="На весь экран" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Maximize2 size={14} /></button>
            <button type="button" aria-label="Скачать" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-white"><Download size={14} /></button>
          </div>
        </div>

        <div className="h-[520px] overflow-auto bg-white [scrollbar-color:#bfc5c8_#f3f4f5]">
          <CoordinationTable mode={mode} stores={visibleStores} />
          {!visibleStores.length ? <p className="p-10 text-center text-[9px] text-[#8a9097]">Магазины не найдены</p> : null}
        </div>
        <div className="flex h-9 items-center justify-between border-t border-[#d9dde1] bg-[#fafbfb] px-3 text-[7px] text-[#71777e]">
          <span>{visibleStores.length} магазинов · 83 дня · {mode === 'day' ? '747' : '40'} колонок</span>
          <span>Демо-данные обезличены</span>
        </div>
      </section>
    </section>
  );
}

function TaskCard({
  task,
  onOpen,
}: {
  task: DemoTask;
  onOpen: (task: DemoTask, trigger: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => onOpen(task, event.currentTarget)}
      aria-label={`Открыть задачу: ${task.title}`}
      className={cn(
        'w-full rounded-[11px] border bg-white p-3 text-left shadow-[0_1px_4px_rgba(0,0,0,.08)] transition hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]',
        task.status === 'overdue' ? 'border-[#ef4444]' : 'border-[#f0f0f0]',
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-[10px] font-semibold leading-[1.15] text-[#20242b]">{task.title}</span>
        <MoreVertical size={13} className="shrink-0 text-[#8f96a3]" />
      </span>

      {task.status === 'overdue' || task.wasOverdue ? (
        <span
          className={cn(
            'mt-2 inline-flex rounded-full border px-2 py-0.5 text-[7px] font-semibold',
            task.status === 'overdue'
              ? 'border-[#ffb74d] bg-[#fff3e0] text-[#e65100]'
              : 'border-[#ce93d8] bg-[#f3e5f5] text-[#7b1fa2]',
          )}
        >
          {task.status === 'overdue' ? 'Просрочено' : 'Была просрочена'}
        </span>
      ) : null}

      <span className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#10b981]" />
          <span className="truncate text-[7px] font-medium uppercase tracking-[0.05em] text-[#64748b]">
            {task.project}
          </span>
        </span>
        <span className="shrink-0 text-[7px] text-[#7c8593]">{task.due}</span>
      </span>

      <span className="mt-3 flex items-center gap-1.5 border-t border-[#f1f3f5] pt-2.5">
        <Avatar initials={task.assignee} violet />
        <span className="text-[7px] text-[#7c8593]">Участник команды</span>
        <Paperclip size={10} className="ml-auto text-[#9ca3af]" />
      </span>
    </button>
  );
}

function StatusHeader({ status, count }: { status: TaskStatus; count: number }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <div
      className="flex h-11 items-center gap-2 rounded-[11px] border px-3"
      style={{ backgroundColor: meta.soft, borderColor: meta.border, color: meta.color }}
    >
      <Icon size={14} fill={status === 'in_progress' ? 'currentColor' : 'none'} />
      <span className="truncate text-[10px] font-semibold">{meta.label}</span>
      <span
        className="ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1 text-[8px] font-bold text-white"
        style={{ backgroundColor: meta.color }}
      >
        {count}
      </span>
    </div>
  );
}

function KanbanBoard({
  tasks,
  onOpenTask,
  mobileColumn,
  onMobileColumnChange,
}: {
  tasks: DemoTask[];
  onOpenTask: (task: DemoTask, trigger: HTMLButtonElement) => void;
  mobileColumn: number;
  onMobileColumnChange: (index: number) => void;
}) {
  const mobileStatus = statusOrder[mobileColumn];
  const mobileTasks = tasks.filter((task) => task.status === mobileStatus);

  return (
    <>
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => onMobileColumnChange(Math.max(0, mobileColumn - 1))}
            disabled={mobileColumn === 0}
            aria-label="Предыдущая колонка"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#64748b] shadow disabled:opacity-30"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="w-[190px]">
            <StatusHeader status={mobileStatus} count={mobileTasks.length} />
          </div>
          <button
            type="button"
            onClick={() => onMobileColumnChange(Math.min(statusOrder.length - 1, mobileColumn + 1))}
            disabled={mobileColumn === statusOrder.length - 1}
            aria-label="Следующая колонка"
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#64748b] shadow disabled:opacity-30"
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="mx-3 mt-3 h-1 overflow-hidden rounded-full bg-[#e5e7eb]">
          <span
            className="block h-full rounded-full transition-all"
            style={{
              width: `${((mobileColumn + 1) / statusOrder.length) * 100}%`,
              backgroundColor: statusMeta[mobileStatus].color,
            }}
          />
        </div>
        <p className="mt-1.5 text-center text-[8px] text-[#94a3b8]">{mobileColumn + 1} из 5</p>
        <div
          className="mt-3 min-h-[370px] space-y-2 rounded-xl border-2 border-dashed p-3"
          style={{
            borderColor: statusMeta[mobileStatus].border,
            backgroundColor: statusMeta[mobileStatus].soft,
          }}
        >
          {mobileTasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto pb-2 [scrollbar-color:#d4d8dd_transparent] sm:block">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-5 gap-2">
            {statusOrder.map((status) => (
              <StatusHeader
                key={status}
                status={status}
                count={tasks.filter((task) => task.status === status).length}
              />
            ))}
          </div>
          <div className="mt-2 grid min-h-[410px] grid-cols-5 gap-2">
            {statusOrder.map((status) => (
              <section key={status} aria-label={statusMeta[status].label} className="space-y-2 rounded-[10px] bg-[#f8fafc] p-1.5">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
                  ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ListView({ tasks, onOpenTask }: { tasks: DemoTask[]; onOpenTask: (task: DemoTask, trigger: HTMLButtonElement) => void }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[#e5e7eb] bg-white">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead className="bg-[#f8fafc]">
          <tr className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
            {['Задача', 'Проект', 'Исполнитель', 'Срок', 'Статус'].map((label) => (
              <th key={label} className="border-b border-[#e5e7eb] px-4 py-3">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-[#eef1f4] last:border-0">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={(event) => onOpenTask(task, event.currentTarget)}
                  className="text-[10px] font-semibold text-[#1f2937] hover:text-[#2563eb]"
                >
                  {task.title}
                </button>
              </td>
              <td className="px-4 py-3 text-[9px] text-[#64748b]">{task.project}</td>
              <td className="px-4 py-3"><Avatar initials={task.assignee} violet /></td>
              <td className="px-4 py-3 text-[9px] text-[#64748b]">{task.due}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex rounded-full px-2.5 py-1 text-[8px] font-semibold"
                  style={{ backgroundColor: statusMeta[task.status].soft, color: statusMeta[task.status].color }}
                >
                  {statusMeta[task.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarView() {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#e3e7ed] bg-white shadow-[0_4px_20px_rgba(15,23,42,.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-gradient-to-r from-[#f3f7ff] to-[#faf7ff] px-4 py-3">
        <h4 className="text-[14px] font-bold text-[#1f2937]">июль 2026 г.</h4>
        <div className="flex rounded-[10px] bg-white p-0.5 shadow-sm">
          {['Месяц', 'Неделя', 'День'].map((label, index) => (
            <span key={label} className={cn('rounded-[8px] px-3 py-1.5 text-[8px] font-semibold', index === 0 ? 'bg-[#3b82f6] text-white' : 'text-[#374151]')}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 bg-[#f4f7fc]">
        {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day) => (
          <div key={day} className="border-r border-[#e5e7eb] py-2 text-center text-[8px] font-bold text-[#3b82f6] last:border-0">
            {day}
          </div>
        ))}
      </div>
      {calendarWeeks.map((week, weekIndex) => (
        <div key={week.join('-')} className="grid grid-cols-7">
          {week.map((date) => (
            <div key={`${weekIndex}-${date}`} className="min-h-[112px] border-r border-t border-[#e8ebef] p-1.5 last:border-r-0">
              <p className="text-right text-[8px] font-semibold text-[#475569]">{date}</p>
              <div className="mt-1 space-y-1">
                {(calendarEvents[date] || []).slice(0, 2).map((event) => (
                  <div key={event} className="truncate rounded-full bg-[#ff9800] px-2 py-1 text-[7px] font-semibold text-white shadow-sm">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function TaskDialog({
  task,
  mobile,
  reducedMotion,
  closeButtonRef,
  onClose,
}: {
  task: DemoTask;
  mobile: boolean;
  reducedMotion: boolean | null;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(true, dialogRef, onClose, { inertApp: mobile, lockScroll: mobile });

  const stepIndex =
    task.status === 'pending'
      ? 0
      : task.status === 'in_progress'
        ? 1
        : task.status === 'review'
          ? 2
          : 3;

  return (
    <motion.div
      className={cn(
        'inset-0 z-50 flex items-center justify-center bg-[#111827]/42 p-2 backdrop-blur-[1px]',
        mobile ? 'fixed' : 'absolute',
      )}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
        initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.99 }}
        transition={{ duration: reducedMotion ? 0 : 0.24 }}
        className="flex h-full max-h-[680px] w-full max-w-[900px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,.55)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] px-5 py-4">
          <div>
            <p className="text-[9px] font-medium text-[#64748b]">Задача / #{task.id.toUpperCase()}</p>
            <h3 id="task-dialog-title" className="mt-2 text-[18px] font-bold leading-tight text-[#1e293b] sm:text-[22px]">
              {task.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть карточку задачи"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_235px]">
          <div className="min-h-0 overflow-y-auto border-r border-[#e5e7eb]">
            <div className="flex h-11 items-end gap-7 border-b border-[#e5e7eb] px-5">
              {['Обзор', 'Обсуждение', 'История'].map((label, index) => (
                <span key={label} className={cn('h-11 border-b-2 pt-3 text-[10px] font-medium', index === 0 ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-[#64748b]')}>
                  {label}
                </span>
              ))}
            </div>

            <div className="p-5">
              <div className="flex items-start">
                {['Создано', 'В работе', 'Проверка', 'Готово'].map((label, index, steps) => {
                  const active = index <= stepIndex;
                  return (
                    <div key={label} className="flex min-w-0 flex-1 items-start">
                      <div className="flex flex-col items-center">
                        <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[8px] font-bold', active ? 'bg-[#3b82f6] text-white' : 'bg-[#e2e8f0] text-[#94a3b8]')}>
                          {active ? <Check size={11} strokeWidth={2.6} /> : index + 1}
                        </span>
                        <span className={cn('mt-1 whitespace-nowrap text-[7px]', index === stepIndex ? 'font-semibold text-[#3b82f6]' : 'text-[#94a3b8]')}>{label}</span>
                      </div>
                      {index < steps.length - 1 ? (
                        <span className={cn('mt-3 h-0.5 min-w-3 flex-1', index < stepIndex ? 'bg-[#3b82f6]' : 'bg-[#e2e8f0]')} />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 text-[11px] leading-[1.65] text-[#475569]">{task.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: 'Метка', icon: CheckSquare },
                  { label: 'Файл', icon: Paperclip },
                  { label: 'Напоминание', icon: Bell },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <span key={action.label} className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] px-3 py-1.5 text-[9px] font-medium text-[#64748b]">
                      <Icon size={12} />
                      {action.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-[#e5e7eb] pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Подзадачи</h4>
                  <span className="text-[8px] text-[#94a3b8]">1/3</span>
                </div>
                <div className="mt-3 space-y-2">
                  {['Проверить исходные данные', 'Запросить недостающие файлы', 'Передать на проверку'].map((item, index) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-[10px] border border-[#e5e7eb] px-3 py-2.5">
                      <span className={cn('grid h-5 w-5 place-items-center rounded-full border', index === 0 ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-[#cbd5e1] text-transparent')}>
                        <Check size={11} />
                      </span>
                      <span className={cn('text-[9px]', index === 0 ? 'text-[#94a3b8] line-through' : 'text-[#475569]')}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="hidden bg-[#fbfcfe] p-5 md:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Свойства</p>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-[9px] text-[#64748b]">Статус</dt>
                <dd className="mt-1.5 inline-flex rounded-[8px] bg-[#dbeafe] px-2.5 py-1.5 text-[9px] font-semibold text-[#1d4ed8]">
                  {statusMeta[task.status].label}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] text-[#64748b]">Приоритет</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-[#1f2937]">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  Средний
                </dd>
              </div>
              <div>
                <dt className="text-[9px] text-[#64748b]">Срок</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold text-[#1f2937]">
                  <CalendarDays size={14} className="text-[#94a3b8]" />
                  {task.due}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] text-[#64748b]">Проект</dt>
                <dd className="mt-1.5 text-[10px] font-semibold text-[#10b981]">{task.project}</dd>
              </div>
              <div>
                <dt className="text-[9px] text-[#64748b]">Ответственный</dt>
                <dd className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-[#1f2937]">
                  <Avatar initials={task.assignee} violet />
                  Участник команды
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}

function CreateTaskDialog({
  mobile,
  onClose,
  onCreate,
}: {
  mobile: boolean;
  onClose: () => void;
  onCreate: (task: DemoTask) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tab, setTab] = useState<'details' | 'participants'>('details');
  const [binding, setBinding] = useState<'project' | 'lead'>('project');
  const dialogRef = useRef<HTMLFormElement>(null);

  useDialogFocus(true, dialogRef, onClose, { inertApp: mobile, lockScroll: mobile });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Описание будет добавлено позже.',
      project: 'Магазин Север',
      assignee: 'В',
      due: 'Сегодня',
      status: 'pending',
    });
  };

  return (
    <div className={cn('inset-0 flex items-center justify-center bg-[#111827]/48 p-2 sm:p-4', mobile ? 'fixed z-[190]' : 'absolute z-[70]')}>
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Создание новой задачи"
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-16px)] w-full max-w-[1040px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_90px_-25px_rgba(15,23,42,.55)] sm:max-h-[690px]"
      >
        <div className="shrink-0 border-b border-[#e5e7eb] px-4 pb-4 pt-4 sm:px-7 sm:pb-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#10b981] text-white">
              <Plus size={17} />
            </span>
            <span className="text-[12px] font-semibold text-[#64748b] sm:text-[14px]">Новая задача</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#10b981] px-4 text-[11px] font-bold text-white shadow-[0_6px_18px_rgba(16,185,129,.25)] sm:px-5"
              >
                <Plus size={15} />
                Создать
              </button>
              <button type="button" onClick={onClose} aria-label="Закрыть создание задачи" className="grid h-9 w-9 place-items-center rounded-full text-[#64748b] hover:bg-[#f1f5f9]">
                <X size={19} />
              </button>
            </div>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            aria-label="Название задачи"
            placeholder="Название задачи…"
            className="mt-4 w-full bg-transparent text-[19px] font-bold text-[#1f2937] outline-none placeholder:text-[#9ca3af] sm:text-[23px]"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:overflow-hidden">
          <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
            <div className="flex h-12 shrink-0 border-b border-[#e5e7eb] px-4 sm:px-7">
              {([
                ['details', 'Детали'],
                ['participants', 'Участники'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'relative px-3 text-[12px] font-semibold sm:px-4',
                    tab === id ? 'text-[#10b981]' : 'text-[#64748b]',
                  )}
                >
                  {label}
                  {tab === id ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#10b981]" /> : null}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
              {tab === 'details' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Описание</p>
                  <div className="mt-3 overflow-hidden rounded-[16px] border border-[#dbe3ed]">
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={4}
                      placeholder="Опишите задачу подробнее…"
                      className="block min-h-[118px] w-full resize-none p-4 text-[12px] text-[#334155] outline-none placeholder:text-[#9ca3af]"
                    />
                    <div className="flex h-11 items-center justify-between border-t border-[#edf0f4] bg-[#fbfcfd] px-4 text-[10px] text-[#94a3b8]">
                      <span className="inline-flex items-center gap-2"><Image size={14} /> Изображение</span>
                      <span className="hidden sm:block">Ctrl+V или перетащите</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { label: 'Метка', icon: Tag },
                      { label: 'Файл', icon: Paperclip },
                      { label: 'Напоминание', icon: Bell },
                      { label: 'Ссылка', icon: Link2 },
                    ].map(({ label, icon: Icon }) => (
                      <button key={label} type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dbe3ed] px-3 text-[11px] font-semibold text-[#64748b] hover:bg-[#f8fafc]">
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Подзадачи</p>
                    <button type="button" className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#94a3b8]">
                      <span className="grid h-5 w-5 place-items-center rounded-full border border-dashed border-[#cbd5e1]"><Plus size={13} /></span>
                      Добавить подзадачу
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {[
                    { label: 'Ответственный', placeholder: 'Поиск пользователя…', icon: UserRound, required: true, tone: 'red' },
                    { label: 'Исполнители', placeholder: 'Добавить исполнителей', icon: Users, tone: 'blue' },
                    { label: 'Наблюдатели', placeholder: 'Добавить наблюдателей', icon: Eye, tone: 'amber' },
                  ].map(({ label, placeholder, icon: Icon, required, tone }) => (
                    <label key={label} className="block">
                      <span className="flex items-center gap-2 text-[11px] font-semibold text-[#64748b]">
                        <Icon size={15} className={tone === 'red' ? 'text-[#ef4444]' : tone === 'blue' ? 'text-[#3b82f6]' : 'text-[#f59e0b]'} />
                        {label}
                        {required ? <span className="text-[#ef4444]">*</span> : null}
                      </span>
                      <span className={cn('mt-2.5 flex h-11 items-center justify-between rounded-[12px] border px-3 text-[11px] text-[#94a3b8]', required ? 'border-2 border-[#ef4444]' : 'border-[#dbe3ed]')}>
                        {placeholder}
                        <ChevronDown size={15} />
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="border-t border-[#e5e7eb] bg-[#fbfcfd] p-4 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Свойства</p>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="flex items-center gap-2 text-[11px] text-[#64748b]"><Flag size={15} className="text-[#f59e0b]" />Приоритет</span>
                <span className="mt-2 flex h-11 items-center justify-between rounded-[12px] border border-[#dbe3ed] bg-white px-3 text-[12px] text-[#1f2937]">
                  <span className="inline-flex items-center gap-2"><Flag size={14} className="text-[#f59e0b]" />Средний</span>
                  <ChevronDown size={15} className="text-[#737373]" />
                </span>
              </label>

              <div>
                <span className="flex items-center gap-2 text-[11px] text-[#64748b]"><Folder size={15} />Привязка <span className="text-[#ef4444]">*</span></span>
                <div className="mt-2 flex gap-1.5">
                  {([
                    ['project', 'Проект'],
                    ['lead', 'Лид'],
                  ] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setBinding(id)} className={cn('rounded-full border px-3 py-1.5 text-[10px] font-semibold', binding === id ? 'border-[#10b981] bg-[#10b981] text-white' : 'border-[#dbe3ed] bg-white text-[#64748b]')}>
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" className="mt-2 flex h-11 w-full items-center justify-between rounded-[12px] border border-[#dbe3ed] bg-white px-3 text-[11px] text-[#94a3b8]">
                  {binding === 'project' ? 'Выберите проект' : 'Выберите лид'}
                  <ChevronDown size={15} />
                </button>
              </div>

              <label className="block">
                <span className="flex items-center gap-2 text-[11px] text-[#64748b]"><CalendarDays size={15} />Срок <span className="text-[#ef4444]">*</span></span>
                <input type="date" aria-label="Срок задачи" className="mt-2 h-11 w-full rounded-[12px] border border-[#dbe3ed] bg-white px-3 text-[11px] text-[#1f2937] outline-none" />
              </label>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function ChatWidget({
  mobile,
  onClose,
  returnFocusRef,
}: {
  mobile: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [query, setQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const filteredRooms = chatRooms.filter((room) => room.name.toLowerCase().includes(query.toLowerCase()));

  useDialogFocus(mobile, dialogRef, onClose, { initialFocusRef: closeRef, returnFocusRef });

  return (
    <motion.aside
      ref={dialogRef}
      role={mobile ? 'dialog' : undefined}
      aria-modal={mobile ? 'true' : undefined}
      aria-label="Чаты"
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      className={cn(
        'flex overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_22px_70px_-26px_rgba(15,23,42,.45)]',
        mobile
          ? 'fixed inset-2 z-[200] h-[calc(100dvh-16px)] overscroll-contain'
          : 'absolute bottom-4 right-4 top-[72px] z-40 w-[310px]',
      )}
    >
      {selectedRoom ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-[#e5e7eb] px-3">
            <button type="button" onClick={() => setSelectedRoom(null)} aria-label="Назад к чатам" className="grid h-8 w-8 place-items-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6]">
              <ChevronLeft size={16} />
            </button>
            <Avatar initials="К" violet />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[#111827]">Команда магазина</p>
              <p className="text-[8px] text-[#9ca3af]">5 участников</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть чат" className="ml-auto grid h-8 w-8 place-items-center rounded-full text-[#6b7280] hover:bg-[#f3f4f6]"><X size={15} /></button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {[
              ['Марина', 'Карточки для акции уже в работе.', '12:40'],
              ['Алексей', 'План поставки проверил, оставил комментарий.', '12:44'],
              ['Вы', 'Принято. Обсудим на короткой встрече.', '12:46'],
            ].map(([author, text, time], index) => (
              <div key={author} className={cn('flex gap-2', index === 2 ? 'flex-row-reverse' : '')}>
                <Avatar initials={author[0]} violet={index === 2} />
                <div className="max-w-[80%]">
                  <p className="text-[8px] font-semibold text-[#475569]">{author} <span className="font-normal text-[#9ca3af]">{time}</span></p>
                  <p className={cn('mt-1 rounded-[11px] px-3 py-2 text-[9px] leading-relaxed', index === 2 ? 'bg-[#3b82f6] text-white' : 'bg-[#f3f4f6] text-[#4b5563]')}>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e5e7eb] p-3">
            <div className="flex items-center rounded-[10px] bg-[#f3f4f6] p-1 pl-3">
              <input aria-label="Сообщение в чат" placeholder="Сообщение" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none" />
              <button type="button" aria-label="Отправить сообщение" className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#10b981] text-white"><Send size={13} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h3 className="text-[18px] font-bold text-[#111827]">Чаты</h3>
            <div className="flex gap-1">
              <button type="button" aria-label="Развернуть чат" className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f4f6] text-[#6b7280]"><Maximize2 size={15} /></button>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть чат" className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f4f6] text-[#6b7280]"><X size={15} /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-2">
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Поиск чатов" placeholder="Поиск" className="h-10 w-full rounded-[10px] bg-[#f3f4f6] pl-9 pr-3 text-[11px] outline-none" />
            </label>
            <button type="button" aria-label="Новый чат" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#10b981] text-white"><Edit3 size={15} /></button>
          </div>
          <div className="flex gap-4 px-5 py-2 text-[10px] font-medium text-[#9ca3af]">
            <span className="inline-flex items-center gap-1"><Users size={12} />Коллеги</span>
            <span className="inline-flex items-center gap-1"><Headphones size={12} />Поддержка</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            {filteredRooms.map((room, index) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room.id)}
                className="flex w-full items-center gap-3 rounded-[12px] p-3 text-left hover:bg-[#f9fafb]"
              >
                <span className={cn('relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-bold', room.bot ? 'bg-[#ecfdf5] text-[#10b981]' : index >= 3 ? 'bg-[#eef2ff] text-[#4f46e5]' : 'bg-[#ecfdf5] text-[#10b981]')}>
                  {room.bot ? <Bot size={18} /> : room.initials}
                  {room.bot ? <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#10b981]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold text-[#111827]">{room.name}</span>
                    {room.time ? <span className="text-[9px] text-[#9ca3af]">{room.time}</span> : null}
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-[#9ca3af]">{room.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.aside>
  );
}

export function OperationalWorkspaceDemo() {
  const [activeArea, setActiveArea] = useState<WorkspaceArea>('tasks');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<DemoTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileColumn, setMobileColumn] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const taskTriggerRef = useRef<HTMLButtonElement | null>(null);
  const chatTriggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => {
      setIsMobile(media.matches);
      if (media.matches) setChatOpen(false);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const openTask = (task: DemoTask, trigger: HTMLButtonElement) => {
    taskTriggerRef.current = trigger;
    setSelectedTask(task);
  };

  const closeTask = () => {
    setSelectedTask(null);
    window.requestAnimationFrame(() => taskTriggerRef.current?.focus());
  };

  const handleCreate = (task: DemoTask) => {
    setTasks((current) => [task, ...current]);
    setCreateOpen(false);
    setViewMode('kanban');
    setMobileColumn(0);
  };

  const selectArea = (area: WorkspaceArea) => {
    setActiveArea(area);
    setSelectedTask(null);
    setCreateOpen(false);
  };

  const taskDialog = selectedTask ? (
    <AnimatePresence>
      <TaskDialog
        task={selectedTask}
        mobile={isMobile}
        reducedMotion={reducedMotion}
        closeButtonRef={closeButtonRef}
        onClose={closeTask}
      />
    </AnimatePresence>
  ) : null;

  const createDialog = createOpen ? (
    <CreateTaskDialog mobile={isMobile} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
  ) : null;

  const chatWidget = chatOpen ? (
    <AnimatePresence>
      <ChatWidget mobile={isMobile} onClose={() => setChatOpen(false)} returnFocusRef={chatTriggerRef} />
    </AnimatePresence>
  ) : null;

  return (
    <div className="relative isolate h-[760px] overflow-hidden rounded-[24px] border border-[#e1e5ea] bg-[#f8fafc] shadow-[0_38px_100px_-58px_rgba(15,23,42,.45)] sm:h-[720px] sm:rounded-[30px]">
      <div className="flex h-full min-w-0">
        <Sidebar activeArea={activeArea} onSelect={selectArea} />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <Toolbar onOpenChat={() => setChatOpen(true)} />
          <MobileAreaNav activeArea={activeArea} onSelect={selectArea} />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:#cbd5e1_transparent]">
            {activeArea === 'tasks' ? (
              <section aria-label="Задачи команды" className="min-h-[662px] bg-[#f8fafc] p-3 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#1a1a2e] sm:text-[24px]">Управление задачами</h3>
                <p className="mt-1 hidden text-[10px] text-[#64748b] sm:block">Современная система управления проектами</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-[12px] bg-[#f1f5f9] p-1">
                  {[
                    { id: 'list' as const, label: 'Список', icon: List },
                    { id: 'kanban' as const, label: 'Канбан', icon: BarChart3 },
                    { id: 'calendar' as const, label: 'Календарь', icon: CalendarDays },
                  ].map((view) => {
                    const Icon = view.icon;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setViewMode(view.id)}
                        aria-pressed={viewMode === view.id}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[9px] font-semibold transition sm:px-3',
                          viewMode === view.id
                            ? 'bg-[#3b82f6] text-white shadow-[0_2px_8px_rgba(59,130,246,.4)]'
                            : 'text-[#64748b] hover:bg-black/[0.04]',
                        )}
                      >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{view.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] px-3 text-[9px] font-semibold text-white shadow-[0_4px_14px_rgba(59,130,246,.35)] transition hover:-translate-y-px"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Создать задачу</span>
                  <span className="sm:hidden">Создать</span>
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-[14px] border border-white/80 bg-white/70 p-2.5 shadow-[0_4px_24px_rgba(0,0,0,.06)] backdrop-blur-sm sm:grid sm:grid-cols-[1.45fr_1fr_1fr_1fr] sm:gap-2.5 sm:p-3">
              <label className="relative block">
                <span className="sr-only">Поиск задач</span>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input aria-label="Поиск задач" placeholder="Поиск задач по названию или описанию" className="h-9 w-full rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-3 text-[9px] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/10" />
              </label>
              {['Проект', 'Статус', 'Исполнитель'].map((label) => (
                <button key={label} type="button" className="hidden h-9 items-center justify-between rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[9px] text-[#64748b] sm:flex">
                  {label}
                  <ChevronDown size={12} />
                </button>
              ))}
            </div>

            <div className="mt-4">
              {viewMode === 'kanban' ? (
                <KanbanBoard tasks={tasks} onOpenTask={openTask} mobileColumn={mobileColumn} onMobileColumnChange={setMobileColumn} />
              ) : viewMode === 'calendar' ? (
                <CalendarView />
              ) : (
                <ListView tasks={tasks} onOpenTask={openTask} />
              )}
            </div>
              </section>
            ) : activeArea === 'organizer' ? (
              <OrganizerView />
            ) : activeArea === 'applications' ? (
              <ApplicationsView />
            ) : activeArea === 'reviews' ? (
              <ReviewsView />
            ) : activeArea === 'finance' ? (
              <FinanceView />
            ) : activeArea === 'seo' ? (
              <SeoView />
            ) : (
              <CoordinationView />
            )}
          </div>
        </div>
      </div>

      {!chatOpen ? (
        <button
          ref={chatTriggerRef}
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Открыть чаты"
          className="absolute bottom-4 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#10b981] text-white shadow-[0_10px_25px_rgba(16,185,129,.35)]"
        >
          <MessageCircle size={20} />
        </button>
      ) : null}

      {selectedTask && isMobile ? createPortal(taskDialog, document.body) : taskDialog}
      {createOpen && isMobile ? createPortal(createDialog, document.body) : createDialog}
      {chatOpen && isMobile ? createPortal(chatWidget, document.body) : chatWidget}

      <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white/90 px-3 py-1 text-[7px] font-medium text-[#94a3b8] shadow-sm backdrop-blur sm:flex">
        <Shield size={10} className="text-[#10b981]" />
        Демо-данные изменены
      </div>
    </div>
  );
}
