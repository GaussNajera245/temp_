const fetch = require("node-fetch");
const companyId = process.env.REACT_APP_COMPANY_ID;
const companyName = process.env.REACT_APP_COMPANY_NAME;
const equipmentId = process.env.REACT_APP_EQUIPMENT_ID;
const token = process.env.REACT_APP_TOKEN;

class GraphqlRequest {
    addEmployee(rfid) {
        const A = ` mutation{ 
            addEmployee( 
                firstName: "Anonimo",  rfid:"${rfid}", 
                momSurname: "Y",       companyId: "${companyId}"  
                dadSurname: "X",       companyName: "${companyName}", 
                ){ 
                    employeeId 
                } 
            }`;
        return this._returnPromise(A, "addEmployee");
    }

    getEmployee(rfid) {
        const G = `query{ 
            getEmployeeByRfid( rfid:"${rfid}" ){ 
                _id 
                companyEmployeeId 
                fullName 
                companyName 
                rfid 
            } 
        }`;
        return this._returnPromise(G, "getEmployeeByRfid");
    }

    newTempDocument(myObject) {
        const { rfid, temperature, employeeId } = myObject;
        const T = `mutation{ 
            newTempDocument( 
                input:{ temperature: ${temperature},
                        companyId: "${companyId}", 
                        companyName: "${companyName}",
                        rfid: "${rfid}", 
                        equipmentId: "${equipmentId}",
                        employeeId: "${employeeId}",
                }){
                    rfid
                }
            }`;
        return this._returnPromise(T, "newTempDocument");
    }

    _returnPromise(query, field) {
        const API_URL = "https://okku.herokuapp.com/";

        if( !token ) { throw new Error("No token found, check env") };

        return new Promise( async (resolve, reject) => {
            await fetch( API_URL, {
                method: 'post',
                body: JSON.stringify({ query }),
                headers: {
                    'Content-Type': 'application/json',
                    "authorization": `Bearer ${token}`
                },
            })
                .then( (data) => data.json() )
                .then( (values) => {
                    if ("errors" in values) reject(values.errors[0])
                    resolve(values.data[field]);
                })    
                .catch( (e) => reject(e) );
        })

    }
}

export default new GraphqlRequest();