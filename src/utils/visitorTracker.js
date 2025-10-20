// src/utils/visitorTracker.js

const API_URL = 'https://todo-api-ovrr.onrender.com/api/visitors';

// Cache vị trí để không gọi API quá nhiều
let cachedLocation = null;
let lastLocationFetch = 0;
const LOCATION_CACHE_TIME = 3600000; // 1 giờ

// 🎯 Lấy hoặc tạo Session ID
function getSessionId() {
  const sessionKey = 'visitor_session_id';
  let sessionId = sessionStorage.getItem(sessionKey);
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(sessionKey, sessionId);
  }
  
  return sessionId;
}

// 📱 Detect device type
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    return /Tablet|iPad/.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

// 🌍 Lấy thông tin vị trí với cache và fallback
async function getLocationInfo() {
  const now = Date.now();
  
  // Kiểm tra cache
  if (cachedLocation && (now - lastLocationFetch) < LOCATION_CACHE_TIME) {
    console.log('📍 Sử dụng location từ cache');
    return cachedLocation;
  }

  try {
    // Thử dùng ipapi.co trước
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Nếu gặp rate limit, skip và dùng default
    if (response.status === 429) {
      console.warn('⚠️ ipapi.co rate limited, dùng default location');
      cachedLocation = {
        country: 'Vietnam',
        city: 'Unknown',
        ip: 'Hidden'
      };
      lastLocationFetch = now;
      return cachedLocation;
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    cachedLocation = {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      ip: data.ip || 'Hidden'
    };
    lastLocationFetch = now;
    
    console.log('✅ Location fetched:', cachedLocation);
    return cachedLocation;

  } catch (error) {
    console.warn('⚠️ Lỗi fetch location:', error.message);
    
    // Fallback: Dùng timezone để guess country
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const defaultLocation = {
      country: 'Vietnam', // Hoặc detect từ timezone
      city: 'Unknown',
      timezone: timezone
    };
    
    cachedLocation = defaultLocation;
    lastLocationFetch = now;
    return defaultLocation;
  }
}

// ⏱️ Tính session duration
let sessionStartTime = Date.now();

function getSessionDuration() {
  return Math.floor((Date.now() - sessionStartTime) / 1000); // Giây
}

// 📤 Gửi visitor tracking - với retry logic
export async function trackVisitor(retries = 3) {
  try {
    const locationInfo = await getLocationInfo();
    
    const visitorData = {
      user_agent: navigator.userAgent,
      referer: document.referrer || 'Direct',
      country: locationInfo.country,
      city: locationInfo.city,
      device_type: getDeviceType(),
      page_url: window.location.pathname,
      session_id: getSessionId(),
      visit_duration: getSessionDuration(),
    };

    // Retry logic cho network errors
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitorData),
          signal: AbortSignal.timeout(5000) // 5 giây timeout
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('✅ Visitor tracked successfully');
            return data.data;
          }
        } else if (response.status === 429) {
          console.warn('⚠️ Backend rate limited, retry...');
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        } else {
          console.warn(`⚠️ Backend error: ${response.status}`);
          return null;
        }
      } catch (error) {
        if (attempt === retries) throw error;
        console.warn(`🔄 Retry ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

  } catch (error) {
    console.warn('❌ Lỗi tracking visitor:', error.message);
    return null;
  }
}

// 🔄 Track visitor khi load page - với debounce
let trackingTimer = null;

export function initVisitorTracking() {
  // Track ngay khi app load (debounced)
  if (!trackingTimer) {
    trackingTimer = setTimeout(() => {
      trackVisitor();
      trackingTimer = null;
    }, 500);
  }
  
  // Track lại mỗi 10 phút (thay vì 5 để giảm request)
  setInterval(() => {
    trackVisitor();
  }, 10 * 60 * 1000);

  // Track trước khi user rời website
  window.addEventListener('beforeunload', () => {
    trackVisitor();
  });
}

// 📊 Lấy thống kê visitors - với retry
export async function getVisitorStats(retries = 2) {
  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_URL}/stats/overview`, {
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          return data.success ? data.data : null;
        } else if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } catch (error) {
        if (attempt === retries) throw error;
      }
    }
  } catch (error) {
    console.error('❌ Lỗi lấy stats:', error.message);
    return null;
  }
}

// 📋 Lấy danh sách tất cả visitors
export async function getAllVisitors(retries = 2) {
  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(API_URL, {
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          return data.success ? data.data : [];
        } else if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } catch (error) {
        if (attempt === retries) throw error;
      }
    }
    return [];
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách visitors:', error.message);
    return [];
  }
}