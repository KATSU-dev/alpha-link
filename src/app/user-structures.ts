//// Account ////
export class UserCredentials {
    constructor(public username: string,
                public password: string) {}


    public validate() {
        return ((/^([a-zA-Z0-9._!]){2,}$/.test(this.username)) && 
                (/^(?=.*\d)([A-Za-z0-9._]){8,}$/.test(this.password)));
    }

    public clear() {
        this.username = "";
        this.password = "";
    }

    public toJSON() {
        return {username: this.username, password: this.password};
    }
}

//// Register Account ////
import { MarvinImage, Marvin } from "marvinj-ts";

export class RegisterCredentials {
    constructor(public username: string = '',
                public email: string = '',
                public password: string = '',
                public wearing: Wearing = new Wearing(),
                public profile_text: string = "",
                public t_c: boolean = false,
                public r_e: boolean = false) {}
    
    public checkInputValidity() {
        return ((/^([a-zA-Z0-9._!]){2,16}$/.test(this.username)) && 
                (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email)) && 
                (/^(?=.*\d)([A-Za-z0-9._]){8,}$/.test(this.password)));
    }

    public checkBioValidity() {
        console.log("Check Bio Validity", this.profile_text)
        return ((/^([a-zA-Z0-9.,_! ]){0,128}$/.test(this.profile_text)));
    }

    public toJSON() {
        return {username: this.username,
                email: this.email,
                password: this.password,
                wearing: JSON.stringify(this.wearing),
                profile_text: this.profile_text,
                t_c: this.t_c,
                r_e: this.r_e};
    }

    public generateMergedImageBlob()  {
        return new Promise((resolve, reject) => {
            try {
                let loaded = 0;
                const loadMax = 1   + ((this.wearing['eyes'].variant !== 0) ? 1:0)
                                    + ((this.wearing['blush'].variant !== 0) ? 1:0)
                                    + ((this.wearing['lips'].variant !== 0) ? 1:0)
                                    + ((this.wearing['upper'].variant !== 0) ? 1:0)
                                    + ((this.wearing['lower'].variant !== 0) ? 1:0)
                                    + ((this.wearing['shoes'].variant !== 0) ? 1:0)
                                    + ((this.wearing['hair'].variant !== 0) ? 1:0)
                                    + ((this.wearing['beard'].variant !== 0) ? 1:0)
                                    + ((this.wearing['glasses'].variant !== 0) ? 1:0)
                                    + ((this.wearing['hat'].variant !== 0) ? 1:0);
                let imageMerged = new MarvinImage(256, 128);
                let mergeComplete = false;

                function merge() {
                    try {
                        imageMerged = Object.assign(Object.create(Object.getPrototypeOf(imageBase)), imageBase);
                        Marvin.combineByAlpha(imageBase,   imageEyes, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageBlush, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageLips, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageUpper, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageLower, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageShoes, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageHair, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageBeard, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageGlasses, imageMerged, 0, 0);
                        Marvin.combineByAlpha(imageMerged, imageHat, imageMerged, 0, 0);
                        mergeComplete = true;
                    } catch (error) {
                        console.log("Failed in merge.");
                    }
                }

                let imageBase = new MarvinImage();
                let imageEyes = new MarvinImage();
                let imageBlush = new MarvinImage();
                let imageLips = new MarvinImage();
                let imageUpper = new MarvinImage();
                let imageLower = new MarvinImage();
                let imageShoes = new MarvinImage();
                let imageHair = new MarvinImage();
                let imageBeard = new MarvinImage();
                let imageGlasses = new MarvinImage();
                let imageHat = new MarvinImage();

                                                            imageBase.load(this.wearing.src('base'), () =>          { if(++loaded == loadMax) merge(); });
                if(this.wearing['eyes'].variant !== 0)      imageEyes.load(this.wearing.src("eyes"), () =>          { if(++loaded == loadMax) merge(); });
                if(this.wearing['blush'].variant !== 0)     imageBlush.load(this.wearing.src("blush"), () =>        { if(++loaded == loadMax) merge(); });
                if(this.wearing['lips'].variant !== 0)      imageLips.load(this.wearing.src("lips"), () =>          { if(++loaded == loadMax) merge(); });
                if(this.wearing['upper'].variant !== 0)     imageUpper.load(this.wearing.src("upper"), () =>        { if(++loaded == loadMax) merge(); });
                if(this.wearing['lower'].variant !== 0)     imageLower.load(this.wearing.src("lower"), () =>        { if(++loaded == loadMax) merge(); });
                if(this.wearing['shoes'].variant !== 0)     imageShoes.load(this.wearing.src("shoes"), () =>        { if(++loaded == loadMax) merge(); });
                if(this.wearing['hair'].variant !== 0)      imageHair.load(this.wearing.src("hair"), () =>          { if(++loaded == loadMax) merge(); });
                if(this.wearing['beard'].variant !== 0)     imageBeard.load(this.wearing.src("beard"), () =>        { if(++loaded == loadMax) merge(); });
                if(this.wearing['glasses'].variant !== 0)   imageGlasses.load(this.wearing.src("glasses"), () =>    { if(++loaded == loadMax) merge(); });
                if(this.wearing['hat'].variant !== 0)       imageHat.load(this.wearing.src("hat"), () =>            { if(++loaded == loadMax) merge(); });

                let loopCheck = setInterval(() => {
                    if(mergeComplete) {
                        try {
                            const blob =  imageMerged.toBlob();
                            clearInterval(loopCheck);
                            resolve(blob);
                        } catch (error) {
                            clearInterval(loopCheck);
                            console.log("Cant blob", error);
                            return reject("Failed to generate blob.");
                        }
                    }
                }, 500);
            } catch (error) {
                console.log("Generate Image Error:", error);
                return resolve("Failed loading images");
            }
        });
    }

    public toString() {
        return JSON.stringify(this.toJSON());
    }
}

