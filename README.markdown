ls-cache
===============================
This is a library that emulates `memcache` functions using HTML5 `localStorage`, so that you can cache data on the client and associate an expiration time with each piece of data. If the `localStorage` limit (~5MB) is exceeded, it tries to create space by removing the items that are closest to expiring anyway. If `localStorage` is not available at all in the browser, the library degrades by simply not caching and all cache requests return null.

Entries which have no expiry are never removed automatically from the cache.

Entries in the cache are optionally stored in a hierarchy of buckets, each of which is independant of the others.

Methods
-------

The library exposes methods: `set()`, `get()`, `remove()`, `flush()`, `createBucket()` and `keys()`.

* * *

### ls-cache.set
Stores the value in localStorage. Expires after specified number of minutes.
#### Arguments
1. `key` (**string**)
2. `value` (**Object**)
3. `time` (**number: optional**)

* * *

### ls-cache.get
Retrieves specified value from localStorage, if not expired.
#### Arguments
1. `key` (**string**)
#### Returns
**Object** : The stored value.

* * *

### ls-cache.keys
Gets list of all keys in bucket
#### Returns
**Array** : Key names

* * *

### ls-cache.remove
Removes a value from localStorage.
#### Arguments
1. `key` (**string**)

* * *

### ls-cache.flush
Removes all ls-cache items in current bucket from localStorage without affecting other data.

* * *

### ls-cache.createBucket
Creates a sub-bucket which is completely independent. However, its expirable items may be cleared to make room for more keys.
#### Arguments
1. `bucket` (**string**)

Usage
-------

The interface should be familiar to those of you who have used `memcache`, and should be easy to understand for those of you who haven't.

For example, you can store a string for 2 minutes using `ls-cache.set()`:

```js
ls-cache.set('greeting', 'Hello World!', 2);
```

You can then retrieve that string with `ls-cache.get()`:

```js
alert(ls-cache.get('greeting'));
```

You can remove that string from the cache entirely with `ls-cache.remove()`:

```js
ls-cache.remove('greeting');
```

You can remove all items from the cache entirely with `ls-cache.flush()`:

```js
ls-cache.flush();
```

The library also takes care of serializing objects, so you can store more complex data:

```js
ls-cache.set('data', {'name': 'Pamela', 'age': 26}, 2);
```

And then when you retrieve it, you will get it back as an object:

```js
alert(ls-cache.get('data').name);
```

If you have multiple instances of ls-cache running on the same domain, you can partition data in a certain bucket via:

```js
bucket = ls-cache.createBucket("something");
bucket.set('response', '...', 2);
ls-cache.set('path', '...', 2);
ls-cache.flush(); //only removes 'path' which was set in the root bucket, not the sub-bucket
```

Buckets are nestable:

```js
bucket = ls-cache.createBucket("firstlevel");
bucket2 = bucket.createBucket("secondlevel");
```

Browser Support
----------------

The `ls-cache` library should work in all browsers where `localStorage` is supported.
A list of those is here:
http://www.quirksmode.org/dom/html5.html

