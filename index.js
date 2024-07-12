const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));

// Middleware to parse JSON bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// use mongoose
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: { type: Date, required: true }
    }
  ]
});

const UserMongoDB = mongoose.model('UserMongoDB', userSchema);

let logHistory = [];

app.post("/api/users", async (req, res) => {
  // Push user with username from request body to MongoDB
  // Getting inputted username
  const userName = req.body.username;
  
  // Check if user name existed or not
  const isExisted = await UserMongoDB.findOne({ username: userName });
  // console.log(isExisted);
  if (isExisted) {
    res.send({ error: "Username existed, please choose another username" });
  } else {
    const newUser = new UserMongoDB({ username: userName, log:[] });
    const result = await newUser.save();

    const user = await UserMongoDB.findOne({ username: userName });
    const id = user._id;
    res.send({ username: userName, _id: id })
  }
}); 

app.post("/api/users/:_id/exercises", (req, res) => {
  // Push exercise with id from request body to MongoDB
  // Getting inputted userId from input, but need to check it again
  const userId = req.body._id;

  // Getting inputted exercise description from post body
  const exerciseDescription = req.body.description;

  // Getting inputted exercise duration from post body
  const exerciseDuration = req.body.duration;

  // Getting inputted exercise date from post body
  const exerciseDate = req.body.date;

  // Checking whether id existed in db or not, if not, send an error
  // if yes, push to Mongo and send the inputted message
  // if ()
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  // Log all info of that user
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
