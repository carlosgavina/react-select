require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Option = React.createClass({
	displayName: 'Option',

	propTypes: {
		addLabelText: React.PropTypes.string, // string rendered in case of allowCreate option passed to ReactSelect
		className: React.PropTypes.string, // className (based on mouse position)
		mouseDown: React.PropTypes.func, // method to handle click on option element
		mouseEnter: React.PropTypes.func, // method to handle mouseEnter on option element
		mouseLeave: React.PropTypes.func, // method to handle mouseLeave on option element
		option: React.PropTypes.object.isRequired, // object that is base for that option
		renderFunc: React.PropTypes.func // method passed to ReactSelect component to render label text
	},

	blockEvent: function blockEvent(event) {
		event.preventDefault();
		if (event.target.tagName !== 'A' || !('href' in event.target)) {
			return;
		}

		if (event.target.target) {
			window.open(event.target.href);
		} else {
			window.location.href = event.target.href;
		}
	},

	render: function render() {
		var obj = this.props.option;
		var renderedLabel = this.props.renderFunc(obj);
		var optionClasses = classes(this.props.className, obj.className);

		var renderDisabled = React.createElement(
			'div',
			{ className: optionClasses,
				onMouseDown: this.blockEvent,
				onClick: this.blockEvent },
			renderedLabel
		);

		var renderEnabled = React.createElement(
			'div',
			{ className: optionClasses,
				style: obj.style,
				onMouseEnter: this.props.mouseEnter,
				onMouseLeave: this.props.mouseLeave,
				onMouseDown: this.props.mouseDown,
				onClick: this.props.mouseDown,
				title: obj.title },
			obj.create ? this.props.addLabelText.replace('{label}', obj.label) : renderedLabel
		);

		return obj.disabled ? renderDisabled : obj.create && this.props.addLabelText && this.props.addLabelText.length > 0 ? renderEnabled : !obj.create ? renderEnabled : null;
	}
});

module.exports = Option;

},{"classnames":undefined,"react":undefined}],2:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var SingleValue = React.createClass({
	displayName: 'SingleValue',

	propTypes: {
		placeholder: React.PropTypes.string, // this is default value provided by React-Select based component
		value: React.PropTypes.object // selected option
	},
	render: function render() {
		var classNames = classes('Select-placeholder', this.props.value && this.props.value.className);
		return React.createElement(
			'div',
			{
				className: classNames,
				style: this.props.value && this.props.value.style,
				title: this.props.value && this.props.value.title
			},
			this.props.placeholder
		);
	}
});

