import { Product } from "./product.model";

export class Catalog {
    constructor(
        public _id: string,
        public name: string,
        public products: CatalogProduct[],
        public createdDate?: Date,
        public createdBy?: string,
        public isDeleted?: boolean
    ){}
}

export class CatalogProduct {
    constructor(
        public product: Product,
        public name: string,
        public cost: number
    ){}
}