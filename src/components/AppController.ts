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
import { Product, ICartItem } from '../types';

export class AppController {
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
    this.bus.on<{ items: ICartItem[] }>('cart:changed', ({ items }) => {
      this.mainView.updateCartCounter(items.length);
      this.cartView.render(items);
    });

    this.bus.on('cart:open', () => this.handleCartOpen());

    // 📌 Новый: открытие первого шага формы
    this.bus.on('order:step1', () => this.handleOrderStep1());

    // 📌 Новый: обработка кнопки "Далее"
    this.orderView.onNext(() => this.handleStep1Next());

    // 📌 Уже было: обработка второго шага
    this.bus.on('order:step2', () => this.handleOrderStep2());

    this.bus.on('modal:close', () => this.modalView.close());

    this.loadCatalog();
  }

  private async loadCatalog() {
    const products = await this.api.getProducts();
    const cards = products.map((p) => {
      const tpl = document.getElementById('card-catalog') as HTMLTemplateElement;
      const view = new ProductCardView(tpl, this.bus);
      return view.render(p);
    });
    this.mainView.renderCatalog(cards);
  }

  private async handleProductClick(id: string) {
    const product = (await this.api.getProducts()).find((p) => p.id === id);
    if (!product) return;
    const tpl = document.getElementById('card-preview') as HTMLTemplateElement;
    const view = new ProductCardView(tpl, this.bus);
    this.modalView.render(view.render(product));
    this.modalView.open();
  }

  private handleCartOpen() {
    this.modalView.render(this.cartView.element);
    this.modalView.open();
  }

  // 📌 Только открывает первый шаг формы, ничего не проверяет
  private handleOrderStep1() {
    this.orderView.renderStep1(); // показать форму оплаты и адреса
    this.modalView.render(this.orderView.element); // вставить в модалку
    this.modalView.open(); // открыть окно
  }

  // 📌 Обрабатываем нажатие кнопки "Далее"
  private handleStep1Next() {
    const data = this.orderView.getStep1Data();
    this.orderModel.payment = data.payment;
    this.orderModel.address = data.address;

    if (this.orderModel.isValidStep1()) {
      this.orderView.renderStep2(); // перейти ко второму шагу
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
    this.api.postOrder(order).then(() => {
      this.cartModel.clear();
      this.modalView.close();
    });
  }
}