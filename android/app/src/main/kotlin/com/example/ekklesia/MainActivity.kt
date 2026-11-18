package com.example.ekklesia

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.example.ekklesia.ui.theme.EKKLESIATheme
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket

/**
 * Servidor HTTP embebido ultraligero que corre dentro del dispositivo Android.
 * Permite que una tablet o celular actúe como "Director" y transmita en vivo
 * a los demás músicos del grupo en la misma red local Wi-Fi sin depender de una PC.
 */
class LocalDirectorServer(private val port: Int = 8080) {
  private var serverSocket: ServerSocket? = null
  @Volatile private var isRunning = false
  @Volatile private var latestLiveStateJson: String = "{\"status\":\"idle\",\"timestamp\":0}"

  fun updateState(json: String) {
    latestLiveStateJson = json
  }

  fun start() {
    if (isRunning) return
    isRunning = true
    Thread {
      try {
        serverSocket = ServerSocket(port)
        while (isRunning) {
          val client = serverSocket?.accept() ?: break
          Thread { handleClient(client) }.start()
        }
      } catch (_: Exception) {
      }
    }.start()
  }

  fun stop() {
    isRunning = false
    try {
      serverSocket?.close()
    } catch (_: Exception) {}
    serverSocket = null
  }

  private fun handleClient(socket: Socket) {
    try {
      val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
      val writer = OutputStreamWriter(socket.getOutputStream(), Charsets.UTF_8)
      val requestLine = reader.readLine() ?: return

      val corsHeaders = "HTTP/1.1 200 OK\r\n" +
          "Access-Control-Allow-Origin: *\r\n" +
          "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
          "Access-Control-Allow-Headers: Content-Type, Accept\r\n"

      if (requestLine.startsWith("OPTIONS")) {
        writer.write(corsHeaders + "Content-Length: 0\r\n\r\n")
        writer.flush()
      } else if (requestLine.startsWith("GET /api/live-sync")) {
        val payloadBytes = latestLiveStateJson.toByteArray(Charsets.UTF_8)
        writer.write(corsHeaders +
            "Content-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: ${payloadBytes.size}\r\n\r\n" +
            latestLiveStateJson
        )
        writer.flush()
      } else if (requestLine.startsWith("POST /api/live-sync")) {
        var contentLength = 0
        var headerLine: String? = reader.readLine()
        while (!headerLine.isNullOrEmpty()) {
          if (headerLine.lowercase().startsWith("content-length:")) {
            contentLength = headerLine.substringAfter(":").trim().toIntOrNull() ?: 0
          }
          headerLine = reader.readLine()
        }
        val bodyChars = CharArray(contentLength)
        if (contentLength > 0) {
          reader.read(bodyChars, 0, contentLength)
          val body = String(bodyChars)
          latestLiveStateJson = body
        }
        val response = "{\"success\":true}"
        val responseBytes = response.toByteArray(Charsets.UTF_8)
        writer.write(corsHeaders +
            "Content-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: ${responseBytes.size}\r\n\r\n" +
            response
        )
        writer.flush()
      } else {
        val response = "{\"appName\":\"EKKLESIA Director Server\",\"status\":\"online\"}"
        val responseBytes = response.toByteArray(Charsets.UTF_8)
        writer.write(corsHeaders +
            "Content-Type: application/json; charset=utf-8\r\n" +
            "Content-Length: ${responseBytes.size}\r\n\r\n" +
            response
        )
        writer.flush()
      }
      socket.close()
    } catch (_: Exception) {
      try { socket.close() } catch (_: Exception) {}
    }
  }
}

/**
 * Obtiene la dirección IP local de la red Wi-Fi del dispositivo
 */
fun getLocalIpAddress(): String {
  try {
    val interfaces = NetworkInterface.getNetworkInterfaces()
    for (intf in interfaces) {
      val addrs = intf.inetAddresses
      for (addr in addrs) {
        if (!addr.isLoopbackAddress && addr is Inet4Address) {
          val ip = addr.hostAddress ?: ""
          if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
            return ip
          }
        }
      }
    }
  } catch (_: Exception) {}
  return "127.0.0.1"
}

/**
 * Puente JavaScript para conectar la interfaz web de EKKLESIA con el hardware Android
 */
