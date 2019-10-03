import React, {Component} from 'react'
import { Heading, Pane } from 'evergreen-ui'
import BoxRoute from './BoxRoute';

class Home extends Component{


    render(){
        const { deployRoutes, address } = this.props.accountInfo
        const { openNewVersion } = this.props
        if(!deployRoutes || deployRoutes.length === 0){
            return(
                <Heading size={400} align="center" marginTop="default">Not found any routes deploy by the user</Heading>
            )
        }
        return (
            <Pane display="flex" flexDirection="column" alignContent="center" alignItems="center">
            {deployRoutes.map((route, index) => {
                return  <BoxRoute key={index} openNewVersion={openNewVersion} routeData={route} address={address} />
            })}
            </Pane>
        )
    }
}

export default Home