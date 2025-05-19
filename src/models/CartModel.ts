import { ICartItem, Product } from '../types';
import { EventEmitter } from '../components/base/events';

export class CartModel {
  public items: ICartItem[] = [];

  constructor(private bus: EventEmitter) {}

  addItem(product: Product): void {
    const item = this.items.find((i) => i.product.id === product.id);
    if (item) {
      item.quantity += 1;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.bus.emit('cart:changed', { items: this.items });
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((i) => i.product.id !== productId);
    this.bus.emit('cart:changed', { items: this.items });
  }

  clear(): void {
    this.items = [];
    this.bus.emit('cart:changed', { items: this.items });
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
  }
}