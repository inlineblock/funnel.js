Funnel.js
=========

![Funnel.js example image](https://github.com/inlineblock/funnel.js/raw/master/example.png)

An all div's funnel in javascript written in D3 with Backbone.js

## Easy way to run the index.html for the demo
```bash
$ python -m SimpleHTTPServer
```

## Options
name: (type:default)
* horizontalOrientation: (bool:true) when true, the chart renders to horizontallly. This also effects the axis.
* valueAttribute: (string:'value') this string specifies what property to get out of the data for the size.
* uniqueAttribute: (string:'id') this specifies what the id of a specific funnel block is, meant for tweening.
* labelAttribute: (string: 'title') this specifies which attribute in the data is meant for the axis label. Ignored when axisTemplate is set.
* colorAttribute: (string:'color') this specifies what the color of a data block is, this overrides the 'color'.
* color: (string:'#EC644F') the color of the funnel blocks.
* scale: (string:'linear') the D3 scale to use
* gapBetweenSize: (number:20) the gap between the funnel blocks, aka the step.
* width: (mixed: 'auto') you can provide a number in px or auto for the width including the axis.
* height: (mixed: 'auto') same as above for the height of the chart including the axis.
* axisSize: (number: 40) the size of the axis. In horizontal its the height, otherwise its the width.
* sortData: (bool:false) sort the data by the valueAttribute before attempting to render.
* zeroStateMessage: (string: '~ NO DATA ~') the string to render when the data is empty.
* zeroStateTemplate: (mixed: false) when false, it doesn't do anything, when true it will render this when there is no data instead of the zeroStateMessage.
* axisTemplate: (mixed: false) when false, does nothing, when truthy, it runs it as a function, with a single data block sent to it. Whatever it returns is the axis for that one block.

## Updating after initialization
```javascript
var funnel = new Funnel({...});
// you can provide new data to update. 
// if funnel.options stuff is updated, it will use those after update is called.
// also if you don't provide anything at all to update, it will just render the options updated.
funnel.update([...]);
```

## Providing Data
```javascript
var funnel = new Funnel({
  data: [
    {title: 'big', value: 83, color: '#FF0000'}, // color attribute isn't required, since the default color is set to something by default
    {title: 'small', value: 40, color: '#DD0000'}
  ]
});
```

REACT VERSION
=============
Check it out here: https://github.com/inlineblock/funnel.js-react

LICENSE
=======
[MIT License](http://opensource.org/licenses/MIT)
