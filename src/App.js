import React, { useRef, useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import TempCard from "./components/TempCard";
import DataTag from "./components/DataTag";
import Snackbar from "./components/Snackbar";
import graph from "./graphql/request";
const electron = window.require("electron")
const { ipcRenderer } = electron;

let autoClean, dictionary = {};

function App() {
  const myInput = useRef("");
  const [postTemp, setTemp] = useState();
  const [message, setMessage] = useState("Ingrese tarjeta o acerque su frente al sensor por 3 segundos");
  const [user, setUser] = useState("");
  const [state, setState] = useState({
    saved: false,   error: false,
    warn: false,    progress: false
  });

  useEffect(()=>{

    ///The "ipcRenderer.on" only listens for events from the BackEnd, be carefull where you place it
    ///  I used to place this event ("ipcRender.on"), outside of this useEffect, but then I realize 
    ///  that the event gets repeated on every UI Re-render, so be careful.


    // if you want to make a two way communication channel, use ipcRender.invoke

    ipcRenderer.on('temp', (event, data) => {
      const {temp} = data;
      const outOfRange = (temp >= 42 || temp <= 30) ? 0 : temp;
      capturing(outOfRange);
      console.log("Reading..");
    });
  },[]);

//====================================================== 
//============ [ ADD EMPLOYEE functions] =============== 
//====================================================== 
  const onErrorAE = err =>{
      console.error({addEmployee_ERR: err});
      setTimeout(clean,2000);
      setState( C => { return {...C, error:true, progress:false} });
  };
  const onCompletedAE = adata => {
      setState( E => { return {...E, progress:false} });
      dictionary.employeeId = adata.employeeId;
      setUser("Anonimo XYZ");
      console.log({Employee_Added:adata});
  }

//====================================================== 
//============ [ GET EMPLOYEE functions] =============== 
//====================================================== 
  const onErrorGE =  (err, V) => {
      console.error({getEmployee_ERR:{err, RFID:V}});
      
      graph.addEmployee(V)  
        .then( data => onCompletedAE(data) )
        .catch( err => onErrorAE(err) );
       
    };
  const onCompletedGE = cdata => {
      const { _id, rfid, fullName } = cdata;
      setUser(fullName);
      setState( E => { return {...E, progress:false} });
      console.log({[fullName]:rfid})
      dictionary.employeeId = _id;
      dictionary.nom = fullName;
      dictionary.rfid = rfid;
      ipcRenderer.invoke('cached',cdata);
  };


//======================================================= 
//============ [ NEW TEMPERATURE functions] ============= 
//=======================================================      
  const onErrorNT = (err,d) => { 
    console.error({newTemp_ERR: err}) 
    if( myInput.current.value !== "" ){
      setState( A => { return {...A, error:true} });
    }
  };
  const onCompletedNT = (tdata, dict2) => { 
    setState( C => { return {...C, saved:true} });
    console.log({SENT:{tdata,dict2}})
  };    
    
  const capturing = temp => {
      clearTimeout(autoClean);

      if(temp === 0){
          setTemp({temp:null});
          setMessage("Temperatura fuera de rango, favor de volver a tomar la lectura");
          setState( A => { return {...A, warn:true} });
      }else{
          setState( E => { return {...E, warn:false} });
          setTemp({temp});
          dictionary.temperature = temp;
      }
      
      graph.newTempDocument( dictionary )
        .then( data => onCompletedNT(data, dictionary) )
        .catch( er => onErrorNT(er,dictionary) );
      
      autoClean = setTimeout(clean, 4000 ); // how long will the temperature show
  }; 

  const enter = (e) => {
    const value = myInput.current.value;
    if (e.key === "Enter" && value !== "" && !myInput.current.disabled) {
      setMessage("Acerque su frente al sensor por 3 segundos");

      setState( M => {return { ...M, progress:true}} );


      /// The "ipcRender.invoke" can send data to BE, your can just send It, OR, you can wait for an Answer back
      /// the "then" is used if you expect an answer back, if not, just remove it like line 73 (ipcRenderer.invoke('cached',cdata);)

      ipcRenderer.invoke('search', {IDtarjeta:value})
        .then( res => {
          console.log(res);
          if ( '_id', 'rfid', 'fullName' in res ){
            onCompletedGE(res);
          }else{
            graph.getEmployee(value)
              .then( data => onCompletedGE(data))
              .catch( e => onErrorGE(e, value));
          }
        })
        .catch( e => console.error('search', e) );
          
      dictionary.rfid = value;
      myInput.current.disabled = true; 
    }
  };

  function clean(){
    setTemp({temp:null});
    console.log("Running clean...")
    myInput.current.disabled = false;
    dictionary = {};
    setUser("");
    myInput.current.focus()
    setState( A => {return { ...A, saved:false, warn:false, error:false }});
    if(!state.progress) {
      myInput.current.value = "";
      setMessage("Ingrese tarjeta o acerque su frente al sensor por 3 segundos");
    }
  };

  const handleFocus = () => myInput.current.focus();
  function PrivacyPolicy(){
    return (
      <span className="privacy-policy" >Al usar este equipo he leido y acepto las instrucciones y precauciones de uso, junto con el aviso de privacidad 
        <b> (https://cardiotrack.mx/ape)</b>
      </span>
    )
  }

  return (
    <div className="App" onMouseMove={handleFocus} onKeyUp={enter} onClick={handleFocus} >
      <Grid container  direction="row" className="main-grid-container" >
        <TempCard data={postTemp} message={message} state={state} />
        <DataTag myInput={myInput} user={user} clean={clean}/>
        <Snackbar open={state.saved} text={"Guardado 👍"} severity={"success"}/>
        <Snackbar open={state.error} text={"Error al guardar ❌"}  severity={"error"}/>
        <PrivacyPolicy />
      </Grid>
    </div>
  );
}
export default App;
