/**
 * @jest-environment jsdom
 */
// src/lib/picojsx/__tests__/picojsx.spec.js
import PicoJSX, {
	h,
	Fragment,
	Component as PicoComponent,
} from '../picojsx.js';
import { jest } from '@jest/globals';

describe('PicoJSX Core API', () => {
	it('PicoJSX default export should be an object', () => {
		expect(typeof PicoJSX).toBe('object');
	});

	it('should export h function', () => {
		expect(typeof h).toBe('function');
	});

	it('should export Fragment symbol', () => {
		expect(typeof Fragment).toBe('symbol');
	});

	it('should export render function', () => {
		expect(typeof PicoJSX.render).toBe('function'); // Using PicoJSX.render for this one to ensure default export also has it
	});

	it('should export Component class (which is a function)', () => {
		expect(typeof PicoComponent).toBe('function');
	});

	it('should export createStore function', () => {
		expect(typeof PicoJSX.createStore).toBe('function'); // Using PicoJSX.createStore for this one
	});
});

describe('h function', () => {
	it('should create a simple VNode for an HTML element', () => {
		const vnode = h('div', null);
		expect(vnode).toEqual({ type: 'div', props: {}, children: [] });
	});

	it('should create a VNode with props', () => {
		const props = { id: 'foo', className: 'bar' };
		const vnode = h('div', props);
		expect(vnode).toEqual({ type: 'div', props, children: [] });
	});

	it('should create a VNode with a single text child', () => {
		const vnode = h('p', null, 'Hello World');
		expect(vnode).toEqual({
			type: 'p',
			props: {},
			children: ['Hello World'],
		});
	});

	it('should create a VNode with multiple children (text and element)', () => {
		const vnode = h(
			'div',
			null,
			'Text Child',
			h('span', null, 'Span Child')
		);
		expect(vnode).toEqual({
			type: 'div',
			props: {},
			children: [
				'Text Child',
				{ type: 'span', props: {}, children: ['Span Child'] },
			],
		});
	});

	it('should create a VNode for a Fragment', () => {
		const vnode = h(Fragment, null, h('span', null), h('p', null));
		expect(vnode.type).toBe(Fragment);
		expect(vnode.props).toEqual({});
		expect(vnode.children).toHaveLength(2);
		expect(vnode.children[0]).toEqual({
			type: 'span',
			props: {},
			children: [],
		});
	});

	// Test Class Component
	class TestComponent extends PicoComponent {
		constructor(props) {
			super(props);
		}
		render() {
			return h('div', null, 'Test Component Content');
		}
	}

	it('should create an instance for a Class Component', () => {
		const props = { message: 'Hello' };
		const componentInstance = h(TestComponent, props);
		expect(componentInstance instanceof TestComponent).toBe(true);
		expect(componentInstance.props).toEqual(props);
	});

	// Test Functional Component
	const MyFunctionalComponent = (props, children) => {
		return h('section', props, ...children);
	};

	it('should call a Functional Component and return its result', () => {
		const props = { id: 'functional' };
		const childElement = h('p', null, 'Functional child');
		const result = h(MyFunctionalComponent, props, childElement);
		expect(result).toEqual({
			type: 'section',
			props: props,
			children: [childElement],
		});
	});

	it('should handle null props by defaulting to an empty object', () => {
		const vnode = h('div', null, 'child');
		expect(vnode.props).toEqual({});
	});

	it('should flatten children arrays automatically by _buildDomAndCollectMounts, but h passes them as is for functional components', () => {
		const childrenArray = [h('span', null, 'one'), h('em', null, 'two')];
		const FuncCompWithArrayChildren = (props, children) => {
			// children here should be [[<span>one</span>, <em>two</em>]] if not spread by h, or directly the array if h spreads
			// Based on current h implementation: children is an array where each argument to h is an element.
			// So for h(MyFC, null, child1, child2) -> MyFC({}, [child1, child2])
			// If h(MyFC, null, [childArr]) -> MyFC({}, [[childArr]])
			expect(Array.isArray(children)).toBe(true);
			expect(children.length).toBe(1); // children is [[span, em]]
			expect(Array.isArray(children[0])).toBe(true);
			expect(children[0].length).toBe(2);
			return h('div', null, ...children[0]); // We need to spread it here for the test
		};
		const vnode = h(FuncCompWithArrayChildren, null, childrenArray);
		expect(vnode).toEqual({
			type: 'div',
			props: {},
			children: childrenArray, // Because FuncCompWithArrayChildren spreads them
		});
	});
});

