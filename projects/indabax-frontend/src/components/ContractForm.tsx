import React, { useState } from 'react'
import { X, AlertCircle, CheckCircle, TrendingUp, Calendar, DollarSign, Shield } from 'lucide-react'

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
  onCreateContract: () => void
  isOpen: boolean
  onClose: () => void
}

const ContractFormDialog: React.FC<ContractFormProps> = ({
  formData,
  setFormData,
  baselineRate,
  premium,
  loading,
  onCreateContract,
  isOpen,
  onClose
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    onCreateContract()
    setShowConfirmation(false)
    onClose()
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  const isFormValid = baselineRate > 0 &&
    formData.targetRate &&
    formData.notionalAmount &&
    formData.durationDays &&
    parseFloat(formData.targetRate) > 0 &&
    parseFloat(formData.notionalAmount) > 0 &&
    parseInt(formData.durationDays) > 0

  // Calculate ZAR equivalent for display
  const zarEquivalent = formData.notionalAmount && formData.targetRate ?
    (parseFloat(formData.notionalAmount) * parseFloat(formData.targetRate)).toFixed(2) : '0'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Main Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-green-500/30 transform transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600/20 to-blue-600/20 p-6 rounded-t-2xl border-b border-green-500/20">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Shield className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create FX Hedge Contract</h2>
                <p className="text-gray-400 text-sm mt-1">Protect against USD/ZAR exchange rate fluctuations</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Rate Display */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-xl border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-green-400" size={20} />
                  <span className="text-sm font-medium text-gray-300">Current Market Rate</span>
                </div>
                <span className="text-2xl font-bold text-green-400">
                  {baselineRate > 0 ? `${baselineRate.toFixed(4)} USD/ZAR` : 'Loading...'}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <TrendingUp size={16} className="text-green-400" />
                  Target Rate (USD/ZAR)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder={baselineRate > 0 ? `e.g., ${baselineRate.toFixed(4)}` : 'Loading...'}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  value={formData.targetRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetRate: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Rate you want to hedge at</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign size={16} className="text-green-400" />
                  Notional Amount (USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 100000"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  value={formData.notionalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, notionalAmount: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Amount to hedge in USD</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Calendar size={16} className="text-green-400" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  value={formData.durationDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Contract duration in days</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign size={16} className="text-green-400" />
                  ZAR Equivalent
                </label>
                <div className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400">
                  R {parseFloat(zarEquivalent).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Calculated ZAR amount</p>
              </div>
            </div>

            {/* Premium Display */}
            {premium > 0 && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Contract Premium</p>
                    <p className="text-2xl font-bold text-purple-400">R {premium.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Auto-calculated</p>
                    <p className="text-sm text-gray-400 mt-1">Due upon creation</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-sm" />
                  Processing...
                </span>
              ) : (
                'Review Contract'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={handleCancel}
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-yellow-500/30 transform transition-all">
              {/* Confirmation Header */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 rounded-t-2xl border-b border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <AlertCircle className="text-yellow-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirm Contract Creation</h3>
                    <p className="text-gray-400 text-sm mt-1">Please review the details carefully</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Content */}
              <div className="p-6 space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Target Rate:</span>
                    <span className="text-white font-semibold">{formData.targetRate} USD/ZAR</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Notional Amount:</span>
                    <span className="text-white font-semibold">${parseFloat(formData.notionalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">ZAR Equivalent:</span>
                    <span className="text-white font-semibold">R {parseFloat(zarEquivalent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-semibold">{formData.durationDays} days</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-yellow-400 font-medium">Premium Due:</span>
                    <span className="text-yellow-400 font-bold text-xl">R {premium.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p className="text-gray-400">This action will create a binding hedge contract. The premium of <span className="text-yellow-400 font-semibold">R {premium.toLocaleString()}</span> will be charged immediately upon confirmation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm & Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ContractFormDialog
