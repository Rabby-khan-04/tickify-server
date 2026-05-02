import status from "http-status";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponce from "../utils/ApiResponse.js";
import Contact from "../models/contact.model.js";

const submitContact = asyncHandler(async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log({ name, email, subject, message });

    if (!name || !email) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Name, email, and photo are required!!",
      );
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    return res
      .status(status.CREATED)
      .json(
        new ApiResponce(
          status.CREATED,
          contact,
          "Message submitted successfully!!",
        ),
      );
  } catch (error) {
    console.log(`ERROR in submitContact: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while submitting your message!!",
    );
  }
});

const getAllContacts = asyncHandler(async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });

    return res
      .status(status.OK)
      .json(
        new ApiResponce(status.OK, contacts, "Contacts fetched successfully!!"),
      );
  } catch (error) {
    console.log(`ERROR in getAllContacts: ${error}`);

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      "Something went wrong while fetching contacts!!",
    );
  }
});

const ContactController = {
  submitContact,
  getAllContacts,
};

export default ContactController;
