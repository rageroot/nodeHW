'use strict'
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Entry = require('./models/entry');
const entries = require("./routes/entries");
const bodyParser = require('body-parser');
const validate = require('./middleware/validate')
const register = require('./routes/register');
const session = require('express-session');
const messages = require('./middleware/messages')
const login = require('./routes/login');
const user = require('./middleware/user');
const api = require('./routes/api');
const page = require('./middleware/page');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2); //удобночитаемый json

app.use(bodyParser.json());   //разбор данных формы
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ //поддержка сеансов
  secret: 'secret',
  resave: false, saveUninitialized: true
}));

app.use('/api', api.auth); //API аутентификации
app.get('/api/user/:id', api.user);
app.get('/api/entries/:page?', page(Entry.count), api.entries);


app.use(user);
app.use(messages); //механизм передачи обратной связи пользователю. Требуется для возможности обратить из любой вьюшки
//

app.get('/', entries.list);

app.get('/register', register.form);
app.post('/register', register.submit);

app.get('/post', entries.form);
app.post('/post',
    validate.required('entry[title]'),
    validate.lengthAbove('entry[title]', 4),
    validate.required('entry[body]'),
    validate.lengthAbove('entry[body]', 4),
    entries.submit);

app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

app.post('/api/entry', entries.submit);


app.use(logger('dev')); //выводит журналы в формате удобном для разработки
app.use(express.json());  //разбирает тела запросов
app.use(express.urlencoded({ extended: true }));//расширеный разбор тела сообщения
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //предоставляет статические файлы из указанного каталога

app.use('/', indexRouter); //задает маршруты приложения
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler выводит страницы ошибок в формате хтмл в режиме разработки
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
