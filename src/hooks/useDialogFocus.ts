import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useDialogFocus<T extends HTMLElement>(
  open: boolean,
  dialogRef: RefObject<T | null>,
  onClose: () => void,
  options: {
    inertApp?: boolean;
    lockScroll?: boolean;
    initialFocusRef?: RefObject<HTMLElement | null>;
    returnFocusRef?: RefObject<HTMLElement | null>;
  } = {},
) {
  const { inertApp = true, lockScroll = true, initialFocusRef, returnFocusRef } = options;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const appRoot = document.getElementById('root');
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    if (inertApp) {
      appRoot?.setAttribute('inert', '');
      appRoot?.setAttribute('aria-hidden', 'true');
    }
    if (lockScroll) document.body.style.overflow = 'hidden';

    const getFocusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      );

    const focusFrame = window.requestAnimationFrame(() => {
      const [first] = getFocusable();
      (initialFocusRef?.current ?? first ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      if (inertApp) {
        appRoot?.removeAttribute('inert');
        appRoot?.removeAttribute('aria-hidden');
      }
      if (lockScroll) document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => {
        // Нам нужен актуальный ref после повторного рендера: триггер чата монтируется заново при закрытии.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (returnFocusRef?.current ?? previouslyFocused)?.focus();
      });
    };
  }, [dialogRef, inertApp, initialFocusRef, lockScroll, open, returnFocusRef]);
}
