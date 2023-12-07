import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactDOMServer from "react-dom/server";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Leaflet, { LatLngExpression, Map } from "leaflet";
import { ComplaintSummaryPopup } from "./complaint-summary-popup";
import { useAppDispatch } from "../../hooks/hooks";
import {
  getAllegationComplaintByComplaintIdentifier,
  getWildlifeComplaintByComplaintIdentifier,
  setComplaint,
} from "../../store/reducers/complaints";
import COMPLAINT_TYPES from "../../types/app/complaint-types";
import { isEqual } from "lodash";
import {
  BsInfoCircleFill
} from "react-icons/bs";
import { ComplaintMapItem } from "../../types/app/complaints/complaint-map-item";

interface MapProps {
  complaint_type: string;
  markers: Array<ComplaintMapItem>;
  unmapped_complaints: number;
}

const LeafletMapWithMultiplePoints: React.FC<MapProps> = ({
  complaint_type,
  markers,
  unmapped_complaints,
}) => {
  const iconHTML = ReactDOMServer.renderToString(
    <FontAwesomeIcon icon={faMapMarkerAlt} />,
  );
  const mapRef = useRef<Map | null>(null);
  const [markersState, setMarkersState] =
    useState<Array<ComplaintMapItem>>(markers);

  useEffect(() => {
    if (mapRef.current && markersState.length > 0) {
      // Calculate the bounds of all markers
      const bounds = Leaflet.latLngBounds(
        markersState.map(
          (marker) => [marker.latitude, marker.longitude] as LatLngExpression,
        ),
      );

      // Fit the map to the bounds
      mapRef.current.fitBounds(bounds, { padding: [35, 35] });
    }
  }, [markersState]);

  // redux will update the location store when the complaint details are retrieved.  We don't want this to trigger
  // a re-render of the map to fit the markers on screen.  So, let's compare the new markers against the marker state.
  // If they're the same, don't re-center the map and don't zoom out.
  useEffect(() => {
    if (!isEqual(markersState, markers)) {
      setMarkersState(markers);
    }
  }, [markers, markersState]);

  const customMarkerIcon = new Leaflet.DivIcon({
    html: iconHTML,
    className: "map-marker",
    iconSize: [40, 0], // Adjust icon size as needed
    iconAnchor: [20, 40], // Adjust icon anchor point
  });

  const dispatch = useAppDispatch();

  const handlePopupOpen =
    (id: string) => (e: L.PopupEvent) => {
      if (COMPLAINT_TYPES.HWCR === complaint_type) {
        dispatch(
          getWildlifeComplaintByComplaintIdentifier(id),
        );
      } else {
        dispatch(
          getAllegationComplaintByComplaintIdentifier(id),
        );
      }
    };

  // unmount complaint when popup closes
  const handlePopupClose = (e: L.LeafletEvent) => {
    dispatch(setComplaint(null));
  };

  const computedClass = (unmapped_complaints === 0) ? "comp-map-unmapped-alert display-none" : "comp-map-unmapped-alert";
  const pluralization = (unmapped_complaints === 1) ? "" : "s";

  return (<>
    <div id="complaint-unmapped-notification" className={computedClass}>
        <BsInfoCircleFill
          className="filter-image-spacing"
        />
        {/*
         */}
        The exact location of {unmapped_complaints} complaint{pluralization} could not be determined.
      </div>
    <MapContainer
      id="multi-point-map"
      style={{ height: "652px", width: "1330px", zIndex: 0 }}
      className="map-container"
      center={[53.7267, -127.6476]}
      zoom={6}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={customMarkerIcon}
            eventHandlers={{
              popupopen: handlePopupOpen(marker.id),
              popupclose: handlePopupClose,
            }}
          >
            <ComplaintSummaryPopup
              complaintType={complaint_type}
              complaint_identifier={marker.id}
            />
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
    </>);
};

export default LeafletMapWithMultiplePoints;
