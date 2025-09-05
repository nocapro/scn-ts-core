import * as React from 'react';
import type { FormattingOptions } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface OutputOptionsProps {
  options: FormattingOptions;
  setOptions: React.Dispatch<React.SetStateAction<FormattingOptions>>;
}


export interface OutputOptionsHandle {
  expandAll: () => void;
  collapseAll: () => void;
}

type RegularOptionKey = keyof Omit<FormattingOptions, 'displayFilters'>;
type OptionItem = RegularOptionKey | string | { name: string; children: OptionItem[] };

const symbolKindLabels: Record<string, string> = {
  // TS/JS
  class: 'Classes',
  interface: 'Interfaces',
  function: 'Functions',
  method: 'Methods',
  constructor: 'Constructors',
  variable: 'Variables',
  property: 'Properties',
  enum: 'Enums',
  enum_member: 'Enum Members',
  type_alias: 'Type Aliases',
  module: 'Modules',
  // React
  react_component: 'React Components',
  styled_component: 'Styled Components',
  jsx_element: 'JSX Elements',
  // CSS
  css_class: 'CSS Classes',
  css_id: 'CSS IDs',
  css_tag: 'CSS Tags',
  css_at_rule: 'CSS At-Rules',
  css_variable: 'CSS Variables',
  // Go
  go_package: 'Go Packages',
  // Rust
  rust_struct: 'Rust Structs',
  rust_trait: 'Rust Traits',
  rust_impl: 'Rust Impls',
};

const tsDeclarationKinds = ['class', 'interface', 'function', 'variable', 'enum', 'type_alias', 'module'];
const tsMemberKinds = ['method', 'constructor', 'property', 'enum_member'];
const reactKinds = ['react_component', 'styled_component', 'jsx_element'];
const cssKinds = ['css_class', 'css_id', 'css_tag', 'css_at_rule', 'css_variable'];
const goKinds = ['go_package'];
const rustKinds = ['rust_struct', 'rust_trait', 'rust_impl'];

const toFilter = (kind: string): string => `filter:${kind}`;

const symbolVisibilityTree: OptionItem = {
  name: 'Symbol Visibility',
  children: [
    {
      name: 'TypeScript/JavaScript',
      children: [
        { name: 'Declarations', children: tsDeclarationKinds.map(toFilter) },
        { name: 'Members', children: tsMemberKinds.map(toFilter) },
      ],
    },
    { name: 'React', children: reactKinds.map(toFilter) },
    { name: 'CSS', children: cssKinds.map(toFilter) },
    {
      name: 'Other Languages',
      children: [
        { name: 'Go', children: goKinds.map(toFilter) },
        { name: 'Rust', children: rustKinds.map(toFilter) },
      ],
    },
  ],
};

const optionTree: OptionItem[] = [
  {
    name: 'Display Elements',
    children: [
      'showIcons',
      {
        name: 'Indicators',
        children: ['showExportedIndicator', 'showPrivateIndicator'],
      },
      'showModifiers',
      'showTags',
      {
        name: 'Identifiers',
        children: ['showFilePrefix', 'showFileIds', 'showSymbolIds'],
      },
    ],
  },
  {
    name: 'Relationships',
    children: ['showOutgoing', 'showIncoming'],
  },
  {
    name: 'Structure',
    children: ['groupMembers'],
  },
  symbolVisibilityTree,
];

const optionLabels: Record<RegularOptionKey, string> & Record<string, string> = {
  ...symbolKindLabels,
  showIcons: 'Icons',
  showExportedIndicator: 'Exported (+)',
  showPrivateIndicator: 'Private (-)',
  showModifiers: 'Modifiers',
  showTags: 'Tags',
  showSymbolIds: 'Symbol IDs',
  showFilePrefix: 'File Prefix (§)',
  showFileIds: 'File IDs',
  showOutgoing: 'Outgoing',
  showIncoming: 'Incoming',
  groupMembers: 'Group Members',
};

function getAllKeys(item: OptionItem): string[] {
  if (typeof item === 'string') {
    return [item];
  }
  return item.children.flatMap(getAllKeys);
}

