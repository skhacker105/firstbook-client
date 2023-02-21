import { Comment } from './comment.model';
import { Contact } from './contact.model';
import { ItemImage } from './image';

export class Product {
    constructor(
        public _id: string,
        public name: string,
        public specifications: ProductSpecification[],
        public description?: string,
        public images?: string[],
        public defaultImage?: string,
        public disabled?: boolean,
        public createdBy?: string,
        public creationDate?: Date,
        public currentRating?: number,
        public ratedBy?: string[],
        public ratingPoints?: number,
        public ratedCount?: number,
        public comments?: Comment[],
        public purchaseCost?: number,
        public sellingCost?: number,
        public loadedImage?: ItemImage,
        public clientCosts?: ProductClientCost[],
        public clientCostSelected?: ProductClientCost
    ) {}
}

export class ProductClientCost {
    constructor(
        public _id: string,
        public client: Contact,
        public cost: number
    ) {}
}

export class ProductSpecification {
    constructor(
        public _id: string,
        public productId: string,
        public category: string,
        public name: string,
        public value: string,
        public isImportant: boolean,
        public creationDate?: Date
    ) {}
}