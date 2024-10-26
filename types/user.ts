export interface User {
    id?: number;
    firstName: string;
    lastName: string | null;
    email: string;
    telephone: string;
    houseNo: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    zipcode: string;
    isAdmin: boolean;
    isGuest: boolean;
    password: string;
  }

export interface LoginFrom {
    username: string;
    password: string;
}
