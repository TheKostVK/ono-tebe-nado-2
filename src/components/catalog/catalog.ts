import {Model} from "../base/Model";
import {ILotConstructor} from "../lot";
import {Component} from "../base/Component";
import {ICatalog} from "./type";
import {IEvents} from "../base/events";
import {ILot} from "../../types";

export class Catalog extends Model<ICatalog> implements ICatalog {
    items: ILot[];
    loading: HTMLElement;

    setItems(items: ILot[]) {
        this.items = items;
        this.emitChanges('catalog.items:changed', {
            items: this.items
        })
    }
}

export class CatalogView extends Component<ICatalog> {
    protected Item: ILotConstructor;
    protected loading: HTMLElement;

    constructor(root: HTMLElement, events: IEvents, Item: ILotConstructor, loading: HTMLElement) {
        super(root, events);
        this.Item = Item;
        this.loading = loading;
    }

    set items(items: ILot[]) {
        this.container.replaceChildren(...items.map((item) => {
            const itemView = new this.Item(this.events);
            return itemView.render(item);
        }));
    }

    renderLoading() {
        this.container.replaceChildren(this.loading);
    }
}