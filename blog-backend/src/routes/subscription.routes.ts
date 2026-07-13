import express from 'express';
import SubscriptionController from '../controllers/subscription.controller';
import validate from '../middlewares/validate.middleware';
import { subscribeSchema } from '../validators/subscription.validator';

const router = express.Router();

router.post('/', validate(subscribeSchema), SubscriptionController.subscribe);
router.get('/verify', SubscriptionController.verify);
router.delete('/unsubscribe', SubscriptionController.unsubscribe);

export default router;
