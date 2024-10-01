const express = require('express');
const bodyParser = require('body-parser');
const flightRoutes = require('./routes/flight')
const app = express();


const PORT = 3001;

app.use(bodyParser.json());

app.use('/flight', flightRoutes);

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));