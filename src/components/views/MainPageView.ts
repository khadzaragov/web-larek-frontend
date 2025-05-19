import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class MainPageView {
  private counter: HTMLElement;

  constructor(
    private root: HTMLElement,
    private bus: EventEmitter
  ) {
    this.counter = ensureElement('.header__basket-counter');
    ensureElement('.header__basket').addEventListener('click', () =>
      this.bus.emit('cart:open')
    );
  }

  renderCatalog(cards: HTMLElement[]): void {
    this.root.replaceChildren(...cards);
  }

  updateCartCounter(count: number): void {
    this.counter.textContent = String(count);
  }
}