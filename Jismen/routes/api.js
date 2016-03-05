var express   = require('express');
var jwt       = require('jsonwebtoken'); // permet de vérifier l'authentification
var app       = require('../app')
var ObjectId  = require('mongoose').Types.ObjectId;
var router    = express.Router();
var User      = require('../models/user');
var Product   = require('../models/product');
var Categorie = require('../models/categorie');
var Comment   = require('../models/comment');
var mysql     = require('mysql');


/******** Users *********/

////// methode : GET //////

// methode : GET Retourne tous les utilisateurs
router.get('/user/all', function(req, res){
  /*User.find(function(err, users){
    if(err)
      res.send(err);
    else {
      if (users)
        res.json(users);
      else
        res.send(false);
    }
  });*/
  // Récupération de la connexion à la base MySQL
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('SELECT idUtilisateur,Nom,Prenom,role FROM utilisateur', function(err, rows, fields) {
      if(err) return next(err);
      var my_users = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_user = { };
        my_user._id = rows[i].idUtilisateur;
        my_user.name = rows[i].Nom;
        my_user.firstname = rows[i].Prenom;
        my_user.role = rows[i].role;
        my_users.push(my_user);
      }
      res.json(my_users);
    });
  });
});

// methode : GET Retourne l'utilisateur dont l'id est donnée
router.get('/user/:user_id', function(req, res){
  /*User.findOne(ObjectId(req.params.user_id), function(err, user){
    if (err){
      res.send(err);
    }
    else{
      if(user){
        res.json(user);
      }else{
        res.send(false);
      }
    }
  });*/
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('SELECT * FROM utilisateur U, client C WHERE U.idUtilisateur = C.idUtilisateur AND U.idUtilisateur = ' + req.params.user_id, function(err, rows, fields) {
      var my_user = {};

      if (rows.length > 0) 
      {
        my_user._id = rows[0].idUtilisateur;
        my_user.name = rows[0].nom;
        my_user.firstname = rows[0].prenom;
        my_user.email = rows[0].mail;
        my_user.tel = rows[0].tel;
        my_user.address = rows[0].adresse;
        my_user.zipcode = rows[0].CP;
        my_user.city = rows[0].ville;
      }

      res.json(my_user);
    });
  });
});

////// methode : POST //////

// Crée un nouvel utilisateur
router.post('/user/', function(req, res, next){
  /*User.findOne({email: req.body.user.email}, function(err, user){
    if(err) return next(err);

    if(user) return res.send({ success: false, message:'Adresse email utilisée'});

    User.create(req.body.user, function(err, retrievedUser) {
      if(err) return next(err);

      return res.send({ success: true, user: retrievedUser});
    });
  });*/
  
  req.getConnection(function(err, connection) {
    if(err) return next(err);
    connection.query("INSERT INTO utilisateur(nom, prenom, tel, mail, mdp, role) VALUES (?, ?, ?, ?, ?, ?)", [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.role], function(err, result) {
      if(err) return next(err);

      if(!result) return res.send({ success: false, message:'No result from MYSql'});
      if(req.body.user.role !== 'client')
        return res.send({ success: true, result: result });
      
      // From here, we are sure that our user is a client
      var userId = result.insertId;
      connection.query("INSERT INTO client(idUtilisateur) VALUES (?,?,?)", [userId], function(err, result) {
        if(err) return next(err);

        if(!result) return res.send({ success: false, message: 'No result from MySQL Client request'});

        return res.send({ success: true, result: result});
      })
    });
  });
});

// Retourne l'utilisateur correspondant au login + mdp
router.post('/user/auth', function(req, res, next){
  User.findOne({email: req.body.email},function(err, user){
    if (err)
      return next(err);
    if (!user)
      res.json({success: false, message: 'Utilisateur inconnu'});
    else{
      if (user.password != req.body.password){
        res.json({success: false, message: "Mot de passe incorrect"});
      }else{
        var token = jwt.sign(user, app.get('secret'),{expiresInMinutes: 60,});
        res.json({
          success: true,
          message: 'Auth : ok',
          token: token
        });
      }
    }
  });
});

////// methode : PUT //////
router.put('/user/', function(req, res){
  console.log(req.body.user._id);
  var query = {_id: req.body.user._id};
  User.update(query, req.body.user, function(err, response){
    if (err) res.json({success : false, message: err});
    else res.json({success: true, message: response});
  });
});