describe('PicoComponent class', () => {
	class MyTestComponent extends PicoComponent {
		constructor(props) {
			super(props);
			this.state = {
				message: 'initial',
				count: props.initialCount || 0,
			};
		}

		// Dummy render, no se usará para estos tests de estado
		render() {
			return h('div', null, this.state.message);
		}
	}

	it('should initialize with given props', () => {
		const props = { id: 'comp1', initialCount: 5 };
		const instance = new MyTestComponent(props);
		expect(instance.props).toEqual(props);
	});

	it('should initialize state correctly from constructor', () => {
		const instance = new MyTestComponent({ initialCount: 10 });
		expect(instance.state).toEqual({ message: 'initial', count: 10 });
	});

	it('should initialize with default internal properties', () => {
		const instance = new MyTestComponent({});
		expect(instance._dom).toBeNull();
		expect(instance._isMounted).toBe(false);
		expect(instance._isUnmounted).toBe(false);
		expect(instance._prevProps).toBeNull();
		expect(instance._prevState).toBeNull();
		expect(instance._unsubscribeStore).toBeNull();
		expect(instance.autoUpdate).toBe(true);
		expect(instance._startMarker).toBeNull();
		expect(instance._endMarker).toBeNull();
	});

	it('setState should update the state with an object', () => {
		const instance = new MyTestComponent({ initialCount: 0 });
		instance.autoUpdate = false; // Disable autoUpdate for this test to isolate setState
		instance.setState({ message: 'updated', count: 1 });
		expect(instance.state.message).toBe('updated');
		expect(instance.state.count).toBe(1);
	});

	it('setState should update the state using a function', () => {
		const instance = new MyTestComponent({ initialCount: 5 });
		instance.autoUpdate = false;
		instance.setState((prevState, props) => ({
			count: prevState.count + props.initialCount,
			message: 'from function',
		}));
		expect(instance.state.count).toBe(10); // 5 (initial) + 5 (props.initialCount)
		expect(instance.state.message).toBe('from function');
	});

	it('setState should store previous state in _prevState before update', () => {
		const instance = new MyTestComponent({ initialCount: 1 });
		const originalState = { ...instance.state };
		instance.autoUpdate = false;

		instance.setState({ count: 2 });
		// _prevState should capture the state *before* the current setState call that just completed
		// but *after* any prior setState calls that might have set it to null.
		// Since this.state would have been {message: 'initial', count: 1},
		// and _prevState is set at the beginning of setState, it should hold this.
		expect(instance._prevState).toEqual(originalState);

		instance.setState({ message: 'final' });
		// Now _prevState should be {message: 'initial', count: 2}
		expect(instance._prevState).toEqual({ message: 'initial', count: 2 });
	});

	it('autoUpdate should be true by default', () => {
		const instance = new MyTestComponent({});
		expect(instance.autoUpdate).toBe(true);
	});
});

