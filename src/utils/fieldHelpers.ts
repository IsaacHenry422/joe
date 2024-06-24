//Define all other fields here....

// user field
export const userFields = [
  "_id",
  "firstname",
  "lastname",
  "email",
  "userCustomId",
  "profilePicture",
  "authMethod",
  "accountType",
  "isVerified",
  "finishTourGuide",
  "isAdmin",
  "phoneNumber",
  "dateOfBirth",
  "country",
  "city",
  "address",
  "createdAt",
  "deletedAt",
];

// admin field
export const adminFields = [
  "_id",
  "firstname",
  "lastname",
  "email",
  "phoneNumber",
  "role",
  "adminCustomId",
  "profilePicture",
  "accountType",
  "adminType",
  "isAdmin",
  "createdAt",
  "deletedAt",
];

export const invoiceField = [
  "_id",
  "customerName",
  "customerMail",
  "phoneNumber",
  "mediaType",
  "invoiceCustomId",
  "state",
  "BRTtypes",
  "period",
  "quantity",
  "unitPrice",
  "total",
  "tax",
  "dueDate",
  "invoiceNote",
  "createdAt",
  "updatedAt",
];

export const blogFields = [
  "_id",
  "blogType",
  "blogImage",
  "blogTitle",
  "blogBody",
];

export const favoriteFields = [
  "_id",
  "userId",
  "mediaId",
  "printId",
  "createdAt",
  "deletedAt",
];
