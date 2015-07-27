/**
 * Created by gilboklee on 15. 7. 27..
 */
this.Config = {
    host: "http://alpha.hornet.hive5.io",
    appKey: "d8444735-15e3-4198-9179-102ba68776fc",
    uuid: "testdevice4",
    os: "ios"
};

function defaultInitialize()
{
    Hive5.initialize(Config.host, Config.appKey, Config.uuid);
}


function initTest()
{
    defaultInitialize();
    return Hive5.Auth.login(Config.os, '','','','');
}


QUnit.test( "initialize test", function( assert ) {
    Hive5.initialize(Config.host, Config.appKey, Config.uuid);
    assert.equal( Hive5._host, Config.host, "Passed!" );
    assert.equal( Hive5._appKey, Config.appKey, "Passed!" );
    assert.equal( Hive5._uuid, Config.uuid, "Passed!" );
});
/*
 * Auth
 */
QUnit.test( "Auth.login[anonymous] test", function( assert ) {
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
        assert.equal( jsonData.result_code, 0, "Passed!" );
        assert.ok( jsonData.access_token.length > 0, "Passed!" );
        assert.ok( jsonData.session_key.length> 0, "Passed!" );
        assert.equal( jsonData.user.platform, "anonymous", "Passed!" );
        assert.ok( jsonData.user.id > 0, "Passed!" );
        done();
    }).catch(function () {
        assert.ok( false, "fails" );
        done();
    });
});

QUnit.test( "Auth.delete test", function( assert ) {
    var done = assert.async();

    initTest().then(function () {
        var p = Hive5.Auth.delete();
        p.then(function (response) {
            var jsonData = JSON.parse(response.raw);
            assert.equal( jsonData.result_code, 0, "Passed!" );
            done();
        }).catch(function () {
            assert.ok( false, "fails" );
            done();
        });
    });
});

/*
 * Settings
 */
QUnit.test( "Settings.checkNicknameAvailability test", function( assert ) {
    var done = assert.async();

    initTest().then(function () {
        var p = Hive5.Settings.checkNicknameAvailability("my_nickname1234");
        p.then(function (response) {
            var jsonData = JSON.parse(response.raw);
            assert.equal( jsonData.result_code, 0, "Passed!" );
            assert.equal( jsonData.available, true, "Passed!" );
            done();
        }).catch(function () {
            assert.ok( false, "fails" );
            done();
        });
    });
});

/*
 * Script
 */
QUnit.test( "Script.runScript test", function( assert ) {
    var done = assert.async();

    var scriptParams = { echo: "hello"};

    initTest().then(function () {
        var p = Hive5.Script.runScript("echo", JSON.stringify(scriptParams));
        p.then(function (response) {
            var jsonData = JSON.parse(response.raw);
            assert.equal( jsonData.result_code, 0, "Passed!" );
            assert.equal( jsonData.call_return, "hello", "Passed!" );
            done();
        }).catch(function () {
            assert.ok( false, "fails" );
            done();
        });
    });
});