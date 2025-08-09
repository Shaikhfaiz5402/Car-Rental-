import express from 'express';
const router = express.Router();

// Get all bikes
router.get('/', (req, res) => {
  res.send('Get all bikes');
});

// Add a new bike
router.post('/', (req, res) => {
  res.send('Add a new bike');
});

// You can add more bike-related routes here

export default router;
