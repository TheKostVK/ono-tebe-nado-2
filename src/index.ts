import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL_LOC, headerItems} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {ensureElement} from "./utils/utils";
import {lotCatalogView, lotModalView} from "./components/lot";
import {Catalog, CatalogView} from "./components/catalog";
import {Header, HeaderItemView, HeaderView} from "./components/header";
import {Modal} from "./components/common/Modal";
import {LoadingView} from "./components/loading";

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL_LOC, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({eventName, data}) => {
    console.log(eventName, data);
});

// Все шаблоны

// Модель данных приложения

// Глобальные контейнеры
const pageWrapper = ensureElement<HTMLElement>('.page__wrapper');
const rootModal = ensureElement<HTMLElement>('#modal-container');
const rootHeader = ensureElement<HTMLElement>('.header', pageWrapper);
const rootCatalog = ensureElement<HTMLElement>('main .catalog', pageWrapper);
const rootCatalogItems = ensureElement<HTMLElement>('.catalog__items', rootCatalog);

const loadingView = new LoadingView(events);

const header = new Header({
    items: headerItems
}, events);

const headerView = new HeaderView(rootHeader, events, HeaderItemView);

pageWrapper.prepend(headerView.render(header));

const catalog = new Catalog({
    items: []
}, events);

const catalogView = new CatalogView(rootCatalogItems, events, lotCatalogView, loadingView.render());

rootCatalog.append(catalogView.render());

const modalView = new Modal(rootModal, events);
const itemModalView = new lotModalView(events);

// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно
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

catalogView.renderLoading();

// Получаем лоты с сервера
api.getLotList()
    .then(result => {
        catalog.setItems(result);
    })
    .catch(err => {
        console.error(err);
    });

