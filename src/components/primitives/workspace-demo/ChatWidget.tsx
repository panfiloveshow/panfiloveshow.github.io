import { useRef, useState, type RefObject } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  ChevronLeft,
  Edit3,
  Headphones,
  Maximize2,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { chatRooms } from './data';
import { Avatar } from './shared';

export function ChatWidget({
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
