export type User = {
    id: number;
    email?: string;
    username: string;
    password?: string;
    name: {
        firstname: string;
        lastname: string;
    };
    address: {
        city: string;
        street: string;
        number: number;
        zipcode: string;
        geolocation: {
            lat: string;
            long: string;
        };
    };
    phone: string;
    isAdmin: boolean;
};

export interface LoginFrom {
    username: string;
    password: string;
}

export interface CustomerData {
    isGuest: boolean;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    houseNo: string;
    addressLine1: string;
    addressLine2?: string;  // Optional
    city: string;
    zipcode: string;
  }