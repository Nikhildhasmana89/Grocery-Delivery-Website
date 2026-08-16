"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import {
  Navigation,
  MapPin,
  Bike,
  Route,
  Clock,
  LocateFixed,
  Loader2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export interface ILocation {
  latitude: number;
  longitude: number;
}

interface IProps {
  userLocation: ILocation;
  deliveryBoyLocation: ILocation;
}

/* =========================================================
   LEAFLET ICONS
========================================================= */

const deliveryBoyIcon = L.divIcon({
  className: "delivery-boy-marker",
  html: `
    <div
      style="
        width:44px;
        height:44px;
        border-radius:50%;
        background:#16a34a;
        border:4px solid white;
        box-shadow:0 6px 20px rgba(0,0,0,.25);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:20px;
      "
    >
      🛵
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const customerIcon = L.divIcon({
  className: "customer-marker",
  html: `
    <div
      style="
        width:42px;
        height:42px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:#ef4444;
        border:4px solid white;
        box-shadow:0 6px 20px rgba(0,0,0,.25);
        display:flex;
        align-items:center;
        justify-content:center;
      "
    >
      <div
        style="
          transform:rotate(45deg);
          font-size:18px;
        "
      >
        📍
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({
  deliveryBoyLocation,
  userLocation,
}: IProps) {
  const map = useMap();

  /*
   * Automatically fit both locations
   * whenever either location changes.
   */

  useEffect(() => {
    if (
      !deliveryBoyLocation ||
      !userLocation
    ) {
      return;
    }

    const bounds = L.latLngBounds([
      [
        deliveryBoyLocation.latitude,
        deliveryBoyLocation.longitude,
      ],
      [
        userLocation.latitude,
        userLocation.longitude,
      ],
    ]);

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 16,
      animate: true,
    });
  }, [
    map,
    deliveryBoyLocation,
    userLocation,
  ]);

  return null;
}

/* =========================================================
   LIVE MAP
========================================================= */

