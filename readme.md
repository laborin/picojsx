# PicoJSX: Guide and Documentation
[![Node.js CI for PicoJSX](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml/badge.svg)](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml)

PicoJSX is a lightweight frontend library with a minimal virtual DOM implementation, designed for creating user interfaces using JSX or direct calls to the `h` (hyperscript) function. It offers a component model with state, lifecycle methods, an optional global store with `localStorage` persistence, and efficient automatic UI updates through inteligent diffing and patching.

**Version:** 2.0.3

## Motivation

I've been kind of a React detractor. well, not React itself really, but the idea of people using React for everything, even for tiny projects. The performance overhead and memory footprint is just too much for simple things. I played for a while with NanoJSX and I really liked it, it was refreshing to see something so small and simple. So I tried to make something even smaller just for fun.

After using PicoJSX for a few personal and hobby projects, I realised that I actually needed a virtual DOM. Without it, I was doing too many sorcery tricks to keep the UI smooth and prevent losing focus on inputs or cursor positions. The constant destroying and rebuilding of DOM elements was becoming a nightmare to manage. So version 2.0 born with a minimal virtual DOM that solve all these problems while still keeping the library tiny (less than 800 lines of code).

PicoJSX was made as an experiment, a way to learn and understand modern frameworks. Coming from an backbone/jquery user, this means something. The code has not real optimizations in place yet, I wrote it with size and simplicity in mind, and I haven't done any benchmark but I would say that its performance is good enough for production projects.

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
*   **Virtual DOM:** Efficient updates through a minimal virtual DOM implementation with smart diffing.
*   **Automatic Updates:** `setState` always trigger efficient reconciliation and patching.
*   **Natural Focus Preservation:** Focus and cursor position are naturally preserved since elements are patched, not replaced.
*   **`dangerouslySetInnerHTML`:** An object with a `__html` key (e.g., `{ __html: '<span>Hello</span>' }`) allows you to set raw HTML content inside an element. Use with caution as it can expose your users to cross-site scripting (XSS) attacks if the HTML source is not sanitized.
*   **Built-in Router:** Simple client-side router for single-page applications with support for dynamic routes and parameters.

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
    import { h, Fragment, render, Component, createStore, Router } from '@laborin/picojsx';
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
*   `Router`: Class for client-side routing in single-page applications.

If using ES6 modules (recommended way after `npm install`):
```javascript
// Recommended: Use named imports for clarity, especially for h and Fragment with JSX
import { h, Fragment, render, Component, createStore, Router } from '@laborin/picojsx';

// Alternatively, you can import the default object that contains all exports
import PicoJSX from '@laborin/picojsx';
// Then you might use PicoJSX.h, PicoJSX.Fragment, etc.
// And your pragmas would be /** @jsx PicoJSX.h */ and /** @jsxFrag PicoJSX.Fragment */
```

---

## 1. `h(type, props, ...children)`

The JSX factory function (often called a hyperscript function). It transforms JSX calls into Virtual DOM nodes (VNodes).

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

### Key Component Methods:

*   `constructor(props)`: The place to initialize `this.state` and bind event handlers. Remember to call `super(props)` first!
*   `setState(updater)`: Updates the component's state. `updater` can be an object with new state values to merge, or a function `(prevState, props) => newStateChanges` for updates based on previous state. Always triggers automatic re-render through virtual DOM diffing.
*   `update()`: Manually triggers a re-render. Usually not needed since `setState` handle this automatically.
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

### Focus Management

PicoJSX naturally preserves focus and cursor position when components re-render thanks to the virtual DOM. Because elements are patched in-place rather than replaced, the browser maintain focus state automatically. Sounds stupid, but before 2.0 I had to do a lot of trickery to have smooth UI with constant component updates destroying/rebuilding the DOM, this paragaph is here for any of the few people that downloaded 1.x in the past months, so you know the struggle is over.

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

## 6. `Router`

A simple client-side router for building single-page applications. It support static routes and dynamic routes with parameters (like `/user/:id`).

### Creating a Router

```javascript
import { Router } from '@laborin/picojsx';

const router = new Router();
```

### Registering Routes

Use the `route()` method to register paths with their components:

```javascript
router
  .route('/', HomePage)
  .route('/about', AboutPage)
  .route('/user/:id', UserPage)  // Dynamic route with parameter
  .route('/blog/:category/:slug', BlogPostPage); // Multiple parameters
```

### Navigation

Navigate programatically using the `navigate()` method:

```javascript
// Regular navigation (adds to browser history)
router.navigate('/about');

// Replace current history entry instead of adding new one
router.navigate('/login', true);
```

