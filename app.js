const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const AppErr = require('./utils/appError');
const handleError = require('./controller/erorrController');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');

const app = express();
//Global middleware
//1)helmet middle ware
app.use(helmet()); // i didnt why we us it
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message:
    'Too many requests from this IP (/api), please try again in an 15 minutes!',
});
//2)express-rate-limit  middle ware for limit requisr for specfic api
app.use('/api', limiter);
//3)Body Parser for reading data from  to req.body as json not as text
app.use(express.json());
app.use(express.static(`${__dirname}/public/`));
//4)morgan mille ware for show req info
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//5)middle ware not used

app.use((req, res, next) => {
  console.log(' hellow from middlewar ');
  next();
});
//5)middleware for display time
app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  console.log(req.reqestTime);
  next();
});
/* app.get("/",(req,res)=>{
    res.status(200).send("thi is get method ");
});
*/
//Tours
//Users

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // passing parameter to the next tell nide to jumpt to middle ware error
  //that consest of 4 argument
  next(new AppErr(`we cant find the Url ${req.originalUrl}`, 404));
});
//error middle ware
app.use(handleError);

module.exports = app;
