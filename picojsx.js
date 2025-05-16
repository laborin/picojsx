/**
 * @fileoverview PicoJSX: A lightweight frontend library inspired by Nano JSX
 * for creating user interfaces using JSX or `h` function calls.
 * Features component state, lifecycle methods, global store, and automatic/manual updates.
 * @version 1.0.0
 */

/**
 * PicoJSX IIFE (Immediately Invoked Function Expression) to encapsulate the library logic.
 * @returns {object} The public API of the PicoJSX library.
 */
const PicoJSX = (() => {
	/**
	 * A unique symbol used by the `h` function to identify JSX Fragments.
	 * Allows returning multiple elements from a component render method without needing a wrapper.
	 * @example <>{child1}{child2}</>
	 * @type {symbol}
	 */
	const Fragment = Symbol('PicoFragment');

	/**
	 * Cleans up a DOM node and its children, triggering `componentWillUnmount` on component instances.
	 * IMPORTANT: It avoids unmounting the specific instance passed in `updatingInstance`,
	 * which prevents a component from unmounting itself during its own update.
	 *
	 * @param {Node} node - The DOM node to dispose of.
	 * @param {Component|null} [updatingInstance=null] - The component instance currently performing an update,
	 *   which should not have its own componentWillUnmount triggered by this disposal process.
	 */
	function disposeNode(node, updatingInstance = null) {
		const instance = node._PicoInstance;

		if (instance && instance !== updatingInstance) {
			if (instance._isMounted && !instance._isUnmounted) {
				if (typeof instance.componentWillUnmount === 'function') {
					instance.componentWillUnmount();
				}
				instance._isUnmounted = true; // Mark as unmounted
				instance._isMounted = false;  // Mark as not mounted
			}
		}

		if (node.childNodes) {
			Array.from(node.childNodes).forEach(child => disposeNode(child, updatingInstance));
		}
	}

	/**
	 * Applies props (attributes, event listeners, styles, className, etc.) to a DOM element.
	 * Updates efficiently by comparing new props to old props.
	 * Automatically translates `className` prop to `class` attribute.
	 *
	 * @param {Element} element - The DOM element to apply props to.
	 * @param {object} props - The new props object.
	 * @param {object} [oldProps={}] - The previous props object for comparison.
	 */
	function applyProps(element, props, oldProps = {}) {
		// Create copies to safely modify for className -> class translation
		const currentProps = { ...props };
		if (currentProps.className !== undefined) {
			// Handle className -> class
			currentProps.class = currentProps.className; 
			delete currentProps.className; 
		}

		const previousProps = { ...oldProps };
		if (previousProps.className !== undefined) {
			// Also transform old props for correct comparison
			previousProps.class = previousProps.className;
			delete previousProps.className;
		}

		// Remove attributes/event listeners from previousProps that are not in currentProps
		for (let name in previousProps) { 
			// Ignore special props and only remove if not present in current props
			if (name !== 'children' && name !== 'key' && name !== '_PicoInstance' && !(name in currentProps)) { 
				if (name.startsWith('on') && typeof previousProps[name] === 'function') {
					element.removeEventListener(name.substring(2).toLowerCase(), previousProps[name]);
				} else if (name === 'ref') {
					// Clean up old ref
					if (typeof previousProps[name] === 'function') previousProps[name](null);
					else if (previousProps[name]?.current) previousProps[name].current = null;
				} else {
					element.removeAttribute(name); // Handles standard attributes like 'id', 'value', etc. and also 'class' if needed.
				}
			}
		}

		// Set/update attributes/event listeners from currentProps
		for (let name in currentProps) {
			// Skip special props ('className' was already handled)
			if (name === 'children' || name === 'key' || name === '_PicoInstance') continue;

			const value = currentProps[name];
			const oldValue = previousProps[name]; // Compare with the transformed previousProps value

			// Optimization: only update if value changed, but always update ref
			if (value === oldValue && name !== 'ref') continue;

			if (name.startsWith('on') && typeof value === 'function') {
				// Event listener
				const eventName = name.substring(2).toLowerCase();
				if (typeof oldValue === 'function') element.removeEventListener(eventName, oldValue);
				element.addEventListener(eventName, value);
			} else if (name === 'dangerouslySetInnerHTML') {
				// Handle raw HTML insertion
				if (value?.__html !== undefined && value.__html !== oldValue?.__html) element.innerHTML = value.__html;
				else if (!value && oldValue?.__html !== undefined) element.innerHTML = '';
			} else if (name === 'style') {
				// Style prop can be string or object
				if (typeof value === 'string') {
					if (element.style.cssText !== value) element.style.cssText = value;
				} else if (typeof value === 'object') {
					if (typeof oldValue !== 'object') element.style.cssText = ''; // Clear if changing from string/undefined
					for (const styleName in oldValue) {
						if (!(styleName in value)) element.style[styleName] = '';
					}
					for (const styleName in value) {
						if (element.style[styleName] !== value[styleName]) element.style[styleName] = value[styleName];
					}
				} else if (oldValue) { // Clear style if new value is null/undefined
					element.style.cssText = '';
				}
			} else if (name === 'ref') {
				// Handle refs (callback or object refs)
				if (oldValue && oldValue !== value) {
					// Cleanup old ref before setting new one
					if (typeof oldValue === 'function') oldValue(null);
					else if (oldValue?.current) oldValue.current = null;
				}
				if (typeof value === 'function') value(element);
				else if (value?.current !== undefined) value.current = element;
			} else if (value === undefined || value === null || value === false) {
				// Remove attribute for falsey values (but not 0)
				if (element.hasAttribute(name)) element.removeAttribute(name);
			} else {
				// Standard attribute (handles 'class' as well if passed directly)
				const attrValue = value === true ? '' : String(value);
				if (element.getAttribute(name) !== attrValue) {
					element.setAttribute(name, attrValue);
				}
			}
		}
	}

	/**
	 * Recursively builds DOM nodes from renderable input (JSX output, components, strings, etc.).
	 * Also collects component instances that need their `componentDidMount` called.
	 *
	 * @param {*} input - The renderable input (from h() or component.render()).
	 * @param {Array<Component>} mountQueue - Array to push component instances into for later mounting.
	 * @returns {Node} The created DOM node (Element, TextNode, or DocumentFragment).
	 * @protected
	 */
	function _buildDomAndCollectMounts(input, mountQueue) {
		// Handle simple cases: null, boolean, string, number
		if (input == null || typeof input === 'boolean') return document.createTextNode('');
		if (typeof input === 'string' || typeof input === 'number') return document.createTextNode(String(input));

		if (Array.isArray(input)) {
			// If input is an array (e.g., children), process each item
			const fragment = document.createDocumentFragment();
			input.flat().forEach(child => fragment.appendChild(_buildDomAndCollectMounts(child, mountQueue)));
			return fragment;
		}

		// Handle Component Instance
		if (input?.constructor?.isPicoClassComponent) {
			const instance = input;
			// If _dom is not set, this is the first render pass for this instance.
			// Call its render() method and recursively build the DOM for that output.
			if (!instance._dom) {
				const renderOutput = instance.render();
				instance._dom = _buildDomAndCollectMounts(renderOutput, mountQueue);
				// Tag the instance's root DOM node(s) with a reference to the instance
				if (instance._dom instanceof Node) {
					instance._dom._PicoInstance = instance;
				}
			}
			// Queue for mounting if needed
			if (!instance._isMounted && !instance._isUnmounted) {
				if (typeof instance.componentDidMount === 'function' && !mountQueue.includes(instance)) {
					mountQueue.push(instance);
				}
			}
			return instance._dom; // Return the DOM associated with the instance
		}

		// Handle object structure from h() for elements/fragments, or functional component results
		if (typeof input === 'object' && input !== null) {
			// If it's already a DOM Node (e.g., from dangerouslySetInnerHTML or external source)
			if (input instanceof Node) return input; // Just return it as is

			// Assume { type, props, children } structure from h()
			const { type, props, children } = input;

			if (type === Fragment) {
				// Handle Fragment: process children into a DocumentFragment
				const fragment = document.createDocumentFragment();
				(children || []).flat().forEach(child => fragment.appendChild(_buildDomAndCollectMounts(child, mountQueue)));
				return fragment;
			}

			if (typeof type === 'string') { // Standard HTML element
				const element = document.createElement(type);
				if (props) applyProps(element, props); // Apply props
				// Build and append children
				(children || []).flat().forEach(child => element.appendChild(_buildDomAndCollectMounts(child, mountQueue)));
				if (props?.ref) {
					// Refs are handled in applyProps, but this is a double-check/alternative?
					// TODO: Review if ref handling here is redundant with applyProps
					if (typeof props.ref === 'function') props.ref(element);
					else if (props.ref?.current !== undefined) props.ref.current = element;
				}
				return element;
			}
		}

		// Warn if we encounter an input type we don't know how to handle
		console.warn('PicoJSX: Cannot build DOM for unexpected type:', input);
		return document.createTextNode(`[Err: Unknown input type ${typeof input}]`);
	}

	/**
	 * The hyperscript function (or JSX factory). This is what Babel/transpilers call.
	 * It transforms `h('div', { id: 'foo' }, ...)` or `<div id="foo">...</div>` calls.
	 * 
	 * - For HTML tags ('div', 'span', etc.): Returns a simple object `{ type, props, children }`.
	 * - For PicoJSX Class Components: Returns `new ComponentClass(props)`.
	 * - For Functional Components: Calls the function `FuncComp(props, children)` and returns its result.
	 * - For Fragment: Returns `{ type: Fragment, props, children }`.
	 * 
	 * Note: Does NOT create DOM nodes directly. That's `_buildDomAndCollectMounts`'s job.
	 *
	 * @param {string|Function|symbol} type - Element type ('div', Component class, functional component, Fragment symbol).
	 * @param {object|null} props - Properties/attributes.
	 * @param {...*} children - Child elements.
	 * @returns {Component|object|*} The component instance, a descriptive object for `_buildDomAndCollectMounts`, or functional component output.
	 */
	function h(type, props, ...children) {
		props = props || {};
		// Children are passed as an array to functional components if needed.
		// `_buildDomAndCollectMounts` will handle flattening if it processes an array of children later.
		// Example: `h(MyFuncComp, { title: 'Hi' }, child1, child2)` calls `MyFuncComp({ title: 'Hi' }, [child1, child2])`

		if (typeof type === 'function') {
			if (type.isPicoClassComponent) {
				// Class Component: return a new instance.
				// `_buildDomAndCollectMounts` will later call `instance.render()`.
				return new type(props);
			} else {
				// Functional Component: execute it right away. 
				// Its output (renderable stuff) will be processed by `_buildDomAndCollectMounts`.
				return type(props, children); // Pass children as the second argument (array)
			}
		}
		// For standard HTML elements and Fragments, return the descriptive object.
		return { type, props, children };
	}

	/**
	 * Base class for PicoJSX stateful components.
	 * Provides state management, lifecycle methods, and update mechanism.
	 * @class Component
	 */
	class Component {
		/**
		 * Static flag to identify PicoJSX class components.
		 * @static
		 * @type {boolean}
		 */
		static isPicoClassComponent = true;

		/**
		 * Creates a component instance.
		 * @param {object} [props={}] - The properties passed to the component.
		 * @memberof Component
		 */
		constructor(props) {
			/** @type {object} Properties passed to the component. */
			this.props = props || {};
			/** @type {object} The component's internal state. */
			this.state = this.state || {};
			/** @protected @type {Node|null} Reference to the root DOM node or DocumentFragment rendered. */
			this._dom = null;
			/** 
			 * @protected @type {boolean} Lifecycle state: True after componentDidMount runs (or is scheduled). 
			 * Together with _isUnmounted, represents 3 states:
			 * - (false, false): Initial, before mounting.
			 * - (true, false): Mounted.
			 * - (false, true): Unmounted.
			 */
			this._isMounted = false;
			/** @protected @type {boolean} Lifecycle state: True after componentWillUnmount runs. See _isMounted. */
			this._isUnmounted = false;
			/** @protected @type {object|null} Stores previous props for `componentDidUpdate`. */
			this._prevProps = null;
			/** @protected @type {object|null} Stores previous state for `componentDidUpdate`. */
			this._prevState = null;
			/** @protected @type {Function|null} Stores the unsubscribe function from `store.subscribe`. */
			this._unsubscribeStore = null;
			/** @type {boolean} If true, `setState` automatically calls `update()`. Default is `true`. */
			this.autoUpdate = true;
			/** @protected @type {Comment|null} Start marker for fragment roots. */
			this._startMarker = null;
			/** @protected @type {Comment|null} End marker for fragment roots. */
			this._endMarker = null;
		}

		/**
		 * Updates the component's state and potentially triggers a UI update based on `autoUpdate`.
		 * @param {object|Function} updater - An object to merge with state, or a function `(prevState, props) => newStateChanges`.
		 * @memberof Component
		 */
		setState(updater) {
			this._prevState = { ...(this._prevState || this.state) }; // Store previous state for componentDidUpdate
			if (typeof updater === 'function') {
				Object.assign(this.state, updater(this.state, this.props));
			} else {
				Object.assign(this.state, updater);
			}
			if (this.autoUpdate) {
				this.update(); // Trigger re-render if autoUpdate is on
			}
		}

		/**
		 * Manually triggers a re-render of the component. Handles focus preservation and updates for
		 * both single-element roots and fragment roots (using markers).
		 * @memberof Component
		 */
		update() {
			// Don't update if not mounted, already unmounted, or has no DOM representation
			if (!this._isMounted || this._isUnmounted || (!this._dom && !this._startMarker)) {
				if (this._isUnmounted) console.warn("PicoJSX: update() called on an explicitly unmounted component.", this);
				else if (!this._dom && !this._startMarker) console.warn("PicoJSX: update() called on component with no DOM or markers.", this);
				else if (!this._isMounted) console.warn("PicoJSX: update() called on component not marked as mounted.", this);
				return;
			}

			let parentNode = null;
			const isFragmentRoot = !!(this._startMarker && this._endMarker);

			if (isFragmentRoot) {
				parentNode = this._startMarker.parentNode;
				if (!parentNode || parentNode !== this._endMarker.parentNode) {
					console.warn("PicoJSX: Markers detached or have different parents during update. Aborting update.", this);
					return;
				}
			} else if (this._dom?.parentNode) {
				parentNode = this._dom.parentNode;
			}

			if (!parentNode) {
				console.warn("PicoJSX: update() called on detached component.", this);
				return;
			}

			this._prevProps = { ...this.props };
			const prevStateForUpdate = this._prevState || this.state;
			const oldDomContent = this._dom;
			const oldStartMarker = this._startMarker; // Could be null
			const oldEndMarker = this._endMarker;

			let focusedElementId = null;
			let selectionStart = null;
			let selectionEnd = null;
			const activeElement = document.activeElement;
			// Attempt to preserve focus within the component's boundary
			if (activeElement) {
				let isInBoundary = false;
				if (isFragmentRoot) {
					// Check if focused element is between the markers
					isInBoundary = activeElement !== this._startMarker && activeElement !== this._endMarker &&
						this._startMarker.compareDocumentPosition(activeElement) & Node.DOCUMENT_POSITION_FOLLOWING &&
						this._endMarker.compareDocumentPosition(activeElement) & Node.DOCUMENT_POSITION_PRECEDING;
				} else if (this._dom?.contains(activeElement)) {
					// Check if focused element is within the component's root DOM node
					isInBoundary = true;
				}
				if (isInBoundary && activeElement.id) {
					focusedElementId = activeElement.id;
					// Try to save cursor position too, if applicable
					if (typeof activeElement.selectionStart === 'number') {
						selectionStart = activeElement.selectionStart;
						selectionEnd = activeElement.selectionEnd;
					}
				}
			}

			// Render the new DOM structure
			const childrenMountQueue = [];
			const newRenderOutput = this.render();
			const newDom = _buildDomAndCollectMounts(newRenderOutput, childrenMountQueue);

			if (isFragmentRoot) {
				// Update for fragment root: remove old nodes between markers, insert new ones
				let currentNode = oldStartMarker.nextSibling;
				while (currentNode && currentNode !== oldEndMarker) {
					const next = currentNode.nextSibling;
					disposeNode(currentNode, this); // Clean up components within
					parentNode.removeChild(currentNode);
					currentNode = next;
				}
				parentNode.insertBefore(newDom, oldEndMarker);
				// Keep _dom as a reference, maybe useful later? But markers are key.
				this._dom = newDom instanceof DocumentFragment ? newDom : document.createDocumentFragment();
				if (!(newDom instanceof DocumentFragment) && newDom) this._dom.appendChild(newDom);
			} else {
				// Update for single element root: replace the old DOM node with the new one
				if (oldDomContent) disposeNode(oldDomContent, this); // Clean up old content
				parentNode.replaceChild(newDom, oldDomContent);
				this._dom = newDom;
				this._startMarker = null;
				this._endMarker = null;
			}

			// Re-tag the new root DOM node if it's an element
			if (this._dom instanceof Element) {
				this._dom._PicoInstance = this;
			}

			// Process any new child components that need mounting
			const uniqueChildrenMountQueue = [...new Set(childrenMountQueue)];
			uniqueChildrenMountQueue.forEach(comp => {
				let isConnected = false;
				if (comp._startMarker && comp._endMarker) {
					// Check fragment markers are connected
					isConnected = comp._startMarker.parentNode === parentNode &&
								  comp._endMarker.parentNode === parentNode;
				} else if (comp._dom instanceof Node) {
					// Check standard DOM node is connected
					isConnected = comp._dom.isConnected;
				}

				if (isConnected && !comp._isMounted && !comp._isUnmounted) {
					// Call didMount and update flags if connected
					if (typeof comp.componentDidMount === 'function') {
						try { comp.componentDidMount(); }
						catch (e) { console.error(`PicoJSX: Error in componentDidMount of ${comp.constructor.name}`, e); }
					}
					comp._isMounted = true;
					comp._isUnmounted = false;
				}
			});

			// Call componentDidUpdate lifecycle method
			if (typeof this.componentDidUpdate === 'function') {
				this.componentDidUpdate(this._prevProps, prevStateForUpdate);
			}

			// Attempt to restore focus
			if (focusedElementId) {
				let elementToFocus = null;
				let searchContext = isFragmentRoot ? parentNode : this._dom;
				if (searchContext) {
					if (isFragmentRoot) {
						// Search between markers for the element by ID
						let current = oldStartMarker.nextSibling;
						while (current && current !== oldEndMarker) {
							if (current.nodeType === Node.ELEMENT_NODE) {
								if (current.id === focusedElementId) { elementToFocus = current; break; }
								// Check descendants too
								if (typeof current.querySelector === 'function') {
									elementToFocus = current.querySelector(`#${focusedElementId}`);
									if (elementToFocus) break;
								}
							}
							current = current.nextSibling;
						}
					} else if (this._dom?.id === focusedElementId && typeof this._dom.focus === 'function') {
						// Check if the root element itself is the one
						elementToFocus = this._dom;
					} else if (typeof this._dom?.querySelector === 'function') {
						// Search within the root element
						elementToFocus = this._dom.querySelector(`#${focusedElementId}`);
					}
				}
				if (elementToFocus) {
					try {
						elementToFocus.focus();
						// Restore cursor position if saved
						if (selectionStart !== null && typeof elementToFocus.setSelectionRange === 'function') {
							elementToFocus.setSelectionRange(selectionStart, selectionEnd);
						}
					} catch (e) {
						console.warn(`PicoJSX: Failed focus/selection restore for #${focusedElementId}`, e);
					}
				}
			}
			this._prevState = null; // Clear saved previous state
		}

		/** @abstract @returns {*} */
		render() { throw new Error('PicoJSX: Component has no render method.'); }
		componentDidMount() {}
		componentWillUnmount() {}
		/** @param {object} prevProps @param {object} prevState */
		componentDidUpdate(prevProps, prevState) {} // eslint-disable-line no-unused-vars
	}

	/**
	 * Creates a simple global state store with optional localStorage persistence.
	 * @param {*} initialState - The initial value of the store's state.
	 * @param {object} [options={}] - Configuration options.
	 * @param {string} [options.storageKey] - Key for localStorage persistence.
	 * @returns {{getState: Function, setState: Function, subscribe: Function}} Store object.
	 */
	function createStore(initialState, options = {}) {
		const { storageKey } = options;
		let state = initialState;
		const listeners = new Set();

		if (storageKey) {
			// Try loading initial state from localStorage if key provided
			try {
				const stored = localStorage.getItem(storageKey);
				if (stored !== null) {
					state = JSON.parse(stored);
					// console.log(`PicoJSX Store: State loaded for "${storageKey}"`);
				}
			} catch (e) {
				console.error(`PicoJSX Store: Error loading state for "${storageKey}"`, e);
			}
		}

		/** Get the current state. @returns {*} */
		function getState() { return state; }

		/**
		 * Update the store's state, persist if needed, and notify listeners.
		 * @param {object|Function} updater - Object to merge or function `(currentState) => newState`.
		 */
		function setState(updater) {
			const oldState = state;
			state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
			if (storageKey) {
				// Persist to localStorage if key exists
				try {
					localStorage.setItem(storageKey, JSON.stringify(state));
				} catch (e) {
					console.error(`PicoJSX Store: Error saving state for "${storageKey}"`, e);
				}
			}
			// Notify all listeners
			listeners.forEach(listener => {
				try {
					listener(state, oldState);
				} catch (e) {
					console.error(`PicoJSX Store: Error in listener for "${storageKey || 'default'}"`, e);
				}
			});
		}

		/**
		 * Subscribe a listener function to state changes.
		 * @param {Function} listener - Function to call with `(newState, oldState)`.
		 * @returns {Function} An unsubscribe function.
		 */
		function subscribe(listener) {
			if (typeof listener !== 'function') throw new Error('PicoJSX Store: Listener must be a function.');
			listeners.add(listener);
			return () => listeners.delete(listener);
		}
		return { getState, setState, subscribe }; // The store's public API
	}

	/**
	 * Renders JSX / Component output into a target DOM element.
	 * Clears existing content, builds the new DOM, handles root fragments with markers,
	 * and schedules `componentDidMount` calls.
	 * @param {*} jsxInput - Renderable input (JSX object from transpiler, Component class/instance, primitive).
	 * @param {Element} parentDomElement - Container element.
	 */
	function render(jsxInput, parentDomElement) {
		if (!parentDomElement || !(parentDomElement instanceof Element)) {
			throw new Error('PicoJSX: Target parent DOM element is missing or invalid.');
		}
		Array.from(parentDomElement.childNodes).forEach(node => disposeNode(node));
		parentDomElement.innerHTML = ''; // Clear previous content

		const mountQueue = [];
		const domToAppend = _buildDomAndCollectMounts(jsxInput, mountQueue);

		let topLevelInstance = null;
		let startMarker = null; // For root fragments
		let endMarker = null;   // For root fragments
		let isRootFragment = false;

		if (jsxInput?.constructor?.isPicoClassComponent) {
			topLevelInstance = jsxInput;
			if (topLevelInstance._dom instanceof DocumentFragment) {
				isRootFragment = true; // Component's render() returned a fragment
			}
		} else if (domToAppend instanceof DocumentFragment) {
			isRootFragment = true; // Top-level input resolved to a fragment (e.g., <></>)
		}

		if (isRootFragment) {
			// Use comment markers to delineate the fragment's content in the parent
			startMarker = document.createComment(`Pico Start: ${topLevelInstance?.constructor?.name || 'RootFragment'}`);
			endMarker = document.createComment(`Pico End: ${topLevelInstance?.constructor?.name || 'RootFragment'}`);
			parentDomElement.appendChild(startMarker);
			if (domToAppend) parentDomElement.appendChild(domToAppend);
			parentDomElement.appendChild(endMarker);
			if (topLevelInstance) {
				topLevelInstance._startMarker = startMarker;
				topLevelInstance._endMarker = endMarker;
				// Note: topLevelInstance._dom might be the fragment itself or cleared depending on flow
			}
		} else {
			if (domToAppend) parentDomElement.appendChild(domToAppend);
			if (topLevelInstance) {
				// Ensure markers are null if the root wasn't a fragment
				topLevelInstance._startMarker = null;
				topLevelInstance._endMarker = null;
			}
		}

		// Remove duplicate components from mount queue (can happen with nesting)
		const uniqueMountQueue = [...new Set(mountQueue)];

		// Defer componentDidMount calls until after the current JS execution block completes
		// This ensures the DOM is fully attached and rendered by the browser.
		setTimeout(() => {
			uniqueMountQueue.forEach(componentInstance => {
				if (!componentInstance._isMounted && !componentInstance._isUnmounted) {
					let isConnected = false;
					if (componentInstance._startMarker && componentInstance._endMarker) {
						// Check fragment markers are connected
						isConnected = componentInstance._startMarker.parentNode === parentDomElement &&
									  componentInstance._endMarker.parentNode === parentDomElement;
					} else if (componentInstance._dom instanceof Node) {
						// Check standard DOM node is connected
						isConnected = componentInstance._dom.isConnected;
					}

					if (isConnected) {
						// Call didMount and update flags if connected
						if (typeof componentInstance.componentDidMount === 'function') {
							try { componentInstance.componentDidMount(); }
							catch (e) { console.error(`PicoJSX: Error in componentDidMount of ${componentInstance.constructor.name}`, e); }
						}
						componentInstance._isMounted = true;
						componentInstance._isUnmounted = false;
					} else {
						 console.warn(`PicoJSX Render (Deferred): Skipping mount call for non-connected ${componentInstance.constructor.name}.`);
					}
				}
			});
		}, 0);
	}

	return {
		h,
		Fragment,
		render,
		Component,
		createStore
	};
})();

export default PicoJSX;
export const { h, Fragment, render, Component, createStore } = PicoJSX;
