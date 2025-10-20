// src/utils/geoLocationProviders.js

// 🌍 Provider 1: ipapi.co (1000 requests/month free)
export async function getLocationFromIpApi() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000)
    });
    if (response.status === 429) return null; // Rate limited
    
    const data = await response.json();
    return {
      country: data.country_name,
      city: data.city,
      provider: 'ipapi.co'
    };
  } catch (error) {
    console.warn('ipapi.co failed:', error.message);
    return null;
  }
}

// 🌍 Provider 2: ip-api.com (45 requests/minute free)
export async function getLocationFromIpApiCom() {
  try {
    const response = await fetch('https://ip-api.com/json/?fields=country,city,query', {
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      country: data.country,
      city: data.city,
      provider: 'ip-api.com'
    };
  } catch (error) {
    console.warn('ip-api.com failed:', error.message);
    return null;
  }
}

// 🌍 Provider 3: geocode.xyz (free, no rate limit)
export async function getLocationFromGeocodeXyz() {
  try {
    const response = await fetch('https://geocode.xyz/?locate=me&json=1', {
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      country: data.prov || 'Unknown', // State/Country
      city: data.city || 'Unknown',
      provider: 'geocode.xyz'
    };
  } catch (error) {
    console.warn('geocode.xyz failed:', error.message);
    return null;
  }
}

// 🌍 Provider 4: Browser Geolocation API (No network, require permission)
export async function getLocationFromBrowser() {
  return new Promise((resolve) => {
    // ❌ Không khuyến khích - user sẽ bị prompt, khó chịu
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          provider: 'browser'
        });
      },
      () => resolve(null),
      { timeout: 3000 }
    );
  });
}

// 🌍 Provider 5: Timezone guessing (No network, very inaccurate)
export function getLocationFromTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Simple mapping (không chính xác lắm!)
  const timezoneToCountry = {
    'Asia/Ho_Chi_Minh': 'Vietnam',
    'Asia/Bangkok': 'Thailand',
    'Asia/Singapore': 'Singapore',
    'Asia/Manila': 'Philippines',
    'Asia/Jakarta': 'Indonesia',
    'Asia/Tokyo': 'Japan',
    'Asia/Seoul': 'South Korea',
    'America/New_York': 'United States',
    'America/Los_Angeles': 'United States',
    'Europe/London': 'United Kingdom',
    'Europe/Paris': 'France',
    'Europe/Berlin': 'Germany',
  };

  return {
    country: timezoneToCountry[timezone] || 'Unknown',
    city: 'Unknown',
    timezone: timezone,
    provider: 'timezone-guess'
  };
}

// 🎯 Smart getLocation - thử multiple providers
export async function getLocationSmart() {
  // Thứ tự ưu tiên
  const providers = [
    { name: 'ip-api.com', fn: getLocationFromIpApiCom },
    { name: 'geocode.xyz', fn: getLocationFromGeocodeXyz },
    { name: 'ipapi.co', fn: getLocationFromIpApi },
  ];

  for (const provider of providers) {
    try {
      console.log(`🔄 Trying ${provider.name}...`);
      const location = await provider.fn();
      
      if (location) {
        console.log(`✅ ${provider.name} success:`, location);
        return location;
      }
    } catch (error) {
      console.warn(`❌ ${provider.name} failed`);
    }
  }

  // Fallback: timezone guessing
  console.log('📍 Falling back to timezone');
  return getLocationFromTimezone();
}

export default {
  getLocationFromIpApi,
  getLocationFromIpApiCom,
  getLocationFromGeocodeXyz,
  getLocationFromBrowser,
  getLocationFromTimezone,
  getLocationSmart
};