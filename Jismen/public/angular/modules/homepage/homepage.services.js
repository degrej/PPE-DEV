var homepageServices = angular.module('homepageServices', []);

// HOMEPAGE

homepageServices.factory('productFactory', ['$http', function($http){
  return {
    getAllProducts: function(){
      return $http.get('/api/product/all');
    },
    getAllCategories: function(){
      return $http.get('/api/categorie/all');
    },
    getTag: function(tag){
      return $http.get('/api/product/tag/'+tag);
    },
    getCat: function(cat){
      return $http.get('/api/product/cat/'+cat);
    },
    getProduct: function(product){
      return $http.get('/api/product/'+product);
    }
  };
}])

// USER

homepageServices.factory('userFactory', ['$http', function($http){
  return {
    login: function(email, password){
      return $http.post('/api/user/auth/', {email: email, password: password});
    },
    signup: function(name, firstname, address, zipcode, city, email, password, confirmPass, tel){
      return $http.post('/api/user/register/', {name: name, firstname: firstname, address: address, zipcode: zipcode, city: city, email: email, password: password, confirmPass: confirmPass, tel: tel});
    }
  };
}]);

homepageServices.factory('contactFactory', ['$http', function($http) {
  var service = {};

  service.sendContactRequest = _fnSendContactRequest;

  return service;

  function _fnSendContactRequest(oFormData, successCallback, errorCallback) {
    var contactPromise = $http.post('/api/contact', oFormData);
    if(successCallback && typeof(successCallback) === 'function')
      contactPromise.success(successCallback);
    if(errorCallback && typeof(errorCallback) === 'function')
      contactPromise.error(errorCallback);
    return contactPromise;
  }
}]);
