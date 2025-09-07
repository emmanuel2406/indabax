import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { FxHedgeContractFactory } from '../contracts/FXHedgeContract'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import ContractForm from './ContractForm'

interface FXHedgeInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

interface ContractFormData {
  baselineRate: string
  targetRate: string
  notionalAmount: string
  durationDays: string
}

const FXHedge = ({ openModal, setModalState }: FXHedgeInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<ContractFormData>({
    baselineRate: '',
    targetRate: '',
    notionalAmount: '',
    durationDays: ''
  })
  const [premium, setPremium] = useState<number>(0)
  const [contracts, setContracts] = useState<any[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  // Helper functions for decimal rate conversion
  const RATE_PRECISION = 10000 // 4 decimal places

  const convertRateToScaled = (rate: string): bigint => {
    const rateFloat = parseFloat(rate)
    return BigInt(Math.round(rateFloat * RATE_PRECISION))
  }

  const convertScaledToRate = (scaled: bigint): number => {
    return Number(scaled) / RATE_PRECISION
  }

  const calculatePremium = async () => {
    if (!formData.notionalAmount || !formData.baselineRate || !formData.durationDays) return

    const factory = new FxHedgeContractFactory({
      defaultSender: activeAddress ?? undefined,
      algorand,
    })

    try {
      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      const { appClient } = deployResult
      const response = await appClient.send.calculatePremium({
        args: {
          notionalAmount: BigInt(formData.notionalAmount),
          baselineRate: convertRateToScaled(formData.baselineRate),
          durationDays: BigInt(formData.durationDays)
        }
      })

      setPremium(Number(response.return))
    } catch (e: any) {
      enqueueSnackbar(`Error calculating premium: ${e.message}`, { variant: 'error' })
    }
  }

  const createContract = async () => {
    setLoading(true)

    try {
      const factory = new FxHedgeContractFactory({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      const { appClient } = deployResult

      const response = await appClient.send.createContract({
        args: {
          baselineRate: convertRateToScaled(formData.baselineRate),
          targetRate: convertRateToScaled(formData.targetRate),
          notionalAmount: BigInt(formData.notionalAmount),
          durationDays: BigInt(formData.durationDays)
        }
      })

      const newContract = {
        id: Date.now(),
        baselineRate: formData.baselineRate,
        targetRate: formData.targetRate,
        notionalAmount: formData.notionalAmount,
        durationDays: formData.durationDays,
        premium: premium,
        status: 'Active',
        createdAt: new Date().toISOString()
      }

      setContracts(prev => [...prev, newContract])

      // Deduct premium from ZAR wallet
      if ((window as any).userWallet?.deductPremium) {
        (window as any).userWallet.deductPremium(premium)
      }

      enqueueSnackbar(`Contract created successfully! Premium: R${premium.toLocaleString()} deducted from ZAR wallet`, { variant: 'success' })

      // Reset form
      setFormData({
        baselineRate: '',
        targetRate: '',
        notionalAmount: '',
        durationDays: ''
      })
      setPremium(0)

    } catch (e: any) {
      enqueueSnackbar(`Error creating contract: ${e.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const simulateSettlement = async (contract: any, actualRate: string) => {
    try {
      const factory = new FxHedgeContractFactory({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      const { appClient } = deployResult

      const response = await appClient.send.simulateSettlement({
        args: {
          targetRate: convertRateToScaled(contract.targetRate),
          actualRate: convertRateToScaled(actualRate),
          notionalAmount: BigInt(contract.notionalAmount)
        }
      })

      const actualRateFloat = parseFloat(actualRate)
      const targetRateFloat = parseFloat(contract.targetRate)
      const notionalAmountFloat = parseFloat(contract.notionalAmount)

      // Check if contract succeeds (actual rate > target rate)
      if (actualRateFloat > targetRateFloat) {
        // Calculate the amount to transfer from ZAR to USD
        // The notional amount represents the USD amount we want to hedge
        const zarAmountToTransfer = notionalAmountFloat * targetRateFloat

        // Handle wallet settlement
        if ((window as any).userWallet?.handleSettlement) {
          (window as any).userWallet.handleSettlement(zarAmountToTransfer, targetRateFloat)
        }

        enqueueSnackbar(
          `Contract SUCCESS! Transferred R${zarAmountToTransfer.toLocaleString()} to USD wallet at rate ${targetRateFloat}. Simulation: ${response.return}`,
          { variant: 'success' }
        )
      } else {
        enqueueSnackbar(
          `Contract FAILED! Rate ${actualRateFloat} did not exceed target ${targetRateFloat}. No transfer occurred. Simulation: ${response.return}`,
          { variant: 'error' }
        )
      }
    } catch (e: any) {
      enqueueSnackbar(`Error simulating settlement: ${e.message}`, { variant: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">IndabaX FX Hedge</h1>
          <p className="text-lg text-gray-600">SME Currency Risk Management Platform</p>
        </div>

        {/* Create Contract Form */}
        <ContractForm
          formData={formData}
          setFormData={setFormData}
          premium={premium}
          loading={loading}
          onCalculatePremium={calculatePremium}
          onCreateContract={createContract}
        />

        {/* Contracts List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Contracts</h2>
          {contracts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contracts created yet</p>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Target Rate:</span>
                      <p className="text-lg font-semibold">{contract.targetRate} USD/ZAR</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Notional:</span>
                      <p className="text-lg font-semibold">${parseInt(contract.notionalAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Duration:</span>
                      <p className="text-lg font-semibold">{contract.durationDays} days</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Premium:</span>
                      <p className="text-lg font-semibold text-green-600">R{contract.premium.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 19.2500"
                      className="input input-bordered input-sm flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          simulateSettlement(contract, target.value)
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                        if (input?.value) {
                          simulateSettlement(contract, input.value)
                        }
                      }}
                    >
                      Simulate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter actual rate with up to 4 decimal places</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FXHedge
