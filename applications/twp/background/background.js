"use strict"; // Avoid outputting the error message "Receiving end does not exist" in the Console.

function checkedLastError() {
  chrome.runtime.lastError;
} // get mimetype


var tabToMimeType = {};
chrome.webRequest.onHeadersReceived.addListener(function (details) {
  if (details.tabId !== -1) {
    let contentTypeHeader = null;

    for (const header of details.responseHeaders) {
      if (header.name.toLowerCase() === 'content-type') {
        contentTypeHeader = header;
        break;
      }
    }

    tabToMimeType[details.tabId] = contentTypeHeader && contentTypeHeader.value.split(';', 1)[0];
  }
}, {
  urls: ['*://*/*'],
  types: ['main_frame']
}, ['responseHeaders']);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMainFramePageLanguageState") {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "getCurrentPageLanguageState"
    }, {
      frameId: 0
    }, pageLanguageState => {
      checkedLastError();
      sendResponse(pageLanguageState);
    });
    return true;
  } else if (request.action === "getMainFrameTabLanguage") {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "getOriginalTabLanguage"
    }, {
      frameId: 0
    }, tabLanguage => {
      checkedLastError();
      sendResponse(tabLanguage);
    });
    return true;
  } else if (request.action === "setPageLanguageState") {
    updateContextMenu(request.pageLanguageState);
  } else if (request.action === "openOptionsPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/options/options.html")
    });
  } else if (request.action === "openDonationPage") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/options/options.html#donation")
    });
  } else if (request.action === "detectTabLanguage") {
    if (!sender.tab) {
      // https://github.com/FilipePS/Traduzir-paginas-web/issues/478
      sendResponse("und");
      return;
    }

    try {
      chrome.tabs.detectLanguage(sender.tab.id, result => sendResponse(result));
    } catch (e) {
      console.error(e);
      sendResponse("und");
    }

    return true;
  } else if (request.action === "getTabHostName") {
    sendResponse(new URL(sender.tab.url).hostname);
  } else if (request.action === "thisFrameIsInFocus") {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "anotherFrameIsInFocus"
    }, checkedLastError);
  } else if (request.action === "getTabMimeType") {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      sendResponse(tabToMimeType[tabs[0].id]);
    });
    return true;
  }
});

function updateTranslateSelectedContextMenu() {
  if (typeof chrome.contextMenus !== "undefined") {
    chrome.contextMenus.remove("translate-selected-text", checkedLastError);

    if (twpConfig.get("showTranslateSelectedContextMenu") === "yes") {
      chrome.contextMenus.create({
        id: "translate-selected-text",
        title: chrome.i18n.getMessage("msgTranslateSelectedText"),
        contexts: ["selection"]
      });
    }
  }
}

function updateContextMenu(pageLanguageState = "original") {
  let contextMenuTitle;

  if (pageLanguageState === "translated") {
    contextMenuTitle = chrome.i18n.getMessage("btnRestore");
  } else {
    const targetLanguage = twpConfig.get("targetLanguage");
    contextMenuTitle = chrome.i18n.getMessage("msgTranslateFor", twpLang.codeToLanguage(targetLanguage));
  }

  if (typeof chrome.contextMenus != 'undefined') {
    chrome.contextMenus.remove("translate-web-page", checkedLastError);

    if (twpConfig.get("showTranslatePageContextMenu") == "yes") {
      chrome.contextMenus.create({
        id: "translate-web-page",
        title: contextMenuTitle,
        contexts: ["page", "frame"]
      });
    }
  }
}

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("/options/options.html")
    });
  } else if (details.reason == "update" && chrome.runtime.getManifest().version != details.previousVersion) {
    twpConfig.onReady(async () => {
      if (platformInfo.isMobile.any) return;
      if (twpConfig.get("showReleaseNotes") !== "yes") return;
      let lastTimeShowingReleaseNotes = twpConfig.get("lastTimeShowingReleaseNotes");
      let showReleaseNotes = false;

      if (lastTimeShowingReleaseNotes) {
        const date = new Date();
        date.setDate(date.getDate() - 21);

        if (date.getTime() > lastTimeShowingReleaseNotes) {
          showReleaseNotes = true;
          lastTimeShowingReleaseNotes = Date.now();
          twpConfig.set("lastTimeShowingReleaseNotes", lastTimeShowingReleaseNotes);
        }
      } else {
        showReleaseNotes = true;
        lastTimeShowingReleaseNotes = Date.now();
        twpConfig.set("lastTimeShowingReleaseNotes", lastTimeShowingReleaseNotes);
      }

      if (showReleaseNotes) {
        chrome.tabs.create({
          url: chrome.runtime.getURL("/options/options.html#release_notes")
        });
      }

      translationCache.deleteTranslationCache();
    });
  }

  twpConfig.onReady(async () => {
    if (platformInfo.isMobile.any) {
      twpConfig.set("enableDeepL", "no");
    }
  });
});

function resetPageAction(tabId, forceShow = false) {
  if (twpConfig.get("translateClickingOnce") === "yes" && !forceShow) {
    chrome.pageAction.setPopup({
      popup: null,
      tabId
    });
  } else {
    if (twpConfig.get("useOldPopup") === "yes") {
      chrome.pageAction.setPopup({
        popup: "popup/old-popup.html",
        tabId
      });
    } else {
      chrome.pageAction.setPopup({
        popup: "popup/popup.html",
        tabId
      });
    }
  }
}

function resetBrowserAction(forceShow = false) {
  if (twpConfig.get("translateClickingOnce") === "yes" && !forceShow) {
    chrome.browserAction.setPopup({
      popup: null
    });
  } else {
    if (twpConfig.get("useOldPopup") === "yes") {
      chrome.browserAction.setPopup({
        popup: "popup/old-popup.html"
      });
    } else {
      chrome.browserAction.setPopup({
        popup: "popup/popup.html"
      });
    }
  }
}

if (typeof chrome.contextMenus !== "undefined") {
  chrome.contextMenus.create({
    id: "browserAction-showPopup",
    title: chrome.i18n.getMessage("btnShowPopup"),
    contexts: ["browser_action"]
  });
  chrome.contextMenus.create({
    id: "pageAction-showPopup",
    title: chrome.i18n.getMessage("btnShowPopup"),
    contexts: ["page_action"]
  });
  chrome.contextMenus.create({
    id: "never-translate",
    title: chrome.i18n.getMessage("btnNeverTranslate"),
    contexts: ["browser_action", "page_action"]
  });
  chrome.contextMenus.create({
    id: "more-options",
    title: chrome.i18n.getMessage("btnMoreOptions"),
    contexts: ["browser_action", "page_action"]
  });
  chrome.contextMenus.create({
    id: "browserAction-pdf-to-html",
    title: chrome.i18n.getMessage("msgPDFtoHTML"),
    contexts: ["browser_action"]
  });
  chrome.contextMenus.create({
    id: "pageAction-pdf-to-html",
    title: chrome.i18n.getMessage("msgPDFtoHTML"),
    contexts: ["page_action"]
  });
  const tabHasContentScript = {};
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "translate-web-page") {
      chrome.tabs.sendMessage(tab.id, {
        action: "toggle-translation"
      }, checkedLastError);
    } else if (info.menuItemId == "translate-selected-text") {
      if (chrome.pageAction && chrome.pageAction.openPopup && (!tabHasContentScript[tab.id] || tab.isInReaderMode)) {
        chrome.pageAction.setPopup({
          popup: "popup/popup-translate-text.html#text=" + encodeURIComponent(info.selectionText),
          tabId: tab.id
        });
        chrome.pageAction.openPopup();
        resetPageAction(tab.id);
      } else {
        // a merda do chrome não suporte openPopup
        chrome.tabs.sendMessage(tab.id, {
          action: "TranslateSelectedText",
          selectionText: info.selectionText
        }, checkedLastError);
      }
    } else if (info.menuItemId == "browserAction-showPopup") {
      resetBrowserAction(true);
      chrome.browserAction.openPopup();
      resetBrowserAction();
    } else if (info.menuItemId == "pageAction-showPopup") {
      resetPageAction(tab.id, true);
      chrome.pageAction.openPopup();
      resetPageAction(tab.id);
    } else if (info.menuItemId == "never-translate") {
      const hostname = new URL(tab.url).hostname;
      twpConfig.addSiteToNeverTranslate(hostname);
    } else if (info.menuItemId == "more-options") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("/options/options.html")
      });
    } else if (info.menuItemId == "browserAction-pdf-to-html") {
      const mimeType = tabToMimeType[tab.id];

      if (mimeType && mimeType.toLowerCase() === "application/pdf" && typeof chrome.browserAction.openPopup !== 'undefined') {
        chrome.browserAction.openPopup();
      } else {
        chrome.tabs.create({
          url: "https://translatewebpages.org/"
        });
      }
    } else if (info.menuItemId == "pageAction-pdf-to-html") {
      const mimeType = tabToMimeType[tab.id];

      if (mimeType && mimeType.toLowerCase() === "application/pdf" && typeof chrome.pageAction.openPopup !== 'undefined') {
        chrome.pageAction.openPopup();
      } else {
        chrome.tabs.create({
          url: "https://translatewebpages.org/"
        });
      }
    }
  });
  chrome.tabs.onActivated.addListener(activeInfo => {
    twpConfig.onReady(() => updateContextMenu());
    chrome.tabs.sendMessage(activeInfo.tabId, {
      action: "getCurrentPageLanguageState"
    }, {
      frameId: 0
    }, pageLanguageState => {
      checkedLastError();

      if (pageLanguageState) {
        twpConfig.onReady(() => updateContextMenu(pageLanguageState));
      }
    });
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status == "loading") {
      twpConfig.onReady(() => updateContextMenu());
    } else if (changeInfo.status == "complete") {
      chrome.tabs.sendMessage(tabId, {
        action: "contentScriptIsInjected"
      }, {
        frameId: 0
      }, response => {
        checkedLastError();
        tabHasContentScript[tabId] = !!response;
      });
    }
  });
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    delete tabHasContentScript[tabId];
  });
  chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, {
    action: "contentScriptIsInjected"
  }, {
    frameId: 0
  }, response => {
    checkedLastError();

    if (response) {
      tabHasContentScript[tab.id] = true;
    }
  })));
}

