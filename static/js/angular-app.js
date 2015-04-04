var angularApp = angular.module('angularApp', ['ngCookies']);

angularApp.controller('appController', function ($scope, $filter, $cookieStore, usersRepository, moviesRepository) {
    $scope.email = '';
    $scope.password = '';
    $scope.movieName = '';
    $scope.movieLink = '';
    $scope.maxvotes = 0;
    $scope.errors = {};

    $scope.identity = $cookieStore.get('user');
    $scope.logged = $scope.identity !== undefined;
    reloadMovies();

    $scope.register = function () {
        usersRepository.registerUser($scope.email, $scope.password, function (user) {
            $scope.logged = true;
            $scope.identity = user._id;
            $cookieStore.put('user', $scope.identity);
            reloadMovies();
        }, function (err) {
            $scope.errors.email = err.email;
            $scope.errors.password = err.password;
        });
    };

    $scope.login = function () {
        usersRepository.loginUser($scope.email, $scope.password, function (user) {
            $scope.logged = true;
            $scope.identity = user._id;
            $cookieStore.put('user', $scope.identity);
            reloadMovies();
        }, function (err) {
            console.log(err);
        });
    };

    $scope.logout = function () {
        $scope.logged = false;
        $scope.identity = undefined;
        $cookieStore.remove('user');
    };

    $scope.newMovie = function () {
        moviesRepository.addMovie($scope.movieName, $scope.movieLink, function () {
            reloadMovies();
        });
    };

    $scope.castVote = function (id) {
        moviesRepository.castVote(id, $scope.identity, function () {
            reloadMovies();
        }, function () {
            reloadMovies();
        });
    };

    $scope.removeVote = function (id) {
        moviesRepository.removeVote(id, $scope.identity, function () {
            reloadMovies();
        }, function () {
            reloadMovies();
        });
    };

    function reloadMovies() {
        moviesRepository.getMovies(function (movies) {
            $scope.movies = movies;
            movies.forEach(function (movie) {
                if (movie.votes > $scope.maxvotes) {
                    $scope.maxvotes = movie.votes;
                }
            });
            moviesRepository.getVoted($scope.identity, function (movie) {
                $scope.voted = movie._id;
            }, function () {
                $scope.voted = undefined;
            });
        });
    };

    $scope.getMovieProportion = function (votes) {
        return ((votes / $scope.maxvotes) * 100) + '%';
    }
});

angularApp.factory('usersRepository', function ($http) {
    return {
        registerUser: function (email, password, callback, fallback) {
            var error = {};
            if (email == undefined) {
                error.email = 'Wrong email format.';
            }
            if (password == undefined) {
                error.password = 'You have to provide password.';
            }
            if(error!= {}){
                fallback(error);
                return;
            }
            $http.post('/users/register', { email: email, password: password }).success(callback).error(fallback);
        },
        loginUser: function (email, password, callback, fallback) {
            $http.post('/users/login', { email: email, password: password }).success(callback).error(fallback);
        }
    }
});

angularApp.factory('moviesRepository', function ($http) {
    return {
        addMovie: function (name, link, callback) {
            $http.post('/movies/add', { name: name, link: link }).success(callback);
        },
        getMovies: function (callback) {
            $http.get('/movies').success(callback);
        },
        castVote: function (id, user, callback, fallback) {
            $http.post('/movies/castvote/' + id + '/' + user).success(callback).error(fallback);
        },
        removeVote: function (id, user, callback, fallback) {
            $http.post('/movies/removevote/' + id + '/' + user).success(callback).error(fallback);
        },
        getVoted: function (user, callback, fallback) {
            $http.get('/movies/voted/' + user).success(callback).error(fallback);
        }
    }
});