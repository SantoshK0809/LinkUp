const getJoinState = (meeting) => {
  const now = new Date();

  const earlyJoinTime = new Date(
    meeting.scheduledStart.getTime() -
      meeting.settings.earlyJoinMinutes * 60000
  );

  if (meeting.status === "cancelled") return "CANCELLED";
  if (now < earlyJoinTime) return "TOO_EARLY";
  if (now < meeting.scheduledStart) return "LOBBY";
  if (now <= meeting.scheduledEnd) return "JOIN";
  if(now > meeting.scheduledEnd) return "ENDED";
  return "ENDED";
};

export default getJoinState;