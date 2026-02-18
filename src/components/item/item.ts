import {Component} from "../base/Component";
import {IItem} from "./type";
import {cloneTemplate, ensureElement} from "../../utils/utils";

type Status = 'wait' | 'active' | 'closed';

export class ItemView extends Component<IItem> {
    private _id = '';
    private _title: string
    private _about: string
    private _image: string
    private _status: Status;
    private _datetime: Date;
    private _price: number
    private _minPrice: number

    constructor() {
        const template = cloneTemplate('#card');
        super(template);
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