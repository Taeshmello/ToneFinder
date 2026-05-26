package com.tonefinder.service

import com.tonefinder.entity.AnalysisResult
import com.tonefinder.repository.AnalysisResultRepository
import com.tonefinder.util.AudioHashUtil
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths

data class UploadOutcome(val result: AnalysisResult, val cached: Boolean)

@Service
class AudioService(
    private val repository: AnalysisResultRepository,
    @Value("\${file.upload.path}") private val uploadDir: String,
) {
    init {
        Files.createDirectories(Paths.get(uploadDir))
    }

    fun upload(file: MultipartFile, userId: Long? = null): UploadOutcome {
        val bytes = file.bytes
        val hash = AudioHashUtil.sha256Hex(bytes)

        repository.findFirstByAudioHash(hash)?.let { cached ->
            // 로그인 사용자가 이 해시를 처음 올리는 경우 이력에 기록
            if (userId != null && repository.findFirstByAudioHashAndUserId(hash, userId) == null) {
                val entry = repository.save(
                    AnalysisResult(
                        audioHash = hash,
                        audioFilename = file.originalFilename,
                        userId = userId,
                    )
                )
                return UploadOutcome(entry, cached = true)
            }
            return UploadOutcome(cached, cached = true)
        }

        val ext = file.originalFilename
            ?.substringAfterLast('.', "")
            ?.takeIf { it.isNotBlank() } ?: "bin"
        val dest = Paths.get(uploadDir, "$hash.$ext")
        Files.write(dest, bytes)

        val saved = repository.save(
            AnalysisResult(
                audioHash = hash,
                audioFilename = file.originalFilename,
                userId = userId,
            )
        )
        return UploadOutcome(saved, cached = false)
    }
}
