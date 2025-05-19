import { Api } from './base/api';
import { Product, OrderForm, IApiClient } from '../types';

export class ApiClient extends Api implements IApiClient {
  constructor(baseUrl: string, options: RequestInit = {}) {
    super(baseUrl, options);
  }

  getProducts(): Promise<Product[]> {
    return this.get('/product').then((res: any) => res.items as Product[]);
  }

  postOrder(order: OrderForm): Promise<void> {
    return this.post('/order', order).then(() => undefined);
  }
}