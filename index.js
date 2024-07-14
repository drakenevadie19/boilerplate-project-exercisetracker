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
  // console.log("inputted User id " + userId);

  // Getting inputted exercise description from post body
  const exerciseDescription = req.body.description;

  // Getting inputted exercise duration from post body
  const exerciseDuration = req.body.duration;

  // Getting inputted exercise date from post body
  const exerciseDate = req.body.date;

  // Checking whether id existed in db or not, if not, send an error
  // if yes, push to Mongo and send the inputted message
  const userGet = await UserMongoDB.findOne({ _id: userId });

  try {
    if (userGet) {
      let logHistory = userGet.log;

      let dateInputted = !exerciseDate ? new Date().toDateString() : new Date(exerciseDate).toDateString()

      logHistory.push({
        description: exerciseDescription,
        duration: exerciseDuration,
        date: dateInputted
      });
  
      const result = await UserMongoDB.updateOne(
        { _id: userId }, 
        { $push: { log: logHistory } }
      )
      res.json({
        username: userGet.username,
        _id: userId, 
        description: exerciseDescription,
        duration: exerciseDuration,
        date: dateInputted
      });
    } else {
      res.send({ error: "non-existed ID" });
    }
  } catch (err) {
    res.send({ error: err });
  }
});

// app.post("/api/users/:_id/exercises", async (req, res) => {
//   try {
//     const userId = req.params._id;
//     const { description, duration, date } = req.body;

//     if (!description || !duration) {
//       return res.status(400).send({ error: 'Description and duration are required' });
//     }

//     const userGet = await UserMongoDB.findById(userId);
//     if (!userGet) {
//       return res.status(404).send({ error: "Non-existed ID" });
//     }

//     const dateInputted = date ? new Date(date).toDateString() : new Date().toDateString();
    
//     const exercise = {
//       "description": description,
//       "duration": duration,
//       "date": dateInputted
//     };
    
//     userGet.log.push(exercise);
//     await userGet.save();

//     res.json(
//       {
//         "returnRes": 
//           {
//             "username": userGet.username,
//             "_id": userGet._id,
//             "description": description,
//             "duration": duration,
//             "date": dateInputted
//           }
//       }
//     );
//   } catch (err) {
//     res.status(500).send({ error: 'Internal Server Error' });
//   }
// });

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const userLog = await UserMongoDB.findById(userId);
    if (!userLog) {
      return res.status(404).send({ error: "ID not exist, try again" });
    }

    let log = userLog.log;

    if (from || to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      log = log.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return (!from || exerciseDate >= fromDate) && (!to || exerciseDate <= toDate);
      });
    }

    if (limit) {
      log = log.slice(0, parseInt(limit));
    }

    const exercisesOfUser = log.map(({ description, duration, date }) => ({
      description,
      duration,
      date: new Date(date).toDateString()
    }));

    res.send({
      username: userLog.username,
      count: userLog.log.length,
      _id: userId,
      log: exercisesOfUser
    });
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});