describe('Component debouncing', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
		document.body.removeChild(container);
		container = null;
	});

	class DebouncedComponent extends PicoComponent {
		constructor(props) {
			super(props);
			this.state = { count: 0 };
			this.renderCount = 0;
			// Set debounce delay from props or default to 100ms
			this.updateDebounceDelay = props.debounceDelay !== undefined ? props.debounceDelay : 100;
		}

		render() {
			this.renderCount++;
			return h('div', null, `Count: ${this.state.count}, Renders: ${this.renderCount}`);
		}
	}

	it('should debounce updates when updateDebounceDelay is set', () => {
		let componentInstance;
		
		class TestDebouncedComponent extends DebouncedComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
		}
		
		PicoJSX.render(
			h(TestDebouncedComponent, { debounceDelay: 100 }),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		expect(componentInstance.renderCount).toBe(1);
		expect(container.textContent).toBe('Count: 0, Renders: 1');

		// Trigger multiple rapid state updates
		componentInstance.setState({ count: 1 });
		componentInstance.setState({ count: 2 });
		componentInstance.setState({ count: 3 });

		// Should not have re-rendered yet due to debouncing
		expect(componentInstance.renderCount).toBe(1);
		expect(container.textContent).toBe('Count: 0, Renders: 1');

		// Advance time by 50ms (less than debounce delay)
		jest.advanceTimersByTime(50);
		expect(componentInstance.renderCount).toBe(1);

		// Advance time by another 60ms (total 110ms, exceeding debounce delay)
		jest.advanceTimersByTime(60);
		expect(componentInstance.renderCount).toBe(2);
		expect(container.textContent).toBe('Count: 3, Renders: 2');
	});

	it('should not debounce when updateDebounceDelay is 0', () => {
		let componentInstance;
		
		class TestDebouncedComponent extends DebouncedComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
		}
		
		PicoJSX.render(
			h(TestDebouncedComponent, { debounceDelay: 0 }),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		expect(componentInstance.renderCount).toBe(1);

		// Updates should be immediate
		componentInstance.setState({ count: 1 });
		expect(componentInstance.renderCount).toBe(2);
		expect(container.textContent).toBe('Count: 1, Renders: 2');

		componentInstance.setState({ count: 2 });
		expect(componentInstance.renderCount).toBe(3);
		expect(container.textContent).toBe('Count: 2, Renders: 3');
	});

	it('should cancel pending debounced updates when component unmounts', () => {
		let componentInstance;
		
		class TestDebouncedComponent extends DebouncedComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
		}
		
		PicoJSX.render(
			h(TestDebouncedComponent, { debounceDelay: 100 }),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		// Trigger a state update
		componentInstance.setState({ count: 1 });
		expect(componentInstance.renderCount).toBe(1);

		// Unmount the component before the debounce timeout
		PicoJSX.render(null, container);

		// Advance time past the debounce delay
		jest.advanceTimersByTime(150);

		// The update should have been cancelled, renderCount should still be 1
		expect(componentInstance.renderCount).toBe(1);
	});

	it('should handle manual update() calls with debouncing', () => {
		let componentInstance;
		
		class TestDebouncedComponent extends DebouncedComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
		}
		
		PicoJSX.render(
			h(TestDebouncedComponent, { debounceDelay: 100 }),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		componentInstance.autoUpdate = false; // Disable auto-update
		componentInstance.setState({ count: 1 }); // This won't trigger update due to autoUpdate = false

		expect(componentInstance.renderCount).toBe(1);
		expect(container.textContent).toBe('Count: 0, Renders: 1');

		// Manually call update multiple times
		componentInstance.update();
		componentInstance.update();
		componentInstance.update();

		// Should still be debounced
		expect(componentInstance.renderCount).toBe(1);

		jest.advanceTimersByTime(100);
		expect(componentInstance.renderCount).toBe(2);
		expect(container.textContent).toBe('Count: 1, Renders: 2');
	});

	it('should reset debounce timer on each update call', () => {
		let componentInstance;
		
		class TestDebouncedComponent extends DebouncedComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
		}
		
		PicoJSX.render(
			h(TestDebouncedComponent, { debounceDelay: 100 }),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		componentInstance.setState({ count: 1 });
		jest.advanceTimersByTime(80); // Almost at the debounce delay

		// Call update again, which should reset the timer
		componentInstance.setState({ count: 2 });
		jest.advanceTimersByTime(80); // Another 80ms

		// First timeout should have been cancelled, so still no update
		expect(componentInstance.renderCount).toBe(1);

		// Advance past the new debounce delay
		jest.advanceTimersByTime(30); // Total 110ms from last update
		expect(componentInstance.renderCount).toBe(2);
		expect(container.textContent).toBe('Count: 2, Renders: 2');
	});

	it('should have updateDebounceDelay default to 0', () => {
		let componentInstance;
		
		class DefaultDebounceComponent extends PicoComponent {
			constructor(props) {
				super(props);
				componentInstance = this;
			}
			
			render() {
				return h('div', null, 'test');
			}
		}

		PicoJSX.render(
			h(DefaultDebounceComponent),
			container
		);
		
		jest.advanceTimersByTime(0); // Process componentDidMount

		expect(componentInstance.updateDebounceDelay).toBe(0);
	});
});

