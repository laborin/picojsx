/**
 * PicoJSX TypeScript declarations
 * @version 2.0.5
 */

export type VNodeChild = VNode | string | number | boolean | null | undefined;
export type VNodeChildren = VNodeChild | VNodeChild[];

export interface VNode<P = any> {
    type: string | typeof Fragment | ComponentClass<P> | FunctionComponent<P>;
    props: P | null;
    children: VNode[];
    key?: string | number | null;
    text?: string;
    _instance?: Component<P>;
    _startMarker?: Comment;
    _endMarker?: Comment;
}

export interface RefObject<T> {
    current: T | null;
}

export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefCallback<T> | RefObject<T>;

export interface HTMLAttributes<T extends EventTarget = HTMLElement> {
    children?: VNodeChildren;
    className?: string;
    id?: string;
    style?: string | Partial<CSSStyleDeclaration>;
    key?: string | number;
    ref?: Ref<T>;
    dangerouslySetInnerHTML?: { __html: string };

    title?: string;
    tabIndex?: number;
    role?: string;
    hidden?: boolean;
    dir?: string;
    lang?: string;
    draggable?: boolean;
    spellcheck?: boolean;
    contentEditable?: boolean | 'true' | 'false';

    [key: `data-${string}`]: string | number | boolean | undefined;
    [key: `aria-${string}`]: string | number | boolean | undefined;

