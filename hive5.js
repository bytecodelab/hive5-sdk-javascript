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
    },

    /**
     * 닉네임을 설정한다.
     * @memberOf Hive5.Settings
     * @param {string} nickname Nickname
     * @return {Hive5.Promise}
     */
    setNickname: function (nickname) {

      var options = {
        method: "POST",
        route: "settings/nickname/set",
        data : {nickname: nickname}
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
     * 리더보드에 점수를 제출한다. 기존 등록 점수보다 높으면 결과중 updated_at에 시간이 기록되며, 그렇지 않을 경우 null로 리턴된다.
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

(function (root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Push
   * @namespace Hive5.Push
   * @memberOf Hive5
   */
  Hive5.Push = {

    /**
     * Push 토큰을 등록 또는 업데이트한다.
     * @memberOf Hive5.Push
     * @param {string} platform Push platform으로 "gcm" 또는 "apns"를 지정한다.
     * @param {string} token Push token
     */
    updatePushToken: function (platform, token) {

      var data = {
        push_platform: platform,
        push_token: token
      };

      var options = {
        method: "POST",
        route: "pushes/register",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * Push 수신을 활성화하거나 비활성화한다.
     * @memberOf Hive5.Leaderboard
     * @param {boolean} activeFlag Push 수신여부
     * @return {Hive5.Promise}
     */
    activate: function (activeFlag) {

      var options = {
        method: "POST",
        route: "pushes/activate/" + activeFlag
      };

      return Hive5._request(options);
    }
  };

}(this));

(function (root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * SocialGraph
   * @namespace Hive5.SocialGraph
   * @memberOf Hive5
   */
  Hive5.SocialGraph = {

    /**
     * 친구를 등록한다
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 등록할 그룹명
     * @param {array} friends 등록할 친구의 array. 친구는 {platform:<platform>, id:<user id} 형태로 표현된다.
     */
    addFriends: function (groupName, friends) {

      var data = {
        group: groupName,
        friends: friends
      };

      var options = {
        method: "POST",
        route: "friends/add",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 친구를 삭제한다
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 대상 그룹명
     * @param {array} friends 삭제할 친구의 array. 친구는 {platform:<platform>, id:<user id} 형태로 표현된다.
     */
    removeFriends: function (groupName, friends) {

      var data = {
        group: groupName,
        friends: friends
      };

      var options = {
        method: "POST",
        route: "friends/remove",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 친구목록을 업데이트한다
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 업데이트 대상 그룹명
     * @param {array} friends 새로 업데이트할 친구의 array. 친구는 {platform:<platform>, id:<user id} 형태로 표현된다.
     */
    updateFriends: function (groupName, friends) {

      var data = {
        group: groupName,
        friends: friends
      };

      var options = {
        method: "POST",
        route: "friends/update",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 친구 목록을 가져온다
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 대상 그룹명
     */
    listFriends: function (groupName) {

      var data = {
        group: groupName
      };

      var options = {
        method: "GET",
        route: "friends",
        data: data
      };

      return Hive5._request(options);
    }
  };

}(this));

(function (root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Purchase
   * @namespace Hive5.Purchase
   * @memberOf Hive5
   */
  Hive5.Purchase = {

    /**
     * 구글 결제를 시작한다
     * @memberOf Hive5.Purchase
     * @param {string} productCode 상품 코드
     * @param {string} [receiver] 선물 받을 사용자로 {platform:<platform>, id:<user id} 형태로 표현된다.
     * @param {string} [mailForReceiver] 친구에게 선물할 때 메일을 같이 보내려고 할 때, 메일의 content를 세팅
     */
    createGooglePurchase: function (productCode, receiver, mailForReceiver) {

      var data = {
        product_code: productCode,
        receiver: receiver,
        mail_for_receiver: mailForReceiver
      };

      var options = {
        method: "POST",
        route: "google_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 구글 결제를 완료 처리한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     * @param {string} purchaseData Google IAP API에서 응답받은 내용 중 purchase data
     * @param {string} signature Google IAP API에서 응답받은 내용 중 signature
     */
    completeGooglePurchase: function (id, params, listPrice, purchasedPrice, currency, purchaseData, signature) {

      var data = {
        params: params,
        purchase_data: purchaseData,
        signature: signature,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency
      };

      var options = {
        method: "POST",
        route: "google_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 구글 구매 상태를 확인한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     */
    _getPurchaseStatus: function (platform, id) {
      var options = {
        method: "GET",
        route: platform + "_purchases/" + id
      };

      return Hive5._request(options);
    },
    getGooglePurchaseStatus: function (id) {
      return this._getPurchaseStatus("google", id);
    },

    /**
     * 애플 결제를 시작한다
     * @memberOf Hive5.Purchase
     * @param {string} productCode 상품 코드
     * @param {string} [receiver] 선물 받을 사용자로 {platform:<platform>, id:<user id} 형태로 표현된다.
     * @param {string} [mailForReceiver] 친구에게 선물할 때 메일을 같이 보내려고 할 때, 메일의 content를 세팅
     */
    createApplePurchase: function (productCode, receiver, mailForReceiver) {

      var data = {
        product_code: productCode,
        receiver: receiver,
        mail_for_receiver: mailForReceiver
      };

      var options = {
        method: "POST",
        route: "apple_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 애플 결제를 완료 처리한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     * @param {string} receipt Apple 결제 후 받은 'receipt'. Base 64 Encoding이 필요함
     * @param {boolean} [isSandbox] receipt가 apple의 sandbox용 일 경우에 true. default false
     */
    completeApplePurchase: function (id, params, listPrice, purchasedPrice, currency, receipt, isSandbox) {

      var data = {
        params: params,
        receipt: receipt,
        is_sandbox: isSandbox,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency
      };

      var options = {
        method: "POST",
        route: "apple_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 애플 구매 상태를 확인한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     */
    getApplePurchaseStatus: function (id) {
      return this._getPurchaseStatus("apple", id);
    },

    /**
     * 네이버 결제를 시작한다
     * @memberOf Hive5.Purchase
     * @param {string} productCode 네이버에 등록된 상품의 code
     * @param {string} paymentSequence 네이버 결제 완료후 전달받은 paymentSeq 값
     * @param {string} [receiver] 선물 받을 사용자로 {platform:<platform>, id:<user id} 형태로 표현된다.
     * @param {string} [mailForReceiver] 친구에게 선물할 때 메일을 같이 보내려고 할 때, 메일의 content를 세팅
     */
    createNaverPurchase: function (productCode, paymentSequence, receiver, mailForReceiver) {

      var data = {
        product_code: productCode,
        payment_sequence: paymentSequence,
        receiver: receiver,
        mail_for_receiver: mailForReceiver
      };

      var options = {
        method: "POST",
        route: "naver_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 네이버 결제를 완료 처리한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     */
    completeNaverPurchase: function (id, params, listPrice, purchasedPrice, currency) {

      var data = {
        params: params,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency
      };

      var options = {
        method: "POST",
        route: "naver_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 네이버 구매 상태를 확인한다
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     */
    getNaverPurchaseStatus: function (id) {
      return this._getPurchaseStatus("naver", id);
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
     * 스크립트를 실행한다. 성공시 스크립트 실행결과를 리턴받는다.
     * <code>current</code>.
     *
     * <p>description</p>
     *
     * @memberOf Hive5.Script
     * @param {string} scriptName - 스크립트 이름
     * @param {object} [scriptParams] - 스크립트 실행에 넘길 parameter
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