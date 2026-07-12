const express = require('express');
const subscriptionController = require('../controllers/subscription.controller');
const validate = require('../middlewares/validate.middleware');
const { subscribeSchema } = require('../validators/subscription.validator');

const router = express.Router();

router.post('/', validate(subscribeSchema), subscriptionController.subscribe);
router.get('/verify', subscriptionController.verify);
router.delete('/unsubscribe', subscriptionController.unsubscribe);

module.exports = router;
