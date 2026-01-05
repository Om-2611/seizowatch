import { useState, useEffect } from 'react';
import { database, ref, onValue, off } from '../firebase';

/**
 * Custom hook to fetch seizure events from Firebase Realtime Database
 * Returns events in real-time as they're added by the Python backend
 */
export function useSeizureEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventsRef = ref(database, 'seizure_events');

    const handleData = (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Convert Firebase object to array with IDs
          const eventsArray = Object.entries(data).map(([id, event]) => ({
            id,
            timestamp: event.timestamp || '',
            duration_seconds: event.duration_seconds || event.duration || 0,
            avg_motion: event.avg_motion || 0,
            max_motion: event.max_motion || 0,
            dominant_frequency: event.dominant_frequency || event.dominant_freq || 0,
            rule_based: event.rule_based || false,
            dl_verified: event.dl_verified || event.final_decision || false,
            onnx_score: event.onnx_score || 0,
          }));

          // Sort by timestamp (latest first)
          eventsArray.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
          });

          setEvents(eventsArray);
        } else {
          setEvents([]);
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
    onValue(eventsRef, handleData, handleError);

    // Cleanup listener on unmount
    return () => {
      off(eventsRef, 'value', handleData);
    };
  }, []);

  return { events, loading, error };
}
