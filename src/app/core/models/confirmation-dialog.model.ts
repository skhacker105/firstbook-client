export class ConfirmationDialogData {
    constructor(
        public message?: string,
        public okDisplay?: string,
        public cancelDisplay?: string
    ) {
        if (!this.message) this.message = 'It will be deleted permanently. Are you sure you want to delete?';
        if (!this.okDisplay) this.okDisplay = 'Yes';
        if (!this.cancelDisplay) this.cancelDisplay = 'No';
    }

}