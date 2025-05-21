import { Product, ICartItem } from '../types';
import { EventEmitter } from '../components/base/events';

export class CartModel {
  public items: ICartItem[] = [];

  constructor(private events: EventEmitter) {}

  addItem(product: Product): void {
    const existing = this.items.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.events.emit('cart:changed', { items: this.items });
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((item) => item.product.id !== productId);
    this.events.emit('cart:changed', { items: this.items });
  }

  clear(): void {
    this.items = [];
    this.events.emit('cart:changed', { items: this.items });
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}