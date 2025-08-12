const tsBaseQueries = `
; =============================================
; Definitions
; =============================================

(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

(arrow_function) @scope.function.def

(method_definition
  name: (property_identifier) @symbol.method.def) @scope.function.def

(class_declaration
  name: (type_identifier) @symbol.class.def) @scope.class.def

(interface_declaration
  name: (type_identifier) @symbol.interface.def) @scope.interface.def

(enum_declaration
  name: (identifier) @symbol.enum.def) @scope.enum.def

(type_alias_declaration
  name: (type_identifier) @symbol.type_alias.def) @scope.type_alias.def

; 'export const MyVar = ...' or 'const MyVar = ...'
(variable_declarator
  name: (identifier) @symbol.variable.def) @scope.variable.def

; =============================================
; Relationships
; =============================================

; Imports: 'import { A, B } from './foo''
(import_statement
  source: (string) @rel.import.source)

; require calls: 'const foo = require('./foo')'
(call_expression
  function: (identifier) @_fn
  arguments: (arguments (string) @rel.import.source)
  (#eq? @_fn "require")
)

; Dynamic imports: 'import('./foo')'
(call_expression
  function: (import)
  arguments: (arguments (string) @rel.dynamic_import.source))

; 'export { A, B } from './foo''
(export_statement
  source: (string) @rel.export.source)

; Class extension: 'class A extends B'
(class_declaration
  (class_heritage (expression) @rel.extends))

; Interface extension: 'interface A extends B'
(interface_declaration
  (extends_clause (expression) @rel.extends))

; 'implements' clause
(class_declaration
  (class_heritage (implements_clause (type_identifier) @rel.implements)))

; Function/method calls
(call_expression
  function: (identifier) @rel.call)
(call_expression
  function: (member_expression
    property: (property_identifier) @rel.call))

; Decorators
(decorator
  (identifier) @rel.decorator)
(decorator
  (call_expression
    function: (identifier) @rel.decorator))
    
; New expression 'new MyClass()'
(new_expression
  constructor: (identifier) @rel.call)
(new_expression
  constructor: (member_expression
    property: (property_identifier) @rel.call))

; Type annotations
(type_annotation
  (type_identifier) @rel.references)
(generic_type
  (type_identifier) @rel.references)

; =============================================
; Modifiers
; =============================================
((export_statement) @mod.export)
((method_definition
  "static" @mod.static))
((method_definition
  "abstract" @mod.abstract))
((public_field_definition
  "readonly" @mod.readonly))
((method_definition
  "async" @mod.async))
((function_declaration
  "async" @mod.async))
((arrow_function
  "async" @mod.async))
`;

const tsxExtraQueries = `
; 'const MyReactComponent = () => <div />'
(variable_declarator
  name: (identifier) @symbol.react_component.def
  value: (arrow_function
    body: [
      (jsx_element)
      (jsx_self_closing_element)
    ]
  )
) @scope.react_component.def
(variable_declarator
  name: (identifier) @symbol.react_component.def
  value: (arrow_function
    body: (parenthesized_expression [
      (jsx_element)
      (jsx_self_closing_element)
    ])
  )
) @scope.react_component.def

(jsx_opening_element
  name: (_) @symbol.jsx_element.def) @scope.jsx_element.def

(jsx_self_closing_element
  name: (_) @symbol.jsx_element.def) @scope.jsx_element.def

; JSX element usage
(jsx_opening_element
  name: (identifier) @rel.call)
(jsx_self_closing_element
  name: (identifier) @rel.call)
`;

export const typescriptQueries = tsBaseQueries;
export const typescriptReactQueries = tsBaseQueries + tsxExtraQueries;