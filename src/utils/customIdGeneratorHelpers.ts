import User from "../db/models/user.model";
import Admin from "../db/models/admin.model";

import { BadRequest } from "../errors/httpErrors";

class GeneratorService {
  async generateUserCustomId(): Promise<string> {
    try {
      // Find the last user saved in the database
      const lastUser = await User.findOne({}, {}, { sort: { createdAt: -1 } });

      let nextId = 1;
      if (lastUser) {
        // Extract the ID of the last user and increment it
        const lastId = parseInt(lastUser.userCustomId.substring(2), 10);
        nextId = lastId + 1;
      }

      // Calculate the padding length based on the range of the next ID
      const paddingLength = calculatePaddingLength(nextId);

      // Format the next ID with leading zeros
      const formattedId = `UR${nextId.toString().padStart(paddingLength, "0")}`;

      return formattedId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new BadRequest(error.message, "INVALID_REQUEST_PARAMETERS");
    }
  }

  async generateAdminCustomId(): Promise<string> {
    try {
      // Find the last admin saved in the database
      const lastAdmin = await Admin.findOne(
        {},
        {},
        { sort: { createdAt: -1 } }
      );

      let nextId = 1;
      if (lastAdmin) {
        // Extract the ID of the last admin and increment it
        const lastId = parseInt(lastAdmin.adminCustomId.substring(3), 10);
        nextId = lastId + 1;
      }

      // Calculate the padding length based on the range of the next ID
      const paddingLength = calculatePaddingLength(nextId);

      // Format the next ID with leading zeros
      const formattedId = `ADM${nextId.toString().padStart(paddingLength, "0")}`;

      return formattedId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new BadRequest(error.message, "INVALID_REQUEST_PARAMETERS");
    }
  }
}
export default new GeneratorService();

// Function to calculate padding length based on the range of the next ID
function calculatePaddingLength(nextId: number): number {
  let paddingLength = 3; // Default padding length for IDs 001-999

  // Determine the padding length based on the range of the next ID
  const ranges = [
    1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
  ]; // Ranges to check
  for (let i = 0; i < ranges.length; i++) {
    if (nextId >= ranges[i]) {
      paddingLength = i + 4; // Padding for IDs starting from 4 digits
    } else {
      break; // Exit loop if the nextId is less than the current range
    }
  }

  return paddingLength;
}
