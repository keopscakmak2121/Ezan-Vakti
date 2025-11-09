// Android Widget Bridge
export const updatePrayerWidget = (prayerTimes) => {
  try {
    if (window.Android && window.Android.updatePrayerWidget) {
      window.Android.updatePrayerWidget(JSON.stringify(prayerTimes));
    }
  } catch (error) {
    console.log("Widget update failed:", error);
  }
};

export const updateNextPrayerWidget = (nextPrayer) => {
  try {
    if (window.Android && window.Android.updateNextPrayerWidget) {
      window.Android.updateNextPrayerWidget(JSON.stringify(nextPrayer));
    }
  } catch (error) {
    console.log("Next prayer widget update failed:", error);
  }
};
