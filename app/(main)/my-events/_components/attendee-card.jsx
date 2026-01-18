import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { format } from "date-fns";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Attendee Card Component
export function AttendeeCard({ registration, token }) {
  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInAttendee
  );

  const handleManualCheckIn = async () => {
    try {
      const result = await checkInAttendee({ qrCode: registration.qrCode, token });
      if (result.success) {
        toast.success("Attendee checked in successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-1 gap-4 items-start w-full">
          <div
            className={`mt-1 p-2 rounded-full ${registration.checkedIn ? "bg-green-100" : "bg-gray-100"
              }`}
          >
            {registration.checkedIn ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{registration.attendeeName}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {registration.attendeeEmail}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>
                {registration.checkedIn ? "⏰ Checked in" : "📅 Registered"}{" "}
                {(() => {
                  try {
                    const dateToFormat = registration.checkedIn && registration.checkedInAt
                      ? registration.checkedInAt
                      : (registration.registeredAt || registration._creationTime);

                    if (!dateToFormat) return "N/A";
                    return format(new Date(dateToFormat), "PPp");
                  } catch (e) {
                    return "Invalid Date";
                  }
                })()}
              </span>
              <span className="font-mono hidden sm:inline">QR: {registration.qrCode}</span>
            </div>
          </div>
        </div>

        {!registration.checkedIn && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualCheckIn}
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Check In
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
