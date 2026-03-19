import { Users } from "lucide-react";

interface WeekendEnrollmentCounterProps {
  enrolled: number;
  minimum: number;
  cohortLabel: string;
  compact?: boolean;
}

const WeekendEnrollmentCounter = ({
  enrolled,
  minimum,
  cohortLabel,
  compact = false,
}: WeekendEnrollmentCounterProps) => {
  const percentage = Math.min((enrolled / minimum) * 100, 100);
  const isMet = enrolled >= minimum;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-cyan" />
        <span className="text-charcoal font-medium">
          {enrolled}/{minimum} enrolled
        </span>
        {!isMet && (
          <span className="text-muted-foreground">
            ({minimum - enrolled} more needed)
          </span>
        )}
        {isMet && (
          <span className="text-green-600 font-semibold">✓ Confirmed</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-cyan/5 border border-cyan/20 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan" />
          <span className="text-sm font-semibold text-charcoal">
            Enrollment Progress
          </span>
        </div>
        <span className="text-sm font-bold text-charcoal">
          {enrolled}/{minimum}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all ${
            isMet ? "bg-green-500" : "bg-cyan"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {isMet ? (
          <span className="text-green-600 font-semibold">
            ✅ Minimum met — this cohort is confirmed!
          </span>
        ) : (
          <>
            ⚠️ Minimum {minimum} students required to proceed.{" "}
            <span className="font-medium text-charcoal">
              {minimum - enrolled} more needed.
            </span>{" "}
            If not met, students will be moved to the next cohort.
          </>
        )}
      </p>
    </div>
  );
};

export default WeekendEnrollmentCounter;
