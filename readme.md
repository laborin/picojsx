# PicoJSX: Guide and Documentation
[![Node.js CI for PicoJSX](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml/badge.svg)](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml)

PicoJSX is a lightweight frontend library inspired by Nano JSX, designed for creating user interfaces using JSX or direct calls to the `h` (hyperscript) function. It offers a component model with state, lifecycle methods, an optional global store with `localStorage` persistence, and automatic/manual UI update management.

**Version:** 1.1.0

## Key Features

*   **JSX Syntax:** Write your components declaratively.
*   **Class-Based Components:** Define components with state (`this.state`) and props (`this.props`).
*   **Functional Components:** Define simpler, stateless components.
*   **Component Lifecycle:** Methods like `componentDidMount`, `componentWillUnmount`, and `componentDidUpdate`.
*   **`h` Function (Hyperscript):** Alternative to JSX for creating elements.
*   **Fragments (`<></>` or `PicoJSX.Fragment`):** Group multiple elements without a parent DOM node.
*   **`className` Support:** Use `className` prop for CSS classes; it's automatically converted to the `class` attribute.
*   **Refs:** Support for `ref` prop to get direct access to DOM elements (using callback refs or object refs).
*   **Global Store:** Simple global state management with `localStorage` persistence.
*   **UI Updates:**
    *   By default, `setState` automatically updates the UI (`component.autoUpdate = true`).
    *   Manual updates can be opted-in (`component.autoUpdate = false; this.update()`).
    *   Debouncing support for performance optimization (`component.updateDebounceDelay = ms`).
*   **Focus Management:** Automatically preserves focus and cursor position in inputs upon re-render.
*   **Direct DOM Manipulation:** Performs direct DOM manipulation for updates (no Virtual DOM).
*   **`dangerouslySetInnerHTML`:** An object with a `__html` key (e.g., `{ __html: '<span>Hello</span>' }`) allows you to set raw HTML content inside an element. Use with caution as it can expose your users to cross-site scripting (XSS) attacks if the HTML source is not sanitized.

## Installation / Usage

1.  **Install from npm:**
    Open your project's terminal and run:
    ```bash
    npm install @laborin/picojsx
    # or if you use yarn
    # yarn add @laborin/picojsx
    ```

2.  **Import PicoJSX in your JavaScript/JSX files:**
    ```javascript
    // You can import the full PicoJSX object
    import PicoJSX from '@laborin/picojsx';
    // Or import specific parts you need (recommended)
    import { h, Fragment, render, Component, createStore } from '@laborin/picojsx';
    ```
    (See "Main API" section below for more on imports).

3.  **Configure your JSX transpiler (if using JSX):**
    When you use JSX syntax, your code needs to be transformed into JavaScript function calls. This is done by a transpiler like Babel, esbuild, or the TypeScript compiler.

    You need to tell the transpiler which functions to use for this transformation. For PicoJSX, these are `PicoJSX.h` (or just `h` if imported directly) for elements, and `PicoJSX.Fragment` (or `Fragment`) for JSX fragments (`<></>`).

    There are two main ways to configure this:

    *   **Global Configuration (Recommended for most projects):**
        You can set the JSX factory and fragment functions globally in your build tool's configuration. This way, you don't need to add comments to every JSX file.
        *   **For Babel:** In your `babel.config.js` or `.babelrc` file, you would use the classic runtime configuration with `@babel/preset-react`. If you are using Webpack, you would typically configure `babel-loader` to use this Babel configuration.
            ```json
            {
              "presets": [[
                "@babel/preset-react", 
                {
                  "pragma": "PicoJSX.h",          // Or "h" if using named imports and configuring pragma accordingly
                  "pragmaFrag": "PicoJSX.Fragment" // Or "Fragment" if using named imports
                }
              ]]
            }
            ```
            Make sure to import `PicoJSX` or `h` and `Fragment` in the scope where JSX is used if your transpiler doesn't handle automatic imports based on these pragmas.

        *   **For esbuild:** When calling esbuild from the command line or in its API options:
            ```bash
            esbuild yourfile.jsx --jsx-factory=PicoJSX.h --jsx-fragment=PicoJSX.Fragment --bundle ...
            # Or if using named imports: esbuild yourfile.jsx --jsx-factory=h --jsx-fragment=Fragment ...
            ```
        *   **For TypeScript:** In your `tsconfig.json`. Typically, you'd set `"jsx": "preserve"` to let another tool (like Babel or esbuild) handle the transformation. If TypeScript were to handle it directly with custom pragmas (less common for libraries not named React), it might look like:
            ```json
            {
              "compilerOptions": {
                // Best approach: preserve JSX and let Babel/esbuild handle it with the pragmas above.
                "jsx": "preserve", 

                // Alternative: If TypeScript were to transpile to PicoJSX directly (requires TS 4.0+ for jsxFactory/jsxFragmentFactory)
                // "jsx": "react", // Tells TS to use a factory, but we specify which one below
                // "jsxFactory": "PicoJSX.h",          // Or "h" if that's what you import
                // "jsxFragmentFactory": "PicoJSX.Fragment" // Or "Fragment"
              }
            }
            ```
            For most setups, `"jsx": "preserve"` in `tsconfig.json` combined with Babel or esbuild configured for PicoJSX pragmas is the most straightforward path.

    *   **Per-File Pragma Comments (Needed if no global config or for overrides):**
        If you haven't configured your transpiler globally, or if you need to override a global setting for a specific file (like for using React for the full project but PicoJSX for a single component), you can add these comments at the top of your `.js` or `.jsx` file:

        *   If you import the default `PicoJSX` object:
            ```javascript
            import PicoJSX from '@laborin/picojsx';

            /** @jsx PicoJSX.h */
            /** @jsxFrag PicoJSX.Fragment */
            ```
        *   If you use named imports for `h` and `Fragment`:
            ```javascript
            import { h, Fragment } from '@laborin/picojsx';

            /** @jsx h */
            /** @jsxFrag Fragment */
            ```
        The per-file pragma tells the transpiler what to use for that specific file.

    **Why are these needed?** JSX is just syntactic sugar. It looks like HTML but isn't valid JavaScript on its own. A transpiler converts `<div />` into `h('div')` (or `PicoJSX.h('div')`). The pragmas tell the transpiler *which exact function* to call.