export const profanityList = [
    "2 girls 1 cup", 
    "2g1c", 
    "4r5e", 
    "5h1t", 
    "5hit", 
    "a55", 
    "a_s_s", 
    "acrotomophilia", 
    "alabama hot pocket", 
    "alaskan pipeline", 
    " anal", 
    "anilingus", 
    "anus", 
    "apeshit", 
    "ar5e", 
    "arrse", 
    "arse", 
    "arsehole", 
    "ass", 
    "ass-fucker", 
    "ass-hat", 
    "ass-pirate", 
    "assbag", 
    "assbandit", 
    "assbanger", 
    "assbite", 
    "assclown", 
    "asscock", 
    "asscracker", 
    "asses", 
    "assface", 
    "assfucker", 
    "assfukka", 
    "assgoblin", 
    "asshat", 
    "asshead", 
    "asshole", 
    "assholes", 
    "asshopper", 
    "assjacker", 
    "asslick", 
    "asslicker", 
    "assmonkey", 
    "assmunch", 
    "assmuncher", 
    "asspirate", 
    "assshole", 
    "asssucker", 
    "asswad", 
    "asswhole", 
    "asswipe", 
    "auto erotic", 
    "autoerotic", 
    "azz",
    "b!tch", 
    "b00bs", 
    "b17ch", 
    "b1tch", 
    "babeland", 
    "baby batter", 
    "baby juice", 
    "ball gag", 
    "ball gravy", 
    "ball kicking", 
    "ball licking", 
    "ball sack", 
    "ball sucking", 
    "ballbag", 
    "ballsack", 
    "bampot", 
    "bangbros", 
    "bareback", 
    "barely legal", 
    "barenaked", 
    "bastard", 
    "bastardo", 
    "bastinado", 
    "bbw", 
    "bdsm", 
    "beaner", 
    "beaners", 
    "beastial", 
    "beastiality", 
    "beastility", 
    "beaver cleaver", 
    "beaver lips", 
    "bellend", 
    "bestial", 
    "bestiality", 
    "bi+ch", 
    "biatch", 
    "big black", 
    "big breasts", 
    "big knockers", 
    "big tits", 
    "bimbos", 
    "birdlock", 
    "bitch", 
    "bitcher", 
    "bitchers", 
    "bitches", 
    "bitchin", 
    "bitching", 
    "black cock", 
    "blonde action", 
    "blonde on blonde action", 
    "bloody", 
    "blow job", 
    "blow your load", 
    "blowjob", 
    "blowjobs", 
    "blue waffle", 
    "blumpkin", 
    "boiolas", 
    "bollock", 
    "bollocks", 
    "bollok", 
    "bollox", 
    "bondage", 
    "boner", 
    "boob", 
    "boobie", 
    "boobs", 
    "booobs", 
    "boooobs", 
    "booooobs", 
    "booooooobs", 
    "booty call", 
    "breasts", 
    "brown showers", 
    "brunette action", 
    "buceta", 
    "bugger", 
    "bukkake", 
    "bulldyke", 
    "bullet vibe", 
    "bullshit", 
    "bung hole", 
    "bunghole", 
    "bunny fucker", 
    "butt-pirate", 
    "buttcheeks", 
    "butthole", 
    "buttmunch", 
    "buttplug", 
    "c0ck", 
    "c0cksucker", 
    "camel toe", 
    "camgirl", 
    "camslut", 
    "camwhore", 
    "carpet muncher", 
    "carpetmuncher", 
    "cawk", 
    "chinc", 
    "chink", 
    "choad", 
    "chocolate rosebuds", 
    "chode", 
    "cipa", 
    "circlejerk", 
    "cl1t", 
    "cleveland steamer", 
    "clit", 
    "clitface", 
    "clitoris", 
    "clits", 
    "clover clamps", 
    "clusterfuck", 
    "cnut", 
    "cock", 
    "cock-sucker", 
    "cockbite", 
    "cockburger", 
    "cockface", 
    "cockhead", 
    "cockjockey", 
    "cockknoker", 
    "cockmaster", 
    "cockmongler", 
    "cockmongruel", 
    "cockmonkey", 
    "cockmunch", 
    "cockmuncher", 
    "cocknose", 
    "cocknugget", 
    "cocks", 
    "cockshit", 
    "cocksmith", 
    "cocksmoker", 
    "cocksuck", 
    "cocksuck ", 
    "cocksucked", 
    "cocksucked ", 
    "cocksucker", 
    "cocksucking", 
    "cocksucks ", 
    "cocksuka", 
    "cocksukka", 
    "cok", 
    "cokmuncher", 
    "coksucka", 
    "coochie", 
    "coochy", 
    "coon", 
    "coons", 
    "cooter", 
    "coprolagnia", 
    "coprophilia", 
    "cornhole", 
    "crap", 
    "creampie", 
    "cum", 
    "cumbubble", 
    "cumdumpster", 
    "cumguzzler", 
    "cumjockey", 
    "cummer", 
    "cumming", 
    "cums", 
    "cumshot", 
    "cumslut", 
    "cumtart", 
    "cunilingus", 
    "cunillingus", 
    "cunnie", 
    "cunnilingus", 
    "cunt", 
    "cuntface", 
    "cunthole", 
    "cuntlick", 
    "cuntlick ", 
    "cuntlicker", 
    "cuntlicker ", 
    "cuntlicking", 
    "cuntlicking ", 
    "cuntrag", 
    "cunts", 
    "cyalis", 
    "cyberfuc", 
    "cyberfuck ", 
    "cyberfucked ", 
    "cyberfucker", 
    "cyberfuckers", 
    "cyberfucking ", 
    "d1ck", 
    "date rape", 
    "daterape", 
    "deep throat", 
    "deepthroat", 
    "dendrophilia", 
    "dick", 
    "dickbag", 
    "dickbeater", 
    "dickface", 
    "dickhead", 
    "dickhole", 
    "dickjuice", 
    "dickmilk", 
    "dickmonger", 
    "dickslap", 
    "dicksucker", 
    "dickwad", 
    "dickweasel", 
    "dickweed", 
    "dickwod", 
    "dike", 
    "dildo", 
    "dildos", 
    "dingleberries", 
    "dingleberry", 
    "dink", 
    "dinks", 
    "dipshit", 
    "dirsa", 
    "dirty pillows", 
    "dirty sanchez", 
    "dlck", 
    "dog style", 
    "dog-fucker", 
    "doggie style", 
    "doggiestyle", 
    "doggin", 
    "dogging", 
    "doggy style", 
    "doggystyle", 
    "dolcett", 
    "domination", 
    "dominatrix", 
    "dommes", 
    "donkey punch", 
    "donkeyribber", 
    "doochbag", 
    "dookie", 
    "doosh", 
    "double dong", 
    "double penetration", 
    "douche", 
    "douchebag", 
    "dp action", 
    "dry hump", 
    "duche", 
    "dumbshit", 
    "dumshit", 
    "dvda", 
    "dyke", 
    "eat my ass", 
    "ecchi", 
    "ejaculate", 
    "ejaculated", 
    "ejaculates ", 
    "ejaculating ", 
    "ejaculatings", 
    "ejaculation", 
    "ejakulate", 
    "erotism", 
    "eunuch", 
    "f u c k", 
    "f u c k e r", 
    "f4nny", 
    "f_u_c_k", 
    "fag", 
    "fagbag", 
    "fagg", 
    "fagging", 
    "faggit", 
    "faggitt", 
    "faggot", 
    "faggs", 
    "fagot", 
    "fagots", 
    "fags", 
    "fagtard", 
    "fanny", 
    "fannyflaps", 
    "fannyfucker", 
    "fanyy", 
    "fatass", 
    "fcuk", 
    "fcuker", 
    "fcuking", 
    "fecal", 
    "fecker", 
    "felatio", 
    "felch", 
    "felching", 
    "fellate", 
    "fellatio", 
    "feltch", 
    "female squirting", 
    "femdom", 
    "figging", 
    "fingerbang", 
    "fingerfuck ", 
    "fingerfucked ", 
    "fingerfucker ", 
    "fingerfuckers", 
    "fingerfucking ", 
    "fingerfucks ", 
    "fingering", 
    "fistfuck", 
    "fistfucked ", 
    "fistfucker ", 
    "fistfuckers ", 
    "fistfucking ", 
    "fistfuckings ", 
    "fistfucks ", 
    "fisting", 
    "flamer", 
    "flange", 
    "fook", 
    "fooker", 
    "foot fetish", 
    "footjob", 
    "frotting", 
    "fuck", 
    "fuck buttons", 
    "fucka", 
    "fucked", 
    "fucker", 
    "fuckers", 
    "fuckhead", 
    "fuckheads", 
    "fuckin", 
    "fucking", 
    "fuckings", 
    "fuckingshitmotherfucker", 
    "fuckme ", 
    "fucks", 
    "fucktards", 
    "fuckwhit", 
    "fuckwit", 
    "fudge packer", 
    "fudgepacker", 
    "fuk", 
    "fuker", 
    "fukker", 
    "fukkin", 
    "fuks", 
    "fukwhit", 
    "fukwit", 
    "futanari", 
    "fux", 
    "fux0r", 
    "g-spot", 
    "gang bang", 
    "gangbang", 
    "gangbanged", 
    "gangbanged ", 
    "gangbangs ", 
    "gay sex", 
    "gayass", 
    "gaybob", 
    "gaybo", 
    "gaydo", 
    "gaylord", 
    "gaysex", 
    "gaytard", 
    "gaywad", 
    "genitals", 
    "giant cock", 
    "girl on top", 
    "girls gone wild", 
    "goatcx", 
    "goatse", 
    "gokkun", 
    "golden shower", 
    "goo girl", 
    "gooch", 
    "goodpoop", 
    "gook", 
    "goregasm", 
    "gringo", 
    "grope", 
    "group sex", 
    "guido", 
    "guro", 
    "hand job", 
    "handjob", 
    "hard core", 
    "hardcore", 
    "hardcoresex ", 
    "heeb", 
    "hentai", 
    "heshe", 
    "hoar", 
    "hoare", 
    " hoe", 
    "hoer", 
    "homo", 
    "homoerotic", 
    "honkey", 
    "honky", 
    "hooker", 
    "hore", 
    "horniest", 
    "horny", 
    "hot carl", 
    "hot chick", 
    "hotsex", 
    "how to kill", 
    "how to murder", 
    "huge fat", 
    "humping", 
    "incest", 
    "intercourse", 
    "jack off", 
    "jack-off ", 
    "jackass", 
    "jackoff", 
    "jail bait", 
    "jailbait", 
    "jap", 
    "jelly donut", 
    "jerk off", 
    "jerk-off ", 
    "jigaboo", 
    "jiggaboo", 
    "jiggerboo", 
    "jism", 
    "jiz", 
    "jiz ", 
    "jizm", 
    "jizm ", 
    "jizz", 
    "juggs", 
    "kawk", 
    "kike", 
    "kinbaku", 
    "kinkster", 
    "kinky", 
    "kiunt", 
    "knob", 
    "knobbing", 
    "knobead", 
    "knobed", 
    "knobend", 
    "knobhead", 
    "knobjocky", 
    "knobjokey", 
    "kock", 
    "kondum", 
    "kondums", 
    "kooch", 
    "kootch", 
    "kum", 
    "kumer", 
    "kummer", 
    "kumming", 
    "kums", 
    "kunilingus", 
    "kunt", 
    "kyke", 
    "l3i+ch", 
    "l3itch", 
    "labia", 
    "leather restraint", 
    "leather straight jacket", 
    "lemon party", 
    "lesbo", 
    "lezzie", 
    "lmfao", 
    "lolita", 
    "lovemaking", 
    "m0f0", 
    "m0fo", 
    "m45terbate", 
    "ma5terb8", 
    "ma5terbate", 
    "make me come", 
    "male squirting", 
    "masochist", 
    "master-bate", 
    "masterb8", 
    "masterbat*", 
    "masterbat3", 
    "masterbate", 
    "masterbation", 
    "masterbations", 
    "masturbate", 
    "menage a trois", 
    "milf", 
    "minge", 
    "missionary position", 
    "mo-fo", 
    "mof0", 
    "mofo", 
    "mothafuck", 
    "mothafucka", 
    "mothafuckas", 
    "mothafuckaz", 
    "mothafucked ", 
    "mothafucker", 
    "mothafuckers", 
    "mothafuckin", 
    "mothafucking ", 
    "mothafuckings", 
    "mothafucks", 
    "mother fucker", 
    "motherfuck", 
    "motherfucked", 
    "motherfucker", 
    "motherfuckers", 
    "motherfuckin", 
    "motherfucking", 
    "motherfuckings", 
    "motherfuckka", 
    "motherfucks", 
    "mound of venus", 
    "mr hands", 
    "muff", 
    "muff diver", 
    "muffdiver", 
    "muffdiving", 
    "mutha", 
    "muthafecker", 
    "muthafuckker", 
    "muther", 
    "mutherfucker", 
    "n1gga", 
    "n1gger", 
    "nambla", 
    "nawashi", 
    "nazi", 
    "negro", 
    "neonazi", 
    "nig nog", 
    "nigg3r", 
    "nigg4h", 
    "nigga", 
    "niggah", 
    "niggas", 
    "niggaz", 
    "nigger", 
    "niggers ", 
    "niglet", 
    "nimphomania", 
    "nipple", 
    "nipples", 
    "nob", 
    "nob jokey", 
    "nobhead", 
    "nobjocky", 
    "nobjokey", 
    "nsfw images", 
    "nude", 
    "nudity", 
    "numbnuts", 
    "nutsack", 
    "nympho", 
    "nymphomania", 
    "octopussy", 
    "omorashi", 
    "one cup two girls", 
    "one guy one jar", 
    "orgasim", 
    "orgasim ", 
    "orgasims ", 
    "orgasm", 
    "orgasms ", 
    "orgy", 
    "p0rn", 
    "paedophile", 
    "paki", 
    "panooch", 
    "panties", 
    "panty", 
    "pecker", 
    "peckerhead", 
    "pedobear", 
    "pedophile", 
    "pegging", 
    "penis", 
    "penisfucker", 
    "phone sex", 
    "phonesex", 
    "phuck", 
    "phuk", 
    "phuked", 
    "phuking", 
    "phukked", 
    "phukking", 
    "phuks", 
    "phuq", 
    "piece of shit", 
    "pigfucker", 
    "pimpis", 
    "pis", 
    "pises", 
    "pisin", 
    "pising", 
    "pisof", 
    "piss", 
    "piss pig", 
    "pissed", 
    "pisser", 
    "pissers", 
    "pisses ", 
    "pissflap", 
    "pissflaps", 
    "pissin", 
    "pissin ", 
    "pissing", 
    "pissoff", 
    "pissoff ", 
    "pisspig", 
    "playboy", 
    "pleasure chest", 
    "pole smoker", 
    "polesmoker", 
    "pollock", 
    "ponyplay", 
    "poo", 
    "poof", 
    "poon", 
    "poonani", 
    "poonany", 
    "poontang", 
    "poop", 
    "poop chute", 
    "poopchute", 
    "porn", 
    "porno", 
    "pornography", 
    "pornos", 
    "prick", 
    "pricks ", 
    "prince albert piercing",  
    "pthc", 
    "pube", 
    "pubes", 
    "punanny", 
    "punany", 
    "punta", 
    "pusies", 
    "pusse", 
    "pussi", 
    "pussies", 
    "pussy", 
    "pussylicking", 
    "pussys ", 
    "pusy", 
    "puto", 
    "queaf", 
    "queef", 
    "queerbait", 
    "queerhole", 
    "quim", 
    "raghead", 
    "raging boner", 
    "rape", 
    "raping", 
    "rapist", 
    "rectum", 
    "renob", 
    "retard", 
    "reverse cowgirl", 
    "rimjaw", 
    "rimjob", 
    "rimming", 
    "rosy palm", 
    "rosy palm and her 5 sisters", 
    "ruski", 
    "rusty trombone", 
    "s hit", 
    "s&m", 
    "s.o.b.", 
    "s_h_i_t", 
    "sadism", 
    "sadist", 
    "santorum", 
    "scat", 
    "schlong", 
    "scissoring", 
    "screwing", 
    "scroat", 
    "scrote", 
    "scrotum", 
    "semen", 
    "sex", 
    "sexo", 
    "sexy", 
    "sh!+", 
    "sh!t", 
    "sh1t", 
    "shag", 
    "shagger", 
    "shaggin", 
    "shagging", 
    "shaved beaver", 
    "shaved pussy", 
    "shemale", 
    "shi+", 
    "shibari", 
    "shit", 
    "shit-ass", 
    "shit-bag", 
    "shit-bagger", 
    "shit-brain", 
    "shit-breath", 
    "shit-cunt", 
    "shit-dick", 
    "shit-eating", 
    "shit-face", 
    "shit-faced", 
    "shit-fit", 
    "shit-head", 
    "shit-heel", 
    "shit-hole", 
    "shit-house", 
    "shit-load", 
    "shit-pot", 
    "shit-spitter", 
    "shit-stain", 
    "shitass", 
    "shitbag", 
    "shitbagger", 
    "shitblimp", 
    "shitbrain", 
    "shitbreath", 
    "shitcunt", 
    "shitdick", 
    "shite", 
    "shiteating", 
    "shited", 
    "shitey", 
    "shitface", 
    "shitfaced", 
    "shitfit", 
    "shitfuck", 
    "shitfull", 
    "shithead", 
    "shitheel", 
    "shithole", 
    "shithouse", 
    "shiting", 
    "shitings", 
    "shitload", 
    "shitpot", 
    "shits", 
    "shitspitter", 
    "shitstain", 
    "shitted", 
    "shitter", 
    "shitters ", 
    "shittiest", 
    "shitting", 
    "shittings", 
    "shitty", 
    "shitty ", 
    "shity", 
    "shiz", 
    "shiznit", 
    "shota", 
    "shrimping", 
    "skank", 
    "skeet", 
    "slanteye", 
    "slut", 
    "slutbag", 
    "sluts", 
    "smeg", 
    "smegma", 
    "smut", 
    "snatch", 
    "snowballing", 
    "sodomize", 
    "sodomy", 
    "son-of-a-bitch", 
    "spac", 
    "spic", 
    "spick", 
    "splooge", 
    "splooge moose", 
    "spooge", 
    "spread legs", 
    "spunk", 
    "strap on", 
    "strapon", 
    "strappado", 
    "strip club", 
    "style doggy", 
    "suicide girls", 
    "sultry women", 
    "swastika", 
    "swinger", 
    "t1tt1e5", 
    "t1tties", 
    "tainted love", 
    "tard", 
    "taste my", 
    "tea bagging", 
    "teets", 
    "teez", 
    "testical", 
    "testicle", 
    "threesome", 
    "throating", 
    "thundercunt", 
    "tied up", 
    "tight white", 
    "tit", 
    "titfuck", 
    "tits", 
    "titt", 
    "tittie5", 
    "tittiefucker", 
    "titties", 
    "titty", 
    "tittyfuck", 
    "tittywank", 
    "titwank", 
    "tongue in a", 
    "topless", 
    "tosser", 
    "towelhead", 
    "tranny", 
    "tribadism", 
    "tub girl", 
    "tubgirl", 
    "turd", 
    "tushy", 
    "tw4t", 
    "twat", 
    "twathead", 
    "twatlips", 
    "twatty", 
    "twink", 
    "twinkie", 
    "two girls one cup", 
    "twunt", 
    "twunter", 
    "undressing", 
    "upskirt", 
    "urethra play", 
    "urophilia", 
    "v14gra", 
    "v1gra", 
    "va-j-j", 
    "vag", 
    "vagina", 
    "venus mound", 
    "viagra", 
    "vibrator", 
    "violet wand", 
    "vjayjay", 
    "vorarephilia", 
    "voyeur", 
    "vulva", 
    "w00se", 
    "wang", 
    "wank", 
    "wanker", 
    "wanky", 
    "wet dream", 
    "wetback", 
    "white power", 
    "whoar", 
    "whore", 
    "willies", 
    "willy", 
    "wrapping men", 
    "wrinkled starfish", 
    "xrated", 
    "xxx", 
    "yaoi", 
    "yellow showers", 
    "yiffy", 
    "zoophilia", 
    "🖕", 
]


