function isOPMFormat(DMP){
    if (DMP.system === 2){
        return false;
    }
    return true;
}

function convertSystem(DMP){
    DMP.system = 2; // Set the system to Genesis (OPN)
    return DMP;
}

function convertTFItoDMP(tfi) {
    const dmp = createBlankDMP();
    dmp.version = 0x0B; // FILE_VERSION
    dmp.system = 0x02;  // SYSTEM_GENESIS
    dmp.mode = 1;       // Instrument Mode (FM)

    dmp.FB = tfi.FB;
    dmp.ALG = tfi.AL;

    // Helper to map operator
    const mapOperator = (src) => ({
        MULT: src["MT"],
        TL: src["TL"],
        AR: src["AR"],
        DR: src["DR"],
        SL: src["SL"],
        RR: src["RR"],
        AM: (src["EG"] & 0x80) ? 1 : 0,
        RS: src["RS"],
        DT: src["DT"],
        D2R: src["SR"],
        SSGEG_Enabled: src["EG"]
    });

    dmp.OP1 = mapOperator(tfi.OP1);
    dmp.OP2 = mapOperator(tfi.OP2);
    dmp.OP3 = mapOperator(tfi.OP3);
    dmp.OP4 = mapOperator(tfi.OP4);

    return dmp;
}


function scaleDT(dt1, dt2) {
    //DT2 is coarse and dt1 is fine
    if (dt1 === 0 && dt2 === 0) return 3;
    if (dt1 === 0 && dt2 === 1) return 19;
    if (dt1 === 0 && dt2 === 2) return 35;
    if (dt1 === 0 && dt2 === 3) return 51;

    //console.log("Useing DT2 for scaling");

    //DT2 is coarse and dt1 is fine
    //console.log(`DT1: ${dt1}, DT2: ${dt2}`);
    if (dt1 === 4 && dt2 === 0) return 3;
    if (dt1 === 4 && dt2 === 1) return 19;
    if (dt1 === 4 && dt2 === 2) return 35;
    if (dt1 === 4 && dt2 === 3) return 51;

    if (dt1 === 5 && dt2 === 0) return 2;
    if (dt1 === 5 && dt2 === 1) return 18;
    if (dt1 === 5 && dt2 === 2) return 34;
    if (dt1 === 5 && dt2 === 3) return 50;

    if (dt1 === 6 && dt2 === 0) return 1;
    if (dt1 === 6 && dt2 === 1) return 17;
    if (dt1 === 6 && dt2 === 2) return 33;
    if (dt1 === 6 && dt2 === 3) return 49;

    if (dt1 === 7 && dt2 === 0) return 0;
    if (dt1 === 7 && dt2 === 1) return 16;
    if (dt1 === 7 && dt2 === 2) return 32;
    if (dt1 === 7 && dt2 === 3) return 48;

    if (dt2 === 0) return 3 + dt1;
    if (dt2 === 1) return 19 + dt1;
    if (dt2 === 2) return 35 + dt1;
    if (dt2 === 3) return 51 + dt1;
    return 99;
}

function convertAMfromTFItoDMP(input) {
    const mapping = {
        0: 0,
        128: 1
    };
    return mapping.hasOwnProperty(input) ? mapping[input] : null;
}


function convertAM(input){
    if (input === 0){return 0;}
    if (input === 1){return 1;}
    if (input === 128){return 1;}
}

function convertSSG(input, AM) {
    if (AM === 1) {
        return 0; // SSGEG enabled
    }

    if (input === 0){return 0;}
    if (input === 1){return 1;}
    if (input === 128){return 0;}
}

function convertOPMtoDMP(opm){
    dmp = createBlankDMP();
    dmp.version = 0x0B; // FILE_VERSION
    dmp.system = 0x02; // SYSTEM_GENESIS
    dmp.mode = 1; // Instrument Mode (FM)

    dmp.FB = opm.FB;
    dmp.ALG = opm.AL;
    dmp.LFO = opm.CH.PMS;
    dmp.LFO2 = opm.CH.AMS;

    // Helper to convert an operator from OPM format to DMP format
    function mapOP(op) {
        return {
            MULT: op.MUL,
            TL: op.TL,
            AR: op.AR,
            DR: op.D1R,
            SL: op.D1L,
            RR: op.RR,
            AM: convertAM(op.AMS_EN), // & 0x80 ? 1 : 0, // Bit 7 = AM enable 
            RS: op.KS,
            DT: scaleDT(op.DT1, op.DT2), //op.DT1
            D2R: op.D2R,
            SSGEG_Enabled: convertSSG(op.AMS_EN, convertAM(op.AMS_EN)) //(op.AMS_EN & 0x0F) !== 0 ? 1 : 0
        };
    }

    // Map operators
    dmp.OP1 = mapOP(opm.M1);
    dmp.OP3 = mapOP(opm.C1);
    dmp.OP2 = mapOP(opm.M2);
    dmp.OP4 = mapOP(opm.C2);
    //console.log(dmp.OP1.AM, dmp.OP2.AM, dmp.OP3.AM, dmp.OP4.AM);
    //console.log(dmp.LFO, dmp.LFO2);
    // 0 , 0, 1 ,0
    // 5 , 0, 
    return dmp;
}

function arrayExists(target, listOfLists) {
  return listOfLists.some(
    arr => arr.length === target.length && arr.every((val, i) => val === target[i])
  );
}

// Compares two DMP objects and returns an array of property differences.
// Each difference is an object: { property, valueA, valueB }
function diffDMPObjects(dmpA, dmpB) {
    const diffs = [];
    const keys = new Set([...Object.keys(dmpA), ...Object.keys(dmpB)]);
    keys.forEach(key => {
        // Skip functions
        if (typeof dmpA[key] === "function" || typeof dmpB[key] === "function") return;

        const valA = dmpA[key];
        const valB = dmpB[key];

        // If value is an object (e.g., OP1), do a shallow compare of its properties
        if (valA && typeof valA === "object" && valB && typeof valB === "object") {
            const subKeys = new Set([...Object.keys(valA), ...Object.keys(valB)]);
            subKeys.forEach(subKey => {
                if (valA[subKey] !== valB[subKey]) {
                    diffs.push({
                        property: `${key}.${subKey}`,
                        valueA: valA[subKey],
                        valueB: valB[subKey]
                    });
                }
            });
        } else if (valA !== valB) {
            diffs.push({ property: key, valueA: valA, valueB: valB });
        }
    });
    return diffs;
}
// Usage example:
// const differences = diffDMPObjects(dmp1, dmp2);
// differences.forEach(diff => console.log(`${diff.property}: ${diff.valueA} !=



