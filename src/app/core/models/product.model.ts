import { Comment } from './comment.model';

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
        public comments?: Comment[]
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