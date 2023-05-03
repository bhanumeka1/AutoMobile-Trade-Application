const express = require('express');
const controller = require('../controllers/tradesController');
const {isLoggedIn, isAuthor} = require('../middlewares/auth');
const {validateId,validateitem} = require('../middlewares/validator');

const router = express.Router();

router.get('/',controller.trades)

router.get('/newTrade',isLoggedIn,controller.new)

router.post('/',isLoggedIn, validateitem, controller.create)

router.get('/:id',validateId,controller.trade)

router.get('/:id/edit',isLoggedIn,validateId,isAuthor,controller.edit)

router.put('/:id',isLoggedIn,validateId,isAuthor,validateitem,controller.update)

router.delete('/:id',isLoggedIn,validateId,isAuthor,controller.delete)

router.get('/:id/trade',isLoggedIn,validateId,controller.createTrade);

router.get('/:id/tradeitem',isLoggedIn,controller.ownTrade);

router.get("/:id/manage",isLoggedIn,validateId,controller.managetrades);

router.delete("/:id/offerdelete",isLoggedIn,validateId,controller.deleteOffer);

router.delete("/:id/manageofferdel",validateId,controller.managedeleteoffer);

router.post('/:id/watchlist',isLoggedIn,validateId,controller.watchlistadd);

router.delete("/:id/savedelete",isLoggedIn,validateId,controller.savedelete);

router.get("/:id/accept",isLoggedIn,validateId,controller.accept);

router.get("/:id/reject",isLoggedIn,validateId,controller.reject);

module.exports = router;