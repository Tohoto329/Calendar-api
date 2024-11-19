Follow these steps to get the project up and running:

1. Clone the repository**  
   Run the following command to clone the project to your local machine:
   bash
   git clone https://github.com/Tohoto329/Calendar-api.git

2.Navigate to the project directory and install the required dependencies:

  npm install

3.Run the project

  npx nodemon index.js

4.create .env file:

  NODE_ENV = development
  ALLOW_ORIGIN=http://localhost:3000
  MONGO_CONNECTION_STRING = YOUR MONGO STRING
  SECRET_KEY=YOUR SECRET KEY
  GOOGLE_CLIENT_ID=YOUR GOOGLE CLIENT ID
  GOOGLE_SECRET_KEY=YOUR GOOGLE SECRTET KEY
  GOOGLE_REDIRECT_URI=YOUR GOOGLE REDIRECT URI
  GOOGLE_REDIRECTION=YOUR FRONTEND REDIRECT URL AFTER GOOGLE REDIRECT URI IS HIT(FOR REFRENCE CHECK GOOGLE(CONTROLLER/oauth2callback(function))