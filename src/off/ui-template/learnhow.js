window.onload = function(){
	// get the app name from our URL
	var href = window.location.href;
	var matches = href.match(/appName=([a-z0-9 ]*)/i);
	var appName = "Application";
	if(matches && matches.length > 0){
		appName = decodeURIComponent(matches[1]);
	}
	
	// set it in our UI
	var appNameSpan = document.getElementById("dot-learn-how-app-name");
	appNameSpan.innerHTML = "";
	appNameSpan.appendChild(document.createTextNode(appName));
	
	// get whether we need an offline cache
	var requireOfflineCache = true;
	matches = href.match(/requireOfflineCache=(true|false)/);
	if(matches && matches.length > 0){
		requireOfflineCache = matches[1];
		// transform from string to boolean
		requireOfflineCache = (requireOfflineCache == "true") ? true : false;
	}
	
	// update UI based on whether an offline cache is needed
	if(requireOfflineCache == false){
		// delete DOT reference
		var toolkitInfo = document.getElementById("dot-toolkit-info");
		toolkitInfo.parentNode.removeChild(toolkitInfo);
		
		// delete download and install steps
		var downloadStep = document.getElementById("dot-download-step");
		var installStep = document.getElementById("dot-install-step");
		downloadStep.parentNode.removeChild(downloadStep);
		installStep.parentNode.removeChild(installStep);
	}
	
	// if we need an offline cache, and we already have one installed,
	// update the UI
	matches = href.match(/hasOfflineCache=(true|false)/);
	var hasOfflineCache = false;
	if(matches && matches.length > 0){
		hasOfflineCache = matches[1];
		// convert to boolean
		hasOfflineCache = (hasOfflineCache == "true") ? true : false;
	}
	if(requireOfflineCache == true && hasOfflineCache == true){
		// delete the download and install steps
		var downloadStep = document.getElementById("dot-download-step");
		var installStep = document.getElementById("dot-install-step");
		downloadStep.parentNode.removeChild(downloadStep);
		installStep.parentNode.removeChild(installStep);
	}
	
	// get our run link info and update the UI
	matches = href.match(/runLink=([^\&]*)\&runLinkText=(.*)$/);
	if(matches && matches.length > 0){
		var runLink = decodeURIComponent(matches[1]);
		var runLinkElem = document.getElementById("dot-learn-how-run-link");
		runLinkElem.setAttribute("href", runLink);
		
		var runLinkText = decodeURIComponent(matches[2]);
		runLinkElem.innerHTML = "";
		runLinkElem.appendChild(document.createTextNode(runLinkText));
	}
}