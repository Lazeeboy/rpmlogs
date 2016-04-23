angular
	.module('App', ['ui.router', 
	                'ui.bootstrap',
	                'ngAnimate',
	                'ngResource', 
	                'jkuri.datepicker', 
	                'ngMaterial', 
	                'ngMessages', 
	                'anguFixedHeaderTable',
	                'angularjs-datetime-picker',
	                'angularMoment'])
	.config(RouteManager);
		
RouteManager.$inject = ['$stateProvider', '$urlRouterProvider'];
function RouteManager($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	
	$stateProvider.
		state('app', {
			url: '/',
			views: {
				'': {
					templateUrl: 'partials/shell.html'
				},
				'content@app': {
					templateUrl: 'partials/home.html'
				}				
			}
		}).
		state('rankings', {
			url: '/rankings',
			views: {
				'': {
					templateUrl: 'partials/shell.html'
				},
				'content@rankings': {
					templateUrl: 'partials/app.html',
					controller: 'AppController'
				}
			}
		});
};
	
