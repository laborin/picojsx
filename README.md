# PicoJSX

[![Node.js CI for PicoJSX](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml/badge.svg)](https://github.com/laborin/picojsx/actions/workflows/node-ci.yml)

## What is it

PicoJSX is a minimalist JSX library with virtual DOM, components with state and lifecycle, and a simple global store. Its designed for building user interfaces without the complexity and overhead of larger frameworks. Think of it as React's little cousin - same familiar concepts but in a package thats actually readable and understandable in one sitting.

## Motivation

I've been kind of a React detractor. well, not React itself really, but the idea of people using React for everything, even for tiny projects. The performance overhead and memory footprint is just too much for simple things. I played for a while with NanoJSX and I really liked it, it was refreshing to see something so small and simple. So I tried to make something even smaller just for fun.

After using PicoJSX for a few personal and hobby projects, I realised that I actually needed a virtual DOM. Without it, I was doing too many sorcery tricks to keep the UI smooth and prevent losing focus on inputs or cursor positions. The constant destroying and rebuilding of DOM elements was becoming a nightmare to manage. So version 2.0 born with a minimal virtual DOM that solve all these problems while still keeping the library tiny (less than 800 lines of code).

## Quick Start

```bash
npm install @laborin/picojsx
```

```javascript
/** @jsx h */
import { h, Component, render } from '@laborin/picojsx';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
  }

  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.increment}>Add One</button>
      </div>
    );
  }
}

render(<Counter />, document.getElementById('app'));
```

## Core Features Example

```javascript
/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, Component, createStore, render } from '@laborin/picojsx';

// Global store with localStorage persistance
const userStore = createStore(
  { username: null, theme: 'light' },
  { storageKey: 'myAppUser' }
);

// Functional component
const Header = ({ title }) => (
  <header>
    <h1>{title}</h1>
  </header>
);

// Class component with lifecycle
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      posts: [],
      loading: true 
    };
  }

  componentDidMount() {
    // Subscribe to store changes
    this.unsubscribe = userStore.subscribe(state => {
      this.setState({ theme: state.theme });
    });
    
    // Fetch some data
    this.loadPosts();
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.unsubscribe) this.unsubscribe();
  }

  async loadPosts() {
    const posts = await fetch('/api/posts').then(r => r.json());
    this.setState({ posts, loading: false });
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>;

    return (
      <>
        <Header title="My Blog" />
        <main>
          {this.state.posts.map(post => (
            <article key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </article>
          ))}
        </main>
      </>
    );
  }
}

render(<App />, document.getElementById('root'));
```

## Simple Router

```javascript
import { Router, h, Component } from '@laborin/picojsx';

const router = new Router();

// Define your pages
class HomePage extends Component {
  render() {
    return <h1>Welcome!</h1>;
  }
}

class UserPage extends Component {
  render() {
    // Access route params
    return <h1>User ID: {this.props.params.id}</h1>;
  }
}

// Setup routes
router
  .route('/', HomePage)
  .route('/user/:id', UserPage);

// Handle route changes
router.setRouteChangeHandler((component, params) => {
  render(h(component, { params }), document.getElementById('app'));
});

// Start routing
router.handleRoute();
```

## Configuration

For JSX to work, configure your build tool:

**Babel (.babelrc)**
```json
{
  "presets": [[
    "@babel/preset-react", 
    {
      "pragma": "h",
      "pragmaFrag": "Fragment"
    }
  ]]
}
```

**esbuild**
```bash
esbuild app.jsx --jsx-factory=h --jsx-fragment=Fragment --bundle
```

Or use pragma comments in each file:
```javascript
/** @jsx h */
/** @jsxFrag Fragment */
```

## TypeScript

The library includes TypeScript declarations out of the box. No need to install separate `@types` package.

**tsconfig.json**
```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

Then add a reference to the JSX shim at the top of your entry file (or any .tsx file):

```typescript
/// <reference types="@laborin/picojsx/jsx-shim" />
```

Typed components work as you would expect:

```typescript
/// <reference types="@laborin/picojsx/jsx-shim" />
import { h, Component, Fragment, render } from '@laborin/picojsx';

interface CounterProps {
  initialValue?: number;
}

interface CounterState {
  count: number;
}

class Counter extends Component<CounterProps, CounterState> {
  constructor(props: CounterProps) {
    super(props);
    this.state = { count: props.initialValue || 0 };
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        Count: {this.state.count}
      </button>
    );
  }
}

render(<Counter initialValue={5} />, document.getElementById('app')!);
```

## Main API

- **h(type, props, ...children)** - Create virtual nodes (JSX factory)
- **render(vnode, container)** - Render to DOM
- **Component** - Base class with state, props and lifecycle methods
- **createStore(initial, options)** - Global state with optional localStorage
- **Router** - Simple client-side routing

Component lifecycle methods:
- `componentDidMount()` - After added to DOM
- `componentWillUnmount()` - Before removal 
- `componentDidUpdate(prevProps, prevState)` - After updates

That's it! You can browse the code to figure out any missing thing, the whole library is less than 800 lines.

Ping me if you make something with this.
