import Arweave from 'arweave/web'

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 80,           
    protocol: 'https',
    timeout: 20000,
    logging: false,
})

export{
    arweave
}