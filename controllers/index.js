const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Message = require('../models/Message');
const DetailOrder = require('../models/DetailOrder');
const sendEmail = require("../utils/email");
const createPDF = require ("../utils/pdf")

const bcrypt = require("bcrypt");

const { validationResult } = require("express-validator");

// get home

exports.getHome = function (req, res, next) {
  res.render("index", {
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
  });
};

// get ForgetPasswrod

exports.getForget = (req, res, next) => {
  if(!req.session.user){
    res.render("auth/forget_password", {
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
    });
  }
  else {
    res.redirect('/profil/'+req.session.user.displayName);
  }

};

// Post ForgetPasswrod

exports.envoyerR = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("auth/forget_password", {
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      errors: errors.errors,
      cart: req.session.cart,
    });
  }

  else {
    const user = await User.findOne({ email: req.body.email.trim() });

    if (!user) {
      req.flash("error", "L'email entré n'appartient à aucun compte ");
      return res.redirect("/forget-password");
    }
    console.log(user);
    const token = user.CreatePasswordToken();
    console.log(token);
    user.save();
    var text = `Vous avez demandé à réinitialiser vos identifiants de connexion sur SSISE Cette opération vous attribuera un nouveau mot de passe. Pour confirmer cette action, cliquez sur le lien suivant :`;
  
    const link =
      text + `http://localhost:3000/reset_password/${user._id}/${token}`;
    await sendEmail(user.email, "Password reset", link);
    req.flash("success", "Mail envoyé , vérifier votre boite email");
    return res.redirect("/forget-password");
  }
  
};

// get ResetPasswrod

exports.getReset = (req, res, next) => {
  res.render("auth/reset_password", {
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
    id: req.params.id,
    token : req.params.token
  });
};

exports.reinitialiser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors)
    res.render("auth/reset_password", {
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      id: req.params.id,
      cart: req.session.cart,
      token : req.params.token,
      errors: errors.errors,
    });
  }

  var password = req.body.password.trim();
  var confirmPassword = req.body.confirmPassword.trim();
  if (password !== confirmPassword) {
    console.log(password);
    console.log(confirmPassword);
    req.flash("error", " Les mots de passe ne sont pas identiques");
    return res.redirect('/reset_password/'+req.params.id+"/"+req.params.token);
  }
  User.findById(req.params.id).then((user) => {
    bcrypt.hash(password, 12).then((hash) => {
      user.hashedPassword = hash;
      user.save();
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save();
      res.redirect("/");
    });
  });
};

// get Profil

exports.afficherProfil = (req, res, next) => {
  User.findOne({ displayName: req.params.name }).then((user) => {
    console.log(user);
    if (user && req.session.isLoggedIn) {
      res.render("profil", {
        user: user,
        isAuth: req.session.isLoggedIn,
        user: req.session.user,
      });

    }
    else {
      res.redirect('/login')
    }
  });
};

// post Profil

