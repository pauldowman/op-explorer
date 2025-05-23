import React from 'react'
import type { PublicClient } from 'viem'
import Withdrawals from '../components/Withdrawals'

interface WithdrawalsPageProps {
  publicClientL2: PublicClient | null
  explorerURL?: string
}

const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ publicClientL2, explorerURL }) => {
  if (!publicClientL2) {
    return <div>Loading client...</div>
  }

  return (
    <div>
      <h1 className="mb-6">Withdrawals</h1>
      <Withdrawals publicClientL2={publicClientL2} explorerURL={explorerURL} />
    </div>
  )
}

export default WithdrawalsPage
