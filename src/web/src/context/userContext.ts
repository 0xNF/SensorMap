export const key: string = "userContext";
export const initialValue: string = null;

class User {
    Username: string;
    Email: string;

    constructor(uname: string, email: string) {
        this.Username = uname;
        this.Email = email;
    }
}




export {
    User
}