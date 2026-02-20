import {HeaderItem} from "../components/header";

import logoSvg from '../images/logo.svg';
import {scrollToElement} from "./utils";

export const API_URL = `${process.env.API_ORIGIN}/api/onotebenado`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/onotebenado`;
export const CDN_URL_LOC = `/content`;

export const settings = {};

export const headerItems: HeaderItem[] = [
    {
        type: 'a',
        className: 'header__logo',
        href: '#',
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
                className: 'header__menu-lot',
                href: '#',
                textContent: 'Главная',
                callbackData: {
                    callbackType: "click",
                    callbackFn: (evt) => {
                        evt.preventDefault();
                        scrollToElement('.page__container');
                    },
                }
            },
            {
                type: 'a',
                className: 'header__menu-lot',
                href: '#',
                textContent: 'Посмотреть лоты',
                callbackData: {
                    callbackType: "click",
                    callbackFn: (evt) => {
                        evt.preventDefault();
                        scrollToElement('.catalog');
                    },
                }
            },
            {
                type: 'a',
                className: 'header__menu-lot',
                href: '#',
                textContent: 'Об аукционе',
                callbackData: {
                    callbackType: "click",
                    callbackFn: (evt) => {
                        evt.preventDefault();
                        scrollToElement('.about');
                    },
                }
            },
        ],
    },
];