## Main API

The library exposes these key parts. When using npm and ES modules, you'll typically use named imports.

*   `h`: The hyperscript function (JSX factory). (`PicoJSX.h` if using default import).
*   `Fragment`: The Fragment symbol. (`PicoJSX.Fragment` if using default import).
*   `render`: Function to render components into the DOM.
*   `Component`: Base class for stateful components.
*   `createStore`: Function to create a global store.

If using ES6 modules (recommended way after `npm install`):
```javascript
// Recommended: Use named imports for clarity, especially for h and Fragment with JSX
import { h, Fragment, render, Component, createStore } from '@laborin/picojsx';

// Alternatively, you can import the default object that contains all exports
import PicoJSX from '@laborin/picojsx';
// Then you might use PicoJSX.h, PicoJSX.Fragment, etc.
// And your pragmas would be /** @jsx PicoJSX.h */ and /** @jsxFrag PicoJSX.Fragment */
```

---

## 1. `h(type, props, ...children)`

The JSX factory function (often called a hyperscript function). It transforms JSX calls into DOM elements or component instances.

*   `type`: Can be a `string` (HTML tag name like 'div'), a `Function` (your Component class or a functional component), or the `Fragment` symbol.
*   `props`: An `object` (or `null`) holding attributes, event listeners (`onClick`, etc.), `style` (string or object), `ref`, `className`, `dangerouslySetInnerHTML`, and other properties.
    *   **`dangerouslySetInnerHTML`**: An object with a `__html` key (e.g., `{ __html: '<span>Hello</span>' }`) lets you inject raw HTML inside an element. Be careful! This can open you up to cross-site scripting (XSS) attacks if the HTML isn't from a trusted source.
*   `children`: Any child elements. For functional components, these get passed as the second argument to the function, bundled into an array.

**Example (direct usage, no JSX):**
```javascript
const { h } = PicoJSX;

const element = h(
  'div',
  { id: 'my-div', className: 'container', onClick: () => console.log('Clicked!') },
  h('h1', null, 'Hello World'),
  'This is just some text.'
);
```

### `dangerouslySetInnerHTML`

PicoJSX supports the `dangerouslySetInnerHTML` prop, similar to React. It lets you set raw HTML content directly into a DOM element. This is powerful but dangerous (hence the name!). Use it with extreme caution, especially if the HTML comes from user input, as it can create security holes (XSS).

To use it, pass an object with a `__html` key:

```javascript
/** @jsx PicoJSX.h */
const { render } = PicoJSX;

const RawHtmlComponent = () => {
  const myHtmlString = "<p style='color: red;'>This is <strong>raw</strong> HTML.</p>";
  // Make sure myHtmlString is safe if it comes from outside!
  return (
    <div dangerouslySetInnerHTML={{ __html: myHtmlString }} />
  );
};

// render(<RawHtmlComponent />, document.getElementById('app'));
```

Always sanitize HTML if it isn't hardcoded or from a fully trusted source before using this.

---

