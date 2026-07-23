type SqlInjectionSignal = {
  name: string
  pattern: RegExp
}

export type SqlInjectionCheckResult = {
  suspicious: boolean
  signals: string[]
  normalizedInput: string
}

const SQL_INJECTION_SIGNALS: SqlInjectionSignal[] = [
  { name: 'sql_comment', pattern: /(--|\/\*|\*\/|#)/ },
  { name: 'statement_chain', pattern: /;/ },
  { name: 'boolean_logic', pattern: /\b(or|and)\b\s+['"`]?\w+['"`]?(?:\s*=\s*['"`]?\w+['"`]?)?/i },
  { name: 'union_select', pattern: /\bunion\b\s+\bselect\b/i },
  { name: 'sql_keywords', pattern: /\b(select|insert|update|delete|drop|alter|truncate|exec|execute)\b/i },
]

export function checkForSqlInjection(value: string): SqlInjectionCheckResult {
  const normalizedInput = value.trim()
  const signals = SQL_INJECTION_SIGNALS.filter(({ pattern }) => pattern.test(normalizedInput)).map(({ name }) => name)

  return {
    suspicious: signals.length > 0,
    signals,
    normalizedInput,
  }
}