    onClick?: (e: MouseEvent) => void;
    onDblClick?: (e: MouseEvent) => void;
    onMouseDown?: (e: MouseEvent) => void;
    onMouseUp?: (e: MouseEvent) => void;
    onMouseMove?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onMouseOver?: (e: MouseEvent) => void;
    onMouseOut?: (e: MouseEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onKeyUp?: (e: KeyboardEvent) => void;
    onKeyPress?: (e: KeyboardEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onInput?: (e: Event) => void;
    onChange?: (e: Event) => void;
    onSubmit?: (e: Event) => void;
    onReset?: (e: Event) => void;
    onScroll?: (e: Event) => void;
    onWheel?: (e: WheelEvent) => void;
    onDrag?: (e: DragEvent) => void;
    onDragStart?: (e: DragEvent) => void;
    onDragEnd?: (e: DragEvent) => void;
    onDragEnter?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDragOver?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
    onTouchStart?: (e: TouchEvent) => void;
    onTouchMove?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
    onTouchCancel?: (e: TouchEvent) => void;
    onLoad?: (e: Event) => void;
    onError?: (e: Event) => void;
    onAnimationStart?: (e: AnimationEvent) => void;
    onAnimationEnd?: (e: AnimationEvent) => void;
    onAnimationIteration?: (e: AnimationEvent) => void;
    onTransitionEnd?: (e: TransitionEvent) => void;
}

export interface AnchorHTMLAttributes extends HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    target?: '_self' | '_blank' | '_parent' | '_top' | string;
    rel?: string;
    download?: string | boolean;
    hreflang?: string;
    type?: string;
}

export interface ButtonHTMLAttributes extends HTMLAttributes<HTMLButtonElement> {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    name?: string;
    value?: string;
    form?: string;
}

export interface FormHTMLAttributes extends HTMLAttributes<HTMLFormElement> {
    action?: string;
    method?: 'get' | 'post' | 'dialog';
    enctype?: string;
    target?: string;
    noValidate?: boolean;
    autocomplete?: 'on' | 'off';
}

export interface InputHTMLAttributes extends HTMLAttributes<HTMLInputElement> {
    type?: string;
    name?: string;
    value?: string | number;
    defaultValue?: string | number;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    max?: number | string;
    min?: number | string;
    step?: number | string;
    pattern?: string;
    autocomplete?: string;
    autofocus?: boolean;
    multiple?: boolean;
    accept?: string;
    list?: string;
    form?: string;
}

export interface TextareaHTMLAttributes extends HTMLAttributes<HTMLTextAreaElement> {
    name?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    rows?: number;
    cols?: number;
    wrap?: 'hard' | 'soft' | 'off';
    autocomplete?: string;
    autofocus?: boolean;
    form?: string;
}

export interface SelectHTMLAttributes extends HTMLAttributes<HTMLSelectElement> {
    name?: string;
    value?: string | string[];
    defaultValue?: string | string[];
    disabled?: boolean;
    required?: boolean;
    multiple?: boolean;
    size?: number;
    autocomplete?: string;
    autofocus?: boolean;
    form?: string;
}

export interface OptionHTMLAttributes extends HTMLAttributes<HTMLOptionElement> {
    value?: string | number;
    disabled?: boolean;
    selected?: boolean;
    label?: string;
}

export interface OptgroupHTMLAttributes extends HTMLAttributes<HTMLOptGroupElement> {
    label?: string;
    disabled?: boolean;
}

export interface LabelHTMLAttributes extends HTMLAttributes<HTMLLabelElement> {
    for?: string;
    htmlFor?: string;
    form?: string;
}

export interface ImgHTMLAttributes extends HTMLAttributes<HTMLImageElement> {
    src?: string;
    srcset?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    loading?: 'lazy' | 'eager';
    decoding?: 'sync' | 'async' | 'auto';
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
    sizes?: string;
    useMap?: string;
}

export interface VideoHTMLAttributes extends HTMLAttributes<HTMLVideoElement> {
    src?: string;
    poster?: string;
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'none' | 'metadata' | 'auto' | '';
    playsInline?: boolean;
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

export interface AudioHTMLAttributes extends HTMLAttributes<HTMLAudioElement> {
    src?: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'none' | 'metadata' | 'auto' | '';
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

export interface SourceHTMLAttributes extends HTMLAttributes<HTMLSourceElement> {
    src?: string;
    srcset?: string;
    type?: string;
    media?: string;
    sizes?: string;
}

export interface CanvasHTMLAttributes extends HTMLAttributes<HTMLCanvasElement> {
    width?: number | string;
    height?: number | string;
}

export interface IframeHTMLAttributes extends HTMLAttributes<HTMLIFrameElement> {
    src?: string;
    srcdoc?: string;
    name?: string;
    width?: number | string;
    height?: number | string;
    sandbox?: string;
    allow?: string;
    allowFullScreen?: boolean;
    loading?: 'lazy' | 'eager';
    referrerPolicy?: string;
}

export interface TableHTMLAttributes extends HTMLAttributes<HTMLTableElement> {
    cellPadding?: number | string;
    cellSpacing?: number | string;
    border?: number | string;
}

export interface TdHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
    colSpan?: number;
    rowSpan?: number;
    headers?: string;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
}

export interface ThHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
    colSpan?: number;
    rowSpan?: number;
    headers?: string;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
}

export interface ColHTMLAttributes extends HTMLAttributes<HTMLTableColElement> {
    span?: number;
}

export interface LinkHTMLAttributes extends HTMLAttributes<HTMLLinkElement> {
    href?: string;
    rel?: string;
    type?: string;
    media?: string;
    as?: string;
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
    integrity?: string;
}

export interface MetaHTMLAttributes extends HTMLAttributes<HTMLMetaElement> {
    name?: string;
    content?: string;
    httpEquiv?: string;
    charset?: string;
}

export interface ScriptHTMLAttributes extends HTMLAttributes<HTMLScriptElement> {
    src?: string;
    type?: string;
    async?: boolean;
    defer?: boolean;
    crossOrigin?: 'anonymous' | 'use-credentials' | '';
    integrity?: string;
    noModule?: boolean;
}

export interface StyleHTMLAttributes extends HTMLAttributes<HTMLStyleElement> {
    media?: string;
    type?: string;
}

export interface SVGAttributes extends HTMLAttributes<SVGElement> {
    viewBox?: string;
    xmlns?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    d?: string;
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    rx?: number | string;
    ry?: number | string;
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    points?: string;
    transform?: string;
    pathLength?: number;
    opacity?: number | string;
    fillOpacity?: number | string;
    strokeOpacity?: number | string;
    preserveAspectRatio?: string;
}

export interface IntrinsicElements {
    html: HTMLAttributes<HTMLHtmlElement>;
    head: HTMLAttributes<HTMLHeadElement>;
    body: HTMLAttributes<HTMLBodyElement>;
    title: HTMLAttributes<HTMLTitleElement>;
    base: HTMLAttributes<HTMLBaseElement>;
    link: LinkHTMLAttributes;
    meta: MetaHTMLAttributes;
    style: StyleHTMLAttributes;
    script: ScriptHTMLAttributes;
    noscript: HTMLAttributes;
    header: HTMLAttributes;
    footer: HTMLAttributes;
    main: HTMLAttributes;
    nav: HTMLAttributes;
    aside: HTMLAttributes;
    section: HTMLAttributes;
    article: HTMLAttributes;
    address: HTMLAttributes;
    h1: HTMLAttributes<HTMLHeadingElement>;
    h2: HTMLAttributes<HTMLHeadingElement>;
    h3: HTMLAttributes<HTMLHeadingElement>;
    h4: HTMLAttributes<HTMLHeadingElement>;
    h5: HTMLAttributes<HTMLHeadingElement>;
    h6: HTMLAttributes<HTMLHeadingElement>;
    hgroup: HTMLAttributes;
    div: HTMLAttributes<HTMLDivElement>;
    p: HTMLAttributes<HTMLParagraphElement>;
    hr: HTMLAttributes<HTMLHRElement>;
    pre: HTMLAttributes<HTMLPreElement>;
    blockquote: HTMLAttributes<HTMLQuoteElement>;
    ol: HTMLAttributes<HTMLOListElement>;
    ul: HTMLAttributes<HTMLUListElement>;
    li: HTMLAttributes<HTMLLIElement>;
    dl: HTMLAttributes<HTMLDListElement>;
    dt: HTMLAttributes;
    dd: HTMLAttributes;
    figure: HTMLAttributes;
    figcaption: HTMLAttributes;
    a: AnchorHTMLAttributes;
    span: HTMLAttributes<HTMLSpanElement>;
    em: HTMLAttributes;
    strong: HTMLAttributes;
    small: HTMLAttributes;
    s: HTMLAttributes;
    cite: HTMLAttributes;
    q: HTMLAttributes<HTMLQuoteElement>;
    dfn: HTMLAttributes;
    abbr: HTMLAttributes;
    code: HTMLAttributes;
    var: HTMLAttributes;
    samp: HTMLAttributes;
    kbd: HTMLAttributes;
    sub: HTMLAttributes;
    sup: HTMLAttributes;
    i: HTMLAttributes;
    b: HTMLAttributes;
    u: HTMLAttributes;
    mark: HTMLAttributes;
    ruby: HTMLAttributes;
    rt: HTMLAttributes;
    rp: HTMLAttributes;
    bdi: HTMLAttributes;
    bdo: HTMLAttributes;
    br: HTMLAttributes<HTMLBRElement>;
    wbr: HTMLAttributes;
    time: HTMLAttributes<HTMLTimeElement>;
    data: HTMLAttributes<HTMLDataElement>;
    form: FormHTMLAttributes;
    fieldset: HTMLAttributes<HTMLFieldSetElement>;
    legend: HTMLAttributes<HTMLLegendElement>;
    label: LabelHTMLAttributes;
    input: InputHTMLAttributes;
    button: ButtonHTMLAttributes;
    select: SelectHTMLAttributes;
    datalist: HTMLAttributes<HTMLDataListElement>;
    optgroup: OptgroupHTMLAttributes;
    option: OptionHTMLAttributes;
    textarea: TextareaHTMLAttributes;
    output: HTMLAttributes<HTMLOutputElement>;
    progress: HTMLAttributes<HTMLProgressElement>;
    meter: HTMLAttributes<HTMLMeterElement>;
    table: TableHTMLAttributes;
    caption: HTMLAttributes<HTMLTableCaptionElement>;
    colgroup: HTMLAttributes<HTMLTableColElement>;
    col: ColHTMLAttributes;
    thead: HTMLAttributes<HTMLTableSectionElement>;
    tbody: HTMLAttributes<HTMLTableSectionElement>;
    tfoot: HTMLAttributes<HTMLTableSectionElement>;
    tr: HTMLAttributes<HTMLTableRowElement>;
    td: TdHTMLAttributes;
    th: ThHTMLAttributes;
    img: ImgHTMLAttributes;
    picture: HTMLAttributes<HTMLPictureElement>;
    source: SourceHTMLAttributes;
    video: VideoHTMLAttributes;
    audio: AudioHTMLAttributes;
    track: HTMLAttributes<HTMLTrackElement>;
    map: HTMLAttributes<HTMLMapElement>;
    area: HTMLAttributes<HTMLAreaElement>;
    iframe: IframeHTMLAttributes;
    embed: HTMLAttributes<HTMLEmbedElement>;
    object: HTMLAttributes<HTMLObjectElement>;
    param: HTMLAttributes<HTMLParamElement>;
    canvas: CanvasHTMLAttributes;
    details: HTMLAttributes<HTMLDetailsElement>;
    summary: HTMLAttributes;
    dialog: HTMLAttributes<HTMLDialogElement>;
    menu: HTMLAttributes<HTMLMenuElement>;
    template: HTMLAttributes<HTMLTemplateElement>;
    slot: HTMLAttributes<HTMLSlotElement>;
    svg: SVGAttributes;
    g: SVGAttributes;
    path: SVGAttributes;
    circle: SVGAttributes;
    ellipse: SVGAttributes;
    line: SVGAttributes;
    polyline: SVGAttributes;
    polygon: SVGAttributes;
    rect: SVGAttributes;
    text: SVGAttributes;
    tspan: SVGAttributes;
    image: SVGAttributes;
    use: SVGAttributes;
    defs: SVGAttributes;
    clipPath: SVGAttributes;
    mask: SVGAttributes;
    pattern: SVGAttributes;
    linearGradient: SVGAttributes;
    radialGradient: SVGAttributes;
    stop: SVGAttributes;
    symbol: SVGAttributes;
    foreignObject: SVGAttributes;
}

export type FunctionComponent<P = {}> = (props: P & { children?: VNodeChildren }) => VNode | null;
export type FC<P = {}> = FunctionComponent<P>;

export interface ComponentClass<P = {}, S = {}> {
    new(props: P): Component<P, S>;
    isPicoClassComponent: true;
}

export declare class Component<P = {}, S = {}> {
    static isPicoClassComponent: true;

