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
var async     = require('async');
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var config = require('../conf.js');

router.post("/api/contact", function(req, res, next) {
  var sMailAddress = req.body.email;
  var sLastname = req.body.name;
  var sFirstname = req.body.firstname;
  var sMessage = req.body.message;
  
  if(!sMailAddress) return next(new Error("Missing mail address"));
  if(!sLastname) return next(new Error("Missing last name"));
  if(!sFirstname) return next(new Error("Missing first name"));
  if(!sMessage) return next(new Error("Missing message"));

  // On crée le transport. C'est l'objet qui va détenir la connexion avec la serveur de mail.
  var transporter = nodemailer.createTransport(smtpTransport({
    service:"Gmail",
    auth:{
      user: config.smtp.user,
      pass: config.smtp.password
    }
  }));
  var dToday = new Date();
  // On envoi le mail. Le premier paramètre est un object contenant les informations du mail (destinataires, expéditeur, mail version texte et mail version html).
  // Il y a bien plus d'options mais les principales sont celles cités précédemment. Pour la liste complète, voir ici: https://github.com/nodemailer/nodemailer#e-mail-message-fields
  transporter.sendMail({
    from: '"' + sFirstname + " " + sLastname + '"<'+ sMailAddress + ">",
    replyTo: '"' + sFirstname + " " + sLastname + '"<'+ sMailAddress + ">",
    to: config.general.contact_mails.join(","),
    subject: "Quelqu'un a besoin d'aide !",
    text: "Quelqu'un sollicite une assistance.\nRécapitulatif de la demande:\nDate de la demande: " + dToday.toDateString() + " à " + dToday.toTimeString() + "\nPrenom: " + sFirstname + "\nNom: " + sLastname + "\nAdresse mail: " + sMailAddress + "\nMessage:\n" + sMessage,
    html: "<p>Quelqu'un sollicite une assitance</p><p>Récapitulatif de la demande:</p><ul><li>Date de la demande: " + dToday.toDateString() + " à " + dToday.toTimeString() + "</li><li>Prénom: " + sFirstname + "</li><li>Nom: " + sLastname + "</li><li>Adresse mail: " + sMailAddress + "</li><li>Message: <p>" + sMessage + "</p></li></ul>"
  }, function(err, info) {
    if(err) return next(err);

    return res.status(200).send(info);
  });
});

/******** Users *********/

////// methode : GET //////

// methode : GET Retourne tous les utilisateurs
router.get('/admin/api/user/all',function(req,res){
  // Récupération de la connexion à la base MySQL
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT idUtilisateur,nom,Prenom,role,mail FROM utilisateur',function(err,rows,fields) {
      if(err) return next(err);
      var my_users = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_user = { };
        my_user._id = rows[i].idUtilisateur;
        my_user.name = rows[i].nom;
        my_user.firstname = rows[i].Prenom;
        my_user.email = rows[i].mail;
        my_user.role = rows[i].role;
        my_users.push(my_user);
      }
      res.json(my_users);
    });
  });
});

