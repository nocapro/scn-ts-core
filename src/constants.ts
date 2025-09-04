export const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    constructor: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶', styled_component: '~',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    go_package: '◇',
    rust_struct: '◇', rust_trait: '{}', rust_impl: '+',
    error: '[error]', default: '?',
};

export const SCN_SYMBOLS = {
    FILE_PREFIX: '§',
    EXPORTED_PREFIX: '+',
    PRIVATE_PREFIX: '-',
    OUTGOING_ARROW: '->',
    INCOMING_ARROW: '<-',
    ASYNC: '...',
    THROWS: '!',
    PURE: 'o',
    TAG_GENERATED: '[generated]',
    TAG_DYNAMIC: '[dynamic]',
    TAG_GOROUTINE: '[goroutine]',
    TAG_MACRO: '[macro]',
    TAG_SYMBOL: '[symbol]',
    TAG_PROXY: '[proxy]',
    TAG_ABSTRACT: '[abstract]',
    TAG_STATIC: '[static]',
    TAG_STYLED: '[styled]',
};

export const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.go', '.rs', '.py', '.java', '.graphql', ''];