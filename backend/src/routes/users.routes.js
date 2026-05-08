import { Router } from "express";
import {
  login,
  register,
  addToUserHistory,
  getUserHistory,
  handleCreateMeeting,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToUserHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/create-meeting").post(handleCreateMeeting);

export default router;
