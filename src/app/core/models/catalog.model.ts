import { ItemImage } from "./image";
import { Product } from "./product.model";

export class Catalog {
    constructor(
        public _id: string,
        public name: string,
        public products: CatalogProduct[],
        public createdDate?: Date,
        public createdBy?: string,
        public isDeleted?: boolean,
        public config?: CatalogConfig
    ) { }
}

export class CatalogProduct {
    constructor(
        public _id: string,
        public product: Product,
        public name: string,
        public cost: number,
        public sequence?: number,
        public count?: number
    ) {
        if (!this.count) this.count = 0;
    }
}

export class CatalogConfig {
    constructor(
        public useBanner: boolean,
        public useTitleBar: boolean,
        public banner?: ItemImage | string,
        public address?: string,
        public contact?: string,
        public email?: string
    ) {}
}