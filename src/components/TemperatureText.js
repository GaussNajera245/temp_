import React from 'react'
import { Typography } from '@material-ui/core';
import { ReactComponent as Barcode } from '../assets/barcode.svg';
import { ReactComponent as QR } from '../assets/qr-code.svg';

export const Text = ({temp}) => { 
    return (
        <Typography variant="h1" className="temperature-text">
          {temp} °C
        </Typography>
      );
};

export const QrText = ({msg})=>{
    return (
      (msg === "default")
        ? <h1 className="special-message-in-tempcard"> 
            Muestre <Barcode className="barcode-img"/> o <QR /> sobre la camara o acerque su frente al sensor
          </h1>
        : <h1 className="message-in-tempcard"> {msg} </h1>
    );
}

