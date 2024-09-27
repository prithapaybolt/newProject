const express = require('express');
const app = express();
const router = express.Router();
const PORT = 3001;

app.use(express.json());

let flight = [];
let currentId = 1; 



router.post('/flight', (req, res) => {
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;
    const newFlight = {
        id: currentId++,
        airline,
        origin,
        destination,
        departureTime,
        arrivalTime
    };
    flight.push(newFlight);
    res.status(201).json({ message: 'Flight added', flight: newFlight });
});



router.get('/flight', (req, res) => {
    res.json(flight);
});



router.get('/flight/:id', (req, res) => {
    const { id } = req.params;
    const flight = flight.find(flight => flight.id === parseInt(id));
    
    if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json(flight);
});


router.put('/flight/:id', (req, res) => {
    const { id } = req.params;
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;

    const flight = flight.find(flight => flight.id === parseInt(id));
    
    if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
    }

    flight.airline = airline || flight.airline;
    flight.origin = origin || flight.origin;
    flight.destination = destination || flight.destination;
    flight.departureTime = departureTime || flight.departureTime;
    flight.arrivalTime = arrivalTime || flight.arrivalTime;

    res.json({ message: 'Flight updated', flight });
});



router.delete('/flight/:id', (req, res) => {
    const { id } = req.params;
    const flightIndex = flight.findIndex(flight => flight.id === parseInt(id));

    if (flightIndex === -1) {
        return res.status(404).json({ message: 'Flight not found' });
    }

    flight.splice(flightIndex, 1);
    res.json({ message: 'Flight deleted' });
});


module.exports = router