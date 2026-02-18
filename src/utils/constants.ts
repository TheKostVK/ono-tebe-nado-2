import {HeaderItem} from "../components/header";

import logoSvg from '../images/logo.svg';

export const API_URL = `${process.env.API_ORIGIN}/api/onotebenado`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/onotebenado`;
export const CDN_URL_LOC = `/content`;

export const settings = {

};

export const headerItems: HeaderItem[] = [
    {
        type: 'a',
        className: 'header__logo',
        href: '/',
        children: [
            {
                type: 'img',
                className: 'header__logo-image',
                src: logoSvg,
                alt: 'Ono-tebe-nado! logo',
            },
        ],
    },

    {
        type: 'nav',
        className: 'header__menu',
        children: [
            {
                type: 'a',
                className: 'header__menu-item',
                href: '/',
                textContent: 'Главная',
            },
            {
                type: 'a',
                className: 'header__menu-item',
                href: '/',
                textContent: 'Посмотреть лоты',
            },
            {
                type: 'a',
                className: 'header__menu-item',
                href: '/',
                textContent: 'Об аукционе',
            },
        ],
    },

    {
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
            },
        ],
    },
];
