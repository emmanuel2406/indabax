import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import { FxHedgeContractFactory } from '../contracts/FXHedgeContract'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import ContractFormDialog from './ContractForm'
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
  const { contracts, addContract, removeContract } = useContracts()

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

      // Compute scaled target rate from form input (string)
      const scaledTargetRate = convertRateToScaled(formData.targetRate)

      const response = await appClient.send.calculatePremium({
        args: [
          BigInt(formData.notionalAmount),
          scaledTargetRate,
          BigInt(formData.durationDays)
        ]
      })

      console.log('calculatePremium: Response received', response.return)
      // Convert the scaled premium back to regular number and ensure it's an integer
      const scaledPremium = Number(response.return)
      const actualPremium = Math.round(scaledPremium / RATE_PRECISION)
      console.log('calculatePremium: Scaled premium:', scaledPremium, 'Actual premium (integer):', actualPremium)
      setPremium(actualPremium)
    } catch (e: any) {
      console.error('calculatePremium: Error', e)
      enqueueSnackbar(`Error calculating premium: ${e.message}`, { variant: 'error' })
    }
  }

  // Automatically calculate premium when form data changes
  useEffect(() => {
    console.log('useEffect: Checking conditions', {
      notionalAmount: formData.notionalAmount,
      targetRate: formData.targetRate,
      durationDays: formData.durationDays,
      activeAddress: !!activeAddress
    })

    if (formData.notionalAmount && formData.targetRate && formData.durationDays && activeAddress) {
      console.log('useEffect: All conditions met, calling calculatePremium')
      calculatePremium()
    } else {
      console.log('useEffect: Conditions not met, setting premium to 0')
      setPremium(0)
    }
  }, [formData.notionalAmount, formData.targetRate, formData.durationDays, activeAddress])

  const createContract = async () => {
    setLoading(true)

    // Validate that target rate is greater than baseline rate
    const targetRateFloat = parseFloat(formData.targetRate)
    if (targetRateFloat <= baselineRate) {
      enqueueSnackbar(
        `Error: Target rate (${targetRateFloat.toFixed(4)}) must be greater than baseline rate (${baselineRate.toFixed(4)})`,
        { variant: 'error' }
      )
      setLoading(false)
      return
    }

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
        // Remove the contract from active list after simulation
        removeContract(contract.id)
      } else {
        enqueueSnackbar(
          `Contract FAILED! Rate ${actualRateFloat} did not exceed target ${targetRateFloat}. No transfer occurred. Simulation: ${response.return}`,
          { variant: 'error' }
        )
        // Remove the contract from active list after simulation
        removeContract(contract.id)
      }
    } catch (e: any) {
      enqueueSnackbar(`Error simulating settlement: ${e.message}`, { variant: 'error' })
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <img
                src={indabaxLogo}
                alt="IndabaX Logo"
                className="w-40 h-40 mr-3"
              />
              <div className="absolute inset-0 w-40 h-40 mr-3 bg-green-500/20 rounded-full blur-md"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">FX Hedge Platform</h2>
          <p className="text-lg text-gray-300">SME Currency Risk Management Platform</p>
        </div>

        {/* Create New Contract Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setModalState(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg shadow-green-500/20"
          >
            Create New Hedge Contract
          </button>
        </div>

        {/* Contracts List */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-green-500/20">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">Active Contracts</h2>
          {contracts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No contracts created yet</p>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border border-green-500/20 rounded-lg p-4 bg-gray-700 relative">
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
                      <p className="text-lg font-semibold text-green-400">R{contract.premium.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 19.2500"
                      className="input input-bordered input-sm flex-1 bg-gray-600 border-green-500/30 text-white placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          simulateSettlement(contract, target.value)
                        }
                      }}
                    />
                    <button
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
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
        <ContractFormDialog
            formData={formData}
            setFormData={setFormData}
            baselineRate={baselineRate}
            premium={premium}
            loading={loading}
            onCreateContract={createContract}
            isOpen={openModal}
            onClose={() => setModalState(false)}
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
