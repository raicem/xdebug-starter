function addXdebugCookie(e) {
  const cookieObject = {
    name: 'Cookie',
    value: 'XDEBUG_SESSION=netbeans_xdebug',
  };

  e.requestHeaders.push(cookieObject);
}

function attachXHRListener() {
  browser.browserAction.setIcon({ path: 'icons/icon128-on.png' });

  browser.webRequest.onBeforeSendHeaders.addListener(
    addXdebugCookie,
    { urls: ['<all_urls>'], types: ['xmlhttprequest'] },
    ['requestHeaders'],
  );
}

function detachXHRListener() {
  browser.browserAction.setIcon({ path: 'icons/icon128.png' });
  browser.webRequest.onBeforeSendHeaders.removeListener(addXdebugCookie);
}
