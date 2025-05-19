import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import DisplayAddress from './DisplayAddress'

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'
const EXPLORER = 'https://explorer.test'

describe('DisplayAddress', () => {
  it('renders truncated address and link', () => {
    const html = renderToString(
      <DisplayAddress address={ADDRESS as any} blockExplorerURL={EXPLORER} />
    )
    const dom = new JSDOM(html)
    const textSpan = dom.window.document.querySelector('span.hex > span')!
    expect(textSpan.textContent).toBe('0x12345678...12345678')
    const link = dom.window.document.querySelector('a') as HTMLAnchorElement
    expect(link.href).toBe(`${EXPLORER}/address/${ADDRESS}`)
    expect(link.title).toBe(`View on ${EXPLORER}`)
  })
})
