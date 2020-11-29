import * as express from 'express';
import * as exchange from './controllers/aeActions';

const router = express.Router();

router.post('/api/orders/buyaebtg', exchange.getAEBTG);

export default router;
