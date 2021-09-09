const electron = require('electron');
const express = require('express');
const fs = require('fs');
const appExp = express();
const http = require('http').createServer(appExp);
const { app, BrowserWindow, ipcMain } = electron;
const SerialPort = require('serialport');
const bodyParser = require('body-parser');
const path = require('path');
const url = require('url');
var currentJSON = require('./cached.json');
const PORT = 8080;
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800, height: 600, 
        webPreferences: { nodeIntegration: true },
  //      frame: false
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '..\\build\\index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);
(!process.env.ELECTRON_START_URL && mainWindow.setFullScreen(true));
    mainWindow.on('closed', function () {
        mainWindow = null
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

/// the "ipcMain.handle" is used to listen from FrontEnd, but you can also respond back!!
//  just return whatever you want to send to FE.  :P

// Also, every channel has a name to listen to, that's how they differentiate from each other,
// in this place What I did, was create an empty JSON file (cached.json)
// and everytime I make a request to search for an Employee, I saved the employee in the JSON file,
// soo, in summary,  I ask the employee in FE, pass it down to BE (via 'cached' channel) and saved it on JSON.
///  And the next time I ask for an employee I first check on the JSON (via the search channel) 
//   and return the info if it's already saved. If not, the return {empty:true}

ipcMain.handle('search', async (event, {IDtarjeta})=>{
    if(IDtarjeta in currentJSON){
        return currentJSON[IDtarjeta]
    }else{
        return {empty:true}
    }
})

ipcMain.handle('cached', async (event, { _id, rfid, fullName })=>{
    if( !(rfid in currentJSON) ){
        const employee = {_id, rfid, fullName}
        currentJSON[rfid] = {...employee};
        fs.writeFile('cached.json', JSON.stringify(currentJSON, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
    }
})

///////////////////////////////////////////////////////////
/////////// /////////// SERIAL PORT /////////// /////////// 
const mySerial = new SerialPort('/dev/ttyUSB0', { baudRate: 4800 }); // rPi

mySerial.on('open', function() { console.log('Opened Serial Port') });
mySerial.on('err', function(err) { console.log(err.message)  });

let buff = "";
mySerial.on('data', function (data) {
    console.log(data.toString('hex'));
    buff += data.toString('hex'); 

    if(buff.length === 14){
        const A = parseInt(buff.slice(4,6))/10;
        const B = parseInt(buff.slice(6,8)) +12;
        console.log({temp:A+B})	
        sendTemp( A+B );
        buff = "";
    };
});

function temp(data){
    const main = parseInt('680173',16)
    const A = parseInt(data, 16)
    const add = (A-main)
    const h = add/(parseInt('010001',16))
    console.log({main, A, add, h})
    return 36.0+(h*.1)
}

///////////////////////////////////////////////////////////hi
/////////// /////////// SERVER SIDE /////////// ///////////


/// IN the newer versions I don't use Express anymore:v, the Express server was used only for development
//  I use now a workaround where you can set a custom function inside the console object
/// for example you can set (on FrontEnd, I haven't tried in BE:v):

/*
    console.sayHIto = (name)=>{
        console.log(`Hi there you stranger named ${name}`)
    }
*/

// and then you can use that function in Development tools, calling console.sayHIto('Thomas');
// just in case you need it:P,
// like knowing the status of any variable or changing the state. 


/// The old way, was sending a fetch request from developer tools at localhost:8080/temp, to simulate the serialPort event 

appExp.use( bodyParser.json() );

appExp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

appExp.get('/*', (req, res) => {
    res.json({
        title:"Welcome to the temperature endpoint", 
    message:"The POST request should have the following format",
    example:{
        temp:45,
        sensorID:1
    }
    })
});

appExp.post('/temp', (req, res) => {
    if(typeof(req.body.temp) === "number"){
        const {temp} = req.body;
        res.status(200).json({ message: "success" });
        sendTemp(temp); 
        console.log({temp});
    }
    else{
        res.status(400).json({ message: "something Wrong: missing temp" })
    }
});

http.listen(PORT, ()=>{
    console.log(`Server ready on port ${PORT}`)
});



//// To send data to FrontEnd in a One-way only communication channel
/// use the "mainWindow.webContents.send"

/// it's actually a habit mine to destroy the channel after creating it, currently I'm not sure if that's neccesary anymore.
/// I think you may omit it, and use "ipcRenderer.once" instead of "ipcRendere.on" on the FrontEnd, and have the same behaviour.
/// either way be careful with eventlisteners when repeating.

const sendTemp = (value) => {
    mainWindow.webContents.send('temp', { temp: value });
    ipcMain.removeAllListeners('temp');
}
