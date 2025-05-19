import { cloneTemplate, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class OrderFormView {
  public element: HTMLElement;

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

    // обработка выбора способа оплаты
    const buttons = form.querySelectorAll<HTMLButtonElement>('.button_alt');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('button_active'));
        btn.classList.add('button_active');
      });
    });

    // отправка формы по кнопке "Далее"
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:step2');
    });
  }

  // Рендер второго шага (контакты)
  renderStep2(): void {
    const form = cloneTemplate<HTMLFormElement>(this.step2Template);
    this.element.replaceChildren(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.bus.emit('order:submit');
    });
  }

  // Сбор данных первого шага
  getStep1Data(): { payment: 'card' | 'cash'; address: string } {
    const form = ensureElement<HTMLFormElement>('form', this.element);
    const address = (form.elements.namedItem('address') as HTMLInputElement).value;

    const payment =
      (form.elements.namedItem('card') as HTMLButtonElement)?.classList.contains('button_active')
        ? 'card'
        : 'cash';

    return { payment, address };
  }

  // Сбор данных второго шага
  getStep2Data(): { email: string; phone: string } {
    const form = ensureElement<HTMLFormElement>('form', this.element);
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
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

  // Показ ошибок
  showErrors(errors: string[]): void {
    const errBlock = this.element.querySelector('.form__errors');
    if (errBlock) errBlock.textContent = errors.join('; ');
  }

  // Геттер для внешнего доступа к текущему DOM
  get content(): HTMLElement {
    return this.element;
  }
}