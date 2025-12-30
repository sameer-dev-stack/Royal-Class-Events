/**
 * Next.js API Route - Suggest Price
 */

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await fetch('http://localhost:8000/suggest-price', {
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
            console.log("Using DEV_FALLBACK for suggest-price");
            return Response.json({
                success: true,
                data: {
                    suggested_price: 1500,
                    min_price: 1000,
                    max_price: 5000,
                    reasoning: "Mock suggestion: Consistent with premium conference pricing in the local market."
                }
            });
        }

        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
