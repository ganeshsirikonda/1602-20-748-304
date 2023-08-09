const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Replace these values with the ones you received after registering your company
const CLIENT_ID = "b46128a0-fbde-4c16-a4b1-6ae6ad718e27";
const CLIENT_SECRET = "XOyo10RPayKBODAN";
const BASE_URL = "http://20.244.56.144/train";

app.get('/get_train_schedules', async (req, res) => {
  try {
    const accessToken = await getAuthorizationToken();
    const trainDetails = await getTrainDetails(accessToken);
    const processedTrains = processTrainDetails(trainDetails);
    res.json(processedTrains);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function getAuthorizationToken() {
  const authPayload = {
    companyName: 'Train Central',
    clientID: CLIENT_ID,
    ownerName: 'Ram',
    ownerEmail: 'ram@abc.edu',
    rollNo: '1',
    clientSecret: CLIENT_SECRET,
  };

  const response = await axios.post(`${BASE_URL}/auth`, authPayload);
  return response.data.access_token;
}

async function getTrainDetails(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios.get(`${BASE_URL}/trains`, { headers });
  return response.data;
}

function processTrainDetails(trainDetails) {
  const currentTime = 9 * 60; // Current time in minutes (assuming 09:00 AM as start time)
  const filteredTrains = trainDetails.filter((train) => {
    const departureTime = train.departureTime.Hours * 60 + train.departureTime.Minutes;
    return currentTime <= departureTime && departureTime <= currentTime + 720;
  });

  filteredTrains.sort((a, b) => {
    if (a.price.sleeper !== b.price.sleeper) {
      return a.price.sleeper - b.price.sleeper;
    }
    if (a.seatsAvailable.sleeper !== b.seatsAvailable.sleeper) {
      return b.seatsAvailable.sleeper - a.seatsAvailable.sleeper;
    }
    if (a.delayedBy !== b.delayedBy) {
      return b.delayedBy - a.delayedBy;
    }
    return 0;
  });

  return filteredTrains;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
