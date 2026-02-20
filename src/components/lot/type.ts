import {Component} from "../base/Component";
import {IEvents} from "../base/events";
import {ILot} from "../../types";

export interface ILotConstructor {
    new(events: IEvents): Component<ILot>;
}