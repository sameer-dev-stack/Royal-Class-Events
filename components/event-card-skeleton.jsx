import { Card, CardContent } from "@/components/ui/card";

export default function EventCardSkeleton() {
    return (
        <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="h-48 bg-white/5 animate-pulse" />
            <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                    <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
                </div>
            </CardContent>
        </Card>
    );
}
