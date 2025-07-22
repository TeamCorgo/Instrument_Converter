class TFI {
    static PARAMS = ["MT", "DT", "TL", "RS", "AR", "DR", "SR", "RR", "SL", "EG"];

    constructor(fileData) {
        this.data = fileData;

        this.AL = fileData[0];
        this.FB = fileData[1];

        this.OP1 = this.#getOperator(2);
        this.OP2 = this.#getOperator(12);
        this.OP3 = this.#getOperator(22);
        this.OP4 = this.#getOperator(32);
        this.data = 0;
    }

    #getOperator(startIndex) {
        const op = {};
        for (let i = 0; i < TFI.PARAMS.length; i++) {
            op[TFI.PARAMS[i]] = this.data[startIndex + i];
        }
        return op;
    }

    toUint8Array() {
        const values = [
            this.AL,
            this.FB,
            ...TFI.PARAMS.map(p => this.OP1[p]),
            ...TFI.PARAMS.map(p => this.OP2[p]),
            ...TFI.PARAMS.map(p => this.OP3[p]),
            ...TFI.PARAMS.map(p => this.OP4[p])
        ];
        return new Uint8Array(values);
    }
}