## 2. `Fragment`

A special symbol you can use with `h`, or more commonly via `<></>` in JSX. It lets you group multiple children without adding an extra wrapper div or span to the actual DOM.

**Example (JSX):**
```javascript
/** @jsx PicoJSX.h */
/** @jsxFrag PicoJSX.Fragment */
const { Component } = PicoJSX; // Fragment symbol import isn't needed for <></>

class MyTableRows extends Component {
  render() {
    // These two <td> elements will be direct children of wherever
    // <MyTableRows /> gets rendered, without a wrapping element.
    return (
      <>
        <td>Cell 1</td>
        <td>Cell 2</td>
      </>
      // Could also write: <PicoJSX.Fragment>...</PicoJSX.Fragment>
    );
  }
}
```

---

## 3. `render(jsxInput, parentDomElement)`

This function takes your JSX/component output (`jsxInput`) and renders it into a specified DOM element (`parentDomElement`), replacing anything that was previously inside it.

*   `jsxInput`: The thing you want to render (e.g., `<App />`, `h('h1', null, 'Hi')`).
*   `parentDomElement`: The container DOM element where the UI should appear.

**Example:**
```html
<div id="app"></div>
<script>
  /** @jsx PicoJSX.h */
  const { h, render } = PicoJSX;

  // A simple functional component
  const Greeting = ({ name }) => h('h1', null, `Hello, ${name}`);
  render(<Greeting name="Pico" />, document.getElementById('app'));

  // Example with a functional component that accepts children
  const Layout = (props, children) => { // children is the array: [<p>Child 1</p>, <p>Child 2</p>]
    return (
      h('div', { style: 'border: 1px solid green; padding: 10px; margin-top: 5px;' },
        h('h3', null, props.title),
        ...children // Spread the children array elements here
      )
    );
  };

  // Using it:
  // render(
  //   <Layout title="My Functional Layout">
  //     <p>Child 1 for Layout</p>
  //     <p>Child 2 for Layout</p>
  //   </Layout>,
  //   document.getElementById('another-app')
  // );
</script>
```

---

## 4. `Component`

The base class for creating stateful components in PicoJSX. Extend this class to make your own components.

### Key Component Properties:

*   `this.props`: An object containing properties passed *to* the component (e.g., `<MyComponent title="Hi" />` makes `this.props.title` available). Treat props as immutable within the component.
*   `this.state`: An object holding the component's internal state. Only change state using `this.setState()`.
*   `this.autoUpdate`: A boolean (defaults to `true`). If `true`, calling `setState` automatically triggers a re-render (`this.update()`). Set it to `false` in the constructor if you want to control updates manually.
*   `this.updateDebounceDelay`: A number (defaults to `0`). Sets the debounce delay in milliseconds for the `update()` method. When set to a value greater than 0, multiple rapid calls to `update()` will be debounced, executing only once after the specified delay. This is useful for performance optimization when dealing with frequent state changes (e.g., text input, resize events).

### Key Component Methods:

*   `constructor(props)`: The place to initialize `this.state` and bind event handlers. Remember to call `super(props)` first!
*   `setState(updater)`: Updates the component's state. `updater` can be an object with new state values to merge, or a function `(prevState, props) => newStateChanges` for updates based on previous state.
*   `update()`: Manually triggers a re-render. You only need to call this if `this.autoUpdate` is `false`. If `updateDebounceDelay` is set, the update will be debounced.
*   `render()`: **Required method.** You must implement this! It should return the JSX (or `h` calls) that defines the component's UI based on its current `props` and `state`.
*   `componentDidMount()`: Called *after* the component is added to the DOM. Good place for setting up subscriptions, timers, or fetching initial data.
*   `componentWillUnmount()`: Called *right before* the component is removed from the DOM. Essential for cleanup (e.g., clearing timers, removing listeners, unsubscribing).
*   `componentDidUpdate(prevProps, prevState)`: Called after the component re-renders due to state or prop changes (but not after the initial render). Useful for side effects based on updates.

**Component Example:**
```javascript
/** @jsx PicoJSX.h */
const { Component } = PicoJSX;

class Counter extends Component {
  constructor(props) {
    super(props); // Always call super!
    this.state = {
      count: 0
    };
    // this.autoUpdate = false; // Uncomment for manual update control

    // Bind event handler (alternative to arrow function property)
    // this.increment = this.increment.bind(this);
  }

  componentDidMount() {
    console.log('Counter Mounted!');
    // Example: Fetch initial count? Set up a timer?
  }

  componentDidUpdate(prevProps, prevState) {
    // Only log if the count actually changed
    if (prevState.count !== this.state.count) {
      console.log('Counter changed from', prevState.count, 'to', this.state.count);
      // Example: Maybe update document title?
      // document.title = `Count is ${this.state.count}`;
    }
  }

  componentWillUnmount() {
    console.log('Counter Unmounting!');
    // Example: Clean up timers or subscriptions started in componentDidMount
  }

  // Using an arrow function property automatically binds `this`
  increment = () => {
    // Update state based on previous state
    this.setState(prevState => ({ count: prevState.count + 1 }));
    // If autoUpdate were false, we'd need this:
    // if (!this.autoUpdate) this.update();
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

// How to use it:
// render(<Counter />, document.getElementById('some-container'));
```

