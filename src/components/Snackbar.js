import React, { useEffect, useState } from 'react';
import MaterialSnack from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';

function Snackbar({ text, open, severity }){
  const [_open, _setOpen] = useState(open);
  
  useEffect( () => _setOpen(open), [open] )

  const location = {
      vertical: 'top', 
      horizontal: 'right'
  };
    
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') { return; }
    _setOpen(false);
  };
 
  return(
     <MaterialSnack open={_open} autoHideDuration={2100} onClose={handleClose}  anchorOrigin={ location }>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity={ severity || "info" }>
            { text }
        </MuiAlert>
     </MaterialSnack>
  )
};

export default Snackbar;