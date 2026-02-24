import {Component} from "../base/Component";
import {cloneTemplate, createElement, ensureElement} from "../../utils/utils";
import {IEvents} from "../base/events";
import {ILot} from "../../types";

type Status = 'wait' | 'active' | 'closed';

export class lotCatalogView extends Component<ILot> {
    private _id = '';
    private _title: string;
    private _about: string;
    private _image: string;
    private _status: Status;
    private _datetime: Date;

    constructor(events: IEvents) {
        const template = cloneTemplate('#card');
        const btn = ensureElement('.card__action', template);

        btn.addEventListener('click', () => {
            this.events.emit('catalog.items:click', {
                id: this._id
            });
        });

        super(template, events);
    }

    set id(value: string) {
        this._id = value;
    }

    set datetime(value: Date | string) {
        this._datetime = this.parseDate(value);

        if (this._status) {
            this.updateStatusText(this._status);
        }
    }

    set status(value: Status) {
        this._status = value;

        const el = ensureElement('.card__status', this.container);
        const date = this._datetime;

        let text = 'Неизвестно';
        switch (value) {
            case 'wait':
                text = date ? `Открыто до ${this.formatDate(date)}` : 'Открыто до (дата не указана)';
                break;
            case 'active':
                text = date ? `Откроется ${this.formatDate(date)}` : 'Откроется (дата не указана)';
                break;
            case 'closed':
                text = 'Закрыто';
                break;
        }

        this.setText(el, text);
    }

    private updateStatusText(value: Status) {
        const el = ensureElement('.card__status', this.container);
        const date = this._datetime;

        let text: string;
        let statusClass: string;

        switch (value) {
            case 'wait':
                text = date ? `Откроется ${this.formatDate(date)}` : 'Откроется (дата не указана)';
                break;
            case 'active':
                text = date ? `Открыто до ${this.formatDate(date)}` : 'Открыто до (дата не указана)';
                statusClass = 'card__status_active';
                break;
            case 'closed':
                text = date ? `Закрыто ${this.formatDate(date)}` : 'Закрыто (дата не указана)';
                statusClass = 'card__status_closed';
                break;
        }

        this.setText(el, text);
        this.toggleClass(el, statusClass);
    }

    /**
     * Строгий парсер даты.
     * Принимает только:
     * - Date
     * - string (ожидается ISO или другой формат, корректно парсящийся new Date(...))
     *
     * Возвращает:
     * - Date, если дата валидна
     * - null, если дата отсутствует или невалидна
     */
    private parseDate(value: Date | string | null | undefined): Date | null {
        if (value == null) return null;

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        const s = value.trim();
        if (!s) return null;

        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric'
        });
    }

    set title(value: string) {
        this.setText(ensureElement('.card__title', this.container), value);
        this._title = value;
    }

    set about(value: string) {
        this.setText(ensureElement('.card__description', this.container), value);
        this._about = value;
    }

    set image(value: string) {
        this.setImage(
            ensureElement('.card__image', this.container) as HTMLImageElement,
            value,
            this._title
        );

        this._image = value;
    }
}

export class lotModalView extends Component<ILot> {
    private _id = '';
    private _title = '';
    private _description = '';
    private _image = '';
    private _status: Status | null = null;
    private _datetime: Date | null = null;
    private _price = 0;
    private _minPrice = 0;
    private _history: number[] = [];

    constructor(events: IEvents) {
        const template = cloneTemplate('#lot');

        super(template, events);
    }

    set id(value: string) {
        this._id = value;
    }

    set datetime(value: Date | string | null | undefined) {
        this._datetime = this.parseDate(value);
        this.syncStatusText();
    }

    set status(value: Status) {
        this._status = value;
        this.syncStatusText();
    }

    private syncStatusText() {
        if (!this._status) {
            return;
        }

        this.updateStatusText(this._status);
    }

    private updateStatusText(value: Status) {
        const elDate = ensureElement('.lot__status-timer', this.container);
        const elDesc = ensureElement('.lot__status-text', this.container);
        const elForm = ensureElement('.lot__bid', this.container) as HTMLFormElement;

        const date = this._datetime;

        let textDate = 'Дата не указана';
        let textDesc = '';

        switch (value) {
            case 'wait':
                textDate = date ? this.formatCountdown(date) : 'Дата не указана';
                textDesc = 'До начала аукциона';
                this.setHidden(elForm);
                break;
            case 'active':
                textDate = date ? this.formatCountdown(date) : 'Дата не указана';
                textDesc = 'До закрытия лота';
                break;
            case 'closed':
                textDate = 'Аукцион завершён';
                textDesc = `Продано за ${this.formatCurrency(this._price)}`;
                this.setHidden(elForm);
                break;
        }

        this.setText(elDate, textDate);
        this.setText(elDesc, textDesc);
    }

    /**
     * Строгий парсер даты.
     * Принимает только:
     * - Date
     * - string (ожидается ISO или другой формат, корректно парсящийся new Date(...))
     *
     * Возвращает:
     * - Date, если дата валидна
     * - null, если дата отсутствует или невалидна
     */
    private parseDate(value: Date | string | null | undefined): Date | null {
        if (value == null) {
            return null;
        }

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        const s = value.trim();

        if (!s) {
            return null;
        }

        const d = new Date(s);

        return Number.isNaN(d.getTime()) ? null : d;
    }

