"use strict";

function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

const translationService = function () {
  const translationService = {};

  class Utils {
    /**
     *
     * @param {string} unsafe
     * @returns {string}
     */
    static escapeHTML(unsafe) {
      return unsafe.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;");
    }
    /**
     *
     * @param {string} unsafe
     * @returns {string}
     */


    static unescapeHTML(unsafe) {
      return unsafe.replace(/\&amp;/g, "&").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace(/\&quot;/g, '"').replace(/\&\#39;/g, "'");
    }

  }

  class GoogleHelper {
    static get googleTranslateTKK() {
      return "448487.932609646";
    }
    /**
     *
     * @param {number} num
     * @param {string} optString
     * @returns {number}
     */


    static shiftLeftOrRightThenSumOrXor(num, optString) {
      for (let i = 0; i < optString.length - 2; i += 3) {
        /** @type {string|number} */
        let acc = optString.charAt(i + 2);

        if ("a" <= acc) {
          acc = acc.charCodeAt(0) - 87;
        } else {
          acc = Number(acc);
        }

        if (optString.charAt(i + 1) == "+") {
          acc = num >>> acc;
        } else {
          acc = num << acc;
        }

        if (optString.charAt(i) == "+") {
          num += acc & 4294967295;
        } else {
          num ^= acc;
        }
      }

      return num;
    }
    /**
     *
     * @param {string} query
     * @returns {Array<number>}
     */


    static transformQuery(query) {
      /** @type {Array<number>} */
      const bytesArray = [];
      let idx = 0;

      for (let i = 0; i < query.length; i++) {
        let charCode = query.charCodeAt(i);

        if (128 > charCode) {
          bytesArray[idx++] = charCode;
        } else {
          if (2048 > charCode) {
            bytesArray[idx++] = charCode >> 6 | 192;
          } else {
            if (55296 == (charCode & 64512) && i + 1 < query.length && 56320 == (query.charCodeAt(i + 1) & 64512)) {
              charCode = 65536 + ((charCode & 1023) << 10) + (query.charCodeAt(++i) & 1023);
              bytesArray[idx++] = charCode >> 18 | 240;
              bytesArray[idx++] = charCode >> 12 & 63 | 128;
            } else {
              bytesArray[idx++] = charCode >> 12 | 224;
            }

            bytesArray[idx++] = charCode >> 6 & 63 | 128;
          }

          bytesArray[idx++] = charCode & 63 | 128;
        }
      }

      return bytesArray;
    }
    /**
     *
     * @param {string} query
     * @returns {string}
     */


    static calcHash(query) {
      const windowTkk = GoogleHelper.googleTranslateTKK;
      const tkkSplited = windowTkk.split(".");
      const tkkIndex = Number(tkkSplited[0]) || 0;
      const tkkKey = Number(tkkSplited[1]) || 0;
      const bytesArray = GoogleHelper.transformQuery(query);
      let encondingRound = tkkIndex;

      for (const item of bytesArray) {
        encondingRound += item;
        encondingRound = GoogleHelper.shiftLeftOrRightThenSumOrXor(encondingRound, "+-a^+6");
      }

      encondingRound = GoogleHelper.shiftLeftOrRightThenSumOrXor(encondingRound, "+-3^+b+-f");
      encondingRound ^= tkkKey;

      if (encondingRound <= 0) {
        encondingRound = (encondingRound & 2147483647) + 2147483648;
      }

      const normalizedResult = encondingRound % 1000000;
      return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex);
    }

  }

  class YandexHelper {
    /** @type {number} */

    /** @type {string} */

    /** @type {boolean} */

    /** @type {Promise<void>} */
    static get translateSid() {
      return _classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _translateSid);
    }
    /**
     *
     * @returns {Promise<void>}
     */


    static async findSID() {
      if (_classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _findPromise)) return await _classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _findPromise);

      _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _findPromise, new Promise(resolve => {
        let updateYandexSid = false;

        if (_classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _lastRequestSidTime)) {
          const date = new Date();

          if (_classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _translateSid)) {
            date.setHours(date.getHours() - 12);
          } else if (_classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _SIDNotFound)) {
            date.setMinutes(date.getMinutes() - 30);
          } else {
            date.setMinutes(date.getMinutes() - 2);
          }

          if (date.getTime() > _classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _lastRequestSidTime)) {
            updateYandexSid = true;
          }
        } else {
          updateYandexSid = true;
        }

        if (updateYandexSid) {
          _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _lastRequestSidTime, Date.now());

          const http = new XMLHttpRequest();
          http.open("GET", "https://translate.yandex.net/website-widget/v1/widget.js?widgetId=ytWidget&pageLang=es&widgetTheme=light&autoMode=false");
          http.send();

          http.onload = e => {
            const result = http.responseText.match(/sid\:\s\'[0-9a-f\.]+/);

            if (result && result[0] && result[0].length > 7) {
              _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _translateSid, result[0].substring(6));

              _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _SIDNotFound, false);
            } else {
              _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _SIDNotFound, true);
            }

            resolve();
          };

          http.onerror = http.onabort = http.ontimeout = e => {
            console.error(e);
            resolve();
          };
        } else {
          resolve();
        }
      }));

      _classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _findPromise).finally(() => {
        _classStaticPrivateFieldSpecSet(YandexHelper, YandexHelper, _findPromise, null);
      });

      return await _classStaticPrivateFieldSpecGet(YandexHelper, YandexHelper, _findPromise);
    }

  }

  var _lastRequestSidTime = {
    writable: true,
    value: null
  };
  var _translateSid = {
    writable: true,
    value: null
  };
  var _SIDNotFound = {
    writable: true,
    value: false
  };
  var _findPromise = {
    writable: true,
    value: null
  };

  class BingHelper {
    /** @type {number} */

    /** @type {string} */

    /** @type {string} */

    /** @type {boolean} */

    /** @type {Promise<void>} */
    static get translateSid() {
      return _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _translateSid2);
    }

    static get translate_IID_IG() {
      return _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _translate_IID_IG);
    }
    /**
     *
     * @returns {Promise<void>}
     */


    static async findSID() {
      if (_classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _sidPromise)) return await _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _sidPromise);

      _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _sidPromise, new Promise(resolve => {
        let updateYandexSid = false;

        if (_classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _lastRequestSidTime2)) {
          const date = new Date();

          if (_classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _translateSid2)) {
            date.setHours(date.getHours() - 12);
          } else if (_classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _SIDNotFound2)) {
            date.setMinutes(date.getMinutes() - 30);
          } else {
            date.setMinutes(date.getMinutes() - 2);
          }

          if (date.getTime() > _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _lastRequestSidTime2)) {
            updateYandexSid = true;
          }
        } else {
          updateYandexSid = true;
        }

        if (updateYandexSid) {
          _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _lastRequestSidTime2, Date.now());

          const http = new XMLHttpRequest();
          http.open("GET", "https://www.bing.com/translator");
          http.send();

          http.onload = e => {
            const result = http.responseText.match(/params_RichTranslateHelper\s=\s\[[^\]]+/);
            const data_iid_r = http.responseText.match(/data-iid\=\"[a-zA-Z0-9\.]+/);
            const IG_r = http.responseText.match(/IG\:\"[a-zA-Z0-9\.]+/);

            if (result && result[0] && result[0].length > 50 && data_iid_r && data_iid_r[0] && IG_r && IG_r[0]) {
              const params_RichTranslateHelper = result[0].substring("params_RichTranslateHelper = [".length).split(",");
              const data_iid = data_iid_r[0].substring('data-iid="'.length);
              const IG = IG_r[0].substring('IG:"'.length);

              if (params_RichTranslateHelper && params_RichTranslateHelper[0] && params_RichTranslateHelper[1] && parseInt(params_RichTranslateHelper[0]) && data_iid && IG) {
                _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _translateSid2, `&token=${params_RichTranslateHelper[1].substring(1, params_RichTranslateHelper[1].length - 1)}&key=${parseInt(params_RichTranslateHelper[0])}`);

                _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _translate_IID_IG, `IG=${IG}&IID=${data_iid}`);

                _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _SIDNotFound2, false);
              } else {
                _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _SIDNotFound2, true);
              }
            } else {
              _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _SIDNotFound2, true);
            }

            resolve();
          };

          http.onerror = http.onabort = http.ontimeout = e => {
            console.error(e);
            resolve();
          };
        } else {
          resolve();
        }
      }));

      _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _sidPromise).finally(() => {
        _classStaticPrivateFieldSpecSet(BingHelper, BingHelper, _sidPromise, null);
      });

      return await _classStaticPrivateFieldSpecGet(BingHelper, BingHelper, _sidPromise);
    }

  }

  var _lastRequestSidTime2 = {
    writable: true,
    value: null
  };
  var _translateSid2 = {
    writable: true,
    value: null
  };
  var _translate_IID_IG = {
    writable: true,
    value: null
  };
  var _SIDNotFound2 = {
    writable: true,
    value: false
  };
  var _sidPromise = {
    writable: true,
    value: null
  };

  class Service {
    /**
     * @callback Callback_cbParameters
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @param {Array<TranslationInfo>} requests
     * @returns {string}
     */

    /**
     * @callback callback_cbTransformRequest
     * @param {string[]} sourceArray2d
     * @returns {string}
     */

    /**
     * @typedef {{text: string, detectedLanguage: string}} Service_Single_Result_Response
     */

    /**
     * @callback callback_cbParseResponse
     * @param {Object} response
     * @returns {Array<Service_Single_Result_Response>}
     */

    /**
     * @callback callback_cbTransformResponse
     * @param {String} response
     * @param {boolean} dontSortResults
     * @returns {string[]} sourceArray2d
     */

    /** @typedef {"complete" | "translating" | "error"} TranslationStatus */

    /**
     * @typedef {Object} TranslationInfo
     * @property {String} originalText
     * @property {String} translatedText
     * @property {String} detectedLanguage
     * @property {TranslationStatus} status
     * @property {Promise<void>} waitTranlate
     */

    /**
     *
     * @param {string} serviceName
     * @param {string} baseURL
     * @param {"GET" | "POST"} xhrMethod
     * @param {callback_cbTransformRequest} cbTransformRequest
     * @param {callback_cbParseResponse} cbParseResponse
     * @param {callback_cbTransformResponse} cbTransformResponse
     * @param {Callback_cbParameters} cbGetExtraParameters
     * @param {Callback_cbParameters} cbGetRequestBody
     */
    constructor(serviceName, baseURL, xhrMethod = "GET", cbTransformRequest, cbParseResponse, cbTransformResponse, cbGetExtraParameters = null, cbGetRequestBody = null) {
      this.serviceName = serviceName;
      this.baseURL = baseURL;
      this.xhrMethod = xhrMethod;
      this.cbTransformRequest = cbTransformRequest;
      this.cbParseResponse = cbParseResponse;
      this.cbTransformResponse = cbTransformResponse;
      this.cbGetExtraParameters = cbGetExtraParameters;
      this.cbGetRequestBody = cbGetRequestBody;
      /** @type {Map<string, TranslationInfo>} */

      this.translationsInProgress = new Map();
    }
    /**
     *
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @param {Array<string[]>} sourceArray3d
     * @returns {Promise<[Array<TranslationInfo[]>, TranslationInfo[]]>} requests, currentTranslationsInProgress
     */


    async getRequests(sourceLanguage, targetLanguage, sourceArray3d) {
      /** @type {Array<TranslationInfo[]>} */
      const requests = [];
      /** @type {TranslationInfo[]} */

      const currentTranslationsInProgress = [];
      let currentRequest = [];
      let currentSize = 0;

      for (const sourceArray2d of sourceArray3d) {
        const requestString = this.fixString(this.cbTransformRequest(sourceArray2d));
        const requestHash = [sourceLanguage, targetLanguage, requestString].join(", ");
        const progressInfo = this.translationsInProgress.get(requestHash);

        if (progressInfo) {
          currentTranslationsInProgress.push(progressInfo);
        } else {
          /** @type {TranslationStatus} */
          let status = "translating";
          /** @type {() => void} */

          let promise_resolve = null;
          /** @type {TranslationInfo} */

          const progressInfo = {
            originalText: requestString,
            translatedText: null,
            detectedLanguage: null,

            get status() {
              return status;
            },

            set status(_status) {
              status = _status;
              promise_resolve();
            },

            waitTranlate: new Promise(resolve => promise_resolve = resolve)
          };
          currentTranslationsInProgress.push(progressInfo);
          this.translationsInProgress.set(requestHash, progressInfo); //cast

          const cacheEntry = await translationCache.get(this.serviceName, sourceLanguage, targetLanguage, requestString);

          if (cacheEntry) {
            progressInfo.translatedText = cacheEntry.translatedText;
            progressInfo.detectedLanguage = cacheEntry.detectedLanguage;
            progressInfo.status = "complete"; //this.translationsInProgress.delete([sourceLanguage, targetLanguage, requestString])
          } else {
            currentRequest.push(progressInfo);
            currentSize += progressInfo.originalText.length;

            if (currentSize > 800) {
              requests.push(currentRequest);
              currentSize = 0;
              currentRequest = [];
            }
          }
        }
      }

      if (currentRequest.length > 0) {
        requests.push(currentRequest);
        currentRequest = [];
        currentSize = 0;
      }

      return [requests, currentTranslationsInProgress];
    }
    /**
     *
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @param {Array<TranslationInfo>} requests
     * @returns {Promise<void>}
     */


    async makeRequest(sourceLanguage, targetLanguage, requests) {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(this.xhrMethod, this.baseURL + (this.cbGetExtraParameters ? this.cbGetExtraParameters(sourceLanguage, targetLanguage, requests) : ""));
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.responseType = "json";

        xhr.onload = event => {
          resolve(xhr.response);
        };

        xhr.onerror = xhr.onabort = xhr.ontimeout = event => {
          console.error(event);
          reject();
        };

        xhr.send(this.cbGetExtraParameters ? this.cbGetRequestBody(sourceLanguage, targetLanguage, requests) : undefined);
      });
    }
    /**
     *
     * @param {string} sourceLanguage
     * @param {string} targetLanguage
     * @param {Array<string[]>} sourceArray3d
     * @param {boolean} dontSortResults
     * @returns {Promise<string[][]>}
     */


    async translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache = false, dontSortResults = false) {
      const [requests, currentTranslationsInProgress] = await this.getRequests(sourceLanguage, targetLanguage, sourceArray3d);
      /** @type {Promise<void>[]} */

      const promises = [];

      for (const request of requests) {
        promises.push(this.makeRequest(sourceLanguage, targetLanguage, request).then(response => {
          const results = this.cbParseResponse(response);

          for (const idx in request) {
            const result = results[idx];
            this.cbTransformResponse(result.text, dontSortResults); // apenas para gerar error

            const transInfo = request[idx];
            transInfo.detectedLanguage = result.detectedLanguage || "und";
            transInfo.translatedText = result.text;
            transInfo.status = "complete"; //this.translationsInProgress.delete([sourceLanguage, targetLanguage, transInfo.originalText])

            if (dontSaveInPersistentCache === false) {
              translationCache.set(this.serviceName, sourceLanguage, targetLanguage, transInfo.originalText, transInfo.translatedText, transInfo.detectedLanguage);
            }
          }
        }).catch(e => {
          console.error(e);

          for (const transInfo of request) {
            transInfo.status = "error"; //this.translationsInProgress.delete([sourceLanguage, targetLanguage, transInfo.originalText])
          }
        }));
      }

      await Promise.all(currentTranslationsInProgress.map(transInfo => transInfo.waitTranlate));
      return currentTranslationsInProgress.map(transInfo => this.cbTransformResponse(transInfo.translatedText, dontSortResults));
    }
    /**
     * https://github.com/FilipePS/Traduzir-paginas-web/issues/484
     * @param {string} str
     * @returns {string}
     */


    fixString(str) {
      return str.replace(/\u200b/g, " ");
    }

  }

  const googleService = new class extends Service {
    constructor() {
      super("google", "https://translate.googleapis.com/translate_a/t?anno=3&client=te&v=1.0&format=html", "POST", function transformRequest(sourceArray2d) {
        sourceArray2d = sourceArray2d.map(text => Utils.escapeHTML(text));

        if (sourceArray2d.length > 1) {
          sourceArray2d = sourceArray2d.map((text, index) => `<a i=${index}>${text}</a>`);
        } // the <pre> tag is to preserve the text formating


        return `<pre>${sourceArray2d.join("")}</pre>`;
      }, function parseResponse(response) {
        /** @type {[Service_Single_Result_Response]} */
        let responseJson;

        if (typeof response === "string") {
          responseJson = [{
            text: response,
            detectedLanguage: null
          }];
        } else if (typeof response[0] === "string") {
          responseJson = response.map(
          /** @returns {Service_Single_Result_Response} */
          (
          /** @type {string} */
          value) => ({
            text: value,
            detectedLanguage: null
          }));
        } else {
          responseJson = response.map(
          /** @returns {Service_Single_Result_Response} */
          (
          /** @type {[string, string]} */
          value) => ({
            text: value[0],
            detectedLanguage: value[1]
          }));
        }

        return responseJson;
      }, function transformResponse(result, dontSortResults) {
        // remove the <pre> tag from the response
        if (result.indexOf("<pre") !== -1) {
          result = result.replace("</pre>", "");
          const index = result.indexOf(">");
          result = result.slice(index + 1);
        }
        /** @type {string[]} */


        const sentences = []; // each translated sentence is inside of <b> tag
        // The main objective is to remove the original text of each sentense that is inside the <i> tags.
        // Keeping only the <a> tags

        let idx = 0;

        while (true) {
          // each translated sentence is inside of <b> tag
          const sentenceStartIndex = result.indexOf("<b>", idx);
          if (sentenceStartIndex === -1) break; // the <i> tag is the original text in each sentence

          const sentenceFinalIndex = result.indexOf("<i>", sentenceStartIndex);

          if (sentenceFinalIndex === -1) {
            sentences.push(result.slice(sentenceStartIndex + 3));
            break;
          } else {
            sentences.push(result.slice(sentenceStartIndex + 3, sentenceFinalIndex));
          }

          idx = sentenceFinalIndex;
        } // maybe the response don't have any sentence (does not have <i> and <b> tags), is this case just use de result


        result = sentences.length > 0 ? sentences.join(" ") : result; // Remove the remaining </b> tags (usually the last)

        result = result.replace(/\<\/b\>/g, ""); // Capture each <a i={number}> and put it in an array, the </a> will be ignored
        // maybe the same index appears several times
        // maybe some text will be outside of <a i={number}> (Usually text before the first <a> tag, and some whitespace between the <a> tags),
        // in this case, The outside text will be placed inside the <a i={number}> closer
        // https://github.com/FilipePS/Traduzir-paginas-web/issues/449
        // TODO lidar com tags dentro de tags e tags vazias
        // https://de.wikipedia.org/wiki/Wikipedia:Hauptseite
        // "{\"originalText\":\"<pre><a i=0>\\nFür den </a><a i=1>37. Schreib­wettbewerb</a><a i=2> und den </a><a i=3>18. Miniaturwettbewerb</a><a i=4> können ab sofort Artikel nominiert werden.</a></pre>\",\"translatedText\":\"<pre><a i=0>\\n</a>Artigos já podem ser indicados <a i=0>para o</a> <a i=1>37º Concurso de Redação <a i=2>e</a></a> <a i=3><a i=4>18º</a> Concurso de Miniaturas</a> .</pre>\",\"detectedLanguage\":\"de\",\"status\":\"complete\",\"waitTranlate\":{}}"

        let resultArray = [];
        let lastEndPos = 0;

        for (const r of result.matchAll(/(\<a\si\=[0-9]+\>)([^\<\>]*(?=\<\/a\>))*/g)) {
          const fullText = r[0];
          const fullLength = r[0].length;
          const pos = r.index; // if it is bigger then it has text outside the tags

          if (pos > lastEndPos) {
            const aTag = r[1];
            const insideText = r[2] || "";
            const outsideText = result.slice(lastEndPos, pos).replace(/\<\/a\>/g, "");
            resultArray.push(aTag + outsideText + insideText);
          } else {
            resultArray.push(fullText);
          }

          lastEndPos = pos + fullLength;
        } // captures the final text outside the <a> tag


        {
          const lastOutsideText = result.slice(lastEndPos).replace(/\<\/a\>/g, "");

          if (resultArray.length > 0) {
            resultArray[resultArray.length - 1] += lastOutsideText;
          }
        } // this is the old method, don't capture text outside of <a> tags
        // let resultArray = result.match(
        //   /\<a\si\=[0-9]+\>[^\<\>]*(?=\<\/a\>)/g
        // );

        if (dontSortResults) {
          // Should not sort the <a i={number}> of Google Translate result
          // Instead of it, join the texts without sorting
          // https://github.com/FilipePS/Traduzir-paginas-web/issues/163
          if (resultArray && resultArray.length > 0) {
            // get the text inside of <a i={number}>
            // the indexes is not needed in this case
            resultArray = resultArray.map(value => {
              const resultStartAtIndex = value.indexOf(">");
              return value.slice(resultStartAtIndex + 1);
            });
          } else {
            // maybe the response don't have any <a i={number}>
            resultArray = [result];
          } // unescapeHTML


          resultArray = resultArray.map(value => Utils.unescapeHTML(value));
          return resultArray;
        } else {
          // Sort Google translate results to keep the links with the correct name
          // Note: the links may also disappear; http://web.archive.org/web/20220919162911/https://de.wikipedia.org/wiki/Wikipedia:Hauptseite
          // each inline tag has a index starting with 0 <a i={number}>
          let indexes;

          if (resultArray && resultArray.length > 0) {
            // get the indexed of <a i={number}>
            indexes = resultArray.map(value => parseInt(value.match(/[0-9]+(?=\>)/g)[0])).filter(value => !isNaN(value)); // get the text inside of <a i={number}>

            resultArray = resultArray.map(value => {
              const resultStartAtIndex = value.indexOf(">");
              return value.slice(resultStartAtIndex + 1);
            });
          } else {
            // maybe the response don't have any <a i={number}>
            resultArray = [result];
            indexes = [0];
          } // unescapeHTML


          resultArray = resultArray.map(value => Utils.unescapeHTML(value));
          /** @type {string[]} */

          const finalResulArray = []; // sorte de results and put in finalResulArray

          for (const j in indexes) {
            if (finalResulArray[indexes[j]]) {
              finalResulArray[indexes[j]] += " " + resultArray[j];
            } else {
              finalResulArray[indexes[j]] = resultArray[j];
            }
          }

          return finalResulArray;
        }
      }, function getExtraParameters(sourceLanguage, targetLanguage, requests) {
        return `&sl=${sourceLanguage}&tl=${targetLanguage}&tk=${GoogleHelper.calcHash(requests.map(info => info.originalText).join(""))}`;
      }, function getRequestBody(sourceLanguage, targetLanguage, requests) {
        return requests.map(info => `&q=${encodeURIComponent(info.originalText)}`).join("");
      });
    }

  }();
  const yandexService = new class extends Service {
    constructor() {
      super("yandex", "https://translate.yandex.net/api/v1/tr.json/translate?srv=tr-url-widget", "GET", function transformRequest(sourceArray2d) {
        return sourceArray2d.map(value => Utils.escapeHTML(value)).join("<wbr>");
      }, function parseResponse(response) {
        const lang = response.lang;
        const detectedLanguage = lang ? lang.split("-")[0] : null;
        return response.text.map(
        /** @return {Service_Single_Result_Response} */
        (
        /** @type {string} */
        text) => ({
          text,
          detectedLanguage
        }));
      }, function transformResponse(result, dontSortResults) {
        return result.split("<wbr>").map(value => Utils.unescapeHTML(value));
      }, function getExtraParameters(sourceLanguage, targetLanguage, requests) {
        return `&id=${YandexHelper.translateSid}-0-0&format=html&lang=${sourceLanguage === "auto" ? "" : sourceLanguage + "-"}${targetLanguage}${requests.map(info => `&text=${encodeURIComponent(info.originalText)}`).join("")}`;
      }, function getRequestBody(sourceLanguage, targetLanguage, requests) {
        return undefined;
      });
    }

    async translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults = false) {
      await YandexHelper.findSID();
      if (!YandexHelper.translateSid) return;
      if (sourceLanguage.startsWith("zh")) sourceLanguage = "zh";
      if (targetLanguage.startsWith("zh")) targetLanguage = "zh";
      return await super.translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults);
    }

  }();
  const bingService = new class extends Service {
    constructor() {
      super("bing", "https://www.bing.com/ttranslatev3?isVertical=1", "POST", function transformRequest(sourceArray2d) {
        return sourceArray2d.map(value => Utils.escapeHTML(value)).join("<wbr>");
      }, function parseResponse(response) {
        return [{
          text: response[0].translations[0].text,
          detectedLanguage: response[0].detectedLanguage.language
        }];
      }, function transformResponse(result, dontSortResults) {
        return [Utils.unescapeHTML(result)];
      }, function getExtraParameters(sourceLanguage, targetLanguage, requests) {
        return `&${BingHelper.translate_IID_IG}`;
      }, function getRequestBody(sourceLanguage, targetLanguage, requests) {
        return `&fromLang=${sourceLanguage}${requests.map(info => `&text=${encodeURIComponent(info.originalText)}`).join("")}&to=${targetLanguage}${BingHelper.translateSid}`;
      });
    }

    async translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults = false) {
      /** @type {{search: string, replace: string}[]} */
      const replacements = [{
        search: "auto",
        replace: "auto-detect"
      }, {
        search: "zh-CN",
        replace: "zh-Hans"
      }, {
        search: "zh-TW",
        replace: "zh-Hant"
      }, {
        search: "tl",
        replace: "fil"
      }, {
        search: "hmn",
        replace: "mww"
      }, {
        search: "ckb",
        replace: "kmr"
      }, {
        search: "mn",
        replace: "mn-Cyrl"
      }, {
        search: "no",
        replace: "nb"
      }, {
        search: "sr",
        replace: "sr-Cyrl"
      }];
      replacements.forEach(r => {
        if (targetLanguage === r.search) {
          targetLanguage = r.replace;
        }

        if (sourceLanguage === r.search) {
          sourceLanguage = r.replace;
        }
      });
      await BingHelper.findSID();
      if (!BingHelper.translate_IID_IG) return;
      return await super.translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults);
    }

  }();
  const deeplService = new class {
    constructor() {
      this.DeepLTab = null;
    }

    async translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults = false) {
      return await new Promise(resolve => {
        const waitFirstTranslationResult = () => {
          const listener = (request, sender, sendResponse) => {
            if (request.action === "DeepL_firstTranslationResult") {
              resolve([[request.result]]);
              chrome.runtime.onMessage.removeListener(listener);
            }
          };

          chrome.runtime.onMessage.addListener(listener);
          setTimeout(() => {
            chrome.runtime.onMessage.removeListener(listener);
            resolve([[""]]);
          }, 8000);
        };

        if (this.DeepLTab) {
          chrome.tabs.get(this.DeepLTab.id, tab => {
            checkedLastError();

            if (tab) {
              //chrome.tabs.update(tab.id, {active: true})
              chrome.tabs.sendMessage(tab.id, {
                action: "translateTextWithDeepL",
                text: sourceArray3d[0][0],
                targetLanguage
              }, {
                frameId: 0
              }, response => resolve([[response]]));
            } else {
              chrome.tabs.create({
                url: `https://www.deepl.com/#!${targetLanguage}!#${encodeURIComponent(sourceArray3d[0][0])}`
              }, tab => {
                this.DeepLTab = tab;
                waitFirstTranslationResult();
              }); // resolve([[""]])
            }
          });
        } else {
          chrome.tabs.create({
            url: `https://www.deepl.com/#!${targetLanguage}!#${encodeURIComponent(sourceArray3d[0][0])}`
          }, tab => {
            this.DeepLTab = tab;
            waitFirstTranslationResult();
          }); // resolve([[""]])
        }
      });
    }

  }();
  /** @type {Map<string, Service>} */

  const serviceList = new Map();
  serviceList.set("google", googleService);
  serviceList.set("yandex", yandexService);
  serviceList.set("bing", bingService);
  serviceList.set("deepl",
  /** @type {Service} */

  /** @type {?} */
  deeplService);

  translationService.translateHTML = async (serviceName, sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache = false, dontSortResults = false) => {
    serviceName = twpLang.getAlternativeService(targetLanguage, serviceName, true);
    const service = serviceList.get(serviceName) || serviceList.get("google");
    return await service.translate(sourceLanguage, targetLanguage, sourceArray3d, dontSaveInPersistentCache, dontSortResults);
  };

  translationService.translateText = async (serviceName, sourceLanguage, targetLanguage, sourceArray2d, dontSaveInPersistentCache = false) => {
    serviceName = twpLang.getAlternativeService(targetLanguage, serviceName, false);
    const service = serviceList.get(serviceName) || serviceList.get("google");
    return (await service.translate(sourceLanguage, targetLanguage, [sourceArray2d], dontSaveInPersistentCache))[0];
  };

  translationService.translateSingleText = async (serviceName, sourceLanguage, targetLanguage, originalText, dontSaveInPersistentCache = false) => {
    serviceName = twpLang.getAlternativeService(targetLanguage, serviceName, false);
    const service = serviceList.get(serviceName) || serviceList.get("google");
    return (await service.translate(sourceLanguage, targetLanguage, [[originalText]], dontSaveInPersistentCache))[0][0];
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const dontSaveInPersistentCache = sender.tab ? sender.tab.incognito : false;

    if (request.action === "translateHTML") {
      translationService.translateHTML(request.translationService, "auto", request.targetLanguage, request.sourceArray3d, dontSaveInPersistentCache, request.dontSortResults).then(results => sendResponse(results)).catch(e => {
        sendResponse();
        console.error(e);
      });
      return true;
    } else if (request.action === "translateText") {
      translationService.translateText(request.translationService, "auto", request.targetLanguage, request.sourceArray, dontSaveInPersistentCache).then(results => sendResponse(results)).catch(e => {
        sendResponse();
        console.error(e);
      });
      return true;
    } else if (request.action === "translateSingleText") {
      translationService.translateSingleText(request.translationService, "auto", request.targetLanguage, request.source, dontSaveInPersistentCache).then(results => sendResponse(results)).catch(e => {
        sendResponse();
        console.error(e);
      });
      return true;
    }
  });
  return translationService;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRpb25TZXJ2aWNlLmpzIiwibmFtZXMiOlsidHJhbnNsYXRpb25TZXJ2aWNlIiwiVXRpbHMiLCJlc2NhcGVIVE1MIiwidW5zYWZlIiwicmVwbGFjZSIsInVuZXNjYXBlSFRNTCIsIkdvb2dsZUhlbHBlciIsImdvb2dsZVRyYW5zbGF0ZVRLSyIsInNoaWZ0TGVmdE9yUmlnaHRUaGVuU3VtT3JYb3IiLCJudW0iLCJvcHRTdHJpbmciLCJpIiwibGVuZ3RoIiwiYWNjIiwiY2hhckF0IiwiY2hhckNvZGVBdCIsIk51bWJlciIsInRyYW5zZm9ybVF1ZXJ5IiwicXVlcnkiLCJieXRlc0FycmF5IiwiaWR4IiwiY2hhckNvZGUiLCJjYWxjSGFzaCIsIndpbmRvd1RrayIsInRra1NwbGl0ZWQiLCJzcGxpdCIsInRra0luZGV4IiwidGtrS2V5IiwiZW5jb25kaW5nUm91bmQiLCJpdGVtIiwibm9ybWFsaXplZFJlc3VsdCIsInRvU3RyaW5nIiwiWWFuZGV4SGVscGVyIiwidHJhbnNsYXRlU2lkIiwiZmluZFNJRCIsIlByb21pc2UiLCJyZXNvbHZlIiwidXBkYXRlWWFuZGV4U2lkIiwiZGF0ZSIsIkRhdGUiLCJzZXRIb3VycyIsImdldEhvdXJzIiwic2V0TWludXRlcyIsImdldE1pbnV0ZXMiLCJnZXRUaW1lIiwibm93IiwiaHR0cCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInNlbmQiLCJvbmxvYWQiLCJlIiwicmVzdWx0IiwicmVzcG9uc2VUZXh0IiwibWF0Y2giLCJzdWJzdHJpbmciLCJvbmVycm9yIiwib25hYm9ydCIsIm9udGltZW91dCIsImNvbnNvbGUiLCJlcnJvciIsImZpbmFsbHkiLCJCaW5nSGVscGVyIiwidHJhbnNsYXRlX0lJRF9JRyIsImRhdGFfaWlkX3IiLCJJR19yIiwicGFyYW1zX1JpY2hUcmFuc2xhdGVIZWxwZXIiLCJkYXRhX2lpZCIsIklHIiwicGFyc2VJbnQiLCJTZXJ2aWNlIiwiY29uc3RydWN0b3IiLCJzZXJ2aWNlTmFtZSIsImJhc2VVUkwiLCJ4aHJNZXRob2QiLCJjYlRyYW5zZm9ybVJlcXVlc3QiLCJjYlBhcnNlUmVzcG9uc2UiLCJjYlRyYW5zZm9ybVJlc3BvbnNlIiwiY2JHZXRFeHRyYVBhcmFtZXRlcnMiLCJjYkdldFJlcXVlc3RCb2R5IiwidHJhbnNsYXRpb25zSW5Qcm9ncmVzcyIsIk1hcCIsImdldFJlcXVlc3RzIiwic291cmNlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInNvdXJjZUFycmF5M2QiLCJyZXF1ZXN0cyIsImN1cnJlbnRUcmFuc2xhdGlvbnNJblByb2dyZXNzIiwiY3VycmVudFJlcXVlc3QiLCJjdXJyZW50U2l6ZSIsInNvdXJjZUFycmF5MmQiLCJyZXF1ZXN0U3RyaW5nIiwiZml4U3RyaW5nIiwicmVxdWVzdEhhc2giLCJqb2luIiwicHJvZ3Jlc3NJbmZvIiwiZ2V0IiwicHVzaCIsInN0YXR1cyIsInByb21pc2VfcmVzb2x2ZSIsIm9yaWdpbmFsVGV4dCIsInRyYW5zbGF0ZWRUZXh0IiwiZGV0ZWN0ZWRMYW5ndWFnZSIsIl9zdGF0dXMiLCJ3YWl0VHJhbmxhdGUiLCJzZXQiLCJjYWNoZUVudHJ5IiwidHJhbnNsYXRpb25DYWNoZSIsIm1ha2VSZXF1ZXN0IiwicmVqZWN0IiwieGhyIiwic2V0UmVxdWVzdEhlYWRlciIsInJlc3BvbnNlVHlwZSIsImV2ZW50IiwicmVzcG9uc2UiLCJ1bmRlZmluZWQiLCJ0cmFuc2xhdGUiLCJkb250U2F2ZUluUGVyc2lzdGVudENhY2hlIiwiZG9udFNvcnRSZXN1bHRzIiwicHJvbWlzZXMiLCJyZXF1ZXN0IiwidGhlbiIsInJlc3VsdHMiLCJ0ZXh0IiwidHJhbnNJbmZvIiwiY2F0Y2giLCJhbGwiLCJtYXAiLCJzdHIiLCJnb29nbGVTZXJ2aWNlIiwidHJhbnNmb3JtUmVxdWVzdCIsImluZGV4IiwicGFyc2VSZXNwb25zZSIsInJlc3BvbnNlSnNvbiIsInZhbHVlIiwidHJhbnNmb3JtUmVzcG9uc2UiLCJpbmRleE9mIiwic2xpY2UiLCJzZW50ZW5jZXMiLCJzZW50ZW5jZVN0YXJ0SW5kZXgiLCJzZW50ZW5jZUZpbmFsSW5kZXgiLCJyZXN1bHRBcnJheSIsImxhc3RFbmRQb3MiLCJyIiwibWF0Y2hBbGwiLCJmdWxsVGV4dCIsImZ1bGxMZW5ndGgiLCJwb3MiLCJhVGFnIiwiaW5zaWRlVGV4dCIsIm91dHNpZGVUZXh0IiwibGFzdE91dHNpZGVUZXh0IiwicmVzdWx0U3RhcnRBdEluZGV4IiwiaW5kZXhlcyIsImZpbHRlciIsImlzTmFOIiwiZmluYWxSZXN1bEFycmF5IiwiaiIsImdldEV4dHJhUGFyYW1ldGVycyIsImluZm8iLCJnZXRSZXF1ZXN0Qm9keSIsImVuY29kZVVSSUNvbXBvbmVudCIsInlhbmRleFNlcnZpY2UiLCJsYW5nIiwic3RhcnRzV2l0aCIsImJpbmdTZXJ2aWNlIiwidHJhbnNsYXRpb25zIiwibGFuZ3VhZ2UiLCJyZXBsYWNlbWVudHMiLCJzZWFyY2giLCJmb3JFYWNoIiwiZGVlcGxTZXJ2aWNlIiwiRGVlcExUYWIiLCJ3YWl0Rmlyc3RUcmFuc2xhdGlvblJlc3VsdCIsImxpc3RlbmVyIiwic2VuZGVyIiwic2VuZFJlc3BvbnNlIiwiYWN0aW9uIiwiY2hyb21lIiwicnVudGltZSIsIm9uTWVzc2FnZSIsInJlbW92ZUxpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJzZXRUaW1lb3V0IiwidGFicyIsImlkIiwidGFiIiwiY2hlY2tlZExhc3RFcnJvciIsInNlbmRNZXNzYWdlIiwiZnJhbWVJZCIsImNyZWF0ZSIsInVybCIsInNlcnZpY2VMaXN0IiwidHJhbnNsYXRlSFRNTCIsInR3cExhbmciLCJnZXRBbHRlcm5hdGl2ZVNlcnZpY2UiLCJzZXJ2aWNlIiwidHJhbnNsYXRlVGV4dCIsInRyYW5zbGF0ZVNpbmdsZVRleHQiLCJpbmNvZ25pdG8iLCJzb3VyY2VBcnJheSIsInNvdXJjZSJdLCJzb3VyY2VzIjpbInRyYW5zbGF0aW9uU2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHRyYW5zbGF0aW9uU2VydmljZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgY29uc3QgdHJhbnNsYXRpb25TZXJ2aWNlID0ge307XHJcblxyXG4gIGNsYXNzIFV0aWxzIHtcclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1bnNhZmVcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBlc2NhcGVIVE1MKHVuc2FmZSkge1xyXG4gICAgICByZXR1cm4gdW5zYWZlXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcJi9nLCBcIiZhbXA7XCIpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcPC9nLCBcIiZsdDtcIilcclxuICAgICAgICAucmVwbGFjZSgvXFw+L2csIFwiJmd0O1wiKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXFwiL2csIFwiJnF1b3Q7XCIpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcJy9nLCBcIiYjMzk7XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1bnNhZmVcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB1bmVzY2FwZUhUTUwodW5zYWZlKSB7XHJcbiAgICAgIHJldHVybiB1bnNhZmVcclxuICAgICAgICAucmVwbGFjZSgvXFwmYW1wOy9nLCBcIiZcIilcclxuICAgICAgICAucmVwbGFjZSgvXFwmbHQ7L2csIFwiPFwiKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXCZndDsvZywgXCI+XCIpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcJnF1b3Q7L2csICdcIicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcJlxcIzM5Oy9nLCBcIidcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBHb29nbGVIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldCBnb29nbGVUcmFuc2xhdGVUS0soKSB7XHJcbiAgICAgIHJldHVybiBcIjQ0ODQ4Ny45MzI2MDk2NDZcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbnVtXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0U3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2hpZnRMZWZ0T3JSaWdodFRoZW5TdW1PclhvcihudW0sIG9wdFN0cmluZykge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdFN0cmluZy5sZW5ndGggLSAyOyBpICs9IDMpIHtcclxuICAgICAgICAvKiogQHR5cGUge3N0cmluZ3xudW1iZXJ9ICovXHJcbiAgICAgICAgbGV0IGFjYyA9IG9wdFN0cmluZy5jaGFyQXQoaSArIDIpO1xyXG4gICAgICAgIGlmIChcImFcIiA8PSBhY2MpIHtcclxuICAgICAgICAgIGFjYyA9IGFjYy5jaGFyQ29kZUF0KDApIC0gODc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGFjYyA9IE51bWJlcihhY2MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0U3RyaW5nLmNoYXJBdChpICsgMSkgPT0gXCIrXCIpIHtcclxuICAgICAgICAgIGFjYyA9IG51bSA+Pj4gYWNjO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBhY2MgPSBudW0gPDwgYWNjO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0U3RyaW5nLmNoYXJBdChpKSA9PSBcIitcIikge1xyXG4gICAgICAgICAgbnVtICs9IGFjYyAmIDQyOTQ5NjcyOTU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG51bSBePSBhY2M7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudW07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5XHJcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHRyYW5zZm9ybVF1ZXJ5KHF1ZXJ5KSB7XHJcbiAgICAgIC8qKiBAdHlwZSB7QXJyYXk8bnVtYmVyPn0gKi9cclxuICAgICAgY29uc3QgYnl0ZXNBcnJheSA9IFtdO1xyXG4gICAgICBsZXQgaWR4ID0gMDtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBjaGFyQ29kZSA9IHF1ZXJ5LmNoYXJDb2RlQXQoaSk7XHJcblxyXG4gICAgICAgIGlmICgxMjggPiBjaGFyQ29kZSkge1xyXG4gICAgICAgICAgYnl0ZXNBcnJheVtpZHgrK10gPSBjaGFyQ29kZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKDIwNDggPiBjaGFyQ29kZSkge1xyXG4gICAgICAgICAgICBieXRlc0FycmF5W2lkeCsrXSA9IChjaGFyQ29kZSA+PiA2KSB8IDE5MjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICA1NTI5NiA9PSAoY2hhckNvZGUgJiA2NDUxMikgJiZcclxuICAgICAgICAgICAgICBpICsgMSA8IHF1ZXJ5Lmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAgIDU2MzIwID09IChxdWVyeS5jaGFyQ29kZUF0KGkgKyAxKSAmIDY0NTEyKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICBjaGFyQ29kZSA9XHJcbiAgICAgICAgICAgICAgICA2NTUzNiArXHJcbiAgICAgICAgICAgICAgICAoKGNoYXJDb2RlICYgMTAyMykgPDwgMTApICtcclxuICAgICAgICAgICAgICAgIChxdWVyeS5jaGFyQ29kZUF0KCsraSkgJiAxMDIzKTtcclxuICAgICAgICAgICAgICBieXRlc0FycmF5W2lkeCsrXSA9IChjaGFyQ29kZSA+PiAxOCkgfCAyNDA7XHJcbiAgICAgICAgICAgICAgYnl0ZXNBcnJheVtpZHgrK10gPSAoKGNoYXJDb2RlID4+IDEyKSAmIDYzKSB8IDEyODtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBieXRlc0FycmF5W2lkeCsrXSA9IChjaGFyQ29kZSA+PiAxMikgfCAyMjQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnl0ZXNBcnJheVtpZHgrK10gPSAoKGNoYXJDb2RlID4+IDYpICYgNjMpIHwgMTI4O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnl0ZXNBcnJheVtpZHgrK10gPSAoY2hhckNvZGUgJiA2MykgfCAxMjg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBieXRlc0FycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeVxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNhbGNIYXNoKHF1ZXJ5KSB7XHJcbiAgICAgIGNvbnN0IHdpbmRvd1RrayA9IEdvb2dsZUhlbHBlci5nb29nbGVUcmFuc2xhdGVUS0s7XHJcbiAgICAgIGNvbnN0IHRra1NwbGl0ZWQgPSB3aW5kb3dUa2suc3BsaXQoXCIuXCIpO1xyXG4gICAgICBjb25zdCB0a2tJbmRleCA9IE51bWJlcih0a2tTcGxpdGVkWzBdKSB8fCAwO1xyXG4gICAgICBjb25zdCB0a2tLZXkgPSBOdW1iZXIodGtrU3BsaXRlZFsxXSkgfHwgMDtcclxuXHJcbiAgICAgIGNvbnN0IGJ5dGVzQXJyYXkgPSBHb29nbGVIZWxwZXIudHJhbnNmb3JtUXVlcnkocXVlcnkpO1xyXG5cclxuICAgICAgbGV0IGVuY29uZGluZ1JvdW5kID0gdGtrSW5kZXg7XHJcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBieXRlc0FycmF5KSB7XHJcbiAgICAgICAgZW5jb25kaW5nUm91bmQgKz0gaXRlbTtcclxuICAgICAgICBlbmNvbmRpbmdSb3VuZCA9IEdvb2dsZUhlbHBlci5zaGlmdExlZnRPclJpZ2h0VGhlblN1bU9yWG9yKFxyXG4gICAgICAgICAgZW5jb25kaW5nUm91bmQsXHJcbiAgICAgICAgICBcIistYV4rNlwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbmNvbmRpbmdSb3VuZCA9IEdvb2dsZUhlbHBlci5zaGlmdExlZnRPclJpZ2h0VGhlblN1bU9yWG9yKFxyXG4gICAgICAgIGVuY29uZGluZ1JvdW5kLFxyXG4gICAgICAgIFwiKy0zXitiKy1mXCJcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGVuY29uZGluZ1JvdW5kIF49IHRra0tleTtcclxuICAgICAgaWYgKGVuY29uZGluZ1JvdW5kIDw9IDApIHtcclxuICAgICAgICBlbmNvbmRpbmdSb3VuZCA9IChlbmNvbmRpbmdSb3VuZCAmIDIxNDc0ODM2NDcpICsgMjE0NzQ4MzY0ODtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgbm9ybWFsaXplZFJlc3VsdCA9IGVuY29uZGluZ1JvdW5kICUgMTAwMDAwMDtcclxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRSZXN1bHQudG9TdHJpbmcoKSArIFwiLlwiICsgKG5vcm1hbGl6ZWRSZXN1bHQgXiB0a2tJbmRleCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBZYW5kZXhIZWxwZXIge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBzdGF0aWMgI2xhc3RSZXF1ZXN0U2lkVGltZSA9IG51bGw7XHJcbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICAgIHN0YXRpYyAjdHJhbnNsYXRlU2lkID0gbnVsbDtcclxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuICAgIHN0YXRpYyAjU0lETm90Rm91bmQgPSBmYWxzZTtcclxuICAgIC8qKiBAdHlwZSB7UHJvbWlzZTx2b2lkPn0gKi9cclxuICAgIHN0YXRpYyAjZmluZFByb21pc2UgPSBudWxsO1xyXG5cclxuICAgIHN0YXRpYyBnZXQgdHJhbnNsYXRlU2lkKCkge1xyXG4gICAgICByZXR1cm4gWWFuZGV4SGVscGVyLiN0cmFuc2xhdGVTaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBmaW5kU0lEKCkge1xyXG4gICAgICBpZiAoWWFuZGV4SGVscGVyLiNmaW5kUHJvbWlzZSkgcmV0dXJuIGF3YWl0IFlhbmRleEhlbHBlci4jZmluZFByb21pc2U7XHJcbiAgICAgIFlhbmRleEhlbHBlci4jZmluZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGxldCB1cGRhdGVZYW5kZXhTaWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAoWWFuZGV4SGVscGVyLiNsYXN0UmVxdWVzdFNpZFRpbWUpIHtcclxuICAgICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgaWYgKFlhbmRleEhlbHBlci4jdHJhbnNsYXRlU2lkKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChZYW5kZXhIZWxwZXIuI1NJRE5vdEZvdW5kKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSAtIDMwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSAtIDIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGRhdGUuZ2V0VGltZSgpID4gWWFuZGV4SGVscGVyLiNsYXN0UmVxdWVzdFNpZFRpbWUpIHtcclxuICAgICAgICAgICAgdXBkYXRlWWFuZGV4U2lkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdXBkYXRlWWFuZGV4U2lkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh1cGRhdGVZYW5kZXhTaWQpIHtcclxuICAgICAgICAgIFlhbmRleEhlbHBlci4jbGFzdFJlcXVlc3RTaWRUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICBodHRwLm9wZW4oXHJcbiAgICAgICAgICAgIFwiR0VUXCIsXHJcbiAgICAgICAgICAgIFwiaHR0cHM6Ly90cmFuc2xhdGUueWFuZGV4Lm5ldC93ZWJzaXRlLXdpZGdldC92MS93aWRnZXQuanM/d2lkZ2V0SWQ9eXRXaWRnZXQmcGFnZUxhbmc9ZXMmd2lkZ2V0VGhlbWU9bGlnaHQmYXV0b01vZGU9ZmFsc2VcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGh0dHAuc2VuZCgpO1xyXG4gICAgICAgICAgaHR0cC5vbmxvYWQgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBodHRwLnJlc3BvbnNlVGV4dC5tYXRjaCgvc2lkXFw6XFxzXFwnWzAtOWEtZlxcLl0rLyk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0WzBdICYmIHJlc3VsdFswXS5sZW5ndGggPiA3KSB7XHJcbiAgICAgICAgICAgICAgWWFuZGV4SGVscGVyLiN0cmFuc2xhdGVTaWQgPSByZXN1bHRbMF0uc3Vic3RyaW5nKDYpO1xyXG4gICAgICAgICAgICAgIFlhbmRleEhlbHBlci4jU0lETm90Rm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBZYW5kZXhIZWxwZXIuI1NJRE5vdEZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgaHR0cC5vbmVycm9yID1cclxuICAgICAgICAgICAgaHR0cC5vbmFib3J0ID1cclxuICAgICAgICAgICAgaHR0cC5vbnRpbWVvdXQgPVxyXG4gICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgWWFuZGV4SGVscGVyLiNmaW5kUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICBZYW5kZXhIZWxwZXIuI2ZpbmRQcm9taXNlID0gbnVsbDtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYXdhaXQgWWFuZGV4SGVscGVyLiNmaW5kUHJvbWlzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIEJpbmdIZWxwZXIge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBzdGF0aWMgI2xhc3RSZXF1ZXN0U2lkVGltZSA9IG51bGw7XHJcbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICAgIHN0YXRpYyAjdHJhbnNsYXRlU2lkID0gbnVsbDtcclxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gICAgc3RhdGljICN0cmFuc2xhdGVfSUlEX0lHID0gbnVsbDtcclxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuICAgIHN0YXRpYyAjU0lETm90Rm91bmQgPSBmYWxzZTtcclxuICAgIC8qKiBAdHlwZSB7UHJvbWlzZTx2b2lkPn0gKi9cclxuICAgIHN0YXRpYyAjc2lkUHJvbWlzZSA9IG51bGw7XHJcblxyXG4gICAgc3RhdGljIGdldCB0cmFuc2xhdGVTaWQoKSB7XHJcbiAgICAgIHJldHVybiBCaW5nSGVscGVyLiN0cmFuc2xhdGVTaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldCB0cmFuc2xhdGVfSUlEX0lHKCkge1xyXG4gICAgICByZXR1cm4gQmluZ0hlbHBlci4jdHJhbnNsYXRlX0lJRF9JRztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZmluZFNJRCgpIHtcclxuICAgICAgaWYgKEJpbmdIZWxwZXIuI3NpZFByb21pc2UpIHJldHVybiBhd2FpdCBCaW5nSGVscGVyLiNzaWRQcm9taXNlO1xyXG4gICAgICBCaW5nSGVscGVyLiNzaWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBsZXQgdXBkYXRlWWFuZGV4U2lkID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKEJpbmdIZWxwZXIuI2xhc3RSZXF1ZXN0U2lkVGltZSkge1xyXG4gICAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBpZiAoQmluZ0hlbHBlci4jdHJhbnNsYXRlU2lkKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpIC0gMTIpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChCaW5nSGVscGVyLiNTSUROb3RGb3VuZCkge1xyXG4gICAgICAgICAgICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgLSAzMCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRlLnNldE1pbnV0ZXMoZGF0ZS5nZXRNaW51dGVzKCkgLSAyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChkYXRlLmdldFRpbWUoKSA+IEJpbmdIZWxwZXIuI2xhc3RSZXF1ZXN0U2lkVGltZSkge1xyXG4gICAgICAgICAgICB1cGRhdGVZYW5kZXhTaWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB1cGRhdGVZYW5kZXhTaWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHVwZGF0ZVlhbmRleFNpZCkge1xyXG4gICAgICAgICAgQmluZ0hlbHBlci4jbGFzdFJlcXVlc3RTaWRUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICBodHRwLm9wZW4oXCJHRVRcIiwgXCJodHRwczovL3d3dy5iaW5nLmNvbS90cmFuc2xhdG9yXCIpO1xyXG4gICAgICAgICAgaHR0cC5zZW5kKCk7XHJcbiAgICAgICAgICBodHRwLm9ubG9hZCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGh0dHAucmVzcG9uc2VUZXh0Lm1hdGNoKFxyXG4gICAgICAgICAgICAgIC9wYXJhbXNfUmljaFRyYW5zbGF0ZUhlbHBlclxccz1cXHNcXFtbXlxcXV0rL1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhX2lpZF9yID0gaHR0cC5yZXNwb25zZVRleHQubWF0Y2goXHJcbiAgICAgICAgICAgICAgL2RhdGEtaWlkXFw9XFxcIlthLXpBLVowLTlcXC5dKy9cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3QgSUdfciA9IGh0dHAucmVzcG9uc2VUZXh0Lm1hdGNoKC9JR1xcOlxcXCJbYS16QS1aMC05XFwuXSsvKTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgIHJlc3VsdCAmJlxyXG4gICAgICAgICAgICAgIHJlc3VsdFswXSAmJlxyXG4gICAgICAgICAgICAgIHJlc3VsdFswXS5sZW5ndGggPiA1MCAmJlxyXG4gICAgICAgICAgICAgIGRhdGFfaWlkX3IgJiZcclxuICAgICAgICAgICAgICBkYXRhX2lpZF9yWzBdICYmXHJcbiAgICAgICAgICAgICAgSUdfciAmJlxyXG4gICAgICAgICAgICAgIElHX3JbMF1cclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcGFyYW1zX1JpY2hUcmFuc2xhdGVIZWxwZXIgPSByZXN1bHRbMF1cclxuICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoXCJwYXJhbXNfUmljaFRyYW5zbGF0ZUhlbHBlciA9IFtcIi5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRhdGFfaWlkID0gZGF0YV9paWRfclswXS5zdWJzdHJpbmcoJ2RhdGEtaWlkPVwiJy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IElHID0gSUdfclswXS5zdWJzdHJpbmcoJ0lHOlwiJy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHBhcmFtc19SaWNoVHJhbnNsYXRlSGVscGVyICYmXHJcbiAgICAgICAgICAgICAgICBwYXJhbXNfUmljaFRyYW5zbGF0ZUhlbHBlclswXSAmJlxyXG4gICAgICAgICAgICAgICAgcGFyYW1zX1JpY2hUcmFuc2xhdGVIZWxwZXJbMV0gJiZcclxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHBhcmFtc19SaWNoVHJhbnNsYXRlSGVscGVyWzBdKSAmJlxyXG4gICAgICAgICAgICAgICAgZGF0YV9paWQgJiZcclxuICAgICAgICAgICAgICAgIElHXHJcbiAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBCaW5nSGVscGVyLiN0cmFuc2xhdGVTaWQgPSBgJnRva2VuPSR7cGFyYW1zX1JpY2hUcmFuc2xhdGVIZWxwZXJbMV0uc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICAgICAgICBwYXJhbXNfUmljaFRyYW5zbGF0ZUhlbHBlclsxXS5sZW5ndGggLSAxXHJcbiAgICAgICAgICAgICAgICApfSZrZXk9JHtwYXJzZUludChwYXJhbXNfUmljaFRyYW5zbGF0ZUhlbHBlclswXSl9YDtcclxuICAgICAgICAgICAgICAgIEJpbmdIZWxwZXIuI3RyYW5zbGF0ZV9JSURfSUcgPSBgSUc9JHtJR30mSUlEPSR7ZGF0YV9paWR9YDtcclxuICAgICAgICAgICAgICAgIEJpbmdIZWxwZXIuI1NJRE5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIEJpbmdIZWxwZXIuI1NJRE5vdEZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgQmluZ0hlbHBlci4jU0lETm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBodHRwLm9uZXJyb3IgPVxyXG4gICAgICAgICAgICBodHRwLm9uYWJvcnQgPVxyXG4gICAgICAgICAgICBodHRwLm9udGltZW91dCA9XHJcbiAgICAgICAgICAgICAgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBCaW5nSGVscGVyLiNzaWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgIEJpbmdIZWxwZXIuI3NpZFByb21pc2UgPSBudWxsO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBhd2FpdCBCaW5nSGVscGVyLiNzaWRQcm9taXNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgU2VydmljZSB7XHJcbiAgICAvKipcclxuICAgICAqIEBjYWxsYmFjayBDYWxsYmFja19jYlBhcmFtZXRlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5PFRyYW5zbGF0aW9uSW5mbz59IHJlcXVlc3RzXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgY2FsbGJhY2tfY2JUcmFuc2Zvcm1SZXF1ZXN0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzb3VyY2VBcnJheTJkXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZWRlZiB7e3RleHQ6IHN0cmluZywgZGV0ZWN0ZWRMYW5ndWFnZTogc3RyaW5nfX0gU2VydmljZV9TaW5nbGVfUmVzdWx0X1Jlc3BvbnNlXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjYWxsYmFjayBjYWxsYmFja19jYlBhcnNlUmVzcG9uc2VcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxyXG4gICAgICogQHJldHVybnMge0FycmF5PFNlcnZpY2VfU2luZ2xlX1Jlc3VsdF9SZXNwb25zZT59XHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjYWxsYmFjayBjYWxsYmFja19jYlRyYW5zZm9ybVJlc3BvbnNlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVzcG9uc2VcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9udFNvcnRSZXN1bHRzXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IHNvdXJjZUFycmF5MmRcclxuICAgICAqL1xyXG5cclxuICAgIC8qKiBAdHlwZWRlZiB7XCJjb21wbGV0ZVwiIHwgXCJ0cmFuc2xhdGluZ1wiIHwgXCJlcnJvclwifSBUcmFuc2xhdGlvblN0YXR1cyAqL1xyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBUcmFuc2xhdGlvbkluZm9cclxuICAgICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBvcmlnaW5hbFRleHRcclxuICAgICAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB0cmFuc2xhdGVkVGV4dFxyXG4gICAgICogQHByb3BlcnR5IHtTdHJpbmd9IGRldGVjdGVkTGFuZ3VhZ2VcclxuICAgICAqIEBwcm9wZXJ0eSB7VHJhbnNsYXRpb25TdGF0dXN9IHN0YXR1c1xyXG4gICAgICogQHByb3BlcnR5IHtQcm9taXNlPHZvaWQ+fSB3YWl0VHJhbmxhdGVcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZXJ2aWNlTmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkxcclxuICAgICAqIEBwYXJhbSB7XCJHRVRcIiB8IFwiUE9TVFwifSB4aHJNZXRob2RcclxuICAgICAqIEBwYXJhbSB7Y2FsbGJhY2tfY2JUcmFuc2Zvcm1SZXF1ZXN0fSBjYlRyYW5zZm9ybVJlcXVlc3RcclxuICAgICAqIEBwYXJhbSB7Y2FsbGJhY2tfY2JQYXJzZVJlc3BvbnNlfSBjYlBhcnNlUmVzcG9uc2VcclxuICAgICAqIEBwYXJhbSB7Y2FsbGJhY2tfY2JUcmFuc2Zvcm1SZXNwb25zZX0gY2JUcmFuc2Zvcm1SZXNwb25zZVxyXG4gICAgICogQHBhcmFtIHtDYWxsYmFja19jYlBhcmFtZXRlcnN9IGNiR2V0RXh0cmFQYXJhbWV0ZXJzXHJcbiAgICAgKiBAcGFyYW0ge0NhbGxiYWNrX2NiUGFyYW1ldGVyc30gY2JHZXRSZXF1ZXN0Qm9keVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgc2VydmljZU5hbWUsXHJcbiAgICAgIGJhc2VVUkwsXHJcbiAgICAgIHhock1ldGhvZCA9IFwiR0VUXCIsXHJcbiAgICAgIGNiVHJhbnNmb3JtUmVxdWVzdCxcclxuICAgICAgY2JQYXJzZVJlc3BvbnNlLFxyXG4gICAgICBjYlRyYW5zZm9ybVJlc3BvbnNlLFxyXG4gICAgICBjYkdldEV4dHJhUGFyYW1ldGVycyA9IG51bGwsXHJcbiAgICAgIGNiR2V0UmVxdWVzdEJvZHkgPSBudWxsXHJcbiAgICApIHtcclxuICAgICAgdGhpcy5zZXJ2aWNlTmFtZSA9IHNlcnZpY2VOYW1lO1xyXG4gICAgICB0aGlzLmJhc2VVUkwgPSBiYXNlVVJMO1xyXG4gICAgICB0aGlzLnhock1ldGhvZCA9IHhock1ldGhvZDtcclxuICAgICAgdGhpcy5jYlRyYW5zZm9ybVJlcXVlc3QgPSBjYlRyYW5zZm9ybVJlcXVlc3Q7XHJcbiAgICAgIHRoaXMuY2JQYXJzZVJlc3BvbnNlID0gY2JQYXJzZVJlc3BvbnNlO1xyXG4gICAgICB0aGlzLmNiVHJhbnNmb3JtUmVzcG9uc2UgPSBjYlRyYW5zZm9ybVJlc3BvbnNlO1xyXG4gICAgICB0aGlzLmNiR2V0RXh0cmFQYXJhbWV0ZXJzID0gY2JHZXRFeHRyYVBhcmFtZXRlcnM7XHJcbiAgICAgIHRoaXMuY2JHZXRSZXF1ZXN0Qm9keSA9IGNiR2V0UmVxdWVzdEJvZHk7XHJcbiAgICAgIC8qKiBAdHlwZSB7TWFwPHN0cmluZywgVHJhbnNsYXRpb25JbmZvPn0gKi9cclxuICAgICAgdGhpcy50cmFuc2xhdGlvbnNJblByb2dyZXNzID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5PHN0cmluZ1tdPn0gc291cmNlQXJyYXkzZFxyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8W0FycmF5PFRyYW5zbGF0aW9uSW5mb1tdPiwgVHJhbnNsYXRpb25JbmZvW11dPn0gcmVxdWVzdHMsIGN1cnJlbnRUcmFuc2xhdGlvbnNJblByb2dyZXNzXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGdldFJlcXVlc3RzKHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgc291cmNlQXJyYXkzZCkge1xyXG4gICAgICAvKiogQHR5cGUge0FycmF5PFRyYW5zbGF0aW9uSW5mb1tdPn0gKi9cclxuICAgICAgY29uc3QgcmVxdWVzdHMgPSBbXTtcclxuICAgICAgLyoqIEB0eXBlIHtUcmFuc2xhdGlvbkluZm9bXX0gKi9cclxuICAgICAgY29uc3QgY3VycmVudFRyYW5zbGF0aW9uc0luUHJvZ3Jlc3MgPSBbXTtcclxuXHJcbiAgICAgIGxldCBjdXJyZW50UmVxdWVzdCA9IFtdO1xyXG4gICAgICBsZXQgY3VycmVudFNpemUgPSAwO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBzb3VyY2VBcnJheTJkIG9mIHNvdXJjZUFycmF5M2QpIHtcclxuICAgICAgICBjb25zdCByZXF1ZXN0U3RyaW5nID0gdGhpcy5maXhTdHJpbmcoXHJcbiAgICAgICAgICB0aGlzLmNiVHJhbnNmb3JtUmVxdWVzdChzb3VyY2VBcnJheTJkKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdEhhc2ggPSBbXHJcbiAgICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgICAgcmVxdWVzdFN0cmluZyxcclxuICAgICAgICBdLmpvaW4oXCIsIFwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NJbmZvID0gdGhpcy50cmFuc2xhdGlvbnNJblByb2dyZXNzLmdldChyZXF1ZXN0SGFzaCk7XHJcbiAgICAgICAgaWYgKHByb2dyZXNzSW5mbykge1xyXG4gICAgICAgICAgY3VycmVudFRyYW5zbGF0aW9uc0luUHJvZ3Jlc3MucHVzaChwcm9ncmVzc0luZm8pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvKiogQHR5cGUge1RyYW5zbGF0aW9uU3RhdHVzfSAqL1xyXG4gICAgICAgICAgbGV0IHN0YXR1cyA9IFwidHJhbnNsYXRpbmdcIjtcclxuICAgICAgICAgIC8qKiBAdHlwZSB7KCkgPT4gdm9pZH0gKi9cclxuICAgICAgICAgIGxldCBwcm9taXNlX3Jlc29sdmUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIC8qKiBAdHlwZSB7VHJhbnNsYXRpb25JbmZvfSAqL1xyXG4gICAgICAgICAgY29uc3QgcHJvZ3Jlc3NJbmZvID0ge1xyXG4gICAgICAgICAgICBvcmlnaW5hbFRleHQ6IHJlcXVlc3RTdHJpbmcsXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZWRUZXh0OiBudWxsLFxyXG4gICAgICAgICAgICBkZXRlY3RlZExhbmd1YWdlOiBudWxsLFxyXG4gICAgICAgICAgICBnZXQgc3RhdHVzKCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0dXM7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldCBzdGF0dXMoX3N0YXR1cykge1xyXG4gICAgICAgICAgICAgIHN0YXR1cyA9IF9zdGF0dXM7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZV9yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdhaXRUcmFubGF0ZTogbmV3IFByb21pc2UoKHJlc29sdmUpID0+IChwcm9taXNlX3Jlc29sdmUgPSByZXNvbHZlKSksXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIGN1cnJlbnRUcmFuc2xhdGlvbnNJblByb2dyZXNzLnB1c2gocHJvZ3Jlc3NJbmZvKTtcclxuICAgICAgICAgIHRoaXMudHJhbnNsYXRpb25zSW5Qcm9ncmVzcy5zZXQocmVxdWVzdEhhc2gsIHByb2dyZXNzSW5mbyk7XHJcblxyXG4gICAgICAgICAgLy9jYXN0XHJcbiAgICAgICAgICBjb25zdCBjYWNoZUVudHJ5ID0gYXdhaXQgdHJhbnNsYXRpb25DYWNoZS5nZXQoXHJcbiAgICAgICAgICAgIHRoaXMuc2VydmljZU5hbWUsXHJcbiAgICAgICAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgICAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgICAgICAgICAgcmVxdWVzdFN0cmluZ1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGlmIChjYWNoZUVudHJ5KSB7XHJcbiAgICAgICAgICAgIHByb2dyZXNzSW5mby50cmFuc2xhdGVkVGV4dCA9IGNhY2hlRW50cnkudHJhbnNsYXRlZFRleHQ7XHJcbiAgICAgICAgICAgIHByb2dyZXNzSW5mby5kZXRlY3RlZExhbmd1YWdlID0gY2FjaGVFbnRyeS5kZXRlY3RlZExhbmd1YWdlO1xyXG4gICAgICAgICAgICBwcm9ncmVzc0luZm8uc3RhdHVzID0gXCJjb21wbGV0ZVwiO1xyXG4gICAgICAgICAgICAvL3RoaXMudHJhbnNsYXRpb25zSW5Qcm9ncmVzcy5kZWxldGUoW3NvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgcmVxdWVzdFN0cmluZ10pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjdXJyZW50UmVxdWVzdC5wdXNoKHByb2dyZXNzSW5mbyk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTaXplICs9IHByb2dyZXNzSW5mby5vcmlnaW5hbFRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNpemUgPiA4MDApIHtcclxuICAgICAgICAgICAgICByZXF1ZXN0cy5wdXNoKGN1cnJlbnRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICBjdXJyZW50U2l6ZSA9IDA7XHJcbiAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3QgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1cnJlbnRSZXF1ZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXF1ZXN0cy5wdXNoKGN1cnJlbnRSZXF1ZXN0KTtcclxuICAgICAgICBjdXJyZW50UmVxdWVzdCA9IFtdO1xyXG4gICAgICAgIGN1cnJlbnRTaXplID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIFtyZXF1ZXN0cywgY3VycmVudFRyYW5zbGF0aW9uc0luUHJvZ3Jlc3NdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VMYW5ndWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldExhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge0FycmF5PFRyYW5zbGF0aW9uSW5mbz59IHJlcXVlc3RzXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgbWFrZVJlcXVlc3Qoc291cmNlTGFuZ3VhZ2UsIHRhcmdldExhbmd1YWdlLCByZXF1ZXN0cykge1xyXG4gICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgIHhoci5vcGVuKFxyXG4gICAgICAgICAgdGhpcy54aHJNZXRob2QsXHJcbiAgICAgICAgICB0aGlzLmJhc2VVUkwgK1xyXG4gICAgICAgICAgICAodGhpcy5jYkdldEV4dHJhUGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgID8gdGhpcy5jYkdldEV4dHJhUGFyYW1ldGVycyhcclxuICAgICAgICAgICAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgICAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgICAgICAgICAgICByZXF1ZXN0c1xyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIDogXCJcIilcclxuICAgICAgICApO1xyXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFxyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIixcclxuICAgICAgICAgIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJcclxuICAgICAgICApO1xyXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBcImpzb25cIjtcclxuXHJcbiAgICAgICAgeGhyLm9ubG9hZCA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHhoci5vbmVycm9yID1cclxuICAgICAgICAgIHhoci5vbmFib3J0ID1cclxuICAgICAgICAgIHhoci5vbnRpbWVvdXQgPVxyXG4gICAgICAgICAgICAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50KTtcclxuICAgICAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgeGhyLnNlbmQoXHJcbiAgICAgICAgICB0aGlzLmNiR2V0RXh0cmFQYXJhbWV0ZXJzXHJcbiAgICAgICAgICAgID8gdGhpcy5jYkdldFJlcXVlc3RCb2R5KHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgcmVxdWVzdHMpXHJcbiAgICAgICAgICAgIDogdW5kZWZpbmVkXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUxhbmd1YWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0TGFuZ3VhZ2VcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nW10+fSBzb3VyY2VBcnJheTNkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRvbnRTb3J0UmVzdWx0c1xyXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nW11bXT59XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHRyYW5zbGF0ZShcclxuICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICBzb3VyY2VBcnJheTNkLFxyXG4gICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlID0gZmFsc2UsXHJcbiAgICAgIGRvbnRTb3J0UmVzdWx0cyA9IGZhbHNlXHJcbiAgICApIHtcclxuICAgICAgY29uc3QgW3JlcXVlc3RzLCBjdXJyZW50VHJhbnNsYXRpb25zSW5Qcm9ncmVzc10gPSBhd2FpdCB0aGlzLmdldFJlcXVlc3RzKFxyXG4gICAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgIHNvdXJjZUFycmF5M2RcclxuICAgICAgKTtcclxuICAgICAgLyoqIEB0eXBlIHtQcm9taXNlPHZvaWQ+W119ICovXHJcbiAgICAgIGNvbnN0IHByb21pc2VzID0gW107XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHJlcXVlc3Qgb2YgcmVxdWVzdHMpIHtcclxuICAgICAgICBwcm9taXNlcy5wdXNoKFxyXG4gICAgICAgICAgdGhpcy5tYWtlUmVxdWVzdChzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIHJlcXVlc3QpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLmNiUGFyc2VSZXNwb25zZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBpZHggaW4gcmVxdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0c1tpZHhdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYlRyYW5zZm9ybVJlc3BvbnNlKHJlc3VsdC50ZXh0LCBkb250U29ydFJlc3VsdHMpOyAvLyBhcGVuYXMgcGFyYSBnZXJhciBlcnJvclxyXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNJbmZvID0gcmVxdWVzdFtpZHhdO1xyXG4gICAgICAgICAgICAgICAgdHJhbnNJbmZvLmRldGVjdGVkTGFuZ3VhZ2UgPSByZXN1bHQuZGV0ZWN0ZWRMYW5ndWFnZSB8fCBcInVuZFwiO1xyXG4gICAgICAgICAgICAgICAgdHJhbnNJbmZvLnRyYW5zbGF0ZWRUZXh0ID0gcmVzdWx0LnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0cmFuc0luZm8uc3RhdHVzID0gXCJjb21wbGV0ZVwiO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnRyYW5zbGF0aW9uc0luUHJvZ3Jlc3MuZGVsZXRlKFtzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIHRyYW5zSW5mby5vcmlnaW5hbFRleHRdKVxyXG4gICAgICAgICAgICAgICAgaWYgKGRvbnRTYXZlSW5QZXJzaXN0ZW50Q2FjaGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uQ2FjaGUuc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmljZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNJbmZvLm9yaWdpbmFsVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc0luZm8udHJhbnNsYXRlZFRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNJbmZvLmRldGVjdGVkTGFuZ3VhZ2VcclxuICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB0cmFuc0luZm8gb2YgcmVxdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNJbmZvLnN0YXR1cyA9IFwiZXJyb3JcIjtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy50cmFuc2xhdGlvbnNJblByb2dyZXNzLmRlbGV0ZShbc291cmNlTGFuZ3VhZ2UsIHRhcmdldExhbmd1YWdlLCB0cmFuc0luZm8ub3JpZ2luYWxUZXh0XSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBjdXJyZW50VHJhbnNsYXRpb25zSW5Qcm9ncmVzcy5tYXAoKHRyYW5zSW5mbykgPT4gdHJhbnNJbmZvLndhaXRUcmFubGF0ZSlcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIGN1cnJlbnRUcmFuc2xhdGlvbnNJblByb2dyZXNzLm1hcCgodHJhbnNJbmZvKSA9PlxyXG4gICAgICAgIHRoaXMuY2JUcmFuc2Zvcm1SZXNwb25zZSh0cmFuc0luZm8udHJhbnNsYXRlZFRleHQsIGRvbnRTb3J0UmVzdWx0cylcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9GaWxpcGVQUy9UcmFkdXppci1wYWdpbmFzLXdlYi9pc3N1ZXMvNDg0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBmaXhTdHJpbmcoc3RyKSB7XHJcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFx1MjAwYi9nLCBcIiBcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBnb29nbGVTZXJ2aWNlID0gbmV3IChjbGFzcyBleHRlbmRzIFNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIHN1cGVyKFxyXG4gICAgICAgIFwiZ29vZ2xlXCIsXHJcbiAgICAgICAgXCJodHRwczovL3RyYW5zbGF0ZS5nb29nbGVhcGlzLmNvbS90cmFuc2xhdGVfYS90P2Fubm89MyZjbGllbnQ9dGUmdj0xLjAmZm9ybWF0PWh0bWxcIixcclxuICAgICAgICBcIlBPU1RcIixcclxuICAgICAgICBmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KHNvdXJjZUFycmF5MmQpIHtcclxuICAgICAgICAgIHNvdXJjZUFycmF5MmQgPSBzb3VyY2VBcnJheTJkLm1hcCgodGV4dCkgPT4gVXRpbHMuZXNjYXBlSFRNTCh0ZXh0KSk7XHJcbiAgICAgICAgICBpZiAoc291cmNlQXJyYXkyZC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHNvdXJjZUFycmF5MmQgPSBzb3VyY2VBcnJheTJkLm1hcChcclxuICAgICAgICAgICAgICAodGV4dCwgaW5kZXgpID0+IGA8YSBpPSR7aW5kZXh9PiR7dGV4dH08L2E+YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gdGhlIDxwcmU+IHRhZyBpcyB0byBwcmVzZXJ2ZSB0aGUgdGV4dCBmb3JtYXRpbmdcclxuICAgICAgICAgIHJldHVybiBgPHByZT4ke3NvdXJjZUFycmF5MmQuam9pbihcIlwiKX08L3ByZT5gO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gcGFyc2VSZXNwb25zZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgLyoqIEB0eXBlIHtbU2VydmljZV9TaW5nbGVfUmVzdWx0X1Jlc3BvbnNlXX0gKi9cclxuICAgICAgICAgIGxldCByZXNwb25zZUpzb247XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlSnNvbiA9IFt7IHRleHQ6IHJlc3BvbnNlLCBkZXRlY3RlZExhbmd1YWdlOiBudWxsIH1dO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVzcG9uc2VbMF0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2VKc29uID0gcmVzcG9uc2UubWFwKFxyXG4gICAgICAgICAgICAgIC8qKiBAcmV0dXJucyB7U2VydmljZV9TaW5nbGVfUmVzdWx0X1Jlc3BvbnNlfSAqLyAoXHJcbiAgICAgICAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gdmFsdWVcclxuICAgICAgICAgICAgICApID0+ICh7IHRleHQ6IHZhbHVlLCBkZXRlY3RlZExhbmd1YWdlOiBudWxsIH0pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXNwb25zZUpzb24gPSByZXNwb25zZS5tYXAoXHJcbiAgICAgICAgICAgICAgLyoqIEByZXR1cm5zIHtTZXJ2aWNlX1NpbmdsZV9SZXN1bHRfUmVzcG9uc2V9ICovIChcclxuICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7W3N0cmluZywgc3RyaW5nXX0gKi8gdmFsdWVcclxuICAgICAgICAgICAgICApID0+ICh7IHRleHQ6IHZhbHVlWzBdLCBkZXRlY3RlZExhbmd1YWdlOiB2YWx1ZVsxXSB9KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlSnNvbjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKHJlc3VsdCwgZG9udFNvcnRSZXN1bHRzKSB7XHJcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIDxwcmU+IHRhZyBmcm9tIHRoZSByZXNwb25zZVxyXG4gICAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKFwiPHByZVwiKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoXCI8L3ByZT5cIiwgXCJcIik7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVzdWx0LmluZGV4T2YoXCI+XCIpO1xyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuc2xpY2UoaW5kZXggKyAxKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ1tdfSAqL1xyXG4gICAgICAgICAgY29uc3Qgc2VudGVuY2VzID0gW107IC8vIGVhY2ggdHJhbnNsYXRlZCBzZW50ZW5jZSBpcyBpbnNpZGUgb2YgPGI+IHRhZ1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBtYWluIG9iamVjdGl2ZSBpcyB0byByZW1vdmUgdGhlIG9yaWdpbmFsIHRleHQgb2YgZWFjaCBzZW50ZW5zZSB0aGF0IGlzIGluc2lkZSB0aGUgPGk+IHRhZ3MuXHJcbiAgICAgICAgICAvLyBLZWVwaW5nIG9ubHkgdGhlIDxhPiB0YWdzXHJcbiAgICAgICAgICBsZXQgaWR4ID0gMDtcclxuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIC8vIGVhY2ggdHJhbnNsYXRlZCBzZW50ZW5jZSBpcyBpbnNpZGUgb2YgPGI+IHRhZ1xyXG4gICAgICAgICAgICBjb25zdCBzZW50ZW5jZVN0YXJ0SW5kZXggPSByZXN1bHQuaW5kZXhPZihcIjxiPlwiLCBpZHgpO1xyXG4gICAgICAgICAgICBpZiAoc2VudGVuY2VTdGFydEluZGV4ID09PSAtMSkgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGUgPGk+IHRhZyBpcyB0aGUgb3JpZ2luYWwgdGV4dCBpbiBlYWNoIHNlbnRlbmNlXHJcbiAgICAgICAgICAgIGNvbnN0IHNlbnRlbmNlRmluYWxJbmRleCA9IHJlc3VsdC5pbmRleE9mKFxyXG4gICAgICAgICAgICAgIFwiPGk+XCIsXHJcbiAgICAgICAgICAgICAgc2VudGVuY2VTdGFydEluZGV4XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VudGVuY2VGaW5hbEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIHNlbnRlbmNlcy5wdXNoKHJlc3VsdC5zbGljZShzZW50ZW5jZVN0YXJ0SW5kZXggKyAzKSk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgc2VudGVuY2VzLnB1c2goXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuc2xpY2Uoc2VudGVuY2VTdGFydEluZGV4ICsgMywgc2VudGVuY2VGaW5hbEluZGV4KVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWR4ID0gc2VudGVuY2VGaW5hbEluZGV4O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG1heWJlIHRoZSByZXNwb25zZSBkb24ndCBoYXZlIGFueSBzZW50ZW5jZSAoZG9lcyBub3QgaGF2ZSA8aT4gYW5kIDxiPiB0YWdzKSwgaXMgdGhpcyBjYXNlIGp1c3QgdXNlIGRlIHJlc3VsdFxyXG4gICAgICAgICAgcmVzdWx0ID0gc2VudGVuY2VzLmxlbmd0aCA+IDAgPyBzZW50ZW5jZXMuam9pbihcIiBcIikgOiByZXN1bHQ7XHJcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHJlbWFpbmluZyA8L2I+IHRhZ3MgKHVzdWFsbHkgdGhlIGxhc3QpXHJcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvXFw8XFwvYlxcPi9nLCBcIlwiKTtcclxuICAgICAgICAgIC8vIENhcHR1cmUgZWFjaCA8YSBpPXtudW1iZXJ9PiBhbmQgcHV0IGl0IGluIGFuIGFycmF5LCB0aGUgPC9hPiB3aWxsIGJlIGlnbm9yZWRcclxuICAgICAgICAgIC8vIG1heWJlIHRoZSBzYW1lIGluZGV4IGFwcGVhcnMgc2V2ZXJhbCB0aW1lc1xyXG4gICAgICAgICAgLy8gbWF5YmUgc29tZSB0ZXh0IHdpbGwgYmUgb3V0c2lkZSBvZiA8YSBpPXtudW1iZXJ9PiAoVXN1YWxseSB0ZXh0IGJlZm9yZSB0aGUgZmlyc3QgPGE+IHRhZywgYW5kIHNvbWUgd2hpdGVzcGFjZSBiZXR3ZWVuIHRoZSA8YT4gdGFncyksXHJcbiAgICAgICAgICAvLyBpbiB0aGlzIGNhc2UsIFRoZSBvdXRzaWRlIHRleHQgd2lsbCBiZSBwbGFjZWQgaW5zaWRlIHRoZSA8YSBpPXtudW1iZXJ9PiBjbG9zZXJcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9GaWxpcGVQUy9UcmFkdXppci1wYWdpbmFzLXdlYi9pc3N1ZXMvNDQ5XHJcbiAgICAgICAgICAvLyBUT0RPIGxpZGFyIGNvbSB0YWdzIGRlbnRybyBkZSB0YWdzIGUgdGFncyB2YXppYXNcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZGUud2lraXBlZGlhLm9yZy93aWtpL1dpa2lwZWRpYTpIYXVwdHNlaXRlXHJcbiAgICAgICAgICAvLyBcIntcXFwib3JpZ2luYWxUZXh0XFxcIjpcXFwiPHByZT48YSBpPTA+XFxcXG5Gw7xyIGRlbiA8L2E+PGEgaT0xPjM3LiBTY2hyZWliwq13ZXR0YmV3ZXJiPC9hPjxhIGk9Mj4gdW5kIGRlbiA8L2E+PGEgaT0zPjE4LiBNaW5pYXR1cndldHRiZXdlcmI8L2E+PGEgaT00PiBrw7ZubmVuIGFiIHNvZm9ydCBBcnRpa2VsIG5vbWluaWVydCB3ZXJkZW4uPC9hPjwvcHJlPlxcXCIsXFxcInRyYW5zbGF0ZWRUZXh0XFxcIjpcXFwiPHByZT48YSBpPTA+XFxcXG48L2E+QXJ0aWdvcyBqw6EgcG9kZW0gc2VyIGluZGljYWRvcyA8YSBpPTA+cGFyYSBvPC9hPiA8YSBpPTE+MzfCuiBDb25jdXJzbyBkZSBSZWRhw6fDo28gPGEgaT0yPmU8L2E+PC9hPiA8YSBpPTM+PGEgaT00PjE4wro8L2E+IENvbmN1cnNvIGRlIE1pbmlhdHVyYXM8L2E+IC48L3ByZT5cXFwiLFxcXCJkZXRlY3RlZExhbmd1YWdlXFxcIjpcXFwiZGVcXFwiLFxcXCJzdGF0dXNcXFwiOlxcXCJjb21wbGV0ZVxcXCIsXFxcIndhaXRUcmFubGF0ZVxcXCI6e319XCJcclxuICAgICAgICAgIGxldCByZXN1bHRBcnJheSA9IFtdO1xyXG4gICAgICAgICAgbGV0IGxhc3RFbmRQb3MgPSAwO1xyXG4gICAgICAgICAgZm9yIChjb25zdCByIG9mIHJlc3VsdC5tYXRjaEFsbChcclxuICAgICAgICAgICAgLyhcXDxhXFxzaVxcPVswLTldK1xcPikoW15cXDxcXD5dKig/PVxcPFxcL2FcXD4pKSovZ1xyXG4gICAgICAgICAgKSkge1xyXG4gICAgICAgICAgICBjb25zdCBmdWxsVGV4dCA9IHJbMF07XHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxMZW5ndGggPSByWzBdLmxlbmd0aDtcclxuICAgICAgICAgICAgY29uc3QgcG9zID0gci5pbmRleDtcclxuICAgICAgICAgICAgLy8gaWYgaXQgaXMgYmlnZ2VyIHRoZW4gaXQgaGFzIHRleHQgb3V0c2lkZSB0aGUgdGFnc1xyXG4gICAgICAgICAgICBpZiAocG9zID4gbGFzdEVuZFBvcykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGFUYWcgPSByWzFdO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGluc2lkZVRleHQgPSByWzJdIHx8IFwiXCI7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb3V0c2lkZVRleHQgPSByZXN1bHRcclxuICAgICAgICAgICAgICAgIC5zbGljZShsYXN0RW5kUG9zLCBwb3MpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFw8XFwvYVxcPi9nLCBcIlwiKTtcclxuICAgICAgICAgICAgICByZXN1bHRBcnJheS5wdXNoKGFUYWcgKyBvdXRzaWRlVGV4dCArIGluc2lkZVRleHQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHJlc3VsdEFycmF5LnB1c2goZnVsbFRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxhc3RFbmRQb3MgPSBwb3MgKyBmdWxsTGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gY2FwdHVyZXMgdGhlIGZpbmFsIHRleHQgb3V0c2lkZSB0aGUgPGE+IHRhZ1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBsYXN0T3V0c2lkZVRleHQgPSByZXN1bHRcclxuICAgICAgICAgICAgICAuc2xpY2UobGFzdEVuZFBvcylcclxuICAgICAgICAgICAgICAucmVwbGFjZSgvXFw8XFwvYVxcPi9nLCBcIlwiKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdEFycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICByZXN1bHRBcnJheVtyZXN1bHRBcnJheS5sZW5ndGggLSAxXSArPSBsYXN0T3V0c2lkZVRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIG9sZCBtZXRob2QsIGRvbid0IGNhcHR1cmUgdGV4dCBvdXRzaWRlIG9mIDxhPiB0YWdzXHJcbiAgICAgICAgICAvLyBsZXQgcmVzdWx0QXJyYXkgPSByZXN1bHQubWF0Y2goXHJcbiAgICAgICAgICAvLyAgIC9cXDxhXFxzaVxcPVswLTldK1xcPlteXFw8XFw+XSooPz1cXDxcXC9hXFw+KS9nXHJcbiAgICAgICAgICAvLyApO1xyXG5cclxuICAgICAgICAgIGlmIChkb250U29ydFJlc3VsdHMpIHtcclxuICAgICAgICAgICAgLy8gU2hvdWxkIG5vdCBzb3J0IHRoZSA8YSBpPXtudW1iZXJ9PiBvZiBHb29nbGUgVHJhbnNsYXRlIHJlc3VsdFxyXG4gICAgICAgICAgICAvLyBJbnN0ZWFkIG9mIGl0LCBqb2luIHRoZSB0ZXh0cyB3aXRob3V0IHNvcnRpbmdcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0ZpbGlwZVBTL1RyYWR1emlyLXBhZ2luYXMtd2ViL2lzc3Vlcy8xNjNcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRBcnJheSAmJiByZXN1bHRBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgLy8gZ2V0IHRoZSB0ZXh0IGluc2lkZSBvZiA8YSBpPXtudW1iZXJ9PlxyXG4gICAgICAgICAgICAgIC8vIHRoZSBpbmRleGVzIGlzIG5vdCBuZWVkZWQgaW4gdGhpcyBjYXNlXHJcbiAgICAgICAgICAgICAgcmVzdWx0QXJyYXkgPSByZXN1bHRBcnJheS5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRTdGFydEF0SW5kZXggPSB2YWx1ZS5pbmRleE9mKFwiPlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZShyZXN1bHRTdGFydEF0SW5kZXggKyAxKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBtYXliZSB0aGUgcmVzcG9uc2UgZG9uJ3QgaGF2ZSBhbnkgPGEgaT17bnVtYmVyfT5cclxuICAgICAgICAgICAgICByZXN1bHRBcnJheSA9IFtyZXN1bHRdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB1bmVzY2FwZUhUTUxcclxuICAgICAgICAgICAgcmVzdWx0QXJyYXkgPSByZXN1bHRBcnJheS5tYXAoKHZhbHVlKSA9PiBVdGlscy51bmVzY2FwZUhUTUwodmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRBcnJheTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFNvcnQgR29vZ2xlIHRyYW5zbGF0ZSByZXN1bHRzIHRvIGtlZXAgdGhlIGxpbmtzIHdpdGggdGhlIGNvcnJlY3QgbmFtZVxyXG4gICAgICAgICAgICAvLyBOb3RlOiB0aGUgbGlua3MgbWF5IGFsc28gZGlzYXBwZWFyOyBodHRwOi8vd2ViLmFyY2hpdmUub3JnL3dlYi8yMDIyMDkxOTE2MjkxMS9odHRwczovL2RlLndpa2lwZWRpYS5vcmcvd2lraS9XaWtpcGVkaWE6SGF1cHRzZWl0ZVxyXG4gICAgICAgICAgICAvLyBlYWNoIGlubGluZSB0YWcgaGFzIGEgaW5kZXggc3RhcnRpbmcgd2l0aCAwIDxhIGk9e251bWJlcn0+XHJcbiAgICAgICAgICAgIGxldCBpbmRleGVzO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0QXJyYXkgJiYgcmVzdWx0QXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIC8vIGdldCB0aGUgaW5kZXhlZCBvZiA8YSBpPXtudW1iZXJ9PlxyXG4gICAgICAgICAgICAgIGluZGV4ZXMgPSByZXN1bHRBcnJheVxyXG4gICAgICAgICAgICAgICAgLm1hcCgodmFsdWUpID0+IHBhcnNlSW50KHZhbHVlLm1hdGNoKC9bMC05XSsoPz1cXD4pL2cpWzBdKSlcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHZhbHVlKSA9PiAhaXNOYU4odmFsdWUpKTtcclxuICAgICAgICAgICAgICAvLyBnZXQgdGhlIHRleHQgaW5zaWRlIG9mIDxhIGk9e251bWJlcn0+XHJcbiAgICAgICAgICAgICAgcmVzdWx0QXJyYXkgPSByZXN1bHRBcnJheS5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRTdGFydEF0SW5kZXggPSB2YWx1ZS5pbmRleE9mKFwiPlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zbGljZShyZXN1bHRTdGFydEF0SW5kZXggKyAxKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBtYXliZSB0aGUgcmVzcG9uc2UgZG9uJ3QgaGF2ZSBhbnkgPGEgaT17bnVtYmVyfT5cclxuICAgICAgICAgICAgICByZXN1bHRBcnJheSA9IFtyZXN1bHRdO1xyXG4gICAgICAgICAgICAgIGluZGV4ZXMgPSBbMF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHVuZXNjYXBlSFRNTFxyXG4gICAgICAgICAgICByZXN1bHRBcnJheSA9IHJlc3VsdEFycmF5Lm1hcCgodmFsdWUpID0+IFV0aWxzLnVuZXNjYXBlSFRNTCh2YWx1ZSkpO1xyXG5cclxuICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cclxuICAgICAgICAgICAgY29uc3QgZmluYWxSZXN1bEFycmF5ID0gW107XHJcbiAgICAgICAgICAgIC8vIHNvcnRlIGRlIHJlc3VsdHMgYW5kIHB1dCBpbiBmaW5hbFJlc3VsQXJyYXlcclxuICAgICAgICAgICAgZm9yIChjb25zdCBqIGluIGluZGV4ZXMpIHtcclxuICAgICAgICAgICAgICBpZiAoZmluYWxSZXN1bEFycmF5W2luZGV4ZXNbal1dKSB7XHJcbiAgICAgICAgICAgICAgICBmaW5hbFJlc3VsQXJyYXlbaW5kZXhlc1tqXV0gKz0gXCIgXCIgKyByZXN1bHRBcnJheVtqXTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmluYWxSZXN1bEFycmF5W2luZGV4ZXNbal1dID0gcmVzdWx0QXJyYXlbal07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmluYWxSZXN1bEFycmF5O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RXh0cmFQYXJhbWV0ZXJzKHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgcmVxdWVzdHMpIHtcclxuICAgICAgICAgIHJldHVybiBgJnNsPSR7c291cmNlTGFuZ3VhZ2V9JnRsPSR7dGFyZ2V0TGFuZ3VhZ2V9JnRrPSR7R29vZ2xlSGVscGVyLmNhbGNIYXNoKFxyXG4gICAgICAgICAgICByZXF1ZXN0cy5tYXAoKGluZm8pID0+IGluZm8ub3JpZ2luYWxUZXh0KS5qb2luKFwiXCIpXHJcbiAgICAgICAgICApfWA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXF1ZXN0Qm9keShzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIHJlcXVlc3RzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVxdWVzdHNcclxuICAgICAgICAgICAgLm1hcCgoaW5mbykgPT4gYCZxPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGluZm8ub3JpZ2luYWxUZXh0KX1gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgY29uc3QgeWFuZGV4U2VydmljZSA9IG5ldyAoY2xhc3MgZXh0ZW5kcyBTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICBzdXBlcihcclxuICAgICAgICBcInlhbmRleFwiLFxyXG4gICAgICAgIFwiaHR0cHM6Ly90cmFuc2xhdGUueWFuZGV4Lm5ldC9hcGkvdjEvdHIuanNvbi90cmFuc2xhdGU/c3J2PXRyLXVybC13aWRnZXRcIixcclxuICAgICAgICBcIkdFVFwiLFxyXG4gICAgICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3Qoc291cmNlQXJyYXkyZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHNvdXJjZUFycmF5MmRcclxuICAgICAgICAgICAgLm1hcCgodmFsdWUpID0+IFV0aWxzLmVzY2FwZUhUTUwodmFsdWUpKVxyXG4gICAgICAgICAgICAuam9pbihcIjx3YnI+XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gcGFyc2VSZXNwb25zZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgY29uc3QgbGFuZyA9IHJlc3BvbnNlLmxhbmc7XHJcbiAgICAgICAgICBjb25zdCBkZXRlY3RlZExhbmd1YWdlID0gbGFuZyA/IGxhbmcuc3BsaXQoXCItXCIpWzBdIDogbnVsbDtcclxuICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0Lm1hcChcclxuICAgICAgICAgICAgLyoqIEByZXR1cm4ge1NlcnZpY2VfU2luZ2xlX1Jlc3VsdF9SZXNwb25zZX0gKi8gKFxyXG4gICAgICAgICAgICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqLyB0ZXh0XHJcbiAgICAgICAgICAgICkgPT4gKHsgdGV4dCwgZGV0ZWN0ZWRMYW5ndWFnZSB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKHJlc3VsdCwgZG9udFNvcnRSZXN1bHRzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgICAgIC5zcGxpdChcIjx3YnI+XCIpXHJcbiAgICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiBVdGlscy51bmVzY2FwZUhUTUwodmFsdWUpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEV4dHJhUGFyYW1ldGVycyhzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIHJlcXVlc3RzKSB7XHJcbiAgICAgICAgICByZXR1cm4gYCZpZD0ke1lhbmRleEhlbHBlci50cmFuc2xhdGVTaWR9LTAtMCZmb3JtYXQ9aHRtbCZsYW5nPSR7XHJcbiAgICAgICAgICAgIHNvdXJjZUxhbmd1YWdlID09PSBcImF1dG9cIiA/IFwiXCIgOiBzb3VyY2VMYW5ndWFnZSArIFwiLVwiXHJcbiAgICAgICAgICB9JHt0YXJnZXRMYW5ndWFnZX0ke3JlcXVlc3RzXHJcbiAgICAgICAgICAgIC5tYXAoKGluZm8pID0+IGAmdGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudChpbmZvLm9yaWdpbmFsVGV4dCl9YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIil9YDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlcXVlc3RCb2R5KHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgcmVxdWVzdHMpIHtcclxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHRyYW5zbGF0ZShcclxuICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICBzb3VyY2VBcnJheTNkLFxyXG4gICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlLFxyXG4gICAgICBkb250U29ydFJlc3VsdHMgPSBmYWxzZVxyXG4gICAgKSB7XHJcbiAgICAgIGF3YWl0IFlhbmRleEhlbHBlci5maW5kU0lEKCk7XHJcbiAgICAgIGlmICghWWFuZGV4SGVscGVyLnRyYW5zbGF0ZVNpZCkgcmV0dXJuO1xyXG4gICAgICBpZiAoc291cmNlTGFuZ3VhZ2Uuc3RhcnRzV2l0aChcInpoXCIpKSBzb3VyY2VMYW5ndWFnZSA9IFwiemhcIjtcclxuICAgICAgaWYgKHRhcmdldExhbmd1YWdlLnN0YXJ0c1dpdGgoXCJ6aFwiKSkgdGFyZ2V0TGFuZ3VhZ2UgPSBcInpoXCI7XHJcbiAgICAgIHJldHVybiBhd2FpdCBzdXBlci50cmFuc2xhdGUoXHJcbiAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgdGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgICAgc291cmNlQXJyYXkzZCxcclxuICAgICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlLFxyXG4gICAgICAgIGRvbnRTb3J0UmVzdWx0c1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH0pKCk7XHJcblxyXG4gIGNvbnN0IGJpbmdTZXJ2aWNlID0gbmV3IChjbGFzcyBleHRlbmRzIFNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIHN1cGVyKFxyXG4gICAgICAgIFwiYmluZ1wiLFxyXG4gICAgICAgIFwiaHR0cHM6Ly93d3cuYmluZy5jb20vdHRyYW5zbGF0ZXYzP2lzVmVydGljYWw9MVwiLFxyXG4gICAgICAgIFwiUE9TVFwiLFxyXG4gICAgICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3Qoc291cmNlQXJyYXkyZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHNvdXJjZUFycmF5MmRcclxuICAgICAgICAgICAgLm1hcCgodmFsdWUpID0+IFV0aWxzLmVzY2FwZUhUTUwodmFsdWUpKVxyXG4gICAgICAgICAgICAuam9pbihcIjx3YnI+XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gcGFyc2VSZXNwb25zZShyZXNwb25zZSkge1xyXG4gICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHRleHQ6IHJlc3BvbnNlWzBdLnRyYW5zbGF0aW9uc1swXS50ZXh0LFxyXG4gICAgICAgICAgICAgIGRldGVjdGVkTGFuZ3VhZ2U6IHJlc3BvbnNlWzBdLmRldGVjdGVkTGFuZ3VhZ2UubGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UocmVzdWx0LCBkb250U29ydFJlc3VsdHMpIHtcclxuICAgICAgICAgIHJldHVybiBbVXRpbHMudW5lc2NhcGVIVE1MKHJlc3VsdCldO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RXh0cmFQYXJhbWV0ZXJzKHNvdXJjZUxhbmd1YWdlLCB0YXJnZXRMYW5ndWFnZSwgcmVxdWVzdHMpIHtcclxuICAgICAgICAgIHJldHVybiBgJiR7QmluZ0hlbHBlci50cmFuc2xhdGVfSUlEX0lHfWA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbiBnZXRSZXF1ZXN0Qm9keShzb3VyY2VMYW5ndWFnZSwgdGFyZ2V0TGFuZ3VhZ2UsIHJlcXVlc3RzKSB7XHJcbiAgICAgICAgICByZXR1cm4gYCZmcm9tTGFuZz0ke3NvdXJjZUxhbmd1YWdlfSR7cmVxdWVzdHNcclxuICAgICAgICAgICAgLm1hcCgoaW5mbykgPT4gYCZ0ZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KGluZm8ub3JpZ2luYWxUZXh0KX1gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKX0mdG89JHt0YXJnZXRMYW5ndWFnZX0ke0JpbmdIZWxwZXIudHJhbnNsYXRlU2lkfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHRyYW5zbGF0ZShcclxuICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICBzb3VyY2VBcnJheTNkLFxyXG4gICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlLFxyXG4gICAgICBkb250U29ydFJlc3VsdHMgPSBmYWxzZVxyXG4gICAgKSB7XHJcbiAgICAgIC8qKiBAdHlwZSB7e3NlYXJjaDogc3RyaW5nLCByZXBsYWNlOiBzdHJpbmd9W119ICovXHJcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZWFyY2g6IFwiYXV0b1wiLFxyXG4gICAgICAgICAgcmVwbGFjZTogXCJhdXRvLWRldGVjdFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc2VhcmNoOiBcInpoLUNOXCIsXHJcbiAgICAgICAgICByZXBsYWNlOiBcInpoLUhhbnNcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNlYXJjaDogXCJ6aC1UV1wiLFxyXG4gICAgICAgICAgcmVwbGFjZTogXCJ6aC1IYW50XCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZWFyY2g6IFwidGxcIixcclxuICAgICAgICAgIHJlcGxhY2U6IFwiZmlsXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZWFyY2g6IFwiaG1uXCIsXHJcbiAgICAgICAgICByZXBsYWNlOiBcIm13d1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc2VhcmNoOiBcImNrYlwiLFxyXG4gICAgICAgICAgcmVwbGFjZTogXCJrbXJcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNlYXJjaDogXCJtblwiLFxyXG4gICAgICAgICAgcmVwbGFjZTogXCJtbi1DeXJsXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBzZWFyY2g6IFwibm9cIixcclxuICAgICAgICAgIHJlcGxhY2U6IFwibmJcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHNlYXJjaDogXCJzclwiLFxyXG4gICAgICAgICAgcmVwbGFjZTogXCJzci1DeXJsXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgXTtcclxuICAgICAgcmVwbGFjZW1lbnRzLmZvckVhY2goKHIpID0+IHtcclxuICAgICAgICBpZiAodGFyZ2V0TGFuZ3VhZ2UgPT09IHIuc2VhcmNoKSB7XHJcbiAgICAgICAgICB0YXJnZXRMYW5ndWFnZSA9IHIucmVwbGFjZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNvdXJjZUxhbmd1YWdlID09PSByLnNlYXJjaCkge1xyXG4gICAgICAgICAgc291cmNlTGFuZ3VhZ2UgPSByLnJlcGxhY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGF3YWl0IEJpbmdIZWxwZXIuZmluZFNJRCgpO1xyXG4gICAgICBpZiAoIUJpbmdIZWxwZXIudHJhbnNsYXRlX0lJRF9JRykgcmV0dXJuO1xyXG5cclxuICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyLnRyYW5zbGF0ZShcclxuICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgICAgICBzb3VyY2VBcnJheTNkLFxyXG4gICAgICAgIGRvbnRTYXZlSW5QZXJzaXN0ZW50Q2FjaGUsXHJcbiAgICAgICAgZG9udFNvcnRSZXN1bHRzXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgY29uc3QgZGVlcGxTZXJ2aWNlID0gbmV3IChjbGFzcyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgdGhpcy5EZWVwTFRhYiA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBhc3luYyB0cmFuc2xhdGUoXHJcbiAgICAgIHNvdXJjZUxhbmd1YWdlLFxyXG4gICAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgICAgc291cmNlQXJyYXkzZCxcclxuICAgICAgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZSxcclxuICAgICAgZG9udFNvcnRSZXN1bHRzID0gZmFsc2VcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCB3YWl0Rmlyc3RUcmFuc2xhdGlvblJlc3VsdCA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGxpc3RlbmVyID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJEZWVwTF9maXJzdFRyYW5zbGF0aW9uUmVzdWx0XCIpIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKFtbcmVxdWVzdC5yZXN1bHRdXSk7XHJcbiAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihsaXN0ZW5lcik7XHJcblxyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIHJlc29sdmUoW1tcIlwiXV0pO1xyXG4gICAgICAgICAgfSwgODAwMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuRGVlcExUYWIpIHtcclxuICAgICAgICAgIGNocm9tZS50YWJzLmdldCh0aGlzLkRlZXBMVGFiLmlkLCAodGFiKSA9PiB7XHJcbiAgICAgICAgICAgIGNoZWNrZWRMYXN0RXJyb3IoKTtcclxuICAgICAgICAgICAgaWYgKHRhYikge1xyXG4gICAgICAgICAgICAgIC8vY2hyb21lLnRhYnMudXBkYXRlKHRhYi5pZCwge2FjdGl2ZTogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoXHJcbiAgICAgICAgICAgICAgICB0YWIuaWQsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ0cmFuc2xhdGVUZXh0V2l0aERlZXBMXCIsXHJcbiAgICAgICAgICAgICAgICAgIHRleHQ6IHNvdXJjZUFycmF5M2RbMF1bMF0sXHJcbiAgICAgICAgICAgICAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgZnJhbWVJZDogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAocmVzcG9uc2UpID0+IHJlc29sdmUoW1tyZXNwb25zZV1dKVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICB1cmw6IGBodHRwczovL3d3dy5kZWVwbC5jb20vIyEke3RhcmdldExhbmd1YWdlfSEjJHtlbmNvZGVVUklDb21wb25lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlQXJyYXkzZFswXVswXVxyXG4gICAgICAgICAgICAgICAgICApfWAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKHRhYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLkRlZXBMVGFiID0gdGFiO1xyXG4gICAgICAgICAgICAgICAgICB3YWl0Rmlyc3RUcmFuc2xhdGlvblJlc3VsdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgLy8gcmVzb2x2ZShbW1wiXCJdXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZShcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHVybDogYGh0dHBzOi8vd3d3LmRlZXBsLmNvbS8jISR7dGFyZ2V0TGFuZ3VhZ2V9ISMke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgICAgICAgIHNvdXJjZUFycmF5M2RbMF1bMF1cclxuICAgICAgICAgICAgICApfWAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICh0YWIpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzLkRlZXBMVGFiID0gdGFiO1xyXG4gICAgICAgICAgICAgIHdhaXRGaXJzdFRyYW5zbGF0aW9uUmVzdWx0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICAvLyByZXNvbHZlKFtbXCJcIl1dKVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSkoKTtcclxuXHJcbiAgLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBTZXJ2aWNlPn0gKi9cclxuICBjb25zdCBzZXJ2aWNlTGlzdCA9IG5ldyBNYXAoKTtcclxuXHJcbiAgc2VydmljZUxpc3Quc2V0KFwiZ29vZ2xlXCIsIGdvb2dsZVNlcnZpY2UpO1xyXG4gIHNlcnZpY2VMaXN0LnNldChcInlhbmRleFwiLCB5YW5kZXhTZXJ2aWNlKTtcclxuICBzZXJ2aWNlTGlzdC5zZXQoXCJiaW5nXCIsIGJpbmdTZXJ2aWNlKTtcclxuICBzZXJ2aWNlTGlzdC5zZXQoXHJcbiAgICBcImRlZXBsXCIsXHJcbiAgICAvKiogQHR5cGUge1NlcnZpY2V9ICovIC8qKiBAdHlwZSB7P30gKi8gKGRlZXBsU2VydmljZSlcclxuICApO1xyXG5cclxuICB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlSFRNTCA9IGFzeW5jIChcclxuICAgIHNlcnZpY2VOYW1lLFxyXG4gICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgIHNvdXJjZUFycmF5M2QsXHJcbiAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlID0gZmFsc2UsXHJcbiAgICBkb250U29ydFJlc3VsdHMgPSBmYWxzZVxyXG4gICkgPT4ge1xyXG4gICAgc2VydmljZU5hbWUgPSB0d3BMYW5nLmdldEFsdGVybmF0aXZlU2VydmljZShcclxuICAgICAgdGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgIHNlcnZpY2VOYW1lLFxyXG4gICAgICB0cnVlXHJcbiAgICApO1xyXG4gICAgY29uc3Qgc2VydmljZSA9IHNlcnZpY2VMaXN0LmdldChzZXJ2aWNlTmFtZSkgfHwgc2VydmljZUxpc3QuZ2V0KFwiZ29vZ2xlXCIpO1xyXG4gICAgcmV0dXJuIGF3YWl0IHNlcnZpY2UudHJhbnNsYXRlKFxyXG4gICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgdGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgIHNvdXJjZUFycmF5M2QsXHJcbiAgICAgIGRvbnRTYXZlSW5QZXJzaXN0ZW50Q2FjaGUsXHJcbiAgICAgIGRvbnRTb3J0UmVzdWx0c1xyXG4gICAgKTtcclxuICB9O1xyXG5cclxuICB0cmFuc2xhdGlvblNlcnZpY2UudHJhbnNsYXRlVGV4dCA9IGFzeW5jIChcclxuICAgIHNlcnZpY2VOYW1lLFxyXG4gICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgIHNvdXJjZUFycmF5MmQsXHJcbiAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlID0gZmFsc2VcclxuICApID0+IHtcclxuICAgIHNlcnZpY2VOYW1lID0gdHdwTGFuZy5nZXRBbHRlcm5hdGl2ZVNlcnZpY2UoXHJcbiAgICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgICBzZXJ2aWNlTmFtZSxcclxuICAgICAgZmFsc2VcclxuICAgICk7XHJcbiAgICBjb25zdCBzZXJ2aWNlID0gc2VydmljZUxpc3QuZ2V0KHNlcnZpY2VOYW1lKSB8fCBzZXJ2aWNlTGlzdC5nZXQoXCJnb29nbGVcIik7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBhd2FpdCBzZXJ2aWNlLnRyYW5zbGF0ZShcclxuICAgICAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgICAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgICAgICBbc291cmNlQXJyYXkyZF0sXHJcbiAgICAgICAgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZVxyXG4gICAgICApXHJcbiAgICApWzBdO1xyXG4gIH07XHJcblxyXG4gIHRyYW5zbGF0aW9uU2VydmljZS50cmFuc2xhdGVTaW5nbGVUZXh0ID0gYXN5bmMgKFxyXG4gICAgc2VydmljZU5hbWUsXHJcbiAgICBzb3VyY2VMYW5ndWFnZSxcclxuICAgIHRhcmdldExhbmd1YWdlLFxyXG4gICAgb3JpZ2luYWxUZXh0LFxyXG4gICAgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZSA9IGZhbHNlXHJcbiAgKSA9PiB7XHJcbiAgICBzZXJ2aWNlTmFtZSA9IHR3cExhbmcuZ2V0QWx0ZXJuYXRpdmVTZXJ2aWNlKFxyXG4gICAgICB0YXJnZXRMYW5ndWFnZSxcclxuICAgICAgc2VydmljZU5hbWUsXHJcbiAgICAgIGZhbHNlXHJcbiAgICApO1xyXG4gICAgY29uc3Qgc2VydmljZSA9IHNlcnZpY2VMaXN0LmdldChzZXJ2aWNlTmFtZSkgfHwgc2VydmljZUxpc3QuZ2V0KFwiZ29vZ2xlXCIpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgYXdhaXQgc2VydmljZS50cmFuc2xhdGUoXHJcbiAgICAgICAgc291cmNlTGFuZ3VhZ2UsXHJcbiAgICAgICAgdGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgICAgW1tvcmlnaW5hbFRleHRdXSxcclxuICAgICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlXHJcbiAgICAgIClcclxuICAgIClbMF1bMF07XHJcbiAgfTtcclxuXHJcbiAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gICAgY29uc3QgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZSA9IHNlbmRlci50YWIgPyBzZW5kZXIudGFiLmluY29nbml0byA6IGZhbHNlO1xyXG4gICAgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcInRyYW5zbGF0ZUhUTUxcIikge1xyXG4gICAgICB0cmFuc2xhdGlvblNlcnZpY2VcclxuICAgICAgICAudHJhbnNsYXRlSFRNTChcclxuICAgICAgICAgIHJlcXVlc3QudHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgXCJhdXRvXCIsXHJcbiAgICAgICAgICByZXF1ZXN0LnRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgICAgcmVxdWVzdC5zb3VyY2VBcnJheTNkLFxyXG4gICAgICAgICAgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZSxcclxuICAgICAgICAgIHJlcXVlc3QuZG9udFNvcnRSZXN1bHRzXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiBzZW5kUmVzcG9uc2UocmVzdWx0cykpXHJcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoKTtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwidHJhbnNsYXRlVGV4dFwiKSB7XHJcbiAgICAgIHRyYW5zbGF0aW9uU2VydmljZVxyXG4gICAgICAgIC50cmFuc2xhdGVUZXh0KFxyXG4gICAgICAgICAgcmVxdWVzdC50cmFuc2xhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICBcImF1dG9cIixcclxuICAgICAgICAgIHJlcXVlc3QudGFyZ2V0TGFuZ3VhZ2UsXHJcbiAgICAgICAgICByZXF1ZXN0LnNvdXJjZUFycmF5LFxyXG4gICAgICAgICAgZG9udFNhdmVJblBlcnNpc3RlbnRDYWNoZVxyXG4gICAgICAgIClcclxuICAgICAgICAudGhlbigocmVzdWx0cykgPT4gc2VuZFJlc3BvbnNlKHJlc3VsdHMpKVxyXG4gICAgICAgIC5jYXRjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcInRyYW5zbGF0ZVNpbmdsZVRleHRcIikge1xyXG4gICAgICB0cmFuc2xhdGlvblNlcnZpY2VcclxuICAgICAgICAudHJhbnNsYXRlU2luZ2xlVGV4dChcclxuICAgICAgICAgIHJlcXVlc3QudHJhbnNsYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgXCJhdXRvXCIsXHJcbiAgICAgICAgICByZXF1ZXN0LnRhcmdldExhbmd1YWdlLFxyXG4gICAgICAgICAgcmVxdWVzdC5zb3VyY2UsXHJcbiAgICAgICAgICBkb250U2F2ZUluUGVyc2lzdGVudENhY2hlXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiBzZW5kUmVzcG9uc2UocmVzdWx0cykpXHJcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoKTtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHRyYW5zbGF0aW9uU2VydmljZTtcclxufSkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7QUFFQSxNQUFNQSxrQkFBa0IsR0FBSSxZQUFZO0VBQ3RDLE1BQU1BLGtCQUFrQixHQUFHLEVBQTNCOztFQUVBLE1BQU1DLEtBQU4sQ0FBWTtJQUNWO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7SUFDcUIsT0FBVkMsVUFBVSxDQUFDQyxNQUFELEVBQVM7TUFDeEIsT0FBT0EsTUFBTSxDQUNWQyxPQURJLENBQ0ksS0FESixFQUNXLE9BRFgsRUFFSkEsT0FGSSxDQUVJLEtBRkosRUFFVyxNQUZYLEVBR0pBLE9BSEksQ0FHSSxLQUhKLEVBR1cs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