//// Users ////
export class User {
    public wearing: Wearing;
    constructor(public id: number, 
                public username: string, 
                        wearing: string | Wearing, 
                public wardrobe: string | IWardrobe, 
                public xp: number, 
                public clas: string,
                public rank: string, 
                public wins: number, 
                public loss: number, 
                public currency: number, 
                public faction: string, 
                public profile_text: string, 
                public born: string, 
                public last_seen: string, 
                public banned: string,
                ) {
        if(typeof wearing === 'string') this.wearing = constructWearing(wearing);
        else this.wearing = wearing;
        if(typeof wardrobe === 'string') this.wardrobe = constructWardrobe(wardrobe);
    }

    public toLeaderboardUser(): LeaderboardUser {
        return new LeaderboardUser(
            this.username,
            this.wearing,
            this.wins,
            this.profile_text
        );
    }
}

export interface ILeaderboardUser {
    username: string,
    wearing: Wearing | string,
    wins: number,
    profile_text: string,
}

export class LeaderboardUser {
    public username: string;
    public wearing: Wearing;
    public wins: number;
    public profile_text: string;

    constructor(username: string = '',
                wearing: Wearing | string= '', 
                wins: number = 0, 
                profile_text: string= '') {
        this.username = username;
        this.wins = wins;
        this.profile_text = profile_text;

        if(typeof wearing === 'string') this.wearing = constructWearing(wearing);
        else this.wearing = wearing;
    }

