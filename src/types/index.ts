// Тип товара, приходящего с сервера
export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
}

// Тип данных для оформления заказа
export interface OrderForm {
  payment: 'card' | 'cash';
  address: string;
  email: string;
  phone: string;
  items: string[];
}

// Интерфейс API-клиента
export interface IApiClient {
  getProducts: () => Promise<Product[]>;
  postOrder: (order: OrderForm) => Promise<void>;
}

// Элемент корзины
export interface ICartItem {
  product: Product;
  quantity: number;
}

// Интерфейс модели корзины
export interface ICartModel {
  items: ICartItem[];
  addItem(product: Product): void;
  removeItem(productId: string): void;
  clear(): void;
  getTotalPrice(): number;
}

// Интерфейс отображения карточки товара
export interface IProductCardView {
  render(data: Product): void;
  onBuyClick(callback: (id: string) => void): void;
}

// Интерфейс события
export interface IEventPayload {
  eventName: string;
  data?: unknown;
}
