// (function(){
  angular.module('chaas', [ 'ngRoute' ])
    .config([ '$routeProvider', function($routeProvider){
        $routeProvider
            .when('/:page', {
                controller: 'FitController',
                controllerAs: 'fit',
                templateUrl: '/app/views/page.html'
            })
            .otherwise({ redirectTo: '/HomePage' })
        ;
    } ])
// })();