    public getEm() {
        return [(typeof this.wearing), this.wearing];
    }
}

export function leaderboardListBuilder(list: Array<ILeaderboardUser>, myUsername: string): [Array<LeaderboardUser>, LeaderboardUser, number] {
    let leaderBoardList: LeaderboardUser[] = [];
    let thisUser!: LeaderboardUser;
    let position = 0;

    list.forEach((userObject, i) => {
        leaderBoardList
            .push(
                new LeaderboardUser(userObject.username,
                                    userObject.wearing,
                                    userObject.wins,
                                    userObject.profile_text)
            );
        if(userObject.username === myUsername) {
            thisUser = new LeaderboardUser( userObject.username,
                                            userObject.wearing,
                                            userObject.wins,
                                            userObject.profile_text);
            position = i;
        }
            
    });

    return [leaderBoardList, thisUser, position];
}



//// Wearing ////

export const av_root_url:string = "/assets/images/avatar/";

export type ItemType = keyof typeof wearingUtils
export type SelectorsType = "base" | "hair" | "haircolour" | "eyes" | "blush" | "lips" | "beard" | "hat" | "glasses" | "upper" | "lower" | "shoes";
export function sTypetoIType(sType: SelectorsType) {
    return sType === "haircolour" ? "hair" : sType;
}

