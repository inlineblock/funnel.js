var Funnel = Backbone.View.extend({
  className: 'funnel',

  options: {
    valueAttribute: 'value',
    uniqueAttribute: 'id',
    scale: 'linear', // d3 scales
    gapBetweenWidth: 20, // px
    width: 'auto',
    height: 'auto',
    xAxisHeight: 40,
    colors: [
      '#73D216',
      '#204A87',
    ]
  },

  events: {
    'click .funnel-piece' : 'onFunnelPieceClick',
    'click .x-axis' : 'onAxisClick'
  },
  
  initialize: function () {
    this.setup();
    this.build();
    _.defer(function (that) {
      that.render();
    } , this);
  },

  setup: function () {
    this.getValueFromDataItem = _.bind(this.getValueFromDataItem , this);
  },

  createScales: function () {
    this.max = _.max(this.options.data , this.getValueFromDataItem);
    this.heightScale = d3.scale[this.options.scale]()
        .rangeRound([0, this.getGraphHeight()])
        .domain([0, this.getValueFromDataItem(this.max)]);
  },

  build: function () {
    this.visualization = d3.select(this.el);
  },

  update: function (data) {
    this.options.data = data;
    this.render();
  },

  render: function () {
    this.$el.height(this.getHeight());
    this.createScales();
    this.renderAxis();
    this.renderFunnel();
  },

  renderAxis: function () {
    var that = this;
    var axes = this.visualization.selectAll('.funnel-axis')
      .data(this.options.data , function (data) {
        return data[that.options.uniqueAttribute];
      });
    // enter
    axes.enter()
      .append('div')
      .attr('class' , 'funnel-axis');
    //update
    axes
      .style('left' , function (data , i) {
        return ((that.getPieceWidth() * i) + (i * that.options.gapBetweenWidth)) + 'px';
      })
      .style('width' , this.getPieceWidth() + 'px')
      .style('height' , this.options.xAxisHeight + 'px')
      .html(function(data , i) {
        if (that.options.axisTemplate) {
          return that.options.axisTemplate(data);
        } else {
          return that.getLabelFromDataItem(data);
        }
      });
    axes.exit().remove();
  },

  renderFunnel: function () {
    var that = this;

    var pieces = this.visualization.selectAll('.funnel-piece')
      .data(this.options.data , function (data) {
        return data[that.options.uniqueAttribute];
      });

    // enter
    pieces.enter()
      .append('div')
      .attr('class' , 'funnel-piece');


    // update
    // build the squares
    pieces
      .style('border-left-color' , d3.rgb(this.options.colors[0]).darker().toString())
      .style('width' , this.getPieceWidth() + 'px')
      .style('background-color' , this.options.colors[0])
      .style('top' , function (data , i) {
        var previous = that.options.data[i-1];
        if (previous) {
          this._previous = previous;
          return (Math.round(that.getGraphHeight()/2) - Math.round(that.heightScale(that.getValueFromDataItem(this._previous))/2)) + 'px';
        } else {
          this._previous = false;
          return '0px';
        }
      })
      .style('height' , function (data) {
        this._height = Math.round(that.heightScale(that.getValueFromDataItem(data)));
        return this._height + 'px';
      })
      .style('left' , function (data , i) {
          return ((that.getPieceWidth() * i) + Math.round(that.options.gapBetweenWidth * (i-1 >= 0 ? i-1 :0 ))) + 'px';
      })
      .style('border-top-width' , function (data , i) {
        if (this._previous) {
          var prevHeight = that.heightScale(that.getValueFromDataItem(this._previous)),
            _borderWidth = Math.round((prevHeight-this._height)/2),
            total = ((_borderWidth * 2) + this._height);
          this._borderWidth = _borderWidth;
          if (total > prevHeight) {
            this._borderWidth--;
          }
          return _borderWidth + 'px';
        } else {
          this._borderWidth = 0;
          return '0px';
        }
      })
      .style('border-bottom-width' , function () {
        return this._borderWidth ? this._borderWidth + 'px' : '0px';
      })
      .style('border-left-width' , function () {
        if (this._previous) {
          var totalHeight = that.heightScale(that.getValueFromDataItem(this._previous))
          return that.options.gapBetweenWidth + 'px';
        } else {
          return '0px';
        }
      });

      pieces
        .exit()
        .remove();
  },

  getPieceWidth: function () {
    var width = this.getWidth(),
      dataLength = this.options.data.length;
    if (dataLength === 1) {
      return width;
    } else {
      var gapsCount = dataLength - 1,
        withoutGaps = width - (gapsCount * this.options.gapBetweenWidth);
      return Math.round(withoutGaps / dataLength);
    }
  },

  getValueFromDataItem: function (data) {
    return data[this.options.valueAttribute];
  },

  getLabelFromDataItem: function (data) {
    return data[this.options.labelAttribute || this.options.valueAttribute];
  },

  getWidth: function () {
    return this.options.width == 'auto' ? this.$el.width() : this.options.width;
  },

  getHeight: function () {
    return this.options.height == 'auto' ? this.$el.height() : this.options.height;
  },

  getGraphHeight: function () {
    return this.getHeight() - this.getXAxisHeight();
  },

  getXAxisHeight: function () {
    return this.options.xAxisHeight;
  },

  onFunnelPieceClick: function (evt) {
    var data = evt.target.__data__;
    if (data) {
      this.trigger('select' , data);
    }
  },

  onAxisClick: function (evt) {

  }
});
