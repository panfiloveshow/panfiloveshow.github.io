import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  calendarEvents,
  calendarWeeks,
  statusMeta,
  statusOrder,
  type DemoTask,
  type TaskStatus,
  type ViewMode,
} from './data';
import { Avatar } from './shared';

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

export function TasksArea({
  tasks,
  viewMode,
  onViewModeChange,
  onCreateTask,
  onOpenTask,
  mobileColumn,
  onMobileColumnChange,
}: {
  tasks: DemoTask[];
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
  onCreateTask: () => void;
  onOpenTask: (task: DemoTask, trigger: HTMLButtonElement) => void;
  mobileColumn: number;
  onMobileColumnChange: (index: number) => void;
}) {
  return (
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
                  onClick={() => onViewModeChange(view.id)}
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
            onClick={onCreateTask}
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
          <KanbanBoard tasks={tasks} onOpenTask={onOpenTask} mobileColumn={mobileColumn} onMobileColumnChange={onMobileColumnChange} />
        ) : viewMode === 'calendar' ? (
          <CalendarView />
        ) : (
          <ListView tasks={tasks} onOpenTask={onOpenTask} />
        )}
      </div>
    </section>
  );
}
