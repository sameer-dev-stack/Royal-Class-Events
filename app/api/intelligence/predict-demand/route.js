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
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