twpConfig.onReady(() => {
  if (platformInfo.isMobile.any) {
    chrome.tabs.query({}, tabs => tabs.forEach(tab => chrome.pageAction.hide(tab.id)));
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status == "loading") {
        chrome.pageAction.hide(tabId);
      }
    });
    chrome.browserAction.onClicked.addListener(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: "showPopupMobile"
      }, {
        frameId: 0
      }, checkedLastError);
    });
  } else {
    if (chrome.pageAction) {
      chrome.pageAction.onClicked.addListener(tab => {
        if (twpConfig.get("translateClickingOnce") === "yes") {
          chrome.tabs.sendMessage(tab.id, {
            action: "toggle-translation"
          }, checkedLastError);
        }
      });
    }

    chrome.browserAction.onClicked.addListener(tab => {
      if (twpConfig.get("translateClickingOnce") === "yes") {
        chrome.tabs.sendMessage(tab.id, {
          action: "toggle-translation"
        }, checkedLastError);
      }
    });
    resetBrowserAction();
    twpConfig.onChanged((name, newvalue) => {
      switch (name) {
        case "useOldPopup":
          resetBrowserAction();
          break;

        case "translateClickingOnce":
          resetBrowserAction();
          chrome.tabs.query({
            currentWindow: true,
            active: true
          }, tabs => {
            resetPageAction(tabs[0].id);
          });
          break;
      }
    });

    if (chrome.pageAction && browser) {
      let pageLanguageState = "original";
      let themeColorPopupText = null;
      browser.theme.getCurrent().then(theme => {
        themeColorPopupText = null;

        if (theme.colors && (theme.colors.toolbar_field_text || theme.colors.popup_text)) {
          themeColorPopupText = theme.colors.toolbar_field_text || theme.colors.popup_text;
        }

        updateIconInAllTabs();
      });
      chrome.theme.onUpdated.addListener(updateInfo => {
        themeColorPopupText = null;

        if (updateInfo.theme.colors && (updateInfo.theme.colors.toolbar_field_text || updateInfo.theme.colors.popup_text)) {
          themeColorPopupText = updateInfo.theme.colors.toolbar_field_text || updateInfo.theme.colors.popup_text;
        }

        updateIconInAllTabs();
      });
      let darkMode = false;
      darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
      updateIconInAllTabs();
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        darkMode = matchMedia("(prefers-color-scheme: dark)").matches;
        updateIconInAllTabs();
      });

      function getSVGIcon() {
        const svgXml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="$(fill);" fill-opacity="$(fill-opacity);" d="M 45 0 C 20.186 0 0 20.186 0 45 L 0 347 C 0 371.814 20.186 392 45 392 L 301 392 C 305.819 392 310.34683 389.68544 313.17383 385.77344 C 315.98683 381.84744 316.76261 376.82491 315.22461 372.25391 L 195.23828 10.269531 A 14.995 14.995 0 0 0 181 0 L 45 0 z M 114.3457 107.46289 L 156.19336 107.46289 C 159.49489 107.46289 162.41322 109.61359 163.39258 112.76367 L 163.38281 112.77539 L 214.06641 276.2832 C 214.77315 278.57508 214.35913 281.05986 212.93555 282.98828 C 211.52206 284.90648 209.27989 286.04688 206.87695 286.04688 L 179.28516 286.04688 C 175.95335 286.04687 173.01546 283.86624 172.06641 280.67578 L 159.92969 240.18945 L 108.77148 240.18945 L 97.564453 280.52344 C 96.655774 283.77448 93.688937 286.03711 90.306641 286.03711 L 64.347656 286.03711 C 61.954806 286.03711 59.71461 284.90648 58.291016 282.98828 C 56.867422 281.05986 56.442021 278.57475 57.138672 276.29297 L 107.14648 112.79492 C 108.11572 109.62465 111.03407 107.46289 114.3457 107.46289 z M 133.39648 137.70117 L 114.55664 210.03125 L 154.06445 210.03125 L 133.91211 137.70117 L 133.39648 137.70117 z " />
                    <path fill="$(fill);" fill-opacity="$(fill-opacity);" d="M226.882 378.932c28.35 85.716 26.013 84.921 34.254 88.658a14.933 14.933 0 0 0 6.186 1.342c5.706 0 11.16-3.274 13.67-8.809l36.813-81.19z" />
                    <g>
                    <path fill="$(fill);" fill-opacity="$(fill-opacity);" d="M467 121H247.043L210.234 10.268A15 15 0 0 0 196 0H45C20.187 0 0 20.187 0 45v301c0 24.813 20.187 45 45 45h165.297l36.509 110.438c2.017 6.468 7.999 10.566 14.329 10.566.035 0 .07-.004.105-.004h205.761c24.813 0 45-20.187 45-45V166C512 141.187 491.813 121 467 121zM45 361c-8.271 0-15-6.729-15-15V45c0-8.271 6.729-15 15-15h140.179l110.027 331H45zm247.729 30l-29.4 64.841L241.894 391zM482 467c0 8.271-6.729 15-15 15H284.408l45.253-99.806a15.099 15.099 0 0 0 .571-10.932L257.015 151H467c8.271 0 15 6.729 15 15z" />
                    <path fill="$(fill);" fill-opacity="$(fill-opacity);" d="M444.075 241h-45v-15c0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15v15h-45c-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15h87.14c-4.772 14.185-15.02 30.996-26.939 47.174a323.331 323.331 0 0 1-7.547-10.609c-4.659-6.851-13.988-8.628-20.838-3.969-6.85 4.658-8.627 13.988-3.969 20.839 4.208 6.189 8.62 12.211 13.017 17.919-7.496 8.694-14.885 16.57-21.369 22.94-5.913 5.802-6.003 15.299-.2 21.212 5.777 5.889 15.273 6.027 21.211.201.517-.508 8.698-8.566 19.624-20.937 10.663 12.2 18.645 20.218 19.264 20.837 5.855 5.855 15.35 5.858 21.208.002 5.858-5.855 5.861-15.352.007-21.212-.157-.157-9.34-9.392-21.059-23.059 21.233-27.448 34.18-51.357 38.663-71.338h1.786c8.284 0 15-6.716 15-15 0-8.284-6.715-15-14.999-15z" />
                    </g>
                </svg>
                `;
        let svg64;

        if (pageLanguageState === "translated" && twpConfig.get("popupBlueWhenSiteIsTranslated") === "yes") {
          svg64 = svgXml.replace(/\$\(fill\-opacity\)\;/g, "1.0");
          svg64 = btoa(svg64.replace(/\$\(fill\)\;/g, "#45a1ff"));
        } else {
          svg64 = svgXml.replace(/\$\(fill\-opacity\)\;/g, "0.5");

          if (themeColorPopupText) {
            svg64 = btoa(svg64.replace(/\$\(fill\)\;/g, themeColorPopupText));
          } else if (darkMode) {
            svg64 = btoa(svg64.replace(/\$\(fill\)\;/g, "white"));
          } else {
            svg64 = btoa(svg64.replace(/\$\(fill\)\;/g, "black"));
          }
        }

        const b64Start = 'data:image/svg+xml;base64,';
        return b64Start + svg64;
      }

      function updateIcon(tabId) {
        resetPageAction(tabId);
        chrome.pageAction.setIcon({
          tabId: tabId,
          path: getSVGIcon()
        });

        if (twpConfig.get("showButtonInTheAddressBar") == "no") {
          chrome.pageAction.hide(tabId);
        } else {
          chrome.pageAction.show(tabId);
        }
      }

      function updateIconInAllTabs() {
        chrome.tabs.query({}, tabs => tabs.forEach(tab => updateIcon(tab.id)));
      }

      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status == "loading") {
          pageLanguageState = "original";
          updateIcon(tabId);
        }
      });
      chrome.tabs.onActivated.addListener(activeInfo => {
        pageLanguageState = "original";
        updateIcon(activeInfo.tabId);
        chrome.tabs.sendMessage(activeInfo.tabId, {
          action: "getCurrentPageLanguageState"
        }, {
          frameId: 0
        }, _pageLanguageState => {
          checkedLastError();

          if (_pageLanguageState) {
            pageLanguageState = _pageLanguageState;
            updateIcon(activeInfo.tabId);
          }
        });
      });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "setPageLanguageState") {
          pageLanguageState = request.pageLanguageState;
          updateIcon(sender.tab.id);
        }
      });
      twpConfig.onChanged((name, newvalue) => {
        switch (name) {
          case "useOldPopup":
            updateIconInAllTabs();
            break;

          case "showButtonInTheAddressBar":
            updateIconInAllTabs();
            break;
        }
      });
    }
  }
});

if (typeof chrome.commands !== "undefined") {
  chrome.commands.onCommand.addListener(command => {
    if (command === "hotkey-toggle-translation") {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggle-translation"
        }, checkedLastError);
      });
    } else if (command === "hotkey-translate-selected-text") {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, tabs => chrome.tabs.sendMessage(tabs[0].id, {
        action: "TranslateSelectedText"
      }, checkedLastError));
    } else if (command === "hotkey-swap-page-translation-service") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => chrome.tabs.sendMessage(tabs[0].id, {
        action: "swapTranslationService"
      }, checkedLastError));
      let currentPageTranslatorService = twpConfig.get("pageTranslatorService");

      if (currentPageTranslatorService === "google") {
        currentPageTranslatorService = "yandex";
      } else {
        currentPageTranslatorService = "google";
      }

      twpConfig.set("pageTranslatorService", currentPageTranslatorService);
    } else if (command === "hotkey-show-original") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => chrome.tabs.sendMessage(tabs[0].id, {
        action: "translatePage",
        targetLanguage: "original"
      }, checkedLastError));
    } else if (command === "hotkey-translate-page-1") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        twpConfig.setTargetLanguage(twpConfig.get("targetLanguages")[0]);
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "translatePage",
          targetLanguage: twpConfig.get("targetLanguages")[0]
        }, checkedLastError);
      });
    } else if (command === "hotkey-translate-page-2") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        twpConfig.setTargetLanguage(twpConfig.get("targetLanguages")[1]);
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "translatePage",
          targetLanguage: twpConfig.get("targetLanguages")[1]
        }, checkedLastError);
      });
    } else if (command === "hotkey-translate-page-3") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        twpConfig.setTargetLanguage(twpConfig.get("targetLanguages")[2]);
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "translatePage",
          targetLanguage: twpConfig.get("targetLanguages")[2]
        }, checkedLastError);
      });
    } else if (command === "hotkey-hot-translate-selected-text") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "hotTranslateSelectedText"
        }, checkedLastError);
      });
    }
  });
}

twpConfig.onReady(async () => {
  updateContextMenu();
  updateTranslateSelectedContextMenu();
  twpConfig.onChanged((name, newvalue) => {
    if (name === "showTranslateSelectedContextMenu") {
      updateTranslateSelectedContextMenu();
    }
  });

  if (!twpConfig.get("installDateTime")) {
    twpConfig.set("installDateTime", Date.now());
  }
});
twpConfig.onReady(async () => {
  let activeTabTranslationInfo = {};

  function tabsOnActivated(activeInfo) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      activeTabTranslationInfo = {
        tabId: tabs[0].id,
        pageLanguageState: "original",
        url: tabs[0].url
      };
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "getCurrentPageLanguageState"
      }, {
        frameId: 0
      }, pageLanguageState => {
        activeTabTranslationInfo = {
          tabId: tabs[0].id,
          pageLanguageState,
          url: tabs[0].url
        };
      });
    });
  }

  let sitesToAutoTranslate = {};

  function tabsOnRemoved(tabId) {
    delete sitesToAutoTranslate[tabId];
  }

  function runtimeOnMessage(request, sender, sendResponse) {
    if (request.action === "setPageLanguageState") {
      if (sender.tab.active) {
        activeTabTranslationInfo = {
          tabId: sender.tab.id,
          pageLanguageState: request.pageLanguageState,
          url: sender.tab.url
        };
      }
    }
  }

  function webNavigationOnCommitted(details) {
    if (details.transitionType === "link" && details.frameId === 0 && activeTabTranslationInfo.pageLanguageState === "translated" && new URL(activeTabTranslationInfo.url).host === new URL(details.url).host) {
      sitesToAutoTranslate[details.tabId] = new URL(details.url).host;
    } else {
      delete sitesToAutoTranslate[details.tabId];
    }
  }

  function webNavigationOnDOMContentLoaded(details) {
    if (details.frameId === 0) {
      const host = new URL(details.url).host;

      if (sitesToAutoTranslate[details.tabId] === host) {
        setTimeout(() => chrome.tabs.sendMessage(details.tabId, {
          action: "autoTranslateBecauseClickedALink"
        }, {
          frameId: 0
        }), 700);
      }

      delete sitesToAutoTranslate[details.tabId];
    }
  }

  function enableTranslationOnClickingALink() {
    disableTranslationOnClickingALink();
    if (!chrome.webNavigation) return;
    chrome.tabs.onActivated.addListener(tabsOnActivated);
    chrome.tabs.onRemoved.addListener(tabsOnRemoved);
    chrome.runtime.onMessage.addListener(runtimeOnMessage);
    chrome.webNavigation.onCommitted.addListener(webNavigationOnCommitted);
    chrome.webNavigation.onDOMContentLoaded.addListener(webNavigationOnDOMContentLoaded);
  }

  function disableTranslationOnClickingALink() {
    activeTabTranslationInfo = {};
    sitesToAutoTranslate = {};
    chrome.tabs.onActivated.removeListener(tabsOnActivated);
    chrome.tabs.onRemoved.removeListener(tabsOnRemoved);
    chrome.runtime.onMessage.removeListener(runtimeOnMessage);

    if (chrome.webNavigation) {
      chrome.webNavigation.onCommitted.removeListener(webNavigationOnCommitted);
      chrome.webNavigation.onDOMContentLoaded.removeListener(webNavigationOnDOMContentLoaded);
    } else {
      console.info("No webNavigation permission");
    }
  }

  twpConfig.onChanged((name, newvalue) => {
    if (name === "autoTranslateWhenClickingALink") {
      if (newvalue == "yes") {
        enableTranslationOnClickingALink();
      } else {
        disableTranslationOnClickingALink();
      }
    }
  });
  chrome.permissions.onRemoved.addListener(permissions => {
    if (permissions.permissions.indexOf("webNavigation") !== -1) {
      twpConfig.set("autoTranslateWhenClickingALink", "no");
    }
  });
  chrome.permissions.contains({
    permissions: ["webNavigation"]
  }, hasPermissions => {
    if (hasPermissions && twpConfig.get("autoTranslateWhenClickingALink") === "yes") {
      enableTranslationOnClickingALink();
    } else {
      twpConfig.set("autoTranslateWhenClickingALink", "no");
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm5hbWVzIjpbImNoZWNrZWRMYXN0RXJyb3IiLCJjaHJvbWUiLCJydW50aW1lIiwibGFzdEVycm9yIiwidGFiVG9NaW1lVHlwZSIsIndlYlJlcXVlc3QiLCJvbkhlYWRlcnNSZWNlaXZlZCIsImFkZExpc3RlbmVyIiwiZGV0YWlscyIsInRhYklkIiwiY29udGVudFR5cGVIZWFkZXIiLCJoZWFkZXIiLCJyZXNwb25zZUhlYWRlcnMiLCJuYW1lIiwidG9Mb3dlckNhc2UiLCJ2YWx1ZSIsInNwbGl0IiwidXJscyIsInR5cGVzIiwib25NZXNzYWdlIiwicmVxdWVzdCIsInNlbmRlciIsInNlbmRSZXNwb25zZSIsImFjdGlvbiIsInRhYnMiLCJzZW5kTWVzc2FnZSIsInRhYiIsImlkIiwiZnJhbWVJZCIsInBhZ2VMYW5ndWFnZVN0YXRlIiwidGFiTGFuZ3VhZ2UiLCJ1cGRhdGVDb250ZXh0TWVudSIsImNyZWF0ZSIsInVybCIsImdldFVSTCIsImRldGVjdExhbmd1YWdlIiwicmVzdWx0IiwiZSIsImNvbnNvbGUiLCJlcnJvciIsIlVSTCIsImhvc3RuYW1lIiwicXVlcnkiLCJhY3RpdmUiLCJjdXJyZW50V2luZG93IiwidXBkYXRlVHJhbnNsYXRlU2VsZWN0ZWRDb250ZXh0TWVudSIsImNvbnRleHRNZW51cyIsInJlbW92ZSIsInR3cENvbmZpZyIsImdldCIsInRpdGxlIiwiaTE4biIsImdldE1lc3NhZ2UiLCJjb250ZXh0cyIsImNvbnRleHRNZW51VGl0bGUiLCJ0YXJnZXRMYW5ndWFnZSIsInR3cExhbmciLCJjb2RlVG9MYW5ndWFnZSIsIm9uSW5zdGFsbGVkIiwicmVhc29uIiwiZ2V0TWFuaWZlc3QiLCJ2ZXJzaW9uIiwicHJldmlvdXNWZXJzaW9uIiwib25SZWFkeSIsInBsYXRmb3JtSW5mbyIsImlzTW9iaWxlIiwiYW55IiwibGFzdFRpbWVTaG93aW5nUmVsZWFzZU5vdGVzIiwic2hvd1JlbGVhc2VOb3RlcyIsImRhdGUiLCJEYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJnZXRUaW1lIiwibm93Iiwic2V0IiwidHJhbnNsYXRpb25DYWNoZSIsImRlbGV0ZVRyYW5zbGF0aW9uQ2FjaGUiLCJyZXNldFBhZ2VBY3Rpb24iLCJmb3JjZVNob3ciLCJwYWdlQWN0aW9uIiwic2V0UG9wdXAiLCJwb3B1cCIsInJlc2V0QnJvd3NlckFjdGlvbiIsImJyb3dzZXJBY3Rpb24iLCJ0YWJIYXNDb250ZW50U2NyaXB0Iiwib25DbGlja2VkIiwiaW5mbyIsIm1lbnVJdGVtSWQiLCJvcGVuUG9wdXAiLCJpc0luUmVhZGVyTW9kZSIsImVuY29kZVVSSUNvbXBvbmVudCIsInNlbGVjdGlvblRleHQiLCJhZGRTaXRlVG9OZXZlclRyYW5zbGF0ZSIsIm1pbWVUeXBlIiwib25BY3RpdmF0ZWQiLCJhY3RpdmVJbmZvIiwib25VcGRhdGVkIiwiY2hhbmdlSW5mbyIsInN0YXR1cyIsInJlc3BvbnNlIiwib25SZW1vdmVkIiwicmVtb3ZlSW5mbyIsImZvckVhY2giLCJoaWRlIiwib25DaGFuZ2VkIiwibmV3dmFsdWUiLCJicm93c2VyIiwidGhlbWVDb2xvclBvcHVwVGV4dCIsInRoZW1lIiwiZ2V0Q3VycmVudCIsInRoZW4iLCJjb2xvcnMiLCJ0b29sYmFyX2ZpZWxkX3RleHQiLCJwb3B1cF90ZXh0IiwidXBkYXRlSWNvbkluQWxsVGFicyIsInVwZGF0ZUluZm8iLCJkYXJrTW9kZSIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImdldFNWR0ljb24iLCJzdmdYbWwiLCJzdmc2NCIsInJlcGxhY2UiLCJidG9hIiwiYjY0U3RhcnQiLCJ1cGRhdGVJY29uIiwic2V0SWNvbiIsInBhdGgiLCJzaG93IiwiX3BhZ2VMYW5ndWFnZVN0YXRlIiwiY29tbWFuZHMiLCJvbkNvbW1hbmQiLCJjb21tYW5kIiwiY3VycmVudFBhZ2VUcmFuc2xhdG9yU2VydmljZSIsInNldFRhcmdldExhbmd1YWdlIiwiYWN0aXZlVGFiVHJhbnNsYXRpb25JbmZvIiwidGFic09uQWN0aXZhdGVkIiwic2l0ZXNUb0F1dG9UcmFuc2xhdGUiLCJ0YWJzT25SZW1vdmVkIiwicnVudGltZU9uTWVzc2FnZSIsIndlYk5hdmlnYXRpb25PbkNvbW1pdHRlZCIsInRyYW5zaXRpb25UeXBlIiwiaG9zdCIsIndlYk5hdmlnYXRpb25PbkRPTUNvbnRlbnRMb2FkZWQiLCJzZXRUaW1lb3V0IiwiZW5hYmxlVHJhbnNsYXRpb25PbkNsaWNraW5nQUxpbmsiLCJkaXNhYmxlVHJhbnNsYXRpb25PbkNsaWNraW5nQUxpbmsiLCJ3ZWJOYXZpZ2F0aW9uIiwib25Db21taXR0ZWQiLCJvbkRPTUNvbnRlbnRMb2FkZWQiLCJyZW1vdmVMaXN0ZW5lciIsInBlcm1pc3Npb25zIiwiaW5kZXhPZiIsImNvbnRhaW5zIiwiaGFzUGVybWlzc2lvbnMiXSwic291cmNlcyI6WyJiYWNrZ3JvdW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLy8gQXZvaWQgb3V0cHV0dGluZyB0aGUgZXJyb3IgbWVzc2FnZSBcIlJlY2VpdmluZyBlbmQgZG9lcyBub3QgZXhpc3RcIiBpbiB0aGUgQ29uc29sZS5cclxuZnVuY3Rpb24gY2hlY2tlZExhc3RFcnJvcigpIHtcclxuICAgIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvclxyXG59XHJcblxyXG4vLyBnZXQgbWltZXR5cGVcclxudmFyIHRhYlRvTWltZVR5cGUgPSB7fVxyXG5jaHJvbWUud2ViUmVxdWVzdC5vbkhlYWRlcnNSZWNlaXZlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbihkZXRhaWxzKSB7XHJcbiAgICBpZiAoZGV0YWlscy50YWJJZCAhPT0gLTEpIHtcclxuICAgICAgICBsZXQgY29udGVudFR5cGVIZWFkZXIgPSBudWxsXHJcbiAgICAgICAgZm9yIChjb25zdCBoZWFkZXIgb2YgZGV0YWlscy5yZXNwb25zZUhlYWRlcnMpIHtcclxuICAgICAgICAgICAgaWYgKGhlYWRlci5uYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50VHlwZUhlYWRlciA9IGhlYWRlclxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0YWJUb01pbWVUeXBlW2RldGFpbHMudGFiSWRdID0gY29udGVudFR5cGVIZWFkZXIgJiYgY29udGVudFR5cGVIZWFkZXIudmFsdWUuc3BsaXQoJzsnLCAxKVswXVxyXG4gICAgfVxyXG59LCB7XHJcbiAgICB1cmxzOiBbJyo6Ly8qLyonXSxcclxuICAgIHR5cGVzOiBbJ21haW5fZnJhbWUnXVxyXG59LCBbJ3Jlc3BvbnNlSGVhZGVycyddKTtcclxuXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRNYWluRnJhbWVQYWdlTGFuZ3VhZ2VTdGF0ZVwiKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2Uoc2VuZGVyLnRhYi5pZCwge1xyXG4gICAgICAgICAgICBhY3Rpb246IFwiZ2V0Q3VycmVudFBhZ2VMYW5ndWFnZVN0YXRlXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGZyYW1lSWQ6IDBcclxuICAgICAgICB9LCBwYWdlTGFuZ3VhZ2VTdGF0ZSA9PiB7XHJcbiAgICAgICAgICAgIGNoZWNrZWRMYXN0RXJyb3IoKVxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UocGFnZUxhbmd1YWdlU3RhdGUpXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiZ2V0TWFpbkZyYW1lVGFiTGFuZ3VhZ2VcIikge1xyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHNlbmRlci50YWIuaWQsIHtcclxuICAgICAgICAgICAgYWN0aW9uOiBcImdldE9yaWdpbmFsVGFiTGFuZ3VhZ2VcIlxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgZnJhbWVJZDogMFxyXG4gICAgICAgIH0sIHRhYkxhbmd1YWdlID0+IHtcclxuICAgICAgICAgICAgY2hlY2tlZExhc3RFcnJvcigpXHJcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh0YWJMYW5ndWFnZSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJzZXRQYWdlTGFuZ3VhZ2VTdGF0ZVwiKSB7XHJcbiAgICAgICAgdXBkYXRlQ29udGV4dE1lbnUocmVxdWVzdC5wYWdlTGFuZ3VhZ2VTdGF0ZSlcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwib3Blbk9wdGlvbnNQYWdlXCIpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe1xyXG4gICAgICAgICAgICB1cmw6IGNocm9tZS5ydW50aW1lLmdldFVSTChcIi9vcHRpb25zL29wdGlvbnMuaHRtbFwiKVxyXG4gICAgICAgIH0pXHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcIm9wZW5Eb25hdGlvblBhZ2VcIikge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiL29wdGlvbnMvb3B0aW9ucy5odG1sI2RvbmF0aW9uXCIpXHJcbiAgICAgICAgfSlcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiZGV0ZWN0VGFiTGFuZ3VhZ2VcIikge1xyXG4gICAgICAgIGlmICghc2VuZGVyLnRhYikge1xyXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vRmlsaXBlUFMvVHJhZHV6aXItcGFnaW5hcy13ZWIvaXNzdWVzLzQ3OFxyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoXCJ1bmRcIilcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLmRldGVjdExhbmd1YWdlKHNlbmRlci50YWIuaWQsIHJlc3VsdCA9PiBzZW5kUmVzcG9uc2UocmVzdWx0KSlcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcclxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKFwidW5kXCIpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRUYWJIb3N0TmFtZVwiKSB7XHJcbiAgICAgICAgc2VuZFJlc3BvbnNlKG5ldyBVUkwoc2VuZGVyLnRhYi51cmwpLmhvc3RuYW1lKVxyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJ0aGlzRnJhbWVJc0luRm9jdXNcIikge1xyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHNlbmRlci50YWIuaWQsIHthY3Rpb246IFwiYW5vdGhlckZyYW1lSXNJbkZvY3VzXCJ9LCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRUYWJNaW1lVHlwZVwiKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UodGFiVG9NaW1lVHlwZVt0YWJzWzBdLmlkXSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbn0pXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVUcmFuc2xhdGVTZWxlY3RlZENvbnRleHRNZW51KCkge1xyXG4gICAgaWYgKHR5cGVvZiBjaHJvbWUuY29udGV4dE1lbnVzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5yZW1vdmUoXCJ0cmFuc2xhdGUtc2VsZWN0ZWQtdGV4dFwiLCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgICAgIGlmICh0d3BDb25maWcuZ2V0KFwic2hvd1RyYW5zbGF0ZVNlbGVjdGVkQ29udGV4dE1lbnVcIikgPT09IFwieWVzXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgaWQ6IFwidHJhbnNsYXRlLXNlbGVjdGVkLXRleHRcIixcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBjaHJvbWUuaTE4bi5nZXRNZXNzYWdlKFwibXNnVHJhbnNsYXRlU2VsZWN0ZWRUZXh0XCIpLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dHM6IFtcInNlbGVjdGlvblwiXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ29udGV4dE1lbnUocGFnZUxhbmd1YWdlU3RhdGUgPSBcIm9yaWdpbmFsXCIpIHtcclxuICAgIGxldCBjb250ZXh0TWVudVRpdGxlXHJcbiAgICBpZiAocGFnZUxhbmd1YWdlU3RhdGUgPT09IFwidHJhbnNsYXRlZFwiKSB7XHJcbiAgICAgICAgY29udGV4dE1lbnVUaXRsZSA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJidG5SZXN0b3JlXCIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldExhbmd1YWdlID0gdHdwQ29uZmlnLmdldChcInRhcmdldExhbmd1YWdlXCIpXHJcbiAgICAgICAgY29udGV4dE1lbnVUaXRsZSA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJtc2dUcmFuc2xhdGVGb3JcIiwgdHdwTGFuZy5jb2RlVG9MYW5ndWFnZSh0YXJnZXRMYW5ndWFnZSkpXHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGNocm9tZS5jb250ZXh0TWVudXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBjaHJvbWUuY29udGV4dE1lbnVzLnJlbW92ZShcInRyYW5zbGF0ZS13ZWItcGFnZVwiLCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgICAgIGlmICh0d3BDb25maWcuZ2V0KFwic2hvd1RyYW5zbGF0ZVBhZ2VDb250ZXh0TWVudVwiKSA9PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIGlkOiBcInRyYW5zbGF0ZS13ZWItcGFnZVwiLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6IGNvbnRleHRNZW51VGl0bGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0czogW1wicGFnZVwiLCBcImZyYW1lXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihkZXRhaWxzID0+IHtcclxuICAgIGlmIChkZXRhaWxzLnJlYXNvbiA9PSBcImluc3RhbGxcIikge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiL29wdGlvbnMvb3B0aW9ucy5odG1sXCIpXHJcbiAgICAgICAgfSlcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlscy5yZWFzb24gPT0gXCJ1cGRhdGVcIiAmJiBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24gIT0gZGV0YWlscy5wcmV2aW91c1ZlcnNpb24pIHtcclxuICAgICAgICB0d3BDb25maWcub25SZWFkeShhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwbGF0Zm9ybUluZm8uaXNNb2JpbGUuYW55KSByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICh0d3BDb25maWcuZ2V0KFwic2hvd1JlbGVhc2VOb3Rlc1wiKSAhPT0gXCJ5ZXNcIikgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxhc3RUaW1lU2hvd2luZ1JlbGVhc2VOb3RlcyA9IHR3cENvbmZpZy5nZXQoXCJsYXN0VGltZVNob3dpbmdSZWxlYXNlTm90ZXNcIilcclxuICAgICAgICAgICAgbGV0IHNob3dSZWxlYXNlTm90ZXMgPSBmYWxzZVxyXG4gICAgICAgICAgICBpZiAobGFzdFRpbWVTaG93aW5nUmVsZWFzZU5vdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIDIxKVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUuZ2V0VGltZSgpID4gbGFzdFRpbWVTaG93aW5nUmVsZWFzZU5vdGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvd1JlbGVhc2VOb3RlcyA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VGltZVNob3dpbmdSZWxlYXNlTm90ZXMgPSBEYXRlLm5vdygpXHJcbiAgICAgICAgICAgICAgICAgICAgdHdwQ29uZmlnLnNldChcImxhc3RUaW1lU2hvd2luZ1JlbGVhc2VOb3Rlc1wiLCBsYXN0VGltZVNob3dpbmdSZWxlYXNlTm90ZXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93UmVsZWFzZU5vdGVzID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgbGFzdFRpbWVTaG93aW5nUmVsZWFzZU5vdGVzID0gRGF0ZS5ub3coKVxyXG4gICAgICAgICAgICAgICAgdHdwQ29uZmlnLnNldChcImxhc3RUaW1lU2hvd2luZ1JlbGVhc2VOb3Rlc1wiLCBsYXN0VGltZVNob3dpbmdSZWxlYXNlTm90ZXMpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzaG93UmVsZWFzZU5vdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiL29wdGlvbnMvb3B0aW9ucy5odG1sI3JlbGVhc2Vfbm90ZXNcIilcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbkNhY2hlLmRlbGV0ZVRyYW5zbGF0aW9uQ2FjaGUoKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgdHdwQ29uZmlnLm9uUmVhZHkoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGlmIChwbGF0Zm9ybUluZm8uaXNNb2JpbGUuYW55KSB7XHJcbiAgICAgICAgICAgIHR3cENvbmZpZy5zZXQoXCJlbmFibGVEZWVwTFwiLCBcIm5vXCIpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSlcclxuXHJcbmZ1bmN0aW9uIHJlc2V0UGFnZUFjdGlvbih0YWJJZCwgZm9yY2VTaG93ID0gZmFsc2UpIHtcclxuICAgIGlmICh0d3BDb25maWcuZ2V0KFwidHJhbnNsYXRlQ2xpY2tpbmdPbmNlXCIpID09PSBcInllc1wiICYmICFmb3JjZVNob3cpIHtcclxuICAgICAgICBjaHJvbWUucGFnZUFjdGlvbi5zZXRQb3B1cCh7XHJcbiAgICAgICAgICAgIHBvcHVwOiBudWxsLFxyXG4gICAgICAgICAgICB0YWJJZFxyXG4gICAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICh0d3BDb25maWcuZ2V0KFwidXNlT2xkUG9wdXBcIikgPT09IFwieWVzXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnBhZ2VBY3Rpb24uc2V0UG9wdXAoe1xyXG4gICAgICAgICAgICAgICAgcG9wdXA6IFwicG9wdXAvb2xkLXBvcHVwLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIHRhYklkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2hyb21lLnBhZ2VBY3Rpb24uc2V0UG9wdXAoe1xyXG4gICAgICAgICAgICAgICAgcG9wdXA6IFwicG9wdXAvcG9wdXAuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgdGFiSWRcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0QnJvd3NlckFjdGlvbihmb3JjZVNob3cgPSBmYWxzZSkge1xyXG4gICAgaWYgKHR3cENvbmZpZy5nZXQoXCJ0cmFuc2xhdGVDbGlja2luZ09uY2VcIikgPT09IFwieWVzXCIgJiYgIWZvcmNlU2hvdykge1xyXG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtcclxuICAgICAgICAgICAgcG9wdXA6IG51bGxcclxuICAgICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodHdwQ29uZmlnLmdldChcInVzZU9sZFBvcHVwXCIpID09PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtcclxuICAgICAgICAgICAgICAgIHBvcHVwOiBcInBvcHVwL29sZC1wb3B1cC5odG1sXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCh7XHJcbiAgICAgICAgICAgICAgICBwb3B1cDogXCJwb3B1cC9wb3B1cC5odG1sXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmlmICh0eXBlb2YgY2hyb21lLmNvbnRleHRNZW51cyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgIGlkOiBcImJyb3dzZXJBY3Rpb24tc2hvd1BvcHVwXCIsXHJcbiAgICAgICAgdGl0bGU6IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJidG5TaG93UG9wdXBcIiksXHJcbiAgICAgICAgY29udGV4dHM6IFtcImJyb3dzZXJfYWN0aW9uXCJdXHJcbiAgICB9KVxyXG4gICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgIGlkOiBcInBhZ2VBY3Rpb24tc2hvd1BvcHVwXCIsXHJcbiAgICAgICAgdGl0bGU6IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJidG5TaG93UG9wdXBcIiksXHJcbiAgICAgICAgY29udGV4dHM6IFtcInBhZ2VfYWN0aW9uXCJdXHJcbiAgICB9KVxyXG4gICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgIGlkOiBcIm5ldmVyLXRyYW5zbGF0ZVwiLFxyXG4gICAgICAgIHRpdGxlOiBjaHJvbWUuaTE4bi5nZXRNZXNzYWdlKFwiYnRuTmV2ZXJUcmFuc2xhdGVcIiksXHJcbiAgICAgICAgY29udGV4dHM6IFtcImJyb3dzZXJfYWN0aW9uXCIsIFwicGFnZV9hY3Rpb25cIl1cclxuICAgIH0pXHJcbiAgICBjaHJvbWUuY29udGV4dE1lbnVzLmNyZWF0ZSh7XHJcbiAgICAgICAgaWQ6IFwibW9yZS1vcHRpb25zXCIsXHJcbiAgICAgICAgdGl0bGU6IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJidG5Nb3JlT3B0aW9uc1wiKSxcclxuICAgICAgICBjb250ZXh0czogW1wiYnJvd3Nlcl9hY3Rpb25cIiwgXCJwYWdlX2FjdGlvblwiXVxyXG4gICAgfSlcclxuICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcclxuICAgICAgICBpZDogXCJicm93c2VyQWN0aW9uLXBkZi10by1odG1sXCIsXHJcbiAgICAgICAgdGl0bGU6IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoXCJtc2dQREZ0b0hUTUxcIiksXHJcbiAgICAgICAgY29udGV4dHM6IFtcImJyb3dzZXJfYWN0aW9uXCJdXHJcbiAgICB9KVxyXG4gICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgIGlkOiBcInBhZ2VBY3Rpb24tcGRmLXRvLWh0bWxcIixcclxuICAgICAgICB0aXRsZTogY2hyb21lLmkxOG4uZ2V0TWVzc2FnZShcIm1zZ1BERnRvSFRNTFwiKSxcclxuICAgICAgICBjb250ZXh0czogW1wicGFnZV9hY3Rpb25cIl1cclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgdGFiSGFzQ29udGVudFNjcmlwdCA9IHt9XHJcblxyXG4gICAgY2hyb21lLmNvbnRleHRNZW51cy5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoKGluZm8sIHRhYikgPT4ge1xyXG4gICAgICAgIGlmIChpbmZvLm1lbnVJdGVtSWQgPT0gXCJ0cmFuc2xhdGUtd2ViLXBhZ2VcIikge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ0b2dnbGUtdHJhbnNsYXRpb25cIlxyXG4gICAgICAgICAgICB9LCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09IFwidHJhbnNsYXRlLXNlbGVjdGVkLXRleHRcIikge1xyXG4gICAgICAgICAgICBpZiAoY2hyb21lLnBhZ2VBY3Rpb24gJiYgY2hyb21lLnBhZ2VBY3Rpb24ub3BlblBvcHVwICYmICghdGFiSGFzQ29udGVudFNjcmlwdFt0YWIuaWRdIHx8IHRhYi5pc0luUmVhZGVyTW9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLnNldFBvcHVwKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3B1cDogXCJwb3B1cC9wb3B1cC10cmFuc2xhdGUtdGV4dC5odG1sI3RleHQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoaW5mby5zZWxlY3Rpb25UZXh0KSxcclxuICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFiLmlkXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnBhZ2VBY3Rpb24ub3BlblBvcHVwKClcclxuXHJcbiAgICAgICAgICAgICAgICByZXNldFBhZ2VBY3Rpb24odGFiLmlkKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gYSBtZXJkYSBkbyBjaHJvbWUgbsOjbyBzdXBvcnRlIG9wZW5Qb3B1cFxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcIlRyYW5zbGF0ZVNlbGVjdGVkVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvblRleHQ6IGluZm8uc2VsZWN0aW9uVGV4dFxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09IFwiYnJvd3NlckFjdGlvbi1zaG93UG9wdXBcIikge1xyXG4gICAgICAgICAgICByZXNldEJyb3dzZXJBY3Rpb24odHJ1ZSlcclxuXHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLm9wZW5Qb3B1cCgpXHJcblxyXG4gICAgICAgICAgICByZXNldEJyb3dzZXJBY3Rpb24oKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09IFwicGFnZUFjdGlvbi1zaG93UG9wdXBcIikge1xyXG4gICAgICAgICAgICByZXNldFBhZ2VBY3Rpb24odGFiLmlkLCB0cnVlKVxyXG5cclxuICAgICAgICAgICAgY2hyb21lLnBhZ2VBY3Rpb24ub3BlblBvcHVwKClcclxuXHJcbiAgICAgICAgICAgIHJlc2V0UGFnZUFjdGlvbih0YWIuaWQpXHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvLm1lbnVJdGVtSWQgPT0gXCJuZXZlci10cmFuc2xhdGVcIikge1xyXG4gICAgICAgICAgICBjb25zdCBob3N0bmFtZSA9IG5ldyBVUkwodGFiLnVybCkuaG9zdG5hbWVcclxuICAgICAgICAgICAgdHdwQ29uZmlnLmFkZFNpdGVUb05ldmVyVHJhbnNsYXRlKGhvc3RuYW1lKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09IFwibW9yZS1vcHRpb25zXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiL29wdGlvbnMvb3B0aW9ucy5odG1sXCIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvLm1lbnVJdGVtSWQgPT0gXCJicm93c2VyQWN0aW9uLXBkZi10by1odG1sXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgbWltZVR5cGUgPSB0YWJUb01pbWVUeXBlW3RhYi5pZF1cclxuICAgICAgICAgICAgaWYgKG1pbWVUeXBlICYmIG1pbWVUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwiYXBwbGljYXRpb24vcGRmXCIgJiYgdHlwZW9mIGNocm9tZS5icm93c2VyQWN0aW9uLm9wZW5Qb3B1cCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLm9wZW5Qb3B1cCgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3RyYW5zbGF0ZXdlYnBhZ2VzLm9yZy9cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09IFwicGFnZUFjdGlvbi1wZGYtdG8taHRtbFwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1pbWVUeXBlID0gdGFiVG9NaW1lVHlwZVt0YWIuaWRdXHJcbiAgICAgICAgICAgIGlmIChtaW1lVHlwZSAmJiBtaW1lVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcImFwcGxpY2F0aW9uL3BkZlwiICYmIHR5cGVvZiBjaHJvbWUucGFnZUFjdGlvbi5vcGVuUG9wdXAgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUucGFnZUFjdGlvbi5vcGVuUG9wdXAoKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly90cmFuc2xhdGV3ZWJwYWdlcy5vcmcvXCJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZUluZm8gPT4ge1xyXG4gICAgICAgIHR3cENvbmZpZy5vblJlYWR5KCgpID0+IHVwZGF0ZUNvbnRleHRNZW51KCkpXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlSW5mby50YWJJZCwge1xyXG4gICAgICAgICAgICBhY3Rpb246IFwiZ2V0Q3VycmVudFBhZ2VMYW5ndWFnZVN0YXRlXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGZyYW1lSWQ6IDBcclxuICAgICAgICB9LCBwYWdlTGFuZ3VhZ2VTdGF0ZSA9PiB7XHJcbiAgICAgICAgICAgIGNoZWNrZWRMYXN0RXJyb3IoKVxyXG4gICAgICAgICAgICBpZiAocGFnZUxhbmd1YWdlU3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHR3cENvbmZpZy5vblJlYWR5KCgpID0+IHVwZGF0ZUNvbnRleHRNZW51KHBhZ2VMYW5ndWFnZVN0YXRlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgICAgIGlmICh0YWIuYWN0aXZlICYmIGNoYW5nZUluZm8uc3RhdHVzID09IFwibG9hZGluZ1wiKSB7XHJcbiAgICAgICAgICAgIHR3cENvbmZpZy5vblJlYWR5KCgpID0+IHVwZGF0ZUNvbnRleHRNZW51KCkpXHJcbiAgICAgICAgfSBlbHNlIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PSBcImNvbXBsZXRlXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjb250ZW50U2NyaXB0SXNJbmplY3RlZFwiXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGZyYW1lSWQ6IDBcclxuICAgICAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tlZExhc3RFcnJvcigpXHJcbiAgICAgICAgICAgICAgICB0YWJIYXNDb250ZW50U2NyaXB0W3RhYklkXSA9ICEhcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjaHJvbWUudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCByZW1vdmVJbmZvKSA9PiB7XHJcbiAgICAgICAgZGVsZXRlIHRhYkhhc0NvbnRlbnRTY3JpcHRbdGFiSWRdXHJcbiAgICB9KVxyXG5cclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCB0YWJzID0+XHJcbiAgICAgICAgdGFicy5mb3JFYWNoKHRhYiA9PlxyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJjb250ZW50U2NyaXB0SXNJbmplY3RlZFwiXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGZyYW1lSWQ6IDBcclxuICAgICAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tlZExhc3RFcnJvcigpXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJIYXNDb250ZW50U2NyaXB0W3RhYi5pZF0gPSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKSlcclxufVxyXG5cclxudHdwQ29uZmlnLm9uUmVhZHkoKCkgPT4ge1xyXG4gICAgaWYgKHBsYXRmb3JtSW5mby5pc01vYmlsZS5hbnkpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgdGFicyA9PiB0YWJzLmZvckVhY2godGFiID0+IGNocm9tZS5wYWdlQWN0aW9uLmhpZGUodGFiLmlkKSkpXHJcblxyXG4gICAgICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT0gXCJsb2FkaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLmhpZGUodGFiSWQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIodGFiID0+IHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7XHJcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwic2hvd1BvcHVwTW9iaWxlXCJcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZnJhbWVJZDogMFxyXG4gICAgICAgICAgICB9LCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChjaHJvbWUucGFnZUFjdGlvbikge1xyXG4gICAgICAgICAgICBjaHJvbWUucGFnZUFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIodGFiID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0d3BDb25maWcuZ2V0KFwidHJhbnNsYXRlQ2xpY2tpbmdPbmNlXCIpID09PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ0b2dnbGUtdHJhbnNsYXRpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgIH0sIGNoZWNrZWRMYXN0RXJyb3IpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIodGFiID0+IHtcclxuICAgICAgICAgICAgaWYgKHR3cENvbmZpZy5nZXQoXCJ0cmFuc2xhdGVDbGlja2luZ09uY2VcIikgPT09IFwieWVzXCIpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ0b2dnbGUtdHJhbnNsYXRpb25cIlxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHJlc2V0QnJvd3NlckFjdGlvbigpXHJcblxyXG4gICAgICAgIHR3cENvbmZpZy5vbkNoYW5nZWQoKG5hbWUsIG5ld3ZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInVzZU9sZFBvcHVwXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRCcm93c2VyQWN0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInRyYW5zbGF0ZUNsaWNraW5nT25jZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0QnJvd3NlckFjdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9LCB0YWJzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRQYWdlQWN0aW9uKHRhYnNbMF0uaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgaWYgKGNocm9tZS5wYWdlQWN0aW9uICYmIGJyb3dzZXIpIHtcclxuICAgICAgICAgICAgbGV0IHBhZ2VMYW5ndWFnZVN0YXRlID0gXCJvcmlnaW5hbFwiXHJcblxyXG4gICAgICAgICAgICBsZXQgdGhlbWVDb2xvclBvcHVwVGV4dCA9IG51bGxcclxuICAgICAgICAgICAgYnJvd3Nlci50aGVtZS5nZXRDdXJyZW50KCkudGhlbih0aGVtZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGVtZUNvbG9yUG9wdXBUZXh0ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoZW1lLmNvbG9ycyAmJiAodGhlbWUuY29sb3JzLnRvb2xiYXJfZmllbGRfdGV4dCB8fCB0aGVtZS5jb2xvcnMucG9wdXBfdGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGVtZUNvbG9yUG9wdXBUZXh0ID0gdGhlbWUuY29sb3JzLnRvb2xiYXJfZmllbGRfdGV4dCB8fCB0aGVtZS5jb2xvcnMucG9wdXBfdGV4dFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdXBkYXRlSWNvbkluQWxsVGFicygpXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjaHJvbWUudGhlbWUub25VcGRhdGVkLmFkZExpc3RlbmVyKHVwZGF0ZUluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhlbWVDb2xvclBvcHVwVGV4dCA9IG51bGxcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVJbmZvLnRoZW1lLmNvbG9ycyAmJiAodXBkYXRlSW5mby50aGVtZS5jb2xvcnMudG9vbGJhcl9maWVsZF90ZXh0IHx8IHVwZGF0ZUluZm8udGhlbWUuY29sb3JzLnBvcHVwX3RleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhlbWVDb2xvclBvcHVwVGV4dCA9IHVwZGF0ZUluZm8udGhlbWUuY29sb3JzLnRvb2xiYXJfZmllbGRfdGV4dCB8fCB1cGRhdGVJbmZvLnRoZW1lLmNvbG9ycy5wb3B1cF90ZXh0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVJY29uSW5BbGxUYWJzKClcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXJrTW9kZSA9IGZhbHNlXHJcbiAgICAgICAgICAgIGRhcmtNb2RlID0gbWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcztcclxuICAgICAgICAgICAgdXBkYXRlSWNvbkluQWxsVGFicygpXHJcblxyXG4gICAgICAgICAgICBtYXRjaE1lZGlhKFwiKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRhcmtNb2RlID0gbWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcztcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUljb25JbkFsbFRhYnMoKVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0U1ZHSWNvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN2Z1htbCA9IGA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDUxMiA1MTJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiJChmaWxsKTtcIiBmaWxsLW9wYWNpdHk9XCIkKGZpbGwtb3BhY2l0eSk7XCIgZD1cIk0gNDUgMCBDIDIwLjE4NiAwIDAgMjAuMTg2IDAgNDUgTCAwIDM0NyBDIDAgMzcxLjgxNCAyMC4xODYgMzkyIDQ1IDM5MiBMIDMwMSAzOTIgQyAzMDUuODE5IDM5MiAzMTAuMzQ2ODMgMzg5LjY4NTQ0IDMxMy4xNzM4MyAzODUuNzczNDQgQyAzMTUuOTg2ODMgMzgxLjg0NzQ0IDMxNi43NjI2MSAzNzYuODI0OTEgMzE1LjIyNDYxIDM3Mi4yNTM5MSBMIDE5NS4yMzgyOCAxMC4yNjk1MzEgQSAxNC45OTUgMTQuOTk1IDAgMCAwIDE4MSAwIEwgNDUgMCB6IE0gMTE0LjM0NTcgMTA3LjQ2Mjg5IEwgMTU2LjE5MzM2IDEwNy40NjI4OSBDIDE1OS40OTQ4OSAxMDcuNDYyODkgMTYyLjQxMzIyIDEwOS42MTM1OSAxNjMuMzkyNTggMTEyLjc2MzY3IEwgMTYzLjM4MjgxIDExMi43NzUzOSBMIDIxNC4wNjY0MSAyNzYuMjgzMiBDIDIxNC43NzMxNSAyNzguNTc1MDggMjE0LjM1OTEzIDI4MS4wNTk4NiAyMTIuOTM1NTUgMjgyLjk4ODI4IEMgMjExLjUyMjA2IDI4NC45MDY0OCAyMDkuMjc5ODkgMjg2LjA0Njg4IDIwNi44NzY5NSAyODYuMDQ2ODggTCAxNzkuMjg1MTYgMjg2LjA0Njg4IEMgMTc1Ljk1MzM1IDI4Ni4wNDY4NyAxNzMuMDE1NDYgMjgzLjg2NjI0IDE3Mi4wNjY0MSAyODAuNjc1NzggTCAxNTkuOTI5NjkgMjQwLjE4OTQ1IEwgMTA4Ljc3MTQ4IDI0MC4xODk0NSBMIDk3LjU2NDQ1MyAyODAuNTIzNDQgQyA5Ni42NTU3NzQgMjgzLjc3NDQ4IDkzLjY4ODkzNyAyODYuMDM3MTEgOTAuMzA2NjQxIDI4Ni4wMzcxMSBMIDY0LjM0NzY1NiAyODYuMDM3MTEgQyA2MS45NTQ4MDYgMjg2LjAzNzExIDU5LjcxNDYxIDI4NC45MDY0OCA1OC4yOTEwMTYgMjgyLjk4ODI4IEMgNTYuODY3NDIyIDI4MS4wNTk4NiA1Ni40NDIwMjEgMjc4LjU3NDc1IDU3LjEzODY3MiAyNzYuMjkyOTcgTCAxMDcuMTQ2NDggMTEyLjc5NDkyIEMgMTA4LjExNTcyIDEwOS42MjQ2NSAxMTEuMDM0MDcgMTA3LjQ2Mjg5IDExNC4zNDU3IDEwNy40NjI4OSB6IE0gMTMzLjM5NjQ4IDEzNy43MDExNyBMIDExNC41NTY2NCAyMTAuMDMxMjUgTCAxNTQuMDY0NDUgMjEwLjAzMTI1IEwgMTMzLjkxMjExIDEzNy43MDExNyBMIDEzMy4zOTY0OCAxMzcuNzAxMTcgeiBcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCIkKGZpbGwpO1wiIGZpbGwtb3BhY2l0eT1cIiQoZmlsbC1vcGFjaXR5KTtcIiBkPVwiTTIyNi44ODIgMzc4LjkzMmMyOC4zNSA4NS43MTYgMjYuMDEzIDg0LjkyMSAzNC4yNTQgODguNjU4YTE0LjkzMyAxNC45MzMgMCAwIDAgNi4xODYgMS4zNDJjNS43MDYgMCAxMS4xNi0zLjI3NCAxMy42Ny04LjgwOWwzNi44MTMtODEuMTl6XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8Zz5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiJChmaWxsKTtcIiBmaWxsLW9wYWNpdHk9XCIkKGZpbGwtb3BhY2l0eSk7XCIgZD1cIk00NjcgMTIxSDI0Ny4wNDNMMjEwLjIzNCAxMC4yNjhBMTUgMTUgMCAwIDAgMTk2IDBINDVDMjAuMTg3IDAgMCAyMC4xODcgMCA0NXYzMDFjMCAyNC44MTMgMjAuMTg3IDQ1IDQ1IDQ1aDE2NS4yOTdsMzYuNTA5IDExMC40MzhjMi4wMTcgNi40NjggNy45OTkgMTAuNTY2IDE0LjMyOSAxMC41NjYuMDM1IDAgLjA3LS4wMDQuMTA1LS4wMDRoMjA1Ljc2MWMyNC44MTMgMCA0NS0yMC4xODcgNDUtNDVWMTY2QzUxMiAxNDEuMTg3IDQ5MS44MTMgMTIxIDQ2NyAxMjF6TTQ1IDM2MWMtOC4yNzEgMC0xNS02LjcyOS0xNS0xNVY0NWMwLTguMjcxIDYuNzI5LTE1IDE1LTE1aDE0MC4xNzlsMTEwLjAyNyAzMzFINDV6bTI0Ny43MjkgMzBsLTI5LjQgNjQuODQxTDI0MS44OTQgMzkxek00ODIgNDY3YzAgOC4yNzEtNi43MjkgMTUtMTUgMTVIMjg0LjQwOGw0NS4yNTMtOTkuODA2YTE1LjA5OSAxNS4wOTkgMCAwIDAgLjU3MS0xMC45MzJMMjU3LjAxNSAxNTFINDY3YzguMjcxIDAgMTUgNi43MjkgMTUgMTV6XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiJChmaWxsKTtcIiBmaWxsLW9wYWNpdHk9XCIkKGZpbGwtb3BhY2l0eSk7XCIgZD1cIk00NDQuMDc1IDI0MWgtNDV2LTE1YzAtOC4yODQtNi43MTYtMTUtMTUtMTUtOC4yODQgMC0xNSA2LjcxNi0xNSAxNXYxNWgtNDVjLTguMjg0IDAtMTUgNi43MTYtMTUgMTUgMCA4LjI4NCA2LjcxNiAxNSAxNSAxNWg4Ny4xNGMtNC43NzIgMTQuMTg1LTE1LjAyIDMwLjk5Ni0yNi45MzkgNDcuMTc0YTMyMy4zMzEgMzIzLjMzMSAwIDAgMS03LjU0Ny0xMC42MDljLTQuNjU5LTYuODUxLTEzLjk4OC04LjYyOC0yMC44MzgtMy45NjktNi44NSA0LjY1OC04LjYyNyAxMy45ODgtMy45NjkgMjAuODM5IDQuMjA4IDYuMTg5IDguNjIgMTIuMjExIDEzLjAxNyAxNy45MTktNy40OTYgOC42OTQtMTQuODg1IDE2LjU3LTIxLjM2OSAyMi45NC01LjkxMyA1LjgwMi02LjAwMyAxNS4yOTktLjIgMjEuMjEyIDUuNzc3IDUuODg5IDE1LjI3MyA2LjAyNyAyMS4yMTEuMjAxLjUxNy0uNTA4IDguNjk4LTguNTY2IDE5LjYyNC0yMC45MzcgMTAuNjYzIDEyLjIgMTguNjQ1IDIwLjIxOCAxOS4yNjQgMjAuODM3IDUuODU1IDUuODU1IDE1LjM1IDUuODU4IDIxLjIwOC4wMDIgNS44NTgtNS44NTUgNS44NjEtMTUuMzUyLjAwNy0yMS4yMTItLjE1Ny0uMTU3LTkuMzQtOS4zOTItMjEuMDU5LTIzLjA1OSAyMS4yMzMtMjcuNDQ4IDM0LjE4LTUxLjM1NyAzOC42NjMtNzEuMzM4aDEuNzg2YzguMjg0IDAgMTUtNi43MTYgMTUtMTUgMC04LjI4NC02LjcxNS0xNS0xNC45OTktMTV6XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8L2c+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgIGBcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgc3ZnNjRcclxuICAgICAgICAgICAgICAgIGlmIChwYWdlTGFuZ3VhZ2VTdGF0ZSA9PT0gXCJ0cmFuc2xhdGVkXCIgJiYgdHdwQ29uZmlnLmdldChcInBvcHVwQmx1ZVdoZW5TaXRlSXNUcmFuc2xhdGVkXCIpID09PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ZnNjQgPSBzdmdYbWwucmVwbGFjZSgvXFwkXFwoZmlsbFxcLW9wYWNpdHlcXClcXDsvZywgXCIxLjBcIilcclxuICAgICAgICAgICAgICAgICAgICBzdmc2NCA9IGJ0b2Eoc3ZnNjQucmVwbGFjZSgvXFwkXFwoZmlsbFxcKVxcOy9nLCBcIiM0NWExZmZcIikpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN2ZzY0ID0gc3ZnWG1sLnJlcGxhY2UoL1xcJFxcKGZpbGxcXC1vcGFjaXR5XFwpXFw7L2csIFwiMC41XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoZW1lQ29sb3JQb3B1cFRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnNjQgPSBidG9hKHN2ZzY0LnJlcGxhY2UoL1xcJFxcKGZpbGxcXClcXDsvZywgdGhlbWVDb2xvclBvcHVwVGV4dCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXJrTW9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdmc2NCA9IGJ0b2Eoc3ZnNjQucmVwbGFjZSgvXFwkXFwoZmlsbFxcKVxcOy9nLCBcIndoaXRlXCIpKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2ZzY0ID0gYnRvYShzdmc2NC5yZXBsYWNlKC9cXCRcXChmaWxsXFwpXFw7L2csIFwiYmxhY2tcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGI2NFN0YXJ0ID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJztcclxuICAgICAgICAgICAgICAgIHJldHVybiBiNjRTdGFydCArIHN2ZzY0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUljb24odGFiSWQpIHtcclxuICAgICAgICAgICAgICAgIHJlc2V0UGFnZUFjdGlvbih0YWJJZClcclxuICAgICAgICAgICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLnNldEljb24oe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYklkOiB0YWJJZCxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBnZXRTVkdJY29uKClcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR3cENvbmZpZy5nZXQoXCJzaG93QnV0dG9uSW5UaGVBZGRyZXNzQmFyXCIpID09IFwibm9cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLmhpZGUodGFiSWQpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5wYWdlQWN0aW9uLnNob3codGFiSWQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUljb25JbkFsbFRhYnMoKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgdGFicyA9PlxyXG4gICAgICAgICAgICAgICAgICAgIHRhYnMuZm9yRWFjaCh0YWIgPT4gdXBkYXRlSWNvbih0YWIuaWQpKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT0gXCJsb2FkaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYWdlTGFuZ3VhZ2VTdGF0ZSA9IFwib3JpZ2luYWxcIlxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUljb24odGFiSWQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhY3RpdmVJbmZvID0+IHtcclxuICAgICAgICAgICAgICAgIHBhZ2VMYW5ndWFnZVN0YXRlID0gXCJvcmlnaW5hbFwiXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVJY29uKGFjdGl2ZUluZm8udGFiSWQpXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVJbmZvLnRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImdldEN1cnJlbnRQYWdlTGFuZ3VhZ2VTdGF0ZVwiXHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnJhbWVJZDogMFxyXG4gICAgICAgICAgICAgICAgfSwgX3BhZ2VMYW5ndWFnZVN0YXRlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkTGFzdEVycm9yKClcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3BhZ2VMYW5ndWFnZVN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VMYW5ndWFnZVN0YXRlID0gX3BhZ2VMYW5ndWFnZVN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUljb24oYWN0aXZlSW5mby50YWJJZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcInNldFBhZ2VMYW5ndWFnZVN0YXRlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYWdlTGFuZ3VhZ2VTdGF0ZSA9IHJlcXVlc3QucGFnZUxhbmd1YWdlU3RhdGVcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVJY29uKHNlbmRlci50YWIuaWQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICB0d3BDb25maWcub25DaGFuZ2VkKChuYW1lLCBuZXd2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInVzZU9sZFBvcHVwXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUljb25JbkFsbFRhYnMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzaG93QnV0dG9uSW5UaGVBZGRyZXNzQmFyXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUljb25JbkFsbFRhYnMoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSlcclxuXHJcbmlmICh0eXBlb2YgY2hyb21lLmNvbW1hbmRzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICBjaHJvbWUuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKGNvbW1hbmQgPT4ge1xyXG4gICAgICAgIGlmIChjb21tYW5kID09PSBcImhvdGtleS10b2dnbGUtdHJhbnNsYXRpb25cIikge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ0b2dnbGUtdHJhbnNsYXRpb25cIlxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LXRyYW5zbGF0ZS1zZWxlY3RlZC10ZXh0XCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxyXG4gICAgICAgICAgICB9LCB0YWJzID0+XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcIlRyYW5zbGF0ZVNlbGVjdGVkVGV4dFwiXHJcbiAgICAgICAgICAgICAgICB9LCBjaGVja2VkTGFzdEVycm9yKSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LXN3YXAtcGFnZS10cmFuc2xhdGlvbi1zZXJ2aWNlXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZVxyXG4gICAgICAgICAgICB9LCB0YWJzID0+XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInN3YXBUcmFuc2xhdGlvblNlcnZpY2VcIlxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcikpXHJcblxyXG4gICAgICAgICAgICBsZXQgY3VycmVudFBhZ2VUcmFuc2xhdG9yU2VydmljZSA9IHR3cENvbmZpZy5nZXQoXCJwYWdlVHJhbnNsYXRvclNlcnZpY2VcIilcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRQYWdlVHJhbnNsYXRvclNlcnZpY2UgPT09IFwiZ29vZ2xlXCIpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlVHJhbnNsYXRvclNlcnZpY2UgPSBcInlhbmRleFwiXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UGFnZVRyYW5zbGF0b3JTZXJ2aWNlID0gXCJnb29nbGVcIlxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0d3BDb25maWcuc2V0KFwicGFnZVRyYW5zbGF0b3JTZXJ2aWNlXCIsIGN1cnJlbnRQYWdlVHJhbnNsYXRvclNlcnZpY2UpXHJcbiAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcImhvdGtleS1zaG93LW9yaWdpbmFsXCIpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZVxyXG4gICAgICAgICAgICB9LCB0YWJzID0+XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInRyYW5zbGF0ZVBhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMYW5ndWFnZTogXCJvcmlnaW5hbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBjaGVja2VkTGFzdEVycm9yKSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LXRyYW5zbGF0ZS1wYWdlLTFcIikge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93OiB0cnVlXHJcbiAgICAgICAgICAgIH0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHdwQ29uZmlnLnNldFRhcmdldExhbmd1YWdlKHR3cENvbmZpZy5nZXQoXCJ0YXJnZXRMYW5ndWFnZXNcIilbMF0pXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInRyYW5zbGF0ZVBhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMYW5ndWFnZTogdHdwQ29uZmlnLmdldChcInRhcmdldExhbmd1YWdlc1wiKVswXVxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LXRyYW5zbGF0ZS1wYWdlLTJcIikge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93OiB0cnVlXHJcbiAgICAgICAgICAgIH0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHdwQ29uZmlnLnNldFRhcmdldExhbmd1YWdlKHR3cENvbmZpZy5nZXQoXCJ0YXJnZXRMYW5ndWFnZXNcIilbMV0pXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInRyYW5zbGF0ZVBhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMYW5ndWFnZTogdHdwQ29uZmlnLmdldChcInRhcmdldExhbmd1YWdlc1wiKVsxXVxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LXRyYW5zbGF0ZS1wYWdlLTNcIikge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50V2luZG93OiB0cnVlXHJcbiAgICAgICAgICAgIH0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHdwQ29uZmlnLnNldFRhcmdldExhbmd1YWdlKHR3cENvbmZpZy5nZXQoXCJ0YXJnZXRMYW5ndWFnZXNcIilbMl0pXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInRyYW5zbGF0ZVBhZ2VcIixcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRMYW5ndWFnZTogdHdwQ29uZmlnLmdldChcInRhcmdldExhbmd1YWdlc1wiKVsyXVxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tlZExhc3RFcnJvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiaG90a2V5LWhvdC10cmFuc2xhdGUtc2VsZWN0ZWQtdGV4dFwiKSB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRXaW5kb3c6IHRydWVcclxuICAgICAgICAgICAgfSwgdGFicyA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImhvdFRyYW5zbGF0ZVNlbGVjdGVkVGV4dFwiXHJcbiAgICAgICAgICAgICAgICB9LCBjaGVja2VkTGFzdEVycm9yKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbnR3cENvbmZpZy5vblJlYWR5KGFzeW5jICgpID0+IHtcclxuICAgIHVwZGF0ZUNvbnRleHRNZW51KClcclxuICAgIHVwZGF0ZVRyYW5zbGF0ZVNlbGVjdGVkQ29udGV4dE1lbnUoKVxyXG5cclxuICAgIHR3cENvbmZpZy5vbkNoYW5nZWQoKG5hbWUsIG5ld3ZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKG5hbWUgPT09IFwic2hvd1RyYW5zbGF0ZVNlbGVjdGVkQ29udGV4dE1lbnVcIikge1xyXG4gICAgICAgICAgICB1cGRhdGVUcmFuc2xhdGVTZWxlY3RlZENvbnRleHRNZW51KClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghdHdwQ29uZmlnLmdldChcImluc3RhbGxEYXRlVGltZVwiKSkge1xyXG4gICAgICAgIHR3cENvbmZpZy5zZXQoXCJpbnN0YWxsRGF0ZVRpbWVcIiwgRGF0ZS5ub3coKSlcclxuICAgIH1cclxufSlcclxuXHJcbnR3cENvbmZpZy5vblJlYWR5KGFzeW5jICgpID0+IHtcclxuICAgIGxldCBhY3RpdmVUYWJUcmFuc2xhdGlvbkluZm8gPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHRhYnNPbkFjdGl2YXRlZChhY3RpdmVJbmZvKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe1xyXG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGN1cnJlbnRXaW5kb3c6IHRydWVcclxuICAgICAgICB9LCB0YWJzID0+IHtcclxuICAgICAgICAgICAgYWN0aXZlVGFiVHJhbnNsYXRpb25JbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgdGFiSWQ6IHRhYnNbMF0uaWQsXHJcbiAgICAgICAgICAgICAgICBwYWdlTGFuZ3VhZ2VTdGF0ZTogXCJvcmlnaW5hbFwiLFxyXG4gICAgICAgICAgICAgICAgdXJsOiB0YWJzWzBdLnVybFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYnNbMF0uaWQsIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJnZXRDdXJyZW50UGFnZUxhbmd1YWdlU3RhdGVcIlxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBmcmFtZUlkOiAwXHJcbiAgICAgICAgICAgIH0sIHBhZ2VMYW5ndWFnZVN0YXRlID0+IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZVRhYlRyYW5zbGF0aW9uSW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJJZDogdGFic1swXS5pZCxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlTGFuZ3VhZ2VTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHRhYnNbMF0udXJsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc2l0ZXNUb0F1dG9UcmFuc2xhdGUgPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHRhYnNPblJlbW92ZWQodGFiSWQpIHtcclxuICAgICAgICBkZWxldGUgc2l0ZXNUb0F1dG9UcmFuc2xhdGVbdGFiSWRdXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcnVudGltZU9uTWVzc2FnZShyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xyXG4gICAgICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJzZXRQYWdlTGFuZ3VhZ2VTdGF0ZVwiKSB7XHJcbiAgICAgICAgICAgIGlmIChzZW5kZXIudGFiLmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlVGFiVHJhbnNsYXRpb25JbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYklkOiBzZW5kZXIudGFiLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VMYW5ndWFnZVN0YXRlOiByZXF1ZXN0LnBhZ2VMYW5ndWFnZVN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VuZGVyLnRhYi51cmxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB3ZWJOYXZpZ2F0aW9uT25Db21taXR0ZWQoZGV0YWlscykge1xyXG4gICAgICAgIGlmIChkZXRhaWxzLnRyYW5zaXRpb25UeXBlID09PSBcImxpbmtcIiAmJiBkZXRhaWxzLmZyYW1lSWQgPT09IDAgJiZcclxuICAgICAgICAgICAgYWN0aXZlVGFiVHJhbnNsYXRpb25JbmZvLnBhZ2VMYW5ndWFnZVN0YXRlID09PSBcInRyYW5zbGF0ZWRcIiAmJlxyXG4gICAgICAgICAgICBuZXcgVVJMKGFjdGl2ZVRhYlRyYW5zbGF0aW9uSW5mby51cmwpLmhvc3QgPT09IG5ldyBVUkwoZGV0YWlscy51cmwpLmhvc3QpIHtcclxuICAgICAgICAgICAgc2l0ZXNUb0F1dG9UcmFuc2xhdGVbZGV0YWlscy50YWJJZF0gPSBuZXcgVVJMKGRldGFpbHMudXJsKS5ob3N0XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGVsZXRlIHNpdGVzVG9BdXRvVHJhbnNsYXRlW2RldGFpbHMudGFiSWRdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdlYk5hdmlnYXRpb25PbkRPTUNvbnRlbnRMb2FkZWQoZGV0YWlscykge1xyXG4gICAgICAgIGlmIChkZXRhaWxzLmZyYW1lSWQgPT09IDApIHtcclxuICAgICAgICAgICAgY29uc3QgaG9zdCA9IG5ldyBVUkwoZGV0YWlscy51cmwpLmhvc3RcclxuICAgICAgICAgICAgaWYgKHNpdGVzVG9BdXRvVHJhbnNsYXRlW2RldGFpbHMudGFiSWRdID09PSBob3N0KSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoZGV0YWlscy50YWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwiYXV0b1RyYW5zbGF0ZUJlY2F1c2VDbGlja2VkQUxpbmtcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVJZDogMFxyXG4gICAgICAgICAgICAgICAgICAgIH0pLCA3MDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlIHNpdGVzVG9BdXRvVHJhbnNsYXRlW2RldGFpbHMudGFiSWRdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuYWJsZVRyYW5zbGF0aW9uT25DbGlja2luZ0FMaW5rKCkge1xyXG4gICAgICAgIGRpc2FibGVUcmFuc2xhdGlvbk9uQ2xpY2tpbmdBTGluaygpXHJcbiAgICAgICAgaWYgKCFjaHJvbWUud2ViTmF2aWdhdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcih0YWJzT25BY3RpdmF0ZWQpXHJcbiAgICAgICAgY2hyb21lLnRhYnMub25SZW1vdmVkLmFkZExpc3RlbmVyKHRhYnNPblJlbW92ZWQpXHJcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKHJ1bnRpbWVPbk1lc3NhZ2UpXHJcbiAgICAgICAgY2hyb21lLndlYk5hdmlnYXRpb24ub25Db21taXR0ZWQuYWRkTGlzdGVuZXIod2ViTmF2aWdhdGlvbk9uQ29tbWl0dGVkKVxyXG4gICAgICAgIGNocm9tZS53ZWJOYXZpZ2F0aW9uLm9uRE9NQ29udGVudExvYWRlZC5hZGRMaXN0ZW5lcih3ZWJOYXZpZ2F0aW9uT25ET01Db250ZW50TG9hZGVkKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpc2FibGVUcmFuc2xhdGlvbk9uQ2xpY2tpbmdBTGluaygpIHtcclxuICAgICAgICBhY3RpdmVUYWJUcmFuc2xhdGlvbkluZm8gPSB7fVxyXG4gICAgICAgIHNpdGVzVG9BdXRvVHJhbnNsYXRlID0ge31cclxuICAgICAgICBjaHJvbWUudGFicy5vbkFjdGl2YXRlZC5yZW1vdmVMaXN0ZW5lcih0YWJzT25BY3RpdmF0ZWQpXHJcbiAgICAgICAgY2hyb21lLnRhYnMub25SZW1vdmVkLnJlbW92ZUxpc3RlbmVyKHRhYnNPblJlbW92ZWQpXHJcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKHJ1bnRpbWVPbk1lc3NhZ2UpXHJcblxyXG4gICAgICAgIGlmIChjaHJvbWUud2ViTmF2aWdhdGlvbikge1xyXG4gICAgICAgICAgICBjaHJvbWUud2ViTmF2aWdhdGlvbi5vbkNvbW1pdHRlZC5yZW1vdmVMaXN0ZW5lcih3ZWJOYXZpZ2F0aW9uT25Db21taXR0ZWQpXHJcbiAgICAgICAgICAgIGNocm9tZS53ZWJOYXZpZ2F0aW9uLm9uRE9NQ29udGVudExvYWRlZC5yZW1vdmVMaXN0ZW5lcih3ZWJOYXZpZ2F0aW9uT25ET01Db250ZW50TG9hZGVkKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIk5vIHdlYk5hdmlnYXRpb24gcGVybWlzc2lvblwiKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0d3BDb25maWcub25DaGFuZ2VkKChuYW1lLCBuZXd2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmIChuYW1lID09PSBcImF1dG9UcmFuc2xhdGVXaGVuQ2xpY2tpbmdBTGlua1wiKSB7XHJcbiAgICAgICAgICAgIGlmIChuZXd2YWx1ZSA9PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGVUcmFuc2xhdGlvbk9uQ2xpY2tpbmdBTGluaygpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlVHJhbnNsYXRpb25PbkNsaWNraW5nQUxpbmsoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjaHJvbWUucGVybWlzc2lvbnMub25SZW1vdmVkLmFkZExpc3RlbmVyKHBlcm1pc3Npb25zID0+IHtcclxuICAgICAgICBpZiAocGVybWlzc2lvbnMucGVybWlzc2lvbnMuaW5kZXhPZihcIndlYk5hdmlnYXRpb25cIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHR3cENvbmZpZy5zZXQoXCJhdXRvVHJhbnNsYXRlV2hlbkNsaWNraW5nQUxpbmtcIiwgXCJub1wiKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgY2hyb21lLnBlcm1pc3Npb25zLmNvbnRhaW5zKHtcclxuICAgICAgICBwZXJtaXNzaW9uczogW1wid2ViTmF2aWdhdGlvblwiXVxyXG4gICAgfSwgaGFzUGVybWlzc2lvbnMgPT4ge1xyXG4gICAgICAgIGlmIChoYXNQZXJtaXNzaW9ucyAmJiB0d3BDb25maWcuZ2V0KFwiYXV0b1RyYW5zbGF0ZVdoZW5DbGlja2luZ0FMaW5rXCIpID09PSBcInllc1wiKSB7XHJcbiAgICAgICAgICAgIGVuYWJsZVRyYW5zbGF0aW9uT25DbGlja2luZ0FMaW5rKClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0d3BDb25maWcuc2V0KFwiYXV0b1RyYW5zbGF0ZVdoZW5DbGlja2luZ0FMaW5rXCIsIFwibm9cIilcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59KVxyXG4iXSwibWFwcGluZ3MiOiJBQUFBLGEsQ0FFQTs7QUFDQSxTQUFTQSxnQkFBVCxHQUE0QjtFQUN4QkMsTUFBTSxDQUFDQyxPQUFQLENBQWVDLFNBQWY7QUFDSCxDLENBRUQ7OztBQUNBLElBQUlDLGFBQWEsR0FBRyxFQUFwQjtBQUNBSCxNQUFNLENBQUNJLFVBQVAsQ0FBa0JDLGlCQUFsQixDQUFvQ0MsV0FBcEMsQ0FBZ0QsVUFBU0MsT0FBVCxFQUFrQjtFQUM5RCxJQUFJQSxPQUFPLENBQUNDLEtBQVIsS0FBa0IsQ0FBQyxDQUF2QixFQUEwQjtJQUN0QixJQUFJQyxpQkFBaUIsR0FBRyxJQUF4Qjs7SUFDQSxLQUFLLE1BQU1DLE1BQVgsSUFBcUJILE9BQU8sQ0FBQ0ksZUFBN0IsRUFBOEM7TUFDMUMsSUFBSUQsTUFBTSxDQUFDRSxJQUFQLENBQVlDLFdBQVosT0FBOEIsY0FBbEMsRUFBa0Q7UUFDOUNKLGlCQUFpQixHQUFHQyxNQUFwQjtRQUNBO01BQ0g7SUFDSjs7SUFDRFAsYUFBYSxDQUFDSSxPQUFPLENBQUNDLEtBQVQsQ0FBYixHQUErQkMsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDSyxLQUFsQixDQUF3QkMsS0FBeEIsQ0FBOEIsR0FBOUIsRUFBbUMsQ0FBbkMsRUFBc0MsQ0FBdEMsQ0FBcEQ7RUFDSDtBQUNKLENBWEQs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