### Handling Route Changes

Setup a handler to respond when routes change:

```javascript
router.setRouteChangeHandler((component, params) => {
  // component: The component class for the matched route
  // params: Object with route parameters (eg. { id: '123' } for /user/:id)
  
  // Example: Render the component
  render(h(component, { params, router }), document.getElementById('app'));
});

// Initialize by handling current route
router.handleRoute();
```

### Complete Router Example

```javascript
/** @jsx h */
import { h, Component, render, Router } from '@laborin/picojsx';

// Define your pages components
class HomePage extends Component {
  render() {
    return (
      <div>
        <h1>Welcome Home!</h1>
        <button onClick={() => this.props.router.navigate('/about')}>
          Go to About
        </button>
      </div>
    );
  }
}

class AboutPage extends Component {
  render() {
    return (
      <div>
        <h1>About Us</h1>
        <button onClick={() => this.props.router.navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }
}

class UserPage extends Component {
  render() {
    // Access route parameters via props
    const { id } = this.props.params;
    return (
      <div>
        <h1>User Profile</h1>
        <p>Viewing user ID: {id}</p>
      </div>
    );
  }
}

// Main App component that manage routing
class App extends Component {
  constructor(props) {
    super(props);
    this.router = new Router();
    this.state = {
      currentComponent: null,
      currentParams: {}
    };
  }

  componentDidMount() {
    // Register routes
    this.router
      .route('/', HomePage)
      .route('/about', AboutPage)
      .route('/user/:id', UserPage);

    // Handle route changes
    this.router.setRouteChangeHandler((component, params) => {
      this.setState({
        currentComponent: component,
        currentParams: params
      });
    });

    // Handle initial route
    this.router.handleRoute();
  }

  render() {
    const { currentComponent: CurrentComponent, currentParams } = this.state;
    
    if (!CurrentComponent) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <nav>
          <a href="/" onClick={(e) => {
            e.preventDefault();
            this.router.navigate('/');
          }}>Home</a>
          {' | '}
          <a href="/about" onClick={(e) => {
            e.preventDefault();
            this.router.navigate('/about');
          }}>About</a>
          {' | '}
          <a href="/user/123" onClick={(e) => {
            e.preventDefault();
            this.router.navigate('/user/123');
          }}>User 123</a>
        </nav>
        <hr />
        <CurrentComponent params={currentParams} router={this.router} />
      </div>
    );
  }
}

// Initialize the app
render(<App />, document.getElementById('app'));
```

### Router API Reference

- **`route(path, component)`**: Register a route. Returns router instance for chaining.
- **`navigate(path, replaceState = false)`**: Navigate to a path programaticaly.
- **`handleRoute()`**: Process current browser location and trigger route handler.
- **`setRouteChangeHandler(handler)`**: Set callback for route changes. Handler receive `(component, params)`.
- **`matchRoute(path)`**: Manually match a path against registered routes. Returns `{ component, params }` or `null`.

