const EventModel = require('../models/events.model');
const UserModel = require('../models/users.model');
const Token = require('../models/googleToken.model');
const logger = require('../config/logger');
const { google } = require('googleapis');
const oauth2Client = require('../config/google');

const addEvents = async (req, res) => {
    let { eventDate, eventName, eventPlace, priority, startTime, endTime,_id } = req.body;
    let { email } = req.user;

    try {
        const eventStartTime = new Date(startTime);
        const eventEndTime = new Date(endTime);

        if (eventStartTime >= eventEndTime) {
            return res.status(400).json({ status: false, message: 'Start time must be before end time' });
        }

        if(_id){

            const eventData = {
                email: email,
                summary: eventName,
                date: eventDate,
                start: eventStartTime,
                end: eventEndTime,
                location: eventPlace,
                priority: priority
            };
            savedEvent = await EventModel.findByIdAndUpdate(
                _id,  
                { $set: eventData },
                { new: true }
            );            

        }else{


            const existingEvent = await EventModel.findOne({
                email: email,
                date: eventDate,
                $or: [
                    {
                        $and: [
                            { start: eventStartTime },
                            { end: eventEndTime }
                        ]
                    },
                    {
                        $and: [
                            { start: { $lt: eventEndTime } },
                            { end: { $gt: eventStartTime } } 
                        ]
                    }
                ]
            });

            const user = await UserModel.findOne({email});
            const token = await Token.findOne(); 

            if (existingEvent) {
                return res.status(200).json({ status: false, message: 'Already have an event scheduled at this time' });
            }

            const newEvent = new EventModel({
                email: email,
                summary: eventName,
                date: eventDate,
                start: eventStartTime,
                end: eventEndTime,
                location: eventPlace,
                priority: priority
            });

            const savedEvent = await newEvent.save();

            if(user.googleSync){
                oauth2Client.setCredentials({
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    scope: token.scope,
                    token_type: token.token_type,
                    expiry_date: token.expiry_date,
                });
        
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
                if (token.expiry_date <= Date.now()) {
                    oauth2Client.setCredentials({
                        refresh_token: token.refresh_token,
                    });
                    const { credentials } = await oauth2Client.refreshAccessToken();
                    oauth2Client.setCredentials(credentials);
                }
        
                const event = {
                    id: savedEvent._id.toString(),
                    summary: eventName,
                    location: eventPlace || '',
                    start: {
                        dateTime: startTime,
                    },
                    end: {
                        dateTime: endTime,
                    },
                };

                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: event,
                });
            }
        }

        res.status(200).json({ status: true, message: 'Event saved successfully' });

    } catch (err) {
        logger.error(`Error in add events: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getEvents = async(req,res) => {
    let {email} = req.user;

    try{
        const events = await EventModel.find({email});

        res.status(200).json({status:true,events})

    }catch(err){
        logger.error(`Error in get events: ${err.message}`);
        res.status(500).json({error:'Internal Server Error'});
    }
}

const allEvents = async (req, res) => {
    const { email } = req.user;
    const { priority } = req.query; 
  
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      let query = { email };
  
      if (priority) {
        query.priority = priority; 
      }
  console.log(query);
      const [events, totalEvents] = await Promise.all([
        EventModel.find(query).sort().skip(skip).limit(limit),
        EventModel.countDocuments(query),
      ]);

      console.log(events);
  
      res.status(200).json({ status: true, events, totalEvents });
    } catch (err) {
      console.error(`Error in get all events: ${err.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports={
    addEvents,
    allEvents,
    getEvents
}