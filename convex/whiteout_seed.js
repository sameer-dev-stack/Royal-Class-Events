import { internalMutation } from "./_generated/server";

export const createWhiteoutEvent = internalMutation({
  handler: async (ctx) => {
    let organizer = await ctx.db.query("users").first();

    if (!organizer) {
       throw new Error("No users found. Please sign in to the app first.");
    }

    const startDate = new Date("2026-06-27T15:00:00+06:00").getTime();
    const endDate = new Date("2026-06-27T22:30:00+06:00").getTime();

    const description = `🌊 Whiteout — A Dreamlike River Experience
Whiteout is more than just a party — it's a once-in-a-lifetime river cruise. Set sail from the heart of Dhaka as the Buriganga glows under the evening sky. One ferry. One thousand people dressed in white. Music, lights, and energy — all flowing with the current.

Expect immersive soundscapes by top DJs, exclusive access to cabins and lounges, open-deck dancing, premium snacks, and fireworks lighting up the night.

📅 তারিখ ও সময়
🗓️ শনিবার, ২৭ জুন ২০২৬
🚪 গেট ওপেন: দুপুর ৩টা
🛳️ ছাড়ার সময়: বিকেল ৪টা (ঠিক সময়ে)
🎆 ফেরত: রাত ১০টা থেকে ১০:৩০ এর মধ্যে

📍 স্থান
বোর্ডিং পয়েন্ট: সদরঘাট ফেরি টার্মিনাল, ঢাকা

Event Policies:
- Entry: 18+ only with valid NID/Passport
- Dress Code: Strictly All White
- Boarding: Final call at 3:00 PM`;

    const eventId = await ctx.db.insert("events", {
      title: "Whiteout: A Dreamlike River Experience",
      description: description,
      slug: `whiteout-2026-${Date.now()}`,
      organizerId: organizer._id,
      organizerName: organizer.name,
      category: "music",
      tags: ["river-cruise", "party", "white-out", "dhaka", "nightlife"],
      startDate: startDate,
      endDate: endDate,
      timezone: "Asia/Dhaka",
      locationType: "physical",
      venue: "Sadarghat Ferry Terminal",
      city: "Dhaka",
      country: "Bangladesh",
      capacity: 1000,
      ticketType: "paid",
      registrationCount: 0,
      themeColor: "#FFFFFF",
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create Ticket Tiers
    const tiers = [
      { name: "General Admission", price: 1599, capacity: 500, description: "1x Entry Pass, Complimentary Snacks, and a Refreshing Soft Drink" },
      { name: "Platinum Seating", price: 1999, capacity: 200, description: "1x Entry Pass for Seated Area, Complimentary Snacks, and a Refreshing Soft Drink" },
      { name: "Cabin Single", price: 4999, capacity: 20, description: "2x Entry Pass + 1x Cabin, Complimentary Snacks, and a Refreshing Soft Drink" },
      { name: "Cabin Double", price: 6999, capacity: 15, description: "3x Entry Pass + 1x cabin, Complimentary Snacks, and a Refreshing Soft Drink" },
      { name: "Cabin Duplex", price: 13999, capacity: 5, description: "6x Entry Pass + 1x deluxe cabin, Complimentary Snacks, and a Refreshing Soft Drink" },
    ];

    for (const tier of tiers) {
      await ctx.db.insert("ticketTiers", {
        eventId: eventId,
        name: tier.name,
        price: tier.price,
        capacity: tier.capacity,
        description: tier.description,
        soldCount: 0,
        status: "active",
      });
    }

    console.log(`✅ Successfully created "Whiteout" event and 5 ticket tiers.`);
    return eventId;
  },
});