class AndroidBridge(
  private val context: Context,
  private val directorServer: LocalDirectorServer,
  private val onOpenConfig: () -> Unit
) {
  @JavascriptInterface
  fun getLocalIp(): String {
    return getLocalIpAddress()
  }

  @JavascriptInterface
  fun startDirectorServer(): Boolean {
    directorServer.start()
    return true
  }

  @JavascriptInterface
  fun stopDirectorServer() {
    directorServer.stop()
  }

  @JavascriptInterface
  fun broadcastLiveState(stateJson: String) {
    directorServer.updateState(stateJson)
  }

  @JavascriptInterface
  fun isStandaloneApk(): Boolean {
    return true
  }

  @JavascriptInterface
  fun openNetworkSettings() {
    onOpenConfig()
  }
}

class MainActivity : ComponentActivity() {

  companion object {
    const val PREFS_NAME = "ekklesia_prefs"
    const val KEY_SERVER_URL = "server_url"
    const val STANDALONE_URL = "https://appassets.androidplatform.net/assets/www/index.html"
    const val DEFAULT_SERVER_URL = STANDALONE_URL
  }

  private var webView: WebView? = null
  private lateinit var prefs: SharedPreferences
  val directorServer = LocalDirectorServer(8080)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 1. Pantalla siempre encendida en el escenario (Wake Lock nativo)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Iniciar servidor local P2P para ensayos en background
    directorServer.start()

    prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Manejo nativo de gestos de regreso (predictive back gesture de Android)
    onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (webView?.canGoBack() == true) {
          webView?.goBack()
        } else {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        }
      }
    })

    enableEdgeToEdge()
    setContent {
      EKKLESIATheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = Color(0xFF0F172A)
        ) {
          val savedUrl = prefs.getString(KEY_SERVER_URL, null)
          EkklesiaScreen(
            initialUrl = savedUrl ?: DEFAULT_SERVER_URL,
            directorServer = directorServer,
            onSaveUrl = { newUrl ->
              prefs.edit().putString(KEY_SERVER_URL, newUrl).apply()
            },
            onAttachWebView = { wv ->
              webView = wv
            }
          )
        }
      }
    }
  }

  override fun onDestroy() {
    directorServer.stop()
    super.onDestroy()
  }

  // Interceptación de botones físicos de volumen y pedales Bluetooth para pasar acordes
  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      when (event.keyCode) {
        KeyEvent.KEYCODE_VOLUME_DOWN, KeyEvent.KEYCODE_PAGE_DOWN -> {
          webView?.evaluateJavascript(
            "window.scrollBy({ top: 320, behavior: 'smooth' });",
            null
          )
          return true
        }
        KeyEvent.KEYCODE_VOLUME_UP, KeyEvent.KEYCODE_PAGE_UP -> {
          webView?.evaluateJavascript(
            "window.scrollBy({ top: -320, behavior: 'smooth' });",
            null
          )
          return true
        }
      }
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onBackPressed() {
    if (webView?.canGoBack() == true) {
      webView?.goBack()
    } else {
      super.onBackPressed()
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EkklesiaScreen(
  initialUrl: String,
  directorServer: LocalDirectorServer,
  onSaveUrl: (String) -> Unit,
  onAttachWebView: (WebView) -> Unit
) {
  var serverUrl by remember { mutableStateOf(initialUrl) }
  var isConfigDialogOpen by remember { mutableStateOf(false) }
  var hasLoadError by remember { mutableStateOf(false) }
  var errorMessage by remember { mutableStateOf("") }
  var isLoading by remember { mutableStateOf(true) }
  var internalWebView by remember { mutableStateOf<WebView?>(null) }
  val context = LocalContext.current

  // Cargador de activos embebidos para modo 100% offline sin servidor
  val assetLoader = remember {
    WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
      .build()
  }

  Box(modifier = Modifier.fillMaxSize()) {
    AndroidView(
      modifier = Modifier
        .fillMaxSize()
        .statusBarsPadding()
        .navigationBarsPadding(),
      factory = { ctx ->
        WebView(ctx).apply {
          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(true)
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
          }

          // Registrar puente de comunicación nativo
          addJavascriptInterface(
            AndroidBridge(ctx, directorServer) {
              isConfigDialogOpen = true
            },
            "AndroidBridge"
          )

          webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
              if (newProgress >= 100) {
                isLoading = false
              }
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
              // Otorgar permiso de audio para el Afinador Cromático nativo
              request?.grant(request.resources)
            }
          }

          webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
              view: WebView?,
              request: WebResourceRequest?
            ): WebResourceResponse? {
              val url = request?.url ?: return null
              if (url.host == "appassets.androidplatform.net") {
                return assetLoader.shouldInterceptRequest(url)
              }
              return super.shouldInterceptRequest(view, request)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
              super.onPageStarted(view, url, favicon)
              isLoading = true
              hasLoadError = false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
              isLoading = false
            }

            override fun onReceivedError(
              view: WebView?,
              request: WebResourceRequest?,
              error: WebResourceError?
            ) {
              super.onReceivedError(view, request, error)
              if (request?.isForMainFrame == true) {
                hasLoadError = true
                errorMessage = error?.description?.toString() ?: "Error de conexión"
              }
            }
          }

          loadUrl(serverUrl)
          internalWebView = this
          onAttachWebView(this)
        }
      },
      update = { wv ->
      }
    )

    // Botón flotante discreto en esquina inferior para alternar modo offline / servidor central
    IconButton(
      onClick = { isConfigDialogOpen = true },
      modifier = Modifier
        .navigationBarsPadding()
        .padding(start = 6.dp, bottom = 6.dp)
        .size(24.dp)
        .align(Alignment.BottomStart)
        .background(Color(0x44000000), RoundedCornerShape(12.dp))
    ) {
      Text("⚙", fontSize = 11.sp, color = Color(0x88FFFFFF))
    }

    // Pantalla de error si un servidor externo falla
    if (hasLoadError) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(Color(0xFF090D16))
          .padding(24.dp),
        contentAlignment = Alignment.Center
      ) {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            Text(
              text = "🏛️ EKKLESIA MUSIC",
              color = Color(0xFFF59E0B),
              fontSize = 20.sp,
              fontWeight = FontWeight.Black
            )

            Text(
              text = "No se pudo conectar al servidor remoto:",
              color = Color.White,
              fontSize = 14.sp,
              textAlign = TextAlign.Center
            )

            Text(
              text = serverUrl,
              color = Color(0xFF38BDF8),
              fontSize = 13.sp,
              fontFamily = FontFamily.Monospace,
              textAlign = TextAlign.Center,
              modifier = Modifier
                .background(Color(0xFF0F172A), RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
            )

            Button(
              onClick = {
                serverUrl = MainActivity.STANDALONE_URL
                onSaveUrl(MainActivity.STANDALONE_URL)
                hasLoadError = false
                internalWebView?.loadUrl(MainActivity.STANDALONE_URL)
              },
              colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
              shape = RoundedCornerShape(12.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("Usar Modo Autónomo (100% Offline)", color = Color.Black, fontWeight = FontWeight.Bold)
            }

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              OutlinedButton(
                onClick = { isConfigDialogOpen = true },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text("Cambiar IP", fontSize = 12.sp)
              }

              Button(
                onClick = {
                  hasLoadError = false
                  internalWebView?.loadUrl(serverUrl)
                },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text("Reintentar", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
              }
            }
          }
        }
      }
    }

    // Diálogo para Cambiar entre Modo Autónomo y Servidor Central
    if (isConfigDialogOpen) {
      var tempUrl by remember { mutableStateOf(serverUrl) }

      AlertDialog(
        onDismissRequest = { isConfigDialogOpen = false },
        title = {
          Text("Conexión de Red EKKLESIA", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
              "Puedes usar EKKLESIA de forma 100% autónoma en este dispositivo o conectarte a la tablet del Director / Servidor Central:",
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Button(
              onClick = {
                tempUrl = MainActivity.STANDALONE_URL
                serverUrl = MainActivity.STANDALONE_URL
                onSaveUrl(MainActivity.STANDALONE_URL)
                isConfigDialogOpen = false
                hasLoadError = false
                internalWebView?.loadUrl(MainActivity.STANDALONE_URL)
              },
              colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("Modo Autónomo Local (100% Offline)", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            HorizontalDivider()

            OutlinedTextField(
              value = tempUrl,
              onValueChange = { tempUrl = it },
              singleLine = true,
              label = { Text("URL o IP de Director / Servidor") },
              placeholder = { Text("http://192.168.1.50:8080") },
              modifier = Modifier.fillMaxWidth()
            )
          }
        },
        confirmButton = {
          Button(
            onClick = {
              val formatted = if (!tempUrl.startsWith("http://") && !tempUrl.startsWith("https://")) {
                "http://$tempUrl"
              } else {
                tempUrl
              }
              serverUrl = formatted
              onSaveUrl(formatted)
              isConfigDialogOpen = false
              hasLoadError = false
              internalWebView?.loadUrl(formatted)
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
          ) {
            Text("Guardar", color = Color.Black, fontWeight = FontWeight.Bold)
          }
        },
        dismissButton = {
          TextButton(onClick = { isConfigDialogOpen = false }) {
            Text("Cerrar")
          }
        }
      )
    }
  }
}
