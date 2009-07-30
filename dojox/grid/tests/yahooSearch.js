dojo.declare("YahooStore", dojox.data.ServiceStore, {
	_processResults: function(results, def){
		var totalCount = 0;
		if(results.ResultSet){
			totalCount = results.ResultSet.totalResultsAvailable;
			results = results.ResultSet.Result;
		}
		var resultSet = this.inherited(arguments);
		resultSet.totalCount = totalCount > 1000 ? 1000 : totalCount;
		return resultSet;
	},
	fetch: function(request){
		if(request.query){
			if(request.count){
				request.query['results'] = request.count;
			}
			if(typeof request.start != "undefined"){
				request.query['start'] = request.start + 1;
			}
		}

		return this.inherited(arguments);
	}
});

var getCellData = function(item, field){
	return grid.store.getValue(item, field);
};

var getLink = function(inRowIndex, inItem){
	if(!inItem){ return '&nbsp;'; }
	var text = getCellData(inItem, 'Title');
	var link = getCellData(inItem, 'ClickUrl');
	return dojo.string.substitute(
		'<a target="_blank" href="${href}">${text}</a>', 
		{ href: link, text: text }
	);
};

var formatDate = function(inDatum, inRowIndex){
	if(!inDatum){ return '&nbsp;'; }
	var d = new Date(inDatum * 1000);
	return dojo.string.substitute(
		"${0}/${1}/${2}",
		[ d.getMonth()+1, d.getDate(), d.getFullYear() ]
	);
};

var getImage = function(inRowIndex, inItem){
	if(!inItem){ return '&nbsp;'; }
	var thumb = getCellData(inItem, "Thumbnail");
	if (thumb) {
		var o = {
			href: getCellData(inItem, "ClickUrl"),
			src: thumb.Url,
			width: thumb.Width,
			height: thumb.Height
		}
		return dojo.string.substitute(
			'<a href="${href}" target="_blank"><img border=0 src="${src}" width="${width}" height="${height}"></a>', o);
	}
	console.warn("Could not get image.");
	return '';
};

var getDimensions = function(inRowIndex, inItem){
	if(!inItem){ return '&nbsp;'; }
	var w = getCellData(inItem, "Width");
	var h = getCellData(inItem, "Height");
	return w + ' x ' + h;
};
