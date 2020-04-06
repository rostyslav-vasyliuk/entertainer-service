require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const apiRouter = require('./api/routes/api-routes');

const port = process.env.PORT || 3030;

const mongoose = require('mongoose');

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;

// mongoose.connect(uri, { useNewUrlParser: true }).then(
//   () => {
//     console.log('DB connected')
//   }
// );

// const directory = path.join(__dirname, '/uploads');

app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.text({ type: 'text/plain', limit: '50mb' }));

app.use('/api', apiRouter);

app.get('/', (req, res) => res.json('Server is running!'));

const server = app.listen(port, () => console.log('Server is running on port ' + port)); //eslint-disable-line

module.exports = app;
