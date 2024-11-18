const bcrpyt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/users.model');
const EventModel = require('../models/events.model');
const logger = require('../config/logger');

const login = async(req, res) =>{
    let {email,password} = req.body;

    try{
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({message:'Email not found'})
        }

        const passwordMatch = await bcrpyt.compare(password, user.password);
        if(passwordMatch){
            const googleSyncStatus = user.googleSync;

            const token = jwt.sign(
                {
                    userId:user._id,
                    email:user.email
                },
                `${process.env.SECRET_KEY}`,
                {expiresIn:'2h'}
            );
            res.status(200).json({status:true,token,googleSync:googleSyncStatus});
        }else{
            res.status(401).json({message:'Incorrect Password'})
        }
    }catch(err){
        logger.error(`Error in checkUser: ${err.message}`);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const register = async(req,res) =>{
    let {username,email,password} = req.body;
    try{
        const user = await UserModel.findOne({email});
        if(user){
            return res.status(200).json({message:'Email already Exist'});
        }

        const hashedPassword = await bcrpyt.hash(password,10);

        const newUser = new UserModel({
            username:username,
            email:email,
            password:hashedPassword
        });

        await newUser.save();

        res.status(200).json({message:'Registered Successfully'});

    }catch(err){
        logger.error(`Error in register: ${err.message}`);
        res.status(500).json({error:'Internal Server Error'});
    }
}

const search = async (req, res) => {
    try {
        const { query } = req.query;

        const user = await UserModel.findOne({ email: new RegExp(query, 'i') },'email');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const events = await EventModel.find({ email: new RegExp(query, 'i') });

        const userData = {
            ...user.toObject(),
            events
        };

        res.json({ userData });

    } catch (error) {
        logger.error(`Error in search: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};




module.exports={
    login,
    register,
    search
}