
var app = angular.module('app', [ 'ngResource' ]);
app.controller('Api', function($scope, $http, $resource) {
	
	$scope.css = "http://bootswatch.com/slate/bootstrap.css";
	$scope.apiRequestMappings = new Array();
	$scope.apiRequestMappings = new Array();
	$scope.apiRequestResponseParameters = null;
	$scope.resultsAsJSON = false;
	$scope.resultsInTransposition = null;
	
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

	$scope.setCSS = function(url) {
		$scope.css = url;
	}
	
	$scope.load = function() {
		$scope.restApiHost = getRestApiHostDescription();
		$scope.loadApi();
	}
	
	$scope.loadApi = function() {
		$http.get(getUrl('/api/apiControllers')).success(function(apiControllers) {
			$scope.apiControllers = apiControllers;
			$scope.setCurrentApiController(apiControllers[0]);
		});
		
	};
	
	$scope.setCurrentApiController = function(apiController) {
		$scope.currentApiController = apiController;
		$scope.getApiRequestMappings($scope.currentApiController.id);
		$scope.refreshNavi();
	};
	
	$scope.refreshNavi = function() {
		for(apiController of $scope.apiControllers){
			apiController.class = (apiController.id==$scope.currentApiController.id) ? "active" : "";
		}
		if($scope.selectedApiRequestMapping!=null){
			for(apiRequestMapping of $scope.apiRequestMappings){
				apiRequestMapping.class = (apiRequestMapping.id==$scope.selectedApiRequestMapping.id) ? "active" : "";
			}
		}
	};

	$scope.getApiRequestMappings = function(apiControllerId){
		$http.get(getUrl('/api/apiRequestMappings/search/'+apiControllerId)).success(function(apiRequestMappings) {
			$scope.apiRequestMappings = apiRequestMappings;
		});
	}
	
	$scope.selectApiRequestMapping = function(apiRequestMapping){
		$scope.selectedApiRequestMapping = apiRequestMapping;
		$scope.requestInfo = "Request: "+apiRequestMapping.method+" "+ getUrl(apiRequestMapping.value);
		$scope.clearResults();
		var url = '/api/apiRequestGetParameter/search/'+apiRequestMapping.id;
		$http.get(getUrl(url)).success(function(apiRequestParameters) {
			$scope.currentApiRequestParameters = apiRequestParameters;
		});
		var url = '/api/apiRequestPostPutParameter/search/'+apiRequestMapping.id;
		$http.get(getUrl(url)).success(function(apiRequestPostPutParameters) {
			$scope.currentApiRequestPostPutParameters = apiRequestPostPutParameters;
		});
		$scope.refreshNavi();
	}

	$scope.clearResults = function(){
		$scope.results = null;
		$scope.responseInfo = null;
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
		$scope.responseInfo = 'Sending.. ('+$scope.selectedApiRequestMapping.method+' '+url+')';
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
		var urlForApiRequestResponseParameter = '/api/apiRequestResponseParameter/search/'+apiRequestMapping.id;
		$http.get(getUrl(urlForApiRequestResponseParameter)).success(function(apiRequestResponseParameters) {
			$scope.apiRequestResponseParameters = apiRequestResponseParameters;
			$http.get(url).success(function(results) {
				if(results==null){
					$scope.results = null;
					$scope.responseInfo = "Brak wyników";
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
				$scope.responseInfo = $scope.results.length > 0 ? "Wyników: " + $scope.results.length : "Brak wyników";
			});
		});
	}

	$scope.callDeleteRequest = function(url){
		$http.delete(url).success(function() {
			$scope.responseInfo = "Usunięto";
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
		resource.update(object, function(object) {
			$scope.responseInfo = "Poprawiono obiekt ["+ object.id +"] ";
		});
	}

	$scope.callPostRequest = function(url){
		var object = {};
		for(var i=0; i < $scope.currentApiRequestPostPutParameters.length; i++){
			var currentApiRequestPostPutParameter = $scope.currentApiRequestPostPutParameters[i];
			object[currentApiRequestPostPutParameter.name]=currentApiRequestPostPutParameter.value;
		}
		var resource = $resource(url);
		resource.save(object, function(object) {
			$scope.responseInfo = "Dodano obiekt ["+ object.id +"] ";
		});
	}

	$scope.load();
	
});


