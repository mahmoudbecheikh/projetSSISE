const User = require("../models/User")
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');


exports.getSignup = (req, res, next) => {
    res.render("auth/signup", { isAuth: req.session.isLoggedIn })
};

exports.inscrire = (req, res, next) => 
{
    var first = req.body.first.toLowerCase().trim();
    var last = req.body.last.toLowerCase().trim();
    var email = req.body.email.trim();
    var password = req.body.password.trim() ;
    var confirmPassword = req.body.confirmPassword.trim();
    var phone = req.body.phone.trim();
    if((req.body.path!='http://localhost:3000/login') && (req.body.path!= 'http://localhost:3000/signup') ) req.session.path = req.body.path;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        res.render("auth/signup", { 
            isAuth: req.session.isLoggedIn ,
            errors:errors.errors,
            cart : req.session.cart,
            first: first,
            last : last,
            email: email,
            phone: phone,
        }
        )
    }
    else {
        var first = req.body.first.toLowerCase().trim();
        var last = req.body.last.toLowerCase().trim();
        var email = req.body.email.trim();
        var password = req.body.password.trim() ;
        var confirmPassword = req.body.confirmPassword.trim();
        var phone = req.body.phone.trim();
    
        console.log('first: ' + first) ;
        if (password !== confirmPassword) {
            console.log(password)
            console.log(confirmPassword)
            req.flash("error", "Les mots de passe ne sont pas identiques");
            return res.redirect("/signup")
        }
        console.log(first)
        User.find({ email: email }).then(user => {
            if (user.length > 0) {
                console.log(user)
                req.flash("error", "Cette adresse email est déjà utilisée ");
                return res.redirect("/signup")
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
                req.session.isLoggedIn = true
                req.session.user = user
                req.session.save()
                console.log("You are logged IN!")
                return res.redirect(req.session.path)
            })
        }).catch(err => {
            console.log(err)
        })
    }
    
};

exports.getLogin = (req, res, next) => {

    if (req.session.isLoggedIn) {
        return res.redirect("/")
    }

    res.render("auth/login", { isAuth: req.session.isLoggedIn })
};

exports.connecter = (req, res, next) => {

    const email = req.body.email.trim();
    const password = req.body.password.trim();
    console.log(req.body.path)
    if((req.body.path!='http://localhost:3000/login') &&(req.body.path!= 'http://localhost:3000/signup') ) req.session.path = req.body.path;


    if(req.body.path==undefined) req.session.path="http://localhost:3000/"

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("auth/login", { 
            isAuth: req.session.isLoggedIn ,
            errors : errors.errors,
            cart :req.session.cart,
            email : email
        
        })
    }
    else {

        User.findOne({ email: email }).then(user => {
    
            if (!user) {
                req.flash("error", "Échec de la connexion : votre email ou votre mot de passe est incorrect");
                return res.redirect("/login")
            }
            else {
                


                bcrypt.compare(password, user.hashedPassword).then(function (result) {
                    if (result == true) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        req.session.save()
                        console.log("You are logged IN!")
                        return res.redirect(req.session.path)
    
                    } else {
                        req.flash("error", "Échec de la connexion : votre email ou votre mot de passe est incorrect");
                        return res.redirect("login")
                    }
    
    
                }).catch(err => {
                    console.log(err)
                });
    
            }
        }).catch(err => {
            console.log(err)
        })
    
    }

    
};
exports.deconnecter = (req, res, next) => {
    req.session.destroy((err) => {
        console.log("session Destroyed!");
        res.redirect("/");
    });
};