export const rustQueries = `
(struct_item
  name: (type_identifier) @symbol.rust_struct.def) @scope.rust_struct.def

(trait_item
  name: (type_identifier) @symbol.rust_trait.def) @scope.rust_trait.def
  
(impl_item
  trait: (type_identifier) @rel.implements
  type: (type_identifier) @rel.references
) @symbol.rust_impl.def @scope.rust_impl.def

(attribute_item
  (attribute (identifier) @rel.macro))

(function_item
  name: (identifier) @symbol.function.def) @scope.function.def

(parameter
  type: (_ (type_identifier) @rel.references)
)

(call_expression
  function: (field_expression
    field: (field_identifier) @rel.call))
`;