    props: P & { children?: VNodeChildren };
    state: S;

    constructor(props: P);

    setState(updater: Partial<S> | ((prevState: S, props: P) => Partial<S>)): void;
    update(): void;
    render(): VNode | null;

    componentDidMount?(): void;
    componentWillUnmount?(): void;
    componentDidUpdate?(prevProps: P, prevState: S): void;
}

interface FragmentComponent {
    (props: { children?: VNodeChildren }): VNode;
}
export declare const Fragment: FragmentComponent & { readonly $$typeof: unique symbol };

export declare function h<K extends keyof IntrinsicElements>(
    type: K,
    props: IntrinsicElements[K] | null,
    ...children: VNodeChildren[]
): VNode;

export declare function h<P>(
    type: FunctionComponent<P>,
    props: P | null,
    ...children: VNodeChildren[]
): VNode | null;

export declare function h<P, S>(
    type: ComponentClass<P, S>,
    props: P | null,
    ...children: VNodeChildren[]
): VNode<P>;

export declare function h(
    type: FragmentComponent,
    props: { children?: VNodeChildren } | null,
    ...children: VNodeChildren[]
): VNode;

export declare function render(
    vnode: VNode | ComponentClass | string | number,
    container: Element
): void;

export interface StoreOptions {
    storageKey?: string;
}

export interface Store<T> {
    getState(): T;
    setState(updater: Partial<T> | ((state: T) => T)): void;
    subscribe(listener: (state: T, prevState: T) => void): () => void;
}

export declare function createStore<T>(
    initialState: T,
    options?: StoreOptions
): Store<T>;

export interface RouteMatch<P = Record<string, string>> {
    component: ComponentClass<any, any> | FunctionComponent<any>;
    params: P;
}

export declare class Router {
    routes: Record<string, ComponentClass<any, any> | FunctionComponent<any>>;
    currentRoute: RouteMatch | null;
    currentComponent: ComponentClass<any, any> | FunctionComponent<any> | null;