    private formatCountdown(value: Date | string | null | undefined): string {
        const target = this.parseDate(value);

        if (!target) {
            return '0д 0ч 0 мин 0 сек';
        }

        const diffMs = Math.max(0, target.getTime() - Date.now());
        const totalSec = Math.floor(diffMs / 1000);

        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        return `${days}д ${hours}ч ${minutes} мин ${seconds} сек`;
    }

    set title(value: string) {
        this.setText(ensureElement('.lot__title', this.container), value);
        this._title = value;
    }

    set description(value: string) {
        const contentEl = ensureElement('.lot__content', this.container);
        const titleEl = ensureElement('.lot__title', contentEl);
        const paragraphs = value
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        contentEl.querySelectorAll('.lot__description').forEach((item) => item.remove());

        const paragraphNodes = paragraphs.length
            ? paragraphs.map((item) => createElement('p', {
                className: 'lot__description',
                textContent: item
            }))
            : [createElement('p', {
                className: 'lot__description',
                textContent: ''
            })];

        const descFrame = document.createDocumentFragment();
        paragraphNodes.forEach((item) => descFrame.appendChild(item));
        titleEl.after(descFrame);

        this._description = value;
    }

    set image(value: string) {
        this.setImage(
            ensureElement('.lot__image', this.container) as HTMLImageElement,
            value,
            this._title
        );

        this._image = value;
    }

    set history(value: number[]) {
        this._history = Array.isArray(value) ? value : [];

        const elHistory = ensureElement('.lot__history', this.container);
        const elForm = ensureElement('.lot__bid', this.container) as HTMLFormElement;
        elHistory.replaceChildren();

        if (!this._history.length) {
            this.setHidden(elHistory);
            return;
        } else {
            this.setVisible(elHistory);

            const elHistoryTitle = createElement('span', {
                className: 'lot__history-caption',
                textContent: 'Последние ставки:',
            });

            const bids = createElement('ul', {
                className: 'lot__history-bids'
            });

            this._history.forEach((item) => {
                const li = createElement('li', {
                    className: 'lot__history-item',
                    textContent: String(item),
                });

                bids.appendChild(li);
            });

            elHistory.append(elHistoryTitle, bids);
        }

        if (this._status === 'closed' || this._status === 'wait') {
            this.setHidden(elForm);
            return;
        } else {
            this.setVisible(elForm);

            const inputEl = elForm.elements.namedItem('lot_bid') as HTMLInputElement;

            if (!inputEl) {
                return;
            }

            inputEl.addEventListener('input', (evt) => {
                const target = evt.target as HTMLInputElement;
                const digits = target.value.replace(/\D/g, '');

                target.value = digits ? this.formatCurrency(Number(digits), false) : '';
            });

            elForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const value = Number(inputEl.value);

                inputEl.value = '';

                this.events.emit('lot:placeBid', {id: this._id, value: value});
            });
        }
    }

    set price(value: number) {
        this._price = value;
        this.syncStatusText();
    }

    set minPrice(value: number) {
        this._minPrice = value;
    }

    private formatCurrency(value: number, icon: boolean = true): string {
        let options: Intl.NumberFormatOptions = {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        };

        if (icon) {
            options = {
                ...options,
                style: 'currency',
                currency: 'RUB',
            };
        }

        return new Intl.NumberFormat('ru-RU', options).format(value);
    }
}

export class lotBasketView extends Component<ILot> {
    private _id = '';
    private _title: string;
    private _image: string;
    private _status: Status;
    private _datetime: Date;

    constructor(events: IEvents) {
        const template = cloneTemplate('#bid');
        const btn = ensureElement('.bid__open', template);

        btn.addEventListener('click', () => {
            this.events.emit('catalog.items:click', {
                id: this._id
            });
        });

        super(template, events);
    }

    set id(value: string) {
        this._id = value;
    }

    set datetime(value: Date | string) {
        this._datetime = this.parseDate(value);
    }

    /**
     * Строгий парсер даты.
     * Принимает только:
     * - Date
     * - string (ожидается ISO или другой формат, корректно парсящийся new Date(...))
     *
     * Возвращает:
     * - Date, если дата валидна
     * - null, если дата отсутствует или невалидна
     */
    private parseDate(value: Date | string | null | undefined): Date | null {
        if (value == null) return null;

        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        const s = value.trim();
        if (!s) return null;

        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    set title(value: string) {
        this.setText(ensureElement('.bid__title', this.container), value);
        this._title = value;
    }

    set price(value: number) {
        this.setText(ensureElement('.bid__amount', this.container), this.formatAmount(value));
    }

    set image(value: string) {
        this.setImage(
            ensureElement('.bid__image', this.container) as HTMLImageElement,
            value,
            this._title
        );

        this._image = value;
    }

    private formatAmount(value: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}

export class lotSoldBasketView extends Component<ILot> {
    private _title: string;

    constructor(events: IEvents) {
        const template = cloneTemplate('#sold');
        super(template, events);
    }

    set title(value: string) {
        this.setText(ensureElement('.bid__title', this.container), value);
        this._title = value;
    }

    set image(value: string) {
        this.setImage(
            ensureElement('.bid__image', this.container) as HTMLImageElement,
            value,
            this._title
        );
    }

    set price(value: number) {
        this.setText(ensureElement('.bid__amount', this.container), this.formatAmount(value));
    }

    private formatAmount(value: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}
