import {Component} from "../base/Component";
import {HeaderItem, IHeader, IHeaderItemConstructor} from "./type";
import {createElement, ensureElement, scrollToElement} from "../../utils/utils";

import {Model} from "../base/Model";
import {IEvents} from "../base/events";

export class Header extends Model<IHeader> implements IHeader {
    items: HeaderItem[];

    constructor(data: Partial<IHeader>, protected events: IEvents) {
        super(data, events);

        this.items.push({
            type: 'button',
            className: 'header__basket',
            children: [
                {
                    type: 'span',
                    className: 'header__basket-counter',
                    textContent: '0',
                    dataset: {
                        element: 'basket',
                        component: 'basket',
                    },
                    callbackData: {
                        callbackType: "click",
                        callbackFn: (evt) => {
                            evt.preventDefault();
                            this.emitChanges('basket:open');
                        },
                    }
                },
            ],
        },)
    }
}

export class HeaderItemView extends Component<HeaderItem> {
    constructor(events: IEvents) {
        super(createElement('span', {className: ''}), events);
    }

    render(data?: Partial<HeaderItem>): HTMLElement {
        if (!data) {
            return this.container;
        }

        const props: Record<string, unknown> = {
            className: data.className ?? '',
            textContent: data.textContent,
        };

        if (data.dataset) {
            props.dataset = data.dataset;
        }

        if (data.type === 'a') {
            props.href = data.href;
        }

        if (data.type === 'img') {
            props.src = data.src;

            if (data.alt) {
                props.alt = data.alt;
            }
        }

        const el = createElement(data.type, props as any);

        if (data.children?.length) {
            const childrenNodes = data.children.map((child) => {
                const childView = new HeaderItemView(this.events);

                return childView.render(child);
            });

            el.append(...childrenNodes);
        }

        if (data.callbackData) {
            el.addEventListener(data.callbackData.callbackType, data.callbackData.callbackFn);
        }

        this.container.replaceChildren(el);

        return this.container;
    }
}

export class HeaderView extends Component<IHeader> {
    private _headerContainer: HTMLElement;
    private HeaderItem: IHeaderItemConstructor;

    constructor(root: HTMLElement, events: IEvents, HeaderItem: IHeaderItemConstructor) {
        super(root, events);

        this._headerContainer = ensureElement('.header__container', root);

        this.HeaderItem = HeaderItem;
    }

    set items(items: HeaderItem[]) {
        this._headerContainer.replaceChildren(
            ...items.map((item) => {
                const headerItemView = new this.HeaderItem(this.events);
                return headerItemView.render(item);
            })
        );
    }
}