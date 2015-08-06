/**
 * Created by gilboklee on 15. 7. 27..
 */


this.Config = {
  host: "http://alpha.hornet.hive5.io",
  appKey: "d8444735-15e3-4198-9179-102ba68776fc",
  uuid: "testdevice4",
  os: "ios"
};

function defaultInitialize() {
  Hive5.initialize(Config.host, Config.appKey, Config.uuid);
}


function initTest() {
  defaultInitialize();
  return Hive5.Auth.login(Config.os);
}

QUnit.test("initialize test", function (assert) {
  Hive5.initialize(Config.host, Config.appKey, Config.uuid);
  assert.equal(Hive5._host, Config.host, "Passed!");
  assert.equal(Hive5._appKey, Config.appKey, "Passed!");
  assert.equal(Hive5._uuid, Config.uuid, "Passed!");
});

/*
 * Auth
 */
function loginTest() {
  defaultInitialize();
  var os = "ios";
  var build = "1.0.0";
  var locale = "en-US";
  var platform = "";
  var id = "";
  return Hive5.Auth.login(os, build, locale, platform, id);
}

QUnit.test("Auth.login[anonymous] test", function (assert) {
  defaultInitialize();
  var done = assert.async();

  var os = "ios";
  var build = "1.0.0";
  var locale = "en-US";
  var platform = "";
  var id = "";

  var p = Hive5.Auth.login(os, build, locale, platform, id);
  p.then(function (response) {
    var jsonData = JSON.parse(response.raw);
    assert.equal(jsonData.result_code, 0, "Passed!");
    assert.ok(jsonData.access_token.length > 0, "Passed!");
    assert.ok(jsonData.session_key.length > 0, "Passed!");
    assert.equal(jsonData.user.platform, "anonymous", "Passed!");
    assert.ok(jsonData.user.id > 0, "Passed!");
    done();
  }).catch(function () {
    assert.ok(false, "fails");
    done();
  });
});

QUnit.test("Auth.delete test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Auth.delete();
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Settings
 */
QUnit.test("Settings.checkNicknameAvailability test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Settings.checkNicknameAvailability("my_nickname1234");
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.available, true, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Settings.setNickname test", function (assert) {
  var done = assert.async();

  loginTest().then(function (loginResponse) {
    var jsonData = JSON.parse(loginResponse.raw);
    var nickname = "nickname_" + jsonData.user.id;
    console.log(nickname);

    var p = Hive5.Settings.setNickname(nickname);
    p.then(function (response) {
      console.log(response.raw);
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      done();

      // nickname 설정 여부 확인
      var p = Hive5.Settings.checkNicknameAvailability(nickname);
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.equal(jsonData.available, false, "Passed!");
        //done();
      }).catch(function () {
        assert.ok(false, "fails");
        //done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Leaderboard
 */
var leaderboardKey = "leader1";
var score = 200;

QUnit.test("Leaderboard.submitScore test", function (assert) {
  defaultInitialize();
  var done = assert.async();

  var extras = {str: "hello", num: 777, bool: true, arr: [1, 2, 3]};

  initTest().then(function () {
    var p = Hive5.Leaderboard.submitScore(leaderboardKey, score, extras);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.hasOwnProperty("updated_at"), true, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Leaderboard.getMyScore test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Leaderboard.getMyScore(leaderboardKey);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.value, score, "Passed!");
      assert.equal( jsonData.hasOwnProperty("rank"), true, "Passed!" );
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Leaderboard.getScores test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Leaderboard.getScores(leaderboardKey, 1, 10);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(Array.isArray(jsonData.scores), true, "Passed!");
      assert.ok(jsonData.scores.length >= 1, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Leaderboard.getSocialScores test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Leaderboard.getSocialScores(leaderboardKey);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(Array.isArray(jsonData.scores), true, "Passed!");
      assert.ok(jsonData.scores.length >= 1, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Script
 */
QUnit.test("Script.runScript test", function (assert) {
  var done = assert.async();

  var scriptParams = {echo: "hello"};

  initTest().then(function () {
    var p = Hive5.Script.runScript("echo", scriptParams);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.call_return, "hello", "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});
