export const baseURL = "http://localhost:5000/api";

export const postRequest = async (URL, body) => {
    const token = localStorage.getItem('token');
    const response = await fetch(URL,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body,
    });
    const data = await response.json();

    if (!response.ok) {
        let message

        if(data?.message){
            message= data.message;
        }else{
            message = data;
        }
        return {
            error: true,
            message
        }
    }

    return data;
}

export const getRequest = async (URL) => {
    const token = localStorage.getItem('token');
    const response = await fetch(URL, {
        method: "GET",
        headers: {
            ...(token && { "Authorization": `Bearer ${token}` }),
        }
    });

    const data = await response.json();

    if (!response.ok) {
        let message = "An error occurred";

        if(data?.message){
            message= data.message;
        }
        return {
            error: true,
            message
        }
    }
    return data;
}

