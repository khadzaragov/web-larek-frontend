# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура проекта

Архитектура построена по паттерну **MVP** с использованием событийной модели через `EventEmitter`.

Приложение разделено на три слоя:

- **Model (модель)** — хранит и обрабатывает данные. Поля моделей — это простые типы, массивы и объекты.
- **View (представление)** — работает только с DOM. Представления не хранят состояние, а только отображают переданные данные и генерируют события.
- **Presenter (управляющий слой)** — принимает действия пользователя, вызывает методы модели и обновляет представление.

Каждый класс относится строго к своему слою:

- Модель (`CartModel`, `OrderModel`) — работают только с данными, не используют DOM.
- Представление (`ProductCardView`, `CartView`, `ModalView`, `MainPageView`, `OrderFormView`) — работают только с DOM, не хранят состояние.
- Презентер (`AppController`) — реагирует на события от View, вызывает методы Model и обновляет View.

Взаимодействие реализовано через `EventEmitter`, с помощью методов `emit`, `on`, `off`.

---

## Структура классов

### Model

#### `CartModel`

Управляет корзиной и её содержимым. Хранит массив товаров, аналогичный `initialCards` из проекта "Место".

```ts
constructor()
items: ICartItem[]
addItem(product: Product): void
removeItem(productId: string): void
clear(): void
getTotalPrice(): number
```

#### `OrderModel`

Хранит и проверяет данные заказа.

```ts
constructor()
payment: 'card' | 'cash'
address: string
email: string
phone: string
isValidStep1(): boolean
isValidStep2(): boolean
getData(): OrderForm
```

---

### View

#### `ProductCardView`

Создаёт карточку товара на основе переданного шаблона.

```ts
constructor(template: HTMLTemplateElement, onClick: (id: string) => void)
render(product: Product): HTMLElement
setSelected(state: boolean): void
```

> Класс карточки универсален. В зависимости от переданного шаблона отображает товар в каталоге, в модальном окне или в корзине. Шаблон передаётся в конструктор. Это позволяет не создавать отдельные классы для каждого случая.

> `ProductCardView` реализован как универсальный класс для всех трёх шаблонов карточек: в каталоге, корзине и модалке. Шаблон передаётся в конструктор, а логика отображения адаптируется под него.

#### `ModalView`

Универсальный контейнер для отображения контента в модальном окне. Получает любой `HTMLElement` от других классов представления.

```ts
constructor(container: HTMLElement)
render(content: HTMLElement): void
open(): void
close(): void
```

> Использует элемент с id `modal-container`, в который вставляется разный контент — карточка товара, корзина, форма оформления, окно с сообщением. Контент передаётся через метод `render()`.

#### `CartView`

Отображает содержимое корзины и кнопки действия. Не зависит от шаблонов карточек.

```ts
constructor(template: HTMLTemplateElement)
render(items: ICartItem[]): void
onRemoveItem(callback: (id: string) => void): void
onSubmit(callback: () => void): void
```

> Класс сам клонирует шаблон карточки из HTML, заполняет его и вставляет в контейнер. Он не принимает готовые DOM-элементы, а создаёт их на основе переданных данных (ICartItem[]).
> Массив карточек в корзине формируется на основе состояния `CartModel`, который обновляется при добавлении или удалении товаров. Карточки создаются отдельно и передаются в `CartView` для отображения.

#### `OrderFormView`

Отображает форму оформления заказа по шагам. Отображает ошибки, полученные от модели.

```ts
constructor(templateStep1: HTMLTemplateElement, templateStep2: HTMLTemplateElement)
renderStep1(): void
renderStep2(): void
getStep1Data(): { payment: 'card' | 'cash'; address: string }
getStep2Data(): { email: string; phone: string }
onNext(callback: () => void): void
showErrors(errors: string[]): void
```

> Класс отвечает только за отображение формы и ошибок валидации. Все проверки производятся в `OrderModel`.

#### `MainPageView`

Главная страница с каталогом и иконкой корзины.

```ts
constructor(root: HTMLElement)
renderCatalog(cards: HTMLElement[]): void
updateCartCounter(count: number): void
```

> Класс получает массив готовых HTML-элементов карточек от логики (например, от контроллера) и вставляет его в разметку. Внутри `MainPageView` карточки не создаются и не обрабатываются — это делает его универсальным и независимым от конкретной структуры карточки.
> Карточки для главной страницы создаются из массива данных, полученного от API. Формирование DOM-элементов происходит в логике (например, в контроллере) через `map`, и результат передаётся в `MainPageView`.

---

### Организация логики в проекте

