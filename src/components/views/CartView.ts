import { ICartItem } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class CartView {
  private list: HTMLElement;
  private price: HTMLElement;
  private button: HTMLButtonElement;

  constructor(
    private template: HTMLTemplateElement,
    private itemTemplate: HTMLTemplateElement,
    private bus: EventEmitter
  ) {
    const root = cloneTemplate<HTMLElement>(template);
    this.list = ensureElement('.basket__list', root);
    this.price = ensureElement('.basket__price', root);
    this.button = ensureElement<HTMLButtonElement>('.basket__button', root);

    this.button.addEventListener('click', (event) => {
    if (this.button.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
    }

    this.bus.emit('order:step1');
    });
    this.element = root;
    }

  element: HTMLElement;

  render(items: ICartItem[]): HTMLElement {
  const elements = items.map((item, index) => {
    const el = cloneTemplate<HTMLElement>(this.itemTemplate);
    ensureElement('.basket__item-index', el).textContent = String(index + 1);
    ensureElement('.card__title', el).textContent = item.product.title;
    ensureElement('.card__price', el).textContent =
      `${item.product.price * item.quantity} синапсов`;
    ensureElement('.basket__item-delete', el).addEventListener(
      'click',
      () => this.bus.emit('cart:remove', { id: item.product.id })
    );
    return el;
  });

  this.list.replaceChildren(...elements);

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  this.price.textContent = `${total} синапсов`;

  // 🔒 Делаем кнопку "Оформить" неактивной, если корзина пуста
  this.button.disabled = items.length === 0;

  return this.element;
}
}