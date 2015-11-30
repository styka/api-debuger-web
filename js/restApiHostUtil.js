function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)), sURLVariables = sPageURL
			.split('&'), sParameterName, i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};
var restApiHost = getUrlParameter('restApiHost');
function getUrl(url) {
	if (restApiHost != null && restApiHost != "") {
		return restApiHost + url;
	} else {
		return url;
	}
}