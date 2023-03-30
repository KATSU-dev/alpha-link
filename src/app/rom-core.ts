import { convertSerialResponse } from "./rom-manager";

export type vpet = "DMOG" | "PENOG" | "DM20" | "PEN20" | "DMX" | "PENX" | "PENPROG" | "";
export const vpet_types = ["DMOG", "PENOG", "DM20", "PEN20", "DMX", "PENX", "PENPROG"];
export type stage = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";
export type stage_r = "Baby I" | "Baby II" | "Child" | "Adult" | "Perfect" | "Ultimate" | "SuperUltimate";
export const stages = ["I", "II", "III", "IV", "V", "VI", "VII"];
export const STAGES   = {"I": "Baby I", "II": "Baby II", "III": "Child", "IV": "Adult", "V": "Perfect", "VI": "Ultimate", "VII": "SuperUltimate"}
export const STAGES_R = {"Baby I": "I", "Baby II": "II", "Child": "III", "Adult": "IV", "Perfect": "V", "Ultimate": "VI", "SuperUltimate": "VII"}

export const vpet_lengths = {
	PEN20: 		10,
	DM20:		10,
	DMX:		6,
	DMOG:		2,
	PENOG:		4,
	PENX:		4,
	PENPROG:	5,
	"": 0,
}

export const vpet_name_to_commtype = {
	PEN20: 		1,
	DM20:		3,
	DMX:		6,
	DMOG:		7,
	PENOG:		8,
	PENX:		9,
	PENPROG:	10,
	"": -1,
}

export class ScannedDigimon {
    public longName: string;
    constructor(public index: string,
                public name: string,
                public stage: string,
                public vpet_type: string,
                public attribute: string,
                public digirom: string) {
		this.longName = shortToLongName(name);
	}
}
export function shortToLongName(shortName: string): string {
    let longName = shortName.slice(0, 1).toUpperCase() + shortName.slice(1) + "mon";
    if(longName.includes("_x")) longName = longName.replace("_x", "") + " X";
    
    return longName;
}
export function getScannedMon(rom: string, linkRom: boolean, type: vpet): ScannedDigimon {
	// return type === "DMOG" ? aguScanned : aguScannedDM20;
	const indx = getIndexFromRom(rom, type);
	return getScannedMonFromIndex(indx, type);
}
export function getScannedMonFromIndex(index: string, type: vpet): ScannedDigimon {
	let mon;
	// console.log("GETSCANNEDFROMINDEX", index, type);

	switch(type) {
		case "DMOG": {
			mon = DMOG_MAP[index as keyof typeof DMOG_MAP];
			break;
		}
		case "DM20": {
			mon = DM20_MAP[index as keyof typeof DM20_MAP];
			break;
		}
		default: {
			return aguScanned;
		}
	}

	return new ScannedDigimon(index, mon?.name, mon?.stage, type, mon?.attribute, "");
}
export function getIndexFromRom(rom: string, vpet: vpet): string {
	switch(vpet) {
		case "DMOG":
			return (rom.substring(3, 4)) + (rom.substring(7, 8));
		case "DM20":
			let index = Math.floor((parseInt(rom.substring(15, 18), 16)) / 4);
			if (index >= 512) index -= 512;
			if (index >= 256) index -= 256;
			return "" + index;
		default:
			return "";
	}
}

export const aguScanned = new ScannedDigimon("30", "agu", "III", "DMOG", "Vaccine", "FC03-FD02");
export const aguScannedDM20 = new ScannedDigimon("2", "agu", "III", "DM20", "Vaccine", "FC03-FD02");


