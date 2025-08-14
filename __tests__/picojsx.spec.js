/**
 * @jest-environment jsdom
 */
import PicoJSX, {
	h,
	Fragment,
	Component as PicoComponent,
} from '../picojsx.js';
import { jest } from '@jest/globals';

describe('PicoJSX Core API', () => {
	it('should export all required functions', () => {
		expect(typeof PicoJSX).toBe('object');
		expect(typeof h).toBe('function');
		expect(typeof Fragment).toBe('symbol');
		expect(typeof PicoJSX.render).toBe('function');
		expect(typeof PicoComponent).toBe('function');
		expect(typeof PicoJSX.createStore).toBe('function');
	});
});

describe('h function - Virtual DOM', () => {
	it('should create VNodes for HTML elements', () => {
		const vnode = h('div', { id: 'test' }, 'Hello');
		expect(vnode.type).toBe('div');
		expect(vnode.props.id).toBe('test');
		expect(vnode.children).toHaveLength(1);
		expect(vnode.children[0].text).toBe('Hello');
	});

	it('should extract and separate key from props', () => {
		const vnode = h('div', { key: 'mykey', id: 'test' });
		expect(vnode.key).toBe('mykey');
		expect(vnode.props.key).toBeUndefined();
		expect(vnode.props.id).toBe('test');
	});

	it('should normalize text children to VNodes', () => {
		const vnode = h('p', null, 'Text', 123, true, null, undefined);
		// Should filter out null/undefined/boolean and convert to text nodes
		expect(vnode.children).toHaveLength(2);
		expect(vnode.children[0].type).toBe('#text');
		expect(vnode.children[0].text).toBe('Text');
		expect(vnode.children[1].text).toBe('123');
	});

	it('should handle Fragments', () => {
		const vnode = h(Fragment, null, h('span', null), h('p', null));
		expect(vnode.type).toBe(Fragment);
		expect(vnode.children).toHaveLength(2);
	});

	it('should call functional components immediately', () => {
		const FuncComp = jest.fn((props, children) => 
			h('div', props, ...children)
		);
		
		const vnode = h(FuncComp, { id: 'test' }, 'child');
		
		expect(FuncComp).toHaveBeenCalled();
		expect(vnode.type).toBe('div');
		expect(vnode.props.id).toBe('test');
	});

	it('should handle class components', () => {
		class TestComponent extends PicoComponent {
			render() { return h('div', null); }
		}
		
		const vnode = h(TestComponent, { prop: 'value' });
		expect(vnode.type).toBe(TestComponent);
		expect(vnode.props).toEqual({ prop: 'value' });
	});
});

describe('Component class', () => {
	class TestComponent extends PicoComponent {
		constructor(props) {
			super(props);
			this.state = { count: 0 };
		}
		render() {
			return h('div', null, `Count: ${this.state.count}`);
		}
	}

	it('should initialize with props and state', () => {
		const instance = new TestComponent({ id: 'test' });
		expect(instance.props).toEqual({ id: 'test' });
		expect(instance.state).toEqual({ count: 0 });
	});

	it('should update state and trigger re-render', () => {
		const instance = new TestComponent({});
		instance.update = jest.fn();
		
		instance.setState({ count: 5 });
		expect(instance.state.count).toBe(5);
		expect(instance.update).toHaveBeenCalled();
	});

	it('should support function updater for setState', () => {
		const instance = new TestComponent({});
		instance.update = jest.fn();
		
		instance.setState(prev => ({ count: prev.count + 1 }));
		expect(instance.state.count).toBe(1);
	});
});

describe('Rendering', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		jest.useFakeTimers();
	});

	afterEach(() => {
		document.body.removeChild(container);
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('should render HTML elements', () => {
		PicoJSX.render(
			h('div', { id: 'test', className: 'my-class' }, 
				h('span', null, 'Hello'),
				' World'
			),
			container
		);
		
		expect(container.querySelector('#test')).toBeTruthy();
		expect(container.querySelector('.my-class')).toBeTruthy();
		expect(container.textContent).toBe('Hello World');
	});

	it('should render fragments with comment markers', () => {
		PicoJSX.render(
			h(Fragment, null, 
				h('span', null, 'First'),
				h('p', null, 'Second')
			),
			container
		);
		
		const nodes = Array.from(container.childNodes);
		expect(nodes[0].nodeType).toBe(Node.COMMENT_NODE);
		expect(nodes[0].textContent).toBe('fragment-start');
		expect(nodes[nodes.length - 1].textContent).toBe('fragment-end');
		expect(container.querySelector('span').textContent).toBe('First');
		expect(container.querySelector('p').textContent).toBe('Second');
	});

	it('should render functional components', () => {
		const FuncComp = ({ text }) => h('h1', null, text);
		
		PicoJSX.render(h(FuncComp, { text: 'Functional' }), container);
		expect(container.querySelector('h1').textContent).toBe('Functional');
	});

	it('should render class components', () => {
		class ClassComp extends PicoComponent {
			render() {
				return h('p', null, `Hello ${this.props.name}`);
			}
		}
		
		PicoJSX.render(h(ClassComp, { name: 'World' }), container);
		expect(container.querySelector('p').textContent).toBe('Hello World');
	});
});

