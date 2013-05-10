var Funnel = Backbone.View.extend({
  className: 'funnel',

  options: {
    horizontalOrientation: true,
    valueAttribute: 'value',
    uniqueAttribute: 'id',
    scale: 'linear', // d3 scales
    gapBetweenWidth: 20, // px
    width: 'auto',
    height: 'auto',
    axisSize: 40,
    sortData: false,
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
    this.categoryAxisScale = d3.scale[this.options.scale]()
        .rangeRound([0, this.getGraphValueAxisSize()])
        .domain([0, this.getValueFromDataItem(this.max)]);
  },

  build: function () {
    this.visualization = d3.select(this.el);
  },

  update: function (data) {
    if (data) {
      this.options.data = data;
    }
    this.render();
  },

  render: function () {
    this.$el.height(this.getHeight());
    if (this.options.sortData) {
      this.options.data = _.sortBy(this.options.data , function (d) {
        return -this.getValueFromDataItem(d);
      } , this);
    }
    if (this.isHorizontal()) {
      this.$el.addClass('horizontal-funnel').removeClass('vertical-funnel');
    } else {
      this.$el.removeClass('horizontal-funnel').addClass('vertical-funnel');
    }
    this.createScales();
    this.renderAxis();
    this.renderFunnel();
  },

  renderAxis: function () {
    var that = this,
      axes = this.visualization.selectAll('.funnel-axis')
      .data(this.options.data , function (data) {
        return data[that.options.uniqueAttribute];
      });
    // enter
    axes.enter()
      .append('div')
      .attr('class' , 'funnel-axis');
    //update
    axes
      .attr('style' , '')
      .style(this.isHorizontal() ? 'left' : 'top' , function (data , i) {
        return ((that.getPieceSize() * i) + (i * that.options.gapBetweenWidth)) + 'px';
      })
      .style(this.isHorizontal() ? 'width' : 'height' , this.getPieceSize() + 'px')
      .style(this.isHorizontal() ? 'height' : 'width', this.options.axisSize + 'px')
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
      .attr('style' , '')
      .style('border-' + (this.isHorizontal() ? 'left' : 'top') + '-color' , d3.rgb(this.options.colors[0]).darker().toString())
      .style(this.isHorizontal() ? 'width' : 'height' , this.getPieceSize() + 'px')
      .style('background-color' , this.options.colors[0])
      .style(this.isHorizontal() ? 'top' : 'left' , function (data , i) {
        var previous = that.options.data[i-1];
        if (previous) {
          this._previous = previous;
          return  (Math.round(that.getGraphValueAxisSize()/2) - Math.round(that.categoryAxisScale(that.getValueFromDataItem(this._previous))/2)) + 'px';
        } else {
          this._previous = false;
          return '0px';
        }
      })
      .style(this.isHorizontal() ? 'height' : 'width' , function (data) {
        this._valueSize = Math.round(that.categoryAxisScale(that.getValueFromDataItem(data)));
        return this._valueSize + 'px';
      })
      .style(this.isHorizontal() ? 'left' : 'top' , function (data , i) {
          return ((that.getPieceSize() * i) + Math.round(that.options.gapBetweenWidth * (i-1 >= 0 ? i-1 :0 ))) + 'px';
      })
      .style('border-' + (this.isHorizontal() ? 'top' : 'left') + '-width' , function (data , i) {
        if (this._previous) {
          var previousSize = that.categoryAxisScale(that.getValueFromDataItem(this._previous)),
            _borderSize = Math.round((previousSize-this._valueSize)/2),
            total = ((_borderSize * 2) + this._valueSize);
          this._borderSize = _borderSize;
          if (total > previousSize) {
            this._borderSize--;
          }
          return _borderSize + 'px';
        } else {
          this._borderSize = 0;
          return '0px';
        }
      })
      .style('border-' + (this.isHorizontal() ? 'bottom' : 'right') + '-width' , function () {
        return this._borderSize ? this._borderSize + 'px' : '0px';
      })
      .style('border-' + (this.isHorizontal() ? 'left' : 'top') + '-width' , function () {
        if (this._previous) {
          return that.options.gapBetweenWidth + 'px';
        } else {
          return '0px';
        }
      });

      pieces
        .exit()
        .remove();
  },

  getPieceSize: function () {
    var size = this.isHorizontal() ? this.getWidth() : this.getHeight(),
      dataLength = this.options.data.length;
    if (dataLength === 1) {
      return size;
    } else {
      var gapsCount = dataLength - 1,
        withoutGaps = size - (gapsCount * this.options.gapBetweenWidth);
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

  getGraphValueAxisSize: function () {
    if (this.isHorizontal()) {
      return this.getHeight() - this.getAxisSize();
    } else {
      return this.getWidth() - this.getAxisSize();
    }
  },

  getAxisSize: function () {
    return this.options.axisSize;
  },

  isHorizontal: function () {
    return !!this.options.horizontalOrientation;
  },

  onFunnelPieceClick: function (evt) {
    var data = evt.target.__data__;
    if (data) {
      this.trigger('select' , data , evt.target);
    }
  },

  onAxisClick: function (evt) {
    this.onFunnelPieceClick(evt);
  }
});
