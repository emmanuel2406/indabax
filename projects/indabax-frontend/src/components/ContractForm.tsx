import React from 'react'
import Togglable from './Togglable'

interface ContractFormData {
  targetRate: string
  notionalAmount: string
  durationDays: string
}

interface ContractFormProps {
  formData: ContractFormData
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>
  baselineRate: number
  premium: number
  loading: boolean
  onCalculatePremium: () => void
  onCreateContract: () => void
}

const ContractForm: React.FC<ContractFormProps> = ({
  formData,
  setFormData,
  baselineRate,
  premium,
  loading,
  onCalculatePremium,
  onCreateContract
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-pink-500/20">
      <Togglable buttonLabel="Create New FX Hedge Contract">
        <h2 className="text-2xl font-semibold text-pink-400 mb-4">Create New FX Hedge Contract</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Baseline Rate (USD/ZAR)</label>
            <div className="input input-bordered w-full bg-gray-700 border-pink-500/30 flex items-center">
              <span className="text-lg font-semibold text-pink-400">
                {baselineRate > 0 ? baselineRate.toFixed(4) : 'Loading...'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Live rate from dashboard</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Rate (USD/ZAR)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="e.g., 19.0000"
              className="input input-bordered w-full bg-gray-700 border-pink-500/30 text-white placeholder-gray-400"
              value={formData.targetRate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetRate: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">Enter rate with up to 4 decimal places</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notional Amount (USD)</label>
            <input
              type="number"
              placeholder="e.g., 100000"
              className="input input-bordered w-full bg-gray-700 border-pink-500/30 text-white placeholder-gray-400"
              value={formData.notionalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, notionalAmount: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days)</label>
            <input
              type="number"
              placeholder="e.g., 30"
              className="input input-bordered w-full bg-gray-700 border-pink-500/30 text-white placeholder-gray-400"
              value={formData.durationDays}
              onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="btn bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-600"
            onClick={onCalculatePremium}
            disabled={!formData.notionalAmount || !baselineRate}
          >
            Calculate Premium
          </button>
          {premium > 0 && (
            <div className="flex items-center">
              <span className="text-lg font-semibold text-pink-400">
                Premium: R{premium.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            className="btn bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-600 w-full"
            onClick={onCreateContract}
            disabled={loading || !baselineRate || !formData.targetRate || !formData.notionalAmount || !formData.durationDays}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Create Contract'}
          </button>
        </div>
      </Togglable>
    </div>
  )
}

export default ContractForm
