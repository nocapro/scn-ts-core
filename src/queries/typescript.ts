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

; Abstract class definitions
(abstract_class_declaration
  name: (type_identifier) @symbol.class.def) @scope.class.def

; Function definitions
(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

; Method definitions (capture name and formal parameters as scope)
(method_definition name: (property_identifier) @symbol.method.def) @scope.method.def

; Method signatures (interfaces, abstract class methods)
(method_signature
  name: (property_identifier) @symbol.method.def) @scope.method.def

; Constructor definitions
(method_definition name: (property_identifier) @symbol.constructor.def
  (#eq? @symbol.constructor.def "constructor")) @scope.constructor.def

; Property signatures in interfaces (should be public by default)
(property_signature
  (property_identifier) @symbol.property.def)

; Class field definitions (TypeScript grammar uses public_field_definition)
(public_field_definition
  name: (property_identifier) @symbol.property.def)

; Variable declarations
(variable_declarator
  name: (identifier) @symbol.variable.def)

; Common patterns to support JS features in fixtures
; IIFE: (function(){ ... })()
(call_expression
  function: (parenthesized_expression
    (function_expression) @symbol.function.def
  )
) @scope.function.def

; IIFE with assignment: const result = (function(){ ... })()
(expression_statement
  (assignment_expression
    left: (identifier) @symbol.variable.def
    right: (call_expression
      function: (parenthesized_expression
        (function_expression) @symbol.function.def
      )
    )
  )
)

; Window assignments: window.Widget = Widget
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (identifier) @__obj
      property: (property_identifier) @symbol.variable.def
    )
    right: _ @symbol.variable.ref
  )
  (#eq? @__obj "window")
)

; Tagged template usage -> capture identifier before template as call
(call_expression
  function: (identifier) @rel.call)

; Template literal variable references
(template_substitution
  (identifier) @rel.references)

; Styled components (styled.div, styled.h1, etc.)
(variable_declarator
  name: (identifier) @symbol.styled_component.def
  value: (call_expression
    function: (member_expression
      object: (identifier) @_styled
      property: (property_identifier) @_tag)
    arguments: (template_string))
  (#eq? @_styled "styled")) @scope.styled_component.def

; (Removed overly broad CommonJS/object key captures that polluted TS fixtures)

; Import statements
(import_statement
  source: (string) @rel.import)

; Named imports - these create references to the imported symbols
(import_specifier
  name: (identifier) @rel.references)

; Type references in type annotations, extends clauses, etc.
(type_identifier) @rel.references

; `satisfies` expressions
(satisfies_expression
  (type_identifier) @rel.references)

; Identifiers used in expressions
(binary_expression
  left: (identifier) @rel.references
  right: (identifier) @rel.references
)

; template literal types
(template_type
  (type_identifier) @rel.references)


; Call expressions
(call_expression
  function: (identifier) @rel.call)

; Method calls
; Only capture the object being called, not the property
(call_expression
  function: (member_expression
    object: (_) @rel.call
  )
)

; Constructor calls (new expressions)
(new_expression
  constructor: (identifier) @rel.call)

; Property access
(member_expression
  property: (property_identifier) @rel.references)

; CommonJS require as import at file-level: require("./path")
((call_expression
   function: (identifier) @__fn
   arguments: (arguments (string) @rel.import))
  (#eq? @__fn "require"))

; CommonJS module.exports assignment
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (identifier) @__obj
      property: (property_identifier) @symbol.variable.def
    )
    right: _
  )
  (#eq? @__obj "module")
)

; CommonJS exports.property assignment
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (member_expression
        object: (identifier) @__obj
        property: (property_identifier) @__prop
      )
      property: (property_identifier) @symbol.variable.def
    )
    right: _
  )
  (#eq? @__obj "module")
  (#eq? @__prop "exports")
)

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

; JSX component definitions (uppercase)
(jsx_opening_element
  name: (identifier) @symbol.react_component.def
  (#match? @symbol.react_component.def "^[A-Z]")) @scope.react_component.def

(jsx_self_closing_element
  name: (identifier) @symbol.react_component.def
  (#match? @symbol.react_component.def "^[A-Z]")) @scope.react_component.def

; JSX element definitions (lowercase tags)
(jsx_opening_element
  name: (identifier) @symbol.jsx_element.def
  (#match? @symbol.jsx_element.def "^[a-z]")) @scope.jsx_element.def

(jsx_self_closing_element
  name: (identifier) @symbol.jsx_element.def
  (#match? @symbol.jsx_element.def "^[a-z]")) @scope.jsx_element.def

; Arrow functions in JSX expressions (render props)
(jsx_expression
  (arrow_function) @symbol.function.def) @scope.function.def

; React fragments (empty JSX elements)
(jsx_element
  (jsx_opening_element) @symbol.jsx_element.def
  (#not-has-child? @symbol.jsx_element.def identifier)) @scope.jsx_element.def

; JSX component references (uppercase)
(jsx_opening_element
  name: (identifier) @rel.references
  (#match? @rel.references "^[A-Z]"))

(jsx_self_closing_element
  name: (identifier) @rel.references
  (#match? @rel.references "^[A-Z]"))
`;
