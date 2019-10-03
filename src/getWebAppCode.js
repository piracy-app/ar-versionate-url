const getWebApp = (iddApp, ownerAddress, title) => {
    const code =
    `<!DOCTYPE html>  
    <html>  
       <head>  
          <title>${title}</title>
          <script src="https://unpkg.com/arweave@1.4.0/bundles/web.bundle.min.js"></script>
          <style type="text/css">  
              body{
                  padding: 0;
                  margin: 0;
              }
             .App {
              text-align: center;
              }
              .App-header {
              background-color: #282c34;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: calc(10px + 2vmin);
              color: white;
              }
              .lds-ripple {
              display: inline-block;
              position: relative;
              width: 64px;
              height: 64px;
              }
              .lds-ripple div {
              position: absolute;
              border: 4px solid #fff;
              opacity: 1;
              border-radius: 50%;
              animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
              }
              .lds-ripple div:nth-child(2) {
              animation-delay: -0.5s;
              }
              @keyframes lds-ripple {
              0% {
                  top: 28px;
                  left: 28px;
                  width: 0;
                  height: 0;
                  opacity: 1;
              }
              100% {
                  top: -1px;
                  left: -1px;
                  width: 58px;
                  height: 58px;
                  opacity: 0;
              }
              }
  
          </style>  
       </head>  
   <body>  
          <div class="App">
                  <header class="App-header">
                    <div class="lds-ripple"><div></div><div></div></div>
                  </header>
          </div>
   </body>  
   <script type="text/javascript">
      
      document.addEventListener("DOMContentLoaded", async function(event) {
          var arweave = Arweave.init({
          host: 'arweave.net',
          port: 80,           
          protocol: 'https',
          timeout: 90000,
          logging: false,
      })
          var query = {
          op: 'and',
          expr1: {
              op: 'equals',
              expr1: 'v-id',
              expr2: '${iddApp}'
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
              expr2: '${ownerAddress}'
            }
          }      
        }
        var transactionList = await arweave.arql(query)
        console.log(transactionList)
        if(!transactionList || transactionList.lenght === 0){
          alert('Error')
        }else{
          var transaction = await arweave.transactions.get(transactionList[0])
          var dataString = await transaction.get('data', { decode: true, string: true })
          var result = JSON.parse(dataString)
          window.location.assign("https://arweave.net/" +result.arweaveUrl)
        }
      });
    </script>
  </html> `
  return code
}

export default getWebApp