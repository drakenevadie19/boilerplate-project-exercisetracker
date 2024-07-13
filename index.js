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

app.post("/api/users/:_id/exercises", async (req, res) => {
  // Push exercise with id from request body to MongoDB
  // Getting inputted userId from input, but need to check it again
  const userId = req.body[':_id'];
  console.log("inputted User id" + userId);

  // Getting inputted exercise description from post body
  const exerciseDescription = req.body.description;

  // Getting inputted exercise duration from post body
  const exerciseDuration = req.body.duration;

  // Getting inputted exercise date from post body
  const exerciseDate = req.body.date;

  // Checking whether id existed in db or not, if not, send an error
  // if yes, push to Mongo and send the inputted message
  const isExisted = await UserMongoDB.findOne({ _id: userId });
  if (isExisted) {
    logHistory = isExisted.log;
    const dateInGMTFrom = new Date(exerciseDate);
    const date = dateInGMTFrom.toDateString();
    logHistory.push({
      description: exerciseDescription,
      duration: exerciseDuration,
      date: date
    });

    const result = await UserMongoDB.updateOne(
      { _id: userId }, 
      { $push: { log: logHistory } }
    )
      .then((res) => console.log("Push successfully"))
      .catch(err => console.log(err));

    res.send({
      username: isExisted.username,
      description: exerciseDescription,
      duration: exerciseDuration,
      date: date, 
      _id: userId
    })
  } else {
    res.send({ error: "non-existed ID" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  // test: https://3000-freecodecam-boilerplate-7vh7vhgqosc.ws-us115.gitpod.io/api/users/6691ba3813788562c879fd41/logs
  const userId = req.params._id;
  // Log all info of that user
  const userLog = await UserMongoDB.findOne({ _id: userId });
  if (!userLog) {
    res.send({ error: "id not exist, try again" });
  } else {
    res.send({
      username: userLog.username,
      count: userLog.log.length,
      log: userLog.log
    });
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