// methode : GET Retourne l'utilisateur dont l'id est donnée
router.get('/admin/api/user/:user_id',function(req,res,next){ 
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

      connection.query('Select U.idUtilisateur, U.nom, U.prenom, U.mail, U.role, U.mdp, U.tel, adresse, CP, ville'
        + ' from utilisateur U left join client c on C.idUtilisateur=U.idUtilisateur' 
        + ' where U.idUtilisateur = ?', [req.params.user_id],function(err,rows,fields) {
        if(err) {
          return connection.rollback(function() {
            return next(err);
          });
        }
        var my_user = {};

        if (rows.length > 0) 
        {
          my_user._id = rows[0].idUtilisateur;
          my_user.name = rows[0].nom;
          my_user.firstname = rows[0].prenom;
          my_user.email = rows[0].mail;
          my_user.password = rows[0].mdp;
          my_user.role = rows[0].role;
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
router.post('/admin/api/user', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if(err) return next(err);
              
    var insertQuery;
    var insertQueryParams;
    switch(req.body.user.role) {
      case 'administrateur':
        insertQuery = 'call sp_createAdmin(?, ?, ?, ?, ?, ?)';
        insertQueryParams = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.role];
        break;
      case 'magasinier':
        insertQuery = 'call sp_createMagasinier(?, ?, ?, ?, ?, ?)';
        insertQueryParams = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.role];
        break;
      case 'commercial':
        insertQuery = 'call sp_createCommerciale(?, ?, ?, ?, ?, ?)';
        insertQueryParams = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.role];
        break;
      case 'client':
        insertQuery = 'call sp_createClient(?, ?, ?, ?, ?, ?, ?, ?, ?)';
        insertQueryParams = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.role, req.body.user.address, req.body.user.zipcode, req.body.user.city];
        break;
    }
    if(!insertQuery) {
      return connection.rollback(function() {
        return next(new Error("Unknown role for user: role=" + req.body.user.role));
      });
    }
    
    connection.query(insertQuery,insertQueryParams, function(err, result) {
      if(err) return next(err);

        return res.send({ success: true });
    });
  });
});



// Sign up new client coté site
router.post('/api/user/register', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if(err) return next(err);

      connection.query('call sp_createClient(?,?,?,?,?,"client",?,?,?)',[req.body.name, 
        req.body.firstname, 
        req.body.tel, 
        req.body.email, 
        req.body.password, 
        req.body.address, 
        req.body.zipcode, 
        req.body.city], function(err, result) { 
      if(err) return next(err);

      return res.send({ success : true, message:"Votre inscription c'est bien passé. Veuillez vous connecter."});
    });
  });
});

// Retourne l'utilisateur correspondant au login + mdp
router.post('/api/user/auth',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);
    console.log(req.body);
    connection.query('Select idUtilisateur, nom, prenom, mail, mdp, role'
    + ' from utilisateur'
    + ' where mail=?', 
      [req.body.email], function(err, utilisateur) {
      if(err) return next(err);

      if (!utilisateur || !utilisateur.length)
        return res.send({ success: false, message: 'Utilisateur inconnu' });

      if(utilisateur.length > 1) {
        return res.send({ success:false, message: 'Multiple users with same email'});
      }
      
      if (utilisateur[0].mdp != req.body.password) {
          return res.send({ success: false, message: "Mot de passe incorrect" });
      }
      var redirect = "";
      switch (utilisateur[0].role.toLowerCase())
      {
        case 'administrateur':
          redirect = "/admin/";
          break;
        case 'client':
          redirect = "/client/";
          break;
        case 'magasinier':
          redirect = "/magasinier/";
          break;
          case 'commercial':
            redirect = "/commercial/";
          break;
      }
      var token = jwt.sign({ id: utilisateur[0].idUtilisateur, role: utilisateur[0].role }, app.get('secret'), {expiresIn: 3600});
      return res.send({ success: true, message: 'Auth : ok', token : token, name : utilisateur[0].nom, firstname : utilisateur[0].prenom, role : utilisateur[0].role, redirectPath: redirect});
    });
  });
});

router.get('/client/api/informations', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('Select nom, prenom, mail, tel, adresse, CP, ville, mdp' 
      + ' from client'
      + ' where idUtilisateur=?', [req.user.id], function(err, information) {
      if(err) return next(err);

      var informationUser = {};
      if (information.length > 0)
      {
        informationUser.name = information[0].nom;
        informationUser.firstname = information[0].prenom;
        informationUser.email = information[0].mail;
        informationUser.tel = information[0].tel;
        informationUser.address = information[0].adresse;
        informationUser.zipcode = information[0].CP;
        informationUser.city = information[0].ville;
      }
      res.json(informationUser);
    })
  })
})