export const wearingUtils = {
    base: { 
        items: ["null", ""], 
        variants: [1, 8], 
    },
    eyes: { 
        items: ["null", ""], 
        variants: [1, 14], 
    },
    blush: { 
        items: ["null", ""], 
        variants: [1, 5], 
    },
    lips: { 
        items: ["null", ""], 
        variants: [1, 5], 
    },
    upper: {
        items: ["null", "shirt","stripeshirt","sportsshirt","spaghetti","skull","flowershirt","suit","dress","sailor","sailorbow","overalls","clown","pumpkin","spooky","witchdress"],
        variants: [ 1, 10,10,10,10,10,10,10,10,10,10,10,2,2,1,1 ],
        showLower: [ true,true,true,true,true,true,true,true,false,true,true,true,false,false,false,false ]
    },
    lower: { 
        items: ["null", "pants", "skirt", "suitpants", ], 
        variants: [1, 10, 10, 10], 
    },
    shoes: { 
        items: ["null", ""], 
        variants: [1, 10], 
    },
    hair: { 
        items: ["null", "gentleman","buzzcut","emo","bob","braids","curly","french","longcurly","longstraight","midiwave","ponytail","spacebuns","wavy"], 
        variants: [1, 14,14,14,14,14,14,14,14,14,14,14,14,14], 
    },
    beard: { 
        items: ["null", ""], 
        variants: [1, 14], 
    },
    glasses: { 
        items: ["null", "glasses", "sunglasses"], 
        variants: [1, 10,10], 
    },
    hat: { 
        items: ["null", "clown", "cowboy", "lucky", "pumpkin", "spooky", "witch"], 
        variants: [1, 2,1,1,2,1,1], 
    },
}

