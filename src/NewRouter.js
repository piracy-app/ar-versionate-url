import React, {Component,Fragment} from 'react';
import { Dialog, TextInput, Text, Button, Pane } from 'evergreen-ui'
import getWebApp from './getWebAppCode';
import { arweave } from './arKnife';
import { Keccak } from 'sha3'
import nanoid from 'nanoid'

const newMainRouteTx = async (iddApp, ownerAddress, titledApp, wallet) => new Promise(async (resolve, reject) => {
    try{
        const data = await getWebApp(iddApp, ownerAddress, titledApp)
        let transaction = await arweave.createTransaction({data:data},wallet)
        await transaction.addTag('Content-Type', 'text/html')
        await transaction.addTag('v-title', titledApp)
        await transaction.addTag('v-id', iddApp)
        await transaction.addTag('action', 'v-main-history')
        const arFee = await arweave.ar.winstonToAr(transaction.reward)
        const fee = {
            arFee, winstonFee: transaction.reward
        }
        resolve({ transaction, fee })
    }catch(error){
        console.log(error)
        reject(error)
    }
})

class NewRouter extends Component {
    state={
        nameRouter: '',
        idRouter:null,
        transaction: null,
        feeTransaction: null,
        isValidTx: false
    }

    componentDidMount = async () => {
        const { address } = this.props.accountInfo
        const nanoUu = await nanoid()
        let hash = new Keccak(256)        
        await hash.update(`${address}-${nanoUu}`)
        const id = await hash.digest('hex')
        console.log(id)
        this.setState({ idRouter: id})

    }

    prepareTransaction = async () => {
        try{
            this.setState({ ONprepare: true })
            const { nameRouter, idRouter } = this.state
            const { wallet, address, balance } = this.props.accountInfo
            const { transaction, fee } = await newMainRouteTx(idRouter, address, nameRouter, wallet)
            let isValidTx = false
            if(parseInt(fee.winstonFee)<parseInt(balance.winston)){
                isValidTx = true
            }
            this.setState({
                transaction, feeTransaction: fee.arFee, isValidTx, ONprepare: false
            })
        }catch(error){
            console.log(error)
            this.setState({
                transaction:null, feeTransaction: null, isValidTx: false, ONprepare: false
            })
        }
    }

    executeTransaction = async () => {
        try{
            this.setState({ ONexecute: true })
            const { transaction } = this.state
            const { wallet, address, balance } = this.props.accountInfo
            await arweave.transactions.sign(transaction, wallet)
            const response = await arweave.transactions.post(transaction)
            alert('Transaction Deploy, wait mine for view the data')
            this.setState({ ONexecute: false, transaction: false, feeTransaction:false, isValidTx: false })
            this.props.closeModal()
        }catch(error){
            console.log(error)
            alert('Error')
            this.setState({ ONexecute: false })
        }
    }

    handleNameRouter = (e) => {
        const { transaction } = this.state
        if(transaction){
            return
        }else{
            this.setState({ nameRouter: e.target.value })
        }
    }

    render(){
        const { showModal, loadingTxNewRouter, idNewRouter, setTx, closeModal } = this.props
        const { idRouter, nameRouter, feeTransaction, isValidTx, transaction, ONprepare } = this.state
        return(
            <Dialog
            isShown={showModal}
            title="Create new router"
            hasFooter={false}
            onCloseComplete={() => closeModal()}>
            <Pane display="flex"  flexDirection="column" alignContent="center" alignItems="center">
            <Text>Name</Text>
            <TextInput value={nameRouter}  onChange={(e) => this.handleNameRouter(e)}/>

            <Text>Id</Text>
            <Text>{idRouter}</Text>
            {transaction ?
            <Fragment>
                <Text marginTop={10}>Transaction Cost:</Text>
                <Text>{feeTransaction} AR</Text>
                {isValidTx ?
                <Button onClick={this.executeTransaction} appearance="primary">Confirm Transaction</Button>  
                :
                <Text color="red">Insuficient Balance</Text>
                }  
            </Fragment>    
            :
            <Fragment>
                <Button onClick={this.prepareTransaction} isLoading={ONprepare} appearance="primary">Get Transaction Cost</Button>    
            </Fragment>        
            }
            </Pane>
            </Dialog>
        )
    }
}

export default NewRouter