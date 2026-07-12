"use client";

import { useState, useEffect } from "react";
import { Wind, Thermometer } from "lucide-react";

interface AqiCity {
  city: string;
  aqi: number | null;
  temp: number | null;
  color: string;
  label: string;
}

const FALLBACK_CITIES: AqiCity[] = [
  { city: "Kathmandu", aqi: 39, temp: 25, color: "text-green-500", label: "Good" },
  { city: "Pokhara", aqi: 59, temp: 27, color: "text-yellow-500", label: "Moderate" },
  { city: "Bharatpur", aqi: 68, temp: 32, color: "text-yellow-500", label: "Moderate" },
  { city: "Lalitpur", aqi: 68, temp: 25, color: "text-yellow-500", label: "Moderate" },
  { city: "Biratnagar", aqi: 91, temp: 31, color: "text-yellow-500", label: "Moderate" },
];

export default function AqiCard() {
  const [cities, setCities] = useState<AqiCity[]>([]);

  useEffect(() => {
    fetch("/api/aqi")
      .then((res) => res.json())
      .then((data) => {
        if (data.cities && data.cities.length > 0) setCities(data.cities);
        else setCities(FALLBACK_CITIES);
      })
      .catch(() => setCities(FALLBACK_CITIES));
  }, []);

  const displayCities = cities.length > 0 ? cities : FALLBACK_CITIES;

  return (
    <div className="flex h-full flex-col rounded-[24px] bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-text-muted">Nepal Air Quality</h3>
        <span className="text-xs text-text-muted">Updated Daily</span>
      </div>

      <div className="mt-4 flex-1 flex flex-col gap-2.5">
        {displayCities.map((city) => (
          <div key={city.city} className="flex items-center justify-between rounded-2xl border border-border-light bg-surface-alt px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Wind size={18} strokeWidth={1.5} className="text-text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{city.city}</p>
                <p className={`text-xs font-semibold ${city.color}`}>{city.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-text-primary">{city.aqi ?? "—"}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">AQI</p>
              </div>
              {city.temp !== null && (
                <div className="flex items-center gap-1 text-text-muted">
                  <Thermometer size={14} strokeWidth={1.5} />
                  <span className="text-sm">{city.temp}°C</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
