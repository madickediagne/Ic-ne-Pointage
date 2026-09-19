import { useState, useEffect } from "react";
import { GPS_TIMEOUT_MS, MAX_GPS_ACCURACY, ERROR_MESSAGES } from "@/lib/constants";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const getLocation = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: "La géolocalisation n'est pas supportée par votre navigateur.",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // On avertit si la précision est mauvaise (ex: à l'intérieur d'un bâtiment sans Wi-Fi)
        let errorMsg = null;
        if (accuracy > MAX_GPS_ACCURACY) {
          errorMsg = ERROR_MESSAGES.GPS_INACCURATE;
        }

        setState({
          latitude,
          longitude,
          accuracy,
          error: errorMsg,
          loading: false,
        });
      },
      (error) => {
        let errorMsg = ERROR_MESSAGES.GPS_DISABLED;
        if (error.code === error.TIMEOUT) errorMsg = ERROR_MESSAGES.GPS_TIMEOUT;
        
        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMsg,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  };

  return { ...state, getLocation };
}
