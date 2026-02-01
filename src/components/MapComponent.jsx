import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet icon not showing in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulse icons for emergencies
const createPulseIcon = (color) => divIcon({
    className: 'custom-pin',
    html: `<div style="
    background-color: ${color};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px ${color};
    position: relative;
  ">
    <div style="
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: ${color};
      opacity: 0.5;
      animation: pin-pulse 1.5s infinite;
    "></div>
  </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const MapComponent = ({ emergencies }) => {
    return (
        <div className="map-container glass-panel" style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <style>{`
         @keyframes pin-pulse {
           0% { transform: scale(1); opacity: 0.8; }
           100% { transform: scale(3); opacity: 0; }
         }
       `}</style>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {emergencies.map(em => (
                    <Marker
                        key={em.id}
                        position={em.coords}
                        icon={createPulseIcon(em.priority === 'Red' ? '#ef4444' : em.priority === 'Yellow' ? '#f59e0b' : '#10b981')}
                    >
                        <Popup>
                            <strong>{em.type}</strong><br />
                            Status: {em.status}<br />
                            Priority: {em.priority}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
