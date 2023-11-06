const router = require('express').Router();
const MESSAGES = require('../store/messages.js');

router.get('/', (req, res) => {
  res.json(MESSAGES);
})

module.exports = router;
