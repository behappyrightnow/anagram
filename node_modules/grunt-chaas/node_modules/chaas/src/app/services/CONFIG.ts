(function(){
  angular.module('chaas')
    .factory('CONFIG', [ '$q', '$http', function($q, $http){
      var deferred = $q.defer();

      $http.get('/chaas.json').success((data)=>{
        angular.extend(deferred.promise, data);

        deferred.resolve();
      });

      return angular.extend(deferred.promise, {
        path: function(){
          return _.reduce(arguments, function(memo, part){
              return memo.replace(/\/$/, '') + '/' + part;
          });
        }
      });
    }]);
})();
