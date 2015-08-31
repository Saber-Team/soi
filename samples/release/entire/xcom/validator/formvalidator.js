/**
 * @fileoverview 校验校验器
 * o-validator默认会找拥有o-validator-tip这个class的兄弟元素作为错误信息提示元素，如果DOM结构不支持以上方式，可以
 * 通过自定义getValidateTipEl方法的方式实现。考虑到有可能会有异步校验，因此校验时机不支持onsubmit，可以在程序中通过
 * validatorForm.validate().then(...submit...)这种方式。
 * 校验器支持自定义规则，异步校验。其中异步校验只需将校验函数返回值设置为$.Deferred对象。参见下方示例。
 * @author <a href="mailto:langyong@baidu.com">郎勇</a> 2015-08-25T21:07:08+08:00
 * @version 1.0.0
 * @example
 * html:
 * <form id="testForm" action="/save.action" method="post">
 *     <label for="username">username:</label>
 *     <input id="username" type="text" name="username" class="o-validator-item" data-validator-rules=
 *     "require notAdmin" />
 *     <span class="o-validator-tip"></span>
 *     <input id="submit_btn" type="button" value="Submit"/>
 * </form>
 *
 * JavaScript:
 * var formValidator = new FormValidator('testForm', {
 *     checkpoints : ['blur'],
 *     checkRules : {
 *         notAdmin : function(item){
 *             var result = item.$el.val().toUpperCase() !== 'ADMIN';
 *             return {
 *                 result: result,
 *                 msg: result?'':'username cannot be admin'
 *             };
 *         },
 *         //asynchronize way to check item on remote server.
 *         usernameExists : function(item){
 *             var deferred = new $.Deferred;
 *             $
 *             .get({
 *                 url : '/checkusername.action',
 *                 data : {username : item.$el.val()},
 *                 dataType : 'json'
 *             })
 *             .success(function(data){
 *                 if(data.isExist)
 *                     deferred.reject({result:false, msg:'username exists!'});
 *                 else
 *                     deferred.resolve({result:true, msg:''});
 *             })
 *             .fail(function(){
 *                 deferred.reject({result:false, msg:'request failure'});
 *             });
 *             return deferred.promise();
 *         }
 *     },
 *     //override this method if needed to custom your own way to find the tip elements.
 *     //this.$el is the current input element to be validated.
 *     getValidateTipEl: function(){..this.$el.parent().parent().find(...)...return el ...}
 * });
 *
 * $('#submit_btn').on('click', function(){
 *     formValidator
 *     .validate()
 *     .then(function(){
 *         $('#testForm').submit();
 *     });
 * });
 *
 * 
 */

