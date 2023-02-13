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
        public roomKey: string,
        public message: string | string[],
        public type: string,
        public creationDate: Date,
        public room?: ChatRoom,
        public replyOf?: ChatMessage[],
        public isTyping?: boolean,
        public error?: any
    ) {}
}

export class ChatRoomUsers {
    constructor(
        public id: string,
        public roomKey: string,
        public shares: ChatRoom[],
        public deletedShares?: ChatRoom[],
        public name?: string,
        public profile?: User,
        public inactive?: boolean
    ){}
}