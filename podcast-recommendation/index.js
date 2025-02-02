// Import required modules
const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

// Create an instance of an Express application
const app = express();
const port = 3001; // Changed the port number to 3001

// Enable CORS for all routes
app.use(cors());

// Connect to Neo4j database
// Ensure the connection details match your Neo4j instance
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'senha123'));
const session = driver.session();

// Root URL handler
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Endpoint to fetch all episodes
app.get('/episodes', async (req, res) => {
  try {
    const result = await session.run('MATCH (e:Episode) RETURN e.url AS url');
    const episodes = result.records.map(record => record.get('url'));
    res.send(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch recommendations based on a selected episode
app.get('/recommendations', async (req, res) => {
  const { url } = req.query; // Get the episode URL from the query parameters
  try {
    const result = await session.run(
      `MATCH (e:Episode {url: $url})-[:REFERENCES]->(r:Reference)<-[:REFERENCES]-(rec:Episode)
       WHERE rec.url <> $url
       RETURN DISTINCT rec.url AS url
       LIMIT 10`,
      { url }
    );
    const recommendations = result.records.map(record => record.get('url'));
    res.send(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
