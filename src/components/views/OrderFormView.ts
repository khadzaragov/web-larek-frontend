import { cloneTemplate, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class OrderFormView {
  private element: HTMLElement;

  constructor(
    private step1Template: HTMLTemplateElement,
    private step2Template: HTMLTemplateElement,
    private bus: EventEmitter
  ) {
    this.element = document.createElement('div');
  }

  renderStep1(): void {
    const step = cloneTemplate<HTMLElement>(this.step1Template);
    this.element.replaceChildren(step);
    ensureElement('form', step).addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:step1');
    });
  }

  renderStep2(): void {
    const step = cloneTemplate<HTMLElement>(this.step2Template);
    this.element.replaceChildren(step);
    ensureElement('form', step).addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:step2');
    });
  }

  getStep1Data(): { payment: 'card' | 'cash'; address: string } {
    const form = ensureElement<HTMLFormElement>('form', this.element);
    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    const payment =
      (form.elements.namedItem('card') as HTMLButtonElement).classList.contains('button_active')
        ? 'card'
        : 'cash';
    return { payment, address };
  }

  getStep2Data(): { email: string; phone: string } {
    const form = ensureElement<HTMLFormElement>('form', this.element);
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    return { email, phone };
  }

  onNext(callback: () => void): void {
    const btn = this.element.querySelector('.order__button') as HTMLButtonElement;
    if (btn) btn.addEventListener('click', callback);
  }

  onSubmit(callback: () => void): void {
    const btn = this.element.querySelector('button[type=\"submit\"]') as HTMLButtonElement;
    if (btn) btn.addEventListener('click', callback);
  }

  showErrors(errors: string[]): void {
    const errBlock = this.element.querySelector('.form__errors');
    if (errBlock) errBlock.textContent = errors.join('; ');
  }

  get content(): HTMLElement {
    return this.element;
  }
}