import { EventEmitter } from '../components/base/events';
import { OrderForm } from '../types';

export class OrderModel {
  payment: 'card' | 'cash' = 'card';
  address = '';
  email = '';
  phone = '';

  constructor(private bus: EventEmitter) {}

  isValidStep1(): boolean {
    return this.address.trim() !== '';
  }

  isValidStep2(): boolean {
    return this.email.trim() !== '' && this.phone.trim() !== '';
  }

  getData(): OrderForm {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
      items: []        // заполняется контроллером
    };
  }
}