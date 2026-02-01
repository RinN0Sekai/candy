import { createContext, useContext, useState, useEffect } from 'react';

const EmergencyContext = createContext();

export const useEmergency = () => useContext(EmergencyContext);

export const EmergencyProvider = ({ children }) => {
    const [emergencies, setEmergencies] = useState([
        { id: 1, type: "Street Dog Injury", priority: "Red", status: "New", coords: [51.505, -0.09], time: "2m ago" },
        { id: 2, type: "Cat Stuck", priority: "Yellow", status: "Assigned", coords: [51.51, -0.1], time: "15m ago" }
    ]);

    const addEmergency = (emergency) => {
        const newEmergency = {
            id: Date.now(),
            status: 'New',
            time: 'Just now',
            ...emergency
        };
        setEmergencies(prev => [newEmergency, ...prev]);
    };

    return (
        <EmergencyContext.Provider value={{ emergencies, addEmergency }}>
            {children}
        </EmergencyContext.Provider>
    );
};
