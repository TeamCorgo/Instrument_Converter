class OPM {
    constructor(name) {
        this.name = name;
        this.AL = 0;
        this.FB = 0;
        this.CH = {}; // PAN, FL, CON, AMS, PMS, SLOT, NE
        this.M1 = {}; // Operator parameters
        this.C1 = {};
        this.M2 = {};
        this.C2 = {};
    }


    toString(index = 0) {
        const formatLine = (label, obj) =>
            `${label}: ` + Object.values(obj).map(v => String(v).padStart(2, ' ')).join(' ');

        return [
            `@:${index} ${this.name}`,
            `LFO: 0 0 0 0 0`, // Default/fixed LFO line
            formatLine('CH', this.CH),
            formatLine('M1', this.M1),
            formatLine('C1', this.C1),
            formatLine('M2', this.M2),
            formatLine('C2', this.C2),
        ].join('\n');
    }


    toUint8Array() {
        const output = new TextEncoder().encode(this.toString());
        return new Uint8Array(output);
    }
}

function readOPMFile(arrayBuffer) {
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    const lines = text.split(/\r?\n/);
    const instruments = [];
    let currentInst = null;

    for (let rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith('@:')) {
            const trimmed = line.substring(2).trim();  // Remove '@:'
            const parts = trimmed.split(/\s+/);        // Split all words
            const number = parseInt(parts[0]);
            const name = parts.length > 1
                ? parts.slice(1).join(' ')
                : `Instrument ${number}`;

            // Stop reading file entirely if name is "no Name"
            if (name.toLowerCase() === 'no name') {
                break;
            }

            currentInst = new OPM(name);
            instruments.push(currentInst);
        }

        if (line.startsWith('CH:') && currentInst) {
            const values = line
                .replace('CH:', '')
                .trim()
                .split(/\s+/)
                .map(Number);
            currentInst.CH = {
                PAN: values[0],
                FL: values[1],
                CON: values[2],
                AMS: values[3],
                PMS: values[4],
                SLOT: values[5],
                NE: values[6],
            };
            currentInst.AL = values[2]; // CON (Connection) = AL (Algorithm)
            currentInst.FB = values[1]; // FL (Feedback Level) = FB
        }

        const opLabels = ['M1', 'C1', 'M2', 'C2'];
        for (const label of opLabels) {
            if (line.startsWith(label + ':') && currentInst) {
                const values = line
                    .substring(3)
                    .trim()
                    .split(/\s+/)
                    .map(Number);
                currentInst[label] = {
                    AR: values[0],
                    D1R: values[1],
                    D2R: values[2],
                    RR: values[3],
                    D1L: values[4],
                    TL: values[5],
                    KS: values[6],
                    MUL: values[7],
                    DT1: values[8],
                    DT2: values[9],
                    AMS_EN: values[10],
                };
                break;
            }
        }
    }

    return instruments;
}

