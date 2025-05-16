// 模拟DOM环境
document.body.innerHTML = `
  <div id="authButtons"></div>
  <div id="userProfile"></div>
  <span id="username"></span>
  <div id="coursesList"></div>
  <div id="favoritesList"></div>
  <div id="emptyFavorites"></div>
  <div id="videoTitle"></div>
  <video id="videoPlayer"></video>
  <button id="favoriteButton"></button>
  <button id="markWatchedButton"></button>
  <select id="defaultQuality"></select>
  <select id="defaultSpeed"></select>
  <input id="volumeLevel" type="range">
  <span id="volumeValue"></span>
  <input id="autoplay" type="checkbox">
  <form id="loginForm"></form>
  <form id="registerForm"></form>
  <a id="logoutButton"></a>
`;

// 模拟localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock();

// 模拟jQuery
global.$ = function(selector) {
  return {
    modal: jest.fn(),
    on: jest.fn()
  };
};

// 模拟全局对象
global.Logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

global.AppConfig = {
  defaultVideoQuality: '720',
  defaultPlaybackSpeed: '1.0',
  defaultVolume: 80,
  autoplay: true,
  theme: 'light'
};

// 模拟showSuccessMessage和showErrorMessage函数
global.showSuccessMessage = jest.fn();
global.showErrorMessage = jest.fn();


// 模拟全局模块（防止相互依赖问题）
global.UserAuth = {
  isLoggedIn: jest.fn().mockReturnValue(false)
};

global.CourseManager = {
  markAsWatched: jest.fn(),
  renderCourses: jest.fn(),
  renderFavorites: jest.fn()
};

global.VideoPlayer = {
  settings: {
    quality: '720',
    playbackSpeed: '1.0',
    volume: 80,
    autoplay: true
  }
};

global.UserSettings = {
  getSetting: jest.fn(),
  setSetting: jest.fn()
};