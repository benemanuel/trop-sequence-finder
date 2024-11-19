const $ = document.querySelector.bind(document);
const TROP = [
    { "char": "\u05a8", "name": "kadma", "color": "darksalmon", "heb": "קַדְמָ֨א", "examples": ["בָּרָ֙א", "בָּ֙רָא"] },
    { "char": "\u05a3", "name": "munakh", "color": "darkslategray", "heb": "מֻנַּ֣ח", "examples": ["בָּרָ֣א", "בָּ֣רָא"] },
    { "char": "\u05ae", "name": "zarka", "color": "darkcyan", "heb": "זַרְקָא֮", "examples": ["בָּרָ֘א"] },
    { "char": "\u0592", "name": "segol", "color": "darkgoldenrod", "heb": "סֶגוֹל֒", "examples": ["בָּרָ֒א"] },
    { "char": "\u0597", "name": "revii", "color": "darkgreen", "heb": "רְבִיעִ֗י", "examples": ["בָּ֗רָא", "בָּרָ֗א"] },
    { "char": "\u05a4", "name": "mapakh", "color": "darkcyan", "heb": "מַהְפַּ֤ך", "examples": ["בָּ֤רָא", "בָּרָ֤א"] },
    { "char": "\u0599", "name": "pashta", "color": "darkgoldenrod", "heb": "פַּשְׁטָא֙", "examples": ["בָּרָָא֙", "בָּ֙רָָא֙"] },
    { "char": "\u0594", "name": "katan", "color": "darkgreen", "heb": "קָטָ֔ן", "examples": ["בָּ֔רָא", "בָּרָ֔א"] },
    { "char": "\u0595", "name": "gadol", "color": "darkgreen", "heb": "גָּד֕וֹל", "examples": ["בָּ֕רָא", "בָּרָ֕א"] },
    { "char": "\u05a5", "name": "merkha", "color": "darkslategray", "heb": "מֵרְכָ֥א", "examples": ["בָּרָ֥א"] },
    { "char": "\u0596", "name": "tipkha", "color": "darkslategray", "heb": "טִפְּחָ֖א", "examples": ["בָּרָ֖א", "בָּ֖רָא"] },
    { "char": "\u0591", "name": "etnakhta", "color": "indianred", "heb": "אֶתְנַחְתָּ֑א", "examples": ["בָּרָ֑א", "בָּ֑רָא"] },
    { "char": "\u05a1", "name": "pazer", "color": "darkcyan", "heb": "פָּזֵ֡ר", "examples": ["בָּ֡רָא", "בָּרָ֡א"] },
    { "char": "\u05a9", "name": "telishaketana", "color": "purple", "heb": "תְּלִישָא קְטַנָּה֩", "examples": ["בָּרָא֩", "בָּ֩רָא֩"] },
    { "char": "\u05a0", "name": "telishagedola", "color": "purple", "heb": "תְּ֠לִישָא גְדוֹלָה", "examples": ["בָּ֠רָא", "בָּ֠רָ֠א"] },
    { "char": "\u059c", "name": "geresh", "color": "darkcyan", "heb": "גֵּ֜רֵשׁ", "examples": ["בָּרָ֜א"] },
    { "char": "\u059e", "name": "gershayim", "color": "darkcyan", "heb": "גֵּרְשַׁ֞יִם", "examples": ["בָּרָ֞א", "בָּ֞רָא"] },
    { "char": "\u05a7", "name": "darga", "color": "darkgoldenrod", "heb": "דַּרְגָּ֧א", "examples": ["בּ֧רָא", "בָּרָ֧א"] },
    { "char": "\u059b", "name": "tevir", "color": "darkgreen", "heb": "תְּבִ֛יר", "examples": ["בָּרָ֛א", "בָּ֛רָא"] },
    { "char": "\u059a", "name": "yetiv", "color": "darksalmon", "heb": "יְ֚תִיב", "examples": ["בָּ֚רָא"] },
    { "char": "\u05c3", "name": "sofpasuk", "color": "indianred", "heb": "סוֹף פָּסֽוּק׃", "examples": ["בָּרָֽא׃", "בָּרָֽא׃"] },
    // { "char": "\u0593", "name": "shalshelet", "color": "dodgerblue", "heb": "שַׁלְשֶׁ֓לֶת", "examples": [] },
    // { "char": "\u05a6", "name": "merkhakfula", "color": "dodgerblue", "heb": "מֵרְכָא־כְפוּלָ֦ה", "examples": [] },
    // { "char": "\u059f", "name": "karnepara", "color": "dodgerblue", "heb": "קַרְנֵי פָרָ֟ה", "examples": [] },
    // { "char": "\u05aa", "name": "yerakhbenyomo", "color": "dodgerblue", "heb": "יֵרֶח בֶּן יוֹמ֪וֹ", "examples": [] },
    // { "char": "\u0598", "name": "tsinnorit", "color": "dodgerblue", "heb": "צִנּוֹרִת֘", "examples": [] },
    // { "char": "\u059d", "name": "gereshmukdam", "color": "dodgerblue", "examples": [] },
];
const TROP_M = Object.fromEntries(TROP.map(t => [t.name, t]));
const SEQUENCES = [
    [TROP_M.kadma, TROP_M.mapakh, TROP_M.pashta, TROP_M.katan],
    [TROP_M.gershayim, TROP_M.mapakh, TROP_M.pashta, TROP_M.katan],
    [TROP_M.zarka, TROP_M.segol, TROP_M.revii, TROP_M.pashta, TROP_M.katan],
    [TROP_M.munakh, TROP_M.katan, TROP_M.tipkha, TROP_M.sofpasuk],
    [TROP_M.munakh, TROP_M.munakh, TROP_M.revii],
    [TROP_M.merkha, TROP_M.tipkha, TROP_M.sofpasuk],
    [TROP_M.gadol, TROP_M.merkha, TROP_M.tipkha, TROP_M.sofpasuk],
    [TROP_M.darga, TROP_M.tevir, TROP_M.merkha, TROP_M.tipkha, TROP_M.sofpasuk],
    [TROP_M.tipkha, TROP_M.merkha, TROP_M.sofpasuk],
    [TROP_M.pazer, TROP_M.telishaketana, TROP_M.kadma, TROP_M.geresh, TROP_M.revii],
]

let pack = TROP;
let deck = [...pack];
let current = undefined;

let showExample = false;

function setCurrent(value) {
    current = value;
    updateCard();
}

function updateCard() {
    const value = current;
    if (value) {
        const getExample = (t) => t.examples[Math.floor(Math.random() * t.examples.length)];
        const getText = showExample ? getExample : (t) => t.heb;
        const str = Array.isArray(value) ? value.map(getText).join(" ") : getText(value);
        $("#current-trop").textContent = str;
    }
    else  {
        $("#current-trop").textContent = "";
    }
    $("#remaining").textContent = `${deck.length} remaining`;
}

function pick() {
    if (deck.length) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        // this line also REMOVES the selected trop from the deck
        const randomTrop = deck.splice(randomIndex, 1)[0];
        setCurrent(randomTrop);
    }
}

function resetDeck() {
    deck = [...pack];
    setCurrent(undefined);
}
setCurrent(undefined)

function changeDisplay(target) {
    showExample = target.value === "example";
    updateCard();
}
function changePack(target) {
    pack = target.value === "single" ? TROP : SEQUENCES;
    deck = [...pack];
    setCurrent(undefined)
}