export const rustQueries = `
(struct_item
  name: (type_identifier) @symbol.rust_struct.def) @scope.rust_struct.def

(trait_item
  name: (type_identifier) @symbol.rust_trait.def) @scope.rust_trait.def
  
(impl_item) @symbol.rust_impl.def @scope.rust_impl.def

(impl_item
  trait: (type_identifier) @rel.implements
  type: (type_identifier) @rel.references
)

(attribute_item
  (attribute . (token_tree (identifier) @rel.macro)))

(function_item
  name: (identifier) @symbol.function.def) @scope.function.def

(impl_item
  body: (declaration_list
    (function_item
      name: (identifier) @symbol.method.def) @scope.method.def))

; For parameters like '&impl Trait'
(parameter type: (reference_type (_ (type_identifier) @rel.references)))
; For simple trait parameters
(parameter type: (type_identifier) @rel.references)

(call_expression
  function: (field_expression
    field: (field_identifier) @rel.call))

((struct_item (visibility_modifier) @mod.export))
((trait_item (visibility_modifier) @mod.export))
((function_item (visibility_modifier) @mod.export))
`;