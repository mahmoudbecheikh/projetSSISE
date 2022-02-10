const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Message = require('../models/Message');
const DetailOrder = require('../models/DetailOrder');
const sendEmail = require("../utils/email");
const createPDF = require ("../utils/pdf")
const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
var fs = require('fs');
let path = require("path");


// get admin
exports.afficherAdmin = async function (req, res, next) {
  const cat_count = await Category.countDocuments({});
  const subc_count = await SubCategory.countDocuments({});
  const prod_count = await Product.countDocuments({});
  const order_count = await Order.countDocuments({});
  const user_count = await User.countDocuments({});
  const msg_count = await Message.countDocuments({});
  let lastorders= await Order.find().populate('user').sort({date: -1}).limit(5);
  let details = await DetailOrder.findOne({_id:"6158621793f21839089b3805"})
  .populate('order').populate('product');
  ;


  console.log(details)

  res.render("admin/admin.ejs", {
    user: req.session.user,
    cat: cat_count,
    subc: subc_count,
    prod: prod_count,
    order: order_count,
    user: user_count,
    msg : msg_count,
    orders:lastorders
  });
};

// get categories

exports.afficherCategorie = (req, res, next) => {
  Category.find({})
    .then((result) => {
      res.render("admin/categories", {
        categories: result,
        count: result.length,
      });
    })
    .catch((error) => {
      return console.log(error);
    });
};

// get add category

exports.getAjouterCategorie = (req, res, next) => {
  res.render("admin/add_category",{
    title : ""
  });
};

/* post add category */

exports.ajouterCategorie = (req, res, next) => {
  let newTitle = req.body.title.toLowerCase().trim();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("admin/add_category", {
      errors: errors.errors,
      title : newTitle
    });
  } else {
    Category.findOne({ title: newTitle })
      .then((result) => {
        if (!result) {
          let cat = new Category({
            title: newTitle,
          });
          cat.save();
          req.flash("success", "Catégorie créée");
          res.redirect("/admin/categories");
        } else {
          req.flash("error", "Titre déjà utilisé");
          res.redirect("/admin/categories/add-category");
        }
      })
      .catch((error) => {
        return console.log(error);
      });
  }
};

/*get edit category */

exports.getModifierCategorie = (req, res, next) => {
  Category.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.render("admin/edit_category", {
          title: result.title,
          id: req.params.id,
        });
      }
    })
    .catch((error) => {
      return console.log(error);
    });
};

/*post edit category */

exports.modifierCategorie = async (req, res, next) => {
  let newTitle = req.body.title.toLowerCase().trim();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const category = await Category.findById(req.params.id);
    res.render("admin/edit_category", {
      id: req.params.id,
      title: category.title,
      errors: errors.errors,
    });
  } else {
    const categories = await Category.find({ title: newTitle });

    console.log(req.body.title);
    console.log(categories);

    if (categories.length < 1) {
      Category.findByIdAndUpdate(req.params.id)
        .then((result) => {
          if (result) {
            result.title = newTitle;
            result.save();
            req.flash("success", "Catégorie modifie");
            return res.redirect("/admin/categories");
          }
        })
        .catch((error) => {
          return console.log(error);
        });
    } else {
      req.flash("error", "Titre déjà utilisé");
      return res.redirect("/admin/categories/edit-category/"+req.params.id);
    }
  }
};

/*get delete category */

exports.supprimerCategorie = (req, res, next) => {
  Category.findById(req.params.id)
    .then((result) => {
      result.subCategories.forEach(function (subc) {
        SubCategory.findById(subc).then((subcategory) => {
          subcategory.category = undefined;
          subcategory.save();
        });
      });
      Category.findByIdAndDelete(req.params.id)
        .then((result) => {
          if (result) {
            res.redirect("/admin/categories");
          }
        })
        .catch((error) => {
          return console.log(error);
        });
    })
    .catch((error) => {
      return console.log(error);
    });
};

/* GET subCategories. */

exports.afficherSousCategorie = (req, res, next) => {
  if (req.query.cat) {
    let title = req.query.cat.toLowerCase().trim();
    Category.findOne({ title: title }).then((result) => {
      SubCategory.find({ category: result })
        .populate("category")
        .then((subc) => {
          res.render("admin/sub_categories", {
            subcategories: subc,
            count: subc.length,
          });
        });
    });
  } else {
    SubCategory.find({})
      .populate("category")
      .then((subc) => {
        console.log(subc);
        res.render("admin/sub_categories", {
          subcategories: subc,
          count: subc.length,
        });
      });
  }
};

