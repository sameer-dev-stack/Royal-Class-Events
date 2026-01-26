import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, payload } = await req.json()

        let subject = ''
        let html = ''
        let to = ''

        if (type === 'TICKET_CONFIRMATION') {
            to = payload.attendee_email
            subject = `Your Ticket for ${payload.event_title}`
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="color: #D4AF37;">Royal Class Events</h1>
          <h2>Your Booking is Confirmed!</h2>
          <p>Hi ${payload.attendee_name},</p>
          <p>Thank you for your purchase. Here is your ticket information for <strong>${payload.event_title}</strong>.</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
            <p><strong>Ticket ID:</strong> ${payload.ticket_id}</p>
            <p><strong>Quantity:</strong> ${payload.quantity}</p>
            <p><strong>Total Paid:</strong> ${payload.amount} ${payload.currency}</p>
          </div>
          <p>You can find your QR code in the app under "My Tickets".</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated message from Royal Class Events.</p>
        </div>
      `
        } else if (type === 'VENDOR_REQUEST') {
            to = payload.vendor_email
            subject = `New Service Request: ${payload.service_type}`
            html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="color: #D4AF37;">Royal Class Events</h1>
          <h2>New Event Inquiry</h2>
          <p>Hi Vendor,</p>
          <p>You have received a new service request for <strong>${payload.event_title}</strong>.</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
            <p><strong>Service:</strong> ${payload.service_type}</p>
            <p><strong>Inquiry from:</strong> ${payload.organizer_name}</p>
          </div>
          <p><a href="${Deno.env.get('SITE_URL')}/supplier/dashboard" style="background: #D4AF37; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a></p>
        </div>
      `
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Royal Class Events <notifications@royal.events>',
                to: [to],
                subject: subject,
                html: html,
            }),
        })

        const data = await res.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: res.status,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
