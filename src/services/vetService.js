// Mock Vet Data Service
export const getNearbyVets = (lat, lng) => {
    // In a real app, this would use Google Places API
    // For MVP, we return realistic mock data
    return [
        { id: 1, name: "City Paws Emergency", dist: "0.8 km", status: "Open 24/7", phone: "555-0123" },
        { id: 2, name: "Dr. Sharma's Pet Clinic", dist: "1.2 km", status: "Closes 9 PM", phone: "555-0199" },
        { id: 3, name: "Animal Rescue Center", dist: "2.5 km", status: "Open", phone: "555-0888" },
    ];
};