describe('Component Lifecycle', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		jest.useFakeTimers();
	});

	afterEach(() => {
		document.body.removeChild(container);
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('should call componentDidMount after mounting', () => {
		const didMount = jest.fn();
		
		class MountTest extends PicoComponent {
			componentDidMount() { didMount(); }
			render() { return h('div', null); }
		}
		
		PicoJSX.render(h(MountTest), container);
		expect(didMount).not.toHaveBeenCalled();
		
		jest.runAllTimers();
		expect(didMount).toHaveBeenCalledTimes(1);
	});

	it('should call componentWillUnmount before removal', () => {
		const willUnmount = jest.fn();
		
		class UnmountTest extends PicoComponent {
			componentWillUnmount() { willUnmount(); }
			render() { return h('div', null); }
		}
		
		PicoJSX.render(h(UnmountTest), container);
		jest.runAllTimers();
		
		PicoJSX.render(h('div', null), container);
		expect(willUnmount).toHaveBeenCalledTimes(1);
	});

	it('should call componentDidUpdate with correct prev values', () => {
		let updateArgs;
		
		class UpdateTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { count: 0 };
			}
			componentDidUpdate(prevProps, prevState) {
				updateArgs = { prevProps, prevState };
			}
			render() {
				return h('div', null, this.state.count);
			}
		}
		
		PicoJSX.render(h(UpdateTest, { id: 'test' }), container);
		jest.runAllTimers();
		
		const instance = container.querySelector('div')._picoInstance;
		instance.setState({ count: 1 });
		
		expect(updateArgs).toEqual({
			prevProps: { id: 'test' },
			prevState: { count: 0 }
		});
	});
});

describe('Virtual DOM Diffing', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		jest.useFakeTimers();
	});

	afterEach(() => {
		document.body.removeChild(container);
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('should patch elements instead of replacing them', () => {
		class UpdateTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { text: 'initial', className: 'old' };
			}
			render() {
				return h('p', { 
					id: 'para', 
					className: this.state.className 
				}, this.state.text);
			}
		}
		
		PicoJSX.render(h(UpdateTest), container);
		jest.runAllTimers();
		
		const p1 = container.querySelector('#para');
		p1.dataset.marked = 'yes'; // Mark element to track it
		
		const instance = p1._picoInstance;
		instance.setState({ text: 'updated', className: 'new' });
		
		const p2 = container.querySelector('#para');
		expect(p2).toBe(p1); // Same element reference
		expect(p2.dataset.marked).toBe('yes'); // Our mark is still there
		expect(p2.textContent).toBe('updated');
		expect(p2.className).toBe('new');
	});

	it('should handle dynamic lists with keys efficiently', () => {
		class ListTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { 
					items: [
						{ id: 1, text: 'First' },
						{ id: 2, text: 'Second' }
					]
				};
			}
			render() {
				return h('ul', null, 
					...this.state.items.map(item => 
						h('li', { key: item.id }, item.text)
					)
				);
			}
		}
		
		PicoJSX.render(h(ListTest), container);
		jest.runAllTimers();
		
		// Mark elements to track them
		const li1 = container.querySelectorAll('li')[0];
		const li2 = container.querySelectorAll('li')[1];
		li1.dataset.original = 'first';
		li2.dataset.original = 'second';
		
		const instance = container.querySelector('ul')._picoInstance;
		
		// Reorder items
		instance.setState({ 
			items: [
				{ id: 2, text: 'Second' },
				{ id: 1, text: 'First' },
				{ id: 3, text: 'Third' }
			]
		});
		
		const lis = container.querySelectorAll('li');
		expect(lis[0].dataset.original).toBe('second'); // Reordered, not recreated
		expect(lis[1].dataset.original).toBe('first');
		expect(lis[2].dataset.original).toBeUndefined(); // New item
		expect(lis[2].textContent).toBe('Third');
	});

	it('should preserve child component state during parent updates', () => {
		class Child extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { childValue: 100 };
			}
			render() {
				return h('span', null, `Child: ${this.state.childValue}`);
			}
		}
		
		class Parent extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { parentValue: 0 };
			}
			render() {
				return h('div', null,
					h('p', null, `Parent: ${this.state.parentValue}`),
					h(Child, { someProp: this.state.parentValue })
				);
			}
		}
		
		PicoJSX.render(h(Parent), container);
		jest.runAllTimers();
		
		// Update child state
		const childSpan = container.querySelector('span');
		const childInstance = childSpan._picoInstance;
		childInstance.setState({ childValue: 200 });
		expect(childSpan.textContent).toBe('Child: 200');
		
		// Update parent
		const parentDiv = container.querySelector('div');
		const parentInstance = parentDiv._picoInstance;
		parentInstance.setState({ parentValue: 1 });
		
		// Child state should be preserved
		expect(container.querySelector('span').textContent).toBe('Child: 200');
		expect(container.querySelector('p').textContent).toBe('Parent: 1');
	});

	it('should naturally preserve focus on inputs', () => {
		class InputTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { value: '', label: 'Initial' };
			}
			handleInput = (e) => {
				this.setState({ value: e.target.value });
			}
			render() {
				return h('div', null,
					h('label', null, this.state.label),
					h('input', { 
						value: this.state.value,
						onInput: this.handleInput
					})
				);
			}
		}
		
		PicoJSX.render(h(InputTest), container);
		jest.runAllTimers();
		
		const input = container.querySelector('input');
		input.focus();
		
		// Update state
		const instance = container.querySelector('div')._picoInstance;
		instance.setState({ label: 'Updated' });
		
		// Focus should be preserved (in real browser, jsdom limitations apply)
		expect(document.activeElement).toBe(input);
	});
});

