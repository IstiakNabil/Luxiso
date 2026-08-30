export interface Address {
  id: number;
  full_name: string;
  phone_number: string;
  country: string;
  division: string;
  district: string;
  postal_code: string;
  address_line: string;
  landmark: string;
  is_default: boolean;
  created_at: string;
}

/** Payload for create/update — everything except server fields. */
export interface AddressInput {
  full_name: string;
  phone_number: string;
  country: string;
  division: string;
  district: string;
  postal_code: string;
  address_line: string;
  landmark?: string;
  is_default?: boolean;
}
