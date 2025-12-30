"use client";

import { useState } from "react";

export default function TestAIPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testPrediction = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log("Calling AI service...");

            const response = await fetch('/api/intelligence/predict-demand', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category: "tech",
                    location: "Dhaka",
                    start_date: "2025-12-25T18:00:00Z",
                    capacity: 100,
                    ticket_type: "paid"
                }),
            });

            console.log("Response status:", response.status);

            const data = await response.json();
            console.log("Response data:", data);

            setResult(data);

        } catch (error) {
            console.error("Error:", error);
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border border-gray-700">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🧠 AI Intelligence Test
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Test the Python intelligence service integration
                    </p>

                    <button
                        onClick={testPrediction}
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
                    >
                        {loading ? "🔄 Testing..." : "🎯 Test AI Prediction"}
                    </button>

                    {result && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                {result.success ? "✅ Success!" : result.error ? "❌ Error" : "📊 Result"}
                            </h2>

                            {result.success && result.data && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <div className="text-green-400 text-sm mb-1">Demand Score</div>
                                        <div className="text-3xl font-bold text-white">
                                            {result.data.demand_score}/100
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-blue-400 text-sm mb-1">Confidence</div>
                                        <div className="text-3xl font-bold text-white">
                                            {(result.data.confidence * 100).toFixed(0)}%
                                        </div>
                                    </div>

                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                        <div className="text-purple-400 text-sm mb-1">Status</div>
                                        <div className="text-lg font-bold text-white">
                                            {result.data.demand_score >= 70 ? "🔥 High" : result.data.demand_score >= 50 ? "📊 Medium" : "📉 Low"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                                <div className="text-gray-400 text-sm mb-2">Full Response</div>
                                <pre className="text-sm text-green-400 overflow-auto max-h-96">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="text-yellow-400 text-sm font-semibold mb-2">ℹ️ How This Works</div>
                        <div className="text-gray-300 text-sm space-y-1">
                            <p>1. Browser calls Next.js API route (/api/intelligence/predict-demand)</p>
                            <p>2. Next.js forwards request to Python service (localhost:8000)</p>
                            <p>3. Python AI analyzes and returns prediction</p>
                            <p>4. Result displayed here!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
