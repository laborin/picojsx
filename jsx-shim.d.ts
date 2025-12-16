/**
 * PicoJSX global JSX namespace shim
 * Add this to your tsconfig.json types or reference it with a triple-slash directive:
 * /// <reference types="@laborin/picojsx/jsx-shim" />
 */
import { JSX as PicoJSX } from './picojsx';

declare global {
    namespace JSX {
        type Element = PicoJSX.Element;
        interface ElementChildrenAttribute extends PicoJSX.ElementChildrenAttribute {}
        interface IntrinsicElements extends PicoJSX.IntrinsicElements {}
    }
}
