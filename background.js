function addXdebugCookie(e) {
  const cookieObject = {
    name: 'Cookie',
    value: 'XDEBUG_SESSION=netbeans_xdebug',
  };

  e.requestHeaders.push(cookieObject);
}

function attachXHRListener() {
  console.log('attaching xhr listener');
  browser.webRequest.onBeforeSendHeaders.addListener(
    addXdebugCookie,
    { urls: ['<all_urls>'], types: ['xmlhttprequest'] },
    ['requestHeaders'],
  );
}

function detachXHRListener() {
  console.log('detaching xhr listener');
  browser.webRequest.onBeforeSendHeaders.removeListener(addXdebugCookie);
}
