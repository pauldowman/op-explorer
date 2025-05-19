import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import Settings from './Settings'
import { CHAIN_CONFIG } from '../config'

const ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'

describe('Settings', () => {
  it('shows truncated account in button', () => {
    const html = renderToString(
      <Settings
        account={ADDRESS as any}
        connect={async () => {}}
        disconnect={() => {}}
        currentChain="optimism"
        onChainChange={() => {}}
      />
    )
    const displayName = CHAIN_CONFIG['optimism'].config.displayName
    expect(html).toContain(displayName)
    expect(html).toContain('0xabcd...abcd')
  })
})
