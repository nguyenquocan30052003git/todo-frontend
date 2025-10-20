// src/utils/visitorTracker.js

const API_URL = 'https://todo-api-ovrr.onrender.com/api/visitors';

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

// 🌍 Lấy thông tin vị trí (đơn giản - có thể dùng GeoIP API để chính xác hơn)
async function getLocationInfo() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
    };
  } catch (error) {
    console.warn('Không thể lấy thông tin vị trí:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
    };
  }
}

// ⏱️ Tính session duration
let sessionStartTime = Date.now();

function getSessionDuration() {
  return Math.floor((Date.now() - sessionStartTime) / 1000); // Giây
}

// 📤 Gửi visitor tracking
export async function trackVisitor() {
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

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Visitor tracked:', data.data);
    } else {
      console.warn('⚠️ Không thể track visitor:', data.message);
    }
  } catch (error) {
    console.error('❌ Lỗi tracking visitor:', error);
  }
}

// 🔄 Track visitor khi load page
export function initVisitorTracking() {
  // Track ngay khi app load
  trackVisitor();
  
  // Track lại mỗi 5 phút
  setInterval(() => {
    trackVisitor();
  }, 5 * 60 * 1000);
}

// 📊 Lấy thống kê visitors
export async function getVisitorStats() {
  try {
    const response = await fetch(`${API_URL}/stats/overview`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('❌ Lỗi lấy stats:', error);
    return null;
  }
}

// 📋 Lấy danh sách tất cả visitors
export async function getAllVisitors() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách visitors:', error);
    return [];
  }
}