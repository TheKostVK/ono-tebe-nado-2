import {Model} from "../base/Model";
import {IItem, IItemConstructor} from "../item";
import {Component} from "../base/Component";
import {ICatalog} from "./type";

export class Catalog extends Model<ICatalog> implements ICatalog {
    items: IItem[];

    setItems(items: IItem[]) {
        this.items = items;
        this.emitChanges('catalog.items:changed', {
            items: this.items
        })
    }
}

export class CatalogView extends Component<ICatalog> {
    protected Item: IItemConstructor;

    constructor(root: HTMLElement, Item: IItemConstructor) {
        super(root);
        this.Item = Item;
    }

    set items(items: IItem[]) {
        this.container.replaceChildren(...items.map((item) => {
            const itemView = new this.Item();
            return itemView.render(item);
        }));
    }
}