Funnel.js
=========

An all div's funnel in javascript written in D3 with Backbone.js

## Easy way to run the index.html
```bash
$ python -m SimpleHTTPServer
```

## Providing Data
```javascript
var funnel = new Funnel({
  data: [
    {title: 'big', value: 83},
    {title: 'small', value: 40}
  ]
});
```

LICENSE
=======
[MIT License](http://opensource.org/licenses/MIT)
