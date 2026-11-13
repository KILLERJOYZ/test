package vn.lua.adviser

import com.facebook.react.bridge.*
import com.facebook.react.ReactPackage
import com.facebook.react.uimanager.ViewManager
import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.prompt.Generation
import com.google.mlkit.genai.prompt.TextPart
import com.google.mlkit.genai.prompt.generateContentRequest
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.collect
import java.util.concurrent.ConcurrentHashMap
import java.security.MessageDigest
import java.security.KeyFactory
import java.security.Signature
import java.security.spec.X509EncodedKeySpec
import android.util.Base64

/** Device-local Gemini Nano bridge. No prompt is sent to an application backend. */
class LocalAiModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val model by lazy { Generation.getClient() }
    private val jobs = ConcurrentHashMap<String, Job>()
    override fun getName() = "AdviserLocalAi"

    private fun statusName(status: Int) = when (status) {
        FeatureStatus.AVAILABLE -> "available"
        FeatureStatus.DOWNLOADABLE -> "downloadable"
        FeatureStatus.DOWNLOADING -> "downloading"
        else -> "unavailable"
    }
    @ReactMethod fun availability(promise: Promise) {
        scope.launch {
            try { promise.resolve(withTimeout(10000) { statusName(model.checkStatus()) }) }
            catch (_: Exception) { promise.resolve("unavailable") }
        }
    }
    @ReactMethod @Synchronized fun download(promise: Promise) {
        if (jobs["download"]?.isActive == true) { promise.reject("BUSY", "Model preparation is already running"); return }
        jobs["download"] = scope.launch {
            try {
                withTimeout(600000) {
                    val status = model.checkStatus()
                    if (status == FeatureStatus.DOWNLOADABLE) model.download().collect { }
                    promise.resolve(statusName(model.checkStatus()))
                }
            } catch (_: CancellationException) { promise.reject("CANCELLED", "Model preparation cancelled") }
            catch (_: Exception) { promise.reject("DOWNLOAD_FAILED", "AICore model preparation failed") }
            finally { coroutineContext[Job]?.let { jobs.remove("download", it) } }
        }
    }
    @ReactMethod @Synchronized fun generate(requestId: String, prompt: String, promise: Promise) {
        if (prompt.length > 10000 || requestId.length > 100 || prompt.isBlank()) { promise.reject("INVALID_INPUT", "Prompt exceeds local bounds"); return }
        if (jobs.values.any { it.isActive }) { promise.reject("BUSY", "Local inference is already running"); return }
        jobs[requestId] = scope.launch {
            try {
                val text = withTimeout(45000) {
                    if (model.checkStatus() != FeatureStatus.AVAILABLE) throw IllegalStateException("MODEL_UNAVAILABLE")
                    val request = generateContentRequest(TextPart(prompt)) { maxOutputTokens = 512; temperature = 0.0f }
                    model.generateContent(request).candidates.firstOrNull()?.text ?: throw IllegalStateException("EMPTY_OUTPUT")
                }
                if (text.length > 16000) throw IllegalStateException("OUTPUT_TOO_LARGE")
                promise.resolve(text)
            } catch (_: CancellationException) { promise.reject("CANCELLED", "Local inference cancelled or timed out") }
            catch (_: Exception) { promise.reject("LOCAL_AI_FAILED", "Gemini Nano unavailable, busy, quota limited, or returned no usable output") }
            finally { coroutineContext[Job]?.let { jobs.remove(requestId, it) } }
        }
    }
    @ReactMethod @Synchronized fun cancel(requestId: String) { jobs[requestId]?.cancel() }
    @ReactMethod fun digest(payload: String, promise: Promise) {
        try {
            if (payload.length > 3000000) throw IllegalArgumentException("Payload too large")
            promise.resolve(MessageDigest.getInstance("SHA-256").digest(payload.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) })
        } catch (e: Exception) { promise.reject("DIGEST_FAILED", e) }
    }
    @ReactMethod fun verify(payload: String, signature: String, publicKey: String, promise: Promise) {
        try {
            if (payload.length > 20000 || signature.length > 2048 || publicKey.length > 8192) throw IllegalArgumentException("Invalid signature envelope")
            val key = KeyFactory.getInstance("RSA").generatePublic(X509EncodedKeySpec(Base64.decode(publicKey, Base64.DEFAULT)))
            val verifier = Signature.getInstance("SHA256withRSA")
            verifier.initVerify(key)
            verifier.update(payload.toByteArray(Charsets.UTF_8))
            promise.resolve(verifier.verify(Base64.decode(signature, Base64.DEFAULT)))
        } catch (_: Exception) { promise.resolve(false) }
    }
    override fun invalidate() { scope.cancel(); model.close(); super.invalidate() }
}
class LocalAiPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(LocalAiModule(context), AdviserThemeModule(context))
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}


/** Android 12+ system tonal resources, with JS contrast validation and fallback. */
class AdviserThemeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    override fun getName() = "AdviserTheme"
    @ReactMethod fun scheme(dark: Boolean, promise: Promise) {
        if (android.os.Build.VERSION.SDK_INT < 31) { promise.resolve(null); return }
        try {
            fun color(family: String, tone: Int): String {
                val id = reactApplicationContext.resources.getIdentifier("system_${family}_${tone}", "color", "android")
                if (id == 0) throw IllegalStateException("NO_SYSTEM_COLOR")
                return String.format("#%06X", 0xFFFFFF and reactApplicationContext.getColor(id))
            }
            val map = Arguments.createMap()
            map.putString("bg", color("neutral1", if(dark) 900 else 10))
            map.putString("card", color("neutral1", if(dark) 800 else 0))
            map.putString("container", color("accent2", if(dark) 700 else 100))
            map.putString("onContainer", color("accent2", if(dark) 50 else 900))
            map.putString("text", color("neutral1", if(dark) 50 else 900))
            map.putString("muted", color("neutral2", if(dark) 200 else 700))
            map.putString("accent", color("accent1", if(dark) 200 else 600))
            map.putString("onAccent", color("accent1", if(dark) 900 else 0))
            map.putString("line", color("neutral2", if(dark) 400 else 600))
            map.putString("error", if(dark) "#FFB3B9" else "#A32932")
            promise.resolve(map)
        } catch (_: Exception) { promise.resolve(null) }
    }
}
