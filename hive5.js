/*!
 * @fileOverview Hive5 JavaScript SDK
 * <br>
 * <br>Visit {@link http://www.hive5.io}
 * @version 1.0.0
 * @author Gilbert Lee, Artie Choi
 * @copyright 2015 BytecodeLab, Co.
 */
(function(root) {
  root.Hive5 = root.Hive5 || {};

  /**
   * Contains everything of Hive5.
   * @namespace Hive5
   */
  var Hive5 = root.Hive5;

  /**
   * @memberOf Hive5
   * @var SDK Version
   */
  Hive5.VERSION = "js1.0.0";
  Hive5._apiVersion = "v6";
}(this));


(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  if (typeof(XMLHttpRequest) !== 'undefined') {
    Hive5.XMLHttpRequest = XMLHttpRequest;
  } else if (typeof(require) === 'function' &&
      typeof(require.ensure) === 'undefined') {
    Hive5.XMLHttpRequest = req('xmlhttprequest').XMLHttpRequest;
  }

}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Initialize Hive5
   * @memberOf Hive5
   * @param {string} host - Given Hive5 host
   * @param {string} appKey - Given app key
   * @param {string} uuid - Unique device Id
   */
  Hive5.initialize = function (host, appKey, uuid) {
    root.Hive5._host = host;
    root.Hive5._appKey = appKey;
    root.Hive5._uuid = uuid;
  };

  /**
   * Options:
   *   route: is classes, users, login, etc.
   *   method: the http method for the REST API. ( "GET" or "POST")
   *   data: the payload as an object, or null if there is none.
   *   withoutVersion: boolean that means whether insert apiVersion in to path or not
   * @ignore
   */
  Hive5._request = function(options) {
    var route = options.route;
    var method = options.method;
    var data = options.data;
    var withoutVersion = options.withoutVersion;
    
    var url = Hive5._host;
    if (url.charAt(url.length - 1) !== "/") {
      url += "/";
    }
    if (!withoutVersion) {
      url += Hive5._apiVersion + "/";
    }

    url += route;

    if (method === "GET") {
      if (options.hasOwnProperty("data")) {
        url += "?" + Object.keys(data).filter(function (key) {
          return typeof data[key] != "undefined";
        }).map(function (key) {
          if (Array.isArray(data[key]))
            return data[key].map(function(value) {return key + "=" + value}).join("&");
          else
            return key + "=" + data[key];
        }).join("&");
      }
      data = "";
    } else {
      data = JSON.stringify(data);
    }

    var request = {
      url: url,
      method: method,
      data: data
    };

    var promise = new Promise(function(resolve, reject) {
      var response = {
        request: request
      };

     var xhr = new Hive5.XMLHttpRequest();
     response.xhr = xhr;

      xhr.open(request.method, request.url, true);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          response.status = xhr.status;

          if(xhr.status == 200) {
            response.raw = xhr.responseText;
            resolve(response);
          }
          else {
            reject(response);
          }
        }
      };

      // add headers
      xhr.setRequestHeader("X-APP-KEY", Hive5._appKey);
      xhr.setRequestHeader("X-AUTH-UUID", Hive5._uuid);
      if (Hive5._accessToken) {
        xhr.setRequestHeader("X-AUTH-TOKEN", Hive5._accessToken);
      }
      if (Hive5._sessionKey) {
        xhr.setRequestHeader("X-AUTH-SESSION", Hive5._sessionKey);
      }
      if (Hive5._requestId) {
        xhr.setRequestHeader("X-REQUEST-ID", Hive5._requestId);
      }

      if (request.data) {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(request.data);
      } else {
        xhr.send();
      }
    });

    return promise;
  };

  /**
   * @ignore
   */
  Hive5.ping = function() {
    var options = {
      method: "GET",
      route: "ping",
      data: "",
      withoutVersion: true
    };

    Hive5._request(options).then(function (response) {
      alert(response.raw);
    });
    
  };
}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Representation of an authentication to the
   * Hive5 cloud
   * @namespace Hive5.Auth
   * @memberOf Hive5
   */
  Hive5.Auth = {

    /**
     * Logs in a Hive5.Auth. On success, this saves the session to localStorage,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * @memberOf Hive5.Auth
     * @param {string} [os] Operation System (ex, ios, android)
     * @param {string} [build] Build version (ex, 1.0.0)
     * @param {string} [locale] Locale (ex, ko-KR)
     * @param {string} [platform] Authentication platform (ex, facebook, kakao)
     * @param {string} [id] User Id dedicated to platform
     * @return {Hive5.Promise} A promise that is fulfilled with the authentication when
     *     the login is complete.
     */
    login: function (os, build, locale, platform, id) {
      var data = {
        os: os,
        build: build,
        locale: locale
      };

      if (platform && id) {
        data.user = {};
        if (platform) {
          data.user.platform = platform;
        }
        if (id) {
          data.user.id = id;
        }
      }

      var options = {
        method: "POST",
        route: "auth/login",
        data: data
      };

      var p = new Promise(function(resolve, reject) {
        Hive5._request(options).then(
            function(response) {
              var jsonData = JSON.parse(response.raw);

              Hive5._accessToken = jsonData.access_token;
              Hive5._sessionKey = jsonData.session_key;
              Hive5._user = jsonData.user;

              resolve(response);
             }
        );
      });

      return p;
    },

    /**
     * Withdraws from the game.
     * @memberOf Hive5.Auth
     * @example
     * Hive5.Auth.delete().then(function (response) {
     *  // handle result
     * }).catch(function (response) {
     *  // handle error
     * });
     *
     */
    delete: function () {
        var options = {
          method: "POST",
          route: "auth/delete"
        };

        return Hive5._request(options);
    }
  };

}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Representation of settings like setting nickname and so on.
   * @namespace Hive5.Settings
   * @memberOf Hive5
   */
  Hive5.Settings = {

    /**
     * Check availability of nickname in a Hive5.Settings. On success, this saves the session to localStorage,
     * so you can retrieve the result.
     * <code>current</code>.
     *
     * <p>description</p>
     *
     * @memberOf Hive5.Settings
     * @param {string} nickname Nickname for a user
     * @return {Hive5.Promise} A promise that is fulfilled with the authentication when
     *     the login is complete.
     */
    checkNicknameAvailability: function (nickname) {

      var options = {
        method: "GET",
        route: "settings/nickname/is_available/" + nickname
      };

      return Hive5._request(options);
    }
  };
}(this));

