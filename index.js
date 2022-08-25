const connectToMongo = require('./db');
connectToMongo();

const cors = require('cors')

const express = require('express');
const app = express();
const port = 5000;
//Middle ware
app.use(cors());
app.use(express.json());

//Available routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));


app.get('/', (req, res) => {
  res.send('Hi Guys!!');
})

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
})