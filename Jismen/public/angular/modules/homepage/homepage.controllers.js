var homepageControllers = angular.module('homepageControllers', []);

// HOMEPAGE

homepageControllers.controller('homepageCtrl', ['$scope', '$http', 'productFactory', function($scope, $http, productFactory){
  $scope.slides = [
    {
      image: 'http://img.cache-cache.fr/products_images/prod_27336/h_robe-sans-manches-dentelle-faux-bustier-cache-cache-NOIR-front-44.jpg',
      text : 'robe courte'
    },
    {
      image: 'http://img.cache-cache.fr/products_images/prod_20945/g_robe-bustier-decollete-coeur-cache-cache-VERMILLON-onroll-1174.jpg',
      text : 'robe bustier'
    },
    {
      image: 'http://img.cache-cache.fr/products_images/prod_20985/h_robe-debardeur-droite-cache-cache-noir-onroll-44.jpg',
      text : 'robe débardeur'
    }
  ];
  productFactory.getAllProducts().success(function(products){$scope.products = products;});
}]);

homepageControllers.controller('menuCtrl', ['$scope', '$http', '$routeParams', 'productFactory', function($scope, $http, $routeParams, productFactory){
  productFactory.getAllCategories().success(function(categories){
    $scope.isCollapsed = true;
    $scope.categories = categories;
  });
}]);

homepageControllers.controller('tagCtrl', ['$scope', '$http','$routeParams', 'productFactory', function($scope, $http, $routeParams, productFactory){
  $scope.tag = $routeParams.tag;
  $scope.recherche= "";
  productFactory.getTag($routeParams.tag).success(function(products){
    $scope.products = products;
  });
  productFactory.getAllCategories().success(function(categories){
    $scope.categories = categories;
  });
}]);

homepageControllers.controller('subcatCtrl', ['$scope', '$http', '$routeParams', 'productFactory', function($scope, $http, $routeParams, productFactory){
  $scope.categorie = $routeParams.cat;
  $scope.recherche = "";
  productFactory.getCat($routeParams.cat).success(function(products){
    $scope.products = products;
  });
  productFactory.getAllCategories().success(function(categories){
    $scope.categories = categories;
  });
}]);

// USER

homepageControllers.controller('LoginCtrl', ['$scope', '$location', '$window', 'AuthenticationService',
  function($scope, $location, $window, authenticationService){
    $scope.email = '';
    $scope.password = '';
    $scope.login = function() {
      authenticationService.login($scope.email, $scope.password, function(response) {
        if (response.success == true)
        {
          authenticationService.setUserData({
            token: response.token,
            role: response.role
          });

          swal({
            type:"success",
            title: "Connexion réussie",
            text: "Vous allez être connecté à votre compte.",
            closeOnConfirm: true
          }, function() {
            $window.location = response.redirectPath;
          });  
        }
        else
        {
          swal({
            type:"error",
            title: "Echec de la connexion",
            text: "Impossible de se connecter. \n " +response.message,
            closeOnConfirm: true
          });
        }
      });

      /*authenticationService.login($scope.email, $scope.password)
      .success(function(jsonResponse){
        console.log(jsonResponse);
        if (jsonResponse.success == true)
        {
          swal({
            type:"success",
            title: "Connexion réussie",
            text: "Vous allez être connecté à votre compte.",
            closeOnConfirm: true
          }, function(){
            $window.location = jsonResponse.redirectPath;
          });  
        }
        else
        {
          swal({
            type:"error",
            title: "Echec de la connexion",
            text: "Impossible de se connecter. \n " +jsonResponse.message,
            closeOnConfirm: true
          });
        }

        //$window.sessionStorage.token = user.token;
      })
      .error(function(status, data){
        console.log(status);
        console.log(data);
      });*/
    }
  }]);

homepageControllers.controller('SignupCtrl', ['$scope', '$location', '$window', 'userFactory', 
  function($scope, $location, $window, userFactory){
    $scope.page = 'Insription';
    $scope.reset = function(){
      $scope.name = '';
      $scope.firstname = '';
      $scope.address = '';
      $scope.zipcode = '';
      $scope.city = '';
      $scope.email = '';
      $scope.password = '';
      $scope.confirmPass = '';
      $scope.tel = '';
    };
    $scope.reset();
    $scope.signup = function(){
      userFactory.signup($scope.name, $scope.firstname, $scope.address, $scope.zipcode, $scope.city, $scope.email, $scope.password, $scope.confirmPass, $scope.tel)
      .success(function(signup){
        swal({
          type:"success",
          title: "Inscription réussie !",
          text: "Votre inscription s'est bien passé. Veuillez vous connecter.",
          closeOnConfirm: true
        }, $scope.reset());
      })
      .error(function(response, status){
        swal({
          type:"error",
          title: "Echec lors de l'inscription",
          text: "Une erreur est survenue lors de l'inscription.\nMessage: " + response.message,
          closeOnConfirm: true
        });
      }); 
    }
}]);

homepageControllers.controller('UserCtrl', ['$scope', '$routeParams', '$http',function($scope, $routeParams, $http){

}]);

homepageControllers.controller('DescriptionproduitCtrl', ['$scope', '$routeParams','productFactory', function($scope, $routeParams, productFactory){
 productFactory.getProduct($routeParams.product).success(function(product){
  $scope.product = product;
 });
}]);