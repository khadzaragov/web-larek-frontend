import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { ApiClient } from './components/ApiClient';
import { CartModel } from './models/CartModel';
import { OrderModel } from './models/OrderModel';
import { MainPageView, ModalView, CartView, OrderFormView } from './components/views';
import { AppController } from './components/AppController';
import { API_URL } from './utils/constants';

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

const cartView = new CartView(
  document.getElementById('basket') as HTMLTemplateElement,
  document.getElementById('card-basket') as HTMLTemplateElement,
  bus
);
const orderView = new OrderFormView(
  document.getElementById('order') as HTMLTemplateElement,
  document.getElementById('contacts') as HTMLTemplateElement,
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