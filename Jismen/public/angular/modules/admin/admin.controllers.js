var adminControllers = angular.module('adminControllers', []);

/****************
***** ADMIN ******
*******************/

admin.controller('AdminCtrl', [
  '$scope', '$http', '$window', '$location', 'usersFactory', 'productsFactory', 'commentsFactory', 'AuthenticationService',
  function($scope, $http, $window, $location, usersFactory, productsFactory, commentsFactory, authenticationService){
  // scope = ce qu'on renvoi à la page
  // http c'est ce qui fais les requetes serveurs
  // window gérer la fenêtre rafraichissement redirection
  // location sert à gérer les urls (ex redirection)
  // Factory convention de nomage entité de la base

  authenticationService.loadUserData();
  console.log($scope);
  usersFactory.getAllUsers()
  .success(function(users){$scope.users = users;})
  .error(function(err){console.log(err);});

  productsFactory.getAllProducts()
  .success(function(products){$scope.products = products;})
  .error(function(err){console.log(err);});

  commentsFactory.allComments()
  .success(function(comments){$scope.comments = comments;})
  .error(function(err){console.log(err);});

  var curDate     = new Date();
  var year        = curDate.getFullYear().toString();
  var month       = curDate.getMonth() > 9 ? curDate.getMonth().toString() : '0' + curDate.getMonth().toString();
  var day         = curDate.getDate() > 9 ? curDate.getDate().toString() : '0' + curDate.getDate().toString();
  $scope.curDate  = year + '/' + month + '/' + day;

}]);

admin.controller('LoginCtrl', [
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
***** USERS ******
*******************/

admin.controller('UsersCtrl', ['$scope', '$http', '$location', 'usersFactory', function ($scope, $http, $location, usersFactory) {
  $scope.recherche = "";

  usersFactory.getAllUsers().success(function(users){$scope.users = users;});

  $scope.selectUser = function(user){$location.path('/users/'+user._id);};
}]);

admin.controller('UserCtrl', ['$scope', '$http', '$location', '$routeParams', 'usersFactory', function($scope, $http, $location, $routeParams, usersFactory){
  $scope.master = {};

usersFactory.getUser($routeParams.user).success(function(user){
    $scope.user = user;
    $scope.master = angular.copy(user);
});


  $scope.modify = function(user){
    if(confirm) {
      swal({   
      title: "Modification",   
      text: "Enregistrer les modifications de l\'utilisateur ?",   
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
      		  var updateUserSuccess = function() {
      			  $scope.master = angular.copy(user);  
        			swal({
                title: "Mis à jour!",
                text: "Vos modifications ont bien étaient enregistrées.",
                type: "success",
              }, function(){
                $scope.$apply(function() {
                  $location.path("/users");
                });
              });
            };
            var updateUserError = function() {
        			swal({
                title: "Erreur", 
                text: "Une erreur est survenue lors de la modification de l\'utilisateur.", 
                type: "error"
              });
        			$scope.user = angular.copy($scope.master); 
      		  };
      		  usersFactory.updateUser(user, updateUserSuccess, updateUserError);
          }
      		else {
      			swal({
              title: "Annuler", 
              text: "Les modifications ne sont pas prisent en compte.", 
              type: "error"
            });
      			$scope.user = angular.copy($scope.master);
      		}
      });
    };
  };

  $scope.reset = function(){
    $scope.user = angular.copy($scope.master);
  };

  $scope.delete = function(user) {
    if(confirm) {
        swal({   
        title: "Suppression",   
        text: "Supprimer cet utilisateur ?",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Oui, Supprimer!",   
        cancelButtonText: "Non!",   
        closeOnConfirm: false,   
        closeOnCancel: false,
		    showLoaderOnConfirm: true
        }, function(isConfirm){   
          if (isConfirm) {
      			var deleteUserSuccess = function() {
      				usersFactory.deleteUser(user);
      				swal({
                title: "Supprimer", 
                text: "La suppression de l\'utilisateur a bien était effectuée!", 
                type: "success",
              }, function() {
                $scope.$apply(function() {
                  $location.path("/users");
                });
              });
            };
      			var deleteUserError = function(){
      				swal({
                title: "Erreur", 
                text: "Une erreur est survenue lors de la suppression de l\'utilisateur!", 
                type: "error"
              });
      				$scope.user = angular.copy($scope.master);
      			};
            usersFactory.deleteUser(user, deleteUserSuccess, deleteUserError);
      		  }
      		  else{
      			  swal({
                title: "Annuler", 
                text: "La suppression de l\'utilisateur a était annulée!", 
                type: "error"
              });
      			$scope.user = angular.copy($scope.master);
      		  }
        });
      };
    };
}]);

admin.controller('NewUserCtrl', ['$scope', '$location', 'usersFactory',
function($scope, $location, usersFactory){
  $scope.confirmPass = "";
  $scope.newUser = {
    name: "",
    firstname: "",
    address: "",
    zipcode: "",
    city: "",
    email: "",
    password: "",
    tel: ""
  }
  $scope.createUser = function(user){
    // confirm permet d'ouvrir une popup
    if(confirm) {
        swal({   
        title: "Création",   
        text: "Créer l\'utilisateur ?",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Oui, créer un nouvel utilisateur!",   
        cancelButtonText: "Non!",   
        closeOnConfirm: false,   
        closeOnCancel: false, 
      	showLoaderOnConfirm: true
        }, function(isConfirm){   
          if (isConfirm) {
        		var addUserSuccess = function() {
        			usersFactory.addUser(user);
        			swal({
                title: "Création", 
                text: "La création de l\'utilisateur a bien était effectuée!", 
                type: "success",
                }, function() {
                $scope.$apply(function()  {
                  $location.path("/users");
                });
              });
        		};
            var addUserError = function() {
        			swal({
                title: "Erreur", 
                text: "Une erreur est survenue lors de l\'ajout de l\'utilisateur!", 
                type: "error"});
        			$scope.user = angular.copy($scope.master);
        		};
            usersFactory.addUser(user, addUserSuccess, addUserError);
          }
      	  else{
        		swal({
              title: "Annuler", 
              text: "La création de l\'utilisateur a était annulée!", 
              type: "error"});
        		$scope.user = angular.copy($scope.master);
      	  }
      });
    };
  };
}]);

/****************
**** PRODUCTS ****
*******************/

admin.controller('ProductsCtrl', ['$scope', '$http', '$location', 'productsFactory', 'categoriesFactory',
 function ($scope, $http, $location, productsFactory, categoriesFactory) {
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

admin.controller('ProductCtrl', ['$scope', '$location','$http', '$routeParams', 'productsFactory', function($scope, $location, $http, $routeParams, productsFactory){
  productsFactory.getProduct($routeParams.product).success(function(product){
    $scope.product = product;
    $scope.master = angular.copy(product);
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

admin.controller('NewProductCtrl', ['$scope', '$location', 'productsFactory', 'categoriesFactory','fournisseursFactory',
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
