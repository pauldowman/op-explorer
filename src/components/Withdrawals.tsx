import { useEffect, useState } from 'react'
import type { PublicClient, Address, AbiEvent } from 'viem'
import { parseAbiItem } from 'viem'
import { L2_CONTRACTS } from '../config'
import DisplayAddress from './DisplayAddress'

export const MESSAGE_PASSED_EVENT: AbiEvent = parseAbiItem(
  'event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)'
)

export type Withdrawal = {
  nonce: bigint
  sender: Address
  target: Address
  value: bigint
  gasLimit: bigint
  data: `0x${string}`
  withdrawalHash: `0x${string}`
  blockNumber: bigint
}

export function parseMessagePassedLog(log: any): Withdrawal {
  return {
    nonce: log.args.nonce,
    sender: log.args.sender,
    target: log.args.target,
    value: log.args.value,
    gasLimit: log.args.gasLimit,
    data: log.args.data,
    withdrawalHash: log.args.withdrawalHash,
    blockNumber: log.blockNumber,
  }
}

type WithdrawalsProps = {
  publicClientL2: PublicClient
  explorerURL?: string
}

const Withdrawals = ({ publicClientL2, explorerURL }: WithdrawalsProps) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const logs = await publicClientL2.getLogs({
          address: L2_CONTRACTS.L2ToL1MessagePasser as Address,
          event: MESSAGE_PASSED_EVENT,
          fromBlock: 0n,
        })
        const events = logs.map(parseMessagePassedLog)
        events.reverse()
        setWithdrawals(events.slice(0, 20))
      } catch (err) {
        console.error('Error fetching withdrawals', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [publicClientL2])

  if (loading) {
    return <div>Loading withdrawals...</div>
  }

  if (withdrawals.length === 0) {
    return <div>No withdrawals found.</div>
  }

  return (
    <div>
      <table className="withdrawal-table">
        <thead>
          <tr>
            <th>Nonce</th>
            <th>Sender</th>
            <th>Target</th>
            <th>Value</th>
            <th>Gas Limit</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w.withdrawalHash}>
              <td>{w.nonce.toString()}</td>
              <td><DisplayAddress address={w.sender} blockExplorerURL={explorerURL} /></td>
              <td><DisplayAddress address={w.target} blockExplorerURL={explorerURL} /></td>
              <td>{w.value.toString()}</td>
              <td>{w.gasLimit.toString()}</td>
              <td className="hex">{`${w.withdrawalHash.slice(0,10)}...${w.withdrawalHash.slice(-8)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Withdrawals