////// methode : delete //////
router.delete('/user/:userId', function(req, res){
  User.remove({_id: req.params.userId}, function(err, response){
    if (err) console.log(err);
    else res.json({success: true, message: response});
  });
});

/******* Products *********/

////// methode : GET //////

// Retourne tous les produits
router.get('/product/all', function(req, res){
  /*Product.find(function(err, products){
    if(err)
      res.send(err);
    else {
      if (products)
        res.json(products);
      else
        res.send(false);
    }
  });*/
   req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('SELECT p.nom, s.LibelleSousCat FROM produit p, Sous_Categorie s WHERE s.idSousCat = p.idSousCat', function(err, rows, fields) {
      if(err) return next(err);

      var my_produits = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_produit = { };
        my_produit.subcat_name = rows[i].LibelleSousCat;
        my_produit.name = rows[i].nom;
        my_produits.push(my_produit);
      }
      res.json(my_produits);
    });
  });
});

// Retourne le produit dont l'id est passé en GET
router.get('/product/:product_id', function(req, res, next){
  
  /*Product.findOne(ObjectId(req.params.product_id) , function(err, product){
    if(err){
      res.send(err);
    } else {
      if(product){
        res.json(product);
      }else {
        res.send(false);
      }
    }
  });*/
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('Select Reference, Nom, Prix, Tag, Description, NomCouleur, LibelleTaille, QuantiteStock from Produit p, Couleur c, Taille t where c.idCouleur=p.idCouleur and t.idTaille=p.idTaille and p.Reference=\'' + req.params.product_id +'\'', function(err, rows, fiels){
      var my_product = {};


      // On vient d'appeler la fonction query, elle nous fournit le paramètre err. Si err est renseigné, quelque chose c'est mal passé. Il ne faut pas continuer le code sinon on va accumuler les erreurs.
      // Pour cela, on délègue généralement l'erreur à la prochaine route (qui est le error handler)
      // Exemple:
      // if(err) return next(err);
      if(err) {
        console.log(err);
        return res.status(200).send("Error 500: MySQL");
      }

      if (rows.length > 0)
      {
        my_product._id = rows[0].Reference;
        my_product.name = rows[0].Nom;
        my_product.prix = rows[0].Prix;
        my_product.tag = rows[0].Tag;
        my_product.description = rows[0].Description;
        my_product.color = rows[0].NomCouleur;
        my_product.size_name = rows[0].LibelleTaille;
        my_product.quantity = rows[0].QuantiteStock;
      }
      res.json(my_product);
    });
  });
});

// Retourne tous les produits avec le tag sélectionné
router.get('/product/tag/:tag', function(req, res){
  /*Product.find({tag: req.params.tag}, function(err, products){
    if (err)
      res.send(err);
    else {
      if (products)
        res.json(products);
      else
        res.send(false)
    }
  });*/
req.getConnection(function(err, connection) {
  if(err) return next(err);
  connection.query('Select Reference, Nom, LibelleSousCat, Tag, Prix, Description, NomCouleur, LibelleTaille, QuantiteStock from produit p, couleur c, taille t, sous_categorie sc where c.idCouleur=p.idCouleur and t.idTaille=p.idTaille and sc.idSousCat=p.idSousCat and Tag =\''+req.params.tag+'\'', function(err, rows, fields){
    if(err) { console.log(err); return res.send(err); }
    var my_tagproducts = [];
    for (i = 0; i < rows.length; i++){
      var my_tagproduct = { };
      my_tagproduct._id = rows[i].Reference;
      my_tagproduct.name = rows[i].Nom;
      my_tagproduct.subcat = rows[i].LibelleSousCat;
      my_tagproduct.tag = rows[i].Tag;
      my_tagproduct.price = rows[i].Prix;
      my_tagproduct.description = rows[i].Description;
      my_tagproduct.color = rows[i].NomCouleur;
      my_tagproduct.size_name = rows[i].LibelleTaille;
      my_tagproduct.quantity = rows[i].QuantiteStock;
      my_tagproducts.push(my_tagproduct);
    }
      res.json(my_tagproducts);
    });
  });
});


