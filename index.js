const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let logHistory = [];

app.post("/api/users", (req, res) => {
  // Push user with username from request body to MongoDB
});

app.post("/api/users/:_id/exercises", (req, res) => {
  // Push exercise with id from request body to MongoDB
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  // Log all info of that user!
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
