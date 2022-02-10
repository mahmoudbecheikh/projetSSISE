var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.js');
const indexController = require('../controllers/index');


const { body , check } = require('express-validator');


// home
router.get('/',indexController.getHome);

//signup
router.get('/signup', authController.getSignup);

router.post('/signup',
body('first').isLength({ min: 3 }).withMessage('Prénom doit comporter plus de 3 caractères .'),
body('last').isLength({ min: 3 }).withMessage('Nom doit comporter plus de 3 caractères .'),
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
body('confirmPassword').isLength({ min: 5 }).withMessage('Mot de passe de confirmation doit comporter plus de 5 caractères .'),
body('phone').isInt({gt : 20000000 , lt:99999999}).withMessage('Numéro doit comporter 8 chiffres et valide .'),
authController.inscrire);


//login
router.get('/login', authController.getLogin);

router.post('/login',
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
authController.connecter);

router.get('/logout', authController.deconnecter);


// reset Password

router.get('/forget-password' , indexController.getForget)

router.post('/forget-password' ,
body('email').isEmail().withMessage('Email invalid'),
indexController.envoyerR)

router.get('/reset_password/:id/:token' , indexController.getReset)

router.post('/reset_password/:id/:token' ,
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
body('confirmPassword').isLength({ min: 5 }).withMessage('Mot de passe de confirmation doit comporter plus de 5 caractères .'),
indexController.reinitialiser)

//profil
router.get('/profil/:name' , indexController.afficherProfil) ; 

router.post('/profil/:name' ,
body('first').isLength({ min: 3 }).withMessage('Prénom doit comporter plus de 3 caractères .'),
body('last').isLength({ min: 3 }).withMessage('Nom doit comporter plus de 3 caractères .'),
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('password').isLength({ min: 5 }).withMessage('Mot de passe doit comporter plus de 5 caractères .'),
body('confirmPassword').isLength({ min: 5 }).withMessage('Mot de passe de confirmation doit comporter plus de 5 caractères .'),
body('phone').isInt({gt : 20000000 , lt:99999999}).withMessage('Numéro doit comporter 8 chiffres et valide .'),
indexController.modifierProfil
)





// product 
router.get('/product', indexController.afficherProduits);

router.get('/product/:category/:subcategory', indexController.afficherSousCategorie);

router.get('/product/:title',indexController.afficherProduit) ;

// cart 
router.get('/cart', indexController.afficherPanier);

router.get('/cart/add/:title',indexController.ajouterProduit) ;

router.get('/cart/delete/:title',indexController.supprimerProduit)

router.get('/cart/subs/:title', indexController.subtraction) ; 

router.get('/cart/clear',indexController.viderPanier) ;

// search

router.get('/search',indexController.rechercher);


// order
router.get('/order',indexController.afficherCommande) ;

router.post('/cart/order', 
body('adresse').isLength({ min: 4 }).withMessage('Adresse doit comporter plus de 4 caractères .'),
body('code').isInt({gt : 1000 , lt:9999}).withMessage('Code doit comporter 4 chiffres'),
check('payment').isIn(['payment']).withMessage('Vous devez cocher la case d\'obligation de paiement '),
indexController.commander) ; 



// contact 

router.post('/contact' ,
body('fullName').isLength({ min: 6 }).withMessage('Nom complet doit comporter plus de 6 caractères .'),
body('email').isEmail().withMessage('Veuillez entrer une adresse email valide .'),
body('subj').isLength({ min: 3 }).withMessage('Objet doit comporter plus de 3 caractères .'),
body('message').isLength({ min: 3 }).withMessage('Message doit comporter plus de 9 caractères .'),

indexController.envoyerMessage)















module.exports = router;
