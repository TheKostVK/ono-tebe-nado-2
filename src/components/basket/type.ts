import {ILot} from "../../types";

export interface IBasket {
    items: ILot[];
    loading: HTMLElement
}

export interface IBasketCheckout {
    items: string[];
    total: number;
}
