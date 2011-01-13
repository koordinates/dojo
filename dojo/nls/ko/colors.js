define(
//begin v1.x content
({
// local representation of all CSS3 named colors, companion to dojo.colors.  To be used where descriptive information
// is required for each color, such as a palette widget, and not for specifying color programatically.

//Note: due to the SVG 1.0 spec additions, some of these are alternate spellings for the same color e.g. gray vs. gray. 
//TODO: should we be using unique rgb values as keys instead and avoid these duplicates, or rely on the caller to do the reverse mapping?
aliceblue: "앨리스 블루(alice blue)",
antiquewhite: "앤틱 화이트(antique white)",
aqua: "아쿠아(aqua)",
aquamarine: "아쿠아마린(aquamarine)",
azure: "애쥬어(azure)",
beige: "베이지(beige)",
bisque: "비스크(bisque)",
black: "블랙(black)",
blanchedalmond: "블랜치 아몬드(blanched almond)",
blue: "블루(blue)",
blueviolet: "블루 바이올렛(blue-violet)",
brown: "브라운(brown)",
burlywood: "벌리우드(burlywood)",
cadetblue: "카뎃 블루(cadet blue)",
chartreuse: "샤르트뢰즈(chartreuse)",
chocolate: "초콜렛(chocolate)",
coral: "코랄(coral)",
cornflowerblue: "콘플라워 블루(cornflower blue)",
cornsilk: "콘실크(cornsilk)",
crimson: "크림슨(crimson)",
cyan: "시안(cyan)",
darkblue: "다크 블루(dark blue)",
darkcyan: "다크 시안(dark cyan)",
darkgoldenrod: "다크 골든로드(dark goldenrod)",
darkgray: "다크 그레이(dark gray)",
darkgreen: "다크 그린(dark green)",
darkgrey: "다크 그레이(dark gray)", // same as darkgray
darkkhaki: "다크 카키(dark khaki)",
darkmagenta: "다크 마젠타(dark magenta)",
darkolivegreen: "다크 올리브 그린(dark olive green)",
darkorange: "다크 오렌지(dark orange)",
darkorchid: "다크 오키드(dark orchid)",
darkred: "다크 레드(dark red)",
darksalmon: "다크 샐몬(dark salmon)",
darkseagreen: "다크 씨 그린(dark sea green)",
darkslateblue: "다크 슬레이트 블루(dark slate blue)",
darkslategray: "다크 슬레이트 그레이(dark slate gray)",
darkslategrey: "다크 슬레이트 그레이(dark slate gray)", // same as darkslategray
darkturquoise: "다크 터콰즈(dark turquoise)",
darkviolet: "다크 바이올렛(dark violet)",
deeppink: "딥 핑크(deep pink)",
deepskyblue: "딥 스카이 블루(deep sky blue)",
dimgray: "딤 그레이(dim gray)",
dimgrey: "딤 그레이(dim gray)", // same as dimgray
dodgerblue: "다저 블루(dodger blue)",
firebrick: "파이어 브릭(fire brick)",
floralwhite: "플로랄 화이트(floral white)",
forestgreen: "포레스트 그린(forest green)",
fuchsia: "후크샤(fuchsia)",
gainsboro: "게인스브로(gainsboro)",
ghostwhite: "고스트 화이트(ghost white)",
gold: "골드(gold)",
goldenrod: "골든로드(goldenrod)",
gray: "그레이(gray)",
green: "그린(green)",
greenyellow: "그린 옐로우(green-yellow)",
grey: "그레이(gray)", // same as gray
honeydew: "허니듀(honeydew)",
hotpink: "핫 핑크(hot pink)",
indianred: "인디안 레드(indian red)",
indigo: "인디고(indigo)",
ivory: "아이보리(ivory)",
khaki: "카키(khaki)",
lavender: "라벤더(lavender)",
lavenderblush: "라벤더 블러쉬(lavender blush)",
lawngreen: "론 그린(lawn green)",
lemonchiffon: "레몬 쉬폰(lemon chiffon)",
lightblue: "라이트 블루(light blue)",
lightcoral: "라이트 코랄(light coral)",
lightcyan: "라이트 시안(light cyan)",
lightgoldenrodyellow: "라이트 골든로드 옐로우(light goldenrod yellow)",
lightgray: "라이트 그레이(light gray)",
lightgreen: "라이트 그린(light green)",
lightgrey: "라이트 그레이(light gray)", // same as lightgray
lightpink: "라이트 핑크(light pink)",
lightsalmon: "라이트 샐몬(light salmon)",
lightseagreen: "라이트 씨 그린(light sea green)",
lightskyblue: "라이트 스카이 블루(light sky blue)",
lightslategray: "라이트 슬레이트 그레이(light slate gray)",
lightslategrey: "라이트 슬레이트 그레이(light slate gray)", // same as lightslategray
lightsteelblue: "라이트 스틸 블루(light steel blue)",
lightyellow: "라이트 옐로우(light yellow)",
lime: "라임(lime)",
limegreen: "라임 그린(lime green)",
linen: "리넨(linen)",
magenta: "마젠타(magenta)",
maroon: "마룬(maroon)",
mediumaquamarine: "미디엄 아쿠아마린(medium aquamarine)",
mediumblue: "미디엄 블루(medium blue)",
mediumorchid: "미디엄 오키드(medium orchid)",
mediumpurple: "미디엄 퍼플(medium purple)",
mediumseagreen: "미디엄 씨 그린(medium sea green)",
mediumslateblue: "미디엄 슬레이트 블루(medium slate blue)",
mediumspringgreen: "미디엄 스프링 그린(medium spring green)",
mediumturquoise: "미디엄 터콰즈(medium turquoise)",
mediumvioletred: "미디엄 바이올렛 레드(medium violet-red)",
midnightblue: "미드나잇 블루(midnight blue)",
mintcream: "민트 크림(mint cream)",
mistyrose: "미스티 로즈(misty rose)",
moccasin: "모카신(moccasin)",
navajowhite: "나바호 화이트(navajo white)",
navy: "네이비(navy)",
oldlace: "올드 레이스(old lace)",
olive: "올리브(olive)",
olivedrab: "올리브 드랩(olive drab)",
orange: "오렌지(orange)",
orangered: "오렌지 레드(orange red)",
orchid: "오키드(orchid)",
palegoldenrod: "페일 골든로드(pale goldenrod)",
palegreen: "페일 그린(pale green)",
paleturquoise: "페일 터콰즈(pale turquoise)",
palevioletred: "페일 바이올렛 레드(pale violet-red)",
papayawhip: "파파야 휩(papaya whip)",
peachpuff: "피치 퍼프(peach puff)",
peru: "페루(peru)",
pink: "핑크(pink)",
plum: "플럼(plum)",
powderblue: "파우더 블루(powder blue)",
purple: "퍼플(purple)",
red: "레드(red)",
rosybrown: "로지 브라운(rosy brown)",
royalblue: "로얄 블루(royal blue)",
saddlebrown: "새들 브라운(saddle brown)",
salmon: "샐몬(salmon)",
sandybrown: "샌디 브라운(sandy brown)",
seagreen: "씨 그린(sea green)",
seashell: "씨쉘(seashell)",
sienna: "시에나(sienna)",
silver: "실버(silver)",
skyblue: "스카이 블루(sky blue)",
slateblue: "슬레이트 블루(slate blue)",
slategray: "슬레이트 그레이(slate gray)",
slategrey: "슬레이트 그레이(slate gray)", // same as slategray
snow: "스노우(snow)",
springgreen: "스프링 그린(spring green)",
steelblue: "스틸 블루(steel blue)",
tan: "탠(tan)",
teal: "틸(teal)",
thistle: "시슬(thistle)",
tomato: "토마토(tomato)",
turquoise: "터콰즈(turquoise)",
violet: "바이올렛(violet)",
wheat: "휘트(wheat)",
white: "화이트(white)",
whitesmoke: "화이트 스모크(white smoke)",
yellow: "옐로우(yellow)",
yellowgreen: "옐로우 그린(yellow green)"
})
//end v1.x content
);
