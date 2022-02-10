var express = require("express");
var router = express.Router();
const User = require("../models/User");


const adminController = require("../controllers/admin");

const { body ,check } = require('express-validator');


// authentication middleware

const AuthMiddleware = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    req.flash("error", "Vous n'êtes pas connecté , vous ne pouvez pas accéder à cette ressource.");
    return res.redirect("/login");
  }
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        req.flash("error", "Il n'y a pas d'utilisateur, vous ne pouvez pas accéder à cette ressource.");
        return res.redirect("/login");
      }
      if (req.user.role != 1 || user.role != 1) {

        req.flash("error", "Vous n'êtes pas un administrateur, vous ne pouvez pas accéder à cette ressource.");
        return res.redirect("/login");
      }
      return next();
    })
    .catch((err) => {
      console.log(err);
    });
};


// multer 
var multer = require("multer");
const Order = require("../models/Order");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
    console.log(file);
  },
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
});
var upload = multer({ storage });





// Admin

router.get("/", AuthMiddleware,adminController.afficherAdmin );

// Categories

router.get("/categories", AuthMiddleware, adminController.afficherCategorie);

router.get("/categories/add-category", AuthMiddleware, adminController.getAjouterCategorie);

router.post("/categories/add-category",AuthMiddleware,
  body('title').isLength({ min: 3 }).withMessage('Titre doit comporter au moins 3 caractères'),
  adminController.ajouterCategorie
);

router.get("/categories/edit-category/:id", AuthMiddleware ,adminController.getModifierCategorie);

router.post("/categories/edit-category/:id",AuthMiddleware,
body('title').isLength({ min: 3 }).withMessage('Titre doit comporter plus de 3 caractères'),
adminController.modifierCategorie);

router.get("/categories/delete-category/:id",AuthMiddleware,adminController.supprimerCategorie);

// SubCategories

router.get("/subcategories", AuthMiddleware, adminController.afficherSousCategorie);

router.get("/subcategories/add-subcategory",AuthMiddleware,adminController.getAjouterSousCategorie);

router.post("/subcategories/add-subcategory",AuthMiddleware,
body('title').isLength({ min: 3 }).withMessage('Titre doit comporter au moins 3 caractères'),
adminController.ajouterSousCategorie);

router.get("/subcategories/edit-subcategory/:id",AuthMiddleware,adminController.getModifierSousCategorie);

router.post("/subcategories/edit-subcategory/:id",AuthMiddleware,
body('title').isLength({ min: 3 }).withMessage('Titre doit comporter au moins 3 caractères'),
adminController.modifierSousCategorie);

router.get("/subcategories/delete-subcategory/:id",AuthMiddleware,adminController.supprimerSousCategorie);


// products

router.get("/products", AuthMiddleware, adminController.afficherProduit);

router.get("/products/add-product", AuthMiddleware, adminController.getAjouterProduit);

router.post("/products/add-product", AuthMiddleware, upload.single("image"),
body('title').isLength({ min: 3 }).withMessage('Titre doit comporter plus de 3 caractères'),
body('desc').isLength({ min: 10 }).withMessage('Description doit comporter plus de 10 caractères'),
body('quantity').isInt({gt : 0}).withMessage('Quantité doit être supérieur ou égal à 1'),
body('price').isFloat({gt : 0}).withMessage('Prix doit être supérieur ou égal à 1.0'),
adminController.ajouterProduit);

router.get("/products/edit-product/:id", AuthMiddleware, adminController.getModifierProduit);

router.post("/products/edit-product/:id", AuthMiddleware,upload.single("image"),
body('title').isLength({ min: 3 }).withMessage('Titre doit comporter plus de 3 caractères'),
body('desc').isLength({ min: 10 }).withMessage('Description doit comporter plus de 10 caractères'),
body('quantity').isInt({gt : 0}).withMessage('Quantité doit être supérieur ou égal à 1'),
body('price').isFloat({gt : 0}).withMessage('Prix doit être supérieur ou égal à 1.0'),
adminController.modifierProduit);

router.get("/products/delete-product/:id",AuthMiddleware,adminController.supprimerProduit);


// orders

router.get("/orders", AuthMiddleware,adminController.afficherCommande);


router.post("/orders/confirmer/:id",AuthMiddleware,adminController.confirmerCommande);

router.get("/orders/facture/:id",AuthMiddleware,adminController.telechargerPdf);


router.get("/orders/delete-order/:id",AuthMiddleware,adminController.supprimerCommande);

router.get("/orders/detail-order/:id",AuthMiddleware,adminController.afficherDetail);


//users

router.get('/users' , AuthMiddleware , adminController.afficherUtilisateur)

router.get('/users/add-user' , AuthMiddleware , adminController.getAjouterUtilisateur)

router.post('/users/add-user' , AuthMiddleware ,
body('first').isLength({ min: 3 }).withMessage('Prénom doit comporter plus de 3 caractères .'),
body('last').isLength({ min: 3 }).withMessage('Nom doit comporter plus de 3 caractères .'),
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
body('confirmPassword').isLength({ min: 5 }).withMessage('Mot de passe de confirmation doit comporter plus de 5 caractères .'),
body('phone').isInt({gt : 20000000 , lt:99999999}).withMessage('Numéro doit comporter 8 chiffres et valide .'),
adminController.ajouterUtilisateur)

router.get('/users/delete-user/:id' ,AuthMiddleware, adminController.supprimerUtilisateur)


router.get('/users/edit-user/:id' ,AuthMiddleware,adminController.getModifierUtilisateur)


router.post('/users/edit-user/:id',AuthMiddleware ,
body('first').isLength({ min: 3 }).withMessage('Prénom doit comporter plus de 3 caractères .'),
body('last').isLength({ min: 3 }).withMessage('Nom doit comporter plus de 3 caractères .'),
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
body('confirmPassword').isLength({ min: 5 }).withMessage('Mot de passe de confirmation doit comporter plus de 5 caractères .'),
body('phone').isInt({gt : 20000000 , lt:99999999}).withMessage('Numéro doit comporter 8 chiffres et valide .'),
adminController.modifierUtilisateur)


// messages 

router.get('/messages' , AuthMiddleware, adminController.afficherMessage)

router.get('/messages/:id' ,AuthMiddleware, adminController.afficherDetailMessage)

router.post('/messages/reply/:id' ,
body('message').isLength({ min: 3 }).withMessage('Message doit comporter plus de 9 caractères .'),
adminController.ajouterReponse)

router.get('/messages/delete-message/:id' , adminController.supprimerMessage)





module.exports = router;


