require('dotenv').config({path:"backend/.env"});
const connectToMongo = require('./db');
connectToMongo();  
const express = require('express')
const cors = require('cors') 
const app = express()
const port = process.env.PORT || 6000

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => { 
  res.send('Hello World!');
}) 

app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))



app.listen(port, () => {
  console.log(`GraspNotes Backend listening at ${port}`)
})
