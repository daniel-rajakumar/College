const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const contactRouter = require('./routes/contact');

const Database = require('./db/contactDB');
const db = new Database();
db.initialize()


const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Adding DB to request");
  req.db = db;
  next();
})

app.use(session({
  secret: 'cmps369',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = {
      id: req.session.user.id,
      username: req.session.user.username
    }
  }
  next()
})


app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', contactRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







