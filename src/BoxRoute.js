import React, {Component, Fragment} from 'react'
import { Pane, Text, Spinner, Button, Dialog } from 'evergreen-ui'
import { arweave } from './arKnife';

const getActiveUrl = async (iddApp, userAddress) => {
    try{
        var query = {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'v-id',
                expr2: iddApp
            },
            expr2: {
                op: "and",
                expr1: {
                  op: 'equals',
                  expr1: 'action',
                  expr2: 'version-history'
                },
                expr2: {
                  op: 'equals',
                  expr1: 'from',
                  expr2: userAddress
                }
              }      
          }
          var transactionList = await arweave.arql(query)
          if(!transactionList || transactionList.lenght === 0){
            return null
          }else{
            var transaction = await arweave.transactions.get(transactionList[0])
            var dataString = await transaction.get('data', { decode: true, string: true })
            var data = JSON.parse(dataString)
            var result = {
                activeUrl: data.arweaveUrl,
                transactionHash: transactionList[0]
            }
            return result
          }
    }catch(error){
        console.log(error)
        return null
    }
}

const getHistory = async (iddApp, userAddress) => {
    try{
        var query = {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'v-id',
                expr2: iddApp
            },
            expr2: {
                op: "and",
                expr1: {
                  op: 'equals',
                  expr1: 'action',
                  expr2: 'version-history'
                },
                expr2: {
                  op: 'equals',
                  expr1: 'from',
                  expr2: userAddress
                }
              }      
          }
          var transactionList = await arweave.arql(query)
          if(!transactionList || transactionList.lenght === 0){
            return null
          }else{
            var result = []
            for (let transaction of transactionList){
                var tx = await arweave.transactions.get(transaction)
                var rawData = await tx.get('data', { decode: true, string: true })
                var data = JSON.parse(rawData)
                result.push({
                    activeUrl: data.arweaveUrl,
                    transactionHash: transaction
                })
            }
            return result
          }
    }catch(error){
        console.log(error)
        return null
    }
}

const ViewHistory = props => {
    const { showModal, closeModal, history } = props
    if(!history) return null
    return(
        <Dialog
            isShown={showModal}
            title="History"
            hasFooter={false}
            onCloseComplete={() => closeModal()}>
            <Pane
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column" 
            >
                {history.map((hst, index) => {
                    return(
                        <div style={{ padding: 10, margin: 10, display: 'flex', flexDirection: "column"}}>
                            {(index === 0) &&
                            <Text fontSize={14} fontWeight={700}>Actual URL</Text>
                            }
                            <Text fontSize={12}>Data</Text>
                            <a href={`https://arweave.net/${hst.activeUrl}`} target="_blank" rel="noopener noreferrer" >
                            <Text fontSize={10}>{hst.activeUrl}</Text>
                            </a>
                            <Text fontSize={12}>Transaction Hash</Text>
                            <a href={`https://viewblock.io/arweave/tx/${hst.transactionHash}`} target="_blank" rel="noopener noreferrer" >
                                <Text fontSize={10}>{hst.transactionHash}</Text>
                            </a>
                        </div>
                    )
                })}
            </Pane>        
        </Dialog>
    )
}

class BoxRoute extends Component{
    state={
        loadingRouteData:false,
        activeRoute: false,
        loadingRoute: true,
        history: null,
        openViewHistory: false,
        loadingViewHistory: false
    }

    componentDidMount = async() =>{
        const { address } = this.props
        const { vid } = this.props.routeData
        const result = await getActiveUrl(vid, address)
        if(result){
            this.setState({ activeRoute: result, loadingRoute: false })
        }else{
            this.setState({ loadingRoute: false })
        }        
    }

    openViewHistory = async () => {
        this.setState({ loadingViewHistory: true })
        const { address } = this.props
        const { vid } = this.props.routeData
        const history = await getHistory(vid, address)
        if(!history || history.length === 0){
            this.setState({ loadingViewHistory:false })
            alert('Empty History')
            return
        }
        this.setState({ history, openViewHistory: true, loadingViewHistory:false })
    }

    closeViewHistory = () => this.setState({ openNewVersion: false })

    render(){
        if(!this.props.routeData){
            return null
        }
        const { loadingRouteData, activeRoute, loadingRoute, openViewHistory, history, loadingViewHistory } = this.state
        const { vtitle, vid, txId } = this.props.routeData
        const { openNewVersion } = this.props
        return(
            <Pane
                width={"90%"}
                maxWidth={500}
                margin={10}
                padding={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="default"
                flexDirection="column" 
                backgroundColor="#c7cee3"
                borderRadius={20}
                >
                {loadingRouteData ? <Spinner />
                :
                <Fragment>
                    <Text fontSize={25} padding={10}>{vtitle}</Text>
                    <Text fontSize={10}>{vid}</Text>
                    <Text paddingTop={20}>Main URL:</Text>
                    <a href={`https://arweave.net/${txId}`} target="_blank">
                    <Text fontSize={12} wordWrap={"anywhere"}>{txId}</Text>
                    </a>
                    <Text paddingTop={20}>Active Route:</Text>
                    {(!loadingRoute) && (
                    activeRoute ? 
                        <a href={`https://arweave.net/${activeRoute.activeUrl}`} target="_blank">
                           <Text fontSize={12}>{activeRoute.activeUrl}</Text>
                        </a>
                        :
                        <Text color="red">Not detected any route</Text>
                    )
                    }
                </Fragment>
                }
                <Button margin={10} onClick={() => openNewVersion(vid)}>New Version</Button>
                <Button isLoading={loadingViewHistory} margin={10} onClick={this.openViewHistory}>View History</Button>
                {history &&
                <ViewHistory showModal={openViewHistory} closeModal={this.closeViewHistory} history={history} />
                }
            </Pane>
        )
    }
}

export default BoxRoute