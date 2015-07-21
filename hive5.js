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

  Hive5.ping = function() {
    var url = root.Hive5._host + "/ping";

    var xhr = new Hive5.XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if(xhr.status == 200)
          alert(xhr.responseText);
        else
          alert("Error loading page status:"+xhr.status+"\n");
      }
    };
    xhr.send();
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
     * @see Hive5.Auth.login
     * @return {Hive5.Promise} A promise that is fulfilled with the authentication when
     *     the login is complete.
     */
    login: function (os, build, locale, platform, id) {
      var url = root.Hive5._host + "/" + root.Hive5._apiVersion + "/auth/login";

      var data = { 
        "user": { "platform": platform, "id": id },
        "os":os,
        "build":build,
        "locale":locale,
      };

      var xhr = new Hive5.XMLHttpRequest();
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              var response;
              try {
                //response = JSON.parse(xhr.responseText);
                response = xhr.responseText;
              } catch (e) {
                alert(e);
              }
              if (response) {
                alert(response);
              }
            } else {
              alert(xhr.status);
            }
         }
      };

      xhr.open("POST", url, true);
      xhr.setRequestHeader('X-APP-KEY', Hive5._appKey);
      xhr.setRequestHeader('X-AUTH-UUID', Hive5._uuid);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    },

  };
} (this));