module.exports = SingleValue;

},{"classnames":undefined,"react":undefined}],3:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		disabled: React.PropTypes.bool, // disabled prop passed to ReactSelect
		onOptionLabelClick: React.PropTypes.func, // method to handle click on value label
		onRemove: React.PropTypes.func, // method to handle remove of that value
		option: React.PropTypes.object.isRequired, // option passed to component
		optionLabelClick: React.PropTypes.bool, // indicates if onOptionLabelClick should be handled
		renderer: React.PropTypes.func // method to render option label passed to ReactSelect
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	handleOnRemove: function handleOnRemove(event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	render: function render() {
		var label = this.props.option.label;
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if (!this.props.onRemove && !this.props.optionLabelClick) {
			return React.createElement(
				'div',
				{
					className: classes('Select-value', this.props.option.className),
					style: this.props.option.style,
					title: this.props.option.title
				},
				label
			);
		}

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: classes('Select-item-label__a', this.props.option.className),
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick,
					style: this.props.option.style,
					title: this.props.option.title },
				label
			);
		}

		return React.createElement(
			'div',
			{ className: classes('Select-item', this.props.option.className),
				style: this.props.option.style,
				title: this.props.option.title },
			React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onClick: this.handleOnRemove,
					onTouchEnd: this.handleOnRemove },
				'×'
			),
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Value;

},{"classnames":undefined,"react":undefined}],"react-select":[function(require,module,exports){
/* disable some rules until we refactor more completely; fixing them now would
   cause conflicts with some open PRs unnecessarily. */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var Input = require('react-input-autosize');
var classes = require('classnames');
var Value = require('./Value');
var SingleValue = require('./SingleValue');
var Option = require('./Option');

var requestId = 0;

var Select = React.createClass({

	displayName: 'Select',

	propTypes: {
		addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
		allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
		cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
		className: React.PropTypes.string, // className for the outer element
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearable: React.PropTypes.bool, // should it be possible to reset value
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		filterOption: React.PropTypes.func, // method to filter a single option  (option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function ([options], filterString, [values])
		ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		isLoading: React.PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
		labelKey: React.PropTypes.string, // path of the label value in option objects
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		max: React.PropTypes.number,
		maxChars: React.PropTypes.number,
		multi: React.PropTypes.bool, // multi-value input
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		onBlur: React.PropTypes.func, // onBlur handler: function (event) {}
		onChange: React.PropTypes.func, // onChange handler: function (newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function (event) {}
		onInputChange: React.PropTypes.func, // onInputChange handler: function (inputValue) {}
		onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
		optionComponent: React.PropTypes.func, // option component to render in dropdown
		optionRenderer: React.PropTypes.func, // optionRenderer: function (option) {}
		options: React.PropTypes.array, // array of options
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchingText: React.PropTypes.string, // message to display whilst options are loading via asyncOptions
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
		value: React.PropTypes.any, // initial field value
		valueComponent: React.PropTypes.func, // value component to render in multiple mode
		valueKey: React.PropTypes.string, // path of the label value in option objects
		valueRenderer: React.PropTypes.func // valueRenderer: function (option) {}
	},

	getDefaultProps: function getDefaultProps() {
		return {
			addLabelText: 'Add "{label}"?',
			allowCreate: false,
			asyncOptions: undefined,
			autoload: true,
			backspaceRemoves: true,
			cacheAsyncResults: true,
			className: undefined,
			clearAllText: 'Clear all',
			clearValueText: 'Clear value',
			clearable: true,
			delimiter: ',',
			disabled: false,
			ignoreCase: true,
			inputProps: {},
			isLoading: false,
			labelKey: 'label',
			matchPos: 'any',
			matchProp: 'any',
			max: 30,
			maxChars: 1000,
			name: undefined,
			newOptionCreator: undefined,
			noResultsText: 'No results found',
			onChange: undefined,
			onInputChange: undefined,
			onOptionLabelClick: undefined,
			optionComponent: Option,
			options: undefined,
			placeholder: 'Select...',
			searchable: true,
			searchingText: 'Searching...',
			searchPromptText: 'Type to search',
			singleValueComponent: SingleValue,
			value: undefined,
			valueComponent: Value,
			valueKey: 'value'
		};
	},

	getInitialState: function getInitialState() {
		return {
			/*
    * set by getStateFromValue on componentWillMount:
    * - value
    * - values
    * - filteredOptions
    * - inputValue
    * - placeholder
    * - focusedOption
   */
			isFocused: false,
			isLoading: false,
			isOpen: false,
			options: this.props.options
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		this._optionsCache = {};
		this._optionsFilterString = '';
		this._closeMenuIfClickedOutside = function (event) {
			if (!_this.state.isOpen) {
				return;
			}
			var menuElem = ReactDOM.findDOMNode(_this.refs.selectMenuContainer);
			var controlElem = ReactDOM.findDOMNode(_this.refs.control);

			var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				_this.setState({
					isOpen: false
				}, _this._unbindCloseMenuIfClickedOutside);
			}
		};
		this._bindCloseMenuIfClickedOutside = function () {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.addEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this._unbindCloseMenuIfClickedOutside = function () {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.removeEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this.setState(this.getStateFromValue(this.props.value));
	},

	componentDidMount: function componentDidMount() {
		if (this.props.asyncOptions && this.props.autoload) {
			this.autoloadAsyncOptions();
		}
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);
		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		var _this2 = this;

		var optionsChanged = false;
		if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
			optionsChanged = true;
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
			var setState = function setState(newState) {
				_this2.setState(_this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder));
			};
			if (this.props.asyncOptions) {
				this.loadAsyncOptions(newProps.value, {}, setState);
			} else {
				setState();
			}
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		var _this3 = this;

		if (!this.props.disabled && this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);
			clearTimeout(this._focusTimeout);
			this._focusTimeout = setTimeout(function () {
				if (!_this3.isMounted()) return;
				_this3.getInputNode().focus();
				_this3._focusAfterUpdate = false;
			}, 50);
		}
		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = ReactDOM.findDOMNode(this.refs.focused);
				var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
				}
			}
			this._focusedOptionReveal = false;
		}
	},

	focus: function focus() {
		this.getInputNode().focus();
	},

	getCharValueCount: function getCharValueCount() {
		var input = this.getInputNode(),
		    totalVal = '',
		    len;

		if (this.state.value && this.state.value.length) {
			totalVal = this.state.value.replace(',', '');
		}
		if (input && input.props.value && input.props.value.length) {
			totalVal += input.props.value;
		}

		len = totalVal.length;

		return len;
	},

	getValueCount: function getValueCount() {
		return this.state && this.state.values ? this.state.values.length : 0;
	},

	didReachMax: function didReachMax() {
		if (this.props.max || this.props.maxChars) {
			if (this.props.max && this.getValueCount() >= this.props.max) {
				return true;
			}
			if (this.props.maxChars && this.getCharValueCount() >= this.props.maxChars) {
				return true;
			}
		}
		return false;
	},

	clickedOutsideElement: function clickedOutsideElement(element, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		while (eventTarget != null) {
			if (eventTarget === element) return false;
			eventTarget = eventTarget.offsetParent;
		}
		return true;
	},

	getStateFromValue: function getStateFromValue(value, options, placeholder) {
		var _this4 = this;

		if (!options) {
			options = this.state.options;
		}
		if (!placeholder) {
			placeholder = this.props.placeholder;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options);
		var filteredOptions = this.filterOptions(options, values);

		var focusedOption;
		var valueForState = null;
		if (!this.props.multi && values.length) {
			focusedOption = values[0];
			valueForState = values[0][this.props.valueKey];
		} else {
			focusedOption = this.getFirstFocusableOption(filteredOptions);
			valueForState = values.map(function (v) {
				return v[_this4.props.valueKey];
			}).join(this.props.delimiter);
		}

		return {
			value: valueForState,
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !this.props.multi && values.length ? values[0][this.props.labelKey] : placeholder,
			focusedOption: focusedOption
		};
	},

	getFirstFocusableOption: function getFirstFocusableOption(options) {

		for (var optionIndex = 0; optionIndex < options.length; ++optionIndex) {
			if (!options[optionIndex].disabled) {
				return options[optionIndex];
			}
		}
	},

	initValuesArray: function initValuesArray(values, options) {
		var _this5 = this;

		if (!Array.isArray(values)) {
			if (typeof values === 'string') {
				values = values === '' ? [] : this.props.multi ? values.split(this.props.delimiter) : [values];
			} else {
				values = values !== undefined && values !== null ? [values] : [];
			}
		}
		return values.map(function (val) {
			if (typeof val === 'string' || typeof val === 'number') {
				for (var key in options) {
					if (options.hasOwnProperty(key) && options[key] && (options[key][_this5.props.valueKey] === val || typeof options[key][_this5.props.valueKey] === 'number' && options[key][_this5.props.valueKey].toString() === val)) {
						return options[key];
					}
				}
				return { value: val, label: val };
			} else {
				return val;
			}
		});
	},

	setValue: function setValue(value, focusAfterUpdate) {
		if (focusAfterUpdate || focusAfterUpdate === undefined) {
			this._focusAfterUpdate = true;
		}
		var newState = this.getStateFromValue(value);
		newState.isOpen = false;
		this.fireChangeEvent(newState);
		this.setState(newState);
	},

	selectValue: function selectValue(value) {
		if (!this.props.multi) {
			this.setValue(value);
		} else if (value) {
			this.addValue(value);
		}
		this._unbindCloseMenuIfClickedOutside();
	},

	addValue: function addValue(value) {
		this.setValue(this.state.values.concat(value));
	},

	popValue: function popValue() {
		this.setValue(this.state.values.slice(0, this.state.values.length - 1));
	},

	removeValue: function removeValue(valueToRemove) {
		this.setValue(this.state.values.filter(function (value) {
			return value !== valueToRemove;
		}));
	},

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value === '' ? null : this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : ReactDOM.findDOMNode(input);
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();

		if (!this.didReachMax()) {

			// for the non-searchable select, close the dropdown when button is clicked
			if (this.state.isOpen && !this.props.searchable) {
				this.setState({
					isOpen: false
				}, this._unbindCloseMenuIfClickedOutside);
				return;
			}

			if (this.state.isFocused) {
				this.setState({
					isOpen: true
				}, this._bindCloseMenuIfClickedOutside);
			} else {
				this._openAfterFocus = true;
				this.getInputNode().focus();
			}
		} else {
			if (!this.state.isFocused) {
				this._openAfterFocus = true;
				this.getInputNode().focus();
			}
		}
	},

	handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0 || this.didReachMax()) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
	},

	handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}

		if (this.didReachMax()) {
			event.stopPropagation();
			event.preventDefault();
			return;
		}

		// If not focused, handleMouseDown will handle it
		if (!this.state.isOpen) {
			return;
		}

		event.stopPropagation();
		event.preventDefault();
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleInputFocus: function handleInputFocus(event) {
		var _this6 = this;

		var newIsOpen = this.state.isOpen || this._openAfterFocus;

		if (this.didReachMax()) {
			newIsOpen = false;
		}

		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				_this6._bindCloseMenuIfClickedOutside();
			} else {
				_this6._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		var _this7 = this;

		this._blurTimeout = setTimeout(function () {
			if (_this7._focusAfterUpdate || !_this7.isMounted()) return;
			_this7.setState({
				isFocused: false,
				isOpen: false
			});
		}, 50);
		if (this.props.onBlur) {
			this.props.onBlur(event, this.state.inputValue);
		}
	},

	handleKeyUp: function handleKeyUp(event) {
		if (this.props.disabled) return;

		if (this.didReachMax()) {
			switch (event.keyCode) {
				case 8:
					// backspace
					if (!this.state.inputValue && this.props.backspaceRemoves) {
						event.preventDefault();
						this.popValue();
					}
				case 13:
					// enter
					if (!this.state.isOpen) return;
					this.selectFocusedOption();
					return;
				case 27:
					// escape
					if (this.state.isOpen) {
						this.resetValue();
					} else if (this.props.clearable) {
						this.clearValue(event);
					}
					break;
				default:
					break;
			}
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.props.disabled) return;

		if (!this.didReachMax()) {
			switch (event.keyCode) {
				case 8:
					// backspace
					if (!this.state.inputValue && this.props.backspaceRemoves) {
						event.preventDefault();
						this.popValue();
					}
					return;
				case 9:
					// tab
					if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
						return;
					}
					this.selectFocusedOption();
					break;
				case 13:
					// enter
					if (!this.state.isOpen) return;
					this.selectFocusedOption();
					break;
				case 27:
					// escape
					if (this.state.isOpen) {
						this.resetValue();
					} else if (this.props.clearable) {
						this.clearValue(event);
					}
					break;
				case 38:
					// up
					this.focusPreviousOption();
					break;
				case 40:
					// down
					this.focusNextOption();
					break;
				case 188:
					// ,
					if (this.props.allowCreate && this.props.multi) {
						event.preventDefault();
						event.stopPropagation();
						this.selectFocusedOption();
					} else {
						return;
					}
					break;
				default:
					return;
			}
		} else {
			switch (event.keyCode) {
				case 8:
					// backspace
					if (!this.state.inputValue && this.props.backspaceRemoves) {
						event.preventDefault();
						this.popValue();
					}
					return;
				default:
					break;
			}
		}

		event.preventDefault();
	},

	// Ensures that the currently focused option is available in filteredOptions.
	// If not, returns the first available option.
	_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
		for (var key in filteredOptions) {
			if (filteredOptions.hasOwnProperty(key) && filteredOptions[key] === this.state.focusedOption) {
				return filteredOptions[key];
			}
		}
		return this.getFirstFocusableOption(filteredOptions);
	},

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;

		if (this.props.onInputChange) {
			this.props.onInputChange(event.target.value);
		}

		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: event.target.value
			});
			this.loadAsyncOptions(event.target.value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);
			this.setState({
				isOpen: true,
				inputValue: event.target.value,
				filteredOptions: filteredOptions,
				focusedOption: this._getNewFocusedOption(filteredOptions)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	autoloadAsyncOptions: function autoloadAsyncOptions() {
		var _this8 = this;

		this.setState({
			isLoading: true
		});
		this.loadAsyncOptions(this.props.value || '', { isLoading: false }, function () {
			// update with new options but don't focus
			_this8.setValue(_this8.props.value, false);
		});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
		if (input === undefined) input = '';

		var _this9 = this;

		var thisRequestId = this._currentRequestId = requestId++;
		if (this.props.cacheAsyncResults) {
			for (var i = 0; i <= input.length; i++) {
				var cacheKey = input.slice(0, i);
				if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
					var options = this._optionsCache[cacheKey].options;
					var filteredOptions = this.filterOptions(options);
					var newState = {
						options: options,
						filteredOptions: filteredOptions,
						focusedOption: this._getNewFocusedOption(filteredOptions)
					};
					for (var key in state) {
						if (state.hasOwnProperty(key)) {
							newState[key] = state[key];
						}
					}
					this.setState(newState);
					if (callback) callback.call(this, newState);
					return;
				}
			}
		}

		var optionsResponseHandler = function optionsResponseHandler(err, data) {
			if (err) throw err;
			if (_this9.props.cacheAsyncResults) {
				_this9._optionsCache[input] = data;
			}
			if (thisRequestId !== _this9._currentRequestId) {
				return;
			}
			var filteredOptions = _this9.filterOptions(data.options);
			var newState = {
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: _this9._getNewFocusedOption(filteredOptions)
			};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					newState[key] = state[key];
				}
			}
			_this9.setState(newState);
			if (callback) callback.call(_this9, newState);
		};

		var asyncOpts = this.props.asyncOptions(input, optionsResponseHandler);

		if (asyncOpts && typeof asyncOpts.then === 'function') {
			asyncOpts.then(function (data) {
				optionsResponseHandler(null, data);
			}, function (err) {
				optionsResponseHandler(err);
			});
		}
	},

	filterOptions: function filterOptions(options, values) {
		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (i) {
			return i.value;
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if (this.props.multi && exclude.indexOf(op[this.props.valueKey]) > -1) return false;
				if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
				var valueTest = String(op[this.props.valueKey]);
				var labelTest = String(op[this.props.labelKey]);
				if (this.props.ignoreCase) {
					valueTest = valueTest.toLowerCase();
					labelTest = labelTest.toLowerCase();
					filterValue = filterValue.toLowerCase();
				}
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
			};
			return (options || []).filter(filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		if (this.props.allowCreate && !this.state.focusedOption) {
			return this.selectValue(this.state.inputValue);
		}

		if (this.state.focusedOption) {
			return this.selectValue(this.state.focusedOption);
		}
	},

	focusOption: function focusOption(op) {
		this.setState({
			focusedOption: op
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;
		var ops = this.state.filteredOptions.filter(function (op) {
			return !op.disabled;
		});
		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
			}, this._bindCloseMenuIfClickedOutside);
			return;
		}
		if (!ops.length) {
			return;
		}
		var focusedIndex = -1;
		for (var i = 0; i < ops.length; i++) {
			if (this.state.focusedOption === ops[i]) {
				focusedIndex = i;
				break;
			}
		}
		var focusedOption = ops[0];
		if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
			focusedOption = ops[focusedIndex + 1];
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = ops[focusedIndex - 1];
			} else {
				focusedOption = ops[ops.length - 1];
			}
		}
		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (this.state.focusedOption === op) {
			this.setState({
				focusedOption: null
			});
		}
	},

	buildMenu: function buildMenu() {
		var _this10 = this;

		var focusedValue = this.state.focusedOption ? this.state.focusedOption[this.props.valueKey] : null;
		var renderLabel = this.props.optionRenderer;
		if (!renderLabel) renderLabel = function (op) {
			return op[_this10.props.labelKey];
		};
		if (this.state.filteredOptions.length > 0) {
			focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
		}
		// Add the current value to the filtered options in last resort
		var options = this.state.filteredOptions;
		if (this.props.allowCreate && this.state.inputValue.trim()) {
			var inputValue = this.state.inputValue;
			options = options.slice();
			var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
				value: inputValue,
				label: inputValue,
				create: true
			};
			options.unshift(newOption);
		}
		var ops = Object.keys(options).map(function (key) {
			var op = options[key];
			var isSelected = this.state.value === op[this.props.valueKey];
			var isFocused = focusedValue === op[this.props.valueKey];
			var optionClass = classes({
				'Select-option': true,
				'is-selected': isSelected,
				'is-focused': isFocused,
				'is-disabled': op.disabled
			});
			var ref = isFocused ? 'focused' : null;
			var mouseEnter = this.focusOption.bind(this, op);
			var mouseLeave = this.unfocusOption.bind(this, op);
			var mouseDown = this.selectValue.bind(this, op);
			var optionResult = React.createElement(this.props.optionComponent, {
				key: 'option-' + op[this.props.valueKey],
				className: optionClass,
				renderFunc: renderLabel,
				mouseEnter: mouseEnter,
				mouseLeave: mouseLeave,
				mouseDown: mouseDown,
				click: mouseDown,
				addLabelText: this.props.addLabelText,
				option: op,
				ref: ref
			});
			return optionResult;
		}, this);

		if (ops.length) {
			return ops;
		} else {
			var noResultsText, promptClass;
			if (this.isLoading()) {
				promptClass = 'Select-searching';
				noResultsText = this.props.searchingText;
			} else if (this.state.inputValue || !this.props.asyncOptions) {
				promptClass = 'Select-noresults';
				noResultsText = this.props.noResultsText;
			} else {
				promptClass = 'Select-search-prompt';
				noResultsText = this.props.searchPromptText;
			}

			return React.createElement(
				'div',
				{ className: promptClass },
				noResultsText
			);
		}
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		if (this.props.onOptionLabelClick) {
			this.props.onOptionLabelClick(value, event);
		}
	},

	isLoading: function isLoading() {
		return this.props.isLoading || this.state.isLoading;
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'Select--multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.isLoading(),
			'is-disabled': this.props.disabled,
			'has-value': this.state.value,
			'has-reached-max': this.didReachMax()
		});
		var value = [];
		if (this.props.multi) {
			this.state.values.forEach(function (val) {
				var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
				var onRemove = this.removeValue.bind(this, val);
				var valueComponent = React.createElement(this.props.valueComponent, {
					key: val.value,
					option: val,
					renderer: this.props.valueRenderer,
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: onOptionLabelClick,
					onRemove: onRemove,
					disabled: this.props.disabled
				});
				value.push(valueComponent);
			}, this);
		}

		if (!this.state.inputValue && (!this.props.multi || !value.length)) {
			var val = this.state.values[0] || null;
			if (this.props.valueRenderer && !!this.state.values.length) {
				value.push(React.createElement(Value, {
					key: 0,
					option: val,
					renderer: this.props.valueRenderer,
					disabled: this.props.disabled }));
			} else {
				var singleValueComponent = React.createElement(this.props.singleValueComponent, {
					key: 'placeholder',
					value: val,
					placeholder: this.state.placeholder
				});
				value.push(singleValueComponent);
			}
		}

		// loading spinner
		var loading = this.isLoading() ? React.createElement(
			'span',
			{ className: 'Select-loading-zone', 'aria-hidden': 'true' },
			React.createElement('span', { className: 'Select-loading' })
		) : null;

		// clear "x" button
		var clear = this.props.clearable && this.state.value && !this.props.disabled && !this.isLoading() ? React.createElement(
			'span',
			{ className: 'Select-clear-zone', title: this.props.multi ? this.props.clearAllText : this.props.clearValueText, 'aria-label': this.props.multi ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onTouchEnd: this.clearValue, onClick: this.clearValue },
			React.createElement('span', { className: 'Select-clear', dangerouslySetInnerHTML: { __html: '&times;' } })
		) : null;

		// indicator arrow
		var arrow = React.createElement(
			'span',
			{ className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow },
			React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow })
		);

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu',
				onMouseDown: this.handleMouseDownOnMenu
			};
			menu = React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
				React.createElement(
					'div',
					menuProps,
					this.buildMenu()
				)
			);
		}

		var input;
		var inputProps = {
			ref: 'input',
			className: 'Select-input ' + (this.props.inputProps.className || ''),
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		};
		for (var key in this.props.inputProps) {
			if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
				inputProps[key] = this.props.inputProps[key];
			}
		}

		if (!this.props.disabled) {
			if (this.props.searchable) {
				input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
			} else {
				input = React.createElement(
					'div',
					inputProps,
					' '
				);
			}
		} else if (!this.props.multi || !this.state.values.length) {
			input = React.createElement(
				'div',
				{ className: 'Select-input' },
				' '
			);
		}

		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				'div',
				{ className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onKeyUp: this.handleKeyUp, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				loading,
				clear,
				arrow
			),
			menu
		);
	}

});

