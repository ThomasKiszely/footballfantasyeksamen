const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json([]);
});

router.post('/', (req, res) => {
    res.status(201).json({ id: 1 });
});

router.get('/:id', (req, res) => {
    res.status(200).json({ id: req.params.id });
});

router.patch('/:id', (req, res) => {
    res.status(200).json({ id: req.params.id });
});

router.delete('/:id', (req, res) => {
    res.status(204).send();
});

module.exports = router;