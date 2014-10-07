https:
/**
* @license HTTP Auth Interceptor Module for AngularJS
* (c) 2012 Witold Szczerba
* License: MIT
*/
angular.module('http-auth-interceptor', []).provider('authService', function () {
    /**
    * Holds all the requests which failed due to 401 response,
    * so they can be re-requested in future, once login is completed.
    */
    var buffer = [];

    /**
    * Required by HTTP interceptor.
    * Function is attached to provider to be invisible for regular users of this service.
    */
    this.pushToBuffer = function (config, deferred) {
        buffer.push({
            config: config,
            deferred: deferred
        });
    };

    this.$get = [
        '$rootScope',
        '$injector',
        function ($rootScope, $injector) {
            var $http;
            function retry(config, deferred) {
                $http = $http || $injector.get('$http');
                $http(config).then(function (response) {
                    deferred.resolve(response);
                });
            }
            function retryAll() {
                for (var i = 0; i < buffer.length; ++i) {
                    retry(buffer[i].config, buffer[i].deferred);
                }
                buffer = [];
            }

            return {
                loginConfirmed: function () {
                    $rootScope.$broadcast('event:auth-loginConfirmed');
                    retryAll();
                }
            };
        }
    ];
}).config([
    '$httpProvider',
    'authServiceProvider',
    function ($httpProvider, authServiceProvider) {
        var interceptor = [
            '$rootScope',
            '$q',
            function ($rootScope, $q) {
                function success(response) {
                    return response;
                }

                function error(response) {
                    if (response.status === 401) {
                        var deferred = $q.defer();
                        authServiceProvider.pushToBuffer(response.config, deferred);
                        $rootScope.$broadcast('event:auth-loginRequired');
                        return deferred.promise;
                    }

                    // otherwise
                    return $q.reject(response);
                }

                return function (promise) {
                    return promise.then(success, error);
                };
            }
        ];
        $httpProvider.responseInterceptors.push(interceptor);
    }
]);

var HttpAndRegularPromiseTests;
(function (HttpAndRegularPromiseTests) {
    var someController = function ($scope, $http, $q) {
        $http.get("http://somewhere/some/resource").success(function (data) {
            $scope.person = data;
        });

        $http.get("http://somewhere/some/resource").then(function (response) {
            // typing lost, so something like
            // var i: number = response.data
            // would type check
            $scope.person = response.data;
        });

        $http.get("http://somewhere/some/resource").then(function (response) {
            // typing lost, so something like
            // var i: number = response.data
            // would NOT type check
            $scope.person = response.data;
        });

        var aPromise = $q.when({ firstName: "Jack", lastName: "Sparrow" });
        aPromise.then(function (person) {
            $scope.person = person;
        });

        var bPromise = $q.when(42);
        bPromise.then(function (answer) {
            $scope.theAnswer = answer;
        });

        var cPromise = $q.when(["a", "b", "c"]);
        cPromise.then(function (letters) {
            $scope.letters = letters;
        });
    };

    // Test that we can pass around a type-checked success/error Promise Callback
    var anotherController = function ($scope, $http, $q) {
        var buildFooData = function () {
            return 42;
        };

        var doFoo = function (callback) {
            $http.get('/foo', buildFooData()).success(callback);
        };

        doFoo(function (data) {
            return console.log(data);
        });
    };
})(HttpAndRegularPromiseTests || (HttpAndRegularPromiseTests = {}));

var My;
(function (My) {
    // Test for AngularJS Syntax
    (function (Namespace) {
        Namespace.x;
    })(My.Namespace || (My.Namespace = {}));
    var Namespace = My.Namespace;
})(My || (My = {}));

// IModule Registering Test
var mod = angular.module('tests', []);
mod.controller('name', function ($scope) {
});
mod.controller('name', ['$scope', function ($scope) {
    }]);
mod.controller(My.Namespace);
mod.directive('name', function ($scope) {
});
mod.directive('name', ['$scope', function ($scope) {
    }]);
mod.directive(My.Namespace);
mod.factory('name', function ($scope) {
});
mod.factory('name', ['$scope', function ($scope) {
    }]);
mod.factory(My.Namespace);
mod.filter('name', function ($scope) {
});
mod.filter('name', ['$scope', function ($scope) {
    }]);
mod.filter(My.Namespace);
mod.provider('name', function ($scope) {
});
mod.provider('name', ['$scope', function ($scope) {
    }]);
mod.provider(My.Namespace);
mod.service('name', function ($scope) {
});
mod.service('name', ['$scope', function ($scope) {
    }]);
mod.service(My.Namespace);
mod.constant('name', 23);
mod.constant('name', "23");
mod.constant(My.Namespace);
mod.value('name', 23);
mod.value('name', "23");
mod.value(My.Namespace);

// Promise signature tests
var foo;
foo.then(function (x) {
    // x is inferred to be a number
    return "asdf";
}).then(function (x) {
    // x is inferred to be string
    x.length;
    return 123;
}).then(function (x) {
    // x is infered to be a number
    x.toFixed();
    return;
}).then(function (x) {
    // x is infered to be void
    // Typescript will prevent you to actually use x as a local variable
    // Try object:
    return { a: 123 };
}).then(function (x) {
    // Object is inferred here
    x.a = 123;

    //Try a promise
    var y;
    return y;
}).then(function (x) {
    // x is infered to be a number, which is the resolved value of a promise
    x.toFixed();
});

// angular.element() tests
var element = angular.element("div.myApp");
var scope = element.scope();
//# sourceMappingURL=angular-1.0-tests.js.map
