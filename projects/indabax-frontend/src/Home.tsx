// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import FXHedge from './components/FXHedge'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [showFXHedge, setShowFXHedge] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  if (showFXHedge && activeAddress) {
    return <FXHedge openModal={false} setModalState={() => {}} />
  }

  return (
    <div className="hero min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="hero-content text-center rounded-lg p-8 max-w-2xl bg-white mx-auto shadow-2xl">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">IndabaX</span>
          </h1>
          <p className="py-6 text-lg text-gray-600">
            SME Currency Risk Management Platform built on Algorand.
            Hedge your foreign exchange exposure with smart contracts.
          </p>

          <div className="grid gap-4">
            {!activeAddress ? (
              <button
                data-test-id="connect-wallet"
                className="btn btn-primary btn-lg"
                onClick={toggleWalletModal}
              >
                Connect Wallet to Start
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowFXHedge(true)}
              >
                Access FX Hedge Platform
              </button>
            )}

            <div className="divider">Features</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="card bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-800">Smart Contracts</h3>
                <p className="text-sm text-blue-600">Automated FX hedging with transparent settlement</p>
              </div>
              <div className="card bg-green-50 p-4">
                <h3 className="font-semibold text-green-800">Risk Management</h3>
                <p className="text-sm text-green-600">Protect your business from currency volatility</p>
              </div>
              <div className="card bg-purple-50 p-4">
                <h3 className="font-semibold text-purple-800">Transparent Pricing</h3>
                <p className="text-sm text-purple-600">Fixed premiums with no hidden fees</p>
              </div>
            </div>
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
