import React from 'react'
import Togglable from './Togglable'

interface ContractFormData {
  baselineRate: string
  targetRate: string
  notionalAmount: string
  durationDays: string
}

interface ContractFormProps {
  formData: ContractFormData
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>
  premium: number
  loading: boolean
  onCalculatePremium: () => void
  onCreateContract: () => void
}

const ContractForm: React.FC<ContractFormProps> = ({
  formData,
  setFormData,
  premium,
  loading,
  onCalculatePremium,
  onCreateContract
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <Togglable buttonLabel="Create New FX Hedge Contract">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New FX Hedge Contract</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Baseline Rate (USD/ZAR)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="e.g., 18.5000"
              className="input input-bordered w-full"
              value={formData.baselineRate}
              onChange={(e) => setFormData(prev => ({ ...prev, baselineRate: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Enter rate with up to 4 decimal places</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Rate (USD/ZAR)</label>
            <input
              type="number"
              step="0.0001"
              placeholder="e.g., 19.0000"
              className="input input-bordered w-full"
              value={formData.targetRate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetRate: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Enter rate with up to 4 decimal places</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notional Amount (USD)</label>
            <input
              type="number"
              placeholder="e.g., 100000"
              className="input input-bordered w-full"
              value={formData.notionalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, notionalAmount: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
            <input
              type="number"
              placeholder="e.g., 30"
              className="input input-bordered w-full"
              value={formData.durationDays}
              onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="btn btn-outline"
            onClick={onCalculatePremium}
            disabled={!formData.notionalAmount || !formData.baselineRate}
          >
            Calculate Premium
          </button>
          {premium > 0 && (
            <div className="flex items-center">
              <span className="text-lg font-semibold text-green-600">
                Premium: R{premium.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            className="btn btn-primary w-full"
            onClick={onCreateContract}
            disabled={loading || !formData.baselineRate || !formData.targetRate || !formData.notionalAmount || !formData.durationDays}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Create Contract'}
          </button>
        </div>
      </Togglable>
    </div>
  )
}

export default ContractForm
