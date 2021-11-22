const pm2 = require('pm2')
const osu = require('node-os-utils');
const os = require('os')
const https = require('https');



function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
    return '0.0.0.0';
  }
  

function main(){
    var content_servers = false
    var host = getIPAddress()

    const pathfile = './backupfile'


    //demo
    const writebackupdata = (data) => {
        const fs = require('fs')
        //

        fs.appendFile(pathfile,data, err => {
            fs.writeFile(pathfile,data)
        })
    }
    //demo
    const readbackupdata = async () =>{
        const fs = require('fs')
        fs.readFile(pathfile, 'utf-8',(err , data) => {
            if(!err){
                https.request(options,data)
            }
        })
    }


    function get_resource(){
        var node_service = []

        readbackupdata()

        pm2.connect(async function(err){
            content_servers = (err)? false : true

            pm2.list(async function(err,list_pm2){    
                content_servers = (err)? false : true

                list_pm2.forEach(process_node => {
                    node_service.push({'name' : process_node['pm2_env']['name'], 'status' : process_node['pm2_env']['status'] })
                });
                // post data to host
                const mem = await osu.mem.info()
                const cpu = await osu.cpu.usage()
    
                const data = JSON.stringify({
                    'host' : host,
                    'cpu' : cpu,
                    'memory' : mem['usedMemPercentage'],
                    'nodes' : node_service,
                    'time' : Date.now()
                })

                const options = {
                    hostname: '962c-2001-44c8-4240-e64a-9c7a-fb01-337d-aa5a.ngrok.io',
                    path: '/api/history',
                    //port: 3000,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    },
                }
                        
                const req = https.request(options, res => {
                    content_servers = true
                    res.on('data', d => {
                        process.stdout.write(d)
                    })
                })
                
                req.on('error', error => {
                    content_servers = false
                    console.log(`error : ${error}`)
                })
                
                req.write(data)
                req.end()

                //end programd
                pm2.disconnect() 
            })
        })

        setTimeout(() => {
            get_resource()
        }, 10000 , 'stoping send resouce to servers');
    }

    //start get resource
    get_resource()
}

//run app.js
main()


