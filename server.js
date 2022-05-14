const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  //end server working requist
  console.log('uncaughtExeption error'); // not a goode idea that app crash so it will make it start again later
  process.exit(1); //shutdown
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log('saeed');
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('dbconnected successfuly');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('your app has been created');
});
//unhandledRejection error
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    //end server working requist
    console.log('App crached and it will shut down '); // not a goode idea that app crash so it will make it start again later
    process.exit(1); //shutdown
  });
});
