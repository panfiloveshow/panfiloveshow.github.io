import {
  CheckCircle2,
  CheckSquare,
  Clock3,
  Play,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

export type ViewMode = 'list' | 'kanban' | 'calendar';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';
export type WorkspaceArea = 'tasks' | 'organizer' | 'applications' | 'reviews' | 'coordination' | 'finance' | 'seo';

export type DemoTask = {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  due: string;
  status: TaskStatus;
  wasOverdue?: boolean;
};

export type StatusMeta = {
  label: string;
  color: string;
  soft: string;
  border: string;
  icon: LucideIcon;
};

export const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'review', 'completed', 'overdue'];

export const statusMeta: Record<TaskStatus, StatusMeta> = {
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

export const initialTasks: DemoTask[] = [
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

export const chatRooms = [
  { id: 'selya', name: 'Селя', subtitle: 'Остатки, экономика, дефициты', initials: 'AI', bot: true },
  { id: 'marina', name: 'Марина', subtitle: 'Личный диалог', initials: 'М', time: '13:00' },
  { id: 'alexey', name: 'Алексей', subtitle: 'Личный диалог', initials: 'А', time: '13:16' },
  { id: 'team', name: 'Команда магазина', subtitle: 'Групповой чат', initials: 'К', time: '16:18' },
  { id: 'content', name: 'Контент и реклама', subtitle: 'Групповой чат', initials: 'К', time: '12:35' },
];

export const calendarWeeks = [
  ['29', '30', '1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10', '11', '12'],
  ['13', '14', '15', '16', '17', '18', '19'],
];

export const calendarEvents: Record<string, string[]> = {
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