### Controlling Automatic Rendering

By default (`this.autoUpdate = true`), `setState` triggers a re-render automatically.
```javascript
class MyAutoComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { message: 'Hello' };
    // No need to set this.autoUpdate, it's true by default
  }
  changeMessage = () => {
    // This setState call will automatically cause a re-render
    this.setState({ message: 'World' });
  }
  render() { return <div>{this.state.message}</div> }
}
```

For manual control, set `this.autoUpdate = false;` in the constructor and call `this.update()` after `setState` (or whenever you want to re-render).
```javascript
class MyManualComponent extends Component {
  constructor(props) {
    super(props);
    this.autoUpdate = false; // Take control!
    this.state = { data: null, loading: false };
  }

  fetchData = async () => {
    this.setState({ loading: true });
    // We need to update NOW to show the loading state
    this.update();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = { info: 'Data loaded successfully!' };

    this.setState({ data: data, loading: false });
    // And update AGAIN to show the result
    this.update();
  }

  render() {
    if (this.state.loading) return <p>Loading...</p>;
    return this.state.data
      ? <div>{this.state.data.info}</div>
      : <button onClick={this.fetchData}>Load Data</button>;
  }
}
```

### Focus Management

PicoJSX automatically preserves focus and cursor position when components re-render. This works for elements with IDs (backward compatibility) and now also for elements without IDs using an intelligent path-based tracking system.

```javascript
class InputForm extends Component {
  state = { text: '' };

  handleInput = (e) => {
    this.setState({ text: e.target.value });
    // Focus and cursor position are automatically preserved
  }

  render() {
    return (
      <input
        type="text"
        value={this.state.text}
        onInput={this.handleInput}
        placeholder="Type something..."
      />
    );
  }
}
```

The focus restoration system:
- Works with or without element IDs
- Preserves cursor position and text selection
- Handles nested elements and fragments
- Only restores focus if the element type remains the same
```

### Debouncing Updates

For performance-sensitive scenarios with frequent updates (like real-time search or resize handlers), you can use `updateDebounceDelay` to debounce the rendering:

```javascript
class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = { query: '', results: [] };
    // Debounce updates by 300ms
    this.updateDebounceDelay = 300;
  }

  handleInput = (e) => {
    const query = e.target.value;
    // This will trigger a debounced update
    this.setState({ query });
    
    // Simulate a search that would happen after debouncing
    if (query) {
      // In a real app, this might be an API call
      const results = this.searchData(query);
      this.setState({ results });
    } else {
      this.setState({ results: [] });
    }
  }

  searchData(query) {
    // Mock search function
    const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
    return data.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.query}
          onInput={this.handleInput}
          placeholder="Search fruits..."
        />
        <ul>
          {this.state.results.map(result => 
            <li key={result}>{result}</li>
          )}
        </ul>
      </div>
    );
  }
}
```

### Refs

Sometimes you need direct access to a DOM element managed by PicoJSX – maybe to measure it, manually trigger focus, or use a third-party library. That's what `ref`s are for. PicoJSX supports two kinds:

**Callback Refs:** Pass a function to the `ref` prop. This function gets called with the DOM element instance when the component mounts, and with `null` when it unmounts.

```javascript
class CallbackRefForm extends Component {
  constructor(props) {
    super(props);
    // We'll store the DOM node here
    this.textInput = null;
  }

  // The callback function to pass to the ref prop
  setTextInputRef = element => {
    console.log('Callback ref called with:', element);
    this.textInput = element;
  };

  focusTextInput = () => {
    // Use the stored DOM node
    if (this.textInput) this.textInput.focus();
  };

  componentDidMount() {
    // Example: focus the input right after it mounts
    this.focusTextInput();
  }

  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef} // Pass the callback here
          defaultValue="Focus me with callback ref!"
        />
        {/* Button to test focusing later */} 
        <button onClick={this.focusTextInput}>Focus Input Manually</button>
      </div>
    );
  }
}
```

**Object Refs:** Create an object with a `current` property (e.g., `this.myRef = { current: null }`) and pass it to the `ref` prop. PicoJSX will put the DOM element (or component instance) onto the `current` property for you.

```javascript
class ObjectRefForm extends Component {
  constructor(props) {
    super(props);
    // Create the ref object
    this.inputRef = { current: null };
  }

