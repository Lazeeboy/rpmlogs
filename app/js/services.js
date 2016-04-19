angular
	.module('App')
	.factory('AppService', AppService);
	
AppService.$inject = ['$resource'];
	
function AppService($resource) {
	var baseURL = 'https://www.warcraftlogs.com:443/v1/'
	var logService = {};
	
	logService.getReports = function(request) {
		return $resource(baseURL + 'reports/guild/:guild/:server/:region', 
			{ 	
				guild	: 	request.guild,
				server	: 	request.server,
				region	:	request.region
			}, 
			{
				get	:	{
					method	: 	'GET',
					params	:	{ api_key : '2390608c616404a931f799de714460a8'},
					isArray : 	true
				}
			}
		);
	};
	
	logService.getPlayers = function(reportCode) {
		return $resource(baseURL + 'report/fights/:reportCode', 
			{ 	
				reportCode	: 	reportCode 
			}, 
			{
				get	:	{
					method	: 	'GET',
					params	:	{ api_key : '2390608c616404a931f799de714460a8'}
				}
			}
		);
	};
	
	logService.getZones = function() {
		return $resource(baseURL + 'zones', 
			{
			}, 
			{
				get	:	{
					method	: 	'GET',
					params	:	{ api_key : '2390608c616404a931f799de714460a8'},
					isArray : 	true
				}
			}
		);
	};
	
	logService.getRankings = function(request) {
		return $resource(baseURL + 'rankings/character/:characterName/:server/:region',
			{ 	
				characterName	: 	request.characterName,
				server			:	request.server,
				region			:	request.region
			}, 
			{
				get	:	{
					method	: 	'GET',
					params	:	{ api_key : '2390608c616404a931f799de714460a8', zone : request.zone, metric : request.metric, bracket : request.bracket },
					isArray : 	true
				}
			}		
		);
		
	}
	
	return logService;
};