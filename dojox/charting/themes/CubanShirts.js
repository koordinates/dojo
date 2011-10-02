define(["../Theme", "./common"], function(Theme, themes){

	//	notes: colors generated by moving in 30 degree increments around the hue circle,
	//		at 90% saturation, using a B value of 75 (HSB model).
	themes.CubanShirts=new Theme({
		colors: [
			"#d42d2a",
			"#004f80",
			"#989736",
			"#2085c7",
			"#7f7f33"
		]
	});
	
	return themes.CubanShirts;
});
