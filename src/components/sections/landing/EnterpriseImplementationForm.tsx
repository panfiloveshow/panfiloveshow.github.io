import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Check,
  Mail,
  Phone,
  Puzzle,
  Store,
  Users2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import {
  PERSONAL_DATA_CONSENT_VERSION,
  PERSONAL_DATA_CONSENT_PATH,
  PERSONAL_DATA_CONSENT_URL,
  PRIVACY_POLICY_PATH,
  PRIVACY_POLICY_URL,
  PRIVACY_POLICY_VERSION,
} from '@/lib/legal';

type EnterpriseLead = {
  name: string;
  email: string;
  contact: string;
  company: string;
  teamSize: string;
  stores: string;
  marketplaces: string[];
  goal: string;
};

const EMPTY_ENTERPRISE_LEAD: EnterpriseLead = {
  name: '',
  email: '',
  contact: '',
  company: '',
  teamSize: '',
  stores: '',
  marketplaces: [],
  goal: '',
};

export function EnterpriseImplementationForm({ onClose }: { onClose: () => void }) {
  const [lead, setLead] = useState<EnterpriseLead>(EMPTY_ENTERPRISE_LEAD);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(true, dialogRef, onClose);

  const updateField = (field: keyof EnterpriseLead, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const toggleMarketplace = (marketplace: string) => {
    setLead((current) => ({
      ...current,
      marketplaces: current.marketplaces.includes(marketplace)
        ? current.marketplaces.filter((item) => item !== marketplace)
        : [...current.marketplaces, marketplace],
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lead.name.trim() || !lead.company.trim()) {
      setError('Укажите ваше имя и компанию.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) {
      setError('Введите корректный рабочий email.');
      return;
    }
    if (!lead.goal.trim()) {
      setError('Коротко опишите задачу внедрения.');
      return;
    }
    if (!consent) {
      setError('Подтвердите согласие на обработку данных.');
      return;
    }

    const message = [
      'Запрос на внедрение Sellico Enterprise',
      '',
      `Имя: ${lead.name.trim()}`,
      `Компания: ${lead.company.trim()}`,
      `Рабочий email: ${lead.email.trim()}`,
      `Телефон или Telegram: ${lead.contact.trim() || 'не указан'}`,
      `Команда: ${lead.teamSize || 'не указано'}`,
      `Магазины: ${lead.stores || 'не указано'}`,
      `Маркетплейсы: ${lead.marketplaces.join(', ') || 'не указаны'}`,
      '',
      'Задача внедрения:',
      lead.goal.trim(),
      '',
      'Согласие на обработку персональных данных: да',
      `Дата согласия: ${new Date().toISOString()}`,
      `Версия согласия: ${PERSONAL_DATA_CONSENT_VERSION}`,
      `Версия политики: ${PRIVACY_POLICY_VERSION}`,
      `Согласие: ${PERSONAL_DATA_CONSENT_URL}`,
      `Политика: ${PRIVACY_POLICY_URL}`,
    ].join('\n');

    track('lead_submit', { source: 'enterprise_implementation' });
    window.location.href = `mailto:hello@sellico.ru?subject=${encodeURIComponent('Внедрение Sellico Enterprise')}&body=${encodeURIComponent(message)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#041d14]/70 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-form-title"
        aria-describedby="enterprise-form-description"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto grid max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white shadow-[0_40px_120px_-35px_rgba(0,25,16,.75)] sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[0.78fr_1.22fr] lg:overflow-hidden"
      >
        <button
          type="button"
          aria-label="Закрыть форму"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 bg-white/90 text-ink-700 shadow-sm transition hover:bg-white hover:text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:right-5 sm:top-5"
        >
          <X size={19} />
        </button>

        <aside className="relative isolate overflow-hidden bg-[#09271c] px-6 pb-8 pt-16 text-white sm:px-9 sm:pb-10 sm:pt-20 lg:px-10 lg:py-12">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_8%,rgba(105,229,174,.3),transparent_34%),radial-gradient(circle_at_5%_90%,rgba(75,177,130,.2),transparent_38%)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Sellico Enterprise</p>
          <h2 id="enterprise-form-title" className="mt-4 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-4xl">
            Обсудим внедрение под ваш бизнес
          </h2>
          <p id="enterprise-form-description" className="mt-5 max-w-sm text-sm leading-relaxed text-white/62">
            Расскажите о текущем масштабе и задаче. Мы подготовим сценарий запуска, состав интеграций и условия сопровождения.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [Store, 'Магазины и кабинеты', 'Учтём все площадки и юрлица'],
              [Users2, 'Команда и роли', 'Настроим доступы и процессы'],
              [Puzzle, 'Интеграции', 'Соберём нужный контур данных'],
            ].map(([Icon, title, description]) => (
              <div key={title as string} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-300/12 text-emerald-300">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title as string}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-white/72">{description as string}</span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-white/70">
            Обычно отвечаем в течение рабочего дня.
          </p>
        </aside>

        <form onSubmit={submit} className="px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:px-10 lg:pb-10 lg:pt-12">
          <div className="pr-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Запрос на консультацию</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink-950">Несколько деталей о проекте</h3>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Ваше имя <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Users2 aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  autoFocus
                  required
                  value={lead.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Как к вам обращаться"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Компания <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Building2 aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  required
                  value={lead.company}
                  onChange={(event) => updateField('company', event.target.value)}
                  placeholder="Название компании"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Рабочий email <span className="sr-only">(обязательно)</span>
              <span className="relative">
                <Mail aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  required
                  type="email"
                  inputMode="email"
                  value={lead.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="name@company.ru"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Телефон или Telegram
              <span className="relative">
                <Phone aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
                <input
                  value={lead.contact}
                  onChange={(event) => updateField('contact', event.target.value)}
                  placeholder="+7 или @username"
                  className="h-12 w-full rounded-xl border border-ink-950/10 bg-[#f8faf9] pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Размер команды
              <select
                value={lead.teamSize}
                onChange={(event) => updateField('teamSize', event.target.value)}
                className="h-12 rounded-xl border border-ink-950/10 bg-[#f8faf9] px-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">Выберите</option>
                <option>1–5 человек</option>
                <option>6–20 человек</option>
                <option>21–50 человек</option>
                <option>Больше 50</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-ink-800">
              Количество магазинов
              <select
                value={lead.stores}
                onChange={(event) => updateField('stores', event.target.value)}
                className="h-12 rounded-xl border border-ink-950/10 bg-[#f8faf9] px-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">Выберите</option>
                <option>1–3 магазина</option>
                <option>4–10 магазинов</option>
                <option>11–30 магазинов</option>
                <option>Больше 30</option>
              </select>
            </label>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink-800">Маркетплейсы</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Wildberries', 'Ozon', 'Яндекс Маркет', 'Другие'].map((marketplace) => {
                const selected = lead.marketplaces.includes(marketplace);
                return (
                  <button
                    key={marketplace}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleMarketplace(marketplace)}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      selected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-950/10 bg-[#f8faf9] text-ink-600 hover:border-brand-500/40 hover:text-brand-800',
                    )}
                  >
                    {selected && <Check className="mr-1 inline" size={13} strokeWidth={3} />}
                    {marketplace}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="mt-5 grid gap-1.5 text-sm font-medium text-ink-800">
            Что нужно внедрить? <span className="sr-only">(обязательно)</span>
            <textarea
              required
              rows={4}
              value={lead.goal}
              onChange={(event) => updateField('goal', event.target.value)}
              placeholder="Например: объединить 12 магазинов, настроить финансовую аналитику и работу команды…"
              className="min-h-28 resize-y rounded-xl border border-ink-950/10 bg-[#f8faf9] px-4 py-3 text-sm leading-relaxed text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
            <span className="text-xs font-normal text-ink-400">Не указывайте сведения о здоровье и другие специальные категории персональных данных.</span>
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-500">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setError('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#16865d]"
            />
            <span>
              Я даю <a href={PERSONAL_DATA_CONSENT_PATH} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline-offset-2 hover:underline">согласие на обработку персональных данных</a> (версия {PERSONAL_DATA_CONSENT_VERSION}) и ознакомлен с <a href={PRIVACY_POLICY_PATH} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline-offset-2 hover:underline">политикой</a> (версия {PRIVACY_POLICY_VERSION}).
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" className="w-full rounded-xl sm:w-auto" iconRight={<ArrowRight size={17} />}>
              Отправить запрос
            </Button>
            <p className="text-xs leading-relaxed text-ink-600">
              Откроем почту с уже заполненной заявкой.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
