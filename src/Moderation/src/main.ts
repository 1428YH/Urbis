import express from 'express'
import type { Application } from 'express'
import { loadConfig } from './config/load.js'
import agentRoute from './routes/moderation.route.js'

const config = await loadConfig();
const app: Application = express();
const PORT = config.agentPort;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use("/api/agent", agentRoute)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});