import fs from 'fs';
import os from'os';
import path from 'path';
import { pipeline } from "stream/promises";

import { getOpenAI } from "../utils/openai.js";


export function registerTranscribeRoutes(server, logger) {
  server.post('/api/transcribe', async (request, reply) => {
    try {
      const parts = request.files();
      let audioFile;
      for await (const part of parts) {
        if (part.fieldname === 'audio') {
          audioFile = part;
          break;
        }
      }
      if (!audioFile) {
        logger.error("No audio file in request");
        return reply.status(400).send({ error: 'No audio file provided' });
      }

      logger.info(`Received audio file: ${audioFile.filename}`);

      // 将上传的文件保存到临时目录（文件名带上时间戳以避免冲突）
      const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${audioFile.filename}`);
      const writeStream = fs.createWriteStream(tempFilePath);

      await pipeline(audioFile.file, writeStream);
      logger.info(`Saved temporary file: ${tempFilePath}`);

      const openai = getOpenAI();

      // 使用 Whisper API 进行转录
      let transcript;
      try {
        logger.info("Sending to Whisper API...");
        const response = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: "whisper-1",
          response_format: "text"
        });
        transcript = response;
        logger.info(`Received transcript: ${transcript}`);
      } catch (whisperError) {
        logger.error(`Whisper API error: ${whisperError.message}`);
        throw whisperError;
      } finally {
        // 清理临时文件（异步删除，不阻塞响应）
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            logger.error(`Error cleaning up temporary file: ${err.message}`);
          } else {
            logger.info("Temporary file cleaned up");
          }
        });
      }

      return reply.status(200).send({ text: transcript });
    } catch (error) {
      logger.error("Error in /api/transcribe:", error);
      return reply.status(500).send({ error: error.message });
    }
  });
}