const getAllGroupNames = (items: OptionItem[]): string[] => {
  return items.flatMap(item => {
    if (typeof item === 'object' && 'name' in item) {
      return [item.name, ...getAllGroupNames(item.children)];
    }
    return [];
  });
}

const OutputOptions = React.forwardRef<OutputOptionsHandle, OutputOptionsProps>(({ options, setOptions }, ref) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () =>
      new Set([
        'Display Elements', 'Indicators', 'Relationships', 'Structure',
        'TypeScript/JavaScript',
        'React', 'Identifiers',
      ])
  );

  const allGroupNames = React.useMemo(() => getAllGroupNames(optionTree), []);

  const expandAll = React.useCallback(() => {
    setExpandedGroups(new Set(allGroupNames));
  }, [allGroupNames]);

  const collapseAll = React.useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  React.useImperativeHandle(ref, () => ({
    expandAll,
    collapseAll,
  }), [expandAll, collapseAll]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleChange = (optionKey: string) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    if (optionKey.startsWith('filter:')) {
      const kind = optionKey.substring('filter:'.length);
      setOptions(prev => ({
        ...prev,
        displayFilters: { ...(prev.displayFilters ?? {}), [kind]: isChecked },
      }));
    } else {
      setOptions(prev => ({ ...prev, [optionKey]: isChecked }));
    }
  };

  const handleGroupChange = (keys: ReadonlyArray<string>) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setOptions(prev => {
      const newOptions: FormattingOptions = { ...prev };
      const newDisplayFilters = { ...(prev.displayFilters ?? {}) };

      for (const key of keys) {
        if (key.startsWith('filter:')) {
          newDisplayFilters[key.substring('filter:'.length)] = isChecked;
        } else {
          newOptions[key as RegularOptionKey] = isChecked;
        }
      }
      newOptions.displayFilters = newDisplayFilters;
      return newOptions;
    });
  };

  const renderItem = (item: OptionItem, level: number): React.ReactNode => {
    if (typeof item === 'string') {
      const key = item as string;
      const isFilter = key.startsWith('filter:');
      const filterKind = isFilter ? key.substring('filter:'.length) : null;
      const labelKey = filterKind ?? key;

      return (
        <div key={key} style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center space-x-1.5">
          <Checkbox
            id={key}
            checked={
              isFilter ? options.displayFilters?.[filterKind!] ?? true : options[key as RegularOptionKey] ?? true
            }
            onCheckedChange={handleChange(key)}
          />
          <Label htmlFor={key} className="cursor-pointer select-none text-sm text-muted-foreground font-normal">
            {optionLabels[labelKey as keyof typeof optionLabels] ?? labelKey}
          </Label>
        </div>
      );
    }

    const { name, children } = item;
    const isExpanded = expandedGroups.has(name);
    const allKeys = getAllKeys(item);
    const allChecked = allKeys.every(key => {
      if (key.startsWith('filter:')) {
        return options.displayFilters?.[key.substring('filter:'.length)] ?? true;
      }
      return options[key as RegularOptionKey] ?? true;
    });

    return (
      <div key={name}>
        <div
          className="flex items-center space-x-1.5 py-1 rounded-md hover:bg-accent/50 cursor-pointer select-none -mx-2 px-2"
          style={{ paddingLeft: `calc(${level * 1.5}rem + 0.5rem)` }}
          onClick={() => toggleGroup(name)}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          <Checkbox
            id={`group-${name.replace(/\s+/g, '-')}`}
            title={`Toggle all in ${name}`}
            checked={allChecked}
            onCheckedChange={handleGroupChange(allKeys)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent row click from firing
          />
          <Label
            htmlFor={`group-${name.replace(/\s+/g, '-')}`}
            className="font-semibold text-sm cursor-pointer select-none"
          >
            {name}
          </Label>
        </div>
        {isExpanded && (
          <div className="pt-1.5 space-y-1.5">
            {children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {optionTree.map(item => renderItem(item, 0))}
    </div>
  );
});

export default OutputOptions;
