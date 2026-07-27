type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isEditableElement(target: EventTarget | null): target is EditableElement {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
    return false;
  }

  return !target.disabled && (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) || !target.readOnly);
}

function focusEditable(event: Event) {
  const target = event.target;
  if (!isEditableElement(target)) {
    return;
  }

  if (document.activeElement === target) {
    target.blur();
  }

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

export function installMobileInputFocusFix() {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  document.addEventListener('touchend', focusEditable, { capture: true, passive: true });
}