    constructor();

    route(path: string, component: ComponentClass<any, any> | FunctionComponent<any>): this;
    navigate(path: string, replaceState?: boolean): void;
    handleRoute(): void;
    matchRoute(path: string): RouteMatch | null;
    setRouteChangeHandler(handler: (component: ComponentClass<any, any> | FunctionComponent<any>, params: Record<string, string>) => void): void;
}

declare const PicoJSX: {
    h: typeof h;
    Fragment: typeof Fragment;
    render: typeof render;
    Component: typeof Component;
    createStore: typeof createStore;
    Router: typeof Router;
};

export default PicoJSX;

export namespace JSX {
    type Element = VNode;
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicElements {
        html: HTMLAttributes<HTMLHtmlElement>;
        head: HTMLAttributes<HTMLHeadElement>;
        body: HTMLAttributes<HTMLBodyElement>;
        title: HTMLAttributes<HTMLTitleElement>;
        base: HTMLAttributes<HTMLBaseElement>;
        link: LinkHTMLAttributes;
        meta: MetaHTMLAttributes;
        style: StyleHTMLAttributes;
        script: ScriptHTMLAttributes;
        noscript: HTMLAttributes;
        header: HTMLAttributes;
        footer: HTMLAttributes;
        main: HTMLAttributes;
        nav: HTMLAttributes;
        aside: HTMLAttributes;
        section: HTMLAttributes;
        article: HTMLAttributes;
        address: HTMLAttributes;
        h1: HTMLAttributes<HTMLHeadingElement>;
        h2: HTMLAttributes<HTMLHeadingElement>;
        h3: HTMLAttributes<HTMLHeadingElement>;
        h4: HTMLAttributes<HTMLHeadingElement>;
        h5: HTMLAttributes<HTMLHeadingElement>;
        h6: HTMLAttributes<HTMLHeadingElement>;
        hgroup: HTMLAttributes;
        div: HTMLAttributes<HTMLDivElement>;
        p: HTMLAttributes<HTMLParagraphElement>;
        hr: HTMLAttributes<HTMLHRElement>;
        pre: HTMLAttributes<HTMLPreElement>;
        blockquote: HTMLAttributes<HTMLQuoteElement>;
        ol: HTMLAttributes<HTMLOListElement>;
        ul: HTMLAttributes<HTMLUListElement>;
        li: HTMLAttributes<HTMLLIElement>;
        dl: HTMLAttributes<HTMLDListElement>;
        dt: HTMLAttributes;
        dd: HTMLAttributes;
        figure: HTMLAttributes;
        figcaption: HTMLAttributes;
        a: AnchorHTMLAttributes;
        span: HTMLAttributes<HTMLSpanElement>;
        em: HTMLAttributes;
        strong: HTMLAttributes;
        small: HTMLAttributes;
        s: HTMLAttributes;
        cite: HTMLAttributes;
        q: HTMLAttributes<HTMLQuoteElement>;
        dfn: HTMLAttributes;
        abbr: HTMLAttributes;
        code: HTMLAttributes;
        var: HTMLAttributes;
        samp: HTMLAttributes;
        kbd: HTMLAttributes;
        sub: HTMLAttributes;
        sup: HTMLAttributes;
        i: HTMLAttributes;
        b: HTMLAttributes;
        u: HTMLAttributes;
        mark: HTMLAttributes;
        ruby: HTMLAttributes;
        rt: HTMLAttributes;
        rp: HTMLAttributes;
        bdi: HTMLAttributes;
        bdo: HTMLAttributes;
        br: HTMLAttributes<HTMLBRElement>;
        wbr: HTMLAttributes;
        time: HTMLAttributes<HTMLTimeElement>;
        data: HTMLAttributes<HTMLDataElement>;
        form: FormHTMLAttributes;
        fieldset: HTMLAttributes<HTMLFieldSetElement>;
        legend: HTMLAttributes<HTMLLegendElement>;
        label: LabelHTMLAttributes;
        input: InputHTMLAttributes;
        button: ButtonHTMLAttributes;
        select: SelectHTMLAttributes;
        datalist: HTMLAttributes<HTMLDataListElement>;
        optgroup: OptgroupHTMLAttributes;
        option: OptionHTMLAttributes;
        textarea: TextareaHTMLAttributes;
        output: HTMLAttributes<HTMLOutputElement>;
        progress: HTMLAttributes<HTMLProgressElement>;
        meter: HTMLAttributes<HTMLMeterElement>;
        table: TableHTMLAttributes;
        caption: HTMLAttributes<HTMLTableCaptionElement>;
        colgroup: HTMLAttributes<HTMLTableColElement>;
        col: ColHTMLAttributes;
        thead: HTMLAttributes<HTMLTableSectionElement>;
        tbody: HTMLAttributes<HTMLTableSectionElement>;
        tfoot: HTMLAttributes<HTMLTableSectionElement>;
        tr: HTMLAttributes<HTMLTableRowElement>;
        td: TdHTMLAttributes;
        th: ThHTMLAttributes;
        img: ImgHTMLAttributes;
        picture: HTMLAttributes<HTMLPictureElement>;
        source: SourceHTMLAttributes;
        video: VideoHTMLAttributes;
        audio: AudioHTMLAttributes;
        track: HTMLAttributes<HTMLTrackElement>;
        map: HTMLAttributes<HTMLMapElement>;
        area: HTMLAttributes<HTMLAreaElement>;
        iframe: IframeHTMLAttributes;
        embed: HTMLAttributes<HTMLEmbedElement>;
        object: HTMLAttributes<HTMLObjectElement>;
        param: HTMLAttributes<HTMLParamElement>;
        canvas: CanvasHTMLAttributes;
        details: HTMLAttributes<HTMLDetailsElement>;
        summary: HTMLAttributes;
        dialog: HTMLAttributes<HTMLDialogElement>;
        menu: HTMLAttributes<HTMLMenuElement>;
        template: HTMLAttributes<HTMLTemplateElement>;
        slot: HTMLAttributes<HTMLSlotElement>;
        svg: SVGAttributes;
        g: SVGAttributes;
        path: SVGAttributes;
        circle: SVGAttributes;
        ellipse: SVGAttributes;
        line: SVGAttributes;
        polyline: SVGAttributes;
        polygon: SVGAttributes;
        rect: SVGAttributes;
        text: SVGAttributes;
        tspan: SVGAttributes;
        image: SVGAttributes;
        use: SVGAttributes;
        defs: SVGAttributes;
        clipPath: SVGAttributes;
        mask: SVGAttributes;
        pattern: SVGAttributes;
        linearGradient: SVGAttributes;
        radialGradient: SVGAttributes;
        stop: SVGAttributes;
        symbol: SVGAttributes;
        foreignObject: SVGAttributes;
    }
}
