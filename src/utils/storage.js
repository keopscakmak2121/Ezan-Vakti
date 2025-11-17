
// src/utils/storage.js

/**
 * Retrieves prayer times data from localStorage if it's from today.
 * @returns {object|null} The stored data or null if not found or outdated.
 */
export const getStoredPrayerTimes = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const storedData = JSON.parse(localStorage.getItem('prayerTimesData'));

    if (storedData && storedData.date === today && storedData.locationName && storedData.locationName !== 'Konum') {
      return storedData;
    }
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
  }
  return null;
};

/**
 * Stores prayer times data in localStorage.
 * @param {object} timings The prayer times object.
 * @param {string} locationName The name of the location.
 */
export const storePrayerTimes = (timings, locationName) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dataToStore = {
      date: today,
      timings: timings,
      locationName: locationName,
    };
    localStorage.setItem('prayerTimesData', JSON.stringify(dataToStore));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
};
