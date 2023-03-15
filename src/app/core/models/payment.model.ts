import { Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { PaymentStatusType } from "../utilities/constants";
import { Order, OrderPaymentStatus } from "./order.model";
import { ServerResponse } from "./server-response.model";

const domain = environment.api;

export abstract class Payment {
    public amount: number = 0;
    constructor(
        public mode: string,
        public displayText: string,
        public intent: string,
        public _id?: string,
        public icon?: string,
        public createdBy?: string,
        public creationDate?: Date
    ) { }

    abstract makePayment(order: Order): Observable<ServerResponse<OrderPaymentStatus>>;

    setPaymentAmount(amt: number) {
        this.amount = amt;
    }
}

export class CashOnDelivery extends Payment {
    constructor(
        intent: string,
        _id?: string,
    ) {
        super('COD', 'Cash On Delivery', intent, _id, './assets/cash-on-delivery.png');
    }

    makePayment(order: Order): Observable<ServerResponse<OrderPaymentStatus>> {
        return of({
            data: {
                status: PaymentStatusType.waitingForCOD
            },
            message: ''
        } as ServerResponse<OrderPaymentStatus>);
    }
}


