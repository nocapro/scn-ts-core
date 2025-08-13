  • I set up an AST inspection script and used it to confirm node kinds for TS/JS (class_declaration, method_definition, function_expression for IIFE, call_expression,
     member_expression, etc.), per your ast-checker guidance.
  • I tightened the TypeScript query to:
    • keep class name capture on type_identifier (valid per AST),
    • capture methods and method signatures,
    • capture constructors via property_identifier == "constructor",
    • support CJS require as import at file level,
    • avoid the earlier invalid/broad patterns.
  • I adjusted the analyzer to:
    • extract readonly/static/abstract/async modifiers from text,
    • aggregate file-level relationships for non-symbol code,
    • leave symbol-level captures unchanged so they can resolve IDs.
  • I updated the formatter to:
    • group class/interface members under their parent,
    • stabilize and sort outgoing arrows,
    • include file-level imports and, when symbols are hidden in consumer files, aggregate outgoing symbol arrows to header lines.

  Where we still differ from fixtures:
  • base class BaseEntity isn’t surfacing; members print but the class line is absent. I verified AST has class_declaration>type_identifier; the class pattern should
    match. This likely means the class capture isn’t returning due to a query nuance. I’ll debug the query against a minimal file with only abstract class to see if
    abstract token causes a pattern miss and adjust to accept optional abstract.
  • consumer headers like src/main.ts still only show -> (2.0) instead of -> (2.1) and -> (2.2). I’ll include file-level resolved symbol relationships
    (call/references) in header rendering for non-export consumer files, not just imports, to match the fixture.
  • JS prototype/IIFE: AST shows function_expression within parenthesized_expression inside a call_expression. I’ll refine the IIFE query to mark the outer call as a
    function symbol with signature, and capture the Widget function and generator declaration inside. Then capture window.Widget and window.idGenerator assignments via
     member_expression left-hand side to surface them as variables.
  • Advanced types: I’ll adjust the type alias RHS parsing to remove quotes in string literal unions (fixtures show unquoted click|scroll|mousemove), handle mapped
    types to the compact form, and treat satisfies as a reference to User rather than printing the object fields as separate properties.

  Next concrete steps I’ll do now:
  • Update TS query to allow optional abstract token in class capture, and to capture file-level call/reference relationships into header (not just imports).
  • Extend queries to capture CJS object export shape: module.exports = { value, run }, with run referencing cjsFunc.
  • Add a safe transformer in analyzer to normalize alias RHS: strip quotes in unions, compact conditional/mapped types per fixture, and treat satisfies object as a
    single config variable with a relationship to User.

  Summary of changes made so far:
  • Added scripts/ast.ts for live AST inspection.
  • Fixed invalid TS query nodes, added method_signature support, require() import, and removed overbroad patterns that polluted TS fixtures.
  • Formatter updates: grouping, sorting, aggregated outgoing, and better incoming calculation.
  • Analyzer: richer modifier detection and heuristics for symbol labels.

  I’m proceeding to refine the TS query for abstract class/IIFE and adjust header rendering to include resolved call/reference relationships at file level to align with
  the fixtures.
