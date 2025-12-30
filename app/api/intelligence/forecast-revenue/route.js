/**
 * Next.js API Route - Forecast Revenue
 */

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await fetch('http://localhost:8000/forecast-revenue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
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

        // DEV_FALLBACK
        const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_AUTH === "true";
        if (isDev) {
            console.log("Using DEV_FALLBACK for forecast-revenue");
            return Response.json({
                success: true,
                data: {
                    expected_revenue: 75000,
                    min_revenue: 50000,
                    max_revenue: 120000,
                    expected_sales: 50
                }
            });
        }

        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
