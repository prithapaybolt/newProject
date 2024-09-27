const express = require('express');
const app = express();
const router = express.Router();
const PORT = 3001;

router.use(express.json());

let flights = [];
let currentId = 1; 


router.post('/flights', (req, res) => {
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;
    const newFlight = {
        id: currentId++,
        airline,
        origin,
        destination,
        departureTime,
        arrivalTime
    };
    flights.push(newFlight);
    res.status(201).json({ message: 'Flight added', flight: newFlight });
});



router.get('/flights', (req, res) => {
    res.json(flights);
});



router.get('/flights/:id', (req, res) => {
    const { id } = req.params;
    const flight = flights.find(flight => flight.id === parseInt(id));
    
    if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.json(flight);
});


router.put('/flights/:id', (req, res) => {
    const { id } = req.params;
    const { airline, origin, destination, departureTime, arrivalTime } = req.body;

    const flight = flights.find(flight => flight.id === parseInt(id));
    
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



router.delete('/flights/:id', (req, res) => {
    const { id } = req.params;
    const flightIndex = flights.findIndex(flight => flight.id === parseInt(id));

    if (flightIndex === -1) {
        return res.status(404).json({ message: 'Flight not found' });
    }

    flights.splice(flightIndex, 1);
    res.json({ message: 'Flight deleted' });
});

module.exports = router

