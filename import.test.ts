import { describe, it, expect } from 'vitest';

import { parser } from './basic.grammar';
import * as T from './basic.grammar.terms';

describe('import grammar modules', () => {
  it('should import parser', () => {
    expect(parser).toBeTruthy();
  });
  it('should import terms', () => {
    expect(T).toBeTruthy();
  });
});