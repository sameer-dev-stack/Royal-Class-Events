import { internalMutation } from "./_generated/server";

export const createBattleOfDecks = internalMutation({
  handler: async (ctx) => {
    let organizer = await ctx.db.query("users").first();

    if (!organizer) {
       throw new Error("No users found. Please sign in to the app first to create a user record.");
    }

    const event = {
      title: "Battle of the Decks 2026: The Ultimate DJ Showdown",
      description: "Experience the most intense musical face-off in Dhaka! Join us at Chinnoitri for an electrifying night where the city's finest DJs compete for the crown. Expect a masterclass in turntablism, seamless transitions, and high-energy performances that will keep the floor moving until midnight.",
      slug: `battle-of-the-decks-2026-${Date.now()}`,
      organizerId: organizer._id,
      organizerName: organizer.name,
      category: "music",
      tags: ["music", "dj-battle", "dhaka-events", "entertainment"],
      startDate: 1776708000000, // April 20, 2026, 6:00 PM GMT+6
      endDate: 1776726000000,   // April 20, 2026, 11:00 PM GMT+6
      timezone: "Asia/Dhaka",
      locationType: "physical",
      venue: "Chinnoitri",
      city: "Dhaka",
      country: "Bangladesh",
      capacity: 300,
      ticketType: "paid",
      registrationCount: 0,
      themeColor: "#D4AF37",
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const eventId = await ctx.db.insert("events", event);

    console.log(`✅ Successfully created "Battle of the Decks" event with ID: ${eventId}`);
    return eventId;
  },
});
