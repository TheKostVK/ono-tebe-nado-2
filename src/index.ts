import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL_LOC, headerItems} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {ensureElement} from "./utils/utils";
import {ItemView} from "./components/item";
import {Catalog, CatalogView} from "./components/catalog";
import {Header, HeaderItemView, HeaderView} from "./components/header";

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
const rootHeader = ensureElement<HTMLElement>('.header', pageWrapper);
const rootCatalog = ensureElement<HTMLElement>('main .catalog', pageWrapper);
const rootCatalogItems = ensureElement<HTMLElement>('.catalog__items', rootCatalog);

const header = new Header({
    items: headerItems
}, events);

const headerView = new HeaderView(rootHeader, HeaderItemView);

pageWrapper.prepend(headerView.render(header));

const catalog = new Catalog({
    items: []
}, events);

const catalogView = new CatalogView(rootCatalogItems, ItemView);

rootCatalog.append(catalogView.render());

// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно
events.on('catalog.items:changed', () => {
    catalogView.render(catalog);
});

// Получаем лоты с сервера
api.getLotList()
    .then(result => {
        catalog.setItems(result);
    })
    .catch(err => {
        console.error(err);
    });


