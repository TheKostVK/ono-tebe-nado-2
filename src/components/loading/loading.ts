import {Component} from "../base/Component";
import {ILoading} from "./type";
import {IEvents} from "../base/events";
import {cloneTemplate} from "../../utils/utils";


export class LoadingView extends Component<ILoading> {
    constructor(events: IEvents) {
        const template = cloneTemplate('#loading');

        super(template, events);
    }
}