import React from 'react';
import { Grid, Paper, TextField, Button, Hidden } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    height:"100%", 
    backgroundColor: "white", 
    color:"white", 
    [theme.breakpoints.up('sm')]: {   padding:"0px 30px 26px" },
    [theme.breakpoints.only('xs')]: { padding:"6px 24px 41px" }
  },
}));
 
const DataTag = ({myInput, user, clean}) => {
  const classes = useStyles();

  return (
    <Grid item xs={12} sm={12} style={{position: "absolute", bottom: 0, width: "100%"}}>
      <Paper className={classes.root} >
        <Grid container  direction="row" justify="center" alignItems="center" > 

          <Grid item xs={6} sm={3} style={{display: "flex", justifyContent: "center"}}>
            <TextField label="Ingresa tu # de Tarjeta " id="standard-size-small" defaultValue="" inputRef={myInput} autoFocus inputProps={{style: {fontSize: "1.50rem"} }}/>
          </Grid>

          <Hidden only="xs" >
            <Grid item xs={12} sm={6} style={{marginLeft:"20px",marginRight:"-20px", display:"flex"}} >
              <TextField id="outlined-basic" disabled value={user} style={{margin:5, width:"90%"}} label="Nombre" inputProps={{style: {fontSize: "1.50rem"} }} />
            </Grid>
          </Hidden>

          <Grid item xs={6} sm={3} style={{display: "flex", justifyContent: "center", padding:13, marginRight:"-20px"}} >
            <Button variant="contained" className="limpiar-tarjeta-button" onClick={clean} >Limpiar tarjeta</Button>
          </Grid>

          <Hidden smUp>
            <Grid item xs={12} sm={6} style={{ display:"flex" }} >
              <TextField id="outlined-basic" disabled value={user} style={{margin:5, width:"100%"}} label="Nombre" inputProps={{style: {fontSize: "1.35rem"} }} />
            </Grid>
          </Hidden>

        </Grid>
      </Paper>
    </Grid>
  )
}
 
export default DataTag;