Связывание компонентов, обработка событий, передача данных между слоями реализованы в классе `AppController`. Именно он играет роль презентера в архитектуре MVP.

Класс `AppController` принимает экземпляры всех моделей и представлений, подписывается на события от `EventEmitter`, вызывает методы моделей и обновляет интерфейс через View.

---

## Взаимодействие между слоями

Взаимодействие реализовано по событийно-ориентированному принципу.

1. Пользователь инициирует браузерное событие (например, клик).
2. В обработчике View вызывается `emit`.
3. Presenter подписан на это событие через `on`.
4. Presenter вызывает метод модели.
5. Модель обрабатывает данные и, при необходимости, также генерирует событие для обновления интерфейса.
6. View снова отображает данные.

---

### Пример

```ts
// Пользователь кликает на карточку
eventBus.emit('product:open', { id })

// Контроллер слушает событие
eventBus.on('product:open', this.handleProductClick)
```

---

### Основные события

| Событие         | Описание                            |
|-----------------|-------------------------------------|
| `product:open`  | Открыть карточку товара             |
| `cart:add`      | Добавить товар в корзину            |
| `cart:remove`   | Удалить товар из корзины            |
| `cart:changed`  | Обновить отображение корзины        |
| `order:submit`  | Отправить заказ                     |
| `modal:close`   | Закрыть модальное окно              |
| `order:step1`   | Перейти к шагу с адресом            |
| `order:step2`   | Перейти к шагу с контактами         |

---

## Базовые утилиты

#### `Api`

Работает с сервером: получает список товаров и отправляет заказ.

#### `EventEmitter`

Передаёт события между частями приложения.

- `on(event, callback)`
- `emit(event, data)`
- `off(event, callback)`

#### `cloneTemplate`

Клонирует шаблон из HTML по `id` или селектору.

#### `ensureElement`, `ensureAllElements`

Помогают искать и получать DOM-элементы из шаблонов или по селекторам.

#### `createElement`

Создаёт DOM-элемент с нужными атрибутами и вложенными элементами.

---

## Типы данных

Типы и интерфейсы описаны в `src/types/index.ts`:

- `Product`, `OrderForm` — данные от API и для заказа
- `ICartItem`, `ICartModel` — корзина и её элементы
- `IApiClient` — методы API
- `IProductCardView` — отображение карточек
- `IEventPayload` — структура событий

---

## Список событий и структура данных

| Событие         | Отправитель        | Получатель       | Данные                               |
|-----------------|--------------------|------------------|--------------------------------------|
| `product:open`  | ProductCardView    | AppController    | `{ id: string }`                     |
| `cart:add`      | ProductCardView    | AppController    | `{ product: Product }`              |
| `cart:remove`   | CartView           | AppController    | `{ id: string }`                     |
| `cart:changed`  | CartModel          | MainPageView, CartView | `{ items: Product[] }`        |
| `order:submit`  | OrderFormView      | AppController    | `{ form: OrderForm }`               |

---

## Пример сценария: добавление товара в корзину

1. Пользователь нажимает кнопку «Купить» в карточке товара.
2. `ProductCardView` вызывает:

   ```ts
   eventBus.emit('cart:add', { product });
   ```

3. `AppController` получает событие, вызывает:

   ```ts
   cartModel.addItem(product);
   ```

4. `CartModel` обновляет данные и вызывает:

   ```ts
   eventBus.emit('cart:changed', { items: cartModel.items });
   ```

5. `CartView` подписан на `cart:changed`, получает новые карточки и обновляет отображение.

---

## Используемые HTML-шаблоны

| ID шаблона             | Назначение                                | Используется в классе         |
|------------------------|--------------------------------------------|-------------------------------|
| `card-catalog`         | Карточка в каталоге                       | `ProductCardView`             |
| `card-basket`            | Карточка в корзине                        | `ProductCardView`             |
| `card-preview`         | Карточка в модальном окне                 | `ProductCardView`             |
| `order`     | Форма: способ оплаты и адрес              | `OrderFormView`               |
| `contacts`     | Форма: контакты                           | `OrderFormView`               |

---

## План реализации

1. Реализовать модели: `CartModel`, `OrderModel`
2. Реализовать компонент `ProductCardView`, рендерящий карточку по шаблону
3. Настроить `Api` и загрузку товаров с сервера
4. Создать `AppController`, передать ему все модели и представления, настроить логику событийного взаимодействия
5. Подключить `MainPageView`, `ModalView`, `CartView`, `OrderFormView`
6. Реализовать генерацию карточек через `map` по данным
7. Обработать пользовательские действия и переходы между шагами заказа