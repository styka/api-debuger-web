
var app = angular.module('app', [ 'ngResource' ]);
app.controller('Operation', function($scope, $http, $resource) {

	$scope.load = function() {
		$scope.restApiHost = getRestApiHostDescription();
		$scope.loadOperations();
		$scope.resetOperation(true);
		$scope.hideOperationActions();
	}
	
	$scope.loadOperations = function() {
		$http.get(getUrl('/operations')).success(function(operations) {
			$scope.operations = operations;
		});
	};
	
	$scope.showOperationActions = function() {
		document.getElementById("showOperationActionsButton").style.display = "none";
		document.getElementById("hideOperationActionsButton").style.display = "block";
		document.getElementById("operationActionForm").style.display = "block";
	};
	
	$scope.hideOperationActions = function() {
		document.getElementById("showOperationActionsButton").style.display = "block";
		document.getElementById("hideOperationActionsButton").style.display = "none";
		document.getElementById("operationActionForm").style.display = "none";
	};

	$scope.refreshActionButtons = function() {
		var isId = $scope.operation.id!=null;
		document.getElementById("updateOperationButton").disabled = !isId;
		document.getElementById("deleteOperationButton").disabled = !isId;
	}

	$scope.resetOperation = function(clearMessage) {
		$scope.operation = {};
		$scope.refreshActionButtons();
		if(clearMessage){
			$scope.message = "wybierz akcję";
		}
	};

	$scope.loadGenerateOperation = function() {
		$http.get(getUrl('/operations/generate')).success(function(generateOperation) {
			$scope.operation = generateOperation;
			$scope.refreshActionButtons();
		});
	};

	$scope.getOperation = function(operation){
		$scope.operation = operation;
		$scope.refreshActionButtons();
		$scope.showOperationActions();
	}

//	$scope.getOperation = function(id){
//		$http.get(getUrl('/operations/'+id)).success(function(operation) {
//			$scope.operation = operation;
//			$scope.refreshActionButtons();
//			$scope.showOperationActions();
//		});
//	}

	$scope.createOperation = function(operation) {
		var operationResource = $resource(getUrl('/operations'));
		operation.id = null;
		operationResource.save(operation, function(operation) {
			$scope.message = "Dodano operację [" + operation.id + "] \"" + operation.title + "\" na "
					+ operation.amount;
			$scope.resetOperation(false);
			$scope.loadOperations();
		});
	};


	$scope.updateOperation = function(operation) {
		var operationResource = $resource(getUrl('/operations/'+operation.id),null,{
		    'update': { method:'PUT' }
		});
		operationResource.update(operation, function(operation) {
			$scope.message = "Poprawiono operację ["+ operation.id +"] \"" + operation.title + "\" na "
					+ operation.amount;
			$scope.resetOperation(false);
			$scope.loadOperations();
		});
	};

	$scope.deleteOperation = function(id){
		$http.delete(getUrl('/operations/'+id)).success(function() {
			$scope.message = "Usunięto "+id;
			$scope.resetOperation(false);
			$scope.loadOperations();
		});
	}

	$scope.load();
	
});