The router automaticaly listens to browser back/forward buttons via the `popstate` event and will handle those navigation events acordingly.

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
            }

            componentDidMount() {
                console.log('App mounted');
                // Subscribe to theme changes
                this.themeUnsubscribe = themeStore.subscribe(newState => {
                    // Update local state when global theme changes
                    if (newState.currentTheme !== this.state.theme) {
                         this.setState({ theme: newState.currentTheme });
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
            }

            handleInput = (e) => {
                this.setState({ inputValue: e.target.value });
            }

            toggleChild = () => {
                this.setState(prev => ({ showChild: !prev.showChild }));
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

## Known Limitations

### Fragment Root in Class Components

Class components that return Fragments (`<>...</>` or `<Fragment>...</Fragment>`) as their root element cannot reliably update via `setState()` calls that occur outside the normal event flow (such as from store subscriptions, `setTimeout` callbacks, or async operations). 

This happens because PicoJSX tracks component DOM references for updates, but Fragments are represented by comment markers rather than actual DOM elements, causing the update mechanism to fail when trying to locate and patch the component's DOM tree.

**Workaround:** Always ensure class components have a single HTML element as their root (like `<div>` or `<section>`) rather than using Fragments at the component root level. Fragments works correctly when used inside the component tree, just not as the root element of a class component that needs to self-update.

```javascript
// Avoid: Fragment as root in class component
class MyComponent extends Component {
  componentDidMount() {
    store.subscribe(() => this.setState({ ... })); // May fail to update
  }
  render() {
    return (
      <>
        <div>Content 1</div>
        <div>Content 2</div>
      </>
    );
  }
}

// Good: Single element as root
class MyComponent extends Component {
  componentDidMount() {
    store.subscribe(() => this.setState({ ... })); // Works reliably
  }
  render() {
    return (
      <div>
        <div>Content 1</div>
        <div>Content 2</div>
      </div>
    );
  }
}

// Also good: Fragments inside the tree
class MyComponent extends Component {
  render() {
    return (
      <div>
        {this.state.items.map(group => (
          <>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </>
        ))}
      </div>
    );
  }
}
```

## Key Concepts: Virtual DOM and Performance

PicoJSX v2.0 introduces a minimal virtual DOM implementation that provides efficient updates while keeping a small footprint.

### How the Virtual DOM Works

When you call `setState()` or `update()`, PicoJSX:

1. **Creates a Virtual Representation:** The `render()` method returns a lightweight VNode tree
2. **Diffs Against Previous State:** Compare the new VNode tree with the previous one
3. **Patches the DOM:** Applies only the necessary changes to the real DOM

### Benefits

- **Preserved Component State:** Child components maintains their state during parent updates
- **Natural Focus Management:** Input focus and cursor position are preserved automatically
- **Optimal Performance:** Only changed elements are updated in the DOM
- **Smooth Updates:** No flicker or jank from replacing entire subtrees

### Key-Based Reconciliation

For optimal list rendering, use the `key` prop:

```javascript
class TodoList extends Component {
  render() {
    return (
      <ul>
        {this.state.todos.map(todo => 
          <li key={todo.id}>{todo.text}</li>
        )}
      </ul>
    );
  }
}
```

Keys help PicoJSX efficiently update lists by:
- Identifying which items have been added, removed, or reordered
- Preserving component instances and DOM nodes when possible
- Minimizing unnecesary re-renders

---

## Developers: Understanding PicoJSX v2 Internals

This section explains how PicoJSX's virtual DOM implementation work.

### Core Rendering Pipeline

1. **`h(type, props, ...children)` - VNode Creation:**
   - Returns lightweight VNode objects: `{ type, props, children, key }`
   - Normalizes children to VNodes (text becomes `{ type: '#text', text: '...' }`)
   - Functional components are called immediately and their result is returned
   - Extract `key` prop for efficient list reconciliation

2. **`createDOMElement(vnode)` - Initial DOM Creation:**
   - Recursively builds DOM from VNode tree
   - Creates text nodes, elements, or fragments
   - Instantiates component classes and calls their `render()` method
   - Applies props and event listeners
   - Stores VNode references on DOM nodes for later diffing

3. **`diff(parentDOM, dom, oldVNode, newVNode)` - Reconciliation:**
   - Compares old and new VNode trees
   - Handles node addition, removal, replacement, and updates
   - For same types, patches existing DOM nodes
   - For different types, replaces the entire subtree
   - Preserves component instances when possible

4. **`diffChildren()` - Smart List Updates:**
   - Uses keys to match old and new children
   - Reorders, adds, or removes DOM nodes as needed
   - Falls back to index-based matching for non-keyed children
   - Minimize DOM operations for better performance

5. **`updateProps()` - Efficient Prop Updates:**
   - Diffs old and new props
   - Only updates changed attributes and event listeners
   - Handles special props like `className`, `style`, `ref`, and `dangerouslySetInnerHTML`

### Virtual DOM Benefits

- **Minimal Updates:** Only changed parts of the DOM are touched
- **Preserved State:** Component instances and their state persists across updates
- **Natural Focus:** Input elements maintain focus since they're patched, not replaced
- **Better Performance:** Batched updates and minimal reflows

### Component Lifecycle

- **`constructor(props)`:** Called when component is instantiated
- **`render()`:** Returns VNode tree representing desired UI
- **`componentDidMount()`:** Called after component is added to DOM (async)
- **`componentDidUpdate(prevProps, prevState)`:** Called after updates are applied
- **`componentWillUnmount()`:** Called before component is removed

### State Updates Flow

1. `setState()` updates component state
2. `update()` is called automatically
3. Component's `render()` produce new VNode tree
4. `diff()` compares old and new VNodes
5. Minimal DOM patches are applied
6. `componentDidUpdate()` is called

### Key Concepts

- **VNodes:** Lightweight JavaScript objects describing the desired UI
- **Reconciliation:** Process of comparing VNode trees to find differences
- **Patching:** Applying minimal changes to the real DOM
- **Keys:** Stable identities for list items to optimize reordering

---

Made with ❤️ in Sonora 🌵