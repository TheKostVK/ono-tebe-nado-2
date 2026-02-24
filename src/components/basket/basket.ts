import {IBasket, IBasketCheckout} from "./type";
import {ILot} from "../../types";
import {Component} from "../base/Component";
import {ILotConstructor} from "../lot";
import {IEvents} from "../base/events";
import {cloneTemplate, createElement, ensureElement} from "../../utils/utils";

type BasketTab = 'active' | 'closed';

export class BasketView extends Component<IBasket> {
    protected ActiveItem: ILotConstructor;
    protected SoldItem: ILotConstructor;
    protected tabs: HTMLElement;
    protected basketContent: HTMLElement;
    protected basketList: HTMLElement;
    protected basketActions: HTMLElement;
    protected basketTotal: HTMLElement;
    protected basketActionButton: HTMLButtonElement;
    protected activeTabButton: HTMLButtonElement;
    protected closedTabButton: HTMLButtonElement;
    protected headerBasketCounter: HTMLElement;

    private _items: ILot[] = [];
    private _activeTab: BasketTab = 'active';
    private selectedClosedIds: Set<string> = new Set<string>();

    constructor(events: IEvents, ActiveItem: ILotConstructor, SoldItem: ILotConstructor) {
        const root = createElement('div', {
            className: 'basket-modal'
        });
        const tabs = cloneTemplate<HTMLElement>('#tabs');
        const basketContent = cloneTemplate<HTMLElement>('#basket');
        const headerBasketCounter = ensureElement('.header__basket-counter');

        super(root, events);

        this.ActiveItem = ActiveItem;
        this.SoldItem = SoldItem;
        this.tabs = tabs;
        this.basketContent = basketContent;
        this.headerBasketCounter = headerBasketCounter;

        this.basketList = ensureElement('.basket__list', this.basketContent);
        this.basketActions = ensureElement('.basket__actions', this.basketContent);
        this.basketTotal = ensureElement('.basket__total', this.basketContent);
        this.basketActionButton = ensureElement<HTMLButtonElement>('.basket__action', this.basketContent);

        this.activeTabButton = ensureElement<HTMLButtonElement>('[name="active"]', this.tabs);
        this.closedTabButton = ensureElement<HTMLButtonElement>('[name="closed"]', this.tabs);

        this.activeTabButton.addEventListener('click', () => {
            this.setActiveTab('active');
        });

        this.closedTabButton.addEventListener('click', () => {
            this.setActiveTab('closed');
        });

        this.basketActionButton.addEventListener('click', (evt: Event) => {
            evt.preventDefault();
            this.emitCheckout();
        });

        this.container.append(this.tabs, this.basketContent);
        this.renderCurrentTab();
    }

    set items(items: ILot[]) {
        this._items = Array.isArray(items) ? items : [];
        this.cleanupSelection();
        this.updateHeaderCounter();
        this.renderCurrentTab();
        this.container.replaceChildren(this.tabs, this.basketContent);
    }

    clearSelection() {
        this.selectedClosedIds.clear();
        this.updateTotalsAndAction(this.getTabItems('closed'));
    }

    private setActiveTab(tab: BasketTab) {
        if (this._activeTab === tab) {
            return;
        }

        this._activeTab = tab;
        this.renderCurrentTab();
    }

    private renderCurrentTab() {
        const items = this.getTabItems(this._activeTab);
        this.updateTabButtons();

        if (this._activeTab === 'active') {
            this.renderActiveItems(items);
            this.setHidden(this.basketActions);
            return;
        }

        this.renderClosedItems(items);
        this.setVisible(this.basketActions);
        this.updateTotalsAndAction(items);
    }

    private renderActiveItems(items: ILot[]) {
        this.basketList.replaceChildren(...items.map((item) => {
            const itemView = new this.ActiveItem(this.events);
            return itemView.render(item);
        }));
    }

    private renderClosedItems(items: ILot[]) {
        this.basketList.replaceChildren(...items.map((item) => {
            const itemView = new this.SoldItem(this.events);
            const node = itemView.render(item);
            const checkbox = ensureElement<HTMLInputElement>('.bid__selector-input', node);

            checkbox.checked = this.selectedClosedIds.has(item.id);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.selectedClosedIds.add(item.id);
                } else {
                    this.selectedClosedIds.delete(item.id);
                }

                this.updateTotalsAndAction(items);
            });

            return node;
        }));
    }

    private getTabItems(tab: BasketTab): ILot[] {
        if (tab === 'active') {
            return this._items.filter((item) => item.status === 'active');
        }

        return this._items.filter((item) => item.status === 'closed');
    }

    private emitCheckout() {
        const closedItems = this.getTabItems('closed').filter((item) => this.selectedClosedIds.has(item.id));

        if (!closedItems.length) {
            return;
        }

        const payload: IBasketCheckout = {
            items: closedItems.map((item) => item.id),
            total: closedItems.reduce((sum, item) => sum + item.price, 0)
        };

        this.events.emit('basket:checkout', payload);
    }

    private updateTabButtons() {
        const activeTabActive = this._activeTab === 'active';

        this.toggleClass(this.activeTabButton, 'button_active', activeTabActive);
        this.toggleClass(this.closedTabButton, 'button_active', !activeTabActive);
    }

    private updateTotalsAndAction(closedItems: ILot[]) {
        const total = closedItems.reduce((sum, item) => {
            if (!this.selectedClosedIds.has(item.id)) {
                return sum;
            }

            return sum + item.price;
        }, 0);

        this.setText(this.basketTotal, this.formatAmount(total));
        this.basketActionButton.disabled = total === 0;
    }

    private cleanupSelection() {
        const closedIds = new Set(this.getTabItems('closed').map((item) => item.id));

        Array.from(this.selectedClosedIds).forEach((id) => {
            if (!closedIds.has(id)) {
                this.selectedClosedIds.delete(id);
            }
        });
    }

    private updateHeaderCounter() {
        this.setText(this.headerBasketCounter, this._items.length);
    }

    private formatAmount(value: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}
