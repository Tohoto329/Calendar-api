const Token = require('../models/googleToken.model');
const UserModel = require('../models/users.model');
const logger = require('../config/logger');
const { google } = require('googleapis');
const oauth2Client = require('../config/google');


const getToken = async(req,res) => {
    try {
        let {email} = req.user;
        const userToken = await Token.findOne(); 
        const googlesync = req.query.googlesync;

        const userGoogleSync = await UserModel.findOneAndUpdate(
            { email: email },
            { $set: { googleSync: googlesync} },
            { new: true }
        );

        if (!userToken) {
          const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            prompt: 'consent'
          });
          return res.status(200).json({ success: false, message: 'Redirecting to Google for authentication', authUrl });
        }
    
        if (userToken.expiry_date <= Date.now()) {
          oauth2Client.setCredentials({
            refresh_token: userToken.refresh_token,
          });
    
          const { credentials } = await oauth2Client.refreshAccessToken();
    
          return res.json({ success: true, accessToken: credentials.access_token });
        }
    
        res.json({ success: true, accessToken: userToken.access_token });
      } catch (error) {
        logger.error(`Error in get token: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error getting access token', error });
      }
}

const oauth2callback = async(req,res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const tokenDocument = new Token({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            scope: tokens.scope,
            token_type: tokens.token_type,
            expiry_date: tokens.expiry_date,
        });
  
      await tokenDocument.save();
      res.redirect(process.env.GOOGLE_REDIRECTION); 
    } catch (error) {
      logger.error(`Error in token redirect uri: ${error.message}`);
      res.status(500).send('Error during authentication');
    }
}

const getGoogleEvents = async(req,res) => {
    try {
        let {email} = req.user;
        const token = await Token.findOne(); 

        if (!token) {
          return res.status(404).send('No token found');
        }
    
        oauth2Client.setCredentials({
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          scope: token.scope,
          token_type: token.token_type,
          expiry_date: token.expiry_date,
        });
    
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
    
        const events = response.data.items;
        res.json({ events });
      } catch (error) {
        logger.error(`Error in getting goggle events: ${error.message}`);
        res.status(500).send('Error fetching events');
      }
}

module.exports={
    getToken,
    oauth2callback,
    getGoogleEvents
}




  