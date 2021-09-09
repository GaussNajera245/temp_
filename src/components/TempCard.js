import React from 'react'
import { Paper, CircularProgress } from '@material-ui/core';
import {Text, QrText} from "./TemperatureText";
import Animated from "./Animated";

const companyName = process.env.REACT_APP_COMPANY_NAME;
const company = companyName.toUpperCase();

const TempCard = ({data, message, state}) => {
    const { warn, progress } = state; 
    let status = progress === true 
      ?  <QrText msg="Cargando ..." />
      :  <QrText msg={message}/>;

    let bkc = "#000000"; //background-color
    
    const key = typeof(data) !== "undefined";
    if( key ){
      const {temp} = data;
      if( temp && temp<36.8 ) {   //green
          bkc = '#41c847';
          status = <Text temp={temp} />;
      }
      else if( temp && temp>=36.8 && temp<37.3 ){ //yellow
          bkc = '#fdd835'; 
          status = <Text temp={temp} />;  
      }
      else if( temp && temp>=37.3 ){   //red
          bkc = '#e41414';
          status = <Text temp={temp} />;
      }
    }

    const innerStyle = {
      flexDirection: window.innerWidth > 790 ? "row" : "column",
      height: window.innerWidth === 480 ? "80vh": "65vh",
      backgroundColor: bkc
    }

    return (
      <>
        <div className="companyName-style">  {company}  </div>
        <Paper className="paper-style" style={ innerStyle } >
          {status}
          {(progress) && <CircularProgress style={{height:270, width:270}} />}
          {warn && <Animated />}
        </Paper>
      </>
    )
}
 
export default TempCard;
