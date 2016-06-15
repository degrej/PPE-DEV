var magasinierControllers = angular.module('magasinierControllers', []);

magasinierControllers.controller('MagasinierCtrl', [
  '$scope', '$http', '$window', '$location', 'AuthenticationService',
  function($scope, $http, $window, $location, authenticationService){

  	 authenticationService.loadUserData(); //permet de retourner le token
  }]);

magasinierControllers.controller('LogInStateCtrl', ['$scope', '$rootScope', 'AuthenticationService',
  function($scope, $rootScope, authenticationService){
    authenticationService.loadUserData();
    $scope.logOut = function(){
      authenticationService.clearUserData();
    };
  }]);

/****************
***** MAGASINIER ******
*******************/

magasinierControllers.controller('MagasinierCtrl', [
  '$scope', '$http', '$window', '$location', 'productsFactory', 'AuthenticationService',
  function($scope, $http, $window, $location, productsFactory, authenticationService){
  // scope = ce qu'on renvoi à la page
  // http c'est ce qui fais les requetes serveurs
  // window gérer la fenêtre rafraichissement redirection
  // location sert à gérer les urls (ex redirection)
  // Factory convention de nomage entité de la base

  
  console.log($scope);
  productsFactory.getAllProducts()
  .success(function(products){$scope.products = products;})
  .error(function(err){console.log(err);});

  var curDate     = new Date();
  var year        = curDate.getFullYear().toString();
  var month       = curDate.getMonth() > 9 ? curDate.getMonth().toString() : '0' + curDate.getMonth().toString();
  var day         = curDate.getDate() > 9 ? curDate.getDate().toString() : '0' + curDate.getDate().toString();
  $scope.curDate  = year + '/' + month + '/' + day;

}]);

magasinierControllers.controller('LoginCtrl', [
  '$scope', '$location', '$window', 'loginFactory',
  function($scope, $location, $window, loginFactory){
  $scope.email = "";
  $scope.password = "";

  $scope.login = function(email, password){
    loginFactory.login(email, password)
    .success(function(user){
      $window.sessionStorage.token = user.token;
    })
    .error(function(status, data){
      console.log(status);
      console.log(data);
    });
  };

  $scope.logout = function(){
    if($window.sessionStorage.token){
      delete $window.sessionStorage.token;
    }
    $location.path('#/login');
  }
}]);

/****************
**** PRODUCTS ****
*******************/

magasinierControllers.controller('ProductsCtrl', ['$scope', '$http', '$location', 'productsFactory', 'categoriesFactory', 'colorsFactory',
 function ($scope, $http, $location, productsFactory, categoriesFactory, colorsFactory) {
  $scope.recherche = "";
  categoriesFactory.getAllCategories().success(function(categories){
    $scope.categories = categories;
  });

  productsFactory.getAllProducts().success(function(products){
    $scope.products = products;
  });

  $scope.selectProduct = function(productId){
    $location.path('/products/'+productId);
  };
}]);

magasinierControllers.controller('ProductCtrl', ['$scope', '$location','$http', '$routeParams', 'productsFactory', 'colorsFactory', 'fournisseursFactory', 'magasiniersFactory', function($scope, $location, $http, $routeParams, productsFactory, colorsFactory,fournisseursFactory,magasiniersFactory){
  var getProductPromise = productsFactory.getProduct($routeParams.product);

  getProductPromise.success(function(product){
    $scope.product = product;
    console.log($scope.product);
    $scope.master = angular.copy(product);
  });

  colorsFactory.getAllColors().success(function(colors){
    $scope.colors = colors;
  });

  fournisseursFactory.getAllFournisseurs().success(function(fournisseurs){
      $scope.fournisseurs = fournisseurs;
  });
  magasiniersFactory.getAllMagasiniers().success(function(magasiniers){
    $scope.magasiniers = magasiniers;
  });

  $scope.modify = function(product){
    if(confirm) {
      swal({   
      title: "Modification",   
      text: "Enregistrer les modifications du produit ?",   
      type: "warning",   
      showCancelButton: true,   
      confirmButtonColor: "#DD6B55",   
      confirmButtonText: "Oui, mettre à jour!",   
      cancelButtonText: "Non!",   
      closeOnConfirm: false,   
      closeOnCancel: false,
      showLoaderOnConfirm: true
      }, function(isConfirm){   
        if (isConfirm) {
          var updateProductSucces = function(){
            $scope.master = angular.copy(product);  
            swal({
              title: "Mis à jour!", 
              text: "Les modifications du produit ont bien étaient enregistrées.", 
              type: "success"}, function(){
                $scope.$apply(function()  {
                $location.path("/products");
              });
            });
          };
          var updateProductError = function(){
            swal({
              title: "Erreur", 
              text: "Une erreur est survenue lors de l\'enregistrement des modifications du produit.", 
              type: "error"});
            $scope.product = angular.copy($scope.master);
          };
          
          productsFactory.updateProduct(product, updateProductSucces, updateProductError);
         }
       else{
        swal({
          title: "Annuler", 
          text: "Les modifications du produit n\'ont pas étées prise en compte.", 
          type: "error"});
        $scope.product = angular.copy($scope.master);
        }
      });
    };
  };

  $scope.reset = function(){
    $scope.product = angular.copy($scope.master);
  };

  $scope.delete = function(product){

    if(confirm) {
      swal({
        title: "Suppression",
        text: "Supprimer le produit ?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Oui, supprimer!",   
        cancelButtonText: "Non, ne pas supprimer!",   
        closeOnConfirm: false,   
        closeOnCancel: false,
        showLoaderOnConfirm: true
      }, function(isConfirm) {
        if(isConfirm) {
          var successFunction = function () {
            $location.path('/products');
            swal({
              title: "Suppression!", 
              text: "Le produit a bien était supprimé!", 
              type: "success"}, function() {
                $scope.$apply(function()  {
                $location.path("/products");
              });
            });
          };
          var errorFunction = function(){
            swal({
              title: "Erreur", 
              text: "Une erreur est survenue lors de la suppression",
              type: "error"});
          };
          productsFactory.deleteProduct(product._id, successFunction, errorFunction);
        }
        else{
           swal({
            title: "Annulation", 
            text: "La suppression du produit est bien annulée!",
            type: "error"}, function() {
              $scope.$apply(function()  {
              $location.path("/products");
            }); 
          });
        }
      });
    };
  };
}]);

