
export const groupTicketsByEvent = (registrations) => {
    if (!registrations) return [];

    const grouped = {};

    registrations.forEach(reg => {
        const eventId = reg.event?._id;
        if (!eventId) return;

        if (!grouped[eventId]) {
            grouped[eventId] = {
                event: reg.event,
                tickets: []
            };
        }

        grouped[eventId].tickets.push(reg);
    });

    return Object.values(grouped);
};