  componentDidMount() {
    // Access the DOM node via the .current property
    if (this.inputRef.current) {
      console.log('Object ref .current:', this.inputRef.current);
      this.inputRef.current.value = 'Set via object ref!';
      this.inputRef.current.focus();
    }
  }

  render() {
    return (
      <input
        id="obj-ref-input"
        type="text"
        ref={this.inputRef} // Pass the object ref here
        placeholder="Object ref example"
      />
    );
  }
}
```
*Note:* If you put a ref on a PicoJSX class component element (e.g., `<MyPicoComponent ref={this.compRef} />`), you'll get the *instance* of `MyPicoComponent` in the ref, not its underlying DOM element.

---

## 5. `createStore(initialState, options = {})`

Creates a simple global store for sharing state across different parts of your application.

*   `initialState`: The starting value for your store's state.
*   `options`: An optional configuration object.
    *   `options.storageKey`: A `string`. If you provide this, the store will automatically try to load its state from `localStorage` using this key when it's created, and it will save the state back to `localStorage` every time it's updated.

The `createStore` function returns a store object with three methods:

*   `getState()`: Returns the current state value.
*   `setState(updater)`: Updates the state. `updater` can be an object to merge, or a function `(currentState) => newState`.
*   `subscribe(listener)`: Registers a `listener` function that will be called whenever the state changes. The listener receives `(newState, oldState)`. It returns an `unsubscribe` function – call this when your component unmounts to prevent memory leaks!

**Basic Store Example:**
```javascript
/** @jsx PicoJSX.h */
const { createStore, Component, render } = PicoJSX;

// Create the store
const counterStore = createStore({ count: 0 });

// Create a component that uses the store
class StoreCounterDisplay extends Component {
  constructor(props) {
    super(props);
    // Initialize local state from the global store
    this.state = { currentStoreCount: counterStore.getState().count };
    this.unsubscribe = null;
  }

  componentDidMount() {
    // 3. Subscribe to store changes
    this.unsubscribe = counterStore.subscribe((newState, oldState) => {
      // When store changes, update component's local state
      if (newState.count !== this.state.currentStoreCount) { // Avoid unnecessary updates
          console.log('Store changed! Updating component state.');
          this.setState({ currentStoreCount: newState.count });
      }
    });
  }

  componentWillUnmount() {
    // 4. Unsubscribe when component is removed!
    if (this.unsubscribe) {
        console.log('Unsubscribing from store.');
        this.unsubscribe();
    }
  }

  render() {
    // Display the local state that mirrors the store
    return <p>Store Count: {this.state.currentStoreCount}</p>;
  }
}

// --- How to interact with the store from elsewhere ---

function incrementStore() {
    counterStore.setState(currentState => ({ count: currentState.count + 1 }));
}

function resetStore() {
    counterStore.setState({ count: 0 });
}

// --- Render the component and add buttons to change the store ---

// Assuming you have <div id="store-app"></div> in your HTML
// render(
//     <>
//         <StoreCounterDisplay />
//         <button onClick={incrementStore}>Increment Store</button>
//         <button onClick={resetStore}>Reset Store</button>
//     </>,
//     document.getElementById('store-app')
// );
```

**Store with `localStorage` Persistence:**
```javascript
// Create a store that saves/loads the user object under the key 'myAppUserStore'
const userStore = createStore(
  { username: null, preferences: { theme: 'light' } }, // Default state if nothing in storage
  { storageKey: 'myAppUserStore' } // The key for localStorage
);

// Now, when the page loads, if 'myAppUserStore' is in localStorage, 
// userStore will start with that data.
// Any call to userStore.setState(...) will automatically save the new state.

