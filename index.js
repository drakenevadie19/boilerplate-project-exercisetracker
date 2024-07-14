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
      date: { type: String, required: true }
    }
  ]
});

const UserMongoDB = mongoose.model('UserMongoDB', userSchema);

let logHistory = [];

app.get("/api/users", async (req, res) => {
  const listOfAllUsersInfo = await UserMongoDB.find();
  let listOfAllUsers = [];
  listOfAllUsersInfo.map((user) => {
    listOfAllUsers.push({ username: user.username, _id: user._id });
  })
  res.send(listOfAllUsers);
});

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
  const userId = req.params._id;
  console.log("inputted User id " + userId);

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
    let dateInputted;
    let dateInGMTFrom;
    if (!exerciseDate) {
      dateInGMTFrom = new Date();
    } else {
      dateInGMTFrom = new Date(exerciseDate);
    }
    
    dateInputted = dateInGMTFrom.toDateString();
    logHistory.push({
      description: exerciseDescription,
      duration: exerciseDuration,
      date: dateInputted
    });

    const result = await UserMongoDB.updateOne(
      { _id: userId }, 
      { $push: { log: logHistory } }
    )
      .then((res) => {
        res.send({
          username: isExisted.username,
          _id: userId, 
          description: exerciseDescription,
          duration: exerciseDuration,
          date: dateInputted
        })
      })
      .catch(err => console.log(err));
  } else {
    res.send({ error: "non-existed ID" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {

  // const { from, to, limit } = req.query;

  // let dateObj = {}
  // if (from) {
  //   dateObj["$gte"] = new Date(from)
  // }
  // if (to){
  //   dateObj["$lte"] = new Date(to)
  // }
  // let filter = {
  //   user_id: id
  // }
  // if(from || to){
  //   filter.date = dateObj;
  // }

  // const exercises = await UserMongoDB.find(filter).limit(+limit ?? 500);

  // test: https://3000-freecodecam-boilerplate-7vh7vhgqosc.ws-us115.gitpod.io/api/users/6691ba3813788562c879fd47/logs
  const userId = req.params._id;
  // Log all info of that user
  const userLog = await UserMongoDB.findOne({ _id: userId });
  if (!userLog) {
    res.send({ error: "id not exist, try again" });
  } else {
    let exercisesOfUser = [];

    userLog.log.map((user) => {
      exercisesOfUser.push(
        {
          description: user.description,
          duration: user.duration,
          date: new Date(user.date).toDateString()
        }
      );
    })

    res.send({
      username: userLog.username,
      count: userLog.log.length,
      _id: userId,
      log: exercisesOfUser
    });
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
