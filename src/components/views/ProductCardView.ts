import { Product } from '../../types';
import { cloneTemplate } from '../../utils/utils';
import { EventEmitter } from '../base/events';

// Сопоставление текстовых категорий с CSS-классами
const CATEGORY_CLASS_MAP: Record<string, string> = {
  'софт-скил': 'soft',
  'хард-скил': 'hard',
  'другое': 'other',
  'дополнительное': 'additional',
  'кнопка': 'button'
};

export class ProductCardView {
  private element!: HTMLElement;

  constructor(
    private template: HTMLTemplateElement,
    private bus: EventEmitter
  ) {}

  render(product: Product): HTMLElement {
    this.element = cloneTemplate<HTMLElement>(this.template);

    // Название
    const title = this.element.querySelector('.card__title');
    if (title) title.textContent = product.title;

    // Цена
    const price = this.element.querySelector('.card__price');
    if (price) {
      price.textContent = product.price != null ? `${product.price} синапсов` : 'Бесценно';
    }

    // Картинка
    const image = this.element.querySelector<HTMLImageElement>('.card__image');
    if (image && product.image) {
      image.src = `https://larek-api.nomoreparties.co/content/weblarek/${product.image}`;
    }

    // Описание
    const description = this.element.querySelector('.card__text');
    if (description && product.description) {
      description.textContent = product.description;
    }

    // Категория + цвет
    const category = this.element.querySelector('.card__category');
    if (category && product.category) {
      category.textContent = product.category;

      const normalized = product.category.toLowerCase().trim();
      const classKey = CATEGORY_CLASS_MAP[normalized];
      if (classKey) {
        category.className = `card__category card__category_${classKey}`;
      } else {
        category.className = 'card__category';
      }
    }

    // Открытие карточки
    this.element.addEventListener('click', () =>
      this.bus.emit('product:open', { id: product.id })
    );

    // Кнопка удаления из корзины или добавления в корзину
    const deleteBtn = this.element.querySelector<HTMLButtonElement>('.basket__item-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.bus.emit('cart:remove', { id: product.id });
      });
    } else {
      const button = this.element.querySelector('.card__button') as HTMLButtonElement | null;
      if (button) {
        if (product.price == null) {
          button.disabled = true; // блокируем кнопку
        } else {
          button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.bus.emit('cart:add', { product });
            this.bus.emit('modal:close');
          });
        }
      }
    }

    return this.element;
  }

  setSelected(state: boolean): void {
    this.element.classList.toggle('card_selected', state);
  }
}