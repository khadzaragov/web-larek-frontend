import { EventEmitter } from './base/events';
import { ApiClient } from './ApiClient';
import { CartModel } from '../models/CartModel';
import { OrderModel } from '../models/OrderModel';
import {
  MainPageView,
  ModalView,
  ProductCardView,
  CartView,
  OrderFormView,
} from './views';
import { Product } from '../types';

export class AppController {
  private products: Product[] = [];

  constructor(
    private mainView: MainPageView,
    private modalView: ModalView,
    private cartView: CartView,
    private orderView: OrderFormView,
    private cartModel: CartModel,
    private orderModel: OrderModel,
    private api: ApiClient,
    private bus: EventEmitter
  ) {}

  init(): void {
    this.bus.on<{ id: string }>('product:open', ({ id }) =>
      this.handleProductClick(id)
    );

    this.bus.on<{ product: Product }>('cart:add', ({ product }) =>
      this.cartModel.addItem(product)
    );

    this.bus.on<{ id: string }>('cart:remove', ({ id }) =>
      this.cartModel.removeItem(id)
    );

    this.bus.on('cart:changed', () => {
      this.mainView.updateCartCounter(this.cartModel.items.length);
      this.updateCartView();
    });

    this.bus.on('cart:open', () => this.handleCartOpen());

    this.bus.on('order:step1', () => this.handleOrderStep1());

    this.orderView.onNext(() => this.handleStep1Next());

    this.bus.on('order:step2', () => this.handleOrderStep2());

    this.bus.on('modal:close', () => this.modalView.close());

    this.updateCartView();
    this.loadCatalog();
  }

  private async loadCatalog() {
    try {
      const products = await this.api.getProducts();
      this.products = products;

      const cards = products.map((p) => {
        const tpl = document.getElementById('card-catalog') as HTMLTemplateElement;
        const view = new ProductCardView(tpl, this.bus);
        return view.render(p);
      });

      this.mainView.renderCatalog(cards);
    } catch (error) {
      console.error('Ошибка при загрузке каталога:', error);
    }
  }

  private async handleProductClick(id: string) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      console.warn(`Товар с id "${id}" не найден в локальном списке.`);
      return;
    }

    const tpl = document.getElementById('card-preview') as HTMLTemplateElement;
    const view = new ProductCardView(tpl, this.bus);
    this.modalView.render(view.render(product));
    this.modalView.open();
  }

  private handleCartOpen() {
    this.modalView.render(this.cartView.element);
    this.modalView.open();
  }

  private handleOrderStep1() {
    this.orderView.renderStep1();
    this.modalView.render(this.orderView.element);
    this.modalView.open();
  }

  private handleStep1Next() {
    const data = this.orderView.getStep1Data();
    this.orderModel.payment = data.payment;
    this.orderModel.address = data.address;

    if (this.orderModel.isValidStep1()) {
      this.orderView.renderStep2();
    } else {
      this.orderView.showErrors(['Заполните адрес доставки']);
    }
  }

  private handleOrderStep2() {
    const data = this.orderView.getStep2Data();
    this.orderModel.email = data.email;
    this.orderModel.phone = data.phone;

    if (this.orderModel.isValidStep2()) {
      this.handleOrderSubmit();
    } else {
      this.orderView.showErrors(['Заполните контактные данные']);
    }
  }

  private handleOrderSubmit() {
  const order = this.orderModel.getData();
  order.items = this.cartModel.items.map((i) => i.product.id);

  const total = this.cartModel.getTotalPrice();
  const fullOrder = { ...order, total };

  this.api.postOrder(fullOrder)
    .then(() => {
      this.bus.emit('order:submit');
    })
    .catch((error) => {
      console.error('Ошибка при отправке заказа:', error);
    });
  }

  private updateCartView() {
    const elements = this.cartModel.items.map((item, index) => {
      const tpl = document.getElementById('card-basket') as HTMLTemplateElement;
      const view = new ProductCardView(tpl, this.bus);
      const card = view.render(item.product);
      card.querySelector('.basket__item-index')!.textContent = String(index + 1);
      return card;
    });

    const total = this.cartModel.getTotalPrice();
    this.cartView.render(elements, total);
  }
}