describe('createStore function', () => {
	it('should initialize with an initial state and getState should return it', () => {
		const initialState = { count: 0, name: 'PicoStore' };
		const store = PicoJSX.createStore(initialState);
		expect(store.getState()).toEqual(initialState);
	});

	it('setState should update the state with an object', () => {
		const store = PicoJSX.createStore({ count: 0 });
		store.setState({ count: 5 });
		expect(store.getState().count).toBe(5);
		store.setState({ message: 'hello' });
		expect(store.getState()).toEqual({ count: 5, message: 'hello' });
	});

	it('setState should update the state with a function', () => {
		const store = PicoJSX.createStore({ count: 1 });
		store.setState((prevState) => ({ count: prevState.count + 4 }));
		expect(store.getState().count).toBe(5);
	});

	it('subscribe should call the listener with new and old state upon update', () => {
		const store = PicoJSX.createStore({ count: 0 });
		const listenerMock = jest.fn();

		store.subscribe(listenerMock);

		const initialState = { count: 0 };
		store.setState({ count: 1 });
		const newState = { count: 1 };

		expect(listenerMock).toHaveBeenCalledTimes(1);
		expect(listenerMock).toHaveBeenCalledWith(newState, initialState);

		store.setState((s) => ({ count: s.count * 2 }));
		const newerState = { count: 2 };
		expect(listenerMock).toHaveBeenCalledTimes(2);
		expect(listenerMock).toHaveBeenCalledWith(newerState, newState);
	});

	it('unsubscribe should stop the listener from being called', () => {
		const store = PicoJSX.createStore({ count: 0 });
		const listenerMock = jest.fn();

		const unsubscribe = store.subscribe(listenerMock);

		store.setState({ count: 1 });
		expect(listenerMock).toHaveBeenCalledTimes(1);

		unsubscribe();

		store.setState({ count: 2 });
		expect(listenerMock).toHaveBeenCalledTimes(1); // Still 1, not called again
	});

	it('should throw an error if a non-function is passed to subscribe', () => {
		const store = PicoJSX.createStore({});
		expect(() => {
			store.subscribe(null); // Simply pass null for the JS test
		}).toThrow('PicoJSX Store: Listener must be a function.');
	});

	describe('createStore with localStorage persistence', () => {
		const localStorageKey = 'pico-test-store';
		let mockLocalStorage;

		beforeEach(() => {
			// Mock localStorage
			let storeData = {};
			mockLocalStorage = {
				getItem: jest.fn((key) => storeData[key] || null),
				setItem: jest.fn((key, value) => {
					storeData[key] = value.toString();
				}),
				removeItem: jest.fn((key) => {
					delete storeData[key];
				}),
				clear: jest.fn(() => {
					storeData = {};
				}),
				key: jest.fn((index) => Object.keys(storeData)[index] || null),
				get length() {
					return Object.keys(storeData).length;
				},
			};

			Object.defineProperty(window, 'localStorage', {
				value: mockLocalStorage,
				writable: true,
				configurable: true,
			});
		});

		it('should load initial state from localStorage if key exists and data is valid', () => {
			const persistedState = { count: 100, user: 'persistedUser' };
			mockLocalStorage.setItem(
				localStorageKey,
				JSON.stringify(persistedState)
			);

			const store = PicoJSX.createStore(
				{ count: 0 },
				{ storageKey: localStorageKey }
			);
			expect(store.getState()).toEqual(persistedState);
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
				localStorageKey
			);
		});

		it('should use initialState if localStorage data is invalid JSON', () => {
			mockLocalStorage.setItem(localStorageKey, 'invalid-json---');
			const consoleErrorSpy = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const initialState = { count: 0, defaultUser: 'default' };
			const store = PicoJSX.createStore(initialState, {
				storageKey: localStorageKey,
			});

			expect(store.getState()).toEqual(initialState);
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
				localStorageKey
			);
			expect(consoleErrorSpy).toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
		});

		it('should save state to localStorage on setState if storageKey is provided', () => {
			const initialState = { data: 'initial' };
			const store = PicoJSX.createStore(initialState, {
				storageKey: localStorageKey,
			});

			const newState = { data: 'updated', extra: true };
			store.setState(newState);

			expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				localStorageKey,
				JSON.stringify(store.getState())
			);
			expect(
				JSON.parse(mockLocalStorage.getItem(localStorageKey) || '{}')
			).toEqual(store.getState());
		});

		it('should not break if localStorage.setItem throws an error', () => {
			const initialState = { value: 'test' };
			// Simular que setItem falla (e.g., localStorage lleno)
			const originalSetItem = mockLocalStorage.setItem;
			mockLocalStorage.setItem = jest.fn(() => {
				throw new Error('LocalStorage Full');
			});
			const consoleErrorSpy = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const store = PicoJSX.createStore(initialState, {
				storageKey: localStorageKey,
			});

			let finalState = null;
			expect(() => {
				store.setState({ value: 'new value' });
				finalState = store.getState();
			}).not.toThrow();

			expect(finalState).toEqual({ value: 'new value' });
			expect(consoleErrorSpy).toHaveBeenCalled();
			consoleErrorSpy.mockRestore();
			mockLocalStorage.setItem = originalSetItem;
		});
	});
});

