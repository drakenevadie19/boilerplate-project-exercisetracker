const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// use mongoose
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

let logHistory = [];

app.post("/api/users", (req, res) => {
  // Push user with username from request body to MongoDB
  // Getting inputted username
  const userName = req.body.username;
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

});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  // Log all info of that user!
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
