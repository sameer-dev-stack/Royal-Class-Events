/**
 * AI Intelligence Panel Component
 * Shows demand prediction, revenue forecast, and price suggestions
 */

import { Sparkles, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIIntelligencePanel({
    prediction,
    loading,
    onCheckScore,
    onUsePrice
}) {
    if (!prediction && !loading) {
        return (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">AI Event Intelligence</h3>
                        <p className="text-sm text-white/60">Get instant predictions for your event</p>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={onCheckScore}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check Success Score
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                        <p className="text-white/80 font-medium">Analyzing event...</p>
                        <p className="text-sm text-white/50 mt-1">AI is calculating demand prediction</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!prediction.success) {
        return (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
                <p className="text-red-300 text-sm">
                    {prediction.error || "Failed to get prediction. Please try again."}
                </p>
                <Button
                    type="button"
                    onClick={onCheckScore}
                    variant="outline"
                    className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    const { demandScore, confidence, suggestedPrice, expectedRevenue } = prediction;
    const scoreColor = demandScore >= 70 ? "from-green-500 to-emerald-500" : demandScore >= 50 ? "from-yellow-500 to-orange-500" : "from-red-500 to-pink-500";
    const scoreLabel = demandScore >= 70 ? "High Demand" : demandScore >= 50 ? "Medium Demand" : "Low Demand";

    return (
        <div className="space-y-4">
            {/* Success Score */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-300" />
                        <h3 className="font-semibold text-white">AI Prediction</h3>
                    </div>
                    <span className="text-xs text-white/50">{(confidence * 100).toFixed(0)}% confidence</span>
                </div>

                <div className="relative">
                    <div className="flex items-end justify-between mb-2">
                        <div>
                            <div className={`text-5xl font-black bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>
                                {demandScore}
                            </div>
                            <div className="text-sm text-white/60 font-medium">out of 100</div>
                        </div>
                        <div className="text-right">
                            <div className={`font-black bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent uppercase tracking-wider`}>
                                {scoreLabel}
                            </div>
                            <div className="text-xs text-white/50 mt-1 font-medium">Success Probability</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-4">
                        <div
                            className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-700 ease-out`}
                            style={{ width: `${demandScore}%` }}
                        />
                    </div>

                    {prediction.reasoning && (
                        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-white/80 leading-relaxed font-light">
                                {prediction.reasoning}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Suggestion */}
            {suggestedPrice && (
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-yellow-300" />
                        <h3 className="font-semibold text-white">Suggested Pricing</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">৳{suggestedPrice.suggested}</span>
                            <span className="text-sm text-white/60">per ticket</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <span className="text-white/50">Range:</span>
                                <span className="text-white ml-1">৳{suggestedPrice.min} - ৳{suggestedPrice.max}</span>
                            </div>
                        </div>

                        {suggestedPrice.reasoning && (
                            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/10">
                                <p className="text-xs text-yellow-200/80 leading-relaxed italic">
                                    "{suggestedPrice.reasoning}"
                                </p>
                            </div>
                        )}

                        <Button
                            type="button"
                            onClick={() => onUsePrice(suggestedPrice.suggested)}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-none"
                        >
                            Use This Price
                        </Button>
                    </div>
                </div>
            )}

            {/* Revenue Forecast */}
            {expectedRevenue && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-300" />
                        <h3 className="font-semibold text-white">Revenue Forecast</h3>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-white/50 mb-1">Expected Revenue</div>
                            <div className="text-2xl font-bold text-green-400">
                                ৳{expectedRevenue.expected?.toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                            <div>
                                <div className="text-xs text-white/50">Minimum</div>
                                <div className="text-sm font-semibold text-white">৳{expectedRevenue.min?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/50">Maximum</div>
                                <div className="text-sm font-semibold text-white">৳{expectedRevenue.max?.toLocaleString()}</div>
                            </div>
                        </div>

                        {expectedRevenue.sales && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <Users className="w-4 h-4 text-green-300" />
                                <span className="text-sm text-white/70">
                                    Expected Sales: <span className="font-semibold text-white">{expectedRevenue.sales} tickets</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Re-check button */}
            <Button
                type="button"
                onClick={onCheckScore}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="sm"
            >
                Re-check Score
            </Button>
        </div>
    );
}
