import { FormControl, FormGroup } from "@angular/forms";
import { Order } from "./order.model";

export class Payment {
    constructor(
        public mode: string,
        public displayText: string,
        public intent: string,
        public _id?: string,
        public icon?: string
    ) { }
}

export class CashOnDelivery extends Payment {
    constructor(
        intent: string,
        _id?: string,
    ) {
        super('COD', 'Cash On Delivery', intent, _id, './assets/cash-on-delivery.png');
    }
}


