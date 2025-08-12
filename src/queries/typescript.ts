export const typescriptQueries = `
;; -------------------------------------------------------------------
;; Scopes & Definitions
;; -------------------------------------------------------------------

(class_declaration
  name: (identifier) @symbol.class.def) @scope.class.def

(interface_declaration
  name: (type_identifier) @symbol.interface.def) @scope.interface.def

(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

(arrow_function) @scope.function.def

(method_definition
  name: (property_identifier) @symbol.method.def) @scope.method.def

(enum_declaration
  name: (identifier) @symbol.enum.def) @scope.enum.def

(enum_assignment
  name: (property_identifier) @symbol.enum_member.def)

(type_alias_declaration
  name: (type_identifier) @symbol.type_alias.def) @scope.type_alias.def

(lexical_declaration
  (variable_declarator
    name: (identifier) @symbol.variable.def)) @scope.variable.def

(public_field_definition
  name: (property_identifier) @symbol.property.def) @scope.property.def

(decorator (identifier) @symbol.decorator.def)

;; -------------------------------------------------------------------
;; Relationships & References
;; -------------------------------------------------------------------

(import_statement
  source: (string) @rel.import.source)

(import_specifier
  name: (identifier) @rel.import.named)

(namespace_import
  (identifier) @rel.import.namespace)

(export_statement
  source: (string) @rel.export.source)

(export_specifier
  name: (identifier) @rel.export.named)

(call_expression
  function: [
    (identifier) @rel.call
    (member_expression
      property: (property_identifier) @rel.call)
    (call_expression
      function: (member_expression
        property: (property_identifier) @rel.call))
  ])

(new_expression
  constructor: (identifier) @rel.new)

(class_declaration
  (class_heritage
    (expression_with_type_arguments
      (identifier) @rel.extends))) @rel.extends.scope

(interface_declaration
  (class_heritage
    (expression_with_type_arguments
      (type_identifier) @rel.extends)))

(implement_clause
  (type_identifier) @rel.implements)

(type_identifier) @rel.type.ref
(generic_type (type_identifier) @rel.type.ref)
(predefined_type) @rel.type.ref

;; -------------------------------------------------------------------
;; Modifiers
;; -------------------------------------------------------------------

"export" @mod.export
"abstract" @mod.abstract
"static" @mod.static
"readonly" @mod.readonly
"async" @mod.async
(accessibility_modifier) @mod.access

;; -------------------------------------------------------------------
;; JSX/TSX
;; -------------------------------------------------------------------

(jsx_element
  open_tag: (jsx_opening_element
    name: (identifier) @rel.jsx.component)) @scope.jsx_element.def

(jsx_self_closing_element
  name: (identifier) @rel.jsx.component) @scope.jsx_element.def

(jsx_attribute
  name: (property_identifier) @symbol.jsx_attribute.def)

(jsx_expression_attribute) @scope.jsx_attribute.def
`;