define(["../Theme", "./common"], function(Theme, themes){
	//	notes: colors generated by moving in 30 degree increments around the hue circle,
	//		at 90% saturation, using a B value of 75 (HSB model).
	themes.Shrooms = new Theme({
		colors: [
			"#bf1313", // 0
			"#69bf13", // 90
			"#13bfbf", // 180
			"#6913bf", // 270
			"#bf6913", // 30
			"#13bf13", // 120
			"#1369bf", // 210
			"#bf13bf", // 300
			"#bfbf13", // 60
			"#13bf69", // 150
			"#1313bf", // 240
			"#bf1369"  // 330
		]
	});
	
	return themes.Shrooms;
});
