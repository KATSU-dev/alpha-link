export type CommTypesType = "PEN20TAG" | "PEN20SIN" | "DM20TAG" | "DM20SIN" | "COPY20" | "PEN20JOG" | "DMXPENZ" | "DMOG" | "PENOG" | "PENX" | "PENPROG" | "USEA";

export const commTypesList: Array<string> = ["PEN20TAG", "PEN20SIN", "DM20TAG", "DM20SIN", "COPY20", "PEN20JOG", "DMXPENZ", "DMOG", "PENOG", "PENX", "PENPROG", "USEA"];

export const INERTROMS = [
    "V2-820E-003E-000E-000E-000E-003E-000E-000E-000E", 
    "V2-800E-003E-000E-000E-000E-000E-000E-000E-000E", 
    "V2-0101-0101-020E-008E-05AE-01EE-008E-05AE-01EE", 
    "V2-0101-0101-000E-008E-05AE-01EE-000E-000E-000E", 
    "V2-0101-0101-037E-000E-000E-003E-000E-000E-000E", 
    "V2-196E-003E", 
    "V2-007E-007E-041E-141E-004E", 
    "V2-FC03", 
    "V2-211F-000F-080F", 
    "X2-0009-0009-0009", 
    "V2-88A1-47A1-BFF1-3BF1", 
    "V1-0003-0200-FCC2-FFFF-FF00", 
]

