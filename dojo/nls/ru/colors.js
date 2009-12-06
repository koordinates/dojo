({
// local representation of all CSS3 named colors, companion to dojo.colors.  To be used where descriptive information
// is required for each color, such as a palette widget, and not for specifying color programatically.

//Note: due to the SVG 1.0 spec additions, some of these are alternate spellings for the same color e.g. gray vs. gray. 
//TODO: should we be using unique rgb values as keys instead and avoid these duplicates, or rely on the caller to do the reverse mapping?
aliceblue: "серо-голубой",
antiquewhite: "белый антик",
aqua: "зеленовато-голубой",
aquamarine: "аквамарин",
azure: "лазурный",
beige: "бежевый",
bisque: "бисквитный",
black: "черный",
blanchedalmond: "светло-миндальный",
blue: "синий",
blueviolet: "сине-фиолетовый",
brown: "коричневый",
burlywood: "светло-коричневый",
cadetblue: "серо-синий",
chartreuse: "желто-салатный",
chocolate: "шоколадный",
coral: "коралловый",
cornflowerblue: "фиолетово-синий",
cornsilk: "шелковый оттенок",
crimson: "малиновый",
cyan: "циан",
darkblue: "темно-синий",
darkcyan: "темный циан",
darkgoldenrod: "темно-золотистый",
darkgray: "темно-серый",
darkgreen: "темно-зеленый",
darkgrey: "темно-серый", // same as darkgray
darkkhaki: "темный хаки",
darkmagenta: "темно-пурпурный",
darkolivegreen: "темно-оливковый",
darkorange: "темно-оранжевый",
darkorchid: "темный орсель",
darkred: "темно-красный",
darksalmon: "темно-лососевый",
darkseagreen: "темный морской волны",
darkslateblue: "темный грифельно-синий",
darkslategray: "темный грифельно-серый",
darkslategrey: "темный грифельно-серый", // same as darkslategray
darkturquoise: "темный бирюзовый",
darkviolet: "темно-фиолетовый",
deeppink: "темно-розовый",
deepskyblue: "темный небесно-голубой",
dimgray: "тускло-серый",
dimgrey: "тускло-серый", // same as dimgray
dodgerblue: "бледно-синий",
firebrick: "кирпичный",
floralwhite: "цветочно-белый",
forestgreen: "зеленый лесной",
fuchsia: "фуксин",
gainsboro: "бледно-серый",
ghostwhite: "призрачно-белый",
gold: "золотой",
goldenrod: "золотистый",
gray: "серый",
green: "зеленый",
greenyellow: "зелено-желтый",
grey: "серый", // same as gray
honeydew: "медовый",
hotpink: "красно-розовый",
indianred: "индийский красный",
indigo: "индиго",
ivory: "слоновой кости",
khaki: "хаки",
lavender: "бледно-лиловый",
lavenderblush: "розовато-лиловый",
lawngreen: "зеленая лужайка",
lemonchiffon: "бледно-лимонный",
lightblue: "светло-синий",
lightcoral: "светло-коралловый",
lightcyan: "светлый циан",
lightgoldenrodyellow: "светло-золотистый",
lightgray: "светло-серый",
lightgreen: "светло-зеленый",
lightgrey: "светло-серый", // same as lightgray
lightpink: "светло-розовый",
lightsalmon: "светло-лососевый",
lightseagreen: "светлый морской волны",
lightskyblue: "светлый небесно-голубой",
lightslategray: "светлый грифельно-серый",
lightslategrey: "светлый грифельно-серый", // same as lightslategray
lightsteelblue: "светлый стальной",
lightyellow: "светло-желтый",
lime: "лайм",
limegreen: "зеленый лайм",
linen: "хлопковый",
magenta: "пурпурный",
maroon: "темно-бордовый",
mediumaquamarine: "нейтральный аквамарин",
mediumblue: "нейтральный синий",
mediumorchid: "нейтральный орсель",
mediumpurple: "нейтральный фиолетовый",
mediumseagreen: "нейтральный морской волны",
mediumslateblue: "нейтральный грифельно-синий",
mediumspringgreen: "нейтральный весенне-зеленый",
mediumturquoise: "нейтральный бирюзовый",
mediumvioletred: "нейтральный фиолетово-красный",
midnightblue: "полуночно-синий",
mintcream: "мятно-кремовый",
mistyrose: "блекло-розовый",
moccasin: "мокасин",
navajowhite: "белый навахо",
navy: "темно-синий",
oldlace: "матово-белый",
olive: "оливковый",
olivedrab: "желтовато-серый",
orange: "оранжевый",
orangered: "оранжево-красный",
orchid: "орсель",
palegoldenrod: "бледно-золотистый",
palegreen: "бледно-зеленый",
paleturquoise: "бледно-бирюзовый",
palevioletred: "бледный фиолетово-красный",
papayawhip: "черенок папайи",
peachpuff: "персиковый",
peru: "перу",
pink: "розовый",
plum: "сливовый",
powderblue: "пороховой",
purple: "фиолетовый",
red: "красный",
rosybrown: "розово-коричневый",
royalblue: "королевский голубой",
saddlebrown: "кожано-коричневый",
salmon: "лососевый",
sandybrown: "коричнево-песчаный",
seagreen: "морской волны",
seashell: "морская раковина",
sienna: "охра",
silver: "серебристый",
skyblue: "небесно-голубой",
slateblue: "грифельно-синий",
slategray: "грифельно-серый",
slategrey: "грифельно-серый", // same as slategray
snow: "белоснежный",
springgreen: "весенний зеленый",
steelblue: "стальной",
tan: "рыжевато-коричневый",
teal: "чирок",
thistle: "чертополох",
tomato: "помидор",
turquoise: "бирюзовый",
violet: "фиолетовый",
wheat: "пшеница",
white: "белый",
whitesmoke: "дымчато-белый",
yellow: "желтый",
yellowgreen: "желто-зеленый"
})
