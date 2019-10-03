import React, {Component,Fragment} from 'react';
import Home from './Home'
import { Button, Pane, Text } from 'evergreen-ui'
import './App.css';
import { arweave } from './arKnife';
import NewRouter from './NewRouter';
import NewVersion from './NewVersion';

const getTransactionTags = async (txId) => {
  try{
      const transaction = await arweave.transactions.get(txId)
      let tags =  await transaction.get('tags')
      let vtitle = Buffer.from(tags[1].value, 'base64').toString('ascii')
      let vid = Buffer.from(tags[2].value, 'base64').toString('ascii')
      const result = { vtitle, vid, txId }
      return result
  }catch(error){
      console.log(error)
      return null
  }
}


const getDeployRoutes = async (userAddress) => new Promise(async (resolve, reject) => {
  try{
      const query = {
          op: 'and',
          expr1: {
              op: 'equals',
              expr1: 'from',
              expr2: userAddress
          },
          expr2: {
              op: 'equals',
              expr1: 'action',
              expr2: 'v-main-history'
          }
      }
      const transactionList = await arweave.arql(query)
      if(!transactionList || transactionList.length === 0){
          resolve([])
      }else{
          let list = []
          transactionList.map(txId => list.push(getTransactionTags(txId)))
          const result = await Promise.all(list)
          resolve(result)
      }
  }catch(error){
      console.log(error)
      resolve([])
  }
})

class App extends Component {
  state = {
    loadWallet: false,
    loadingAccount: false,
    wallet: false,
    address: false,
    balance: false,
    idRouteSelected:false,
    deployRoutes: false,
    newRouterFormModal: false,
    newVersionFormModal: false

  }

  loadWallet = (wallet) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(reader.result)
      }, false)
      reader.readAsText(wallet)
  })
  

  loadAccount = async(e) => {
    try{
      this.setState({ loadingAccount: true })
      const file = await this.loadWallet(e.target.files[0])
      const wallet = await JSON.parse(file)
      const address = await arweave.wallets.jwkToAddress(wallet)
      const deployRoutes = await getDeployRoutes(address)
      const winston =  await arweave.wallets.getBalance(address)
      const ar = await arweave.ar.winstonToAr(winston)
      const balance = {
        winston, ar
      }
      this.setState({ wallet, address, balance, deployRoutes, walletLoad: true, loadingAccount: false })
    }catch(err){
      console.log(err)
      this.setState({ loadingAccount: false })
      alert('Error')
      return
    }
  }

  openWalletUpload = () => document.getElementById('walletUpload').click()

  closeNewRouter = () => this.setState({ newRouterFormModal: false })

  closeNewVersion = () => this.setState({ newVersionFormModal: false, idRouteSelected: false })

  openNewVersion = (idRoute) => this.setState({ newVersionFormModal: true, idRouteSelected: idRoute })



  render(){
    const { walletLoad, newRouterFormModal, newVersionFormModal, idRouteSelected, deployRoutes, loadingAccount, address, balance } = this.state
    return (
      <div className="App">
      <Pane width={"100%"} padding={15} backgroundColor={'black'}>
        <Text padding={15} color="white">AR Versionate URL</Text>
      </Pane>
        <header className="App-header">
          {walletLoad ?
          <Fragment>
              <Pane
                margin={10}
                padding={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column" 
                backgroundColor="#a6b9b73d"
                borderRadius={20}
              >
                <Text>{address}</Text>
                <Text>{balance.ar} AR</Text>
                <Button margin={10} height={40} onClick={() => this.setState({ newRouterFormModal: true})} appearance="primary">Create new version router</Button>
              </Pane>
              <Home accountInfo={this.state} openNewVersion={this.openNewVersion} deployRoutes={deployRoutes} />
              {newRouterFormModal &&
              <NewRouter 
                showModal={newRouterFormModal} 
                closeModal={this.closeNewRouter}
                accountInfo={this.state}
              />
              }
              {newVersionFormModal &&
              <NewVersion
                showModal={newVersionFormModal}
                closeModal={this.closeNewVersion}
                accountInfo={this.state}
                idRoute={idRouteSelected}
              />

              }
          </Fragment>
          :
          <Button height={40} onClick={this.openWalletUpload} appearance="primary" isLoading={loadingAccount}>Import Arweave Account</Button>
          }
          <input style={{display:'none'}} id="walletUpload" type="file" onChange={ e => this.loadAccount(e)} />
        </header>
      </div>
    )
  }
}

export default App;