// Example:
// userStore.setState({ username: 'Alice' });
// // If you refresh the page, the username should still be Alice!
// console.log(userStore.getState().username); // 'Alice' (after setting or page load)
```

---

## Complete Example (Putting It Together)

Here's a slightly more involved example showing a counter, an input, dynamically showing/hiding a child, and using a persistent global store for a theme.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PicoJSX Demo</title>
    <script src="picojsx.js"></script> <!-- Make sure the path is right! -->
    <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
        .app-container { border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
        .child-component { border: 1px dashed green; padding: 10px; margin-top: 10px; background-color: #e9f5e9; }
        button { margin: 5px; padding: 8px 12px; cursor: pointer; border-radius: 3px; border: 1px solid #ccc; }
        input[type="text"] { margin: 5px; padding: 8px; border-radius: 3px; border: 1px solid #ccc; }
        hr { margin: 15px 0; border: 0; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div id="app-root"></div>

    <script>
        /** @jsx PicoJSX.h */
        /** @jsxFrag PicoJSX.Fragment */
        const { h, Fragment, render, Component, createStore } = PicoJSX;

        // === Persistent Global Store for Theme ===
        const themeStore = createStore(
            { currentTheme: 'light' }, // Default theme
            { storageKey: 'appThemeStore' } // Saves to localStorage
        );

        // Helper function to toggle the theme in the store
        function toggleGlobalTheme() {
            themeStore.setState(state => ({
                currentTheme: state.currentTheme === 'light' ? 'dark' : 'light'
            }));
        }

        // === Child Component ===
        class Child extends Component {
            componentDidMount() {
                console.log('Child mounted with message:', this.props.message);
            }
            componentWillUnmount() {
                console.log('Child is being unmounted.');
            }
            render() {
                // Gets message via props from the App component
                return (
                    <div className="child-component">
                        <p>Hi, I'm the child component!</p>
                        <p>My message is: "{this.props.message}"</p>
                    </div>
                );
            }
        }

        // === Main App Component ===
        class App extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    count: 0,
                    inputValue: '',
                    showChild: true,
                    // Initialize theme from the store
                    theme: themeStore.getState().currentTheme
                };
                this.themeUnsubscribe = null;
                // this.autoUpdate = false; // Could uncomment to test manual updates
            }

            componentDidMount() {
                console.log('App mounted');
                // Subscribe to theme changes
                this.themeUnsubscribe = themeStore.subscribe(newState => {
                    // Update local state when global theme changes
                    if (newState.currentTheme !== this.state.theme) {
                         this.setState({ theme: newState.currentTheme });
                         // if (!this.autoUpdate) this.update(); // Manual update needed if disabled
                    }
                });
            }

            componentWillUnmount() {
                console.log('App will unmount');
                // IMPORTANT: Unsubscribe from the store
                if (this.themeUnsubscribe) this.themeUnsubscribe();
            }

            // --- Event Handlers (using arrow functions for auto-binding) ---
            increment = () => {
                this.setState(prev => ({ count: prev.count + 1 }));
                // if (!this.autoUpdate) this.update();
            }

            handleInput = (e) => {
                this.setState({ inputValue: e.target.value });
                // if (!this.autoUpdate) this.update();
            }

            toggleChild = () => {
                this.setState(prev => ({ showChild: !prev.showChild }));
                // if (!this.autoUpdate) this.update();
            }

            render() {
                // Apply dynamic styles based on theme from state
                const appStyle = {
                    backgroundColor: this.state.theme === 'dark' ? '#333' : '#f8f9fa',
                    color: this.state.theme === 'dark' ? '#fff' : '#333',
                    padding: '20px',
                    border: '1px solid #aaa',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s, color 0.3s' // Smooth theme transition
                };

                return (
                    // Using a Fragment <></> because we have multiple top-level things
                    <div style={appStyle} className="app-container">
                        {/* Display title passed as prop */}
                        <h1>{this.props.title} (Theme: {this.state.theme})</h1>
                        
                        {/* Button to change the global theme */}
                        <button onClick={toggleGlobalTheme}>Toggle Global Theme</button>
                        <hr />
                        
                        <h2>Local Counter</h2>
                        <p>Current Value: {this.state.count}</p>
                        <button onClick={this.increment}>Add 1</button>
                        <hr />

                        <h2>Controlled Input Example</h2>
                        <input
                            id="main-input" // ID helps with focus management
                            type="text"
                            value={this.state.inputValue}
                            onInput={this.handleInput}
                            placeholder="Type something..."
                        />
                        <p>You typed: <em>{this.state.inputValue || 'nothing yet'}</em></p>
                        <hr />

                        <h2>Dynamic Child Component</h2>
                        <button onClick={this.toggleChild}>
                            {this.state.showChild ? 'Hide Child Component' : 'Show Child Component'}
                        </button>
                        
                        {/* Conditionally render the Child component */}
                        {this.state.showChild && <Child message="Passed from App!" />}
                        
                        <hr />
                        {/* Example of dangerouslySetInnerHTML */}
                        <div dangerouslySetInnerHTML={{__html: "<p>This is some <i>raw HTML</i> inserted carefully.</p>"}}></div>
                    </div>
                );
            }
        }

        // === 4. Render the App into the DOM ===
        const rootElement = document.getElementById('app-root');
        if (rootElement) {
            render(<App title="My PicoJSX Application Demo" />, rootElement);
        } else {
            console.error('Could not find element with id="app-root" to render into.');
        }
    </script>
</body>
</html>
```

