export const typescriptQueries = `
; Interface definitions
(interface_declaration
  name: (type_identifier) @symbol.interface.def) @scope.interface.def

; Type alias definitions  
(type_alias_declaration
  name: (type_identifier) @symbol.type_alias.def) @scope.type_alias.def

; Class definitions
(class_declaration
  name: (type_identifier) @symbol.class.def) @scope.class.def

; Function definitions
(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

; Method definitions
(method_definition
  name: (property_identifier) @symbol.method.def
  parameters: (formal_parameters) @scope.method.def)

; Constructor definitions
(method_definition
  name: (property_identifier) @symbol.constructor.def
  parameters: (formal_parameters) @scope.constructor.def
  (#eq? @symbol.constructor.def "constructor"))

; Property signatures in interfaces (should be public by default)
(property_signature
  (property_identifier) @symbol.property.def)

; Mark interface properties as exported (public)
(property_signature) @mod.export

; Class field definitions (TypeScript grammar uses public_field_definition)
(public_field_definition
  name: (property_identifier) @symbol.property.def)

; Variable declarations
(variable_declarator
  name: (identifier) @symbol.variable.def)

; Import statements
(import_statement
  source: (string) @rel.import)

; Named imports - these create references to the imported symbols
(import_specifier
  name: (identifier) @rel.references)

; Type references in type annotations, extends clauses, etc.
(type_identifier) @rel.references

; Call expressions
(call_expression
  function: (identifier) @rel.call)

; Method calls
(call_expression
  function: (member_expression
    property: (property_identifier) @rel.call))

; Constructor calls (new expressions)
(new_expression
  constructor: (identifier) @rel.call)

; Property access
(member_expression
  property: (property_identifier) @rel.references)

; Export modifiers
(export_statement) @mod.export

; Accessibility modifiers
(accessibility_modifier) @mod.accessibility

; Async functions/methods (text match)
((function_declaration) @mod.async (#match? @mod.async "^async "))
((method_definition) @mod.async (#match? @mod.async "^async "))
`;

export const typescriptReactQueries = `
${typescriptQueries}

; JSX element definitions
(jsx_opening_element
  name: (identifier) @symbol.jsx_component.def) @scope.jsx_component.def

(jsx_self_closing_element
  name: (identifier) @symbol.jsx_component.def) @scope.jsx_component.def

; JSX component references
(jsx_opening_element
  name: (identifier) @rel.references)

(jsx_self_closing_element
  name: (identifier) @rel.references)
`;
