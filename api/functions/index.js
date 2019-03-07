const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Set up express app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// For parsing application/json
app.use(bodyParser.json());

// Init api routes
app.use(require('./routes/api'));

// Listen
// app.listen(process.env.port || 4000, function() {
//  console.log('Listening')
// });


exports.snoAPI = functions.https.onRequest(app);

