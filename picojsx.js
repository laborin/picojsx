/**
 * @fileoverview PicoJSX: A lightweight frontend library with virtual DOM
 * for creating user interfaces using JSX or `h` function calls.
 * Features component state, lifecycle methods, global store, and efficient updates.
 * @version 2.0.3
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
	 * Creates a virtual node (VNode) representation.
	 * This is what the JSX transpiler calls and what components return.
	 * 
	 * @param {string|Function|symbol} type - Element type ('div', Component class, functional component, Fragment symbol).
	 * @param {object|null} props - Properties/attributes.
	 * @param {...*} children - Child elements.
	 * @returns {object} VNode representation
	 */
	function h(type, props, ...children) {
		// Flatten children and filter out null/undefined/boolean
		const flatChildren = children
			.flat(Infinity)
			.filter(child => child !== null && child !== undefined && typeof child !== 'boolean');

		// Normalize children to VNodes
		const normalizedChildren = flatChildren.map(child => {
			if (typeof child === 'object' && child.type !== undefined) {
				return child; // Already a VNode
			}
			// Convert primitives to text VNodes
			return { type: '#text', props: null, children: [], text: String(child) };
		});

		// Extract key from props if present
		const key = props?.key || null;
		const restProps = props ? { ...props } : {};
		if (restProps.key !== undefined) delete restProps.key;

		// For components, add children to props (React compatibility)
		if (typeof type === 'function' && normalizedChildren.length > 0) {
			// If there's only one child, pass it directly; otherwise pass array
			restProps.children = normalizedChildren.length === 1 ? normalizedChildren[0] : normalizedChildren;
		}

		// Handle functional components immediately
		if (typeof type === 'function' && !type.isPicoClassComponent) {
			// Call functional component and return its result
			return type(restProps, normalizedChildren);
		}

		// Return VNode structure
		return {
			type,
			props: restProps,
			children: normalizedChildren,
			key
		};
	}

	/**
	 * Applies props (attributes, event listeners, styles, className, etc.) to a DOM element.
	 * @param {Element} element - The DOM element to apply props to.
	 * @param {object} props - The props object.
	 */
	function applyProps(element, props) {
		if (!props) return;

		for (let name in props) {
			const value = props[name];

			if (name === 'children' || name === 'key') continue;

			if (name === 'className') {
				element.className = value || '';
			} else if (name.startsWith('on') && typeof value === 'function') {
				const eventName = name.substring(2).toLowerCase();
				element.addEventListener(eventName, value);
			} else if (name === 'dangerouslySetInnerHTML') {
				if (value?.__html !== undefined) {
					element.innerHTML = value.__html;
				}
			} else if (name === 'style') {
				if (typeof value === 'string') {
					element.style.cssText = value;
				} else if (typeof value === 'object') {
					Object.assign(element.style, value);
				}
			} else if (name === 'ref') {
				if (typeof value === 'function') {
					value(element);
				} else if (value && typeof value === 'object') {
					value.current = element;
				}
			} else if (value === false || value === null || value === undefined) {
				element.removeAttribute(name);
			} else if (value === true) {
				element.setAttribute(name, '');
			} else {
				element.setAttribute(name, String(value));
			}
		}
	}

	/**
	 * Updates props on an existing DOM element by diffing old and new props.
	 * @param {Element} element - The DOM element to update.
	 * @param {object} oldProps - Previous props.
	 * @param {object} newProps - New props.
	 */
	function updateProps(element, oldProps, newProps) {
		oldProps = oldProps || {};
		newProps = newProps || {};

		// Remove old props not in new props
		for (let name in oldProps) {
			if (!(name in newProps)) {
				if (name === 'className') {
					element.className = '';
				} else if (name.startsWith('on') && typeof oldProps[name] === 'function') {
					const eventName = name.substring(2).toLowerCase();
					element.removeEventListener(eventName, oldProps[name]);
				} else if (name === 'ref') {
					if (typeof oldProps[name] === 'function') {
						oldProps[name](null);
					} else if (oldProps[name]?.current !== undefined) {
						oldProps[name].current = null;
					}
				} else if (name !== 'children' && name !== 'key' && name !== 'dangerouslySetInnerHTML') {
					element.removeAttribute(name);
				}
			}
		}

		// Update changed props
		for (let name in newProps) {
			if (name === 'children' || name === 'key') continue;

			const oldValue = oldProps[name];
			const newValue = newProps[name];

			if (oldValue === newValue && name !== 'ref') continue;

			if (name === 'className') {
				if (element.className !== newValue) {
					element.className = newValue || '';
				}
			} else if (name.startsWith('on')) {
				const eventName = name.substring(2).toLowerCase();
				if (typeof oldValue === 'function') {
					element.removeEventListener(eventName, oldValue);
				}
				if (typeof newValue === 'function') {
					element.addEventListener(eventName, newValue);
				}
			} else if (name === 'dangerouslySetInnerHTML') {
				if (newValue?.__html !== oldValue?.__html) {
					element.innerHTML = newValue?.__html || '';
				}
			} else if (name === 'style') {
				if (typeof newValue === 'string') {
					element.style.cssText = newValue;
				} else if (typeof newValue === 'object') {
					element.style.cssText = '';
					Object.assign(element.style, newValue);
				} else {
					element.style.cssText = '';
				}
			} else if (name === 'ref') {
				if (oldValue && oldValue !== newValue) {
					if (typeof oldValue === 'function') oldValue(null);
					else if (oldValue?.current !== undefined) oldValue.current = null;
				}
				if (typeof newValue === 'function') {
					newValue(element);
				} else if (newValue?.current !== undefined) {
					newValue.current = element;
				}
			} else if (newValue === false || newValue === null || newValue === undefined) {
				element.removeAttribute(name);
			} else if (newValue === true) {
				element.setAttribute(name, '');
			} else {
				if (element.getAttribute(name) !== String(newValue)) {
					element.setAttribute(name, String(newValue));
				}
			}
		}
	}

	/**
	 * Creates a DOM element from a VNode.
	 * @param {object} vnode - Virtual node to create DOM from.
	 * @returns {Node} The created DOM node.
	 */
	function createDOMElement(vnode) {
		if (!vnode) return document.createTextNode('');

		// Handle text nodes
		if (vnode.type === '#text') {
			return document.createTextNode(vnode.text || '');
		}

		// Handle fragments
		if (vnode.type === Fragment) {
			const fragment = document.createDocumentFragment();
			
			// Add start marker
			const startMarker = document.createComment('fragment-start');
			fragment.appendChild(startMarker);
			vnode._startMarker = startMarker;
			
			// Add children
			vnode.children.forEach(child => {
				fragment.appendChild(createDOMElement(child));
			});
			
			// Add end marker
			const endMarker = document.createComment('fragment-end');
			fragment.appendChild(endMarker);
			vnode._endMarker = endMarker;
			
			return fragment;
		}

		// Handle class components
		if (vnode.type?.isPicoClassComponent) {
			const instance = vnode._instance || new vnode.type(vnode.props);
			vnode._instance = instance;
			instance._vnode = vnode;
			
			const childVNode = instance.render();
			instance._childVNode = childVNode;
			
			const dom = createDOMElement(childVNode);
			instance._dom = dom;
			
			// Store instance reference on DOM
			if (dom instanceof Element) {
				dom._picoInstance = instance;
			}
			
			// Queue for componentDidMount
			if (!instance._isMounted && typeof instance.componentDidMount === 'function') {
				setTimeout(() => {
					if (!instance._isUnmounted) {
						instance.componentDidMount();
						instance._isMounted = true;
					}
				}, 0);
			}
			
			return dom;
		}

		// Handle HTML elements
		if (typeof vnode.type === 'string') {
			const element = document.createElement(vnode.type);
			
			// Apply props
			applyProps(element, vnode.props);
			
			// Append children
			vnode.children.forEach(child => {
				element.appendChild(createDOMElement(child));
			});
			
			// Store vnode reference
			element._vnode = vnode;
			
			return element;
		}

		// eslint-disable-next-line no-console
	console.warn('Unknown vnode type:', vnode);
		return document.createTextNode('');
	}

	/**
	 * Diffs two VNodes and patches the DOM accordingly.
	 * @param {Node} parentDOM - Parent DOM node.
	 * @param {Node} dom - Current DOM node.
	 * @param {object} oldVNode - Previous VNode.
	 * @param {object} newVNode - New VNode.
	 * @param {number} index - Child index in parent.
	 * @returns {Node} The updated or replaced DOM node.
	 */
	function diff(parentDOM, dom, oldVNode, newVNode, index = 0) {
		// Handle null/undefined cases
		if (!newVNode && !oldVNode) return null;
		
		// Remove node
		if (!newVNode && oldVNode) {
			if (dom) {
				unmountComponent(dom);
				parentDOM.removeChild(dom);
			}
			return null;
		}
		
		// Add new node
		if (newVNode && !oldVNode) {
			const newDOM = createDOMElement(newVNode);
			if (parentDOM.childNodes[index]) {
				parentDOM.insertBefore(newDOM, parentDOM.childNodes[index]);
			} else {
				parentDOM.appendChild(newDOM);
			}
			return newDOM;
		}

		// Different types - replace
		if (oldVNode.type !== newVNode.type) {
			const newDOM = createDOMElement(newVNode);
			
			// Unmount only child components in the subtree, not the parent component's DOM element
			const unmountChildren = (node) => {
				if (node && node.childNodes) {
					node.childNodes.forEach(child => {
						unmountChildren(child);
						if (child._picoInstance) {
							if (!child._picoInstance._isUnmounted && typeof child._picoInstance.componentWillUnmount === 'function') {
								child._picoInstance.componentWillUnmount();
							}
							child._picoInstance._isUnmounted = true;
							child._picoInstance._isMounted = false;
						}
					});
				}
			};
			
			unmountChildren(dom);
			
			parentDOM.replaceChild(newDOM, dom);
			return newDOM;
		}

		// Same type - update
		
		// Text nodes
		if (newVNode.type === '#text') {
			if (oldVNode.text !== newVNode.text) {
				dom.textContent = newVNode.text;
			}
			return dom;
		}

		// Fragments
		if (newVNode.type === Fragment) {
			// For fragments, dom should be the start marker if it exists
			let startMarker = null;
			let endMarker = null;
			
			// Check if dom is actually the start marker
			if (dom && dom.nodeType === 8 && dom.textContent === 'fragment-start') {
				startMarker = dom;
				
				// Find corresponding end marker
				let node = startMarker.nextSibling;
				while (node) {
					if (node.nodeType === 8 && node.textContent === 'fragment-end') {
						endMarker = node;
						break;
					}
					node = node.nextSibling;
				}
			}
			
			if (startMarker && endMarker) {
				// Fragment exists, diff children between markers
				const oldChildren = oldVNode.children || [];
				const newChildren = newVNode.children || [];
				
				// Collect existing nodes between markers
				const existingNodes = [];
				let node = startMarker.nextSibling;
				while (node && node !== endMarker) {
					existingNodes.push(node);
					node = node.nextSibling;
				}
				
				// Diff each child
				const maxLength = Math.max(oldChildren.length, newChildren.length);
				let currentNode = startMarker.nextSibling;
				
				for (let i = 0; i < maxLength; i++) {
					const oldChild = oldChildren[i];
					const newChild = newChildren[i];
					
					if (!newChild && oldChild) {
						// Remove old child
						if (currentNode && currentNode !== endMarker) {
							const next = currentNode.nextSibling;
							unmountComponent(currentNode);
							parentDOM.removeChild(currentNode);
							currentNode = next;
						}
					} else if (newChild && !oldChild) {
						// Add new child
						const newDOM = createDOMElement(newChild);
						parentDOM.insertBefore(newDOM, endMarker);
					} else if (newChild && oldChild) {
						// Update existing child
						if (currentNode && currentNode !== endMarker) {
							const next = currentNode.nextSibling;
							diff(parentDOM, currentNode, oldChild, newChild, Array.from(parentDOM.childNodes).indexOf(currentNode));
							currentNode = next;
						}
					}
				}
				
				// Store markers for next update
				newVNode._startMarker = startMarker;
				newVNode._endMarker = endMarker;
				
				return startMarker; // Return start marker as reference
			} else {
				// No existing fragment, create new one
				const newDOM = createDOMElement(newVNode);
				if (dom) {
					unmountComponent(dom);
					parentDOM.replaceChild(newDOM, dom);
				} else {
					parentDOM.appendChild(newDOM);
				}
				return newVNode._startMarker;
			}
		}

		// Class components
		if (newVNode.type?.isPicoClassComponent) {
			const instance = oldVNode._instance;
			newVNode._instance = instance;
			
			// Update props (including children)
			const prevProps = instance.props;
			const prevState = instance.state;
			instance.props = newVNode.props;
			instance._vnode = newVNode;
			
			// Re-render
			const oldChildVNode = instance._childVNode;
			const newChildVNode = instance.render();
			instance._childVNode = newChildVNode;
			
			// Recursively diff children
			const newDOM = diff(dom.parentNode, dom, oldChildVNode, newChildVNode, Array.from(dom.parentNode.childNodes).indexOf(dom));
			
			// If the child is a fragment, we need to update the DOM reference
			if (newChildVNode && newChildVNode.type === Fragment && newDOM !== dom) {
				return newDOM;
			}
			
			// Call componentDidUpdate
			if (typeof instance.componentDidUpdate === 'function') {
				instance.componentDidUpdate(prevProps, prevState);
			}
			
			return dom;
		}

		// HTML elements
		if (typeof newVNode.type === 'string') {
			// Update props
			updateProps(dom, oldVNode.props, newVNode.props);
			
			// Update children with keys support
			diffChildren(dom, oldVNode.children, newVNode.children);
			
			// Update stored vnode
			dom._vnode = newVNode;
			
			return dom;
		}

		return dom;
	}

	/**
	 * Diffs and updates children with key support.
	 * @param {Element} parentDOM - Parent DOM element.
	 * @param {Array} oldChildren - Old child VNodes.
	 * @param {Array} newChildren - New child VNodes.
	 */
	function diffChildren(parentDOM, oldChildren = [], newChildren = []) {
		const oldKeyed = {};
		const newKeyed = {};
		const oldElements = Array.from(parentDOM.childNodes);

		// Build key maps
		oldChildren.forEach((child, i) => {
			if (child?.key !== null && child?.key !== undefined) {
				oldKeyed[child.key] = { vnode: child, dom: oldElements[i], index: i };
			}
		});

		newChildren.forEach((child, i) => {
			if (child?.key !== null && child?.key !== undefined) {
				newKeyed[child.key] = { vnode: child, index: i };
			}
		});

		// Track which old children have been matched
		const matched = new Set();

		// Process new children
		newChildren.forEach((newChild, newIndex) => {
			let oldChild = null;
			let oldDOM = null;
			let oldIndex = -1;

			if (newChild?.key !== null && newChild?.key !== undefined) {
				// Keyed child - find matching old child by key
				const oldMatch = oldKeyed[newChild.key];
				if (oldMatch) {
					oldChild = oldMatch.vnode;
					oldDOM = oldMatch.dom;
					oldIndex = oldMatch.index;
					matched.add(oldIndex);
				}
			} else {
				// Non-keyed - find first unmatched old child of same type at same position
				if (newIndex < oldChildren.length && !matched.has(newIndex)) {
					const candidate = oldChildren[newIndex];
					if (!candidate?.key && candidate?.type === newChild?.type) {
						oldChild = candidate;
						oldDOM = oldElements[newIndex];
						oldIndex = newIndex;
						matched.add(oldIndex);
					}
				}
			}

			// Diff the child
			const resultDOM = diff(parentDOM, oldDOM, oldChild, newChild, newIndex);

			// Move if necessary
			if (resultDOM && resultDOM !== parentDOM.childNodes[newIndex]) {
				if (parentDOM.childNodes[newIndex]) {
					parentDOM.insertBefore(resultDOM, parentDOM.childNodes[newIndex]);
				} else {
					parentDOM.appendChild(resultDOM);
				}
			}
		});

		// Remove unmatched old children
		oldChildren.forEach((oldChild, i) => {
			if (!matched.has(i) && oldElements[i]) {
				unmountComponent(oldElements[i]);
				if (oldElements[i].parentNode === parentDOM) {
					parentDOM.removeChild(oldElements[i]);
				}
			}
		});
	}

	/**
	 * Unmounts a component and its children.
	 * @param {Node} dom - DOM node to unmount.
	 */
	function unmountComponent(dom) {
		if (!dom) return;

		// Handle fragment markers - if this is a fragment start marker, remove everything until end marker
		if (dom.nodeType === 8 && dom.textContent === 'fragment-start') {
			const parent = dom.parentNode;
			if (parent) {
				let node = dom.nextSibling;
				const nodesToRemove = [dom];
				
				// Collect all nodes until end marker
				while (node) {
					nodesToRemove.push(node);
					if (node.nodeType === 8 && node.textContent === 'fragment-end') {
						break;
					}
					node = node.nextSibling;
				}
				
				// Remove all collected nodes
				nodesToRemove.forEach(n => {
					if (n && n.parentNode) {
						// Unmount children first
						if (n.childNodes) {
							n.childNodes.forEach(child => unmountComponent(child));
						}
						// Handle component instances
						if (n._picoInstance) {
							const instance = n._picoInstance;
							if (!instance._isUnmounted && typeof instance.componentWillUnmount === 'function') {
								instance.componentWillUnmount();
							}
							instance._isUnmounted = true;
							instance._isMounted = false;
						}
						n.parentNode.removeChild(n);
					}
				});
				return;
			}
		}

		// Handle component instances
		if (dom._picoInstance) {
			const instance = dom._picoInstance;
			if (!instance._isUnmounted && typeof instance.componentWillUnmount === 'function') {
				instance.componentWillUnmount();
			}
			instance._isUnmounted = true;
			instance._isMounted = false;
		}

		// Recursively unmount children
		if (dom.childNodes) {
			dom.childNodes.forEach(child => unmountComponent(child));
		}

		// Clean up refs
		const vnode = dom._vnode;
		if (vnode?.props?.ref) {
			if (typeof vnode.props.ref === 'function') {
				vnode.props.ref(null);
			} else if (vnode.props.ref?.current !== undefined) {
				vnode.props.ref.current = null;
			}
		}
	}

	/**
	 * Base class for PicoJSX stateful components.
	 * Provides state management, lifecycle methods, and update mechanism.
	 * @class Component
	 */
	class Component {
		static isPicoClassComponent = true;

		constructor(props) {
			this.props = props || {};
			this.state = {};
			this._vnode = null;
			this._childVNode = null;
			this._dom = null;
			this._isMounted = false;
			this._isUnmounted = false;
			this._prevState = null;
		}

		setState(updater) {
			// Save previous state before updating
			this._prevState = { ...this.state };
			
			if (typeof updater === 'function') {
				Object.assign(this.state, updater(this.state, this.props));
			} else {
				Object.assign(this.state, updater);
			}
			
			this.update();
		}

		update() {
			if (!this._dom || this._isUnmounted) return;

			const prevProps = { ...this.props };
			// Use saved prevState from setState, or current state if called directly
			const prevState = this._prevState || { ...this.state };
			// Clear saved prevState after using it
			this._prevState = null;

			// Re-render and diff
			const oldChildVNode = this._childVNode;
			const newChildVNode = this.render();
			this._childVNode = newChildVNode;

			// Find where we are in parent
			const parentDOM = this._dom.parentNode;
			if (!parentDOM) return;

			const index = Array.from(parentDOM.childNodes).indexOf(this._dom);
			
			// Diff and patch
			const newDOM = diff(parentDOM, this._dom, oldChildVNode, newChildVNode, index);
			this._dom = newDOM;

			// Lifecycle
			if (typeof this.componentDidUpdate === 'function') {
				this.componentDidUpdate(prevProps, prevState);
			}
		}

		render() {
			throw new Error('Component must implement render() method');
		}

		componentDidMount() {}
		componentWillUnmount() {}
		componentDidUpdate(prevProps, prevState) { // eslint-disable-line no-unused-vars
	}
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
			try {
				const stored = localStorage.getItem(storageKey);
				if (stored !== null) {
					state = JSON.parse(stored);
				}
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(`PicoJSX Store: Error loading state for "${storageKey}"`, e);
			}
		}

		function getState() {
			return state;
		}

		function setState(updater) {
			const oldState = state;
			state = typeof updater === 'function' 
				? updater(state) 
				: { ...state, ...updater };
			
			if (storageKey) {
				try {
					localStorage.setItem(storageKey, JSON.stringify(state));
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(`PicoJSX Store: Error saving state for "${storageKey}"`, e);
				}
			}
			
			listeners.forEach(listener => {
				try {
					listener(state, oldState);
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error('PicoJSX Store: Error in listener', e);
				}
			});
		}

		function subscribe(listener) {
			if (typeof listener !== 'function') {
				throw new Error('Listener must be a function');
			}
			listeners.add(listener);
			return () => listeners.delete(listener);
		}

		return { getState, setState, subscribe };
	}

	/**
	 * Renders VNode tree into a target DOM element.
	 * @param {*} vnode - VNode tree or component to render.
	 * @param {Element} container - Container element.
	 */
	function render(vnode, container) {
		if (!container || !(container instanceof Element)) {
			throw new Error('Container must be a DOM element');
		}

		// Clear and unmount existing content
		while (container.firstChild) {
			unmountComponent(container.firstChild);
			container.removeChild(container.firstChild);
		}

		// Create root VNode if needed
		if (typeof vnode === 'function' && vnode.isPicoClassComponent) {
			vnode = h(vnode, {});
		} else if (typeof vnode === 'string' || typeof vnode === 'number') {
			vnode = { type: '#text', props: null, children: [], text: String(vnode) };
		}

		// Create and append DOM
		const dom = createDOMElement(vnode);
		container.appendChild(dom);
		
		// Store for future updates
		container._vnode = vnode;
		container._rootDOM = dom;
	}

	/**
	 * Simple client-side router for single-page applications.
	 * Supports static and dynamic routes with parameters.
	 * @class Router
	 */
	class Router {
		constructor() {
			this.routes = {};
			this.currentRoute = null;
			this.currentComponent = null;
			window.addEventListener('popstate', () => this.handleRoute());
		}
		
		/**
		 * Register a route with a component.
		 * @param {string} path - Route path (e.g., '/', '/user/:id').
		 * @param {Function} component - Component to render for this route.
		 * @returns {Router} This router instance for chaining.
		 */
		route(path, component) {
			this.routes[path] = component;
			return this;
		}
		
		/**
		 * Navigate to a new route.
		 * @param {string} path - Path to navigate to.
		 * @param {boolean} [replaceState=false] - Whether to replace history state instead of pushing.
		 */
		navigate(path, replaceState = false) {
			if (replaceState) {
				history.replaceState({}, '', path);
			} else {
				history.pushState({}, '', path);
			}
			this.handleRoute();
		}
		
		/**
		 * Handle current route and trigger route change callback.
		 */
		handleRoute() {
			const path = window.location.pathname;
			const route = this.matchRoute(path);
			
			if (route) {
				this.currentRoute = route;
				if (this.onRouteChange) {
					this.onRouteChange(route.component, route.params);
				}
			} else {
				this.navigate('/'); // Redirect to home on unknown route
			}
		}
		
		/**
		 * Match a path against registered routes.
		 * @param {string} path - Path to match.
		 * @returns {object|null} Matched route with component and params, or null.
		 */
		matchRoute(path) {
			// Exact match first
			if (this.routes[path]) {
				return { component: this.routes[path], params: {} };
			}
			
			// Dynamic route matching (e.g., /chat/:id)
			for (const [routePath, component] of Object.entries(this.routes)) {
				const regex = new RegExp('^' + routePath.replace(/:[^/]+/g, '([^/]+)') + '$');
				const match = path.match(regex);
				
				if (match) {
					const params = {};
					const keys = routePath.match(/:[^/]+/g) || [];
					keys.forEach((key, index) => {
						params[key.slice(1)] = match[index + 1];
					});
					return { component, params };
				}
			}
			
			return null;
		}
		
		/**
		 * Set a handler to be called when route changes.
		 * @param {Function} handler - Function to call with (component, params) when route changes.
		 */
		setRouteChangeHandler(handler) {
			this.onRouteChange = handler;
		}
	}

	return {
		h,
		Fragment,
		render,
		Component,
		createStore,
		Router,
	};
})();

export default PicoJSX;
export const { h, Fragment, render, Component, createStore, Router } = PicoJSX;
