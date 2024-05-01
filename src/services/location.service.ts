import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

class LocationService {
  private locationAxios: AxiosInstance;

  constructor() {
    this.locationAxios = axios.create({
      baseURL: "https://api.countrystatecity.in/v1/",
      headers: {
        "X-CSCAPI-KEY": process.env.LOCATION_SECRET,
      },
    });
  }

  async allCountries() {
    const response = await this.locationAxios.get("/countries");
    return response.data;
  }

  async allStatesByCountry(ciso: string) {
    const response = await this.locationAxios.get(`/countries/${ciso}/states`);
    return response.data;
  }

  async allCitiesInStateAndCountry(ciso: string, siso: string) {
    const response = await this.locationAxios.get(
      `/countries/${ciso}/states/${siso}/cities`
    );
    return response.data;
  }

  async allCitiesInCountry(ciso: string) {
    const response = await this.locationAxios.get(`/countries/${ciso}/cities`);
    return response.data;
  }
}

export default new LocationService();
