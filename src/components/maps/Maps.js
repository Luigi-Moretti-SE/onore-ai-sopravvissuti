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
//import mapData from '../assets/samples/map.json';
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIcon from "../../assets/map-marker.svg";

// Fix per le icone di Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Componente per far adattare la mappa ai punti
function FitToBounds(data) {
  const mapData = data.mapData;
  const map = useMap();

  useEffect(() => {
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
  }, [
    mapData.map_leaf.end_point.lat,
    mapData.map_leaf.end_point.lng,
    mapData.map_leaf.start_point.lat,
    mapData.map_leaf.start_point.lng,
    map,
  ]);

  return null;
}

function Maps(data) {
  const mapData = data.mapData;
  const { start_point, end_point, path_points, mode, waypoints } = mapData.map_leaf;

  // Verifica se path_points ha sia lat che lng, altrimenti utilizza solo i punti di inizio e fine
  const polylinePoints = [];

  // Aggiungi il punto di partenza
  polylinePoints.push([start_point.lat, start_point.lng]);

  // Aggiungi i punti intermedi solo se hanno coordinate complete
  if (path_points && path_points.length > 0) {
    path_points.forEach((point) => {
      // Verifica che il punto abbia sia lat che lng
      if (point.lat !== undefined && point.lng !== undefined) {
        polylinePoints.push([point.lat, point.lng]);
      }
    });
  }

  // Aggiungi il punto di arrivo
  polylinePoints.push([end_point.lat, end_point.lng]);

  // Calcola il centro della mappa
  const center = [
    (start_point.lat + end_point.lat) / 2,
    (start_point.lng + end_point.lng) / 2,
  ];

  // Estrai solo le città intermedie dall'array cities, escludendo partenza e arrivo
  const intermediateCities = mapData.cities && mapData.cities.length > 2 
    ? mapData.cities.slice(1, -1) 
    : [];

  return (
    <MapContainer
      center={center}
      style={{ height: "100%", width: "100%" }}
      zoom={10}
      zoomControl={false} // Spostiamo i controlli di zoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://facilmap.org">Facilmap</a>'
      />

      {/* Marker per il punto di partenza */}
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
          <strong>Partenza</strong>
          <br />
          {mapData.cities ? mapData.cities[0] : "Punto di partenza"}
        </Popup>
      </Marker>

      {/* Markers solo per le città intermedie, non per tutti i waypoints */}
      {intermediateCities.length > 0 && intermediateCities.map((city, index) => {
        // Se abbiamo le coordinate salvate per questa città
        //console.log(waypoints, index);
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
                <strong>Tappa {index + 1}</strong>
                <br />
                {city}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      {/* Marker per il punto di arrivo */}
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
          <strong>Arrivo</strong>
          <br />
          {mapData.cities
            ? mapData.cities[mapData.cities.length - 1]
            : "Punto di arrivo"}
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

      {/* Aggiunto componente per adattare la mappa ai punti */}
      <FitToBounds mapData={mapData} />
    </MapContainer>
  );
}

export default Maps;
