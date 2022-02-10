var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./models/User");
const flash = require("connect-flash");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");

var app = express();
databaseURI =
  "mongodb+srv://ssise:155546@ssise.zyotn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const store = new MongoDBStore({
  uri: databaseURI,
  collection: "sessions",
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(
  session({
    secret: "SSISE",
    resave: true,
    saveUninitialized: false,
    store: store,
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use(flash());



app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("*", function (req, res, next) {
  res.locals.cart = req.session.cart;
  next();
});
app.use(function (req, res, next) {
  app.locals.errors = null;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRouter);
app.use("/admin", adminRouter);

// // catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose
  .connect(databaseURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => {
    console.log("db is connected");

    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  })
  .catch((err) => console.log(err));
