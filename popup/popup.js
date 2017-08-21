const buttons = {
  debugging: document.getElementById('debugging'),
  tracing: document.getElementById('tracing'),
  profiling: document.getElementById('profiling'),
};

const ideKeyInput = document.getElementById('idekey_setting');
const settingsButton = document.getElementById('settings-button');
const settingsSection = document.getElementById('settings-section');
const settingsSaveButton = document.getElementById('settings-save-button');
const settingsCancelButton = document.getElementById('settings-cancel-button');

const state = {
  debugging: 0,
  tracing: 0,
  profiling: 0,
};

function getActiveTab() {
  return browser.tabs.query({
    active: true,
    currentWindow: true,
  });
}

function getCookie(cookieName) {
  return getActiveTab().then(tabs => browser.cookies.get({
    url: tabs[0].url,
    name: cookieName,
  }));
}

function setCookie(cookieName, cookieValue) {
  return getActiveTab().then((tabs) => {
    browser.cookies.set({
      url: tabs[0].url,
      name: cookieName,
      value: cookieValue,
      expirationDate: Date.now() + (60 * 60),
    });
  });
}

function removeCookie(cookieName) {
  return getActiveTab().then((tabs) => {
    browser.cookies.remove({
      url: tabs[0].url,
      name: cookieName,
    });
  });
}

function updateView() {
  Object.keys(state).forEach((key) => {
    if (state[key]) {
      buttons[key].classList.add('active');
      return;
    }
    buttons[key].classList.remove('active');
  });
}

function updateState() {
  const debuggingPromise = getCookie('XDEBUG_SESSION');
  const tracingPromise = getCookie('XDEBUG_TRACE');
  const profilingPromise = getCookie('XDEBUG_PROFILE');

  Promise.all([debuggingPromise, tracingPromise, profilingPromise]).then((values) => {
    state.debugging = values[0] ? 1 : 0;
    state.tracing = values[1] ? 1 : 0;
    state.profiling = values[2] ? 1 : 0;

    updateView();
  });
}

updateState();

buttons.debugging.addEventListener('click', () => {
  if (state.debugging === 1) {
    removeCookie('XDEBUG_SESSION').then(updateState);
  } else {
    const ideKey = localStorage.getItem('idekey');
    setCookie('XDEBUG_SESSION', ideKey).then(updateState);
  }
});

buttons.tracing.addEventListener('click', () => {
  if (state.tracing === 1) {
    removeCookie('XDEBUG_TRACE').then(updateState);
  } else {
    setCookie('XDEBUG_TRACE', '1').then(updateState);
  }
});

buttons.profiling.addEventListener('click', () => {
  if (state.profiling === 1) {
    removeCookie('XDEBUG_PROFILE').then(updateState);
  } else {
    setCookie('XDEBUG_PROFILE', '1').then(updateState);
  }
});

settingsButton.addEventListener('click', () => {
  settingsSection.classList.remove('hidden');
});

settingsCancelButton.addEventListener('click', () => {
  ideKeyInput.value = localStorage.getItem('idekey');
  settingsSection.classList.add('hidden');
});

settingsSaveButton.addEventListener('click', () => {
  localStorage.set('idekey', ideKeyInput.value);
  settingsSection.classList.add('hidden');
});