export default function LiveMap({
  userLocation,
  deliveryBoyLocation,
}: IProps) {
  const [route, setRoute] = useState<
    [number, number][]
  >([]);

  const [distance, setDistance] =
    useState<number | null>(null);

  const [duration, setDuration] =
    useState<number | null>(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [routeError, setRouteError] =
    useState(false);

  /* =======================================================
     COORDINATES
  ======================================================= */

  const deliveryPosition = useMemo<
    [number, number]
  >(
    () => [
      deliveryBoyLocation.latitude,
      deliveryBoyLocation.longitude,
    ],
    [deliveryBoyLocation],
  );

  const customerPosition = useMemo<
    [number, number]
  >(
    () => [
      userLocation.latitude,
      userLocation.longitude,
    ],
    [userLocation],
  );

  /* =======================================================
     GET ROAD ROUTE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const getRoute = async () => {
      try {
        setLoadingRoute(true);
        setRouteError(false);

        /*
         * OSRM expects:
         *
         * longitude,latitude
         */

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${deliveryBoyLocation.longitude},${deliveryBoyLocation.latitude};` +
          `${userLocation.longitude},${userLocation.latitude}` +
          `?overview=full&geometries=geojson`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Route request failed",
          );
        }

        const data =
          await response.json();

        if (
          !data.routes ||
          data.routes.length === 0
        ) {
          throw new Error(
            "No route found",
          );
        }

        const selectedRoute =
          data.routes[0];

        if (cancelled) {
          return;
        }

        /*
         * Convert GeoJSON:
         *
         * [longitude, latitude]
         *
         * into Leaflet:
         *
         * [latitude, longitude]
         */

        const coordinates =
          selectedRoute.geometry.coordinates.map(
            (coordinate: [
              number,
              number,
            ]) => [
              coordinate[1],
              coordinate[0],
            ],
          );

        setRoute(coordinates);

        /*
         * OSRM distance = meters
         */

        setDistance(
          selectedRoute.distance / 1000,
        );

        /*
         * OSRM duration = seconds
         */

        setDuration(
          selectedRoute.duration / 60,
        );
      } catch (error) {
        console.error(
          "Route error:",
          error,
        );

        if (!cancelled) {
          setRouteError(true);
          setRoute([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRoute(false);
        }
      }
    };

    getRoute();

    return () => {
      cancelled = true;
    };
  }, [
    deliveryBoyLocation.latitude,
    deliveryBoyLocation.longitude,
    userLocation.latitude,
    userLocation.longitude,
  ]);

  /* =======================================================
     CENTER
  ======================================================= */

  const center: [
    number,
    number,
  ] = [
    (
      deliveryBoyLocation.latitude +
      userLocation.latitude
    ) / 2,

    (
      deliveryBoyLocation.longitude +
      userLocation.longitude
    ) / 2,
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <Navigation
              size={19}
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Live Delivery Tracking
            </h3>

            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

                <span className="relative h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>

              Delivery partner is live
            </div>
          </div>
        </div>

        {loadingRoute && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <Loader2
              size={14}
              className="animate-spin"
            />

            Updating route
          </div>
        )}
      </div>

      {/* =================================================
          MAP
      ================================================= */}

      <div className="relative h-[420px] w-full">

        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* =============================================
              DELIVERY BOY
          ============================================= */}

          <Marker
            position={
              deliveryPosition
            }
            icon={deliveryBoyIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">
                  Delivery Partner
                </p>

                <p className="text-xs text-slate-500">
                  Your current location
                </p>
              </div>
            </Popup>
          </Marker>

          {/* =============================================
              CUSTOMER
          ============================================= */}

          <Marker
            position={
              customerPosition
            }
            icon={customerIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">
                  Delivery Address
                </p>

                <p className="text-xs text-slate-500">
                  Customer location
                </p>
              </div>
            </Popup>
          </Marker>

          {/* =============================================
              ROUTE
          ============================================= */}

          {route.length > 0 && (
            <>
              {/* Route shadow */}

              <Polyline
                positions={route}
                pathOptions={{
                  color: "#ffffff",
                  weight: 9,
                  opacity: 0.9,
                }}
              />

              {/* Main route */}

              <Polyline
                positions={route}
                pathOptions={{
                  color: "#16a34a",
                  weight: 5,
                  opacity: 0.95,
                }}
              />
            </>
          )}

          <MapController
            deliveryBoyLocation={
              deliveryBoyLocation
            }
            userLocation={
              userLocation
            }
          />

        </MapContainer>

        {/* =================================================
            MAP FLOATING INFO
        ================================================= */}

        <div className="absolute bottom-4 left-4 right-4 z-[1000]">

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            {/* DISTANCE */}

            <div className="rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-950/90">

              <div className="flex items-center gap-2 text-slate-400">
                <Route size={15} />

                <span className="text-[11px] font-medium">
                  Distance
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {distance !== null
                  ? `${distance.toFixed(1)} km`
                  : "--"}
              </p>
            </div>

            {/* ETA */}

            <div className="rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-950/90">

              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={15} />

                <span className="text-[11px] font-medium">
                  ETA
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {duration !== null
                  ? `${Math.ceil(
                      duration,
                    )} min`
                  : "--"}
              </p>
            </div>

            {/* STATUS */}

            <div className="hidden rounded-2xl border border-white/50 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-950/90 sm:block">

              <div className="flex items-center gap-2 text-slate-400">
                <Bike size={15} />

                <span className="text-[11px] font-medium">
                  Status
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-green-600">
                On the way
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50">

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

          <LocateFixed
            size={15}
            className="text-green-500"
          />

          Live location enabled

        </div>

        {routeError && (
          <span className="text-xs font-medium text-amber-600">
            Route temporarily unavailable
          </span>
        )}

      </div>
    </div>
  );
}