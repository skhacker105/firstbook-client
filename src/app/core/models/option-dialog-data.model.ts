export class OptionDialogData {
    constructor(
        public options: OptionalDialogDataOption[],
        public title?: string
    ){
        if (!this.title) this.title = 'Select appropriate action'
    }
}

export class OptionalDialogDataOption {
    constructor(
        public message: string,
        public icon?: string,
        public key?: string
    ) {}
}