router.put('/client/api/updateProfil', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('call sp_updateClient(?,?,?,?,?,?,?,?,?)', 
      [req.body.name, 
      req.body.firstname, 
      req.body.tel, 
      req.body.email, 
      req.body.password, 
      req.body.address,
      req.body.zipcode, 
      req.body.city, 
      req.user.id], function(err){
      if(err) return next(err);

      return res.json({ success: true});

    });
  });
});

// Méthode PUT utilisateur
router.put('/admin/api/user', function(req, res, next) {

  var dbConnection;
  var oUserToModify = null;
  async.series([
    // On récupère la connection à la base de données
    function(endGetConnection) {
      req.getConnection(function(err, connection) {
        if(err) return endGetConnection(err);

        dbConnection = connection;

        return endGetConnection();
      });
    },
    function(endRetrieveUser) {
      dbConnection.query('SELECT role' 
        + ' FROM Utilisateur' 
        + ' WHERE idUtilisateur=?', [ req.body.user._id], function(err, rows) {
        if(err) return endRetrieveUser(err);
        if(!rows || !rows.length) return endRetrieveUser(new Error("Utilisateur inconnu"));
        
        oUserToModify = rows[0];
        return endRetrieveUser();
      });
    },
    // On commence une transaction SQL
    function(endBeginTransaction) {
      dbConnection.beginTransaction(function(err) {
        if(err) return endBeginTransaction(err);

        return endBeginTransaction();
      });
    },
    // ON met à jour les infos dans la table utilisateur
    function(endUpdateUser) {
      dbConnection.query('UPDATE utilisateur set nom = ?, prenom = ?, tel = ?, mail = ?, mdp = ?' 
        + ' where idUtilisateur = ?', [req.body.user.name, 
        req.body.user.firstname, 
        req.body.user.tel, 
        req.body.user.email, 
        req.body.user.password, 
        req.body.user._id],function(err,rows,fields){
        if(err) return endUpdateUser(err);

        return endUpdateUser();
      });
    },
    // On met à jour les infos dans la table lié au rôle de l'utilisateur
    function(endUpdateUserRole) {
      var updateQuery;
      var paramsQuery;
      switch (oUserToModify.role.toLowerCase())
      {
        case 'administrateur':
          updateQuery = 'UPDATE administrateur set nom = ?, prenom = ?, tel = ?, mail = ?, mdp = ? where idUtilisateur = ?';
          paramsQuery = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user._id]
          break;
        case 'client':
          updateQuery = 'UPDATE client set nom = ?, prenom = ?, tel = ?, mail = ?, mdp = ?, adresse = ?, CP = ?, ville = ? where idUtilisateur = ?';
          paramsQuery = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user.address,req.body.user.zipcode, req.body.user.city, req.body.user._id];
          break;
        case 'magasinier':
          updateQuery = 'UPDATE magasinier set nom = ?, prenom = ?, tel = ?, mail = ?, mdp = ? where idUtilisateur = ?';
          paramsQuery = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user._id]
          break;
        case 'commercial':
          updateQuery = 'UPDATE commercial set nom = ?, prenom = ?, tel = ?, mail = ?, mdp = ? where idUtilisateur = ?';
          paramsQuery = [req.body.user.name, req.body.user.firstname, req.body.user.tel, req.body.user.email, req.body.user.password, req.body.user._id]
          break;
      }
      if(!updateQuery) {
         return endUpdateUserRole(new Error("Un problème a eu lieu lors de la mise à jour"));
      }
    
      dbConnection.query(updateQuery,paramsQuery, function(err, result) {
        if(err) return endUpdateUserRole(err);

          return endUpdateUserRole();
      });
    }
  ], function(err) {
    // Toutes les étapes ont été réalisés, on traite le cas où une erreur est survenue dans les fonctions précédentes sinon on envoi la réponse
    if(err) {
      console.log(err);
      // On check que la connection a bien été ouvert: Dans le cas où la fonction responsable de la récupération de la connection échoue, c'est le seul moyen d'éviter un crash serveur
      if(!dbConnection) return next(err);

      // si on avait la connection ouverte, on rollback par sécurité
      return dbConnection.rollback(function() {
        return next(err);
      });
    }

    // Si tout a fonctionné, on peut validé les changements en comittant la transaction SQL
    dbConnection.commit(function(err) {
      if(err) { 
        console.log(err);
        return next(err);
      }

      return res.json({ success: true});
    });
  });
});

