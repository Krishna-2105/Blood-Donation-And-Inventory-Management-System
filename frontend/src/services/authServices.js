const API_BASE="http://localhost:3000/api/auth"
export const login=async (data)=>
{
    const res=await fetch(`${API_BASE}/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })

    return res.json()
}


export const signup=async (data)=>{
    const res=await fetch(`${API_BASE}/signup`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    if(!res.ok)
    {
        return {success:false,message:"Request failed"}
    }
    return res.json()
}