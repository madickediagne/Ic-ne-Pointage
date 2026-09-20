import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("device_id", id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
