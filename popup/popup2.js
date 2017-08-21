const XdebugHelper = {
  buttons: {},

  ideKey: '',

  state: {
    debugging: 0,
    tracing: 0,
    profiling: 0,
  },

  attachHandlers: () => {
    XdebugHelper.buttons.debugging = document.getElementById('debugging');
    XdebugHelper.buttons.tracing = document.getElementById('tracing');
    XdebugHelper.buttons.profiling = document.getElementById('profiling');

    XdebugHelper.ideKeyInput = document.getElementById('idekey_setting');

    XdebugHelper.settingsIcon = document.getElementById('settings-icon');
    XdebugHelper.settingsSection = document.getElementById('settings-section');
    XdebugHelper.settingsSaveButton = document.getElementById('settings-save-button');
    XdebugHelper.settingsCancelButton = document.getElementById('settings-cancel-button');
  },

  attachListeners: () => {
    XdebugHelper.buttons.debugging.addEventListener('click', () => {
      if (XdebugHelper.state.debugging === 1) {
        XdebugHelper.removeCookie('XDEBUG_SESSION').then(XdebugHelper.updateState);
      } else {
        const ideKey = localStorage.getItem('idekey');
        XdebugHelper.setCookie('XDEBUG_SESSION', ideKey).then(XdebugHelper.updateState);
      }
    });

    XdebugHelper.buttons.tracing.addEventListener('click', () => {
      if (XdebugHelper.state.tracing === 1) {
        XdebugHelper.removeCookie('XDEBUG_TRACE').then(XdebugHelper.updateState);
      } else {
        XdebugHelper.setCookie('XDEBUG_TRACE', '1').then(XdebugHelper.updateState);
      }
    });

    XdebugHelper.buttons.profiling.addEventListener('click', () => {
      if (XdebugHelper.state.profiling === 1) {
        XdebugHelper.removeCookie('XDEBUG_PROFILE').then(XdebugHelper.updateState);
      } else {
        XdebugHelper.setCookie('XDEBUG_PROFILE', '1').then(XdebugHelper.updateState);
      }
    });

    XdebugHelper.settingsIcon.addEventListener('click', () => {
      XdebugHelper.settingsSection.classList.remove('hidden');
    });

    XdebugHelper.settingsSaveButton.addEventListener('click', () => {
      const settingIdeKey = browser.storage.local.set({
        ideKey: XdebugHelper.ideKeyInput.value,
      });

      settingIdeKey.then(() => {
        XdebugHelper.settingsSection.classList.add('hidden');
        XdebugHelper.updateState();
      });
    });

    XdebugHelper.settingsCancelButton.addEventListener('click', () => {
      XdebugHelper.settingsSection.classList.add('hidden');
      const gettingIdeKey = browser.storage.local.get('ideKey');
      gettingIdeKey.then((storage) => {
        XdebugHelper.ideKeyInput.value = storage.ideKey;
      });
    });
  },

  init: () => {
    XdebugHelper.attachHandlers();
    XdebugHelper.attachListeners();
    XdebugHelper.updateState();

    browser.storage.local.get('ideKey', (storage) => {
      if (storage.ideKey === undefined) {
        const settingIdeKey = browser.storage.local.set({
          ideKey: 'netbeans-xdebug',
        });
        settingIdeKey.then(XdebugHelper.updateState);
      }
    });
  },

  updateState: () => {
    const resolve = [
      XdebugHelper.getCookie('XDEBUG_SESSION'),
      XdebugHelper.getCookie('XDEBUG_TRACE'),
      XdebugHelper.getCookie('XDEBUG_PROFILE'),
      browser.storage.local.get('ideKey'),
    ];

    Promise.all(resolve).then((values) => {
      XdebugHelper.state.debugging = values[0] ? 1 : 0;
      XdebugHelper.state.tracing = values[1] ? 1 : 0;
      XdebugHelper.state.profiling = values[2] ? 1 : 0;
      XdebugHelper.ideKey = values[3].ideKey;

      XdebugHelper.updateView();
    });
  },

  updateView: () => {
    XdebugHelper.ideKeyInput.value = XdebugHelper.ideKey;

    Object.keys(XdebugHelper.state).forEach((key) => {
      if (XdebugHelper.state[key]) {
        XdebugHelper.buttons[key].classList.add('active');
        return;
      }
      XdebugHelper.buttons[key].classList.remove('active');
    });
  },

  getActiveTab: () => browser.tabs.query({
    active: true,
    currentWindow: true,
  }),

  getCookie: cookieName => XdebugHelper.getActiveTab().then(tabs => browser.cookies.get({
    url: tabs[0].url,
    name: cookieName,
  })),

  setCookie: (cookieName, cookieValue) => XdebugHelper.getActiveTab().then((tabs) => {
    browser.cookies.set({
      url: tabs[0].url,
      name: cookieName,
      value: cookieValue,
      expirationDate: Date.now() + (60 * 60),
    });
  }),

  removeCookie: cookieName => XdebugHelper.getActiveTab().then((tabs) => {
    browser.cookies.remove({
      url: tabs[0].url,
      name: cookieName,
    });
  }),
};

XdebugHelper.init();
