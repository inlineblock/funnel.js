define([] , function () {
  var Funnel = Backbone.View.extend({
    className: 'funnel',

    options: {
      horizontalOrientation: true,
      valueAttribute: 'value',
      uniqueAttribute: 'id',
      scale: 'linear', // d3 scales
      gapBetweenSize: 20, // px
      width: 'auto',
      height: 'auto',
      axisSize: 40,
      sortData: false,
      color: '#EC644F',

      zeroStateMessage: '~ NO DATA ~',
      zeroStateTemplate: false // underscore template
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

    getScaleForData: function (data) {
      var max = _.max(data , this.getValueFromDataItem);
      return categoryAxisScale = d3.scale[this.options.scale]()
          .rangeRound([0, this.getGraphValueAxisSize()])
          .domain([0, this.getValueFromDataItem(max)]);
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
        this.sortData();
      }

      this.renderClassNames(); 
      if (!this.options.data.length) {
        this.setupZeroState();
      } else {
        this.teardownZeroState();
      }
      var categoryAxisScale = this.getScaleForData(this.options.data);
      this.renderAxis(categoryAxisScale);
      this.renderFunnel(categoryAxisScale);
    },

    sortData: function () {
      this.options.data = _.sortBy(this.options.data , function (d) {
        return -this.getValueFromDataItem(d);
      } , this);
    },

    renderClassNames: function () {
      if (this.isHorizontal()) {
        this.$el.addClass('horizontal-funnel').removeClass('vertical-funnel');
      } else {
        this.$el.removeClass('horizontal-funnel').addClass('vertical-funnel');
      }
    },

    renderAxis: function (categoryAxisScale) {
      var that = this,
        axes = this.visualization.selectAll('.funnel-axis')
        .data(this.options.data , function (data) {
          return data[that.options.uniqueAttribute];
        }),
        pieceSize = this.getPieceSize(this.options.data);
      // enter
      axes.enter()
        .append('div')
        .attr('class' , 'funnel-axis');
      //update
      axes
        .style(this.isHorizontal() ? 'left' : 'top' , function (data , i) {
          return ((pieceSize * i) + (i * that.options.gapBetweenSize)) + 'px';
        })
        .style(this.isHorizontal() ? 'top' : 'left' , 'auto')
        .style(this.isHorizontal() ? 'width' : 'height' , pieceSize + 'px')
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

    renderFunnel: function (categoryAxisScale) {
      var that = this;

      var pieces = this.visualization.selectAll('.funnel-piece')
        .data(this.options.data , function (data) {
          return data[that.options.uniqueAttribute];
        }),
        pieceSize = this.getPieceSize(this.options.data);

      // enter
      pieces.enter()
        .append('div')
        .attr('class' , 'funnel-piece');


      // update
      // build the squares
      pieces
        .attr('style' , '')
        .style('border-' + (this.isHorizontal() ? 'left' : 'top') + '-color' , d3.rgb(this.options.color).darker().toString())
        .style(this.isHorizontal() ? 'width' : 'height' , pieceSize + 'px')
        .style('background-color' , this.options.color)
        .style(this.isHorizontal() ? 'top' : 'left' , function (data , i) {
          var previous = that.options.data[i-1];
          if (previous) {
            this._previous = previous;
            return  (Math.round(that.getGraphValueAxisSize()/2) - Math.round(categoryAxisScale(that.getValueFromDataItem(this._previous))/2)) + 'px';
          } else {
            this._previous = false;
            return '0px';
          }
        })
        .style(this.isHorizontal() ? 'height' : 'width' , function (data) {
          this._valueSize = Math.round(categoryAxisScale(that.getValueFromDataItem(data)));
          return this._valueSize + 'px';
        })
        .style(this.isHorizontal() ? 'left' : 'top' , function (data , i) {
            return ((pieceSize * i) + Math.round(that.options.gapBetweenSize * (i-1 >= 0 ? i-1 :0 ))) + 'px';
        })
        .style('border-' + (this.isHorizontal() ? 'top' : 'left') + '-width' , function (data , i) {
          if (this._previous) {
            var previousSize = categoryAxisScale(that.getValueFromDataItem(this._previous)),
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
            return that.options.gapBetweenSize + 'px';
          } else {
            return '0px';
          }
        });

        pieces
          .exit()
          .remove();
    },

    getPieceSize: function (data) {
      var size = this.isHorizontal() ? this.getWidth() : this.getHeight(),
        dataLength = data.length;
      if (dataLength === 1) {
        return size;
      } else {
        var gapsCount = dataLength - 1,
          withoutGaps = size - (gapsCount * this.options.gapBetweenSize);
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

    setupZeroState: function () {
      this.teardownZeroState();
      this.zeroState = this.getZeroStateContent();
      this.$el.append(this.zeroState);
      var zHeight = this.zeroState.outerHeight(true),
        zWidth = this.zeroState.outerWidth(true);
      this.zeroState.css({
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -Math.floor((zHeight/2)),
        marginLeft: -Math.floor((zWidth/2)),
      });
    },

    getZeroStateContent: function () {
      var $el = $('<div class="funnel-zero-state"></div>');
      if (this.options.zeroStateTemplate) {
        return $el.html(this.options.zeroStateTemplate(this.options.template));
      } else {
        return $el.text(this.options.zeroStateMessage);
      }

    },

    teardownZeroState: function () {
      if (this.zeroState) {
        this.zeroState.remove();
        delete this.zeroState;
      }
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
  return Funnel;
});
