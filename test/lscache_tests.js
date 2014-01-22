//var originalConsole = window.console;
var assert = require("assert");
var lscache = require("../lib/lscache");

suite('lscache', function() {
  setup(function() {
    // Reset localStorage before each test
    try {
      localStorage.clear();
    } catch(e) {}
  });

  teardown(function() {
    // Reset localStorage after each test
    try {
      localStorage.clear();
    } catch(e) {}
    //window.console = originalConsole;
    //lscache.enableWarnings(false);
  });

  test('Testing set() and get() with string', function() {
    var key = 'thekey';
    var value = 'thevalue'
    lscache.set(key, value, 1);
    if (lscache.supported()) {
      assert.equal(lscache.get(key), value, 'We expect value to be ' + value);
    } else {
      assert.equal(lscache.get(key), null, 'We expect null value');
    }
  });

  if (lscache.supported()) {
    test('Testing set() with non-string values', function() {
      var key, value;

      key = 'numberkey';
      value = 2;
      lscache.set(key, value, 3);
      assert.equal(lscache.get(key)+1, value+1, 'We expect incremented value to be ' + (value+1));

      key = 'arraykey';
      value = ['a', 'b', 'c'];
      lscache.set(key, value, 3);
      assert.equal(lscache.get(key).length, value.length, 'We expect array to have length ' + value.length);

      key = 'objectkey';
      value = {'name': 'Pamela', 'age': 26};
      lscache.set(key, value, 3);
      assert.equal(lscache.get(key).name, value.name, 'We expect name to be ' + value.name);
    });

    test('Testing remove()', function() {
      var key = 'thekey';
      lscache.set(key, 'bla', 2);
      lscache.remove(key);
      assert.equal(lscache.get(key), null, 'We expect value to be null');
    });

    test('Testing flush()', function() {
      localStorage.setItem('outside-cache', 'not part of lscache');
      var key = 'thekey';
      lscache.set(key, 'bla', 100);
      lscache.flush();
      assert.equal(lscache.get(key), null, 'We expect flushed value to be null');
      assert.equal(localStorage.getItem('outside-cache'), 'not part of lscache', 'We expect localStorage value to still persist');
    });

    test('Testing setBucket()', function() {
      var key = 'thekey';
      var value1 = 'awesome';
      var value2 = 'awesomer';
      var bucketName = 'BUCKETONE';

      lscache.set(key, value1, 1);
      lscache.setBucket(bucketName);
      lscache.set(key, value2, 1);

      assert.equal(lscache.get(key), value2, 'We expect "' + value2 + '" to be returned for the current bucket: ' + bucketName);
      lscache.flush();
      assert.equal(lscache.get(key), null, 'We expect "' + value2 + '" to be flushed for the current bucket');
      lscache.resetBucket();
      assert.equal(lscache.get(key), value1, 'We expect "' + value1 + '", the non-bucket value, to persist');
    });

    test('Testing setWarnings()', function() {
      window.console = {
        calls: 0,
        warn: function() { this.calls++; }
      };

      var longString = (new Array(10000)).join('s');
      var num = 0;
      while(num < 10000) {
        try {
          localStorage.setItem("key" + num, longString);
          num++;
        } catch (e) {
          break;
        }
      }
      localStorage.clear()

      for (var i = 0; i <= num; i++) {
        lscache.set("key" + i, longString);
      }

      // Warnings not enabled, nothing should be logged
      assert.equal(window.console.calls, 0);

      lscache.enableWarnings(true);

      lscache.set("key" + i, longString);
      assert.equal(window.console.calls, 1, "We expect one warning to have been printed");

      window.console = null;
      lscache.set("key" + i, longString);
    });

    test('Testing quota exceeding', function() {
      var key = 'thekey';

      // Figure out this browser's localStorage limit -
      // Chrome is around 2.6 mil, for example
      var stringLength = 10000;
      var longString = (new Array(stringLength+1)).join('s');
      var num = 0;
      while(num < 10000) {
        try {
          localStorage.setItem(key + num, longString);
          num++;
        } catch (e) {
          break;
        }
      }
      localStorage.clear();
      // Now add enough to go over the limit
      var approxLimit = num * stringLength;
      var numKeys = Math.ceil(approxLimit/(stringLength+8)) + 1;
      for (var i = 0; i <= numKeys; i++) {
        var currentKey = key + i;
        lscache.set(currentKey, longString, i+1);
      }
      // Test that last-to-expire is still there
      assert.equal(lscache.get(currentKey), longString, 'We expect newest value to still be there');
      // Test that the first-to-expire is kicked out
      assert.equal(lscache.get(key + '0'), null, 'We expect oldest value to be kicked out (null)');

      // Test trying to add something thats bigger than previous items,
      // check that it is successfully added (requires removal of multiple keys)
      var veryLongString = longString + longString;
      lscache.set(key + 'long', veryLongString, i+1);
      assert.equal(lscache.get(key + 'long'), veryLongString, 'We expect long string to get stored');

      // Try the same with no expiry times
      localStorage.clear();
      for (var i = 0; i <= numKeys; i++) {
        var currentKey = key + i;
        lscache.set(currentKey, longString);
      }
      // Test that latest added is still there
      assert.equal(lscache.get(currentKey), longString, 'We expect value to be set');
    });
  }
});


