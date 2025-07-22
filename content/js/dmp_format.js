class DMP {
    static PARAMS = ["MULT", "TL", "AR", "DR", "SL", "RR", "AM", "RS", "DT", "D2R", "SSGEG_Enabled"];

    constructor(fileData) {
        // Convert file type A (0x0A) into type B (0x0B)
        if (fileData[0] === 0x0A) {
            // Convert to normal array for manipulation
            let arr = Array.from(fileData);

            arr[0] = 0x0B;
            arr.splice(1, 0, 0x02); // Insert 0x02 at index 1

            // Convert back to Uint8Array
            fileData = new Uint8Array(arr);
        }
        // Convert file type 9 into type B (0x0B)
        if (fileData[0] === 9) {
            fileData[0] = 0x0B;
            fileData[1] = 0x02; // SYSTEM_GENESIS
        }

        this.version = fileData[0];
        this.system = fileData[1];
        this.mode = fileData[2];
        this.LFO = fileData[3];
        this.FB = fileData[4];
        this.ALG = fileData[5];
        this.LFO2 = fileData[6];

        this.OP1 = this.#getOperator(fileData, 7);
        this.OP2 = this.#getOperator(fileData, 18);
        this.OP3 = this.#getOperator(fileData, 29);
        this.OP4 = this.#getOperator(fileData, 40);
    }

    #getOperator(data, startIndex) {
        const op = {};
        for (let i = 0; i < DMP.PARAMS.length; i++) {
            op[DMP.PARAMS[i]] = data[startIndex + i];
        }
        return op;
    }

    toUint8Array() {
        const values = [
            this.version,
            this.system,
            this.mode,
            this.LFO,
            this.FB,
            this.ALG,
            this.LFO2,
            ...DMP.PARAMS.map(p => this.OP1[p]),
            ...DMP.PARAMS.map(p => this.OP2[p]),
            ...DMP.PARAMS.map(p => this.OP3[p]),
            ...DMP.PARAMS.map(p => this.OP4[p]),
        ];
        return new Uint8Array(values);
    }
}

function createBlankDMP(){
    // Create a blank 51-byte Uint8Array filled with 0
    return new DMP(new Uint8Array(51));
}