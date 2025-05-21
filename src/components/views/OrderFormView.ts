import { cloneTemplate, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class OrderFormView {
  public element: HTMLElement;

  private selectedPayment?: 'card' | 'cash';
  private addressInput?: HTMLInputElement;
  private nextButton?: HTMLButtonElement;

  constructor(
    private step1Template: HTMLTemplateElement,
    private step2Template: HTMLTemplateElement,
    private bus: EventEmitter
  ) {
    this.element = document.createElement('div');
  }

  // Рендер первого шага (оплата и адрес)
  renderStep1(): void {
    const form = cloneTemplate<HTMLFormElement>(this.step1Template);
    this.element.replaceChildren(form);

    const buttons = form.querySelectorAll<HTMLButtonElement>('.order__buttons .button');
    this.addressInput = form.querySelector('input[name="address"]') ?? undefined;
    this.nextButton = form.querySelector('.order__button') ?? undefined;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('button_alt-active'));
        btn.classList.add('button_alt-active');
        this.selectedPayment = btn.name as 'card' | 'cash';
        this.validateStep1();
      });
    });

    this.addressInput?.addEventListener('input', () => this.validateStep1());
    this.validateStep1(); // проверка на старте

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:step2');
    });
  }

  // Рендер второго шага (контакты)
  renderStep2(): void {
    const form = cloneTemplate<HTMLFormElement>(this.step2Template);
    this.element.replaceChildren(form);

    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement | null;
    const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement | null;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;

    const validate = () => {
      const email = emailInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneValid = /^\+7\s?\(?\d{3}\)?\s?\d{3}[- ]?\d{2}[- ]?\d{2}$/.test(phone);

      if (submitButton) {
        submitButton.disabled = !(emailValid && phoneValid);
      }
    };

    emailInput?.addEventListener('input', validate);
    phoneInput?.addEventListener('input', validate);
    validate();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:step2');
    });
  }

  // Валидация первого шага
  private validateStep1(): void {
    const addressValid = this.addressInput?.value.trim().length > 0;
    const paymentValid = this.selectedPayment === 'card' || this.selectedPayment === 'cash';
    if (this.nextButton) {
      this.nextButton.disabled = !(addressValid && paymentValid);
    }
  }

  // Сбор данных первого шага
  getStep1Data(): { payment: 'card' | 'cash'; address: string } {
    if (!this.selectedPayment) {
      throw new Error('Способ оплаты не выбран');
    }

    const address = this.addressInput?.value.trim() || '';
    return {
      payment: this.selectedPayment,
      address
    };
  }

  // Сбор данных второго шага
  getStep2Data(): { email: string; phone: string } {
    const form = ensureElement<HTMLFormElement>('form', this.element);
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim() || '';
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value.trim() || '';
    return { email, phone };
  }

  // Обработка кнопки "Далее"
  onNext(callback: () => void): void {
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('.order__button')) {
        e.preventDefault();
        callback();
      }
    });
  }

  // Обработка кнопки "Оплатить"
  onSubmit(callback: () => void): void {
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      callback();
    });
  }

  showErrors(errors: string[]): void {
    const errBlock = this.element.querySelector('.form__errors');
    if (errBlock) {
      errBlock.textContent = errors.join('; ');
    }
  }

  get content(): HTMLElement {
    return this.element;
  }
}