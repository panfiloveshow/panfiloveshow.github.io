import { useRef, useState, type FormEvent, type RefObject } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  Eye,
  Flag,
  Folder,
  Image,
  Link2,
  Paperclip,
  Plus,
  Tag,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { statusMeta, type DemoTask } from './data';
import { Avatar } from './shared';

export function TaskDialog({
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

export function CreateTaskDialog({
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
