import { describe, expect, it } from 'vitest'

import { evaluateGuess } from '../src/evaluate'

describe('evaluateGuess', () => {
  it('all greens when guess equals answer', () => {
    expect(evaluateGuess('crane', 'crane')).toEqual(
      ['green', 'green', 'green', 'green', 'green']
    )
  })

  it('all grays when no letter shared', () => {
    expect(evaluateGuess('plumb', 'greet')).toEqual(
      ['gray', 'gray', 'gray', 'gray', 'gray']
    )
  })

  it('marks yellows for misplaced letters', () => {
    expect(evaluateGuess('nacre', 'crane')).toEqual(
      ['yellow', 'yellow', 'yellow', 'yellow', 'green']
    )
  })

  it('handles duplicate letter in guess with single in answer', () => {
    expect(evaluateGuess('eerie', 'abide')).toEqual(
      ['gray', 'gray', 'gray', 'yellow', 'green']
    )
  })

  it('handles duplicate letter in guess with double in answer', () => {
    expect(evaluateGuess('sheep', 'geese')).toEqual(
      ['yellow', 'gray', 'green', 'yellow', 'gray']
    )
  })

  it('handles duplicate letter in answer green-overrides-yellow', () => {
    expect(evaluateGuess('offal', 'fluff')).toEqual(
      ['gray', 'yellow', 'yellow', 'gray', 'yellow']
    )
  })

  it('works for any length', () => {
    expect(evaluateGuess('abcd', 'abcd')).toEqual(['green', 'green', 'green', 'green'])
    expect(evaluateGuess('abcdefg', 'abcdefg')).toEqual(
      ['green', 'green', 'green', 'green', 'green', 'green', 'green']
    )
  })

  it('works for cyrillic', () => {
    expect(evaluateGuess('крона', 'крона')).toEqual(
      ['green', 'green', 'green', 'green', 'green']
    )
    expect(evaluateGuess('крона', 'корма')).toEqual(
      ['green', 'yellow', 'yellow', 'gray', 'green']
    )
  })

  it('throws when guess and answer differ in length', () => {
    expect(() => evaluateGuess('abcd', 'abcde')).toThrow()
  })
})
