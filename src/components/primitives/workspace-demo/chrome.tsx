import {
  BarChart3,
  Bell,
  CheckSquare,
  ChevronDown,
  Inbox,
  Landmark,
  Map,
  Menu,
  MessageCircle,
  Package,
  Rss,
  Search,
  SearchCheck,
  Settings,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { WorkspaceArea } from './data';
import { Avatar, ProductMark } from './shared';

type SidebarItem = {
  label: string;
  icon: LucideIcon;
  area?: WorkspaceArea;
};

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

export function Sidebar({
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

export function Toolbar({ onOpenChat }: { onOpenChat: () => void }) {
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

export function MobileAreaNav({
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
