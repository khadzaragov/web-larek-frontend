import { Product } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class ProductCardView {
  private element!: HTMLElement;

  constructor(
    private template: HTMLTemplateElement,
    private bus: EventEmitter
  ) {}

  render(product: Product): HTMLElement {
    this.element = cloneTemplate<HTMLElement>(this.template);
    ensureElement('.card__title', this.element).textContent = product.title;
    ensureElement('.card__price', this.element).textContent =
      `${product.price} синапсов`;
    ensureElement<HTMLImageElement>(
    '.card__image',
    this.element
    ).src = `https://larek-api.nomoreparties.co/content/weblarek/${product.image}`;


    this.element.addEventListener('click', () =>
      this.bus.emit('product:open', { id: product.id })
    );

    const button = this.element.querySelector(
      '.card__button'
    ) as HTMLButtonElement | null;
    if (button) {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.bus.emit('cart:add', { product });
      });
    }
    return this.element;
  }

  setSelected(state: boolean): void {
    this.element.classList.toggle('card_selected', state);
  }
}