export const slotConversion = {
    convertDmPen: (incomingSlot: number | string) => {
      incomingSlot = String(incomingSlot);
      let slotConversion = new Map([
          ["3","03"],
          ["4","04"],
          ["5","0C"],
          ["6","06"],
          ["7","10"],
          ["8","0A"],
          ["9","0E"],
          ["A","08"],
          ["B","11"],
          ["C","14"],
          ["D","13"],
          ["E","12"]
      ]);
      return slotConversion.get(incomingSlot);
    },
    convertPenDm: (incomingSlot: number | string) =>{
        incomingSlot = String(incomingSlot);
        let slotConversion = new Map([
            ["3","3"],
            ["4","4"],
            ["5","4"],
            ["6","6"],
            ["7","6"],
            ["8","A"],
            ["9","A"],
            ["A","8"],
            ["B","8"],
            ["C","5"],
            ["D","5"],
            ["E","9"],
            ["F","9"],
            ["10","7"],
            ["11","7"],
            ["12","E"],
            ["13","D"],
            ["14","C"]
        ]);
        return slotConversion.get(incomingSlot);
    },
    convertPenProg: (incomingSlot: number | string, incomingEffort: number | string, incomingShots: number | string, incomingVersion: number | string) => {
        incomingSlot = String(incomingSlot);
        incomingEffort = Number(incomingEffort);
        incomingShots = String(incomingShots);
        incomingVersion = String(incomingVersion);

        var penProgConversion = {
            slot3:  {atr:"10", stg:"83"},
            slot4:  {atr:"01", stg:"83"},
            slot5:  {atr:"00", stg:"83"},
            slot6:  {atr:"10", stg:"86"},
            slot7:  {atr:"10", stg:"86"},
            slot8:  {atr:"01", stg:"86"},
            slot9:  {atr:"01", stg:"86"},
            slotA:  {atr:"00", stg:"86"},
            slotB:  {atr:"00", stg:"86"},
            slotC:  {atr:"10", stg:"8C"},
            slotD:  {atr:"10", stg:"8C"},
            slotE:  {atr:"01", stg:"8C"},
            slotF:  {atr:"01", stg:"8C"},
            slot10: {atr:"00", stg:"8C"},
            slot11: {atr:"00", stg:"8C"},
            slot12: {atr:"10", stg:"92"},
            slot13: {atr:"01", stg:"92"},
            slot14: {atr:"00", stg:"92"}
        };

        let convertedAttribute = penProgConversion[`slot${incomingSlot}` as keyof typeof penProgConversion]["atr"];
        let convertedSlot =      penProgConversion[`slot${incomingSlot}` as keyof typeof penProgConversion]["stg"];
        let convertedStat =      penProgConversion[`slot${incomingSlot}` as keyof typeof penProgConversion]["atr"];

        var effortRanges = {
            stage83: {min:32, max:64},
            stage86: {min:72, max:104},
            stage8C: {min:136, max:176},
            stage92: {min:200, max:240}
        };

        let effortMax = effortRanges[`stage${convertedSlot}` as keyof typeof effortRanges]["max"]
        let effortMin = effortRanges[`stage${convertedSlot}` as keyof typeof effortRanges]["min"]
        let effortRange = effortMax - effortMin;
        let progExperience = Math.floor(((incomingEffort / 40) * effortRange) + effortMin);
        let progEffort = 0;

        if (progExperience > effortMax) {
            progEffort = effortMax;
        } 
        else if (progExperience < effortMin) {
            progEffort = effortMin;
        }
        else {
            progEffort = progExperience;
        };

        let progExp = progEffort.toString(16).toUpperCase();
        // let domStat = (parseInt("3", 16) % 3).toString(2).padStart(2, "0");
        let domStat = ((parseInt(incomingSlot,16) + parseInt(incomingVersion,16)) % 3).toString(2).padStart(2, "0");
        let statAtr = parseInt((domStat + convertedAttribute).padStart(4, "0"),2).toString(16).toUpperCase();
        let progShotsBin = ("10" + incomingShots.slice(0,1) + Math.round(Math.random()).toString() + incomingShots.slice(1,2) + Math.round(Math.random()).toString() + incomingShots.slice(2,3) + Math.round(Math.random()).toString() + incomingShots.slice(3,4) + Math.round(Math.random()).toString() + incomingShots.slice(4,5) + Math.round(Math.random()).toString());
        let progShots = parseInt(progShotsBin, 2).toString(16).toUpperCase();

        return {
            convertedSlot: convertedSlot,
            statAtr: statAtr,
            progExp: progExp,
            progShots: progShots
        }
    },
    convertProgPen: (incomingSlot: number | string, incomingEffort: number | string, incomingShots: number | string, incomingAttribute: number | string) => {
        incomingSlot = Number(incomingSlot);
        incomingEffort = Number(incomingEffort);
        incomingShots = incomingShots.toString(2).padStart(12, "0").slice(-10);
        let progStage = "";

        if (incomingSlot < 6) {
            progStage = "child";
        } 
        else if (incomingSlot < 12) {
            progStage = "adult";
        } 
        else if (incomingSlot < 18) {
            progStage = "perfect";
        } 
        else {
            progStage = "ultimate";
        };

        var progPenConversion = {
            child:      {2:"03", 1:"04", 0:"05", 3:"04"},
            adult:      {2:"06", 1:"08", 0:"0A", 3:"09"},
            perfect:    {2:"0C", 1:"0E", 0:"10", 3:"0E"},
            ultimate:   {2:"12", 1:"13", 0:"14", 3:"13"}
        };

        let convertedSlot = progPenConversion[progStage as keyof typeof progPenConversion][incomingAttribute as 0|1|2|3];

        var effortRanges = {
            child:      {min:32, max:64},
            adult:      {min:72, max:104},
            perfect:    {min:136, max:176},
            ultimate:   {min:200, max:240}
        };

        let effortMax = effortRanges[progStage as keyof typeof effortRanges]["max"]
        let effortMin = effortRanges[progStage as keyof typeof effortRanges]["min"]
        let effortRange = effortMax - effortMin;
        let penExperience = Math.floor((((incomingEffort - effortMin) / effortRange) * 40));
        let penEffortDec = "";

        if (penExperience > 40) {
            penEffortDec = "40";
        }
        else if (penExperience < 40) {
            penEffortDec = "00";
        }
        else {
            penEffortDec = penExperience.toString().padStart(2, "0");
        };

        let penEffortLeft = parseInt(penEffortDec.slice(1,2)).toString(2).padStart(4, "0");
        let penEffortRight = parseInt(penEffortDec.slice(0,1)).toString(2).padStart(3, "0");
        let penShots = incomingShots.slice(0,1) + incomingShots.slice(2,3) + incomingShots.slice(4,5) + incomingShots.slice(6,7) + incomingShots.slice(8,9);
        let effortShots = parseInt((penEffortLeft + penEffortRight + penShots), 2).toString(16).toUpperCase().padStart(3, "0");

        return {
            convertedSlot: convertedSlot,
            effortShots: effortShots
        }
    }
}

