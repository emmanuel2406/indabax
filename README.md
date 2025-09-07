# IndabaX

A full stack Algorand dApp built with AlgoKit. This project includes smart contracts and a React frontend for interacting with the Algorand blockchain.

## Prerequisites

- [Docker](https://www.docker.com/) installed and operational
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli#install) installed
- AlgoKit sandbox container already running

## Setup

### Initial setup
1. Clone this repository to your local machine
2. Run `algokit project bootstrap all` in the project directory to install dependencies and set up the environment
3. Generate environment file for localnet: `algokit generate env-file -a target_network localnet` from the `indabax-contracts` directory
4. Build the project: `algokit project run build`
5. For project-specific instructions, refer to the READMEs of the child projects:
   - Smart Contracts: [indabax-contracts](projects/indabax-contracts/README.md)
   - Frontend Application: [indabax-frontend](projects/indabax-frontend/README.md)


## Key AlgoKit Commands

Here are the essential AlgoKit commands for working with this project:

### Project Management
- `algokit project bootstrap all` - Install dependencies and set up environment
- `algokit project run build` - Build the entire project
- `algokit project run deploy` - Deploy smart contracts to the network
- `algokit project run start` - Start the frontend development server

### Smart Contract Development
- `algokit generate env-file -a target_network localnet` - Generate environment file for localnet
- `algokit project run test` - Run smart contract tests
- `algokit project run lint` - Run linting on smart contracts

### Network Management
- `algokit localnet start` - Start local Algorand network (if not using sandbox)
- `algokit localnet stop` - Stop local Algorand network
- `algokit localnet status` - Check network status

## Technology Stack

This project uses the following technologies:

- **Blockchain**: Algorand, AlgoKit, and AlgoKit Utils
- **Smart Contracts**: Python with Poetry, Black, Ruff, mypy, pytest, and pip-audit
- **Frontend**: React with AlgoKit Utils, Tailwind CSS, daisyUI, use-wallet, npm, jest, playwright, Prettier, ESLint

## Project Structure

- **Smart Contracts**: Located in `projects/indabax-contracts/` - Python-based Algorand smart contracts
- **Frontend**: Located in `projects/indabax-frontend/` - React application for interacting with smart contracts

## Smart Contract Integration

When you compile and generate smart contract artifacts, the frontend automatically generates TypeScript application clients from smart contract artifacts and moves them to the `frontend/src/contracts` folder. You can then import and use these clients in your frontend application.

The frontend includes an example of interactions with the HelloWorldClient in the [`AppCalls.tsx`](projects/indabax-frontend/src/components/AppCalls.tsx) component.