////// methode : delete //////
router.delete('/admin/api/user/:userId',function(req,res, next){
  req.getConnection(function(err,connection) {
  if(err) return next(err);

    connection.query('delete FROM utilisateur WHERE idUtilisateur = ? ', [req.params.userId],function(err,rows,fields) {
     if(err) { console.log(err); return next(err); }
        return res.send({ success: true });
      });
  });
});

/******* Products *********/

////// methode : GET //////

// Retourne tous les produits
router.get('/api/product/all',function(req,res,next){
  
   req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT p.nomProduit, p.reference, p.prix, p.tag, p.description, p.photo, c.nomCouleur, libelleTaille,' 
      + ' p.quantiteStock, s.libelleSousCat'
      + ' FROM produit p,Sous_Categorie s ,Couleur c'
      + ' WHERE s.idSousCat = p.idSousCat and c.NomCouleur=p.NomCouleur',function(err,rows,fields) {
      if(err) return next(err);

      var my_produits = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_produit = { };
       /*my_produit.size = [{size_name:rows[i].libelleTaille,quantity:rows[i].quantiteStock}];*/
        my_produit.size_name = rows[i].libelleTaille;
        my_produit.quantity= rows[i].quantiteStock;
        my_produit._id = rows[i].reference;
        my_produit.subcat = rows[i].libelleSousCat;
        my_produit.name = rows[i].nomProduit;
        my_produit.price = rows[i].prix;
        my_produit.tag = rows[i].tag;
        my_produit.description = rows[i].description;
        my_produit.picture = rows[i].photo;
        my_produit.color = rows[i].nomCouleur;
        my_produits.push(my_produit);
      }
      res.json(my_produits);
    });
  });
});

// Retourne le produit dont l'id est passé en GET
router.get('/api/product/:product_id',function(req,res,next){
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query(
      'SELECT p.nomProduit, p.reference, p.prix, p.tag, p.description, p.photo, c.nomCouleur, libelleTaille, p.quantiteStock, s.libelleSousCat, f.nomFournisseur, f.idFournisseur, m.idUtilisateur' /*M.nom*/
        + ' FROM produit p, Sous_Categorie s, Couleur c, fournisseur f, Magasinier m'
        + ' where p.idFournisseur = f.idFournisseur'
          // + 'and p.idUtilisateur = M.idUtilisateur '
          + ' and p.nomCouleur = c.nomCouleur'
          + ' and p.idSousCat = s.idSousCat'
          + ' and p.reference = \'' + req.params.product_id +'\'',
      function(err,rows,fiels){
        var my_product = {};
        // On vient d'appeler la fonction query,elle nous fournit le paramètre err. Si err est renseigné,quelque chose c'est mal passé. Il ne faut 
        //pas continuer le code sinon on va accumuler les erreurs.
        // Pour cela,on délègue généralement l'erreur à la prochaine route (qui est le error handler)
        // Exemple:
        // if(err) return next(err);
        if(err) {
          console.log(err);
          return res.status(200).send("Error 500: MySQL");
        }

        if (rows.length > 0)
        {
          console.log(rows[0]);
          connection.query(
            'SELECT idUtilisateur, nom'
            + ' FROM Magasinier'
            + ' WHERE idUtilisateur = ' + rows[0].idUtilisateur + ';',
            function(err, rows, fields){
              if (err) {console.log(err)};
              if (rows.length > 0) {
                my_product.idMagasinier = rows[0].idUtilisateur;
                my_product.magasinier = rows[0].nom;
              } else {
                my_product.idMagasinier = null;
                my_product.magasinier = '';
              }
            }
          )

          my_product._id = rows[0].reference;
          my_product.name = rows[0].nomProduit;
          my_product.size = [{size_name:rows[0].libelleTaille,quantity:rows[0].quantiteStock}];
          my_product.price = rows[0].prix;
          my_product.tag = rows[0].tag;
          my_product.description = rows[0].description;
          my_product.color = rows[0].nomCouleur;
          my_product.picture = rows[0].photo;
          my_product.subcat = rows[0].libelleSousCat;
          my_product.fournisseur = rows[0].nomFournisseur;
          my_product.idFournisseur = rows[0].idFournisseur;
          // my_product.magasinier = rows[0].nom;
          // my_product.idMagasinier = rows[0].idUtilisateur;
        }
        res.json(my_product);
    });
  });
});

