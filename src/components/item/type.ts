import {Component} from "../base/Component";

export interface IItem {
    id: string;
    title: string;
    about: string,
    image: string,
    status: string,
    datetime: string,
    price: number,
    minPrice: number
}

export interface IItemConstructor {
    new(): Component<IItem>;
}