magasinierControllers.controller('NewProductCtrl', ['$scope', '$location', 'productsFactory', 'categoriesFactory','fournisseursFactory',
function($scope, $location, productsFactory, categoriesFactory, fournisseursFactory){
  $scope.sizes = productsFactory.sizes;
  $scope.product = {};
  $scope.subcats = [];
  $scope.fournisseurs = [];
  categoriesFactory.getAllCategories().success(function(categories){
    categories = categories;
    categories.forEach(function(cat){
      cat.subcat.forEach(function(subcat){$scope.subcats.push(subcat);});
    });
    if($scope.product) {
      $scope.product.subcat = $scope.subcats[0]._id.toString(); 
    }  else {
      $scope.product = {
        subcat: $scope.subcats[0]._id.toString()
      };
    }
    $scope.updateSizeList();
    $scope.product.size_name = $scope.sizes[0];
    fournisseursFactory.getAllFournisseurs().success(function(fournisseurs){
      $scope.fournisseurs = fournisseurs;
      $scope.product.fournisseur = $scope.fournisseurs[0].id.toString();
    })   
  });
  
  $scope.updateSizeList = function(){
    var i = 0;
    var isFound = false;
    do {
      var subcat = $scope.subcats[i++];

      if(subcat._id == $scope.product.subcat) {
        if(subcat.sizeType == 1)
        {
          $scope.sizes = productsFactory.sizes;  
        }
        else if(subcat.sizeType == 2)
        {
          $scope.sizes = productsFactory.shoes_sizes;
        }
        else{
          $scope.sizes = [];
        }
        isFound == true;
      }
    } while(i < $scope.subcats.length && isFound == false);
  }

  $scope.addProduct = function(product){
    // confirm permet d'ouvrir une popup
    if(confirm) {
      swal({   
      title: "Enregistrer",   
      text: "Enregistrer le nouvel article ?",   
      type: "warning",   
      showCancelButton: true,   
      confirmButtonColor: "#DD6B55",   
      confirmButtonText: "Oui, créer un nouveau produit!",   
      cancelButtonText: "Non!",   
      closeOnConfirm: false,   
      closeOnCancel: false,
      showLoaderOnConfirm: true
      }, function(isConfirm){   
        if (isConfirm) { 
          var addProductSuccess = function(){
            swal({
              title: "Création", 
              text: "La création du produit a bien était effectuée!", 
              type: "success"}, function() {
                $scope.$apply(function()  {
              $location.path("/products");
              });
            });
          };
          var addProductError = function() {
            swal({
              title: "Erreur", 
              text: "Une erreur est survenue lors de l\'ajout du produit!", 
              type: "error"});
            $scope.user = angular.copy($scope.master);
          };
          productsFactory.addProduct(product, addProductSuccess, addProductError);
        } 
        else {    
          swal({
            title: "Annuler", 
            text: "La création du produit a était annulée!", 
            type: "error"});
          $scope.product = angular.copy($scope.master); 
        }
      });
    };
  };
}]);