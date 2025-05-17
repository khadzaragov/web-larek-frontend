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
getTotal(): number
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

> `ProductCardView` может быть реализован как наследник `Component<Product>`, где обобщённый тип подставляется как `Product`.

#### `ModalView`

Универсальный контейнер для отображения контента в модальном окне. Получает любой `HTMLElement` от других классов представления.

```ts
constructor(container: HTMLElement)
render(content: HTMLElement): void
open(): void
close(): void
onClose(callback: () => void): void
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

> Класс получает готовые DOM-элементы карточек и вставляет их в контейнер. Сам шаблон карточки в корзине передаётся через `ProductCardView`.

#### `OrderFormView`

Отображает форму оформления заказа по шагам. Отображает ошибки, полученные от модели.

```ts
constructor(templateStep1: HTMLTemplateElement, templateStep2: HTMLTemplateElement)
renderStep1(): void
renderStep2(): void
getStep1Data(): { payment: 'card' | 'cash'; address: string }
getStep2Data(): { email: string; phone: string }
onNext(callback: () => void): void
onSubmit(callback: () => void): void
showErrors(errors: string[]): void
```

> Класс отвечает только за отображение формы и ошибок валидации. Все проверки производятся в `OrderModel`.

#### `MainPageView`

Главная страница с каталогом и иконкой корзины.

```ts
constructor(root: HTMLElement)
renderCatalog(cards: HTMLElement[]): void
updateCartCounter(count: number): void
onCartClick(callback: () => void): void
```

> Класс получает готовые карточки от `ProductCardView` и вставляет их в контейнер каталога. Не зависит от структуры карточки.

---

### Presenter (Controller)

#### `AppController`

Связывает модели и представления, управляет логикой приложения. Подписывается на события от View и вызывает действия в моделях.

```ts
constructor(
  mainView: MainPageView,
  modalView: ModalView,
  cartModel: CartModel,
  orderModel: OrderModel,
  api: IApiClient,
  eventBus: EventEmitter
)
init(): void
handleProductClick(id: string): void
handleAddToCart(product: Product): void
handleRemoveFromCart(id: string): void
handleOrderSubmit(): void
```

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