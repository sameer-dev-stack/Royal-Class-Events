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

/**
 * Generates seat positions around a rectangular table perimeter
 * @param {number} width Table width
 * @param {number} height Table height
 * @param {number} capacity Number of seats
 * @param {number} padding Gap between table edge and seat edge
 * @param {number} seatRadius Radius of the seat circle
 */
export const getRectTableSeats = (width, height, capacity, padding = 5, seatRadius = 6) => {
    const seats = [];
    if (capacity <= 0) return seats;

    const offset = seatRadius + padding;
    const perimeter = 2 * (width + height);
    const step = perimeter / capacity;

    for (let i = 0; i < capacity; i++) {
        const d = i * step + (step / 2); // Center of the segment
        let x, y;

        if (d < width) {
            // Top side
            x = d;
            y = -offset;
        } else if (d < width + height) {
            // Right side
            x = width + offset;
            y = d - width;
        } else if (d < 2 * width + height) {
            // Bottom side
            x = width - (d - (width + height));
            y = height + offset;
        } else {
            // Left side
            x = -offset;
            y = height - (d - (2 * width + height));
        }

        seats.push({ x, y, id: `rect-seat-${i}` });
    }

    return seats;
};
