import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL_LOC, headerItems} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {cloneTemplate, ensureElement} from "./utils/utils";
import {lotBasketView, lotCatalogView, lotModalView, lotSoldBasketView} from "./components/lot";
import {Catalog, CatalogView} from "./components/catalog";
import {Header, HeaderItemView, HeaderView} from "./components/header";
import {Modal} from "./components/common/Modal";
import {LoadingView} from "./components/loading";
import {BasketView, IBasketCheckout} from "./components/basket";
import {Form} from "./components/common/Form";
import {IOrderForm} from "./types";

interface IOrderState extends IOrderForm {
    items: string[];
    total: number;
    valid: boolean;
    errors: string;
}

class OrderFormView extends Form<IOrderForm> {
    set email(value: string) {
        const input = this.container.elements.namedItem('email') as HTMLInputElement;
        input.value = value;
    }

    set phone(value: string) {
        const input = this.container.elements.namedItem('phone') as HTMLInputElement;
        input.value = value;
    }
}

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL_LOC, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({eventName, data}) => {
    console.log(eventName, data);
});

// Все шаблоны
const pageWrapper = ensureElement<HTMLElement>('.page__wrapper');
const rootModal = ensureElement<HTMLElement>('#modal-container');
const rootHeader = ensureElement<HTMLElement>('.header', pageWrapper);
const rootCatalog = ensureElement<HTMLElement>('main .catalog', pageWrapper);
const rootCatalogItems = ensureElement<HTMLElement>('.catalog__items', rootCatalog);


// Модель данных приложения
const loadingView = new LoadingView(events);

const header = new Header({
    items: headerItems
}, events);

const headerView = new HeaderView(rootHeader, events, HeaderItemView);

pageWrapper.prepend(headerView.render(header));

const catalog = new Catalog({
    items: [],
    loading: loadingView.render()
}, 'catalog.items:changed', events);

const basketCatalog = new Catalog({
    items: [],
    loading: loadingView.render()
}, 'basket.items:changed', events);

const catalogView = new CatalogView(rootCatalogItems, events, lotCatalogView, loadingView.render());
const basketView = new BasketView(events, lotBasketView, lotSoldBasketView);

const modalView = new Modal(rootModal, events);
const itemModalView = new lotModalView(events);
let orderFormView: OrderFormView | null = null;
let isBasketModalFlow = false;

const orderState: IOrderState = {
    email: '',
    phone: '',
    items: [],
    total: 0,
    valid: false,
    errors: 'Заполните поля',
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string): boolean => value.replace(/\D/g, '').length >= 10;

const validateOrderState = (): void => {
    const errors: string[] = [];

    if (!orderState.email.trim() || !isValidEmail(orderState.email)) {
        errors.push('Проверьте email');
    }

    if (!orderState.phone.trim() || !isValidPhone(orderState.phone)) {
        errors.push('Проверьте телефон');
    }

    if (!orderState.items.length) {
        errors.push('Выберите лоты');
    }

    orderState.valid = errors.length === 0;
    orderState.errors = errors.join(', ');

    if (orderFormView) {
        orderFormView.render({
            email: orderState.email,
            phone: orderState.phone,
            valid: orderState.valid,
            errors: orderState.errors
        });
    }
};

const renderSuccessState = () => {
    const successView = cloneTemplate<HTMLElement>('#success');
    const toMainButton = ensureElement<HTMLButtonElement>('.state__action', successView);

    toMainButton.addEventListener('click', () => {
        modalView.close();
    });

    modalView.render({
        content: successView
    });
};

// Глобальные контейнеры

rootCatalog.append(catalogView.render());

// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
events.on('catalog.items:changed', () => {
    catalogView.render(catalog);
});

events.on('catalog.items:click', (item: { id: string }) => {
    modalView.render({
        content: loadingView.render()
    });

    api.getLotItem(item.id)
        .then(result => {
            modalView.render({
                content: itemModalView.render(result)
            });
        })
        .catch(err => {
            console.error(err);
        });
});

events.on('lot:placeBid', ({id, value}: { id: string, value: number }) => {
    modalView.render({
        content: loadingView.render()
    });

    api.placeBid(id, {price: value})
        .then(result => {
            modalView.render({
                content: itemModalView.render(result)
            });
        })
        .catch(err => {
            console.error(err);
        });
});

events.on('basket:open', () => {
    isBasketModalFlow = true;
    modalView.render({
        content: loadingView.render()
    });

    api.getLotList()
        .then(result => {
            basketCatalog.setItems(result);
        })
        .catch(err => {
            console.error(err);
        });
});

events.on('basket.items:changed', () => {
    const content = basketView.render(basketCatalog);

    if (!isBasketModalFlow) {
        return;
    }

    modalView.render({
        content
    });
});

events.on('basket:checkout', (payload: IBasketCheckout) => {
    orderState.items = payload.items;
    orderState.total = payload.total;
    orderState.email = '';
    orderState.phone = '';
    orderState.valid = false;
    orderState.errors = 'Заполните поля';

    const orderTemplate = cloneTemplate<HTMLFormElement>('#order');
    orderFormView = new OrderFormView(orderTemplate, events);
    validateOrderState();

    modalView.render({
        content: orderFormView.render({
            email: orderState.email,
            phone: orderState.phone,
            valid: orderState.valid,
            errors: orderState.errors
        })
    });
});

events.on('order.email:change', (data: { field: keyof IOrderForm; value: string }) => {
    orderState.email = data.value;
    validateOrderState();
});

events.on('order.phone:change', (data: { field: keyof IOrderForm; value: string }) => {
    orderState.phone = data.value;
    validateOrderState();
});

events.on('order:submit', () => {
    validateOrderState();

    if (!orderState.valid) {
        return;
    }

    modalView.render({
        content: loadingView.render()
    });

    api.orderLots({
        email: orderState.email.trim(),
        phone: orderState.phone.trim(),
        items: [...orderState.items]
    })
        .then(() => {
            isBasketModalFlow = false;
            basketView.clearSelection();
            basketCatalog.setItems(
                basketCatalog.items.filter((item) => !orderState.items.includes(item.id))
            );
            renderSuccessState();
        })
        .catch(err => {
            console.error(err);

            if (!orderFormView) {
                return;
            }

            orderState.valid = true;
            orderState.errors = 'Не удалось оформить заказ, попробуйте снова';

            modalView.render({
                content: orderFormView.render({
                    email: orderState.email,
                    phone: orderState.phone,
                    valid: orderState.valid,
                    errors: orderState.errors
                })
            });
        });
});

events.on('modal:close', () => {
    isBasketModalFlow = false;
});

catalogView.renderLoading();

// Получаем лоты с сервера
api.getLotList()
    .then(result => {
        catalog.setItems(result);
    })
    .catch(err => {
        console.error(err);
    });