// Retourne tous les produits avec le tag sélectionné
router.get('/api/product/tag/:tag',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('Select reference,nomProduit,libelleSousCat,tag,prix,description,photo,p.nomCouleur,libelleTaille,quantiteStock' 
      + ' from produit p,couleur c,Sous_Categorie sc' 
      + ' where c.NomCouleur=p.NomCouleur and sc.idSousCat=p.idSousCat and Tag =\''+req.params.tag+'\'',function(err,rows,fields){
      if(err) return next(err);

      var my_tagproducts = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_tagproduct = { };
        my_tagproduct._id = rows[i].reference;
        my_tagproduct.name = rows[i].nomProduit;
        my_tagproduct.subcat = rows[i].libelleSousCat;
        my_tagproduct.tag = rows[i].tag;
        my_tagproduct.price = rows[i].prix;
        my_tagproduct.description = rows[i].description;
        my_tagproduct.picture = rows[i].photo;
        my_tagproduct.color = rows[i].nomCouleur;
        my_tagproduct.size_name = rows[i].libelleTaille;
        my_tagproduct.quantity = rows[i].quantiteStock;
        my_tagproducts.push(my_tagproduct);
      }
      res.json(my_tagproducts);
    });
  });
});


// Retourne tous les produits de la catégorie donnée
router.get('/api/product/cat/:cat', function(req, res){
  
  req.getConnection(function(err, connection) {
  if (err) res.send(err);
  connection.query('Select Reference, nomProduit, LibelleSousCat, Tag, Prix, Description, Photo, p.nomCouleur, libelleTaille,'
    + ' QuantiteStock'
    + ' from produit p, couleur c, Sous_Categorie sc'
    + ' where c.NomCouleur=p.NomCouleur' 
    + ' and sc.idSousCat=p.idSousCat' 
    + ' and LibelleSousCat =\''+req.params.cat+'\'', function(err, rows, fields){
    if(err) { console.log(err); return res.send(err); }
    var my_produits = [];
    for (i = 0; i < rows.length; i++){
      var my_produit = { };
      my_produit._id = rows[i].Reference;
      my_produit.name = rows[i].nomProduit;
      my_produit.subcat = rows[i].LibelleSousCat;
      my_produit.tag = rows[i].Tag;
      my_produit.price = rows[i].Prix;
      my_produit.description = rows[i].Description;
      my_produit.picture = rows[i].Photo;
      my_produit.color = rows[i].nomCouleur;
      my_produit.size_name = rows[i].libelleTaille;
      my_produit.quantity = rows[i].QuantiteStock;
      my_produits.push(my_produit);
    }
      res.json(my_produits);
    });
  });
});


/******* Comments *********/

////// methode : GET //////

