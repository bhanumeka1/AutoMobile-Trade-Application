//require modules
const express = require("express");
const morgan = require("morgan");
const methodoveride = require("method-override");
const mongoose = require('mongoose');
const tradesRouting = require("./routes/tradesRouting");
const mainRouting = require("./routes/mainRouting");
const userRouting = require("./routes/userRouting");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash")

const app = express();

const port = 3001;
const host = "localhost";
app.set("view engine", "ejs");

mongoose.connect('mongodb://127.0.0.1:27017/trading',{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
  app.listen(port, host, ()=>{
    console.log('Server is running on port ', port);
  })
})
.catch(err=>console.log(err.message));

app.use(
  session({
    secret:"zxcvbnmasdfghjkl",
    resave: false,
    saveUninitialized: false,
    store:new MongoStore({mongoUrl:'mongodb://127.0.0.1:27017/trading'}),
    cookie:{maxAge: 60*60*1000}
  })
)

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user||null;
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  next();
});
//For using static files like images and stylesheets.
app.use(express.static("public"));
//For navigating through url when values are posted.
app.use(express.urlencoded({ extended: true }));
//For logging all requests. 
app.use(morgan("tiny"));
//For handling different HTTP requests.
app.use(methodoveride("_method"));

app.use('/',mainRouting);
app.use('/trades',tradesRouting);
app.use('/user',userRouting);

app.use((req, res, next) => {
  let error = new Error("Server cannot locate " + req.url);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
    err.message = "Internal server error";
  }
  res.status(err.status);
  res.render("error", { error: err });
});
