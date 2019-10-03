import React, {Component,Fragment} from 'react';
import { Dialog, TextInput, Text, Button, Pane } from 'evergreen-ui'
import { arweave } from './arKnife';


const generateNewVersionTx = async (dAppId, arweaveUrl, arweaveWallet) => new Promise(async (resolve, reject) => {
    try{
        const data = JSON.stringify({
            arweaveUrl
        })
        let transaction = await arweave.createTransaction({data},arweaveWallet)
        await transaction.addTag('v-id', dAppId)
        await transaction.addTag('action', 'version-history')
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

class NewVersion extends Component {
    state={
        urlRouter: '',
        transaction: null,
        feeTransaction: null,
        isValidTx: false
    }


    prepareTransaction = async () => {
        try{
            this.setState({ ONprepare: true })
            const { urlRouter } = this.state
            const { wallet, address, balance } = this.props.accountInfo
            const { idRoute, nameRoute } = this.props
            const { transaction, fee } = await generateNewVersionTx(idRoute, urlRouter, wallet)
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

    handleUrlRouter = (e) => {
        const { transaction } = this.state
        if(transaction){
            return
        }else{
            this.setState({ urlRouter: e.target.value })
        }
    }

    render(){
        const { showModal, loadingTxNewRouter, idRoute, setTx, closeModal } = this.props
        const { urlRouter, feeTransaction, isValidTx, transaction, ONprepare } = this.state
        return(
            <Dialog
            isShown={showModal}
            title="Update dApp"
            hasFooter={false}
            onCloseComplete={() => closeModal()}            >
            <Pane display="flex"  flexDirection="column" alignContent="center" alignItems="center">
            <Text>New Url</Text>
            <TextInput value={urlRouter}  onChange={(e) => this.handleUrlRouter(e)}/>

            <Text>Id</Text>
            <Text marginBottom={10}>{idRoute}</Text>

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

export default NewVersion