(function (root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * 리더보드
   * @namespace Hive5.Leaderboard
   * @memberOf Hive5
   */
  Hive5.Leaderboard = {

    /**
     * 리더보드에 점수를 제출한다
     * @memberOf Hive5.Leaderboard
     * @param {string} leaderboardKey Leaderboard Key
     * @param {number} score 점수
     * @param {*} [extras] 추가 데이터. 이 값을 세팅하면, 목록을 가져올 때 이 데이터도 가져올 수 있다.
     */
    submitScore: function (leaderboardKey, score, extras) {

      var data = {
        score: score,
        extras: extras
      };

      var options = {
        method: "POST",
        route: "leaderboards/" + leaderboardKey + "/scores",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 리더보드의 내 점수와 관련된 정보를 가져온다
     * @memberOf Hive5.Leaderboard
     * @param {string} leaderboardKey Leaderboard Key
     * @param {number} [rangeMin] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최소값
     * @param {number} [rangeMax] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최대값
     * @return {Hive5.Promise}
     */
    getMyScore: function (leaderboardKey, rangeMin, rangeMax) {

      var data = {
        range_min: rangeMin,
        range_max: rangeMax
      };

      var options = {
        method: "GET",
        route: "leaderboards/" + leaderboardKey + "/my_score",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 리더보드에서 순위 목록을 가져온다.
     * @memberOf Hive5.Leaderboard
     * @param {string} leaderboardKey Leaderboard Key
     * @param {number} rankMin 랭킹의 범위 최소값
     * @param {number} rankMax 랭킹의 범위 최대값
     * @param {array} [objectKeys] 사용자의 object를 가져올 수 있다. key의 array
     * @param {number} [rangeMin] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최소값
     * @param {number} [rangeMax] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최대값
     * @return {Hive5.Promise}
     */
    getScores: function (leaderboardKey, rankMin, rankMax, objectKeys, rangeMin, rangeMax) {

      var data = {
        object_class: objectKeys,
        rank_min: rankMin,
        rank_max: rankMax,
        range_min: rangeMin,
        range_max: rangeMax
      };

      var options = {
        method: "GET",
        route: "leaderboards/" + leaderboardKey + "/scores",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 리더보드에서 친구들의 순위 목록을 가져온다.
     * @memberOf Hive5.Leaderboard
     * @param {string} leaderboardKey Leaderboard Key
     * @param {array} [objectKeys] 사용자의 object를 가져올 수 있다. key의 array
     * @return {Hive5.Promise}
     */
    getSocialScores: function (leaderboardKey, objectKeys) {

      var data = {
        object_class: objectKeys
      };

      var options = {
        method: "GET",
        route: "leaderboards/" + leaderboardKey + "/social_scores",
        data: data
      };

      return Hive5._request(options);
    }
  };

}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Representation of Cloud Scripting.
   * @namespace Hive5.Script
   * @memberOf Hive5
   */
  Hive5.Script = {

    /**
     * Run script with paramters in a Hive5.Settings.
     * On success, return result of running script in cloud.
     * <code>current</code>.
     *
     * <p>description</p>
     *
     * @memberOf Hive5.Script
     * @param {string} scriptName - Name of a Script
     * @param {object} [scriptParams] - Paramters for a Script (JSON)
     * @return {Hive5.Promise} A promise that is fulfilled with the result when
     *     running script is complete.
     */
    runScript: function (scriptName, scriptParams) {

      var options = {
        method: "POST",
        route: "scripts/run/" + scriptName,
        data: scriptParams
      };

      return Hive5._request(options);
    }
  };
}(this));