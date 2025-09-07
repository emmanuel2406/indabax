import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface UserWalletProps {
  onPremiumDeduction?: (amount: number) => void
  onSettlement?: (zarAmount: number, usdAmount: number) => void
}

interface WalletBalances {
  zar: number
  usd: number
}

const UserWallet: React.FC<UserWalletProps> = ({ onPremiumDeduction, onSettlement }) => {
  const { activeAddress } = useWallet()
  const [balances, setBalances] = useState<WalletBalances>({
    zar: 1000000, // Initial balance of R1,000,000
    usd: 0 // Initial balance of $0
  })
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Format currency with proper locale formatting
  const formatCurrency = (amount: number, currency: 'ZAR' | 'USD'): string => {
    const locale = currency === 'ZAR' ? 'en-ZA' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Function to deduct premium from ZAR wallet
  const deductPremium = (premiumAmount: number) => {
    setBalances(prev => ({
      ...prev,
      zar: Math.max(0, prev.zar - premiumAmount)
    }))
    onPremiumDeduction?.(premiumAmount)
  }

  // Function to handle settlement (transfer from ZAR to USD)
  const handleSettlement = (zarAmount: number, targetRate: number) => {
    const usdAmount = zarAmount / targetRate
    setBalances(prev => ({
      zar: Math.max(0, prev.zar - zarAmount),
      usd: prev.usd + usdAmount
    }))
    onSettlement?.(zarAmount, usdAmount)
  }

  // Expose functions to parent components
  useEffect(() => {
    // Store functions in window object for access from other components
    ;(window as any).userWallet = {
      deductPremium,
      handleSettlement
    }
  }, [])

  if (!activeAddress) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-pink-500/20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'p-2 min-w-[120px]' : 'p-4 min-w-[280px]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold text-pink-400 transition-all duration-300 ${
            isCollapsed ? 'text-sm' : 'text-lg'
          }`}>
            {isCollapsed ? 'W' : 'Wallet'}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-pink-400 transition-colors duration-200 p-1 rounded hover:bg-gray-700"
              title={isCollapsed ? 'Expand wallet' : 'Collapse wallet'}
            >
              {isCollapsed ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="space-y-3">
              {/* ZAR Balance */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Local Currency</p>
                    <p className="text-xs text-green-600">South African Rand</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(balances.zar, 'ZAR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* USD Balance */}
              <div className="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Target Currency</p>
                    <p className="text-xs text-yellow-700">US Dollar</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-800">
                      {formatCurrency(balances.usd, 'USD')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400 mb-1">Connected Address:</p>
              <p className="text-xs font-mono text-gray-300 break-all">
                {activeAddress.slice(0, 8)}...{activeAddress.slice(-8)}
              </p>
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">ZAR</div>
            <div className="text-sm font-bold text-green-400">
              {formatCurrency(balances.zar, 'ZAR').replace('R', '')}
            </div>
            <div className="text-xs text-gray-400 mt-1 mb-1">USD</div>
            <div className="text-sm font-bold text-yellow-400">
              {formatCurrency(balances.usd, 'USD').replace('$', '')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserWallet
