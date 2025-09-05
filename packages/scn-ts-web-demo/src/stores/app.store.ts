import { useState } from 'react';
import { defaultFilesJSON } from '../default-files';
import type { FormattingOptions } from '../types';

export function useAppStore() {
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    showOutgoing: true,
    showIncoming: true,
    showIcons: true,
    showExportedIndicator: true,
    showPrivateIndicator: true,
    showModifiers: true,
    showTags: true,
    showSymbolIds: true,
    groupMembers: true,
    displayFilters: {},
    showFilePrefix: true,
    showFileIds: true,
  });

  return {
    filesInput,
    setFilesInput,
    scnOutput,
    setScnOutput,
    formattingOptions,
    setFormattingOptions,
  };
}