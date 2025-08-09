import express from 'express';
const router = express.Router();

// Get all helmets
router.get('/', (req, res) => {
  res.send('Get all helmets');
});

// Add a new helmet
router.post('/', (req, res) => {
  res.send('Add a new helmet');
});

// You can add more helmet-related routes here

export default router;
