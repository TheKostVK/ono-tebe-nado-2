import {Component} from "../base/Component";

/** Разрешённые теги хедера */
export type HeaderTag = 'a' | 'button' | 'img' | 'nav' | 'span';

/** Общие поля для всех элементов */
export interface HeaderItemBase {
    type: HeaderTag;
    className: string;
    textContent?: string;

    dataset?: Partial<{
        element: string;
        component: string;
    }>;

    callbackData?: {
        callbackType?: keyof HTMLElementEventMap;
        callbackFn?: (ev: Event) => void;
    };

    /** Дочерние элементы (в нужном порядке) */
    children?: HeaderItem[];
}

/** <a> */
export interface HeaderLinkItem extends HeaderItemBase {
    type: 'a';
    href: string;
    target?: string;
    rel?: string;
}

/** <button> */
export interface HeaderButtonItem extends HeaderItemBase {
    type: 'button';
    buttonType?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

/** <img> */
export interface HeaderImageItem extends HeaderItemBase {
    type: 'img';
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
}

/** <nav> */
export interface HeaderNavItem extends HeaderItemBase {
    type: 'nav';
}

/** <span> */
export interface HeaderSpanItem extends HeaderItemBase {
    type: 'span';
}

/** Все варианты */
export type HeaderItem =
    | HeaderLinkItem
    | HeaderButtonItem
    | HeaderImageItem
    | HeaderNavItem
    | HeaderSpanItem;

/** Пустой интерфейс лучше заменить на конкретный контракт */
export interface IHeader {
    items: HeaderItem[];
}

export interface IHeaderItemConstructor {
    new (): Component<HeaderItem>;
}