export class Wearing {
    constructor(
        public base =  {
            item: 1, 
            variant: 1
        },
        public eyes =  {
            item: 1, 
            variant: 1
        },
        public blush = {
            item: 1, 
            variant: 0
        },
        public lips =  {
            item: 1, 
            variant: 1
        },
        public upper = {
            item: 1, 
            variant: 1
        },
        public lower = {
            item: 1, 
            variant: 1
        },
        public shoes = {
            item: 1, 
            variant: 1
        },
        public hair = {
            item: 1, 
            variant: 1
        },
        public beard = {
            item: 1, 
            variant: 0
        },
        public glasses = {
            item: 1, 
            variant: 0
        },
        public hat =    {
            item: 1, 
            variant: 0
        },
    ) { }

    public src(itemType: ItemType):string {
        const item_id = wearingUtils[itemType].items[this[itemType].item];
        const src=  `${av_root_url}${itemType}` + 
                     (item_id !== "null" ? `/${item_id}` : "") + 
                    `/${this[itemType].variant}.png`;
        return src;
    }
}

export function constructWearing(wearing_string: any): Wearing {
    const parsed = (typeof wearing_string === "string") ? JSON.parse(wearing_string) : wearing_string;
    return new Wearing(
        parsed.base,
        parsed.eyes,
        parsed.blush,
        parsed.lips,
        parsed.upper,
        parsed.lower,
        parsed.shoes,
        parsed.hair,
        parsed.beard,
        parsed.glasses,
        parsed.hat
    );
}