// Retourne tous les commentaires
router.get('/admin/api/comment/all',function(req,res){
  Comment.find(function(err,comments){
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
router.get('/admin/api/comment/:comment_id',function(req,res){
  Comment.findOne(ObjectId(req.params.comment_id),function(err,comment){
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
router.get('/admin/api/comment/author/:author_id',function(req,res){
  Comment.find({author_id: ObjectId(req.params.author_id)},function(err,comment){
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
router.get('/admin/api/comment/product/:product_id',function(req,res){
  Comment.find({product_id: ObjectId(req.params.product_id)},function(err,comment){
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
router.get('/api/categorie/all',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('Select idCat,libelleCat from categorie',function(err,rows,fields) {
      if(err) return next(err);
      connection.query('Select idCat,libelleSousCat, idSousCat, sizeType from Sous_Categorie',function(err,souscat,fields){
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
                my_souscat._id = souscat[j].idSousCat;
                my_souscat.subcat_name = souscat[j].LibelleSousCat;
                my_souscat.sizeType = souscat[j].sizeType;
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

/************ Sous catégorie ***********/
////// methode : GET //////

// Retourne tous les couleurs
router.get('/api/souscat/all',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT idSousCat, libelleSousCat FROM Sous_Categorie group by idSousCat',function(err,rows,fields) {
      if(err) return next(err);      
                          
      var my_subcats = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_subcat = { };
        my_subcat.id = rows[i].idSousCat;
        my_subcat.libelle = rows[i].libelleSousCat;
        
        my_subcats.push(my_subcat);
      }
        res.json(my_subcats);
      });
    });
  });


/************ Couleurs ***********/
////// methode : GET //////

// Retourne tous les couleurs
router.get('/api/color/all',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT nomCouleur FROM couleur',function(err,rows,fields) {
      if(err) return next(err);      
                          
      var my_colors = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_color = { };
        my_color.color = rows[i].nomCouleur;
        
        my_colors.push(my_color);
      }
        res.json(my_colors);
      });
    });
  });

/************ Magasiniers ***********/
////// methode : GET //////

// Retourne tous les magasiniers
router.get('/admin/api/magasiniers',function(req,res,next){
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT idUtilisateur, nom FROM magasinier',function(err,rows,fields) {
      if(err) return next(err);      
                          
      var my_magasiniers = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_magasinier = { };
        my_magasinier.id = rows[i].idUtilisateur;
        my_magasinier.name = rows[i].nom;
        
        my_magasiniers.push(my_magasinier);
      }
        res.json(my_magasiniers);
      });
    });
  });

/************ Fournisseurs ***********/

////// methode : GET /////

// Retourne tous les fournisseurs
router.get('/admin/api/fournisseurs', function(req,res,next){

  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('SELECT * FROM fournisseur',function(err,rows,fields) {
      if(err) return next(err);

      var my_fournisseurs = [];
      for (var i = 0; i < rows.length; i++)
      {
        var my_fournisseur = { };
        my_fournisseur.id = rows[i].idFournisseur;
        my_fournisseur.name = rows[i].nomFournisseur;
        my_fournisseur.firstname = rows[i].prenom;
        my_fournisseur.adress = rows[i].adresse;
        my_fournisseur.tel = rows[i].tel;
        my_fournisseur.zipcode = rows[i].CP;
        my_fournisseur.city = rows[i].ville;
        my_fournisseur.email = rows[i].mail;
        
        my_fournisseurs.push(my_fournisseur);
      }
      res.json(my_fournisseurs);
    });
  })  
});

// methode : GET Retourne l'utilisateur dont l'id est donnée
router.get('/admin/api/fournisseurs/:_id',function(req,res,next){ 
  
  req.getConnection(function(err,connection) {
    if(err) return next(err);

      connection.query('Select * FROM fournisseur where idFournisseur = ?', [req.params._id],function(err,rows,fields) {
        if(err) {
          return connection.rollback(function() {
            return next(err);
          });
        }
        var my_provider = {};

        if (rows.length > 0) 
        {
          my_provider._id = rows[0].idFournisseur;
          my_provider.name = rows[0].nomFournisseur;
          my_provider.firstname = rows[0].prenom;
          my_provider.address = rows[0].adresse;
          my_provider.tel = rows[0].tel;
          my_provider.zipcode = rows[0].CP;
          my_provider.city = rows[0].ville;
          my_provider.email = rows[0].mail;
        }

        res.json(my_provider);
      });
    });
  });

router.post('/admin/api/addfourniseur',function(req, res, next) {
  req.getConnection(function(err, connection) {
    if(err) { console.log(err); return next(err); }

      connection.query('call sp_createFournisseur(?,?,?,?,?,?,?)',[req.body.name, req.body.firstname, req.body.address, req.body.tel, req.body.zipcode, req.body.city, req.body.mail], function(err, result) { 
        console.log(req.body.mail);
      if(err) { console.log(err); return next(err); }

      return res.send({ success : true, message:"L'ajout c'est bien passé."});
    });
  });
});

router.put('/admin/api/updatefourniseur',function(req,res,next){
  req.getConnection(function(err, connection) {
      if(err) { console.log(err); return next(err); }
      console.log(req.body.name);
      console.log(req.body.firstname);
      console.log(req.body.tel);
      console.log(req.body.mail);
      console.log(req.body.address);
      console.log(req.body.zipcode);
      console.log(req.body.city);
      console.log(req.body._id);
      connection.query('call sp_updateFournisseur(?,?,?,?,?,?,?,?)', [req.body.name, req.body.firstname, req.body.address, req.body.tel, req.body.zipcode,  req.body.city, req.body.mail, req.body._id], function(err, result) {
        if(err) { console.log(err); return next(err); }

      return res.json({ success: true});
      });
  });
});


router.delete('/admin/api/deletefourniseur/:_id',function(req,res, next){
  req.getConnection(function(err,connection) {
  if(err) return next(err);

    connection.query('delete FROM fournisseur WHERE idFournisseur = ? ', [req.params._id],function(err,rows,fields) {
      if(err) { console.log(err); return next(err); }
        return res.json({ success: true});
      });
  });
});

////// methode : POST //////

// Crée un nouveau produit
router.post('/magasinier/api/product/',function(req,res, next){
  
  req.getConnection(function(err, connection) {
    if(err) return next(err);

    connection.query('call sp_createProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [req.body.reference,
      req.body.name,
      req.body.tag, 
      req.body.price, 
      req.body.description, 
      req.body.picture, 
      req.body.quantity, 
      req.body.color, 
      req.body.size_name, 
      req.body.subcat, 
      req.body.fournisseur, 
      req.user.id], function(err,newproduct){
      
      if(err) return next(err);

      return res.send({ success: true, message: "Produit bien ajouté."});
    });
  });
});

////// methode : PUT //////
router.put('/magasinier/api/product/',function(req,res,next){
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('call sp_updateProduct(?,?,?,?,?,?,?,?,?,?)',
      [req.body.product.name,
       req.body.product.tag, 
       req.body.product.price, 
      req.body.product.description,
      req.body.product.color,  
      req.body.product.size[0].size_name, 
      req.body.product.size[0].quantity, 
      req.body.product.idFournisseur, 
      req.body.product.idMagasinier, 
      req.body.product._id],function(err){
        console.log(req.body.product.fournisseur);
        console.log(req.body.product.magasinier);
      if(err) return next(err);

      return res.json({ success: true});

    });
  });
});

////// methode : DELETE //////
router.delete('/magasinier/api/product/:productId',function(req,res,next){
  req.getConnection(function(err,connection) {
    if(err) return next(err);

    connection.query('DELETE FROM produit WHERE reference = ?', [req.params.productId], function(err,rows,fields){
      if(err) {
          return next(err);
        }
        return res.send({ success: true });
    });
  });
});


module.exports = router;