export const conversionTable = {
    "PEN20TAG": {
        count: 10,
        displayName: "Pendulum 20th Tag",
        inertDigiRom: "V2-820E-003E-000E-000E-000E-003E-000E-000E-000E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "PEN20TAG":
                    let rawoutstr = "V2-" + data.substring(0, data.length - 4) + "@C^F^FE";
                    let orderHex = rawoutstr.slice(3, 4);
                    let orderDec = parseInt(orderHex, 16);
                    let order = orderDec.toString(2).slice(0, 1);
                    let orderLength = orderDec.toString(2).length;
                    if (order == '1' && orderLength == 4) {
                        let newDec = orderDec - 8;
                        let newHex = newDec.toString(16);
                        endResult = rawoutstr.slice(0, 3) + newHex + rawoutstr.slice(4);
                    } else {
                        endResult = rawoutstr;
                    }
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "PEN20SIN": {
        count: 10,
        displayName: "Pendulum 20th Single",
        inertDigiRom: "V2-800E-003E-000E-000E-000E-000E-000E-000E-000E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "PEN20SIN":
                    endResult = module.exports["PEN20TAG"].getDigiRom(data, "PEN20TAG");
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "DM20TAG": {
        count: 10,
        displayName: "Digimon 20th Tag",
        inertDigiRom: "V2-0101-0101-020E-008E-05AE-01EE-008E-05AE-01EE",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "DM20TAG":
                    endResult = module.exports["DM20SIN"].getDigiRom(data, "DM20SIN");
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "DM20SIN": {
        count: 10,
        displayName: "Digimon 20th Single",
        inertDigiRom: "V2-0101-0101-000E-008E-05AE-01EE-000E-000E-000E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "DM20SIN":
                    let rawoutstr = "V2-" + data.substring(0, data.length - 4) + "@0^F^FE";
                    let orderHex = rawoutstr.slice(13, 14);
                    let orderDec = parseInt(orderHex, 16);
                    let order = orderDec.toString(2).slice(0, 1);
                    let orderLength = orderDec.toString(2).length;
                    if (order == '1' && orderLength == 4) {
                        let newDec = orderDec - 8;
                        let newHex = newDec.toString(16);
                        endResult = rawoutstr.slice(0, 13) + newHex + rawoutstr.slice(14);
                    } else {
                        endResult = rawoutstr;
                    }
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "COPY20": {
        count: 10,
        displayName: "Digimon/Pen 20th Copy",
        inertDigiRom: "V2-0101-0101-037E-000E-000E-003E-000E-000E-000E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = ""

            switch(commType){
                case "COPY20":
                    data = data.substring(0, 10) + "0" + data.substring(11, data.length);
                    let copypackall = "V2-" + data;
                    let copypackfirst = copypackall.slice(0, -4);
                    let copypack10 = copypackall.slice(-3);
                    endResult = copypackfirst + "@0" + copypack10;
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "PEN20JOG": {
        count: 3,
        displayName: "Pendulum 20th Jogress",
        inertDigiRom: "V2-196E-003E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = ""
            switch(commType){
                case "PEN20JOG":
                    let rawoutstr = "V2-" + data.substring(0, data.length - 4) + "@A^0^0E";
                    let orderHex = rawoutstr.slice(3, 4);
                    let orderDec = parseInt(orderHex, 16);
                    let order = orderDec.toString(2).slice(0, 1);
                    let orderLength = orderDec.toString(2).length;
                    if (order == '1' && orderLength == 4) {
                        let newDec = orderDec - 8;
                        let newHex = newDec.toString(16);
                        endResult = rawoutstr.slice(0, 3) + newHex + rawoutstr.slice(4);
                    } else {
                        endResult = rawoutstr;
                    }
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "DMXPENZ": {
        count: 6,
        displayName: "Digimon X / Pendulum Z",
        inertDigiRom: "V2-007E-007E-041E-141E-004E",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "DMXPENZ":
                    let rawoutstr = "V2-" + data.substring(0, data.length - 4) + "@8^1^FE";
                    let orderHex = rawoutstr.slice(3, 4);
                    let orderDec = parseInt(orderHex, 16);
                    let order = orderDec.toString(2).slice(0, 1);
                    let orderLength = orderDec.toString(2).length;
                    let prepreoutstr  = ""
                    if (order == '1' && orderLength == 4) {
                        let newDec = orderDec - 8;
                        let newHex = newDec.toString(16);
                        prepreoutstr  = rawoutstr.slice(0, 3) + newHex + rawoutstr.slice(4);
                    } else {
                        prepreoutstr  = rawoutstr;
                    }
                    let dmxStage = parseInt(parseInt(prepreoutstr.slice(8, 9), 16).toString(2).slice(0, -1), 2);
                    let dmxPower = parseInt(prepreoutstr.slice(24, 26), 16);
                    let dmxAttribute = parseInt(parseInt(prepreoutstr.slice(10, 11), 16).toString(2).slice(-2), 2);
                    let dmxNewStage = dmxStage.toString(2) + "0";
                    let dmxNewP2 = parseInt(dmxNewStage, 2).toString(16).toUpperCase() + "0" + dmxAttribute;
                    let preoutstr = prepreoutstr.slice(0,8) + dmxNewP2 + prepreoutstr.slice(11,35);
                    if (dmxStage == 20 && dmxPower <= 100) {
                        endResult = preoutstr.slice(0,5) + '^0' + preoutstr.slice(6, 24) + 'FE' + preoutstr.slice(26, 35)
                    } else {
                        endResult = preoutstr.slice(0,5) + '^0' + preoutstr.slice(6);
                    }
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "DMOG": {
        count: 2,
        displayName: "Digimon Original",
        inertDigiRom: "V2-FC03",
        getDigiRom: (data: string, commType: string) => {
            let packall = "V2-" + data;
            let endResult = "";

            switch(commType){
                case "PENOG":
                    let penSlot = parseInt(parseInt(packall.slice(4, 6), 16).toString(2).slice(-5), 2).toString(16).toUpperCase();
                    let penEffort = parseInt(parseInt(packall.slice(9, 10), 16).toString(2).slice(0,-1), 2).toString(16).toUpperCase();
                    // if (isNaN(penEffort) == true) {penEffort = "0";};
                    if (penEffort.length != 1) {penEffort = "0";};
                    let convertedSlot = slotConversion.convertPenDm(penSlot);
                    if (convertedSlot == undefined) {convertedSlot = "3";};
                    let slotInverse = (parseInt(convertedSlot, 16) ^ 15).toString(16).toUpperCase();
                    if (parseInt(penEffort) < 5) {} else {penEffort = "4";};
                    let effortInverse = (parseInt(penEffort, 16) ^ 15).toString(16).toUpperCase();
                    endResult = "V2-" + effortInverse + slotInverse + penEffort + convertedSlot + "-" + "F^30^3";
                    break;
                case "DMOG":
                    let dmpackfirst = packall.slice(0, -4);
                    let dmpack101 = packall.slice(-2, -1);
                    endResult = dmpackfirst + "@C^3" + dmpack101 + "^3";
                    break;
                case "PENPROG":
                    packall = module.exports["PENOG"].getDigiRom(packall, "PENPROG").replace("V2-", "");
                    endResult = module.exports["DMOG"].getDigiRom(packall, "PENOG");
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "PENOG": {
        count: 4,
        displayName: "Pendulum Original",
        inertDigiRom: "V2-211F-000F-080F",
        getDigiRom: (data: string, commType: string) => {
            let packall = "V2-" + data;
            let endResult = "";

            switch(commType){
                case "DMOG":
                    let dmSlot = parseInt(packall.slice(6, 7)).toString(16);
                    let dmEffort = parseInt(parseInt(packall.slice(5, 6), 10).toString(2) + "1", 2).toString(16);
                    let convertedSlot = slotConversion.convertDmPen(dmSlot);
                    if (convertedSlot == undefined) {convertedSlot = "03";};
                    if (parseInt(dmEffort) < 10) {} else {dmEffort = "9";};
                    endResult = "V2-1" + convertedSlot + "F-0" + dmEffort + "5F-0^1^FF-@BE7F";
                    break;
                case "PENOG":
                    let penpackfirst = packall.slice(0, -8);
                    let penpack3 = packall.slice(-6, -4);
                    let penpack4 = packall.slice(-3);
                    endResult = penpackfirst + "^1^F" + penpack3 + "@B" + penpack4;
                    break;
                case "PENPROG":
                    let progpackall = packall
                    let progSlot = parseInt(parseInt(progpackall.slice(4, 6), 16).toString(2).slice(-5), 2);
                    let progAtr = parseInt(parseInt(progpackall.slice(8, 9), 16).toString(2).padStart(4, "0").slice(2), 2);
                    let progEffort = parseInt(progpackall.slice(9, 11), 16);
                    let progShots = parseInt(progpackall.slice(13, 16), 16);
                    let convertedObj = slotConversion.convertProgPen(progSlot, progEffort, progShots, progAtr);
                    if (convertedObj.convertedSlot == undefined) {convertedSlot = "03";};
                    if (convertedObj.effortShots == undefined) {convertedObj.effortShots = "000";};
                    endResult = "V2-1" + convertedObj.convertedSlot + "F-" + convertedObj.effortShots + "F-0^1^FF-@BE7F";
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "PENX": {
        count: 4,
        displayName: "Pendulum X",
        inertDigiRom: "X2-0009-0009-0009",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "PENX":
                    endResult = "X2-" + data.substring(0, data.length - 4) + "@4^1^F9";
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "PENPROG": {
        count: 5,
        displayName: "Pendulum Progress",
        inertDigiRom: "V2-88A1-47A1-BFF1-3BF1",
        getDigiRom: (data: string, commType: string) => {
            let penpackall = "V2-" + data;
            let endResult = ""
            

            switch(commType){
                case "PENPROG":
                    let penpackfirst = penpackall.slice(0, -8);
                    let penpack3 = penpackall.slice(-6, -4);
                    let penpack4 = penpackall.slice(-3);
                    let endResult = penpackfirst + "^1^F" + penpack3 + "@5" + penpack4;
                    break;
                case "PENOG":
                    let penSlot = parseInt(parseInt(penpackall.slice(4, 6), 16).toString(2).slice(-5), 2).toString(16).toUpperCase();
                    let penEffort = (parseInt(penpackall.slice(9, 10), 16) * 10) + parseInt(penpackall.slice(8, 9), 16);
                    let penVersion = penpackall.slice(3, 4);
                    let penShots = parseInt(penpackall.slice(9, 11), 16).toString(2).padStart(8, "0").slice(-5);
                    let convertedObj = slotConversion.convertPenProg(penSlot, penEffort, penShots, penVersion);
                    if (convertedObj.convertedSlot == undefined) {convertedObj.convertedSlot = "03";};
                    if (convertedObj.statAtr == undefined) {convertedObj.statAtr = "00";};
                    if (convertedObj.progExp == undefined) {convertedObj.progExp = "00";};
                    if (convertedObj.progShots == undefined) {convertedObj.progShots = "000";};
                    if (penEffort < 5) {} else {penEffort = 4;};
                    endResult = "V2-9" + convertedObj.convertedSlot + "1-" + convertedObj.statAtr + convertedObj.progExp + "1-" + convertedObj.progShots + "1-3^1^F1-@5001";
                    break;
                case "DMOG":
                    penpackall = module.exports["PENOG"].getDigiRom(data, "DMOG").replace("V2-", "");
                    endResult = module.exports["PENPROG"].getDigiRom(penpackall, "PENOG");
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    },
    "USEA": {
        count: 5,
        displayName: "US/SEA",
        inertDigiRom: "V1-0003-0200-FCC2-FFFF-FF00",
        getDigiRom: (data: string, commType: string) => {
            let endResult = "";

            switch(commType){
                case "USEA":
                    let rawoutstr = "V1-" + data;
                    endResult = rawoutstr.slice(0, 16) + '0' + rawoutstr.slice(17, 24) + 'F' + rawoutstr.slice(25, 27);
                    break;
                default:
                    endResult = ""
            }

            return endResult;
        }
    }
}

// This will be replaced with a REST API call, also removing the need for slotConversion and conversionTable .
export function convertRom(data: string, commTypeFrom: number, commTypeTo: number) {
  return conversionTable[commTypesList[commTypeTo] as CommTypesType].getDigiRom(data, commTypesList[commTypeFrom]);
}

export function convertSerialResponse(srl: string){
  return srl.replace(/ s:.*?r:/g, "-").replace(/r:/g, "").replace(/ s:.*/g, "")
}

export function checkSerialResponse(data: string, commType: number) {
    const count = (data.match(/r/g) || []).length;

    switch(commType) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            if(count != 10) return -1;
            break;
        case 5:
            if(count != 3) return -1;
            break;
        case 6:
            if(count != 4) return -1;
            break;
        case 7:
            if(count != 2) return -1;
            break;
        case 8:
        case 9:
            if(count != 4) return -1;
            break;
        case 10:
            if(count != 5) return -1;
            break;
        case 11:
            if(count != 6) return -1;
            break;
        default: break;
    }

    return 0;
}

export const ERRORS = {
    generic: "Oops... Something went wrong. Please try again.",
    rebattle: "This DigiROM looks suspicious. Please provide it to a tournament host or moderator for verification."
}