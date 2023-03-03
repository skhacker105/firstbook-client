import { Observable, of } from "rxjs";
import { ServerResponse } from "./server-response.model";

export abstract class Payment {
    constructor(
        public mode: string,
        public displayText: string,
        public intent: string,
        public _id?: string,
        public icon?: string
    ) { }

    abstract getPaymentURL(): string;
}

export class CashOnDelivery extends Payment {
    constructor(
        intent: string,
        _id?: string,
    ) {
        super('COD', 'Cash On Delivery', intent, _id, './assets/cash-on-delivery.png');
    }

    getPaymentURL() {
        return '';
    }
}