export const DMOG_MAP = {
	"30": {name: "agu", stage: "III", attribute: "Vaccine", evos: ",grey,tyranno,devi,mera,nume"},
	"40": {name: "beta", stage: "III", attribute: "Virus", evos: ",devi,mera,airdra,seadra,nume"},
	"50": {name: "grey", stage: "IV", attribute: "Vaccine", evos: ",metalgrey"},
	"60": {name: "tyranno", stage: "IV", attribute: "Data", evos: ",mame"},
	"70": {name: "devi", stage: "IV", attribute: "Virus", evos: ",metalgrey"},
	"80": {name: "mera", stage: "IV", attribute: "Data", evos: ",mame"},
	"90": {name: "airdra", stage: "IV", attribute: "Vaccine", evos: ",metalgrey"},
	"A0": {name: "seadra", stage: "IV", attribute: "Data", evos: ",mame"},
	"B0": {name: "nume", stage: "IV", attribute: "Virus", evos: ",monzae"},
	"C0": {name: "metalgrey", stage: "V", attribute: "Virus", evos: ""},
	"D0": {name: "mame", stage: "V", attribute: "Data", evos: ""},
	"E0": {name: "monzae", stage: "V", attribute: "Vaccine", evos: ""},
	"31": {name: "gabu", stage: "III", attribute: "Vaccine", evos: ",kabuteri,garuru,ange,yukidaru,veggie"},
	"41": {name: "elec", stage: "III", attribute: "Virus", evos: ",ange,yukidaru,birdra,wha,veggie"},
	"51": {name: "kabuteri", stage: "IV", attribute: "Vaccine", evos: ",skullgrey,megakabuteri"},
	"61": {name: "garuru", stage: "IV", attribute: "Data", evos: ",metalmame"},
	"71": {name: "ange", stage: "IV", attribute: "Virus", evos: ",skullgrey"},
	"81": {name: "yukidaru", stage: "IV", attribute: "Data", evos: ",metalmame"},
	"91": {name: "birdra", stage: "IV", attribute: "Vaccine", evos: ",skullgrey"},
	"A1": {name: "wha", stage: "IV", attribute: "Data", evos: ",metalmame"},
	"B1": {name: "veggie", stage: "IV", attribute: "Virus", evos: ",vade"},
	"C1": {name: "skullgrey", stage: "V", attribute: "Virus", evos: ""},
	"D1": {name: "metalmame", stage: "V", attribute: "Data", evos: ""},
	"E1": {name: "vade", stage: "V", attribute: "Vaccine", evos: ""},
	"32": {name: "pata", stage: "III", attribute: "Vaccine", evos: ",uni,kentaru,ogre,bake,suka"},
	"42": {name: "kune", stage: "III", attribute: "Virus", evos: ",ogre,bake,shell,drimoge,suka"},
	"52": {name: "uni", stage: "IV", attribute: "Vaccine", evos: ",andro"},
	"62": {name: "kentaru", stage: "IV", attribute: "Data", evos: ",giro"},
	"72": {name: "ogre", stage: "IV", attribute: "Virus", evos: ",andro"},
	"82": {name: "bake", stage: "IV", attribute: "Data", evos: ",giro"},
	"92": {name: "shell", stage: "IV", attribute: "Vaccine", evos: ",andro"},
	"A2": {name: "drimoge", stage: "IV", attribute: "Data", evos: ",giro"},
	"B2": {name: "suka", stage: "IV", attribute: "Virus", evos: ",ete"},
	"C2": {name: "andro", stage: "V", attribute: "Virus", evos: ""},
	"D2": {name: "giro", stage: "V", attribute: "Data", evos: ""},
	"E2": {name: "ete", stage: "V", attribute: "Vaccine", evos: ""},
	"33": {name: "biyo", stage: "III", attribute: "Vaccine", evos: ",monochro,cockatri,leo,kuwaga,nani"},
	"43": {name: "pal", stage: "III", attribute: "Virus", evos: ",leo,kuwaga,coela,mojya,nani"},
	"53": {name: "monochro", stage: "IV", attribute: "Vaccine", evos: ",megadra,megakabuteri"},
	"63": {name: "cockatri", stage: "IV", attribute: "Data", evos: ",piccolo"},
	"73": {name: "leo", stage: "IV", attribute: "Virus", evos: ",megadra"},
	"83": {name: "kuwaga", stage: "IV", attribute: "Data", evos: ",piccolo,tekka"},
	"93": {name: "coela", stage: "IV", attribute: "Vaccine", evos: ",megadra"},
	"A3": {name: "mojya", stage: "IV", attribute: "Data", evos: ",piccolo"},
	"B3": {name: "nani", stage: "IV", attribute: "Virus", evos: ",digitama"},
	"C3": {name: "megadra", stage: "V", attribute: "Virus", evos: ""},
	"D3": {name: "piccolo", stage: "V", attribute: "Data", evos: ""},
	"E3": {name: "digitama", stage: "V", attribute: "Vaccine", evos: ""},
	"34": {name: "gazi", stage: "III", attribute: "Vaccine", evos: ",darktyranno,cyclo,devidra,tusk,rare"},
	"44": {name: "giza", stage: "III", attribute: "Virus", evos: ",devidra,tusk,fly,delta,rare"},
	"54": {name: "darktyranno", stage: "IV", attribute: "Vaccine", evos: ",metaltyranno"},
	"64": {name: "cyclo", stage: "IV", attribute: "Data", evos: ",nano"},
	"74": {name: "devidra", stage: "IV", attribute: "Virus", evos: ",metaltyranno"},
	"84": {name: "tusk", stage: "IV", attribute: "Data", evos: ",nano"},
	"94": {name: "fly", stage: "IV", attribute: "Vaccine", evos: ",metaltyranno"},
	"A4": {name: "delta", stage: "IV", attribute: "Data", evos: ",nano"},
	"B4": {name: "rare", stage: "IV", attribute: "Virus", evos: ",extyranno"},
	"C4": {name: "metaltyranno", stage: "V", attribute: "Virus", evos: ""},
	"D4": {name: "nano", stage: "V", attribute: "Data", evos: ""},
	"E4": {name: "extyranno", stage: "V", attribute: "Vaccine", evos: ""},
	"36": {name: "tento", stage: "III", attribute: "Vaccine", evos: ",kabuteri,star,torto,kuwaga,geko"},
	"46": {name: "otama", stage: "III", attribute: "Virus", evos: ",torto,kuwaga,monochro,shellnume,geko"},
	"56": {name: "kabuteri", stage: "IV", attribute: "Vaccine", evos: ",tekka"},
	"66": {name: "star", stage: "IV", attribute: "Data", evos: ",megakabuteri"},
	"76": {name: "torto", stage: "IV", attribute: "Vaccine", evos: ",tekka"},
	"86": {name: "kuwaga", stage: "IV", attribute: "Virus", evos: ",shogungeko"},
	"96": {name: "monochro", stage: "IV", attribute: "Data", evos: ",megakabuteri"},
	"A6": {name: "shellnume", stage: "IV", attribute: "Virus", evos: ",tekka"},
	"B6": {name: "geko", stage: "IV", attribute: "Virus", evos: ",shougungeko"},
	"C6": {name: "megakabuteri", stage: "V", attribute: "Data", evos: ""},
	"D6": {name: "tekka", stage: "V", attribute: "Virus", evos: ""},
	"E6": {name: "shougungeko", stage: "V", attribute: "Virus", evos: ""},
}
export function getDMOGResult(rom: string) {
	if(rom.includes("s:")) rom = convertSerialResponse(rom);
	return rom.substring(rom.length-1).includes("1")
}


