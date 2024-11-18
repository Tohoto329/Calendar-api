const express = require('express');
const { route } = require('./app');
const router = new express.Router();
const verifyToken = require('./middleware/jwt');

const user = require('./controllers/users');
const events = require('./controllers/events');
const google = require('./controllers/google');

router.get('/health', function(req,res){
    res.send('OK');
})

router.post('/login',user.login)
router.post('/register-user',user.register)
router.get('/search', user.search)

router.post('/add-event', verifyToken, events.addEvents);
router.get('/events', verifyToken, events.allEvents);
router.get('/get-events', verifyToken, events.getEvents);

router.get('/google-auth', verifyToken, google.getToken);
router.get('/oauth2callback', google.oauth2callback);
router.get('/get-google-events', verifyToken, google.getGoogleEvents);

module.exports = router