module.exports = Select;

},{"./Option":1,"./SingleValue":2,"./Value":3,"classnames":undefined,"react":undefined,"react-dom":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2FybG9zZ2F2aW5hL1NpdGVzL3JlYWN0LXNlbGVjdC9zcmMvT3B0aW9uLmpzIiwiL1VzZXJzL2Nhcmxvc2dhdmluYS9TaXRlcy9yZWFjdC1zZWxlY3Qvc3JjL1NpbmdsZVZhbHVlLmpzIiwiL1VzZXJzL2Nhcmxvc2dhdmluYS9TaXRlcy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL2Nhcmxvc2dhdmluYS9TaXRlcy9yZWFjdC1zZWxlY3Qvc3JjL1NlbGVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQzlCLFVBQVMsRUFBRTtBQUNWLGNBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDcEMsV0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUNqQyxXQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQy9CLFlBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDaEMsWUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUNoQyxRQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUN6QyxZQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0VBQ2hDOztBQUVELFdBQVUsRUFBQyxvQkFBQyxLQUFLLEVBQUU7QUFDbEIsT0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZCLE1BQUksQUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxHQUFHLElBQUssRUFBRSxNQUFN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QUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDLEdBQUc7R0FDbEg7O01BQUssU0FBUyxFQUFDLGdCQUFnQixFQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7SUFDMUssS0FBSztJQUNMLEtBQUs7SUFDTCxPQUFPO0lBQ1AsS0FBSztJQUNMLEtBQUs7SUFDRDtHQUNMLElBQUk7R0FDQSxDQUNMO0VBQ0Y7O0NBRUQsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIE9wdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0YWRkTGFiZWxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBzdHJpbmcgcmVuZGVyZWQgaW4gY2FzZSBvZiBhbGxvd0NyZWF0ZSBvcHRpb24gcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAvLyBjbGFzc05hbWUgKGJhc2VkIG9uIG1vdXNlIHBvc2l0aW9uKVxuXHRcdG1vdXNlRG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBjbGljayBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG1vdXNlRW50ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBtb3VzZUVudGVyIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VMZWF2ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlTGVhdmUgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRvcHRpb246IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCwgICAgIC8vIG9iamVjdCB0aGF0IGlzIGJhc2UgZm9yIHRoYXQgb3B0aW9uXG5cdFx0cmVuZGVyRnVuYzogUmVhY3QuUHJvcFR5cGVzLmZ1bmMgICAgICAgICAgICAgICAvLyBtZXRob2QgcGFzc2VkIHRvIFJlYWN0U2VsZWN0IGNvbXBvbmVudCB0byByZW5kZXIgbGFiZWwgdGV4dFxuXHR9LFxuXG5cdGJsb2NrRXZlbnQgKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRpZiAoKGV2ZW50LnRhcmdldC50YWdOYW1lICE9PSAnQScpIHx8ICEoJ2hyZWYnIGluIGV2ZW50LnRhcmdldCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZXZlbnQudGFyZ2V0LnRhcmdldCkge1xuXHRcdFx0d2luZG93Lm9wZW4oZXZlbnQudGFyZ2V0LmhyZWYpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGV2ZW50LnRhcmdldC5ocmVmO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciBvYmogPSB0aGlzLnByb3BzLm9wdGlvbjtcblx0XHR2YXIgcmVuZGVyZWRMYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyRnVuYyhvYmopO1xuXHRcdHZhciBvcHRpb25DbGFzc2VzID0gY2xhc3Nlcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwgb2JqLmNsYXNzTmFtZSk7XG5cblx0XHR2YXIgcmVuZGVyRGlzYWJsZWQgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3Nlc31cblx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0b25DbGljaz17dGhpcy5ibG9ja0V2ZW50fT5cblx0XHRcdFx0e3JlbmRlcmVkTGFiZWx9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXG5cdFx0dmFyIHJlbmRlckVuYWJsZWQgPSAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3Nlc31cblx0XHRcdFx0c3R5bGU9e29iai5zdHlsZX1cblx0XHRcdFx0b25Nb3VzZUVudGVyPXt0aGlzLnByb3BzLm1vdXNlRW50ZXJ9XG5cdFx0XHRcdG9uTW91c2VMZWF2ZT17dGhpcy5wcm9wcy5tb3VzZUxlYXZlfVxuXHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5tb3VzZURvd259XG5cdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMubW91c2VEb3dufVxuXHRcdFx0XHR0aXRsZT17b2JqLnRpdGxlfT5cblx0XHRcdFx0eyBvYmouY3JlYXRlID8gdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQucmVwbGFjZSgne2xhYmVsfScsIG9iai5sYWJlbCkgOiByZW5kZXJlZExhYmVsIH1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gb2JqLmRpc2FibGVkID8gcmVuZGVyRGlzYWJsZWQgOiAoIG9iai5jcmVhdGUgJiYgdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQgJiYgdGhpcy5wcm9wcy5hZGRMYWJlbFRleHQubGVuZ3RoID4gMCA/IHJlbmRlckVuYWJsZWQgOiAoICFvYmouY3JlYXRlID8gcmVuZGVyRW5hYmxlZCA6IG51bGwgKSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb247XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBTaW5nbGVWYWx1ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cHJvcFR5cGVzOiB7XG5cdFx0cGxhY2Vob2xkZXI6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgIC8vIHRoaXMgaXMgZGVmYXVsdCB2YWx1ZSBwcm92aWRlZCBieSBSZWFjdC1TZWxlY3QgYmFzZWQgY29tcG9uZW50XG5cdFx0dmFsdWU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QgICAgICAgICAgICAgIC8vIHNlbGVjdGVkIG9wdGlvblxuXHR9LFxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciBjbGFzc05hbWVzID0gY2xhc3NlcygnU2VsZWN0LXBsYWNlaG9sZGVyJywgdGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnZhbHVlLmNsYXNzTmFtZSk7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXZcblx0XHRcdFx0Y2xhc3NOYW1lPXtjbGFzc05hbWVzfVxuXHRcdFx0XHRzdHlsZT17dGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnZhbHVlLnN0eWxlfVxuXHRcdFx0XHR0aXRsZT17dGhpcy5wcm9wcy52YWx1ZSAmJiB0aGlzLnByb3BzLnZhbHVlLnRpdGxlfVxuXHRcdFx0XHQ+e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xlVmFsdWU7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciBWYWx1ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuXHRkaXNwbGF5TmFtZTogJ1ZhbHVlJyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgICAgIC8vIGRpc2FibGVkIHByb3AgcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIHZhbHVlIGxhYmVsXG5cdFx0b25SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIHJlbW92ZSBvZiB0aGF0IHZhbHVlXG5cdFx0b3B0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsICAgICAgICAvLyBvcHRpb24gcGFzc2VkIHRvIGNvbXBvbmVudFxuXHRcdG9wdGlvbkxhYmVsQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gaW5kaWNhdGVzIGlmIG9uT3B0aW9uTGFiZWxDbGljayBzaG91bGQgYmUgaGFuZGxlZFxuXHRcdHJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIHJlbmRlciBvcHRpb24gbGFiZWwgcGFzc2VkIHRvIFJlYWN0U2VsZWN0XG5cdH0sXG5cblx0YmxvY2tFdmVudCAoZXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRoYW5kbGVPblJlbW92ZSAoZXZlbnQpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMucHJvcHMub25SZW1vdmUoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciBsYWJlbCA9IHRoaXMucHJvcHMub3B0aW9uLmxhYmVsO1xuXHRcdGlmICh0aGlzLnByb3BzLnJlbmRlcmVyKSB7XG5cdFx0XHRsYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyZXIodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdH1cblxuXHRcdGlmKCF0aGlzLnByb3BzLm9uUmVtb3ZlICYmICF0aGlzLnByb3BzLm9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRjbGFzc05hbWU9e2NsYXNzZXMoJ1NlbGVjdC12YWx1ZScsIHRoaXMucHJvcHMub3B0aW9uLmNsYXNzTmFtZSl9XG5cdFx0XHRcdFx0c3R5bGU9e3RoaXMucHJvcHMub3B0aW9uLnN0eWxlfVxuXHRcdFx0XHRcdHRpdGxlPXt0aGlzLnByb3BzLm9wdGlvbi50aXRsZX1cblx0XHRcdFx0PntsYWJlbH08L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0bGFiZWwgPSAoXG5cdFx0XHRcdDxhIGNsYXNzTmFtZT17Y2xhc3NlcygnU2VsZWN0LWl0ZW0tbGFiZWxfX2EnLCB0aGlzLnByb3BzLm9wdGlvbi5jbGFzc05hbWUpfVxuXHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0b25Ub3VjaEVuZD17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2t9XG5cdFx0XHRcdFx0c3R5bGU9e3RoaXMucHJvcHMub3B0aW9uLnN0eWxlfVxuXHRcdFx0XHRcdHRpdGxlPXt0aGlzLnByb3BzLm9wdGlvbi50aXRsZX0+XG5cdFx0XHRcdFx0e2xhYmVsfVxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc3NlcygnU2VsZWN0LWl0ZW0nLCB0aGlzLnByb3BzLm9wdGlvbi5jbGFzc05hbWUpfVxuXHRcdFx0XHQgc3R5bGU9e3RoaXMucHJvcHMub3B0aW9uLnN0eWxlfVxuXHRcdFx0XHQgdGl0bGU9e3RoaXMucHJvcHMub3B0aW9uLnRpdGxlfT5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWl0ZW0taWNvblwiXG5cdFx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuYmxvY2tFdmVudH1cblx0XHRcdFx0XHRvbkNsaWNrPXt0aGlzLmhhbmRsZU9uUmVtb3ZlfVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlT25SZW1vdmV9PiZ0aW1lczs8L3NwYW4+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsdWU7XG4iLCIvKiBkaXNhYmxlIHNvbWUgcnVsZXMgdW50aWwgd2UgcmVmYWN0b3IgbW9yZSBjb21wbGV0ZWx5OyBmaXhpbmcgdGhlbSBub3cgd291bGRcbiAgIGNhdXNlIGNvbmZsaWN0cyB3aXRoIHNvbWUgb3BlbiBQUnMgdW5uZWNlc3NhcmlseS4gKi9cbi8qIGVzbGludCByZWFjdC9qc3gtc29ydC1wcm9wLXR5cGVzOiAwLCByZWFjdC9zb3J0LWNvbXA6IDAsIHJlYWN0L3Byb3AtdHlwZXM6IDAgKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdERPTSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xudmFyIElucHV0ID0gcmVxdWlyZSgncmVhY3QtaW5wdXQtYXV0b3NpemUnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIFZhbHVlID0gcmVxdWlyZSgnLi9WYWx1ZScpO1xudmFyIFNpbmdsZVZhbHVlID0gcmVxdWlyZSgnLi9TaW5nbGVWYWx1ZScpO1xudmFyIE9wdGlvbiA9IHJlcXVpcmUoJy4vT3B0aW9uJyk7XG5cbnZhciByZXF1ZXN0SWQgPSAwO1xuXG52YXIgU2VsZWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4geW91IHdhbnQgdG8gYWRkIGEgbGFiZWwgb24gYSBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdGFsbG93Q3JlYXRlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAvLyB3aGV0aGVyIHRvIGFsbG93IGNyZWF0aW9uIG9mIG5ldyBlbnRyaWVzXG5cdFx0YXN5bmNPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGNhbGwgdG8gZ2V0IG9wdGlvbnNcblx0XHRhdXRvbG9hZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0byBhdXRvLWxvYWQgdGhlIGRlZmF1bHQgYXN5bmMgb3B0aW9ucyBzZXRcblx0XHRiYWNrc3BhY2VSZW1vdmVzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgLy8gd2hldGhlciBiYWNrc3BhY2UgcmVtb3ZlcyBhbiBpdGVtIGlmIHRoZXJlIGlzIG5vIHRleHQgaW5wdXRcblx0XHRjYWNoZUFzeW5jUmVzdWx0czogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgLy8gd2hldGhlciB0byBhbGxvdyBjYWNoZVxuXHRcdGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBjbGFzc05hbWUgZm9yIHRoZSBvdXRlciBlbGVtZW50XG5cdFx0Y2xlYXJBbGxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2wgd2hlbiBtdWx0aTogdHJ1ZVxuXHRcdGNsZWFyVmFsdWVUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sXG5cdFx0Y2xlYXJhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBkZWxpbWl0ZXIgdG8gdXNlIHRvIGpvaW4gbXVsdGlwbGUgdmFsdWVzXG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBkaXNhYmxlZCBvciBub3Rcblx0XHRmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb24gIChvcHRpb24sIGZpbHRlclN0cmluZylcblx0XHRmaWx0ZXJPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciB0aGUgb3B0aW9ucyBhcnJheTogZnVuY3Rpb24gKFtvcHRpb25zXSwgZmlsdGVyU3RyaW5nLCBbdmFsdWVzXSlcblx0XHRpZ25vcmVDYXNlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBwZXJmb3JtIGNhc2UtaW5zZW5zaXRpdmUgZmlsdGVyaW5nXG5cdFx0aW5wdXRQcm9wczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCwgICAgICAgIC8vIGN1c3RvbSBhdHRyaWJ1dGVzIGZvciB0aGUgSW5wdXQgKGluIHRoZSBTZWxlY3QtY29udHJvbCkgZS5nOiB7J2RhdGEtZm9vJzogJ2Jhcid9XG5cdFx0aXNMb2FkaW5nOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBsb2FkaW5nIGV4dGVybmFsbHkgb3Igbm90IChzdWNoIGFzIG9wdGlvbnMgYmVpbmcgbG9hZGVkKVxuXHRcdGxhYmVsS2V5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBwYXRoIG9mIHRoZSBsYWJlbCB2YWx1ZSBpbiBvcHRpb24gb2JqZWN0c1xuXHRcdG1hdGNoUG9zOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyAoYW55fHN0YXJ0KSBtYXRjaCB0aGUgc3RhcnQgb3IgZW50aXJlIHN0cmluZyB3aGVuIGZpbHRlcmluZ1xuXHRcdG1hdGNoUHJvcDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyAoYW55fGxhYmVsfHZhbHVlKSB3aGljaCBvcHRpb24gcHJvcGVydHkgdG8gZmlsdGVyIG9uXG5cdFx0bWF4OiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHRcdG1heENoYXJzOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgICAvLyBmaWVsZCBuYW1lLCBmb3IgaGlkZGVuIDxpbnB1dCAvPiB0YWdcblx0XHRuZXdPcHRpb25DcmVhdG9yOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgLy8gZmFjdG9yeSB0byBjcmVhdGUgbmV3IG9wdGlvbnMgd2hlbiBhbGxvd0NyZWF0ZSBzZXRcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0b25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG9uQmx1ciBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQpIHt9XG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge31cblx0XHRvbkZvY3VzOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgLy8gb25Gb2N1cyBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQpIHt9XG5cdFx0b25JbnB1dENoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgIC8vIG9uSW5wdXRDaGFuZ2UgaGFuZGxlcjogZnVuY3Rpb24gKGlucHV0VmFsdWUpIHt9XG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgIC8vIG9uQ0xpY2sgaGFuZGxlciBmb3IgdmFsdWUgbGFiZWxzOiBmdW5jdGlvbiAodmFsdWUsIGV2ZW50KSB7fVxuXHRcdG9wdGlvbkNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAvLyBvcHRpb24gY29tcG9uZW50IHRvIHJlbmRlciBpbiBkcm9wZG93blxuXHRcdG9wdGlvblJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyBvcHRpb25SZW5kZXJlcjogZnVuY3Rpb24gKG9wdGlvbikge31cblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAvLyBmaWVsZCBwbGFjZWhvbGRlciwgZGlzcGxheWVkIHdoZW4gdGhlcmUncyBubyB2YWx1ZVxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIGVuYWJsZSBzZWFyY2hpbmcgZmVhdHVyZSBvciBub3Rcblx0XHRzZWFyY2hpbmdUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gbWVzc2FnZSB0byBkaXNwbGF5IHdoaWxzdCBvcHRpb25zIGFyZSBsb2FkaW5nIHZpYSBhc3luY09wdGlvbnNcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgLy8gbGFiZWwgdG8gcHJvbXB0IGZvciBzZWFyY2ggaW5wdXRcblx0XHRzaW5nbGVWYWx1ZUNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsLy8gc2luZ2xlIHZhbHVlIGNvbXBvbmVudCB3aGVuIG11bHRpcGxlIGlzIHNldCB0byBmYWxzZVxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuYW55LCAgICAgICAgICAgICAgICAvLyBpbml0aWFsIGZpZWxkIHZhbHVlXG5cdFx0dmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgIC8vIHZhbHVlIGNvbXBvbmVudCB0byByZW5kZXIgaW4gbXVsdGlwbGUgbW9kZVxuXHRcdHZhbHVlS2V5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAvLyBwYXRoIG9mIHRoZSBsYWJlbCB2YWx1ZSBpbiBvcHRpb24gb2JqZWN0c1xuXHRcdHZhbHVlUmVuZGVyZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jICAgICAgICAvLyB2YWx1ZVJlbmRlcmVyOiBmdW5jdGlvbiAob3B0aW9uKSB7fVxuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wcyAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZExhYmVsVGV4dDogJ0FkZCBcIntsYWJlbH1cIj8nLFxuXHRcdFx0YWxsb3dDcmVhdGU6IGZhbHNlLFxuXHRcdFx0YXN5bmNPcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRhdXRvbG9hZDogdHJ1ZSxcblx0XHRcdGJhY2tzcGFjZVJlbW92ZXM6IHRydWUsXG5cdFx0XHRjYWNoZUFzeW5jUmVzdWx0czogdHJ1ZSxcblx0XHRcdGNsYXNzTmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0Y2xlYXJBbGxUZXh0OiAnQ2xlYXIgYWxsJyxcblx0XHRcdGNsZWFyVmFsdWVUZXh0OiAnQ2xlYXIgdmFsdWUnLFxuXHRcdFx0Y2xlYXJhYmxlOiB0cnVlLFxuXHRcdFx0ZGVsaW1pdGVyOiAnLCcsXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRpZ25vcmVDYXNlOiB0cnVlLFxuXHRcdFx0aW5wdXRQcm9wczoge30sXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0bGFiZWxLZXk6ICdsYWJlbCcsXG5cdFx0XHRtYXRjaFBvczogJ2FueScsXG5cdFx0XHRtYXRjaFByb3A6ICdhbnknLFxuXHRcdFx0bWF4OiAzMCxcblx0XHRcdG1heENoYXJzOiAxMDAwLFxuXHRcdFx0bmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0bmV3T3B0aW9uQ3JlYXRvcjogdW5kZWZpbmVkLFxuXHRcdFx0bm9SZXN1bHRzVGV4dDogJ05vIHJlc3VsdHMgZm91bmQnLFxuXHRcdFx0b25DaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdG9uSW5wdXRDaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdG9uT3B0aW9uTGFiZWxDbGljazogdW5kZWZpbmVkLFxuXHRcdFx0b3B0aW9uQ29tcG9uZW50OiBPcHRpb24sXG5cdFx0XHRvcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1NlbGVjdC4uLicsXG5cdFx0XHRzZWFyY2hhYmxlOiB0cnVlLFxuXHRcdFx0c2VhcmNoaW5nVGV4dDogJ1NlYXJjaGluZy4uLicsXG5cdFx0XHRzZWFyY2hQcm9tcHRUZXh0OiAnVHlwZSB0byBzZWFyY2gnLFxuXHRcdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFNpbmdsZVZhbHVlLFxuXHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdHZhbHVlQ29tcG9uZW50OiBWYWx1ZSxcblx0XHRcdHZhbHVlS2V5OiAndmFsdWUnXG5cdFx0fTtcblx0fSxcblxuXHRnZXRJbml0aWFsU3RhdGUgKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHQvKlxuXHRcdFx0ICogc2V0IGJ5IGdldFN0YXRlRnJvbVZhbHVlIG9uIGNvbXBvbmVudFdpbGxNb3VudDpcblx0XHRcdCAqIC0gdmFsdWVcblx0XHRcdCAqIC0gdmFsdWVzXG5cdFx0XHQgKiAtIGZpbHRlcmVkT3B0aW9uc1xuXHRcdFx0ICogLSBpbnB1dFZhbHVlXG5cdFx0XHQgKiAtIHBsYWNlaG9sZGVyXG5cdFx0XHQgKiAtIGZvY3VzZWRPcHRpb25cblx0XHRcdCovXG5cdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlLFxuXHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdGlzT3BlbjogZmFsc2UsXG5cdFx0XHRvcHRpb25zOiB0aGlzLnByb3BzLm9wdGlvbnNcblx0XHR9O1xuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxNb3VudCAoKSB7XG5cdFx0dGhpcy5fb3B0aW9uc0NhY2hlID0ge307XG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXHRcdHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSAoZXZlbnQpID0+IHtcblx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1lbnVFbGVtID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLnNlbGVjdE1lbnVDb250YWluZXIpO1xuXHRcdFx0dmFyIGNvbnRyb2xFbGVtID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLmNvbnRyb2wpO1xuXG5cdFx0XHR2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgPSB0aGlzLmNsaWNrZWRPdXRzaWRlRWxlbWVudChtZW51RWxlbSwgZXZlbnQpO1xuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sID0gdGhpcy5jbGlja2VkT3V0c2lkZUVsZW1lbnQoY29udHJvbEVsZW0sIGV2ZW50KTtcblxuXHRcdFx0Ly8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuXHRcdFx0aWYgKGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ICYmIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sKSB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdFx0fSwgdGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9ICgpID0+IHtcblx0XHRcdGlmICghZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiBkb2N1bWVudC5hdHRhY2hFdmVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUgPSAoKSA9PiB7XG5cdFx0XHRpZiAoIWRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJiYgZG9jdW1lbnQuZGV0YWNoRXZlbnQpIHtcblx0XHRcdFx0ZG9jdW1lbnQuZGV0YWNoRXZlbnQoJ29uY2xpY2snLCB0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodGhpcy5wcm9wcy52YWx1ZSkpO1xuXHR9LFxuXG5cdGNvbXBvbmVudERpZE1vdW50ICgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMgJiYgdGhpcy5wcm9wcy5hdXRvbG9hZCkge1xuXHRcdFx0dGhpcy5hdXRvbG9hZEFzeW5jT3B0aW9ucygpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsVW5tb3VudCAoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fZm9jdXNUaW1lb3V0KTtcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV3UHJvcHMpIHtcblx0XHR2YXIgb3B0aW9uc0NoYW5nZWQgPSBmYWxzZTtcblx0XHRpZiAoSlNPTi5zdHJpbmdpZnkobmV3UHJvcHMub3B0aW9ucykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMub3B0aW9ucykpIHtcblx0XHRcdG9wdGlvbnNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRvcHRpb25zOiBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IHRoaXMuZmlsdGVyT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChuZXdQcm9wcy52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSB8fCBuZXdQcm9wcy5wbGFjZWhvbGRlciAhPT0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlciB8fCBvcHRpb25zQ2hhbmdlZCkge1xuXHRcdFx0dmFyIHNldFN0YXRlID0gKG5ld1N0YXRlKSA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0U3RhdGUodGhpcy5nZXRTdGF0ZUZyb21WYWx1ZShuZXdQcm9wcy52YWx1ZSxcblx0XHRcdFx0XHQobmV3U3RhdGUgJiYgbmV3U3RhdGUub3B0aW9ucykgfHwgbmV3UHJvcHMub3B0aW9ucyxcblx0XHRcdFx0XHRuZXdQcm9wcy5wbGFjZWhvbGRlclxuXHRcdFx0XHQpKTtcblx0XHRcdH07XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5sb2FkQXN5bmNPcHRpb25zKG5ld1Byb3BzLnZhbHVlLCB7fSwgc2V0U3RhdGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0U3RhdGUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0Y29tcG9uZW50RGlkVXBkYXRlICgpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQgJiYgdGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXHRcdFx0dGhpcy5fZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdGlmICghdGhpcy5pc01vdW50ZWQoKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0XHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSBmYWxzZTtcblx0XHRcdH0sIDUwKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwpIHtcblx0XHRcdGlmICh0aGlzLnJlZnMuZm9jdXNlZCAmJiB0aGlzLnJlZnMubWVudSkge1xuXHRcdFx0XHR2YXIgZm9jdXNlZERPTSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5mb2N1c2VkKTtcblx0XHRcdFx0dmFyIG1lbnVET00gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMubWVudSk7XG5cdFx0XHRcdHZhciBmb2N1c2VkUmVjdCA9IGZvY3VzZWRET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdHZhciBtZW51UmVjdCA9IG1lbnVET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0aWYgKGZvY3VzZWRSZWN0LmJvdHRvbSA+IG1lbnVSZWN0LmJvdHRvbSB8fCBmb2N1c2VkUmVjdC50b3AgPCBtZW51UmVjdC50b3ApIHtcblx0XHRcdFx0XHRtZW51RE9NLnNjcm9sbFRvcCA9IChmb2N1c2VkRE9NLm9mZnNldFRvcCArIGZvY3VzZWRET00uY2xpZW50SGVpZ2h0IC0gbWVudURPTS5vZmZzZXRIZWlnaHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdGZvY3VzICgpIHtcblx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdH0sXG5cblx0Z2V0Q2hhclZhbHVlQ291bnQgKCkge1xuXHRcdHZhciBpbnB1dCA9IHRoaXMuZ2V0SW5wdXROb2RlKCksXG5cdFx0XHR0b3RhbFZhbCA9ICcnLFxuXHRcdFx0bGVuO1xuXG5cdFx0aWYgKCB0aGlzLnN0YXRlLnZhbHVlICYmIHRoaXMuc3RhdGUudmFsdWUubGVuZ3RoICkge1xuXHRcdFx0dG90YWxWYWwgPSB0aGlzLnN0YXRlLnZhbHVlLnJlcGxhY2UoJywnLCAnJyk7XG5cdFx0fVxuXHRcdGlmICggaW5wdXQgJiYgaW5wdXQucHJvcHMudmFsdWUgJiYgaW5wdXQucHJvcHMudmFsdWUubGVuZ3RoICkge1xuXHRcdFx0dG90YWxWYWwgKz0gaW5wdXQucHJvcHMudmFsdWU7XG5cdFx0fVxuXG5cdFx0bGVuID0gdG90YWxWYWwubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIGxlbjtcblx0fSxcblxuXHRnZXRWYWx1ZUNvdW50ICgpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLnZhbHVlcyA/IHRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCA6IDA7XG5cdH0sXG5cblx0ZGlkUmVhY2hNYXggKCkge1xuXHRcdGlmICggdGhpcy5wcm9wcy5tYXggfHwgdGhpcy5wcm9wcy5tYXhDaGFycyApIHtcblx0XHRcdGlmICggdGhpcy5wcm9wcy5tYXggJiYgdGhpcy5nZXRWYWx1ZUNvdW50KCkgPj0gdGhpcy5wcm9wcy5tYXggKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLnByb3BzLm1heENoYXJzICYmIHRoaXMuZ2V0Q2hhclZhbHVlQ291bnQoKSA+PSB0aGlzLnByb3BzLm1heENoYXJzICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdGNsaWNrZWRPdXRzaWRlRWxlbWVudCAoZWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgZXZlbnRUYXJnZXQgPSAoZXZlbnQudGFyZ2V0KSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnNyY0VsZW1lbnQ7XG5cdFx0d2hpbGUgKGV2ZW50VGFyZ2V0ICE9IG51bGwpIHtcblx0XHRcdGlmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0ZXZlbnRUYXJnZXQgPSBldmVudFRhcmdldC5vZmZzZXRQYXJlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldFN0YXRlRnJvbVZhbHVlICh2YWx1ZSwgb3B0aW9ucywgcGxhY2Vob2xkZXIpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXHRcdGlmICghcGxhY2Vob2xkZXIpIHtcblx0XHRcdHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcblx0XHR9XG5cblx0XHQvLyByZXNldCBpbnRlcm5hbCBmaWx0ZXIgc3RyaW5nXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXG5cdFx0dmFyIHZhbHVlcyA9IHRoaXMuaW5pdFZhbHVlc0FycmF5KHZhbHVlLCBvcHRpb25zKTtcblx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbjtcblx0XHR2YXIgdmFsdWVGb3JTdGF0ZSA9IG51bGw7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpICYmIHZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSB2YWx1ZXNbMF07XG5cdFx0XHR2YWx1ZUZvclN0YXRlID0gdmFsdWVzWzBdW3RoaXMucHJvcHMudmFsdWVLZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gdGhpcy5nZXRGaXJzdEZvY3VzYWJsZU9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpO1xuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IHZhbHVlcy5tYXAoKHYpID0+IHsgcmV0dXJuIHZbdGhpcy5wcm9wcy52YWx1ZUtleV07IH0pLmpvaW4odGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogdmFsdWVGb3JTdGF0ZSxcblx0XHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdHBsYWNlaG9sZGVyOiAhdGhpcy5wcm9wcy5tdWx0aSAmJiB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzWzBdW3RoaXMucHJvcHMubGFiZWxLZXldIDogcGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fTtcblx0fSxcblxuXHRnZXRGaXJzdEZvY3VzYWJsZU9wdGlvbiAgKG9wdGlvbnMpIHtcblxuXHRcdGZvciAodmFyIG9wdGlvbkluZGV4ID0gMDsgb3B0aW9uSW5kZXggPCBvcHRpb25zLmxlbmd0aDsgKytvcHRpb25JbmRleCkge1xuXHRcdFx0aWYgKCFvcHRpb25zW29wdGlvbkluZGV4XS5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9uc1tvcHRpb25JbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGluaXRWYWx1ZXNBcnJheSAodmFsdWVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgPT09ICcnXG5cdFx0XHRcdFx0PyBbXVxuXHRcdFx0XHRcdDogdGhpcy5wcm9wcy5tdWx0aVxuXHRcdFx0XHRcdFx0PyB2YWx1ZXMuc3BsaXQodGhpcy5wcm9wcy5kZWxpbWl0ZXIpXG5cdFx0XHRcdFx0XHQ6IFsgdmFsdWVzIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZXMgIT09IG51bGwgPyBbdmFsdWVzXSA6IFtdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVzLm1hcCgodmFsKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmXG5cdFx0XHRcdFx0XHRvcHRpb25zW2tleV0gJiZcblx0XHRcdFx0XHRcdChvcHRpb25zW2tleV1bdGhpcy5wcm9wcy52YWx1ZUtleV0gPT09IHZhbCB8fFxuXHRcdFx0XHRcdFx0XHR0eXBlb2Ygb3B0aW9uc1trZXldW3RoaXMucHJvcHMudmFsdWVLZXldID09PSAnbnVtYmVyJyAmJlxuXHRcdFx0XHRcdFx0XHRvcHRpb25zW2tleV1bdGhpcy5wcm9wcy52YWx1ZUtleV0udG9TdHJpbmcoKSA9PT0gdmFsXG5cdFx0XHRcdFx0XHQpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9uc1trZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4geyB2YWx1ZTogdmFsLCBsYWJlbDogdmFsIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHNldFZhbHVlICh2YWx1ZSwgZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdGlmIChmb2N1c0FmdGVyVXBkYXRlIHx8IGZvY3VzQWZ0ZXJVcGRhdGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHZhciBuZXdTdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodmFsdWUpO1xuXHRcdG5ld1N0YXRlLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZUNoYW5nZUV2ZW50KG5ld1N0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZSAodmFsdWUpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdH1cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKCk7XG5cdH0sXG5cblx0YWRkVmFsdWUgKHZhbHVlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5jb25jYXQodmFsdWUpKTtcblx0fSxcblxuXHRwb3BWYWx1ZSAoKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5zbGljZSgwLCB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggLSAxKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWUgKHZhbHVlVG9SZW1vdmUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZVRvUmVtb3ZlO1xuXHRcdH0pKTtcblx0fSxcblxuXHRjbGVhclZhbHVlIChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5zZXRWYWx1ZShudWxsKTtcblx0fSxcblxuXHRyZXNldFZhbHVlICgpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWUgPT09ICcnID8gbnVsbCA6IHRoaXMuc3RhdGUudmFsdWUpO1xuXHR9LFxuXG5cdGdldElucHV0Tm9kZSAgKCkge1xuXHRcdHZhciBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcblx0XHRyZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2hhYmxlID8gaW5wdXQgOiBSZWFjdERPTS5maW5kRE9NTm9kZShpbnB1dCk7XG5cdH0sXG5cblx0ZmlyZUNoYW5nZUV2ZW50IChuZXdTdGF0ZSkge1xuXHRcdGlmIChuZXdTdGF0ZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1N0YXRlLnZhbHVlLCBuZXdTdGF0ZS52YWx1ZXMpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd24gKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoICF0aGlzLmRpZFJlYWNoTWF4KCkgKSB7XG5cblx0XHRcdC8vIGZvciB0aGUgbm9uLXNlYXJjaGFibGUgc2VsZWN0LCBjbG9zZSB0aGUgZHJvcGRvd24gd2hlbiBidXR0b24gaXMgY2xpY2tlZFxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuICYmICF0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duT25NZW51IChldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB8fCB0aGlzLmRpZFJlYWNoTWF4KCkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duT25BcnJvdyAoZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmRpZFJlYWNoTWF4KCkgKSB7XG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm90IGZvY3VzZWQsIGhhbmRsZU1vdXNlRG93biB3aWxsIGhhbmRsZSBpdFxuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Rm9jdXMgKGV2ZW50KSB7XG5cdFx0dmFyIG5ld0lzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuIHx8IHRoaXMuX29wZW5BZnRlckZvY3VzO1xuXG5cdFx0aWYgKCB0aGlzLmRpZFJlYWNoTWF4KCkgKSB7XG5cdFx0XHRuZXdJc09wZW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogbmV3SXNPcGVuXG5cdFx0fSwgKCkgPT4ge1xuXHRcdFx0aWYgKG5ld0lzT3Blbikge1xuXHRcdFx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IGZhbHNlO1xuXHRcdGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcblx0XHRcdHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZUlucHV0Qmx1ciAoZXZlbnQpIHtcblx0XHR0aGlzLl9ibHVyVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgfHwgIXRoaXMuaXNNb3VudGVkKCkpIHJldHVybjtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlLFxuXHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9LCA1MCk7XG5cdFx0aWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uQmx1cihldmVudCwgdGhpcy5zdGF0ZS5pbnB1dFZhbHVlKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5VXAgKGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHJldHVybjtcblx0XHRcblx0XHRpZiAoIHRoaXMuZGlkUmVhY2hNYXgoKSApIHtcblx0XHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0XHRjYXNlIDg6IC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmIHRoaXMucHJvcHMuYmFja3NwYWNlUmVtb3Zlcykge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdHRoaXMucG9wVmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdGNhc2UgMjc6IC8vIGVzY2FwZVxuXHRcdFx0XHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXNldFZhbHVlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLmNsZWFyYWJsZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jbGVhclZhbHVlKGV2ZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5RG93biAoZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG5cdFx0aWYgKCAhdGhpcy5kaWRSZWFjaE1heCgpICkge1xuXHRcdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRcdGNhc2UgODogLy8gYmFja3NwYWNlXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgdGhpcy5wcm9wcy5iYWNrc3BhY2VSZW1vdmVzKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5wb3BWYWx1ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRjYXNlIDk6IC8vIHRhYlxuXHRcdFx0XHRcdGlmIChldmVudC5zaGlmdEtleSB8fCAhdGhpcy5zdGF0ZS5pc09wZW4gfHwgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnNlbGVjdEZvY3VzZWRPcHRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3BlbikgcmV0dXJuO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAyNzogLy8gZXNjYXBlXG5cdFx0XHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc2V0VmFsdWUoKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2xlYXJhYmxlKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoZXZlbnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdFx0dGhpcy5mb2N1c1ByZXZpb3VzT3B0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDQwOiAvLyBkb3duXG5cdFx0XHRcdFx0dGhpcy5mb2N1c05leHRPcHRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMTg4OiAvLyAsXG5cdFx0XHRcdFx0aWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgdGhpcy5wcm9wcy5tdWx0aSkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0XHRjYXNlIDg6IC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmIHRoaXMucHJvcHMuYmFja3NwYWNlUmVtb3Zlcykge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdHRoaXMucG9wVmFsdWUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSxcblxuXHQvLyBFbnN1cmVzIHRoYXQgdGhlIGN1cnJlbnRseSBmb2N1c2VkIG9wdGlvbiBpcyBhdmFpbGFibGUgaW4gZmlsdGVyZWRPcHRpb25zLlxuXHQvLyBJZiBub3QsIHJldHVybnMgdGhlIGZpcnN0IGF2YWlsYWJsZSBvcHRpb24uXG5cdF9nZXROZXdGb2N1c2VkT3B0aW9uIChmaWx0ZXJlZE9wdGlvbnMpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gZmlsdGVyZWRPcHRpb25zKSB7XG5cdFx0XHRpZiAoZmlsdGVyZWRPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkgJiYgZmlsdGVyZWRPcHRpb25zW2tleV0gPT09IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gZmlsdGVyZWRPcHRpb25zW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmdldEZpcnN0Rm9jdXNhYmxlT3B0aW9uKGZpbHRlcmVkT3B0aW9ucyk7XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2UgKGV2ZW50KSB7XG5cdFx0Ly8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2Vcblx0XHQvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuXHRcdGlmICh0aGlzLnByb3BzLm9uSW5wdXRDaGFuZ2UpIHtcblx0XHRcdHRoaXMucHJvcHMub25JbnB1dENoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9ucyAoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0xvYWRpbmc6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoKHRoaXMucHJvcHMudmFsdWUgfHwgJycpLCB7IGlzTG9hZGluZzogZmFsc2UgfSwgKCkgPT4ge1xuXHRcdFx0Ly8gdXBkYXRlIHdpdGggbmV3IG9wdGlvbnMgYnV0IGRvbid0IGZvY3VzXG5cdFx0XHR0aGlzLnNldFZhbHVlKHRoaXMucHJvcHMudmFsdWUsIGZhbHNlKTtcblx0XHR9KTtcblx0fSxcblxuXHRsb2FkQXN5bmNPcHRpb25zIChpbnB1dCA9ICcnLCBzdGF0ZSwgY2FsbGJhY2spIHtcblx0XHR2YXIgdGhpc1JlcXVlc3RJZCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQrKztcblx0XHRpZiAodGhpcy5wcm9wcy5jYWNoZUFzeW5jUmVzdWx0cykge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPD0gaW5wdXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIGNhY2hlS2V5ID0gaW5wdXQuc2xpY2UoMCwgaSk7XG5cdFx0XHRcdGlmICh0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldICYmIChpbnB1dCA9PT0gY2FjaGVLZXkgfHwgdGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XS5jb21wbGV0ZSkpIHtcblx0XHRcdFx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0ub3B0aW9ucztcblx0XHRcdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMpO1xuXHRcdFx0XHRcdHZhciBuZXdTdGF0ZSA9IHtcblx0XHRcdFx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIHN0YXRlKSB7XG5cdFx0XHRcdFx0XHRpZiAoc3RhdGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRcdFx0aWYgKGNhbGxiYWNrKSBjYWxsYmFjay5jYWxsKHRoaXMsIG5ld1N0YXRlKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgb3B0aW9uc1Jlc3BvbnNlSGFuZGxlciA9IChlcnIsIGRhdGEpID0+IHtcblx0XHRcdGlmIChlcnIpIHRocm93IGVycjtcblx0XHRcdGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG5cdFx0XHRcdHRoaXMuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXNSZXF1ZXN0SWQgIT09IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhkYXRhLm9wdGlvbnMpO1xuXHRcdFx0dmFyIG5ld1N0YXRlID0ge1xuXHRcdFx0XHRvcHRpb25zOiBkYXRhLm9wdGlvbnMsXG5cdFx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdH07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gc3RhdGUpIHtcblx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRpZiAoY2FsbGJhY2spIGNhbGxiYWNrLmNhbGwodGhpcywgbmV3U3RhdGUpO1xuXHRcdH07XG5cblx0XHR2YXIgYXN5bmNPcHRzID0gdGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIG9wdGlvbnNSZXNwb25zZUhhbmRsZXIpO1xuXG5cdFx0aWYgKGFzeW5jT3B0cyAmJiB0eXBlb2YgYXN5bmNPcHRzLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGFzeW5jT3B0cy50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRcdG9wdGlvbnNSZXNwb25zZUhhbmRsZXIobnVsbCwgZGF0YSlcblx0XHRcdH0sIChlcnIpID0+IHtcblx0XHRcdFx0b3B0aW9uc1Jlc3BvbnNlSGFuZGxlcihlcnIpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0ZmlsdGVyT3B0aW9ucyAob3B0aW9ucywgdmFsdWVzKSB7XG5cdFx0dmFyIGZpbHRlclZhbHVlID0gdGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZztcblx0XHR2YXIgZXhjbHVkZSA9ICh2YWx1ZXMgfHwgdGhpcy5zdGF0ZS52YWx1ZXMpLm1hcChmdW5jdGlvbihpKSB7XG5cdFx0XHRyZXR1cm4gaS52YWx1ZTtcblx0XHR9KTtcblx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucywgZmlsdGVyVmFsdWUsIGV4Y2x1ZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyT3B0aW9uID0gZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMubXVsdGkgJiYgZXhjbHVkZS5pbmRleE9mKG9wW3RoaXMucHJvcHMudmFsdWVLZXldKSA+IC0xKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcblx0XHRcdFx0dmFyIHZhbHVlVGVzdCA9IFN0cmluZyhvcFt0aGlzLnByb3BzLnZhbHVlS2V5XSk7XG5cdFx0XHRcdHZhciBsYWJlbFRlc3QgPSBTdHJpbmcob3BbdGhpcy5wcm9wcy5sYWJlbEtleV0pO1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5pZ25vcmVDYXNlKSB7XG5cdFx0XHRcdFx0dmFsdWVUZXN0ID0gdmFsdWVUZXN0LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0bGFiZWxUZXN0ID0gbGFiZWxUZXN0LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0ZmlsdGVyVmFsdWUgPSBmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAhZmlsdGVyVmFsdWUgfHwgKHRoaXMucHJvcHMubWF0Y2hQb3MgPT09ICdzdGFydCcpID8gKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMCkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LmluZGV4T2YoZmlsdGVyVmFsdWUpID49IDApXG5cdFx0XHRcdCk7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIChvcHRpb25zIHx8IFtdKS5maWx0ZXIoZmlsdGVyT3B0aW9uLCB0aGlzKTtcblx0XHR9XG5cdH0sXG5cblx0c2VsZWN0Rm9jdXNlZE9wdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2VsZWN0VmFsdWUodGhpcy5zdGF0ZS5pbnB1dFZhbHVlKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pO1xuXHRcdH1cblx0fSxcblxuXHRmb2N1c09wdGlvbiAob3ApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRPcHRpb246IG9wXG5cdFx0fSk7XG5cdH0sXG5cblx0Zm9jdXNOZXh0T3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ25leHQnKTtcblx0fSxcblxuXHRmb2N1c1ByZXZpb3VzT3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ3ByZXZpb3VzJyk7XG5cdH0sXG5cblx0Zm9jdXNBZGphY2VudE9wdGlvbiAoZGlyKSB7XG5cdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IHRydWU7XG5cdFx0dmFyIG9wcyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmZpbHRlcihmdW5jdGlvbihvcCkge1xuXHRcdFx0cmV0dXJuICFvcC5kaXNhYmxlZDtcblx0XHR9KTtcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IG9wc1tkaXIgPT09ICduZXh0JyA/IDAgOiBvcHMubGVuZ3RoIC0gMV1cblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA9PT0gb3BzW2ldKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IGk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IG9wc1swXTtcblx0XHRpZiAoZGlyID09PSAnbmV4dCcgJiYgZm9jdXNlZEluZGV4ID4gLTEgJiYgZm9jdXNlZEluZGV4IDwgb3BzLmxlbmd0aCAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4ICsgMV07XG5cdFx0fSBlbHNlIGlmIChkaXIgPT09ICdwcmV2aW91cycpIHtcblx0XHRcdGlmIChmb2N1c2VkSW5kZXggPiAwKSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4IC0gMV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW29wcy5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbiAob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRidWlsZE1lbnUgKCkge1xuXHRcdHZhciBmb2N1c2VkVmFsdWUgPSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPyB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb25bdGhpcy5wcm9wcy52YWx1ZUtleV0gOiBudWxsO1xuXHRcdHZhciByZW5kZXJMYWJlbCA9IHRoaXMucHJvcHMub3B0aW9uUmVuZGVyZXI7XG5cdFx0aWYgKCFyZW5kZXJMYWJlbCkgcmVuZGVyTGFiZWwgPSAob3ApID0+IG9wW3RoaXMucHJvcHMubGFiZWxLZXldO1xuXHRcdGlmICh0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb2N1c2VkVmFsdWUgPSBmb2N1c2VkVmFsdWUgPT0gbnVsbCA/IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zWzBdIDogZm9jdXNlZFZhbHVlO1xuXHRcdH1cblx0XHQvLyBBZGQgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIGZpbHRlcmVkIG9wdGlvbnMgaW4gbGFzdCByZXNvcnRcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMuc3RhdGUuaW5wdXRWYWx1ZS50cmltKCkpIHtcblx0XHRcdHZhciBpbnB1dFZhbHVlID0gdGhpcy5zdGF0ZS5pbnB1dFZhbHVlO1xuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMuc2xpY2UoKTtcblx0XHRcdHZhciBuZXdPcHRpb24gPSB0aGlzLnByb3BzLm5ld09wdGlvbkNyZWF0b3IgPyB0aGlzLnByb3BzLm5ld09wdGlvbkNyZWF0b3IoaW5wdXRWYWx1ZSkgOiB7XG5cdFx0XHRcdHZhbHVlOiBpbnB1dFZhbHVlLFxuXHRcdFx0XHRsYWJlbDogaW5wdXRWYWx1ZSxcblx0XHRcdFx0Y3JlYXRlOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0b3B0aW9ucy51bnNoaWZ0KG5ld09wdGlvbik7XG5cdFx0fVxuXHRcdHZhciBvcHMgPSBPYmplY3Qua2V5cyhvcHRpb25zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHR2YXIgb3AgPSBvcHRpb25zW2tleV07XG5cdFx0XHR2YXIgaXNTZWxlY3RlZCA9IHRoaXMuc3RhdGUudmFsdWUgPT09IG9wW3RoaXMucHJvcHMudmFsdWVLZXldO1xuXHRcdFx0dmFyIGlzRm9jdXNlZCA9IGZvY3VzZWRWYWx1ZSA9PT0gb3BbdGhpcy5wcm9wcy52YWx1ZUtleV07XG5cdFx0XHR2YXIgb3B0aW9uQ2xhc3MgPSBjbGFzc2VzKHtcblx0XHRcdFx0J1NlbGVjdC1vcHRpb24nOiB0cnVlLFxuXHRcdFx0XHQnaXMtc2VsZWN0ZWQnOiBpc1NlbGVjdGVkLFxuXHRcdFx0XHQnaXMtZm9jdXNlZCc6IGlzRm9jdXNlZCxcblx0XHRcdFx0J2lzLWRpc2FibGVkJzogb3AuZGlzYWJsZWRcblx0XHRcdH0pO1xuXHRcdFx0dmFyIHJlZiA9IGlzRm9jdXNlZCA/ICdmb2N1c2VkJyA6IG51bGw7XG5cdFx0XHR2YXIgbW91c2VFbnRlciA9IHRoaXMuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VMZWF2ZSA9IHRoaXMudW5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBtb3VzZURvd24gPSB0aGlzLnNlbGVjdFZhbHVlLmJpbmQodGhpcywgb3ApO1xuXHRcdFx0dmFyIG9wdGlvblJlc3VsdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5vcHRpb25Db21wb25lbnQsIHtcblx0XHRcdFx0a2V5OiAnb3B0aW9uLScgKyBvcFt0aGlzLnByb3BzLnZhbHVlS2V5XSxcblx0XHRcdFx0Y2xhc3NOYW1lOiBvcHRpb25DbGFzcyxcblx0XHRcdFx0cmVuZGVyRnVuYzogcmVuZGVyTGFiZWwsXG5cdFx0XHRcdG1vdXNlRW50ZXI6IG1vdXNlRW50ZXIsXG5cdFx0XHRcdG1vdXNlTGVhdmU6IG1vdXNlTGVhdmUsXG5cdFx0XHRcdG1vdXNlRG93bjogbW91c2VEb3duLFxuXHRcdFx0XHRjbGljazogbW91c2VEb3duLFxuXHRcdFx0XHRhZGRMYWJlbFRleHQ6IHRoaXMucHJvcHMuYWRkTGFiZWxUZXh0LFxuXHRcdFx0XHRvcHRpb246IG9wLFxuXHRcdFx0XHRyZWY6IHJlZlxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gb3B0aW9uUmVzdWx0O1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0aWYgKG9wcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBvcHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBub1Jlc3VsdHNUZXh0LCBwcm9tcHRDbGFzcztcblx0XHRcdGlmICh0aGlzLmlzTG9hZGluZygpKSB7XG5cdFx0XHRcdHByb21wdENsYXNzID0gJ1NlbGVjdC1zZWFyY2hpbmcnO1xuXHRcdFx0XHRub1Jlc3VsdHNUZXh0ID0gdGhpcy5wcm9wcy5zZWFyY2hpbmdUZXh0O1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlLmlucHV0VmFsdWUgfHwgIXRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHRcdHByb21wdENsYXNzID0gJ1NlbGVjdC1ub3Jlc3VsdHMnO1xuXHRcdFx0XHRub1Jlc3VsdHNUZXh0ID0gdGhpcy5wcm9wcy5ub1Jlc3VsdHNUZXh0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJvbXB0Q2xhc3MgPSAnU2VsZWN0LXNlYXJjaC1wcm9tcHQnO1xuXHRcdFx0XHRub1Jlc3VsdHNUZXh0ID0gdGhpcy5wcm9wcy5zZWFyY2hQcm9tcHRUZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17cHJvbXB0Q2xhc3N9PlxuXHRcdFx0XHRcdHtub1Jlc3VsdHNUZXh0fVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU9wdGlvbkxhYmVsQ2xpY2sgICh2YWx1ZSwgZXZlbnQpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5vbk9wdGlvbkxhYmVsQ2xpY2spIHtcblx0XHRcdHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrKHZhbHVlLCBldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdGlzTG9hZGluZyAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuaXNMb2FkaW5nIHx8IHRoaXMuc3RhdGUuaXNMb2FkaW5nO1xuXHR9LFxuXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIHNlbGVjdENsYXNzID0gY2xhc3NlcygnU2VsZWN0JywgdGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcblx0XHRcdCdTZWxlY3QtLW11bHRpJzogdGhpcy5wcm9wcy5tdWx0aSxcblx0XHRcdCdpcy1zZWFyY2hhYmxlJzogdGhpcy5wcm9wcy5zZWFyY2hhYmxlLFxuXHRcdFx0J2lzLW9wZW4nOiB0aGlzLnN0YXRlLmlzT3Blbixcblx0XHRcdCdpcy1mb2N1c2VkJzogdGhpcy5zdGF0ZS5pc0ZvY3VzZWQsXG5cdFx0XHQnaXMtbG9hZGluZyc6IHRoaXMuaXNMb2FkaW5nKCksXG5cdFx0XHQnaXMtZGlzYWJsZWQnOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuXHRcdFx0J2hhcy12YWx1ZSc6IHRoaXMuc3RhdGUudmFsdWUsXG5cdFx0XHQnaGFzLXJlYWNoZWQtbWF4JyA6IHRoaXMuZGlkUmVhY2hNYXgoKVxuXHRcdH0pO1xuXHRcdHZhciB2YWx1ZSA9IFtdO1xuXHRcdGlmICh0aGlzLnByb3BzLm11bHRpKSB7XG5cdFx0XHR0aGlzLnN0YXRlLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0XHR2YXIgb25PcHRpb25MYWJlbENsaWNrID0gdGhpcy5oYW5kbGVPcHRpb25MYWJlbENsaWNrLmJpbmQodGhpcywgdmFsKTtcblx0XHRcdFx0dmFyIG9uUmVtb3ZlID0gdGhpcy5yZW1vdmVWYWx1ZS5iaW5kKHRoaXMsIHZhbCk7XG5cdFx0XHRcdHZhciB2YWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy52YWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogdmFsLnZhbHVlLFxuXHRcdFx0XHRcdG9wdGlvbjogdmFsLFxuXHRcdFx0XHRcdHJlbmRlcmVyOiB0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIsXG5cdFx0XHRcdFx0b3B0aW9uTGFiZWxDbGljazogISF0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IG9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvblJlbW92ZTogb25SZW1vdmUsXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHZhbHVlLnB1c2godmFsdWVDb21wb25lbnQpO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgKCF0aGlzLnByb3BzLm11bHRpIHx8ICF2YWx1ZS5sZW5ndGgpKSB7XG5cdFx0XHR2YXIgdmFsID0gdGhpcy5zdGF0ZS52YWx1ZXNbMF0gfHwgbnVsbDtcblx0XHRcdGlmICh0aGlzLnByb3BzLnZhbHVlUmVuZGVyZXIgJiYgISF0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdFx0dmFsdWUucHVzaCg8VmFsdWVcblx0XHRcdFx0XHRcdGtleT17MH1cblx0XHRcdFx0XHRcdG9wdGlvbj17dmFsfVxuXHRcdFx0XHRcdFx0cmVuZGVyZXI9e3RoaXMucHJvcHMudmFsdWVSZW5kZXJlcn1cblx0XHRcdFx0XHRcdGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgc2luZ2xlVmFsdWVDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuc2luZ2xlVmFsdWVDb21wb25lbnQsIHtcblx0XHRcdFx0XHRrZXk6ICdwbGFjZWhvbGRlcicsXG5cdFx0XHRcdFx0dmFsdWU6IHZhbCxcblx0XHRcdFx0XHRwbGFjZWhvbGRlcjogdGhpcy5zdGF0ZS5wbGFjZWhvbGRlclxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dmFsdWUucHVzaChzaW5nbGVWYWx1ZUNvbXBvbmVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gbG9hZGluZyBzcGlubmVyXG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzLmlzTG9hZGluZygpID8gKFxuXHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWxvYWRpbmctem9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L3NwYW4+XG5cdFx0KSA6IG51bGw7XG5cblx0XHQvLyBjbGVhciBcInhcIiBidXR0b25cblx0XHR2YXIgY2xlYXIgPSAodGhpcy5wcm9wcy5jbGVhcmFibGUgJiYgdGhpcy5zdGF0ZS52YWx1ZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCAmJiAhKHRoaXMuaXNMb2FkaW5nKCkpKSA/IChcblx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1jbGVhci16b25lXCIgdGl0bGU9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubXVsdGkgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IG9uTW91c2VEb3duPXt0aGlzLmNsZWFyVmFsdWV9IG9uVG91Y2hFbmQ9e3RoaXMuY2xlYXJWYWx1ZX0gb25DbGljaz17dGhpcy5jbGVhclZhbHVlfT5cblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyXCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiAnJnRpbWVzOycgfX0gLz5cblx0XHRcdDwvc3Bhbj5cblx0XHQpIDogbnVsbDtcblxuXHRcdC8vIGluZGljYXRvciBhcnJvd1xuXHRcdHZhciBhcnJvdyA9IChcblx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvdy16b25lXCIgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3duT25BcnJvd30+XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3d9IC8+XG5cdFx0XHQ8L3NwYW4+XG5cdFx0KTtcblxuXHRcdHZhciBtZW51O1xuXHRcdHZhciBtZW51UHJvcHM7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRtZW51UHJvcHMgPSB7XG5cdFx0XHRcdHJlZjogJ21lbnUnLFxuXHRcdFx0XHRjbGFzc05hbWU6ICdTZWxlY3QtbWVudScsXG5cdFx0XHRcdG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZU1vdXNlRG93bk9uTWVudVxuXHRcdFx0fTtcblx0XHRcdG1lbnUgPSAoXG5cdFx0XHRcdDxkaXYgcmVmPVwic2VsZWN0TWVudUNvbnRhaW5lclwiIGNsYXNzTmFtZT1cIlNlbGVjdC1tZW51LW91dGVyXCI+XG5cdFx0XHRcdFx0PGRpdiB7Li4ubWVudVByb3BzfT57dGhpcy5idWlsZE1lbnUoKX08L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHZhciBpbnB1dDtcblx0XHR2YXIgaW5wdXRQcm9wcyA9IHtcblx0XHRcdHJlZjogJ2lucHV0Jyxcblx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1pbnB1dCAnICsgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5jbGFzc05hbWUgfHwgJycpLFxuXHRcdFx0dGFiSW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXggfHwgMCxcblx0XHRcdG9uRm9jdXM6IHRoaXMuaGFuZGxlSW5wdXRGb2N1cyxcblx0XHRcdG9uQmx1cjogdGhpcy5oYW5kbGVJbnB1dEJsdXJcblx0XHR9O1xuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLnByb3BzLmlucHV0UHJvcHMpIHtcblx0XHRcdGlmICh0aGlzLnByb3BzLmlucHV0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdjbGFzc05hbWUnKSB7XG5cdFx0XHRcdGlucHV0UHJvcHNba2V5XSA9IHRoaXMucHJvcHMuaW5wdXRQcm9wc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSkge1xuXHRcdFx0XHRpbnB1dCA9IDxJbnB1dCB2YWx1ZT17dGhpcy5zdGF0ZS5pbnB1dFZhbHVlfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX0gbWluV2lkdGg9XCI1XCIgey4uLmlucHV0UHJvcHN9IC8+O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhdGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRpbnB1dCA9IDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWlucHV0XCI+Jm5ic3A7PC9kaXY+O1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IHJlZj1cIndyYXBwZXJcIiBjbGFzc05hbWU9e3NlbGVjdENsYXNzfT5cblx0XHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiByZWY9XCJ2YWx1ZVwiIG5hbWU9e3RoaXMucHJvcHMubmFtZX0gdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9IGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfSAvPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1jb250cm9sXCIgcmVmPVwiY29udHJvbFwiIG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbktleVVwPXt0aGlzLmhhbmRsZUtleVVwfSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdFx0e2lucHV0fVxuXHRcdFx0XHRcdHtsb2FkaW5nfVxuXHRcdFx0XHRcdHtjbGVhcn1cblx0XHRcdFx0XHR7YXJyb3d9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHR7bWVudX1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuIl19
