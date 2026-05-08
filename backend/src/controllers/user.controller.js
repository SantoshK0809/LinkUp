import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";
import Schedule from "../models/schedule.model.js";
import getJoinState from "../utils/join.meeting.js";

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please Provide." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found." });
    }

    console.log("user password", user.password);
    console.log("user", user);

    const hashedPassword = await bcrypt.compare(password, user.password);
    console.log("hashedPassword", hashedPassword);

    if (!hashedPassword) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Password." });
    }

    let token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Login successful", token: token, userData: user.name });
  } catch (error) {
    return res.status(500).json({ message: `Something went wrong ${error}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (error) {
    res.json({ message: `Something went wrong ${error}` });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found." });
    }
    const meetings = await Meeting.find({ user_id: user.username });
    console.log("meetings", meetings);

    return res
      .status(httpStatus.OK)
      .json({ message: "Meetings fetched successfully", meetings: meetings });
  } catch (error) {
    return res.status(500).json({ message: `Something went wrong ${error}` });
  }
};

const addToUserHistory = async (req, res) => {
  const { token, meetingCode } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      console.log("user not found");
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found." });
    }

    const meeting = new Meeting({
      user_id: user.username,
      meetingCode: meetingCode,
    });
    console.log("Meeting has been added to history", meeting);

    await meeting.save();
    res.status(httpStatus.OK).json({ message: "Meeting added to history" });
  } catch (error) {
    return res.status(500).json({ message: `Something went wrong ${error}` });
  }
};

const handleCreateMeeting = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { meetingCode, title, description, startDate, startTime, endTime } =
      req.body;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    // const meetingCode = crypto.randomBytes(4).toString("hex");
    const meeting = new Schedule({
      hostId: user._id,
      title: title,
      description: description,
      scheduleDate: startDate,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      participants: [
        {
          userId: user._id,
          role: "host",
        },
      ],
      meetingCode: meetingCode,
    });
    await meeting.save();
    return res
      .status(201)
      .json({
        message: "Meeting created successfully",
        // meetingCode: meetingCode,
        meeting: meeting,
      });
  } catch (error) {
    return res.status(500).json({ message: `Something went wrong ${error}` });
  }
};

const handleValidateMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.body;
    const meeting = await Schedule.findOne({ meetingCode: meetingCode });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting Not Found" });
    }
    
    const joinState = getJoinState(meeting);

    if (joinState === "LOBBY" || joinState === "JOIN") {
      return res.status(200).json({ message: "Valid Meeting Code" });
    } else if (joinState === "TOO_EARLY") {
      return res.status(403).json({ message: "Meeting has not started yet" });
    } else if (joinState === "ENDED") {
      return res.status(403).json({ message: "Meeting has already ended" });
    } else {
      return res.status(400).json({ message: "Invalid Meeting State" });
    }
    
  } catch (err) {
    console.log("Error in validate-meeting", err);
    return res.status(500).json({ message: `Something went wrong ${err}` });
  }
}

export { login, register, getUserHistory, handleCreateMeeting, addToUserHistory };
