import { User } from "./user.model";

export class ChatRoom {
    constructor(
        public _id: string,
        public roomKey: string,
        public name?: string,
        public user?: User,
        public inactive?: boolean
    ){}
}

export class ChatMessage {
    constructor(
        public _id: string,
        public message: string,
        public room?: ChatRoom
    ) {}
}

export class ChatRoomUsers {
    constructor(
        public id: string,
        public roomKey: string,
        public shares: ChatRoom[],
        public deletedShares?: ChatRoom[],
        public name?: string,
        public inactive?: boolean
    ){}
}