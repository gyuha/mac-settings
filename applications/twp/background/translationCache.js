"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const translationCache = function () {
  const translationCache = {};
  /**
   * @typedef {Object} CacheEntry
   * @property {String} originalText
   * @property {String} translatedText
   * @property {String} detectedLanguage
   * @property {String} key
   */

  class Utils {
    /**
     *
     * @param {IDBDatabase} db
     * @param {string} dbName
     * @returns {Promise<number>}
     */
    static async getTableSize(db, dbName) {
      return await new Promise((resolve, reject) => {
        if (db == null) return reject();
        let size = 0;
        const transaction = db.transaction([dbName]).objectStore(dbName).openCursor();

        transaction.onsuccess = event => {
          const cursor = transaction.result;

          if (cursor) {
            const storedObject = cursor.value;
            const json = JSON.stringify(storedObject);
            size += json.length;
            cursor.continue();
          } else {
            resolve(size);
          }
        };

        transaction.onerror = err => reject("error in " + dbName + ": " + err);
      });
    }
    /**
     *
     * @param {string} dbName
     * @returns {Promise<number>}
     */


    static async getDatabaseSize(dbName) {
      return await new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = request.onblocked = event => {
          console.error(event);
          reject();
        };

        request.onsuccess = event => {
          try {
            const db = request.result;
            const tableNames = [...db.objectStoreNames];

            ((tableNames, db) => {
              const tableSizeGetters = tableNames.reduce((acc, tableName) => {
                acc.push(Utils.getTableSize(db, tableName));
                return acc;
              }, []);
              Promise.all(tableSizeGetters).then(sizes => {
                const total = sizes.reduce((acc, val) => acc + val, 0);
                resolve(total);
              }).catch(e => {
                console.error(e);
                reject();
              });
            })(tableNames, db);
          } finally {
            request.result.close();
          }
        };
      });
    }
    /**
     *
     * @param {number} bytes
     * @returns {string}
     */


    static humanReadableSize(bytes) {
      const thresh = 1024;

      if (Math.abs(bytes) < thresh) {
        return bytes + " B";
      }

      const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      let u = -1;

      do {
        bytes /= thresh;
        ++u;
      } while (Math.abs(bytes) >= thresh && u < units.length - 1);

      return bytes.toFixed(1) + " " + units[u];
    }
    /**
     *
     * @param {string} message
     * @returns {Promise<string>}
     */


    static async stringToSHA1String(message) {
      const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array

      const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8); // hash the message

      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array

      return hashArray.map(b => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
    }

  }

  var _queryInDB = /*#__PURE__*/new WeakSet();

  var _addInDb = /*#__PURE__*/new WeakSet();

  class Cache {
    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     */
    constructor(translationService, sourceLanguage, targetLanguage) {
      _classPrivateMethodInitSpec(this, _addInDb);

      _classPrivateMethodInitSpec(this, _queryInDB);

      /** @type {string} */
      this.translationService = translationService;
      /** @type {string} */

      this.sourceLanguage = sourceLanguage;
      /** @type {string} */

      this.targetLanguage = targetLanguage;
      /** @type {Map<string, CacheEntry>} */

      this.cache = new Map();
      /** @type {Promise<boolean>} */

      this.promiseStartingCache = null;
    }
    /**
     *
     * @returns {Promise<boolean>}
     */


    async start() {
      if (this.promiseStartingCache) return await this.promiseStartingCache;
      this.promiseStartingCache = new Promise(resolve => {
        Cache.openDataBaseCache(this.translationService, this.sourceLanguage, this.targetLanguage).then(db => {
          this.db = db;
          resolve(true);
        }).catch(e => {
          console.error(e);
          Cache.deleteDatabase(this.translationService, this.sourceLanguage, this.targetLanguage);
          resolve(false);
        });
      });
      return await this.promiseStartingCache;
    }

    close() {
      if (this.db) this.db.close();
      this.db = null;
    }
    /**
     *
     * @param {string} origTextHash
     * @returns {Promise<CacheEntry>}
     */


    /**
     *
     * @param {string} originalText
     * @returns {Promise<CacheEntry>}
     */
    async query(originalText) {
      const hash = await Utils.stringToSHA1String(originalText);
      let translation = this.cache.get(hash);
      if (translation) return translation;
      translation = await _classPrivateMethodGet(this, _queryInDB, _queryInDB2).call(this, hash);
      if (translation) this.cache.set(hash, translation);
      return translation;
    }
    /**
     *
     * @param {CacheEntry} data
     * @returns {Promise<boolean>}
     */


    /**
     *
     * @param {string} originalText
     * @param {string} translatedText
     * @param {string} detectedLanguage
     * @returns {Promise<boolean>}
     */
    async add(originalText, translatedText, detectedLanguage = "und") {
      const hash = await Utils.stringToSHA1String(originalText);
      return await _classPrivateMethodGet(this, _addInDb, _addInDb2).call(this, {
        originalText,
        translatedText,
        detectedLanguage,
        key: hash
      });
    }
    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @returns {string}
     */


    static getDataBaseName(translationService, sourceLanguage, targetLanguage) {
      return `${translationService}@${sourceLanguage}.${targetLanguage}`;
    }
    /**
     *
     * @returns {string}
     */


    static getCacheStorageName() {
      return "cache";
    }
    /**
     *
     * @param {string} name
     * @param {number} version
     * @param {string[]} objectStorageNames
     * @returns {Promise<IDBDatabase>}
     */


    static async openIndexeddb(name, version, objectStorageNames) {
      return await new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);

        request.onsuccess = event => {
          console.info(request.result);
          resolve(request.result);
        };

        request.onerror = request.onblocked = event => {
          console.error("Error opening the database, switching to non-database mode", event);
          reject();
        };

        request.onupgradeneeded = event => {
          const db = request.result;

          for (const storageName of objectStorageNames) {
            db.createObjectStore(storageName, {
              keyPath: "key"
            });
          }
        };
      });
    }
    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @returns {Promise<IDBDatabase>}
     */


    static async openDataBaseCache(translationService, sourceLanguage, targetLanguage) {
      const dbName = Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage);
      const storageName = Cache.getCacheStorageName();
      const db = await Cache.openIndexeddb(dbName, 1, [storageName]);
      return db;
    }
    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @returns {Promise<boolean>}
     */


    static async deleteDatabase(translationService, sourceLanguage, targetLanguage) {
      return await new Promise(resolve => {
        try {
          const dbName = Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage);
          const request = indexedDB.deleteDatabase(dbName);

          request.onsuccess = event => {
            resolve(true);
          };

          request.onerror = event => {
            console.error(event);
            resolve(false);
          };
        } catch (e) {
          console.error(e);
          resolve(false);
        }
      });
    }

  }

  async function _queryInDB2(origTextHash) {
    return await new Promise((resolve, reject) => {
      if (!this.db) return reject();
      const storageName = Cache.getCacheStorageName();
      const objectStore = this.db.transaction([storageName], "readonly").objectStore(storageName);
      const request = objectStore.get(origTextHash);

      request.onsuccess = event => {
        const result = request.result;
        resolve(result);
      };

      request.onerror = event => {
        console.error(event);
        reject();
      };
    });
  }

  async function _addInDb2(data) {
    return await new Promise(resolve => {
      if (!this.db) return resolve(false);
      const storageName = Cache.getCacheStorageName();
      const objectStore = this.db.transaction([storageName], "readwrite").objectStore(storageName);
      const request = objectStore.put(data);

      request.onsuccess = event => {
        resolve(true);
      };

      request.onerror = event => {
        console.error(event);
        resolve(false);
      };
    });
  }

  var _openCacheList = /*#__PURE__*/new WeakSet();

  var _addCacheList = /*#__PURE__*/new WeakSet();

  var _createCache = /*#__PURE__*/new WeakSet();

  var _addCache = /*#__PURE__*/new WeakSet();

  var _getAllDBNames = /*#__PURE__*/new WeakSet();

  class CacheList {
    constructor() {
      _classPrivateMethodInitSpec(this, _getAllDBNames);

      _classPrivateMethodInitSpec(this, _addCache);

      _classPrivateMethodInitSpec(this, _createCache);

      _classPrivateMethodInitSpec(this, _addCacheList);

      _classPrivateMethodInitSpec(this, _openCacheList);

      /** @type {Map<string, Cache>} */
      this.list = new Map();

      try {
        _classPrivateMethodGet(this, _openCacheList, _openCacheList2).call(this);
      } catch (e) {
        console.error(e);
      }
    }

    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @returns {Promise<Cache>}
     */
    async getCache(translationService, sourceLanguage, targetLanguage) {
      const dbName = Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage);
      const cache = this.list.get(dbName);

      if (cache) {
        await cache.promiseStartingCache;
        return cache;
      } else {
        return await _classPrivateMethodGet(this, _createCache, _createCache2).call(this, translationService, sourceLanguage, targetLanguage);
      }
    }
    /**
     *
     * @param {string} translationService
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @param {Cache} cache
     */


    /**
     *
     * @returns {Promise<boolean>}
     */
    async deleteAll() {
      try {
        /** @type {Array<Promise>} */
        const promises = [];
        this.list.forEach((cache, key) => {
          if (cache) cache.close();
          promises.push(CacheList.deleteDatabase(key));
        });
        this.list.clear();
        const dbnames = await _classPrivateMethodGet(this, _getAllDBNames, _getAllDBNames2).call(this);
        dbnames.forEach(dbName => {
          promises.push(CacheList.deleteDatabase(dbName));
        });
        await Promise.all(promises);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    /**
     *
     * @returns {Promise<boolean>}
     */


    static async deleteDatabase(dbName) {
      return await new Promise(resolve => {
        const DBDeleteRequest = indexedDB.deleteDatabase(dbName);

        DBDeleteRequest.onsuccess = () => {
          console.info("Database deleted successfully");
          resolve(true);
        };

        DBDeleteRequest.onerror = () => {
          console.warn("Error deleting database.");
          resolve(false);
        };
      });
    }
    /**
     * @returns {Promise<string>}
     */


    async calculateSize() {
      try {
        /** @type {Array<Promise>} */
        const promises = [];
        const dbnames = await _classPrivateMethodGet(this, _getAllDBNames, _getAllDBNames2).call(this);
        dbnames.forEach(dbName => {
          promises.push(Utils.getDatabaseSize(dbName));
        });
        const results = await Promise.all(promises);
        return Utils.humanReadableSize(results.reduce((total, size) => total + size, 0));
      } catch (e) {
        console.error(e);
        return Utils.humanReadableSize(0);
      }
    }

  }

  function _openCacheList2() {
    const request = indexedDB.open("cacheList", 1);

    request.onsuccess = event => {
      this.dbCacheList = request.result;
      this.list.forEach((cache, key) => {
        _classPrivateMethodGet(this, _addCacheList, _addCacheList2).call(this, key);
      });
    };

    request.onerror = request.onblocked = event => {
      console.error("Error opening the database", event);
      this.dbCacheList = null;
    };

    request.onupgradeneeded = event => {
      const db = request.result;
      db.createObjectStore("cache_list", {
        keyPath: "dbName"
      });
    };
  }

  function _addCacheList2(dbName) {
    if (!this.dbCacheList) return;
    const storageName = "cache_list";
    const objectStore = this.dbCacheList.transaction([storageName], "readwrite").objectStore(storageName);
    const request = objectStore.put({
      dbName
    });

    request.onsuccess = event => {};

    request.onerror = event => {
      console.error(event);
    };
  }

  async function _createCache2(translationService, sourceLanguage, targetLanguage) {
    const cache = new Cache(translationService, sourceLanguage, targetLanguage);

    _classPrivateMethodGet(this, _addCache, _addCache2).call(this, translationService, sourceLanguage, targetLanguage, cache);

    try {
      await cache.start();
    } catch (e) {
      console.error(e);
    }

    return cache;
  }

  function _addCache2(translationService, sourceLanguage, targetLanguage, cache) {
    const dbName = Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage);
    this.list.set(dbName, cache);

    try {
      _classPrivateMethodGet(this, _addCacheList, _addCacheList2).call(this, dbName);
    } catch {}
  }

  async function _getAllDBNames2() {
    if (!this.dbCacheList) return [];
    return await new Promise(resolve => {
      const storageName = "cache_list";
      const objectStore = this.dbCacheList.transaction([storageName], "readonly").objectStore(storageName);
      const request = objectStore.getAllKeys();

      request.onsuccess = event => {
        // TODO this cast is realy necessary?
        //cast
        resolve(
        /** @type {string[]} */
        request.result);
      };

      request.onerror = event => {
        console.error(event);
        resolve([]);
      };
    });
  }

  const cacheList = new CacheList();
  /**
   *
   * @param {string} translationService
   * @param {string} sourceLanguage
   * @param {string} targetLanguage
   * @param {string} originalText
   * @returns {Promise<CacheEntry>}
   */

  translationCache.get = async (translationService, sourceLanguage, targetLanguage, originalText) => {
    try {
      const cache = await cacheList.getCache(translationService, sourceLanguage, targetLanguage);
      return await cache.query(originalText);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   *
   * @param {string} translationService
   * @param {string} sourceLanguage
   * @param {string} targetLanguage
   * @param {string} originalText
   * @param {string} translatedText
   * @param {string} detectedLanguage
   * @returns {Promise<boolean>}
   */


  translationCache.set = async (translationService, sourceLanguage, targetLanguage, originalText, translatedText, detectedLanguage) => {
    try {
      const cache = await cacheList.getCache(translationService, sourceLanguage, targetLanguage);
      return await cache.add(originalText, translatedText, detectedLanguage);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   *
   * @param {boolean} reload
   */


  translationCache.deleteTranslationCache = async (reload = false) => {
    try {
      if (indexedDB && indexedDB.deleteDatabase) {
        indexedDB.deleteDatabase("googleCache");
        indexedDB.deleteDatabase("yandexCache");
        indexedDB.deleteDatabase("bingCache");
      }

      await cacheList.deleteAll();
    } catch (e) {
      console.error(e);
    } finally {
      if (reload) chrome.runtime.reload();
    }
  };

  let promiseCalculatingStorage = null;
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCacheSize") {
      if (!promiseCalculatingStorage) {
        promiseCalculatingStorage = cacheList.calculateSize();
      }

      promiseCalculatingStorage.then(size => {
        promiseCalculatingStorage = null;
        sendResponse(size);
        return size;
      }).catch(e => {
        console.error(e);
        promiseCalculatingStorage = null;
        sendResponse("0B");
        return "0B";
      });
      return true;
    } else if (request.action === "deleteTranslationCache") {
      translationCache.deleteTranslationCache(request.reload);
    }
  });
  return translationCache;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRpb25DYWNoZS5qcyIsIm5hbWVzIjpbInRyYW5zbGF0aW9uQ2FjaGUiLCJVdGlscyIsImdldFRhYmxlU2l6ZSIsImRiIiwiZGJOYW1lIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzaXplIiwidHJhbnNhY3Rpb24iLCJvYmplY3RTdG9yZSIsIm9wZW5DdXJzb3IiLCJvbnN1Y2Nlc3MiLCJldmVudCIsImN1cnNvciIsInJlc3VsdCIsInN0b3JlZE9iamVjdCIsInZhbHVlIiwianNvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJsZW5ndGgiLCJjb250aW51ZSIsIm9uZXJyb3IiLCJlcnIiLCJnZXREYXRhYmFzZVNpemUiLCJyZXF1ZXN0IiwiaW5kZXhlZERCIiwib3BlbiIsIm9uYmxvY2tlZCIsImNvbnNvbGUiLCJlcnJvciIsInRhYmxlTmFtZXMiLCJvYmplY3RTdG9yZU5hbWVzIiwidGFibGVTaXplR2V0dGVycyIsInJlZHVjZSIsImFjYyIsInRhYmxlTmFtZSIsInB1c2giLCJhbGwiLCJ0aGVuIiwic2l6ZXMiLCJ0b3RhbCIsInZhbCIsImNhdGNoIiwiZSIsImNsb3NlIiwiaHVtYW5SZWFkYWJsZVNpemUiLCJieXRlcyIsInRocmVzaCIsIk1hdGgiLCJhYnMiLCJ1bml0cyIsInUiLCJ0b0ZpeGVkIiwic3RyaW5nVG9TSEExU3RyaW5nIiwibWVzc2FnZSIsIm1zZ1VpbnQ4IiwiVGV4dEVuY29kZXIiLCJlbmNvZGUiLCJoYXNoQnVmZmVyIiwiY3J5cHRvIiwic3VidGxlIiwiZGlnZXN0IiwiaGFzaEFycmF5IiwiQXJyYXkiLCJmcm9tIiwiVWludDhBcnJheSIsIm1hcCIsImIiLCJ0b1N0cmluZyIsInBhZFN0YXJ0Iiwiam9pbiIsIkNhY2hlIiwiY29uc3RydWN0b3IiLCJ0cmFuc2xhdGlvblNlcnZpY2UiLCJzb3VyY2VMYW5ndWFnZSIsInRhcmdldExhbmd1YWdlIiwiY2FjaGUiLCJNYXAiLCJwcm9taXNlU3RhcnRpbmdDYWNoZSIsInN0YXJ0Iiwib3BlbkRhdGFCYXNlQ2FjaGUiLCJkZWxldGVEYXRhYmFzZSIsInF1ZXJ5Iiwib3JpZ2luYWxUZXh0IiwiaGFzaCIsInRyYW5zbGF0aW9uIiwiZ2V0Iiwic2V0IiwiYWRkIiwidHJhbnNsYXRlZFRleHQiLCJkZXRlY3RlZExhbmd1YWdlIiwia2V5IiwiZ2V0RGF0YUJhc2VOYW1lIiwiZ2V0Q2FjaGVTdG9yYWdlTmFtZSIsIm9wZW5JbmRleGVkZGIiLCJuYW1lIiwidmVyc2lvbiIsIm9iamVjdFN0b3JhZ2VOYW1lcyIsImluZm8iLCJvbnVwZ3JhZGVuZWVkZWQiLCJzdG9yYWdlTmFtZSIsImNyZWF0ZU9iamVjdFN0b3JlIiwia2V5UGF0aCIsIm9yaWdUZXh0SGFzaCIsImRhdGEiLCJwdXQiLCJDYWNoZUxpc3QiLCJsaXN0IiwiZ2V0Q2FjaGUiLCJkZWxldGVBbGwiLCJwcm9taXNlcyIsImZvckVhY2giLCJjbGVhciIsImRibmFtZXMiLCJEQkRlbGV0ZVJlcXVlc3QiLCJ3YXJuIiwiY2FsY3VsYXRlU2l6ZSIsInJlc3VsdHMiLCJkYkNhY2hlTGlzdCIsImdldEFsbEtleXMiLCJjYWNoZUxpc3QiLCJkZWxldGVUcmFuc2xhdGlvbkNhY2hlIiwicmVsb2FkIiwiY2hyb21lIiwicnVudGltZSIsInByb21pc2VDYWxjdWxhdGluZ1N0b3JhZ2UiLCJvbk1lc3NhZ2UiLCJhZGRMaXN0ZW5lciIsInNlbmRlciIsInNlbmRSZXNwb25zZSIsImFjdGlvbiJdLCJzb3VyY2VzIjpbInRyYW5zbGF0aW9uQ2FjaGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCB0cmFuc2xhdGlvbkNhY2hlID0gKGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCB0cmFuc2xhdGlvbkNhY2hlID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IENhY2hlRW50cnlcclxuICAgKiBAcHJvcGVydHkge1N0cmluZ30gb3JpZ2luYWxUZXh0XHJcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IHRyYW5zbGF0ZWRUZXh0XHJcbiAgICogQHByb3BlcnR5IHtTdHJpbmd9IGRldGVjdGVkTGFuZ3VhZ2VcclxuICAgKiBAcHJvcGVydHkge1N0cmluZ30ga2V5XHJcbiAgICovXHJcblxyXG4gIGNsYXNzIFV0aWxzIHtcclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SURCRGF0YWJhc2V9IGRiXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGJOYW1lXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0VGFibGVTaXplKGRiLCBkYk5hbWUpIHtcclxuICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBpZiAoZGIgPT0gbnVsbCkgcmV0dXJuIHJlamVjdCgpO1xyXG4gICAgICAgIGxldCBzaXplID0gMDtcclxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGRiXHJcbiAgICAgICAgICAudHJhbnNhY3Rpb24oW2RiTmFtZV0pXHJcbiAgICAgICAgICAub2JqZWN0U3RvcmUoZGJOYW1lKVxyXG4gICAgICAgICAgLm9wZW5DdXJzb3IoKTtcclxuXHJcbiAgICAgICAgdHJhbnNhY3Rpb24ub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBjdXJzb3IgPSB0cmFuc2FjdGlvbi5yZXN1bHQ7XHJcbiAgICAgICAgICBpZiAoY3Vyc29yKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZE9iamVjdCA9IGN1cnNvci52YWx1ZTtcclxuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHN0b3JlZE9iamVjdCk7XHJcbiAgICAgICAgICAgIHNpemUgKz0ganNvbi5sZW5ndGg7XHJcbiAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzb2x2ZShzaXplKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRyYW5zYWN0aW9uLm9uZXJyb3IgPSAoZXJyKSA9PlxyXG4gICAgICAgICAgcmVqZWN0KFwiZXJyb3IgaW4gXCIgKyBkYk5hbWUgKyBcIjogXCIgKyBlcnIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGJOYW1lXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0RGF0YWJhc2VTaXplKGRiTmFtZSkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihkYk5hbWUpO1xyXG4gICAgICAgIHJlcXVlc3Qub25lcnJvciA9IHJlcXVlc3Qub25ibG9ja2VkID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRiID0gcmVxdWVzdC5yZXN1bHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlTmFtZXMgPSBbLi4uZGIub2JqZWN0U3RvcmVOYW1lc107XHJcbiAgICAgICAgICAgICgodGFibGVOYW1lcywgZGIpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB0YWJsZVNpemVHZXR0ZXJzID0gdGFibGVOYW1lcy5yZWR1Y2UoKGFjYywgdGFibGVOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhY2MucHVzaChVdGlscy5nZXRUYWJsZVNpemUoZGIsIHRhYmxlTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgICAgICB9LCBbXSk7XHJcblxyXG4gICAgICAgICAgICAgIFByb21pc2UuYWxsKHRhYmxlU2l6ZUdldHRlcnMpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoc2l6ZXMpID0+IHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWwgPSBzaXplcy5yZWR1Y2UoKGFjYywgdmFsKSA9PiBhY2MgKyB2YWwsIDApO1xyXG4gICAgICAgICAgICAgICAgICByZXNvbHZlKHRvdGFsKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkodGFibGVOYW1lcywgZGIpO1xyXG4gICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgcmVxdWVzdC5yZXN1bHQuY2xvc2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYnl0ZXNcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBodW1hblJlYWRhYmxlU2l6ZShieXRlcykge1xyXG4gICAgICBjb25zdCB0aHJlc2ggPSAxMDI0O1xyXG4gICAgICBpZiAoTWF0aC5hYnMoYnl0ZXMpIDwgdGhyZXNoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJ5dGVzICsgXCIgQlwiO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHVuaXRzID0gW1wiS0JcIiwgXCJNQlwiLCBcIkdCXCIsIFwiVEJcIiwgXCJQQlwiLCBcIkVCXCIsIFwiWkJcIiwgXCJZQlwiXTtcclxuICAgICAgbGV0IHUgPSAtMTtcclxuICAgICAgZG8ge1xyXG4gICAgICAgIGJ5dGVzIC89IHRocmVzaDtcclxuICAgICAgICArK3U7XHJcbiAgICAgIH0gd2hpbGUgKE1hdGguYWJzKGJ5dGVzKSA+PSB0aHJlc2ggJiYgdSA8IHVuaXRzLmxlbmd0aCAtIDEpO1xyXG4gICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSArIFwiIFwiICsgdW5pdHNbdV07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBzdHJpbmdUb1NIQTFTdHJpbmcobWVzc2FnZSkge1xyXG4gICAgICBjb25zdCBtc2dVaW50OCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShtZXNzYWdlKTsgLy8gZW5jb2RlIGFzICh1dGYtOCkgVWludDhBcnJheVxyXG4gICAgICBjb25zdCBoYXNoQnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoXCJTSEEtMVwiLCBtc2dVaW50OCk7IC8vIGhhc2ggdGhlIG1lc3NhZ2VcclxuICAgICAgY29uc3QgaGFzaEFycmF5ID0gQXJyYXkuZnJvbShuZXcgVWludDhBcnJheShoYXNoQnVmZmVyKSk7IC8vIGNvbnZlcnQgYnVmZmVyIHRvIGJ5dGUgYXJyYXlcclxuICAgICAgcmV0dXJuIGhhc2hBcnJheS5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIlwiKTsgLy8gY29udmVydCBieXRlcyB0byBoZXggc3RyaW5nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBDYWNoZSB7XHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhbnNsYXRpb25TZXJ2aWNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc291cmNlTGFuZ3VhZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRMYW5ndWFnZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih0cmFuc2xhdGlvblNlcnZpY2UsIHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSkge1xyXG4gICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICAgICAgdGhpcy50cmFuc2xhdGlvblNlcnZpY2UgPSB0cmFuc2xhdGlvblNlcnZpY2U7XHJcbiAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gICAgICB0aGlzLnNvdXJjZUxhbmd1YWdlID0gc291cmNlTGFuZ3VhZ2U7XHJcbiAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gICAgICB0aGlzLnRhcmdldExhbmd1YWdlID0gdGFyZ2V0TGFuZ3VhZ2U7XHJcbiAgICAgIC8qKiBAdHlwZSB7TWFwPHN0cmluZywgQ2FjaGVFbnRyeT59ICovXHJcbiAgICAgIHRoaXMuY2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICAgIC8qKiBAdHlwZSB7UHJvbWlzZTxib29sZWFuPn0gKi9cclxuICAgICAgdGhpcy5wcm9taXNlU3RhcnRpbmdDYWNoZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHN0YXJ0KCkge1xyXG4gICAgICBpZiAodGhpcy5wcm9taXNlU3RhcnRpbmdDYWNoZSkgcmV0dXJuIGF3YWl0IHRoaXMucHJvbWlzZVN0YXJ0aW5nQ2FjaGU7XHJcbiAgICAgIHRoaXMucHJvbWlzZVN0YXJ0aW5nQ2FjaGUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIENhY2hlLm9wZW5EYXRhQmFzZUNhY2hlKFxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICB0aGlzLnNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgICAgdGhpcy50YXJnZXRMYW5ndWFnZVxyXG4gICAgICAgIClcclxuICAgICAgICAgIC50aGVuKChkYikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmRiID0gZGI7XHJcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIENhY2hlLmRlbGV0ZURhdGFiYXNlKFxyXG4gICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAgIHRoaXMuc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgICAgdGhpcy50YXJnZXRMYW5ndWFnZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucHJvbWlzZVN0YXJ0aW5nQ2FjaGU7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgIGlmICh0aGlzLmRiKSB0aGlzLmRiLmNsb3NlKCk7XHJcbiAgICAgIHRoaXMuZGIgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnVGV4dEhhc2hcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENhY2hlRW50cnk+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyAjcXVlcnlJbkRCKG9yaWdUZXh0SGFzaCkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kYikgcmV0dXJuIHJlamVjdCgpO1xyXG5cclxuICAgICAgICBjb25zdCBzdG9yYWdlTmFtZSA9IENhY2hlLmdldENhY2hlU3RvcmFnZU5hbWUoKTtcclxuICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IHRoaXMuZGJcclxuICAgICAgICAgIC50cmFuc2FjdGlvbihbc3RvcmFnZU5hbWVdLCBcInJlYWRvbmx5XCIpXHJcbiAgICAgICAgICAub2JqZWN0U3RvcmUoc3RvcmFnZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBvYmplY3RTdG9yZS5nZXQob3JpZ1RleHRIYXNoKTtcclxuXHJcbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlcXVlc3QucmVzdWx0O1xyXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3Qub25lcnJvciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxUZXh0XHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDYWNoZUVudHJ5Pn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgcXVlcnkob3JpZ2luYWxUZXh0KSB7XHJcbiAgICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBVdGlscy5zdHJpbmdUb1NIQTFTdHJpbmcob3JpZ2luYWxUZXh0KTtcclxuXHJcbiAgICAgIGxldCB0cmFuc2xhdGlvbiA9IHRoaXMuY2FjaGUuZ2V0KGhhc2gpO1xyXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHJldHVybiB0cmFuc2xhdGlvbjtcclxuXHJcbiAgICAgIHRyYW5zbGF0aW9uID0gYXdhaXQgdGhpcy4jcXVlcnlJbkRCKGhhc2gpO1xyXG4gICAgICBpZiAodHJhbnNsYXRpb24pIHRoaXMuY2FjaGUuc2V0KGhhc2gsIHRyYW5zbGF0aW9uKTtcclxuXHJcbiAgICAgIHJldHVybiB0cmFuc2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0NhY2hlRW50cnl9IGRhdGFcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyAjYWRkSW5EYihkYXRhKSB7XHJcbiAgICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGlmICghdGhpcy5kYikgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xyXG5cclxuICAgICAgICBjb25zdCBzdG9yYWdlTmFtZSA9IENhY2hlLmdldENhY2hlU3RvcmFnZU5hbWUoKTtcclxuICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IHRoaXMuZGJcclxuICAgICAgICAgIC50cmFuc2FjdGlvbihbc3RvcmFnZU5hbWVdLCBcInJlYWR3cml0ZVwiKVxyXG4gICAgICAgICAgLm9iamVjdFN0b3JlKHN0b3JhZ2VOYW1lKTtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gb2JqZWN0U3RvcmUucHV0KGRhdGEpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsVGV4dFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0ZWRUZXh0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGV0ZWN0ZWRMYW5ndWFnZVxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGFkZChvcmlnaW5hbFRleHQsIHRyYW5zbGF0ZWRUZXh0LCBkZXRlY3RlZExhbmd1YWdlID0gXCJ1bmRcIikge1xyXG4gICAgICBjb25zdCBoYXNoID0gYXdhaXQgVXRpbHMuc3RyaW5nVG9TSEExU3RyaW5nKG9yaWdpbmFsVGV4dCk7XHJcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLiNhZGRJbkRiKHtcclxuICAgICAgICBvcmlnaW5hbFRleHQsXHJcbiAgICAgICAgdHJhbnNsYXRlZFRleHQsXHJcbiAgICAgICAgZGV0ZWN0ZWRMYW5ndWFnZSxcclxuICAgICAgICBrZXk6IGhhc2gsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2xhdGlvblNlcnZpY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0RGF0YUJhc2VOYW1lKHRyYW5zbGF0aW9uU2VydmljZSwgc291cmNlTGFuZ3VhZ2UsIHRhcmdldExhbmd1YWdlKSB7XHJcbiAgICAgIHJldHVybiBgJHt0cmFuc2xhdGlvblNlcnZpY2V9QCR7c291cmNlTGFuZ3VhZ2V9LiR7dGFyZ2V0TGFuZ3VhZ2V9YDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0Q2FjaGVTdG9yYWdlTmFtZSgpIHtcclxuICAgICAgcmV0dXJuIFwiY2FjaGVcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnNpb25cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IG9iamVjdFN0b3JhZ2VOYW1lc1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8SURCRGF0YWJhc2U+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbkluZGV4ZWRkYihuYW1lLCB2ZXJzaW9uLCBvYmplY3RTdG9yYWdlTmFtZXMpIHtcclxuICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XHJcblxyXG4gICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmluZm8ocmVxdWVzdC5yZXN1bHQpO1xyXG4gICAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3VsdCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gcmVxdWVzdC5vbmJsb2NrZWQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICAgIFwiRXJyb3Igb3BlbmluZyB0aGUgZGF0YWJhc2UsIHN3aXRjaGluZyB0byBub24tZGF0YWJhc2UgbW9kZVwiLFxyXG4gICAgICAgICAgICBldmVudFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBkYiA9IHJlcXVlc3QucmVzdWx0O1xyXG5cclxuICAgICAgICAgIGZvciAoY29uc3Qgc3RvcmFnZU5hbWUgb2Ygb2JqZWN0U3RvcmFnZU5hbWVzKSB7XHJcbiAgICAgICAgICAgIGRiLmNyZWF0ZU9iamVjdFN0b3JlKHN0b3JhZ2VOYW1lLCB7XHJcbiAgICAgICAgICAgICAga2V5UGF0aDogXCJrZXlcIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPElEQkRhdGFiYXNlPn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5EYXRhQmFzZUNhY2hlKFxyXG4gICAgICB0cmFuc2xhdGlvblNlcnZpY2UsXHJcbiAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICB0YXJnZXRMYW5ndWFnZVxyXG4gICAgKSB7XHJcbiAgICAgIGNvbnN0IGRiTmFtZSA9IENhY2hlLmdldERhdGFCYXNlTmFtZShcclxuICAgICAgICB0cmFuc2xhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAgKTtcclxuICAgICAgY29uc3Qgc3RvcmFnZU5hbWUgPSBDYWNoZS5nZXRDYWNoZVN0b3JhZ2VOYW1lKCk7XHJcbiAgICAgIGNvbnN0IGRiID0gYXdhaXQgQ2FjaGUub3BlbkluZGV4ZWRkYihkYk5hbWUsIDEsIFtzdG9yYWdlTmFtZV0pO1xyXG4gICAgICByZXR1cm4gZGI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZGVsZXRlRGF0YWJhc2UoXHJcbiAgICAgIHRyYW5zbGF0aW9uU2VydmljZSxcclxuICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgIHRhcmdldExhbmd1YWdlXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGRiTmFtZSA9IENhY2hlLmdldERhdGFCYXNlTmFtZShcclxuICAgICAgICAgICAgdHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICAgICAgdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLmRlbGV0ZURhdGFiYXNlKGRiTmFtZSk7XHJcblxyXG4gICAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBDYWNoZUxpc3Qge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIC8qKiBAdHlwZSB7TWFwPHN0cmluZywgQ2FjaGU+fSAqL1xyXG4gICAgICB0aGlzLmxpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy4jb3BlbkNhY2hlTGlzdCgpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICNvcGVuQ2FjaGVMaXN0KCkge1xyXG4gICAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4oXCJjYWNoZUxpc3RcIiwgMSk7XHJcblxyXG4gICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZGJDYWNoZUxpc3QgPSByZXF1ZXN0LnJlc3VsdDtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goKGNhY2hlLCBrZXkpID0+IHtcclxuICAgICAgICAgIHRoaXMuI2FkZENhY2hlTGlzdChrZXkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gcmVxdWVzdC5vbmJsb2NrZWQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igb3BlbmluZyB0aGUgZGF0YWJhc2VcIiwgZXZlbnQpO1xyXG4gICAgICAgIHRoaXMuZGJDYWNoZUxpc3QgPSBudWxsO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICBjb25zdCBkYiA9IHJlcXVlc3QucmVzdWx0O1xyXG5cclxuICAgICAgICBkYi5jcmVhdGVPYmplY3RTdG9yZShcImNhY2hlX2xpc3RcIiwge1xyXG4gICAgICAgICAga2V5UGF0aDogXCJkYk5hbWVcIixcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGJOYW1lXHJcbiAgICAgKi9cclxuICAgICNhZGRDYWNoZUxpc3QoZGJOYW1lKSB7XHJcbiAgICAgIGlmICghdGhpcy5kYkNhY2hlTGlzdCkgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3Qgc3RvcmFnZU5hbWUgPSBcImNhY2hlX2xpc3RcIjtcclxuICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0aGlzLmRiQ2FjaGVMaXN0XHJcbiAgICAgICAgLnRyYW5zYWN0aW9uKFtzdG9yYWdlTmFtZV0sIFwicmVhZHdyaXRlXCIpXHJcbiAgICAgICAgLm9iamVjdFN0b3JlKHN0b3JhZ2VOYW1lKTtcclxuICAgICAgY29uc3QgcmVxdWVzdCA9IG9iamVjdFN0b3JlLnB1dCh7IGRiTmFtZSB9KTtcclxuXHJcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7fTtcclxuXHJcbiAgICAgIHJlcXVlc3Qub25lcnJvciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQpO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2xhdGlvblNlcnZpY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxDYWNoZT59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jICNjcmVhdGVDYWNoZSh0cmFuc2xhdGlvblNlcnZpY2UsIHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSkge1xyXG4gICAgICBjb25zdCBjYWNoZSA9IG5ldyBDYWNoZShcclxuICAgICAgICB0cmFuc2xhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAgKTtcclxuICAgICAgdGhpcy4jYWRkQ2FjaGUodHJhbnNsYXRpb25TZXJ2aWNlLCBzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIGNhY2hlKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBjYWNoZS5zdGFydCgpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2FjaGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPENhY2hlPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZ2V0Q2FjaGUodHJhbnNsYXRpb25TZXJ2aWNlLCBzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UpIHtcclxuICAgICAgY29uc3QgZGJOYW1lID0gQ2FjaGUuZ2V0RGF0YUJhc2VOYW1lKFxyXG4gICAgICAgIHRyYW5zbGF0aW9uU2VydmljZSxcclxuICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICB0YXJnZXRMYW5ndWFnZVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBjYWNoZSA9IHRoaXMubGlzdC5nZXQoZGJOYW1lKTtcclxuICAgICAgaWYgKGNhY2hlKSB7XHJcbiAgICAgICAgYXdhaXQgY2FjaGUucHJvbWlzZVN0YXJ0aW5nQ2FjaGU7XHJcbiAgICAgICAgcmV0dXJuIGNhY2hlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLiNjcmVhdGVDYWNoZShcclxuICAgICAgICAgIHRyYW5zbGF0aW9uU2VydmljZSxcclxuICAgICAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgICAgdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAqIEBwYXJhbSB7Q2FjaGV9IGNhY2hlXHJcbiAgICAgKi9cclxuICAgICNhZGRDYWNoZSh0cmFuc2xhdGlvblNlcnZpY2UsIHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgY2FjaGUpIHtcclxuICAgICAgY29uc3QgZGJOYW1lID0gQ2FjaGUuZ2V0RGF0YUJhc2VOYW1lKFxyXG4gICAgICAgIHRyYW5zbGF0aW9uU2VydmljZSxcclxuICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICB0YXJnZXRMYW5ndWFnZVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmxpc3Quc2V0KGRiTmFtZSwgY2FjaGUpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuI2FkZENhY2hlTGlzdChkYk5hbWUpO1xyXG4gICAgICB9IGNhdGNoIHt9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nW10+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyAjZ2V0QWxsREJOYW1lcygpIHtcclxuICAgICAgaWYgKCF0aGlzLmRiQ2FjaGVMaXN0KSByZXR1cm4gW107XHJcbiAgICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0b3JhZ2VOYW1lID0gXCJjYWNoZV9saXN0XCI7XHJcbiAgICAgICAgY29uc3Qgb2JqZWN0U3RvcmUgPSB0aGlzLmRiQ2FjaGVMaXN0XHJcbiAgICAgICAgICAudHJhbnNhY3Rpb24oW3N0b3JhZ2VOYW1lXSwgXCJyZWFkb25seVwiKVxyXG4gICAgICAgICAgLm9iamVjdFN0b3JlKHN0b3JhZ2VOYW1lKTtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gb2JqZWN0U3RvcmUuZ2V0QWxsS2V5cygpO1xyXG5cclxuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgLy8gVE9ETyB0aGlzIGNhc3QgaXMgcmVhbHkgbmVjZXNzYXJ5P1xyXG4gICAgICAgICAgLy9jYXN0XHJcbiAgICAgICAgICByZXNvbHZlKC8qKiBAdHlwZSB7c3RyaW5nW119ICovIChyZXF1ZXN0LnJlc3VsdCkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3Qub25lcnJvciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihldmVudCk7XHJcbiAgICAgICAgICByZXNvbHZlKFtdKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgZGVsZXRlQWxsKCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8UHJvbWlzZT59ICovXHJcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaCgoY2FjaGUsIGtleSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNhY2hlKSBjYWNoZS5jbG9zZSgpO1xyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChDYWNoZUxpc3QuZGVsZXRlRGF0YWJhc2Uoa2V5KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5saXN0LmNsZWFyKCk7XHJcbiAgICAgICAgY29uc3QgZGJuYW1lcyA9IGF3YWl0IHRoaXMuI2dldEFsbERCTmFtZXMoKTtcclxuICAgICAgICBkYm5hbWVzLmZvckVhY2goKGRiTmFtZSkgPT4ge1xyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChDYWNoZUxpc3QuZGVsZXRlRGF0YWJhc2UoZGJOYW1lKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGRlbGV0ZURhdGFiYXNlKGRiTmFtZSkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBEQkRlbGV0ZVJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UoZGJOYW1lKTtcclxuXHJcbiAgICAgICAgREJEZWxldGVSZXF1ZXN0Lm9uc3VjY2VzcyA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIkRhdGFiYXNlIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBEQkRlbGV0ZVJlcXVlc3Qub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybihcIkVycm9yIGRlbGV0aW5nIGRhdGFiYXNlLlwiKTtcclxuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgY2FsY3VsYXRlU2l6ZSgpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvKiogQHR5cGUge0FycmF5PFByb21pc2U+fSAqL1xyXG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XHJcbiAgICAgICAgY29uc3QgZGJuYW1lcyA9IGF3YWl0IHRoaXMuI2dldEFsbERCTmFtZXMoKTtcclxuICAgICAgICBkYm5hbWVzLmZvckVhY2goKGRiTmFtZSkgPT4ge1xyXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChVdGlscy5nZXREYXRhYmFzZVNpemUoZGJOYW1lKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgICAgICByZXR1cm4gVXRpbHMuaHVtYW5SZWFkYWJsZVNpemUoXHJcbiAgICAgICAgICByZXN1bHRzLnJlZHVjZSgodG90YWwsIHNpemUpID0+IHRvdGFsICsgc2l6ZSwgMClcclxuICAgICAgICApO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICByZXR1cm4gVXRpbHMuaHVtYW5SZWFkYWJsZVNpemUoMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGNhY2hlTGlzdCA9IG5ldyBDYWNoZUxpc3QoKTtcclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhbnNsYXRpb25TZXJ2aWNlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsVGV4dFxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPENhY2hlRW50cnk+fVxyXG4gICAqL1xyXG4gIHRyYW5zbGF0aW9uQ2FjaGUuZ2V0ID0gYXN5bmMgKFxyXG4gICAgdHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgIG9yaWdpbmFsVGV4dFxyXG4gICkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgY2FjaGUgPSBhd2FpdCBjYWNoZUxpc3QuZ2V0Q2FjaGUoXHJcbiAgICAgICAgdHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgIHRhcmdldExhbmd1YWdlXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBhd2FpdCBjYWNoZS5xdWVyeShvcmlnaW5hbFRleHQpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXRMYW5ndWFnZVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFRleHRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhbnNsYXRlZFRleHRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGV0ZWN0ZWRMYW5ndWFnZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxyXG4gICAqL1xyXG4gIHRyYW5zbGF0aW9uQ2FjaGUuc2V0ID0gYXN5bmMgKFxyXG4gICAgdHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgIG9yaWdpbmFsVGV4dCxcclxuICAgIHRyYW5zbGF0ZWRUZXh0LFxyXG4gICAgZGV0ZWN0ZWRMYW5ndWFnZVxyXG4gICkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgY2FjaGUgPSBhd2FpdCBjYWNoZUxpc3QuZ2V0Q2FjaGUoXHJcbiAgICAgICAgdHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgIHRhcmdldExhbmd1YWdlXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBhd2FpdCBjYWNoZS5hZGQob3JpZ2luYWxUZXh0LCB0cmFuc2xhdGVkVGV4dCwgZGV0ZWN0ZWRMYW5ndWFnZSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlbG9hZFxyXG4gICAqL1xyXG4gIHRyYW5zbGF0aW9uQ2FjaGUuZGVsZXRlVHJhbnNsYXRpb25DYWNoZSA9IGFzeW5jIChyZWxvYWQgPSBmYWxzZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKGluZGV4ZWREQiAmJiBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UpIHtcclxuICAgICAgICBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UoXCJnb29nbGVDYWNoZVwiKTtcclxuICAgICAgICBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UoXCJ5YW5kZXhDYWNoZVwiKTtcclxuICAgICAgICBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UoXCJiaW5nQ2FjaGVcIik7XHJcbiAgICAgIH1cclxuICAgICAgYXdhaXQgY2FjaGVMaXN0LmRlbGV0ZUFsbCgpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaWYgKHJlbG9hZCkgY2hyb21lLnJ1bnRpbWUucmVsb2FkKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgbGV0IHByb21pc2VDYWxjdWxhdGluZ1N0b3JhZ2UgPSBudWxsO1xyXG4gIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRDYWNoZVNpemVcIikge1xyXG4gICAgICBpZiAoIXByb21pc2VDYWxjdWxhdGluZ1N0b3JhZ2UpIHtcclxuICAgICAgICBwcm9taXNlQ2FsY3VsYXRpbmdTdG9yYWdlID0gY2FjaGVMaXN0LmNhbGN1bGF0ZVNpemUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHJvbWlzZUNhbGN1bGF0aW5nU3RvcmFnZVxyXG4gICAgICAgIC50aGVuKChzaXplKSA9PiB7XHJcbiAgICAgICAgICBwcm9taXNlQ2FsY3VsYXRpbmdTdG9yYWdlID0gbnVsbDtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZShzaXplKTtcclxuICAgICAgICAgIHJldHVybiBzaXplO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKVxyXG4gICAgICAgICAgcHJvbWlzZUNhbGN1bGF0aW5nU3RvcmFnZSA9IG51bGw7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoXCIwQlwiKTtcclxuICAgICAgICAgIHJldHVybiBcIjBCXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJkZWxldGVUcmFuc2xhdGlvbkNhY2hlXCIpIHtcclxuICAgICAgdHJhbnNsYXRpb25DYWNoZS5kZWxldGVUcmFuc2xhdGlvbkNhY2hlKHJlcXVlc3QucmVsb2FkKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHRyYW5zbGF0aW9uQ2FjaGU7XHJcbn0p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
