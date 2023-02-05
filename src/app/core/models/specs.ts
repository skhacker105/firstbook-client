import { ProductSpecification } from "./product.model";

export interface ISpecs {
    name: string, count: number, isOpen: boolean, error?: boolean,
    categorySpecs?: ProductSpecification[]
}

export enum DisplayFormat {
    freeFlow = 'free-flow',
    tabular = 'tabular'
}