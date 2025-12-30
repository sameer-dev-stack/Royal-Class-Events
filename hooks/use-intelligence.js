/**
 * Client-side hook to call Python intelligence service
 * This runs in the browser and calls Next.js API route
 */

import { useState } from "react";

export function useIntelligence() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const predictDemand = async (eventData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/intelligence/predict-demand', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: eventData.category,
                    location: eventData.location,
                    start_date: new Date(eventData.startDate).toISOString(),
                    capacity: eventData.capacity,
                    ticket_type: eventData.ticketType || 'paid',
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error('Prediction failed');
            }

            return {
                success: true,
                demandScore: result.data.demand_score,
                confidence: result.data.confidence,
                factors: result.data.factors,
            };

        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message,
                demandScore: 50,
                confidence: 0.1,
                factors: null,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        predictDemand,
        loading,
        error,
    };
}