describe('render function and DOM manipulation', () => {
	let container;

	beforeEach(() => {
		jest.useFakeTimers(); // Usar timers falsos
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (container && container.parentNode) {
			container.parentNode.removeChild(container);
		}
		document.body.innerHTML = '';
		jest.runOnlyPendingTimers(); // Asegurarse de que todos los timers pendientes se ejecuten
		jest.useRealTimers(); // Restaurar timers reales
	});

	it('should render a simple HTML element with text content', () => {
		PicoJSX.render(h('p', null, 'Hello Pico!'), container);
		// No se necesita jest.runAllTimers() aquí si el renderizado básico es síncrono
		expect(container.innerHTML).toBe('<p>Hello Pico!</p>');
	});

	it('should render an HTML element with attributes', () => {
		PicoJSX.render(
			h('div', { id: 'test-id', className: 'my-class' }),
			container
		);
		const div = container.querySelector('#test-id');
		expect(div).not.toBeNull();
		if (div) {
			expect(div.id).toBe('test-id');
			expect(div.className).toBe('my-class');
		}
	});

	it('should render nested HTML elements', () => {
		PicoJSX.render(
			h('div', null, h('span', { className: 'child' }, 'Nested')),
			container
		);
		expect(container.innerHTML).toBe(
			'<div><span class="child">Nested</span></div>'
		);
		const span = container.querySelector('span.child');
		expect(span).not.toBeNull();
		if (span) {
			expect(span.textContent).toBe('Nested');
		}
	});

	it('should render a Fragment without a wrapping DOM element', () => {
		PicoJSX.render(
			h(
				Fragment,
				null,
				h('span', null, 'First'),
				'Second Text',
				h('p', null, 'Third')
			),
			container
		);
		expect(container.childNodes.length).toBe(5);
		expect(container.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
		expect(container.childNodes[1].tagName).toBe('SPAN');
		expect(container.childNodes[1].textContent).toBe('First');
		expect(container.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
		expect(container.childNodes[2].textContent).toBe('Second Text');
		expect(container.childNodes[3].tagName).toBe('P');
		expect(container.childNodes[3].textContent).toBe('Third');
		expect(container.childNodes[4].nodeType).toBe(Node.COMMENT_NODE);
	});

	const SimpleFunctionalComponent = (props) => {
		return h('h1', { className: props.className }, props.message);
	};

	it('should render a simple functional component', () => {
		PicoJSX.render(
			h(SimpleFunctionalComponent, {
				message: 'Hi Functional',
				className: 'functional',
			}),
			container
		);
		expect(container.innerHTML).toBe(
			'<h1 class="functional">Hi Functional</h1>'
		);
		const h1 = container.querySelector('h1.functional');
		expect(h1).not.toBeNull();
		if (h1) {
			expect(h1.textContent).toBe('Hi Functional');
		}
	});

	class SimpleClassComponent extends PicoComponent {
		constructor(props) {
			super(props);
			this.state = { count: 0 };
		}
		render() {
			return h(
				'p',
				{ id: 'class-comp' },
				`${this.props.greeting} - Count: ${this.state.count}`
			);
		}
	}

	it('should render a simple class component with props and initial state', () => {
		PicoJSX.render(
			h(SimpleClassComponent, { greeting: 'Hello Class' }),
			container
		);
		const p = container.querySelector('p#class-comp');
		expect(p).not.toBeNull();
		if (p) {
			expect(p.textContent).toBe('Hello Class - Count: 0');
		}
	});

	it('should clear previous content before rendering', () => {
		container.innerHTML = '<p>Old content</p>';
		PicoJSX.render(h('div', null, 'New content'), container);
		expect(container.innerHTML).toBe('<div>New content</div>');
		expect(container.querySelector('p')).toBeNull();
	});

	// --- Tests for Component Lifecycle and DOM updates ---
	it('should call componentDidMount after a class component is rendered', () => {
		const mountSpy = jest.spyOn(
			SimpleClassComponent.prototype,
			'componentDidMount'
		);
		PicoJSX.render(
			h(SimpleClassComponent, { greeting: 'Mounted' }),
			container
		);
		jest.runAllTimers(); // Ejecutar el setTimeout en render
		expect(mountSpy).toHaveBeenCalledTimes(1);
		mountSpy.mockRestore();
	});

	it('should call componentWillUnmount when a class component is removed', () => {
		class UnmountableComponent extends PicoComponent {
			constructor(props) {
				super(props);
			}
			componentWillUnmount() {
				/* Este es el que queremos espiar */
			}
			render() {
				return h('div', null, 'Unmountable');
			}
		}
		const unmountSpy = jest.spyOn(
			UnmountableComponent.prototype,
			'componentWillUnmount'
		);

		PicoJSX.render(h(UnmountableComponent, {}), container);
		jest.runAllTimers(); // Para el componentDidMount y que _isMounted se ponga a true

		PicoJSX.render(null, container); // Esto debería llamar a disposeNode -> componentWillUnmount sincrónicamente
		// No necesitamos correr timers aquí de nuevo para el unmount si es síncrono.
		expect(unmountSpy).toHaveBeenCalledTimes(1);
		unmountSpy.mockRestore();
	});

	it('should update the DOM when setState is called on a class component', () => {
		PicoJSX.render(
			h(SimpleClassComponent, { greeting: 'Initial State' }),
			container
		);
		jest.runAllTimers();

		let p = container.querySelector('p#class-comp');
		expect(p.textContent).toBe('Initial State - Count: 0');

		const componentInstance = p._PicoInstance;
		expect(componentInstance).toBeDefined();
		expect(componentInstance instanceof SimpleClassComponent).toBe(true);

		if (componentInstance) {
			componentInstance.setState({ count: 5 });
			// Volver a consultar el elemento del DOM DESPUÉS de setState y la actualización síncrona del DOM
			p = container.querySelector('p#class-comp');
			expect(p).not.toBeNull(); // Asegurarse de que el elemento todavía existe (o fue reemplazado por uno igual)
			if (p) {
				expect(p.textContent).toBe('Initial State - Count: 5');
			}
		}
	});

	it('should call componentDidUpdate with prevProps and prevState after setState', (done) => {
		let instanceRef = null; // Para acceder a la instancia fuera del render

		class UpdateListeningComponent extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { val: 10 };
				instanceRef = this; // Capturar la instancia
			}
			componentDidUpdate(prevProps, prevState) {
				expect(prevProps).toEqual(this.props);
				expect(prevState).toEqual({ val: 10 });
				expect(this.state).toEqual({ val: 20 });
				done();
			}
			render() {
				return h('div', null, `Value: ${this.state.val}`);
			}
		}

		PicoJSX.render(
			h(UpdateListeningComponent, { prop: 'fixed' }),
			container
		);
		jest.runAllTimers(); // Para asegurar que _isMounted es true antes de setState

		if (instanceRef) {
			instanceRef.setState({ val: 20 });
		} else {
			done.fail('Component instance not captured for test');
		}
	});

	// --- Tests for Refs and Events ---
	it('should call a callback ref with the DOM element', () => {
		const refCallback = jest.fn();
		PicoJSX.render(h('div', { ref: refCallback }), container);
		expect(refCallback).toHaveBeenCalledTimes(1);
		expect(refCallback).toHaveBeenCalledWith(container.firstChild);
		expect(container.firstChild instanceof HTMLDivElement).toBe(true);
	});

	it('should set the .current property of an object ref to the DOM element', () => {
		const refObject = { current: null };
		PicoJSX.render(h('span', { ref: refObject }), container);
		expect(refObject.current).not.toBeNull();
		expect(refObject.current instanceof HTMLSpanElement).toBe(true);
		expect(refObject.current).toBe(container.firstChild);
	});

	it('should call a callback ref with null when the element is unmounted', () => {
		const refCallback = jest.fn();
		PicoJSX.render(
			h('div', { id: 'reffed-div', ref: refCallback }),
			container
		);
		expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLDivElement)); // Called with element

		PicoJSX.render(null, container); // Unmount
		expect(refCallback).toHaveBeenCalledTimes(2);
		expect(refCallback).toHaveBeenLastCalledWith(null); // Called with null
	});

	it('should set an object ref .current to null when the element is unmounted', () => {
		const refObject = { current: null };
		PicoJSX.render(h('button', { ref: refObject }), container);
		const buttonElement = container.firstChild;
		expect(refObject.current).toBe(buttonElement);

		PicoJSX.render(null, container); // Unmount
		expect(refObject.current).toBeNull();
	});

	it('should correctly update refs when props change (callback to new callback)', () => {
		const oldRefCallback = jest.fn();
		const newRefCallback = jest.fn();

		// Initial render with oldRefCallback
		PicoJSX.render(
			h('div', { ref: oldRefCallback, id: 'ref-change' }),
			container
		);
		const divInstance = container.querySelector('#ref-change');
		expect(oldRefCallback).toHaveBeenCalledWith(divInstance);
		expect(oldRefCallback).toHaveBeenCalledTimes(1);
		expect(newRefCallback).not.toHaveBeenCalled();

		// Re-render with newRefCallback
		PicoJSX.render(
			h('div', { ref: newRefCallback, id: 'ref-change' }),
			container
		);
		expect(oldRefCallback).toHaveBeenCalledTimes(2); // Called again with null
		expect(oldRefCallback).toHaveBeenLastCalledWith(null);
		expect(newRefCallback).toHaveBeenCalledTimes(1);
		expect(newRefCallback).toHaveBeenCalledWith(divInstance); // Should be the same divInstance if not re-created
	});

	it('should attach and trigger an onClick event handler', () => {
		const handleClick = jest.fn();
		PicoJSX.render(
			h('button', { onClick: handleClick }, 'Click Me'),
			container
		);

		const button = container.querySelector('button');
		expect(button).not.toBeNull();

		if (button) {
			button.click(); // Simular click
		}
		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});

// Further tests for Component lifecycle, setState DOM updates, etc.
