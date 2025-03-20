import React, { useState,useEffect } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

interface City{
    _id:string;
    name:string;
    location:{
        lat:number;
        lon:number;
    };
    pincode?:number
}

const SavedCities: React.FC  = () => {
    const [saved,setSaved]=useState<City[]>([]);
    const [pincode,setPincode]=useState<{[key:string]:number|""}>({});

    useEffect(() => {
        const fetchCities = async () => {
          try {
            const response = await axios.get("http://localhost:5000/api/cities/");
            console.log("Fetched saved cities:", response.data);
            setSaved(response.data);

            const initialPincodes:{[key:string]:number | ""}={};
            response.data.forEach((city:City)=>{
                initialPincodes[city._id]=city.pincode!==undefined?city.pincode: "";
            })
            console.log("initial ",initialPincodes)
            setPincode(initialPincodes)
          } catch (err: any) {
            console.error("Error fetching saved cities list:", err.response ? err.response.data : err.message);
          }
        };
        fetchCities();
    }, []);

    const handlePincodeChange=(cityid:string,value:string)=>{
      if (/^\d{0,7}$/.test(value)) {
        setPincode({ ...pincode, [cityid]: value !== "" ? Number(value) : "" });
      }
    }

    const updateSingleCity=async(cityId:string,updatedPincode:number|"")=>{
        try{
            const response=await axios.put(`http://localhost:5000/api/cities/${cityId}`,{pincode:updatedPincode});
            console.log("updatedcity ",response.data)
            alert("pincode updated successfully")
        }
        catch(err){
            console.error("Error updating pincode ",err)
            alert("Failed to update pincode")
        }
    }
    const updateAllCities = async () => {
      const validPincodes = Object.fromEntries(
          Object.entries(pincode).filter(([_, value]) => value !== "" && value !== undefined)
      );
  
      if (Object.keys(validPincodes).length === 0) {
          alert("No valid pincodes to update.");
          return;
      }
      console.log("Sending updates:", validPincodes); 
      try {
          const response = await axios.put(`http://localhost:5000/api/cities/update-all`, {
              updates: validPincodes
          });
  
          console.log("Updated cities:", response.data);
          alert("All pincodes updated successfully");
      } catch (err: any) {
          console.error("Error updating pincode:", err.response ? err.response.data : err.message);
          alert(`Failed to update pincode: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
      }
  };  
    
  return (
    <div className="container py-5">
      <h2 className="text-center text-white mb-4 fw-bold">Saved Cities</h2>

      {saved.length > 0 ? (
        <>
          {saved.map((city) => (
            <div
              key={city._id}
              className="row align-items-center justify-content-between bg-dark border border-secondary rounded p-3 mb-3">
              <div className="col-md-4 text-white fw-semibold">{city.name}</div>
              <div className="col-md-4">
                <input
                  type="number"
                  value={pincode[city._id]}
                  onChange={(e) => handlePincodeChange(city._id,e.target.value)}
                  className="form-control text-center bg-light text-dark"
                  placeholder="Enter Pincode"
                  min="0"
                />
              </div>
              <div className="col-md-4 text-end">
                <button type="button" className="btn btn-success" onClick={()=>updateSingleCity(city._id,pincode[city._id])}>Update</button>
              </div>
            </div>
          ))}
          <div className="text-center mt-4">
            <button type="button" className="btn btn-primary btn-lg" onClick={updateAllCities}>Update All</button>
          </div>
        </>
      ) : (
        <p className="text-center text-white">No saved cities</p>
      )}
    </div>
  );
}

export default SavedCities