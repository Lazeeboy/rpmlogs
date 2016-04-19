angular
	.module('App')
	.controller('AppController', AppController);

AppController.$inject = ['$scope', 'AppService', '$q'];
function AppController($scope, AppService, $q) {	
	$scope.reports = [];
	$scope.players = [];
	$scope.names = [];
	$scope.rankings = [];
	$scope.zones = {};
	$scope.overallRank = true;
	$scope.orderFilter = 'rank.average';
	$scope.encounterIndex = encounterIndex;
	$scope.getStyle = getStyle;
	$scope.reverse = true;
	$scope.searchIsRunning = false;
	$scope.order = order;
	$scope.zone = '8';
	$scope.difficulty = '5';
	$scope.metric = 'dps';
	$scope.search = search;
	$scope.getEncounters = getEncounters;
	$scope.classes = [
	    "DeathKnight",
		"DemonHunter",
		"Druid", 
		"Hunter", 
		"Mage", 
		"Monk", 
		"Paladin", 
		"Priest", 
		"Rogue", 
		"Shaman", 
		"Warlock", 
		"Warrior"
	];
	$scope.metrics = [
	   {id:	"dps", 			name: "DPS"},
	   {id:	"bossdps", 		name: "Boss DPS"},
	   {id:	"hps", 			name: "HPS"},
	   {id:	"tankhps", 		name: "Tank HPS"},
	   {id:	"krsi", 		name: "KRSI"},
	   {id:	"playerspeed", 	name: "Player Speed"}
	]
	$scope.difficulties = [
       {difficultyId : "3", difficultyName : "Normal"},
       {difficultyId : "4", difficultyName : "Heroic"},
       {difficultyId : "5", difficultyName : "Mythic"}
    ];
	$scope.encounters = [];
	
	$scope.fromDate = new Date();
	$scope.toDate = new Date();
	
	$scope.request = {
		guild : 'Rage Pillage Murder',
		server : 'Korgath',
		region : 'US',
		fromDate : '',
		toDate : ''
	}
	
	$scope.fromDate.setDate($scope.fromDate.getDate() - 14);
	
	getZones();
	
	function search(request) {
		$scope.searchIsRunning = true;
		getPlayers(request).then(function(){
			$scope.searchIsRunning = false;
		});
	}
	
	function getZones() {
		AppService.getZones().get().$promise.then(function(response){
			$scope.zones = response;
			getEncounters();
		});		
	}
	
	function getEncounters() {
		$scope.players = [];
		$scope.encounters = [];
		angular.forEach($scope.zones, function(zone){
			if (zone.id === parseInt($scope.zone)) {
				angular.forEach(zone.encounters, function(encounter){
					encounter.average = 0;
					encounter.averages = [];
					$scope.encounters.push(encounter);
				});
			}
		});
	}
	
	function getReports(request) {
		var deffered = $q.defer();
		$scope.reports = [];
		$scope.players = [];
		AppService.getReports(request).get().$promise.then(function(response){
			angular.forEach(response, function(report){
				if(report.zone === parseInt($scope.zone)){
					$scope.reports.push(report);
				}
			})
			deffered.resolve();
		});
		
		return deffered.promise;
	}
	
	function getPlayers(request){
		var deferred = $q.defer();
		
		var fromDate = new Date($scope.fromDate);
		var toDate = new Date($scope.toDate);
		
		fromDate.setDate(fromDate.getDate() + 1);
		toDate.setDate(toDate.getDate() + 1);
		
		$scope.fromDate = fromDate.getTime();
		$scope.toDate = toDate.getTime();
		
		getReports(request).then(function(){
			$scope.players = [];
			$scope.names = [];
			angular.forEach($scope.reports, function(report){
				AppService.getPlayers(report.id).get().$promise.then(function(response){
					var selectedDifficulty = false;
					
					angular.forEach(response.fights, function(fight){
						if (fight.difficulty === parseInt($scope.difficulty)) {
							selectedDifficulty = true;
						}
					});
					
					if (selectedDifficulty) {
						angular.forEach(response.friendlies, function(player){
							if ($scope.classes.indexOf(player.type) > -1 && $scope.names.indexOf(player.name) < 0) {
								$scope.names.push(player.name);
								getRankings(player).then(function(){
									if (player.rank.average > 0){
										$scope.players.push(player);
									};
								});
							}
						});
					};
				});
			});
		});
		deferred.resolve();
		return deferred.promise;
	}
	
	function getRankings(player){
		var deferred = $q.defer();
		var request = {
			characterName 	: 	player.name,
			server			:	$scope.request.server,
			region			:	$scope.request.region,
			zone			: 	$scope.zone,
			metric			: 	$scope.metric
		};
		AppService.getRankings(request).get().$promise.then(function(response){
			player.rank = getAverageRank(response);
			deferred.resolve();
		});
		return deferred.promise;
	}
	
	function getAverageRank(rankings){
		var rank = {
			average : 0,
			median : 0,
			encounters : angular.copy($scope.encounters)
		};
		
		var averages = [];
		
		angular.forEach(rankings, function(thisRank){
			if (thisRank.difficulty === parseInt($scope.difficulty)) {
				if ($scope.overallRank) {
					var average = ((thisRank.outOf - thisRank.rank) / thisRank.outOf) * 100;
					averages.push(average);
					angular.forEach(rank.encounters, function(encounter){
						if (encounter.id === thisRank.encounter) {
							encounter.averages.push(average);
						}
					});
				} else if (!$scope.overallRank && thisRank.startTime > $scope.fromDate && thisRank.startTime < $scope.toDate) {
					var average = ((thisRank.outOf - thisRank.rank) / thisRank.outOf) * 100;
					averages.push(average);
					angular.forEach(rank.encounters, function(encounter){
						if (encounter.id === thisRank.encounter) {
							encounter.averages.push(average);
						}
					});
				}
			};
		});
		
		angular.forEach(averages, function(average){
			rank.average += average;
		});	
		
		angular.forEach(rank.encounters, function(encounter){
			if (encounter.averages.length > 0) {
				angular.forEach(encounter.averages, function(average){
					encounter.average += average;
				});
				encounter.average = encounter.average / encounter.averages.length;
			} else {
				encounter.average = 0;
			}
		})
		
		rank.average = rank.average / averages.length;
		rank.median = median(averages);
		
		return rank;
	}
	
	function median(values) {
	    values.sort( function(a,b) {return a - b;} );
	    var half = Math.floor(values.length/2);

	    if(values.length % 2)
	        return values[half];
	    else
	        return (values[half-1] + values[half]) / 2.0;
	}
	
	function order(type){
		if ($scope.orderFilter === type) {
			if ($scope.reverse === true) {
				$scope.reverse = false;
			} else {
				$scope.reverse = true;
			}
		} else {
			$scope.orderFilter = type;
		}
	}
	
	function encounterIndex(encounter) {
		angular.forEach($scope.zone.encounters, function(thisEncounter){
			if (encounter === thisEncounter.id){
				return $scope.zone.encounters.indexOf(encounter);
			}
		})		
	}
	
	function getStyle(value){
		if (value <= 100 && value > 80){
			return "{'color':'green'}";
		} else if (value <= 80 && value > 50) {
			return "{'color':'yellow'}";
		} else if (value <= 50 && value > 0) {
			return "{'color':'red'}";
		} else {
			return "{'color':'black'}";
		}
	}
}