export interface IWardrobeSlot {
    item: number,
    variant: number,
}

export interface IWardrobe {
    base: IWardrobeSlot[],
    eyes: IWardrobeSlot[],
    blush: IWardrobeSlot[],
    lips: IWardrobeSlot[],
    upper: IWardrobeSlot[],
    lower: IWardrobeSlot[],
    shoes: IWardrobeSlot[],
    hair: IWardrobeSlot[],
    beard: IWardrobeSlot[],
    glasses: IWardrobeSlot[],
    hat: IWardrobeSlot[],
}

export function generateDefaultWardrobe() {
    let wardrobe: IWardrobe = {
        base: [],
        eyes: [],
        blush: [],
        lips: [],
        upper: [],
        lower: [],
        shoes: [],
        hair: [],
        beard: [],
        glasses: [],
        hat: [],
    }
    //// Single Items       - All single variants
    for(let i = 0; i<wearingUtils.base.variants[1]; i++)    wardrobe.base.push({ item: 1, variant: i+1 });
    for(let i = 0; i<=wearingUtils.beard.variants[1]; i++)   wardrobe.beard.push({ item: 1, variant: i });
    for(let i = 0; i<=wearingUtils.blush.variants[1]; i++)   wardrobe.blush.push({ item: 1, variant: i });
    for(let i = 0; i<wearingUtils.lips.variants[1]; i++)    wardrobe.lips.push({ item: 1, variant: i+1 });
    for(let i = 0; i<wearingUtils.eyes.variants[1]; i++)    wardrobe.eyes.push({ item: 1, variant: i+1 });
    for(let i = 0; i<=wearingUtils.shoes.variants[1]; i++)   wardrobe.shoes.push({ item: 1, variant: i });

    //// Multi Items
    // lower                - All Lowers
    for(let i = 0; i<=wearingUtils.lower.variants[1]; i++) wardrobe.lower.push({ item: 1, variant: i });
    for(let i = 0; i<wearingUtils.lower.variants[2]; i++) wardrobe.lower.push({ item: 2, variant: i+1 });
    for(let i = 0; i<wearingUtils.lower.variants[3]; i++) wardrobe.lower.push({ item: 3, variant: i+1 });

    // Upper                - Only some uppers
    for(let i = 0; i <=wearingUtils.upper.variants[1]; i++) wardrobe.upper.push({ item: 1, variant: i });
    for(let i = 0; i < wearingUtils.upper.variants[2]; i++) wardrobe.upper.push({ item: 2, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[3]; i++) wardrobe.upper.push({ item: 3, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[4]; i++) wardrobe.upper.push({ item: 4, variant: i+1 });

    // Hair                 - All hairs
    wardrobe.hair.push({item: 0, variant: 0});
    for(let i=1; i<wearingUtils.hair.items.length; i++) {
        for(let k = 0; k<wearingUtils.hair.variants[i]; k++) 
            wardrobe.hair.push({ item: i, variant: k+1 });
    }
    
    return wardrobe;
}

export function generateFullWardrobe() {
    let wardrobe: IWardrobe = {
        base: [],
        eyes: [],
        blush: [],
        lips: [],
        upper: [],
        lower: [],
        shoes: [],
        hair: [],
        beard: [],
        glasses: [],
        hat: [],
    }
    //// Single Items       - All single variants
    for(let i = 0; i<wearingUtils.base.variants[1]; i++)    wardrobe.base.push({ item: 1, variant: i+1 });
    for(let i = 0; i<=wearingUtils.beard.variants[1]; i++)   wardrobe.beard.push({ item: 1, variant: i });
    for(let i = 0; i<=wearingUtils.blush.variants[1]; i++)   wardrobe.blush.push({ item: 1, variant: i });
    for(let i = 0; i<wearingUtils.lips.variants[1]; i++)    wardrobe.lips.push({ item: 1, variant: i+1 });
    for(let i = 0; i<wearingUtils.eyes.variants[1]; i++)    wardrobe.eyes.push({ item: 1, variant: i+1 });
    for(let i = 0; i<=wearingUtils.shoes.variants[1]; i++)   wardrobe.shoes.push({ item: 1, variant: i });

    //// Multi Items
    // lower                - All Lowers
    for(let i = 0; i<=wearingUtils.lower.variants[1]; i++) wardrobe.lower.push({ item: 1, variant: i });
    for(let i = 0; i<wearingUtils.lower.variants[2]; i++) wardrobe.lower.push({ item: 2, variant: i+1 });
    for(let i = 0; i<wearingUtils.lower.variants[3]; i++) wardrobe.lower.push({ item: 3, variant: i+1 });

    // Upper                - All Uppers
    for(let i = 0; i <=wearingUtils.upper.variants[1]; i++) wardrobe.upper.push({ item: 1, variant: i });
    for(let i = 0; i < wearingUtils.upper.variants[2]; i++) wardrobe.upper.push({ item: 2, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[3]; i++) wardrobe.upper.push({ item: 3, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[4]; i++) wardrobe.upper.push({ item: 4, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[5]; i++) wardrobe.upper.push({ item: 5, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[6]; i++) wardrobe.upper.push({ item: 6, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[7]; i++) wardrobe.upper.push({ item: 7, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[8]; i++) wardrobe.upper.push({ item: 8, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[9]; i++) wardrobe.upper.push({ item: 1, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[10]; i++) wardrobe.upper.push({ item: 10, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[11]; i++) wardrobe.upper.push({ item: 11, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[12]; i++) wardrobe.upper.push({ item: 12, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[13]; i++) wardrobe.upper.push({ item: 13, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[14]; i++) wardrobe.upper.push({ item: 14, variant: i+1 });
    for(let i = 0; i < wearingUtils.upper.variants[15]; i++) wardrobe.upper.push({ item: 15, variant: i+1 });

    // Hair                 - All hairs
    wardrobe.hair.push({item: 0, variant: 0});
    for(let i=1; i<wearingUtils.hair.items.length; i++) {
        for(let k = 0; k<wearingUtils.hair.variants[i]; k++) 
            wardrobe.hair.push({ item: i, variant: k+1 });
    }
    
    // Glasses              - All Glasses
    for(let i = 0; i<=wearingUtils.glasses.variants[1]; i++) wardrobe.glasses.push({ item: 1, variant: i });
    for(let i = 0; i<wearingUtils.glasses.variants[2]; i++) wardrobe.glasses.push({ item: 2, variant: i+1 });
    
    // Hat                  - All Hats
    for(let i = 0; i <=wearingUtils.hat.variants[1]; i++) wardrobe.hat.push({ item: 1, variant: i });
    for(let i = 0; i < wearingUtils.hat.variants[2]; i++) wardrobe.hat.push({ item: 2, variant: i+1 });
    for(let i = 0; i < wearingUtils.hat.variants[3]; i++) wardrobe.hat.push({ item: 3, variant: i+1 });
    for(let i = 0; i < wearingUtils.hat.variants[4]; i++) wardrobe.hat.push({ item: 4, variant: i+1 });
    for(let i = 0; i < wearingUtils.hat.variants[5]; i++) wardrobe.hat.push({ item: 5, variant: i+1 });
    for(let i = 0; i < wearingUtils.hat.variants[6]; i++) wardrobe.hat.push({ item: 6, variant: i+1 });

    return wardrobe;
}

export function constructWardrobe(wardrobe_string: string):IWardrobe {
    return JSON.parse(wardrobe_string);
}


interface IItem {
    index: number,
    source: string,
    present: boolean,
}

export interface IWearing {
    base: IItem,
    eyes: IItem,
    blush: IItem,
    lips: IItem,
    upper: IItem,
    lower: IItem,
    shoes: IItem,
    hair: IItem,
    beard: IItem,
    glasses: IItem,
    hat: IItem,
}

// export function generateBlankWearing() {
//     return {
//         base: {
//             index: 1,
//             source: "/assets/images/avatar/base/1.png",
//             present: true,
//         }, 
//         eyes: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//         blush: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//         lips: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//         upper: {
//             index: 1,
//             source: "/assets/images/avatar/upper/shirt/1.png",
//             present: true,
//         }, 
//         lower: {
//             index: 1,
//             source: "/assets/images/avatar/lower/pants/1.png",
//             present: true,
//         }, 
//         shoes: {
//             index: 1,
//             source: "/assets/images/avatar/shoes/1.png",
//             present: true,
//         }, 
//         hair: {
//             index: 2,
//             source: "/assets/images/avatar/hair/gentleman/2.png",
//             present: true,
//         }, 
//         beard: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//         glasses: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//         hat: {
//             index: 0,
//             source: "/assets/images/avatar/",
//             present: false,
//         }, 
//     }
// }