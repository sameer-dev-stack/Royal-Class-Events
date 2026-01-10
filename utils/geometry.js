/**
 * Royal Seat Engine - Geometry Utilities
 * Phase 11: Curved Layouts
 */

/**
 * Calculates X/Y position for a point on an arc
 * @param {number} centerX 
 * @param {number} centerY 
 * @param {number} radius 
 * @param {number} angleInDegrees 
 */
export const calculateArcPosition = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180); // Adjusted to start from top
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

/**
 * Generates seat positions for a curved row
 * @param {Object} config 
 */
export const generateArcSeats = ({
    centerX,
    centerY,
    radius,
    startAngle, // e.g., -45
    endAngle,   // e.g., 45
    seatCount,
    spacing = 1
}) => {
    const seats = [];
    if (seatCount <= 0) return seats;

    // Angle step
    const totalAngle = endAngle - startAngle;
    const step = seatCount > 1 ? totalAngle / (seatCount - 1) : 0;

    for (let i = 0; i < seatCount; i++) {
        const angle = startAngle + (step * i);
        const pos = calculateArcPosition(centerX, centerY, radius, angle);
        seats.push({
            ...pos,
            angle,
            id: `seat-${i}`
        });
    }

    return seats;
};
