(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

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
    var data = options.data || {};
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
      url += "?" + data;
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
  * @class
  *
  * <p>A Hive5.Auth object is a local representation of an authentication to the
  * Hive5 cloud. It has authentication specific methods like authentication, signing up, 
  * switch social platform.</p>
  */
  Hive5.Auth = {

    /**
     * Logs in a Hive5.Auth. On success, this saves the session to localStorage,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>description</p>
     *
     * @param {string} os Operation System (ex, ios, android)
     * @param {string} build Build version (ex, 1.0.0)
     * @param {string} locale Locale (ex, ko-KR)
     * @param {string} platform Authentication platform (ex, facebook, kakao)
     * @param {string} id User Id dedicated to platform
     * @see Hive5.Auth.login
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

    delete: function () {
        var options = {
          method: "POST",
          route: "auth/delete",
          data: {}
        };

        return Hive5._request(options);
    }
  };
}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * @class
   *
   * <p>A Hive5.Settings object is for Settings like setting nickname and so on.</p>
   */
  Hive5.Settings = {

    /**
     * Check availability of nickname in a Hive5.Settings. On success, this saves the session to localStorage,
     * so you can retrieve the result.
     * <code>current</code>.
     *
     * <p>description</p>
     *
     * @param {string} nickname Nickname for a user
     * @see Hive5.Auth.login
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