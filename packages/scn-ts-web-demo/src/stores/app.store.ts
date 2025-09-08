import { useState } from 'react';
import { defaultFilesJSON } from '../default-files';
import type { FormattingOptions } from '../types';
import { getFormattingOptionsForPreset } from 'scn-ts-core';

export function useAppStore() {
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>(getFormattingOptionsForPreset('default'));
  const [includePattern, setIncludePattern] = useState('**/*');
  const [excludePattern, setExcludePattern] = useState('');

  return {
    filesInput,
    setFilesInput,
    scnOutput,
    setScnOutput,
    formattingOptions,
    setFormattingOptions,
    includePattern,
    setIncludePattern,
    excludePattern,
    setExcludePattern,
  };
}