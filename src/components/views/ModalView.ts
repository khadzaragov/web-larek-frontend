import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class ModalView {
  private content: HTMLElement;

  constructor(private container: HTMLElement, private bus: EventEmitter) {
    this.content = ensureElement('.modal__content', this.container);

    ensureElement('.modal__close', this.container).addEventListener(
      'click',
      () => this.bus.emit('modal:close')
    );
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.bus.emit('modal:close');
      }
    });
  }

  render(content: HTMLElement): void {
    this.content.replaceChildren(content);
  }

  open(): void {
    this.container.classList.add('modal_active');
  }

  close(): void {
    this.container.classList.remove('modal_active');
  }
}