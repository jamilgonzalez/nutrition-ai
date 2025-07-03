export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

export async function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

export async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || 'Unknown location';
  } catch (error) {
    console.error('Failed to get city from coordinates:', error);
    return 'Unknown location';
  }
}

export function getLocationErrorMessage(error: LocationError): string {
  switch (error.code) {
    case 1:
      return 'Location access denied. Please enable location permissions.';
    case 2:
      return 'Location unavailable. Please try again.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get location. Please enter your city manually.';
  }
}