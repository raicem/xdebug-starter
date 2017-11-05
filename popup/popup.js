const XdebugStarter = {
  buttons: {},

  ideKey: '',

  state: {
    debugging: 0,
    tracing: 0,
    profiling: 0,
  },

  attachHandlers: () => {
    XdebugStarter.buttons.debugging = document.getElementById('debugging');
    XdebugStarter.buttons.tracing = document.getElementById('tracing');
    XdebugStarter.buttons.profiling = document.getElementById('profiling');

    XdebugStarter.ideKeyInput = document.getElementById('idekey_setting');

    XdebugStarter.settingsIcon = document.getElementById('settings-icon');
    XdebugStarter.settingsSection = document.getElementById('settings-section');
    XdebugStarter.settingsSaveButton = document.getElementById('settings-save-button');
    XdebugStarter.settingsCancelButton = document.getElementById('settings-cancel-button');
  },

  attachListeners: () => {
    XdebugStarter.buttons.debugging.addEventListener('click', () => {
      if (XdebugStarter.state.debugging === 1) {
        XdebugStarter.removeCookie('XDEBUG_SESSION').then(XdebugStarter.updateState);
      } else {
        const ideKey = XdebugStarter.ideKey;
        XdebugStarter.setCookie('XDEBUG_SESSION', ideKey).then(XdebugStarter.updateState);
      }
    });

    XdebugStarter.buttons.tracing.addEventListener('click', () => {
      if (XdebugStarter.state.tracing === 1) {
        XdebugStarter.removeCookie('XDEBUG_TRACE').then(XdebugStarter.updateState);
      } else {
        XdebugStarter.setCookie('XDEBUG_TRACE', '1').then(XdebugStarter.updateState);
      }
    });

    XdebugStarter.buttons.profiling.addEventListener('click', () => {
      if (XdebugStarter.state.profiling === 1) {
        XdebugStarter.removeCookie('XDEBUG_PROFILE').then(XdebugStarter.updateState);
      } else {
        XdebugStarter.setCookie('XDEBUG_PROFILE', '1').then(XdebugStarter.updateState);
      }
    });

    XdebugStarter.settingsIcon.addEventListener('click', () => {
      XdebugStarter.settingsSection.classList.remove('hidden');
    });

    XdebugStarter.settingsSaveButton.addEventListener('click', () => {
      const settingIdeKey = browser.storage.local.set({
        ideKey: XdebugStarter.ideKeyInput.value,
      });

      settingIdeKey.then(() => {
        XdebugStarter.settingsSection.classList.add('hidden');
        XdebugStarter.updateState();
      });
    });

    XdebugStarter.settingsCancelButton.addEventListener('click', () => {
      XdebugStarter.settingsSection.classList.add('hidden');
      const gettingIdeKey = browser.storage.local.get('ideKey');
      gettingIdeKey.then((storage) => {
        XdebugStarter.ideKeyInput.value = storage.ideKey;
      });
    });
  },

  init: () => {
    XdebugStarter.attachHandlers();
    XdebugStarter.attachListeners();
    XdebugStarter.updateState();

    browser.storage.local.get('ideKey', (storage) => {
      if (storage.ideKey === undefined) {
        const settingIdeKey = browser.storage.local.set({
          ideKey: 'netbeans-xdebug',
        });
        settingIdeKey.then(XdebugStarter.updateState);
      }
    });
  },

  updateState: () => {
    const resolve = [
      XdebugStarter.getCookie('XDEBUG_SESSION'),
      XdebugStarter.getCookie('XDEBUG_TRACE'),
      XdebugStarter.getCookie('XDEBUG_PROFILE'),
      browser.storage.local.get('ideKey'),
    ];

    Promise.all(resolve).then((values) => {
      XdebugStarter.state.debugging = values[0] ? 1 : 0;
      XdebugStarter.state.tracing = values[1] ? 1 : 0;
      XdebugStarter.state.profiling = values[2] ? 1 : 0;
      XdebugStarter.ideKey = values[3].ideKey;

      XdebugStarter.handleXHRListener();
      XdebugStarter.updateView();
    });
  },

  handleXHRListener: () => {
    const getBackground = browser.runtime.getBackgroundPage();
    if (
      XdebugStarter.state.debugging === 0 &&
      XdebugStarter.state.tracing === 0 &&
      XdebugStarter.state.profiling === 0
    ) {
      getBackground.then(bg => bg.detachXHRListener());
    } else {
      getBackground.then(bg => bg.attachXHRListener());
    }
  },

  updateView: () => {
    XdebugStarter.ideKeyInput.value = XdebugStarter.ideKey;

    Object.keys(XdebugStarter.state).forEach((key) => {
      if (XdebugStarter.state[key]) {
        XdebugStarter.buttons[key].classList.add('active');
        return;
      }
      XdebugStarter.buttons[key].classList.remove('active');
    });
  },

  getActiveTab: () =>
    browser.tabs.query({
      active: true,
      currentWindow: true,
      url: '*://*/*',
    }),

  getCookie: cookieName =>
    XdebugStarter.getActiveTab()
      .then(tabs =>
        browser.cookies.get({
          url: tabs[0].url,
          name: cookieName,
        }),
      )
      .catch(() => console.log('No tab is in place!')),

  setCookie: (cookieName, cookieValue) =>
    XdebugStarter.getActiveTab()
      .then((tabs) => {
        browser.cookies.set({
          url: tabs[0].url,
          name: cookieName,
          value: cookieValue,
          expirationDate: Math.floor(Date.now() / 1000) + 3600,
        });
      })
      .catch(() => console.log('No tab is in place!')),

  removeCookie: cookieName =>
    XdebugStarter.getActiveTab()
      .then((tabs) => {
        browser.cookies.remove({
          url: tabs[0].url,
          name: cookieName,
        });
      })
      .catch(() => console.log('No tab is in place!')),
};

XdebugStarter.init();