describe('Event Handling', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it('should attach and update event handlers', () => {
		const handler1 = jest.fn();
		const handler2 = jest.fn();
		
		class EventTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { useFirst: true };
			}
			render() {
				return h('button', { 
					onClick: this.state.useFirst ? handler1 : handler2 
				}, 'Click');
			}
		}
		
		PicoJSX.render(h(EventTest), container);
		const button = container.querySelector('button');
		
		button.click();
		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).not.toHaveBeenCalled();
		
		const instance = button._picoInstance;
		instance.setState({ useFirst: false });
		
		button.click();
		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledTimes(1);
	});
});

describe('Refs', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it('should support callback and object refs', () => {
		const callbackRef = jest.fn();
		const objectRef = { current: null };
		
		PicoJSX.render(
			h('div', null,
				h('span', { ref: callbackRef }, 'Callback'),
				h('input', { ref: objectRef })
			),
			container
		);
		
		expect(callbackRef).toHaveBeenCalledWith(container.querySelector('span'));
		expect(objectRef.current).toBe(container.querySelector('input'));
	});

	it('should clean up refs on unmount', () => {
		const callbackRef = jest.fn();
		const objectRef = { current: null };
		
		PicoJSX.render(
			h('div', null,
				h('span', { ref: callbackRef }),
				h('input', { ref: objectRef })
			),
			container
		);
		
		// Unmount
		PicoJSX.render(h('div', null), container);
		
		expect(callbackRef).toHaveBeenLastCalledWith(null);
		expect(objectRef.current).toBeNull();
	});
});

describe('Store', () => {
	it('should manage global state', () => {
		const store = PicoJSX.createStore({ count: 0 });
		expect(store.getState()).toEqual({ count: 0 });
		
		store.setState({ count: 5 });
		expect(store.getState()).toEqual({ count: 5 });
		
		store.setState(state => ({ count: state.count + 1 }));
		expect(store.getState()).toEqual({ count: 6 });
	});

	it('should notify subscribers of changes', () => {
		const store = PicoJSX.createStore({ value: 'initial' });
		const listener = jest.fn();
		
		const unsubscribe = store.subscribe(listener);
		store.setState({ value: 'updated' });
		
		expect(listener).toHaveBeenCalledWith(
			{ value: 'updated' },
			{ value: 'initial' }
		);
		
		unsubscribe();
		store.setState({ value: 'final' });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	describe('localStorage persistence', () => {
		let mockLocalStorage;

		beforeEach(() => {
			const storage = {};
			mockLocalStorage = {
				getItem: jest.fn(key => storage[key] || null),
				setItem: jest.fn((key, value) => { storage[key] = value; }),
			};
			Object.defineProperty(window, 'localStorage', {
				value: mockLocalStorage,
				writable: true
			});
		});

		it('should persist and load from localStorage', () => {
			mockLocalStorage.getItem.mockReturnValue(
				JSON.stringify({ user: 'Jane' })
			);
			
			const store = PicoJSX.createStore(
				{ user: null },
				{ storageKey: 'test-store' }
			);
			
			expect(store.getState()).toEqual({ user: 'Jane' });
			
			store.setState({ user: 'John' });
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'test-store',
				JSON.stringify({ user: 'John' })
			);
		});
	});
});

describe('Fragments', () => {
	let container;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		jest.useFakeTimers();
	});

	afterEach(() => {
		document.body.removeChild(container);
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('should handle fragments within component trees', () => {
		class FragmentTest extends PicoComponent {
			constructor(props) {
				super(props);
				this.state = { items: ['A', 'B'] };
			}
			render() {
				return h('div', null,
					h('h1', null, 'Title'),
					h(Fragment, null,
						...this.state.items.map(item => 
							h('span', { key: item }, item)
						)
					)
				);
			}
		}
		
		PicoJSX.render(h(FragmentTest), container);
		jest.runAllTimers();
		
		expect(container.querySelectorAll('span').length).toBe(2);
		
		const instance = container.querySelector('div')._picoInstance;
		instance.setState({ items: ['A', 'B', 'C'] });
		
		expect(container.querySelectorAll('span').length).toBe(3);
		expect(container.querySelectorAll('span')[2].textContent).toBe('C');
	});
});