/* get add subCategories. */

exports.getAjouterSousCategorie = (req, res, next) => {
  Category.find({}).then((result) => {
    console.log(result);
    res.render("admin/add_subcategory", {
      categories: result,
      title : ""
    });
  });
};
/* post add subCategories. */

exports.ajouterSousCategorie = async (req, res, next) => {
  let title = req.body.title.toLowerCase().trim();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await Category.find({});
    res.render("admin/add_subcategory", {
      categories: categories,
      errors: errors.errors,
      title : title
    });
  } else {
    Category.findOne({ title: req.body.category }).then((cat) => {
      SubCategory.findOne({ titleSub: title }).then((subc) => {
        if (!subc) {
          const newSub = new SubCategory({
            titleSub: title,
            category: cat,
          });
          newSub
            .save()
            .then((savedSub) => {
              cat.subCategories.push(savedSub);
              cat.save();
              req.flash("success", "Sous Catégorie créée");
              res.redirect("/admin/subcategories");
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          req.flash("error", "Titre déjà utilisé");
          res.redirect("/admin/subcategories/add-subcategory");
        }
      });
    });
  }
};

/*get edit subcategory */

exports.getModifierSousCategorie = (req, res, next) => {
  SubCategory.findById(req.params.id)
    .then((result) => {
      if (result) {
        Category.find({})
          .then((cat) => {
            res.render("admin/edit_subcategory", {
              categories: cat,
              subc: result,
            });
          })
          .catch();
      }
    })
    .catch((error) => {
      return console.log(error);
    });
};

/*post edit subcategory */

exports.modifierSousCategorie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const subcategory = await SubCategory.findById(req.params.id);
    const categories = await Category.find({});
    res.render("admin/edit_subcategory", {
      categories: categories,
      subc: subcategory,
      errors: errors.errors,
    });
  } else {
    let title = req.body.title.toLowerCase().trim();
    const subcategories = await SubCategory.find({ titleSub: title });
    SubCategory.findById(req.params.id).then((result) => {
      Category.findById(result.category).then((cat) => {
        if (cat) {
          let tabCat = cat.subCategories;
          let i = cat.subCategories.indexOf(result._id);
          tabCat.splice(i, 1);
          cat.save();
        }
      });
      let title = req.body.title.toLowerCase().trim();
      Category.findOne({ title: req.body.category })
        .then((category) => {
          console.log(subcategories)
          if ( subcategories.length<1){
              result.titleSub = title;
              result.category = category;
              result.save().then((sub) => {
              category.subCategories.push(sub);
              req.flash("success", "Catégorie modifie");
              category.save();
              res.redirect("/admin/subcategories");
          });
          } 
          else {
              if(result.titleSub==title) {
                result.category = category;
                result.save().then((sub) => {
                category.subCategories.push(sub);
                req.flash("success", "Catégorie modifie");
                category.save();
                res.redirect("/admin/subcategories");
            });
              }
              else {
                req.flash("error", "Titre déjà utilisé");
                res.redirect("/admin/subcategories/edit-subcategory/"+req.params.id);
              }

          }
          
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
};

/*get delete subcategory */

exports.supprimerSousCategorie = (req, res, next) => {
  SubCategory.findById(req.params.id)
    .then((result) => {
      let tab = result.products;
      for (let i = 0; i < tab.length; i++) {
        Product.findById(tab[i]).then((prod) => {
          prod.subCategory = undefined;
          prod.save();
        });
      }
      Category.findById(result.category).then((cat) => {
        if (cat) {
          let tabCat = cat.subCategories;
          let i = cat.subCategories.indexOf(result._id);
          tabCat.splice(i, 1);
          cat.save();
        }
        result.remove().then((resp) => {
          res.redirect("/admin/subcategories");
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// *****************************************************************************
// ******************************************************************************

/* get products*/

exports.afficherProduit = async (req, res, next) => {
  if (req.query.subc) {
    const subc = req.query.subc.toLowerCase().trim();
    SubCategory.findOne({ titleSub: subc }).then((subcategory) => {
      if (subcategory) {
        Product.find({ subCategory: subcategory._id })
          .populate("subCategory")
          .then((result) => {
            res.render("admin/product", {
              count: result.length,
              products: result,
            });
          });
      } else {
        res.render("admin/product", {
          count: 0,
        });
      }
    });
  } else {
    Product.find({})
      .populate("subCategory")
      .then((result) => {
        res.render("admin/product", {
          count: result.length,
          products: result,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

/* get add product */

exports.getAjouterProduit = (req, res, next) => {
  SubCategory.find({})
    .then((result) => {
      res.render("admin/add_product", {
        subcategories: result,
      });
    })
    .catch((error) => {});
};

/* post add product */

exports.ajouterProduit = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const subcategories = await SubCategory.find({});
    res.render("admin/add_product", {
      subcategories: subcategories,
      errors: errors.errors,
    });
  } else {
    

    let title = req.body.title.toLowerCase().trim();
    Product.findOne({ title: title })
      .then((result) => {
        if (!result) {
          SubCategory.findOne({ titleSub: req.body.subcategory })
            .then((subc) => {
              let image ;
              if(!req.file) image = "default-product-img.png";
              else image =req.file.filename;
              const prod = new Product({
                title: title,
                description: req.body.desc.trim().toLowerCase(),
                price: req.body.price,
                image: image,
                quantity: req.body.quantity,
                subCategory: subc,
              });
              prod
                .save()
                .then((savedprod) => {
                  subc.products.push(savedprod);
                  subc.save();
                  req.flash("success", "Produit créé");
                  res.redirect("/admin/products");
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          req.flash("error", "Titre déjà utilisé");
          res.redirect("/admin/products/add-product");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

/* get edit product */

exports.getModifierProduit = (req, res, next) => {
  Product.findById(req.params.id)
    .then((result) => {
      SubCategory.find({}).then((subc) => {


        res.render("admin/edit_product", {
          prod: result,
          id: req.params.id,
          subcategories: subc,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

/* post edit product */

exports.modifierProduit = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const subcategories = await SubCategory.find({});
    const product = await Product.findById(req.params.id);
    res.render("admin/edit_product", {
      prod: product,
      id: req.params.id,
      subcategories: subcategories,
      errors: errors.errors,
    });
  } else {
    let title = req.body.title.toLowerCase().trim();
    const products = await Product.find({ title: title });

    Product.findById(req.params.id).then((result) => {
      if (result) {
        SubCategory.findById(result.subCategory).then((subc) => {
          let tab = subc.products;
          let i = tab.indexOf(result._id);
          tab.splice(i, 1);
          subc.save();
        });

        SubCategory.findOne({ titleSub: req.body.subcategory })
          .then((subcategory) => {
            result.subCategory = subcategory;
            if (products.length < 1)
            {
              result.title = title;
              if(req.file) result.image= req.file.filename,
              result.description = req.body.desc.trim().toLowerCase();
              result.price = req.body.price;
              result.quantity = req.body.quantity;
              result.save().then((prod) => {
                subcategory.products.push(prod);
                subcategory.save();
                req.flash("success", "Produit modifie");
                res.redirect("/admin/products");
              });
            }
            else {
              if(title==result.title){
                if(req.file) result.image= req.file.filename,
                result.description = req.body.desc.trim().toLowerCase();
                result.price = req.body.price;
                result.quantity = req.body.quantity;
                result.save().then((prod) => {
                  subcategory.products.push(prod);
                  subcategory.save();
                  req.flash("success", "Produit modifie");
                  res.redirect("/admin/products");
                });
              }
              else {
                req.flash("error", "Titre déjà utilisé");
                res.redirect("/admin/products/edit-product/"+req.params.id);

              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  }
};

/*get delte product */

exports.supprimerProduit = (req, res, next) => {
  Product.findById(req.params.id)
    .then((result) => {
      SubCategory.findById(result.subCategory).then((subc) => {
        if (subc) {
          let tab = subc.products;
          let i = tab.indexOf(result._id);
          tab.splice(i, 1);
          subc.save();
        }
        result.remove().then((resp) => {
          res.redirect("/admin/products");
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// get orders

exports.afficherCommande = async (req, res, next) => {
  const order_count = await Order.countDocuments({});
  if (req.query.input) {

    let input = req.query.input.toLowerCase().trim();
    console.log(input);
    const user = await User.findOne({displayName : input })
    let id ;
    if(user == null ) id=null;
    else {
      id = user._id;
      input = null
    }
    Order.find({
      $or: [
        { 'numero': input },
        { 'user': id }
      ]
    }).populate("user").then(result=>{
      res.render("admin/orders", {
        orders: result,
        count: result.length,

      });
    })

  } else  {

      if(req.query.liv || req.query.paiement){

        if(req.query.liv && req.query.paiement){
          Order.find({livraison:req.query.liv,payment:req.query.paiement})
          .populate("user")
          .then((result) => {
          res.render("admin/orders", { orders: result,
            count: result.length,
          });
        })
        .catch((error) => {
          console.log(error)
        });
        }
        else{
          Order.find({ $or: [
            { livraison: req.query.liv },
            { payment:req.query.paiement }
          ]}).populate("user").then((result) => {
            res.render("admin/orders", { orders: result,
              count: result.length,
            });
          })
          .catch((error) => {
            console.log(error)
          });
        }
      }

      else{
        Order.find({})
        .populate("user")
        .then((result) => {
          res.render("admin/orders", { orders: result,
            count: result.length,
          });
        })
        .catch((error) => {
          console.log(error)
        });
      }

     
    
    }
    

  
};


// confirmer order 

exports.confirmerCommande  = (req, res, next) => {
   Order.findById(req.params.id) 
    .then(async(result) => {
      const user =await User.findById(result.user);
      console.log(result)
      result.payment = true ; 
      result.save() ; 
      let filePath = 'files/'+result.numero;
      var text = `BONJOUR ${user.displayName.toUpperCase()},suite à votre paiement voici votre facture `;

      sendEmail(user.email, "Confirmation de commande", text,filePath+".pdf");
      res.redirect("back")
    });
};


// download order detail 
exports.telechargerPdf  = async (req, res, next) => {
  await Order.findById(req.params.id).populate("user").then(( result) => {
      DetailOrder.find({order : result._id}).populate("product").then(details=>{
        let filePath = './files/'+result.numero;
        createPDF(result,details,filePath)
        res.redirect("back")
      })

    });
};


// get delete order

exports.supprimerCommande = (req, res, next) => {
  Order.findByIdAndRemove(req.params.id)
    .then((result) => {
      console.log(result)
      if (result) {

      
        if(!result.payment)

        DetailOrder.find({order: req.params.id}).then((details)=>{
          details.forEach(function(dt){
            let newDetail = new DetailOrder({
              product : dt.product,
              quantity : dt.quantity,
              order : result
              })
              result.detail.push(newDetail);
              newDetail.save();
              
              Product.findById(dt.product._id).then((prod) => {
                prod.quantity += dt.quantity;
                prod.save();
              });
  
          });
        })

        DetailOrder.deleteMany({ order: req.params.id }).catch((error) => {
          console.log(error);
        });

          fs.unlink(  path.join(__dirname, '../files/', result.numero+'.pdf'),function(err){
              if(err) return console.log(err);
              console.log('file deleted successfully');
          });  

        res.redirect("/admin/orders");

      }
    })
    .catch((errors) => {
      console.log(errors);
    });
};

// get detail order

exports.afficherDetail = (req, res, next) => {
  Order.findById(req.params.id).then((result) => {
    DetailOrder.find({order : result._id}).populate("product").then(details=>{
      console.log(details)
      res.render("admin/detail-order", { details: details });
    })
    });
};




// get users

exports.afficherUtilisateur = async (req, res, next) => {
  const count = await User.countDocuments({});
  User.find({})
    .then((result) => {
      res.render("admin/users", {
        users: result,
        count: count,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// get add user 

exports.getAjouterUtilisateur = (req,res,next)=>{
  res.render("admin/add_user" , {
    first : "",
    last  : "" , 
    email: "" , 
    phone : ""
  });
}

exports.ajouterUtilisateur = (req, res, next) => {

  let first = req.body.first.toLowerCase().trim();
  let last = req.body.last.toLowerCase().trim();
  let email = req.body.email.trim();
  let password = req.body.password.trim() ;
  let confirmPassword = req.body.confirmPassword.trim();
  let phone = req.body.phone.trim();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.render("admin/add_user", { 
          errors:errors.errors,
          first : first,
          last  : last , 
          email: email , 
          phone : phone
      }
      )
  }
  else {
    
  
      console.log('first: ' + first) ;
      if (password !== confirmPassword) {
          console.log(password)
          console.log(confirmPassword)
          req.flash("error", "Les mots de passe ne sont pas identiques");
          return res.redirect("/admin/users/add-user")
      }
      console.log(first)
      User.find({ email: email }).then(user => {
          if (user.length > 0) {
              console.log(user)
              req.flash("error", "Cette adresse email est déjà utilisée");
              return  res.render("admin/add_user", { 
                first : first,
                last  : last , 
                email: email , 
                phone : phone
            }
            )
          }
          const displayName = first + " " + last
          bcrypt.hash(password, 12).then((hash) => {
              const UserConfig = {
                  displayName: displayName,
                  hashedPassword: hash,
                  email: email,
                  phone: phone,
                  adresse : "" ,
                  codeP : "" , 
              }
              console.log(UserConfig)
              const newUser = new User(UserConfig)
              return newUser.save()
  
          }).then(user => {
              return res.redirect('/admin/users')
          })
      }).catch(err => {
          console.log(err)
      })
  }
  
};

// get delete user

exports.supprimerUtilisateur = (req, res, next) => {
  console.log(req.params.id);
  User.findByIdAndDelete(req.params.id).then((result) => {
    Order.deleteMany({ user: req.params.id }).catch((error) => {
      console.log(error);
    });
    res.redirect("/admin/users");
  });
};

// get edit user

exports.getModifierUtilisateur = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      res.render("admin/edit_user", {
        displayName : user.displayName,
        email : user.email , 
        phone : user.phone , 
        adresse : user.adresse , 
        codeP : user.codeP,
        role : user.role,
        id : user._id
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// post edit user

exports.modifierUtilisateur = async(req, res, next) => {
  let first = req.body.first.toLowerCase().trim();
  let last = req.body.last.toLowerCase().trim();
  let email = req.body.email.trim();
  let password = req.body.password.trim();
  let confirmPassword = req.body.confirmPassword.trim();
  let phone = req.body.phone.trim();
  let adresse = req.body.adresse.toLowerCase().trim();
  let code = req.body.code.trim();
  const id = req.session.user._id.toString();
  const role = Number(req.body.role);
  const displayName = first + " " + last;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const user = await User.findById(req.params.id);
    res.render("admin/edit_user", {
      errors: errors.errors,
      displayName : displayName,
      email : email , 
      phone : phone , 
      adresse : adresse , 
      codeP : code,
      role : role,
      id : user._id
    });
  } else {




    if (password !== confirmPassword) {
      console.log(password);
      console.log(confirmPassword);
      req.flash("error", "Les mots de passe ne sont pas identiques");
      return res.redirect("/admin/users/edit-user/" + req.params.id);
    }
    User.find({ email: email })
      .then((users) => {
        if (users.length > 1) {
          console.log(users);
          req.flash("error", "Cette adresse email est déjà utilisée ");
          return res.redirect("/admin/users/edit-user/" + req.params.id);
        } else {
          User.findById(req.params.id ).then((user) => {
            console.log(displayName)
            bcrypt.hash(password, 12).then((hash) => {
              user.displayName = displayName;
              user.hashedPassword = hash;
              user.email = email;
              user.phone = phone;
              user.adresse = adresse;
              user.codeP = code;
              user.role = role;
              console.log(user);
              user.save();

              if (user.id == id && role == 2) {
                req.session.destroy();
                return res.redirect("/");
              }
              req.session.user = user;
              req.session.save();
              req.flash("success", "Utilisateur modifier");
              res.redirect("/admin/users");            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

};


// get message 
exports.afficherMessage= (req,res,next)=>{
  Message.find({}).then(messages=>{
    if(messages){
      res.render('admin/messages' , {
        messages  : messages,
        count : messages.length
      })
    }
  }).catch(error=>{
    console.log(error)
  })
}

// get message specified 
exports.afficherDetailMessage  = (req,res,next)=>{
  Message.findById(req.params.id).then(message=>{
    if(message){
      res.render('admin/show-message' , {
        message  : message
      })
    }
  }).catch(error=>{
    console.log(error)
  })
}


// post message reply 

exports.ajouterReponse= async (req,res,next)=>{

  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) {
    const message = await Message.findById(req.params.id) ; 
    res.render('admin/show-message' , {
      message  : message,
      errors : errors.errors
    })
  }

  else {
    Message.findById(req.params.id).then( message=>{
      if(message){
        let msg = req.body.message.trim();
        let text = `BONJOUR  ${message.fullName} voici notre reponse :  ${msg}` ;
        sendEmail(message.email, "Reponse", text);
        message.reply = true;
        message.replyMessage = msg ;
        message.save();
        req.flash( 'success','Message envoyé')
  
        res.redirect('/admin/messages')
      }
    }).catch(error=>{
      console.log(error)
    })
  }
}

// delete message 

exports.supprimerMessage = (req,res,next)=>{
  Message.findByIdAndDelete(req.params.id)
  .then((result) => {
    if (result) {
      res.redirect("/admin/messages");
    }
  })
  .catch((error) => {
    return console.log(error);
  });
}