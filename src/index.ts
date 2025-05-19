import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { ApiClient } from './components/ApiClient';
import { CartModel } from './models/CartModel';
import { OrderModel } from './models/OrderModel';
import { MainPageView, ModalView, CartView, OrderFormView } from './components/views';
import { AppController } from './components/AppController';
import { API_URL } from './utils/constants';

document.addEventListener('DOMContentLoaded', () => {
  const bus = new EventEmitter();
  const api = new ApiClient(API_URL);

  const cartModel = new CartModel(bus);
  const orderModel = new OrderModel();

  const mainView = new MainPageView(
    document.querySelector('.gallery') as HTMLElement,
    bus
  );
  const modalView = new ModalView(
    document.getElementById('modal-container') as HTMLElement,
    bus
  );

  const cartTemplate = document.getElementById('basket') as HTMLTemplateElement;
  const cartItemTemplate = document.getElementById('card-basket') as HTMLTemplateElement;
  const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
  const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;

  // Проверка, чтобы исключить null (не обязательно, но полезно)
  if (!cartTemplate || !cartItemTemplate || !orderTemplate || !contactsTemplate) {
    throw new Error('Один из шаблонов не найден в HTML!');
  }

  const cartView = new CartView(
    cartTemplate,
    cartItemTemplate,
    bus
  );
  const orderView = new OrderFormView(
    orderTemplate,
    contactsTemplate,
    bus
  );

  const controller = new AppController(
    mainView,
    modalView,
    cartView,
    orderView,
    cartModel,
    orderModel,
    api,
    bus
  );

  controller.init();
});