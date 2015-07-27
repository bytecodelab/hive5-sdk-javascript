# maui-sdk-javascript
Hive5 Javascript SDK

# CORS 이슈 해결

## Play Framework
https://www.playframework.com/documentation/2.4.x/CorsFilter


## Unit Test
유닛테스트를 위해 Javascript용 유닛테스트 프레임웍인 QUnit을 이용하고 있다.

### 유닛테스트 실행
브라우저로 hive5_unit_test.html을 열면 바로 유닛테스트가 실행된다.
Filter에 Auth 따위를 입력하면, 해당 이름이 test 제목에 포함된 test만 수행된다.

### 유닛테스트 추가

유닛테스트를 추가하기 위해서는 hive5_unit_test.js 파일을 수정하면 된다.
동기코드 테스트와 비동기코드 테스트 샘플을 아래 소개한다.

동기 코드를 위한 테스트 코드 샘플
```js
QUnit.test( "Your sync something test", function( assert ) {
  var foo = bar();
  alert.ok(foo.age > 20, "Passed!");
  alert.equal(foo.name, "somebody", "Passed!");
}
```

비동기 코드를 위한 테스트 코드 샘플
```js
QUnit.test( "Your async something test" function( assert ) {
  var done = assert.async();
  barAsync().then(function(result) {
    alert.ok(result.error == null), "Passed!");
  }).catch(function(error) {
    alert.ok(false, error.message);
  });
}
```

### 더 보기
QUnit에 대한 더 자세한 정보는 다음 링크를 참고하라.
[http://qunitjs.com/](http://qunitjs.com/)
