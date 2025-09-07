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
  const [openContractModal, setOpenContractModal] = useState<boolean>(false)

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  if (showFXHedge && activeAddress) {
    return (
      <>
        <UserWallet />
        <FXHedge openModal={openContractModal} setModalState={setOpenContractModal} />
      </>
    )
  }

  return (
    <div className="hero min-h-screen bg-animated noise-overlay">
      <div className="hero-content text-center rounded-lg p-8 max-w-2xl glass-card mx-auto">
        <div className="max-w-2xl">
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4">
              <img
                src={indabaxLogo}
                alt="IndabaX Logo"
                className="w-24 h-24 relative z-10"
              />
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gradient-primary mb-2">
                IndabaX
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Democratizing Prosperity
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to FX Hedge Platform
          </h2>
          <p className="py-6 text-lg text-muted-foreground">
            SME Currency Risk Management Platform built on Algorand.
            Hedge your foreign exchange exposure with smart contracts.
          </p>

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!activeAddress ? (
                <button
                  data-test-id="connect-wallet"
                  className="btn btn-lg btn-metallic-primary text-primary-foreground"
                  onClick={toggleWalletModal}
                >
                  Connect Wallet to Start
                </button>
              ) : (
                <button
                  className="btn btn-lg btn-metallic-primary text-primary-foreground"
                  onClick={() => setShowFXHedge(true)}
                >
                  Access FX Hedge Platform
                </button>
              )}
            </div>

            <div className="divider text-muted-foreground">Features</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="card glass-surface p-4">
                <h3 className="font-semibold text-foreground">Smart Contracts</h3>
                <p className="text-sm text-muted-foreground">Automated FX hedging with transparent settlement</p>
              </div>
              <div className="card glass-surface p-4">
                <h3 className="font-semibold text-foreground">Risk Management</h3>
                <p className="text-sm text-muted-foreground">Protect your business from currency volatility</p>
              </div>
              <div className="card glass-surface p-4">
                <h3 className="font-semibold text-foreground">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">Fixed premiums with no hidden fees</p>
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
