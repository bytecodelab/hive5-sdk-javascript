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
  return Hive5.Auth.logIn(Config.os);
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
QUnit.test("Auth.logIn[anonymous] test", function (assert) {
  defaultInitialize();
  var done = assert.async();

  var os = "ios";
  var build = "1.0.0";
  var locale = "en-US";

  var p = Hive5.Auth.logIn(os, build, locale);
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

QUnit.test("Auth.unregister test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Auth.unregister();
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

QUnit.test("Auth.switchPlatform test", function (assert) {
  var done = assert.async();

  initTest().then(function (loginResponse) {
    var json = JSON.parse(loginResponse.raw);
    var p = Hive5.Auth.switchPlatform({platform:"kakao", id:"kakao_"+json.user.id});
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
 * Player
 */
QUnit.test("Player.checkNicknameAvailability test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Player.checkNicknameAvailability("my_nickname1234");
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

QUnit.test("Player.setNickname test", function (assert) {
  var done = assert.async();

  initTest().then(function (loginResponse) {
    var jsonData = JSON.parse(loginResponse.raw);
    var nickname = "nickname_" + jsonData.user.id;

    var p = Hive5.Player.setNickname(nickname);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");

      // nickname 설정 여부 확인
      var p = Hive5.Player.checkNicknameAvailability(nickname);
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.equal(jsonData.available, false, "Passed!");
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Player.extras test", function (assert) {
  var done = assert.async();

  var extras = "Hello, world";

  initTest().then(function () {
    var p = Hive5.Player.setExtras(extras);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");

      var p = Hive5.Player.getExtras();
      p.then(function (response) {
        console.log(response.raw)
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.equal(jsonData.extras, extras, "Passed!");
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});


/*
 * Settings
 */
QUnit.test("Settings.updatePushToken test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Settings.updatePushToken("gcm", "test_token");
    p.then(function (response) {
      console.log(response.raw)
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Settings.activate test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Settings.activate();
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");

      var p = Hive5.Settings.deactivate();
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Mail
 */
QUnit.test("Mail.create and update test", function (assert) {
  var done = assert.async();

  initTest().then(function () {

    var content = "test mail";
    var p = Hive5.Mail.create(content, null, {type:"heart", count:2}, ["reward"]);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.hasOwnProperty("id"), true, "Passed!");

      var mailId = jsonData.id;

      var p = Hive5.Mail.list();
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.ok(Array.isArray(jsonData.mails), "Passed!");
        assert.equal(jsonData.mails[0].content, content,"Passed!");

        // update
        var newContent = "hahaha";
        var p = Hive5.Mail.update(mailId, newContent, {});
        p.then(function (response) {
          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");

          // list 로 update 확인
          var p = Hive5.Mail.list("dec", 0, 10, "reward");
          p.then(function (response) {
            var jsonData = JSON.parse(response.raw);
            assert.equal(jsonData.mails[0].content, newContent,"Passed!");

            // delete
            var p = Hive5.Mail.delete(mailId);
            p.then(function (response) {
              var jsonData = JSON.parse(response.raw);
              assert.equal(jsonData.result_code, 0, "Passed!");

              // count로  확인
              var p = Hive5.Mail.count();
              p.then(function (response) {
                var jsonData = JSON.parse(response.raw);
                assert.equal(jsonData.count, 0,"Passed!");
                done();
              }).catch(function () {
                assert.ok(false, "fails");
                done();
              });
            }).catch(function () {
              assert.ok(false, "fails");
              done();
            });
          }).catch(function () {
            assert.ok(false, "fails");
            done();
          });
        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Mail.addTags test", function (assert) {
  var done = assert.async();

  initTest().then(function () {

    var content = "test mail";
    var p = Hive5.Mail.create(content, null, {type:"heart", count:2}, []);
    p.then(function (response) {
      console.log(response.raw);
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.hasOwnProperty("id"), true, "Passed!");

      var mailId = jsonData.id;
      var tags = ["event", "test"];

      var p = Hive5.Mail.addTags(mailId, tags);
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");

        // list로  확인
        var p = Hive5.Mail.list();
        p.then(function (response) {
          console.log(response.raw);
          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");
          assert.equal(jsonData.mails[0].tags[0], tags[0], "Passed!");
          assert.equal(jsonData.mails[0].tags[1], tags[1], "Passed!");

          // remove tags
          var p = Hive5.Mail.removeTags(mailId, tags);
          p.then(function (response) {
            console.log("removeTags:"+response.raw);
            var jsonData = JSON.parse(response.raw);
            assert.equal(jsonData.result_code, 0, "Passed!");

            // list로  확인
            var p = Hive5.Mail.list();
            p.then(function (response) {
              console.log(response.raw);
              var jsonData = JSON.parse(response.raw);
              assert.equal(jsonData.result_code, 0, "Passed!");
              assert.equal(jsonData.mails[0].tags.length, 0, "Passed!");
              done();
            }).catch(function () {
              assert.ok(false, "fails");
              done();
            });

          }).catch(function () {
            assert.ok(false, "fails");
            done();
          });
        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });
      }).catch(function () {
        assert.ok(false, "fails");
        done();
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

QUnit.test("Leaderboard.submitScore and getMyScore test", function (assert) {
  defaultInitialize();
  var done = assert.async();

  var extras = {str: "hello", num: 777, bool: true, arr: [1, 2, 3]};

  initTest().then(function () {
    var p = Hive5.Leaderboard.submitScore(leaderboardKey, score, extras);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.hasOwnProperty("updated_at"), true, "Passed!");
      //done();

      var p = Hive5.Leaderboard.getMyScore(leaderboardKey);
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.equal(jsonData.value, score, "Passed!");
        assert.equal(jsonData.hasOwnProperty("rank"), true, "Passed!" );
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Leaderboard.listScores test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Leaderboard.listScores(leaderboardKey, 1, 10);
    p.then(function (response) {
      console.log(response.raw);
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(Array.isArray(jsonData.scores), true, "Passed!");
      assert.ok(jsonData.scores.length >= 0, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("Leaderboard.listSocialScores test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Leaderboard.listSocialScores(leaderboardKey);
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
 * SocialGraph
 */
QUnit.test("SocialGraph.add/remove/list Friends test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.SocialGraph.addFriends("test_group", [{platform:"anonymous", id:"22"}, {platform:"anonymous", id:"23"}]);
    p.then(function (response) {

      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");

      var p = Hive5.SocialGraph.removeFriends("test_group", [{platform:"anonymous", id:"22"}]);
      p.then(function (response) {

        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");

        var p = Hive5.SocialGraph.listFriends("test_group");
        p.then(function (response) {
          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");
          assert.equal(jsonData.friends.length, 1, "Passed!");
          assert.equal(jsonData.friends[0].user.id, "23", "Passed!");
          done();

        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });

      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

QUnit.test("SocialGraph.updateFriends test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.SocialGraph.addFriends("test_group", [{platform:"anonymous", id:"21"}, {platform:"anonymous", id:"22"}]);
    p.then(function (response) {

      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");

      var p = Hive5.SocialGraph.updateFriends("test_group", [{platform:"anonymous", id:"22"}, {platform:"anonymous", id:"23"}]);
      p.then(function (response) {

        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");

        var p = Hive5.SocialGraph.listFriends("test_group");
        p.then(function (response) {

          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");
          assert.equal(jsonData.friends.length, 2, "Passed!");
          assert.equal(jsonData.friends[0].user.id, "22", "Passed!");
          assert.equal(jsonData.friends[1].user.id, "23", "Passed!");
          done();

        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });

      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });

    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Purchase
 */
QUnit.test("Purchase.createGooglePurchase test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Purchase.createGooglePurchase("code_001");
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.ok(jsonData.id.length > 0, "Passed!");

      var p = Hive5.Purchase.getGooglePurchaseStatus(jsonData.id);
      p.then(function (response) {
        var result = JSON.parse(response.raw);
        assert.equal(result.result_code, 0, "Passed!");
        assert.equal(result.purchase.id, jsonData.id, "Passed!");
        assert.equal(result.purchase.product_code, "code_001", "Passed!");
        assert.equal(result.purchase.status, "created", "Passed!");
        //done();

        var params = {test:true};
        var purchaseData = "test";
        var signature = "test";
        var listPrice = 100;
        var purchasedPrice = 100;

        var p = Hive5.Purchase.completeGooglePurchase(jsonData.id, params, listPrice, purchasedPrice, "KRW", purchaseData, signature, true);  // 결제 Test mode로 진행
        p.then(function (response) {

          console.log(response.raw);

          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");
          assert.equal(jsonData.call_return.test, true, "Passed!");
          done();
        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });

      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
    });
  });
});

QUnit.test("Purchase.createApplePurchase test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Purchase.createApplePurchase("code_002");
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.ok(jsonData.id.length > 0, "Passed!");

      var p = Hive5.Purchase.getApplePurchaseStatus(jsonData.id);
      p.then(function (response) {
        var result = JSON.parse(response.raw);
        assert.equal(result.result_code, 0, "Passed!");
        assert.equal(result.purchase.id, jsonData.id, "Passed!");
        assert.equal(result.purchase.product_code, "code_002", "Passed!");
        assert.equal(result.purchase.status, "created", "Passed!");
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
    });
  });
});

QUnit.test("Purchase.createNaverPurchase test", function (assert) {
  var done = assert.async();

  initTest().then(function () {
    var p = Hive5.Purchase.createNaverPurchase("code_003", "a"+Math.floor((Math.random() * 100000000000)));
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.ok(jsonData.id.length > 0, "Passed!");

      var p = Hive5.Purchase.getNaverPurchaseStatus(jsonData.id);
      p.then(function (response) {
        var result = JSON.parse(response.raw);
        assert.equal(result.result_code, 0, "Passed!");
        assert.equal(result.purchase.id, jsonData.id, "Passed!");
        assert.equal(result.purchase.product_code, "code_003", "Passed!");
        assert.equal(result.purchase.status, "created", "Passed!");
        done();
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
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

  var echoStr = "hello, world";

  initTest().then(function () {
    var p = Hive5.Script.runScript("echo", {echo: echoStr});
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.call_return, echoStr, "Passed!");
      done();
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});

/*
 * Forum
 */
QUnit.test("Forum.createThread and updateThread test", function (assert) {
  var done = assert.async();
  var forumKey = "test_forum";

  initTest().then(function () {

    var title = "test title";
    var content = "test content";
    var extras = {type:"heart", count:2};

    var p = Hive5.Forum.createThread(forumKey, title, content, extras);
    p.then(function (response) {
      var jsonData = JSON.parse(response.raw);
      assert.equal(jsonData.result_code, 0, "Passed!");
      assert.equal(jsonData.hasOwnProperty("id"), true, "Passed!");

      var threadId = jsonData.id;

      var p = Hive5.Forum.listThreads(forumKey);
      p.then(function (response) {
        var jsonData = JSON.parse(response.raw);
        assert.equal(jsonData.result_code, 0, "Passed!");
        assert.ok(Array.isArray(jsonData.threads), "Passed!");
        assert.equal(jsonData.threads[jsonData.threads.length-1].content, content,"Passed!");

        // update
        var newContent = "hahaha";
        var p = Hive5.Forum.updateThread(forumKey, threadId, "title", newContent, {});
        p.then(function (response) {
          var jsonData = JSON.parse(response.raw);
          assert.equal(jsonData.result_code, 0, "Passed!");

          // list 로 update 확인
          var p = Hive5.Forum.listThreads(forumKey);
          p.then(function (response) {
            var jsonData = JSON.parse(response.raw);
            assert.equal(jsonData.threads[0].content, newContent,"Passed!");

            // delete
            var p = Hive5.Forum.deleteThread(forumKey, threadId);
            p.then(function (response) {
              var jsonData = JSON.parse(response.raw);
              assert.equal(jsonData.result_code, 0, "Passed!");

              // list로 확인
              var p = Hive5.Forum.listThreads(forumKey);
              p.then(function (response) {
                var jsonData = JSON.parse(response.raw);
                assert.equal(jsonData.threads.filter(function (thread) { return thread.id == threadId; }).length, 0, "Passed!");
                done();
              }).catch(function () {
                assert.ok(false, "fails");
                done();
              });
            }).catch(function () {
              assert.ok(false, "fails");
              done();
            });
          }).catch(function () {
            assert.ok(false, "fails");
            done();
          });
        }).catch(function () {
          assert.ok(false, "fails");
          done();
        });
      }).catch(function () {
        assert.ok(false, "fails");
        done();
      });
    }).catch(function () {
      assert.ok(false, "fails");
      done();
    });
  });
});