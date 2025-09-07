import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div>
      <a className="text-xl text-pink-400 hover:text-pink-300" target="_blank" href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}>
        Address: {ellipseAddress(activeAddress)}
      </a>
      <div className="text-xl text-gray-300">Network: {networkName}</div>
    </div>
  )
}

export default Account
