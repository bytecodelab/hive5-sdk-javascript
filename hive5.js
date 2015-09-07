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
     * @typedef {Object} LoginResult
     * @property {integer} result_code 결과코드. Error code 참고.
     * @property {string} [result_message] 결과메시지. 실패한 경우에 메시지 있을 수 있음.
     * @property {string} access_token 로그인한 사용자를 위한 access token.
     * @property {string} session_key 로그인한 사용자를 위한 session key.
     * @property {Object} user 사용자.
     *  @property {string} user.platform 로그인한 사용자의 플랫폼.
     *  @property {string} user.id 로그인한 사용자의 unique한 고유 Id, platform이 'anonymous'인 경우 hive5에서 id를 발급한다.
     * @property {string} nickname 닉네임.
     * @property {integer} new_mail_count 지난 로그인 이후 도착한 메일 수
     * @property {*} [extras] 추가 데이터. 이 값을 세팅하면, 목록을 가져올 때 이 데이터도 가져올 수 있다.
     */

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
     * @return {Hive5.Promise.<LoginResult>} A promise that is fulfilled with the authentication when
     *     the login is complete.
     */
    logIn: function (os, build, locale, platform, id) {
      var data = {
        os: os,
        build: build,
        locale: locale
      };

      if (platform && id) {
        data.user = {platform:platform, id:id}
      }

      var options = {
        method: "POST",
        route: "auth/log_in",
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
    unregister: function () {
      var options = {
        method: "POST",
        route: "auth/unregister"
      };

      return Hive5._request(options);
    },

    /**
     * 플레이어와 연동된 Social Platform을 변동한다.
     * @memberOf Hive5.Auth
     * @param {Object} user 변경할 user 정보
     * @param {string} user.platform social platform
     * @param {string} user.id user id
     * @return {Hive5.Promise}
     */
    switchPlatform: function (user) {

      var options = {
        method: "POST",
        route: "auth/switch",
        data : {user: user}
      };

      return Hive5._request(options);
    },

    /**
     * 약관 동의를 처리한다.
     * @memberOf Hive5.Auth
     * @param {string} agreementName 약관의 이름이나 버전
     * @param {string} agreementValue 약관에 동의한 내용
     * @return {Hive5.Promise}
     */
    submitAgreements: function (agreementName, agreementValue) {
      var agreement = {};
      agreement[agreementName] = agreementValue;

      var options = {
        method: "POST",
        route: "agreements",
        data : agreement
      };

      return Hive5._request(options);
    },

    /**
     * 약관 동의 기록을 조회한다.
     * @memberOf Hive5.Auth
     * @return {Hive5.Promise}
     */
    getAgreements: function () {

      var options = {
        method: "GET",
        route: "agreements"
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
    },


    /**
     * Push 토큰을 등록 또는 업데이트한다.
     * @memberOf Hive5.Settings
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
        route: "settings/push_tokens/update",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * Push 수신을 허용한다.
     * @memberOf Hive5.Settings
     * @return {Hive5.Promise}
     */
    activate: function () {

      var options = {
        method: "POST",
        route: "settings/pushes/activate"
      };

      return Hive5._request(options);
    },

    /**
     * Push 수신을 거부한다.
     * @memberOf Hive5.Settings
     * @return {Hive5.Promise}
     */
    deactivate: function () {

      var options = {
        method: "POST",
        route: "settings/pushes/deactivate"
      };

      return Hive5._request(options);
    }
  };
}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * 메일
   * @namespace Hive5.Mail
   * @memberOf Hive5
   */
  Hive5.Mail = {

    /**
     * 메일을 생성한다.
     * @memberOf Hive5.Mail
     * @param {string} content 메일 내용
     * @param {Object} [user] 메일 수신자. null로 전달하면 로그인한 플레이어에게 보낸다
     * @param {string} user.platform 수신자의 social platform
     * @param {string} user.id 수신자의 user id
     * @param {*} [extras=null] 추가 데이터.
     * @param {string[]} [tags] 메일에 붙일 태그목록.
     */
    create: function (content, user, extras, tags) {

      var data = {
        content: content,
        user: user,
        extras: extras,
        tags: tags
      };

      var options = {
        method: "POST",
        route: "mails",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일을 가져온다.
     * @memberOf Hive5.Mail
     * @param {string} [order="dec"] order를 "asc"로 하면 오래된 메일부터, "dec"로 하면 새로운 메일부터 가져온다.
     * @param {number} [offset] 메일을 가져올 위치를 지정한다.
     * @param {number} [limit] 가져올 개수. 최대는 20개.
     * @param {string} [tag] 특정 tag가 붙은 메일만 가져올때 지정한다.
     */
    list: function (order, offset, limit, tag) {

      var data = {
        order: order,
        offset: offset,
        limit: limit,
        tag: tag
      };

      var options = {
        method: "GET",
        route: "mails",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일을 개수를 가져온다.
     * @memberOf Hive5.Mail
     * @param {string} [tag] 특정 tag가 붙은 메일만 가져올때 지정한다.
     */
    count: function (tag) {

      var data = {
        tag: tag
      };

      var options = {
        method: "GET",
        route: "mails/count",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일을 업데이트한다.
     * @memberOf Hive5.Mail
     * @param {string} id 메일 아이디
     * @param {string} content 메일 내용
     * @param {*} extras 추가 데이터.
     */
    update: function (id, content, extras) {

      var data = {
        content: content,
        extras: extras
      };

      var options = {
        method: "PUT",
        route: "mails/"+id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일을 삭제한다.
     * @memberOf Hive5.Mail
     * @param {string} id 메일 아이디
     */
    delete: function (id) {

      var options = {
        method: "DELETE",
        route: "mails/"+id
      };

      return Hive5._request(options);
    },

    /**
     * 오래된 메일을 삭제한다.
     * @memberOf Hive5.Mail
     * @param {number} days days로 지정된 날짜보다 오래된 메일을 삭제한다.
     */
    deleteOlderThan: function (days) {

      var options = {
        method: "POST",
        route: "mails/delete_older_than/"+days
      };

      return Hive5._request(options);
    },

    /**
     * 특정 개수를 초과한 메일을 삭제한다.
     * @memberOf Hive5.Mail
     * @param {number} limit 최대 보관 메일 개수로 지정된 개수보다 많은 메일을 삭제한다. 오래된 메일부터 삭제된다.
     */
    deleteOverLimit: function (limit) {

      var options = {
        method: "POST",
        route: "mails/delete_over_limit/"+limit
      };

      return Hive5._request(options);
    },

    /**
     * 메일에 태그를 추가한다.
     * @memberOf Hive5.Mail
     * @param {string} id 메일 아이디
     * @param {string[]} tags 태그의 목록
     */
    addTags: function (id, tags) {

      var data = {
        tags: tags
      };

      var options = {
        method: "POST",
        route: "mails/"+id+"/add_tags",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일에서 태그를 삭제가한다.
     * @memberOf Hive5.Mail
     * @param {string} id 메일 아이디
     * @param {string[]} tags 태그의 목록
     */
    removeTags: function (id, tags) {

      var data = {
        tags: tags
      };

      var options = {
        method: "POST",
        route: "mails/"+id+"/remove_tags",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 메일에 reward가 있는 경우 reward를 받는다.
     * @memberOf Hive5.Mail
     * @param {string} id 메일 아이디
     */
    acceptReward: function (id) {

      var options = {
        method: "POST",
        route: "mails/"+id+"/rewards/accept"
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
     * @param {*} [extras=null] 추가 데이터. 이 값을 세팅하면, 목록을 가져올 때 이 데이터도 가져올 수 있다.
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
     * 리더보드의 내 점수와 관련된 정보를 가져온다.
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
     * @param {string[]} [objectKeys] 사용자의 object를 가져올 수 있다. key의 array
     * @param {number} [rangeMin] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최소값
     * @param {number} [rangeMax] 특정 score 구간내의 목록으로 얻어오고자 할 때, 구간의 최대값
     * @return {Hive5.Promise}
     */
    listScores: function (leaderboardKey, rankMin, rankMax, objectKeys, rangeMin, rangeMax) {

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
     * @param {string[]} [objectKeys] 사용자의 object를 가져올 수 있다. key의 array
     * @return {Hive5.Promise}
     */
    listSocialScores: function (leaderboardKey, objectKeys) {

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
   * SocialGraph
   * @namespace Hive5.SocialGraph
   * @memberOf Hive5
   */
  Hive5.SocialGraph = {

    /**
     * 친구를 등록한다.
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 등록할 그룹명
     * @param {Object[]} friends 등록할 친구의 array
     * @param {string} friends[].platform 친구의 social platform
     * @param {string} friends[].id 친구의 user id
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
     * 친구를 삭제한다.
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 대상 그룹명
     * @param {Object[]} friends 삭제할 친구의 array
     * @param {string} friends[].platform 친구의 social platform
     * @param {string} friends[].id 친구의 user id
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
     * 친구목록을 업데이트한다.
     * @memberOf Hive5.SocialGraph
     * @param {string} groupName 업데이트 대상 그룹명
     * @param {array} friends 새로 업데이트할 친구의 array
     * @param {string} friends[].platform 친구의 social platform
     * @param {string} friends[].id 친구의 user id
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
     * 친구 목록을 가져온다.
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
     * 구글 결제를 시작한다.
     * @memberOf Hive5.Purchase
     * @param {string} productCode 상품 코드
     * @param {Object} [receiver] 다른 사용자에게 선물할 때, 선물 받을 사용자
     * @param {string} receiver.platform 사용자의 social platform
     * @param {string} receiver.id 사용자의 user id
     */
    createGooglePurchase: function (productCode, receiver) {

      var data = {
        product_code: productCode,
        receiver: receiver
      };

      var options = {
        method: "POST",
        route: "google_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 구글 결제를 완료 처리한다.
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {Object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     * @param {string} purchaseData Google IAP API에서 응답받은 내용 중 purchase data
     * @param {string} signature Google IAP API에서 응답받은 내용 중 signature
     * @param {boolean} [test=false] 결제 테스트 모드로 수행할 때 true로 세팅한다
     */
    completeGooglePurchase: function (id, params, listPrice, purchasedPrice, currency, purchaseData, signature, test) {

      var data = {
        params: params,
        purchase_data: purchaseData,
        signature: signature,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency,
        test: test
      };

      var options = {
        method: "POST",
        route: "google_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    _getPurchaseStatus: function (platform, id) {
      var options = {
        method: "GET",
        route: platform + "_purchases/" + id
      };

      return Hive5._request(options);
    },

    /**
     * 구글 구매 상태를 확인한다.
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     */
    getGooglePurchaseStatus: function (id) {
      return this._getPurchaseStatus("google", id);
    },

    /**
     * 애플 결제를 시작한다.
     * @memberOf Hive5.Purchase
     * @param {string} productCode 상품 코드
     * @param {Object} [receiver] 다른 사용자에게 선물할 때, 선물 받을 사용자
     * @param {string} receiver.platform 사용자의 social platform
     * @param {string} receiver.id 사용자의 user id
     */
    createApplePurchase: function (productCode, receiver) {

      var data = {
        product_code: productCode,
        receiver: receiver
      };

      var options = {
        method: "POST",
        route: "apple_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 애플 결제를 완료 처리한다.
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {Object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     * @param {string} receipt Apple 결제 후 받은 'receipt'. Base 64 Encoding이 필요함
     * @param {boolean} [isSandbox=false] receipt가 apple의 sandbox용 일 경우에 true. 그렇지 않으면 false
     * @param {boolean} [test=false] 결제 테스트 모드로 수행할 때 true로 세팅한다
     */
    completeApplePurchase: function (id, params, listPrice, purchasedPrice, currency, receipt, isSandbox, test) {

      var data = {
        params: params,
        receipt: receipt,
        is_sandbox: isSandbox,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency,
        test: test
      };

      var options = {
        method: "POST",
        route: "apple_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 애플 구매 상태를 확인한다.
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     */
    getApplePurchaseStatus: function (id) {
      return this._getPurchaseStatus("apple", id);
    },

    /**
     * 네이버 결제를 시작한다.
     * @memberOf Hive5.Purchase
     * @param {string} productCode 네이버에 등록된 상품의 code
     * @param {string} paymentSequence 네이버 결제 완료후 전달받은 paymentSeq 값
     * @param {Object} [receiver] 다른 사용자에게 선물할 때, 선물 받을 사용자
     * @param {string} receiver.platform 사용자의 social platform
     * @param {string} receiver.id 사용자의 user id
     */
    createNaverPurchase: function (productCode, paymentSequence, receiver) {

      var data = {
        product_code: productCode,
        payment_sequence: paymentSequence,
        receiver: receiver
      };

      var options = {
        method: "POST",
        route: "naver_purchases",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 네이버 결제를 완료 처리한다.
     * @memberOf Hive5.Purchase
     * @param {string} id 구매 시작때 발급받은 구매 id
     * @param {Object} params 구매 완료 script에 전달할 params
     * @param {number} listPrice 원래 상품의 가격
     * @param {number} purchasedPrice 실제 구매한 가격
     * @param {string} currency 'KRW', 'USD', 'JPY' 중 하나
     * @param {boolean} [test=false] 결제 테스트 모드로 수행할 때 true로 세팅한다
     */
    completeNaverPurchase: function (id, params, listPrice, purchasedPrice, currency, test) {

      var data = {
        params: params,
        list_price: listPrice,
        purchased_price: purchasedPrice,
        currency: currency,
        test: test
      };

      var options = {
        method: "POST",
        route: "naver_purchases/complete/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 네이버 구매 상태를 확인한다.
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
     * @memberOf Hive5.Script
     * @param {string} scriptName - 스크립트 이름
     * @param {Object} [scriptParams] - 스크립트 실행에 넘길 parameter
     * @return {Hive5.Promise} A promise that is fulfilled with the result when
     *     running script is complete.
     */
    runScript: function (scriptName, scriptParams) {

      var options = {
        method: "POST",
        route: "scripts/run/" + scriptName,
        data: {params:scriptParams}
      };

      return Hive5._request(options);
    }
  };
}(this));

(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Coupon
   * @namespace Hive5.Coupon
   * @memberOf Hive5
   */
  Hive5.Coupon = {

    /**
     * 발급된 쿠폰을 적용한다.
     * @memberOf Hive5.Coupon
     * @param {string} serial 쿠폰의 시리얼 번호.
     */
    redeem: function (serial) {

      var options = {
        method: "POST",
        route: "coupons/"+ serial + "/redeem"
      };

      return Hive5._request(options);
    }
  };

}(this));

(function (root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * DataTable
   * @namespace Hive5.DataTable
   * @memberOf Hive5
   */
  Hive5.DataTable = {

    /**
     * DataTable을 가져온다.
     * @memberOf Hive5.DataTable
     * @param {string} name DataTable 이름
     * @param {number} [revision] Revision 정보. 이 정보가 있으면, 서버에 revision이 갱신된 경우에만 가져온다.
     */
    get: function (name, revision) {

      var data = {
        revision: revision
      };

      var options = {
        method: "GET",
        route: "data_table/"+ name,
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
   * Forum
   * @namespace Hive5.Forum
   * @memberOf Hive5
   */
  Hive5.Forum = {

    /**
     * 포럼에 등록된 글들을 가져온다.
     * @memberOf Hive5.Forum
     * @param {string} key Forum key
     * @param {string} [order="dec"] 가져온 글 순서. "asc"는 오래된 글부터, "dec"는 새로운 글부터
     * @param {string} [offset=0] 가져온 글의 offset
     * @param {string} [limit=20] 가져올 글의 개수를 지정
     */
    listThreads: function (key, order, offset, limit) {

      var data = {
        key: key,
        order: order,
        offset: offset,
        limit: limit
      };

      var options = {
        method: "GET",
        route: "forums/" + key + "/threads",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 포럼에 등록된 글의 개수를 가져온다.
     * @memberOf Hive5.Forum
     * @param {string} key Forum key
     */
    countThreads: function (key) {

      var options = {
        method: "GET",
        route: "forums/" + key + "/threads/count",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 포럼에 글을 쓴다.
     * @memberOf Hive5.Forum
     * @param {string} key Forum key
     * @param {string} title 제목
     * @param {string} content 내용
     * @param {*} [extras=null] 추가 데이터
     */
    createThread: function (key, title, content, extras) {

      var data = {
        key: key,
        title: title,
        content: content,
        extras: extras
      };

      var options = {
        method: "POST",
        route: "forums/" + key + "/threads",
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 포럼에 쓴 글을 수정한다.
     * @memberOf Hive5.Forum
     * @param {string} key Forum key
     * @param {string} id 수정할 글(thread)의 id
     * @param {string} title 제목
     * @param {string} content 내용
     * @param {*} [extras=null] 추가 데이터
     */
    updateThread: function (key, id, title, content, extras) {

      var data = {
        key: key,
        title: title,
        content: content,
        extras: extras
      };

      var options = {
        method: "PUT",
        route: "forums/" + key + "/threads/" + id,
        data: data
      };

      return Hive5._request(options);
    },

    /**
     * 포럼에 쓴 글을 삭제한다.
     * @memberOf Hive5.Forum
     * @param {string} key Forum key
     * @param {string} id 수정할 글(thread)의 id
     */
    deleteThread: function (key, id) {

      var options = {
        method: "DELETE",
        route: "forums/" + key + "/threads/" + id
      }

      return Hive5._request(options);
    }
  };
}(this));


(function(root) {
  root.Hive5 = root.Hive5 || {};
  var Hive5 = root.Hive5;

  /**
   * Representation of error codes.
   * @enum {number}
   * @readonly
   * @memberOf Hive5
   */
  Hive5.ErrorCode = {
    /** Success */
    SUCCESS: 0,

    /** Invalid parameter */
    INVALID_PARAM: 1001,
    /** Data dose not exist */
    DATA_DOES_NOT_EXIST: 1002,

    /** Invalid reward */
    INVALID_REWARD: 2101,
    /** The reward was already applied */
    ALREADY_ACCEPTED_REWARD: 2102,
    /** Invalid tag pattern */
    INVALID_TAG_PATTERN: 2103,

    /** Invalid purchase status */
    INVALID_PURCHASE_STATUS: 2201,
    /** Invalid payment sequence */
    INVALID_PAYMENT_SEQUENCE: 2202,
    /** Invalid apple receipt */
    INVALID_APPLE_RECEIPT: 2203,
    /** Invalid google purchase data */
    INVALID_GOOGLE_PURCHASE_DATA: 2204,
    /** Invalid google signature */
    INVALID_GOOGLE_SIGNATURE: 2205,
    /** No google iap public key is registered */
    NO_GOOGLE_IAP_PUBLIC_KEY: 2206,
    /** Invalid google iap public key */
    INVALID_GOOGLE_IAP_PUBLIC_KEY: 2207,
    /** No kakao app auth info */
    NO_KAKAO_APP_AUTH_INFO: 2208,

    /** No iap conversion */
    NO_IAP_CONVERSION: 2303,

    /** Expired coupon */
    EXPIRED_COUPON: 2504,
    /** The player has already consumed the coupon */
    ALREADY_CONSUMED_COUPON: 2505,
    /** The coupon is no more applicable */
    NO_MORE_APPLICABLE_COUPON: 2506,

    /** Not friend */
    NOT_FRIEND: 2701,
    /** Too many friends */
    TOO_MANY_FRIENDS: 2705,

    /** Already existing nickname */
    ALREADY_EXISTING_NICKNAME: 2801,
    /** Forbidden nickname */
    FORBIDDEN_NICKNAME: 2802,

    /** Javascript Exception: Script(javascript) 실행 때 예외 발생. 내용은 result_message를 참조 */
    JS_EXCEPTION: 3001,

    /** Undefined Script: 정의되지 않은 스크립트 */
    UNDEFINED_SCRIPT: 3101,
    /** Protected Script: REST로 외부에서 직접 실행시킬 수 없는 스크립트 */
    PROTECTED_SCRIPT: 3102,
    /** Undefined Library: 정의되지 않은 라이브러리 */
    UNDEFINED_USER_LIB: 3103,

    /** Object Not Found: load/save/destroy의 대상 객체를 찾을 수 없다 */
    OBJECT_NOT_FOUND: 3201,
    /** Invalid object */
    INVALID_OBJECT: 3205,
    /** Already Existing Object: 이미 존재하는 Object임 */
    ALREADY_EXISTING_OBJECT: 3206,
    /** Invalid Object Key: object의 key 명명 규칙에 위배 */
    INVALID_OBJECT_KEY: 3207,

    /** Data Table Not Found: 정의된 Data Table이 없다 */
    UNDEFINED_DATA_TABLE: 3301,

    /** Undefined AppData Key: 정의되지 않은 HAppCounter, HAppDictionary, HAppQueue Key */
    UNDEFINED_APPDATA_KEY: 3501,

    /** Execution Timeout: 수행 시간 타임아웃 */
    SCRIPT_TIMEOUT: 3901,
    /** Unsupported Library or Function: 지원되지 않는 라이브러리/함수 */
    UNSUPPORTED_LIBRARY: 3903,
    /** Unsupported Data Type: 지원되지 않는 데이터 형식 */
    UNSUPPORTED_DATA_TYPE: 3904,

    /** Already existing platform user name */
    ALREADY_EXISTING_PLATFORM_USER_NAME: 4001,
    /** Already existing platform user email */
    ALREADY_EXISTING_PLATFORM_USER_EMAIL: 4002,
    /** Invalid name or password */
    INVALID_NAME_OR_PASSWORD: 4003,

    /** Invalid push payload */
    INVALID_PAYLOAD: 5001,

    /** Campaign status is invalid */
    INVALID_CAMPAIGN_STATUS: 5101,
    /** Batch push status is invalid */
    INVALID_BATCH_PUSH_STATUS: 5301,

    /** Readonly forum: 읽기 전용 포럼에 쓰기, 수정, 삭제는 불가능 */
    READONLY_FORUM: 6001,
    /** Suspended forum: 사용 중단된 포럼 */
    SUSPENDED_FORUM: 6002,

    /** App Object가 다른데서 이미 수정되어 update가 불가능 */
    APP_OBJECT_ALREADY_MODIFIED: 7001,

    /** The user has been disabled */
    PLAYER_HAS_BEEN_BLOCKED: 8001,
    /** The session key is invalid */
    INVALID_SESSION_KEY: 8002,
    /** App configuration is invalid */
    INVALID_APP_CONFIGURATION: 9001,

    /** Internal Error: invalid app configuration */
    NOT_IMPLEMENTED: 9998,
    /** Unknown error */
    UNKNOWN_ERROR: 9999
  };
}(this));
