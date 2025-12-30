/**
 * Next.js API Route - Bridge to Python Service
 * This runs on your local machine and can access localhost:8000
 */

export async function POST(request) {
    try {
        const body = await request.json();

        // Call local Python service
        const response = await fetch('http://localhost:8000/predict-demand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000), // 5s timeout
        });

        if (!response.ok) {
            return Response.json(
                { error: `Python service error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        console.error('Error calling Python service:', error);

        // DEV_FALLBACK: If Python service is down, return mock data in development
        const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
        if (isDev) {
            console.log("Using DEV_FALLBACK for predict-demand");
            return Response.json({
                success: true,
                data: {
                    demand_score: Math.floor(Math.random() * 40) + 60, // 60-100
                    confidence: 0.85,
                    reasoning: "Mock prediction: High demand expected based on historical luxury event trends in this region."
                }
            });
        }

        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
