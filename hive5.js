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

      if (request.data) {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(request.data);
      } else {
        xhr.send();
      }
    });

    return promise;
  }

  Hive5.ping = function() {
    var options = {
      method: "GET",
      route: "ping",
      data: "",
      withoutVersion: true,
    };

    Hive5._request(options).then(function (response) {
      alert(response.raw);
    });
    
  };
} (this));

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
        user: { platform: platform, id: id },
        os: os,
        build: build,
        locale: locale,
      };

       var options = {
          method: "POST",
          route: "auth/login",
          data: data,
        };

        return Hive5._request(options);
    },

  };
} (this));