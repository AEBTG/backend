import * as express from 'express';
import * as exchange from './controllers/Exchange';

const router = express.Router();

router.post('/api/orders/buyaebtg', exchange.getAEBTG);
router.get('/api/orders', exchange.getOrders);
export default router;
