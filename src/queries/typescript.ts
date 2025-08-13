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
  (property_identifier) @symbol.method.def) @scope.method.def

; Constructor definitions
(method_definition
  (property_identifier) @symbol.constructor.def
  (#eq? @symbol.constructor.def "constructor")) @scope.constructor.def

; Property signatures in interfaces (should be public by default)
(property_signature
  (property_identifier) @symbol.property.def) @mod.export

; Property definitions in classes  
(public_field_definition
  (property_identifier) @symbol.property.def)

; Variable declarations
(variable_declarator
  name: (identifier) @symbol.variable.def)

; Import statements
(import_statement
  source: (string) @rel.import.source)

; Named imports
(import_specifier
  name: (identifier) @rel.references)

; Type references
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
