
const { ConvexClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function checkEvents() {
    try {
        const events = await client.query(api.events.getAllEvents);
        console.log(`Total events found: ${events.length}`);

        if (events.length > 0) {
            const now = Date.now();
            console.log(`Current time: ${now} (${new Date(now).toISOString()})`);

            const upcoming = events.filter(e => {
                const start = e.timeConfiguration?.startDateTime || e.startDate || 0;
                return start >= now;
            });

            console.log(`Upcoming events: ${upcoming.length}`);

            events.forEach(e => {
                const start = e.timeConfiguration?.startDateTime || e.startDate;
                console.log(`Event: ${e.title} (ID: ${e._id}) - Start: ${start} (${new Date(start).toISOString()}) - Upcoming? ${start >= now}`);
            });
        }
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

checkEvents();