exports.modifierProfil = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const user = await User.findOne({ displayName: req.params.name });
    res.render("profil", {
      user: user,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      cart: req.session.cart,
      errors: errors.errors,
    });
  } else {
    var first = req.body.first.toLowerCase().trim();
    var last = req.body.last.toLowerCase().trim();
    var email = req.body.email.trim();
    var password = req.body.password.trim();
    var confirmPassword = req.body.confirmPassword.trim();
    var phone = req.body.phone.trim();
    var adresse = req.body.adresse.toLowerCase().trim();
    var code = req.body.code.trim();

    if (password !== confirmPassword) {
      console.log(password);
      console.log(confirmPassword);
      req.flash("error", "Les mots de passe ne sont pas identiques");
      return res.redirect("/profil/" + req.params.name);
    }
    User.find({ email: email })
      .then((users) => {
        if (users.length > 1) {
          console.log(users);
          req.flash("error", "Cette adresse email est déjà utilisée ");
          return res.redirect("/profil"+req.params.name);
        } else {
          User.findOne({ displayName: req.params.name }).then((user) => {
            const displayName = first + " " + last;
            bcrypt.hash(password, 12).then((hash) => {
              user.displayName = displayName;
              user.hashedPassword = hash;
              user.email = email;
              user.phone = phone;
              user.adresse = adresse;
              user.codeP = code;
              console.log(user);
              user.save();
              req.session.user = user;
              req.session.save();
              res.redirect("/");
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// get product

exports.afficherProduits = (req, res, next) => {
  Category.find({})
    .populate("subCategories")
    .exec((err, result) => {



      DetailOrder.find({})
        .populate("product")
        .then((details) => {
          if (details) {
            const product = [];
              details.forEach(function (detail) {
                if (detail.product != null ) {
                  product.push(detail.product);
                }
              });
            

            var productUnique = [
              ...new Map(product.map((item) => [item["title"], item])).values(),
            ];

            if (productUnique.length > 6)
              productUnique = productUnique.slice(0, 6);
              productUnique.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));


            res.render("product", {
              isAuth: req.session.isLoggedIn,
              user: req.session.user,
              categories: result,
              products: productUnique,
              part: "product",
            });
          }
        });
    });
};

// get SubCategory

exports.afficherSousCategorie = async (req, res, next) => {
  Category.find({})
    .populate("subCategories")
    .exec((err, result) => {
      SubCategory.findOne({ titleSub: req.params.subcategory })
        .then((subc) => {
          var min =req.query.gt;
          var max =req.query.lt;



          if(Number(min) > Number(max) ){
            let x = min;
            min = max ;
            max = x ;
          }

          if (min==undefined ) min = 0;
          if (max==undefined ) max = 500;

          Product.find({
            subCategory: subc,
            price: { "$gte": min, "$lte": max },
          }).then((prod) => {
            prod.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            var sortBy = req.query.sortBy;
            if (sortBy == undefined) sortBy = "croissant";
            if (sortBy == "decroissant") prod.reverse();
            console.log(req.path);
            
            res.render("product", {
              products: prod,
              isAuth: req.session.isLoggedIn,
              user: req.session.user,
              categories: result,
              category: req.params.category,
              subc: req.params.subcategory,
              sort: sortBy,
              path: req.path,
              min: min,
              max : max,
              count_prod: prod.length,
              part: "prod_cat",
            });
          });
        })
        .catch((error) => {
          return console.log(error);
        });
    });
};

// get product item

exports.afficherProduit = (req, res, next) => {
  Product.findOne({ title: req.params.title })
    .then((prod) => {
      if (prod) {
        SubCategory.findById(prod.subCategory).populate('category')
          .then((cat) => {
            console.log(cat);
            res.render("product_item", {
              product: prod,
              category: cat,
              isAuth: req.session.isLoggedIn,
              user: req.session.user,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// get Search

exports.rechercher = (req, res, next) => {
  var title_search = req.query.title.trim().toLowerCase();
  if (title_search == undefined) title_search = req.body.title;

  var sortBy = req.query.sortBy;
  if (sortBy == undefined) sortBy = "croissant";
  Category.find({})
    .populate("subCategories")
    .exec((err, result) => {
      Product.find({ title: { $regex: title_search } })
        .then((prod) => {
          prod.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          if (sortBy == "decroissant") prod.reverse();
          res.render("product", {
            products: prod,
            categories: result,
            isAuth: req.session.isLoggedIn,
            user: req.session.user,
            count_prod: prod.length,
            title: title_search,
            sort: sortBy,
            path: req.path,
            part: "prod_search"
          });
        })
        .catch((error) => {});
    });
};

// get cart

exports.afficherPanier = (req, res, next) => {
  let cartArray = req.session.cart;

  if (cartArray && cartArray.length == 0) {
    delete req.session.cart;
    return res.redirect("/cart");
  } else {
    if (cartArray == undefined) cartArray = [];
    res.render("cart", {
      cartArray: cartArray,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
    });
  }
};

// add  to cart

exports.ajouterProduit = (req, res, next) => {
  Product.findOne({ title: req.params.title })
    .then((prod) => {
      var qt = 1;
      if (req.query.quantity != undefined) qt = Number(req.query.quantity);
      if (typeof req.session.cart == "undefined") {
        req.session.cart = [];
        req.session.cart.push({
          product: prod,
          quantity: qt,
        });
      } else {
        var cart = req.session.cart;
        var test = true;
        cart.forEach(function (c) {
          if (c.product.title == req.params.title) {
            if (prod.quantity >= c.quantity + qt) c.quantity += qt;
            else {
              c.quantity = prod.quantity;
              req.flash("error", "Stock disponible insuffisant");
            }
          }
        });
        cart.forEach(function (c) {
          if (c.product.title == req.params.title) {
            test = false;
          }
        });
        if (test) {
          cart.push({
            product: prod,
            quantity: qt,
          });
        }
      }

      return res.redirect("back");
    })
    .catch((err) => {
      return next(err);
    });
};

// delete from cart

exports.supprimerProduit = (req, res, next) => {
  var cart = req.session.cart;
  cart.forEach(function (c) {
    if (c.product.title == req.params.title) {
      cart.splice(cart.indexOf(c), 1);
    }
  });
  if (cart.length < 1) return res.redirect("/product");
  else return res.redirect("/cart");
};

// get substraction prod

exports.subtraction = (req, res, next) => {
  var cart = req.session.cart;
  cart.forEach(function (c) {
    if (c.product.title == req.params.title) {
      if (c.quantity > 1) c.quantity--;
      else req.flash("error", "C'est le minimum");
      ;
    }
  });
  return res.redirect("back");
};

// get clear cart

exports.viderPanier = (req, res, next) => {
  req.session.cart = [];
  return res.redirect("/product");
};

// get order
exports.afficherCommande = (req, res, next) => {
  if(req.session.cart.length>0)
  {
      res.render("order", {
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
    cart: req.session.cart,
  });
  }
  else {
    res.redirect('/cart')
  }

};

// post order
exports.commander = async(req, res, next) => {
  const cart = req.session.cart;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("order", {
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      cart: req.session.cart,
      errors: errors.errors,
    });
  } else {

    const user = await User.findById(req.session.user._id);
    user.adresse= req.body.adresse;
    user.codeP = req.body.code;
    user.save();
    var montant = Number(req.body.total);
    if (req.body.liv == "domicile") montant += 7;

    let lastOrder= await Order.findOne().sort({date: -1});
    let num =1;
    if(lastOrder!=undefined) num=(lastOrder.numero)+1;

    const newOrder = new Order({
      user: user,
      numero : num,
      date: Date.now(),
      detail: [],
      montant: montant,
      livraison : req.body.liv,
      payment : false
    });
    newOrder
      .save()
      .then(async (result) => {

        cart.forEach(function(dt){
          let newDetail = new DetailOrder({
            product : dt.product,
            quantity : dt.quantity,
            order : result
            })
            result.detail.push(newDetail);
            newDetail.save();

            Product.findById(dt.product._id).then((prod) => {
              prod.quantity -= dt.quantity;
              prod.save();
            });

        });
          result.save();


        let filePath = 'files/'+result.numero;
        await createPDF(result,cart,filePath);
        var text = `BONJOUR ${user.displayName.toUpperCase()},MERCI D'AVOIR EFFECTUÉ VOS ACHATS SUR SISSE! `;
        await sendEmail(user.email, "Confirmation de commande", text);
        req.flash("success", "Commande effectuée");
        req.session.cart = [];
        return res.redirect("/");
          
      })
      .catch((error) => {
        return console.log(error);
      });

            
  }
};


exports.envoyerMessage =  async (req,res,next)=>{
  const { fullName , email  , subj , message } = req.body ; 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    res.render("index", {
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      cart: req.session.cart,
      errors: errors.errors,
    });

  }
  else {
    const newMessage = new Message({
        fullName : fullName , 
        email : email ,
        subject : subj , 
        message : message,
        reply : false
    })
    newMessage.save();
    req.flash("success", "Message envoyé");
    res.redirect("/");
  }
}
