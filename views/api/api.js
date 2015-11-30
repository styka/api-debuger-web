
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var app = angular.module('app', [ 'ngResource' ]);
app.controller('Api', function($scope, $http, $resource) {
	
	$scope.apiRequestMappings = new Array();
	$scope.apiRequestResponseParameters = null;
	$scope.resultsAsJSON = false;
	$scope.resultsInTransposition = null;
	$scope.apiRequestMappingChangeView = false;
	$scope.apiRequestMappingsFilter = {};
	
	$scope.switchResultsAsJSON = function() {
		$scope.resultsAsJSON = !$scope.resultsAsJSON;
	}

	$scope.switchResultsInTransposition = function() {
		if($scope.resultsInTransposition==null){
			$scope.resultsInTransposition=true;
		}else if($scope.resultsInTransposition){
			$scope.resultsInTransposition=false;
		}else{
			$scope.resultsInTransposition=null;
		}
	}

	$scope.setCSS = function(url,themeId) {
		document.all.cssFile.href = url;
		document.all.themeStandard.style.fontWeight="normal";
		document.all.themeSlate.style.fontWeight="normal";
		document.getElementById(themeId).style.fontWeight="bold";
	}
	
	$scope.load = function() {
		$scope.setCSS("http://bootswatch.com/slate/bootstrap.css","themeSlate");
		$scope.restApiHost = restApiHost;
		$scope.apiRequestMappingsFilter.methodGET=true;
		$scope.apiRequestMappingsFilter.methodPOST=true;
		$scope.apiRequestMappingsFilter.methodPUT=true;
		$scope.apiRequestMappingsFilter.methodDELETE=true;
		$scope.loadApiRequestMappings();
	}
	
	$scope.setCurrentApiController = function(apiController) {
		$scope.currentApiController = apiController;
		$scope.getApiRequestMappings($scope.currentApiController.id);
		$scope.refreshNavi();
	};
	
	$scope.refreshNavi = function() {
		if($scope.selectedApiRequestMapping!=null){
			for(apiRequestMapping of $scope.apiRequestMappings){
				apiRequestMapping.class = (apiRequestMapping.id==$scope.selectedApiRequestMapping.id) ? "active" : "";
			}
		}
	};

	$scope.loadApiRequestMappings = function(){
		$http.get(getUrl('/api/apiRequestMappings')).success(function(apiRequestMappings) {
			$scope.apiRequestMappings = apiRequestMappings;
		});
	}
	
	$scope.selectApiRequestMapping = function(apiRequestMapping){
		$scope.selectedApiRequestMapping = apiRequestMapping;
		$scope.clearResults();
		var url = '/api/apiRequestGetParameter/search/'+apiRequestMapping.id;
		$http.get(getUrl(url)).success(function(apiRequestParameters) {
			$scope.currentApiRequestParameters = apiRequestParameters;
			if($scope.selectedApiRequestMapping.method=="GET" && $scope.currentApiRequestParameters.length==0){
				$scope.executeSelectedApiRequestMapping();
			}
		});
		var url = '/api/apiRequestPostPutParameter/search/'+apiRequestMapping.id;
		$http.get(getUrl(url)).success(function(apiRequestPostPutParameters) {
			$scope.currentApiRequestPostPutParameters = apiRequestPostPutParameters;
		});
		$scope.apiRequestMappingChangeView=false;
		
		for(var i=0; i < $scope.apiRequestMappings.length; i++){
			var apiRequestMapping = $scope.apiRequestMappings[i];
			apiRequestMapping.active = (apiRequestMapping.id==$scope.selectedApiRequestMapping.id ? "active" : "");
		}
		
		$scope.refreshNavi();
	}

	$scope.clearResults = function(){
		$scope.results = null;
		$scope.responseInfo = null;
		$scope.waitInfo = null;
	}

	$scope.executeSelectedApiRequestMapping = function(){
		var url = getUrl($scope.selectedApiRequestMapping.value);
		for(var i=0; i < $scope.currentApiRequestParameters.length; i++){
			var currentApiRequestParameter = $scope.currentApiRequestParameters[i];
			url=url.replace('{'+currentApiRequestParameter.name+'}', currentApiRequestParameter.value);
		}
		for(var i=0; i < $scope.currentApiRequestPostPutParameters.length; i++){
			var currentApiRequestPostPutParameter = $scope.currentApiRequestPostPutParameters[i];
			url=url.replace('{'+currentApiRequestPostPutParameter.name+'}', currentApiRequestPostPutParameter.value);
		}
		$scope.clearResults();
		$scope.waitInfo = 'wait for '+$scope.selectedApiRequestMapping.method+' '+url+'...';
		if($scope.selectedApiRequestMapping.method=="GET"){
			$scope.callGetRequest(url);
		}else if($scope.selectedApiRequestMapping.method=="DELETE"){
			$scope.callDeleteRequest(url);
		}else if($scope.selectedApiRequestMapping.method=="PUT"){
			$scope.callPutRequest(url);
		}else if($scope.selectedApiRequestMapping.method=="POST"){
			$scope.callPostRequest(url);
		}
	}

	$scope.callGetRequest = function(url){
		var urlForApiRequestResponseParameter = '/api/apiRequestResponseParameter/search/'+$scope.selectedApiRequestMapping.id;
		$http.get(getUrl(urlForApiRequestResponseParameter)).success(function(apiRequestResponseParameters) {
			$scope.apiRequestResponseParameters = apiRequestResponseParameters;
			$http.get(url).success(function(results) {
				$scope.waitInfo = null;
				if(results==null){
					$scope.results = null;
					$scope.responseInfo = "No results";
					return;
				}
				if(!Array.isArray(results)){
					$scope.results = new Array();
					$scope.results.push(results);
				}else{
					$scope.results = results;
				}
				$scope.resultsAsArray = new Array();
				for(var i=0; i<$scope.results.length; i++){
					var item = $scope.results[i];
					var keys = Object.keys(item);
					resultAsArray = new Array();
					for(var j=0; j<$scope.apiRequestResponseParameters.length; j++){
						var apiRequestResponseParameter = $scope.apiRequestResponseParameters[j];
						resultAsArray.push(item[apiRequestResponseParameter.name]);
					}
					$scope.resultsAsArray.push(resultAsArray);
				}
				$scope.responseInfo = $scope.results.length > 0 ? "Rows: " + $scope.results.length : "No results";
				
			}).error(function (error, status, headers, config) {
				$scope.waitInfo = null;
				$scope.responseInfo = "ERROR: " + error.message;
		    });
			
		});
	}

	$scope.callDeleteRequest = function(url){
		$http.delete(url).success(function() {
			$scope.waitInfo = null;
			$scope.responseInfo = "Deleted";
		}).error(function (error, status, headers, config) {
			$scope.waitInfo = null;
			$scope.responseInfo = "ERROR: " + error.message;
	    });
	}

	$scope.callPutRequest = function(url){
		var object = {};
		for(var i=0; i < $scope.currentApiRequestPostPutParameters.length; i++){
			var currentApiRequestPostPutParameter = $scope.currentApiRequestPostPutParameters[i];
			object[currentApiRequestPostPutParameter.name]=currentApiRequestPostPutParameter.value;
		}
		var resource = $resource(url,null,{
		    'update': { method:'PUT' }
		});
		resource.update(object, function(results) {
			$scope.waitInfo = null;
			$scope.responseInfo = "Updated ["+ object.id +"] ";
		}, function(error) {
			$scope.waitInfo = null;
			$scope.responseInfo = "ERROR: " + (error.message!=null ? error.message : error.statusText);
		});
	}

	$scope.callPostRequest = function(url){
		var object = {};
		for(var i=0; i < $scope.currentApiRequestPostPutParameters.length; i++){
			var currentApiRequestPostPutParameter = $scope.currentApiRequestPostPutParameters[i];
			object[currentApiRequestPostPutParameter.name]=currentApiRequestPostPutParameter.value;
		}
		var resource = $resource(url);
		resource.save(object, function(results) {
			$scope.waitInfo = null;
			$scope.responseInfo = "Added ["+ results.id +"] ";
		}, function(error) {
			$scope.waitInfo = null;
			$scope.responseInfo = "ERROR: " + (error.message!=null ? error.message : error.statusText);
		});
	}
	
	$scope.setApiRequestMappingChangeView = function(apiRequestMappingChangeView){
		$scope.apiRequestMappingChangeView = apiRequestMappingChangeView;
	}

	$scope.switchGETFilter = function(){
		$scope.apiRequestMappingsFilter.methodGET = !$scope.apiRequestMappingsFilter.methodGET;
	}

	$scope.switchPOSTFilter = function(){
		$scope.apiRequestMappingsFilter.methodPOST = !$scope.apiRequestMappingsFilter.methodPOST;
	}

	$scope.switchPUTFilter = function(){
		$scope.apiRequestMappingsFilter.methodPUT = !$scope.apiRequestMappingsFilter.methodPUT;
	}

	$scope.switchDELETEFilter = function(){
		$scope.apiRequestMappingsFilter.methodDELETE = !$scope.apiRequestMappingsFilter.methodDELETE;
	}
	
	$scope.load();
	
});

app.filter('apiRequestMappingsFilterType', function() {
    return function(items,apiRequestMappingsFilter) {
 	  if(apiRequestMappingsFilter==null){
		  return items;
	  }
      var out = [];
      for(var i=0; i<items.length; i++){
    	  var item = items[i];
     	  if((apiRequestMappingsFilter.value==null || item.value.search(apiRequestMappingsFilter.value)!=-1) && 
     			(
     					  (apiRequestMappingsFilter.methodGET && item.method=="GET") ||
     					  (apiRequestMappingsFilter.methodPOST && item.method=="POST") ||
     					  (apiRequestMappingsFilter.methodPUT && item.method=="PUT") ||
     					  (apiRequestMappingsFilter.methodDELETE && item.method=="DELETE")
     			)
     		){
        	  out.push(item);
    	  }
      }
      apiRequestMappingsFilter.resultsCount = out.length;
      return out;
    }
});


