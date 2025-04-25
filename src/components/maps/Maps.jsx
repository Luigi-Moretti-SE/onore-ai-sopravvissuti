import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon from "/marker-icon-2x.png";

// Fix for Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to fit map to bounds
function FitToBounds({ mapData }) {
  const map = useMap();

  useEffect(() => {
    if (mapData && mapData.map_leaf) {
      const startPoint = [
        mapData.map_leaf.start_point.lat,
        mapData.map_leaf.start_point.lng,
      ];
      const endPoint = [
        mapData.map_leaf.end_point.lat,
        mapData.map_leaf.end_point.lng,
      ];
      const bounds = L.latLngBounds([startPoint, endPoint]);

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [
    mapData?.map_leaf?.end_point?.lat,
    mapData?.map_leaf?.end_point?.lng,
    mapData?.map_leaf?.start_point?.lat,
    mapData?.map_leaf?.start_point?.lng,
    map,
  ]);

  return null;
}

function Maps({ mapData }) {
  // Check if mapData is available
  if (!mapData || !mapData.map_leaf) {
    // Return a placeholder map when no data is available
    return (
      <MapContainer
        center={[41.9028, 12.4964]} // Default center (Rome, Italy)
        style={{ height: "100%", width: "100%" }}
        zoom={5}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    );
  }

  const { start_point, end_point, path_points, mode, waypoints } = mapData.map_leaf;

  // Verify if path_points has both lat and lng, otherwise use only start and end points
  const polylinePoints = [];

  // Add start point
  polylinePoints.push([start_point.lat, start_point.lng]);

  // Add intermediate points only if they have complete coordinates
  if (path_points && path_points.length > 0) {
    path_points.forEach((point) => {
      // Verify that the point has both lat and lng
      if (point.lat !== undefined && point.lng !== undefined) {
        polylinePoints.push([point.lat, point.lng]);
      }
    });
  }

  // Add end point
  polylinePoints.push([end_point.lat, end_point.lng]);

  // Calculate map center
  const center = [
    (start_point.lat + end_point.lat) / 2,
    (start_point.lng + end_point.lng) / 2,
  ];

  // Extract only intermediate cities from the cities array, excluding start and end
  const intermediateCities = mapData.cities && mapData.cities.length > 2 
    ? mapData.cities.slice(1, -1) 
    : [];

  return (
    <MapContainer
      center={center}
      style={{ height: "100%", width: "100%" }}
      zoom={10}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Start point marker */}
      <Marker 
        position={[start_point.lat, start_point.lng]}
        eventHandlers={{
          mouseover: (event) => {
            event.target.openPopup();
          },
          mouseout: (event) => {
            event.target.closePopup();
          }
        }}
      >
        <Popup>
          <strong>Starting Point</strong>
          <br />
          {mapData.cities ? mapData.cities[0] : "Starting point"}
          {mapData.friends && mapData.friends[0] && (
            <>
              <br />
              <em>{mapData.friends[0]} (Driver)</em>
            </>
          )}
        </Popup>
      </Marker>

      {/* Markers only for intermediate cities, not for all waypoints */}
      {intermediateCities.length > 0 && intermediateCities.map((city, index) => {
        // If we have coordinates saved for this city
        if (waypoints && waypoints[index]) {
          const waypointCoords = waypoints[index];
          return (
            <Marker
              key={`city-${index}`}
              position={[waypointCoords.lat, waypointCoords.lng]}
              eventHandlers={{
                mouseover: (event) => {
                  event.target.openPopup();
                },
                mouseout: (event) => {
                  event.target.closePopup();
                }
              }}
            >
              <Popup>
                <strong>Stop {index + 1}</strong>
                <br />
                {city}
                {mapData.friends && mapData.friends[index + 1] && index + 1 < mapData.friends.length - 1 && (
                  <>
                    <br />
                    <em>{mapData.friends[index + 1]}</em>
                  </>
                )}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      {/* End point marker */}
      <Marker 
        position={[end_point.lat, end_point.lng]}
        eventHandlers={{
          mouseover: (event) => {
            event.target.openPopup();
          },
          mouseout: (event) => {
            event.target.closePopup();
          }
        }}
      >
        <Popup>
          <strong>Destination</strong>
          <br />
          {mapData.cities
            ? mapData.cities[mapData.cities.length - 1]
            : "Destination point"}
          {mapData.friends && mapData.friends[mapData.friends.length - 1] && (
            <>
              <br />
              <em>{mapData.friends[mapData.friends.length - 1]}</em>
            </>
          )}
        </Popup>
      </Marker>

      <Polyline
        positions={polylinePoints}
        color={
          mode === "driving" ? "blue" : mode === "walking" ? "green" : "orange"
        }
        weight={5}
        opacity={0.7}
      />

      {/* Component to fit map to points */}
      <FitToBounds mapData={mapData} />
    </MapContainer>
  );
}

export default Maps;
