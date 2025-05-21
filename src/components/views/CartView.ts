import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class CartView {
  private list: HTMLElement;
  private price: HTMLElement;
  private button: HTMLButtonElement;

  constructor(
    private template: HTMLTemplateElement,
    private bus: EventEmitter
  ) {
    const root = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
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

  render(elements: HTMLElement[], total: number): void {
    this.list.replaceChildren(...elements);
    this.price.textContent = `${total} синапсов`;
    this.button.disabled = elements.length === 0;
  }
}