---

## Key Concepts: State, Rendering, and Performance

To work effectively with PicoJSX, it's helpful to understand how it handles component state and re-renders, as this differs from libraries that use a Virtual DOM, like React.

When a parent component (or any ancestor) in PicoJSX re-renders via its `update()` method, **the internal state of its child components is generally lost and reset**. This behavior occurs because, by default, the `update()` process involves unmounting, destroying, and then reconstructing child components from scratch with their initial state. PicoJSX does not implement a Virtual DOM for complex "diffing" (comparison), nor does it have advanced mechanisms to preserve instances of components that haven't directly changed during a full re-render.

**Is this inefficient? Not necessarily.** This characteristic shifts the responsibility for performance optimization to the developer. PicoJSX components offer flexibility in controlling their update cycle:

*   **Automatic Updates (`this.autoUpdate = true`):** The default. It's convenient, as `setState` automatically calls `update()`. However, this can lead to state resetting in children if not managed carefully.
*   **Manual Updates (`this.autoUpdate = false`):** This allows precise control over when a component re-renders. You decide when to call `this.update()`.

**Recommended Practices & Techniques:**

To prevent unwanted state loss in child components that manage their own significant state, and to leverage PicoJSX's strengths:

1.  **Selective `update()` Calls:** If using `this.autoUpdate = false`, only call `this.update()` on a parent component when its overall structure or fundamental props affecting children *must* change.
2.  **Targeted DOM Manipulation with Refs:** This is where PicoJSX's closeness to the DOM truly shines. If a component has `this.autoUpdate = false` (or even if it's true, but you want to avoid a full re-render for a minor change), you can use `ref`s to get direct access to its underlying DOM elements. **Instead of calling `this.update()`, you can then make precise, direct manipulations to these DOM elements yourself.** For example, updating just a text content, changing a style, or adding/removing a class. This approach completely bypasses the `render()` method and the child component destruction/recreation cycle, thus preserving the state of all children. This is a powerful technique for highly optimized updates.
3.  **Stateful Leaf Components:** Preferably, components that rely heavily on automatic updates should be "leaf components" (those without children that manage critical state) or those whose children are purely presentational.
4.  **State Hoisting:** If multiple components need to share or persist state across parent re-renders (and targeted DOM manipulation isn't suitable), think about lifting that state up to a common ancestor component or using `PicoJSX.createStore` for global state management.

This behavior is a deliberate design choice in PicoJSX. It's part of the trade-off for the **exceptional speed, lightness, and direct DOM proximity** it offers. While calling `this.update()` provides a convenient way to refresh a component based on its `render` method, the ability to opt-out and use direct DOM manipulation via refs gives developers ultimate control for performance-critical sections and for preserving complex child states. This flexibility is a core strength when building fast and efficient UIs.

---

## Developers: Understanding PicoJSX Internals

This part dives a bit deeper for those curious about how PicoJSX works behind the scenes.

### Core Rendering Pipeline

How does JSX turn into stuff on the screen?

1.  **`h(type, props, ...children)` (The Hyperscript):**
    *   This function is what your JSX actually compiles down to (thanks to the `/** @jsx ... */` pragma).
    *   It doesn't build DOM itself. It figures out *what* you want to build.
    *   **HTML Tag?** Returns a simple description: `{ type: 'div', props: {...}, children: [...] }`.
    *   **Class Component?** Returns a new instance: `new MyComponent(props)`.
    *   **Functional Component?** Calls the function: `MyFuncComp(props, children)` and passes its result along.
    *   **Fragment?** Returns `{ type: Fragment, ... }`.

2.  **`_buildDomAndCollectMounts(input, mountQueue)` (The Builder):**
    *   This is the workhorse that recursively takes the output from `h` (or from a component's `render` method) and turns it into actual DOM nodes.
    *   **Simple Stuff:** Strings/numbers become text nodes. Arrays get flattened and each item is processed.
    *   **Description Objects (`{type, props, children}`):**
        *   `type === Fragment`: Makes a `DocumentFragment`, processes children into it.
        *   `type === 'div'` (or other tag): Creates the element (`document.createElement`), calls `applyProps` to set attributes/listeners, and recursively calls itself for children, appending them.
    *   **Component Instances:**
        *   If it's the first time seeing this instance (`!instance._dom`), it calls `instance.render()` and feeds *that* output back into `_buildDomAndCollectMounts`.
        *   The resulting DOM node (or fragment markers) gets stored on `instance._dom`.
        *   A special property `_PicoInstance` is added to the root DOM node, pointing back to the component instance.
        *   If the instance needs mounting (`componentDidMount` exists and not already mounted), it's added to the `mountQueue`.
    *   Returns the final `Node` (Element, TextNode, or DocumentFragment).

3.  **`render(jsxInput, parentDomElement)` (Initial Kick-off):**
    *   This starts the whole process for the initial page load.
    *   Clears out the `parentDomElement` first (calls `disposeNode` on existing children).
    *   Calls `_buildDomAndCollectMounts` to build the entire DOM tree.
    *   **Root Fragments:** If the very top level is a fragment, it cleverly inserts comment nodes (`<!-- Pico Start -->`, `<!-- Pico End -->`) into the real DOM to mark the fragment's boundaries. These markers are stored on the component instance (`_startMarker`, `_endMarker`).
    *   Appends the final DOM structure to `parentDomElement`.
    *   **Deferred Mounting:** Uses `setTimeout(..., 0)` to schedule calls to `componentDidMount` for all components in the `mountQueue`. This makes sure the browser has actually painted the DOM before `componentDidMount` runs.

4.  **Component `update()` Method (Re-renders):**
    *   Called by `setState` (usually) or manually.
    *   Saves focus/selection if possible.
    *   Calls `render()` to get the *new* desired structure.
    *   Calls `_buildDomAndCollectMounts` to build the *new* DOM based on that structure.
    *   **DOM Replacement Strategy:**
        *   **Element Root:** Calls `disposeNode` on the *old* DOM tree (`oldDomContent`), then uses `parentNode.replaceChild(newDom, oldDomContent)` to swap in the new tree. Updates `this._dom`.
        *   **Fragment Root:** Finds the `_startMarker` and `_endMarker`. Removes all nodes between them (calling `disposeNode` on them). Inserts the `newDom` (often a DocumentFragment itself) before the `_endMarker`.
    *   Mounts any *new* child components that appeared in the render.
    *   Calls `componentDidUpdate(prevProps, prevState)`.
    *   Tries to restore focus.

### Props and Attributes (`applyProps`)

This function applies the `props` object to a real DOM `element`.

*   Compares `newProps` to `oldProps`.
*   Removes attributes/listeners present in `oldProps` but missing in `newProps`.
*   Sets/updates attributes/listeners from `newProps`:
    *   `className` becomes the `class` attribute.
    *   `on*` handlers become `addEventListener` calls.
    *   `style` objects get applied to `element.style`, `style` strings to `element.style.cssText`.
    *   `ref` callbacks/objects are handled (calling old ref with `null`, setting `current`, etc.).
    *   `dangerouslySetInnerHTML.__html` sets `element.innerHTML`.
    *   Booleans set/remove attributes appropriately.
    *   Others use `setAttribute`.

### Component Lifecycle Methods Timing

A quick summary of when they fire:

*   **`constructor(props)`:** When `new MyComponent(props)` happens (usually inside `h`).
*   **`render()`:** During initial build (`_buildDomAndCollectMounts`) and at the start of `update()`.
*   **`componentDidMount()`:** Asynchronously (`setTimeout`) after the *initial* `PicoJSX.render()` finishes and the element is in the DOM. Also called for new children added during parent updates (synchronously within that update, after their DOM is attached).
*   **`componentWillUnmount()`:** Called by `disposeNode` just before a component's DOM nodes are removed (during parent updates or `render` clearing).
*   **`componentDidUpdate(prevProps, prevState)`:** Called at the *end* of the `update()` method, after DOM changes are complete. Not called on initial render.

### State Management

*   **Local:** `this.state` initialized in `constructor`. `this.setState(updater)` merges updates and triggers `update()` if `this.autoUpdate` is true. `_prevState` is used for `componentDidUpdate`.
*   **Global:** `createStore` returns `{ getState, setState, subscribe }`. `setState` notifies all subscribers. Optional `localStorage` sync via `storageKey` option.

### Fragment Handling

*   `<></>` or `PicoJSX.Fragment` tells `h` it's a fragment.
*   `_buildDomAndCollectMounts` creates a `DocumentFragment` node.
*   If a component *returns* a fragment, or the top-level render is a fragment, `render`/`update` use comment nodes (`_startMarker`, `_endMarker`) in the actual DOM to track where the fragment's content belongs.

### DOM Disposal (`disposeNode`)

*   Walks a DOM tree.
*   If a node has `_PicoInstance`, calls `componentWillUnmount()` on that instance (unless it's the instance currently updating itself).
*   Used by `render` when clearing the container and by `update` when replacing old content.

Hopefully, this gives a clearer picture of PicoJSX's internals! Happy coding!

---
Made with ❤️ in Sonora 🌵
