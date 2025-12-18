import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "agora-access-token";

dotenv.config();

const { RtcTokenBuilder, RtcRole } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.post("/token", (req, res) => {
  const { channelName, uid, role } = req.body;

  if (!channelName || uid === undefined) {
    return res.status(400).json({
      error: "channelName and uid are required"
    });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appID || !appCertificate) {
    return res.status(500).json({
      error: "Agora credentials not set"
    });
  }

  const rtcRole =
    role === "publisher"
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;

  const expireTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    Number(uid),
    rtcRole,
    privilegeExpireTime
  );

  res.json({ token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Token server running on port", PORT);
});
