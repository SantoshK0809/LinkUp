import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  meetingCode: {
    type: String,
    required: true,
    unique: true
  },

  scheduledStart: {
    type: Date,
    required: true
  },

  scheduledEnd: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["scheduled", "active", "completed", "cancelled"],
    default: "scheduled"
  },

  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["host", "participant"],
        default: "participant"
      },
      joinedAt: Date,
      leftAt: Date
    }
  ],

  settings: {
    allowEarlyJoin: {
      type: Boolean,
      default: true
    },
    earlyJoinMinutes: {
      type: Number,
      default: 10
    },
    requireHostToStart: {
      type: Boolean,
      default: true
    }
  }

}, { timestamps: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;    