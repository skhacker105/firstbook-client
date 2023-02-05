import { Comment } from './comment.model';

export class Contact {
    constructor(
        public _id: string,
        public title: string,
        public firstName: string,
        public lastName: string,
        public type: string,
        public contact1: string,
        public contact2: string,
        public address: string,
        public appUserId: string,
        public createdBy?: string,
        public creationDate?: Date,
        public currentRating?: number,
        public ratingPoints?: number,
        public ratedCount?: number,
        public comments?: Comment[]
    ) { }
}