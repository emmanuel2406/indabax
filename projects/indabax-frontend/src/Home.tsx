// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import FXHedge from './components/FXHedge'
import UserWallet from './components/UserWallet'
import indabaxLogo from './assets/indabax-logo.png'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [showFXHedge, setShowFXHedge] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  if (showFXHedge && activeAddress) {
    return (
      <>
        <UserWallet />
        <FXHedge openModal={false} setModalState={() => {}} />
      </>
    )
  }

  return (
    <div className="hero min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="hero-content text-center rounded-lg p-8 max-w-2xl bg-gray-900 mx-auto shadow-2xl border border-pink-500/20">
        <div className="max-w-2xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4">
              <img
                src={indabaxLogo}
                alt="IndabaX Logo"
                className="w-24 h-24 filter brightness-0 invert relative z-10"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
                }}
              />
              <div className="absolute inset-0 w-24 h-24 bg-pink-500/20 rounded-full blur-lg"></div>
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-pink-400 mb-2">
                IndabaX
              </h1>
              <p className="text-lg text-pink-300/80 font-medium">
                Democratizing Prosperity
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to FX Hedge Platform
          </h2>
          <p className="py-6 text-lg text-gray-300">
            SME Currency Risk Management Platform built on Algorand.
            Hedge your foreign exchange exposure with smart contracts.
          </p>

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!activeAddress ? (
                <button
                  data-test-id="connect-wallet"
                  className="btn btn-lg bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-600"
                  onClick={toggleWalletModal}
                >
                  Connect Wallet to Start
                </button>
              ) : (
                <button
                  className="btn btn-lg bg-pink-500 hover:bg-pink-600 text-white border-pink-500 hover:border-pink-600"
                  onClick={() => setShowFXHedge(true)}
                >
                  Access FX Hedge Platform
                </button>
              )}
            </div>

            <div className="divider text-pink-400">Features</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="card bg-gray-800 border border-pink-500/20 p-4">
                <h3 className="font-semibold text-pink-400">Smart Contracts</h3>
                <p className="text-sm text-gray-300">Automated FX hedging with transparent settlement</p>
              </div>
              <div className="card bg-gray-800 border border-pink-500/20 p-4">
                <h3 className="font-semibold text-pink-400">Risk Management</h3>
                <p className="text-sm text-gray-300">Protect your business from currency volatility</p>
              </div>
              <div className="card bg-gray-800 border border-pink-500/20 p-4">
                <h3 className="font-semibold text-pink-400">Transparent Pricing</h3>
                <p className="text-sm text-gray-300">Fixed premiums with no hidden fees</p>
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
