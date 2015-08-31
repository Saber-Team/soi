define(function() {
    var eleConfig = [{
        name: 'today',
        content: 'todayCon',
        staticpre: 'TODAY',
        element: 'TodayEle'
    }, {
        name: 'yesterday',
        content: 'yesCon',
        staticpre: 'YESTERDAY',
        element: 'YesterdayEle'
    }, {
        name: 'week',
        content: 'weekCon',
        staticpre: 'WEEK',
        element: 'WeekEle'
    }, {
        name: 'month',
        content: 'monthCon',
        staticpre: 'MONTH',
        element: 'MonthEle'
    }];
    var DateMap = function(element, option) {
        this.cid = option.cid;
        this.element = element;
        this.$element = $(element);
        this.eventCenter = $(document);
        this.DayMillisecond = 1 * 24 * 60 * 60 * 1000;
        this.WeekMillisecond = 6 * 24 * 60 * 60 * 1000;
        this.MonthMillisecond = 29 * 24 * 60 * 60 * 1000;
        this.ThreeMonthMillisecond = 90 * 24 * 60 * 60 * 1000;
        this.SixMonthMillisecond = 180 * 24 * 60 * 60 * 1000;
        this.YearMillisecond = 365 * 24 * 60 * 60 * 1000;
        this.todayCon = option.today;
        this.yesCon = option.yesterday;
        this.weekCon = option.week;
        this.monthCon = option.month;
        this.customCon = option.custom;
        this.eventCallback = option.events;
        this.defaultActive = option.defaultActive;
        this.isUseFilter = option.isUseFilter; //是否需要时间查询：按时、按日、按周等
        this.init();
    }
    DateMap.prototype.init = function() {
        this.creatEle();
    }
    DateMap.prototype.setDefaultActive = function(option) {
        var opts = {};
        var from = this.FormEle.val();
        var to = this.ToEle.val();
        opts.duration = option;
        if (option == DateMap.TIMEBUCKET) {
            opts.duration = DateMap.TIMEBUCKET;
            opts.from = Math.floor(new Date(from).valueOf() / 1000);
            opts.to = Math.floor(new Date(to).valueOf() / 1000);
        };
        this.setCurrent(option);
        this.resetTime(option);
        this.setOpts(opts);
        //初始化成功的时候，是否执行
        //this.eventCenter.trigger('timeChanged' + this.cid, opts);
    }
    DateMap.prototype.factoryEle = function() {
        var self = this;
        var arr = eleConfig;
        for (var i = 0; i < arr.length; i++) {
            (function() {
                var temp = i;
                self[arr[i]['element']] = self.creatElement(self[arr[i]['content']], arr[i]['name'], {
                    duration: DateMap[arr[i]['staticpre']]
                }, function(e, opts) {
                    self.setCurrent(DateMap[arr[temp]['staticpre']]);
                    self.setOpts(opts);
                    self.eventCenter.trigger('timeChanged' + self.cid, opts);
                })
            })();
        }
    }
    DateMap.prototype.creatEle = function() {
        var self = this;
        var arrayList = [];
        var isyes = !! this.yesCon;
        this.factoryEle();
        this.TimeBucket = this.creatTimeBucket(this.customCon, 'time-bucket', {
            duration: DateMap.TIMEBUCKET,
            from: '',
            to: ''
        }, function(opts) {
            this.FormEle.on('change', function(e) {
                var value = $(e.target).val();
                opts.from = Math.floor(new Date(value).valueOf() / 1000);
                opts.to = Math.floor(new Date(self.ToEle.val()).valueOf() / 1000);
                self.setOpts(opts);
                self.resetTime(opts.duration);
                self.ToEle.datepicker('option', 'minDate', new Date(value));
                self.eventCenter.trigger('timeChanged' + self.cid, opts);
            })
            this.ToEle.on('change', function(e) {
                var value = $(e.target).val();
                opts.from = Math.floor(new Date(self.FormEle.val()).valueOf() / 1000);
                opts.to = Math.floor(new Date(value).valueOf() / 1000);
                self.setOpts(opts);
                self.resetTime(opts.duration);
                self.FormEle.datepicker('option', 'maxDate', new Date(value));
                self.eventCenter.trigger('timeChanged' + self.cid, opts);
            })
        })
        var today = !! this.todayCon ? this.TodayEle : false;
        var yesterday = isyes ? this.YesterdayEle : false;
        var week = !! this.weekCon ? this.WeekEle : false;
        var month = !! this.monthCon ? this.MonthEle : false;
        var timebucket = !! this.customCon ? this.TimeBucket : false;
        today && arrayList.push(today[0]);
        isyes && arrayList.push(yesterday[0]);
        week && arrayList.push(week[0]);
        month && arrayList.push(month[0]);
        timebucket && arrayList.push(timebucket[0]);
        self.$element.empty();
        $.each(arrayList, function(i, item) {
            self.$element.append(item);
        });
        // add by sl
        if (self.isUseFilter) {
            var datemap = self.$element;
            var stat_box = datemap.parent();
            self.createFilter(stat_box);
        }
    }
    DateMap.prototype.setOpts = function(opt) {
        this.opts = opt;
    }
    DateMap.prototype.getOpts = function() {
        return this.opts;
    };
    // add by sl
    DateMap.prototype.resetFilter = function(element, ids, options) {
        var select = element.find('.search-time');
        var len = ids.length;
        select.html('');
        for (var i = 0; i < len; i++) {
            if (i > 0) {
                select.append('<option value="' + ids[i] + '">' + options[i] + '</option>');
            } else {
                select.append('<option selected="true" value="' + ids[i] + '">' + options[i] + '</option>');
            }
        }
    }
    // add by sl
    DateMap.prototype.createOptions = function(element, days) {
        var that = this;
        if (that.isUseFilter) {
            var filter = element.parent();
            if (days <= 0) {
                that.resetFilter(filter, ['hour'], ['按时']);
            } else if (days <= 7) {
                that.resetFilter(filter, ['hour', 'day'], ['按时', '按日']);
            } else if (days <= 30) {
                that.resetFilter(filter, ['day', 'week'], ['按日', '按周']);
            } else if (days < 180) {
                that.resetFilter(filter, ['day', 'week', 'month'], ['按日', '按周', '按月']);
            } else if (days >= 180) {
                that.resetFilter(filter, ['week', 'month'], ['按周', '按月']);
            }
        }
    }
    // add by sl
    DateMap.prototype.resetTime = function(current) {
        var that = this;
        var filter = null;
        var from = this.FormEle;
        var to = this.ToEle;
        var today = new Date().valueOf();
        switch (current) {
            case 0:
                {
                    from.datepicker('setDate', this._getDateText(today));
                    to.datepicker('setDate', this._getDateText(today));
                    that.createOptions(that.$element, 0);
                }
                break;
            case -1:
                {
                    var yesterday = today - this.DayMillisecond;
                    from.datepicker('setDate', this._getDateText(yesterday));
                    to.datepicker('setDate', this._getDateText(yesterday));
                    that.createOptions(that.$element, -1);
                }
                break;
            case 7:
                {
                    var week = today - this.WeekMillisecond;
                    from.datepicker('setDate', this._getDateText(week));
                    to.datepicker('setDate', this._getDateText(today));
                    that.createOptions(that.$element, 7);
                }
                break;
            case 30:
                {
                    var month = today - this.MonthMillisecond;
                    from.datepicker('setDate', this._getDateText(month));
                    to.datepicker('setDate', this._getDateText(today));
                    that.createOptions(that.$element, 30);
                }
                break;
            default:
                {
                    if (that.isUseFilter) {
                        var fromVal = from.val();
                        var toVal = to.val();
                        var fromDay = new Date(fromVal).valueOf();
                        var toDay = new Date(toVal).valueOf();
                        var diff = toDay - fromDay;
                        var diff_days = diff / that.DayMillisecond;
                        that.createOptions(that.$element, diff_days);
                    }
                }
                break;
        }
    }
    DateMap.prototype.creatElement = function(text, className, opts, callback) {
        var self = this;
        var text = text;
        var className = className;
        var $element = $("<span></span>").addClass(className).text(text);
        $element.on('click.' + className, function(e) {
            self.resetTime(opts.duration);
            callback.call(self, e, opts);
        })
        return $element;
    }
    // add by sl
    DateMap.prototype.createFilter = function(element) {
        var self = this;
        var tpl = '<div class="search-filter"><select class="search-time"></select></div>';
        var tar = $(tpl).appendTo(element);
        element.data('filter', tar);
        var select = tar.find('.search-time');
        select.bind('change', function(e) {
            self.eventCenter.trigger('timeChanged' + self.cid, self.opts);
        })
    }
    DateMap.prototype.creatTimeBucket = function(text, className, opts, callback) {
        var self = this;
        var text = text + ':';
        var className = className;
        var $element = $("<span></span>").addClass("time-bucket");
        var content = text + '<span class="input-text ml10"><input id="" type="text" class="from-data input" readonly="true" /><em></em></span>' + '<span class="sep-line">-</span><span class="input-text"><input type="text" class="to-data input" readonly="true" /><em></em></span>';
        $element.append(content);
        $element.on('click.' + className, function(e) {
            self.setCurrent(DateMap.TIMEBUCKET);
        });
        this.FormEle = $element.find(".from-data");
        this.ToEle = $element.find(".to-data");
        this.initTime(this.YearMillisecond);
        callback.call(self, opts);
        return $element;
    }
    DateMap.prototype.initTime = function(limit) {
        var from = this.FormEle;
        var to = this.ToEle;
        var Today = new Date();
        var Yesterday = new Date(Today.valueOf() - this.DayMillisecond);
        var WeekMillisecond = this.WeekMillisecond;
        var Past = Today.valueOf() - WeekMillisecond;
        var Before = new Date(Today.valueOf() - limit);
        var formatBefore = new Date(Before.getFullYear(), Before.getMonth(), Before.getDate());
        var formatYesterday = new Date(Yesterday.getFullYear(), Yesterday.getMonth(), Yesterday.getDate() + 1);
        from.datepicker({
            "dateFormat": 'yy/mm/dd',
            "maxDate": formatYesterday,
            "minDate": formatBefore
        });
        to.datepicker({
            "dateFormat": 'yy/mm/dd',
            "maxDate": formatYesterday,
            "minDate": formatBefore
        });
        from.datepicker('setDate', this._getDateText(Past));
        to.datepicker('setDate', this._getDateText(Yesterday));
    }
    DateMap.prototype._getDateText = function(time) {
        time = time || (new Date()).valueOf();
        time = new Date(time);
        var Year = time.getFullYear();
        var Month = time.getMonth() + 1;
        var date = time.getDate();
        return Year + '/' + Month + '/' + date;
    }
    DateMap.prototype.setCustomEvent = function(eventName, callback, Context) {
        this.eventCenter.on(eventName, function(event) {
            var args = Array.prototype.slice.call(arguments, 1);
            callback.apply(Context, args);
        })
    }
    DateMap.prototype.setCurrent = function(current) {
        !!this.TodayEle.length && this.TodayEle.removeClass("active");
        !!this.YesterdayEle.length && this.YesterdayEle.removeClass("active");
        !!this.WeekEle.length && this.WeekEle.removeClass("active");
        !!this.MonthEle.length && this.MonthEle.removeClass("active");
        !!this.TimeBucket.length && this.TimeBucket.removeClass("active");
        switch (current) {
            case DateMap.TODAY:
                this.TodayEle.addClass("active");
                break;
            case DateMap.YESTERDAY:
                this.YesterdayEle.addClass("active");
                break;
            case DateMap.WEEK:
                this.WeekEle.addClass("active");
                break;
            case DateMap.MONTH:
                this.MonthEle.addClass("active");
                break;
            case DateMap.TIMEBUCKET:
                this.TimeBucket.addClass("active");
                break;
        }
    }
    DateMap.YESTERDAY = -1;
    DateMap.WEEK = 7;
    DateMap.MONTH = 30;
    DateMap.TIMEBUCKET = 1;
    DateMap.TODAY = 0;
    var DataBlock = function(element, opts) {
        var data = $(element).data('DateMap');
        var eventCallback = opts.events;
        var defaultActive = opts.defaultActive;
        if (!data) {
            $(element).data('DateMap', (data = new DateMap(element, opts)))
        }
        data.setCustomEvent('timeChanged' + opts.cid, eventCallback, null);
        data.setDefaultActive(defaultActive);
    }
    return DataBlock;
})