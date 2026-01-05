import { useState, useEffect } from 'react';
import { database, ref, onValue, off } from '../firebase';

/**
 * Custom hook to fetch real-time monitoring data from Firebase
 * Returns live camera feed metrics updated every second
 */
export function useRealtimeMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const monitoringRef = ref(database, 'realtime_monitoring');

    const handleData = (snapshot) => {
      try {
        if (snapshot.exists()) {
          const monitoringData = snapshot.val();
          setData({
            motion_value: monitoringData.motion_value || 0,
            dominant_frequency: monitoringData.dominant_frequency || 0,
            rhythmic_motion: monitoringData.rhythmic_motion || false,
            avg_motion: monitoringData.avg_motion || 0,
            max_motion: monitoringData.max_motion || 0,
            timestamp: monitoringData.timestamp || '',
          });
        } else {
          setData(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const handleError = (err) => {
      setError(err.message);
      setLoading(false);
    };

    // Set up real-time listener
    onValue(monitoringRef, handleData, handleError);

    // Cleanup listener on unmount
    return () => {
      off(monitoringRef, 'value', handleData);
    };
  }, []);

  return { data, loading, error };
}
