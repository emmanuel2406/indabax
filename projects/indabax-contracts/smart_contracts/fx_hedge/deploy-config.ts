import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { FxHedgeContractFactory } from '../artifacts/fx_hedge/FXHedgeContractClient'

// Deploy the FX Hedging Smart Contract
export async function deploy() {
  console.log('=== Deploying FX Hedge Contract ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(FxHedgeContractFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

  // If app was just created fund the app account
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  console.log(
    `FX Hedge Contract deployed successfully at address: ${appClient.appAddress} with app ID: ${appClient.appClient.appId}`,
  )
}