// Retourne tous les produits de la catégorie donnée
router.get('/product/cat/:cat', function(req, res){
  /*Product.find({subcat: req.params.cat}, function(err, products){
    if(err)
      res.send(err);
    else {
      if(products)
        res.json(products);
      else
        res.send(false);
    }
  });*/
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('SELECT Nom, LibelleCat,LibelleSousCat FROM Categorie Ca, Sous_Categorie SC WHERE Ca.idCat = SC.idSousCat AND P.idSousCat = SC.idSousCat', function(err, rows, fields) {
      if(err) return next(err);
      var my_produits = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_produit = { };
        my_produit.categorie.name = rows[i].Libelle;
        my_produit.subcat.subcat_name = rows[i].Libelle;
        my_produit.name = rows[i].Nom;
        my_produits.push(my_produit);
      }
      res.json(my_produits);
    });
  });
});

////// methode : POST //////

// Crée un nouveau produit
router.post('/product/', function(req, res){
  // console.log(req.body.newProduct);
  var product = new Product(req.body.newProduct);
  product.save(function(err, product){
    if(err)
      res.send({success: false, message: err});
    else{
      res.send({success: true, message: product});
    }
  });
});

////// methode : PUT //////
router.put('/product/', function(req, res){
  console.log(req.body.product._id);
  var query = {_id: req.body.product._id};
  Product.update(query, req.body.product, function(err, response){
    if (err) res.json({success : false, message: err});
    else res.json({success: true, message: response});
  });
});

////// methode : DELETE //////
router.delete('/product/:productId', function(req, res){
  Product.remove({_id: req.params.productId}, function(err, response){
    if (err) throw err;
    else res.json({success: true, message: response});
  });
});

/******* Comments *********/

////// methode : GET //////

// Retourne tous les commentaires
router.get('/comment/all', function(req, res){
  Comment.find(function(err, comments){
    if(err)
      res.send(err);
    else {
      if (comments)
        res.json(comments);
      else
        res.send(false);
    }
  });
});

// Retourne le commentaire avec l'id demandé
router.get('/comment/:comment_id', function(req, res){
  Comment.findOne(ObjectId(req.params.comment_id), function(err, comment){
    if(err)
      res.send(err);
    else {
      if (comment)
        res.json(comment);
      else
        res.send(false);
    }
  })
});

// Retourne les commentaires de l'auteur donné
router.get('/comment/author/:author_id', function(req, res){
  Comment.find({author_id: ObjectId(req.params.author_id)}, function(err, comment){
    if(err)
      res.send(err);
    else {
      if (comment)
        res.json(comment);
      else
        res.send(false);
    }
  });
});

// Retourne les commentaires du produit donné
router.get('/comment/product/:product_id', function(req, res){
  Comment.find({product_id: ObjectId(req.params.product_id)}, function(err, comment){
    if (err)
      res.send(err);
    else {
      if (comment)
        res.json(comment);
      else
        res.send(false);
    }
  });
});

/******* Categories *********/

////// methode : GET //////

// Retourne tous les catégories
router.get('/categorie/all', function(req, res){
  /*Categorie.find(/*function(err, categories)*/
    // {
    // if(err)
    //   res.send(err);
    //   else {
    //     if (categories)
    //       res.json(categories);
    //     else
    //       res.send(false);
    //   }
    // }
  /*)
  .populate('products')
  .exec(function(err, categories){
    if(err) throw err;
    else {
      if (categories) res.json(categories);
      else res.send(false);
    }
  });*/
  req.getConnection(function(err, connection) {
      if(err) return next(err);

      connection.query('SELECT idCat,LibelleCat FROM categorie', function(err, rows, fields) {
        if(err) return next(err);
        connection.query('Select idCat, LibelleSousCat from Sous_Categorie', function(err, souscat, fields){
          if(err) return next(err);
        
          var my_categories = [];
          for (var i = 0; i < rows.length; i++)
          {
            var my_categorie = { };
            my_categorie.name = rows[i].LibelleCat;
            my_categorie.subcat = [];
            for (var j = 0; j < souscat.length; j++)
            {
              if (rows[i].idCat == souscat[j].idCat)
              {
                var my_souscat = { };
                my_souscat.subcat_name = souscat[j].LibelleSousCat;
                my_categorie.subcat.push(my_souscat);
              }              
            }
            my_categories.push(my_categorie);
          }
          res.json(my_categories);
        });
      });
    });
});

module.exports = router;
