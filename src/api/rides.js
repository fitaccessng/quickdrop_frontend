import http from "./http";

/**
 * Request a new ride
 * @param {Object} payload - Ride request data
 * @param {string} payload.vehicle_type - Vehicle type: 'bike', 'car', or 'xl'
 * @param {number} payload.price - Price of the ride
 * @param {string} payload.pickup_location - Pickup location
 * @param {string} payload.dropoff_location - Dropoff location
 * @returns {Promise<Object>} Ride response with ride_id, status, etc.
 */
export const requestRide = async (payload) => {
  const { data } = await http.post("/rides/request", payload);
  return data;
};

/**
 * Get ride status and tracking information
 * @param {string} rideId - ID of the ride to track
 * @returns {Promise<Object>} Ride status with driver info, location, etc.
 */
export const fetchRideStatus = async (rideId) => {
  const { data } = await http.get(`/rides/${rideId}`);
  return data;
};

/**
 * Get all rides for the current user
 * @returns {Promise<Array>} List of user's rides
 */
export const fetchUserRides = async () => {
  const { data } = await http.get("/rides/user/history");
  return data;
};