define([
    './validator'
], function(validator) {
	'use strict';
	var $ = window.jQuery;

	/**
	 * 默认校验规则
	 * @type {Object}
	 */
	var defaultRules = {
		required: function(){
			return validator.required.validate(this.val());
		},
		positiveInteger: function(){
			return validator.positiveInteger.validate(this.val());
		},
		nonNegativeInteger: function(){
			return validator.nonNegativeInteger.validate(this.val());
		},
		positiveNumber: function(){
			return validator.positiveNumber.validate(this.val());
		},
		nonNegativeNumber: function(){
			return validator.nonNegativeNumber.validate(this.val());
		},
		specialChars: function(){
			return validator.specialChars.validate(this.val());
		},
		illegalCharWithBracket: function(){
			return validator.illegalCharWithBracket.validate(this.val());
		},
		//2~20个英文数字字符或2~10个汉字
		queryWord: function(){
			return validator.queryWord.validate(this.val());
		},
		website: function(){
			return validator.website.validate(this.val());
		},
		email: function(){
			return validator.email.validate(this.val());
		},
		phone: function(){
			return validator.phone.validate(this.val());
		},
		ID: function(){
			return validator.id.validate(this.val());
		},
		match: function(reg){
			var result = new RegExp(reg).test(this.val());
			return {
				result: result,
				msg: '格式不正确'
			};
		},
		maxlength: function(max){
			var result = this.val().length <= +max;
			return {
				result: result,
				msg: '不能超过' + max + '个字符'
			};
		},
		minlength: function(min){
			var result = this.val().length <= +min;
			return {
				result: result,
				msg: '不能少于' + max + '个字符'
			};
		},
		gt: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() > +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必须大于' + item.displayName
				};
			} else {
				result = +this.val() > +value;
				return {
					result: result,
					msg: result?'':'此项的值必须大于' + value
				};
			}
		},
		gte: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() >= +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必不得小于' + item.displayName
				};
			} else {
				result = +this.val() >= +value;
				return {
					result: result,
					msg: result?'':'此项的值必不得小于' + value
				};
			}
		},
		eq: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() === +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必须等于' + item.displayName
				};
			} else {
				result = +this.val() === +value;
				return {
					result: result,
					msg: result?'':'此项的值必须是' + value
				};
			}
		},
		lt: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() < +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必须小于' + item.displayName
				};
			} else {
				result = +this.val() < +value;
				return {
					result: result,
					msg: result?'':'此项的值必须小于' + value
				};
			}
		},
		lte: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() <= +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必不得大于' + item.displayName
				};
			} else {
				result = +this.val() <= +value;
				return {
					result: result,
					msg: result?'':'此项的值必不得大于' + value
				};
			}
		},
		neq: function(value){
			var result,
				item;
			if(value.charAt(0) === '$'){
				item = this.formValidator.items[value.substring(1)];
				result = +this.val() !== +item.val();
				return {
					result: result,
					msg: result?'':'此项的值必不能等于' + item.displayName
				};
			} else {
				result = this.val() !== value;
				return {
					result: result,
					msg: result?'':'此项的值必不能是' + value
				};
			}
		},
		in: function(){
			var result = false,
				args = Array.prototype.slice.call(arguments),
				value = this.val();
			for(var i=0;i<args.length;i++){
				if(value === args[i]){
					result = true;
					break;
				}
			}
			return {
				result: result,
				msg: result?'':'此项的值必须是' + args.join(',') + '其中之一'
			}
		},
		notin: function(){
			var result = true,
				args = Array.prototype.slice.call(arguments),
				value = this.val();
			for(var i=0;i<args.length;i++){
				if(value === args[i]){
					result = false;
					break;
				}
			}
			return {
				result: result,
				msg: result?'':'此项的值不能是' + args.join(',') + '其中之一'
			}
		},
		//加和
		sum: function(){
			var result,
				args = Array.prototype.slice.call(arguments),
				validatorItems = this.formValidator.items,
				itemNames = [],
				item,
				sum = 0,
				value = this.val();
			for(var i=0;i<args.length;i++){
				item = validatorItems[args[i].charAt(0)==='$'?args[i].substring(1):args[i]],
				sum += item.val();
				itemNames.push(item.displayName);
			}
			result = value === sum;
			return {
				result: result,
				msg: '此项的值必须是' + itemNames.join(',') + '之和'
			};
		},
		//乘积
		product: function(){
			var result,
				args = Array.prototype.slice.call(arguments),
				validatorItems = this.formValidator.items,
				itemNames = [],
				item,
				sum = 0,
				value = this.val();
			for(var i=0;i<args.length;i++){
				item = validatorItems[args[i].charAt(0)==='$'?args[i].substring(1):args[i]];
				sum += item.val();
				itemNames.push(item.displayName);
			}
			result = value === sum;
			return {
				result: result,
				msg: '此项的值必须是' + itemNames.join(',') + '的乘积'
			};
		}
	};

	/**
	 * 默认配置项
	 * @type {Object}
	 */
	var defaultConfig = /** @lends FormValidator.prototype */{
		validatorItemClazz: 'o-validator-item',
		validatorTipClazz: 'o-validator-tip',
		validClazzName: 'o-validator-item-valid',
		invalidClazzName: 'o-validator-item-invalid',
		eventNamespace: 'formvalidator',
		checkpoints: []
	};

	//正则校验规则名是否合法
	var R_VALID_RULE_REG = /^[\w\$]+?(\(([^,]+?,?)*\))?$/,
		R_PARAM_SPLITER = /[,\s]+/;

	/**
	 * @class 表单校验器
	 * @module 表单校验器
	 * @param {!string} formId 表单元素的ID
	 * @param {Object=} config.rules 额外的校验规则
	 * @param {String=} config.validatorItemClazz 校验控件的DOM选择器
	 * @param {String=} config.validatorTipClazz 校验提示文案DOM选择器
	 * @param {String=} config.eventNamespace 校验触发事件绑定时的命名空间
	 * @param {Array.<String>=} config.checkpoints 校验时机列表
	 * @param {Function=} config.getValidateTipEl 获取提示DOM元素
	 */
	function FormValidator(formId, config){
		this.init(formId, config);
	}

	/**
	 * 添加校验规则的静态函数
	 * @static
	 * @public
	 * @param {Object!} rules 校验规则
	 */
	FormValidator.addRules = function(rules){
		$.extend(defaultRules, rules);
	};

	/**
	 * 对form validator进行全局设置，全局设置应当在初始化表单校验器执行进行。如果在初始化校验器之后进行全局设置
	 * ，则之前的校验器设置选项不会受影响。 
	 * @static
	 * @param {String=} config.validatorItemClazz 校验控件的DOM选择器
	 * @param {String=} config.validatorTipClazz 校验提示文案DOM选择器
	 * @param {String=} config.eventNamespace 校验触发事件绑定时的命名空间
	 * @param {Array.<String>=} config.checkpoints 校验时机列表
	 * @param {Function=} config.getValidateTipEl 获取提示DOM元素
	 */
	FormValidator.globalSettings = function(config){
		$.extend(defaultRules, config);
	};

	$.extend(
		FormValidator.prototype, 
		/** @lends FormValidator.prototype */{
			/**
			 * 初始化表单校验，构造函数，禁止直接调用该函数。
			 * @constructor
			 * @param {!string|jQuery|HtmlElement} formId
			 * @param {Object=} config.rules 额外的校验规则
			 * @param {String=} config.validatorItemClazz 校验控件的DOM选择器
			 * @param {String=} config.validatorTipClazz 校验提示文案DOM选择器
			 * @param {String=} config.eventNamespace 校验触发事件绑定时的命名空间
			 * @param {Array.<String>=} config.checkpoints 校验时机列表
			 * @param {Function=} config.getValidateTipEl 获取提示DOM元素
			 */
			init: function(formId, config){
				if(this.__initialized__ || !this instanceof FormValidator)throw Error('Dont call constructor explicitly.');
				this.__initialized__ = true;
				config = config || {};
				if(formId instanceof window.jQuery){
					this.$el = formId;
				} else if(formId.nodeType === 1){
					this.$el = $(formId);
				} else {
					this.$el = $('#' + formId);
				}
				var formValidator = this,
					$form = this.$el;

				formValidator.items = [];
				this.rules = {};
				$.extend(this.rules, defaultRules, config.rules);
				delete config.rules;
				$.extend(this, defaultConfig, config);

				//初始化各个校验字段
				$form
				.find('.' + this.validatorItemClazz)
				.each(function(_, el){
					formValidator.addItem(el);
				});
			},
			/**
			 * 添加表单验证规则
			 * @param {Object!} rules 校验规则
			 */
			addRules : function(rules){
				$.extend(this.rules, rules);
			},
			/**
			 * 触发所有表单校验，返回校验结果
			 * @public
			 * @param {boolean=} isBackground 是否是后台校验，如果是，则不会影响dom显示
			 * @return {Deferred} 延迟对象
			 */
			validate: function(isBackground){
				var deferred = new $.Deferred,
					items = this.items,
					count = items.length,
					isValid = true,
					idx = 0;
				if(count){
					+function then(){
						items[idx].validate(isBackground)
							.fail(function(){
								isValid = false;
							})
							.always(function(){
								if(++idx < count){
									then();
								} else {
									if(isValid){
										deferred.resolve();
									} else {
										deferred.reject();
									}
								}
							});
					}();
				} else {
					window.console && console.warn('form validator: we don\'t have any items to validate.'); 
					deferred.resolve();
				}
				return deferred.promise();
			},
			/**
			 * 重置表单
			 */
			reset : function(){
				$.each(this.items, function(_, item){
					item.reset();
				});
			},
			/**
			 * 移除校验输入项
			 * @param  {String|ValidatorItem} item 校验输入项对象或者输入项dom元素对应的name属性
			 */
			removeItem : function(item){
				var validator = this,
					nameAttr;

				if(typeof item === 'string'){
					item = this.items[item];
				}

				if(item instanceof ValidateItem){
					$.each(validator.items, function(i , _item){
						if(_item === item){
							validator.items.splice(i, 1);
							return false;
						}
					});
					nameAttr = this.$el.attr('name');
					if(nameAttr)delete validator.items[nameAttr];
					item.destroy();
				}
			},
			/**
			 * 添加校验输入项
			 * @param {HTMLElement|jQuery} $el 校验输入dom对象
			 */
			addItem : function($el){
				if(!($el instanceof jQuery) && $el.nodeType){
					$el = $($el);
				}
				var nameAttr = $el.attr('name'),
					ruleNames = $el.data('validatorRules').split(/\s+/),
					displayName = $el.data('displayName'),
					ruleName,
					checkRuleArgs = {},
					item;

				for(var i=0;i<ruleNames.length;i++){
					ruleName = ruleNames[i];
					if(!R_VALID_RULE_REG.test(ruleName)){
						throw new Error('invalid rule name: ' + p);
					}
					var leftBrackIndex = ruleName.indexOf('('),
						rightBrackIndex = ruleName.indexOf(')'),
						paramsStr;
					if(leftBrackIndex > 0){
						paramsStr = $.trim(ruleName.substring(leftBrackIndex + 1, rightBrackIndex));
						ruleName = ruleName.substring(0, leftBrackIndex);
						checkRuleArgs[ruleName] = paramsStr.split(R_PARAM_SPLITER);
						ruleNames[i] = ruleName;
					}
				}

				item = new ValidateItem({
					$el: $el,
					displayName: displayName,
					formValidator: this,
					checkRuleArgs: checkRuleArgs,
					checkRuleNames: ruleNames
				});

				this.items.push(item);

				if(nameAttr){
					this.items[nameAttr] = item;
				}
			},
			/**
			 * 销毁校验器，一旦销毁，就不能再使用校验器对象了。
			 * @public
			 */
			destroy: function(){
				$.each(this.items, function(_, item){
					item.destroy();
				});
				this.getValidateTipEl = null;
				this.checkpoints = null;
				this.rules = null;
				this.$el = null;
			}
		}
	);

	/**
	 * 校验字段
	 * @param {jQuery!} config.$el 校验输入元素
	 * @param {FormValidator!} config.formValidator 表单校验器
	 * @param {Array.<String>!} config.checkRuleNames 规则名列表
	 */
	function ValidateItem(config){
		this.init(config);
	}

	/**
	 * 获取校验提示DOM元素
	 * @private
	 * @return {jQuery} 校验元素jQuery对象
	 */
	function getValidateTipEl(){
		if(typeof this.formValidator.getValidateTipEl === 'function'){
			return this.formValidator.getValidateTipEl.call(this);
		} else {
			return this.$el.siblings('.' + this.formValidator.validatorTipClazz);
		}
	}

	/**
	 * @event
	 * @private
	 * @param {boolean=} reset 是否是重置操作
	 * @param  {boolean!} e.isValid 是否校验通过
	 * @param {String=} e.tipText 提示文案
	 */
	function onvalidatestatechange(e){
		var item = this,
			$el = item.$el,
			$tip = getValidateTipEl.call(this),
			formValidator = item.formValidator;
		if(e.reset){
			$tip.hide();
		} else {
			if(e.isValid){
				$tip.hide();
				$el.removeClass(formValidator.invalidClazzName).addClass(formValidator.validClazzName);
			} else {
				$tip.text(e.tipText).show();
				$el.removeClass(formValidator.validClazzName).addClass(formValidator.invalidClazzName);
			}
		}
	}

	$.extend(
		ValidateItem.prototype, 
		/** @lends ValidateItem.prototype */{
			/**
			 * 构造函数
			 * @constructor
			 * @param {jQuery!} config.$el 校验输入元素
			 * @param {FormValidator!} config.formValidator 表单校验器
			 * @param {Array.<String>!} config.checkRuleNames 规则名列表
			 * @param {Array.<*>!} checkRuleArgs 规则函数对应参数的映射表
			 * @param {String=} displayName 校验表单元素对应的显示名称（具有可读性的名称，一般为label内的文字，校验提示文案中可能会用到）
			 */
			init : function(config){
				if(this.__initialized__ || !this instanceof FormValidator)throw Error('Dont call constructor explicitly.');
				/**
				 * 初始化标志
				 * @private
				 * @type {Boolean}
				 */
				this.__initialized__ = true;
				$.extend(this, config);

				var el = this.$el[0],
					$form = this.formValidator.$el,
					tagName = el.tagName.toUpperCase(),
					typeAttr = el.type,
					nameAttr = el.name;
				//记录表单输入项的初始值。
				switch(tagName){
					case 'INPUT':
						switch(typeAttr){
							case 'radio':
								this._defaultValue = $form.find('input[type=radio][name=' + nameAttr + ']:checked');
								break;
							case 'checkbox':
								this._defaultValue = $form.find('input[type=checkbox][name=' + nameAttr + ']:checked');
								break;
							default:
								this._defaultValue = el.value;
						}
						break;
					case 'TEXTAREA':
						this._defaultValue = el.value;
						break;
					case 'SELECT':
						this._defaultValue = el.selectedIndex;
						break;
				}

				var item = this;
				//绑定表单校验的dom事件
				$.each(item.formValidator.checkpoints, function(_, checkpoint){
					item.$el.on(checkpoint + '.' + item.formValidator.eventNamespace, function(){
						item.validate();
					});
				});
			},
			/**
			 * 获取字段的值
			 * @public
			 * @return {string} 字段的值
			 */
			val : function(value){
				var el = this.$el[0],
					$form = this.formValidator.$el,
					tagName = el.tagName.toUpperCase(),
					type = el.type,
					name = el.name,
					value;
				if(tagName === 'INPUT'){
					if(type === 'radio'){
						return $form.find('[name='+name+']:checked').val();
					} else if(type === 'checkbox'){
						value = [];
						$form
							.find('[name='+name+']:checked')
							.each(function(i, checkbox){
								value.push(checkbox.value);
							});
						return value.join(',');
					} else {
						return el.value;
					}
				} if(tagName === 'SELECT' || tagName === 'TEXTAREA') {
					return el.value;
				} else {
					return '';
				}
			},
			/**
			 * 更新表单字段的显式状态
			 * @public
			 * fires FormValidator#validatestatechange
			 * @param {boolean!} isValid 是否通过校验
			 * @param {string=}  msg 校验提示信息
			 */
			updateView : function(isValid, msg){
				onvalidatestatechange.call(this, {
					isValid: isValid,
					tipText: msg
				});
			},
			/**
			 * 重置校验字段
			 */
			reset : function(){
				var el = this.$el[0],
					$form = this.formValidator.$el,
					tagName = el.tagName.toUpperCase(),
					typeAttr = el.type,
					nameAttr = el.name;
				switch(tagName){
					case 'INPUT':
						switch(typeAttr){
							case 'radio':
								$form.
									find('input[type=radio][name=' + nameAttr + ']')
									.each(function(_, el){
										el.checked = false;
									});
								this._defaultValue[0].checked = true;
								break;
							case 'checkbox':
								$form
									.find('input[type=checkbox][name=' + nameAttr + ']')
									.each(function(_, el){
										el.checked = false;
									});
								this._defaultValue
									.each(function(_, el){
										el.checked = true;
									});
								break;
							default:
								el.value = this._defaultValue;
						}
						break;
					case 'TEXTAREA':
						el.value = this._defaultValue;
						break;
					case 'SELECT':
						el.selectedIndex = this._defaultValue;
						break;
				}

				onvalidatestatechange.call(this, {
					reset : true
				});
			},
			/**
			 * 校验表单字段函数
			 * @public
			 * @param {boolean=} isBackground 是否进行后台校验
			 * @param {Array.<String>} ruleNames 自定义校验列表
			 * @return {Deferred} 延迟对象
			 */
			validate : function(isBackground, ruleNames){
				var deferred = new $.Deferred(),
					rules = this.formValidator.rules,
					checkRuleNames = ruleNames || this.checkRuleNames,
					count = checkRuleNames.length,
					item = this,
					idx = 0;
				if(checkRuleNames.length){
					+function then(){
						var ruleName = checkRuleNames[idx],
							ret = rules[ruleName].apply(item, item.checkRuleArgs[ruleName]);
						if(typeof ret.result === 'boolean'){
							if(!isBackground){
								item.updateView(ret.result, ret.msg);
							}
							if(ret.result){
								if(++idx < count){
									then();
								} else {
									deferred.resolve();
								}
							} else {
								deferred.reject();
							}
						} else if(ret.then){
							ret
							.then(function(ret){
								if(!isBackground){
									item.updateView(ret.result, ret.msg);
								}
								if(++idx < count){
									then();
								} else {
									deferred.resolve();
								}
							})
							.fail(function(ret){
								if(!isBackground){
									item.updateView(ret.result, ret.msg);
								}
								deferred.reject();
							});
						} else {
							deferred.reject(new Error('wrong return value'));
						}
					}();
				} else {
					deferred.resolve();
				}
				return deferred.promise();
			},
			destroy : function(){
				this.$el.off('.' + this.formValidator.eventNamespace);
				this.$el = null;
				this.formValidator = null;
				this.checkRuleNames = null;
				this.checkRuleArgs = null;
				this.displayName = null;
				this._defaultValue = null;
			}
		}
	);

	return FormValidator;
});