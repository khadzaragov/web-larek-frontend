import { EventEmitter } from './base/events';
import { ApiClient } from './ApiClient';
import { CartModel } from '../models/CartModel';
import { OrderModel } from '../models/OrderModel';
import { MainPageView, ModalView, ProductCardView, CartView, OrderFormView } from './views';
import { Product } from '../types';

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
    this.bus.on('product:open', ({ id }) => this.handleProductClick(id));
    this.bus.on('cart:add', ({ product }) => this.cartModel.addItem(product));
    this.bus.on('cart:remove', ({ id }) => this.cartModel.removeItem(id));
    this.bus.on('cart:changed', ({ items }) => {
      this.mainView.updateCartCounter(items.length);
      this.cartView.render(items);
    });
    this.bus.on('order:submit', () => this.handleOrderSubmit());
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

  private handleOrderSubmit() {
    const order = this.orderModel.getData();
    order.items = this.cartModel.items.map((i) => i.product.id);
    this.api.postOrder(order).then(() => {
      this.cartModel.clear();
      this.modalView.close();
    });
  }
}