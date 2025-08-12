import type { Range } from '../types';
import type { Node as SyntaxNode } from 'web-tree-sitter';

export const getNodeText = (node: SyntaxNode, sourceCode: string): string => {
    return sourceCode.substring(node.startIndex, node.endIndex);
};

export const getNodeRange = (node: SyntaxNode): Range => {
    return {
        start: { line: node.startPosition.row, column: node.startPosition.column },
        end: { line: node.endPosition.row, column: node.endPosition.column },
    };
};

export const findChild = (node: SyntaxNode, type: string | string[]): SyntaxNode | null => {
    const types = Array.isArray(type) ? type : [type];
    return node.children.find((c): c is SyntaxNode => !!c && types.includes(c.type)) || null;
}

export const findChildByFieldName = (node: SyntaxNode, fieldName: string): SyntaxNode | null => {
    return node.childForFieldName(fieldName);
};

export const getIdentifier = (node: SyntaxNode, sourceCode: string, defaultName: string = '<anonymous>'): string => {
    const nameNode = findChildByFieldName(node, 'name') ?? findChild(node, ['identifier', 'property_identifier']);
    return nameNode ? getNodeText(nameNode, sourceCode) : defaultName;
};