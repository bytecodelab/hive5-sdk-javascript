/**
 * Created by gilboklee on 15. 11. 13..
 */
/*!
 * @fileOverview Hive5 Spider JavaScript SDK
 * <br>
 * <br>Visit {@link http://www.hive5.io}
 * @version 1.0.2-beta
 * @author Gilbert Lee
 * @copyright 2015 BytecodeLab, Co.
 */
(function(root) {
  root.WAMPMessages = root.WAMPMessages || {};

  /**
   * Contains everything of WAMPMessages.
   * @namespace WAMPMessages
   */
  var wampMessages = root.WAMPMessages
  Object.defineProperty( wampMessages, "HELLO", { value: 1, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "WELCOME", { value: 2, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "ABORT", { value: 3, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "CHALLENGE", { value: 4, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "AUTHENTICATE", { value: 5, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "GOODBYE", { value: 6, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "HEARTBEAT", { value: 7, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "ERROR", { value: 8, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "PUBLISH", { value: 16, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "PUBLISHED", { value: 17, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "SUBSCRIBE", { value: 32, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "SUBSCRIBED", { value: 33, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "UNSUBSCRIBE", { value: 34, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "UNSUBSCRIBED", { value: 35, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "EVENT", { value: 36, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "CALL", { value: 48, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "CANCEL", { value: 49, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "RESULT", { value: 50, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "REGISTER", { value: 64, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "REGISTERED", { value: 65, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "UNREGISTER", { value: 66, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "UNREGISTERED", { value: 67, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "INVOCATION", { value: 68, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "INTERRUPT", { value: 69, writable: false, enumerable: true, configurable: true});
  Object.defineProperty( wampMessages, "YIELD", { value: 70, writable: false, enumerable: true, configurable: true});
});


(function(root) {
  root.Hive5Spider = root.Hive5Spider || {};

  /**
   * Contains everything of Hive5.
   * @namespace Hive5
   */
  var spider = root.Hive5Spider;

  /**
   * @memberOf Hive5
   * @var SDK Version
   */
  spider.VERSION = "js1.0.2";
  spider._apiVersion = "v6";
  spider.isConnected = false;
  spider._socket = null;
  spider.currentSpiderEndPoint = "";
  spider.requestId = 0;

  spider.init = function(appKey) {
    spider._appKey = appKey;
    spider.requestId = 0;
  }

  spider.getNextRequestId = function () {
    spider.requestId++;
    return spider.requestId;
  }

  spider.subscribe = function(topicUri) {
    alert(root.WAMPMessages.SUBSCRIBE);
    var message = [root.WAMPMessages.SUBSCRIBE, spider.getNextRequestId(), topicUri];
  }

  spider.connect = function(kiterHost) {
    var options = {
      url: kiterHost + "v1/servers/pick",
      method: "GET"
    };
    var p = spider._request(options);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);

      if (jsonData.result_code != 0)
      {
        alert(response.raw);
        return;
      }

      var spiderEndPoint = "ws://" + jsonData.server.ip + ":" + jsonData.server.port + "/ws";
      spider.currentSpiderEndPoint = spiderEndPoint;
      //spiderEndPoint = "ws://echo.websocket.org";

      var websocket = new WebSocket(spiderEndPoint);

      websocket.onopen = function(evt) { spider.onOpen(evt) };
      websocket.onclose = function(evt) { spider.onClose(evt) };
      websocket.onmessage = function(evt) { spider.onMessage(evt) };
      websocket.onerror = function(evt) { spider.onError(evt) };

      spider._socket = websocket;
    });

    spider.onOpen = function(event) {
      if (spider.openCallback) {
        spider.openCallback(event);
      }
    };

    spider.onClose = function(event) {
      if (event.code == 1000)
        reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
      else if(event.code == 1001)
        reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
      else if(event.code == 1002)
        reason = "An endpoint is terminating the connection due to a protocol error";
      else if(event.code == 1003)
        reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
      else if(event.code == 1004)
        reason = "Reserved. The specific meaning might be defined in the future.";
      else if(event.code == 1005)
        reason = "No status code was actually present.";
      else if(event.code == 1006)
        reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
      else if(event.code == 1007)
        reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
      else if(event.code == 1008)
        reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
      else if(event.code == 1009)
        reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
      else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
        reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
      else if(event.code == 1011)
        reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
      else if(event.code == 1015)
        reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
      else
        reason = "Unknown reason";

      if (spider.closeCallback) {
        spider.closeCallback(event);
      }
      alert(reason);
    };

    spider.onMessage = function(event) {
      alert("onMessage" + event);
    };

    spider.onError = function(event) {
      alert("onError" + JSON.stringify(event));
    };

    spider.enterZone = function(zoneTopicUri) {
      spider.subscribe(zoneTopicUri);
    }

    //alert(kiterUrl);

    //if ('WebSocket' in window) {
    //  var oSocket = new WebSocket("ws://localhost:80");
    //}
  }

  spider._request =  function(options)
  {
    var url = options.url;
    var method = options.method;
    var data = options.data;
    var withoutVersion = options.withoutVersion;

    if (method === "GET") {
      if (options.hasOwnProperty("data")) {
        url += "?" + Object.keys(data).filter(function (key) {
              return typeof data[key] != "undefined";
            }).map(function (key) {
              if (Array.isArray(data[key]))
                return key + "=" + data[key].join(",");
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
      xhr.setRequestHeader("X-APP-KEY", Hive5Spider._appKey);
      xhr.setRequestHeader("X-AUTH-UUID", Hive5._uuid);
      if (Hive5.Auth._accessToken) {
        xhr.setRequestHeader("X-AUTH-TOKEN", Hive5.Auth._accessToken);
      }
      if (Hive5.Auth._sessionKey) {
        xhr.setRequestHeader("X-AUTH-SESSION", Hive5.Auth._sessionKey);
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
}(this));
