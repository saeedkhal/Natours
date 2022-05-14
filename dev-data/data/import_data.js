const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const tourModel = require('../../models/tour_model');

dotenv.config({ path: '../../config.env' });

// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    await tourModel.create(tours);
    console.log('the data has been imported');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};
const removeData = async () => {
  try {
    await tourModel.deleteMany();
    console.log('the data has been removed');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};
if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  removeData();
}
