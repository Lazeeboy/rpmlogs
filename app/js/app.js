angular
	.module('App', ['ngRoute', 'ngResource', 'jkuri.datepicker', 'ngMaterial', 'ngMessages'])
	.config(RouteManager);
	
RouteManager.$inject = ['$routeProvider'];
function RouteManager($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: 'partials/app.html',
			controller: 'AppController'
		}).
		otherwise({
			redirectTo: '/'
		});	
};
	
