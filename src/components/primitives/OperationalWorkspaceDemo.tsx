import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, Shield } from 'lucide-react';
import { ApplicationsView } from './workspace-demo/ApplicationsView';
import { ChatWidget } from './workspace-demo/ChatWidget';
import { CoordinationView } from './workspace-demo/CoordinationView';
import { FinanceView } from './workspace-demo/FinanceView';
import { OrganizerView } from './workspace-demo/OrganizerView';
import { ReviewsView } from './workspace-demo/ReviewsView';
import { SeoView } from './workspace-demo/SeoView';
import { TasksArea } from './workspace-demo/TasksArea';
import { MobileAreaNav, Sidebar, Toolbar } from './workspace-demo/chrome';
import { CreateTaskDialog, TaskDialog } from './workspace-demo/dialogs';
import {
  initialTasks,
  type DemoTask,
  type ViewMode,
  type WorkspaceArea,
} from './workspace-demo/data';

export function OperationalWorkspaceDemo() {
  const [activeArea, setActiveArea] = useState<WorkspaceArea>('finance');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<DemoTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
              <TasksArea
                tasks={tasks}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onCreateTask={() => setCreateOpen(true)}
                onOpenTask={openTask}
                mobileColumn={mobileColumn}
                onMobileColumnChange={setMobileColumn}
              />
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
