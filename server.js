const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { parse } = require('csv-parse/sync');
const cron = require('node-cron');

const app = express();
const port = 3001;
let cachedData = []; // Cache for the election data

// Enable CORS for all routes
app.use(cors());

// Function to fetch and parse CSV data
const fetchElectionData = async () => {
    try {
        const response = await axios.get('https://candidates.democracyclub.org.uk/data/export_csv/?election_date=&ballot_paper_id=&election_id=parl.2024-07-04&party_id=PP52&cancelled=&locked=&has_image=&has_votes_cast=&has_elected=&has_tied_vote_winner=&has_rank=&has_turnout_reported=&has_spoilt_ballots=&has_total_electorate=&has_turnout_percentage=&has_results_source=&field_group=results&extra_fields=image&format=csv');
        const records = parse(response.data, {
            columns: true,
            skip_empty_lines: true
        });
        cachedData = records.map(record => ({
            person_id: record.person_id,
            person_name: record.person_name,
            election_id: record.election_id,
            ballot_paper_id: record.ballot_paper_id,
            party_id: record.party_id,
            party_name: record.party_name,
            elected: record.elected,
            image: record.image,
        }));
    } catch (error) {
        console.error('Failed to fetch or parse election data:', error);
    }
};

// Schedule to fetch election data every hour
cron.schedule('* * * * *', () => {
    console.log('Fetching latest election data...');
    fetchElectionData();
});

// Endpoint to get election data
app.get('/election-data', (req, res) => {
    if (cachedData.length >= 5) {
      // const randomIndex = Math.floor(Math.random() * Math.min(10, records.length));
      const randomIndex = Math.floor(Math.random() * cachedData.length);
      cachedData[0].elected = 'f'; // Set elected to 'f' for the randomly chosen candidate
      cachedData[1].elected = 'f'; // Set elected to 'f' for the randomly chosen candidate
      cachedData[2].elected = 'f'; // Set elected to 'f' for the randomly chosen candidate
      console.log(randomIndex)
      cachedData[randomIndex].elected = 'f';
    };
    res.json(cachedData);
});

// Initial fetch and start server
fetchElectionData().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