export const DM20_MAP = {
	"0":   {name: "bota", stage: "I", attribute: "Free", evos: ",koro", base_power: "0"},
	"1":   {name: "koro", stage: "II", attribute: "Free", evos: ",agu,beta,_tai_agu", base_power: "0"},
	"2":   {name: "agu", stage: "III", attribute: "Vaccine", evos: ",grey,tyranno,devi,mera,nume", base_power: "18"},
	// "2":   {name: "grey_x", stage: "III", attribute: "Vaccine", evos: ",grey,tyranno,devi,mera,nume", base_power: "18"},
	"3":   {name: "beta", stage: "III", attribute: "Virus", evos: ",devi,mera,airdra,seadra,nume", base_power: "Virus"},
	"4":   {name: "grey", stage: "IV", attribute: "Vaccine", evos: ",metalgrey", base_power: "75"},
	"5":   {name: "tyranno", stage: "IV", attribute: "Data", evos: ",mame", base_power: "70"},
	// "5":   {name: "rose_x", stage: "IV", attribute: "Data", evos: ",mame", base_power: "70"},
	// "5":   {name: "angewo_x", stage: "IV", attribute: "Data", evos: ",mame", base_power: "70"},
	"6":   {name: "devi", stage: "IV", attribute: "Virus", evos: ",metalgrey", base_power: "65"},
	// "6":   {name: "ladydevi_x", stage: "IV", attribute: "Virus", evos: ",metalgrey", base_power: "65"},
	"7":   {name: "mera", stage: "IV", attribute: "Data", evos: ",mame", base_power: "60"},
	"8":   {name: "airdra", stage: "IV", attribute: "Vaccine", evos: ",metalgrey", base_power: "55"},
	"9":   {name: "seadra", stage: "IV", attribute: "Data", evos: ",mame", base_power: "50"},
	"Virus":  {name: "nume", stage: "IV", attribute: "Virus", evos: ",monzae", base_power: "40"},
	"Free":  {name: "metalgrey", stage: "V", attribute: "Virus", evos: ",blitzgrey", base_power: "126"},
	"12":  {name: "mame", stage: "V", attribute: "Data", evos: ",banchomame", base_power: "118"},
	"13":  {name: "monzae", stage: "V", attribute: "Vaccine", evos: ",", base_power: "107"},
	"14":  {name: "blitzgrey", stage: "VI", attribute: "Virus", evos: ",_als_omega", base_power: "188"},
	"15":  {name: "banchomame", stage: "VI", attribute: "Data", evos: ",", base_power: "176"},
	"16":  {name: "puni", stage: "I", attribute: "Free", evos: ",tuno", base_power: "0"},
	"17":  {name: "tuno", stage: "II", attribute: "Free", evos: ",gabu,elec,_yam_gabu", base_power: "0"},
	"18":  {name: "gabu", stage: "III", attribute: "Data", evos: ",kabuteri,garuru,ange,yukidaru,veggie", base_power: "18"},
	"19":  {name: "elec", stage: "III", attribute: "Data", evos: ",ange,yukidaru,birdra,wha,veggie", base_power: "Virus"},
	"20":  {name: "kabuteri", stage: "IV", attribute: "Vaccine", evos: ",skullgrey", base_power: "75"},
	"21":  {name: "garuru", stage: "IV", attribute: "Vaccine", evos: ",metalmame", base_power: "70"},
	"22":  {name: "ange", stage: "IV", attribute: "Vaccine", evos: ",skullgrey", base_power: "65"},
	"23":  {name: "yukidaru", stage: "IV", attribute: "Vaccine", evos: ",metalmame", base_power: "60"},
	"24":  {name: "birdra", stage: "IV", attribute: "Vaccine", evos: ",skullgrey", base_power: "55"},
	"25":  {name: "wha", stage: "IV", attribute: "Vaccine", evos: ",metalmame", base_power: "50"},
	"26":  {name: "veggie", stage: "IV", attribute: "Virus", evos: ",vade", base_power: "40"},
	"27":  {name: "skullgrey", stage: "V", attribute: "Virus", evos: ",skullmam", base_power: "126"},
	"28":  {name: "metalmame", stage: "V", attribute: "Data", evos: ",cresgaruru", base_power: "118"},
	"29":  {name: "vade", stage: "V", attribute: "Virus", evos: ",", base_power: "107"},
	"30":  {name: "skullmam", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "169"},
	"31":  {name: "cresgaruru", stage: "VI", attribute: "Data", evos: ",_als_omega", base_power: "188"},
	"32":  {name: "poyo", stage: "I", attribute: "Free", evos: ",toko", base_power: "0"},
	"33":  {name: "toko", stage: "II", attribute: "Free", evos: ",pata,kune,", base_power: "0"},
	"34":  {name: "pata", stage: "III", attribute: "Data", evos: ",uni,kentaru,ogre,bake,suka", base_power: "18"},
	"35":  {name: "kune", stage: "III", attribute: "Virus", evos: ",ogre,bake,shell,drimoge,suka", base_power: "Virus"},
	"36":  {name: "uni", stage: "IV", attribute: "Vaccine", evos: ",andro", base_power: "75"},
	"37":  {name: "kentaru", stage: "IV", attribute: "Data", evos: ",giro", base_power: "70"},
	"38":  {name: "ogre", stage: "IV", attribute: "Virus", evos: ",andro", base_power: "65"},
	"39":  {name: "bake", stage: "IV", attribute: "Virus", evos: ",giro", base_power: "60"},
	"40":  {name: "shell", stage: "IV", attribute: "Data", evos: ",andro", base_power: "55"},
	"41":  {name: "drimoge", stage: "IV", attribute: "Data", evos: ",giro", base_power: "50"},
	"42":  {name: "suka", stage: "IV", attribute: "Virus", evos: ",ete", base_power: "40"},
	"43":  {name: "andro", stage: "V", attribute: "Vaccine", evos: ",hiandro", base_power: "126"},
	"44":  {name: "giro", stage: "V", attribute: "Vaccine", evos: ",", base_power: "118"},
	"45":  {name: "ete", stage: "V", attribute: "Virus", evos: ",kingete", base_power: "107"},
	"46":  {name: "hiandro", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "176"},
	"47":  {name: "kingete", stage: "VI", attribute: "Virus", evos: ",", base_power: "169"},
	"48":  {name: "yura", stage: "I", attribute: "Free", evos: ",tane", base_power: "0"},
	"49":  {name: "tane", stage: "II", attribute: "Free", evos: ",biyo,pal,", base_power: "0"},
	"50":  {name: "biyo", stage: "III", attribute: "Vaccine", evos: ",monochro,cockatri,leo,kuwaga,nani", base_power: "18"},
	"51":  {name: "pal", stage: "III", attribute: "Data", evos: ",leo,kuwaga,coela,mojya,nani", base_power: "Virus"},
	"52":  {name: "monochro", stage: "IV", attribute: "Data", evos: ",megadra", base_power: "75"},
	"53":  {name: "cockatri", stage: "IV", attribute: "Data", evos: ",piccolo", base_power: "70"},
	"54":  {name: "leo", stage: "IV", attribute: "Vaccine", evos: ",megadra", base_power: "65"},
	"55":  {name: "kuwaga", stage: "IV", attribute: "Virus", evos: ",piccolo", base_power: "60"},
	"56":  {name: "coela", stage: "IV", attribute: "Data", evos: ",megadra", base_power: "55"},
	"57":  {name: "mojya", stage: "IV", attribute: "Vaccine", evos: ",piccolo", base_power: "50"},
	"58":  {name: "nani", stage: "IV", attribute: "Virus", evos: ",digitama", base_power: "40"},
	"59":  {name: "megadra", stage: "V", attribute: "Virus", evos: ",aegisdra", base_power: "126"},
	"60":  {name: "piccolo", stage: "V", attribute: "Data", evos: ",", base_power: "118"},
	"61":  {name: "digitama", stage: "V", attribute: "Data", evos: ",tita", base_power: "107"},
	"62":  {name: "aegisdra", stage: "VI", attribute: "Vaccine", evos: ",rusttyranno", base_power: "188"},
	"63":  {name: "tita", stage: "VI", attribute: "Virus", evos: ",", base_power: "176"},
	"64":  {name: "zuru", stage: "I", attribute: "Free", evos: ",pagu", base_power: "0"},
	"65":  {name: "pagu", stage: "II", attribute: "Free", evos: ",gazi,giza,", base_power: "0"},
	"66":  {name: "gazi", stage: "III", attribute: "Virus", evos: ",darktyranno,cyclo,devidra,tusk,rare", base_power: "18"},
	"67":  {name: "giza", stage: "III", attribute: "Virus", evos: ",devidra,tusk,fly,delta,rare", base_power: "Virus"},
	"68":  {name: "darktyranno", stage: "IV", attribute: "Virus", evos: ",metaltyranno", base_power: "75"},
	"69":  {name: "cyclo", stage: "IV", attribute: "Virus", evos: ",nano", base_power: "70"},
	"70":  {name: "devidra", stage: "IV", attribute: "Virus", evos: ",metaltyranno", base_power: "65"},
	"71":  {name: "tusk", stage: "IV", attribute: "Virus", evos: ",nano", base_power: "60"},
	"72":  {name: "fly", stage: "IV", attribute: "Virus", evos: ",metaltyranno", base_power: "55"},
	"73":  {name: "delta", stage: "IV", attribute: "Virus", evos: ",nano", base_power: "50"},
	"74":  {name: "rare", stage: "IV", attribute: "Virus", evos: ",extyranno", base_power: "40"},
	"75":  {name: "metaltyranno", stage: "V", attribute: "Virus", evos: ",mugendra", base_power: "126"},
	"76":  {name: "nano", stage: "V", attribute: "Virus", evos: ",", base_power: "118"},
	"77":  {name: "extyranno", stage: "V", attribute: "Vaccine", evos: ",pinochi", base_power: "107"},
	"78":  {name: "mugendra", stage: "VI", attribute: "Virus", evos: ",rusttyranno", base_power: "188"},
	"79":  {name: "pinochi", stage: "VI", attribute: "Virus", evos: ",", base_power: "176"},
	"80":  {name: "saku", stage: "I", attribute: "Free", evos: ",sakutto", base_power: "0"},
	"81":  {name: "sakutto", stage: "II", attribute: "Free", evos: ",zuba,hack,", base_power: "0"},
	"82":  {name: "zuba", stage: "III", attribute: "Vaccine", evos: ",zubaeager", base_power: "34"},
	"83":  {name: "zubaeager", stage: "IV", attribute: "Vaccine", evos: ",dura", base_power: "90"},
	"84":  {name: "dura", stage: "V", attribute: "Vaccine", evos: ",duranda", base_power: "155"},
	"85":  {name: "duranda", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "210"},
	"86":  {name: "hack", stage: "III", attribute: "Data", evos: ",baohack", base_power: "34"},
	"87":  {name: "baohack", stage: "IV", attribute: "Data", evos: ",saviorhack", base_power: "90"},
	"88":  {name: "saviorhack", stage: "V", attribute: "Data", evos: ",jes", base_power: "155"},
	"89":  {name: "jes", stage: "VI", attribute: "Data", evos: ",", base_power: "210"},
	"90":  {name: "petit", stage: "I", attribute: "Free", evos: ",babyd", base_power: "0"},
	"91":  {name: "babyd", stage: "II", attribute: "Free", evos: ",draco", base_power: "0"},
	"92":  {name: "draco", stage: "III", attribute: "Data", evos: ",_blu_coredra,_gre_coredra,", base_power: "34"},
	"93":  {name: "_blu_coredra", stage: "IV", attribute: "Vaccine", evos: ",wingdra", base_power: "80"},
	"94":  {name: "wingdra", stage: "V", attribute: "Vaccine", evos: ",slayerdra,_tai_wargrey,", base_power: "143"},
	"95":  {name: "slayerdra", stage: "VI", attribute: "Vaccine", evos: ",exa", base_power: "199"},
	"96":  {name: "_gre_coredra", stage: "IV", attribute: "Virus", evos: ",groundra", base_power: "80"},
	"97":  {name: "groundra", stage: "V", attribute: "Virus", evos: ",breakdra,_yam_metalgaruru,", base_power: "143"},
	"98":  {name: "breakdra", stage: "VI", attribute: "Virus", evos: ",exa", base_power: "199"},
	"99":  {name: "pitch", stage: "I", attribute: "Free", evos: ",puka", base_power: "0"},
	"100": {name: "puka", stage: "II", attribute: "Free", evos: ",corona,luna,", base_power: "0"},
	"101": {name: "corona", stage: "III", attribute: "Vaccine", evos: ",fira", base_power: "27"},
	"102": {name: "fira", stage: "IV", attribute: "Vaccine", evos: ",flare", base_power: "80"},
	"103": {name: "flare", stage: "V", attribute: "Vaccine", evos: ",apollo", base_power: "135"},
	"104": {name: "apollo", stage: "VI", attribute: "Vaccine", evos: ",gracenova", base_power: "199"},
	"105": {name: "luna", stage: "III", attribute: "Data", evos: ",lekis", base_power: "27"},
	"106": {name: "lekis", stage: "IV", attribute: "Data", evos: ",cresce", base_power: "80"},
	"107": {name: "cresce", stage: "V", attribute: "Data", evos: ",diana", base_power: "135"},
	"108": {name: "diana", stage: "VI", attribute: "Data", evos: ",gracenova", base_power: "199"},
	"109": {name: "_tai_agu", stage: "III", attribute: "Vaccine", evos: ",_tai_grey", base_power: "25"},
	"110": {name: "_tai_grey", stage: "IV", attribute: "Vaccine", evos: ",_tai_metalgrey", base_power: "83"},
	"111": {name: "_tai_metalgrey", stage: "V", attribute: "Vaccine", evos: ",_tai_wargrey", base_power: "135"},
	"112": {name: "_tai_wargrey", stage: "VI", attribute: "Vaccine", evos: ",omega", base_power: "199"},
	"113": {name: "_yam_gabu", stage: "III", attribute: "Data", evos: ",_yam_garuru", base_power: "25"},
	"114": {name: "_yam_garuru", stage: "IV", attribute: "Vaccine", evos: ",_yam_weregaruru", base_power: "77"},
	"115": {name: "_yam_weregaruru", stage: "V", attribute: "Vaccine", evos: ",_yam_metalgaruru", base_power: "135"},
	"116": {name: "_yam_metalgaruru", stage: "VI", attribute: "Data", evos: ",omega", base_power: "199"},
	"117": {name: "dodo", stage: "I", attribute: "Free", evos: ",dori", base_power: "0"},
	"118": {name: "dori", stage: "II", attribute: "Free", evos: ",doru", base_power: "0"},
	"119": {name: "doru", stage: "III", attribute: "Data", evos: ",doruga", base_power: "27"},
	"120": {name: "doruga", stage: "IV", attribute: "Data", evos: ",dorugure", base_power: "90"},
	"121": {name: "dorugure", stage: "V", attribute: "Data", evos: ",alpha", base_power: "143"},
	"122": {name: "alpha", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "210"},
	"123": {name: "yukimibota", stage: "I", attribute: "Free", evos: ",nyaro", base_power: "0"},
	"124": {name: "nyaro", stage: "II", attribute: "Free", evos: ",plot", base_power: "0"},
	"125": {name: "plot", stage: "III", attribute: "Vaccine", evos: ",meicoo", base_power: "27"},
	"126": {name: "meicoo", stage: "IV", attribute: "Free", evos: ",meicrack", base_power: "80"},
	"127": {name: "meicrack", stage: "V", attribute: "Vaccine", evos: ",rasiel", base_power: "143"},
	"128": {name: "rasiel", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "210"},
	"129": {name: "_als_omega", stage: "SuperVI", attribute: "Virus", evos: ",", base_power: "238"},
	"130": {name: "rusttyranno", stage: "SuperVI", attribute: "Virus", evos: ",", base_power: "238"},
	"131": {name: "exa", stage: "SuperVI", attribute: "Data", evos: ",", base_power: "238"},
	"132": {name: "gracenova", stage: "SuperVI", attribute: "Vaccine", evos: ",", base_power: "238"},
	"133": {name: "omega", stage: "SuperVI", attribute: "Vaccine", evos: ",", base_power: "238"},
	"134": {name: "_fdm_luce", stage: "V", attribute: "Virus", evos: ",", base_power: "0"},
	"135": {name: "beelzebu", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"136": {name: "_rgm_belphe", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"137": {name: "lilith", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"138": {name: "de", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"139": {name: "barba", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"140": {name: "levia", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"141": {name: "belialvamde", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"142": {name: "death", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"143": {name: "murmukus", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"144": {name: "_plm_imperialdra", stage: "SuperVI", attribute: "Free", evos: ",", base_power: "0"},
	"145": {name: "ulforcevdra", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "0"},
	"146": {name: "sleip", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "0"},
	"147": {name: "duft", stage: "VI", attribute: "Data", evos: ",", base_power: "0"},
	"148": {name: "magna", stage: "VI", attribute: "Free", evos: ",", base_power: "0"},
	"149": {name: "lordknight", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
	"150": {name: "cranium", stage: "VI", attribute: "Vaccine", evos: ",", base_power: "0"},
	"151": {name: "dynas", stage: "VI", attribute: "Data", evos: ",", base_power: "0"},
	"152": {name: "gankoo", stage: "VI", attribute: "Data", evos: ",", base_power: "0"},
	"153": {name: "duke", stage: "VI", attribute: "Virus", evos: ",", base_power: "0"},
}
export const DM20_ATTRIBUTES = {
	"00": "Vaccine",
	"01": "Data",
	"10": "Virus",
	"11": "Free",
}