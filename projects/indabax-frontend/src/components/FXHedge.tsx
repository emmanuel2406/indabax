import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { FxHedgeContractFactory } from '../contracts/FXHedgeContract'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import ContractForm from './ContractForm'
import RateDashboard from './RateDashboard'
import indabaxLogo from '../assets/indabax-logo.png'
import { useContracts } from '../contexts/ContractContext'

interface FXHedgeInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

interface ContractFormData {
  targetRate: string
  notionalAmount: string
  durationDays: string
}

const FXHedge = ({ openModal, setModalState }: FXHedgeInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [baselineRate, setBaselineRate] = useState<number>(0)
  const [formData, setFormData] = useState<ContractFormData>({
    targetRate: '',
    notionalAmount: '',
    durationDays: ''
  })
  const [premium, setPremium] = useState<number>(0)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()
  const { contracts, addContract } = useContracts()

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
    if (!formData.notionalAmount) return

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
          notionalAmount: BigInt(formData.notionalAmount)
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
          baselineRate: convertRateToScaled(baselineRate.toString()),
          targetRate: convertRateToScaled(formData.targetRate),
          notionalAmount: BigInt(formData.notionalAmount),
          durationDays: BigInt(formData.durationDays)
        }
      })

      const newContract = {
        baselineRate: baselineRate.toString(),
        targetRate: formData.targetRate,
        notionalAmount: formData.notionalAmount,
        durationDays: formData.durationDays,
        premium: premium,
        status: 'Active',
        createdAt: new Date().toISOString()
      }

      addContract(newContract)

      // Deduct premium from ZAR wallet
      if ((window as any).userWallet?.deductPremium) {
        (window as any).userWallet.deductPremium(premium)
      }

      enqueueSnackbar(`Contract created successfully! Premium: R${premium.toLocaleString()} deducted from ZAR wallet`, { variant: 'success' })

      // Reset form
      setFormData({
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <img
                src={indabaxLogo}
                alt="IndabaX Logo"
                className="w-12 h-12 mr-3 filter brightness-0 invert"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                }}
              />
              <div className="absolute inset-0 w-12 h-12 mr-3 bg-pink-500/20 rounded-full blur-md"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-pink-400 mb-1">
                IndabaX
              </h1>
              <p className="text-xs text-pink-300/80 font-medium">
                Democratizing Prosperity
              </p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">FX Hedge Platform</h2>
          <p className="text-lg text-gray-300">SME Currency Risk Management Platform</p>
        </div>

        {/* Contracts List */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-pink-500/20">
          <h2 className="text-2xl font-semibold text-pink-400 mb-4">Active Contracts</h2>
          {contracts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No contracts created yet</p>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border border-pink-500/20 rounded-lg p-4 bg-gray-700 relative">
                  {/* Color indicator */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
                    style={{ backgroundColor: contract.color }}
                  ></div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-400">Baseline Rate:</span>
                      <p className="text-lg font-semibold text-white">{contract.baselineRate} USD/ZAR</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Target Rate:</span>
                      <p className="text-lg font-semibold text-white">{contract.targetRate} USD/ZAR</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Notional:</span>
                      <p className="text-lg font-semibold text-white">${parseInt(contract.notionalAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Duration:</span>
                      <p className="text-lg font-semibold text-white">{contract.durationDays} days</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-400">Premium:</span>
                      <p className="text-lg font-semibold text-pink-400">R{contract.premium.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 19.2500"
                      className="input input-bordered input-sm flex-1 bg-gray-600 border-pink-500/30 text-white placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          simulateSettlement(contract, target.value)
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-600"
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
                  <p className="text-xs text-gray-400 mt-1">Enter actual rate with up to 4 decimal places</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Contract Form */}
        <ContractForm
            formData={formData}
            setFormData={setFormData}
            baselineRate={baselineRate}
            premium={premium}
            loading={loading}
            onCalculatePremium={calculatePremium}
            onCreateContract={createContract}
          />
      </div>

      {/* Rate Dashboard - Always displayed at the bottom */}
      <div className="mt-8">
        <RateDashboard onRateUpdate={setBaselineRate} />
      </div>

    </div>
  )
}

export default FXHedge
